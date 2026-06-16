import { Tabs } from 'expo-router';
import { SymbolView } from '@/components/SymbolView';
import { useTheme } from '@/hooks/use-theme';
import { Platform, View, useWindowDimensions, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const theme = useTheme();
  const { chats, themeMode } = useApp();
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width >= 768;
  const totalUnreadCount = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? 'row' : 'column', backgroundColor: 'transparent' }}>
      
      {isLargeScreen && <Sidebar />}
      
      <View style={{ flex: 1 }}>
        <Tabs
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarLabelPosition: 'below-icon',
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: isLargeScreen ? { display: 'none' } : {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 0,
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              height: Platform.OS === 'ios' ? 88 : 64,
              paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            },
            tabBarBackground: isLargeScreen ? undefined : () => (
              <BlurView 
                intensity={80} 
                tint={themeMode === 'dark' ? 'dark' : 'light'} 
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: theme.card,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                  }
                ]} 
              />
            ),
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
      </View>
    </View>
  );
}
