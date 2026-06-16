import React from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MealWidget } from '@/components/MealWidget';
import { TimetableWidget } from '@/components/TimetableWidget';
import { ExternalLink } from '@/components/external-link';
import { ShadowCard } from '@/components/ShadowCard';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from '@/components/SymbolView';

export default function ShortcutsScreen() {
  const theme = useTheme();

  const links = [
    {
      title: '덕영고등학교 공식 홈페이지',
      url: 'https://dukyoung.hs.kr',
      icon: 'globe',
      desc: '학교 주요 연간 계획 및 정규 공지사항 확인',
    },
    {
      title: '나이스(NEIS) 학생서비스',
      url: 'https://neis.go.kr',
      icon: 'graduationcap.fill',
      desc: '성적표, 생활기록부, 출결 확인 서비스',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText style={styles.headerTitle} type="subtitle">
          바로가기
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <TimetableWidget />
        </View>

        <View style={styles.section}>
          <MealWidget />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="smallBold">
            학교 주요 웹 서비스
          </ThemedText>
          
          <View style={styles.linksGrid}>
            {links.map((link, index) => (
              <ExternalLink key={index} href={link.url as any} asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ShadowCard style={styles.linkCard} padding={14}>
                    <View style={styles.linkHeader}>
                      <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                        <SymbolView
                          name={{ ios: link.icon, android: 'link', web: 'link' }}
                          tintColor={theme.primary}
                          size={18}
                        />
                      </View>
                      <ThemedText style={styles.linkTitle} type="smallBold" numberOfLines={1}>
                        {link.title}
                      </ThemedText>
                      <SymbolView
                        name={{ ios: 'arrow.up.right', android: 'open_in_new', web: 'external-link' }}
                        tintColor={theme.textSecondary}
                        size={12}
                      />
                    </View>
                    <ThemedText style={styles.linkDesc} themeColor="textSecondary" numberOfLines={2}>
                      {link.desc}
                    </ThemedText>
                  </ShadowCard>
                </Pressable>
              </ExternalLink>
            ))}
          </View>
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
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    gap: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  linksGrid: {
    gap: 10,
  },
  linkCard: {
    borderColor: 'transparent',
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTitle: {
    fontSize: 14,
    flex: 1,
  },
  linkDesc: {
    fontSize: 12,
    paddingLeft: 42,
  },
  pressed: {
    opacity: 0.7,
  },
});
