import { Tabs } from 'expo-router';
import { SymbolView } from '@/components/SymbolView';
import { useTheme } from '@/hooks/use-theme';
import { Platform } from 'react-native';
import { useApp } from '@/context/AppContext';

export default function TabLayout() {
  const theme = useTheme();
  const { chats } = useApp();

  const totalUnreadCount = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          borderTopWidth: 1,
          ...Platform.select({
            ios: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
            },
            android: {
              elevation: 8,
            },
            web: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.03,
              shadowRadius: 12,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color as string}
              size={size + 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: '채팅',
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
            lineHeight: 14,
            height: 16,
            minWidth: 16,
            borderRadius: 8,
          },
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'bubble.left.and.bubble.right.fill', android: 'chatbubbles', web: 'chatbubbles' }}
              tintColor={color as string}
              size={size + 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: '보드',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'doc.text.image.fill', android: 'newspaper', web: 'newspaper' }}
              tintColor={color as string}
              size={size + 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shortcuts"
        options={{
          title: '바로가기',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'link', android: 'link', web: 'link' }}
              tintColor={color as string}
              size={size + 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: '메뉴',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'ellipsis.circle.fill', android: 'ellipsis-horizontal', web: 'ellipsis-horizontal' }}
              tintColor={color as string}
              size={size + 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
