import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactLight } from '@/src/services/haptics';
import { Button } from './ui/Button';
import type { AnimalType, HealthStatus } from '@wam-mfugo/shared';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  types: (AnimalType | 'All')[];
  health: (HealthStatus | 'All')[];
  counties: string[];
  selectedType: AnimalType | 'All';
  selectedHealth: HealthStatus | 'All';
  selectedCounty: string;
  onTypeChange: (type: AnimalType | 'All') => void;
  onHealthChange: (health: HealthStatus | 'All') => void;
  onCountyChange: (county: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export function FilterModal({
  visible,
  onClose,
  types,
  health,
  counties,
  selectedType,
  selectedHealth,
  selectedCounty,
  onTypeChange,
  onHealthChange,
  onCountyChange,
  onReset,
  onApply,
}: FilterModalProps) {
  const colors = useColors();

  const handleReset = () => {
    impactLight();
    onTypeChange('All');
    onHealthChange('All');
    onCountyChange('All');
    onReset();
  };

  const handleApply = () => {
    impactLight();
    onApply();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Type Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Animal Type</Text>
              <View style={styles.chipContainer}>
                {types.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => { impactLight(); onTypeChange(t); }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selectedType === t ? colors.tint : colors.card,
                        borderColor: selectedType === t ? colors.tint : colors.borderLight,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selectedType === t ? '#fff' : colors.text }]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Health Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Health Status</Text>
              <View style={styles.chipContainer}>
                {health.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => { impactLight(); onHealthChange(h); }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selectedHealth === h ? colors.accent : colors.card,
                        borderColor: selectedHealth === h ? colors.accent : colors.borderLight,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selectedHealth === h ? '#fff' : colors.text }]}>
                      {h}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* County Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>County</Text>
              <View style={styles.chipContainer}>
                {counties.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => { impactLight(); onCountyChange(c); }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selectedCounty === c ? colors.tint : colors.card,
                        borderColor: selectedCounty === c ? colors.tint : colors.borderLight,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selectedCounty === c ? '#fff' : colors.text }]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Reset"
              onPress={handleReset}
              variant="ghost"
              size="md"
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});