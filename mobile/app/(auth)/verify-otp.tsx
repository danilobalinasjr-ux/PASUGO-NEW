import { signInWithEmailAndPassword } from 'firebase/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { auth } from '@/config/firebase';
import { useRegistration } from '@/hooks/use-registration';
import { completeRegistration, resendRegistrationCode, verifyFirebaseToken, verifyRegistrationOtp } from '@/services/authApi';

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ registrationId?: string; email?: string; expiresAt?: string }>();
  const { registration, clearRegistration } = useRegistration();
  const registrationId = params.registrationId ?? registration?.registrationId ?? '';
  const email = params.email ?? registration?.email ?? '';
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(params.expiresAt ? new Date(params.expiresAt).getTime() : Date.now() + 900000);
  const [resendAvailableAt, setResendAvailableAt] = useState(Date.now() + 60000);
  const [remainingSeconds, setRemainingSeconds] = useState(900);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
      setResendRemainingSeconds(Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, resendAvailableAt]);

  async function handleVerify() {
    if (!registration || !registrationId || code.length !== 6) {
      setErrorMessage('Enter the 6-digit code from your email.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await verifyRegistrationOtp(registrationId, code);
      await completeRegistration(registrationId, registration.password);
      const credential = await signInWithEmailAndPassword(auth, registration.email, registration.password);
      await verifyFirebaseToken(await credential.user.getIdToken());
      clearRegistration();
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to verify your email right now.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!registrationId || resendRemainingSeconds > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      const result = await resendRegistrationCode(registrationId);
      setExpiresAt(new Date(result.expiresAt).getTime());
      setResendAvailableAt(Date.now() + 60000);
      setCode('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to resend the code.');
    } finally {
      setIsResending(false);
    }
  }

  function startOver() {
    clearRegistration();
    router.replace('/(auth)/register');
  }

  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PASUGO</Text>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {maskEmail(email)}.</Text>
      <TextInput
        autoFocus
        autoCapitalize="none"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
        placeholder="000000"
        placeholderTextColor="#8A8F98"
        style={styles.codeInput}
        textContentType="oneTimeCode"
        value={code}
      />
      <Text style={styles.timer}>{remainingSeconds > 0 ? `Code expires in ${minutes}:${seconds}` : 'Code expired'}</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Pressable disabled={isLoading || remainingSeconds === 0} onPress={handleVerify} style={styles.primaryButton}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Verify email</Text>}
      </Pressable>
      <Pressable disabled={resendRemainingSeconds > 0 || isResending} onPress={handleResend} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>{isResending ? 'Sending...' : resendRemainingSeconds > 0 ? `Resend code in ${resendRemainingSeconds}s` : 'Resend code'}</Text>
      </Pressable>
      <Pressable onPress={startOver} style={styles.startOverButton}>
        <Text style={styles.startOverText}>Start over</Text>
      </Pressable>
    </View>
  );
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name || !domain) return 'your email address';
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F7F9', flex: 1, justifyContent: 'center', padding: 24 },
  eyebrow: { color: '#2563EB', fontSize: 14, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  title: { color: '#172033', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#667085', fontSize: 16, lineHeight: 23, marginBottom: 24 },
  codeInput: { backgroundColor: '#FFFFFF', borderColor: '#D9DEE7', borderRadius: 12, borderWidth: 1, color: '#172033', fontSize: 28, letterSpacing: 8, padding: 15, textAlign: 'center' },
  timer: { color: '#667085', marginTop: 12, textAlign: 'center' },
  error: { color: '#B42318', lineHeight: 20, marginTop: 14, textAlign: 'center' },
  primaryButton: { alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12, justifyContent: 'center', marginTop: 20, minHeight: 52, padding: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', minHeight: 48, justifyContent: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#2563EB', fontWeight: '700' },
  startOverButton: { alignItems: 'center', marginTop: 12, padding: 10 },
  startOverText: { color: '#667085', fontWeight: '700' },
});