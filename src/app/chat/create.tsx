import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ShadowCard } from '@/components/ShadowCard';
import { useApp, Friend } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from '@/components/SymbolView';

export default function CreateChatScreen() {
  const { friends, createChatRoom, user } = useApp();
  const theme = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roomName, setRoomName] = useState('');

  let allList: Friend[] = [...friends];
  if (user && !allList.some((f) => f.id === user.id)) {
    allList = [
      {
        id: user.id,
        name: `${user.name} (나)`,
        role: user.role,
        detail: user.role === 'teacher'
          ? `교직원${user.position === 'head' ? ' (부장)' : user.position === 'deputy' ? ' (차장)' : ''}`
          : (user.grade && user.class) ? `${user.grade}학년 ${user.class}반` : '학적 정보 없음',
        status: 'online',
        statusMessage: user.statusMessage || '',
      },
      ...allList,
    ];
  } else {
    allList = allList.map((f) => {
      if (f.id === user?.id) {
        return { ...f, name: `${f.name} (나)` };
      }
      return f;
    });
  }

  const filteredFriends = allList.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.detail.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectFriend = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((mId) => mId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreate = async () => {
    if (selectedIds.length === 0) return;
    
    // If it's a direct message (1 person) and name is not set, let Context default it
    const finalRoomName = selectedIds.length > 1 ? roomName || undefined : undefined;
    try {
      const newChatId = await createChatRoom(selectedIds, finalRoomName);
      // Redirect to the newly created room
      router.replace(`/chat/${newChatId}`);
    } catch (e) {
      console.error("Failed to create chat room", e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'x' }}
            tintColor={theme.text}
            size={24}
          />
        </Pressable>
        <ThemedText style={styles.headerTitle} type="smallBold">
          대화방 만들기
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            selectedIds.length === 0 && styles.disabled,
            pressed && selectedIds.length > 0 && styles.pressed,
          ]}
          onPress={handleCreate}
          disabled={selectedIds.length === 0}
        >
          <ThemedText style={{ color: selectedIds.length > 0 ? theme.primary : theme.textSecondary, fontWeight: '700' }}>
            완료
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.border }]}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              tintColor={theme.textSecondary}
              size={16}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="대화할 친구를 검색하세요..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Group room name input (Only visible when selecting more than 1 friend) */}
        {selectedIds.length > 1 && (
          <View style={styles.nameInputContainer}>
            <ShadowCard padding={12} style={{ borderColor: theme.border }}>
              <ThemedText type="smallBold" style={styles.nameLabel}>
                그룹 채팅방 이름 (선택)
              </ThemedText>
              <TextInput
                style={[
                  styles.nameInput,
                  { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="예: 우리 조 단톡방"
                placeholderTextColor={theme.textSecondary}
                value={roomName}
                onChangeText={setRoomName}
              />
            </ShadowCard>
          </View>
        )}

        {/* Friends Selection List */}
        <View style={styles.list}>
          <ThemedText style={styles.listTitle} type="smallBold" themeColor="textSecondary">
            선택된 멤버 ({selectedIds.length}명)
          </ThemedText>

          {filteredFriends.map((friend) => {
            const isSelected = selectedIds.includes(friend.id);
            return (
              <Pressable
                key={friend.id}
                style={({ pressed }) => [styles.friendItem, pressed && styles.pressed]}
                onPress={() => toggleSelectFriend(friend.id)}
              >
                <View style={styles.avatarCircle}>
                  <ThemedText style={{ fontSize: 14 }} type="smallBold">
                    {friend.name.slice(-2)}
                  </ThemedText>
                </View>
                
                <View style={styles.friendInfo}>
                  <ThemedText type="smallBold">{friend.name}</ThemedText>
                  <ThemedText style={styles.friendDetail} themeColor="textSecondary">
                    {friend.detail}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    { borderColor: theme.primary },
                    isSelected && { backgroundColor: theme.primary },
                  ]}
                >
                  {isSelected && (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      tintColor="#FFFFFF"
                      size={12}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
  },
  createButton: {
    padding: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingBottom: 40,
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
  nameInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  nameLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  nameInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E0E1E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendDetail: {
    fontSize: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
