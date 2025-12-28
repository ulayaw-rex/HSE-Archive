import React, { useState, useEffect } from "react";
import WriterSelect from "./WriterSelect";
// import type { User } from "../../../types/User";

import type {
  Publication,
  CreatePublicationData,
} from "../../../types/Publication";

// 1. Extend the interface to include date_published locally
interface ExtendedCreatePublicationData extends CreatePublicationData {
  writer_ids: number[];
  date_published: string; // New field
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
  // 2. Initialize state with date_published
  const [formData, setFormData] = useState<ExtendedCreatePublicationData>({
    title: "",
    byline: "",
    body: "",
    category: "university",
    photo_credits: "",
    writer_ids: [],
    date_published: new Date().toISOString().split("T")[0], // Default to today
  });

  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publication) {
      // 3. Format existing date for input (YYYY-MM-DD)
      const existingDate = publication.created_at
        ? new Date(publication.created_at).toISOString().split("T")[0]
        : "";

      setFormData({
        title: publication.title,
        byline: publication.byline || "",
        body: publication.body,
        category: publication.category,
        photo_credits: publication.photo_credits || "",
        writer_ids: publication.writers
          ? publication.writers.map((w) => w.id)
          : [],
        date_published: existingDate,
      });
      setExistingImageUrl(publication.image || null);
    } else {
      setFormData({
        title: "",
        byline: currentUser ? currentUser.name : "",
        body: "",
        category: "university",
        photo_credits: "",
        writer_ids: currentUser ? [currentUser.id] : [],
        date_published: new Date().toISOString().split("T")[0],
      });
      setImage(null);
      setExistingImageUrl(null);
    }
  }, [publication, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.writer_ids.length === 0) {
      alert("Please select at least one writer.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...formData, image });
      // Reset form
      setFormData({
        title: "",
        byline: "",
        body: "",
        category: "university",
        photo_credits: "",
        writer_ids: [],
        date_published: new Date().toISOString().split("T")[0],
      });
      setImage(null);
      setExistingImageUrl(null);
      onClose();
    } catch (error) {
      console.error("Error submitting publication:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="user-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="user-modal-container relative bg-white rounded-lg shadow-xl w-full md:w-auto md:min-w-[800px] lg:min-w-[1000px] max-w-6xl p-6 md:p-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-8 border-b border-gray-300 pb-4 text-gray-900">
          {mode === "edit" ? "Edit Article" : "Add Article"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-green-700 font-semibold mb-3 text-lg">
              Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              {/* Writer Select */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  WRITER(S)
                </label>
                {currentUser ? (
                  <input
                    disabled
                    value={currentUser.name}
                    className="w-full h-[50px] p-3 rounded-md border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                ) : (
                  <WriterSelect
                    selectedIds={formData.writer_ids}
                    onSelectionChange={(newIds) =>
                      setFormData({ ...formData, writer_ids: newIds })
                    }
                    initialUsers={publication?.writers}
                  />
                )}
              </div>

              {/* Category */}
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
                  required
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

              {/* 4. New Date Input */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  DATE PUBLISHED
                </label>
                <input
                  type="date"
                  value={formData.date_published}
                  onChange={(e) =>
                    setFormData({ ...formData, date_published: e.target.value })
                  }
                  className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              {/* Photo Credits */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  PHOTO CREDITS
                </label>
                <input
                  type="text"
                  placeholder="Photographer Name"
                  value={formData.photo_credits}
                  onChange={(e) =>
                    setFormData({ ...formData, photo_credits: e.target.value })
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
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 mb-4 text-lg font-medium"
              required
            />
            <textarea
              placeholder="Add body text..."
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 h-64 resize-none leading-relaxed"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 pt-6 border-t border-gray-200">
            <label
              htmlFor="upload-photo"
              className="cursor-pointer bg-gray-800 text-white px-6 py-3 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto hover:bg-gray-900 transition-colors"
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
                id="upload-photo"
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
  );
};

export default PublicationForm;
