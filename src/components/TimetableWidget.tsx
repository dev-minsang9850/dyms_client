import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ShadowCard } from './ShadowCard';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';

export function TimetableWidget() {
  const { timetable } = useApp();
  const theme = useTheme();
  const [currentPeriod, setCurrentPeriod] = useState<number>(-2); // -2: school closed, -1: lunch, 0-6: periods

  useEffect(() => {
    const checkPeriod = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      // Class times defined in minutes from midnight
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
        setCurrentPeriod(-2); // Outside school hours
      }
    };

    checkPeriod();
    const interval = setInterval(checkPeriod, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <ShadowCard style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          오늘의 학급 시간표
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          2학년 3반 기준
        </ThemedText>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {currentPeriod === -1 && (
        <View style={[styles.activeBanner, { backgroundColor: '#FF9500' }]}>
          <ThemedText style={styles.activeBannerText}>지금은 맛있는 점심 시간입니다! 😋</ThemedText>
        </View>
      )}

      <View style={styles.listContainer}>
        {timetable.map((period, index) => {
          const isActive = index === currentPeriod;
          return (
            <View
              key={index}
              style={[
                styles.periodRow,
                { backgroundColor: theme.background },
                isActive && [styles.activeRow, { borderColor: theme.primary }],
              ]}
            >
              <ThemedText
                style={[
                  styles.periodText,
                  isActive && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                {period}
              </ThemedText>

              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                  <View style={styles.pulseDot} />
                  <ThemedText style={styles.activeBadgeText}>진행중</ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </View>
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
  listContainer: {
    gap: 8,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeRow: {
    borderWidth: 1.5,
    backgroundColor: '#E5F1FF',
  },
  periodText: {
    fontSize: 15,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
