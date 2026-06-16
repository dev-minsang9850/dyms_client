import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from '@/components/SymbolView';
import { ShadowCard } from '@/components/ShadowCard';
import { api } from '@/lib/api';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, messages, sendMessage, typingStatus, user, loadMessages, setActiveChatId } = useApp();
  const theme = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const chat = chats.find((c) => c.id === id);
  const chatMessages = messages[id || ''] || [];
  const activeTypingUser = typingStatus[id || ''] || null;

  // Votes & Events states
  const [votes, setVotes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Modal control states
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // New vote states
  const [voteTitle, setVoteTitle] = useState("");
  const [voteOptions, setVoteOptions] = useState(["", ""]);

  // New event states
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showStartNotification, setShowStartNotification] = useState(false);

  // Load votes/events
  const fetchVotesAndEvents = async () => {
    if (!id) return;
    try {
      const [votesRes, eventsRes] = await Promise.all([
        api.get(`/chats/${id}/votes`),
        api.get(`/chats/${id}/events`),
      ]);
      setVotes(votesRes.data);
      setEvents(eventsRes.data);
    } catch (e) {
      console.warn("fetchVotesAndEvents error", e);
    }
  };

  // Load messages
  const fetchMessages = async () => {
    if (!id) return;
    try {
      await loadMessages(id);
    } catch (e) {
      console.warn("fetchMessages error", e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll messages every 3 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (id) {
      setActiveChatId(id);
    }
    return () => {
      setActiveChatId(null);
    };
  }, [id]);

  useEffect(() => {
    fetchVotesAndEvents();
    const interval = setInterval(fetchVotesAndEvents, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Vote interactions
  const handleVote = async (voteId: string, optionIndex: number) => {
    try {
      await api.post(`/chats/${id}/votes/${voteId}/participate`, { optionIndex });
      Alert.alert("성공", "투표에 참여했습니다.");
      fetchVotesAndEvents();
    } catch (e: any) {
      Alert.alert("오류", e.response?.data?.message || "투표 참여 실패");
    }
  };

  const handleCloseVote = async (voteId: string) => {
    try {
      await api.patch(`/chats/${id}/votes/${voteId}/close`);
      Alert.alert("성공", "투표를 마감했습니다.");
      fetchVotesAndEvents();
    } catch (e: any) {
      Alert.alert("오류", e.response?.data?.message || "투표 마감 실패");
    }
  };

  const handleCreateVote = async () => {
    const cleanOpts = voteOptions.filter((o) => o.trim() !== "");
    if (!voteTitle || cleanOpts.length < 2) {
      Alert.alert("경고", "제목과 최소 2개 이상의 투표 항목을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/chats/${id}/votes`, { title: voteTitle, options: cleanOpts });
      setShowVoteModal(false);
      setVoteTitle("");
      setVoteOptions(["", ""]);
      fetchVotesAndEvents();
    } catch (e) {
      Alert.alert("오류", "투표 개설 실패");
    } finally {
      setSubmitting(false);
    }
  };

  // Event interaction
  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate) {
      Alert.alert("경고", "제목과 일시를 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/chats/${id}/events`, {
        title: eventTitle,
        description: eventDesc,
        eventDate,
      });
      setShowEventModal(false);
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      fetchVotesAndEvents();
    } catch (e) {
      Alert.alert("오류", "일정 개설 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const addVoteOption = () => {
    setVoteOptions([...voteOptions, ""]);
  };

  const removeVoteOption = (index: number) => {
    if (voteOptions.length <= 2) return;
    setVoteOptions(voteOptions.filter((_, i) => i !== index));
  };

  const updateVoteOptionText = (text: string, index: number) => {
    const updated = [...voteOptions];
    updated[index] = text;
    setVoteOptions(updated);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeTypingUser]);

  if (!chat) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>채팅방을 찾을 수 없습니다.</ThemedText>
        <Pressable onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/chats');
          }
        }} style={[styles.backBtn, { backgroundColor: theme.primary }]}>
          <ThemedText style={{ color: '#FFFFFF' }}>뒤로 가기</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const handleSend = (text: string) => {
    if (!id) return;
    if (chatMessages.length === 0) {
      setShowStartNotification(true);
      setTimeout(() => {
        setShowStartNotification(false);
      }, 3000);
    }
    sendMessage(id, text);
  };

  const handleSendFile = async (uri: string, name: string, mimeType: string, type: 'image' | 'video' | 'file') => {
    if (!id) return;
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name,
        type: mimeType,
      } as any);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url } = res.data;
      await sendMessage(id, `[파일 전송] ${name}`, url, name, type);
    } catch (e: any) {
      console.warn("File upload error", e);
      Alert.alert("업로드 실패", e.response?.data?.message || "파일 업로드 중 오류가 발생했습니다.");
    }
  };

  const isTeacherOrHead =
    user &&
    (user.role === 'teacher' || user.position === 'head' || user.position === 'deputy');

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <Pressable style={styles.backButton} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/chats');
          }
        }}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'chevron-left' }}
            tintColor={theme.text}
            size={24}
          />
        </Pressable>

        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle} type="smallBold" numberOfLines={1}>
            {chat.name}
          </ThemedText>
          {chat.type === 'group' && (
            <ThemedText style={styles.memberCount} themeColor="textSecondary">
              멤버 {chat.members.length}명
            </ThemedText>
          )}
        </View>

        {chat.type === 'group' && isTeacherOrHead && (
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => setShowVoteModal(true)}>
              <SymbolView
                name={{ ios: 'checkmark.circle.fill', android: 'poll', web: 'check' }}
                tintColor={theme.primary}
                size={22}
              />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => setShowEventModal(true)}>
              <SymbolView
                name={{ ios: 'calendar.badge.plus', android: 'calendar_today', web: 'calendar' }}
                tintColor={theme.primary}
                size={22}
              />
            </Pressable>
          </View>
        )}
      </View>

      {/* Pinned Votes & Events Slider Panel */}
      {chat.type === 'group' && (votes.length > 0 || events.length > 0) && (
        <View style={[styles.pinnedPanel, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedScrollContent}>
            {votes.map((v) => {
              const totalVotes = Object.keys(v.votes || {}).length;
              const userVoteIdx = user ? v.votes[user.id] : undefined;
              const isCreatorOrStaff =
                user &&
                (v.creatorId === user.id || user.isAdmin || user.role === 'teacher');

              return (
                <ShadowCard key={v.id} style={styles.pinnedCard} padding={12}>
                  <View style={styles.pinnedCardHeader}>
                    <ThemedText style={styles.pinnedTitle} numberOfLines={1}>{v.title}</ThemedText>
                    {v.closed ? (
                      <View style={[styles.statusBadge, { backgroundColor: theme.border }]}>
                        <ThemedText style={styles.badgeTextClosed}>마감됨</ThemedText>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: theme.primaryLight }]}>
                        <ThemedText style={[styles.badgeTextActive, { color: theme.primary }]}>진행중</ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.voteOptionsList}>
                    {v.options.map((opt: string, idx: number) => {
                      const count = Object.values(v.votes || {}).filter((val) => val === idx).length;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const hasVoted = userVoteIdx === idx;

                      return (
                        <Pressable
                          key={idx}
                          disabled={v.closed}
                          style={[
                            styles.voteOptionBtn,
                            { backgroundColor: theme.background, borderColor: theme.border },
                            hasVoted && { borderColor: theme.primary, borderWidth: 1.2 },
                          ]}
                          onPress={() => handleVote(v.id, idx)}
                        >
                          <View style={[styles.voteProgressFill, { width: `${percent}%`, backgroundColor: theme.primaryLight }]} />
                          <ThemedText style={[styles.voteOptionText, hasVoted && { fontWeight: '700' }]}>{opt}</ThemedText>
                          <ThemedText style={styles.voteOptionCount} themeColor="textSecondary">
                            {count}표 ({percent}%)
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.pinnedCardFooter}>
                    <ThemedText style={{ fontSize: 10 }} themeColor="textSecondary">총 {totalVotes}명 투표</ThemedText>
                    {!v.closed && isCreatorOrStaff && (
                      <Pressable onPress={() => handleCloseVote(v.id)}>
                        <ThemedText style={{ color: '#FF3B30', fontSize: 11, fontWeight: '700' }}>마감하기</ThemedText>
                      </Pressable>
                    )}
                  </View>
                </ShadowCard>
              );
            })}

            {events.map((e) => (
              <ShadowCard key={e.id} style={styles.pinnedCard} padding={12}>
                <View style={styles.pinnedCardHeader}>
                  <SymbolView
                    name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar' }}
                    tintColor={theme.primary}
                    size={14}
                  />
                  <ThemedText style={styles.pinnedTitle} numberOfLines={1}>{e.title}</ThemedText>
                </View>
                <ThemedText style={styles.eventDesc} themeColor="textSecondary" numberOfLines={2}>
                  {e.description || '상세 정보가 없습니다.'}
                </ThemedText>
                <View style={{ flex: 1 }} />
                <ThemedText style={[styles.eventDateText, { color: theme.primary }]}>
                  일시: {e.eventDate}
                </ThemedText>
              </ShadowCard>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Top Banner Notification */}
      {showStartNotification && (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={styles.topNotification}>
          <ThemedText style={styles.topNotificationText}>
            대화가 시작되었습니다!
          </ThemedText>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Message List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={scrollToBottom}
        >
          {chatMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMe={msg.senderId === user?.id}
              memberCount={chat.members?.length || 2}
            />
          ))}
        </ScrollView>

        {/* Input Bar */}
        <ChatInput
          onSend={handleSend}
          typingUserName={activeTypingUser}
          chatType={chat.type}
          onSendFile={handleSendFile}
          onOpenVote={() => setShowVoteModal(true)}
          onOpenEvent={() => setShowEventModal(true)}
        />
      </KeyboardAvoidingView>

      {/* Modal: Create Vote */}
      <Modal visible={showVoteModal} transparent animationType="fade" onRequestClose={() => setShowVoteModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle">새 학급 투표 만들기</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="투표 제목을 입력하세요"
              placeholderTextColor={theme.textSecondary}
              value={voteTitle}
              onChangeText={setVoteTitle}
            />

            <ThemedText type="smallBold" style={{ marginTop: 8 }}>투표 항목</ThemedText>
            <ScrollView style={{ maxHeight: 200 }}>
              <View style={{ gap: 8 }}>
                {voteOptions.map((opt, idx) => (
                  <View key={idx} style={styles.optionInputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder={`선택항목 ${idx + 1}`}
                      placeholderTextColor={theme.textSecondary}
                      value={opt}
                      onChangeText={(txt) => updateVoteOptionText(txt, idx)}
                    />
                    {voteOptions.length > 2 && (
                      <Pressable onPress={() => removeVoteOption(idx)} style={styles.optionRemoveBtn}>
                        <ThemedText style={{ color: '#FF3B30', fontWeight: '800' }}>✕</ThemedText>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <Pressable style={[styles.addOptionBtn, { borderColor: theme.border }]} onPress={addVoteOption}>
              <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>+ 항목 추가</ThemedText>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowVoteModal(false)}>
                <ThemedText>취소</ThemedText>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleCreateVote} disabled={submitting}>
                <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>개설</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Modal: Create Event */}
      <Modal visible={showEventModal} transparent animationType="fade" onRequestClose={() => setShowEventModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle">학급 일정 개설</ThemedText>
            <View style={{ gap: 12 }}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="일정 제목"
                placeholderTextColor={theme.textSecondary}
                value={eventTitle}
                onChangeText={setEventTitle}
              />
              <TextInput
                style={[styles.input, { height: 70, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="상세 설명 (선택)"
                placeholderTextColor={theme.textSecondary}
                value={eventDesc}
                onChangeText={setEventDesc}
                multiline
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="일시 (예: 2026-06-15 13:00)"
                placeholderTextColor={theme.textSecondary}
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowEventModal(false)}>
                <ThemedText>취소</ThemedText>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleCreateEvent} disabled={submitting}>
                <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>추가</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 16,
  },
  memberCount: {
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    padding: 6,
  },
  pinnedPanel: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  pinnedScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pinnedCard: {
    width: 200,
    height: 120,
    borderColor: 'transparent',
    justifyContent: 'flex-start',
  },
  pinnedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  pinnedTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeTextClosed: {
    fontSize: 8,
  },
  badgeTextActive: {
    fontSize: 8,
    fontWeight: '700',
  },
  voteOptionsList: {
    gap: 4,
    marginVertical: 4,
  },
  voteOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  voteProgressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  voteOptionText: {
    fontSize: 10,
    zIndex: 2,
    flex: 1,
  },
  voteOptionCount: {
    fontSize: 9,
    zIndex: 2,
  },
  pinnedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  eventDesc: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  eventDateText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  messageScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionRemoveBtn: {
    padding: 8,
  },
  addOptionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNotification: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 80,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  topNotificationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
