import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DymsLogo } from "@/components/DymsLogo";
import { ShadowCard } from "@/components/ShadowCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const { login } = useApp();
  const router = useRouter();
  const theme = useTheme();

  const defaultStudentEmail = "deodux@gmail.com";
  const defaultTeacherEmail = "teacher.lee@dyhs.kr";
  const defaultPassword = "123456";

  const [email, setEmail] = useState(defaultStudentEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [loading, setLoading] = useState(false);
  const [roleMode, setRoleMode] = useState<"student" | "teacher">("student");
  const [errorMessage, setErrorMessage] = useState("");

  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleEmailFocus = () => {
    setErrorMessage("");
    if (email === defaultStudentEmail || email === defaultTeacherEmail) {
      setEmail("");
    }
  };

  const handlePasswordFocus = () => {
    setErrorMessage("");
    if (password === defaultPassword) {
      setPassword("");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMessage("이메일 또는 비밀번호를 확인해 주세요.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("로그인 도중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {showInstallBanner && (
        <ShadowCard style={styles.installBanner} padding={12}>
          <View style={styles.installBannerRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemedText style={{ fontWeight: '700', fontSize: 14 }}>덕영고 메신저 DYMS 앱 설치</ThemedText>
              <ThemedText style={{ fontSize: 11 }} themeColor="textSecondary">
                바탕화면에 설치하여 더욱 편리하게 사용하세요.
              </ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.installButton,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
              ]}
              onPress={handleInstallPWA}
            >
              <ThemedText style={styles.installButtonText}>설치</ThemedText>
            </Pressable>
            <Pressable
              style={{ padding: 4, marginLeft: 8 }}
              onPress={() => setShowInstallBanner(false)}
            >
              <ThemedText themeColor="textSecondary" style={{ fontSize: 14, fontWeight: '700' }}>✕</ThemedText>
            </Pressable>
          </View>
        </ShadowCard>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <DymsLogo size={40} showText />
          </View>

          <View style={styles.titleSection}>
            <ThemedText style={styles.title} type="subtitle">
              Login
            </ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              덕영고 교내 메신저 서비스
            </ThemedText>
          </View>

          {/* Role selector tabs */}
          <View style={[styles.roleTabs, { backgroundColor: theme.border }]}>
            <Pressable
              style={[
                styles.roleTab,
                roleMode === "student" && [
                  styles.activeTab,
                  { backgroundColor: theme.card },
                ],
              ]}
              onPress={() => {
                setRoleMode("student");
                setErrorMessage("");
                setEmail(defaultStudentEmail);
                setPassword(defaultPassword);
              }}
            >
              <ThemedText
                style={[
                  styles.roleTabText,
                  roleMode === "student" && {
                    color: theme.primary,
                    fontWeight: "700",
                  },
                ]}
              >
                학생
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.roleTab,
                roleMode === "teacher" && [
                  styles.activeTab,
                  { backgroundColor: theme.card },
                ],
              ]}
              onPress={() => {
                setRoleMode("teacher");
                setErrorMessage("");
                setEmail(defaultTeacherEmail);
                setPassword(defaultPassword);
              }}
            >
              <ThemedText
                style={[
                  styles.roleTabText,
                  roleMode === "teacher" && {
                    color: theme.primary,
                    fontWeight: "700",
                  },
                ]}
              >
                교직원
              </ThemedText>
            </Pressable>
          </View>

          <ShadowCard style={styles.card} padding={20}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel} type="smallBold">
                이메일
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                onFocus={handleEmailFocus}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel} type="smallBold">
                비밀번호
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                onFocus={handlePasswordFocus}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {errorMessage ? (
              <ThemedText style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            ) : null}

            <View style={styles.linksRow}>
              <Pressable onPress={() => router.push("/signup")}>
                <ThemedText style={styles.linkText} type="small">
                  회원가입
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => router.push("/find-auth")}>
                <ThemedText
                  style={styles.linkText}
                  type="small"
                  themeColor="textSecondary"
                >
                  아이디 · 비밀번호 찾기
                </ThemedText>
              </Pressable>
            </View>
          </ShadowCard>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText style={styles.loginButtonText} type="default">
              {loading ? "로그인 중..." : "로그인"}
            </ThemedText>
          </Pressable>
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
    alignItems: "center",
    marginBottom: 32,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  roleTabs: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  roleTab: {
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
  roleTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  linkText: {
    fontSize: 13,
  },
  loginButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  installBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any
    })
  },
  installBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  installButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
