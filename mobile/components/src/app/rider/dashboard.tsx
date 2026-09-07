import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Hardcoded Mock Data matching your Rider dashboard spec requirements
const AVAILABLE_JOBS = [
  { id: '101', category: '🛒 Grocery Errands', distance: '1.2 km away', payout: '₱120.00', details: 'Buy 5 items at Puregold. Items listed in instructions.' },
  { id: '102', category: '🧾 Bills Payment', distance: '0.5 km away', payout: '₱90.00', details: 'Pay Meralco Bill at Bayad Center. Cash provided by client.' },
  { id: '103', category: '📦 Item Pickup', distance: '3.4 km away', payout: '₱180.00', details: 'Pick up documents from MRT station and deliver to office tower.' },
];

export default function RiderDashboard() {
  const [activeJobs, setActiveJobs] = useState(AVAILABLE_JOBS);

  const handleAcceptJob = (id: string) => {
    // Remove accepted item from list to simulate modern real-time workflow state transitions
    setActiveJobs(activeJobs.filter(job => job.id !== id));
    alert('Task successfully assigned to your workspace profile! Head to pickup.');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Rider Performance Summary Matrix */}
      <View style={styles.metricsContainer}>
        <Text style={styles.riderWelcome}>Kumusta, Rider Juan! 👋</Text>
        <Text style={styles.statusSub}>Status: Active & Accepting Errands</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today's Wallet</Text>
            <Text style={styles.statValue}>₱850.00</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>5 Tasks</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>⭐ 4.92</Text>
          </View>
        </View>
      </View>

      {/* Available Task Feed Container */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        <Text style={styles.sectionHeader}>Nearby Available Errands ({activeJobs.length})</Text>

        {activeJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Looking for fresh requests nearby...</Text>
          </View>
        ) : (
          activeJobs.map((job) => (
            <View key={job.id} style={[styles.jobCard, SHADOWS.card]}>
              <View style={styles.rowBetween}>
                <Text style={styles.jobCategory}>{job.category}</Text>
                <Text style={styles.jobPayout}>{job.payout}</Text>
              </View>

              <Text style={styles.jobDistance}>📍 {job.distance}</Text>
              <Text style={styles.jobDetailsText}>{job.details}</Text>

              {/* Accept / Reject Control Row Buttons */}
              <View style={styles.actionRowButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectBtn]}
                  onPress={() => setActiveJobs(activeJobs.filter(item => item.id !== job.id))}
                >
                  <Text style={styles.rejectText}>Pass</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.acceptBtn]}
                  onPress={() => handleAcceptJob(job.id)}
                >
                  <Text style={styles.acceptText}>Accept Job</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  metricsContainer: {
    backgroundColor: COLORS.accent, // Striking charcoal highlight for metrics panel
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  riderWelcome: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.surface,
  },
  statusSub: {
    fontSize: 12,
    color: '#BDBDBD',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    width: (width - SPACING.md * 2 - 16) / 3,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#E0E0E0',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.surface,
  },
  scrollBody: {
    padding: SPACING.md,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  jobPayout: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  jobDistance: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  jobDetailsText: {
    fontSize: 13,
    color: COLORS.accent,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  actionRowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  rejectText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  acceptText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
