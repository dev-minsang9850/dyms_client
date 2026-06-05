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
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ShadowCard } from "@/components/ShadowCard";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "expo-symbols";
import { api } from "@/lib/api";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "teacher";
}

const WORKSPACES = [
  "DY@Software",
  "DY@InfoSec",
  "DY@AI",
  "DY@WEB",
  "DY@Design",
];

export default function AdminScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Approval modal states
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(
    WORKSPACES[0],
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingUsers = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const res = await api.get("/users/pending");
      setPendingUsers(res.data as PendingUser[]);
    } catch (err: any) {
      console.error("fetchPendingUsers error", err);
      Alert.alert(
        "오류",
        err.response?.data?.message || "대기 사용자 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingUsers(false);
  };

  const openApprovalModal = (user: PendingUser) => {
    setSelectedUser(user);
    setSelectedWorkspace(WORKSPACES[0]); // default
  };

  const closeApprovalModal = () => {
    setSelectedUser(null);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser.id}/approve`, {
        workspace: selectedWorkspace,
      });
      Alert.alert("성공", `${selectedUser.name} 사용자가 승인되었습니다.`);
      closeApprovalModal();
      fetchPendingUsers(false);
    } catch (err: any) {
      console.error("approve error", err);
      Alert.alert(
        "오류",
        err.response?.data?.message || "가입 승인 처리에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderUserItem = ({ item }: { item: PendingUser }) => (
    <ShadowCard style={styles.userCard} padding={16}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.avatar, { backgroundColor: theme.primaryLight }]}
        >
          <ThemedText
            style={{ color: theme.primary, fontSize: 16, fontWeight: "700" }}
          >
            {item.name.slice(-2)}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.userName} type="subtitle">
              {item.name}
            </ThemedText>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.role === "teacher"
                      ? theme.primaryLight
                      : theme.backgroundSelected,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.badgeText,
                  {
                    color:
                      item.role === "teacher"
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
                type="smallBold"
              >
                {item.role === "teacher" ? "교직원" : "학생"}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.userEmail} themeColor="textSecondary">
            {item.email}
          </ThemedText>
          <ThemedText style={styles.userPhone} themeColor="textSecondary">
            {item.phone}
          </ThemedText>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.approveButton,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}
        onPress={() => openApprovalModal(item)}
      >
        <SymbolView
          name={{
            ios: "checkmark.seal.fill",
            android: "check_circle",
            web: "check",
          }}
          tintColor="#FFFFFF"
          size={16}
        />
        <ThemedText style={styles.approveButtonText} type="smallBold">
          승인 및 부서 배정
        </ThemedText>
      </Pressable>
    </ShadowCard>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <SymbolView
              name={{ ios: "chevron.left", android: "arrow_back", web: "arrow-left" }}
              tintColor={theme.text}
              size={24}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle} type="subtitle">
            가입 및 단체 승인 관리
          </ThemedText>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={pendingUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <SymbolView
                  name={{
                    ios: "person.crop.circle.badge.exclamationmark",
                    android: "person_search",
                    web: "user-check",
                  }}
                  tintColor={theme.textSecondary}
                  size={48}
                />
                <ThemedText style={styles.emptyText} themeColor="textSecondary">
                  승인 대기 중인 유저가 없습니다.
                </ThemedText>
              </View>
            }
          />
        )}

        {/* Approval and Workspace Assignment Modal */}
        <Modal
          visible={selectedUser !== null}
          transparent
          animationType="fade"
          onRequestClose={closeApprovalModal}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText style={styles.modalTitle} type="subtitle">
                가입 승인 & 단체 지정
              </ThemedText>
              {selectedUser && (
                <ThemedText style={styles.modalSubtitle} themeColor="textSecondary">
                  {selectedUser.name} ({selectedUser.email})님을 승인하고 어떤 단체에 배정할지 선택해 주세요.
                </ThemedText>
              )}

              {/* Workspace Selection List */}
              <View style={styles.workspaceList}>
                {WORKSPACES.map((ws) => {
                  const isSelected = selectedWorkspace === ws;
                  return (
                    <Pressable
                      key={ws}
                      style={[
                        styles.workspaceItem,
                        {
                          borderColor: isSelected ? theme.primary : theme.border,
                          backgroundColor: isSelected
                            ? theme.primaryLight
                            : theme.background,
                        },
                      ]}
                      onPress={() => setSelectedWorkspace(ws)}
                    >
                      <ThemedText
                        style={[
                          styles.workspaceText,
                          isSelected && { color: theme.primary, fontWeight: "700" },
                        ]}
                      >
                        {ws}
                      </ThemedText>
                      {isSelected && (
                        <SymbolView
                          name={{
                            ios: "checkmark.circle.fill",
                            android: "check_circle",
                            web: "check",
                          }}
                          tintColor={theme.primary}
                          size={18}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <Pressable
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { borderColor: theme.border },
                  ]}
                  onPress={closeApprovalModal}
                  disabled={submitting}
                >
                  <ThemedText themeColor="textSecondary">취소</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleApprove}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.confirmButtonText}>
                      승인 완료
                    </ThemedText>
                  )}
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
  headerRightPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  userCard: {
    borderColor: "transparent",
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
  },
  userEmail: {
    fontSize: 12,
  },
  userPhone: {
    fontSize: 12,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 42,
    borderRadius: 12,
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  workspaceList: {
    gap: 8,
    marginVertical: 8,
  },
  workspaceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  workspaceText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
