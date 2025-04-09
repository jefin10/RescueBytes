import { StyleSheet, Text, TextInput, View, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helper/common';
import BackButton from '@/assets/icons/BackButton';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import { API_URL } from '@/Auth/api';
import { STORAGE_KEYS, storeData, getData } from '@/Auth/storage.ts';
import { useAuth } from '@/Auth/AuthContext';

const volunteer = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [expertise, setExpertise] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState(null);
  const { logout } = useAuth(); // Get the logout function from AuthContext

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getData(STORAGE_KEYS.USER_ROLE);
      setUserRole(role);
      if(role === 'volunteer'){
        router.push('/vMessages');
      }
    };
    fetchUserRole();
  }, []);

  // Function to validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async() => {
    // Form validation
    if (!name.trim() || !phoneNumber.trim() || !address.trim() || !expertise.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    const userId = await getData(STORAGE_KEYS.USER_ID);
    const rescueCenterId = await getData(STORAGE_KEYS.RESCUE_CENTER);

    console.log('Using credentials:', { userId, email, rescueCenterId });
    
    // Email validation
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    console.log("Submitting volunteer form...");
    
    try {
      const response = await fetch(`${API_URL}/volunteerSignup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phNo: phoneNumber,
          address,
          fieldOfExpertise: expertise,
        }),
      });
      
      console.log('Response status:', response.status);
      
      // Parse response
      let result;
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }

      console.log('Parsed response data:', result);
      
      // Regardless of response success, proceed with logout
      Alert.alert(
        'Registration Submitted',
        'Your volunteer registration has been submitted. Please log in again to activate your volunteer status.',
        [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                console.log('Starting logout process...');
                await logout();
                console.log('Logout successful, redirecting to login');
                router.replace('/');
              } catch (err) {
                console.error('Error during logout:', err);
                // Force navigation even if logout fails
                router.replace('/');
              }
            } 
          }
        ]
      );
    } catch (e) {
      console.error('Error submitting form:', e);
      Alert.alert(
        'Registration Submitted', 
        'Your request has been processed. Please log in again to continue.',
        [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                await logout();
                router.replace('/');
              } catch (err) {
                router.replace('/');
              }
            } 
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <Navbar title="Volunteer Page" router={router}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.caption}>Make a Difference!</Text>
          <Text style={styles.title}>Volunteer Registration</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="gray"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="gray"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="gray"
                multiline
                numberOfLines={3}
                value={address}
                onChangeText={setAddress}
                textAlignVertical="top"
              />
              <TextInput
                style={styles.input}
                placeholder="Field of Expertise"
                placeholderTextColor="gray"
                value={expertise}
                onChangeText={setExpertise}
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                By registering as a volunteer, you agree to dedicate your time and skills to help others in need. Our team will contact you shortly to discuss available opportunities.
              </Text>
            </View>

            <Button 
              title={loading ? "Submitting..." : "Register as Volunteer"} 
              onPress={handleSubmit} 
              buttonStyle={{ 
                paddingVertical: hp(1.2),
                paddingHorizontal: wp(4), 
                marginVertical: hp(2),
                backgroundColor: loading ? "#6baa7f" : "green" 
              }} 
              textStyle={{}}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default volunteer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
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
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: hp(1),
    color: "black",
  },
  formContainer: {
    marginTop: hp(2),
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
  infoContainer: {
    marginTop: hp(3),
    padding: hp(2),
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  infoText: {
    fontSize: hp(1.8),
    color: "#444",
    lineHeight: hp(2.4),
  }
});