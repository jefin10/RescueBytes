import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api_url from '../api.tsx';
import Sidebar from '../components/Sidebar';

interface NewsItem {
  _id: string;
  title: string;
  createdAt: string;
}

interface InventoryItem {
  _id: string;
  item: string;
  count: number;
}

interface WeatherData {
  temp: number;
  conditionId: number;
  humidity: number;
  visibility: number;
  pressure: number;
  windSpeed: number;
}

const getWeatherBg = (id: number) => {
  if (id >= 200 && id < 600) return '/weather-rain.jpg';
  if (id >= 600 && id < 800) return '/weather-mist.jpg';
  if (id === 800) return '/weather-clear.jpg';
  return '/weather-clouds.jpg';
};

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ sosCount: 0, volunteerCount: 0, userReq: 0 });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  useEffect(() => {
    axios.get(`${api_url}/getStats`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${api_url}/news`).then(r => setNews(Array.isArray(r.data) ? r.data.slice(0, 4) : [])).catch(() => {});
    axios.get(`${api_url}/getInv`, { withCredentials: true }).then(r => setInventory(Array.isArray(r.data) ? r.data.slice(0, 6) : [])).catch(() => {});

    const key = import.meta.env.VITE_WEATHER_API_KEY;
    if (key && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${key}&units=metric`
            );
            const d = res.data;
            setWeather({
              temp: Math.round(d.main.temp),
              conditionId: d.weather[0].id,
              humidity: d.main.humidity,
              visibility: Math.round((d.visibility || 0) / 1000),
              pressure: d.main.pressure,
              windSpeed: Math.round((d.wind?.speed || 0) * 3.6),
            });
          } catch {}
          setWeatherLoading(false);
        },
        () => setWeatherLoading(false)
      );
    } else {
      setWeatherLoading(false);
    }
  }, []);

  const maxCount = Math.max(...inventory.map(i => i.count), 1);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-56 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-lg font-bold text-gray-900 mb-6">Dashboard</h1>

          {/* Weather Widget */}
          <div
            className="relative w-full rounded-xl overflow-hidden mb-6"
            style={{
              height: 200,
              backgroundImage: `url(${weather ? getWeatherBg(weather.conditionId) : '/weather-clouds.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
              {!weatherLoading && weather ? (
                <>
                  <div className="text-6xl font-extralight tracking-tight">{weather.temp}°C</div>
                  <div className="text-xs text-white/60 mt-2 uppercase tracking-widest">{today}</div>
                  <div className="flex gap-10 mt-6">
                    {[
                      { label: 'Humidity', value: `${weather.humidity}%` },
                      { label: 'Visibility', value: `${weather.visibility}km` },
                      { label: 'Air Pressure', value: `${weather.pressure}hPa` },
                      { label: 'Wind', value: `${weather.windSpeed}km/h` },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div className="text-xs text-white/50 uppercase tracking-wider mb-0.5">{label}</div>
                        <div className="text-sm font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : !weatherLoading ? (
                <div className="text-white/40 text-sm">{today}</div>
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Active SOS', value: stats.sosCount, color: 'text-red-500', route: '/sos-map' },
              { label: 'Service Requests', value: stats.userReq, color: 'text-yellow-500', route: '/user-request' },
              { label: 'Available Volunteers', value: stats.volunteerCount, color: 'text-green-500', route: '/volunteer' },
            ].map(({ label, value, color, route }) => (
              <div
                key={label}
                className="bg-white rounded-xl px-6 py-5 border border-gray-100 cursor-pointer hover:border-gray-200 hover:shadow-sm active:scale-[0.98] transition-all"
                onClick={() => navigate(route)}
              >
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                <p className={`text-4xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Inventory Chart + News */}
          <div className="grid grid-cols-5 gap-4">
            {/* Bar Chart */}
            <div className="col-span-3 bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-800">Stocks Available</h3>
                <button
                  onClick={() => navigate('/ManageInventory')}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all
                </button>
              </div>

              {inventory.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-sm text-gray-300">
                  No inventory data
                </div>
              ) : (
                <div className="flex items-end justify-around h-36 gap-2">
                  {inventory.map((item) => (
                    <div key={item._id} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-600">{item.count}</span>
                      <div
                        className="w-full bg-blue-600 rounded-t-sm"
                        style={{ height: `${Math.max((item.count / maxCount) * 100, 4)}px` }}
                      />
                      <span className="text-xs text-gray-400 text-center leading-tight">{item.item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest News */}
            <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Latest News</h3>
                <button
                  onClick={() => navigate('/newspage')}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all
                </button>
              </div>

              {news.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-sm text-gray-300">
                  No news yet
                </div>
              ) : (
                <div className="space-y-3">
                  {news.map((item) => (
                    <div key={item._id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
