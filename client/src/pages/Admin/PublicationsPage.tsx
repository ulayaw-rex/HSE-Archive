import React, { useState, useEffect } from "react";
import PublicationCard from "../../components/features/Admin/PublicationCard";
import PublicationForm from "../../components/features/Admin/PublicationForm";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "react-toastify";
import type {
  Publication,
  CreatePublicationData,
} from "../../types/Publication";
import AxiosInstance from "../../AxiosInstance";

const PublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [publicationToEdit, setPublicationToEdit] =
    useState<Publication | null>(null);
  const [publicationToDelete, setPublicationToDelete] =
    useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  // 1. Add a new state to track the deletion process
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

  const handleCreate = async (data: CreatePublicationData) => {
    // ... (handleCreate function remains the same)
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "image") {
            if (value instanceof File) {
              formData.append("image", value);
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await AxiosInstance.post("/publications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPublications([response.data, ...publications]);
      setIsFormOpen(false);
      toast.success("Publication created successfully");
      window.dispatchEvent(new Event("publicationCreated"));
    } catch (error) {
      toast.error("Failed to create publication");
    }
  };

  const handleUpdate = async (data: CreatePublicationData) => {
    // ... (handleUpdate function remains the same)
    if (!publicationToEdit) return;
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "image" && value instanceof File) {
            formData.append("image", value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
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

  // 2. Update the handleDelete function to manage the loading state
  const handleDelete = async () => {
    if (!publicationToDelete) return;

    setIsDeleting(true); // Disable button
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
      setPublicationToDelete(null); // This closes the modal
    } catch (error) {
      toast.error("Failed to delete publication");
    } finally {
      setIsDeleting(false); // Re-enable button
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
          onSubmit={publicationToEdit ? handleUpdate : handleCreate}
          publication={publicationToEdit}
          mode={publicationToEdit ? "edit" : "add"}
        />

        <ConfirmationModal
          isOpen={!!publicationToDelete}
          onClose={() => setPublicationToDelete(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting} // 3. Pass the loading state to the modal
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
