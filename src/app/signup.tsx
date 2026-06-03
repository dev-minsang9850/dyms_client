import React, { useState } from "react";
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
import { SymbolView } from "expo-symbols";

export default function SignUpScreen() {
  const { registerUser } = useApp();
  const router = useRouter();
  const theme = useTheme();

  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  const handleNextStep = () => {
    if (step === 1) {
      if (!agreed) return;
      setStep(2);
    } else if (step === 2) {
      if (!email || !password || !confirmPassword || !name || !phone) return;
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async () => {
    const ok = await registerUser({
      email,
      password,
      name,
      phone,
      role,
    });

    if (ok) {
      router.replace("/(tabs)");
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
            <DymsLogo size={36} showText />
          </View>

          {step === 1 && (
            <View style={styles.stepContainer}>
              <ThemedText style={styles.title} type="subtitle">
                Register
              </ThemedText>

              <ShadowCard style={styles.card} padding={16}>
                <ThemedText style={styles.termsTitle} type="smallBold">
                  서비스 이용약관 동의
                </ThemedText>
                <ScrollView style={styles.termsBox}>
                  <ThemedText
                    style={styles.termsText}
                    type="small"
                    themeColor="textSecondary"
                  >
                    본 약관은 덕영고등학교 교내 메신저 서비스(DYMS)의 이용 조건
                    및 절차에 관한 사항을 규정합니다.{"\n\n"}
                    1. 이용자는 교내 학생 및 교직원에 한하며, 학교 전자 우편을
                    통한 인증이 요구될 수 있습니다.{"\n"}
                    2. 메신저 내에서 타인을 비방하거나 유해한 정보를 유포하는
                    경우, 교내 규정에 따라 서비스 이용이 정지될 수 있습니다.
                    {"\n"}
                    3. 개인정보 보호법에 의거하여 가입 시 입력된 이메일 및
                    전화번호는 서비스 운영 이외의 용도로 사용되지 않으며
                    암호화되어 안전하게 관리됩니다.
                  </ThemedText>
                </ScrollView>

                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => setAgreed(!agreed)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: theme.primary },
                      agreed && { backgroundColor: theme.primary },
                    ]}
                  >
                    {agreed && (
                      <SymbolView
                        name={{
                          ios: "checkmark",
                          android: "check",
                          web: "check",
                        }}
                        tintColor="#FFFFFF"
                        size={12}
                      />
                    )}
                  </View>
                  <ThemedText type="smallBold">동의하십니까?</ThemedText>
                </Pressable>
              </ShadowCard>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  agreed
                    ? { backgroundColor: theme.primary }
                    : styles.buttonDisabled,
                  pressed && agreed && styles.pressed,
                ]}
                onPress={handleNextStep}
                disabled={!agreed}
              >
                <ThemedText style={styles.buttonText} type="default">
                  다음
                </ThemedText>
              </Pressable>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <ThemedText style={styles.title} type="subtitle">
                Register
              </ThemedText>

              {/* Role selector tabs */}
              <View
                style={[styles.roleTabs, { backgroundColor: theme.border }]}
              >
                <Pressable
                  style={[
                    styles.roleTab,
                    role === "student" && [
                      styles.activeTab,
                      { backgroundColor: theme.card },
                    ],
                  ]}
                  onPress={() => setRole("student")}
                >
                  <ThemedText
                    style={[
                      styles.roleTabText,
                      role === "student" && {
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
                    role === "teacher" && [
                      styles.activeTab,
                      { backgroundColor: theme.card },
                    ],
                  ]}
                  onPress={() => setRole("teacher")}
                >
                  <ThemedText
                    style={[
                      styles.roleTabText,
                      role === "teacher" && {
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
                    placeholder="example@gmail.com"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel} type="smallBold">
                    패스워드
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
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel} type="smallBold">
                    패스워드 확인
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
                    placeholder="비밀번호를 한번 더 입력하세요"
                    placeholderTextColor={theme.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel} type="smallBold">
                    이름
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
                    placeholder="실명을 입력하세요"
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel} type="smallBold">
                    전화번호
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
                    placeholder="010-0000-0000"
                    placeholderTextColor={theme.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </ShadowCard>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.primary },
                  pressed && styles.pressed,
                ]}
                onPress={handleNextStep}
              >
                <ThemedText style={styles.buttonText} type="default">
                  다음
                </ThemedText>
              </Pressable>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <ShadowCard
                style={[styles.card, styles.successCard]}
                padding={30}
              >
                <View
                  style={[
                    styles.successIconWrapper,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "party.popper.fill",
                      android: "celebration",
                      web: "award",
                    }}
                    tintColor={theme.primary}
                    size={40}
                  />
                </View>
                <ThemedText style={styles.successTitle} type="subtitle">
                  환영합니다!
                </ThemedText>
                <ThemedText
                  style={styles.successSubtitle}
                  themeColor="textSecondary"
                >
                  회원가입이 완료되었어요!
                </ThemedText>
              </ShadowCard>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.primary },
                  pressed && styles.pressed,
                ]}
                onPress={handleFinish}
              >
                <ThemedText style={styles.buttonText} type="default">
                  확인
                </ThemedText>
              </Pressable>
            </View>
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
    alignItems: "center",
    marginBottom: 24,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  termsBox: {
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FAFBFD",
  },
  termsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
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
  successCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
  },
  button: {
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
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
