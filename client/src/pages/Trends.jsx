import { useState, useEffect } from 'react';
import api from '../lib/api';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart } from 'lucide-react';

export default function Trends() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await api.get('/api/entries/trend?months=6');
        // Format month strings
        const formattedData = res.data.map(d => ({
          ...d,
          monthName: new Date(d.month + '-01').toLocaleString('ta-IN', { month: 'short' }),
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching trend:', error);
      }
    };
    fetchTrend();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-field-100 rounded-xl text-field-600">
          <LineChart className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-soil-900">போக்கு</h2>
          <p className="text-soil-500 text-sm">கடந்த 6 மாதங்களின் வருமானம் மற்றும் செலவு</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5d9c5" />
              <XAxis dataKey="monthName" stroke="#8c6239" />
              <YAxis stroke="#8c6239" />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="வரவு" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="செலவு" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
