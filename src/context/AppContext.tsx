// src/context/AppContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "teacher";
  statusMessage?: string;
  isAdmin?: boolean;
}

export interface Notice {
  id: string;
  tag: '긴급' | '행사' | '공지';
  date: string;
  title: string;
  content: string;
}

export interface Meal {
  date: string;
  menu: string[];
  calories: string;
}

export interface Chat {
  id: string;
  name: string;
  type: "direct" | "group";
  members: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isSystem?: boolean;
  senderRole?: string;
  senderName?: string;
  timestamp?: string;
}

export interface Friend {
  id: string;
  name: string;
  role: "student" | "teacher";
  detail: string;
  status: "online" | "offline" | "in-class";
  statusMessage?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerEmail: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  workspaces: Workspace[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };

  friends: Friend[];
  selectedWorkspace: Workspace | null; // 선택된 워크스페이스
  selectWorkspace: (id: string) => void;
  createWorkspace: (name: string) => void;

  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "student" | "teacher";
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStatus: (statusMessage: string) => Promise<void>;

  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;

  notices: Notice[];
  meals: Meal[];
  timetable: string[];
  typingStatus: { [chatId: string]: string | null };
  createChatRoom: (memberIds: string[], roomName?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );

  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 'n-1',
      tag: '긴급',
      date: '2026.06.05',
      title: '다음주 월요일 전교생 1교시 강당 소집 안내',
      content: '다음주 월요일 1교시(09:00)에 개교기념일 행사를 준비하기 위해 전교생이 강당(덕영관)으로 소집됩니다. 늦지 않게 이동해 주시기 바랍니다.',
    },
    {
      id: 'n-2',
      tag: '행사',
      date: '2026.06.03',
      title: '2026학년도 덕영제 축제 기획 공모전',
      content: '올해 9월 예정인 덕영제 축제에서 부스 및 무대를 기획하고 싶은 학급/동아리는 기획서를 작성하여 6월 20일까지 학생회실로 제출바랍니다. 창의적인 아이디어를 기다립니다!',
    },
    {
      id: 'n-3',
      tag: '공지',
      date: '2026.06.01',
      title: '하절기 교복 착용 규정 안내',
      content: '6월 8일(월)부터 하절기 교복(생활복 및 체육복 혼용 가능) 착용 기간이 시작됩니다. 단정한 옷차림으로 교내 규정을 준수해 주시기 바랍니다.',
    },
  ]);

  const [meals, setMeals] = useState<Meal[]>([
    {
      date: '오늘 (금)',
      menu: ['차조밥', '돈육김치찌개', '치킨가스 & 소스', '감자채볶음', '배추김치', '아이스 망고'],
      calories: '785 kcal',
    },
    {
      date: '6월 8일 (월)',
      menu: ['쌀밥', '소고기무국', '오리훈제볶음', '쌈무/머스타드', '부추겉절이', '요구르트'],
      calories: '810 kcal',
    },
    {
      date: '6월 9일 (화)',
      menu: ['마파두부덮밥', '계란파국', '멘보샤', '짜사이무침', '배추김치', '복숭아에이드'],
      calories: '760 kcal',
    },
  ]);

  const [timetable, setTimetable] = useState<string[]>([
    '1교시: 데이터베이스 (정보실1)',
    '2교시: 네트워크 기초 (정보실1)',
    '3교시: 수학 (2-3 교실)',
    '4교시: 영어 (2-3 교실)',
    '5교시: 자료구조 (정보실2)',
    '6교시: 모바일 프로그래밍 (정보실2)',
    '7교시: 자율 활동 (2-3 교실)',
  ]);

  const [typingStatus, setTypingStatus] = useState<{ [chatId: string]: string | null }>({});

  // 앱 시작 시 토큰/유저 복원
  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("dyms_token");
        const storedUser = await AsyncStorage.getItem("dyms_user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("restore error", e);
      }
    };
    restore();
  }, []);

  // 토큰 바뀔 때 Authorization 헤더 자동 설정
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // friends: 일단 더미 데이터 유지 (나중에 서버 API 만들면 교체)
  useEffect(() => {
    setFriends([
      {
        id: "f-1",
        name: "김도현",
        role: "teacher",
        detail: "교사 | 정보보안부",
        status: "online",
        statusMessage: "문의사항은 메신저로 남겨주세요.",
      },
      {
        id: "f-2",
        name: "박지성",
        role: "student",
        detail: "학생 | 2학년 3반",
        status: "in-class",
        statusMessage: "열공 중 🔥",
      },
      {
        id: "f-3",
        name: "이지은",
        role: "teacher",
        detail: "교사 | 수학과 (2-3 담임)",
        status: "offline",
        statusMessage: "수업 중에는 답변이 늦어질 수 있습니다.",
      },
      {
        id: "f-4",
        name: "최유진",
        role: "student",
        detail: "학생 | 2학년 3반",
        status: "online",
        statusMessage: "점심 뭐 나오지? 😋",
      },
    ]);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user: serverUser, accessToken } = res.data;

      const mappedUser: User = {
        id: serverUser.id,
        name: serverUser.name,
        email: serverUser.email,
        phone: serverUser.phone,
        role: serverUser.role,
        statusMessage: serverUser.statusMessage,
        isAdmin: serverUser.isAdmin,
      };

      setUser(mappedUser);
      setToken(accessToken);

      await AsyncStorage.setItem("dyms_token", accessToken);
      await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));

      return true;
    } catch (e) {
      console.error("login error", e);
      return false;
    }
  };

  const registerUser = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "student" | "teacher";
  }): Promise<boolean> => {
    try {
      const res = await api.post("/auth/register", data);
      const { user: serverUser, accessToken } = res.data;

      const mappedUser: User = {
        id: serverUser.id,
        name: serverUser.name,
        email: serverUser.email,
        phone: serverUser.phone,
        role: serverUser.role,
        statusMessage: serverUser.statusMessage,
        isAdmin: serverUser.isAdmin,
      };

      setUser(mappedUser);
      setToken(accessToken);

      await AsyncStorage.setItem("dyms_token", accessToken);
      await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));

      return true;
    } catch (e: any) {
      console.error("register error", e?.response?.data || e);
      return false;
    }
  };

  const loadChats = async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data as Chat[]);
    } catch (e) {
      console.error("loadChats error", e);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`, {
        params: { limit: 50 },
      });
      setMessages((prev) => ({
        ...prev,
        [chatId]: res.data as Message[],
      }));
    } catch (e) {
      console.error("loadMessages error", e);
    }
  };

  const sendMessage = async (chatId: string, content: string) => {
    try {
      const res = await api.post(`/chats/${chatId}/messages`, { content });
      const msg = res.data as Message;
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), msg],
      }));
    } catch (e) {
      console.error("sendMessage error", e);
    }
  };

  const selectWorkspace = (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      setSelectedWorkspace(workspace);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const res = await api.post("/workspaces", { name });
      const newWorkspace = res.data as Workspace;
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setSelectedWorkspace(newWorkspace);
    } catch (e) {
      console.error("createWorkspace error", e);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setSelectedWorkspace(null);
    await AsyncStorage.removeItem("dyms_token");
    await AsyncStorage.removeItem("dyms_user");
  };

  const updateStatus = async (statusMessage: string) => {
    try {
      const res = await api.patch("/users/me/status", { statusMessage });
      const updatedUser = res.data;
      const mappedUser: User = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        statusMessage: updatedUser.statusMessage,
        isAdmin: updatedUser.isAdmin,
      };
      setUser(mappedUser);
      await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));
    } catch (e) {
      console.error("updateStatus error", e);
    }
  };

  const createChatRoom = (memberIds: string[], roomName?: string): string => {
    const newId = `chat-${Date.now()}`;
    const names = memberIds
      .map((id) => friends.find((f) => f.id === id)?.name || "사용자")
      .join(", ");

    const newChat: Chat = {
      id: newId,
      name: roomName || names,
      type: memberIds.length > 1 ? "group" : "direct",
      members: memberIds,
      unreadCount: 0,
    };

    setChats((prev) => [...prev, newChat]);
    return newId;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        chats,
        messages,
        friends,
        workspaces,
        selectedWorkspace,
        selectWorkspace,
        createWorkspace,
        login,
        registerUser,
        logout,
        updateStatus,
        loadChats,
        loadMessages,
        sendMessage,
        notices,
        meals,
        timetable,
        typingStatus,
        createChatRoom,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
};
