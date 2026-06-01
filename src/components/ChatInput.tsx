import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';

export function ChatInput({
  onSend,
  typingUserName,
}: {
  onSend: (text: string) => void;
  typingUserName: string | null;
}) {
  const [text, setText] = useState('');
  const theme = useTheme();

  const handleSend = () => {
    if (text.trim() === '') return;
    onSend(text);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.border }]}
    >
      {/* Typing indicator */}
      {typingUserName && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.background }]}>
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
        <Pressable style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'plus' }}
            tintColor={theme.textSecondary}
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
    </KeyboardAvoidingView>
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
});
