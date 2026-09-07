import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { initiateRegistration } from '@/services/authApi';
import { useRegistration } from '@/hooks/use-registration';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { beginRegistration } = useRegistration();

  async function handleRegister() {
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setErrorMessage('Complete all fields.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const registration = await initiateRegistration(normalizedEmail, normalizedName, password);
      beginRegistration({ email: registration.email, password, registrationId: registration.registrationId });
      router.push({ pathname: '/(auth)/verify-otp', params: { registrationId: registration.registrationId, email: registration.email, expiresAt: registration.expiresAt } });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>PASUGO</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Get started with errands and deliveries in one place.</Text>
      </View>

      <View style={styles.form}>
        <TextInput autoCapitalize="words" onChangeText={setFullName} placeholder="Full name" placeholderTextColor="#8A8F98" style={styles.input} value={fullName} />
        <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#8A8F98" style={styles.input} value={email} />
        <PasswordInput onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} showPassword={showPassword} setShowPassword={setShowPassword} value={password} />
        <PasswordInput onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry={!showConfirmPassword} showPassword={showConfirmPassword} setShowPassword={setShowConfirmPassword} value={confirmPassword} />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable disabled={isLoading} onPress={handleRegister} style={styles.primaryButton}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create account</Text>}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
      </View>
    </ScrollView>
  );
}

type PasswordInputProps = {
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry: boolean;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  value: string;
};

function PasswordInput({ onChangeText, placeholder, secureTextEntry, showPassword, setShowPassword, value }: PasswordInputProps) {
  return (
    <View style={styles.passwordRow}>
      <TextInput autoCapitalize="none" onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A8F98" secureTextEntry={secureTextEntry} style={styles.passwordInput} value={value} />
      <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.visibilityButton}>
        <Text style={styles.visibilityText}>{showPassword ? 'Hide' : 'Show'}</Text>
      </Pressable>
    </View>
  );
}

function getAuthErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password.';
    default:
      return error instanceof Error ? error.message : 'Unable to create the account right now.';
  }
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F7F9', flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 28 },
  eyebrow: { color: '#2563EB', fontSize: 14, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  title: { color: '#172033', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#667085', fontSize: 16, lineHeight: 23 },
  form: { gap: 14 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D9DEE7', borderRadius: 12, borderWidth: 1, color: '#172033', padding: 15 },
  passwordRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D9DEE7', borderRadius: 12, borderWidth: 1, flexDirection: 'row' },
  passwordInput: { color: '#172033', flex: 1, padding: 15 },
  visibilityButton: { paddingHorizontal: 15, paddingVertical: 12 },
  visibilityText: { color: '#2563EB', fontWeight: '700' },
  error: { color: '#B42318', lineHeight: 20 },
  primaryButton: { alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12, minHeight: 52, justifyContent: 'center', padding: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  footer: { alignItems: 'center', flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 28 },
  footerText: { color: '#667085' },
  link: { color: '#2563EB', fontWeight: '700' },
});
