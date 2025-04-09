import { StyleSheet, Text, View, Pressable, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native'
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { hp, wp } from '@/helper/common'
import Navbar from '@/components/Navbar'
import { useRouter } from 'expo-router'
import { getData, STORAGE_KEYS } from '@/Auth/storage'
import axios from 'axios'
import {API_URL} from '../Auth/api'
// Replace with your actual API URL
const chat = () => {
  const router = useRouter();
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get userId from storage
        const userIdFromStorage = await getData(STORAGE_KEYS.USER_ID);
        if (!userIdFromStorage) {
          console.error('User ID not found in storage');
          setIsLoadingInitial(false);
          return;
        }
        
        setUserId(userIdFromStorage);
        
        // Fetch chat history
        const response = await axios.get(`${API_URL}/chat/getchats`, {
          params: { userId: userIdFromStorage }
        });
        
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    
    initialize();
  }, []);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => scrollToBottom(), 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Dedicated scroll to bottom function
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // More reliable scroll to bottom when messages change
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to backend
  const sendMessage = async () => {
    if (message.trim() === '' || !userId) return;
    
    // Add user message locally
    const userMsg = { text: message, isBot: false, timestamp: new Date() };
    setMessages([...messages, userMsg]);
    setMessage('');
    setLoading(true);
    
    try {
      // Send message to backend
      const response = await axios.post(`${API_URL}/chat/chat`, {
        message: message,
        userId: userId
      });
      
      if (response.data && response.data.response) {
        // Check for keywords to determine if it's an emergency response
        
        // Add bot response
        const botResponse = { 
          text: response.data.response, 
          isBot: true, 
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMsg = { 
        text: "Sorry, I'm having trouble connecting. Please try again.", 
        isBot: true, 
        timestamp: new Date() 
      };
      setMessages(prevMessages => [...prevMessages, errorMsg]);
    } finally {
      setLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (isLoadingInitial) {
    return (
      <ScreenWrapper bg="white">
        <Navbar router={router} title="Assistant"/>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading your conversation...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <Navbar router={router} title="Assistant"/>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { flex: 1 }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          >
            {messages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageWrapper,
                  msg.isBot ? styles.botMessageWrapper : styles.userMessageWrapper
                ]}
              >
                <View 
                  style={[
                    styles.messageBubble,
                    msg.isBot ? (msg.emergency ? styles.emergencyBotBubble : styles.botBubble) : styles.userBubble
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="small" color="#50C878" />
              </View>
            )}
          </ScrollView>
        </View>
        
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your emergency..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            onFocus={scrollToBottom}
          />
          <View style={styles.buttonsContainer}>
            <Pressable 
              style={[
                styles.sendButton,
                !message.trim() && styles.disabledButton
              ]} 
              onPress={sendMessage}
              disabled={loading || message.trim() === ''}
            >
              <Text style={styles.buttonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default chat

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    position: 'relative',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: '#555',
  },
  loadingIndicator: {
    padding: hp(2),
    alignItems: 'center',
  },
  // Emergency Protocols
  protocolsContainer: {
    paddingVertical: hp(1.5),
  },
  protocolCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: hp(1.5),
    padding: hp(1.5),
    marginRight: wp(3),
    alignItems: 'center',
    width: wp(30),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  protocolIcon: {
    width: hp(5),
    height: hp(5),
    marginBottom: hp(1),
  },
  protocolTitle: {
    fontSize: hp(1.5),
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  
  // SOS Button
  sosButton: {
    backgroundColor: '#FF3B30',
    borderRadius: hp(2),
    padding: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sosButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: hp(1.8),
  },
  
  // Chat Container
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: hp(2),
    padding: hp(1),
    marginBottom: hp(1.5),
  },
  messagesContainer: {
    paddingVertical: hp(1),
    flexGrow: 1, // Important for proper scroll behavior
  },
  messageWrapper: {
    marginVertical: hp(0.8), // Increased spacing between messages
    paddingHorizontal: wp(2),
    maxWidth: '90%',
  },
  botMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: hp(2),
    padding: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  botBubble: {
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: hp(0.5),
  },
  emergencyBotBubble: {
    backgroundColor: '#FFEBEE',
    borderBottomLeftRadius: hp(0.5),
  },
  userBubble: {
    backgroundColor: '#50C878',
    borderBottomRightRadius: hp(0.5),
  },
  messageText: {
    fontSize: hp(1.7),
    lineHeight: hp(2.2),
    color: '#333',
  },
  
  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1),
    backgroundColor: '#F5F5F5',
    borderRadius: hp(2),
    marginBottom: hp(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  input: {
    flex: 1,
    minHeight: hp(5),
    maxHeight: hp(10),
    backgroundColor: 'white',
    borderRadius: hp(1.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    fontSize: hp(1.7),
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginLeft: wp(2),
  },
  voiceButton: {
    backgroundColor: '#50C878',
    borderRadius: hp(1.5),
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2),
    flexDirection: 'row',
  },
  voiceActiveButton: {
    backgroundColor: '#FF9500',
  },
  sendButton: {
    backgroundColor: '#50C878',
    borderRadius: hp(1.5),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: hp(1.6),
  },
  microphoneIcon: {
    width: hp(1.5),
    height: hp(2),
    backgroundColor: 'white',
    borderRadius: hp(0.5),
    marginRight: wp(1),
  },
  disabledButton: {
    backgroundColor: '#A8D5BA', // Lighter color for disabled state
  },
});