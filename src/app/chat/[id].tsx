import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, messages, sendMessage, typingStatus } = useApp();
  const theme = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const chat = chats.find((c) => c.id === id);
  const chatMessages = messages[id || ''] || [];
  const activeTypingUser = typingStatus[id || ''] || null;

  // Auto scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeTypingUser]);

  if (!chat) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>채팅방을 찾을 수 없습니다.</ThemedText>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.primary }]}>
          <ThemedText style={{ color: '#FFFFFF' }}>뒤로 가기</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const handleSend = (text: string) => {
    if (!id) return;
    sendMessage(id, text);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'chevron-left' }}
            tintColor={theme.text}
            size={24}
          />
        </Pressable>

        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle} type="smallBold" numberOfLines={1}>
            {chat.name}
          </ThemedText>
          {chat.type === 'group' && (
            <ThemedText style={styles.memberCount} themeColor="textSecondary">
              멤버 {chat.members.length + 1}명
            </ThemedText>
          )}
        </View>

        <Pressable style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'sidebar.right', android: 'menu', web: 'menu' }}
            tintColor={theme.text}
            size={22}
          />
        </Pressable>
      </View>

      {/* Message List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={scrollToBottom}
      >
        {chatMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isMe={msg.senderId === 'user'} />
        ))}
      </ScrollView>

      {/* Input Bar */}
      <ChatInput onSend={handleSend} typingUserName={activeTypingUser} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 16,
  },
  memberCount: {
    fontSize: 11,
  },
  iconButton: {
    padding: 6,
  },
  messageScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
