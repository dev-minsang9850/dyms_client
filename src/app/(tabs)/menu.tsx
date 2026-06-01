import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, TextInput, Switch, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ShadowCard } from '@/components/ShadowCard';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';

export default function MenuScreen() {
  const { user, logout, updateStatus } = useApp();
  const theme = useTheme();

  const [statusMsg, setStatusMsg] = useState(user?.statusMessage || '');
  const [isEditing, setIsEditing] = useState(false);

  const colorScheme = useColorScheme();

  // Switch states
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [dndMode, setDndMode] = useState(false);

  const handleUpdateStatus = () => {
    updateStatus(statusMsg);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText style={styles.headerTitle} type="subtitle">
          메뉴
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        {user && (
          <ShadowCard style={styles.profileCard} padding={20}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                <ThemedText style={{ color: theme.primary, fontSize: 22, fontWeight: '700' }}>
                  {user.name.slice(-2)}
                </ThemedText>
              </View>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName} type="subtitle">
                  {user.name}
                </ThemedText>
                <ThemedText style={styles.userEmail} themeColor="textSecondary">
                  {user.email}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {isEditing ? (
              <View style={styles.statusEditRow}>
                <TextInput
                  style={[
                    styles.statusInput,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  value={statusMsg}
                  onChangeText={setStatusMsg}
                  placeholder="상태메시지 입력"
                  placeholderTextColor={theme.textSecondary}
                  maxLength={30}
                />
                <Pressable
                  style={[styles.statusSaveBtn, { backgroundColor: theme.primary }]}
                  onPress={handleUpdateStatus}
                >
                  <ThemedText style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                    저장
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.statusRow, pressed && styles.pressed]}
                onPress={() => setIsEditing(true)}
              >
                <ThemedText style={styles.statusLabel} themeColor="textSecondary">
                  상태메시지:
                </ThemedText>
                <ThemedText style={styles.statusValue} numberOfLines={1}>
                  {user.statusMessage || '설정된 상태메시지가 없습니다.'}
                </ThemedText>
                <SymbolView
                  name={{ ios: 'pencil', android: 'edit', web: 'pencil' }}
                  tintColor={theme.primary}
                  size={14}
                />
              </Pressable>
            )}
          </ShadowCard>
        )}

        {/* Settings options */}
        <View style={styles.settingsSection}>
          <ThemedText style={styles.sectionTitle} type="smallBold">
            앱 설정
          </ThemedText>

          <ShadowCard style={styles.settingsCard} padding={0}>
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLabelContainer}>
                <SymbolView
                  name={{ ios: 'moon.fill', android: 'dark_mode', web: 'moon' }}
                  tintColor={theme.text}
                  size={18}
                />
                <ThemedText style={styles.settingLabelText}>다크 모드</ThemedText>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: theme.primary }}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLabelContainer}>
                <SymbolView
                  name={{ ios: 'bell.fill', android: 'notifications', web: 'bell' }}
                  tintColor={theme.text}
                  size={18}
                />
                <ThemedText style={styles.settingLabelText}>알림 받기</ThemedText>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#767577', true: theme.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <SymbolView
                  name={{ ios: 'minus.circle.fill', android: 'do_not_disturb', web: 'do_not_disturb' }}
                  tintColor={theme.text}
                  size={18}
                />
                <View>
                  <ThemedText style={styles.settingLabelText}>수업 중 방해금지</ThemedText>
                  <ThemedText style={styles.settingDescText} themeColor="textSecondary">
                    학기 중 일과 시간에는 알림을 무음 처리합니다.
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={dndMode}
                onValueChange={setDndMode}
                trackColor={{ false: '#767577', true: theme.primary }}
              />
            </View>
          </ShadowCard>
        </View>

        {/* Action list */}
        <View style={styles.actionSection}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={handleLogout}
          >
            <SymbolView
              name={{ ios: 'power', android: 'logout', web: 'logout' }}
              tintColor="#FF3B30"
              size={18}
            />
            <ThemedText style={styles.logoutText}>로그아웃</ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.versionText} themeColor="textSecondary">
            DYMS Beta Version 1.0.0
          </ThemedText>
          <ThemedText style={styles.copyrightText} themeColor="textSecondary">
            © 2026 Dukyoung High School. All rights reserved.
          </ThemedText>
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
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    gap: 20,
  },
  profileCard: {
    borderColor: 'transparent',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 14,
    flex: 1,
  },
  statusEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  statusSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
  },
  settingsCard: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDescText: {
    fontSize: 11,
    marginTop: 2,
  },
  actionSection: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 10,
  },
});
