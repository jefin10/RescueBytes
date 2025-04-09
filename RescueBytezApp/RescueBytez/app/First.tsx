import { Button, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { wp, hp } from '@/helper/common';
import { useAuth } from '@/Auth/AuthContext';

const First: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/home');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <ScreenWrapper bg="white">
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#34ae00" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={{ fontSize: wp(10) }}>RescueBytez</Text>
      </View>
      <Button 
        title="Get Started" 
        onPress={() => { router.push("../pages/Login") }}
      />
    </ScreenWrapper>
  );
};

export default First;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: wp(4)
  },
  centered: {
    justifyContent: 'center',
  }
});