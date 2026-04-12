import React, { useState } from "react";
import type { User } from "../../../types/User";
import { toast } from "react-toastify";
import ConfirmationModal from "../../common/ConfirmationModal";
import { FaEdit, FaTrash } from "react-icons/fa";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  loading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "alumni":
        return "bg-purple-100 text-purple-800";
      case "hillsider":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteClick = (user: User, e: React.MouseEvent) => {
    e.preventDefault();
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(userToDelete.id);
      toast.success(`Successfully deleted user ${userToDelete.name}`);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-transparent dark:border-white/5">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-transparent dark:border-white/5 transition-colors duration-200">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
              <thead className="bg-gray-50 dark:bg-gray-700 hidden lg:table-header-group">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent lg:bg-white lg:dark:bg-gray-800 divide-y-0 lg:divide-y divide-gray-200 dark:divide-white/5 block lg:table-row-group p-4 lg:p-0">
                {users.length === 0 ? (
                  <tr className="block lg:table-row bg-white dark:bg-gray-800 rounded-lg lg:rounded-none">
                    <td
                      colSpan={10}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 block lg:table-cell"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 block lg:table-row bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 lg:border-none rounded-xl lg:rounded-none shadow-sm lg:shadow-none mb-4 lg:mb-0 overflow-hidden"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-gray-700 lg:border-none bg-green-50/50 dark:bg-green-900/20 lg:bg-transparent">
                        <div className="flex justify-between items-center lg:block">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Name</span>
                          <div className="text-sm font-bold lg:font-medium text-gray-900 dark:text-gray-100 text-right lg:text-left">
                            {user.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Email</span>
                          <div className="text-sm text-gray-600 dark:text-gray-300 lg:text-gray-900 lg:dark:text-gray-100 text-right lg:text-left truncate max-w-[200px] lg:max-w-none">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Department</span>
                          <div
                            className="text-sm text-gray-500 dark:text-gray-400 text-right lg:text-left max-w-[200px] lg:max-w-[150px] truncate"
                            title={(user as any).department}
                          >
                            {(user as any).department || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Course</span>
                          <div
                            className="text-sm text-gray-500 dark:text-gray-400 text-right lg:text-left max-w-[200px] lg:max-w-[150px] truncate"
                            title={user.course}
                          >
                            {user.course || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Position</span>
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-right lg:text-left truncate">
                            {user.position || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Year</span>
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-right lg:text-left">
                            {(user as any).year_graduated || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Role</span>
                          <div className="text-right lg:text-left">
                            <span
                              className={`inline-flex px-2 py-1 text-[10px] lg:text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Status</span>
                          <div className="text-right lg:text-left">
                            {user.status ? (
                              <span
                                className={`inline-flex px-2 py-1 text-[10px] lg:text-xs font-semibold rounded-full ${getStatusBadgeColor(
                                  user.status
                                )}`}
                              >
                                {user.status.charAt(0).toUpperCase() +
                                  user.status.slice(1)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 block lg:table-cell lg:whitespace-nowrap border-b border-gray-100 dark:border-white/5 lg:border-none">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Date</span>
                          <div className="text-sm text-gray-600 dark:text-gray-300 lg:text-gray-900 lg:dark:text-gray-100 text-right lg:text-left">
                            {formatDate(user.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 block lg:table-cell lg:whitespace-nowrap bg-gray-50/50 dark:bg-gray-700 lg:bg-transparent">
                        <div className="flex justify-between items-center lg:block gap-4">
                          <span className="lg:hidden font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Actions</span>
                          <div className="flex justify-end lg:justify-start items-center space-x-3">
                            <button
                              onClick={() => onEdit(user)}
                              disabled={isDeleting}
                              className={`p-2 rounded-full transition-colors bg-white dark:bg-gray-800 shadow-sm lg:shadow-none lg:bg-transparent ${
                                isDeleting
                                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                  : "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              }`}
                              title="Edit User"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(user, e)}
                              disabled={isDeleting}
                              className={`p-2 rounded-full transition-colors bg-white dark:bg-gray-800 shadow-sm lg:shadow-none lg:bg-transparent ${
                                isDeleting
                                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                  : "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                              }`}
                              title="Delete User"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => !isDeleting && setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </>
  );
};

export default UserTable;
