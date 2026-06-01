import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Platform, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DymsLogo } from '@/components/DymsLogo';
import { ShadowCard } from '@/components/ShadowCard';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';

export default function WorkspaceScreen() {
  const { workspaces, selectWorkspace, createWorkspace, user } = useApp();
  const theme = useTheme();

  const [newWsName, setNewWsName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = () => {
    if (newWsName.trim() === '') return;
    createWorkspace(newWsName);
    setNewWsName('');
    setShowCreateForm(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <DymsLogo size={36} showText />
        </View>

        <View style={styles.titleSection}>
          <ThemedText style={styles.title} type="subtitle">
            워크스페이스 선택
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            접속할 워크스페이스를 선택해 주세요.
          </ThemedText>
        </View>

        <View style={styles.list}>
          {workspaces.map((ws) => (
            <Pressable
              key={ws.id}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => selectWorkspace(ws.id)}
            >
              <ShadowCard style={styles.card} padding={20}>
                <View style={styles.cardContent}>
                  <View style={[styles.wsIcon, { backgroundColor: theme.primaryLight }]}>
                    <SymbolView
                      name={{ ios: 'square.grid.3x3.fill', android: 'grid_view', web: 'grid' }}
                      tintColor={theme.primary}
                      size={24}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      {ws.ownerEmail}
                    </ThemedText>
                    <ThemedText style={styles.wsName}>
                      {ws.name}
                    </ThemedText>
                  </View>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron-right' }}
                    tintColor={theme.textSecondary}
                    size={20}
                  />
                </View>
              </ShadowCard>
            </Pressable>
          ))}
        </View>

        {showCreateForm ? (
          <ShadowCard style={styles.createCard} padding={16}>
            <ThemedText type="smallBold" style={styles.createLabel}>
              새 워크스페이스 이름
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
              ]}
              placeholder="예: DY@club"
              placeholderTextColor={theme.textSecondary}
              value={newWsName}
              onChangeText={setNewWsName}
              autoFocus
            />
            <View style={styles.formButtons}>
              <Pressable
                style={[styles.formButton, { backgroundColor: theme.border }]}
                onPress={() => setShowCreateForm(false)}
              >
                <ThemedText type="smallBold">취소</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.formButton, { backgroundColor: theme.primary }]}
                onPress={handleCreate}
              >
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  생성
                </ThemedText>
              </Pressable>
            </View>
          </ShadowCard>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
            onPress={() => setShowCreateForm(true)}
          >
            <SymbolView
              name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'plus-circle' }}
              tintColor={theme.primary}
              size={20}
            />
            <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>
              새 워크스페이스 만들기
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  list: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderColor: 'transparent',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  wsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  wsName: {
    fontSize: 18,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  createCard: {
    marginTop: 12,
    gap: 12,
  },
  createLabel: {
    fontSize: 13,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.7,
  },
});
