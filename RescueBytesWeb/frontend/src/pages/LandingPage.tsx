
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {
  const navigate = useNavigate();



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative bg-blue-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-90"></div>
        </div>
        <div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              RescueBytez
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              Emergency response and disaster management platform for communities
            </p>
            <div className="flex justify-center mt-8">
              <div className="rounded-md shadow">
                <div
                    className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-blue-900 bg-white border border-transparent rounded-md hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
                    onClick={() => navigate('/login')}
                
                >
                  Admin Login
                </div>
              </div>
              <div className="ml-3 rounded-md shadow">
                <div
                  className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white bg-blue-700 border border-transparent rounded-md hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
                >
                  <a href='https://drive.google.com/drive/folders/1rzzaI72D4350NRD7UVCWjCnDsdG2XL7r?usp=sharing'>Download App</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Disaster Management Solution
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-500">
              From emergency response to resource allocation, our platform provides the tools you need
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* SOS Response */}
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      SOS Emergency Response
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Real-time emergency alerts with geolocation tracking for rapid response deployment to those in need.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resource Management */}
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Resource Inventory Management
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Track emergency supplies, coordinate resource allocation, and ensure optimal distribution during crises.
                    </p>
                  </div>
                </div>
              </div>

              {/* Volunteer Coordination */}
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Volunteer Management
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Efficiently allocate volunteers based on skills, location, and availability to maximize relief efforts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Community Alerts */}
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-md shadow-lg">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Emergency Alerts
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Send targeted emergency notifications to specific areas or community-wide alerts with critical information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Requests */}
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Community Requests
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Streamline service requests from community members and prioritize response based on urgency and need.
                    </p>
                  </div>
                </div>
              </div>

              {/* News & Updates */}
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      News & Updates
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Keep communities informed with real-time updates, safety instructions, and crucial information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How RescueBytez Works
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-500">
              Our platform connects those who need help with those who can provide it
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <span className="text-lg font-bold text-white">1</span>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Register Community
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Sign up your community or organization to access our platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <span className="text-lg font-bold text-white">2</span>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Set Up Resources
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Add volunteers, inventory items, and configure alert systems.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <span className="text-lg font-bold text-white">3</span>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Respond to Emergencies
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Receive and respond to SOS alerts and service requests in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root px-6 pb-8 bg-white rounded-lg shadow">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <span className="text-lg font-bold text-white">4</span>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      Coordinate Relief
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Manage resources, volunteers, and communication during crisis events.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-white">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          
          <div className="pt-8 mt-8 border-t border-gray-200">
            <p className="text-base text-gray-400">
              © 2025 RescueBytez. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;