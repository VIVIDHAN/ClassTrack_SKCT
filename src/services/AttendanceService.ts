import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/Config';

export interface AttendanceStudentItem {
  id: string; // Roll number e.g. "727824TUIT201"
  db_id?: number;
  name: string;
  status: 'Present' | 'Absent' | 'OD';
  phone?: string;
  real_parent_phone?: string;
}

export interface AbsenteeInfo {
  id: string;
  name: string;
  phone: string;
  real_parent_phone: string;
  called?: boolean;
  smsSent?: boolean;
}

export interface AttendanceSessionRecord {
  sessionId: string;
  date: string; // e.g. "7 Sep 2026"
  isoDate: string; // e.g. "2026-09-07"
  time: string; // e.g. "Period 4 (11:45 AM - 12:45 PM)"
  period: string; // e.g. "Period 4"
  className: string; // e.g. "III IT G"
  subject: string; // e.g. "Applied Cryptography"
  timetable_id: number | string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  odCount: number;
  records: AttendanceStudentItem[];
  absentees: AbsenteeInfo[];
  syncedToBackend?: boolean;
  createdAt: string;
}

const STORAGE_KEYS = {
  SESSIONS: 'markedAttendanceSessions',
  ABSENTEES: 'markedAbsentees',
  PENDING_SYNC: 'pendingAttendanceSync',
};

/**
 * Normalizes any date string to YYYY-MM-DD
 */
export function normalizeIsoDate(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }
  const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * 1. UNCONDITIONALLY SAVE ATTENDANCE LOCALLY
 * Guarantees that attendance is stored immediately in device AsyncStorage.
 */
export async function saveAttendanceLocally(
  session: AttendanceSessionRecord
): Promise<boolean> {
  try {
    // 1. Save / Update in markedAttendanceSessions
    const rawSessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    let sessionsList: AttendanceSessionRecord[] = rawSessions ? JSON.parse(rawSessions) : [];

    // Check if session for this same subject, class, and date already exists
    const existingIndex = sessionsList.findIndex(
      s =>
        s.sessionId === session.sessionId ||
        (s.isoDate === session.isoDate &&
          s.period === session.period &&
          s.subject === session.subject &&
          s.className === session.className)
    );

    if (existingIndex >= 0) {
      sessionsList[existingIndex] = { ...sessionsList[existingIndex], ...session };
    } else {
      sessionsList = [session, ...sessionsList];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessionsList));

    // 2. Save / Update in markedAbsentees for Notify & History screens
    const rawAbsentees = await AsyncStorage.getItem(STORAGE_KEYS.ABSENTEES);
    let absenteesList: any[] = rawAbsentees ? JSON.parse(rawAbsentees) : [];

    const existingAbsIndex = absenteesList.findIndex(
      (s: any) =>
        s.sessionId === session.sessionId ||
        (s.isoDate === session.isoDate &&
          s.period === session.period &&
          s.subject === session.subject &&
          s.className === session.className)
    );

    if (existingAbsIndex >= 0) {
      absenteesList[existingAbsIndex] = session;
    } else {
      absenteesList = [session, ...absenteesList];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ABSENTEES, JSON.stringify(absenteesList));

    // 3. Queue in pendingAttendanceSync for backend sync
    await queueForBackendSync(session);

    return true;
  } catch (err) {
    console.error('Failed to save attendance locally:', err);
    return false;
  }
}

/**
 * Add session to pending sync queue
 */
export async function queueForBackendSync(session: AttendanceSessionRecord): Promise<void> {
  try {
    const rawPending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    const pendingList: AttendanceSessionRecord[] = rawPending ? JSON.parse(rawPending) : [];

    const idx = pendingList.findIndex(p => p.sessionId === session.sessionId);
    if (idx >= 0) {
      pendingList[idx] = session;
    } else {
      pendingList.push(session);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingList));
  } catch (e) {
    console.warn('Error queueing for sync:', e);
  }
}

/**
 * Synchronize all pending attendance records to backend database
 */
export async function syncPendingAttendance(): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    const rawPending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    if (!rawPending) return { synced: 0, failed: 0 };

    const pendingList: AttendanceSessionRecord[] = JSON.parse(rawPending);
    if (!Array.isArray(pendingList) || pendingList.length === 0) {
      return { synced: 0, failed: 0 };
    }

    const remaining: AttendanceSessionRecord[] = [];

    for (const session of pendingList) {
      try {
        const payload = {
          date: session.isoDate || normalizeIsoDate(session.date),
          timetable_id: session.timetable_id || 1,
          section: session.className || 'III IT G',
          records: session.records.map((r, idx) => ({
            student_id: r.db_id || r.id || (idx + 1),
            roll_no: r.id,
            name: r.name,
            status: r.status,
          })),
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${API_BASE_URL}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const resJson = await res.json();
          if (resJson.success) {
            synced++;
            await markSessionSynced(session.sessionId);
            continue;
          }
        }
        remaining.push(session);
        failed++;
      } catch (postErr) {
        remaining.push(session);
        failed++;
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(remaining));
  } catch (err) {
    console.warn('Sync pending attendance error:', err);
  }

  return { synced, failed };
}

/**
 * Mark a session as synced to backend in local storage
 */
async function markSessionSynced(sessionId: string): Promise<void> {
  try {
    const rawSessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (rawSessions) {
      const sessionsList: AttendanceSessionRecord[] = JSON.parse(rawSessions);
      const updated = sessionsList.map(s =>
        s.sessionId === sessionId ? { ...s, syncedToBackend: true } : s
      );
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    }
  } catch (e) {}
}

/**
 * Retrieve all locally stored attendance sessions
 */
export async function getAllStoredSessions(): Promise<AttendanceSessionRecord[]> {
  try {
    const rawSessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (rawSessions) {
      const sessions: AttendanceSessionRecord[] = JSON.parse(rawSessions);
      if (Array.isArray(sessions) && sessions.length > 0) {
        return sessions;
      }
    }

    // Fallback: check markedAbsentees if markedAttendanceSessions is not yet populated
    const rawAbs = await AsyncStorage.getItem(STORAGE_KEYS.ABSENTEES);
    if (rawAbs) {
      const absSessions: any[] = JSON.parse(rawAbs);
      if (Array.isArray(absSessions)) {
        return absSessions.map(s => ({
          sessionId: s.sessionId || `sess-${Date.now()}`,
          date: s.date || 'Today',
          isoDate: s.isoDate || normalizeIsoDate(s.date),
          time: s.time || '',
          period: s.period || 'Period',
          className: s.className || 'III IT G',
          subject: s.subject || 'Class',
          timetable_id: s.timetable_id || 1,
          totalStudents: s.totalStudents || 63,
          presentCount: s.presentCount || (s.records ? s.records.filter((r: any) => r.status === 'Present').length : 60),
          absentCount: s.absentCount || (s.absentees ? s.absentees.length : 0),
          odCount: s.odCount || 0,
          records: s.records || [],
          absentees: s.absentees || [],
          createdAt: s.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch (e) {
    console.warn('Error reading stored sessions:', e);
  }
  return [];
}

/**
 * Clear stored history (for debug / user reset)
 */
export async function clearAttendanceStorage(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
  await AsyncStorage.removeItem(STORAGE_KEYS.ABSENTEES);
  await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
}
