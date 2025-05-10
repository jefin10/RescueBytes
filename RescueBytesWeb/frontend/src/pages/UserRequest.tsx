import { useState, useEffect, useCallback, useMemo } from 'react';
import api_url from '../api.tsx';
import Navbar from '../components/Navbar.tsx';

interface Request {
  _id: string;
  user: string;
  type: string;
  item: string;
  count: number;
  status: string;
}

interface User {
  _id: string;
  email: string;
}

const UserRequest = () => {
  const [requests, setRequests] = useState<Array<Request & { id: number }>>([]);
  // Removed unused inventory state
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const filterStatus = 'All'; // Assuming filterStatus is a constant for now
  const [userDictionary, setUserDictionary] = useState<Record<string, string>>({});
  const adminRescueCenterId = '67dd71422b0dea18c699d502';

  // Use useCallback to memoize functions to prevent unnecessary re-renders
  const getRequests = useCallback(async () => {
    try {
      const response = await fetch(`${api_url}/getUserReq`,{
        'method':'GET',
        'headers': {
          'Content-Type': 'application/json'
        },
        'credentials': 'include'
      });
      const requestsData: Request[] = await response.json();
      const filteredRequests = requestsData.map((request: Request, index: number) => {
        return { ...request, id: index + 1 };
      });
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const response = await fetch(`${api_url}/getUsers`);
      const usersData = await response.json();

      const userDictionary = usersData.reduce((acc: Record<string, string>, user: User) => {
        acc[user._id] = user.email;
        return acc;
      }, {});
      setUserDictionary(userDictionary);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    // Load data on component mount
    getUsers();
    getRequests();
    
    // Removed inventory simulation as inventory state is unused
  }, [getUsers, getRequests]); // Include the memoized functions as dependencies

  const handleRequestFromOtherAdmins = () => {
    // Logic to request from other admins would go here
    alert(`Requested ${requestCount} ${selectedItem} from other admins. Note: ${requestNote}`);
    closeModal();
  };

  const closeModal = () => {
    setIsRequestModalVisible(false);
    setRequestCount('');
    setRequestNote('');
    setSelectedItem(null);
  };

  // Use useMemo instead of recalculating on every render
  const filteredAndDisplayedRequests = useMemo(() => {
    return requests.filter(request => { 
      const matchesSearch = request._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === 'All' || request.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchQuery, filterStatus]); // Only recalculate when these dependencies change

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleApprove = async (requestId: string, requestItem: string, requestCount: number) => {
    try {
      const response = await fetch(`${api_url}/approveUserReq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: requestId,
          item: requestItem,
          count: requestCount,
          rescueCenter: adminRescueCenterId
        })
      });  
      
      if (response.status === 200) {
        alert('Request approved successfully!');
        // Refresh the request list after the action is complete
        await getRequests();
      } else {
        const result = await response.json();
        alert(`Request could not be approved: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('An error occurred while approving the request');
    }
  };

  const handleReject = async (requestId: string, requestItem: string, requestCount: number) => {
    try {
      const response = await fetch(`${api_url}/rejectUserReq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: requestId,
          item: requestItem,
          count: requestCount,
          rescueCenter: adminRescueCenterId
        })
      });  

      if (response.status === 200) {
        alert('Request rejected successfully!');
      } else {
        const result = await response.json();
        alert(`Request could not be rejected: ${result.message || 'Unknown error'}`);
      }
      
      // Refresh the request list after the action is complete
      await getRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('An error occurred while rejecting the request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 px-4">Service Requests</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 px-4 mt-6 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-full">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute w-5 h-5 text-gray-400 right-3 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            

          </div>
          
          {/* Requests List */}
          <div className="p-4 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Requests</h2>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Request ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      User Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndDisplayedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userDictionary[request.user] || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.item}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)} text-white py-1`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className={`${
                              request.status === 'pending'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 cursor-not-allowed'
                            } text-white px-3 py-1 rounded text-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                            onClick={() => handleApprove(request.user, request.item, request.count)}
                            disabled={request.status !== 'pending'}
                          >
                            Approve
                          </button>
                          <button
                            className={`${
                              request.status === 'pending'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-gray-300 cursor-not-allowed'
                            } text-white px-3 py-1 rounded text-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                            onClick={() => handleReject(request.user, request.item, request.count)}
                            disabled={request.status !== 'pending'}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndDisplayedRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p className="mt-2 text-gray-500">No requests found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Request Modal */}
      {isRequestModalVisible && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Request {selectedItem}
                  </h3>
                  <div className="mt-4">
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={requestCount}
                        onChange={(e) => setRequestCount(e.target.value)}
                        title="Request Quantity"
                        placeholder="Enter quantity..."
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Additional Notes
                      </label>
                      <textarea
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        title="Additional Notes"
                        placeholder="Enter additional notes here..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={handleRequestFromOtherAdmins}
                >
                  Send Request
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequest;