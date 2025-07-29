import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketPriceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  BarChart3, 
  DollarSign, 
  Package,
  MapPin,
  Calendar,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Minus as MinusIcon
} from 'lucide-react';
import './MarketPrices.css';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const INDIAN_COMMODITIES = [
  "Tomato", "Potato", "Onion", "Wheat", "Rice", "Banana", "Chilli", "Apple", "Sugarcane", "Mango",
  "Cotton", "Maize", "Paddy", "Soybean", "Groundnut", "Mustard", "Peas", "Carrot", "Cabbage", "Cauliflower",
  "Brinjal", "Cucumber", "Pumpkin", "Bitter Gourd", "Bottle Gourd", "Lady Finger", "Spinach", "Coriander",
  "Garlic", "Ginger", "Turmeric", "Cardamom", "Black Pepper", "Cloves", "Cumin", "Fennel", "Fenugreek",
  "Lemon", "Orange", "Grapes", "Pomegranate", "Papaya", "Guava", "Watermelon", "Muskmelon", "Pineapple",
  "Litchi", "Pear", "Plum", "Cherry", "Apricot", "Peach", "Strawberry", "Raspberry", "Blueberry", "Avocado"
];

const MARKET_TYPES = [
  "Local/Village Market",
  "Wholesale/Mandi (APMC)",
  "Terminal Market",
  "Cooperative Market",
  "Contract/Corporate Market",
  "Online/Digital Market",
  "Export Market",
  "Retail/Farmers’ Market"
];

const MarketPrices = () => {
  const { isAuthenticated } = useAuth();
  const [prices, setPrices] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]); // <-- add this
  const [trends, setTrends] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [filters, setFilters] = useState({
    commodity: '',
    market: '',
    state: '',
    district: '',
    marketType: '' // <-- add this
  });
  const [customCommodity, setCustomCommodity] = useState('');
  const [isOtherCommodity, setIsOtherCommodity] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [prediction, setPrediction] = useState({ tomorrow: null, dayAfter: null });
  const [quantity, setQuantity] = useState(1); // Default 1 Quintal
  const debounceTimeout = useRef(null);
  const [topMarketPrices, setTopMarketPrices] = useState([]);

  useEffect(() => {
    fetchMarkets();
    fetchCommodities();
    fetchPrices();
    fetchStates(); // <-- add this
  }, []);

  const fetchStates = async () => {
    try {
      const response = await marketPriceAPI.getStates();
      if (response.data && response.data.data) {
        setStates(response.data.data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await marketPriceAPI.getPrices(filters);
      if (response.data && response.data.data) {
        setPrices(response.data.data);
      } else {
        setPrices([]);
        toast.info('No price data available for the selected filters');
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      setPrices([]);
      toast.error('Failed to fetch market prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      const response = await marketPriceAPI.getMarkets();
      if (response.data && response.data.data) {
        setMarkets(response.data.data);
      } else {
        setMarkets([]);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
      setMarkets([]);
    }
  };

  const fetchCommodities = async () => {
    try {
      const response = await marketPriceAPI.getCommodities();
      if (response.data && response.data.data) {
        setCommodities(response.data.data);
      } else {
        setCommodities([]);
      }
    } catch (error) {
      console.error('Error fetching commodities:', error);
      setCommodities([]);
    }
  };

  const fetchTrends = async (commodity, market) => {
    try {
      const response = await marketPriceAPI.getTrends({ commodity, market, days: 30 });
      setTrends(response.data.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const fetchAnalysis = async (commodity, market) => {
    if (!isAuthenticated) {
      toast.error('Please login to access AI analysis');
      return;
    }

    try {
      const response = await marketPriceAPI.getAnalysis(commodity, market);
      setAnalysis(response.data.data);
      fetchTrends(commodity, market);
    } catch (error) {
      toast.error('Failed to fetch analysis');
      console.error('Error fetching analysis:', error);
    }
  };

  // Update handleFilterChange to handle commodity logic
  const handleFilterChange = (key, value) => {
    if (key === 'commodity') {
      if (value === 'other') {
        setCustomCommodity('');
      }
    }
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle custom commodity input
  const handleCustomCommodityChange = (e) => {
    const value = e.target.value;
    setCustomCommodity(value);
    setFilters(prev => ({ ...prev, commodity: value }));
  };

  // Debounced search
  const debouncedSearch = () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      handleSearchImmediate();
    }, 500);
  };

  // Immediate search (actual API call)
  const handleSearchImmediate = async () => {
    setLoading(true);
    setPriceHistory([]);
    setPrediction({ tomorrow: null, dayAfter: null });
    try {
      const params = {
        commodity: isOtherCommodity ? customCommodity : filters.commodity,
        state: filters.state,
        marketType: filters.marketType,
        quantity: quantity || 1,
      };
      const response = await marketPriceAPI.getHistoryAndPrediction(params);
      if (response.data && response.data.data) {
        setPriceHistory(response.data.data.history || []);
        setPrediction(response.data.data.prediction || { tomorrow: null, dayAfter: null });
      } else {
        setPriceHistory([]);
        setPrediction({ tomorrow: null, dayAfter: null });
        toast.info('No price data available for the selected filters');
      }
    } catch (error) {
      setPriceHistory([]);
      setPrediction({ tomorrow: null, dayAfter: null });
      toast.error('Failed to fetch market prices. Please try again.');
      console.error('Error fetching price history and prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  // Replace handleSearch with debouncedSearch
  const handleSearch = debouncedSearch;

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  const handleCommoditySelect = (commodity) => {
    setSelectedCommodity(commodity);
    if (isAuthenticated) {
      fetchAnalysis(commodity.name, filters.market);
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'Rising':
        return <TrendingUpIcon className="market-trend-icon market-trend-icon-up" />;
      case 'Falling':
        return <TrendingDownIcon className="market-trend-icon market-trend-icon-down" />;
      default:
        return <MinusIcon className="market-trend-icon market-trend-icon-stable" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'Rising':
        return 'market-trend-up';
      case 'Falling':
        return 'market-trend-down';
      default:
        return 'market-trend-stable';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const chartData = {
    labels: trends.map(t => t._id),
    datasets: [
      {
        label: 'Average Price (₹/Quintal)',
        data: trends.map(t => t.avgPrice),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Min Price (₹/Quintal)',
        data: trends.map(t => t.minPrice),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Max Price (₹/Quintal)',
        data: trends.map(t => t.maxPrice),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price Trends (Last 30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Fetch today's prices for all market types in the selected state for the selected commodity
  const fetchTopMarketPrices = async () => {
    if (!(isOtherCommodity ? customCommodity : filters.commodity) || !filters.state) {
      setTopMarketPrices([]);
      return;
    }
    const commodity = isOtherCommodity ? customCommodity : filters.commodity;
    const state = filters.state;
    const promises = MARKET_TYPES.map(async (marketType) => {
      try {
        // Use Gemini API for today only
        const params = { commodity, state, marketType };
        const response = await marketPriceAPI.getHistoryAndPrediction(params);
        // Get the latest (today's) price from history
        const today = response.data?.data?.history?.slice(-1)[0];
        return {
          marketType,
          price: today ? today.modalPrice : null
        };
      } catch {
        return { marketType, price: null };
      }
    });
    const results = await Promise.all(promises);
    setTopMarketPrices(results);
  };

  // Refetch top prices when commodity or state changes
  useEffect(() => {
    fetchTopMarketPrices();
    // eslint-disable-next-line
  }, [filters.commodity, customCommodity, isOtherCommodity, filters.state]);

  return (
    <div className="page-container">
      <div className="container">
        {/* Hero Section */}
        <div className="market-hero">
          <div className="market-hero-content">
            <div className="market-hero-info">
              <h1 className="market-hero-title">
                Market Price <span className="market-hero-highlight">Intelligence</span>
              </h1>
              <p className="market-hero-description">
                Get real-time market prices, trends, and AI-powered insights to maximize your profits. 
                Track prices across major APMC markets and make informed selling decisions.
              </p>
            </div>
            <div className="market-hero-stats">
              <div className="market-stat">
                <div className="market-stat-icon">
                  <DollarSign className="market-stat-icon-svg" />
                </div>
                <div className="market-stat-content">
                  <div className="market-stat-number">₹2.5Cr+</div>
                  <div className="market-stat-label">Daily Trading</div>
                </div>
              </div>
              <div className="market-stat">
                <div className="market-stat-icon">
                  <Package className="market-stat-icon-svg" />
                </div>
                <div className="market-stat-content">
                  <div className="market-stat-number">50+</div>
                  <div className="market-stat-label">Commodities</div>
                </div>
              </div>
              <div className="market-stat">
                <div className="market-stat-icon">
                  <MapPin className="market-stat-icon-svg" />
                </div>
                <div className="market-stat-content">
                  <div className="market-stat-number">100+</div>
                  <div className="market-stat-label">Markets</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="market-search-section">
          <div className="market-search-header">
            <h2 className="market-section-title">
              <Search className="market-section-icon" />
              Search Market Prices
            </h2>
         
          </div>
          
          <div className="market-filters">
            <div className="market-filter-group">
              <label className="market-filter-label">Commodity</label>
              <select
                value={isOtherCommodity ? 'other' : filters.commodity}
                onChange={(e) => {
                  if (e.target.value === 'other') {
                    setIsOtherCommodity(true);
                    setCustomCommodity('');
                    setFilters(prev => ({ ...prev, commodity: '' }));
                  } else {
                    setIsOtherCommodity(false);
                    setCustomCommodity('');
                    setFilters(prev => ({ ...prev, commodity: e.target.value }));
                  }
                }}
                className="market-filter-select"
              >
                <option value="">All Commodities</option>
                {INDIAN_COMMODITIES.map((commodity) => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
                <option value="other">Other (Enter manually...)</option>
              </select>
              {isOtherCommodity && (
                <input
                  type="text"
                  className="market-filter-input"
                  placeholder="Enter commodity name"
                  value={customCommodity}
                  onChange={e => {
                    setCustomCommodity(e.target.value);
                    setFilters(prev => ({ ...prev, commodity: e.target.value }));
                  }}
                  style={{ marginTop: '0.5rem' }}
                  autoFocus
                />
              )}
            </div>
            
            {/* Remove the Market dropdown filter group from the filters section */}
            
            <div className="market-filter-group">
              <label className="market-filter-label">State</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="market-filter-select"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="market-filter-group">
              <label className="market-filter-label">Market Type</label>
              <select
                value={filters.marketType}
                onChange={(e) => handleFilterChange('marketType', e.target.value)}
                className="market-filter-select"
              >
                <option value="">All Market Types</option>
                {MARKET_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Quantity Selection */}
            <div className="market-filter-group">
              <label className="market-filter-label">Quantity (KG)</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value) || 1)}
                className="market-filter-input"
                placeholder="1"
                style={{ marginTop: '0.5rem' }}
              />
            </div>

            <button onClick={handleSearch} className="btn btn-primary market-search-btn">
              <Search className="market-search-icon" />
              Search Prices
            </button>
          </div>
        </div>

        {/* Top Commodities */}
        <div className="market-top-commodities">
          <div className="market-section-header">
            <h2 className="market-section-title">
              <Star className="market-section-icon" />
              Top Commodities Today
            </h2>
          
          </div>
          <div className="market-commodities-grid">
            {(!(isOtherCommodity ? customCommodity : filters.commodity) || !filters.state) ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>
                Please select a commodity and state to view today's prices across market types.
              </div>
            ) : (
              topMarketPrices
                .slice() // copy array
                .sort((a, b) => (b.price ?? 0) - (a.price ?? 0)) // sort descending by price, N/A last
                .slice(0, 5)
                .map(({ marketType, price }) => (
                  <div key={marketType} className="market-commodity-card">
                    <div className="market-commodity-header">
                      <div className="market-commodity-icon">
                        <Package className="market-commodity-icon-svg" />
                      </div>
                      <div className="market-commodity-trend market-trend-stable">
                        {price !== null ? `₹${(price / 100).toFixed(2)} per KG` : 'N/A'}
                      </div>
                    </div>
                    <div className="market-commodity-content">
                      <h3 className="market-commodity-title">{marketType}</h3>
                      <div className="market-commodity-market">
                        <MapPin className="market-commodity-market-icon" />
                        <span>{filters.state}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Market Prices Table / Bar Graph */}
        <div className="market-prices-section">
          <div className="market-section-header">
            <h2 className="market-section-title">
              <BarChart3 className="market-section-icon" />
              Current Market Prices
            </h2>
            <div className="market-view-controls">
              <button className="btn btn-outline btn-sm">
                <Download className="market-action-icon" />
                Export
              </button>
            </div>
          </div>

          {loading ? (
            <div className="market-loading">
              <div className="spinner"></div>
              <p className="market-loading-text">Loading market prices...</p>
            </div>
          ) : (
            priceHistory.length === 0 ? (
              <div className="market-empty-state">
                <div className="market-empty-icon">
                  <Package className="market-empty-icon-svg" />
                </div>
                <h3 className="market-empty-title">No Price Data Available</h3>
                <p className="market-empty-description">
                  Try adjusting your filters or check back later for updated prices.
                </p>
              </div>
            ) : (
              <>
                <div className="market-bar-graph-section">
                  <div style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Past 10 days prices of {isOtherCommodity ? customCommodity : filters.commodity || 'commodity'} in {filters.state || 'state'} at {filters.marketType || 'market type'}
                  </div>
                  <Bar
                    data={{
                      labels: priceHistory.map(h => new Date(h.date).toLocaleDateString()),
                      datasets: [
                        {
                          label: `Modal Price (₹/KG) × ${quantity} KG`,
                          data: priceHistory.map(h => (h.modalPrice / 100) * quantity),
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderColor: 'rgb(59, 130, 246)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Past 10 Days Market Prices' },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString();
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="market-prediction-section" style={{ marginTop: '2rem' }}>
                  <h3>Predicted Prices</h3>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div>
                      <strong>Tomorrow:</strong> {prediction.tomorrow ? `₹${((prediction.tomorrow / 100) * quantity).toLocaleString()}` : 'N/A'}
                    </div>
                    <div>
                      <strong>Day After Tomorrow:</strong> {prediction.dayAfter ? `₹${((prediction.dayAfter / 100) * quantity).toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>

        {/* AI Analysis Section */}
        {isAuthenticated && selectedCommodity && (
          <div className="market-analysis-section">
            <div className="market-section-header">
              <h2 className="market-section-title">
                <Zap className="market-section-icon" />
                AI Price Analysis
              </h2>
              <div className="market-analysis-badge">
                <Target className="market-analysis-badge-icon" />
                <span>Powered by AI</span>
              </div>
            </div>
            
            <div className="market-analysis-grid">
              <div className="market-analysis-card">
                <h3 className="market-analysis-card-title">Price Prediction</h3>
                <div className="market-analysis-content">
                  {analysis ? (
                    <>
                      <div className="market-prediction">
                        <div className="market-prediction-value">
                          {formatPrice(analysis.predictedPrice)}
                        </div>
                        <div className="market-prediction-label">Next Week</div>
                      </div>
                      <div className="market-confidence">
                        <div className="market-confidence-bar">
                          <div 
                            className="market-confidence-fill"
                            style={{ width: `${analysis.confidence}%` }}
                          ></div>
                        </div>
                        <span className="market-confidence-text">
                          {analysis.confidence}% Confidence
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="market-analysis-loading">
                      <div className="spinner"></div>
                      <p>Analyzing price trends...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="market-analysis-card">
                <h3 className="market-analysis-card-title">Market Insights</h3>
                <div className="market-analysis-content">
                  {analysis ? (
                    <div className="market-insights">
                      <div className="market-insight-item">
                        <CheckCircle className="market-insight-icon market-insight-icon-positive" />
                        <span>Demand is increasing in major markets</span>
                      </div>
                      <div className="market-insight-item">
                        <AlertCircle className="market-insight-icon market-insight-icon-warning" />
                        <span>Supply may be affected by weather</span>
                      </div>
                      <div className="market-insight-item">
                        <Clock className="market-insight-icon market-insight-icon-info" />
                        <span>Best selling time: Next 2 weeks</span>
                      </div>
                    </div>
                  ) : (
                    <div className="market-analysis-placeholder">
                      Select a commodity to see AI insights
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Price Trends Chart */}
            {trends.length > 0 && (
              <div className="market-chart-section">
                <h3 className="market-chart-title">Price Trends (Last 30 Days)</h3>
                <div className="market-chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Market Tips */}
        <div className="market-tips-section">
          <div className="market-section-header">
            <h2 className="market-section-title">
              <Target className="market-section-icon" />
              Smart Selling Tips
            </h2>
          </div>
          
          <div className="market-tips-grid">
            <div className="market-tip-card">
              <div className="market-tip-icon">
                <TrendingUp className="market-tip-icon-svg" />
              </div>
              <h3 className="market-tip-title">Monitor Price Trends</h3>
              <p className="market-tip-description">
                Track price movements for at least a week before selling to identify the best time.
              </p>
            </div>
            
            <div className="market-tip-card">
              <div className="market-tip-icon">
                <MapPin className="market-tip-icon-svg" />
              </div>
              <h3 className="market-tip-title">Compare Markets</h3>
              <p className="market-tip-description">
                Check prices across multiple APMC markets to get the best deal for your produce.
              </p>
            </div>
            
            <div className="market-tip-card">
              <div className="market-tip-icon">
                <Calendar className="market-tip-icon-svg" />
              </div>
              <h3 className="market-tip-title">Timing is Key</h3>
              <p className="market-tip-description">
                Sell during peak demand periods when prices are typically higher.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPrices; 