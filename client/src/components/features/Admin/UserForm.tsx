import React, { useState, useEffect } from "react";
import type { User, CreateUserData, UpdateUserData } from "../../../types/User";
import { toast } from "react-toastify";
import "../../../App.css";

interface ExtendedFormData extends CreateUserData {
  course?: string;
  position?: string;
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ExtendedFormData>({
    name: "",
    email: "",
    password: "",
    role: "hillsider",
    course: "",
    position: "",
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        course: user.course || "",
        position: user.position || "",
      });
      setConfirmPassword("");
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    const isPasswordProvided = !!formData.password.trim();
    if (!isEditing && !isPasswordProvided) {
      newErrors.password = "Password is required";
    } else if (isPasswordProvided && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 chars";
    }

    const shouldRequireConfirm = !isEditing || isPasswordProvided;
    if (shouldRequireConfirm && confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = isEditing
      ? { ...formData, password: formData.password || undefined }
      : formData;

    try {
      await onSubmit(submitData);
      toast.success(isEditing ? "User updated" : "User created");
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const inputClass = (hasError: boolean) => `
    w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out outline-none border shadow-sm
    ${
      hasError
        ? "bg-red-50 border-red-300 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-200"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
    }
  `;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5 ml-0.5";

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 max-w-4xl mx-auto border border-gray-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {isEditing ? "Edit User Details" : "Create New User"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? "Update the user's information below."
              : "Fill in the details to register a new member."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass(!!errors.name)}
              placeholder="e.g. Juan Dela Cruz"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass(!!errors.email)}
              placeholder="e.g. juan@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Course */}
          <div>
            <label className={labelClass}>Course / Degree</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={inputClass(false)}
              placeholder="e.g. BS Information Technology"
            />
          </div>

          {/* Position */}
          <div>
            <label className={labelClass}>Position / Title</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={inputClass(false)}
              placeholder="e.g. Editorial Assistant"
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>
              Password{" "}
              {isEditing && (
                <span className="font-normal text-gray-400 ml-1">
                  (Optional)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass(!!errors.password)}
              placeholder="Enter Password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass(!!errors.confirmPassword)}
              placeholder="Re-enter Password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="md:col-span-2">
            <label className={labelClass}>System Role</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${inputClass(
                  false
                )} appearance-none cursor-pointer bg-no-repeat bg-right pr-10`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option value="hillsider">Hillsider</option>
                <option value="alumni">Alumni</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing...</span>
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
