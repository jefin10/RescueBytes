import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState,useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helper/common';
import BackButton from '@/assets/icons/BackButton';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import {STORAGE_KEYS, storeData, getData} from '../Auth/storage.ts';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry.js';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '@/Auth/api.js';


const ros = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [item, setItem] = useState('');
  const [count, setCount] = useState('');
  const [userId, setUserId] = useState('');
  const [previousRequests,setPreviousRequests]=useState([]);

  const setUserID=async()=>{
    try{
      const userID2 = await getData(STORAGE_KEYS.USER_ID);
      setUserId(userID2);
    }catch(error){
      console.error(error);
    }
  }

  const getUserReq = async () => {
    try {
      console.log("Fetching user request for ID:", userId);
  
      const response = await fetch(`${API_URL}/getUserReqbyId/${userId}`);
      console.log(response);
      // Log response status and headers
      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);
  
      // Read response as text first
      const responseText = await response.text();
      console.log("Full Response Body:", responseText);
  
      // Check if the response is HTML (which indicates an error page)
      if (responseText.startsWith("<") || responseText.includes("<html")) {
        console.error("Received an HTML error page instead of JSON.");
        return;
      }
  
      // Parse JSON only if it's valid
      const data = JSON.parse(responseText);
      
      console.log("Parsed JSON Data:", data);
      setPreviousRequests(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  

  
  const handleSubmit = async() => {
    setLoading(true);
    console.log('Here')
    try{
      console.log('Here')
      const userID = await getData(STORAGE_KEYS.USER_ID);
      setUserId(userID);
      const response= await fetch(`${API_URL}/addUserReq`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: category,
          item: item,
          count: count,
          status:"pending",
          user: userID
        }),
      });
      const data = await response.json();
      console.log(data)
    }catch(error){
      console.log(error)
    }
    
    setTimeout(() => {
      setLoading(false);
      setName('');
      setCategory('');
      setItem('');
      setCount('');
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'Approved':
        return '#2196F3';
      case 'Waiting':
        return '#FF9800';
      case 'Rejected':
        return '#F44336';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userID2 = await getData(STORAGE_KEYS.USER_ID);
        setUserId(userID2);  // This is async, so we can't use `userId` immediately
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUserData();
  }, []);
  
  // When userId updates, fetch requests
  useEffect(() => {
    if (userId) {  // Only call getUserReq when userId is available
      getUserReq();
    }
  }, [userId]); 

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <Navbar title="Request" router={router}/>
      <View style={styles.container}>
        

              <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Form</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="gray"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="gray"
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Item"
              placeholderTextColor="gray"
              value={item}
              onChangeText={setItem}
            />
            <TextInput
              style={styles.input}
              placeholder="Count"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={count}
              onChangeText={setCount}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={['#00b4db', '#0083b0']} 
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitButtonText}>
                Submit Request
              </Text>
            </LinearGradient>
           
          </TouchableOpacity>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>Status</Text>
          <ScrollView style={styles.requestsList}>
            {previousRequests.map((request) => (
              <View key={request._id} style={styles.requestItem}>
                <View style={styles.requestDetails}>
                  <Text style={styles.requestName}>{request.type}</Text>
                  <Text style={styles.requestInfo}>{request.item} -  ({request.count})</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                  <Text style={styles.statusText}>{request.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ros;

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
  title: {
    fontSize: hp(4),
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: hp(1),
    color: "black",
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 15,
    overflow: 'hidden', // This ensures the gradient respects the border radius
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    marginTop: hp(2),
    padding: hp(2),
    backgroundColor: 'white',
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusContainer: {
    marginTop: hp(2),
    padding: hp(2),
    backgroundColor: 'white',
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: hp(2),
    flex: 1,
  },
  sectionTitle: {
    fontSize: hp(2.8),
    fontWeight: '700',
    color: "black",
    marginBottom: hp(2),
  },
  inputContainer: {
    gap: hp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 14,
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(2),
    fontSize: hp(2.2),
    color: "black",
  },
  requestsList: {
    flex: 1,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: 'black',
  },
  requestInfo: {
    fontSize: hp(1.8),
    color: 'gray',
    marginTop: hp(0.5),
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 20,
    marginLeft: wp(2),
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: hp(1.8),
  },
});