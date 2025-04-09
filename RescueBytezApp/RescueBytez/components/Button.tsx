import { View, Text,StyleSheet,Pressable } from 'react-native'
import React from 'react'
import { wp,hp } from '@/helper/common';
import Loading from './Loading';

const Button = ({
    buttonStyle,
    textStyle,
    title='',
    onPress=()=>{},
    loading=false,
    hasShadow=true,
}) => {
    const shadowStyle={
        shadowColor: '#000',
        shadowOffset:{width:0,height:10},
        shadowOpacity:0.2,
        shadowRadius:8,
        elevation:4,
    }
    if(loading){
        return (
            <View style={[styles.button,buttonStyle,{backgroundColor:'white'}]}>
                <Loading></Loading>
            </View>
        )
    }
  return (
    <Pressable onPress={onPress} style={[styles.button, buttonStyle,hasShadow &&shadowStyle]}>
      <Text style={[textStyle,styles.text]}>{title}</Text>
    </Pressable>
  )
}

const styles= StyleSheet.create({
    button:{
        backgroundColor:'#34ae00',
        height:hp(6.6),
        justifyContent:'center',
        alignItems:'center',
        borderCurve:'continuous',
        borderRadius:18
    },
    text:{
        color:'white',
        fontSize:hp(2.5),
        fontWeight:'600'
    }
})

export default Button