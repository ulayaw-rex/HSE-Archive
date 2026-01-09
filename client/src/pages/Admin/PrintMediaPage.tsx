import React, { useState, useEffect, useCallback } from "react";
import PrintMediaCard from "../../components/features/Admin/PrintMediaCard";
import PrintMediaForm from "../../components/features/Admin/PrintMediaForm";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import { toast } from "react-toastify";
import type { PrintMedia, PrintMediaFormData } from "../../types/PrintMedia";
import AxiosInstance from "../../AxiosInstance";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const PrintMediaPage: React.FC = () => {
  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>([]);

  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [printMediaToEdit, setPrintMediaToEdit] = useState<PrintMedia | null>(
    null
  );
  const [printMediaToDelete, setPrintMediaToDelete] =
    useState<PrintMedia | null>(null);
  const [selectedPrintMedia, setSelectedPrintMedia] =
    useState<PrintMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPrintMedia = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`/print-media?page=${page}`);

      setPrintMediaList(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to fetch print media archives: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrintMedia(1);
  }, [fetchPrintMedia]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchPrintMedia(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCreate = async (formData: PrintMediaFormData) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      formData.append("date", currentDate);

      await AxiosInstance.post("/print-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsFormOpen(false);
      toast.success("Print media archive created successfully");

      fetchPrintMedia(1);
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

  const confirmDelete = useCallback(async () => {
    if (!printMediaToDelete) return;

    setIsDeleting(true);
    try {
      await AxiosInstance.delete(
        `/print-media/${printMediaToDelete.print_media_id}`
      );

      setPrintMediaList((prevList) =>
        prevList.filter(
          (p) => p.print_media_id !== printMediaToDelete.print_media_id
        )
      );

      if (printMediaList.length === 1 && pagination.current_page > 1) {
        fetchPrintMedia(pagination.current_page - 1);
      } else {
        fetchPrintMedia(pagination.current_page);
      }

      toast.success("Print media archive deleted successfully");
      setPrintMediaToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to delete print media archive: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  }, [
    printMediaToDelete,
    pagination.current_page,
    printMediaList.length,
    fetchPrintMedia,
  ]);

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

            {!loading && pagination.last_page > 1 && (
              <div className="flex items-center justify-end border-t border-gray-100 pt-4 mt-4">
                <nav className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                    className="text-sm font-medium text-gray-500 hover:text-green-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="text-sm">
                    <span className="font-bold text-green-700">
                      {pagination.current_page}
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-600">
                      {pagination.last_page}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className="text-sm font-medium text-gray-500 hover:text-green-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
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
          isLoading={isDeleting}
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
