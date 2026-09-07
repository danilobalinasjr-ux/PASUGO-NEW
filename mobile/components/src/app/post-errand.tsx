import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function PostErrandScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('');
  const [priority, setPriority] = useState('Standard'); // Low, Standard, High

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Create New Errand</Text>
        <Text style={styles.headerSubtitle}>Ready in less than 60 seconds</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formBody}>
        
        {/* Form Group: Locations */}
        <Text style={styles.sectionLabel}>Route Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>📍 Pickup Location / Store Name</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g., Robinson's Supermarket or Current Home"
            placeholderTextColor={COLORS.textSecondary}
            value={pickup}
            onChangeText={setPickup}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>🏁 Drop-off Destination</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="Where should the rider deliver it?"
            placeholderTextColor={COLORS.textSecondary}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {/* Form Group: Task Details */}
        <Text style={styles.sectionLabel}>Errand Specifications</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>📝 Item Details & Instructions</Text>
          <TextInput 
            style={[styles.textInput, styles.textArea]} 
            placeholder="List items to buy, account numbers for bills, or specific items to grab..."
            placeholderTextColor={COLORS.textSecondary}
            multiline={true}
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
          />
        </View>

        {/* Form Group: Budget & Pricing */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>💰 Estimated Item Budget (₱)</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g., 500 (Exclude delivery fee)"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
        </View>

        {/* Form Group: Priority Selector Toggle */}
        <Text style={styles.fieldLabel}>⚡ Priority Level</Text>
        <View style={styles.priorityToggleContainer}>
          {['Low', 'Standard', 'High'].map((level) => (
            <TouchableOpacity 
              key={level} 
              style={[
                styles.priorityButton, 
                priority === level && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
              ]}
              onPress={() => setPriority(level)}
            >
              <Text style={[styles.priorityText, priority === level && { color: '#FFF' }]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mock Image Upload Placeholder Box */}
        <TouchableOpacity style={styles.uploadPlaceholderCard}>
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadTextTitle}>Upload Reference Images</Text>
          <Text style={styles.uploadTextSub}>Attach receipts, lists, or product photos</Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity style={[styles.submitButton, SHADOWS.card]}>
          <Text style={styles.submitButtonText}>Find Nearby Pasugo Riders</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  formBody: {
    padding: SPACING.md,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
  },
  priorityToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    marginTop: 4,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  uploadPlaceholderCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  uploadTextTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  uploadTextSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
