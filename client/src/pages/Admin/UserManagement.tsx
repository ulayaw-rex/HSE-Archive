import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import UserTable from "../../components/features/Admin/UserTable";
import UserForm from "../../components/features/Admin/UserForm";
import type { User, CreateUserData, UpdateUserData } from "../../types/User";
import "./UserManagement.css";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`/users?page=${page}`);

      setUsers(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchUsers(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setFormLoading(true);
      await AxiosInstance.post("/users", userData);
      setShowForm(false);
      fetchUsers(1);
    } catch (err: any) {
      console.error("Create User Failed:", err.response?.data);
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!editingUser) return;
    try {
      setFormLoading(true);
      const response = await AxiosInstance.put(
        `/users/${editingUser.id}`,
        userData
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? response.data.user : user
        )
      );
      setEditingUser(null);
      setShowForm(false);
    } catch (err: any) {
      console.error("Update User Failed:", err.response?.data);
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await AxiosInstance.delete(`/users/${userId}`);
      if (users.length === 1 && pagination.current_page > 1) {
        fetchUsers(pagination.current_page - 1);
      } else {
        fetchUsers(pagination.current_page);
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSubmitForm = async (data: CreateUserData | UpdateUserData) => {
    if (editingUser) {
      await handleUpdateUser(data as UpdateUserData);
    } else {
      await handleCreateUser(data as CreateUserData);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">User Management</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add New User
          </button>
        </div>{" "}
        {showForm && (
          <div className="user-modal-overlay">
            <div className="user-modal-container">
              <UserForm
                user={editingUser}
                onSubmit={handleSubmitForm}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </div>
          </div>
        )}{" "}
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          loading={loading}
        />
        {!loading && pagination.last_page > 1 && (
          <div className="flex items-center justify-end border-t border-gray-100 pt-4 mt-4">
            <nav className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
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
                <span className="text-gray-600">{pagination.last_page}</span>
              </div>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="text-sm font-medium text-gray-500 hover:text-green-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
