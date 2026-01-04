import React, { useState, useEffect } from "react";
import WriterSelect from "./WriterSelect";
import ConfirmationModal from "../../common/ConfirmationModal";
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
  onSubmit: (data: ExtendedCreatePublicationData) => Promise<void>;
  publication?: Publication | null;
  mode?: "add" | "edit";
  currentUser?: { id: number; name: string } | null;
}

const PublicationForm: React.FC<PublicationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  publication,
  mode = "add",
  currentUser,
}) => {
  const [formData, setFormData] = useState<ExtendedCreatePublicationData>({
    title: "",
    byline: "",
    body: "",
    category: "university",
    photo_credits: "",
    writer_ids: [],
    date_published: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [initialData, setInitialData] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setErrors({});

      let startData: ExtendedCreatePublicationData;

      if (publication) {
        const existingDate = publication.date_published
          ? new Date(publication.date_published).toISOString().split("T")[0]
          : new Date(publication.created_at).toISOString().split("T")[0];

        startData = {
          title: publication.title,
          byline: publication.byline || "",
          body: publication.body,
          category: publication.category,
          photo_credits: publication.photo_credits || "",
          writer_ids: publication.writers
            ? publication.writers.map((w) => w.id)
            : [],
          date_published: existingDate,
        };
        setExistingImageUrl(publication.image || null);
      } else {
        startData = {
          title: "",
          byline: currentUser ? currentUser.name : "",
          body: "",
          category: "university",
          photo_credits: "",
          writer_ids: currentUser ? [currentUser.id] : [],
          date_published: new Date().toISOString().split("T")[0],
        };
        setExistingImageUrl(null);
      }

      setFormData(startData);
      setImage(null);
      setInitialData(JSON.stringify(startData));
    }
  }, [publication, currentUser, isOpen]);

  const hasUnsavedChanges = () => {
    if (image !== null) return true;
    const currentDataString = JSON.stringify(formData);
    return currentDataString !== initialData;
  };

  const handleCloseAttempt = () => {
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

    if (formData.writer_ids.length === 0) {
      newErrors.writer_ids = "Please select at least one writer.";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Headline is required.";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Article content is required.";
    }

    if (!formData.date_published) {
      newErrors.date_published = "Date is required.";
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...formData, image });
      setInitialData(JSON.stringify(formData));
      onClose();
    } catch (error) {
      console.error("Error submitting publication:", error);
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
        <div className="user-modal-container relative bg-white rounded-lg shadow-xl w-full md:w-auto md:min-w-[800px] lg:min-w-[1000px] max-w-6xl p-6 md:p-10 max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={handleCloseAttempt}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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

          <h2 className="text-3xl font-extrabold mb-8 border-b border-gray-300 pb-4 text-gray-900">
            {mode === "edit" ? "Edit Article" : "Add Article"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-green-700 font-semibold mb-3 text-lg">
                Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    WRITER(S) <span className="text-red-500">*</span>
                  </label>
                  {currentUser ? (
                    <input
                      disabled
                      value={currentUser.name}
                      className="w-full h-[50px] p-3 rounded-md border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  ) : (
                    <div
                      className={
                        errors.writer_ids
                          ? "border border-red-500 rounded-md"
                          : ""
                      }
                    >
                      <WriterSelect
                        selectedIds={formData.writer_ids}
                        onSelectionChange={(newIds) => {
                          setFormData({ ...formData, writer_ids: newIds });
                          clearError("writer_ids");
                        }}
                        initialUsers={publication?.writers}
                      />
                    </div>
                  )}
                  {errors.writer_ids && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.writer_ids}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    DATE PUBLISHED <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
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
                      }`}
                  />
                  {errors.date_published && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date_published}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    PHOTO CREDITS
                  </label>
                  <input
                    type="text"
                    placeholder="Photographer Name"
                    value={formData.photo_credits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        photo_credits: e.target.value,
                      })
                    }
                    className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  BYLINE DISPLAY (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Custom Byline (e.g. John & Jane)"
                  value={formData.byline}
                  onChange={(e) =>
                    setFormData({ ...formData, byline: e.target.value })
                  }
                  className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            <div>
              <h3 className="text-green-700 font-semibold mb-3 text-lg">
                Article Content
              </h3>

              <input
                type="text"
                placeholder="Add a headline"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  clearError("title");
                }}
                className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 mb-1 text-lg font-medium
                  ${errors.title ? "border-red-500" : "border-gray-700"}`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mb-3">{errors.title}</p>
              )}

              <textarea
                placeholder="Add body text..."
                value={formData.body}
                onChange={(e) => {
                  setFormData({ ...formData, body: e.target.value });
                  clearError("body");
                }}
                className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600 h-64 resize-none leading-relaxed
                   ${errors.body ? "border-red-500" : "border-gray-700"}`}
              />
              {errors.body && (
                <p className="text-red-500 text-xs mt-1">{errors.body}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 pt-6 border-t border-gray-200">
              <label className="cursor-pointer bg-gray-800 text-white px-6 py-3 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto hover:bg-gray-900 transition-colors">
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
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-700 text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 disabled:opacity-50 w-full md:w-auto shadow-md"
              >
                {mode === "edit" ? "Update Article" : "Post Article +"}
              </button>
            </div>

            {mode === "edit" && existingImageUrl && !image && (
              <div className="mt-6">
                <p className="text-gray-700 mb-2 font-medium">Current Photo:</p>
                <img
                  src={existingImageUrl}
                  alt="Current publication"
                  className="max-h-60 rounded-md border border-gray-300 shadow-sm"
                />
              </div>
            )}
          </form>
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
