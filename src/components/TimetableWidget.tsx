import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';
import { ShadowCard } from './ShadowCard';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';

export function TimetableWidget() {
  const { timetable: globalTimetable, user } = useApp();
  const theme = useTheme();
  
  const [timetable, setTimetable] = useState<{ [key: string]: string[] } | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(user?.grade || 2);
  const [selectedClass, setSelectedClass] = useState<number>(user?.class || 3);
  const [loading, setLoading] = useState(false);

  const [currentPeriod, setCurrentPeriod] = useState<number>(-2); // -2: school closed, -1: lunch, 0-6: periods
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(-1); // 0: Mon, 1: Tue, ... 4: Fri

  const days = ['월', '화', '수', '목', '금'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    if (globalTimetable) {
      setTimetable(globalTimetable);
    }
  }, [globalTimetable]);

  const loadTimetable = async (grade: number, classVal: number) => {
    setLoading(true);
    try {
      const res = await api.get('/school/timetable', {
        params: {
          grade,
          class: classVal
        }
      });
      setTimetable(res.data);
    } catch (e) {
      console.warn('Failed to load timetable', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    loadTimetable(grade, selectedClass);
  };

  const handleClassChange = (classVal: number) => {
    setSelectedClass(classVal);
    loadTimetable(selectedGrade, classVal);
  };

  useEffect(() => {
    const checkPeriodAndDay = () => {
      const now = new Date();
      const day = now.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
      
      if (day >= 1 && day <= 5) {
        setCurrentDayIndex(day - 1);
      } else {
        setCurrentDayIndex(-1);
      }

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      // Class times in minutes from midnight
      const p1Start = 9 * 60; // 09:00
      const p1End = 9 * 60 + 50; // 09:50
      const p2Start = 10 * 60;
      const p2End = 10 * 60 + 50;
      const p3Start = 11 * 60;
      const p3End = 11 * 60 + 50;
      const p4Start = 12 * 60;
      const p4End = 12 * 60 + 50;
      
      const lunchStart = 12 * 60 + 50; // 12:50
      const lunchEnd = 13 * 60 + 50; // 13:50

      const p5Start = 13 * 60 + 50; // 13:50
      const p5End = 14 * 60 + 40; // 14:40
      const p6Start = 14 * 60 + 50; // 14:50
      const p6End = 15 * 60 + 40; // 15:40
      const p7Start = 15 * 60 + 50; // 15:50
      const p7End = 16 * 60 + 40; // 16:40

      if (timeInMinutes >= p1Start && timeInMinutes <= p1End) {
        setCurrentPeriod(0);
      } else if (timeInMinutes >= p2Start && timeInMinutes <= p2End) {
        setCurrentPeriod(1);
      } else if (timeInMinutes >= p3Start && timeInMinutes <= p3End) {
        setCurrentPeriod(2);
      } else if (timeInMinutes >= p4Start && timeInMinutes <= p4End) {
        setCurrentPeriod(3);
      } else if (timeInMinutes >= lunchStart && timeInMinutes < lunchEnd) {
        setCurrentPeriod(-1); // Lunch
      } else if (timeInMinutes >= p5Start && timeInMinutes <= p5End) {
        setCurrentPeriod(4);
      } else if (timeInMinutes >= p6Start && timeInMinutes <= p6End) {
        setCurrentPeriod(5);
      } else if (timeInMinutes >= p7Start && timeInMinutes <= p7End) {
        setCurrentPeriod(6);
      } else {
        setCurrentPeriod(-2);
      }
    };

    checkPeriodAndDay();
    const interval = setInterval(checkPeriodAndDay, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderCell = (subject: string, dayIdx: number, periodIdx: number) => {
    const isCurrent = dayIdx === currentDayIndex && periodIdx === currentPeriod;
    return (
      <View
        key={dayIdx}
        style={[
          styles.cell,
          { borderColor: theme.border, backgroundColor: theme.background },
          isCurrent && [
            styles.activeCell,
            { borderColor: theme.primary, backgroundColor: theme.primaryLight },
          ],
        ]}
      >
        <ThemedText
          style={[
            styles.cellText,
            isCurrent && { color: theme.primary, fontWeight: '700' },
          ]}
          numberOfLines={1}
          type="small"
        >
          {subject || '-'}
        </ThemedText>
      </View>
    );
  };

  return (
    <ShadowCard style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          주간 학급 시간표 (5x7)
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {selectedGrade}학년 {selectedClass}반 기준
        </ThemedText>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* 학년 선택 */}
      <View style={styles.selectorRow}>
        <ThemedText style={styles.selectorLabel} type="smallBold" themeColor="textSecondary">학년</ThemedText>
        <View style={styles.gradeTabs}>
          {[1, 2, 3].map((g) => {
            const isActive = selectedGrade === g;
            return (
              <Pressable
                key={g}
                style={[
                  styles.gradeTab,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => handleGradeChange(g)}
              >
                <ThemedText
                  style={[
                    styles.gradeTabText,
                    isActive && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                  type="small"
                >
                  {g}학년
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 반 선택 */}
      <View style={styles.selectorRow}>
        <ThemedText style={styles.selectorLabel} type="smallBold" themeColor="textSecondary">반</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classScroll}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => {
            const isActive = selectedClass === c;
            return (
              <Pressable
                key={c}
                style={[
                  styles.classTab,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => handleClassChange(c)}
              >
                <ThemedText
                  style={[
                    styles.classTabText,
                    isActive && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                  type="small"
                >
                  {c}반
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border, marginTop: 6 }]} />

      {currentPeriod === -1 && currentDayIndex !== -1 && (
        <View style={[styles.activeBanner, { backgroundColor: '#FF9500' }]}>
          <ThemedText style={styles.activeBannerText}>지금은 맛있는 점심 시간입니다! 😋</ThemedText>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} size="large" />
          <ThemedText themeColor="textSecondary" style={styles.loadingText}>
            시간표를 불러오는 중...
          </ThemedText>
        </View>
      ) : !timetable ? (
        <View style={styles.loadingContainer}>
          <ThemedText themeColor="textSecondary" style={styles.loadingText}>
            시간표가 존재하지 않습니다.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {/* Header Row */}
          <View style={styles.gridHeader}>
            <View style={[styles.headerCell, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <ThemedText type="smallBold" style={styles.headerText}>교시</ThemedText>
            </View>
            {days.map((d, idx) => (
              <View
                key={d}
                style={[
                  styles.headerCell,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  idx === currentDayIndex && { backgroundColor: theme.primaryLight },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={[
                    styles.headerText,
                    idx === currentDayIndex && { color: theme.primary },
                  ]}
                >
                  {d}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Period Rows */}
          {periods.map((pNum, pIdx) => (
            <View key={pNum} style={styles.gridRow}>
              <View
                style={[
                  styles.periodCell,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  pIdx === currentPeriod && currentDayIndex !== -1 && { backgroundColor: theme.primaryLight },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={[
                    styles.periodNumberText,
                    pIdx === currentPeriod && currentDayIndex !== -1 && { color: theme.primary },
                  ]}
                >
                  {pNum}
                </ThemedText>
              </View>
              {days.map((day, dIdx) => {
                const daySubjects = timetable[day] || [];
                const subject = daySubjects[pIdx] || '-';
                return renderCell(subject, dIdx, pIdx);
              })}
            </View>
          ))}
        </View>
      )}
    </ShadowCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  activeBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  activeBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  gridContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  gridHeader: {
    flexDirection: 'row',
  },
  gridRow: {
    flexDirection: 'row',
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 0.5,
  },
  headerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  periodCell: {
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 0.5,
  },
  periodNumberText: {
    fontSize: 12,
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderWidth: 0.5,
  },
  activeCell: {
    borderWidth: 1.2,
  },
  cellText: {
    fontSize: 11,
    textAlign: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectorLabel: {
    width: 40,
    fontSize: 13,
  },
  gradeTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  gradeTabText: {
    fontSize: 12,
  },
  classScroll: {
    gap: 6,
    paddingRight: 16,
  },
  classTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  classTabText: {
    fontSize: 12,
  },
});
