import React, { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import axiosInstance from "../utils/axios";
import { Card, Table, Badge, Dropdown, Spinner, Alert } from "flowbite-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axiosInstance.get(
          "http://localhost:5001/admin/getusers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data.users || [];
        setUsers(userData);
        setFilteredUsers(userData);

        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load user data. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const calculateUserStats = () => {
    if (!filteredUsers || !filteredUsers.length) return null;

    const totalUsers = filteredUsers.length;
    const adminUsers = filteredUsers.filter(
      (user) => user.role === "admin"
    ).length;
    const regularUsers = filteredUsers.filter(
      (user) => user.role !== "admin"
    ).length;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
    };
  };
  const filterByRole = (role) => {
    setLoading(true);
    try {
      if (role) {
        const filtered = users.filter((user) => user.role === role);
        setFilteredUsers(filtered);
        setSelectedRole(role);
      } else {
        setFilteredUsers(users);
        setSelectedRole("");
      }
    } catch (err) {
      setError("Failed to filter users. Please try again later.");
    }
    setLoading(false);
  };
  const filterByActiveStatus = (status) => {
    const filtered = users.filter((user) => user.isActive === status);
    setFilteredUsers(filtered);
    setSelectedRole("suspended");
  };
  
  
  const stats = calculateUserStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleSuspendUser = async (userId) => {

    if (!window.confirm("Are you sure you want to suspend the user?")) return;

    try {
      const response = await axiosInstance.put(
        `http://localhost:5001/admin/suspenduser/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to suspend user. Please try again later.");
      }
    }
  }

  const handleActivateUser = async(userId) => {
    if (!window.confirm("Are you sure you want to activate the user?")) return;
    try {
      const response = await axiosInstance.put(
        `http://localhost:5001/admin/activateuser/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to activate user. Please try again later.");
      }
    }
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 pt-30 pb-24 flex-grow">
        <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="mb-6">
          <Dropdown label={selectedRole || "All Roles"} color="dark">
            <Dropdown.Item onClick={() => filterByRole("")}>
              All Roles
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByRole("admin")}>
              Admin
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByRole("user")}>
              User
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByActiveStatus(false)}>
              Suspended
            </Dropdown.Item>
          </Dropdown>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="w-full">
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        Total Users
                      </h5>
                      <div className="p-2 bg-blue-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="font-normal text-4xl text-gray-200 mb-2">
                      {stats.totalUsers}
                    </p>
                  </div>
                </Card>

                <Card className="w-full">
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        Admin Users
                      </h5>
                      <div className="p-2 bg-green-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="font-normal text-4xl text-gray-200 mb-2">
                      {stats.adminUsers}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            <Card className="mb-6 overflow-x-auto">
              <div className="overflow-x-auto">
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell>ID</Table.HeadCell>
                    <Table.HeadCell>Username</Table.HeadCell>
                    <Table.HeadCell>Email</Table.HeadCell>
                    <Table.HeadCell>Role</Table.HeadCell>
                    <Table.HeadCell>Joined</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <Table.Row
                          key={user._id}
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {user._id.substring(0, 8)}...
                          </Table.Cell>
                          <Table.Cell>{user.userName}</Table.Cell>
                          <Table.Cell>{user.email}</Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={user.role === "admin" ? "success" : "info"}
                            >
                              {user.role || "user"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
                          <Table.Cell>
                            {user.isActive ? (
                              <Badge color="success">Active</Badge>
                            ) : (
                              <Badge color="failure">Suspended</Badge>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                            {user.isActive ? (
                            <button className="text-red-600 hover:text-red-900" onClick={() => handleSuspendUser(user._id)}>
                              Suspend
                            </button>
                          ) : (
                            <button className="text-green-600 hover:text-green-900" onClick={() => handleActivateUser(user._id)}>
                              Activate
                            </button>
                          )}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="text-center py-4">
                          No users found
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
