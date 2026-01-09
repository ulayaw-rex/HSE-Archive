import React, { useState, useEffect } from "react";
import PublicationCard from "../../components/features/Admin/PublicationCard";
import PublicationForm from "../../components/features/Publications/PublicationForm";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "react-toastify";
import type {
  Publication,
  CreatePublicationData,
} from "../../types/Publication";
import AxiosInstance from "../../AxiosInstance";

interface ExtendedCreatePublicationData extends CreatePublicationData {
  writer_ids: number[];
  date_published: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const PublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);

  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [publicationToEdit, setPublicationToEdit] =
    useState<Publication | null>(null);
  const [publicationToDelete, setPublicationToDelete] =
    useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPublications(1);
  }, []);

  const fetchPublications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/publications?page=${page}`);

      setPublications(response.data.data);

      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      toast.error("Failed to fetch publications");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchPublications(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCreate = async (data: ExtendedCreatePublicationData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("body", data.body);
      formData.append("category", data.category);
      formData.append("byline", data.byline);
      if (data.date_published)
        formData.append("date_published", data.date_published);
      if (data.photo_credits)
        formData.append("photo_credits", data.photo_credits);
      if (data.image instanceof File) formData.append("image", data.image);
      if (data.writer_ids && data.writer_ids.length > 0) {
        data.writer_ids.forEach((id) =>
          formData.append("writer_ids[]", id.toString())
        );
      }

      await AxiosInstance.post("/publications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsFormOpen(false);
      toast.success("Publication created successfully");

      fetchPublications(1);

      window.dispatchEvent(new Event("publicationCreated"));
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create publication"
      );
    }
  };

  const handleUpdate = async (data: ExtendedCreatePublicationData) => {
    if (!publicationToEdit) return;
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("body", data.body);
      formData.append("category", data.category);
      formData.append("byline", data.byline);
      if (data.date_published)
        formData.append("date_published", data.date_published);
      if (data.photo_credits)
        formData.append("photo_credits", data.photo_credits);
      if (data.image instanceof File) formData.append("image", data.image);
      if (data.writer_ids && data.writer_ids.length > 0) {
        data.writer_ids.forEach((id) =>
          formData.append("writer_ids[]", id.toString())
        );
      }
      formData.append("_method", "PUT");

      const response = await AxiosInstance.post(
        `/publications/${publicationToEdit.publication_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setPublications(
        publications.map((pub) =>
          pub.publication_id === publicationToEdit.publication_id
            ? response.data
            : pub
        )
      );
      setIsFormOpen(false);
      setPublicationToEdit(null);
      toast.success("Publication updated successfully");
    } catch (error: any) {
      toast.error("Failed to update publication");
    }
  };

  const handleEdit = (publication: Publication) => {
    setPublicationToEdit(publication);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!publicationToDelete) return;
    setIsDeleting(true);
    try {
      await AxiosInstance.delete(
        `/publications/${publicationToDelete.publication_id}`
      );

      setPublications(
        publications.filter(
          (p) => p.publication_id !== publicationToDelete.publication_id
        )
      );

      if (publications.length === 1 && pagination.current_page > 1) {
        fetchPublications(pagination.current_page - 1);
      } else {
        fetchPublications(pagination.current_page);
      }

      toast.success("Publication deleted successfully");
      setPublicationToDelete(null);
    } catch (error) {
      toast.error("Failed to delete publication");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Publications</h1>
          <button
            onClick={() => {
              setPublicationToEdit(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary"
          >
            Add Article
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
              {publications.map((publication) => (
                <PublicationCard
                  key={publication.publication_id}
                  publication={publication}
                  onEdit={handleEdit}
                  onDelete={(id) =>
                    setPublicationToDelete(
                      publications.find((p) => p.publication_id === id) || null
                    )
                  }
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

        <PublicationForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setPublicationToEdit(null);
          }}
          onSubmit={
            publicationToEdit ? (handleUpdate as any) : (handleCreate as any)
          }
          publication={publicationToEdit}
          mode={publicationToEdit ? "edit" : "add"}
        />

        <ConfirmationModal
          isOpen={!!publicationToDelete}
          onClose={() => setPublicationToDelete(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Publication"
          message={`Are you sure you want to delete "${publicationToDelete?.title}"?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      </div>
    </div>
  );
};

export default PublicationsPage;
