import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

function LayoutGuard() {
  const { user, selectedWorkspace } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
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
  }, [user, selectedWorkspace, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <LayoutGuard />
      </ThemeProvider>
    </AppProvider>
  );
}
