import { 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  Alert 
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/helper/common';
import Navbar from '@/components/Navbar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/Auth/AuthContext';
import { getData, STORAGE_KEYS } from '@/Auth/storage';
import { API_URL } from '../Auth/api';

// Moved InfoItem outside the Profile component
const InfoItem = ({ label, value, field, isEditing, userInfo, handleChange }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isEditing ? (
      <TextInput
        style={styles.infoInput}
        value={userInfo[field]}
        onChangeText={(text) => handleChange(field, text)}
      />
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

const Profile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    rescuecenter: "",
    address: "",
    phone: ""
  });
  
  const { logout } = useAuth();

  const fetchProfile = useCallback(async () => {
    try {
      const usId = await getData(STORAGE_KEYS.USER_ID);
      if (!usId) {
        Alert.alert("Error", "User ID not found");
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/users/${usId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to load profile");
    }
  }, []);

  useEffect(() => { fetchProfile() }, [fetchProfile]);

  const handleLogout = async () => {
    const success = await logout();
    success ? router.push("/") : Alert.alert("Error", "Logout failed");
  };

  // Memoized handleChange to prevent unnecessary re-renders
  const handleChange = useCallback((field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateProfile = async () => {
    try {
      const usId = await getData(STORAGE_KEYS.USER_ID);
      const response = await fetch(`${API_URL}/auth/users/${usId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo)
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        Alert.alert("Success", "Profile updated");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Profile update failed");
    }
  };

  const handleEdit = async () => {
    if (isEditing) await updateProfile();
    setIsEditing(!isEditing);
  };

  return (
    <ScreenWrapper bg="white">
      <Navbar router={router} title="Profile" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <Pressable style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          
          {/* InfoItems with required props */}
          <InfoItem 
            label="Name"
            field="name"
            isEditing={isEditing}
            userInfo={userInfo}
            handleChange={handleChange}
            value={userInfo.name}
          />
          <InfoItem 
            label="Email"
            field="email"
            isEditing={isEditing}
            userInfo={userInfo}
            handleChange={handleChange}
            value={userInfo.email}
          />
          <InfoItem 
            label="Address"
            field="address"
            isEditing={isEditing}
            userInfo={userInfo}
            handleChange={handleChange}
            value={userInfo.address}
          />
          <InfoItem 
            label="Phone"
            field="phone"
            isEditing={isEditing}
            userInfo={userInfo}
            handleChange={handleChange}
            value={userInfo.phone}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.divider} />
          <Pressable style={styles.settingItem}>
            <Text style={styles.settingText}>Delete Account</Text>
          </Pressable>
          <Pressable 
            style={[styles.settingItem, styles.logoutItem]} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: wp(4),
    paddingBottom: hp(3),
  },
  // Card styling (used for both personal info & settings)
  card: {
    backgroundColor: '#F7F9FC',
    borderRadius: hp(2),
    padding: hp(2),
    marginBottom: hp(2.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4ECDC4', // Accent color matching home theme
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  cardTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#1A535C',
  },
  editButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: hp(1.5),
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: hp(1.6),
  },
  divider: {
    height: hp(0.2),
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: hp(1),
  },
  // Info Items
  infoItem: {
    marginVertical: hp(1),
  },
  infoLabel: {
    fontSize: hp(1.6),
    color: '#666',
    marginBottom: hp(0.5),
  },
  infoValue: {
    fontSize: hp(1.8),
    color: '#333',
    fontWeight: '500',
  },
  infoInput: {
    fontSize: hp(1.8),
    color: '#333',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: hp(1),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.8),
    backgroundColor: 'white',
  },
  // Settings Section Items
  settingItem: {
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingText: {
    fontSize: hp(1.8),
    color: '#1A535C',
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: hp(1.8),
    color: '#F44336',
    fontWeight: '600',
  },
});
