import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function TrackingScreen() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: '1', sender: 'rider', text: 'Heading to the grocery store now, po.' },
    { id: '2', sender: 'customer', text: 'Thank you! Please grab the brand with the blue packaging.' },
    { id: '3', sender: 'rider', text: 'Got it. Items secured, on my way to your drop-off.' },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatLog([...chatLog, { id: Date.now().toString(), sender: 'customer', text: message }]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Map View Mockup Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mockMapBackground}>
          <Text style={styles.mapIconPlaceholder}>🗺️</Text>
          <Text style={styles.mapText}>Live Route Progress Visualizer</Text>
          <Text style={styles.mapSubText}>Rider (Kuya Juan) 🛵 is en route to You 🏠</Text>
        </View>

        {/* Floating Minimal HUD Badge */}
        <View style={[styles.floatingBadge, SHADOWS.card]}>
          <Text style={styles.badgeLabel}>ETA TO DESTINATION</Text>
          <Text style={styles.badgeValue}>6 mins away</Text>
        </View>
      </View>

      {/* Milestone Logistics Tracker Steps */}
      <View style={styles.logisticsTimelineCard}>
        <Text style={styles.sectionHeading}>Errand Progress</Text>
        <View style={styles.timelineRow}>
          <View style={styles.stepContainer}>
            <View style={[styles.circleIndicator, styles.circleActive]} />
            <Text style={styles.stepTextActive}>Accepted</Text>
          </View>
          <View style={styles.timelineLineActive} />
          <View style={styles.stepContainer}>
            <View style={[styles.circleIndicator, styles.circleActive]} />
            <Text style={styles.stepTextActive}>Purchasing</Text>
          </View>
          <View style={styles.timelineLineActive} />
          <View style={styles.stepContainer}>
            <View style={[styles.circleIndicator, styles.circleActive]} />
            <Text style={styles.stepTextActive}>En Route</Text>
          </View>
          <View style={styles.timelineLineMuted} />
          <View style={styles.stepContainer}>
            <View style={[styles.circleIndicator, styles.circleMuted]} />
            <Text style={styles.stepTextMuted}>Arrived</Text>
          </View>
        </View>
      </View>

      {/* In-App Direct Messenger Interface */}
      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <Text style={styles.riderName}>Rider: Juan Dela Cruz</Text>
          <Text style={styles.riderPlate}>Honda Click • ABC-1234</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.chatBubbleBody}
          ref={(ref) => ref?.scrollToEnd({ animated: true })}
        >
          {chatLog.map((item) => (
            <View 
              key={item.id} 
              style={[
                styles.bubbleWrapper, 
                item.sender === 'customer' ? styles.wrapperCustomer : styles.wrapperRider
              ]}
            >
              <View 
                style={[
                  styles.baseBubble, 
                  item.sender === 'customer' ? styles.bubbleCustomer : styles.bubbleRider
                ]}
              >
                <Text style={item.sender === 'customer' ? styles.textWhite : styles.textDark}>
                  {item.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Text Box Action Panel */}
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatField}
            placeholder="Message your rider..."
            placeholderTextColor={COLORS.textSecondary}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendActionButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: COLORS.border,
  },
  mockMapBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
  },
  mapIconPlaceholder: {
    fontSize: 36,
    marginBottom: 4,
  },
  mapText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  mapSubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  logisticsTimelineCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepContainer: {
    alignItems: 'center',
    width: 60,
  },
  circleIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 6,
  },
  circleActive: {
    backgroundColor: COLORS.secondary,
  },
  circleMuted: {
    backgroundColor: COLORS.border,
  },
  stepTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stepTextMuted: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  timelineLineActive: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginBottom: 16,
  },
  timelineLineMuted: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  chatSection: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  chatHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  riderName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  riderPlate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  chatBubbleBody: {
    padding: SPACING.md,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    width: '100%',
  },
  wrapperCustomer: {
    justifyContent: 'flex-end',
  },
  wrapperRider: {
    justifyContent: 'flex-start',
  },
  baseBubble: {
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxWidth: width * 0.75,
  },
  bubbleCustomer: {
    backgroundColor: COLORS.primary,
  },
  bubbleRider: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textWhite: {
    color: COLORS.surface,
    fontSize: 14,
  },
  textDark: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  chatField: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendActionButton: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
