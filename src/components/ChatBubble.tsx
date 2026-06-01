import React from 'react';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { Message } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ChatBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (message.isSystem) {
    return (
      <View style={styles.systemContainer}>
        <View style={[styles.systemPill, { backgroundColor: theme.border }]}>
          <ThemedText style={styles.systemText} type="small">
            {message.content}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Teacher special styling
  const isTeacher = message.senderRole === 'teacher';

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      {!isMe && (
        <View style={styles.senderHeader}>
          <ThemedText style={styles.senderName} type="smallBold">
            {message.senderName}
          </ThemedText>
          {isTeacher && (
            <View style={[styles.teacherBadge, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.teacherBadgeText}>교사</ThemedText>
            </View>
          )}
        </View>
      )}

      <View style={[styles.bubbleWrapper, isMe ? styles.rowReverse : styles.row]}>
        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.myBubble, { backgroundColor: theme.primary }]
              : isTeacher
              ? [styles.teacherBubble, { backgroundColor: isDark ? '#312348' : '#F5EEFF', borderColor: isDark ? '#5E3E9B' : '#E1C4FF' }]
              : [styles.otherBubble, { backgroundColor: theme.border }],
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isMe && styles.whiteText,
              isTeacher && !isMe && { color: isDark ? '#FFFFFF' : '#4C1D95' },
            ]}
          >
            {message.content}
          </ThemedText>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.timestamp}>
          {message.timestamp}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 12,
    maxWidth: '85%',
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: {
    fontSize: 13,
  },
  teacherBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  teacherBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bubbleWrapper: {
    alignItems: 'flex-end',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_WIDTH * 0.65,
  },
  myBubble: {
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    borderBottomLeftRadius: 2,
  },
  teacherBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    marginBottom: 2,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  systemText: {
    fontSize: 11,
    color: '#555555',
  },
});
