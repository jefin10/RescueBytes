import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import api_url from '../api.js';

interface Volunteer {
  id: string;
  name: string;
  phNo: string;
  address: string;
  fieldOfExpertise: string;
  user: {
    _id: string;
    email: string;
    password: string;
    role: string;
    RescueCenters: string;
    pfpLink: string;
    createdAt: string;
    lastUpdated: string;
    __v: number;
    sessionToken: string | null;
    address: string;
    phone: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const AllotingVolunteer = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  const populateData=async()=>{
    try{
      const response = await fetch(`${api_url}/getVolunteers`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      const data = await response.json();
      setVolunteers(data);
    }catch(error){
      console.error("Error fetching data:", error);
    }
  }

  // Mock data for initial state
  useEffect(() => {
    // Simulate fetching volunteers from an API
    populateData();
  }, []);

  const openMessageModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsMessageModalVisible(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalVisible(false);
    setMessageText('');
    setMessageSubject('');
  };

  const sendMessage = async() => {
    // Logic to send message would go here
    if (selectedVolunteer) {
      const response = await fetch(`${api_url}/addVolunteerMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedVolunteer.user._id,
          message: messageText,
          subject: messageSubject
        })
      });
      const data=await response.json();
      if(data.success)
        alert(`Message sent to ${selectedVolunteer.name}: ${messageSubject} - ${messageText}`);
    }
    closeMessageModal();
  };

  // Get unique expertise areas for filter dropdown


  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         volunteer.fieldOfExpertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch 
  });


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar></Navbar>

      {/* Main content */}
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Volunteer Allocation</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 mt-6 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-full">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search volunteers / Expertise ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute w-5 h-5 text-gray-400 right-3 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
     
          </div>
          
          {/* Volunteers List */}
          <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((volunteer) => (
                  <li key={volunteer.id} className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {volunteer.name}
                          </p>
                          
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{volunteer.phNo}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{volunteer.address}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Expertise: {volunteer.fieldOfExpertise}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      
                        <button
                          onClick={() => openMessageModal(volunteer)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Message
                        </button>
                        
                       
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-gray-500 sm:px-6">
                  No volunteers match your search criteria
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Message Modal */}
      {isMessageModalVisible && selectedVolunteer && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Message to {selectedVolunteer.name}
                  </h3>
                  <div className="mt-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={messageSubject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageSubject(e.target.value)}
                        placeholder="Enter message subject"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={messageText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageText(e.target.value)}
                        placeholder="Enter your message"
                      />
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Volunteer Contact: {selectedVolunteer.phNo}</p>
                      <p>Area of Expertise: {selectedVolunteer.fieldOfExpertise}</p>
                    </div>
                    <div className="mt-5 space-x-3 text-right">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={closeMessageModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={sendMessage}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllotingVolunteer;