import React, { useState } from 'react';
import { View, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { ShadowCard } from './ShadowCard';
import { Notice, useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from './SymbolView';
import { Ionicons } from '@expo/vector-icons';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function NoticeWidget({ notice }: { notice: Notice }) {
  const theme = useTheme();
  const { user, deleteNotice } = useApp();
  const [expanded, setExpanded] = useState(false);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.isAdmin;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('공지사항을 정말 삭제하시겠습니까?')) {
        deleteNotice(notice.id);
      }
    } else {
      Alert.alert('공지 삭제', '정말 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            deleteNotice(notice.id);
          }
        }
      ]);
    }
  };

  const getTagColors = () => {
    switch (notice.tag) {
      case '긴급':
        return { bg: '#FFECEC', text: '#FF3B30' };
      case '행사':
        return { bg: '#EAF9EB', text: '#34C759' };
      case '공지':
      default:
        return { bg: '#E8F5E9', text: '#007AFF' };
    }
  };

  const tagColors = getTagColors();

  return (
    <Pressable onPress={toggleExpand}>
      <ShadowCard style={[styles.card, expanded && { borderColor: theme.primary }]}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
              <ThemedText style={[styles.tagText, { color: tagColors.text }]}>
                {notice.tag}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {notice.date}
            </ThemedText>
          </View>
          
          {isTeacherOrAdmin && (
            <Pressable onPress={handleDelete} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </Pressable>
          )}
        </View>

        <ThemedText style={styles.title} type="smallBold">
          {notice.title}
        </ThemedText>

        {expanded ? (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ThemedText style={styles.bodyContent}>{notice.content}</ThemedText>
            <View style={styles.collapseIndicator}>
              <ThemedText type="small" themeColor="primary">
                접기
              </ThemedText>
              <SymbolView
                name={{ ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'chevron-up' }}
                tintColor={theme.primary}
                size={14}
              />
            </View>
          </View>
        ) : (
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.hintText}>
              터치하여 공지 전문 보기
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'chevron-down' }}
              tintColor={theme.textSecondary}
              size={14}
            />
          </View>
        )}
      </ShadowCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  expandedContent: {
    marginTop: 4,
  },
  bodyContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  collapseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
});
