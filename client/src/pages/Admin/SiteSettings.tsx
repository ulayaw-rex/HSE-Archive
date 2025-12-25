import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import { toast } from "react-toastify";
import { FaCloudUploadAlt, FaImage, FaPen, FaSave } from "react-icons/fa";

const SiteSettings: React.FC = () => {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [introText, setIntroText] = useState("");
  const [savingText, setSavingText] = useState(false);

  useEffect(() => {
    AxiosInstance.get("/site-settings/team-photo")
      .then((res) => setCurrentPhotoUrl(res.data.url))
      .catch((err) => console.error(err));

    AxiosInstance.get("/site-settings/team-intro")
      .then((res) => setIntroText(res.data.text))
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const res = await AxiosInstance.post(
        "/admin/site-settings/team-photo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setCurrentPhotoUrl(res.data.url);
      setSelectedFile(null);
      toast.success("Team photo updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveText = async () => {
    setSavingText(true);
    try {
      await AxiosInstance.post("/admin/site-settings/team-intro", {
        text: introText,
      });
      toast.success("Introduction text updated!");
    } catch (error: any) {
      toast.error("Failed to update text.");
    } finally {
      setSavingText(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Site Settings</h1>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaPen className="text-green-700" /> Team Introduction Text
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            This text appears below "Meet the Team" on the About page.
          </p>

          <textarea
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
            placeholder="Enter a short summary about the team..."
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveText}
              disabled={savingText}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {savingText ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <FaSave />
              )}
              {savingText ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaImage className="text-green-700" /> Team Background Photo
          </h2>

          <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden h-48 flex items-center justify-center border-2 border-dashed border-gray-300 relative">
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt="Current Team"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-gray-400">No photo set</p>
            )}
            {selectedFile && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                New file selected: {selectedFile.name}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2.5 text-center hover:bg-gray-100 transition-colors">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {selectedFile ? "Change File" : "Select Photo"}
            </label>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg text-white transition-all ${
                !selectedFile || uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-sm"
              }`}
            >
              {uploading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <FaCloudUploadAlt />
              )}
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Recommended size: 1920x600px. Max 5MB. (JPEG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
