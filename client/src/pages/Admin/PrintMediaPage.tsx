import React, { useState, useEffect, useCallback } from "react";
import PrintMediaCard from "../../components/features/Admin/PrintMediaCard";
import PrintMediaForm from "../../components/features/Admin/PrintMediaForm";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import { toast } from "react-toastify";
import type { PrintMedia, CreatePrintMediaData } from "../../types/PrintMedia";
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

  const fetchPrintMedia = useCallback(async () => {
    try {
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

  const handleCreate = async (data: CreatePrintMediaData) => {
    try {
      const formData = new FormData();

      // Ensure all required fields are present
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if ((key === "file" || key === "image") && value instanceof File) {
            formData.append(key, value);
          } else if (key === "date") {
            // Ensure date is in the correct format
            formData.append(key, new Date(value).toISOString().split("T")[0]);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add default date if not provided
      if (!formData.has("date")) {
        formData.append("date", new Date().toISOString().split("T")[0]);
      }

      const response = await AxiosInstance.post("/print-media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrintMediaList([response.data, ...printMediaList]);
      setIsFormOpen(false);
      toast.success("Print media archive created successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create print media archive: ${errorMessage}`);
    }
  };

  const handleUpdate = useCallback(
    async (data: CreatePrintMediaData) => {
      if (!printMediaToEdit) return;
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if ((key === "file" || key === "image") && value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        formData.append("_method", "PUT");
        const response = await AxiosInstance.post(
          `/print-media/${printMediaToEdit.print_media_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setPrintMediaList(
          printMediaList.map((item) =>
            item.print_media_id === printMediaToEdit.print_media_id
              ? response.data
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
        console.error("Update error:", errorMessage);
        toast.error(errorMessage);
      }
    },
    [printMediaList, printMediaToEdit]
  );

  const handleEdit = (item: PrintMedia) => {
    setPrintMediaToEdit(item);
    setIsFormOpen(true);
  };

  const handleDelete = useCallback(async () => {
    if (!printMediaToDelete) return;
    try {
      await AxiosInstance.delete(
        `/print-media/${printMediaToDelete.print_media_id}`
      );
      setPrintMediaList(
        printMediaList.filter(
          (p) => p.print_media_id !== printMediaToDelete.print_media_id
        )
      );
      toast.success("Print media archive deleted successfully");
      setPrintMediaToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to delete print media archive: ${errorMessage}`);
    }
  }, [printMediaList, printMediaToDelete]);

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
                onDelete={(id) =>
                  setPrintMediaToDelete(
                    printMediaList.find((p) => p.print_media_id === id) || null
                  )
                }
                onView={handleView}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
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

        {/* Delete Confirmation */}
        <ConfirmationModal
          isOpen={!!printMediaToDelete}
          onClose={() => setPrintMediaToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Print Media Archive"
          message={`Are you sure you want to delete "${printMediaToDelete?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        {/* PDF Viewer */}
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
