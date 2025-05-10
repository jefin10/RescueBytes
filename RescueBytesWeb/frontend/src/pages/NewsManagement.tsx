import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios'; // Make sure to install axios if you haven't already
import api_url from '../api.tsx';
const NewsManagement = () => {
  // State for rescue center id (fetched from backend)
  const [rescueCenterId, setRescueCenterId] = useState(null);

  // Modal state for add/edit
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form fields
  const [newNewsTitle, szetNewNewsTitle] = useState('');
  const [newNewsDescription, setNewNewsDescription] = useState('');
  const [newPriority, setNewPriority] = useState('normal');
  
  // News list and other state
  interface NewsItem {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    priority: string;
  }

  interface TransformedNewsItem {
    id: string;
    title: string;
    description: string;
    image: string;
    date: string;
    priority: string;
  }

  const [news, setNews] = useState<TransformedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null);

  // Fetch rescue center id from backend
  const fetchRescueCenterId = async () => {
    try {
      const response = await axios.get(`${api_url}/rescueCenterId`, {
        withCredentials: true,
      });
      // Expecting response.data.rescueCenter to have the rescue center id
      setRescueCenterId(response.data.rescueCenter);
    } catch (err) {
      console.error("Error fetching rescue center id:", err);
    }
  };
  

  // Fetch rescue center id on mount
  useEffect(() => {
    fetchRescueCenterId();
  }, []);

  // Once rescueCenterId is available, fetch news
  useEffect(() => {
    if (rescueCenterId) {
      fetchNews();
    }
  }, [rescueCenterId]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Include rescueCenter query parameter so that the backend returns only matching news
      const response = await axios.get(`${api_url}/news?rescueCenter=${rescueCenterId}`);
      // Transform the data to match our frontend structure
      const transformedNews = response.data.map((item: NewsItem) => ({
        id: item._id,
        title: item.title,
        description: item.content,
        image: '/api/placeholder/600/300', // Placeholder for now
        date: new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        priority: item.priority // use the priority from the backend
      }));
      setNews(transformedNews);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openAddNewsModal = () => {
    setIsAddNewsModalOpen(true);
  };

  const closeAddNewsModal = () => {
    setIsAddNewsModalOpen(false);
    szetNewNewsTitle('');
    setNewNewsDescription('');
    setNewPriority('normal');
  };

  const openEditModal = (newsItem: TransformedNewsItem) => {
    setCurrentNewsId(newsItem.id);
    szetNewNewsTitle(newsItem.title);
    setNewNewsDescription(newsItem.description);
    setNewPriority(newsItem.priority);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentNewsId(null);
    szetNewNewsTitle('');
    setNewNewsDescription('');
    setNewPriority('normal');
  };

  const handleAddNews = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api_url}/news`, {
        title: newNewsTitle,
        content: newNewsDescription,
        priority: newPriority,
        rescueCenter: rescueCenterId
      });
      const newNewsItem = {
        id: response.data.news._id,
        title: response.data.news.title,
        description: response.data.news.content,
        image: '/api/placeholder/600/300',
        date: new Date(response.data.news.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        priority: response.data.news.priority
      };
      setNews([newNewsItem, ...news]);
      closeAddNewsModal();
    } catch (err) {
      console.error('Error adding news:', err);
      alert('Failed to add news. Please try again.');
    }
  };

  const handleUpdateNews = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${api_url}/news/${currentNewsId}`, {
        title: newNewsTitle,
        content: newNewsDescription,
        priority: newPriority,
        rescueCenter: rescueCenterId
      });
      // Update the news list with the updated item
      setNews(news.map(item => {
        if (item.id === currentNewsId) {
          return {
            ...item,
            title: response.data.news.title,
            description: response.data.news.content,
            priority: response.data.news.priority,
            date: new Date(response.data.news.updatedAt || response.data.news.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };
        }
        return item;
      }));
      closeEditModal();
    } catch (err) {
      console.error('Error updating news:', err);
      alert('Failed to update news. Please try again.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) {
      return;
    }
    try {
      await axios.delete(`${api_url}/news/${id}`);
      setNews(news.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('Failed to delete news. Please try again.');
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <div className="relative flex items-center">
              
              <div className="absolute inset-y-0 right-0 flex items-center px-2 text-white pointer-events-none">
                <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main>
        <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* News Management Panel */}
          <div className="px-4 py-6 mb-6 sm:px-0">
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Community News</h2>
                  <button 
                    onClick={openAddNewsModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add News
                  </button>
                </div>
                {loading ? (
                  <div className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <p className="mt-2 text-gray-600">Loading news...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-700 bg-red-100 rounded-md">
                    {error}
                  </div>
                ) : news.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No news items available. Click 'Add News' to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {news.map((item) => (
                      <div key={item.id} className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow hover:shadow-md">
                        
                        <div className="px-4 py-4">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                            <button 
                              onClick={() => handleDeleteNews(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                              aria-label="Delete news"
                            >
                              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.date}</p>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{item.description}</p>
                          <div className="flex justify-between mt-4">
                            <button 
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                              onClick={() => openEditModal(item)}
                            >
                              Edit
                            </button>
                            <div className="relative">  
                          <span className={`absolute bottom-0 right-2 px-2 py-1 text-xs font-medium rounded-md ${getPriorityBadgeColor(item.priority)}`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                          </span>
                        </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Recent Posts History */}
          <div className="px-4 py-6 sm:px-0">
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Posts History</h2>
                {loading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                ) : news.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No posts available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Priority
                          </th>
                         
                          <th scope="col" className=" px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {news.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </td>
                           
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                              <button 
                                className="mr-3 text-blue-600 hover:text-blue-900"
                                onClick={() => openEditModal(item)}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteNews(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between pt-4 border-t border-gray-200 md:flex-row">
            <div className="text-sm text-gray-500">
              © 2025 RescueBytez. All rights reserved.
            </div>
            <div className="flex mt-4 space-x-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Help Center
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* Add News Modal */}
      {isAddNewsModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeAddNewsModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                    Add New Announcement
                  </h3>
                  <form onSubmit={handleAddNews} className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={newNewsTitle}
                        onChange={(e) => szetNewNewsTitle(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="News title"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={newNewsDescription}
                        onChange={(e) => setNewNewsDescription(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="News description"
                        required
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-800 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={closeAddNewsModal}
                        className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit News Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeEditModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                    Edit Announcement
                  </h3>
                  <form onSubmit={handleUpdateNews} className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        name="edit-title"
                        id="edit-title"
                        value={newNewsTitle}
                        onChange={(e) => szetNewNewsTitle(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="News title"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        name="edit-description"
                        rows={4}
                        value={newNewsDescription}
                        onChange={(e) => setNewNewsDescription(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="News description"
                        required
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="edit-priority"
                        name="edit-priority"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-800 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={closeEditModal}
                        className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
