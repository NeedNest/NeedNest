import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import DonateItem from './pages/DonateItem';
import MyDonations from './pages/MyDonations';
import MyRequests from './pages/MyRequests';
import DonorRequests from './pages/DonorRequests';
import Profile from './pages/Profile';
import Complaint from './pages/Complaint';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminItems from './pages/AdminItems';
import './App.css';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-content">
          <div className="spinner"></div>
          <p>Loading NeedNest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<BrowseItems />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/items/:id" element={<ItemDetails />} />

          {/* Protected Routes */}
          <Route path="/donate" element={
            <ProtectedRoute><DonateItem /></ProtectedRoute>
          } />
          <Route path="/my-donations" element={
            <ProtectedRoute><MyDonations /></ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute><MyRequests /></ProtectedRoute>
          } />
          <Route path="/donor-requests" element={
            <ProtectedRoute><DonorRequests /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />
          <Route path="/admin/items" element={
            <AdminRoute><AdminItems /></AdminRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
