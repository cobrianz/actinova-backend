import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Mail,
  Plus,
  AlertTriangle,
  Check,
  X,
  User,
  Calendar,
  MessageSquare,
  Trash2,
  Download,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import UserProfileModal from "./modals/user-profile-modal";
import AddUser from "./add-user";

export default function Users({ session }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterJoinDate, setFilterJoinDate] = useState("");
  const [exportType, setExportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    if (session?.role === "admin") {
      fetchUsers();
      fetchPendingRequests();
    }
  }, [session]);

  useEffect(() => {
    const filtered = users.filter((user) => {
      if (user.type === "staff" && !user.approved) return false;
      if (user.email === session?.email) return false;
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus =
        filterStatus === "all" ||
        user.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesPlan =
        filterPlan === "all" ||
        user.plan?.toLowerCase() === filterPlan.toLowerCase() ||
        (filterPlan === "N/A" && user.type === "staff");
      const matchesJoinDate =
        !filterJoinDate ||
        new Date(user.joinDate).toISOString().startsWith(filterJoinDate);
      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesPlan &&
        matchesJoinDate
      );
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [
    users,
    searchTerm,
    filterRole,
    filterStatus,
    filterPlan,
    filterJoinDate,
    session,
  ]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }
      setUsers(data.users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const res = await fetch("/api/pending-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch pending requests");
      }
      setPendingRequests(data.requests);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApprove = async (requestId) => {
    console.log("Approving request with ID:", requestId); // Debug log
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const res = await fetch(`/api/pending-requests/${requestId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to approve request");
      }
      setUsers((prev) => [data.user, ...prev]);
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Request approved successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (requestId) => {
    console.log("Rejecting request with ID:", requestId); // Debug log
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const res = await fetch(`/api/pending-requests/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reject request");
      }
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Request rejected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSuspendOrActivate = async (userId, action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const endpoint =
        action === "suspend"
          ? `/api/users/${userId}/suspend`
          : `/api/users/${userId}/activate`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} user`);
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, status: action === "suspend" ? "suspended" : "active" }
            : user
        )
      );
      toast.success(
        `User ${action === "suspend" ? "suspended" : "activated"} successfully`
      );
    } catch (err) {
      toast.error(err.message);
    }
    setShowConfirmModal(null);
  };

  const handlePromote = async (userId) => {
    if (!newRole) {
      toast.error("Please select a role");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/promote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to promote user");
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success(`User promoted to ${getRoleLabel(newRole)}`);
    } catch (err) {
      toast.error(err.message);
    }
    setShowPromoteModal(null);
    setShowConfirmModal(null);
  };

  const handleDelete = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message);
    }
    setShowConfirmModal(null);
  };

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please sign in.");
      return;
    }

    try {
      const exportedBy = {
        name: session?.name || "Unknown",
        email: session?.email || "unknown@example.com",
      };
      const filter = exportType === "all" ? {} : { type: exportType };
      if (exportFormat === "csv") {
        const res = await fetch("/api/users/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ format: "csv", filter }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to export users as CSV");
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_${exportType}_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Users exported as CSV successfully");
      } else if (exportFormat === "pdf") {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getWidth();
        const margin = 10;
        const footerHeight = 20;

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(" ACTINOVA AI TUTOR", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(14);
        doc.text(" Actinova  ai tutor - User Report", pageWidth / 2, 30, {
          align: "center",
        });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Exported on: ${new Date().toLocaleString()}`,
          pageWidth / 2,
          40,
          { align: "center" }
        );

        autoTable(doc, {
          startY: 50,
          head: [["Name", "Email", "Role", "Plan", "Last Login", "Status"]],
          body: users
            .filter(
              (user) =>
                Object.keys(filter).length === 0 || user.type === filter.type
            )
            .map((user) => [
              user.name,
              user.email,
              getRoleLabel(user.role),
              user.plan || "N/A",
              new Date(user.lastActive).toLocaleString(),
              user.status,
            ]),
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
          margin: { top: 50, bottom: footerHeight + 10 },
          didDrawPage: (data) => {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
              `Exported by: ${exportedBy.name} (${exportedBy.email})`,
              margin,
              pageHeight - 10
            );
            doc.text(
              `Page ${data.pageNumber}`,
              pageWidth - margin,
              pageHeight - 10,
              { align: "right" }
            );
          },
        });

        doc.save(
          `users_${exportType}_${new Date().toISOString().split("T")[0]}.pdf`
        );
        toast.success("Users exported as PDF successfully");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusColor = (status) => {
    return status.toLowerCase() === "active"
      ? "text-green-600 bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-red-600 bg-red-100";
      case "writer":
        return "text-purple-600 bg-purple-100";
      case "instructor":
        return "text-blue-600 bg-blue-100";
      case "moderator":
        return "text-indigo-600 bg-indigo-100";
      case "analyst":
        return "text-yellow-600 bg-yellow-100";
      case "support":
        return "text-teal-600 bg-teal-100";
      case "student":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "writer":
        return "Content Writer";
      case "instructor":
        return "Course Instructor";
      case "moderator":
        return "Community Moderator";
      case "analyst":
        return "Data Analyst";
      case "support":
        return "Support Agent";
      case "admin":
        return "Admin";
      case "student":
        return "Student";
      default:
        return role;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case "content_writer":
        return "Content Writer";
      case "course_instructor":
        return "Course Instructor";
      case "community_moderator":
        return "Community Moderator";
      case "data_analyst":
        return "Data Analyst";
      case "support_agent":
        return "Support Agent";
      case "admin":
        return "Admin";
      default:
        return type;
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all users, internal staff, and approvals
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {pendingRequests.length > 0 && (
            <button
              onClick={() => setShowApprovals(!showApprovals)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors relative"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Approvals
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="staff">Staff</option>
          </select>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {showApprovals && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">Pending Approvals</h3>
                  <p className="text-orange-100 text-sm">
                    {pendingRequests.length} requests awaiting review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovals(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Pending Requests
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  All requests have been processed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.id} // Changed from request._id to request.id
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {request.name}
                            </h4>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                request.type
                              )}`}
                            >
                              {getRequestTypeLabel(request.type)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{request.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Requested on{" "}
                                  {new Date(
                                    request.requestDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {request.message && (
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    Message:
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {request.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {request.experience && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                Experience:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {request.experience}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleApprove(request.id)} // Changed from request._id to request.id
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)} // Changed from request._id to request.id
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {showAddUser && (
        <AddUser
          onSave={() => {
            setShowAddUser(false);
            fetchUsers();
            fetchPendingRequests();
          }}
          onCancel={() => setShowAddUser(false)}
        />
      )}
      {showEditUser && (
        <AddUser
          userToEdit={showEditUser}
          onSave={() => {
            setShowEditUser(null);
            fetchUsers();
            fetchPendingRequests();
          }}
          onCancel={() => setShowEditUser(null)}
        />
      )}
      {showPromoteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Promote {showPromoteModal.name}
            </h2>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              <option value="writer">Content Writer</option>
              <option value="moderator">Community Moderator</option>
              <option value="instructor">Course Instructor</option>
              <option value="analyst">Data Analyst</option>
              <option value="support">Support Agent</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPromoteModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  setShowConfirmModal({
                    type: "promote",
                    userId: showPromoteModal.id,
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newRole}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {showConfirmModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Confirm{" "}
              {showConfirmModal.type === "suspend"
                ? "Suspension"
                : showConfirmModal.type === "activate"
                ? "Activation"
                : showConfirmModal.type === "delete"
                ? "Deletion"
                : "Promotion"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to {showConfirmModal.type} this user?
              {showConfirmModal.type === "promote" &&
                ` Role will be changed to ${getRoleLabel(newRole)}.`}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  showConfirmModal.type === "promote"
                    ? handlePromote(showConfirmModal.userId)
                    : showConfirmModal.type === "delete"
                    ? handleDelete(showConfirmModal.userId)
                    : handleSuspendOrActivate(
                        showConfirmModal.userId,
                        showConfirmModal.type
                      )
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!showAddUser && !showEditUser && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="writer">Content Writer</option>
              <option value="moderator">Community Moderator</option>
              <option value="instructor">Course Instructor</option>
              <option value="analyst">Data Analyst</option>
              <option value="support">Support Agent</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
              <option value="N/A">N/A (Staff)</option>
            </select>
            <input
              type="date"
              value={filterJoinDate}
              onChange={(e) => setFilterJoinDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {!showAddUser && !showEditUser && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {user.plan || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(user.lastActive).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowProfileModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.status.toLowerCase() === "active" ? (
                              <button
                                onClick={() =>
                                  setShowConfirmModal({
                                    type: "suspend",
                                    userId: user.id,
                                  })
                                }
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setShowConfirmModal({
                                    type: "activate",
                                    userId: user.id,
                                  })
                                }
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            {user.type === "staff" &&
                              user.role !== "admin" &&
                              user.approved && (
                                <button
                                  onClick={() => setShowPromoteModal(user)}
                                  className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                              )}
                            <button
                              onClick={() =>
                                setShowConfirmModal({
                                  type: "delete",
                                  userId: user.id,
                                })
                              }
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(currentPage * rowsPerPage, filteredUsers.length)}{" "}
                    of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {filteredUsers.length === 0 &&
        !showAddUser &&
        !showEditUser &&
        !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No users found matching your criteria.
            </p>
          </div>
        )}
      <UserProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
