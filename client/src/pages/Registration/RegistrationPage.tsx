import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { toast } from "react-toastify";
import logo from "../../assets/Login.png";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
          Registration Successful!
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your account has been created successfully. <br />
          Please wait for an <strong>Administrator</strong> to approve your
          account before you can log in.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#008543] hover:bg-[#006e36] text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-green-900/20 transform active:scale-95"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ error, ...props }) => (
  <div className="mb-4 text-left">
    <input
      {...props}
      className={`w-full text-sm rounded-lg block p-4 placeholder-gray-400 outline-none transition-all shadow-sm border-2 ${
        error
          ? "bg-red-50 border-red-500 text-red-900 focus:ring-red-200 placeholder-red-300"
          : "bg-gray-100 border-transparent text-gray-800 focus:ring-2 focus:ring-green-800"
      }`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600 font-medium ml-1">{error}</p>
    )}
  </div>
);

interface CustomDropdownProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
  error?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-4 text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-lg text-sm flex justify-between items-center cursor-pointer transition-colors border-2 ${
          error
            ? "bg-red-50 border-red-500 text-red-900"
            : isOpen
            ? "border-green-800 bg-white"
            : "bg-gray-100 border-transparent hover:bg-gray-200"
        }`}
      >
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span
          className={`text-xs text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium ml-1">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-100 shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto custom-scrollbar animate-fadeIn">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-green-50 text-sm cursor-pointer text-gray-700 hover:text-green-800 transition-colors border-b border-gray-50 last:border-0 font-medium"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "hillsider",
    course: "",
    position: "",
  });

  const courseOptions = [
    "BS in Information Technology",
    "BS in Nursing",
    "BS in Accountancy",
    "BA in Communication",
    "BS in Business Administration",
    "BS in Hospitality Management",
    "BS in Criminology",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDropdownChange = (field: string, val: string) => {
    setFormData({ ...formData, [field]: val });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email address is required.";
    if (!formData.name) newErrors.name = "Full Name is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.password_confirmation)
      newErrors.password_confirmation = "Please confirm your password.";

    if (formData.password && formData.password_confirmation) {
      if (formData.password !== formData.password_confirmation) {
        newErrors.password = "Passwords do not match.";
        newErrors.password_confirmation = "Passwords do not match.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.course) newErrors.course = "Please select a course.";
    if (!formData.position) newErrors.position = "Please select a position.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await AxiosInstance.post("/register", formData);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error);

      if (error.response && error.response.status === 422) {
        const serverErrors = error.response.data.errors;
        const formErrors: Record<string, string> = {};

        let hasStep1Error = false;

        if (serverErrors.email) {
          formErrors.email = serverErrors.email[0];
          hasStep1Error = true;
        }
        if (serverErrors.name) {
          formErrors.name = serverErrors.name[0];
          hasStep1Error = true;
        }
        if (serverErrors.password) {
          formErrors.password = serverErrors.password[0];
          hasStep1Error = true;
        }

        setErrors(formErrors);

        if (hasStep1Error) {
          setStep(1);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#005e2b] p-4 font-sans">
      <SuccessModal isOpen={showSuccessModal} onClose={() => navigate("/")} />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-12 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
          <div className="text-left border-l-2 border-green-800 pl-3">
            <h1 className="text-xl font-bold text-green-900 tracking-wide leading-none">
              HSE-ARCHIVE
            </h1>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mb-8 text-[10px] font-bold tracking-widest uppercase">
          <div
            className={`flex flex-col items-center gap-1 transition-colors ${
              step === 1 ? "text-black" : "text-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                step === 1
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-300"
              }`}
            >
              1
            </div>
            <span>Sign Up</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div
            className={`flex flex-col items-center gap-1 transition-colors ${
              step === 2 ? "text-black" : "text-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                step === 2
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-300"
              }`}
            >
              2
            </div>
            <span>Profile Set Up</span>
          </div>
        </div>

        <form
          onSubmit={step === 1 ? handleNext : handleSubmit}
          className="text-left"
        >
          {step === 1 && (
            <div className="animate-fadeIn">
              <InputField
                name="email"
                type="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <InputField
                name="name"
                type="text"
                placeholder="Username / Full Name*"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              <InputField
                name="password"
                type="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <p className="text-[10px] text-gray-400 mb-4 px-1 leading-tight">
                Must contain 8 characters with symbol, number, uppercase, and
                lowercase letters.
              </p>
              <InputField
                name="password_confirmation"
                type="password"
                placeholder="Enter password again*"
                value={formData.password_confirmation}
                onChange={handleChange}
                error={errors.password_confirmation}
              />

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-[#008543] hover:bg-[#006e36] text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transform active:scale-95"
                >
                  Next <span className="text-lg">➤</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-6 flex justify-center bg-gray-100 p-1 rounded-full">
                {["hillsider", "alumni"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`flex-1 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                      formData.role === role
                        ? "bg-white text-green-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <CustomDropdown
                placeholder="Select Course / Degree"
                value={formData.course}
                options={courseOptions}
                onChange={(val) => handleDropdownChange("course", val)}
                error={errors.course}
              />

              <CustomDropdown
                placeholder="Select Position / Title"
                value={formData.position}
                options={positionOptions}
                onChange={(val) => handleDropdownChange("position", val)}
                error={errors.position}
              />

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-4 rounded-full transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#008543] hover:bg-[#006e36] text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {loading ? "Creating..." : "Finish Sign Up"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-400 text-sm hover:text-green-800 transition-colors font-medium"
            >
              Already have an account?{" "}
              <span className="underline decoration-green-800/30">Log In</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
