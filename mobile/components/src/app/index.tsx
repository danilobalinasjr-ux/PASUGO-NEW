import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Hardcoded Mock Data matching your spec requirements
const CATEGORIES = [
  { id: '1', title: 'Grocery Errands', icon: '🛒' },
  { id: '2', title: 'Pharmacy Errands', icon: '💊' },
  { id: '3', title: 'Bills Payment', icon: '🧾' },
  { id: '4', title: 'Document Delivery', icon: '📄' },
  { id: '5', title: 'Item Pickup', icon: '📦' },
  { id: '6', title: 'Shopping Asst.', icon: '🛍️' },
  { id: '7', title: 'Multi-Stop', icon: '📍' },
  { id: '8', title: 'Custom Request', icon: '✨' },
];

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 1. Header / Sticky Top Search Bar Area */}
      <View style={styles.headerContainer}>
        <Text style={styles.brandText}>PASUGO</Text>
        <Text style={styles.taglineText}>Your Personal Errand Partner</Text>
        
        <View style={styles.searchBarWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="What errand do you need help with?"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* 2. Active Errand Tracking Live Banner */}
        <View style={[styles.activeErrandCard, SHADOWS.card]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.activeLabel}>🔴 LIVE ERRAND TRACKING</Text>
              <Text style={styles.activeStatusTitle}>Document Delivery to Hub</Text>
            </View>
            <Text style={styles.etaText}>Rider ETA: 8m</Text>
          </View>
        </View>

        {/* 3. Service Categories 2x4 Clean Grid Layout */}
        <Text style={styles.sectionHeader}>Our Services</Text>
        <View style={styles.gridContainer}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.categoryCard, SHADOWS.card]}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Swipeable / Static Banner Placeholder */}
        <View style={[styles.promoBanner, { backgroundColor: COLORS.secondary }]}>
          <Text style={styles.promoTextBold}>Get P50 off your first Multi-Stop booking!</Text>
          <Text style={styles.promoTextSub}>Use code: PASUGONOW</Text>
        </View>

        {/* 5. Quick Nearby Stats Panel */}
        <View style={[styles.statsCard, SHADOWS.card]}>
          <Text style={styles.statsLabel}>Riders Operating Online Nearby</Text>
          <Text style={styles.statsValue}>42 Freelance Riders Active</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  taglineText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  searchBarWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  scrollBody: {
    padding: SPACING.md,
  },
  activeErrandCard: {
    backgroundColor: '#FFF5F5',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  activeStatusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    width: (width - SPACING.md * 2 - SPACING.md) / 2, // Perfect clean 2-column distribution
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  promoBanner: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  promoTextBold: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  promoTextSub: {
    color: COLORS.surface,
    fontSize: 13,
    opacity: 0.9,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
