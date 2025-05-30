
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import ErrorAlert from "../components/ui/ErrorAlert";
import SuccessAlert from "../components/ui/SuccessAlert";
import {
  FaSearch,
  FaUserSlash,
  FaUserCheck,
  FaExclamationTriangle,
  FaUsers,
  FaUserShield,
  FaFilter,
} from "react-icons/fa";
import {
  Card,
  Badge,
  Dropdown,
  Spinner,
  Modal,
  Button,
} from "flowbite-react";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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

  const language = localStorage.getItem("i18nextLng");

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const handleViewProfile = (userId) => {
    navigate(`/admin/userprofile/${userId}`);
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#111827";
    document.body.style.backgroundImage =
      "radial-gradient(circle at 50% 50%, #1f2937 0%, #111827 100%)";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axiosInstance.get("/admin/getusers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    setCurrentPage(1);
  }, [searchQuery, selectedRole, users, t]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const calculateUserStats = () => {
    if (!filteredUsers || !filteredUsers.length) return null;

    const totalUsers = filteredUsers.length;
    const adminUsers = filteredUsers.filter(
      (user) => user.role === "admin"
    ).length;
    const activeUsers = filteredUsers.filter((user) => user.isActive).length;
    const suspendedUsers = totalUsers - activeUsers;

    return {
      totalUsers,
      adminUsers,
      activeUsers,
      suspendedUsers,
    };
  };

  const handleEditUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const response = await axiosInstance.put(
        `admin/edituser/${editingUser._id}`,
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
      if (language === "hu") {
        setSuccess(response.data.messageHU);
      } else {
        setSuccess(response.data.message);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.message) {
        if (language === "hu") {
          setError(err.response.data.messageHU);
        } else {
          setError(err.response.data.message);
        }
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
      const response = await axiosInstance.put(
        `/admin/suspenduser/${selectedUserId}`,
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
      if (language === "hu") {
        setSuccess(response.data.messageHU);
      } else {
        setSuccess(response.data.message);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.message) {
        if (language === "hu") {
          setError(err.response.data.messageHU);
        } else {
          setError(err.response.data.message);
        }
      }
    }
  };

  const handleActivateUser = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const response = await axiosInstance.put(
        `/admin/activateuser/${selectedUserId}`,
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
      if (language === "hu") {
        setSuccess(response.data.messageHU);
      } else {
        setSuccess(response.data.message);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.message) {
        if (language === "hu") {
          setError(err.response.data.messageHU);
        } else {
          setError(err.response.data.message);
        }
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <ErrorAlert message={error} onClose={clearError} />
      <SuccessAlert message={success} onClose={clearSuccess} />

      <main className="flex-grow px-4 md:px-8 lg:px-12 py-6 md:py-10 max-w-screen-2xl mx-auto w-full mb-15 mt-20">
        {!loading && !searchQuery && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <Card className="hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-800 to-gray-900 border-0 shadow-lg">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm font-medium mb-1">
                     {t("adminDashboard.totalUsers")}
                   </p>
                   <h3 className="text-3xl font-bold text-white">
                     {stats.totalUsers}
                   </h3>
                 </div>
                 <div className="p-3 rounded-full bg-blue-600/20 text-blue-400">
                   <FaUsers className="h-6 w-6" />
                 </div>
               </div>
             </Card>

             <Card className="hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-800 to-gray-900 border-0 shadow-lg">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm font-medium mb-1">
                     {t("adminDashboard.adminUsers")}
                   </p>
                   <h3 className="text-3xl font-bold text-white">
                     {stats.adminUsers}
                   </h3>
                 </div>
                 <div className="p-3 rounded-full bg-green-600/20 text-green-400">
                   <FaUserShield className="h-6 w-6" />
                 </div>
               </div>
             </Card>

             <Card className="hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-800 to-gray-900 border-0 shadow-lg">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm font-medium mb-1">
                     {t("adminDashboard.activeUsers", "Active Users")}
                   </p>
                   <h3 className="text-3xl font-bold text-white">
                     {stats.activeUsers}
                   </h3>
                 </div>
                 <div className="p-3 rounded-full bg-teal-600/20 text-teal-400">
                   <FaUserCheck className="h-6 w-6" />
                 </div>
               </div>
             </Card>

             <Card className="hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-800 to-gray-900 border-0 shadow-lg">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm font-medium mb-1">
                     {t("adminDashboard.suspendedUsers", "Suspended Users")}
                   </p>
                   <h3 className="text-3xl font-bold text-white">
                     {stats.suspendedUsers}
                   </h3>
                 </div>
                 <div className="p-3 rounded-full bg-red-600/20 text-red-400">
                   <FaUserSlash className="h-6 w-6" />
                 </div>
               </div>
             </Card>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
           <div className="w-full sm:w-auto relative">
             <style jsx={true.toString()}>{`
               :global(.dropdown-menu) {
                 width: auto !important;
                 min-width: fit-content !important;
                 max-width: 200px !important;
               }

               :global(.dropdown-item) {
                 white-space: nowrap !important;
               }
             `}</style>

             <Dropdown
               label={
                 <div className="flex items-center">
                   <FaFilter className="mr-2" />
                   <span>
                     {selectedRole || t("adminDashboard.filters.allRoles")}
                   </span>
                 </div>
               }
               color="dark"
               className="w-full border-2 rounded-lg"
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
           </div>

           <div className="relative w-full sm:flex-1">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
               <FaSearch className="text-gray-400" />
             </div>
             <input
               type="text"
               value={searchQuery}
               onChange={handleSearchChange}
               placeholder="Search..."
               className="w-full pl-10 p-2.5 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all"
             />
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" color="purple" />
          </div>
        ) : (
          <Card className="overflow-hidden bg-gray-800/50 border-gray-700 shadow-xl rounded-3xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/70"
                    >
                      {t("adminDashboard.userTable.username")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/70"
                    >
                      {t("adminDashboard.userTable.email")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/70"
                    >
                      {t("adminDashboard.userTable.role")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/70"
                    >
                      {t("adminDashboard.userTable.joined")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/70"
                    >
                      {t("adminDashboard.userTable.status")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/70"
                    >
                      {t("adminDashboard.userTable.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-800/40" : "bg-gray-900/50"
                        } hover:bg-gray-700/60 transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                          {user.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            color={user.role === "admin" ? "success" : "info"}
                            className="font-semibold"
                          >
                            {user.role || t("adminDashboard.filters.user")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isActive ? (
                            <Badge
                              color="success"
                              className="flex items-center gap-1"
                            >
                              <span className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1"></span>
                              {t("adminDashboard.status.active")}
                            </Badge>
                          ) : (
                            <Badge
                              color="failure"
                              className="flex items-center gap-1"
                            >
                              <span className="w-2 h-2 rounded-full bg-red-400 inline-block mr-1"></span>
                              {t("adminDashboard.status.suspended")}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 text-xs font-medium rounded-md bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 transition-colors"
                              onClick={() => handleViewProfile(user._id)}
                            >
                              {t(
                                "adminDashboard.actions.viewProfile",
                                "Profile"
                              )}
                            </button>
                            <button
                              className="px-2 py-1 text-xs font-medium rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors"
                              onClick={() => openEditModal(user)}
                            >
                              {t("adminDashboard.actions.edit")}
                            </button>
                            {user.isActive ? (
                              <button
                                className="px-2 py-1 text-xs font-medium rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
                                onClick={() =>
                                  openSuspendModal(user._id, user.userName)
                                }
                              >
                                {t("adminDashboard.actions.suspend")}
                              </button>
                            ) : (
                              <button
                                className="px-2 py-1 text-xs font-medium rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/40 transition-colors"
                                onClick={() =>
                                  openActivateModal(user._id, user.userName)
                                }
                              >
                                {t("adminDashboard.actions.activate")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center">
                          <FaSearch className="w-8 h-8 mb-2 opacity-30" />
                          <p>{t("adminDashboard.userTable.noUsers")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                  {t("adminDashboard.pagination.showing", {
                    start: indexOfFirstUser + 1,
                    end: Math.min(indexOfLastUser, filteredUsers.length),
                    total: filteredUsers.length,
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    color="gray"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={prevPage}
                    className="flex items-center justify-center"
                  >
                    <span>{t("adminDashboard.pagination.previous")}</span>
                  </Button>

                  <div className="hidden sm:flex space-x-1">
                    {Array.from({
                      length: Math.ceil(filteredUsers.length / usersPerPage),
                    }).map((_, index) => (
                      <Button
                        key={index}
                        color={currentPage === index + 1 ? "blue" : "gray"}
                        size="sm"
                        onClick={() => paginate(index + 1)}
                        className={
                          currentPage === index + 1 ? "bg-blue-600" : ""
                        }
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    color="gray"
                    size="sm"
                    disabled={
                      currentPage ===
                      Math.ceil(filteredUsers.length / usersPerPage)
                    }
                    onClick={nextPage}
                    className="flex items-center justify-center"
                  >
                    <span>{t("adminDashboard.pagination.next")}</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
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
              on: "flex bg-gray-900/80 backdrop-blur-sm",
              off: "hidden",
            },
          },
          content: {
            base: "relative bg-gray-800 shadow-xl rounded-lg w-full max-w-md transition-all duration-300 ease-in-out transform scale-100",
            inner:
              "relative rounded-lg bg-gray-800 shadow-xl flex flex-col max-h-[90vh]",
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
            ? t("adminDashboard.editModal.title", "Edit User")
            : modalAction === "suspend"
            ? t("adminDashboard.modals.suspend.title", "Suspend User")
            : t("adminDashboard.modals.activate.title", "Activate User")}
        </Modal.Header>
        <Modal.Body>
          {modalAction === "edit" ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-username"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  {t("adminDashboard.editModal.usernameLabel")}
                </label>
                <input
                  type="text"
                  id="edit-username"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editFormData.userName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      userName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  {t("adminDashboard.editModal.emailLabel")}
                </label>
                <input
                  type="email"
                  id="edit-email"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="edit-role"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  {t("adminDashboard.editModal.roleLabel")}
                </label>
                <select
                  id="edit-role"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <h3 className="mb-5 text-lg font-normal text-gray-300">
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
              <Button
                color="blue"
                onClick={handleEditUser}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {t("adminDashboard.editModal.save")}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
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
                className={
                  modalAction === "suspend"
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
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
