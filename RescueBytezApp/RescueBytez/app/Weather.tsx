import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { useRouter } from 'expo-router';

interface ForecastItem {
  date: string;
  maxTemp: number;
  minTemp: number;
}

const Weather = () => {
    const router = useRouter();
    const [weatherData, setWeatherData] = useState<any>(null);
    const [currentTemperature, setCurrentTemperature] = useState<number | null>(null);
    const [latitude, setLatitude] = useState('9.7453');
    const [longitude, setLongitude] = useState('76.6442');
    const [dailyForecast, setDailyForecast] = useState<ForecastItem[]>([]);

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
                    data.daily.time.map((date: string, index: number) => ({
                        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                        maxTemp: data.daily.temperature_2m_max[index],
                        minTemp: data.daily.temperature_2m_min[index],
                    }))
                );
            }
            setWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    return (
        <ScreenWrapper bg='white'>
            <Navbar title='Weather'  router={router}/>
            <ScrollView>
                <SafeAreaView style={styles.container}>
                    <View style={styles.circleContainer}>
                        <View style={styles.circle}>
                            <Text style={styles.condition}>Current Temperature</Text>
                            <Text style={styles.temperature}>
                                {currentTemperature ? `${currentTemperature}°C` : '--'}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.forecastContainer}>
                        <Text style={styles.forecastTitle}>Upcoming Days</Text>
                        <FlatList 
                            data={dailyForecast} 
                            keyExtractor={(item) => item.date}
                            renderItem={({ item }) => (
                                <View style={styles.forecastItem}>
                                    <Text style={styles.forecastDate}>{item.date}</Text>
                                    <Text style={styles.forecastTemp}>
                                        {item.maxTemp}°C / {item.minTemp}°C
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </SafeAreaView>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default Weather;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    weatherIcon: {
        marginBottom: 10,
    },
    circleContainer: {
        alignItems: 'center',
        marginTop: 35,
    },
    circle: {
        width: 350,
        height: 350,
        borderRadius: 300,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 9,
        borderColor: '#f0f0f0',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    condition: {
        color: '#333',
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 10,
    },
    temperature: {
        color: '#FF9933',
        fontSize: 95,
        fontWeight: '200',
    },
    forecastContainer: {
        marginTop: 30,
        padding: 10,
    },
    forecastTitle: {
        color: '#333',
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    forecastItem: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
    },
    forecastDate: {
        color: '#666',
        fontSize: 18,
    },
    forecastTemp: {
        color: '#333',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 5,
    },
});