// src/components/ChatBubble.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ThemedText } from './themed-text';
import { Message, useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { SymbolView } from './SymbolView';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ChatBubble({ message, isMe, memberCount }: { message: Message; isMe: boolean; memberCount: number }) {
  const theme = useTheme();
  const { themeMode } = useApp();
  const isDark = themeMode === 'dark';

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

  const readCount = message.readBy ? message.readBy.length : 1;
  const unreadCount = Math.max(0, memberCount - readCount);

  // Helper to resolve full file URLs
  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL || 'http://localhost:3000'}${url}`;
  };

  const handleDownload = () => {
    if (message.fileUrl) {
      WebBrowser.openBrowserAsync(getFullUrl(message.fileUrl));
    }
  };

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
            message.fileUrl && message.fileType === 'image' && { padding: 4, overflow: 'hidden' }
          ]}
        >
          {message.fileUrl ? (
            message.fileType === 'image' ? (
              <Pressable onPress={handleDownload} style={styles.imageContainer}>
                <Image
                  source={{ uri: getFullUrl(message.fileUrl) }}
                  style={styles.imageThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.downloadOverlay}>
                  <SymbolView
                    name={{ ios: 'arrow.down.circle.fill', android: 'download', web: 'download' }}
                    tintColor="#FFFFFF"
                    size={20}
                  />
                </View>
              </Pressable>
            ) : message.fileType === 'video' ? (
              <Pressable onPress={handleDownload} style={styles.videoContainer}>
                <View style={[styles.videoPlaceholder, { backgroundColor: '#333333' }]}>
                  <SymbolView
                    name={{ ios: 'play.circle.fill', android: 'play_circle', web: 'play' }}
                    tintColor="#FFFFFF"
                    size={40}
                  />
                  <ThemedText style={styles.videoText} type="small">동영상 다운로드 / 재생</ThemedText>
                </View>
              </Pressable>
            ) : (
              <Pressable onPress={handleDownload} style={styles.fileContainer}>
                <SymbolView
                  name={{ ios: 'doc.richtext.fill', android: 'description', web: 'file' }}
                  tintColor={isMe ? '#FFFFFF' : theme.primary}
                  size={26}
                />
                <View style={styles.fileTextContainer}>
                  <ThemedText
                    style={[styles.fileNameText, isMe && styles.whiteText]}
                    type="smallBold"
                    numberOfLines={2}
                  >
                    {message.fileName || '첨부파일'}
                  </ThemedText>
                  <ThemedText
                    style={[styles.fileDownloadLabel, { color: isMe ? '#E1C4FF' : theme.primary }]}
                    type="small"
                  >
                    다운로드 받기
                  </ThemedText>
                </View>
              </Pressable>
            )
          ) : (
            <ThemedText
              style={[
                styles.messageText,
                isMe && styles.whiteText,
                isTeacher && !isMe && { color: isDark ? '#FFFFFF' : '#4C1D95' },
              ]}
            >
              {message.content}
            </ThemedText>
          )}
        </View>

        <View style={[styles.metaInfo, isMe ? styles.alignMetaRight : styles.alignMetaLeft]}>
          {unreadCount > 0 && (
            <ThemedText style={[styles.unreadCountText, { color: isMe ? '#E1C4FF' : theme.primary }]}>
              {unreadCount}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary" style={styles.timestamp}>
            {message.timestamp}
          </ThemedText>
        </View>
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
  metaInfo: {
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  alignMetaRight: {
    alignItems: 'flex-end',
  },
  alignMetaLeft: {
    alignItems: 'flex-start',
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 1,
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
  imageContainer: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  downloadOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: SCREEN_WIDTH * 0.5,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  fileTextContainer: {
    flex: 1,
    gap: 2,
  },
  fileNameText: {
    fontSize: 13,
    lineHeight: 16,
  },
  fileDownloadLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
