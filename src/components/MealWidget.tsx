import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ShadowCard } from './ShadowCard';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from './SymbolView';

export function MealWidget() {
  const { meals } = useApp();
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  if (!meals || meals.length === 0) {
    return (
      <ShadowCard style={styles.card}>
        <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText themeColor="textSecondary">급식 계획표를 불러오는 중입니다...</ThemedText>
        </View>
      </ShadowCard>
    );
  }

  const currentMeal = meals[activeIndex];

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < meals.length - 1) setActiveIndex(activeIndex + 1);
  };

  return (
    <ShadowCard style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={handlePrev}
          disabled={activeIndex === 0}
          style={({ pressed }) => [
            styles.arrowButton,
            activeIndex === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{ ios: 'chevron.left', android: 'keyboard_arrow_left', web: 'chevron-left' }}
            tintColor={activeIndex === 0 ? theme.textSecondary : theme.primary}
            size={20}
          />
        </Pressable>

        <View style={styles.titleContainer}>
          <ThemedText type="smallBold" themeColor="primary">
            급식 계획표
          </ThemedText>
          <ThemedText style={styles.dateText}>{currentMeal.date}</ThemedText>
        </View>

        <Pressable
          onPress={handleNext}
          disabled={activeIndex === meals.length - 1}
          style={({ pressed }) => [
            styles.arrowButton,
            activeIndex === meals.length - 1 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{ ios: 'chevron.right', android: 'keyboard_arrow_right', web: 'chevron-right' }}
            tintColor={activeIndex === meals.length - 1 ? theme.textSecondary : theme.primary}
            size={20}
          />
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.menuContainer}>
        {currentMeal.menu.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
            <ThemedText style={styles.menuText}>{item}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.calorieBadge, { backgroundColor: theme.primaryLight }]}>
        <SymbolView
          name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'fire' }}
          tintColor={theme.primary}
          size={14}
        />
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          총 칼로리: {currentMeal.calories}
        </ThemedText>
      </View>
    </ShadowCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.3,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  menuContainer: {
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  menuText: {
    fontSize: 15,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
