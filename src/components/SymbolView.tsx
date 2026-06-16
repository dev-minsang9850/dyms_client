import React from 'react';
import { View, ViewStyle, StyleProp, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SymbolViewProps {
  name: string | { ios?: string; android?: string; web?: string };
  size?: number;
  tintColor?: string;
  style?: StyleProp<ViewStyle>;
  type?: string;
  fallback?: React.ReactNode;
  weight?: string;
}

const sfToIonicons: { [key: string]: any } = {
  // Navigation / Chevrons
  'chevron.right': 'chevron-forward',
  'chevron.left': 'chevron-back',
  'chevron.up': 'chevron-up',
  'chevron.down': 'chevron-down',
  
  // Basic Actions
  'plus': 'add',
  'plus.circle': 'add-circle',
  'plus.circle.fill': 'add-circle',
  'xmark': 'close',
  'xmark.circle': 'close-circle',
  'xmark.circle.fill': 'close-circle',
  'checkmark': 'checkmark',
  'checkmark.circle': 'checkmark-circle-outline',
  'checkmark.circle.fill': 'checkmark-circle',
  'trash': 'trash-outline',
  'trash.fill': 'trash',
  'pencil': 'pencil',
  'square.and.pencil': 'create-outline',
  'magnifyingglass': 'search',
  'arrow.clockwise': 'refresh',

  // Authentication
  'lock': 'lock-closed-outline',
  'lock.fill': 'lock-closed',
  'lock.open': 'lock-open-outline',
  'eye': 'eye-outline',
  'eye.slash': 'eye-off-outline',

  // Messaging / Communication
  'paperplane': 'send-outline',
  'paperplane.fill': 'send',
  'bell': 'notifications-outline',
  'bell.fill': 'notifications',
  'bubble.left.and.bubble.right': 'chatbubbles-outline',
  'bubble.left.and.bubble.right.fill': 'chatbubbles',
  'bubble.left.fill': 'chatbubble',
  'megaphone': 'megaphone-outline',
  'megaphone.fill': 'megaphone',
  'text.bubble': 'chatbubble-ellipses-outline',

  // Users / Roles
  'person': 'person-outline',
  'person.fill': 'person',
  'person.2': 'people-outline',
  'person.2.fill': 'people',
  'person.badge.plus': 'person-add-outline',
  'person.crop.circle': 'person-circle-outline',
  'person.crop.circle.fill': 'person-circle',

  // Widgets & UI
  'calendar': 'calendar-outline',
  'calendar.badge.plus': 'calendar-outline',
  'clock': 'time-outline',
  'doc.text': 'document-text-outline',
  'doc.text.fill': 'document-text',
  'list.bullet': 'list',
  'square.grid.2x2': 'grid-outline',
  'square.grid.2x2.fill': 'grid',
  'sun.max': 'sunny-outline',
  'sun.max.fill': 'sunny',
  'moon': 'moon-outline',
  'moon.fill': 'moon',
  'house': 'home-outline',
  'house.fill': 'home',
  'arrow.up.circle.fill': 'arrow-up-circle',
  'arrow.right.square': 'log-out-outline',
  'arrow.left.square': 'log-in-outline',
  'gear': 'settings-outline',
  'gearshape': 'settings-outline',
  'gearshape.fill': 'settings',
  'info.circle': 'information-circle-outline',
  'info.circle.fill': 'information-circle',
  'exclamationmark.triangle': 'warning-outline',
  'exclamationmark.triangle.fill': 'warning',
  'book': 'book-outline',
  'tray.fill': 'server-outline',

  // Common Material/Web fallback translations
  'chat': 'chatbubbles',
  'article': 'newspaper',
  'more_horiz': 'ellipsis-horizontal',
  'keyboard_arrow_up': 'chevron-up',
  'keyboard_arrow_down': 'chevron-down',
  'keyboard_arrow_left': 'chevron-back',
  'keyboard_arrow_right': 'chevron-forward',
  'local_fire_department': 'flame',
  'chevron_right': 'chevron-forward',
  'grid_view': 'grid',
  'add_circle': 'add-circle',
  'logout': 'log-out',
  'account_circle': 'person-circle',
  'arrow_back': 'arrow-back',
  'poll': 'stats-chart',
  'calendar_today': 'calendar',
  'open_in_new': 'open-outline',
  'edit': 'create-outline',
  'dark_mode': 'moon',
  'group': 'people',
  'admin_panel_settings': 'shield-checkmark',
  'chat_bubble_outline': 'chatbubble-outline',
  'do_not_disturb': 'remove-circle-outline',
  'celebration': 'trophy',
  'check': 'checkmark',
  'message-square': 'chatbubble-outline',
  'fire': 'flame',
  'plus-circle': 'add-circle',
  'user': 'person',
  'shield': 'shield-checkmark',
  'users': 'people',
};

export function SymbolView({ name, size = 24, tintColor, style, type, fallback }: SymbolViewProps) {
  let resolvedName = 'square';

  if (typeof name === 'object' && name !== null) {
    const platformName = Platform.select({
      ios: name.ios,
      android: name.android,
      web: name.web,
      default: name.android || name.web,
    });
    resolvedName = platformName || 'square';
  } else if (typeof name === 'string') {
    resolvedName = name;
  }

  let iconName: any = 'square';
  if (sfToIonicons[resolvedName]) {
    iconName = sfToIonicons[resolvedName];
  } else {
    let clean = resolvedName.toLowerCase();
    if (clean.endsWith('.fill')) {
      clean = clean.replace('.fill', '');
    }
    iconName = clean.replace(/\./g, '-');
  }

  // Map platform-specific names that might not match Ionicons
  if (iconName === 'paper-plane' || iconName === 'paperplane') {
    iconName = 'send';
  } else if (iconName === 'plus') {
    iconName = 'add';
  } else if (iconName === 'pencil') {
    iconName = 'create-outline';
  } else if (iconName === 'chevron-left') {
    iconName = 'chevron-back';
  } else if (iconName === 'chevron-right') {
    iconName = 'chevron-forward';
  }

  return (
    <View style={style}>
      <Ionicons name={iconName} size={size} color={tintColor || '#000'} />
    </View>
  );
}
