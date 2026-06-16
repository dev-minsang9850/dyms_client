// src/app/(tabs)/index.tsx
import React, { useState, useMemo } from "react";
import { View, TextInput, FlatList } from "react-native";
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
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="친구 검색"
        placeholderTextColor={themeMode === 'dark' ? '#9A9EA7' : theme.textSecondary}
        value={search}
        onChangeText={setSearch}
        style={{
          height: 40,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: themeMode === 'dark' ? '#3A3A40' : theme.border,
          backgroundColor: themeMode === 'dark' ? '#2A2A30' : theme.card,
          color: themeMode === 'dark' ? '#FFFFFF' : theme.text,
          paddingHorizontal: 12,
          marginBottom: 12,
        }}
      />
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <ThemedText>{item.name}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {item.detail}
            </ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}
