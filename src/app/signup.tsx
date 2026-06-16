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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DymsLogo } from "@/components/DymsLogo";
import { ShadowCard } from "@/components/ShadowCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "@/components/SymbolView";

export default function SignUpScreen() {
  const { registerUser } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: "student" | "teacher" }>();
  const theme = useTheme();

  const [role, setRole] = useState<"student" | "teacher">(params.role || "student");
  const [step, setStep] = useState(params.role ? 2 : 1);
  const [agreed, setAgreed] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [classVal, setClassVal] = useState("");
  const [number, setNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!agreed) return;
      setStep(3);
    } else if (step === 3) {
      if (!email || !password || !confirmPassword || !name || !phone) {
        Alert.alert("입력 오류", "필수 입력 정보를 모두 기입해 주세요.");
        return;
      }
      const nameRegex = /^[a-zA-Z가-힣\s]+$/;
      if (!nameRegex.test(name.trim())) {
        Alert.alert("입력 오류", "이름에는 특수기호나 숫자가 포함될 수 없습니다.");
        return;
      }
      const phoneDigits = phone.replace(/\D/g, '');
      if (!/^010\d{7,8}$/.test(phoneDigits)) {
        Alert.alert("입력 오류", "유효하지 않은 전화번호 형식입니다. 010으로 시작하는 10~11자리 숫자여야 합니다.");
        return;
      }
      if (role === "student" && (!grade || !classVal || !number)) {
        Alert.alert("입력 오류", "학년, 반, 번호를 모두 입력해 주세요.");
        return;
      }
      if (role === "student") {
        const g = parseInt(grade, 10);
        const c = parseInt(classVal, 10);
        const n = parseInt(number, 10);
        if (isNaN(g) || g < 1 || g > 3) {
          Alert.alert("입력 오류", "학년은 1에서 3 사이의 숫자만 가능합니다.");
          return;
        }
        if (isNaN(c) || c < 1 || c > 9) {
          Alert.alert("입력 오류", "반은 1에서 9 사이의 숫자만 가능합니다.");
          return;
        }
        if (isNaN(n) || n < 1 || n > 99) {
          Alert.alert("입력 오류", "번호는 1에서 99 사이의 숫자만 가능합니다.");
          return;
        }
      }
      if (password !== confirmPassword) {
        Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
        return;
      }

      setSubmitting(true);
      const ok = await registerUser({
        email,
        password,
        name,
        phone,
        role,
        grade: role === "student" ? parseInt(grade, 10) : undefined,
        class: role === "student" ? parseInt(classVal, 10) : undefined,
        number: role === "student" ? parseInt(number, 10) : undefined,
      });
      setSubmitting(false);

      if (ok) {
        setStep(4);
      } else {
        Alert.alert("오류", "회원가입 신청에 실패했습니다. 이메일 중복 등을 확인해 주세요.");
      }
    }
  };

  const handlePrevStep = () => {
    if (step === 2 && params.role) {
      router.back();
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    router.replace("/login");
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
                회원가입 유형 선택
              </ThemedText>
              
              <View style={styles.choiceRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.choiceCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    role === "student" && { borderColor: theme.primary, borderWidth: 1.5 },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setRole("student");
                    setStep(2);
                  }}
                >
                  <View style={[styles.choiceIconWrapper, { backgroundColor: theme.primaryLight }]}>
                    <SymbolView
                      name={{
                        ios: "school.fill",
                        android: "school",
                        web: "school",
                      }}
                      tintColor={theme.primary}
                      size={36}
                    />
                  </View>
                  <ThemedText style={styles.choiceTitle} type="default">
                    학생 회원가입
                  </ThemedText>
                  <ThemedText style={styles.choiceDesc} type="small" themeColor="textSecondary">
                    덕영고 학생 계정으로 가입하여 시간표 및 급식 확인, 채팅 기능을 이용합니다.
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.choiceCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    role === "teacher" && { borderColor: theme.primary, borderWidth: 1.5 },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setRole("teacher");
                    setStep(2);
                  }}
                >
                  <View style={[styles.choiceIconWrapper, { backgroundColor: theme.primaryLight }]}>
                    <SymbolView
                      name={{
                        ios: "person.text.rectangle.fill",
                        android: "contact_page",
                        web: "person",
                      }}
                      tintColor={theme.primary}
                      size={36}
                    />
                  </View>
                  <ThemedText style={styles.choiceTitle} type="default">
                    교직원 회원가입
                  </ThemedText>
                  <ThemedText style={styles.choiceDesc} type="small" themeColor="textSecondary">
                    교직원용 계정으로 가입하여 공지사항 작성 및 학생 관리 기능을 지원합니다.
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <ThemedText style={styles.title} type="subtitle">
                이용약관 동의
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

              <View style={styles.buttonRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.prevButton,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    pressed && styles.pressed,
                  ]}
                  onPress={handlePrevStep}
                >
                  <ThemedText type="default" style={{ fontWeight: '700' }} themeColor="textSecondary">이전</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.nextButton,
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
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <ThemedText style={styles.title} type="subtitle">
                {role === "student" ? "학생 정보 입력" : "교직원 정보 입력"}
              </ThemedText>

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

                {role === "student" && (
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.inputLabel} type="smallBold">
                        학년
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
                        placeholder="학년"
                        placeholderTextColor={theme.textSecondary}
                        value={grade}
                        onChangeText={(txt) => setGrade(txt.replace(/[^0-9]/g, ''))}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.inputLabel} type="smallBold">
                        반
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
                        placeholder="반"
                        placeholderTextColor={theme.textSecondary}
                        value={classVal}
                        onChangeText={(txt) => setClassVal(txt.replace(/[^0-9]/g, ''))}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.inputLabel} type="smallBold">
                        번호
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
                        placeholder="번호"
                        placeholderTextColor={theme.textSecondary}
                        value={number}
                        onChangeText={(txt) => setNumber(txt.replace(/[^0-9]/g, ''))}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                )}

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
                    onChangeText={(txt) => setPhone(txt.replace(/[^0-9-]/g, ''))}
                    keyboardType="phone-pad"
                  />
                </View>
              </ShadowCard>

              <View style={styles.buttonRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.prevButton,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    pressed && styles.pressed,
                  ]}
                  onPress={handlePrevStep}
                  disabled={submitting}
                >
                  <ThemedText type="default" style={{ fontWeight: '700' }} themeColor="textSecondary">이전</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.nextButton,
                    { backgroundColor: theme.primary },
                    pressed && !submitting && styles.pressed,
                  ]}
                  onPress={handleNextStep}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={styles.buttonText} type="default">
                      가입 완료
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {step === 4 && (
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
                  style={[styles.successSubtitle, { textAlign: 'center', lineHeight: 22 }]}
                  themeColor="textSecondary"
                >
                  회원가입 신청이 완료되었습니다!{"\n"}관리자의 승인 후 로그인이 가능합니다.
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
  choiceRow: {
    gap: 16,
    marginBottom: 24,
  },
  choiceCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
    }),
  },
  choiceIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  choiceDesc: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  prevButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  nextButton: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
