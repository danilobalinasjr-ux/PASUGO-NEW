import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { auth } from '@/config/firebase';
import { verifyFirebaseToken } from '@/services/authApi';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setErrorMessage('Enter your email and password.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const idToken = await credential.user.getIdToken();
      await verifyFirebaseToken(idToken);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      await signOut(auth).catch(() => undefined);
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>PASUGO</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue with your errands and deliveries.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={email}
        />
        <View style={styles.passwordRow}>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#8A8F98"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
          />
          <Pressable onPress={() => setShowPassword((visible) => !visible)} style={styles.visibilityButton}>
            <Text style={styles.visibilityText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable disabled={isLoading} onPress={handleLogin} style={styles.primaryButton}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to PASUGO?</Text>
        <Link href="/(auth)/register" style={styles.link}>Create an account</Link>
      </View>
    </View>
  );
}

function getAuthErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    default:
      return error instanceof Error ? error.message : 'Unable to sign in right now.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9', justifyContent: 'center', padding: 24 },
  header: { marginBottom: 32 },
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
