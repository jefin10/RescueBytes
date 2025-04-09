import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Navbar from '@/components/Navbar';
import { useRouter } from 'expo-router';

import { useAuth } from '@/Auth/AuthContext';
import api from '@/Auth/apiService';
import { getData, STORAGE_KEYS } from '@/Auth/storage';

const { width } = Dimensions.get('window');

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
}

const News = () => {
  const router = useRouter();
  const { userData } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescueCenterId, setRescueCenterId] = useState('');

  useEffect(() => {
    const getRescueCenter = async () => {
      const rcId = await getData(STORAGE_KEYS.RESCUE_CENTER);
      console.log(rcId);
      setRescueCenterId(rcId || '');
    };
    getRescueCenter();
  }, []);

  const fetchNews = async () => {
    if (!rescueCenterId) return;
    
    try {
      const response = await api.get('/news', {
        params: { rescueCenter: rescueCenterId }
      });
      
      const fetchedNews = response.data.map((item: any) => ({
        id: item._id,
        title: item.title,
        content: item.content,
        image: 'https://via.placeholder.com/150',
        date: new Date(item.createdAt).toLocaleDateString(),
      }));
      
      setNews(fetchedNews);
    } catch (error) {
      console.error('News fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rescueCenterId) {
      fetchNews();
    }
  }, [rescueCenterId]);

  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <Navbar title="News" router={router} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34ae00" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <Navbar title="News" router={router} />
      {news.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No news available</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {news.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.newsContent} numberOfLines={4}>{item.content}</Text>
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
  newsCard: {
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
  newsHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  newsImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  newsTitle: {
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
  newsContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

export default News;