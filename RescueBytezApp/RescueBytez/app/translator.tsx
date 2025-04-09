import { StyleSheet, Text, View, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { hp, wp } from '@/helper/common'
import Navbar from '@/components/Navbar'
import { useRouter } from 'expo-router'

const translator = () => {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");

  // Language options
  const languages = ["Auto-Detect","English", "Spanish", "French", "German", "Chinese", "Japanese", "Russian", "Arabic"];

  // Simulate recording and translation
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranslating(true);
      
      // Simulate translation delay
      setTimeout(() => {
        setIsTranslating(false);
        setTranscript("This is a sample transcript of what you just said in English.");
        setTranslation("Esta es una transcripción de muestra de lo que acabas de decir en inglés.");
      }, 2000);
    } else {
      setIsRecording(true);
      setTranscript("");
      setTranslation("");
    }
  };

  const handleLanguageSelect = (language, isSource) => {
    if (isSource) {
      setSourceLanguage(language);
    } else {
      setTargetLanguage(language);
    }
  };

  const LanguageSelector = ({ title, selectedLanguage, isSource }) => (
    <View style={styles.languageSelectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.languageOptions}
      >
        {languages.map((language) => (
          <Pressable 
            key={language} 
            style={[
              styles.languageOption,
              selectedLanguage === language && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageSelect(language, isSource)}
          >
            <Text 
              style={[
                styles.languageText,
                selectedLanguage === language && styles.selectedLanguageText
              ]}
            >
              {language}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      <Navbar router={router} title="Live Translator"/>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={styles.languageSelectionCard}>
          <LanguageSelector 
            title="Translate from:" 
            selectedLanguage={sourceLanguage}
            isSource={true}
          />
          
          <View style={styles.divider} />
          
          <LanguageSelector 
            title="Translate to:" 
            selectedLanguage={targetLanguage}
            isSource={false}
          />
        </View>
        
        {/* Translation Results */}
        <View style={styles.translationCard}>
          <View style={styles.transcriptContainer}>
            <Text style={styles.sectionLabel}>Original ({sourceLanguage}):</Text>
            {isTranslating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#50C878" />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : transcript ? (
              <Text style={styles.transcriptText}>{transcript}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                {isRecording 
                  ? "Listening..." 
                  : "Press the microphone button to start speaking"}
              </Text>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.translationContainer}>
            <Text style={styles.sectionLabel}>Translation ({targetLanguage}):</Text>
            {isTranslating ? (
              <ActivityIndicator size="small" color="#50C878" />
            ) : translation ? (
              <Text style={styles.translationText}>{translation}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                Translation will appear here
              </Text>
            )}
          </View>
        </View>
        
        {/* Recording Button */}
        <View style={styles.recordingSection}>
          <Pressable 
            style={[
              styles.recordButton,
              isRecording && styles.recordingActive
            ]}
            onPress={toggleRecording}
          >
            <View style={styles.microphoneIcon}>
              {/* Replace with your actual microphone icon */}
              <View style={styles.micIcon} />
            </View>
            <Text style={styles.recordButtonText}>
              {isRecording ? "Stop" : "Start Translation"}
            </Text>
          </Pressable>
          
          {isRecording && (
            <Text style={styles.recordingHint}>
              Tap again when you're done speaking
            </Text>
          )}
        </View>
        
        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Translation Tips</Text>
          <View style={styles.divider} />
          <Text style={styles.tipText}>• Speak clearly and at a moderate pace</Text>
          <Text style={styles.tipText}>• Minimize background noise</Text>
          <Text style={styles.tipText}>• Keep sentences concise for better results</Text>
          <Text style={styles.tipText}>• Try to pause naturally between sentences</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

export default translator

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(4),
  },
  // Language Selection Card
  languageSelectionCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: hp(2),
    padding: hp(2),
    marginBottom: hp(2.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageSelectorContainer: {
    marginVertical: hp(1),
  },
  selectorTitle: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: hp(1),
  },
  languageOptions: {
    paddingBottom: hp(1),
  },
  languageOption: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: hp(1.5),
    marginRight: wp(2),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedLanguage: {
    backgroundColor: '#50C878',
    borderColor: '#50C878',
  },
  languageText: {
    fontSize: hp(1.6),
    color: '#333',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: hp(0.2),
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: hp(1.5),
  },
  
  // Translation Card
  translationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: hp(2),
    padding: hp(2),
    marginBottom: hp(2.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  transcriptContainer: {
    minHeight: hp(12),
  },
  translationContainer: {
    minHeight: hp(12),
  },
  sectionLabel: {
    fontSize: hp(1.6),
    fontWeight: '600',
    color: '#555',
    marginBottom: hp(1),
  },
  transcriptText: {
    fontSize: hp(1.8),
    color: '#333',
    lineHeight: hp(2.4),
  },
  translationText: {
    fontSize: hp(1.8),
    color: '#2E7D32',
    lineHeight: hp(2.4),
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: hp(1.7),
    color: '#AAA',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: hp(2),
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  loadingText: {
    marginTop: hp(1),
    fontSize: hp(1.6),
    color: '#555',
  },
  
  // Recording Section
  recordingSection: {
    alignItems: 'center',
    marginVertical: hp(2),
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#50C878',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: hp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  microphoneIcon: {
    width: hp(3),
    height: hp(3),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  micIcon: {
    width: hp(2),
    height: hp(3),
    backgroundColor: 'white',
    borderRadius: hp(1),
  },
  recordButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: hp(1.8),
  },
  recordingHint: {
    marginTop: hp(1),
    fontSize: hp(1.5),
    color: '#FF3B30',
    fontStyle: 'italic',
  },
  
  // Tips Card
  tipsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: hp(2),
    padding: hp(2),
    marginBottom: hp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: hp(0.5),
  },
  tipText: {
    fontSize: hp(1.6),
    color: '#333',
    lineHeight: hp(2.2),
    marginVertical: hp(0.5),
  },
});