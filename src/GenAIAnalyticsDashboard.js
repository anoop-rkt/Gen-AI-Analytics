import React, { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import {
  LineChart, BarChart, PieChart, Line, Bar, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';

// Advanced Query Reducer with Enhanced Error Handling
const queryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_QUERY':
      return {
        ...state,
        currentQuery: action.payload,
        suggestionMode: action.payload.startsWith('/'),
        error: null
      };
    case 'SUBMIT_QUERY':
      return {
        ...state,
        isProcessing: true,
        error: null
      };
    case 'PROCESS_QUERY_SUCCESS':
      return {
        ...state,
        isProcessing: false,
        queries: [
          ...state.queries,
          {
            query: state.currentQuery,
            timestamp: new Date().toLocaleString(),
            results: action.payload
          }
        ],
        currentResults: action.payload,
        currentQuery: '',
        error: null
      };
    case 'PROCESS_QUERY_FAILURE':
      return {
        ...state,
        isProcessing: false,
        error: action.payload,
        currentResults: null
      };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        queries: [],
        currentResults: null,
        error: null
      };
    default:
      return state;
  }
};

// Enhanced AI Suggestions and Command Shortcuts
const AI_SUGGESTIONS = [
  'Top performing products this quarter',
  'Sales conversion rate by channel',
  'Market share analysis in key regions',
  'Operational efficiency metrics',
  'Seasonal trends impact on business',
  'Monthly revenue breakdown by product category',
  'Year-over-year revenue growth analysis',
  'Revenue forecast for next quarter',
  'Impact of pricing changes on revenue',
  'Revenue attribution by marketing channel',
  'Customer lifetime value analysis',
  'Customer segmentation by spending patterns',
  'Churn rate analysis for premium customers',
  'New vs returning customer revenue',
  'Customer acquisition cost trends',
  'Sales performance by region',
  'Customer retention rates',
  'Product revenue trends',
  'Marketing campaign effectiveness',
  'Quarterly financial overview',
  'Competitive market analysis',
];

const COMMAND_SHORTCUTS = {
  '/revenue': 'Detailed revenue breakdown',
  '/customers': 'Comprehensive customer metrics',
  '/top-products': 'Ranking of top-performing products',
  '/regional-performance': 'Comparative regional performance analysis',
  '/forecast': 'Revenue and growth prediction'
};

// Color Palette for Visualizations with Enhanced Contrast
const COLOR_PALETTE = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884D8', '#82CA9D', '#FF6384',
  '#36A2EB', '#FFCE56', '#4BC0C0'
];

// Main Dashboard Component with Enhanced Features
const GenAIAnalyticsDashboard = () => {
  // Initial State with More Comprehensive Error Handling
  const initialState = {
    queries: [],
    currentQuery: '',
    currentResults: null,
    isProcessing: false,
    error: null,
    suggestionMode: false
  };

  const [state, dispatch] = useReducer(queryReducer, initialState);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visualizationType, setVisualizationType] = useState('line');

  // Enhanced Growth Rate Calculation with More Robust Error Handling
  const calculateGrowthRate = useCallback((data) => {
    if (!data || data.length < 2) return 'N/A';
    try {
      const firstValue = data[0].revenue;
      const lastValue = data[data.length - 1].revenue;
      return ((lastValue - firstValue) / firstValue * 100).toFixed(2);
    } catch (error) {
      console.error('Growth rate calculation error:', error);
      return 'Unavailable';
    }
  }, []);

  // Advanced Contextual Insights Generation
  const generateInsights = useCallback((query, results) => {
    const insightRules = [
      {
        condition: (q) => q.includes('revenue'),
        insight: () => `Revenue ${results.summary.averageGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(results.summary.averageGrowth)}%`
      },
      {
        condition: (q) => q.includes('customer'),
        insight: () => `Customer base shows ${results.summary.totalCustomers > 1500 ? 'strong' : 'moderate'} growth`
      },
      {
        condition: (q) => q.includes('product'),
        insight: () => 'Product portfolio demonstrates consistent performance'
      }
    ];

    const matchedInsight = insightRules.find(rule => rule.condition(query));
    return matchedInsight ? matchedInsight.insight() : 'General performance remains stable';
  }, []);

  // Enhanced Suggestion Logic with better filtering and categorization
  const handleQueryChange = (value) => {
    dispatch({ type: 'SET_CURRENT_QUERY', payload: value });
    setShowSuggestions(true);

    // Handle command shortcuts
    if (value.startsWith('/')) {
      const matchedCommands = Object.entries(COMMAND_SHORTCUTS)
        .filter(([cmd]) => cmd.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(matchedCommands);
      return;
    }

    // Improved AI suggestion filtering with relevance scoring
    if (value.trim().length > 0) {
      // Split query into keywords
      const keywords = value.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      // Score each suggestion based on keyword matches
      const scoredSuggestions = AI_SUGGESTIONS.map(suggestion => {
        const suggestionLower = suggestion.toLowerCase();
        // Base score if suggestion contains the exact query
        let score = suggestionLower.includes(value.toLowerCase()) ? 10 : 0;
        
        // Add points for each keyword match
        keywords.forEach(keyword => {
          if (suggestionLower.includes(keyword)) {
            score += 5;
          }
        });
        
        return { suggestion, score };
      });
      
      // Filter suggestions with any score and sort by descending score
      const filteredSuggestions = scoredSuggestions
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.suggestion)
        .slice(0, 7); // Limit to top 7 suggestions
      
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // New function to handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    // If it's a command shortcut
    if (state.suggestionMode) {
      handleQueryChange(suggestion[0]);
    } else {
      handleQueryChange(suggestion);
    }

    // Clear suggestions and hide suggestion list
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Simulated Advanced Query Processing with Enhanced Error Handling
  const handleQuerySubmit = useCallback(() => {
    if (!state.currentQuery.trim()) {
      dispatch({
        type: 'PROCESS_QUERY_FAILURE',
        payload: 'Query cannot be empty'
      });
      return;
    }

    dispatch({ type: 'SUBMIT_QUERY' });

    // Simulate complex query processing with error handling
    try {
      const mockResults = generateMockResults(state.currentQuery);

      // Simulate async processing
      setTimeout(() => {
        dispatch({
          type: 'PROCESS_QUERY_SUCCESS',
          payload: mockResults
        });
      }, 500);
    } catch (error) {
      dispatch({
        type: 'PROCESS_QUERY_FAILURE',
        payload: 'Unable to process query. Please try again.'
      });
    }
  }, // eslint-disable-next-line
    [state.currentQuery]);

  // Memoized Mock Data Generation for Performance
  const generateMockResults = useMemo(() => {
    return (query) => {
      const baseData = [
        { name: 'Q1 2023', revenue: 450000, customers: 1200, products: 50 },
        { name: 'Q2 2023', revenue: 520000, customers: 1350, products: 55 },
        { name: 'Q3 2023', revenue: 610000, customers: 1500, products: 60 },
        { name: 'Q4 2023', revenue: 680000, customers: 1650, products: 65 }
      ];

      return {
        data: baseData,
        summary: {
          totalRevenue: baseData.reduce((sum, item) => sum + item.revenue, 0),
          totalCustomers: baseData.reduce((sum, item) => sum + item.customers, 0),
          averageGrowth: calculateGrowthRate(baseData)
        },
        insights: [generateInsights(query, {
          summary: {
            averageGrowth: calculateGrowthRate(baseData),
            totalCustomers: baseData.reduce((sum, item) => sum + item.customers, 0)
          }
        })]
      };
    };
  }, [calculateGrowthRate, generateInsights]);

  // Add click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the input and suggestion area
      const suggestionContainer = document.getElementById('suggestion-container');
      const inputElement = document.getElementById('query-input');

      if (
        suggestionContainer &&
        inputElement &&
        !suggestionContainer.contains(event.target) &&
        !inputElement.contains(event.target)
      ) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Visualization Renderer
  const renderVisualization = () => {
    if (!state.currentResults) return null;

    const data = state.currentResults.data;

    switch (visualizationType) {
      case 'bar':
        return (
          <BarChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            <Bar dataKey="customers" fill="#82ca9d" name="Customers" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="revenue"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <LineChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
            <Line type="monotone" dataKey="customers" stroke="#82ca9d" name="Customers" />
          </LineChart>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Gen AI Analytics Dashboard
        </h1>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{state.error}</span>
          </div>
        )}

        {/* Query Input Section */}
        <div className="mb-6 relative">
          <input
            id="query-input"
            type="text"
            value={state.currentQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Ask a business question or use /commands"
            className="w-full p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="suggestion-container"
              className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left p-2 hover:bg-blue-50 transition"
                >
                  {state.suggestionMode
                    ? `${suggestion[0]}: ${suggestion[1]}`
                    : suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleQuerySubmit}
            disabled={!state.currentQuery}
            className="flex-grow bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {state.isProcessing ? 'Processing...' : 'Get Insights'}
          </button>
          <button
            onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}
            className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Clear History
          </button>
        </div>

        {/* Visualization Controls */}
        {state.currentResults && (
          <div className="mb-6 flex justify-center space-x-4">
            <button
              onClick={() => setVisualizationType('line')}
              className={`px-4 py-2 rounded ${visualizationType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
                }`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setVisualizationType('bar')}
              className={`px-4 py-2 rounded ${visualizationType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
                }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setVisualizationType('pie')}
              className={`px-4 py-2 rounded ${visualizationType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
                }`}
            >
              Pie Chart
            </button>
          </div>
        )}

        {/* Results Visualization */}
        <div className="flex justify-center mb-6">
          {renderVisualization()}
        </div>

        {/* Insights Summary */}
        {state.currentResults && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Insights Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg shadow">
                <h3 className="font-bold text-blue-600">Total Revenue</h3>
                <p>${state.currentResults.summary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <h3 className="font-bold text-blue-600">Total Customers</h3>
                <p>{state.currentResults.summary.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <h3 className="font-bold text-blue-600">Growth Rate</h3>
                <p>{state.currentResults.summary.averageGrowth}%</p>
              </div>
            </div>

            {/* Contextual Insights */}
            <div className="mt-4 bg-white p-3 rounded-lg shadow">
              <h3 className="font-bold text-blue-600 mb-2">Key Insights</h3>
              <ul className="list-disc list-inside">
                {state.currentResults.insights.map((insight, index) => (
                  <li key={index} className="text-gray-700">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Query History */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Query History</h2>
          <div className="max-h-64 overflow-y-auto">
            {state.queries.map((queryItem, index) => (
              <div
                key={index}
                className="bg-gray-100 p-3 rounded-lg mb-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{queryItem.query}</p>
                  <p className="text-sm text-gray-500">{queryItem.timestamp}</p>
                </div>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    dispatch({
                      type: 'PROCESS_QUERY_SUCCESS',
                      payload: queryItem.results
                    });
                  }}
                >
                  Rerun
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenAIAnalyticsDashboard;