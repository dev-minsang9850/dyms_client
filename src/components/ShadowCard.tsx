import React from 'react';
import { StyleSheet, View, type ViewProps, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BlurView } from 'expo-blur';

export type ShadowCardProps = ViewProps & {
  children: React.ReactNode;
  padding?: number;
};

export function ShadowCard({ children, style, padding = 16, ...props }: ShadowCardProps) {
  const theme = useTheme();
  
  // To avoid BlurView layout bugs with padding, we use an inner View for padding.
  return (
    <BlurView
      intensity={theme.mode === 'dark' ? 30 : 50}
      tint={theme.mode === 'dark' ? 'dark' : 'light'}
      style={[
        styles.card,
        {
          backgroundColor: theme.card, // semi-transparent
          borderColor: theme.border,
        },
        style,
      ]}
      {...props}
    >
      <View style={{ padding }}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24, // More rounded for Apple liquid glass
    borderWidth: 1,
    overflow: 'hidden', // Important for BlurView border radius
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      } as any,
    }),
  },
});
