import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DymsLogo } from '@/components/DymsLogo';
import { ShadowCard } from '@/components/ShadowCard';
import { useApp, Friend } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import { Collapsible } from '@/components/ui/collapsible';

export default function FriendsScreen() {
  const { friends, user, selectedWorkspace, createChatRoom } = useApp();
  const theme = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeProfileFriend, setActiveProfileFriend] = useState<Friend | null>(null);

  // Filter friends
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.detail.toLowerCase().includes(search.toLowerCase())
  );

  const teachers = filteredFriends.filter((f) => f.role === 'teacher');
  const classmates = filteredFriends.filter((f) => f.role === 'student' && f.detail.includes('2학년 3반'));
  const others = filteredFriends.filter(
    (f) => f.role === 'student' && !f.detail.includes('2학년 3반')
  );

  const handleStartChat = (friendId: string, friendName: string) => {
    // Check if DM chat already exists, otherwise create it
    const newChatId = createChatRoom([friendId], `${friendName} 선생님`);
    setActiveProfileFriend(null);
    router.push(`/chat/${newChatId}`);
  };

  const renderFriendItem = (friend: Friend) => {
    const isOnline = friend.status === 'online';
    const isInClass = friend.status === 'in-class';

    return (
      <Pressable
        key={friend.id}
        style={({ pressed }) => [styles.friendItem, pressed && styles.pressed]}
        onPress={() => setActiveProfileFriend(friend)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.border }]}>
            <ThemedText style={styles.avatarText} type="smallBold">
              {friend.name.slice(-2)}
            </ThemedText>
          </View>
          {isOnline && <View style={[styles.statusDot, { backgroundColor: '#34C759' }]} />}
          {isInClass && <View style={[styles.statusDot, { backgroundColor: '#FF9500' }]} />}
        </View>

        <View style={styles.friendInfo}>
          <View style={styles.friendNameRow}>
            <ThemedText type="smallBold">{friend.name}</ThemedText>
            <ThemedText style={styles.friendDetail} themeColor="textSecondary">
              {friend.detail}
            </ThemedText>
          </View>
          {friend.statusMessage && (
            <ThemedText style={styles.statusText} themeColor="textSecondary" numberOfLines={1}>
              {friend.statusMessage}
            </ThemedText>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.chatIconBtn, pressed && styles.pressed]}
          onPress={() => handleStartChat(friend.id, friend.name)}
        >
          <SymbolView
            name={{ ios: 'message.fill', android: 'chat', web: 'chat' }}
            tintColor={theme.primary}
            size={18}
          />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <DymsLogo size={28} showText={false} />
          <Pressable style={styles.wsSelector} onPress={() => router.push('/workspace')}>
            <ThemedText style={styles.wsName}>{selectedWorkspace?.name || 'DYMS'}</ThemedText>
            <SymbolView
              name={{ ios: 'chevron.up.chevron.down', android: 'unfold_more', web: 'unfold-more' }}
              tintColor={theme.primary}
              size={14}
            />
          </Pressable>
        </View>
        <Pressable style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={theme.text}
            size={22}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Search input */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.border }]}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              tintColor={theme.textSecondary}
              size={16}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="이름이나 소속을 검색하세요..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* My Profile */}
        {user && (
          <View style={styles.myProfileSection}>
            <ShadowCard style={styles.myProfileCard} padding={16}>
              <View style={styles.myProfileContent}>
                <View style={[styles.myAvatar, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText style={{ color: theme.primary, fontSize: 18, fontWeight: '700' }}>
                    {user.name.slice(-2)}
                  </ThemedText>
                </View>
                <View style={styles.myInfo}>
                  <View style={styles.myNameRow}>
                    <ThemedText style={styles.myName}>{user.name}</ThemedText>
                    <View style={[styles.myRoleBadge, { backgroundColor: theme.border }]}>
                      <ThemedText style={styles.myRoleText}>
                        {user.role === 'teacher' ? '교직원' : '학생'}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.myStatus} themeColor="textSecondary" numberOfLines={1}>
                    {user.statusMessage || '상태 메시지를 추가해보세요.'}
                  </ThemedText>
                </View>
              </View>
            </ShadowCard>
          </View>
        )}

        {/* Directory Collapsible Sections */}
        <View style={styles.directorySection}>
          <Collapsible title={`선생님 (${teachers.length})`}>
            <View style={styles.collapsibleList}>
              {teachers.map((f) => renderFriendItem(f))}
              {teachers.length === 0 && (
                <ThemedText style={styles.emptyText} themeColor="textSecondary">
                  검색 결과에 맞는 선생님이 없습니다.
                </ThemedText>
              )}
            </View>
          </Collapsible>

          <View style={styles.sectionSpacer} />

          <Collapsible title={`우리 반 친구 (${classmates.length})`}>
            <View style={styles.collapsibleList}>
              {classmates.map((f) => renderFriendItem(f))}
              {classmates.length === 0 && (
                <ThemedText style={styles.emptyText} themeColor="textSecondary">
                  검색 결과에 맞는 반 친구가 없습니다.
                </ThemedText>
              )}
            </View>
          </Collapsible>

          <View style={styles.sectionSpacer} />

          <Collapsible title={`기타 친구 (${others.length})`}>
            <View style={styles.collapsibleList}>
              {others.map((f) => renderFriendItem(f))}
              {others.length === 0 && (
                <ThemedText style={styles.emptyText} themeColor="textSecondary">
                  검색 결과에 맞는 다른 학년 친구가 없습니다.
                </ThemedText>
              )}
            </View>
          </Collapsible>
        </View>
      </ScrollView>

      {/* Friend Detail Card Overlay / Modal (Simulated) */}
      {activeProfileFriend && (
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveProfileFriend(null)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ShadowCard padding={24} style={{ borderColor: theme.border }}>
              <View style={styles.modalAvatarContainer}>
                <View style={[styles.modalAvatar, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText style={{ color: theme.primary, fontSize: 28, fontWeight: '700' }}>
                    {activeProfileFriend.name.slice(-2)}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.modalStatusDot,
                    {
                      backgroundColor:
                        activeProfileFriend.status === 'online'
                          ? '#34C759'
                          : activeProfileFriend.status === 'in-class'
                          ? '#FF9500'
                          : '#8E8E93',
                    },
                  ]}
                />
              </View>
              
              <ThemedText style={styles.modalName}>{activeProfileFriend.name}</ThemedText>
              <ThemedText style={styles.modalDetail} themeColor="textSecondary">
                {activeProfileFriend.detail}
              </ThemedText>
              
              {activeProfileFriend.statusMessage && (
                <View style={[styles.modalStatusMsgBox, { backgroundColor: theme.background }]}>
                  <ThemedText style={styles.modalStatusMsg}>
                    "{activeProfileFriend.statusMessage}"
                  </ThemedText>
                </View>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={() => handleStartChat(activeProfileFriend.id, activeProfileFriend.name)}
                >
                  <SymbolView
                    name={{ ios: 'message.fill', android: 'chat', web: 'chat' }}
                    tintColor="#FFFFFF"
                    size={16}
                  />
                  <ThemedText style={styles.modalBtnText}>1:1 채팅하기</ThemedText>
                </Pressable>
              </View>
            </ShadowCard>
          </Pressable>
        </Pressable>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wsName: {
    fontSize: 18,
    fontWeight: '800',
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  myProfileSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  myProfileCard: {
    borderColor: 'transparent',
  },
  myProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  myAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myInfo: {
    flex: 1,
    gap: 2,
  },
  myNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  myName: {
    fontSize: 18,
    fontWeight: '700',
  },
  myRoleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  myRoleText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
  },
  myStatus: {
    fontSize: 13,
  },
  directorySection: {
    paddingHorizontal: 16,
  },
  sectionSpacer: {
    height: 12,
  },
  collapsibleList: {
    paddingTop: 8,
    gap: 2,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  friendDetail: {
    fontSize: 11,
  },
  statusText: {
    fontSize: 13,
  },
  chatIconBtn: {
    padding: 10,
  },
  emptyText: {
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.7,
  },
  // Modal Style
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '80%',
    maxWidth: 320,
  },
  modalAvatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalStatusMsgBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalStatusMsg: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#555555',
  },
  modalActions: {
    alignItems: 'stretch',
  },
  modalBtn: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
