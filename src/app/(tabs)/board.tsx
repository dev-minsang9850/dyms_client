import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NoticeWidget } from '@/components/NoticeWidget';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';

export default function BoardScreen() {
  const { notices } = useApp();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText style={styles.headerTitle} type="subtitle">
          보드
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introContainer}>
          <ThemedText style={styles.introTitle} type="smallBold">
            덕영고 교내 공지사항 피드
          </ThemedText>
          <ThemedText style={styles.introText} themeColor="textSecondary">
            가정통신문, 지필평가 일정, 교내 행사 등 중요한 학교의 새 소식을 전해드립니다.
          </ThemedText>
        </View>

        <View style={styles.list}>
          {notices.map((notice) => (
            <NoticeWidget key={notice.id} notice={notice} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  introContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  introTitle: {
    fontSize: 16,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 16,
    gap: 4,
  },
});
