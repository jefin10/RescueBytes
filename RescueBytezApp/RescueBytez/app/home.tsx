import { Pressable, StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import BackButton from '@/assets/icons/BackButton'
import { hp, wp } from '@/helper/common'
import Button from '@/components/Button'
import Navbar from '@/components/Navbar'
import { useNavigation, useRouter } from 'expo-router'
import { TouchableOpacity, SafeAreaView } from 'react-native'
import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { getData, STORAGE_KEYS } from '@/Auth/storage'
import api from '@/Auth/apiService'
import axios from 'axios'
import * as Location from 'expo-location'
import {API_URL} from '../Auth/api'

const Home = () => {
  const router = useRouter();
  
  // Add state to track user role
  const [userRole, setUserRole] = useState('');
  
  // Fetch user role on component mount
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await getData(STORAGE_KEYS.USER_ROLE);
        setUserRole(role || '');
        console.log('User role:', role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    getUserRole();
  }, []);
  
  interface NewsItem {
    id: string;
    title: string;
    content: string;
    image: string;
    date: string;
  }

  const [newsItems, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescueCenterId, setRescueCenterId] = useState('');
  const [alert, setAlert] = useState({
    title: 'No alerts right now',
    description: 'Stay safe and be prepared',
  });

  // State to toggle expanded view for the alert banner
  const [alertExpanded, setAlertExpanded] = useState(false);
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

  const fetchAlert = async () => {
    const rescueCenterId = await getData(STORAGE_KEYS.RESCUE_CENTER);

    try {
      const response = await axios.post(`${API_URL}/getLatestAlerts`, { rescueCenterId });
      const data = response.data; // No need for response.json()
      setAlert(data);
      console.log(data); // Log the fetched data directly
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [])

  useEffect(() => {
    if (rescueCenterId) {
      fetchNews();
    }
  }, [rescueCenterId]);

  const [currentTab, setCurrentTab] = useState('home');
  
  // Function to handle volunteer navigation based on role
  const handleVolunteerNavigation = () => {
    if (userRole === 'volunteer') {
      console.log('Routing to volunteer messages');
      router.push('/vMessages'); 
    } else {
      console.log('Routing to volunteer registration');
      router.push('/volunteer');
    }
  };
  
  // Updated emergency services array with handler for volunteer
  const emergencyServices = [
    { id: 1, title: 'Request Items', icon: 'hand-heart', route: '/ros', color: '#2ecc71' },
    { 
      id: 2, 
      title: 'Volunteer', 
      icon: 'account-group', 
      color: '#1abc9c',
      handler: handleVolunteerNavigation
    },
    { id: 3, title: 'SOS', icon: 'alert-octagon', route: '/SOS', color: '#e74c3c' },
    { id: 4, title: 'Report', icon: 'file-document-outline', route: '/crowd', color: '#34495e' }
  ];
  
  const [weatherData, setWeatherData] = useState(null);
  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [gradientColor, setGradient] = useState(['#000428', '#004e92']);
  const [latitude, setLatitude] = useState('9.7453');
  const [longitude, setLongitude] = useState('76.6442');
  const [dailyForecast, setDailyForecast] = useState([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);


  useEffect(() => {
    loadWeather();
  }, [latitude, longitude]);

  const loadWeather = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
      );
      const data = await response.json();
      
      if (data.current_weather) {
        setCurrentTemperature(data.current_weather.temperature);
      }
      if (data.daily) {
        setDailyForecast(
          data.daily.time.map((dateString, index) => {
            // Explicitly parse the date string, assuming it's in ISO format (YYYY-MM-DD)
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
              console.error('Invalid date:', dateString);
              return null;
            }
            
            return {
              date: date,
              maxTemp: data.daily.temperature_2m_max[index],
              minTemp: data.daily.temperature_2m_min[index],
            };
          }).filter(item => item !== null) // Remove any invalid entries
        );
      }
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  const [city, setCity] = useState('');
  const [weatherSummary, setWeatherSummary] = useState('');

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      try {
        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setLatitude(currentLocation.coords.latitude)
        setLongitude(currentLocation.coords.longitude)
        // Send coordinates to backend
        const response = await axios.post(`${API_URL}/chat/weather`, {
          lat: currentLocation.coords.latitude,
          lon: currentLocation.coords.longitude
        });

        // Assuming the backend returns both city and weather summary
        setCity(response.data.city);
        setWeatherSummary(response.data.weatherSummary);

      } catch (error) {
        console.error('Error fetching location or weather:', error);
      }
    };

    fetchLocationAndWeather();
  }, []);
  const getWeatherIcon = (temperature, isDay = true) => {
    if (temperature < 10) return 'weather-snowy';
    if (temperature < 20) {
      return isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy';
    }
    return isDay ? 'weather-sunny' : 'weather-night';
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Alert': return '#FF6B6B';
      case 'Warning': return '#FFE66D';
      case 'Community': return '#4ECDC4';
      default: return '#4ECDC4';
    }
  };

  return (
    <ScreenWrapper bg="#F7F9FC">
      <Navbar router={router} title="RescueBytz" st={false}/>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
      <TouchableOpacity 
          style={styles.alertBanner} 
          onPress={() => setAlertExpanded(!alertExpanded)}
        >
          {/* Warning icon */}
          <Ionicons name="warning" size={24} color="#fff" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertText}>Emergency Alerts: {alert.title}</Text>
            {alertExpanded && (
              <Text style={styles.alertDescription}>{alert.description}</Text>
            )}
          </View>
          <Ionicons 
            name={alertExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>

        {/* Weather Card */}
        <LinearGradient
          colors={['#4ECDC4', '#1A535C']}
          style={styles.weatherCard}
        >
          <View style={styles.weatherHeader}>
            <View style={styles.currentWeather}>
              <MaterialCommunityIcons 
                name={getWeatherIcon(currentTemperature || 12, true)} 
                size={36} 
                color="#fff" 
              />
              <View style={styles.tempContainer}>
                <Text style={styles.currentTemp}>
                  {currentTemperature ? `${currentTemperature}°` : '12°'}
                </Text>
                <Text style={styles.location}>{city}</Text>
              </View>
            </View>
            <Text style={styles.weatherDesc}>
              {weatherSummary}
            </Text>
          </View>
          
          <View style={styles.forecastContainer}>
            {dailyForecast.slice(0, 5).map((day, index) => (
              <View key={index} style={styles.forecastDay}>
                <Text style={styles.forecastDayText}>
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <MaterialCommunityIcons 
                  name={getWeatherIcon(day.maxTemp, true)} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.forecastTemp}>
                  {`${Math.round(day.maxTemp)}°`}
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.weatherDetailsButton}
            onPress={() => router.push('./Weather')}
          >
            <Text style={styles.weatherDetailsText}>View Details</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Emergency Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
          <View style={styles.servicesGrid}>
            {emergencyServices.map(service => (
              <TouchableOpacity 
                key={service.id} 
                style={[styles.serviceCard, { backgroundColor: service.color }]}
                onPress={() => {
                  if (service.handler) {
                    service.handler();
                  } else if (service.route) {
                    router.push(service.route);
                  }
                }}
              >
                <MaterialCommunityIcons name={service.icon} size={32} color="#fff" />
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Chat Support */}
        <TouchableOpacity 
          style={styles.chatSupport}
          onPress={() => router.push('/chat')}
        >
          <View style={styles.chatContent}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <View style={styles.chatTextContainer}>
              <Text style={styles.chatTitle}>AI Support</Text>
              <Text style={styles.chatSubtitle}>Chat with emergency assistant</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* News & Updates */}
        <View style={styles.newsSection}>
          <View style={styles.newsTitleRow}>
            <Text style={styles.sectionTitle}>News & Updates</Text>
            <TouchableOpacity onPress={() => router.push('/News')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {newsItems.slice(0, 3).map(item => (
            <TouchableOpacity key={item.id} style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <Text style={styles.newsTime}>{item.date}</Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSummary}>{item.content}</Text>
            </TouchableOpacity>
          ))}
        </View>

       
      </ScrollView>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    marginHorizontal: wp(4),
    marginTop: hp(2),
    backgroundColor: "#FF3B30",
    borderRadius: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePic: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: '#E1E1E1',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
 
  alertText: {
    color: 'white',
    fontWeight: '600',
    flex: 1,
    marginLeft: wp(3),
    fontSize: hp(1.8),
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B', // Changed background color for emergency alerts
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  alertIconContainer: {
    marginRight: 10,
  },
  alertDescription: {
    marginTop: 5,
    paddingLeft:13,
    color: '#fff',
    fontSize: hp(1.8),
  },
  // Weather Section
  weatherCard: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
    borderRadius: hp(2),
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: "row",
    backgroundColor: '#50C878',
    padding: hp(2),
  },
  weatherTemperatureContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    paddingRight: wp(2),
  },
  weatherTemperatureText: {
    fontSize: hp(4.5),
    fontWeight: 'bold',
    color: 'white',
  },
  weatherLocationText: {
    fontSize: hp(1.8),
    color: 'white',
    marginTop: hp(0.5),
  },
  weatherForecastContainer: {
    flex: 3,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  dayForecast: {
    alignItems: "center",
  },
  dayText: {
    fontSize: hp(1.6),
    color: 'white',
    marginBottom: hp(0.5),
  },
  dayTemp: {
    fontSize: hp(2),
    fontWeight: '700',
    color: 'white',
  },
  weatherDetails: {
    backgroundColor: '#E8F5E9',
    padding: hp(2),
    alignItems: "center",
  },
  weatherDetailsText: {
    textAlign: 'center',
    fontSize: hp(1.7),
    color: '#2E7D32',
    lineHeight: hp(2.5),
    marginBottom: hp(1.5),
  },
  
  // Action Buttons
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(4),
    marginTop: hp(2.5),
  },
  mainActionButton: {
    flex: 1,
    backgroundColor: '#50C878',
    paddingVertical: hp(1.8),
    borderRadius: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainActionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: hp(1.8),
  },
  
  // News Section
  newsContainer: {
    marginHorizontal: wp(4),
    marginTop: hp(2.5),
    padding: hp(2),
    backgroundColor: '#E8F5E9',
    borderRadius: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: hp(1.5),
  },
  newsItem: {
    flexDirection: 'row',
    marginBottom: hp(1.5),
    padding: hp(1.5),
    backgroundColor: 'white',
    borderRadius: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  newsContent: {
    flex: 3,
    marginRight: wp(2),
    justifyContent: 'center',
  },
  newsTitle: {
    fontSize: hp(1.8),
    fontWeight: '500',
    color: '#333',
  },
  newsImageContainer: {
    width: hp(6),
    height: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    borderRadius: hp(1),
  },
  actionButton: {
    alignSelf: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: '#50C878',
    borderRadius: hp(1.5),
    marginTop: hp(1),
  },
  actionButtonText: {
    fontWeight: '600',
    color: 'white',
    fontSize: hp(1.6),
  },
  
  // Emergency Contact
  emergencyContainer: {
    marginHorizontal: wp(4),
    marginTop: hp(2.5),
    marginBottom: hp(3),
    padding: hp(2),
    backgroundColor: '#FFEBEE',
    borderRadius: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#C62828',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  emergencyButtonContainer: {
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: hp(1.8),
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  
  // Weather Card
  weatherCard: {
    borderRadius: 16,
    marginTop: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    marginBottom: 15,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tempContainer: {
    marginLeft: 10,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  location: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  weatherDesc: {
    color: '#fff',
    fontSize: 14,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 5,
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  weatherDetailsButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  weatherDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Emergency Services
  servicesSection: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A535C',
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceTitle: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  
  // Chat Support
  chatSupport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A535C',
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 25,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextContainer: {
    marginLeft: 15,
  },
  chatTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  chatSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  
  // News Section
  newsSection: {
    marginBottom: 20,
  },
  newsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    color: '#4ECDC4',
    fontWeight: '500',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  newsCategory: {
    fontWeight: '600',
    fontSize: 13,
  },
  newsTime: {
    color: '#999',
    fontSize: 12,
  },
  newsTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  newsSummary: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Emergency Contact Button
  emergencyContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 16,
    marginBottom: 100,
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#4ECDC4',
  },
  navText: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },
  activeNavText: {
    color: '#4ECDC4',
    fontWeight: '500',
  },
  sosButton: {
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sosGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  sosText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});