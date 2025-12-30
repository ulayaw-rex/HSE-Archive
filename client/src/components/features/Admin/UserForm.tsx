import React, { useState, useEffect, useRef } from "react";
import type { User, CreateUserData, UpdateUserData } from "../../../types/User";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../../App.css";

interface CustomDropdownProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  error?: string;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
        {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-lg text-sm border shadow-sm cursor-pointer flex justify-between items-center bg-white transition-all ${
          error
            ? "border-red-300 text-red-900 bg-red-50"
            : "border-gray-300 text-gray-900 hover:border-gray-400"
        } ${isOpen ? "ring-2 ring-green-500/10 border-green-500" : ""}`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
          <ul className="max-h-48 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => {
                  onChange(name, option);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors ${
                  value === option
                    ? "bg-green-50 text-green-800 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

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
  const courseOptions = [
    "BS in Information Technology",
    "BS in Nursing",
    "BS in Accountancy",
    "BS in Business Administration",
    "BS in Hospitality Management",
    "BS in Criminology",
    "BA in Communication",
    "BA in Psychology",
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education",
  ];

  const positionOptions = [
    "Editor-in-Chief",
    "Associate Editor for Print",
    "Associate Editor for Online",
    "Managing Editor for Finance and Property",
    "Managing Editor for Communications",
    "Online Editor",
    "Newspaper Editor",
    "Magazine Editor",
    "Literary Editor",
    "Art Director",
    "Photojournalist",
    "Sport Editor",
    "Editorial Assistant",
    "Contributor",
  ];

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (formData.role !== "admin") {
      if (!formData.course) newErrors.course = "Course is required";
      if (!formData.position) newErrors.position = "Position is required";
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

  const handleDropdownChange = (name: string, value: string) => {
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

          <CustomDropdown
            label="Course / Degree"
            name="course"
            value={formData.course || ""}
            options={courseOptions}
            onChange={handleDropdownChange}
            error={errors.course}
            placeholder="Select Course"
          />

          <CustomDropdown
            label="Position / Title"
            name="position"
            value={formData.position || ""}
            options={positionOptions}
            onChange={handleDropdownChange}
            error={errors.position}
            placeholder="Select Position"
          />

          <div>
            <label className={labelClass}>
              Password{" "}
              {isEditing && (
                <span className="font-normal text-gray-400 ml-1">
                  (Optional)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass(!!errors.password)} pr-10`}
                placeholder="Enter Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass(!!errors.confirmPassword)} pr-10`}
                placeholder="Re-enter Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <CustomDropdown
              label="System Role"
              name="role"
              value={formData.role}
              options={["hillsider", "alumni", "admin"]}
              onChange={handleDropdownChange}
              error={errors.role}
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            {loading
              ? "Processing..."
              : isEditing
              ? "Save Changes"
              : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
