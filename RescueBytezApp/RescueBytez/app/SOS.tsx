import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenWrapper from '@/components/ScreenWrapper';
import Navbar from '@/components/Navbar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/Auth/AuthContext';
import api from '@/Auth/apiService';
import { getData, STORAGE_KEYS } from '@/Auth/storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const SOS = () => {

  const router = useRouter();
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      // Request location permissions when component mounts
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        return;
      }

      // Get the current location
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(currentLocation);
      } catch (error) {
        setLocationErrorMsg('Error getting location');
        console.error('Location error:', error);
      }
    })();
  }, []);

  // Update the handleSOSPress function
const handleSOSPress = async () => {
  setIsLoading(true);
  try {
    const rescueCenterId = await getData(STORAGE_KEYS.RESCUE_CENTER);
    
    if (!rescueCenterId) {
      Alert.alert(
        "Setup Required",
        "Please select a rescue center in your profile settings first.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
      return;
    }
    
    // Send SOS alert with location coordinates to the backend
    await api.post('/sos/', {
      userId: userData?.userId,
      rescueCenter: rescueCenterId,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      } : 'Location unavailable',
    });
    
    Alert.alert(
      "Emergency Alert Sent",
      "Help is on the way. Stay calm and remain in a safe location if possible.",
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error('SOS alert error:', error);
    Alert.alert(
      "Error",
      "Failed to send emergency alert. Please try again or call emergency services directly.",
      [{ text: "OK" }]
    );
  } finally {
    setIsLoading(false);
  }
};
  return (
    <ScreenWrapper bg="white">
      <Navbar title="Emergency SOS" router={router} />
      <View style={styles.container}>
        <View style={styles.sosSection}>
          <Text style={styles.sectionTitle}>Emergency Assistance</Text>
          <Text style={styles.sectionDescription}>
            Press the SOS button below to send an immediate alert to the rescue center with your current location. 
            Use only in case of life-threatening emergencies.
          </Text>
          
          {locationErrorMsg ? (
            <Text style={styles.locationError}>
              {locationErrorMsg}. Your SOS can still be sent but without precise location.
            </Text>
          ) : location ? (
            <Text style={styles.locationConfirm}>
              Location services ready. Your coordinates will be sent with the alert.
            </Text>
          ) : (
            <Text style={styles.locationLoading}>Getting your location...</Text>
          )}
          
          <TouchableOpacity 
            style={styles.sosButton} 
            onPress={handleSOSPress}
            disabled={isLoading}
          >
            <Feather name="alert-circle" size={32} color="white" />
            <Text style={styles.sosText}>
              {isLoading ? "SENDING ALERT..." : "SOS EMERGENCY"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  sosSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
    alignSelf: 'flex-start',
  },
  locationError: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  locationConfirm: {
    color: '#34ae00',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  locationLoading: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  sosButton: {
    backgroundColor: '#ff3b30',
    width: width * 0.8,
    height: 80,
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  sosText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default SOS;