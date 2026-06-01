import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'teacher';
  avatar?: string;
  statusMessage?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerEmail: string;
}

export interface Friend {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  detail: string;
  status: 'online' | 'offline' | 'in-class';
  avatar?: string;
  statusMessage?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher';
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group';
  members: string[]; // Friend IDs
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Meal {
  date: string;
  menu: string[];
  calories: string;
}

export interface Notice {
  id: string;
  tag: '긴급' | '공지' | '행사';
  title: string;
  date: string;
  content: string;
}

interface AppContextType {
  user: User | null;
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  friends: Friend[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  meals: Meal[];
  timetable: string[];
  notices: Notice[];
  typingStatus: { [chatId: string]: string | null }; // chat ID -> typing user's name
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id'>) => Promise<void>;
  selectWorkspace: (wsId: string) => void;
  createWorkspace: (name: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  createChatRoom: (memberIds: string[], name?: string) => string;
  updateStatus: (statusMessage: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to format timestamps
const getFormattedTime = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${ampm} ${hours}:${minutes}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [typingStatus, setTypingStatus] = useState<{ [chatId: string]: string | null }>({});

  // 1. Mock Meals
  const meals: Meal[] = [
    {
      date: '오늘의 급식',
      menu: ['혼합잡곡밥', '쇠고기미역국', '돈육메추리알조림', '오징어도라지무침', '배추김치', '방울토마토'],
      calories: '782 kcal',
    },
    {
      date: '내일의 급식',
      menu: ['기장밥', '맑은순두부국', '안동찜닭', '감자채볶음', '총각김치', '바나나'],
      calories: '810 kcal',
    },
    {
      date: '모레의 급식',
      menu: ['참치마요덮밥', '팽이버섯된장국', '국물떡볶이', '모둠김말이튀김', '배추김치', '요구르트'],
      calories: '895 kcal',
    },
  ];

  // 2. Mock Timetable
  const timetable = [
    '1교시: 수학 (이지은T)',
    '2교시: 영어 (김민정T)',
    '3교시: 체육 (홍길동T)',
    '4교시: 국어 (박재상T)',
    '5교시: 과학 (최현우T)',
    '6교시: 프로그래밍실습 (이민상T)',
    '7교시: 자율학습',
  ];

  // 3. Mock Notices (Board)
  const notices: Notice[] = [
    {
      id: 'n-1',
      tag: '긴급',
      title: '2026학년도 1학기 기말 지필평가 일정 안내',
      date: '2026.06.01',
      content: '6월 22일(월)부터 25일(목)까지 1학기 기말고사가 실시됩니다. 과목별 평가 범위는 학급 게시판 및 학교 홈페이지 공지사항을 확인하시기 바랍니다. 모두 좋은 결과 있기를 바랍니다!',
    },
    {
      id: 'n-2',
      tag: '공지',
      title: '덕영고 메신저 앱(DYMS) 시범 운영 안내',
      date: '2026.05.28',
      content: '교내 커뮤니케이션 활성화를 위해 자체 개발 메신저 DYMS의 베타 서비스를 시범 운영합니다. 친구 검색, 채팅방 개설, 실시간 시간표 및 급식 확인 기능을 사용하실 수 있습니다. 버그 제보는 메뉴 탭의 피드백을 이용해주세요.',
    },
    {
      id: 'n-3',
      tag: '행사',
      title: '교내 소프트웨어 프로그래밍 경진대회 안내',
      date: '2026.05.25',
      content: '2026년도 소프트웨어 인재 육성을 위한 교내 프로그래밍 경진대회가 개최됩니다. 언어는 C, Java, Python 중 선택 가능합니다. 참가 대상은 전 학년 학생이며, 참가를 원하는 학생은 6월 10일까지 신청해 주세요.',
    },
  ];

  // Initialize workspaces and friends
  useEffect(() => {
    // Initial friends data
    setFriends([
      {
        id: 'f-1',
        name: '김도현',
        role: 'teacher',
        detail: '교사 | 정보보안부',
        status: 'online',
        statusMessage: '문의사항은 메신저로 남겨주세요.',
      },
      {
        id: 'f-2',
        name: '박지성',
        role: 'student',
        detail: '학생 | 2학년 3반',
        status: 'in-class',
        statusMessage: '열공 중 🔥',
      },
      {
        id: 'f-3',
        name: '이지은',
        role: 'teacher',
        detail: '교사 | 수학과 (2-3 담임)',
        status: 'offline',
        statusMessage: '수업 중에는 답변이 늦어질 수 있습니다.',
      },
      {
        id: 'f-4',
        name: '최유진',
        role: 'student',
        detail: '학생 | 2학년 3반',
        status: 'online',
        statusMessage: '점심 뭐 나오지? 😋',
      },
      {
        id: 'f-5',
        name: '정우성',
        role: 'student',
        detail: '학생 | 2학년 1반',
        status: 'offline',
        statusMessage: '자리 비움',
      },
    ]);

    // Initial chats
    setChats([
      {
        id: 'c-1',
        name: '김도현 선생님',
        type: 'direct',
        members: ['f-1'],
        lastMessage: '네, 제출 기한은 금요일 저녁까지입니다.',
        lastMessageTime: '오전 11:30',
        unreadCount: 1,
      },
      {
        id: 'c-2',
        name: '2학년 3반 공식 단톡방',
        type: 'group',
        members: ['f-2', 'f-3', 'f-4'],
        lastMessage: '이지은T: 오늘 종례 시간 5분 단축됩니다.',
        lastMessageTime: '오후 3:15',
        unreadCount: 0,
      },
    ]);

    // Initial messages
    setMessages({
      'c-1': [
        {
          id: 'm1',
          senderId: 'f-1',
          senderName: '김도현',
          senderRole: 'teacher',
          content: '안녕하세요, 도현 학생. 과제 관련 문의인가요?',
          timestamp: '오전 11:20',
        },
        {
          id: 'm2',
          senderId: 'user',
          senderName: '이민상',
          senderRole: 'student',
          content: '네 선생님! 과제 제출 기한이 언제까지인지 여쭤보고 싶습니다.',
          timestamp: '오전 11:25',
        },
        {
          id: 'm3',
          senderId: 'f-1',
          senderName: '김도현',
          senderRole: 'teacher',
          content: '네, 제출 기한은 금요일 저녁까지입니다.',
          timestamp: '오전 11:30',
        },
      ],
      'c-2': [
        {
          id: 'm4',
          senderId: 'f-3',
          senderName: '이지은',
          senderRole: 'teacher',
          content: '내일 수학 교과서 2단원 준비물 챙겨오세요.',
          timestamp: '오후 2:00',
        },
        {
          id: 'm5',
          senderId: 'f-2',
          senderName: '박지성',
          senderRole: 'student',
          content: '네 알겠습니다!',
          timestamp: '오후 2:05',
        },
        {
          id: 'm6',
          senderId: 'f-3',
          senderName: '이지은',
          senderRole: 'teacher',
          content: '오늘 종례 시간 5분 단축됩니다.',
          timestamp: '오후 3:15',
        },
      ],
    });
  }, []);

  const login = async (email: string): Promise<boolean> => {
    // Perform simulated login
    const isTeacher = email.includes('teacher') || email.includes('admin') || email.includes('dy.hs.kr');
    const name = email.split('@')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const loggedInUser: User = {
      id: 'user',
      name: email === 'deodux@gmail.com' ? '이민상' : capitalizedName,
      email,
      phone: '010-1234-5678',
      role: isTeacher ? 'teacher' : 'student',
      statusMessage: email === 'deodux@gmail.com' ? '우주인 MAKE @Web' : 'DYMS 접속 완료!',
    };

    setUser(loggedInUser);

    // Build workspaces for user
    const wsList: Workspace[] = [
      { id: 'ws-1', name: 'DY@software', ownerEmail: email },
      { id: 'ws-2', name: 'DY@design', ownerEmail: email },
    ];
    setWorkspaces(wsList);
    // Do not select workspace automatically; let screen handle it

    return true;
  };

  const logout = () => {
    setUser(null);
    setSelectedWorkspace(null);
  };

  const registerUser = async (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'user',
      statusMessage: '안녕하세요! 새로 가입했어요.',
    };
    setUser(newUser);

    const wsList: Workspace[] = [
      { id: 'ws-1', name: 'DY@software', ownerEmail: userData.email },
    ];
    setWorkspaces(wsList);
  };

  const selectWorkspace = (wsId: string) => {
    const ws = workspaces.find((w) => w.id === wsId);
    if (ws) {
      setSelectedWorkspace(ws);
    }
  };

  const createWorkspace = (name: string) => {
    if (!user) return;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      ownerEmail: user.email,
    };
    setWorkspaces([...workspaces, newWs]);
    setSelectedWorkspace(newWs);
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!user) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content,
      timestamp: getFormattedTime(),
    };

    // Append to message list
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Update last message in chat list
    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: `${user.name}: ${content}`,
            lastMessageTime: newMsg.timestamp,
            unreadCount: 0,
          };
        }
        return c;
      })
    );

    // Simulated Auto-Responder Logic
    // If the chat is a direct chat (not group) and user is sending message, make the contact reply
    const activeChat = chats.find((c) => c.id === chatId);
    if (activeChat && activeChat.type === 'direct') {
      const targetFriendId = activeChat.members[0];
      const targetFriend = friends.find((f) => f.id === targetFriendId);

      if (targetFriend) {
        // Trigger typing status
        setTimeout(() => {
          setTypingStatus((prev) => ({ ...prev, [chatId]: targetFriend.name }));
        }, 1000);

        // Send reply after delay
        setTimeout(() => {
          setTypingStatus((prev) => ({ ...prev, [chatId]: null }));

          const botResponses = [
            `안녕하세요! 메시지 확인했습니다.`,
            `네, 확인해보겠습니다. 잠시만 기다려주세요!`,
            `지금 수업 중이거나 회의 중일 수 있어서 이따가 다시 답변 드릴게요.`,
            `좋은 하루 되세요! 🌟`,
            `혹시 다른 문의 사항이 더 있으신가요?`,
          ];
          const randomReply = botResponses[Math.floor(Math.random() * botResponses.length)];

          const replyMsg: Message = {
            id: `msg-reply-${Date.now()}`,
            senderId: targetFriend.id,
            senderName: targetFriend.name,
            senderRole: targetFriend.role,
            content: replyMsgContent(targetFriend.name, targetFriend.role, randomReply),
            timestamp: getFormattedTime(),
          };

          setMessages((prev) => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), replyMsg],
          }));

          setChats((prevChats) =>
            prevChats.map((c) => {
              if (c.id === chatId) {
                return {
                  ...c,
                  lastMessage: replyMsg.content,
                  lastMessageTime: replyMsg.timestamp,
                  unreadCount: c.unreadCount + 1,
                };
              }
              return c;
            })
          );
        }, 3500);
      }
    }
  };

  const replyMsgContent = (name: string, role: string, defaultReply: string) => {
    if (role === 'teacher') {
      return `${defaultReply} (교무실 혹은 수업 이동 중)`;
    }
    return defaultReply;
  };

  const createChatRoom = (memberIds: string[], name?: string): string => {
    const newId = `c-${Date.now()}`;
    const selectedFriends = friends.filter((f) => memberIds.includes(f.id));

    let roomName = name;
    if (!roomName) {
      roomName = selectedFriends.map((f) => f.name).join(', ');
      if (roomName.length > 20) {
        roomName = roomName.slice(0, 17) + '...';
      }
    }

    const newChat: Chat = {
      id: newId,
      name: roomName,
      type: memberIds.length > 1 ? 'group' : 'direct',
      members: memberIds,
      lastMessage: '채팅방이 개설되었습니다.',
      lastMessageTime: getFormattedTime(),
      unreadCount: 0,
    };

    setChats((prev) => [newChat, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          senderRole: 'student',
          content: '대화가 시작되었습니다.',
          timestamp: getFormattedTime(),
          isSystem: true,
        },
      ],
    }));

    return newId;
  };

  const updateStatus = (statusMessage: string) => {
    if (!user) return;
    setUser({
      ...user,
      statusMessage,
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        workspaces,
        selectedWorkspace,
        friends,
        chats,
        messages,
        meals,
        timetable,
        notices,
        typingStatus,
        login,
        logout,
        registerUser,
        selectWorkspace,
        createWorkspace,
        sendMessage,
        createChatRoom,
        updateStatus,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
