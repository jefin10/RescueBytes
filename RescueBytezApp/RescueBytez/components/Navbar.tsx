import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/assets/icons/BackButton';
import { hp, wp } from '@/helper/common';
import { useRouter } from 'expo-router';

const Navbar = (props) => {
  const showBackButton = props.st === undefined || !(props.st === false);
  
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && <BackButton router={props.router} />}
        <Text style={[styles.title, !showBackButton && styles.titleNoBack]}>
          {props.title}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <Pressable style={styles.sosButton} onPress={() => props.router.push('./SOS')}>
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
        <Pressable onPress={() => props.router.push('/Profile')}>
          <View style={styles.profilePic}>
            <Image
              source={{ uri: 'https://avatar.iran.liara.run/public/boy' }}
              style={styles.profileImage}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: hp(3),
    fontWeight: '500',
    marginLeft: wp(2),
  },
  titleNoBack: {
    marginLeft: 0, // Remove left margin when back button isn't shown
  },
  sosButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: 20,
    marginRight: wp(3),
  },
  sosText: {
    color: 'white',
    fontWeight: '700',
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
});