import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NoticeWidget } from '@/components/NoticeWidget';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function BoardScreen() {
  const { notices, user, createNotice } = useApp();
  const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('공지');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.isAdmin;

  const handleCreateNotice = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    const success = await createNotice(title, content, tag);
    setIsSubmitting(false);
    if (success) {
      setModalVisible(false);
      setTitle('');
      setContent('');
      setTag('공지');
    } else {
      Alert.alert('오류', '공지사항 등록에 실패했습니다.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'stretch' }}>
      <ThemedView style={{ flex: 1, width: '100%', backgroundColor: 'transparent' }}>
        {/* Glass Header */}
        <BlurView 
          intensity={80} 
          tint={theme.mode === 'dark' ? 'dark' : 'light'}
          style={[
            styles.header, 
            { 
              backgroundColor: theme.mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              borderBottomColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
            }
          ]}
        >
          <ThemedText style={styles.headerTitle} type="subtitle">
            보드
          </ThemedText>
        </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introContainer}>
          <ThemedText style={styles.introTitle} type="smallBold">
            덕영고 교내 공지사항 피드
          </ThemedText>
          <ThemedText style={styles.introText} themeColor="textSecondary">
            가정통신문, 지필평가 일정, 교내 행사 등 중요한 학교의 새 소식을 전해드립니다.
          </ThemedText>
        </View>

        <View style={styles.list}>
          {notices.map((notice) => (
            <NoticeWidget key={notice.id} notice={notice} />
          ))}
        </View>
      </ScrollView>

      {/* FAB for Teachers/Admins */}
      {isTeacherOrAdmin && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.tint }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Write Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent presentationStyle="overFullScreen">
        <BlurView intensity={40} style={{ flex: 1, justifyContent: 'center', padding: Platform.OS === 'web' ? 40 : 0 }}>
          <ThemedView style={[styles.modalContainer, Platform.OS === 'web' && { maxHeight: 800, borderRadius: 24, overflow: 'hidden', alignSelf: 'center', width: '100%', maxWidth: 800, borderWidth: 1, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border, backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 16 }}>취소</ThemedText>
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">공지사항 작성</ThemedText>
              <TouchableOpacity onPress={handleCreateNotice} disabled={isSubmitting}>
                <ThemedText style={{ color: theme.primary, fontSize: 16, opacity: isSubmitting ? 0.5 : 1, fontWeight: 'bold' }}>
                  등록
                </ThemedText>
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.tagSelector}>
                  {['공지', '긴급', '행사'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.tagButton,
                        { backgroundColor: tag === t ? theme.primary : theme.card, borderColor: tag === t ? theme.primary : theme.border }
                      ]}
                      onPress={() => setTag(t)}
                    >
                      <ThemedText style={{ color: tag === t ? '#fff' : theme.text, fontWeight: tag === t ? '700' : '400' }}>{t}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.inputTitle, { color: theme.text, borderColor: theme.border, backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 }]}
                  placeholder="제목을 입력하세요"
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.inputContent, { color: theme.text, borderColor: theme.border, backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 }]}
                  placeholder="내용을 입력하세요"
                  placeholderTextColor={theme.textSecondary}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </ThemedView>
        </BlurView>
      </Modal>
      </ThemedView>
    </View>
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
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  introContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  introTitle: {
    fontSize: 16,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 16,
    gap: 4,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 108 : 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalContent: {
    padding: 16,
    gap: 16,
  },
  tagSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  inputContent: {
    fontSize: 16,
    minHeight: 300,
    paddingTop: 12,
    lineHeight: 24,
  },
});
