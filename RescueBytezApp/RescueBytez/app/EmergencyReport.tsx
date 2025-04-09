import { StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helper/common';
import BackButton from '@/assets/icons/BackButton';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import * as Location from 'expo-location';
import { API_URL } from '@/Auth/api';

const EmergencyReport = () => {
     const router = useRouter();
       const [loading, setLoading] = useState(false);
       const [Type, setType] = useState('');
       const [description, setdescription] = useState('');
       const [userId, setuserId] = useState('67dd835424c3cba2574447d7');
       const [location, setLocation]=useState<number[]>([]);

       useEffect(() => {
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
          }
          let getLocation = await Location.getCurrentPositionAsync({});
          setLocation([getLocation.coords.latitude,getLocation.coords.longitude]);
        })();
       }, []);

       useEffect(() => {
        console.log(location);
         }, [location]);

       const handleSubmit = async() => {
        setLoading(true);
        try{
          console.log("reachers")
          const response = await fetch(`${API_URL}/emergencyReport`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type:Type,
              description,
              location,
              userId,
            }),
          })
          console.log('here')
          const result = await response.json();
          console.log(result);
        }
        catch(e){
          console.log(e)
        }
        
       
        setTimeout(() => {
          setLoading(false);
        
        }, 1500);
      };
    
  return (
    <ScreenWrapper bg="white">
         <StatusBar style="dark" />
         <Navbar  title ="Emergency" router = {router}/>
         <ScrollView showsVerticalScrollIndicator={false}>
           <View style={styles.container}>
             
   
             <Text style={styles.title}>Emergency Report</Text>
   
             <View style={styles.formContainer}>
               <View style={styles.inputContainer}>
                 <TextInput
                   style={styles.input}
                   placeholder="Type of Emergency"
                   placeholderTextColor="gray"
                   value={Type}
                   onChangeText={setType}
                 />
                 <TextInput
                   style={styles.input}
                   placeholder="Description"
                   placeholderTextColor="gray"
                   keyboardType="phone-pad"
                   value={description}
                   onChangeText={setdescription}
                 />
                
               </View>
   
               <View style={styles.infoContainer}>
                 <Text style={styles.infoText}>
                   Your location will be automatically detected and sent to the nearest rescue center.
                 </Text>
               </View>
   
               <Button 
                 title={loading ? "Submitting..." : "Report"} 
                 onPress={handleSubmit} 
                 buttonStyle={{ 
                   paddingVertical: hp(1.2),
                   paddingHorizontal: wp(4), 
                   marginVertical: hp(2),
                   backgroundColor: "red" 
                 }} 
                 textStyle={{}}
               />
             </View>
           </View>
         </ScrollView>
       </ScreenWrapper>
   
  )
}

export default EmergencyReport

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