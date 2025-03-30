import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Clock, CreditCard, HelpCircle, LogOut, Settings, User, Calendar, Mail, Shield, Activity, RefreshCw } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import axios from 'axios';

const Profile = () => {
  const {  logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:5001/user/account", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const {userName, email, createdAt, birthDate, isActive, role, wallet  } = response.data.userData;
        const activeDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
        setUserDetails({
          userName: userName || 'User',
          email: email,
          createdAt: createdAt,
          birthDate: birthDate,
          isActive: isActive,
          role: role || 'user',
          walletBalance: wallet.balance,
          stats: {
            daysActive: activeDays,
            lastLogin: new Date(),
            totalTransactions: 24,
          }
        })
    
        setTransactions([
          { id: 1, type: 'deposit', amount: 100, date: new Date('2024-03-15'), status: 'completed' },
          { id: 2, type: 'withdrawal', amount: 50, date: new Date('2024-03-10'), status: 'completed' },
          { id: 3, type: 'purchase', amount: 25, date: new Date('2024-03-05'), status: 'pending' },
          { id: 4, type: 'deposit', amount: 75, date: new Date('2024-02-28'), status: 'completed' },
        ]);


      } catch (error) {
        console.error("Error fetching user:", error);
      }finally {
        setLoading(false);
      }
    };
  
    fetchUser(); 
  
  }, []); 
  
  const handleLogout = () => {
    logout();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar/>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl mb-4">
                  <b>{userDetails?.userName.charAt(0).toUpperCase()}</b>
                </div>
                <h2 className="text-xl font-bold text-white">{userDetails?.userName}</h2>
                <p className="text-gray-200 text-sm">{userDetails?.email}</p>
                <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {userDetails?.role.charAt(0).toUpperCase() + userDetails?.role.slice(1)}
                </div>
              </div>

              <ul className="space-y-2">
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${activeTab === 'overview' ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <User size={18} />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${activeTab === 'wallet' ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('wallet')}
                  >
                    <CreditCard size={18} />
                    <span>Wallet</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${activeTab === 'activity' ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('activity')}
                  >
                    <Activity size={18} />
                    <span>Activity</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${activeTab === 'settings' ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-700 rounded-lg shadow p-4 text-white">
              <h3 className="font-medium flex items-center">
                <HelpCircle size={16} className="mr-2" />
                Need Help?
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <button className="mt-3 w-full bg-white text-blue-700 rounded-md py-2 text-sm font-medium">
                Contact Support
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-900 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm">Wallet Balance</p>
                        <h3 className="text-2xl font-bold text-white">{formatCurrency(userDetails?.walletBalance)}</h3>
                      </div>
                      <div className="p-2 bg-green-500 rounded-md">
                        <CreditCard size={20} className="text-green-100" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm">
                      <button className="text-blue-600 font-medium">Add Funds</button>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm">Member Since</p>
                        <h3 className="text-xl font-bold text-white">{formatDate(userDetails?.createdAt)}</h3>
                      </div>
                      <div className="p-2 bg-blue-500 rounded-md">
                        <Clock size={20} className="text-blue-100" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white">
                      {userDetails?.stats.daysActive} days active
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm">Account Status</p>
                        <h3 className="text-xl font-bold flex items-center text-white">
                          {userDetails?.isActive ? (
                            <>
                              <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                              Active
                            </>
                          ) : (
                            <>
                              <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>
                              Inactive
                            </>
                          )}
                        </h3>
                      </div>
                      <div className="p-2 bg-purple-500 rounded-md">
                        <Shield size={20} className="text-purple-100" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white">
                      Last login: {formatDate(userDetails?.stats.lastLogin)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-900">
                    <h2 className="text-lg font-medium text-white">Personal Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <User size={28} className="mr-2 text-white" />
                          Username
                        </h3>
                        <p className="mt-1 text-xl text-white">{userDetails?.userName}</p>
                      </div>

                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <Mail size={28} className="mr-2" />
                          Email Address
                        </h3>
                        <p className="mt-1 text-xl text-white">{userDetails?.email}</p>
                      </div>

                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <Calendar size={28} className="mr-2" />
                          Birth Date
                        </h3>
                        <p className="mt-1 text-white">{formatDate(userDetails?.birthDate)}</p>
                      </div>

                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <Shield size={28} className="mr-2 text-yellow-400" />
                          Role
                        </h3>
                        <p className="mt-1 text-xl text-white">{userDetails?.role.charAt(0).toUpperCase() + userDetails?.role.slice(1)}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="bg-blue-700 text-blue-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800">
                        Edit Information
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div>
                <div className="bg-gray-900 rounded-lg shadow p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-white">Wallet Balance</h2>
                      <p className="text-white text-sm">Manage your funds</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="text-2xl font-bold text-white">{formatCurrency(userDetails?.walletBalance)}</div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button className="bg-blue-700 text-blue-50 px-6 py-3 rounded-md font-medium hover:bg-blue-800">
                      Add Funds
                    </button>
                    <button className="bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700">
                      Withdraw
                    </button>
                    <button className="bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700">
                      Transaction History
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-white">Recent Transactions</h2>
                    <button className="text-blue-600 text-sm font-medium flex items-center">
                      <RefreshCw size={14} className="mr-1" />
                      Refresh
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-900 text-white">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="bg-gray-800 text-white">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-md mr-3 ${
                                  transaction.type === 'deposit' ? 'bg-green-600' :
                                  transaction.type === 'withdrawal' ? 'bg-red-600' : 'bg-blue-600'
                                }`}>
                                  {transaction.type === 'deposit' ? (
                                    <RefreshCw size={16} className="text-green-100" />
                                  ) : transaction.type === 'withdrawal' ? (
                                    <RefreshCw size={16} className="text-red-100" />
                                  ) : (
                                    <CreditCard size={16} className="text-blue-100" />
                                  )}
                                </div>
                                <div className="text-sm font-medium capitalize">
                                  {transaction.type}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                transaction.type === 'deposit' ? 'text-green-400' :
                                transaction.type === 'withdrawal' ? 'text-red-400' : 'text-gray-300'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                                {formatCurrency(transaction.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === 'completed' ? 'bg-green-500 text-green-100' :
                                transaction.status === 'pending' ? 'bg-yellow-500 text-yellow-100' :
                                'bg-red-500 text-red-100'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {transactions.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No transactions found
                    </div>
                  )}
                  <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
                    <button className="text-blue-600 text-sm font-medium">
                      View All Transactions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Account Activity</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-700 mb-4">
                    <h3 className="font-medium text-white">Recent Activity</h3>
                    <div>
                      <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-blue-100 mr-4">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Profile was updated</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-green-100 mr-4">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Funds were added to your wallet</p>
                        <p className="text-sm text-gray-500">4 days ago</p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-purple-100 mr-4">
                        <Settings size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Account settings were changed</p>
                        <p className="text-sm text-gray-500">1 week ago</p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-yellow-100 mr-4">
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Notification preferences updated</p>
                        <p className="text-sm text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="text-blue-600 text-sm font-medium">
                      View Full Activity Log
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                    <h2 className="text-lg font-medium text-white">Account Settings</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-white">Email Address</h3>
                        <div className="mt-2 flex items-center">
                          <input
                            type="email"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-900 text-white rounded-md"
                            placeholder="you@example.com"
                            defaultValue={userDetails?.email}
                          />
                          <button className="ml-4 bg-blue-700 text-blue-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800">
                            Update
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-white">Password</h3>
                        <div className="mt-2">
                          <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                            Change Password
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white">Two-factor authentication</h3>
                          <div className="flex items-center">
                            <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-700" role="switch" aria-checked="false">
                              <span className="translate-x-0 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                                <span className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity opacity-100 ease-in duration-200">
                                  <span className="h-3 w-3 bg-gray-400 rounded-full"></span>
                                </span>
                              </span>
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Add additional security to your account using two-factor authentication.
                        </p>
                      </div>

                      <div className="pt-6 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white">Email notifications</h3>
                          <div className="flex items-center">
                            <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600" role="switch" aria-checked="true">
                              <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                                <span className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity opacity-100 ease-in duration-200">
                                  <span className="h-3 w-3 bg-blue-600 rounded-full"></span>
                                </span>
                              </span>
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Receive email notifications about account activity and updates.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <button className="bg-red-600 text-red-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600">
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;