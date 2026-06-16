import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ShadowCard } from "@/components/ShadowCard";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "@/components/SymbolView";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "teacher";
  position: "none" | "head" | "deputy";
  workspace?: string;
  isApproved: boolean;
  isAdmin: boolean;
}

interface WorkspaceItem {
  id: string;
  name: string;
  ownerEmail: string;
  memberEmails?: string[];
}

export default function AdminScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { loadFriends, loadWorkspaces } = useApp();

  const [activeTab, setActiveTab] = useState<"pending" | "users" | "workspaces">("pending");
  const [loading, setLoading] = useState(false);

  // Data states
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allWorkspaces, setAllWorkspaces] = useState<WorkspaceItem[]>([]);

  // Modals & Action states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [editUserWorkspaces, setEditUserWorkspaces] = useState<string[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces/all");
        const wsList = res.data as WorkspaceItem[];
        setAllWorkspaces(wsList);
        if (wsList.length > 0) {
          setSelectedWorkspaces([wsList[0].name]);
        }
      } catch (err) {
        console.error("initWorkspaces error", err);
      }
    };
    initWorkspaces();
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

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        const res = await api.get("/users/pending");
        setPendingUsers(res.data as UserProfile[]);
        const wsRes = await api.get("/workspaces/all");
        setAllWorkspaces(wsRes.data as WorkspaceItem[]);
      } else if (activeTab === "users") {
        const res = await api.get("/users");
        setAllUsers(res.data as UserProfile[]);
        const wsRes = await api.get("/workspaces/all");
        setAllWorkspaces(wsRes.data as WorkspaceItem[]);
      } else if (activeTab === "workspaces") {
        const res = await api.get("/workspaces/all");
        setAllWorkspaces(res.data as WorkspaceItem[]);
      }
    } catch (err: any) {
      console.error("fetchData error", err);
      if (err.response?.status !== 401) {
        showAlert("오류", err.response?.data?.message || "데이터 로드에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const getUserWorkspaces = (userEmail: string) => {
    return allWorkspaces
      .filter((ws) => ws.ownerEmail === userEmail || (ws.memberEmails && ws.memberEmails.includes(userEmail)))
      .map((ws) => ws.name);
  };

  // Approval flow
  const handleApprove = async () => {
    if (!selectedUser) return;
    if (selectedWorkspaces.length === 0) {
      showAlert("경고", "최소 한 개 이상의 워크스페이스를 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser.id}/approve`, {
        workspaces: selectedWorkspaces,
      });
      showAlert("성공", `${selectedUser.name} 사용자가 승인되었습니다.`);
      setShowAssignModal(false);
      setSelectedUser(null);
      fetchData();
      await loadFriends();
      await loadWorkspaces();
    } catch (err: any) {
      showAlert("오류", err.response?.data?.message || "승인 처리 실패");
    } finally {
      setSubmitting(false);
    }
  };

  // Workspaces Edit flow
  const handleSaveWorkspaces = async () => {
    if (!selectedUser) return;
    if (editUserWorkspaces.length === 0) {
      showAlert("경고", "최소 한 개 이상의 워크스페이스를 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser.id}/workspaces`, {
        workspaces: editUserWorkspaces,
      });
      showAlert("성공", `${selectedUser.name}님의 소속 워크스페이스가 변경되었습니다.`);
      setShowWorkspaceModal(false);
      setSelectedUser(null);
      fetchData();
      await loadFriends();
      await loadWorkspaces();
    } catch (err: any) {
      showAlert("오류", err.response?.data?.message || "워크스페이스 수정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  // Role/Position flow
  const handleUpdatePosition = async (position: "none" | "head" | "deputy") => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser.id}/position`, { position });
      showAlert("성공", `${selectedUser.name}님의 직책이 변경되었습니다.`);
      setShowPositionModal(false);
      setSelectedUser(null);
      fetchData();
      await loadFriends();
    } catch (err: any) {
      showAlert("오류", err.response?.data?.message || "직책 수정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  // Password reset flow
  const handleResetPassword = async (user: UserProfile) => {
    showConfirm(
      "비밀번호 초기화",
      `${user.name}님의 비밀번호를 초기화하시겠습니까?`,
      async () => {
        try {
          const res = await api.patch(`/users/${user.id}/password`);
          if (res.data.tempPassword) {
            showAlert("성공", `임시 비밀번호가 생성되었습니다:\n\n${res.data.tempPassword}`);
          }
        } catch (err: any) {
          showAlert("오류", err.response?.data?.message || "비밀번호 초기화 실패");
        }
      }
    );
  };

  // User deletion flow
  const handleDeleteUser = async (user: UserProfile) => {
    showConfirm(
      "회원 삭제",
      `정말로 ${user.name}(${user.email}) 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      async () => {
        try {
          await api.delete(`/users/${user.id}`);
          showAlert("성공", `${user.name} 회원이 삭제되었습니다.`);
          fetchData();
          await loadFriends();
        } catch (err: any) {
          showAlert("오류", err.response?.data?.message || "회원 삭제 실패");
        }
      }
    );
  };

  // Workspace CRUD flows
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/workspaces", { name: newWorkspaceName.trim() });
      showAlert("성공", "새 워크스페이스가 생성되었습니다.");
      setShowCreateWorkspaceModal(false);
      setNewWorkspaceName("");
      fetchData();
      await loadWorkspaces();
    } catch (err: any) {
      showAlert("오류", err.response?.data?.message || "워크스페이스 생성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (wsId: string, wsName: string) => {
    showConfirm(
      "워크스페이스 삭제",
      `정말로 '${wsName}' 워크스페이스를 삭제하시겠습니까?`,
      async () => {
        try {
          await api.delete(`/workspaces/${wsId}`);
          showAlert("성공", "워크스페이스가 삭제되었습니다.");
          fetchData();
          await loadWorkspaces();
          await loadFriends();
        } catch (err: any) {
          showAlert("오류", err.response?.data?.message || "삭제 실패");
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
            어드민 대시보드
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Controls */}
        <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
          <Pressable
            style={[styles.tabButton, activeTab === "pending" && [styles.activeTab, { borderBottomColor: theme.primary }]]}
            onPress={() => setActiveTab("pending")}
          >
            <ThemedText style={[styles.tabText, activeTab === "pending" && { color: theme.primary, fontWeight: "700" }]}>
              가입 승인 대기
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === "users" && [styles.activeTab, { borderBottomColor: theme.primary }]]}
            onPress={() => setActiveTab("users")}
          >
            <ThemedText style={[styles.tabText, activeTab === "users" && { color: theme.primary, fontWeight: "700" }]}>
              유저 관리
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === "workspaces" && [styles.activeTab, { borderBottomColor: theme.primary }]]}
            onPress={() => setActiveTab("workspaces")}
          >
            <ThemedText style={[styles.tabText, activeTab === "workspaces" && { color: theme.primary, fontWeight: "700" }]}>
              워크스페이스 관리
            </ThemedText>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {activeTab === "pending" && (
              <View style={styles.section}>
                {pendingUsers.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText themeColor="textSecondary">대기 중인 회원이 없습니다.</ThemedText>
                  </View>
                ) : (
                  pendingUsers.map((item) => (
                    <ShadowCard key={item.id} style={styles.itemCard} padding={16}>
                      <View style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <ThemedText type="smallBold">{item.name}</ThemedText>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 12 }}>
                            {item.email} | {item.phone}
                          </ThemedText>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 11 }}>
                            가입 역할: {item.role === "teacher" ? "교직원" : "학생"}
                          </ThemedText>
                        </View>
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                          onPress={() => {
                            setSelectedUser(item);
                            if (allWorkspaces.length > 0) {
                              setSelectedWorkspaces([allWorkspaces[0].name]);
                            }
                            setShowAssignModal(true);
                          }}
                        >
                          <ThemedText style={styles.actionBtnText}>승인</ThemedText>
                        </Pressable>
                      </View>
                    </ShadowCard>
                  ))
                )}
              </View>
            )}

            {activeTab === "users" && (
              <View style={styles.section}>
                {allUsers.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText themeColor="textSecondary">가입된 유저가 없습니다.</ThemedText>
                  </View>
                ) : (
                  allUsers.map((item) => (
                    <ShadowCard key={item.id} style={styles.itemCard} padding={16}>
                      <View style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <ThemedText type="smallBold">{item.name}</ThemedText>
                            <View style={[styles.badge, { backgroundColor: item.isApproved ? theme.primaryLight : theme.border }]}>
                              <ThemedText style={{ fontSize: 10, color: item.isApproved ? theme.primary : theme.textSecondary }}>
                                {item.isApproved ? "정회원" : "대기회원"}
                              </ThemedText>
                            </View>
                          </View>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 12 }}>
                            {item.email} | {item.phone}
                          </ThemedText>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 11 }}>
                            소속: {getUserWorkspaces(item.email).join(', ') || "없음"} | 역할: {item.role === "teacher" ? "교직원" : "학생"}
                          </ThemedText>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 11 }}>
                            직책: {item.position === "head" ? "부장" : item.position === "deputy" ? "차장" : "없음"}
                          </ThemedText>
                        </View>
                        <View style={styles.btnColumn}>
                          <Pressable
                            style={[styles.smallBtn, { backgroundColor: theme.border }]}
                            onPress={() => {
                              setSelectedUser(item);
                              setEditUserWorkspaces(getUserWorkspaces(item.email));
                              setShowWorkspaceModal(true);
                            }}
                          >
                            <ThemedText style={{ fontSize: 11, fontWeight: "600" }}>소속 관리</ThemedText>
                          </Pressable>
                          <Pressable
                            style={[styles.smallBtn, { backgroundColor: theme.border }]}
                            onPress={() => {
                              setSelectedUser(item);
                              setShowPositionModal(true);
                            }}
                          >
                            <ThemedText style={{ fontSize: 11, fontWeight: "600" }}>직책 변경</ThemedText>
                          </Pressable>
                          <Pressable
                            style={[styles.smallBtn, { backgroundColor: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.2)", borderWidth: 0.5 }]}
                            onPress={() => handleResetPassword(item)}
                          >
                            <ThemedText style={{ fontSize: 11, color: "#FF3B30", fontWeight: "600" }}>비밀번호 초기화</ThemedText>
                          </Pressable>
                          <Pressable
                            style={[styles.smallBtn, { backgroundColor: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.2)", borderWidth: 0.5 }]}
                            onPress={() => handleDeleteUser(item)}
                          >
                            <ThemedText style={{ fontSize: 11, color: "#FF3B30", fontWeight: "600" }}>회원 삭제</ThemedText>
                          </Pressable>
                        </View>
                      </View>
                    </ShadowCard>
                  ))
                )}
              </View>
            )}

            {activeTab === "workspaces" && (
              <View style={styles.section}>
                <Pressable
                  style={[styles.createWsBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setShowCreateWorkspaceModal(true)}
                >
                  <SymbolView name={{ ios: "plus.fill", android: "add", web: "plus" }} tintColor="#FFFFFF" size={16} />
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "700" }}>새 워크스페이스 만들기</ThemedText>
                </Pressable>

                {allWorkspaces.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText themeColor="textSecondary">개설된 워크스페이스가 없습니다.</ThemedText>
                  </View>
                ) : (
                  allWorkspaces.map((item) => (
                    <ShadowCard key={item.id} style={styles.itemCard} padding={16}>
                      <View style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <ThemedText type="smallBold">{item.name}</ThemedText>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 12 }}>
                            개설자: {item.ownerEmail}
                          </ThemedText>
                          <ThemedText themeColor="textSecondary" style={{ fontSize: 11 }}>
                            멤버 수: {item.memberEmails?.length || 0}명
                          </ThemedText>
                        </View>
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: "rgba(255,59,48,0.1)" }]}
                          onPress={() => handleDeleteWorkspace(item.id, item.name)}
                        >
                          <ThemedText style={{ color: "#FF3B30", fontWeight: "700", fontSize: 12 }}>삭제</ThemedText>
                        </Pressable>
                      </View>
                    </ShadowCard>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* Modal: Workspace Assign on Approval */}
        <Modal visible={showAssignModal} transparent animationType="fade" onRequestClose={() => setShowAssignModal(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText type="subtitle">가입 승인 & 워크스페이스 배정</ThemedText>
              <ThemedText themeColor="textSecondary" style={{ fontSize: 13, marginBottom: 8 }}>
                {selectedUser?.name}님을 승인하고 배정할 워크스페이스들을 골라주세요 (다중 선택 가능).
              </ThemedText>

              <View style={styles.workspaceSelectGrid}>
                {allWorkspaces.length === 0 ? (
                  <ThemedText themeColor="textSecondary" style={{ fontSize: 13, textAlign: "center", marginVertical: 12 }}>
                    개설된 워크스페이스가 없습니다.
                  </ThemedText>
                ) : (
                  allWorkspaces.map((ws) => {
                    const isSel = selectedWorkspaces.includes(ws.name);
                    return (
                      <Pressable
                        key={ws.id}
                        style={[styles.wsSelectCard, { borderColor: isSel ? theme.primary : theme.border, backgroundColor: isSel ? theme.primaryLight : theme.background }]}
                        onPress={() => {
                          if (isSel) {
                            if (selectedWorkspaces.length > 1) {
                              setSelectedWorkspaces(selectedWorkspaces.filter(w => w !== ws.name));
                            } else {
                              showAlert("경고", "최소 하나의 워크스페이스를 선택해야 합니다.");
                            }
                          } else {
                            setSelectedWorkspaces([...selectedWorkspaces, ws.name]);
                          }
                        }}
                      >
                        <ThemedText style={[isSel && { color: theme.primary, fontWeight: "700" }]}>{ws.name}</ThemedText>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <View style={styles.modalActions}>
                <Pressable style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowAssignModal(false)}>
                  <ThemedText>취소</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleApprove} disabled={submitting}>
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "700" }}>승인 완료</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>

        {/* Modal: Manage Workspaces for Existing User */}
        <Modal visible={showWorkspaceModal} transparent animationType="fade" onRequestClose={() => setShowWorkspaceModal(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText type="subtitle">소속 워크스페이스 관리</ThemedText>
              <ThemedText themeColor="textSecondary" style={{ fontSize: 13, marginBottom: 8 }}>
                {selectedUser?.name}님의 소속 워크스페이스를 설정해 주세요 (다중 선택 가능).
              </ThemedText>

              <View style={styles.workspaceSelectGrid}>
                {allWorkspaces.length === 0 ? (
                  <ThemedText themeColor="textSecondary" style={{ fontSize: 13, textAlign: "center", marginVertical: 12 }}>
                    개설된 워크스페이스가 없습니다.
                  </ThemedText>
                ) : (
                  allWorkspaces.map((ws) => {
                    const isSel = editUserWorkspaces.includes(ws.name);
                    return (
                      <Pressable
                        key={ws.id}
                        style={[styles.wsSelectCard, { borderColor: isSel ? theme.primary : theme.border, backgroundColor: isSel ? theme.primaryLight : theme.background }]}
                        onPress={() => {
                          if (isSel) {
                            if (editUserWorkspaces.length > 1) {
                              setEditUserWorkspaces(editUserWorkspaces.filter(w => w !== ws.name));
                            } else {
                              showAlert("경고", "최소 하나의 워크스페이스를 선택해야 합니다.");
                            }
                          } else {
                            setEditUserWorkspaces([...editUserWorkspaces, ws.name]);
                          }
                        }}
                      >
                        <ThemedText style={[isSel && { color: theme.primary, fontWeight: "700" }]}>{ws.name}</ThemedText>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <View style={styles.modalActions}>
                <Pressable style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowWorkspaceModal(false)}>
                  <ThemedText>취소</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleSaveWorkspaces} disabled={submitting}>
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "700" }}>저장</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>

        {/* Modal: Position Delegation */}
        <Modal visible={showPositionModal} transparent animationType="fade" onRequestClose={() => setShowPositionModal(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText type="subtitle">부서 내 직책 설정</ThemedText>
              <ThemedText themeColor="textSecondary" style={{ fontSize: 13 }}>
                {selectedUser?.name}님의 직책을 임명해 주세요.
              </ThemedText>

              <View style={styles.positionGrid}>
                {(["none", "head", "deputy"] as const).map((pos) => {
                  const label = pos === "head" ? "부장" : pos === "deputy" ? "차장" : "직책 없음";
                  return (
                    <Pressable
                      key={pos}
                      style={[styles.positionCard, { backgroundColor: theme.border }]}
                      onPress={() => handleUpdatePosition(pos)}
                    >
                      <ThemedText style={{ fontWeight: "700" }}>{label}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable style={[styles.modalBtn, { backgroundColor: theme.border, marginTop: 12 }]} onPress={() => setShowPositionModal(false)}>
                <ThemedText>취소</ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        </Modal>

        {/* Modal: Create Workspace */}
        <Modal visible={showCreateWorkspaceModal} transparent animationType="fade" onRequestClose={() => setShowCreateWorkspaceModal(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText type="subtitle">새 워크스페이스 개설</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="워크스페이스 이름 입력 (예: DY@club)"
                placeholderTextColor={theme.textSecondary}
                value={newWorkspaceName}
                onChangeText={setNewWorkspaceName}
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowCreateWorkspaceModal(false)}>
                  <ThemedText>취소</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleCreateWorkspace} disabled={submitting}>
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "700" }}>개설하기</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>
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
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  section: {
    gap: 12,
  },
  itemCard: {
    borderColor: "transparent",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  btnColumn: {
    gap: 6,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  createWsBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  workspaceSelectGrid: {
    gap: 8,
  },
  wsSelectCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  positionGrid: {
    gap: 8,
    marginTop: 10,
  },
  positionCard: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});
