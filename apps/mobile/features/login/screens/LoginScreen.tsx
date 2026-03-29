import { AppScreen } from '@/components/layout/AppScreen';
import { GoogleButton } from '../components/GoogleButton';
import { useState } from 'react';
import {
  Label,
  Button,
  Stack,
  Divider,
  useTheme,
  TextInput,
  Title,
} from '@luna-ui/react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuildConfig } from '@/BuildConfig';
import { Image } from 'expo-image';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/auth/useAuth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginMethod = 'password' | 'magic-link';

export function LoginScreen() {
  const { spacing, colors } = useTheme();
  const { getOtpCode, loginWithProvider, login } = useAuth();

  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  const isValidEmail = emailRegex.test(email);
  const isValidPassword = password.length >= 6;

  const onLoginWithPassword = async () => {
    if (!isValidEmail) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!isValidPassword) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setEmailError(null);
    setPasswordError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setPasswordError(
        result.error?.message ?? 'Login failed. Please try again.',
      );
    }
  };

  const onLoginWithMagicLink = async () => {
    if (BuildConfig.IS_DEV) {
      // If we are in dev mode, skip email validation and go to OTP screen directly
      // to facilitate testing.
      router.navigate({
        pathname: '/login/otp',
        params: { email },
      });
      return;
    }

    if (!isValidEmail) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError(null);
    setIsLoading(true);
    const result = await getOtpCode(email);
    setIsLoading(false);

    if (result.success) {
      router.navigate({
        pathname: '/login/otp',
        params: { email },
      });
    } else {
      alert('Failed to send magic link. Please try again.');
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await loginWithProvider('google', 'guallet://login/callback');
      setIsLoading(false);
      if (!result.success) {
        alert('Failed to login with Google. Please try again.');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      setIsLoading(false);
      alert('Failed to login with Google. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    router.navigate({
      pathname: '/login/forgot-password',
      params: { email },
    });
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'password' ? 'magic-link' : 'password');
    setPasswordError(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppScreen
        headerTitle="Login"
        isHeaderVisible={false}
        isLoading={isLoading}
      >
        <Stack style={{ flex: 1, padding: spacing.md }} gap={spacing.lg}>
          <View
            style={{
              flex: 1,
              maxHeight: 200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              style={{ flex: 1, width: '100%' }}
              source={require('@/assets/images/icon.png')}
              contentFit="scale-down"
            />
          </View>

          <Title center>Login or sign up</Title>

          <TextInput
            label="Email"
            onChangeText={(input) => {
              setEmail(input);
              setEmailError(null);
            }}
            value={email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />

          {loginMethod === 'password' && (
            <>
              <TextInput
                label="Password"
                onChangeText={(input) => {
                  setPassword(input);
                  setPasswordError(null);
                }}
                value={password}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                error={passwordError}
              />

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text
                  style={[styles.forgotPasswordLink, { color: colors.primary }]}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>

              <Button
                onClick={onLoginWithPassword}
                disabled={!isValidEmail || !isValidPassword}
              >
                Sign in
              </Button>
            </>
          )}

          {loginMethod === 'magic-link' && (
            <Button onClick={onLoginWithMagicLink} disabled={!isValidEmail}>
              Send magic link
            </Button>
          )}

          <TouchableOpacity onPress={toggleLoginMethod}>
            <Text style={[styles.toggleLink, { color: colors.primary }]}>
              {loginMethod === 'password'
                ? 'Use magic link instead'
                : 'Use password instead'}
            </Text>
          </TouchableOpacity>

          <Divider label="or continue with" />

          <GoogleButton
            onPress={() => {
              loginWithGoogle();
            }}
          />
        </Stack>

        <Stack
          gap={spacing.sm}
          style={{ padding: spacing.md }}
          justify="center"
        >
          <Label center>Don&apos;t have an account?</Label>
          <Button>Sign Up</Button>
          <Label>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </Label>
        </Stack>
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  forgotPasswordLink: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: -8,
  },
  toggleLink: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
