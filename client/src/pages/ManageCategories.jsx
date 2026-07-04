import { useState, useEffect } from 'react';
import api from '../lib/api';
import * as Icons from 'lucide-react';
import { cn } from '../components/Layout';

export default function ManageCategories() {
  const [sources, setSources] = useState([]);
  const [newSource, setNewSource] = useState({
    display_name_ta: '',
    key: '',
    color: '#3b82f6',
    icon: 'circle'
  });

  const fetchSources = async () => {
    try {
      const res = await api.get('/api/entries/sources');
      setSources(res.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/entries/sources', newSource);
      setNewSource({ display_name_ta: '', key: '', color: '#3b82f6', icon: 'circle' });
      fetchSources();
    } catch (error) {
      console.error('Error adding source:', error);
    }
  };

  const getIcon = (iconName) => {
    const iconKey = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const Icon = Icons[iconKey] || Icons.Circle;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-soil-900">வகைகளை நிர்வகி (Manage Types)</h2>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
        <h3 className="text-lg font-bold text-soil-900 mb-4">புதிய வகை சேர்க்க (Add New Type)</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-1">பெயர் (Name in Tamil)</label>
            <input
              type="text"
              value={newSource.display_name_ta}
              onChange={(e) => setNewSource({ ...newSource, display_name_ta: e.target.value })}
              className="w-full p-3 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
              placeholder="எ.கா: இயந்திர வாடகை"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-soil-700 mb-1">குறியீடு (Key in English)</label>
            <input
              type="text"
              value={newSource.key}
              onChange={(e) => setNewSource({ ...newSource, key: e.target.value })}
              className="w-full p-3 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
              placeholder="e.g. machine_rent"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-1">வண்ணம் (Color)</label>
              <input
                type="color"
                value={newSource.color}
                onChange={(e) => setNewSource({ ...newSource, color: e.target.value })}
                className="w-full h-12 p-1 border border-soil-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-1">படம் (Icon Name)</label>
              <input
                type="text"
                value={newSource.icon}
                onChange={(e) => setNewSource({ ...newSource, icon: e.target.value })}
                className="w-full p-3 border border-soil-300 rounded-xl focus:ring-2 focus:ring-field-500 outline-none"
                placeholder="e.g. star, truck, tool"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-field-500 text-white font-bold py-3 rounded-xl hover:bg-field-600 transition-colors mt-4"
          >
            சேர்க்க (Add)
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
        <h3 className="text-lg font-bold text-soil-900 mb-4">இருக்கும் வகைகள் (Existing Types)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sources.map(source => (
            <div key={source.id} className="flex items-center gap-3 p-3 rounded-xl border border-soil-100 bg-soil-50">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: source.color }}
              >
                {getIcon(source.icon)}
              </div>
              <span className="font-medium text-soil-800 text-sm">{source.display_name_ta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
