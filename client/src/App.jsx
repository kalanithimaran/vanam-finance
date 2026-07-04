import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/EntryForm';
import History from './pages/History';
import Investment from './pages/Investment';
import Trends from './pages/Trends';
import Loans from './pages/Loans';
import ManageCategories from './pages/ManageCategories';
import CropPlans from './pages/CropPlans';
import SetTarget from './pages/SetTarget';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="entry" element={<EntryForm />} />
        <Route path="history" element={<History />} />
        <Route path="investment" element={<Investment />} />
        <Route path="trends" element={<Trends />} />
        <Route path="loans" element={<Loans />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="cropplans" element={<CropPlans />} />
        <Route path="target" element={<SetTarget />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
