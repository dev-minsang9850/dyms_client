// src/components/ChatInput.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Platform, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { BlurView } from 'expo-blur';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from './SymbolView';

export function ChatInput({
  onSend,
  typingUserName,
  chatType,
  onSendFile,
  onOpenVote,
  onOpenEvent,
}: {
  onSend: (text: string) => void;
  typingUserName: string | null;
  chatType: 'direct' | 'group';
  onSendFile: (uri: string, name: string, mimeType: string, type: 'image' | 'video' | 'file') => void;
  onOpenVote: () => void;
  onOpenEvent: () => void;
}) {
  const [text, setText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const theme = useTheme();

  const handleSend = () => {
    if (text.trim() === '') return;
    onSend(text);
    setText('');
    setShowActions(false);
  };

  const toggleActions = () => {
    Keyboard.dismiss();
    setShowActions(!showActions);
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = asset.fileName || `photo-${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        onSendFile(uri, name, mimeType, 'image');
        setShowActions(false);
      }
    } catch (e) {
      console.warn('Image picker error', e);
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = asset.fileName || `video-${Date.now()}.mp4`;
        const mimeType = asset.mimeType || 'video/mp4';
        onSendFile(uri, name, mimeType, 'video');
        setShowActions(false);
      }
    } catch (e) {
      console.warn('Video picker error', e);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = asset.name || `file-${Date.now()}`;
        const mimeType = asset.mimeType || 'application/octet-stream';
        onSendFile(uri, name, mimeType, 'file');
        setShowActions(false);
      }
    } catch (e) {
      console.warn('Document picker error', e);
    }
  };

  return (
    <BlurView
      intensity={80}
      tint={theme.mode === 'dark' ? 'dark' : 'light'}
      style={[
        styles.container, 
        { 
          backgroundColor: theme.mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.5)', 
          borderTopColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)' 
        }
      ]}
    >
      {/* Typing indicator */}
      {typingUserName && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            <View style={[styles.dot, { backgroundColor: theme.primary, opacity: 0.6 }]} />
            <View style={[styles.dot, { backgroundColor: theme.primary, opacity: 0.3 }]} />
          </View>
          <ThemedText style={styles.typingText} type="small">
            {typingUserName} 선생님이 입력하고 있습니다...
          </ThemedText>
        </View>
      )}

      <View style={styles.inputRow}>
        <Pressable 
          style={[styles.iconButton, showActions && { backgroundColor: theme.primaryLight }]} 
          onPress={toggleActions}
        >
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'plus' }}
            tintColor={showActions ? theme.primary : theme.text}
            size={22}
          />
        </Pressable>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={setText}
          onFocus={() => setShowActions(false)}
          multiline
        />

        <Pressable
          onPress={handleSend}
          disabled={text.trim() === ''}
          style={({ pressed }) => [
            styles.sendButton,
            text.trim() === '' ? styles.sendDisabled : { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{ ios: 'paperplane.fill', android: 'send', web: 'paper-plane' }}
            tintColor="#FFFFFF"
            size={16}
          />
        </Pressable>
      </View>

      {/* Collapsible Action Panel */}
      {showActions && (
        <View style={[styles.actionsContainer, { borderTopColor: theme.border }]}>
          <Pressable style={styles.actionItem} onPress={handlePickPhoto}>
            <View style={[styles.actionIconWrapper, { backgroundColor: theme.primaryLight }]}>
              <SymbolView
                name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
                tintColor={theme.primary}
                size={22}
              />
            </View>
            <ThemedText style={styles.actionLabel} type="small">사진</ThemedText>
          </Pressable>

          <Pressable style={styles.actionItem} onPress={handlePickVideo}>
            <View style={[styles.actionIconWrapper, { backgroundColor: theme.primaryLight }]}>
              <SymbolView
                name={{ ios: 'video.fill', android: 'videocam', web: 'video' }}
                tintColor={theme.primary}
                size={22}
              />
            </View>
            <ThemedText style={styles.actionLabel} type="small">동영상</ThemedText>
          </Pressable>

          <Pressable style={styles.actionItem} onPress={handlePickFile}>
            <View style={[styles.actionIconWrapper, { backgroundColor: theme.primaryLight }]}>
              <SymbolView
                name={{ ios: 'doc.fill', android: 'description', web: 'file' }}
                tintColor={theme.primary}
                size={22}
              />
            </View>
            <ThemedText style={styles.actionLabel} type="small">파일</ThemedText>
          </Pressable>

          {chatType === 'group' && (
            <Pressable 
              style={styles.actionItem} 
              onPress={() => {
                setShowActions(false);
                onOpenVote();
              }}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: theme.primaryLight }]}>
                <SymbolView
                  name={{ ios: 'checkmark.circle.fill', android: 'poll', web: 'check' }}
                  tintColor={theme.primary}
                  size={22}
                />
              </View>
              <ThemedText style={styles.actionLabel} type="small">투표</ThemedText>
            </Pressable>
          )}

          {chatType === 'group' && (
            <Pressable 
              style={styles.actionItem} 
              onPress={() => {
                setShowActions(false);
                onOpenEvent();
              }}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: theme.primaryLight }]}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar' }}
                  tintColor={theme.primary}
                  size={22}
                />
              </View>
              <ThemedText style={styles.actionLabel} type="small">일정</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  typingText: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    backgroundColor: '#CCCCCC',
  },
  pressed: {
    opacity: 0.8,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'flex-start',
  },
  actionItem: {
    width: 60,
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
