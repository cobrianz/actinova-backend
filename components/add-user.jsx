import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, User } from "lucide-react";
import { toast } from "sonner";

export default function AddUser({ onSave, onCancel, userToEdit }) {
  const [formData, setFormData] = useState({
    name: userToEdit ? `${userToEdit.firstName} ${userToEdit.lastName}`.trim() : "",
    email: userToEdit?.email || "",
    phone: userToEdit?.phone || "",
    role: userToEdit?.role || "student",
    type: userToEdit?.type || "student",
    plan: userToEdit?.plan || "free",
    password: "",
    confirmPassword: "",
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneWithCountryCode = (phone) => {
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(phone);
  };

  const validatePasswordStrength = (password) => {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).{8,}/.test(password);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: `${userToEdit.firstName || ""} ${userToEdit.lastName || ""}`.trim(),
        email: userToEdit.email || "",
        phone: userToEdit.phone || "",
        role: userToEdit.role || "student",
        type: userToEdit.type || "student",
        plan: userToEdit.plan || "free",
        password: "",
        confirmPassword: "",
        avatar: null,
      });
    }
  }, [userToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email address";
    if (formData.type === "staff" && !formData.phone.trim()) newErrors.phone = "Phone is required for staff";
    else if (formData.type === "staff" && !validatePhoneWithCountryCode(formData.phone))
      newErrors.phone = "Use international format (e.g., +1234567890)";
    if (!userToEdit && !formData.password) newErrors.password = "Password is required";
    else if (formData.password && !validatePasswordStrength(formData.password))
      newErrors.password = "Password must be 8+ chars, include uppercase, lowercase, number & symbol";
    if (!userToEdit && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!["student", "staff"].includes(formData.type)) newErrors.type = "Invalid user type";
    if (formData.type === "student" && !["free", "pro", "enterprise"].includes(formData.plan))
      newErrors.plan = "Plan must be free, pro, or enterprise for students";
    if (formData.type === "staff" && formData.plan !== "N/A") newErrors.plan = "Plan must be N/A for staff";
    if (!["student", "writer", "moderator", "instructor", "analyst", "support", "admin"].includes(formData.role))
      newErrors.role = "Invalid role";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const [firstName, ...lastNameParts] = formData.name.split(" ");
      const lastName = lastNameParts.join(" ");
      const payload = {
        _id: userToEdit?.id,
        name: formData.name,
        firstName: firstName || formData.name,
        lastName: lastName || "",
        email: formData.email,
        phone: formData.type === "staff" ? formData.phone : undefined,
        role: formData.role,
        type: formData.type,
        status: formData.type === "student" ? "active" : (userToEdit?.status || "pending"),
        joinDate: userToEdit?.joinDate || new Date().toISOString(),
        lastActive: userToEdit?.lastActive || new Date().toISOString(),
        approved: formData.type === "student" ? true : (userToEdit?.approved || false),
        plan: formData.plan,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const endpoint = formData.type === "student" || userToEdit ? "/api/users" : "/api/pending-requests";
      const res = await fetch(endpoint, {
        method: userToEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      const data = await res.json();
      if (formData.type === "student" || userToEdit) {
        onSave();
        toast.success(userToEdit ? "User updated successfully" : "Student created successfully");
      } else {
        onSave();
        toast.success("Staff request submitted for approval");
      }
    } catch (err) {
      setErrors({ form: err.message });
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && value === "staff" ? { plan: "N/A", role: "writer" } : {}),
      ...(name === "type" && value === "student" ? { plan: "free", role: "student" } : {}),
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {userToEdit ? "Edit User" : "Add New User"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter phone (e.g., +1234567890)"
              disabled={formData.type === "student"}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!userToEdit}
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formData.type === "student" ? (
                <option value="student">Student</option>
              ) : (
                <>
                  <option value="writer">Content Writer</option>
                  <option value="moderator">Community Moderator</option>
                  <option value="instructor">Course Instructor</option>
                  <option value="analyst">Data Analyst</option>
                  <option value="support">Support Agent</option>
                  <option value="admin">Admin</option>
                </>
              )}
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan</label>
            <select
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={formData.type === "staff"}
            >
              {formData.type === "student" ? (
                <>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </>
              ) : (
                <option value="N/A">N/A</option>
              )}
            </select>
            {errors.plan && <p className="text-red-500 text-sm mt-1">{errors.plan}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {userToEdit ? "New Password (Optional)" : "Password *"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : userToEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}