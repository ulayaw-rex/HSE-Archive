import React, { useState, useEffect } from "react";
import type {
  PrintMedia,
  CreatePrintMediaData,
} from "../../../types/PrintMedia";

interface PrintMediaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePrintMediaData) => Promise<void>;
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
  const [formData, setFormData] = useState<CreatePrintMediaData>({
    title: "",
    type: "folio",
    description: "",
    byline: "",
    file: null,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (printMedia) {
      setFormData({
        title: printMedia.title,
        type: printMedia.type,
        description: printMedia.description,
        byline: printMedia.byline || "",
        file: null,
      });
      setFile(null);
    } else {
      setFormData({
        title: "",
        type: "folio",
        description: "",
        byline: "",
        file: null,
      });
      setFile(null);
    }
  }, [printMedia]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, file });
  };

  return (
    <div
      className="user-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="user-modal-container relative print-media-form-modal">
        <h2 className="text-3xl font-extrabold mb-6 border-b border-gray-400 pb-2">
          {mode === "edit"
            ? "Edit Print Media Archive"
            : "Add Print Media Archive"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label
                className="block text-green-700 font-semibold mb-2"
                htmlFor="byline"
              >
                Byline
              </label>
              <input
                id="byline"
                type="text"
                placeholder="Writer"
                value={formData.byline}
                onChange={(e) =>
                  setFormData({ ...formData, byline: e.target.value })
                }
                className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="flex-1">
              <label
                className="block text-green-700 font-semibold mb-2"
                htmlFor="type"
              >
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              >
                <option value="folio">Folio</option>
                <option value="magazine">Magazine</option>
                <option value="tabloid">Tabloid</option>
                <option value="other">Others</option>
              </select>
            </div>
          </div>
          <div>
            <label
              className="block text-green-700 font-semibold mb-2"
              htmlFor="title"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Add a title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>
          <div>
            <label
              className="block text-green-700 font-semibold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Add description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 h-56 resize-none"
              required
            />
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="space-x-2">
              <label
                htmlFor="upload-file"
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
                <span>{file ? file.name : "Upload file"}</span>
                <input
                  id="upload-file"
                  type="file"
                  accept="*/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
            <button
              type="submit"
              className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800"
            >
              {mode === "edit" ? "Update Archive" : "Post Archive +"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrintMediaForm;
