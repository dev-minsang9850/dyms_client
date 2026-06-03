// src/app/(tabs)/index.tsx
import React, { useState, useMemo } from "react";
import { View, TextInput, FlatList } from "react-native";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function TabsHomeScreen() {
  const { friends } = useApp();
  const [search, setSearch] = useState("");

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
        value={search}
        onChangeText={setSearch}
        style={{
          height: 40,
          borderRadius: 8,
          borderWidth: 1,
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
