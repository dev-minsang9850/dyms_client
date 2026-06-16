import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, TextInput, Switch, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ShadowCard } from '@/components/ShadowCard';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from '@/components/SymbolView';

export default function MenuScreen() {
  const { user, logout, updateStatus, updateProfile, themeMode, setThemeMode, clearWorkspace } = useApp();
  const theme = useTheme();
  const router = useRouter();

  const [statusMsg, setStatusMsg] = useState(user?.statusMessage || '');
  const [isEditing, setIsEditing] = useState(false);

  // Switch states
  const [notifications, setNotifications] = useState(true);
  const [dndMode, setDndMode] = useState(false);

  // Edit profile states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const openEditProfileModal = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditPassword('');
    setEditPasswordConfirm('');
    setEditGrade(user?.grade ? String(user.grade) : '');
    setEditClass(user?.class ? String(user.class) : '');
    setEditNumber(user?.number ? String(user.number) : '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('오류', '이름을 입력해 주세요.');
      return;
    }
    const nameRegex = /^[a-zA-Z가-힣\s]+$/;
    if (!nameRegex.test(editName.trim())) {
      Alert.alert('오류', '이름에는 특수기호나 숫자가 포함될 수 없습니다.');
      return;
    }
    if (!editPhone.trim()) {
      Alert.alert('오류', '연락처를 입력해 주세요.');
      return;
    }
    const phoneDigits = editPhone.replace(/\D/g, '');
    if (!/^010\d{7,8}$/.test(phoneDigits)) {
      Alert.alert('오류', '유효하지 않은 전화번호 형식입니다. 010으로 시작하는 10~11자리 숫자여야 합니다.');
      return;
    }
    if (user?.role === 'student') {
      const g = parseInt(editGrade, 10);
      const c = parseInt(editClass, 10);
      const n = parseInt(editNumber, 10);
      if (isNaN(g) || g < 1 || g > 3) {
        Alert.alert('오류', '학년은 1에서 3 사이의 숫자여야 합니다.');
        return;
      }
      if (isNaN(c) || c < 1 || c > 9) {
        Alert.alert('오류', '반은 1에서 9 사이의 숫자여야 합니다.');
        return;
      }
      if (isNaN(n) || n < 1 || n > 99) {
        Alert.alert('오류', '번호는 1에서 99 사이의 숫자여야 합니다.');
        return;
      }
    }
    if (editPassword !== '' && editPassword !== editPasswordConfirm) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSavingProfile(true);
    const updateData: any = {
      name: editName.trim(),
      phone: editPhone.trim(),
    };

    if (editPassword.trim() !== '') {
      updateData.password = editPassword;
    }

    if (user?.role === 'student') {
      updateData.grade = editGrade ? parseInt(editGrade, 10) : null;
      updateData.class = editClass ? parseInt(editClass, 10) : null;
      updateData.number = editNumber ? parseInt(editNumber, 10) : null;
    }

    const success = await updateProfile(updateData);
    setIsSavingProfile(false);
    if (success) {
      Alert.alert('성공', '개인정보가 성공적으로 수정되었습니다.');
      setShowEditProfile(false);
    } else {
      Alert.alert('오류', '개인정보 수정에 실패했습니다.');
    }
  };

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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <ThemedText style={styles.userName} type="subtitle">
                    {user.name}
                  </ThemedText>
                  <Pressable
                    style={({ pressed }) => [styles.editProfileBtn, { borderColor: theme.primary }, pressed && styles.pressed]}
                    onPress={openEditProfileModal}
                  >
                    <ThemedText style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>개인정보 수정</ThemedText>
                  </Pressable>
                </View>
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
                value={themeMode === 'dark'}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
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

            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
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

            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                pressed && styles.pressed,
              ]}
              onPress={clearWorkspace}
            >
              <View style={styles.settingLabelContainer}>
                <SymbolView
                  name={{ ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid' }}
                  tintColor={theme.text}
                  size={18}
                />
                <ThemedText style={styles.settingLabelText}>워크스페이스 전환</ThemedText>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron-right' }}
                tintColor={theme.textSecondary}
                size={16}
              />
            </Pressable>
          </ShadowCard>
        </View>

        {/* Department Head Section (Only visible to department heads) */}
        {user?.position === 'head' && (
          <View style={styles.settingsSection}>
            <ThemedText style={styles.sectionTitle} type="smallBold">
              부서 관리 메뉴
            </ThemedText>
            <ShadowCard style={styles.settingsCard} padding={0}>
              <Pressable
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push("/workspace-manage")}
              >
                <View style={styles.settingLabelContainer}>
                  <SymbolView
                    name={{ ios: 'person.2.fill', android: 'group', web: 'users' }}
                    tintColor={theme.text}
                    size={18}
                  />
                  <ThemedText style={styles.settingLabelText}>부서 부원 관리</ThemedText>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron-right' }}
                  tintColor={theme.textSecondary}
                  size={16}
                />
              </Pressable>
            </ShadowCard>
          </View>
        )}

        {/* Admin Section (Only visible to admins) */}
        {user?.isAdmin && (
          <View style={styles.settingsSection}>
            <ThemedText style={styles.sectionTitle} type="smallBold">
              관리자 메뉴
            </ThemedText>
            <ShadowCard style={styles.settingsCard} padding={0}>
              <Pressable
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/admin' as any)}
              >
                <View style={styles.settingLabelContainer}>
                  <SymbolView
                    name={{ ios: 'person.badge.shield.checkmark.fill', android: 'admin_panel_settings', web: 'shield' }}
                    tintColor={theme.primary}
                    size={18}
                  />
                  <ThemedText style={[styles.settingLabelText, { color: theme.primary }]}>
                    가입 및 단체 승인 관리
                  </ThemedText>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron-right' }}
                  tintColor={theme.textSecondary}
                  size={16}
                />
              </Pressable>
            </ShadowCard>
          </View>
        )}

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

      {/* Modal: Edit Profile */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
            <ThemedText style={styles.modalTitle} type="subtitle">개인정보 수정</ThemedText>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel} themeColor="textSecondary">이메일 (아이디)</ThemedText>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.background + '80', color: theme.textSecondary, borderColor: theme.border },
                  ]}
                  value={user?.email}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>이름</ThemedText>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  value={editName}
                  onChangeText={(txt) => setEditName(txt.replace(/[^a-zA-Z가-힣\s]/g, ''))}
                  placeholder="이름 입력"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>연락처</ThemedText>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  value={editPhone}
                  onChangeText={(txt) => setEditPhone(txt.replace(/[^0-9-]/g, ''))}
                  placeholder="연락처 입력 (예: 010-0000-0000)"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              {user?.role === 'student' && (
                <View style={styles.formGroup}>
                  <ThemedText style={styles.inputLabel}>학적 정보</ThemedText>
                  <View style={styles.rowInputs}>
                    <View style={styles.flexInput}>
                      <TextInput
                        style={[
                          styles.modalInput,
                          { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                        ]}
                        value={editGrade}
                        onChangeText={(txt) => setEditGrade(txt.replace(/[^0-9]/g, ''))}
                        placeholder="학년"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={1}
                      />
                    </View>
                    <View style={styles.flexInput}>
                      <TextInput
                        style={[
                          styles.modalInput,
                          { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                        ]}
                        value={editClass}
                        onChangeText={(txt) => setEditClass(txt.replace(/[^0-9]/g, ''))}
                        placeholder="반"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                    <View style={styles.flexInput}>
                      <TextInput
                        style={[
                          styles.modalInput,
                          { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                        ]}
                        value={editNumber}
                        onChangeText={(txt) => setEditNumber(txt.replace(/[^0-9]/g, ''))}
                        placeholder="번호"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>비밀번호 변경 (선택)</ThemedText>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholder="새 비밀번호 입력"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>비밀번호 확인</ThemedText>
                <TextInput
                  style={[
                    styles.modalInput,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  value={editPasswordConfirm}
                  onChangeText={setEditPasswordConfirm}
                  placeholder="새 비밀번호 다시 입력"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: theme.border }]}
                onPress={() => setShowEditProfile(false)}
                disabled={isSavingProfile}
              >
                <ThemedText style={{ fontWeight: '700' }}>취소</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>저장</ThemedText>
                )}
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  editProfileBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    ...Platform.select({
      web: {
        backdropFilter: "blur(20px)",
      }
    })
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  modalScroll: {
    maxHeight: 400,
  },
  formGroup: {
    gap: 6,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  flexInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
