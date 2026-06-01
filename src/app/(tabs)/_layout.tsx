import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTheme } from '@/hooks/use-theme';
import { Platform } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();

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
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'bubble.left.and.bubble.right.fill', android: 'chat', web: 'chat' }}
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
              name={{ ios: 'doc.text.image.fill', android: 'article', web: 'article' }}
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
              name={{ ios: 'ellipsis.circle.fill', android: 'more_horiz', web: 'more_horiz' }}
              tintColor={color as string}
              size={size + 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
