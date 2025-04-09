import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, FlatList, Modal } from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { hp, wp } from '@/helper/common'
import Navbar from '@/components/Navbar'
import { useRouter } from 'expo-router'
import { STORAGE_KEYS,getData } from '@/Auth/storage'
import { API_URL } from '@/Auth/api'

const emergencyTypes = [
  { id: 'flooding', name: 'Flooding', color: '#2196F3' },
  { id: 'fire', name: 'Fire', color: '#FF5722' },
  { id: 'medical', name: 'Medical', color: '#F44336' },
  { id: 'powerout', name: 'Power Outage', color: '#9E9E9E' },
  { id: 'storm', name: 'Storm Damage', color: '#673AB7' },
  { id: 'other', name: 'Other', color: '#795548' },
];
// Moved components outside the main component
const ReportItem = ({ item, setSelectedReport, setModalVisible, getTypeColor, getTypeName }) => (
  <Pressable 
    style={styles.reportItem}
    onPress={() => {
      setSelectedReport(item);
      setModalVisible(true);
    }}
  >
    <View style={styles.reportHeader}>
      <View 
        style={[
          styles.reportTypeTag, 
          { backgroundColor: getTypeColor(item.type) }
        ]}
      >
        <Text style={styles.reportTypeText}>{item.location}</Text>
      </View>
      <Text style={styles.reportTimestamp}>{formatRelativeTime(item.updatedAt)}</Text>
    </View>
    
    <Text style={styles.reportLocation}>{item.type}</Text>
    <Text style={styles.reportDescription} numberOfLines={2}>
      {item.description}
    </Text>
  </Pressable>
);
function formatRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    // Fallback to a standard date format if it's older than a week
    return past.toLocaleDateString();
  }
}

const SubmitForm = ({ 
  newReportType,
  setNewReportType,
  newReportDesc,
  handleDescription,
  newReportLocation,
  setNewReportLocation,
  submitNewReport,
  setShowSubmitForm
}) => {
  const descriptionInputRef = useRef(null);
  const locationInputRef = useRef(null);

  useEffect(() => {
    if (descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!newReportType) {
      alert('Please select an emergency type');
      return;
    }
    if (!newReportDesc.trim()) {
      alert('Please provide a description');
      return;
    }
    if (!newReportLocation.trim()) {
      alert('Please enter a location');
      return;
    }
    submitNewReport();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Text style={styles.formLabel}>Emergency Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeSelector}
          >
            {emergencyTypes.map(type => (
              <Pressable 
                key={type.id} 
                style={[
                  styles.typeOption,
                  newReportType === type.id && { 
                    backgroundColor: type.color,
                    borderColor: type.color 
                  }
                ]}
                onPress={() => setNewReportType(type.id)}
              >
                <Text 
                  style={[
                    styles.typeOptionText,
                    newReportType === type.id && { color: 'white' }
                  ]}
                >
                  {type.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            ref={descriptionInputRef}
            style={styles.descriptionInput}
            placeholder="Describe the emergency situation in detail..."
            multiline
            numberOfLines={4}
            value={newReportDesc}
            onChangeText={handleDescription}
            blurOnSubmit={false}
            returnKeyType="next"
            onSubmitEditing={() => {
              locationInputRef.current?.focus();
            }}
          />
          
          <Text style={styles.formLabel}>Location</Text>
          <TextInput
            ref={locationInputRef}
            style={styles.locationInput}
            placeholder="Enter location details..."
            value={newReportLocation}
            onChangeText={setNewReportLocation}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={handleSubmit}
          />
          
          <View style={styles.formButtons}>
            <Pressable 
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                Keyboard.dismiss();
                setShowSubmitForm(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.formButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const crowd = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('reports');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReportType, setNewReportType] = useState('');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newReportLocation, setNewReportLocation] = useState('');
  const [reports, setReports] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const rcId = await getData(STORAGE_KEYS.USER_ID);
      console.log(rcId);
      setUserId(rcId || '');
    };
    getUser();
  }, []);


  const getReports=async()=>{
    try{
      const response=await fetch(`${API_URL}/getComRepUser`);
      const data=await response.json();
      const sortedReports = [...data].sort((a, b) => {
        // Ensure converting to Date object and handling potential null/undefined
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        
        return dateB - dateA;
      });
      
      setReports(sortedReports);

    }catch(error){
      console.error(error);
    }
  }
 
  const handleSubmit=async()=>{
    try{
      const response = await fetch(`${API_URL}/addComRep`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newReportType,
          description: newReportDesc,
          location: newReportLocation,
          user:userId
        }),
      })
      alert('Report submitted successfully!');
      setShowSubmitForm(false);
      setNewReportType('');
      setNewReportDesc('');
      setNewReportLocation('');
    }catch(error){
      console.error(error);
    }
  }
  useEffect(() => {
    getReports();
  }, []);

  const getTypeColor = useCallback((typeId) => {
    const type = emergencyTypes.find(t => t.id === typeId);
    return type ? type.color : '#50C878';
  }, []);

  const getTypeName = useCallback((typeId) => {
    const type = emergencyTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }, []);

  const openSubmitForm = useCallback(() => {
    setShowSubmitForm(true);
  }, []);

  const submitNewReport = useCallback(() => {
    alert('Report submitted successfully!');
    setShowSubmitForm(false);
    setNewReportType('');
    setNewReportDesc('');
    setNewReportLocation('');
  }, []);

  const handleDescription = useCallback((text) => {
    setNewReportDesc(text);
  }, []);

  const renderReportItem = useCallback(({ item }) => (
    <ReportItem
      item={item}
      setSelectedReport={setSelectedReport}
      setModalVisible={setModalVisible}
      getTypeColor={getTypeColor}
      getTypeName={getTypeName}
    />
  ), []);

  return (
    <ScreenWrapper bg="white">
      <Navbar router={router} title="Local Reports"/>
      
      <View style={styles.container}>
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
        
        <Pressable style={styles.createReportButton} onPress={openSubmitForm}>
          <Text style={styles.createReportText}>Report an Emergency</Text>
        </Pressable>
        
        <Modal
          visible={showSubmitForm}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSubmitForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report an Emergency</Text>
                <Pressable onPress={() => setShowSubmitForm(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>
              <SubmitForm
                newReportType={newReportType}
                setNewReportType={setNewReportType}
                newReportDesc={newReportDesc}
                handleDescription={handleDescription}
                newReportLocation={newReportLocation}
                setNewReportLocation={setNewReportLocation}
                submitNewReport={handleSubmit}
                setShowSubmitForm={setShowSubmitForm}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  )
}


export default crowd

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: wp(4),
    },
    // Tabs
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: '#F0F0F0',
      borderRadius: hp(2),
      marginBottom: hp(2),
      overflow: 'hidden',
    },
    tab: {
      flex: 1,
      paddingVertical: hp(1.2),
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: '#50C878',
    },
    tabText: {
      fontSize: hp(1.7),
      fontWeight: '600',
      color: '#666',
    },
    activeTabText: {
      color: 'white',
    },
    
    // Map View
    mapContainer: {
      flex: 1,
      borderRadius: hp(2),
      overflow: 'hidden',
      marginBottom: hp(2),
    },
    mapPlaceholder: {
      height: hp(40),
      backgroundColor: '#E1E1E1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapPlaceholderText: {
      fontSize: hp(2),
      fontWeight: '600',
      color: '#666',
    },
    mapSubtext: {
      fontSize: hp(1.6),
      color: '#999',
      marginTop: hp(1),
    },
    mapLegend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: 'white',
      padding: hp(1.5),
      borderTopWidth: 1,
      borderColor: '#E0E0E0',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: wp(4),
      marginVertical: hp(0.5),
    },
    legendColor: {
      width: hp(1.5),
      height: hp(1.5),
      borderRadius: hp(0.75),
      marginRight: wp(1),
    },
    legendText: {
      fontSize: hp(1.4),
      color: '#555',
    },
    
    // List View
    listContainer: {
      paddingBottom: hp(12),
    },
    reportItem: {
      backgroundColor: 'white',
      borderRadius: hp(2),
      marginBottom: hp(2),
      padding: hp(1.5),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    reportTypeTag: {
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.4),
      borderRadius: hp(1),
    },
    reportTypeText: {
      color: 'white',
      fontSize: hp(1.4),
      fontWeight: '600',
    },
    reportTimestamp: {
      fontSize: hp(1.4),
      color: '#888',
    },
    reportLocation: {
      fontSize: hp(1.8),
      fontWeight: '600',
      color: '#333',
      marginBottom: hp(0.5),
    },
    reportDescription: {
      fontSize: hp(1.6),
      color: '#555',
      lineHeight: hp(2.2),
      marginBottom: hp(1.5),
    },
    reportFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reportStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reportUpvotes: {
      fontSize: hp(1.5),
      color: '#666',
      marginRight: wp(2),
    },
    verifiedTag: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: hp(1),
    },
    verifiedText: {
      color: 'white',
      fontSize: hp(1.3),
      fontWeight: '500',
    },
    reportImagePreview: {
      position: 'relative',
    },
    previewImage: {
      width: hp(6),
      height: hp(6),
      borderRadius: hp(1),
    },
    imageCount: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: hp(0.8),
      paddingHorizontal: wp(1),
      paddingVertical: hp(0.2),
    },
    imageCountText: {
      color: 'white',
      fontSize: hp(1.1),
      fontWeight: '500',
    },
    
    // Create Report Button
    createReportButton: {
      position: 'absolute',
      bottom: hp(3),
      left: wp(4),
      right: wp(4),
      backgroundColor: '#50C878',
      borderRadius: hp(2),
      padding: hp(1.8),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    createReportText: {
      color: 'white',
      fontWeight: '700',
      fontSize: hp(1.8),
    },
    
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: hp(2.5),
      borderTopRightRadius: hp(2.5),
      padding: hp(2),
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2),
      paddingBottom: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
      fontSize: hp(2.2),
      fontWeight: '700',
      color: '#333',
    },
    closeButton: {
      fontSize: hp(2.2),
      color: '#666',
      padding: hp(1),
    },
    
    // Report Details
    detailsContainer: {
      paddingBottom: hp(2),
    },
    detailsTypeTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: hp(1),
      marginBottom: hp(2),
    },
    detailsTypeText: {
      color: 'white',
      fontSize: hp(1.6),
      fontWeight: '600',
    },
    detailsTitle: {
      fontSize: hp(1.7),
      fontWeight: '700',
      color: '#555',
      marginBottom: hp(0.5),
      marginTop: hp(1.5),
    },
    detailsContent: {
      fontSize: hp(1.7),
      color: '#333',
      lineHeight: hp(2.3),
    },
    imageGallery: {
      flexDirection: 'row',
      paddingVertical: hp(1),
    },
    galleryImage: {
      width: hp(12),
      height: hp(12),
      borderRadius: hp(1.5),
      marginRight: wp(2),
    },
    detailsActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(3),
    },
    actionButton: {
      flex: 1,
      backgroundColor: '#4CAF50',
      borderRadius: hp(1.5),
      paddingVertical: hp(1.5),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    emergencyButton: {
      backgroundColor: '#F44336',
    },
    actionButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: hp(1.6),
    },
    
    // Submit Form
    formContainer: {
      paddingBottom: hp(2),
    },
    formTitle: {
      fontSize: hp(2),
      fontWeight: '700',
      color: '#333',
      marginBottom: hp(2),
    },
    formLabel: {
      fontSize: hp(1.7),
      fontWeight: '600',
      color: '#555',
      marginBottom: hp(1),
      marginTop: hp(1.5),
    },
    typeSelector: {
      flexDirection: 'row',
      paddingVertical: hp(1),
    },
    typeOption: {
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: hp(1.5),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
      marginRight: wp(2),
      backgroundColor: '#F5F5F5',
    },
    typeOptionText: {
      fontSize: hp(1.5),
      color: '#555',
      fontWeight: '500',
    },
    descriptionInput: {
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: hp(1.5),
      padding: hp(1.5),
      fontSize: hp(1.6),
      color: '#333',
      backgroundColor: '#FAFAFA',
      textAlignVertical: 'top',
      minHeight: hp(12),
    },
    locationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: hp(1.5),
      padding: hp(1.5),
      backgroundColor: '#FAFAFA',
    },
    currentLocationText: {
      fontSize: hp(1.6),
      color: '#333',
    },
    changeLocationButton: {
      padding: hp(0.5),
    },
    changeLocationText: {
      fontSize: hp(1.5),
      color: '#2196F3',
      fontWeight: '500',
    },
    photoButton: {
      borderWidth: 1,
      borderColor: '#2196F3',
      borderRadius: hp(1.5),
      paddingVertical: hp(1.2),
      alignItems: 'center',
      backgroundColor: '#E3F2FD',
    },
    photoButtonText: {
      fontSize: hp(1.6),
      color: '#2196F3',
      fontWeight: '500',
    },
    formButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(3),
    },
    formButton: {
      flex: 1,
      paddingVertical: hp(1.5),
      borderRadius: hp(1.5),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    cancelButton: {
      backgroundColor: '#F5F5F5',
      borderWidth: 1,
      borderColor: '#DDD',
    },
    cancelButtonText: {
      color: '#666',
      fontWeight: '600',
      fontSize: hp(1.6),
    },
    submitButton: {
      backgroundColor: '#50C878',
    },
    submitButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: hp(1.6),
    },
    locationInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 10,
      backgroundColor: '#FAFAFA',
      marginBottom: 15,
      minHeight: 50,
    },
  });