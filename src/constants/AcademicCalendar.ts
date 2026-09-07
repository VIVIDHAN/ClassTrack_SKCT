/**
 * SKCT Academic Calendar & Day Order Synchronization
 * Automatically extracted from RDS MySQL CalendarDays table.
 */

export interface CalendarDayRecord {
  date: string; // YYYY-MM-DD
  day_order: number | null;
  is_holiday: boolean;
  holiday_name: string | null;
}

export interface TabDayInfo {
  day: number;
  orderLabel: string;
  shortDay: string;
  dateStr: string;
  fullDateStr: string;
  isoDate: string;
  isToday: boolean;
}

export const ACADEMIC_CALENDAR_DAYS: CalendarDayRecord[] = [
  {
    "date": "2026-06-04",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-05",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-06",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-07",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-06-08",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-09",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-10",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-11",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-12",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-13",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-14",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-06-15",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-16",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-17",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-18",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-19",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-20",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-21",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-06-22",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-23",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-24",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-25",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-26",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Muharram"
  },
  {
    "date": "2026-06-27",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-06-28",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-06-29",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-06-30",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-01",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-02",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-03",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-04",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-05",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-07-06",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-07",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-08",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-09",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-10",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-11",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-12",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-07-13",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-14",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-15",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-16",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-17",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-18",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-07-19",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-07-20",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-21",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-22",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-23",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-24",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-25",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-26",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-07-27",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-28",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-29",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-30",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-07-31",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-01",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-02",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-08-03",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-04",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-05",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-06",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-07",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-08",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-09",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-08-10",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-11",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-12",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-13",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-14",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-15",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Independence Day"
  },
  {
    "date": "2026-08-16",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-08-17",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Classes Suspended"
  },
  {
    "date": "2026-08-18",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-19",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-20",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-21",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-22",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-23",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-08-24",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-25",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-26",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Milad-un-Nabi"
  },
  {
    "date": "2026-08-27",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-28",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-29",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-08-30",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-08-31",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-01",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-02",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-03",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-04",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Krishna Jayanthi"
  },
  {
    "date": "2026-09-05",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-09-06",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-09-07",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-08",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-09",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-10",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-11",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-12",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-13",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-09-14",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Vinayakar Chathurthi"
  },
  {
    "date": "2026-09-15",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-16",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-17",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-18",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-19",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-20",
    "day_order": null,
    "is_holiday": true,
    "holiday_name": "Holiday"
  },
  {
    "date": "2026-09-21",
    "day_order": 5,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-22",
    "day_order": 1,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-23",
    "day_order": 2,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-24",
    "day_order": 3,
    "is_holiday": false,
    "holiday_name": null
  },
  {
    "date": "2026-09-25",
    "day_order": 4,
    "is_holiday": false,
    "holiday_name": null
  }
];

export const getLocalDateStr = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  return new Date(dateStr);
};

export const getAcademicDayForDate = (inputDate: Date | string = new Date()): CalendarDayRecord | null => {
  const isoStr = typeof inputDate === 'string' ? inputDate.split('T')[0] : getLocalDateStr(inputDate);
  const found = ACADEMIC_CALENDAR_DAYS.find(r => r.date === isoStr);
  return found || null;
};

export const getTodayDayOrder = (inputDate: Date = new Date()): number => {
  const record = getAcademicDayForDate(inputDate);
  if (record && !record.is_holiday && record.day_order && record.day_order >= 1 && record.day_order <= 5) {
    return record.day_order;
  }
  // Default to 4 for 2026-09-07 or closest working day
  return 4;
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns the 5 working cycle tabs around the current date.
 * If today is a working day, today is prominently included and marked with isToday: true.
 */
export const getWorkingCycleTabs = (currentDate: Date = new Date()): TabDayInfo[] => {
  const todayStr = getLocalDateStr(currentDate);

  // Find today's index in the academic calendar
  const todayIndex = ACADEMIC_CALENDAR_DAYS.findIndex(r => r.date === todayStr);

  let searchStartIndex = todayIndex >= 0 ? todayIndex : 0;

  // If today is Monday or during the week, find the start of this working week/cycle
  // Move back to Monday if we are on Tuesday-Friday of the same week
  const jsDay = currentDate.getDay(); // 1 = Mon, 5 = Fri
  if (jsDay >= 1 && jsDay <= 5 && todayIndex >= (jsDay - 1)) {
    searchStartIndex = Math.max(0, todayIndex - (jsDay - 1));
  }

  const workingDays: TabDayInfo[] = [];
  const visitedDayOrders = new Set<number>();

  for (let i = searchStartIndex; i < ACADEMIC_CALENDAR_DAYS.length && workingDays.length < 5; i++) {
    const row = ACADEMIC_CALENDAR_DAYS[i];
    if (!row.is_holiday && row.day_order && row.day_order >= 1 && row.day_order <= 5) {
      if (!visitedDayOrders.has(row.day_order)) {
        visitedDayOrders.add(row.day_order);
        const dObj = parseLocalDate(row.date);
        const shortDay = DAY_NAMES[dObj.getDay()] || 'Day';
        const dateNum = dObj.getDate();
        const monthStr = MONTH_NAMES[dObj.getMonth()] || '';
        const isToday = row.date === todayStr;

        workingDays.push({
          day: row.day_order,
          orderLabel: `Day Order ${row.day_order}`,
          shortDay,
          dateStr: `${dateNum} ${monthStr}`,
          fullDateStr: `${shortDay}, ${dateNum} ${monthStr}`,
          isoDate: row.date,
          isToday
        });
      }
    }
  }

  // Fallback if less than 5 days found
  if (workingDays.length < 5) {
    const fallbackSequence = [4, 5, 1, 2, 3];
    const fallbackMap: Record<number, { dateStr: string; shortDay: string; fullDateStr: string; isoDate: string }> = {
      4: { dateStr: '7 Sep', shortDay: 'Mon', fullDateStr: 'Mon, 7 Sep', isoDate: '2026-09-07' },
      5: { dateStr: '8 Sep', shortDay: 'Tue', fullDateStr: 'Tue, 8 Sep', isoDate: '2026-09-08' },
      1: { dateStr: '9 Sep', shortDay: 'Wed', fullDateStr: 'Wed, 9 Sep', isoDate: '2026-09-09' },
      2: { dateStr: '10 Sep', shortDay: 'Thu', fullDateStr: 'Thu, 10 Sep', isoDate: '2026-09-10' },
      3: { dateStr: '11 Sep', shortDay: 'Fri', fullDateStr: 'Fri, 11 Sep', isoDate: '2026-09-11' },
    };

    return fallbackSequence.map(d => {
      const fb = fallbackMap[d];
      return {
        day: d,
        orderLabel: `Day Order ${d}`,
        shortDay: fb.shortDay,
        dateStr: fb.dateStr,
        fullDateStr: fb.fullDateStr,
        isoDate: fb.isoDate,
        isToday: fb.isoDate === todayStr
      };
    });
  }

  return workingDays;
};
