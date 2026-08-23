import { useState, useCallback } from 'react';
import { TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactLight } from '@/src/services/haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search animals...' }: SearchBarProps) {
  const colors = useColors();

  const handleClear = useCallback(() => {
    impactLight();
    onChangeText('');
  }, [onChangeText]);

  return (
    <SearchBarInner
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      onClear={handleClear}
      colors={colors}
    />
  );
}

function SearchBarInner({
  value, onChangeText, placeholder, onClear, colors,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  onClear: () => void;
  colors: ReturnType<typeof import('@/components/Themed').useColors>;
}) {
  return (
    <SearchBarContainer colors={colors}>
      <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
      <TextInput
        style={[searchStyles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={({ pressed }) => [searchStyles.clearBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      )}
    </SearchBarContainer>
  );
}

function SearchBarContainer({ colors, children }: { colors: ReturnType<typeof import('@/components/Themed').useColors>; children: React.ReactNode }) {
  return (
    <View style={[searchStyles.container, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
      {children}
    </View>
  );
}

import { View } from 'react-native';

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: spacing.xs,
  },
  clearBtn: {
    padding: spacing.xs,
  },
});
