import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

// Chat Schema (moved from chatModel)
const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  messages: [{
    text: String,
    isBot: Boolean,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

// Initialize Google AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: Google API key not found. Set the GOOGLE_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const router = express.Router();

// Send a message and get a response
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Add user message to database
    let chat = await Chat.findOne({ userId });

    if (!chat) {
      // Create a new chat with initial bot messages
      chat = new Chat({
        userId,
        messages: [
          {
            text: "Hello! I'm your Emergency Assistant. How can I help you today?",
            isBot: true,
            timestamp: new Date()
          },
          {
            text: "You can ask me for help with first aid, emergency procedures, or press the SOS button for immediate human assistance.",
            isBot: true,
            timestamp: new Date()
          }
        ]
      });
    }

    // Add user message
    chat.messages.push({
      text: message,
      isBot: false,
      timestamp: new Date()
    });

    // Get response from Gemini
    try {
        const result = await model.generateContent([
            { text: "You are an emergency assistance AI. The user needs help with an emergency situation. Provide concise, helpful guidance for their situation. If it's a serious emergency, clearly tell them to call emergency services. Give responce as a single paragraph with no points or titles" },
            { text: message }
          ]);
      
      const responseText = result.response.text();
      console.log(responseText);
      // Add bot response to database
      chat.messages.push({
        text: responseText,
        isBot: true,
        timestamp: new Date()
      });
      
      await chat.save();
      
      res.json({ 
        response: responseText,
        messages: chat.messages 
      });
      
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      return res.status(500).json({ error: `Error communicating with Gemini API: ${apiError.message}` });
    }
    
  } catch (error) {
    console.error("General Error:", error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});
router.post('/weather',async (req, res)=>{
  try{
    console.log('hererrere');

    const { lat,lon } = req.body;
    if(!lat ||!lon){
      return res.status(400).json({ error: 'Location details are required' });
    }
    const urll=`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.LOCATION_API_KEY}`;
    const response = await fetch(urll);
    const data = await response.json();
    const city = data.features[0].properties.city;
    const result = await model.generateContent([
      {text: `You are a weather reporter providing a concise summary for ${city}. In under 20 words:
      1. Describe current weather conditions (sunny, rainy, cloudy, etc.)
      2. Mention temperature (hot, mild, cold)
      3. For extreme conditions (storms, heavy rain, extreme heat), add a brief safety note
      
    
      Respond with just the formatted summary, no additional text.`}
    ]);

    const responseText = result.response.text();
    console.log(responseText);
    res.json({
      city: city,
      weatherSummary: responseText,
    });

  }
  catch(e){
    console.error("Error getting weather data:", e);
    return res.status(500).json({ error: 'Error fetching weather data' });
  }

})
// Get chat history for a user
router.get('/getchats', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      // Return default initial messages if no chat exists
      return res.json({
        messages: [
          {
            text: "Hello! I'm your Emergency Assistant. How can I help you today?",
            isBot: true,
            timestamp: new Date()
          },
          {
            text: "You can ask me for help with first aid, emergency procedures, or press the SOS button for immediate human assistance.",
            isBot: true,
            timestamp: new Date()
          }
        ]
      });
    }
    
    res.json({ messages: chat.messages });
    
  } catch (error) {
    console.error("Error retrieving chats:", error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Clear chat history for a user
router.delete('/clearchat', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await Chat.findOneAndDelete({ userId });
    
    res.json({ success: true, message: 'Chat history cleared' });
    
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

export default router;