import React, { useState, useEffect } from 'react';
import ErrorAlert from '../components/ui/ErrorAlert';
import SuccessAlert from '../components/ui/SuccessAlert';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import UserMenu from '../components/ui/UserMenu';
import axiosInstance from '../utils/axios';


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
  
      const response = await axiosInstance.get(
        "http://localhost:5001/admin/getusers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      
      setUsers(response.data.users); 
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      setLoading(false);
    }
  };
  

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/admin/deleteuser/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        
        setUsers(users.filter(user => user._id !== userId));
        setSuccess('User deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <UserMenu />
        </div>
        
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'users' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Users
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('games')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'games' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Games
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('statistics')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'statistics' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Statistics
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'settings' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    Add New User
                  </button>
                </div>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.length > 0 ? (
                          users.map(user => (
                            <tr key={user._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._id.substring(0, 8)}...</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.userName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role || 'user'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button 
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'games' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Game Management</h2>
                <p className="text-gray-600">
                  This section will allow you to manage game settings, view game history, and monitor active games.
                </p>
              </div>
            )}
            
            {activeTab === 'statistics' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
                <p className="text-gray-600">
                  View detailed statistics about user activity, game popularity, and platform performance.
                </p>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
                <p className="text-gray-600">
                  Configure platform settings, security options, and admin preferences.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;