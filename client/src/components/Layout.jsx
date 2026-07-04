import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, LayoutDashboard, History, PiggyBank, LineChart, LogOut, Menu, X, Handshake, Settings, Trees, Target } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'முகப்பு', path: '/', icon: LayoutDashboard },
  { name: 'புதிய பதிவு', path: '/entry', icon: Leaf },
  { name: 'வரலாறு', path: '/history', icon: History },
  { name: 'கடன்', path: '/loans', icon: Handshake },
  { name: 'முதலீடு', path: '/investment', icon: PiggyBank },
  { name: 'நிதி இலக்கு', path: '/target', icon: Target },
  { name: 'பயிர் திட்டம்', path: '/cropplans', icon: Trees },
  { name: 'போக்கு', path: '/trends', icon: LineChart },
  { name: 'வகைகள்', path: '/categories', icon: Settings },
];

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-soil-100">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-soil-900 text-soil-100 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Leaf className="w-6 h-6 text-field-500" />
          வனம்
        </h1>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-soil-900 text-soil-100 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col",
        menuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-2">
          <Leaf className="w-8 h-8 text-field-500" />
          <h1 className="text-2xl font-bold">வனம்</h1>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive ? "bg-soil-700 text-sun-300 font-semibold" : "hover:bg-soil-800"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-sun-300" : "text-soil-300")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-soil-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl hover:bg-soil-800 text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            வெளியேறு
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
