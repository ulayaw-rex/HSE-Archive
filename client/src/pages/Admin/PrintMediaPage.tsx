import React, { useState, useEffect, useCallback } from "react";
import PrintMediaCard from "../../components/features/Admin/PrintMediaCard";
import PrintMediaForm from "../../components/features/Admin/PrintMediaForm";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import { toast } from "react-toastify";
import type { PrintMedia, PrintMediaFormData } from "../../types/PrintMedia";
import AxiosInstance from "../../AxiosInstance";

const PrintMediaPage: React.FC = () => {
  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [printMediaToEdit, setPrintMediaToEdit] = useState<PrintMedia | null>(
    null
  );
  const [printMediaToDelete, setPrintMediaToDelete] =
    useState<PrintMedia | null>(null);
  const [selectedPrintMedia, setSelectedPrintMedia] =
    useState<PrintMedia | null>(null);
  const [loading, setLoading] = useState(true);
  // 1. Add a new state to track the deletion process
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPrintMedia = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get<PrintMedia[]>("/print-media");
      setPrintMediaList(response.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to fetch print media archives: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPrintMedia();
  }, [fetchPrintMedia]);

  const handleCreate = async (formData: PrintMediaFormData) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      formData.append("date", currentDate);

      const response = await AxiosInstance.post("/print-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPrintMediaList((prevList) => [response.data, ...prevList]);
      setIsFormOpen(false);
      toast.success("Print media archive created successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create print media archive: ${errorMessage}`);
    }
  };

  const handleUpdate = useCallback(
    async (formData: PrintMediaFormData) => {
      if (!printMediaToEdit) return;
      try {
        const response = await AxiosInstance.post(
          `/print-media/${printMediaToEdit.print_media_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setPrintMediaList((prevList) =>
          prevList.map((item) =>
            item.print_media_id === printMediaToEdit.print_media_id
              ? response.data.data
              : item
          )
        );
        setIsFormOpen(false);
        setPrintMediaToEdit(null);
        toast.success("Print media archive updated successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update print media archive";
        toast.error(errorMessage);
      }
    },
    [printMediaToEdit]
  );

  const handleEdit = (item: PrintMedia) => {
    setPrintMediaToEdit(item);
    setIsFormOpen(true);
  };

  // 2. Update the confirmDelete function to manage the loading state
  const confirmDelete = useCallback(async () => {
    if (!printMediaToDelete) return;

    setIsDeleting(true); // Disable button
    try {
      await AxiosInstance.delete(
        `/print-media/${printMediaToDelete.print_media_id}`
      );

      setPrintMediaList((prevList) =>
        prevList.filter(
          (p) => p.print_media_id !== printMediaToDelete.print_media_id
        )
      );
      toast.success("Print media archive deleted successfully");
      setPrintMediaToDelete(null); // Close modal on success
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to delete print media archive: ${errorMessage}`);
    } finally {
      setIsDeleting(false); // Re-enable button
    }
  }, [printMediaToDelete]);

  const handleDeleteRequest = (item: PrintMedia) => {
    setPrintMediaToDelete(item);
  };

  const handleView = (printMedia: PrintMedia) => {
    setSelectedPrintMedia(printMedia);
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Print Media Archives</h1>
          <button
            onClick={() => {
              setPrintMediaToEdit(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary"
          >
            Add Archive
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-64 rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printMediaList.map((item) => (
              <PrintMediaCard
                key={item.print_media_id}
                printMedia={item}
                onEdit={handleEdit}
                onDelete={() => handleDeleteRequest(item)}
                onView={handleView}
              />
            ))}
          </div>
        )}

        <PrintMediaForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setPrintMediaToEdit(null);
          }}
          onSubmit={printMediaToEdit ? handleUpdate : handleCreate}
          printMedia={printMediaToEdit}
          mode={printMediaToEdit ? "edit" : "add"}
        />

        <ConfirmationModal
          isOpen={!!printMediaToDelete}
          onClose={() => setPrintMediaToDelete(null)}
          onConfirm={confirmDelete}
          isLoading={isDeleting} // 3. Pass the loading state to the modal
          title="Delete Print Media Archive"
          message={`Are you sure you want to delete "${printMediaToDelete?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        {selectedPrintMedia && (
          <PDFViewerModal
            isOpen={!!selectedPrintMedia}
            onClose={() => setSelectedPrintMedia(null)}
            printMedia={selectedPrintMedia}
          />
        )}
      </div>
    </div>
  );
};

export default PrintMediaPage;
