import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import UserTable from "../../components/features/Admin/UserTable";
import UserForm from "../../components/features/Admin/UserForm";
import type { User, CreateUserData, UpdateUserData } from "../../types/User";
import "./UserManagement.css";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users from API...");
      const response = await AxiosInstance.get("/users");
      console.log("Users API response:", response.data);
      setUsers(response.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      console.error("Error details:", err.response?.data);
      console.error("Error status:", err.response?.status);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserManagement component mounted");
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setFormLoading(true);
      console.log("Creating user with data:", userData);
      const response = await AxiosInstance.post("/users", userData);
      console.log("Create user response:", response.data);
      setUsers((prev) => [response.data.user, ...prev]);
      setShowForm(false);
    } catch (err: any) {
      console.error("Error creating user:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to create user. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!editingUser) return;

    try {
      setFormLoading(true);
      console.log("Updating user with data:", userData);
      const response = await AxiosInstance.put(
        `/users/${editingUser.id}`,
        userData
      );
      console.log("Update user response:", response.data);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? response.data.user : user
        )
      );
      setEditingUser(null);
      setShowForm(false);
    } catch (err: any) {
      console.error("Error updating user:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to update user. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await AxiosInstance.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err: any) {
      console.error("Error deleting user:", err);
      console.error("Error details:", err.response?.data);
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

  const handleSubmitForm = (data: CreateUserData | UpdateUserData) => {
    if (editingUser) {
      handleUpdateUser(data as UpdateUserData);
    } else {
      handleCreateUser(data as CreateUserData);
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
        </div>

        {/* User Form Modal */}
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
        )}

        {/* User Table */}
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default UserManagement;
