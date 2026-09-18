import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import { generateFallbackReport } from '../constants/DummyData';

const { width } = Dimensions.get('window');

type PresetType = '7d' | '14d' | 'month' | 'custom';
type ViewMode = 'summary' | 'table';
type PctFilter = 'all' | 'lt75' | 'gt75';

export default function AttendanceReport() {
  const navigation = useNavigation<any>();

  // Date Range state
  const [activePreset, setActivePreset] = useState<PresetType>('month');
  const [selectedSection, setSelectedSection] = useState('III IT G');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [pctFilter, setPctFilter] = useState<PctFilter>('all');

  // Date values
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal for custom dates
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  // Data state
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [detailedLogs, setDetailedLogs] = useState<any[]>([]);

  // Apply Presets
  const applyPreset = (preset: PresetType) => {
    setActivePreset(preset);
    const end = new Date();
    const start = new Date();

    if (preset === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (preset === '14d') {
      start.setDate(end.getDate() - 14);
    } else if (preset === 'month') {
      start.setDate(end.getDate() - 30);
    } else {
      setCustomModalVisible(true);
      return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Fetch report data & raw table logs
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Fetch student summary metrics
    const fetchSummary = fetch(
      `${API_BASE_URL}/reports?startDate=${startDate}&endDate=${endDate}&section=${encodeURIComponent(selectedSection)}`,
      { signal: controller.signal }
    )
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.summary) && Array.isArray(data.logs)) {
          setReportData(data.summary);
          setDetailedLogs(data.logs);
        } else if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            roll_no: item.roll_no,
            name: item.name,
            className: item.section || selectedSection,
            totalClasses: item.totalClasses || 20,
            attendedClasses: item.attendedClasses || 18,
            percentage: item.percentage || 90,
          }));
          setReportData(mapped);
          if (Array.isArray(data.logs)) {
            setDetailedLogs(data.logs);
          }
        } else {
          setReportData(generateFallbackReport(selectedSection, startDate, endDate));
        }
      })
      .catch(() => {
        setReportData(generateFallbackReport(selectedSection, startDate, endDate));
      });

    // Fetch raw table logs containing (sno, date, day_order, period, time, roll_no, subject_name, status)
    const fetchLogs = fetch(
      `${API_BASE_URL}/attendance?startDate=${startDate}&endDate=${endDate}&section=${encodeURIComponent(selectedSection)}`,
      { signal: controller.signal }
    )
      .then(res => res.json())
      .then(logs => {
        if (Array.isArray(logs) && logs.length > 0) {
          setDetailedLogs(logs);
        }
      })
      .catch(() => {});

    Promise.allSettled([fetchSummary, fetchLogs]).finally(() => {
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, selectedSection]);

  // Filtered Students (Summary view)
  const filteredStudents = useMemo(() => {
    return reportData.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (pctFilter === 'lt75') return s.percentage < 75;
      if (pctFilter === 'gt75') return s.percentage >= 75;
      return true;
    });
  }, [reportData, searchQuery, pctFilter]);

  // Filtered Table Logs (Detailed DB table view)
  const filteredLogs = useMemo(() => {
    return detailedLogs.filter(
      l =>
        (l.student_name && l.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.roll_no && l.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.subject_name && l.subject_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [detailedLogs, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    if (reportData.length === 0) {
      return { avg: 0, good: 0, risk: 0, total: 0 };
    }
    const total = reportData.length;
    const sum = reportData.reduce((acc, curr) => acc + curr.percentage, 0);
    const avg = Math.round(sum / total);
    const good = reportData.filter(s => s.percentage >= 75).length;
    const risk = reportData.filter(s => s.percentage < 75).length;
    return { avg, good, risk, total };
  }, [reportData]);

  // Export / Share Report
  const handleExportShare = async () => {
    try {
      let message = `🎓 *SKCT ATTENDANCE REPORT*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `Class: ${selectedSection}\n`;
      message += `Period: ${startDate} to ${endDate}\n`;
      message += `Class Average: ${metrics.avg}%\n`;
      message += `Total Students: ${metrics.total} | Eligible (>=75%): ${metrics.good} | Defaulters (<75%): ${metrics.risk}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (viewMode === 'table' && filteredLogs.length > 0) {
        message += `📋 *DETAILED ATTENDANCE TABLE LOGS (${filteredLogs.length})*\n\n`;
        filteredLogs.slice(0, 50).forEach((l, idx) => {
          message += `${l.sno || idx + 1}. ${l.date} | Day ${l.day_order || 4} | ${l.period} (${l.time}) | [${l.roll_no}] ${l.subject_name}: ${l.status}\n`;
        });
      } else {
        filteredStudents.forEach((s, idx) => {
          const badge = s.percentage >= 75 ? '✓' : '⚠️';
          message += `${idx + 1}. [${s.roll_no}] ${s.name}\n`;
          message += `   Class: ${s.className} | Attended: ${s.attendedClasses}/${s.totalClasses} (${s.percentage}%) ${badge}\n\n`;
        });
      }

      message += `\nGenerated by ClassTrack SKCT`;

      await Share.share({
        message,
        title: `Attendance Report - ${selectedSection}`,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const renderStudentItem = ({ item, index }: { item: any; index: number }) => {
    const isCritical = item.percentage < 75;
    const isGreat = item.percentage >= 85;

    const badgeColor = isGreat ? Colors.success : isCritical ? Colors.error : '#EAB308';
    const badgeBg = isGreat ? '#DCFCE7' : isCritical ? '#FEE2E2' : '#FEF9C3';

    return (
      <View style={styles.studentCard}>
        <View style={styles.cardTopRow}>
          <View style={[styles.avatar, { backgroundColor: isCritical ? '#FEE2E2' : '#E0F2FE' }]}>
            <Text style={[styles.avatarText, { color: isCritical ? Colors.error : Colors.primary }]}>
              {item.name.charAt(0)}
            </Text>
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.rollNo}>{item.roll_no}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.className}>{item.className}</Text>
            </View>
          </View>

          <View style={[styles.percentageBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.percentageText, { color: badgeColor }]}>{item.percentage}%</Text>
            <Text style={[styles.percentageSub, { color: badgeColor }]}>
              {isCritical ? 'Critical' : isGreat ? 'Good' : 'Average'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(item.percentage, 100)}%`,
                backgroundColor: badgeColor,
              },
            ]}
          />
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.sessionsText}>
            Attended: <Text style={styles.sessionsBold}>{item.attendedClasses}</Text> of{' '}
            <Text style={styles.sessionsBold}>{item.totalClasses}</Text> Sessions
          </Text>
          {isCritical && (
            <View style={styles.alertChip}>
              <Icon name="warning" size={14} color={Colors.error} style={{ marginRight: 4 }} />
              <Text style={styles.alertChipText}>SMS Alert Needed</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-back" size={26} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <Text style={styles.headerSubtitle}>Academic Calendar & Timetable Analytics</Text>
        </View>

        <TouchableOpacity onPress={handleExportShare} style={[styles.iconBtn, styles.shareIconBtn]}>
          <Icon name="share" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Date Filter & Preset Controls */}
        <View style={styles.controlCard}>
          <Text style={styles.sectionHeading}>Select Date Range (From / To)</Text>

          {/* Presets */}
          <View style={styles.presetRow}>
            {(['7d', '14d', 'month', 'custom'] as PresetType[]).map(preset => {
              const label =
                preset === '7d'
                  ? '7 Days'
                  : preset === '14d'
                  ? '14 Days'
                  : preset === 'month'
                  ? 'Last 30D'
                  : 'Custom';
              const isSelected = activePreset === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                  onPress={() => applyPreset(preset)}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Range Banner */}
          <TouchableOpacity
            style={styles.dateDisplayBox}
            activeOpacity={0.8}
            onPress={() => setCustomModalVisible(true)}
          >
            <View style={styles.dateBoxItem}>
              <Icon name="calendar-today" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.dateBoxLabel}>From Date</Text>
                <Text style={styles.dateBoxValue}>{startDate}</Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={18} color="#94A3B8" />
            <View style={styles.dateBoxItem}>
              <Icon name="event" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.dateBoxLabel}>To Date</Text>
                <Text style={styles.dateBoxValue}>{endDate}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Section Selector */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionSublabel}>Class / Section:</Text>
            <View style={styles.tabGroup}>
              {['III IT G', 'III IT E'].map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.tabBtn, selectedSection === sec && styles.tabBtnActive]}
                  onPress={() => setSelectedSection(sec)}
                >
                  <Text style={[styles.tabText, selectedSection === sec && styles.tabTextActive]}>
                    {sec}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* View Mode Switcher (Summary Cards vs Database Table) */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'summary' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('summary')}
          >
            <Icon name="bar-chart" size={18} color={viewMode === 'summary' ? '#ffffff' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.viewToggleText, viewMode === 'summary' && styles.viewToggleTextActive]}>Summary Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'table' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('table')}
          >
            <Icon name="table-chart" size={18} color={viewMode === 'table' ? '#ffffff' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.viewToggleText, viewMode === 'table' && styles.viewToggleTextActive]}>Database Table Log</Text>
          </TouchableOpacity>
        </View>

        {/* CLASS ATTENDANCE PIE CHART CARD */}
        <View style={styles.pieCard}>
          <View style={styles.pieCardHeader}>
            <Icon name="pie-chart" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pieCardTitle}>Overall Class Attendance Pie Chart</Text>
              <Text style={styles.pieCardSub}>Date Range: {startDate} to {endDate}</Text>
            </View>
          </View>

          <View style={styles.pieContentRow}>
            {/* Donut / Pie Chart Ring */}
            <View style={styles.pieRingOuter}>
              <View
                style={[
                  styles.pieRingArc,
                  {
                    borderColor: metrics.avg >= 75 ? Colors.success : Colors.error,
                    borderRightColor: (metrics.good / (metrics.total || 1)) >= 0.5 ? Colors.success : '#E2E8F0',
                    borderBottomColor: (metrics.good / (metrics.total || 1)) >= 0.75 ? Colors.success : '#E2E8F0',
                    borderLeftColor: (metrics.good / (metrics.total || 1)) >= 0.25 ? Colors.success : '#E2E8F0',
                  },
                ]}
              />
              <View style={styles.pieRingInner}>
                <Text style={styles.pieCenterPct}>{metrics.avg}%</Text>
                <Text style={styles.pieCenterLabel}>Class Avg</Text>
              </View>
            </View>

            {/* Counts & Legend */}
            <View style={styles.pieLegendWrap}>
              <View style={styles.legendItemRow}>
                <View style={[styles.legendIndicatorDot, { backgroundColor: Colors.success }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendTitleText}>Eligible (&gt;=75%)</Text>
                  <Text style={styles.legendCountText}>
                    {metrics.good} Students ({metrics.total > 0 ? Math.round((metrics.good / metrics.total) * 100) : 0}%)
                  </Text>
                </View>
              </View>

              <View style={[styles.legendItemRow, { marginTop: 10 }]}>
                <View style={[styles.legendIndicatorDot, { backgroundColor: Colors.error }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendTitleText}>Defaulters (&lt;75%)</Text>
                  <Text style={styles.legendCountText}>
                    {metrics.risk} Students ({metrics.total > 0 ? Math.round((metrics.risk / metrics.total) * 100) : 0}%)
                  </Text>
                </View>
              </View>

              <View style={styles.legendDividerLine} />

              <View style={styles.legendItemRow}>
                <Icon name="groups" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.totalClassCountText}>
                  Total Class Count: <Text style={{ fontWeight: '900', color: Colors.primary }}>{metrics.total} Students</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PERCENTAGE FILTER BAR (<75%, >75%, ALL) */}
        <View style={styles.pctFilterWrap}>
          <Text style={styles.pctFilterHeading}>Filter by Attendance Percentage:</Text>
          <View style={styles.pctFilterRow}>
            <TouchableOpacity
              style={[styles.pctFilterChip, pctFilter === 'all' && styles.pctFilterChipActiveAll]}
              onPress={() => setPctFilter('all')}
            >
              <Text style={[styles.pctFilterChipText, pctFilter === 'all' && styles.pctFilterChipTextActive]}>
                All ({metrics.total})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pctFilterChip, pctFilter === 'gt75' && styles.pctFilterChipActiveGood]}
              onPress={() => setPctFilter('gt75')}
            >
              <Icon name="check-circle" size={14} color={pctFilter === 'gt75' ? '#ffffff' : Colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.pctFilterChipText, pctFilter === 'gt75' && styles.pctFilterChipTextActive]}>
                &gt;=75% ({metrics.good})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pctFilterChip, pctFilter === 'lt75' && styles.pctFilterChipActiveRisk]}
              onPress={() => setPctFilter('lt75')}
            >
              <Icon name="warning" size={14} color={pctFilter === 'lt75' ? '#ffffff' : Colors.error} style={{ marginRight: 4 }} />
              <Text style={[styles.pctFilterChipText, pctFilter === 'lt75' && styles.pctFilterChipTextActive]}>
                &lt;75% ({metrics.risk})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Icon name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={viewMode === 'table' ? "Search roll no, subject or student..." : "Search student or roll no..."}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Report List or Database Table */}
        {loading ? (
          <View style={{ marginTop: 40 }}>
            <BreatheLoader message="Generating attendance report..." />
          </View>
        ) : viewMode === 'table' ? (
          /* DETAILED ATTENDANCE DATABASE TABLE VIEW */
          <View style={styles.listSection}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderTitle}>Attendance Database Records ({filteredLogs.length})</Text>
              <TouchableOpacity onPress={handleExportShare}>
                <Text style={styles.exportBtnText}>Share Table</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginBottom: 20 }}>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { width: 55 }]}>S.No</Text>
                  <Text style={[styles.thCell, { width: 105 }]}>Date</Text>
                  <Text style={[styles.thCell, { width: 85 }]}>Day Order</Text>
                  <Text style={[styles.thCell, { width: 80 }]}>Period</Text>
                  <Text style={[styles.thCell, { width: 145 }]}>Time</Text>
                  <Text style={[styles.thCell, { width: 135 }]}>Roll No</Text>
                  <Text style={[styles.thCell, { width: 175 }]}>Subject Name</Text>
                  <Text style={[styles.thCell, { width: 85 }]}>Status</Text>
                </View>

                {filteredLogs.map((log, idx) => (
                  <View key={log.sno || idx} style={[styles.tableDataRow, idx % 2 === 1 && { backgroundColor: '#F8FAFC' }]}>
                    <Text style={[styles.tdCell, { width: 55 }]}>{log.sno || (idx + 1)}</Text>
                    <Text style={[styles.tdCell, { width: 105, fontWeight: '700' }]}>{log.date}</Text>
                    <Text style={[styles.tdCell, { width: 85, color: Colors.primary }]}>Day {log.day_order || 4}</Text>
                    <Text style={[styles.tdCell, { width: 80 }]}>{log.period || 'Period 1'}</Text>
                    <Text style={[styles.tdCell, { width: 145, fontSize: 11 }]}>{log.time || '08:15 AM - 09:15 AM'}</Text>
                    <Text style={[styles.tdCell, { width: 135, fontWeight: '700', color: '#0F172A' }]}>{log.roll_no}</Text>
                    <Text style={[styles.tdCell, { width: 175, fontWeight: '600' }]} numberOfLines={1}>{log.subject_name || 'Subject'}</Text>
                    <View style={[{ width: 85, alignItems: 'flex-start' }]}>
                      <View style={[
                        styles.statusBadge,
                        log.status === 'Absent' ? styles.statusAbsent : log.status === 'OD' ? styles.statusOD : styles.statusPresent
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          log.status === 'Absent' ? styles.statusAbsentText : log.status === 'OD' ? styles.statusODText : styles.statusPresentText
                        ]}>
                          {log.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                {filteredLogs.length === 0 && (
                  <View style={styles.emptyTableWrap}>
                    <Text style={styles.emptyTitle}>No database attendance records found</Text>
                    <Text style={styles.emptySubtitle}>Mark attendance from Dashboard to populate DB table logs</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          /* SUMMARY CARDS VIEW */
          <View style={styles.listSection}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderTitle}>Student Performance ({filteredStudents.length})</Text>
              <TouchableOpacity onPress={handleExportShare}>
                <Text style={styles.exportBtnText}>Share Report</Text>
              </TouchableOpacity>
            </View>

            {filteredStudents.map((item, index) => (
              <React.Fragment key={item.roll_no}>
                {renderStudentItem({ item, index })}
              </React.Fragment>
            ))}

            {filteredStudents.length === 0 && (
              <View style={styles.emptyWrap}>
                <Icon name="search-off" size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No matching students found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search query or percentage filter</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* CUSTOM DATE RANGE MODAL */}
      <Modal visible={customModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Custom Date Range</Text>
            <Text style={styles.modalSubtitle}>Enter dates in YYYY-MM-DD format</Text>

            <View style={styles.modalInputBlock}>
              <Text style={styles.modalInputLabel}>Start Date</Text>
              <TextInput
                style={styles.modalTextInput}
                value={tempStart}
                onChangeText={setTempStart}
                placeholder="2026-08-01"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.modalInputBlock}>
              <Text style={styles.modalInputLabel}>End Date</Text>
              <TextInput
                style={styles.modalTextInput}
                value={tempEnd}
                onChangeText={setTempEnd}
                placeholder="2026-09-02"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => {
                  setStartDate(tempStart);
                  setEndDate(tempEnd);
                  setActivePreset('custom');
                  setCustomModalVisible(false);
                }}
              >
                <Text style={styles.modalApplyText}>Apply Range</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F8FAFC' },
  shareIconBtn: { backgroundColor: 'rgba(255, 93, 56, 0.1)' },

  controlCard: {
    margin: 16,
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 12 },
  presetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  presetBtnActive: { backgroundColor: Colors.primary },
  presetText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  presetTextActive: { color: '#ffffff' },

  dateDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  dateBoxItem: { flexDirection: 'row', alignItems: 'center' },
  dateBoxLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  dateBoxValue: { fontSize: 13, color: '#0F172A', fontWeight: '700' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionSublabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabGroup: { flexDirection: 'row' },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginLeft: 6,
  },
  tabBtnActive: { backgroundColor: '#0F172A' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#ffffff' },

  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 4,
  },
  viewToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewToggleBtnActive: { backgroundColor: Colors.primary },
  viewToggleText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  viewToggleTextActive: { color: '#ffffff' },

  /* CLASS PIE CHART CARD */
  pieCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  pieCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  pieCardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  pieCardSub: { fontSize: 11, color: '#64748B', marginTop: 1 },

  pieContentRow: { flexDirection: 'row', alignItems: 'center' },
  pieRingOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 16,
    position: 'relative',
  },
  pieRingArc: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 10,
  },
  pieRingInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  pieCenterPct: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  pieCenterLabel: { fontSize: 9, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },

  pieLegendWrap: { flex: 1 },
  legendItemRow: { flexDirection: 'row', alignItems: 'center' },
  legendIndicatorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendTitleText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  legendCountText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  legendDividerLine: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  totalClassCountText: { fontSize: 12, color: '#334155', fontWeight: '600' },

  /* PERCENTAGE FILTER BAR */
  pctFilterWrap: { marginHorizontal: 16, marginBottom: 14 },
  pctFilterHeading: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  pctFilterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pctFilterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pctFilterChipActiveAll: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  pctFilterChipActiveGood: { backgroundColor: Colors.success, borderColor: Colors.success },
  pctFilterChipActiveRisk: { backgroundColor: Colors.error, borderColor: Colors.error },
  pctFilterChipText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  pctFilterChipTextActive: { color: '#ffffff' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },

  listSection: { paddingHorizontal: 16 },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  exportBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '900' },
  nameBlock: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  rollNo: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 6 },
  className: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  percentageText: { fontSize: 16, fontWeight: '900' },
  percentageSub: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: { height: 6, borderRadius: 3 },

  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionsText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  sessionsBold: { fontWeight: '700', color: '#0F172A' },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertChipText: { fontSize: 10, fontWeight: '700', color: Colors.error },

  /* TABLE VIEW STYLES */
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  thCell: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'left',
    paddingHorizontal: 6,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdCell: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'left',
    paddingHorizontal: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPresent: { backgroundColor: '#DCFCE7' },
  statusPresentText: { fontSize: 11, fontWeight: '800', color: Colors.success },
  statusAbsent: { backgroundColor: '#FEE2E2' },
  statusAbsentText: { fontSize: 11, fontWeight: '800', color: Colors.error },
  statusOD: { backgroundColor: '#FEF9C3' },
  statusODText: { fontSize: 11, fontWeight: '800', color: '#D97706' },
  emptyTableWrap: { padding: 30, alignItems: 'center' },

  emptyWrap: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#334155', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  modalInputBlock: { marginBottom: 16 },
  modalInputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#0F172A',
  },
  modalBtnRow: { flexDirection: 'row', marginTop: 10 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  modalApplyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalApplyText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});
