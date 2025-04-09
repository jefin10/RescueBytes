import { Pressable, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/Auth/AuthContext';
import BackButton from '@/assets/icons/BackButton';
import { hp, wp } from '@/helper/common';
import ScreenWrapper from '@/components/ScreenWrapper';
import { API_URL } from '@/Auth/api';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginResponse {
  userId: string;
  sessionToken: string;
  role: string;
  rescueCenter: string;
  message?: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('user1@email.com');
  const [password, setPassword] = useState<string>('12345678');

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {

      const response = await fetch(`${API_URL}/auth/loginApp`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();
      setLoading(false);

      if (response.ok) {
        await login(
          data.userId, 
          data.sessionToken, 
          data.role,
          data.rescueCenter
        );
        router.push('/home'); // Navigate to homepage
      } else {
        Alert.alert('Error', data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.header}>
        <BackButton router={router} />
      </View>
      
      <View style={styles.container}>
        <Text style={styles.caption}>Welcome Back!</Text>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin} 
          disabled={loading}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#00b4db', '#0083b0']} 
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <>
              <ActivityIndicator color="white" />
              <Text style={styles.loadingText}>The server is starting please wait</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink}>Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    backgroundColor: 'white',
  },
  header: {
    marginTop: hp(2),
    paddingHorizontal: wp(4),
    alignSelf: 'flex-start',
  },
  caption: {
    fontSize: hp(2.5),
    color: 'gray',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  title: {
    fontSize: hp(4),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: hp(3),
    color: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: hp(1.6),
    marginTop: hp(1),
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: hp(3),
    gap: hp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 14,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    fontSize: hp(2.2),
    color: 'black',
  },
  buttonContainer: {
    marginBottom: hp(2.5),
    width: '100%',
  },
  gradientButton: {
    borderRadius: 18,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: hp(2.2),
    color: 'white',
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center', 
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: '#666',
  },
  registerLink: {
    color: '#00b4db',
    fontWeight: '600',
  }
});