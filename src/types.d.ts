declare module '@/global.css';
declare module '*.css';
declare module '*.module.css';

declare module 'expo-symbols' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export interface SymbolViewProps extends ViewProps {
    name: any;
    tintColor?: string;
    size?: number;
    renderingMode?: 'automatic' | 'alwaysTemplate' | 'alwaysOriginal';
    type?: any;
    weight?: any;
    scale?: any;
  }

  export const SymbolView: React.FC<SymbolViewProps>;
}
