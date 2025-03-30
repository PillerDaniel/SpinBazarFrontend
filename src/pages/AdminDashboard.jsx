import React, { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import axiosInstance from "../utils/axios";
import {
  Card,
  Table,
  Badge,
  Dropdown,
  Spinner,
  Alert,
  Modal,
  Button,
} from "flowbite-react";
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
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState("");

  // proli megoldas elmeletben app.css -el van valami baj, de most igy jo refresh utan is
  useEffect(() => {
    document.body.style.backgroundImage = "url('/background.svg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";
  
    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

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

    return () => {};
  }, []);

  const calculateUserStats = () => {
    if (!filteredUsers || !filteredUsers.length) return null;

    const totalUsers = filteredUsers.length;
    const adminUsers = filteredUsers.filter(
      (user) => user.role === "admin"
    ).length;
    return {
      totalUsers,
      adminUsers,
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
    setSelectedRole(status === false ? "suspended" : "active");
  };

  const stats = calculateUserStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Open modal for suspend action
  const openSuspendModal = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setModalAction("suspend");
    setShowModal(true);
  };

  // Open modal for activate action
  const openActivateModal = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setModalAction("activate");
    setShowModal(true);
  };

  // Handle suspension after confirmation
  const handleSuspendUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const response = await axiosInstance.put(
        `http://localhost:5001/admin/suspenduser/${selectedUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update user in the state
      const updatedUsers = users.map((user) =>
        user._id === selectedUserId ? { ...user, isActive: false } : user
      );
      setUsers(updatedUsers);

      // Update filtered users as well
      const updatedFilteredUsers = filteredUsers.map((user) =>
        user._id === selectedUserId ? { ...user, isActive: false } : user
      );
      setFilteredUsers(updatedFilteredUsers);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to suspend user. Please try again later.");
      }
    }
  };

  // Handle activation after confirmation
  const handleActivateUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const response = await axiosInstance.put(
        `http://localhost:5001/admin/activateuser/${selectedUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update user in the state
      const updatedUsers = users.map((user) =>
        user._id === selectedUserId ? { ...user, isActive: true } : user
      );
      setUsers(updatedUsers);

      // Update filtered users as well
      const updatedFilteredUsers = filteredUsers.map((user) =>
        user._id === selectedUserId ? { ...user, isActive: true } : user
      );
      setFilteredUsers(updatedFilteredUsers);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to activate user. Please try again later.");
      }
    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col pt-16 px-4 md:px-40 text-white mt-10">
        <h1 className="text-3xl font-extrabold mb-6 text-white">Admin Dashboard</h1>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
            <button className="ml-auto text-sm" onClick={() => setError(null)}>
              Dismiss
            </button>
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
            <Dropdown.Item onClick={() => filterByActiveStatus(true)}>
              Active
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="w-full bg-gray-800 border-gray-700">
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

                <Card className="w-full bg-gray-800 border-gray-700">
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

            <Card className="mb-6 overflow-x-auto bg-gray-800 border-gray-700">
              <div className="overflow-x-auto">
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell className="bg-gray-700">ID</Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">Username</Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">Email</Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">Role</Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">Joined</Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">Status</Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y divide-gray-700">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <Table.Row
                          key={user._id}
                          className="bg-gray-800 border-gray-700"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-white">
                            {user._id.substring(0, 8)}...
                          </Table.Cell>
                          <Table.Cell className="text-gray-300">{user.userName}</Table.Cell>
                          <Table.Cell className="text-gray-300">{user.email}</Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={user.role === "admin" ? "success" : "info"}
                            >
                              {user.role || "user"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="text-gray-300">{formatDate(user.createdAt)}</Table.Cell>
                          <Table.Cell>
                            {user.isActive ? (
                              <Badge color="success">Active</Badge>
                            ) : (
                              <Badge color="failure">Suspended</Badge>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <button className="text-blue-500 hover:text-blue-400 mr-3">
                              Edit
                            </button>
                            {user.isActive ? (
                              <button
                                className="text-red-500 hover:text-red-400"
                                onClick={() =>
                                  openSuspendModal(user._id, user.userName)
                                }
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                className="text-green-500 hover:text-green-400"
                                onClick={() =>
                                  openActivateModal(user._id, user.userName)
                                }
                              >
                                Activate
                              </button>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row className="bg-gray-800">
                        <Table.Cell colSpan={7} className="text-center py-4 text-gray-300">
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
      </main>

      {/* Confirmation Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        size="md"
        popup
        theme={{
          root: {
            base: "fixed inset-0 flex items-center justify-center z-50",
            show: {
              on: "flex bg-gray-900 bg-opacity-50",
              off: "hidden",
            },
          },
          content: {
            base: "relative bg-gray-800 shadow-lg rounded-lg w-full max-w-md",
          },
        }}
      >
        <Modal.Header>
          <h3 className="text-xl font-medium text-white">
            {modalAction === "suspend" ? "Suspend User" : "Activate User"}
          </h3>
        </Modal.Header>
        <Modal.Body className="p-6 text-gray-300">
          <p>
            Are you sure you want to{" "}
            <span className="font-bold">{modalAction}</span> user{" "}
            <span className="font-bold">{selectedUsername}</span>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color={modalAction === "suspend" ? "failure" : "success"}
            onClick={
              modalAction === "suspend" ? handleSuspendUser : handleActivateUser
            }
          >
            Yes, {modalAction === "suspend" ? "Suspend" : "Activate"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default AdminDashboard;