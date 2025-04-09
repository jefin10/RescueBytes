import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Navbar from '@/components/Navbar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/Auth/AuthContext';
import api from '@/Auth/apiService';
import { getData, STORAGE_KEYS } from '@/Auth/storage';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  title: string;
  content: string;
  date: string;
}

const vMessages = () => {
  const router = useRouter();
  const { userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescueCenterId, setRescueCenterId] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getRescueCenter = async () => {
      const rcId = await getData(STORAGE_KEYS.RESCUE_CENTER);
      const usId=await getData(STORAGE_KEYS.USER_ID);
      console.log(rcId);
      setRescueCenterId(rcId || '');
      setUserId(usId)
    };
    getRescueCenter();
  }, []);

  const fetchMessages = async () => {
    if (!rescueCenterId) return;
    
    try {
      const response = await api.get(`/getVolMessagebyId/${userId}`, {
        params: { rescueCenter: rescueCenterId }
      });
    
      
      const fetchedMessages = response.data.map((item: any) => ({
        id: item._id,
        subject: item.subject,
        message: item.message,
        date: new Date(item.createdAt).toLocaleDateString(),
      }));
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Messages fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rescueCenterId) {
      fetchMessages();
    }
  }, [rescueCenterId]);

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <Navbar title="Messages" router={router} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34ae00" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <Navbar title="Messages" router={router} />
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages available</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {messages.map((item) => (
            <View key={item.id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.messageTitle} numberOfLines={2}>{item.subject}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.messageContent} numberOfLines={4}>{item.message}</Text>
              </View>
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  messageImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  contentContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  messageContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

export default vMessages;