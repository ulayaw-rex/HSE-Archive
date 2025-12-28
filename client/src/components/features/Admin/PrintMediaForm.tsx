import React, { useState, useEffect } from "react";
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
    date_published: "",
    file: null,
    thumbnail: null,
  });

  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (printMedia && mode === "edit") {
      const existingDate = printMedia.date_published
        ? new Date(printMedia.date_published).toISOString().split("T")[0]
        : "";

      setFormData({
        title: printMedia.title,
        type: printMedia.type,
        description: printMedia.description,
        byline: printMedia.byline || "",
        date_published: existingDate,
        file: null,
        thumbnail: null,
      });
      setFile(null);
      setThumbnail(null);
    } else {
      setFormData({
        title: "",
        type: "folio",
        description: "",
        byline: "",
        date_published: new Date().toISOString().split("T")[0],
        file: null,
        thumbnail: null,
      });
      setFile(null);
      setThumbnail(null);
    }
  }, [printMedia, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("byline", formData.byline);

      formDataToSend.append("date_published", formData.date_published);

      if (file) {
        formDataToSend.append("file", file);
      }
      if (thumbnail) {
        formDataToSend.append("thumbnail", thumbnail);
      }

      if (mode === "edit") {
        formDataToSend.append("_method", "PUT");
      }

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="user-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="user-modal-container relative bg-white rounded-lg shadow-xl w-full md:w-auto md:min-w-[700px] lg:min-w-[900px] max-w-6xl p-6 md:p-10 max-h-[90vh] overflow-y-auto">
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
                className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
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
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                required
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
                Date Published
              </label>
              <input
                id="date_published"
                type="date"
                value={formData.date_published}
                onChange={(e) =>
                  setFormData({ ...formData, date_published: e.target.value })
                }
                className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
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
              className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
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

          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 gap-4">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <label
                htmlFor="upload-file"
                className="cursor-pointer bg-gray-800 text-white px-4 py-3 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-900 transition-colors w-full md:w-auto"
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
                  accept="*/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <label
                htmlFor="upload-thumbnail"
                className="cursor-pointer bg-gray-800 text-white px-4 py-3 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-900 transition-colors w-full md:w-auto"
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
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="!bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 disabled:opacity-50 w-full md:w-auto shadow-md"
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
