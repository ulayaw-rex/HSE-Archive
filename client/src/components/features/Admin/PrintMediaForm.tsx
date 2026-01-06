import React, { useState, useEffect } from "react";
import ConfirmationModal from "../../common/ConfirmationModal";
import type {
  PrintMedia,
  CreatePrintMediaData,
  PrintMediaFormData,
} from "../../../types/PrintMedia";

interface PrintMediaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrintMediaFormData) => Promise<void>;
  printMedia?: PrintMedia | null;
  mode?: "add" | "edit";
}

const PrintMediaForm: React.FC<PrintMediaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  printMedia,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<
    CreatePrintMediaData & { date_published: string }
  >({
    title: "",
    type: "folio",
    description: "",
    byline: "",
    date_published: new Date().toISOString().split("T")[0],
    file: null,
    thumbnail: null,
  });

  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const [initialData, setInitialData] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setErrors({});

      let startData: CreatePrintMediaData & { date_published: string };

      if (printMedia && mode === "edit") {
        const existingDate = printMedia.date_published
          ? new Date(printMedia.date_published).toISOString().split("T")[0]
          : "";

        startData = {
          title: printMedia.title,
          type: printMedia.type,
          description: printMedia.description,
          byline: printMedia.byline || "",
          date_published: existingDate,
          file: null,
          thumbnail: null,
        };
      } else {
        startData = {
          title: "",
          type: "folio",
          description: "",
          byline: "",
          date_published: new Date().toISOString().split("T")[0],
          file: null,
          thumbnail: null,
        };
      }

      setFormData(startData);
      setFile(null);
      setThumbnail(null);

      setInitialData(JSON.stringify(startData));
    }
  }, [printMedia, mode, isOpen]);

  const hasUnsavedChanges = () => {
    if (file !== null || thumbnail !== null) return true;

    const currentDataString = JSON.stringify(formData);
    return currentDataString !== initialData;
  };

  const handleCloseAttempt = () => {
    if (loading) return;

    if (hasUnsavedChanges()) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.date_published)
      newErrors.date_published = "Date is required.";
    if (!formData.byline.trim()) newErrors.byline = "Byline is required.";

    if (mode === "add" && !file) {
      newErrors.file = "Please upload a PDF file.";
    }
    if (mode === "add" && !thumbnail) {
      newErrors.thumbnail = "Please upload a cover image.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("byline", formData.byline);
      formDataToSend.append("date_published", formData.date_published);

      if (file) formDataToSend.append("file", file);
      if (thumbnail) formDataToSend.append("thumbnail", thumbnail);

      if (mode === "edit") {
        formDataToSend.append("_method", "PUT");
      }

      await onSubmit(formDataToSend);
      setInitialData(JSON.stringify(formData));
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="user-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseAttempt();
          }
        }}
      >
        <div className="user-modal-container relative bg-white rounded-lg shadow-xl w-full md:w-auto md:min-w-[700px] lg:min-w-[900px] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">
                Uploading files...
              </p>
              <p className="text-sm text-gray-500">
                Please do not close this window.
              </p>
            </div>
          )}

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={handleCloseAttempt}
              disabled={loading}
              className={`absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none z-10 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl md:text-3xl font-extrabold mb-8 border-b border-gray-400 pb-2 text-gray-900">
              {mode === "edit"
                ? "Edit Print Media Archive"
                : "Add Print Media Archive"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label
                    className="block text-green-700 font-semibold mb-2"
                    htmlFor="byline"
                  >
                    Byline <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="byline"
                    type="text"
                    disabled={loading}
                    placeholder="Writer"
                    value={formData.byline}
                    onChange={(e) => {
                      setFormData({ ...formData, byline: e.target.value });
                      clearError("byline");
                    }}
                    className={`w-full h-[50px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 
                    ${errors.byline ? "border-red-500" : "border-gray-700"}
                    ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.byline && (
                    <p className="text-red-500 text-xs mt-1">{errors.byline}</p>
                  )}
                </div>

                <div className="col-span-1">
                  <label
                    className="block text-green-700 font-semibold mb-2"
                    htmlFor="type"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    disabled={loading}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className={`w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white
                    ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="folio">Folio</option>
                    <option value="magazine">Magazine</option>
                    <option value="tabloid">Tabloid</option>
                    <option value="other">Others</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label
                    className="block text-green-700 font-semibold mb-2"
                    htmlFor="date_published"
                  >
                    Date Published <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date_published"
                    type="date"
                    disabled={loading}
                    value={formData.date_published}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        date_published: e.target.value,
                      });
                      clearError("date_published");
                    }}
                    className={`w-full h-[50px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 
                    ${
                      errors.date_published
                        ? "border-red-500"
                        : "border-gray-700"
                    }
                    ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.date_published && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date_published}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="block text-green-700 font-semibold mb-2"
                  htmlFor="title"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  disabled={loading}
                  placeholder="Add a title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    clearError("title");
                  }}
                  className={`w-full h-[50px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 
                  ${errors.title ? "border-red-500" : "border-gray-700"}
                  ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  className="block text-green-700 font-semibold mb-2"
                  htmlFor="description"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  disabled={loading}
                  placeholder="Add description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    clearError("description");
                  }}
                  className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 h-56 resize-none 
                  ${errors.description ? "border-red-500" : "border-gray-700"}
                  ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 gap-4">
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
                  <div className="flex flex-col">
                    <label
                      htmlFor="upload-file"
                      className={`cursor-pointer bg-gray-800 text-white px-4 py-3 rounded-md flex items-center justify-center space-x-2 transition-colors w-full md:w-auto 
                    ${errors.file ? "ring-2 ring-red-500" : ""}
                    ${
                      loading
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : "hover:bg-gray-900"
                    }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="truncate max-w-[150px]">
                        {file ? file.name : "Upload PDF"}
                      </span>
                      <input
                        id="upload-file"
                        type="file"
                        disabled={loading}
                        accept=".pdf"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          clearError("file");
                        }}
                        className="hidden"
                      />
                    </label>
                    {errors.file && (
                      <p className="text-red-500 text-xs mt-1 text-center md:text-left">
                        {errors.file}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="upload-thumbnail"
                      className={`cursor-pointer bg-gray-800 text-white px-4 py-3 rounded-md flex items-center justify-center space-x-2 transition-colors w-full md:w-auto 
                    ${errors.thumbnail ? "ring-2 ring-red-500" : ""}
                    ${
                      loading
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : "hover:bg-gray-900"
                    }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="truncate max-w-[150px]">
                        {thumbnail ? thumbnail.name : "Upload Cover"}
                      </span>
                      <input
                        id="upload-thumbnail"
                        type="file"
                        disabled={loading}
                        accept="image/*"
                        onChange={(e) => {
                          setThumbnail(e.target.files?.[0] || null);
                          clearError("thumbnail");
                        }}
                        className="hidden"
                      />
                    </label>
                    {errors.thumbnail && (
                      <p className="text-red-500 text-xs mt-1 text-center md:text-left">
                        {errors.thumbnail}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`!bg-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-md w-full md:w-auto flex items-center justify-center space-x-2
                  ${loading ? "opacity-70 cursor-wait" : "hover:bg-green-800"}`}
                >
                  {loading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>
                    {loading
                      ? "Uploading..."
                      : mode === "edit"
                      ? "Update Archive"
                      : "Post Archive +"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative z-[9999]">
        <ConfirmationModal
          isOpen={showCloseConfirm}
          onClose={() => setShowCloseConfirm(false)}
          onConfirm={handleConfirmClose}
          title="Discard Changes?"
          message="You have unsaved content. Are you sure you want to close this form and discard your changes?"
          confirmLabel="Discard & Close"
          cancelLabel="Keep Editing"
          isDangerous={true}
        />
      </div>
    </>
  );
};

export default PrintMediaForm;
