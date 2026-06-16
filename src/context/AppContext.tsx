import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import { Vibration, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "teacher";
  statusMessage?: string;
  isAdmin?: boolean;
  grade?: number;
  class?: number;
  number?: number;
  position?: "none" | "head" | "deputy";
  workspace?: string;
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
  workspace?: string;
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
  readBy?: string[];
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'video' | 'file';
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
  isRestoring: boolean;
  workspaces: Workspace[];
  friends: Friend[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };

  selectedWorkspace: Workspace | null; // 선택된 워크스페이스
  selectWorkspace: (id: string) => void;
  clearWorkspace: () => void;
  createWorkspace: (name: string) => void;

  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "student" | "teacher";
    grade?: number;
    class?: number;
    number?: number;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStatus: (statusMessage: string) => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    grade?: number;
    class?: number;
    number?: number;
    password?: string;
  }) => Promise<boolean>;

  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (
    chatId: string, 
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileType?: 'image' | 'video' | 'file'
  ) => Promise<void>;
  loadFriends: () => Promise<void>;
  loadWorkspaces: (usr?: User, autoSelect?: boolean) => Promise<void>;

  notices: Notice[];
  meals: Meal[];
  timetable: { [day: string]: string[] } | null;
  typingStatus: { [chatId: string]: string | null };
  createChatRoom: (memberIds: string[], roomName?: string) => Promise<string>;

  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleTheme: () => void;
  inAppNotification: { title: string; message: string; chatId: string } | null;
  setInAppNotification: (notification: { title: string; message: string; chatId: string } | null) => void;
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  createNotice: (title: string, content: string, tag: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );

  const [notices, setNotices] = useState<Notice[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [timetable, setTimetable] = useState<{ [day: string]: string[] } | null>(null);

  const [typingStatus, setTypingStatus] = useState<{ [chatId: string]: string | null }>({});
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>('light');
  const [inAppNotification, setInAppNotification] = useState<{ title: string; message: string; chatId: string } | null>(null);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const setActiveChatId = (id: string | null) => {
    setActiveChatIdState(id);
    activeChatIdRef.current = id;
  };
  const notificationTimeoutRef = useRef<any>(null);

  // Load theme preference on launch
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("dyms_theme");
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeModeState(storedTheme);
        }
      } catch (e) {
        console.warn("loadTheme error", e);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: 'light' | 'dark') => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem("dyms_theme", mode);
    } catch (e) {
      console.warn("saveTheme error", e);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  // 앱 시작 시 토큰/유저 복원
  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("dyms_token");
        const storedUser = await AsyncStorage.getItem("dyms_user");
        if (storedToken && storedUser) {
          // Set authorization header immediately so we can load school data
          api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          setIsRestoring(false);
        }
      } catch (e) {
        console.warn("restore error", e);
        setIsRestoring(false);
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

  // 401 Unauthorized 에러 감색 시 자동 로그아웃 처리 세션 초기화
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized access (401) - logging out...");
          setUser(null);
          setToken(null);
          setSelectedWorkspace(null);
          await AsyncStorage.removeItem("dyms_token");
          await AsyncStorage.removeItem("dyms_user");
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Load school data & chats on auth success
  const loadWorkspaces = async (usr?: User, autoSelect = false) => {
    try {
      let freshUser = usr || user;
      try {
        const meRes = await api.get('/users/me');
        freshUser = meRes.data as User;
        setUser(freshUser);
        await AsyncStorage.setItem("dyms_user", JSON.stringify(freshUser));
      } catch (meErr) {
        console.warn('loadWorkspaces fresh user fetch error', meErr);
      }

      const workspacesRes = await api.get('/workspaces');
      const wsList = workspacesRes.data as Workspace[];
      setWorkspaces(wsList);

      if (selectedWorkspace) {
        const stillExists = wsList.some((w) => w.id === selectedWorkspace.id);
        if (!stillExists) {
          setSelectedWorkspace(null);
        }
      }

      if (autoSelect) {
        const targetUser = freshUser;
        const wsName = targetUser?.workspace;
        if (wsName) {
          const matched = wsList.find((w) => w.name.toLowerCase() === wsName.toLowerCase());
          if (matched) {
            setSelectedWorkspace(matched);
          }
        }
      }
    } catch (e) {
      console.warn('loadWorkspaces error', e);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsRes = await api.get('/users/workspace-members');
      const mapped = friendsRes.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        detail: u.role === 'teacher' 
          ? `교직원${u.position === 'head' ? ' (부장)' : u.position === 'deputy' ? ' (차장)' : ''}` 
          : (u.grade && u.class) ? `${u.grade}학년 ${u.class}반` : '학적 정보 없음',
        status: 'online',
        statusMessage: u.statusMessage || '',
      }));
      setFriends(mapped);
    } catch (friendsErr) {
      console.warn('loadFriends error', friendsErr);
    }
  };

  // Load school data & chats on auth success
  const loadSchoolData = async (usr: User) => {
    try {
      const [mealsRes, noticesRes] = await Promise.all([
        api.get('/school/meals'),
        api.get('/school/notices'),
      ]);
      setMeals(mealsRes.data);
      setNotices(noticesRes.data);

      await loadWorkspaces(usr, true);

      const timetableRes = await api.get('/school/timetable', {
        params: {
          grade: usr.grade || 2,
          class: usr.class || 3,
        }
      });
      setTimetable(timetableRes.data);

      await loadFriends();
    } catch (e) {
      console.warn('loadSchoolData error', e);
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      loadSchoolData(user);

      // Register for Push Notifications
      registerForPushNotificationsAsync().then(async pushToken => {
        if (pushToken) {
          try {
            await api.patch('/users/me/push-token', { pushToken });
          } catch (e) {
            console.warn('Failed to update push token', e);
          }
        }
      });
    }
  }, [token, user]); // Added user to dependencies

  async function registerForPushNotificationsAsync() {
    let pushToken;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          pushToken = (await Notifications.getExpoPushTokenAsync()).data;
        } else {
          pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
      } catch (e) {
        console.warn('getExpoPushTokenAsync error', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return pushToken;
  }

  useEffect(() => {
    if (token && selectedWorkspace) {
      loadChats();
      const interval = setInterval(() => {
        loadChats();
      }, 5000);
      return () => clearInterval(interval);
    } else if (token && !selectedWorkspace) {
      setChats([]);
    }
  }, [token, selectedWorkspace]);

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
        grade: serverUser.grade,
        class: serverUser.class,
        number: serverUser.number,
        position: serverUser.position,
        workspace: serverUser.workspace,
      };

      // Set header immediately for subsequent API requests inside this method
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      let matchedWorkspace = null;
      try {
        const workspacesRes = await api.get('/workspaces');
        const wsList = workspacesRes.data as Workspace[];
        setWorkspaces(wsList);

        const wsName = mappedUser.workspace;
        if (wsName) {
          const matched = wsList.find((w) => w.name.toLowerCase() === wsName.toLowerCase());
          if (matched) {
            matchedWorkspace = matched;
          }
        }
      } catch (wsErr) {
        console.warn("Login fetch workspaces error", wsErr);
      }

      if (matchedWorkspace) {
        setSelectedWorkspace(matchedWorkspace);
      } else {
        setSelectedWorkspace(null);
      }

      setToken(accessToken);
      setUser(mappedUser);

      await AsyncStorage.setItem("dyms_token", accessToken);
      await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));

      return true;
    } catch (e) {
      console.warn("login error", e);
      return false;
    }
  };

  const registerUser = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "student" | "teacher";
    grade?: number;
    class?: number;
    number?: number;
  }): Promise<boolean> => {
    try {
      // Do registration post call and immediately return true (awaiting approval, no auto login)
      await api.post("/auth/register", data);
      return true;
    } catch (e: any) {
      console.warn("register error", e?.response?.data || e);
      return false;
    }
  };

  const loadChats = async () => {
    try {
      const res = await api.get("/chats");
      const mappedChats = (res.data || [])
        .map((c: any) => ({
          ...c,
          members: c.memberIds || [],
        }))
        .filter((c: any) => 
          !selectedWorkspace || (c.workspace && c.workspace.toLowerCase() === selectedWorkspace.name.toLowerCase())
        );

      setChats((prevChats) => {
        // Compare with prevChats to find any chat where unreadCount has increased
        if (prevChats && prevChats.length > 0) {
          mappedChats.forEach((newChat: any) => {
            const oldChat = prevChats.find((c) => c.id === newChat.id);
            const oldUnread = oldChat ? oldChat.unreadCount : 0;
            
            // If the unreadCount increased, and the user is not currently viewing this chat room
            if (newChat.unreadCount > oldUnread && activeChatIdRef.current !== newChat.id) {
              // Get the chat display name
              let chatName = newChat.name;
              if (newChat.type === 'direct') {
                const friendId = newChat.members ? newChat.members.find((mId: string) => mId !== user?.id) : null;
                const friend = friendId ? friends.find((f) => f.id === friendId) : null;
                chatName = friend ? friend.name : (newChat.name || '사용자');
              }
              
              // Set inAppNotification
              setInAppNotification({
                title: chatName,
                message: newChat.lastMessage || '새 메시지가 도착했습니다.',
                chatId: newChat.id,
              });

              // Play vibration
              try {
                Vibration.vibrate(150);
              } catch (vibErr) {
                console.warn('Vibration error', vibErr);
              }

              // Clear existing timer if any
              if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
              }
              // Set automatic dismissal after 4 seconds
              notificationTimeoutRef.current = setTimeout(() => {
                setInAppNotification(null);
              }, 4000);
            }
          });
        }
        return mappedChats as Chat[];
      });
    } catch (e) {
      console.warn("loadChats error", e);
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
      console.warn("loadMessages error", e);
    }
  };

  const sendMessage = async (
    chatId: string, 
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileType?: 'image' | 'video' | 'file'
  ) => {
    try {
      const res = await api.post(`/chats/${chatId}/messages`, { 
        content,
        fileUrl,
        fileName,
        fileType
      });
      const msg = res.data as Message;
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), msg],
      }));
    } catch (e) {
      console.warn("sendMessage error", e);
    }
  };

  const selectWorkspace = async (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      try {
        const res = await api.patch('/users/me/workspace', { workspace: workspace.name });
        const updatedUser = res.data;
        const mappedUser: User = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          statusMessage: updatedUser.statusMessage,
          isAdmin: updatedUser.isAdmin,
          grade: updatedUser.grade,
          class: updatedUser.class,
          number: updatedUser.number,
          position: updatedUser.position,
          workspace: updatedUser.workspace,
        };
        setUser(mappedUser);
        await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));

        const friendsRes = await api.get('/users/workspace-members');
        const mapped = friendsRes.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          detail: u.role === 'teacher' 
            ? `교직원${u.position === 'head' ? ' (부장)' : u.position === 'deputy' ? ' (차장)' : ''}` 
            : (u.grade && u.class) ? `${u.grade}학년 ${u.class}반` : '학적 정보 없음',
          status: 'online',
          statusMessage: u.statusMessage || '',
        }));
        setFriends(mapped);
        setSelectedWorkspace(workspace); // Update selection after successful server sync
      } catch (e) {
        console.warn('selectWorkspace patch error', e);
      }
    }
  };

  const clearWorkspace = () => {
    setSelectedWorkspace(null);
  };

  const createWorkspace = async (name: string) => {
    try {
      const res = await api.post("/workspaces", { name });
      const newWorkspace = res.data as Workspace;
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setSelectedWorkspace(newWorkspace);
    } catch (e) {
      console.warn("createWorkspace error", e);
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
        grade: updatedUser.grade,
        class: updatedUser.class,
        number: updatedUser.number,
        position: updatedUser.position,
        workspace: updatedUser.workspace,
      };
      setUser(mappedUser);
      await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));
    } catch (e) {
      console.warn("updateStatus error", e);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    grade?: number;
    class?: number;
    number?: number;
    password?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.patch("/users/me/profile", data);
      const updatedUser = res.data;
      const mappedUser: User = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        statusMessage: updatedUser.statusMessage,
        isAdmin: updatedUser.isAdmin,
        grade: updatedUser.grade,
        class: updatedUser.class,
        number: updatedUser.number,
        position: updatedUser.position,
        workspace: updatedUser.workspace,
      };
      setUser(mappedUser);
      await AsyncStorage.setItem("dyms_user", JSON.stringify(mappedUser));
      
      // If student profile changed grade/class, trigger reloading the school data/timetable
      if (data.grade !== undefined || data.class !== undefined) {
        await loadSchoolData(mappedUser);
      }
      
      return true;
    } catch (e) {
      console.warn("updateProfile error", e);
      return false;
    }
  };

  const createChatRoom = async (memberIds: string[], roomName?: string): Promise<string> => {
    try {
      const res = await api.post("/chats", { name: roomName, memberIds });
      const serverChat = res.data;
      const newChat: Chat = {
        ...serverChat,
        members: serverChat.memberIds || [],
      };
      setChats((prev) => [newChat, ...prev]);
      return newChat.id;
    } catch (e) {
      console.warn("createChatRoom API error", e);
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

      setChats((prev) => [newChat, ...prev]);
      return newId;
    }
  };

  const createNotice = async (title: string, content: string, tag: string): Promise<boolean> => {
    try {
      const res = await api.post('/school/notices', { title, content, tag });
      const newNotice = res.data as Notice;
      setNotices((prev) => [newNotice, ...prev]);
      return true;
    } catch (e) {
      console.warn("createNotice error", e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isRestoring,
        chats,
        messages,
        friends,
        workspaces,
        selectedWorkspace,
        selectWorkspace,
        clearWorkspace,
        createWorkspace,
        login,
        registerUser,
        logout,
        updateStatus,
        updateProfile,
        loadChats,
        loadMessages,
        sendMessage,
        loadFriends,
        loadWorkspaces,
        notices,
        meals,
        timetable,
        typingStatus,
        createChatRoom,
        themeMode,
        setThemeMode,
        toggleTheme,
        inAppNotification,
        setInAppNotification,
        activeChatId,
        setActiveChatId,
        createNotice,
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
