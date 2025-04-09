import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useRouter } from 'expo-router'
import { hp, wp } from '@/helper/common'
import BackButton from '@/assets/icons/BackButton'
import { StatusBar } from 'expo-status-bar'
import { Dropdown } from 'react-native-element-dropdown'
import { useAuth } from '@/Auth/AuthContext'
import { API_URL } from '../Auth/api'
import { LinearGradient } from 'expo-linear-gradient'

const register = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();
  const [rescueCenters, setRescueCenters] = useState([]);
  const [userRC, setUserRC] = useState('');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  interface RescueCenter {
    location: string;
  }

  const getRC = async () => {
    try {
      const response = await fetch(`${API_URL}/getRC`);
      const data: RescueCenter[] = await response.json();
      const formattedData = data.map((item: RescueCenter) => ({
        label: item.location,
        value: item.location
      }));
      setRescueCenters(formattedData);
      console.log(rescueCenters);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSignUp = async () => {
    setLoading(true);
    
    // Client-side validation
    if (!name || !email || !password || !confirmPassword || !userRC) {
      Alert.alert('Error', 'All fields are required');
      setLoading(false);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    // Password validation
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sending registration request to:', `${API_URL}/signup`);
      console.log('With data:', { name, email, rescueCenter: userRC });
      
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          rescueCenter: userRC
        })
      });
      console.log(response);
      const data = await response.json();
      console.log('Sign up response status:', response.status);
      console.log('Sign up response data:', data);
          
      if (response.ok) {
        // Registration succeeded
        if (data.userId && data.sessionToken) {
          try {
            await login(
              data.userId, 
              data.sessionToken, 
              data.role || 'user',
              data.rescueCenter
            );
            Alert.alert('Success', 'Registration Successful');
            router.push('/home');
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            Alert.alert(
              'Registration Successful', 
              'Your account has been created, but automatic login failed. Please try logging in manually.',
              [{ text: 'OK', onPress: () => router.push('./pages/Login') }]
            );
          }
        } else {
          Alert.alert(
            'Registration Successful',
            'Your account has been created. Please log in.',
            [{ text: 'OK', onPress: () => router.push('./pages/Login') }]
          );
        }
      } else {
        // Registration failed with error from server
        Alert.alert('Registration Failed', data.message || 'An error occurred during registration');
      }
    } catch (error) {
      console.error('Registration network error:', error);
      Alert.alert(
        'Network Error', 
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getRC();
  }, []);

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton router={router} />
        </View>

        <Text style={styles.caption}>Join Us and Explore!</Text>

        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Name"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setname}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={rescueCenters}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Center' : '...'}
            searchPlaceholder="Search..."
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setUserRC(item.value);
              setValue(item.value);
              setIsFocus(false);
            }}
          />
        </View>

        <TouchableOpacity 
          onPress={handleSignUp}
          disabled={loading}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#00b4db', '#0083b0']} 
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Processing...' : 'Getting Started'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  )
}

export default register

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(4),
      backgroundColor: 'white',
    },
    header: {
      marginTop: hp(2),
      alignSelf: 'flex-start',
    },
    caption: {
      fontSize: hp(3),
      color: "gray",
      textAlign: 'center',
      marginVertical: hp(1),
    },
    title: {
      fontSize: hp(4),
      fontWeight: 800,
      textAlign: 'center',
      marginVertical: hp(1),
      color: "black",
    },
    inputContainer: {
      marginTop: hp(2),
      gap: hp(2),
    },
    input: {
      borderWidth: 1,
      borderColor: "gray",
      borderRadius: 14,
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      fontSize: hp(2.2),
      color: "black",
    },
    buttonContainer: {
      marginTop: hp(3),
      width: '100%',
    },
    gradientButton: {
      borderRadius: 18,
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    submitButtonText: {
      color: 'white',
      fontSize: hp(2.2),
      fontWeight: '600',
    },
    dropdown: {
      height: 60,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: hp(2),
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: hp(2.2),
      color: 'gray',
    },
    selectedTextStyle: {
      fontSize: hp(2.2),
      color: 'black',
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
});