// src/app/(tabs)/index.tsx
import React, { useState, useMemo } from "react";
import { View, TextInput, FlatList, Platform, Image } from "react-native";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

export default function TabsHomeScreen() {
  const { friends, themeMode } = useApp();
  const [search, setSearch] = useState("");
  const theme = useTheme();

  const safeFriends = friends || [];

  const filteredFriends = useMemo(
    () =>
      safeFriends.filter((f) => {
        const lowerSearch = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(lowerSearch) ||
          f.detail.toLowerCase().includes(lowerSearch)
        );
      }),
    [safeFriends, search],
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'stretch' }}>
      <ThemedView style={{ flex: 1, width: '100%', padding: 16, backgroundColor: 'transparent' }}>
        <TextInput
          placeholder="친구 검색"
          placeholderTextColor={themeMode === 'dark' ? '#9A9EA7' : theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={{
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
            backgroundColor: themeMode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            color: themeMode === 'dark' ? '#FFFFFF' : theme.text,
            paddingHorizontal: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 10,
            overflow: 'hidden',
          }}
        />
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primaryLight, overflow: 'hidden', marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <ThemedText style={{ color: theme.primary, fontSize: 14, fontWeight: '700' }}>
                    {item.name.slice(-2)}
                  </ThemedText>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '600' }}>{item.name}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: 2 }}>
                  {item.detail}
                </ThemedText>
              </View>
            </View>
          )}
        />
      </ThemedView>
    </View>
  );
}
