import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Back from './Back'

const BackButton = ({router }) => {

    
  return (
    <Pressable onPress={() => router.push('./home')} style={styles.button}>
        <Back strokeWidth={2.5} height={34} width={34}/>
    </Pressable>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button: {
      alignSelf: 'flex-start',
      padding: 5,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0)',
    },
  });