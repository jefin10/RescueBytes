import News from "../models/news.model.js";

// Create News
export const createNews = async (req, res) => {
    try {
      const { title, content, priority, rescueCenter } = req.body;
  
      if (!title || !content || !rescueCenter) {
        return res.status(400).json({ message: "Title, content and rescueCenter are required." });
      }
  
      const newNews = new News({ title, content, priority, rescueCenter });
      await newNews.save();
  
      res.status(201).json({ message: "News created successfully", news: newNews });
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

// Get All News

export const getAllNews = async (req, res) => {
  try {
    const { rescueCenter } = req.query;
    if (!rescueCenter) return res.status(400).json({ message: "rescueCenter required" });

    const news = await News.find({ rescueCenter }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get Single News by ID
export const getNewsById = async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
      res.status(200).json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

// Update News
export const updateNews = async (req, res) => {
    try {
      const { title, content, priority, rescueCenter } = req.body;
  
      // Optionally, you can validate rescueCenter here if needed
      const updatedNews = await News.findByIdAndUpdate(
        req.params.id,
        { title, content, priority, rescueCenter },
        { new: true, runValidators: true }
      );
  
      if (!updatedNews) {
        return res.status(404).json({ message: "News not found" });
      }
  
      res.status(200).json({ message: "News updated successfully", news: updatedNews });
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

// Delete News
export const deleteNews = async (req, res) => {
    try {
      const deletedNews = await News.findByIdAndDelete(req.params.id);
      if (!deletedNews) {
        return res.status(404).json({ message: "News not found" });
      }
      res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Server error" });
    }
  };