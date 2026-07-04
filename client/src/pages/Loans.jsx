import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { format } from 'date-fns';
import { Handshake, Plus, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '../components/Layout';

export default function Loans() {
  const { socket } = useAuth();
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('taken'); // 'taken' or 'given'
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New loan form state
  const [newLoan, setNewLoan] = useState({
    person_name: '',
    amount: '',
    interest_rate: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  const fetchLoans = async () => {
    try {
      const res = await api.get('/api/loans');
      setLoans(res.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  useEffect(() => {
    fetchLoans();
    if (socket) {
      socket.on('loan:created', fetchLoans);
      socket.on('loan:updated', fetchLoans);
      socket.on('loan:deleted', fetchLoans);
      socket.on('loan:repayment_added', fetchLoans);
      return () => {
        socket.off('loan:created');
        socket.off('loan:updated');
        socket.off('loan:deleted');
        socket.off('loan:repayment_added');
      };
    }
  }, [socket]);

  const handleAddLoan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/loans', { ...newLoan, type: activeTab });
      setShowAddForm(false);
      setNewLoan({ person_name: '', amount: '', interest_rate: '', start_date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const handleCloseLoan = async (id) => {
    if (window.confirm('இந்த கடனை முடித்துவிட்டதாக குறிக்க வேண்டுமா?')) {
      try {
        await api.put(`/api/loans/${id}/close`);
      } catch (error) {
        console.error('Error closing loan:', error);
      }
    }
  };

  const handleDeleteLoan = async (id) => {
    if (window.confirm('இந்த கடனை நிச்சயமாக அழிக்க வேண்டுமா?')) {
      try {
        await api.delete(`/api/loans/${id}`);
      } catch (error) {
        console.error('Error deleting loan:', error);
      }
    }
  };

  const filteredLoans = loans.filter(l => l.type === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-soil-100 rounded-xl text-soil-600">
            <Handshake className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-soil-900">கடன் கணக்கு</h2>
            <p className="text-soil-500 text-sm">வாங்கிய மற்றும் கொடுத்த கடன்கள்</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-field-500 text-white p-3 rounded-xl hover:bg-field-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">புதிய கடன்</span>
        </button>
      </div>

      <div className="flex bg-soil-100 p-1 rounded-2xl mb-8 w-full max-w-sm">
        <button
          onClick={() => setActiveTab('taken')}
          className={cn(
            "flex-1 py-3 text-center rounded-xl font-medium transition-all",
            activeTab === 'taken' ? "bg-white shadow-sm text-red-600" : "text-soil-500 hover:text-soil-700"
          )}
        >
          வாங்கியது
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={cn(
            "flex-1 py-3 text-center rounded-xl font-medium transition-all",
            activeTab === 'given' ? "bg-white shadow-sm text-field-600" : "text-soil-500 hover:text-soil-700"
          )}
        >
          கொடுத்தது
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLoan} className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200 mb-8 space-y-4">
          <h3 className="font-bold text-soil-900 mb-4">புதிய கடன் பதிவு</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-1">பெயர்</label>
              <input required type="text" value={newLoan.person_name} onChange={e => setNewLoan({...newLoan, person_name: e.target.value})} className="w-full p-3 border border-soil-300 rounded-xl outline-none focus:border-field-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-1">தொகை (₹)</label>
              <input required type="number" value={newLoan.amount} onChange={e => setNewLoan({...newLoan, amount: e.target.value})} className="w-full p-3 border border-soil-300 rounded-xl outline-none focus:border-field-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-1">வட்டி விகிதம் (%) (விருப்பமானால்)</label>
              <input type="number" step="0.01" value={newLoan.interest_rate} onChange={e => setNewLoan({...newLoan, interest_rate: e.target.value})} className="w-full p-3 border border-soil-300 rounded-xl outline-none focus:border-field-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-700 mb-1">தேதி</label>
              <input required type="date" value={newLoan.start_date} onChange={e => setNewLoan({...newLoan, start_date: e.target.value})} className="w-full p-3 border border-soil-300 rounded-xl outline-none focus:border-field-500" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-field-500 text-white px-6 py-2 rounded-xl font-medium">சேமிக்க</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-soil-200 text-soil-700 px-6 py-2 rounded-xl font-medium">ரத்து</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredLoans.map(loan => (
          <div key={loan.id} className={cn(
            "bg-white p-6 rounded-3xl shadow-sm border",
            loan.status === 'closed' ? "border-soil-200 opacity-70" : (activeTab === 'taken' ? "border-red-200" : "border-field-200")
          )}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-soil-900">{loan.person_name}</h3>
                <p className="text-sm text-soil-500">{format(new Date(loan.start_date), 'dd/MM/yyyy')}</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-2xl font-bold",
                  activeTab === 'taken' ? "text-red-600" : "text-field-600"
                )}>
                  ₹{parseFloat(loan.amount).toLocaleString('en-IN')}
                </p>
                {loan.interest_rate && <p className="text-sm text-soil-500">வட்டி: {loan.interest_rate}%</p>}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-soil-100">
              <span className={cn(
                "px-3 py-1 text-xs font-bold rounded-full",
                loan.status === 'closed' ? "bg-soil-200 text-soil-600" : "bg-sun-100 text-sun-700"
              )}>
                {loan.status === 'closed' ? 'முடிந்தது' : 'செயலில்'}
              </span>
              
              <div className="flex gap-2">
                {loan.status === 'active' && (
                  <button onClick={() => handleCloseLoan(loan.id)} className="p-2 text-field-600 hover:bg-field-50 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => handleDeleteLoan(loan.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredLoans.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-soil-500 bg-white rounded-3xl border border-soil-200">
            பதிவுகள் ஏதும் இல்லை
          </div>
        )}
      </div>
    </div>
  );
}
