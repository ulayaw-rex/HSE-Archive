import React, { useState, useEffect } from "react";
import type { User, CreateUserData, UpdateUserData } from "../../../types/User";
import { toast } from "react-toastify";
import "../../../App.css";

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
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "hillsider",
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
      });
      setConfirmPassword("");
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    const isPasswordProvided = !!formData.password.trim();
    if (!isEditing && !isPasswordProvided) {
      newErrors.password = "Password is required";
    } else if (isPasswordProvided) {
      const password = formData.password;
      const rules = [
        {
          test: /.{8,}/,
          message: "Password must be at least 8 characters",
        },
        { test: /[A-Z]/, message: "Must include an uppercase letter" },
        { test: /[a-z]/, message: "Must include a lowercase letter" },
        { test: /[0-9]/, message: "Must include a number" },
        { test: /[^A-Za-z0-9]/, message: "Must include a special character" },
      ];

      for (const rule of rules) {
        if (!rule.test.test(password)) {
          newErrors.password = rule.message;
          break;
        }
      }
    }

    // Confirm password rules: required on create; required on edit only if password is being changed
    const shouldRequireConfirm = !isEditing || isPasswordProvided;
    if (shouldRequireConfirm && !confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm the password";
    } else if (shouldRequireConfirm && confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = isEditing
      ? { ...formData, password: formData.password || undefined }
      : formData;

    try {
      await onSubmit(submitData);
      toast.success(
        isEditing
          ? `Successfully updated user ${formData.name}`
          : `Successfully created user ${formData.name}`
      );
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update user" : "Failed to create user"
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-2">
        {isEditing ? "Edit User" : "Create New User"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
              errors.name
                ? "border-red-400 bg-red-50"
                : "border-gray-200 focus:border-blue-400"
            }`}
            placeholder="Enter user name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
              errors.email
                ? "border-red-400 bg-red-50"
                : "border-gray-200 focus:border-blue-400"
            }`}
            placeholder="Enter user email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Password{" "}
            {isEditing && (
              <span className="text-gray-500 font-normal">
                (leave blank to keep current)
              </span>
            )}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
              errors.password
                ? "border-red-400 bg-red-50"
                : "border-gray-200 focus:border-blue-400"
            }`}
            placeholder={
              isEditing ? "Enter new password (optional)" : "Enter password"
            }
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Confirm Password{" "}
            {(!isEditing || formData.password) && <span>*</span>}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }
            }}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
              errors.confirmPassword
                ? "border-red-400 bg-red-50"
                : "border-gray-200 focus:border-blue-400"
            }`}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 bg-white"
          >
            <option value="hillsider">Hillsider</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                <span>Saving...</span>
              </span>
            ) : isEditing ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
