import React from 'react';
import { View, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import { ThemedText } from './themed-text';
import { SymbolView } from './SymbolView';
import { DymsLogo } from './DymsLogo';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/context/AppContext';

export function Sidebar() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { chats, themeMode } = useApp();

  const totalUnreadCount = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const menuItems = [
    {
      name: '홈',
      path: '/',
      icon: { ios: 'house.fill', android: 'home', web: 'home' } as any,
    },
    {
      name: '채팅',
      path: '/chats',
      icon: { ios: 'bubble.left.and.bubble.right.fill', android: 'chatbubbles', web: 'chatbubbles' } as any,
      badge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
    },
    {
      name: '보드',
      path: '/board',
      icon: { ios: 'doc.text.image.fill', android: 'newspaper', web: 'newspaper' } as any,
    },
    {
      name: '바로가기',
      path: '/shortcuts',
      icon: { ios: 'link', android: 'link', web: 'link' } as any,
    },
    {
      name: '메뉴',
      path: '/menu',
      icon: { ios: 'ellipsis.circle.fill', android: 'ellipsis-horizontal', web: 'ellipsis-horizontal' } as any,
    },
  ];

  return (
    <View style={styles.sidebarContainer}>
      <BlurView
        intensity={themeMode === 'dark' ? 40 : 60}
        tint={themeMode === 'dark' ? 'dark' : 'light'}
        style={[
          styles.blurContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <DymsLogo size={32} />
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as any)}
                style={({ hovered }) => [
                  styles.menuItem,
                  isActive && { backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' },
                  hovered && !isActive && { backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' },
                ]}
              >
                <View style={styles.iconWrapper}>
                  <SymbolView
                    name={item.icon}
                    tintColor={isActive ? theme.primary : theme.textSecondary}
                    size={24}
                  />
                  {item.badge !== undefined && (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.menuText,
                    isActive ? { color: theme.primary, fontWeight: '700' } : { color: theme.textSecondary }
                  ]}
                >
                  {item.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 260,
    height: '100%',
    padding: 16,
    // On web, the root background will show through the sidebar blur
  },
  blurContainer: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  logoContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  menuContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 16,
    transition: 'background-color 0.2s ease',
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent', // Usually we'd want this to match the glass background
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
