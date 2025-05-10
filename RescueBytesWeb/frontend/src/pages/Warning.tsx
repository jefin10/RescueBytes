import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api_url from '../api.tsx';

const Warning = () => {
  const [isAddWarningModalOpen, setIsAddWarningModalOpen] = useState(false);
  const [newWarningTitle, setNewWarningTitle] = useState('');
  const [newWarningDescription, setNewWarningDescription] = useState('');
  const [severity, setSeverity] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);

  interface Warning {
    _id: string;
    id: number;
    title: string;
    description: string;
    date: string;
    originalDate: Date;
    severity: string;
    active: boolean;
  }

  const [warnings, setWarnings] = useState<Warning[]>([]);

  const openAddWarningModal = () => {
    setIsAddWarningModalOpen(true);
  };

  const deleteWarning = async (_id: string) => {
    try {
      const response = await fetch(`${api_url}/deleteAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: _id
        })
      });
      const result = await response.json();
      console.log(result);
      
      // Reload warnings after deletion
      await loadWarnings();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  const sendWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await fetch(`${api_url}/addAlert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newWarningTitle,
          description: newWarningDescription,
          severity: severity,
          time: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
          }),
          RescueCenterLocation: "Kottayam",
        })
      });
      
      const result = await response.json();
      console.log(result);
      
      // Clear form and close modal
      setNewWarningTitle('');
      setNewWarningDescription('');
      setIsAddWarningModalOpen(false);
      
      // Reload warnings after adding new one
      await loadWarnings();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
      setNewWarningTitle('');
      setNewWarningDescription('');
    } finally {
      setIsLoading(false);
    }
  };

  interface AlertItem {
    _id: string;
    title: string;
    description: string;
    time: string;
    severity: string;
    createdAt: string;
  }

  const loadWarnings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${api_url}/getAlerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result);
      
      // Add more flexible data extraction
      let warningsArray = [];
      
      // Handle different response structures
      if (result.data && Array.isArray(result.data)) {
        warningsArray = result.data;
      } else if (Array.isArray(result)) {
        warningsArray = result;
      } else {
        // Log the exact structure to help debugging
        console.error("Unexpected API response structure:", result);
        setWarnings([]);
        return;
      }
      
      console.log("Warnings array:", warningsArray);
  
      if (warningsArray.length === 0) {
        console.log("API returned an empty array");
        setWarnings([]);
        return;
      }
  
      // Format and sort warnings
      const formattedWarnings: Warning[] = warningsArray.map((item: AlertItem, index: number) => {
        console.log("Processing item:", item); // Add this to see each item being processed
        return {
          _id: item._id || `temp-id-${index}`,
          id: index + 1,
          title: item.title || "Untitled",
          description: item.description || "No description",
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) : "Unknown date",
          originalDate: item.createdAt ? new Date(item.createdAt) : new Date(),
          active: true,
          severity: item.severity || "normal"
        };
      }).sort((a: Warning, b: Warning) => b.originalDate.getTime() - a.originalDate.getTime());
  
      console.log("Formatted warnings:", formattedWarnings);
      setWarnings(formattedWarnings);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error loading warnings:", error.message);
      } else {
        console.error("An unknown error occurred while loading warnings:", error);
      }
      setWarnings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAddWarningModal = () => {
    setIsAddWarningModalOpen(false);
    setNewWarningTitle('');
    setNewWarningDescription('');
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusBadgeColor = (active: boolean): string => {
    return active
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBorderColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  useEffect(() => {
    loadWarnings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Warnings Management</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Warnings Management Panel */}
          <div className="px-4 py-6 mb-6 sm:px-0">
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Active Warnings</h2>
                  <button
                    onClick={openAddWarningModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Warning
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="w-8 h-8 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : warnings.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>No warnings found. Click "Add Warning" to create one.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {warnings.map((item) => (
                      <div key={item._id || item.id} className={`overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md border-l-4 ${getBorderColor(item.severity)}`}>
                        <div className="px-4 py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${getSeverityBadgeColor(item.severity)}`}>
                                  {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)} Severity
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeColor(item.active)}`}>
                                  {item.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => deleteWarning(item._id)}
                                className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                                aria-label="Delete warning"
                              >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                         
                        </div>
                      </div>
                    ))}
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

      {/* Add Warning Modal */}
      {isAddWarningModalOpen && (
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
                  onClick={closeAddWarningModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                    Add New Warning
                  </h3>
                  <form onSubmit={sendWarning} className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Warning Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={newWarningTitle}
                        onChange={(e) => setNewWarningTitle(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Warning title"
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
                        value={newWarningDescription}
                        onChange={(e) => setNewWarningDescription(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Warning description"
                        required
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                        Severity Level
                      </label>
                      <select
                        id="severity"
                        name="severity"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
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
                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Issue Warning'}
                      </button>
                      <button
                        type="button"
                        onClick={closeAddWarningModal}
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

export default Warning;