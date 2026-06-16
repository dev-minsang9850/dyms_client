/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#F2F5F9', // Fallback
    backgroundElement: 'rgba(255, 255, 255, 0.65)', // Clearer glass
    backgroundSelected: 'rgba(255, 255, 255, 0.8)',
    textSecondary: '#6E7682',
    primary: '#007AFF',
    primaryLight: 'rgba(0, 122, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.5)', // Subtle white border
    card: 'rgba(255, 255, 255, 0.55)', // Clean glass card
    gradientBase: ['#e9d7fc', '#b7dafd'], // 50% intensity Apple-like background
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000', // Fallback
    backgroundElement: 'rgba(30, 30, 35, 0.6)', // Deep glass
    backgroundSelected: 'rgba(50, 50, 55, 0.8)',
    textSecondary: '#9A9EA7',
    primary: '#0A84FF',
    primaryLight: 'rgba(10, 132, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)', // Subtle light border
    card: 'rgba(28, 28, 32, 0.6)', // Deep glass card
    gradientBase: ['#0A0A12', '#12121A', '#1C1C28'], // Unified midnight blue
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
