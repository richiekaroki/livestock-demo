import { Component } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

// NOTE: ErrorBoundary uses hardcoded colors because it must render even when
// the ThemeProvider itself fails. Using useColors() here would crash.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Pressable
            onPress={this.handleReset}
            style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFDF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#1B2E1B',
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.base,
    color: '#6B8A6B',
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#15803D',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  btnText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.base },
});
