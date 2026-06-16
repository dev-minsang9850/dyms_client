import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ShadowCard } from "@/components/ShadowCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "@/components/SymbolView";
import { api } from "@/lib/api";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "teacher";
  position: "none" | "head" | "deputy";
}

export default function WorkspaceManageScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { selectedWorkspace, user, loadFriends } = useApp();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/workspace-members");
      setMembers(res.data as Member[]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("오류", "부원 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: "취소", style: "cancel" },
          { text: "확인", style: "destructive", onPress: onConfirm }
        ]
      );
    }
  };

  const handleAddMember = async () => {
    if (!emailToAdd.trim() || !selectedWorkspace) return;
    setSubmitting(true);
    try {
      await api.post(`/workspaces/${selectedWorkspace.id}/members`, {
        email: emailToAdd.trim(),
      });
      showAlert("성공", `${emailToAdd.trim()} 회원이 부서에 추가되었습니다.`);
      setEmailToAdd("");
      fetchMembers();
      await loadFriends();
    } catch (err: any) {
      showAlert("오류", err.response?.data?.message || "멤버 추가 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!selectedWorkspace) return;
    showConfirm(
      "멤버 제외",
      `정말로 ${member.name}님을 부서에서 제외하시겠습니까?`,
      async () => {
        try {
          await api.delete(`/workspaces/${selectedWorkspace.id}/members/${member.email}`);
          showAlert("성공", "제외 처리가 완료되었습니다.");
          fetchMembers();
          await loadFriends();
        } catch (err: any) {
          showAlert("오류", err.response?.data?.message || "멤버 제외 실패");
        }
      }
    );
  };

  const toggleDeputyRole = async (member: Member) => {
    const isDeputy = member.position === "deputy";
    const nextPos = isDeputy ? "none" : "deputy";
    const label = isDeputy ? "차장 임명을 해임" : "차장으로 임명";

    showConfirm(
      "직책 변경",
      `${member.name}님을 ${label}하시겠습니까?`,
      async () => {
        try {
          await api.patch(`/users/${member.id}/position`, { position: nextPos });
          showAlert("성공", "임명이 반영되었습니다.");
          fetchMembers();
          await loadFriends();
        } catch (err: any) {
          showAlert("오류", err.response?.data?.message || "직책 반영 실패");
        }
      }
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.replace('/menu' as any)}
          >
            <SymbolView
              name="chevron.left"
              tintColor={theme.text}
              size={24}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle} type="subtitle">
            부서 부원 관리
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type="smallBold">
              소속 부서: {selectedWorkspace?.name}
            </ThemedText>

            {/* Add member form */}
            <ShadowCard style={styles.addCard} padding={16}>
              <ThemedText type="smallBold">신규 부원 추가</ThemedText>
              <View style={styles.addRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="추가할 회원의 이메일을 입력하세요"
                  placeholderTextColor={theme.textSecondary}
                  value={emailToAdd}
                  onChangeText={setEmailToAdd}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable
                  style={[styles.addBtn, { backgroundColor: theme.primary }]}
                  onPress={handleAddMember}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={{ color: "#FFFFFF", fontWeight: "700" }}>추가</ThemedText>
                  )}
                </Pressable>
              </View>
            </ShadowCard>

            {/* Members list */}
            <ThemedText style={styles.listTitle} type="smallBold">부원 목록</ThemedText>
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 24 }} />
            ) : members.length === 0 ? (
              <ThemedText style={styles.emptyText} themeColor="textSecondary">부서에 배정된 부원이 없습니다.</ThemedText>
            ) : (
              members.map((item) => {
                const isMe = item.id === user?.id;
                const isHead = item.position === "head";
                const isDeputy = item.position === "deputy";

                return (
                  <ShadowCard key={item.id} style={styles.memberCard} padding={16}>
                    <View style={styles.memberRow}>
                      <View style={styles.memberInfo}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <ThemedText type="smallBold">{item.name}</ThemedText>
                          {isHead && (
                            <View style={[styles.roleBadge, { backgroundColor: "#FF2D55" }]}>
                              <ThemedText style={styles.badgeText}>부장</ThemedText>
                            </View>
                          )}
                          {isDeputy && (
                            <View style={[styles.roleBadge, { backgroundColor: "#5856D6" }]}>
                              <ThemedText style={styles.badgeText}>차장</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText themeColor="textSecondary" style={{ fontSize: 12 }}>
                          {item.email} | {item.phone}
                        </ThemedText>
                      </View>

                      {!isMe && !isHead && (
                        <View style={styles.actionColumn}>
                          <Pressable
                            style={[styles.actionBtn, { backgroundColor: theme.border }]}
                            onPress={() => toggleDeputyRole(item)}
                          >
                            <ThemedText style={{ fontSize: 11, fontWeight: "600" }}>
                              {isDeputy ? "차장 해임" : "차장 임명"}
                            </ThemedText>
                          </Pressable>
                          <Pressable
                            style={[styles.actionBtn, { backgroundColor: "rgba(255,59,48,0.1)" }]}
                            onPress={() => handleRemoveMember(item)}
                          >
                            <ThemedText style={{ fontSize: 11, color: "#FF3B30", fontWeight: "700" }}>
                              제외
                            </ThemedText>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </ShadowCard>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: Platform.OS === "ios" ? 10 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
  },
  addCard: {
    borderColor: "transparent",
    gap: 12,
  },
  addRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  listTitle: {
    fontSize: 15,
    marginTop: 8,
  },
  memberCard: {
    borderColor: "transparent",
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  actionColumn: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});
