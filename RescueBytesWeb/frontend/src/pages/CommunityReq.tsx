import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Check, X, Clock } from 'lucide-react';
import api_url from '../api.tsx'; // Adjust the import based on your project structure

// Interface for community report structure
interface CommunityReport {
  _id: number;
  type: string;
  description: string;
  createdAt: string;
}

const CommunityReq: React.FC = () => {
  // Initial sample reports (would typically come from an API or database)
  const [reports, setReports] = useState<CommunityReport[]>([]);

  // Function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    
    // Format options
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    return date.toLocaleString('en-US', options);
  };

  const fetchUserReports = async () => {
    try {
      const response = await fetch(`${api_url}/getComRepAdm`);
      const data = await response.json();
      console.log(data);
      setReports(data);
    } catch (error) {
      console.log("Error in fetching reports", error);
    }
  }

  useEffect(() => {
    fetchUserReports();
  }, []);

  const handleApprove = async(reportId: number): Promise<void> => {
    await fetch(`${api_url}/approveComReq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id:reportId}),
    });
    fetchUserReports();
  };

  const handleReject = async(reportId: number): Promise<void> => {
    const response=await fetch(`${api_url}/comReportsRejected`, {
        method: 'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body: JSON.stringify({id:reportId}),
    });
    const result=response.json();
    console.log(result);
    fetchUserReports();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 sm:py-8 lg:px-32">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mx-auto">
          {/* Page Header */}
          <div className="bg-blue-700 p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <Clock className="mr-2 sm:mr-3 w-6 h-6 sm:w-10 sm:h-10" />
              Community Reports
            </h2>
            <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">
              Review and manage incoming community requests
            </p>
          </div>

          {/* Reports Container */}
          <div className="p-4 sm:p-6">
            {reports.length === 0 ? (
              <div className="text-center py-8 sm:py-10 bg-blue-50 rounded-lg">
                <p className="text-lg sm:text-xl text-gray-600 font-semibold">
                  No pending community reports
                </p>
                <p className="text-sm sm:text-base text-gray-500 mt-2">
                  All reports have been processed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div 
                    key={report._id} 
                    className="bg-white border-l-4 border-yellow-500 p-3 sm:p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      {/* Report Details */}
                      <div className="flex-grow pr-0 sm:pr-4 mb-3 sm:mb-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                            {report.type}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm sm:text-base">{report.description}</p>
                        
                        <div className="text-xs sm:text-sm text-gray-500 flex items-center space-x-2 sm:space-x-4">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatTimestamp(report.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                        <button 
                          type="button"
                          className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors group text-sm flex-1 sm:flex-auto justify-center"
                          onClick={() => handleApprove(report._id)}
                        >
                          <Check className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                          Approve
                        </button>
                        <button 
                          type="button"
                          className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors group text-sm flex-1 sm:flex-auto justify-center"
                          onClick={() => handleReject(report._id)}
                        >
                          <X className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityReq;