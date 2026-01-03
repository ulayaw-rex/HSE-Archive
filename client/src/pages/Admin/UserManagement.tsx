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
      const response = await AxiosInstance.get("/users");
      setUsers(response.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setFormLoading(true);
      const response = await AxiosInstance.post("/users", userData);
      setUsers((prev) => [response.data.user, ...prev]);
      setShowForm(false);
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
      setUsers((prev) => prev.filter((user) => user.id !== userId));
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
        </div>
        ={" "}
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
        ={" "}
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
