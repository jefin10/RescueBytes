import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'

const Loading = ({size="large",color="black"}) => {
  return (
    <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
        <ActivityIndicator size={size} color={color}/>
    </View>
  )
}

export default Loading