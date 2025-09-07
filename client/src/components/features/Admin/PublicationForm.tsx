import React, { useState, useEffect } from "react";
import type {
  Publication,
  CreatePublicationData,
} from "../../types/Publication";

interface PublicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePublicationData) => Promise<void>;
  publication?: Publication | null;
  mode?: "add" | "edit";
}

const PublicationForm: React.FC<PublicationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  publication,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<CreatePublicationData>({
    title: "",
    byline: "",
    body: "",
    category: "university",
    photo_credits: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publication) {
      setFormData({
        title: publication.title,
        byline: publication.byline,
        body: publication.body,
        category: publication.category,
        photo_credits: publication.photo_credits || "",
      });
      setExistingImageUrl(publication.image || null);
    } else {
      setFormData({
        title: "",
        byline: "",
        body: "",
        category: "university",
        photo_credits: "",
      });
      setImage(null);
      setExistingImageUrl(null);
    }
  }, [publication]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...formData, image });
      // Reset form to initial state after successful submission
      setFormData({
        title: "",
        byline: "",
        body: "",
        category: "university",
        photo_credits: "",
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
    <div className="user-modal-overlay">
      <div className="user-modal-container relative publication-form-modal">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-3xl font-extrabold mb-6 border-b border-gray-400 pb-2">
          {mode === "edit" ? "Edit Article" : "Add Article"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-green-700 font-semibold mb-2">Byline</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Writer"
                value={formData.byline}
                onChange={(e) =>
                  setFormData({ ...formData, byline: e.target.value })
                }
                className="col-span-1 p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="col-span-1 p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              >
                <option value="university">University</option>
                <option value="local">Local</option>
                <option value="national">National</option>
                <option value="international">International</option>
                <option value="sci-tech">Sci-Tech</option>
                <option value="sports">Sports</option>
                <option value="opinion">Opinion</option>
                <option value="literary">Literary</option>
              </select>
              <input
                type="text"
                placeholder="Photo credits"
                value={formData.photo_credits}
                onChange={(e) =>
                  setFormData({ ...formData, photo_credits: e.target.value })
                }
                className="col-span-1 p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
          <div>
            <h3 className="text-green-700 font-semibold mb-2">Article</h3>
            <input
              type="text"
              placeholder="Add a headline"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 mb-4"
              required
            />
            <textarea
              placeholder="Add body"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 h-40 resize-none"
              required
            />
          </div>
          <div className="flex justify-between items-center mt-6">
            <label
              htmlFor="upload-photo"
              className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-md flex items-center space-x-2"
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
              className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 disabled:opacity-50"
            >
              {mode === "edit" ? "Update Article" : "Post Article +"}
            </button>
          </div>
          {mode === "edit" && existingImageUrl && !image && (
            <div className="mt-4">
              <p className="text-gray-700 mb-2">Current Photo:</p>
              <img
                src={existingImageUrl}
                alt="Current publication"
                className="max-w-full h-auto rounded-md border border-gray-300"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PublicationForm;
