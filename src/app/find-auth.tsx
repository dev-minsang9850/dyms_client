import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DymsLogo } from "@/components/DymsLogo";
import { ShadowCard } from "@/components/ShadowCard";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "@/components/SymbolView";
import { api } from "@/lib/api";

export default function FindAuthScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<"id" | "pw">("id");

  // Find ID states
  const [idName, setIdName] = useState("");
  const [idPhone, setIdPhone] = useState("");
  const [foundEmail, setFoundEmail] = useState<string | null>(null);

  // Find PW states
  const [pwEmail, setPwEmail] = useState("");
  const [pwName, setPwName] = useState("");
  const [pwPhone, setPwPhone] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleFindId = async () => {
    if (!idName || !idPhone) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/find-id", { name: idName, phone: idPhone });
      if (res.data.email) {
        setFoundEmail(res.data.email);
      } else {
        showAlert("알림", "입력하신 정보와 일치하는 계정이 존재하지 않습니다.");
      }
    } catch (err: any) {
      console.error(err);
      showAlert("오류", err.response?.data?.message || "정보를 조회하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindPassword = async () => {
    if (!pwEmail || !pwName || !pwPhone) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/find-password", {
        email: pwEmail,
        name: pwName,
        phone: pwPhone,
      });
      if (res.data.tempPassword) {
        setTempPassword(res.data.tempPassword);
      } else {
        showAlert("알림", "입력하신 정보와 일치하는 계정이 존재하지 않습니다.");
      }
    } catch (err: any) {
      console.error(err);
      showAlert("오류", err.response?.data?.message || "임시 비밀번호 발급에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}
            >
              <SymbolView
                name="chevron.left"
                tintColor={theme.text}
                size={24}
              />
            </Pressable>
            <DymsLogo size={32} showText />
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.titleSection}>
            <ThemedText style={styles.title} type="subtitle">
              계정 찾기
            </ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              아이디 확인 및 임시 비밀번호 발급
            </ThemedText>
          </View>

          {/* Find ID / PW tabs */}
          <View style={[styles.tabs, { backgroundColor: theme.border }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "id" && [
                  styles.activeTab,
                  { backgroundColor: theme.card },
                ],
              ]}
              onPress={() => {
                setActiveTab("id");
                setFoundEmail(null);
                setTempPassword(null);
              }}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "id" && {
                    color: theme.primary,
                    fontWeight: "700",
                  },
                ]}
              >
                아이디(이메일) 찾기
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "pw" && [
                  styles.activeTab,
                  { backgroundColor: theme.card },
                ],
              ]}
              onPress={() => {
                setActiveTab("pw");
                setFoundEmail(null);
                setTempPassword(null);
              }}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "pw" && {
                    color: theme.primary,
                    fontWeight: "700",
                  },
                ]}
              >
                비밀번호 찾기
              </ThemedText>
            </Pressable>
          </View>

          {activeTab === "id" ? (
            <ShadowCard style={styles.card} padding={20}>
              {foundEmail ? (
                <View style={styles.resultContainer}>
                  <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                    <SymbolView
                      name={{ ios: "person.crop.circle.fill", android: "account_circle", web: "user" }}
                      tintColor={theme.primary}
                      size={40}
                    />
                  </View>
                  <ThemedText style={styles.resultLabel} themeColor="textSecondary">
                    찾으시는 아이디는 다음과 같습니다.
                  </ThemedText>
                  <ThemedText style={styles.resultValue} type="subtitle">
                    {foundEmail}
                  </ThemedText>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      { backgroundColor: theme.primary },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => router.replace("/login")}
                  >
                    <ThemedText style={styles.confirmButtonText}>로그인 화면으로</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="smallBold">이름</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="가입하신 실명을 입력하세요"
                      placeholderTextColor={theme.textSecondary}
                      value={idName}
                      onChangeText={setIdName}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="smallBold">전화번호</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="010-0000-0000"
                      placeholderTextColor={theme.textSecondary}
                      value={idPhone}
                      onChangeText={setIdPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: theme.primary },
                      pressed && styles.pressed,
                    ]}
                    onPress={handleFindId}
                    disabled={loading}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {loading ? "조회 중..." : "아이디 찾기"}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </ShadowCard>
          ) : (
            <ShadowCard style={styles.card} padding={20}>
              {tempPassword ? (
                <View style={styles.resultContainer}>
                  <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                    <SymbolView
                      name={{ ios: "lock.fill", android: "lock", web: "lock" }}
                      tintColor={theme.primary}
                      size={40}
                    />
                  </View>
                  <ThemedText style={styles.resultLabel} themeColor="textSecondary">
                    임시 비밀번호가 발급되었습니다.
                  </ThemedText>
                  <ThemedText style={[styles.resultValue, { letterSpacing: 1, color: "#FF3B30", fontWeight: "800" }]} type="subtitle">
                    {tempPassword}
                  </ThemedText>
                  <ThemedText style={styles.warningText} themeColor="textSecondary">
                    로그인 후 즉시 마이페이지(메뉴)에서 비밀번호를 재변경해 주세요.
                  </ThemedText>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      { backgroundColor: theme.primary },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => router.replace("/login")}
                  >
                    <ThemedText style={styles.confirmButtonText}>로그인 화면으로</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="smallBold">이메일(아이디)</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="아이디(이메일)를 입력하세요"
                      placeholderTextColor={theme.textSecondary}
                      value={pwEmail}
                      onChangeText={setPwEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="smallBold">이름</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="실명을 입력하세요"
                      placeholderTextColor={theme.textSecondary}
                      value={pwName}
                      onChangeText={setPwName}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="smallBold">전화번호</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="010-0000-0000"
                      placeholderTextColor={theme.textSecondary}
                      value={pwPhone}
                      onChangeText={setPwPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: theme.primary },
                      pressed && styles.pressed,
                    ]}
                    onPress={handleFindPassword}
                    disabled={loading}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {loading ? "발급 중..." : "임시 비밀번호 발급"}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </ShadowCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  activeTab: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  actionButton: {
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 12,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
  },
  resultContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  warningText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginTop: -4,
  },
});
