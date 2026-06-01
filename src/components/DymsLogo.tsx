import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

export function DymsLogo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Stylized D-shaped icon */}
      <View
        style={[
          styles.logoCircle,
          {
            width: size,
            height: size,
            borderRadius: size * 0.35,
            borderColor: theme.primary,
            borderWidth: size * 0.18,
          },
        ]}
      >
        <View
          style={[
            styles.logoInner,
            {
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: size * 0.15,
              backgroundColor: theme.primary,
            },
          ]}
        />
      </View>
      {showText && (
        <ThemedText
          style={[
            styles.logoText,
            {
              fontSize: size * 0.75,
              color: theme.text,
            },
          ]}
        >
          DYMS
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  logoInner: {
    position: 'absolute',
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
