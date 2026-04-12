import React, { useState, useEffect } from "react";
import WriterSelect from "./WriterSelect";
import ConfirmationModal from "../../common/ConfirmationModal";
import DatePicker from "../../common/DatePicker";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import type {
  Publication,
  CreatePublicationData,
} from "../../../types/Publication";

interface ExtendedCreatePublicationData extends CreatePublicationData {
  writer_ids: number[];
  date_published: string;
}

interface PublicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  publicationToEdit?: Publication | null;
}

const getLocalDateString = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

const PublicationForm: React.FC<PublicationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  publicationToEdit,
}) => {
  const { user: currentUser } = useAuth();
  const mode = publicationToEdit ? "edit" : "add";
  const isAdmin = currentUser?.role === "admin";

  const [formData, setFormData] = useState<ExtendedCreatePublicationData>({
    title: "",
    byline: "",
    body: "",
    category: "university",
    photo_credits: "",
    writer_ids: [],
    date_published: getLocalDateString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [initialData, setInitialData] = useState<string>("");
  const [creditType, setCreditType] = useState<string>("Photo");
  const [creditName, setCreditName] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    let startData: ExtendedCreatePublicationData;

    if (publicationToEdit) {
      const targetDate =
        publicationToEdit.date_published || publicationToEdit.created_at;

      const rawCredits = publicationToEdit.photo_credits || "";
      let initType = "Photo";
      let initName = rawCredits;
      if (rawCredits.startsWith("Photo ")) {
        initType = "Photo";
        initName = rawCredits.substring(6);
      } else if (rawCredits.startsWith("Art ")) {
        initType = "Art";
        initName = rawCredits.substring(4);
      } else if (rawCredits.startsWith("Cartoon ")) {
        initType = "Cartoon";
        initName = rawCredits.substring(8);
      }

      setCreditType(initType);
      setCreditName(initName);

      const formattedCredits = initName ? `${initType} ${initName}` : "";

      startData = {
        title: publicationToEdit.title,
        byline: publicationToEdit.byline || "",
        body: publicationToEdit.body,
        category: publicationToEdit.category,
        photo_credits: formattedCredits,
        writer_ids: publicationToEdit.writers?.length
          ? publicationToEdit.writers.map((w: any) => w.id)
          : currentUser
            ? [currentUser.id]
            : [],
        date_published: getLocalDateString(targetDate),
      };
      setExistingImageUrl(publicationToEdit.image || null);
    } else {
      setCreditType("Photo");
      setCreditName("");

      startData = {
        title: "",
        byline: isAdmin ? "" : currentUser?.name || "",
        body: "",
        category: "university",
        photo_credits: "",
        writer_ids: isAdmin ? [] : currentUser ? [currentUser.id] : [],
        date_published: getLocalDateString(),
      };
      setExistingImageUrl(null);
    }

    setFormData(startData);
    setImage(null);
    setInitialData(JSON.stringify(startData));
  }, [publicationToEdit, currentUser, isOpen, isAdmin]);

  const hasUnsavedChanges = () => {
    if (image !== null) return true;
    return JSON.stringify(formData) !== initialData;
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
    if (formData.writer_ids.length === 0)
      newErrors.writer_ids = "Please select at least one writer.";
    if (!formData.title.trim()) newErrors.title = "Headline is required.";
    if (!formData.body.trim()) newErrors.body = "Article content is required.";
    if (!formData.date_published)
      newErrors.date_published = "Date is required.";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const submissionData = new FormData();
      submissionData.append("title", formData.title);
      submissionData.append("body", formData.body);
      submissionData.append("category", formData.category);
      submissionData.append("date_published", formData.date_published);

      if (formData.byline) submissionData.append("byline", formData.byline);
      if (formData.photo_credits)
        submissionData.append("photo_credits", formData.photo_credits);

      formData.writer_ids.forEach((id) =>
        submissionData.append("writer_ids[]", String(id)),
      );

      if (image) submissionData.append("image", image);

      if (mode === "edit" && publicationToEdit) {
        submissionData.append("_method", "PUT");
        await AxiosInstance.post(
          `/publications/${publicationToEdit.publication_id}`,
          submissionData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      } else {
        await AxiosInstance.post("/publications", submissionData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setInitialData(JSON.stringify(formData));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting publication:", error);
      if (isAdmin) {
        toast.error("Failed to save publication. Please check your inputs.");
      } else {
        setGeneralError(
          "Failed to save article. Please check your inputs and connection.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="user-modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-colors"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseAttempt();
        }}
      >
        <div className="user-modal-container relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full md:w-auto md:min-w-[800px] lg:min-w-[1000px] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-transparent dark:border-white/5">
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center transition-colors">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Publishing article...
              </p>
            </div>
          )}

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={handleCloseAttempt}
              disabled={loading}
              className={`absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none z-10 ${
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

            <h2 className="text-3xl font-extrabold mb-8 border-b border-gray-300 dark:border-white/10 pb-4 text-gray-900 dark:text-gray-100">
              {mode === "edit" ? "Edit Article" : "Write New Article"}
            </h2>

            {generalError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400 animate-fadeIn">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-green-700 dark:text-green-500 font-semibold mb-3 text-lg">
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
                      WRITER(S)
                    </label>

                    {isAdmin ? (
                      <div
                        className={`${errors.writer_ids ? "border border-red-500 rounded-md" : ""}`}
                      >
                        <WriterSelect
                          selectedIds={formData.writer_ids}
                          onSelectionChange={(newIds) => {
                            setFormData({ ...formData, writer_ids: newIds });
                            clearError("writer_ids");
                          }}
                          initialUsers={publicationToEdit?.writers}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={currentUser?.name || "Unknown"}
                        className="w-full h-[50px] p-3 rounded-md border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                      />
                    )}

                    {errors.writer_ids && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.writer_ids}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
                      CATEGORY
                    </label>
                    <select
                      value={formData.category}
                      disabled={loading}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full h-[50px] p-3 rounded-md border border-gray-700 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100"
                    >
                      <option value="university">University</option>
                      <option value="local">Local</option>
                      <option value="national">National</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="sci-tech">Sci-Tech</option>
                      <option value="sports">Sports</option>
                      <option value="opinion">Opinion</option>
                      <option value="literary">Literary</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 tracking-wider uppercase">
                      DATE <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={formData.date_published}
                      onChange={(date) => {
                        setFormData({
                          ...formData,
                          date_published: date,
                        });
                        clearError("date_published");
                      }}
                      placeholder="Select publication date"
                      disabled={loading}
                      error={!!errors.date_published}
                    />
                    {errors.date_published && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.date_published}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
                      MEDIA CREDITS
                    </label>
                    <div className="flex bg-white dark:bg-gray-950 rounded-md border border-gray-700 dark:border-white/10 focus-within:ring-2 focus-within:ring-green-600 focus-within:border-transparent h-[50px] overflow-hidden">
                      <select
                        disabled={loading}
                        value={creditType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setCreditType(newType);
                          setFormData({
                            ...formData,
                            photo_credits: creditName
                              ? `${newType} ${creditName}`
                              : "",
                          });
                        }}
                        className="bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 px-3 py-2 outline-none cursor-pointer focus:bg-gray-200 dark:focus:bg-gray-700 transition-colors"
                      >
                        <option value="Photo">Photo</option>
                        <option value="Art">Art</option>
                        <option value="Cartoon">Cartoon</option>
                      </select>
                      <input
                        type="text"
                        disabled={loading}
                        placeholder="Name"
                        value={creditName}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setCreditName(newName);
                          setFormData({
                            ...formData,
                            photo_credits: newName
                              ? `${creditType} ${newName}`
                              : "",
                          });
                        }}
                        className="w-full px-3 py-2 outline-none bg-transparent text-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
                    BYLINE DISPLAY (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="Custom Byline (e.g. John & Jane)"
                    value={formData.byline}
                    onChange={(e) =>
                      setFormData({ ...formData, byline: e.target.value })
                    }
                    className="w-full h-[50px] p-3 rounded-md border border-gray-700 dark:border-white/10 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-green-700 dark:text-green-500 font-semibold mb-3 text-lg">
                  Article Content
                </h3>

                <input
                  type="text"
                  disabled={loading}
                  placeholder="Add a headline"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    clearError("title");
                  }}
                  className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 mb-1 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 text-lg font-medium transition-all ${errors.title ? "border-red-500" : "border-gray-700 dark:border-white/10"}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mb-3">{errors.title}</p>
                )}

                <textarea
                  disabled={loading}
                  placeholder="Add body text..."
                  value={formData.body}
                  onChange={(e) => {
                    setFormData({ ...formData, body: e.target.value });
                    clearError("body");
                  }}
                  className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 h-64 resize-none leading-relaxed bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 placeholder-gray-400 transition-all ${errors.body ? "border-red-500" : "border-gray-700 dark:border-white/10"}`}
                />
                {errors.body && (
                  <p className="text-red-500 text-xs mt-1">{errors.body}</p>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 pt-6 border-t border-gray-200 dark:border-white/10">
                <label
                  className={`cursor-pointer bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto transition-all ${loading ? "opacity-50" : "hover:bg-gray-900 dark:hover:bg-gray-600 active:scale-95"}`}
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
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0l-4 4m4-4v12"
                    />
                  </svg>
                  <span>{image ? image.name : "Upload photo"}</span>
                  <input
                    type="file"
                    disabled={loading}
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-green-700 dark:bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-md w-full md:w-auto flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${loading ? "opacity-70 cursor-wait" : "hover:bg-green-800 dark:hover:bg-green-700"}`}
                >
                  <span>
                    {mode === "edit" ? "Update Article" : "Submit Article"}
                  </span>
                </button>
              </div>

              {mode === "edit" && existingImageUrl && !image && (
                <div className="mt-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Current Photo:
                  </p>
                  <img
                    src={existingImageUrl}
                    alt="Current publication"
                    className="max-h-60 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm"
                  />
                </div>
              )}
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

export default PublicationForm;
