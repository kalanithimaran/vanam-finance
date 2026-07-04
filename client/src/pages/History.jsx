import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { cn } from '../components/Layout';

export default function History() {
  const { socket } = useAuth();
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/api/entries');
      setEntries(res.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  useEffect(() => {
    fetchEntries();

    if (socket) {
      socket.on('entry:created', fetchEntries);
      socket.on('entry:updated', fetchEntries);
      socket.on('entry:deleted', fetchEntries);

      return () => {
        socket.off('entry:created');
        socket.off('entry:updated');
        socket.off('entry:deleted');
      };
    }
  }, [socket]);

  const handleDelete = async (id) => {
    if (window.confirm('இந்த பதிவை நிச்சயமாக அழிக்க வேண்டுமா?')) {
      try {
        await api.delete(`/api/entries/${id}`);
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-soil-900 mb-6">வரலாறு</h2>

      <div className="bg-white rounded-3xl shadow-sm border border-soil-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-soil-50 text-soil-600 text-sm border-b border-soil-200">
                <th className="p-4 font-medium">தேதி</th>
                <th className="p-4 font-medium">வகை</th>
                <th className="p-4 font-medium">குறிப்பு</th>
                <th className="p-4 font-medium text-right">தொகை (₹)</th>
                <th className="p-4 font-medium text-center">செயல்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-soil-50 transition-colors">
                  <td className="p-4 text-soil-900">
                    {format(new Date(entry.entry_date), 'dd/MM/yyyy')}
                  </td>
                  <td className="p-4">
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: entry.source.color }}
                    >
                      {entry.source.display_name_ta}
                    </span>
                  </td>
                  <td className="p-4 text-soil-600 text-sm max-w-[200px] truncate">
                    {entry.note || '-'}
                  </td>
                  <td className={cn(
                    "p-4 text-right font-bold",
                    entry.type === 'income' ? "text-field-600" : "text-red-600"
                  )}>
                    {entry.type === 'income' ? '+' : '-'}₹{parseFloat(entry.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-soil-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-soil-500">
                    பதிவுகள் ஏதும் இல்லை
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
