import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useTheme } from '@/hooks/use-theme';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { SymbolView } from '@/components/SymbolView';
import { ThemedText } from '@/components/themed-text';

function LayoutGuard() {
  const { user, selectedWorkspace, themeMode, isRestoring, inAppNotification, setInAppNotification } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();

  const handleBannerPress = () => {
    if (inAppNotification) {
      router.push(`/chat/${inAppNotification.chatId}`);
      setInAppNotification(null);
    }
  };

  useEffect(() => {
    if (isRestoring || !segments) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'find-auth';
    const inWorkspaceGroup = segments[0] === 'workspace';

    if (!user) {
      // Redirect to login if not authenticated
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (!selectedWorkspace) {
      // Redirect to workspace selection if authenticated but no workspace is selected
      if (!inWorkspaceGroup) {
        router.replace('/workspace');
      }
    } else {
      // Redirect to home (which is (tabs)) if authenticated and a workspace is selected
      if (inAuthGroup || inWorkspaceGroup) {
        router.replace('/');
      }
    }
  }, [user, selectedWorkspace, segments, isRestoring]);

  if (isRestoring) {
    return (
      <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <View style={[styles.outerContainer, { backgroundColor: themeMode === 'dark' ? '#0a0a0c' : '#f0f2f5' }]}>
        <View style={[styles.innerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Slot />
          {inAppNotification && (
            <Animated.View
              entering={FadeInUp}
              exiting={FadeOutUp}
              style={styles.notificationBannerContainer}
            >
              <Pressable
                onPress={handleBannerPress}
                style={[
                  styles.notificationBanner,
                  {
                    backgroundColor: themeMode === 'dark' ? 'rgba(30, 30, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={[styles.notificationIconContainer, { backgroundColor: theme.primaryLight }]}>
                  <SymbolView
                    name={{ ios: 'bubble.left.fill', android: 'chat', web: 'message-square' }}
                    tintColor={theme.primary}
                    size={18}
                  />
                </View>
                <View style={styles.notificationTextContainer}>
                  <ThemedText style={styles.notificationTitle} type="smallBold" numberOfLines={1}>
                    {inAppNotification.title}
                  </ThemedText>
                  <ThemedText style={styles.notificationMessage} themeColor="textSecondary" numberOfLines={1}>
                    {inAppNotification.message}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setInAppNotification(null);
                  }}
                  style={styles.notificationCloseBtn}
                >
                  <ThemedText themeColor="textSecondary" style={{ fontWeight: '700', fontSize: 13 }}>✕</ThemedText>
                </Pressable>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    ...Platform.select({
      web: {
        boxShadow: '0 0 24px rgba(0, 0, 0, 0.06)',
      } as any
    })
  },
  notificationBannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      } as any,
    }),
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
    gap: 2,
  },
  notificationTitle: {
    fontSize: 14,
  },
  notificationMessage: {
    fontSize: 12,
  },
  notificationCloseBtn: {
    padding: 8,
    marginLeft: 8,
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <LayoutGuard />
    </AppProvider>
  );
}
