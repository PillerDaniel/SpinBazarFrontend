import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import axiosInstance from "../utils/axios";
import { FaSearch } from "react-icons/fa";

import {
  FaUserSlash,
  FaUserCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
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
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    userName: "",
    email: "",
    role: "",
  });
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
  }, []);

  useEffect(() => {
    let filtered = users;
    if (selectedRole && selectedRole !== t("adminDashboard.filters.allRoles")) {
      if (selectedRole === t("adminDashboard.filters.admin")) {
        filtered = filtered.filter((user) => user.role === "admin");
      } else if (selectedRole === t("adminDashboard.filters.user")) {
        filtered = filtered.filter((user) => user.role === "user");
      } else if (selectedRole === t("adminDashboard.filters.suspended")) {
        filtered = filtered.filter((user) => !user.isActive);
      } else if (selectedRole === t("adminDashboard.filters.active")) {
        filtered = filtered.filter((user) => user.isActive);
      }
    }
    if (searchQuery) {
      filtered = filtered.filter((user) =>
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, users, t]);

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
  const handleEditUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      await axiosInstance.put(
        `http://localhost:5001/admin/edituser/${editingUser._id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUsers = users.map((user) =>
        user._id === editingUser._id ? { ...user, ...editFormData } : user
      );
      setUsers(updatedUsers);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to edit user. Please try again later.");
      }
    }
  };
  const filterByRole = (role) => {
    setLoading(true);
    try {
      if (role) {
        setSelectedRole(
          t(
            `adminDashboard.filters.${
              role === false ? "suspended" : role === true ? "active" : role
            }`
          )
        );
      } else {
        setSelectedRole(t("adminDashboard.filters.allRoles"));
      }
    } catch (err) {
      setError("Failed to filter users. Please try again later.");
    }
    setLoading(false);
  };

  const filterByActiveStatus = (status) => {
    setSelectedRole(
      t(`adminDashboard.filters.${status ? "active" : "suspended"}`)
    );
  };

  const stats = calculateUserStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const openSuspendModal = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setModalAction("suspend");
    setShowModal(true);
  };

  const openActivateModal = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setModalAction("activate");
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      userName: user.userName,
      email: user.email,
      role: user.role,
    });
    setModalAction("edit"); 
    setShowModal(true);
  };
  const handleSuspendUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      await axiosInstance.put(
        `http://localhost:5001/admin/suspenduser/${selectedUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUsers = users.map((user) =>
        user._id === selectedUserId ? { ...user, isActive: false } : user
      );
      setUsers(updatedUsers);
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

  const handleActivateUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      await axiosInstance.put(
        `http://localhost:5001/admin/activateuser/${selectedUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUsers = users.map((user) =>
        user._id === selectedUserId ? { ...user, isActive: true } : user
      );
      setUsers(updatedUsers);
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="app-container flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col pt-16 px-4 md:px-40 text-white mt-10">
        <h1 className="text-3xl font-extrabold mb-6 text-white">
          {t("adminDashboard.title")}
        </h1>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
            <button className="ml-auto text-sm" onClick={() => setError(null)}>
              Dismiss
            </button>
          </Alert>
        )}

        <div className="mb-6 flex flex-col md:flex-row md:justify-between items-center">
          <Dropdown
            label={selectedRole || t("adminDashboard.filters.allRoles")}
            color="dark"
          >
            <Dropdown.Item onClick={() => filterByRole("")}>
              {t("adminDashboard.filters.allRoles")}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByRole("admin")}>
              {t("adminDashboard.filters.admin")}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByRole("user")}>
              {t("adminDashboard.filters.user")}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByActiveStatus(false)}>
              {t("adminDashboard.filters.suspended")}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByActiveStatus(true)}>
              {t("adminDashboard.filters.active")}
            </Dropdown.Item>
          </Dropdown>
          <div className="relative mt-4 md:mt-0 w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 p-2 rounded bg-gray-800 text-white border border-gray-600 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {!searchQuery && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="w-full bg-gray-800 border-gray-700">
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        {t("adminDashboard.totalUsers")}
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
                        {t("adminDashboard.adminUsers")}
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
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.id")}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.username")}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.email")}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.role")}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.joined")}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.status")}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700">
                      {t("adminDashboard.userTable.actions")}
                    </Table.HeadCell>
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
                          <Table.Cell className="text-gray-300">
                            {user.userName}
                          </Table.Cell>
                          <Table.Cell className="text-gray-300">
                            {user.email}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={user.role === "admin" ? "success" : "info"}
                            >
                              {user.role || t("adminDashboard.filters.user")}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="text-gray-300">
                            {formatDate(user.createdAt)}
                          </Table.Cell>
                          <Table.Cell>
                            {user.isActive ? (
                              <Badge color="success">
                                {t("adminDashboard.status.active")}
                              </Badge>
                            ) : (
                              <Badge color="failure">
                                {t("adminDashboard.status.suspended")}
                              </Badge>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <button
                              className="text-blue-500 hover:text-blue-400 mr-3"
                              onClick={() => openEditModal(user)}
                            >
                              {t("adminDashboard.actions.edit")}
                            </button>
                            {user.isActive ? (
                              <button
                                className="text-red-500 hover:text-red-400"
                                onClick={() =>
                                  openSuspendModal(user._id, user.userName)
                                }
                              >
                                {t("adminDashboard.actions.suspend")}
                              </button>
                            ) : (
                              <button
                                className="text-green-500 hover:text-green-400"
                                onClick={() =>
                                  openActivateModal(user._id, user.userName)
                                }
                              >
                                {t("adminDashboard.actions.activate")}
                              </button>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row className="bg-gray-800">
                        <Table.Cell
                          colSpan={7}
                          className="text-center py-4 text-gray-300"
                        >
                          {t("adminDashboard.userTable.noUsers")}
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
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        size="md"
        popup
        theme={{
          root: {
            base: "fixed inset-0 flex items-center justify-center z-50",
            show: {
              on: "flex",
              off: "hidden",
            },
          },
          content: {
            base: "relative bg-gray-800 shadow-lg rounded-lg w-full max-w-md transition-all duration-300 ease-in-out",
            inner:
              "relative rounded-lg bg-gray-800 shadow flex flex-col max-h-[90vh]",
          },
          header: {
            base: "flex items-start justify-between rounded-t border-b p-5 border-gray-600",
            title: "text-xl font-medium text-white",
            close: {
              base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-600 hover:text-white",
              icon: "h-5 w-5",
            },
          },
          body: {
            base: "p-6 flex-1 overflow-auto",
          },
          footer: {
            base: "flex items-center space-x-2 rounded-b border-t p-6 border-gray-600",
          },
        }}
      >
        <Modal.Header>
          {modalAction === "edit"
            ? t("adminDashboard.editModal.title")
            : t(`adminDashboard.modals.${modalAction}.title`)}
        </Modal.Header>
        <Modal.Body>
          {modalAction === "edit" ? (
            <div>
              <div className="mb-4">
                <label
                  htmlFor="edit-username"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  {t("adminDashboard.editModal.usernameLabel")}
                </label>
                <input
                  type="text"
                  id="edit-username"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
                  value={editFormData.userName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      userName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="edit-email"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  {t("adminDashboard.editModal.emailLabel")}
                </label>
                <input
                  type="email"
                  id="edit-email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="edit-role"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  {t("adminDashboard.editModal.roleLabel")}
                </label>
                <select
                  id="edit-role"
                  className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                >
                  <option value="user">
                    {t("adminDashboard.filters.user")}
                  </option>
                  <option value="admin">
                    {t("adminDashboard.filters.admin")}
                  </option>
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {modalAction === "suspend" ? (
                <FaExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-red-500" />
              ) : (
                <FaUserCheck className="mx-auto mb-4 h-14 w-14 text-green-500" />
              )}
              <h3 className="mb-5 text-lg font-normal text-gray-400">
                {t(`adminDashboard.modals.${modalAction}.message`, {
                  username: selectedUsername,
                })}
              </h3>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="flex justify-center">
          {modalAction === "edit" ? (
            <>
              <Button color="blue" onClick={handleEditUser}>
                {t("adminDashboard.editModal.save")}
              </Button>
              <Button color="red" onClick={() => setShowModal(false)}>
                {t("adminDashboard.modals.cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button
                color={modalAction === "suspend" ? "failure" : "success"}
                onClick={
                  modalAction === "suspend"
                    ? handleSuspendUser
                    : handleActivateUser
                }
              >
                {t(`adminDashboard.modals.${modalAction}.confirm`)}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                {t("adminDashboard.modals.cancel")}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
