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

  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
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
        loadChats,
        loadMessages,
        sendMessage,
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
