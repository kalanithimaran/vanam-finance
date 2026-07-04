import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Calendar, Handshake, PiggyBank } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const { socket } = useAuth();
  const [overallSummary, setOverallSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [monthlySummary, setMonthlySummary] = useState({ income: 0, expense: 0, net: 0 });
  const [loanSummary, setLoanSummary] = useState({ taken: 0, given: 0 });
  const [customMonitors, setCustomMonitors] = useState({ homeExpenseThisMonth: 0, plantingMonitor: { income: 0, expense: 0, net: 0 } });
  const [target, setTarget] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    try {
      const overallSumRes = await api.get(`/api/entries/summary`);
      setOverallSummary(overallSumRes.data);
      
      const monthlySumRes = await api.get(`/api/entries/summary?month=${currentMonth}`);
      setMonthlySummary(monthlySumRes.data);

      const breakRes = await api.get(`/api/entries/breakdown`);
      setBreakdown(breakRes.data);

      const customRes = await api.get(`/api/entries/custom-monitors?month=${currentMonth}`);
      setCustomMonitors(customRes.data);

      const targetRes = await api.get(`/api/targets`);
      setTarget(targetRes.data);

      const loansRes = await api.get('/api/loans');
      let taken = 0;
      let given = 0;
      loansRes.data.forEach(loan => {
        if (loan.status === 'active') {
          if (loan.type === 'taken') taken += parseFloat(loan.amount);
          if (loan.type === 'given') given += parseFloat(loan.amount);
        }
      });
      setLoanSummary({ taken, given });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      const reload = () => fetchData();
      socket.on('entry:created', reload);
      socket.on('entry:updated', reload);
      socket.on('entry:deleted', reload);
      socket.on('loan:created', reload);
      socket.on('loan:updated', reload);
      socket.on('loan:deleted', reload);
      socket.on('loan:repayment_added', reload);

      return () => {
        socket.off('entry:created', reload);
        socket.off('entry:updated', reload);
        socket.off('entry:deleted', reload);
        socket.off('loan:created', reload);
        socket.off('loan:updated', reload);
        socket.off('loan:deleted', reload);
        socket.off('loan:repayment_added', reload);
      };
    }
  }, [socket]);

  const SummaryCard = ({ title, income, expense, net, icon: Icon }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
      <div className="flex items-center gap-2 mb-4 text-soil-700 font-bold border-b border-soil-100 pb-4">
        <Icon size={24} className="text-field-600" />
        <h3 className="text-xl">{title}</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-field-100 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-field-600" />
            </div>
            <span className="text-soil-600 font-medium text-lg">வரவு</span>
          </div>
          <span className="text-xl font-bold text-soil-900">₹{income.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <span className="text-soil-600 font-medium text-lg">செலவு</span>
          </div>
          <span className="text-xl font-bold text-soil-900">₹{expense.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="pt-4 mt-2 border-t border-soil-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sun-100 rounded-full flex items-center justify-center">
              <Wallet size={20} className="text-sun-600" />
            </div>
            <span className="text-soil-800 font-bold text-lg">லாபம்</span>
          </div>
          <span className={`text-2xl font-black ${net >= 0 ? 'text-field-600' : 'text-red-600'}`}>
            ₹{net.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-soil-900">கணக்கு சுருக்கம்</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard 
          title="மொத்த சுருக்கம் (Overall)" 
          income={overallSummary.income} 
          expense={overallSummary.expense} 
          net={overallSummary.net}
          icon={Wallet}
        />
        <SummaryCard 
          title="இந்த மாத சுருக்கம் (This Month)" 
          income={monthlySummary.income} 
          expense={monthlySummary.expense} 
          net={monthlySummary.net}
          icon={Calendar}
        />

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
          <div className="flex items-center gap-2 mb-4 text-soil-700 font-bold border-b border-soil-100 pb-4">
            <Handshake size={24} className="text-sun-600" />
            <h3 className="text-xl">கடன் சுருக்கம் (Active Loans)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-soil-600 font-medium text-lg">வாங்கிய கடன்</span>
              <span className="text-xl font-bold text-red-600">₹{loanSummary.taken.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-soil-600 font-medium text-lg">கொடுத்த கடன்</span>
              <span className="text-xl font-bold text-field-600">₹{loanSummary.given.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-4 mt-2 border-t border-soil-100 flex justify-between items-center">
              <span className="text-soil-800 font-bold text-lg">நிகர கடன்</span>
              <span className={`text-2xl font-black ${loanSummary.given - loanSummary.taken >= 0 ? 'text-field-600' : 'text-red-600'}`}>
                ₹{(loanSummary.given - loanSummary.taken).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Target Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
        <div className="flex justify-between items-center mb-6 border-b border-soil-100 pb-4">
          <div className="flex items-center gap-2 text-soil-700 font-bold">
            <div className="w-8 h-8 bg-sun-100 rounded-full flex items-center justify-center">
              <PiggyBank size={18} className="text-sun-600" />
            </div>
            <h3 className="text-xl">நிதி இலக்கு (Savings Target)</h3>
          </div>
          <a 
            href="/target"
            className="text-field-600 font-medium text-sm border border-field-200 px-4 py-2 rounded-lg hover:bg-field-50"
          >
            {target ? 'இலக்கை மாற்று (Change)' : 'இலக்கை அமை (Set)'}
          </a>
        </div>

        {target ? (
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h4 className="font-bold text-soil-900 text-lg">{target.name}</h4>
                <p className="text-sm text-soil-500">
                  காலக்கெடு: {new Date(target.target_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-soil-500 font-medium">கையிருப்பு (In-hand)</p>
                <p className="text-xl font-black text-field-600">
                  ₹{Math.max(overallSummary.net, 0).toLocaleString('en-IN')} 
                  <span className="text-sm text-soil-400 font-normal"> / ₹{parseFloat(target.amount).toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-soil-100 rounded-full h-4 overflow-hidden border border-soil-200">
              <div 
                className="bg-field-500 h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(100, Math.max(0, (overallSummary.net / parseFloat(target.amount)) * 100))}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm font-medium text-soil-600">
                நிறைவு: {Math.min(100, Math.max(0, (overallSummary.net / parseFloat(target.amount)) * 100)).toFixed(1)}%
              </p>
              <p className="text-sm font-bold text-red-500">
                தேவை (Remaining): ₹{Math.max(0, parseFloat(target.amount) - overallSummary.net).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-soil-500 py-4">தற்போது எந்த இலக்கும் இல்லை. புதிய இலக்கை அமைக்கவும்.</p>
        )}
      </div>

      {/* Custom Monitors */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
          <div className="flex items-center gap-2 mb-4 text-soil-700 font-bold border-b border-soil-100 pb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown size={18} className="text-red-600" />
            </div>
            <h3 className="text-xl">வீட்டுச் செலவு (Home Expense)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-soil-600 font-medium text-lg">இந்த மாதம்</span>
              <span className="text-2xl font-black text-red-600">₹{customMonitors.homeExpenseThisMonth.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-soil-700 font-bold border-b border-soil-100 pb-4">
            <div className="w-8 h-8 bg-field-100 rounded-full flex items-center justify-center">
              <TrendingUp size={18} className="text-field-600" />
            </div>
            <h3 className="text-xl">விவசாயம் (Planting Monitor: 6 Months)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-field-50 p-4 rounded-2xl border border-field-100 flex flex-col justify-center">
              <span className="text-soil-600 font-medium mb-1">வரவு (Income)</span>
              <span className="text-xl font-bold text-field-600">₹{customMonitors.plantingMonitor.income.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col justify-center">
              <span className="text-soil-600 font-medium mb-1">செலவு (Expense)</span>
              <span className="text-xl font-bold text-red-600">₹{customMonitors.plantingMonitor.expense.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-sun-50 p-4 rounded-2xl border border-sun-100 flex flex-col justify-center">
              <span className="text-soil-800 font-medium mb-1">லாபம் (Net Profit)</span>
              <span className={`text-2xl font-black ${customMonitors.plantingMonitor.net >= 0 ? 'text-field-600' : 'text-red-600'}`}>
                ₹{customMonitors.plantingMonitor.net.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      {breakdown.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil-200">
          <h3 className="text-lg font-bold text-soil-900 mb-6">மொத்த வருமான பிரிவு (Overall Breakdown)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
