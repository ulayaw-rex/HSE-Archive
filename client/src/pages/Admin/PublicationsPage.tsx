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

const PublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [publicationToEdit, setPublicationToEdit] =
    useState<Publication | null>(null);
  const [publicationToDelete, setPublicationToDelete] =
    useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await AxiosInstance.get("/publications");
      setPublications(response.data);
    } catch (error) {
      toast.error("Failed to fetch publications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ExtendedCreatePublicationData) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("body", data.body);
      formData.append("category", data.category);
      formData.append("byline", data.byline);

      if (data.date_published) {
        formData.append("date_published", data.date_published);
      }

      if (data.photo_credits)
        formData.append("photo_credits", data.photo_credits);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (data.writer_ids && data.writer_ids.length > 0) {
        data.writer_ids.forEach((id) => {
          formData.append("writer_ids[]", id.toString());
        });
      }

      const response = await AxiosInstance.post("/publications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPublications([response.data, ...publications]);
      setIsFormOpen(false);
      toast.success("Publication created successfully");

      fetchPublications();

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

      if (data.date_published) {
        formData.append("date_published", data.date_published);
      }

      if (data.photo_credits)
        formData.append("photo_credits", data.photo_credits);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (data.writer_ids && data.writer_ids.length > 0) {
        data.writer_ids.forEach((id) => {
          formData.append("writer_ids[]", id.toString());
        });
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
      console.error("Update error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          "Failed to update publication"
      );
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          message={`Are you sure you want to delete "${publicationToDelete?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      </div>
    </div>
  );
};

export default PublicationsPage;
