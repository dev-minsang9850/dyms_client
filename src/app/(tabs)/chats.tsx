import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ShadowCard } from '@/components/ShadowCard';
import { useApp, Chat } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from '@/components/SymbolView';

export default function ChatsScreen() {
  const { chats, friends, user, selectedWorkspace } = useApp();
  const theme = useTheme();
  const router = useRouter();

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleCreateChat = () => {
    router.push('/chat/create');
  };

  const getChatDisplayName = (c: Chat) => {
    if (c.type === 'direct') {
      const friendId = c.members ? c.members.find((mId) => mId !== user?.id) : null;
      const friend = friendId ? friends.find((f) => f.id === friendId) : null;
      return friend ? friend.name : (c.name || '사용자');
    }
    return c.name;
  };

  const renderChatAvatar = (chat: Chat) => {
    if (chat.type === 'direct') {
      const friendId = chat.members ? chat.members.find((mId) => mId !== user?.id) : null;
      const friend = friendId ? friends.find((f) => f.id === friendId) : null;
      const name = friend?.name || chat.name || '사용자';
      const isTeacher = friend?.role === 'teacher';

      return (
        <View style={[styles.avatar, { backgroundColor: isTeacher ? theme.primaryLight : theme.border }]}>
          <ThemedText style={[styles.avatarText, isTeacher && { color: theme.primary }]} type="smallBold">
            {name.slice(-2)}
          </ThemedText>
        </View>
      );
    } else {
      // Group avatar cluster
      const firstTwoMembers = chat.members 
        ? chat.members.slice(0, 2).map((mId) => friends.find((f) => f.id === mId))
        : [];
      const name1 = firstTwoMembers[0]?.name || 'G';
      const name2 = firstTwoMembers[1]?.name || 'P';
      return (
        <View style={styles.groupAvatarContainer}>
          <View style={[styles.groupAvatar, styles.avatarOne, { backgroundColor: theme.primaryLight }]}>
            <ThemedText style={[styles.groupAvatarText, { color: theme.primary }]} type="code">
              {name1.slice(-1)}
            </ThemedText>
          </View>
          <View style={[styles.groupAvatar, styles.avatarTwo, { backgroundColor: theme.border }]}>
            <ThemedText style={styles.groupAvatarText} type="code">
              {name2.slice(-1)}
            </ThemedText>
          </View>
        </View>
      );
    }
  };

  const filteredChats = chats.filter((c) =>
    !selectedWorkspace || (c.workspace && c.workspace.toLowerCase() === selectedWorkspace.name.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText style={styles.headerTitle} type="subtitle">
          채팅
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SymbolView
              name={{ ios: 'bubble.left.and.bubble.right', android: 'chat_bubble_outline', web: 'message-square' }}
              tintColor={theme.textSecondary}
              size={48}
            />
            <ThemedText style={styles.emptyText} themeColor="textSecondary">
              활성화된 대화방이 없습니다.{"\n"}우측 하단의 버튼을 눌러 대화를 시작해 보세요!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredChats.map((chat) => (
              <Pressable
                key={chat.id}
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => handleOpenChat(chat.id)}
              >
                <ShadowCard style={styles.card} padding={16}>
                  <View style={styles.chatRow}>
                    {renderChatAvatar(chat)}

                    <View style={styles.chatDetails}>
                      <View style={styles.chatHeaderRow}>
                        <ThemedText style={styles.chatName} type="smallBold" numberOfLines={1}>
                          {getChatDisplayName(chat)}
                        </ThemedText>
                        <ThemedText style={styles.timeText} themeColor="textSecondary">
                          {chat.lastMessageTime}
                        </ThemedText>
                      </View>

                      <View style={styles.messageRow}>
                        <ThemedText
                          style={styles.lastMessage}
                          themeColor="textSecondary"
                          numberOfLines={1}
                        >
                          {chat.lastMessage}
                        </ThemedText>

                        {chat.unreadCount > 0 && (
                          <View style={[styles.unreadBadge, { backgroundColor: '#FF3B30' }]}>
                            <ThemedText style={styles.unreadText}>
                              {chat.unreadCount}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </ShadowCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}
        onPress={handleCreateChat}
      >
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'plus' }}
          tintColor="#FFFFFF"
          size={24}
        />
      </Pressable>
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
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderColor: 'transparent',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  groupAvatarContainer: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  groupAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarOne: {
    top: 2,
    left: 2,
    zIndex: 2,
  },
  avatarTwo: {
    bottom: 2,
    right: 2,
    zIndex: 1,
  },
  groupAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chatDetails: {
    flex: 1,
    gap: 4,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatName: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  lastMessage: {
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 18,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 108 : 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  pressed: {
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
