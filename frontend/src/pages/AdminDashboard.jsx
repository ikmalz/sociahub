import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import {
  getPendingUsers,
  approveUser as approveUserApi,
  rejectUser as rejectUserApi,
} from "../lib/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [roles, setRoles] = useState({});

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await getPendingUsers();

      if (res.success) {
        setUsers(res.users || []);
        if (res.users?.length > 0) {
          toast.success(
            `${res.count} pending user${res.count > 1 ? "s" : ""} loaded`
          );
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load pending users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setProcessingId(userId);
      const role = roles[userId] || "client";

      await approveUserApi(userId, role);
      toast.success("User approved successfully");

      await fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approve failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user) => {
    const confirmed = window.confirm(
      `Reject user ${user.fullName}?\n\nUser account will be permanently deleted.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(user._id);
      await rejectUserApi(user._id);
      toast.success("User rejected and removed");

      await fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Reject failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="opacity-70">User approval management</p>
          </div>
        </div>

        <button
          onClick={fetchPendingUsers}
          disabled={loading}
          className="btn btn-outline"
        >
          <RefreshCw
            className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Pending Users</h2>
            <div className="badge badge-primary">{users.length} pending</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="loading loading-spinner loading-lg mb-4"></span>
              <p>Loading pending users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10">
              <Users className="size-16 mx-auto opacity-30 mb-4" />
              <p className="text-lg opacity-70">No pending users 🎉</p>
              <p className="text-sm opacity-50 mt-2">
                All users have been processed or no new registrations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Assign Role</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                              <img
                                src={user.profilePic || "/default-avatar.png"}
                                alt={user.fullName}
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <span>{user.fullName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td>
                        <select
                          className="select select-bordered select-sm w-full max-w-xs"
                          value={roles[user._id] || "client"}
                          onChange={(e) =>
                            setRoles((prev) => ({
                              ...prev,
                              [user._id]: e.target.value,
                            }))
                          }
                        >
                          <option value="client">Client</option>
                          <option value="employee">Employee</option>
                        </select>
                      </td>
                      <td className="flex gap-2 justify-center">
                        <button
                          className="btn btn-success btn-sm"
                          disabled={processingId === user._id}
                          onClick={() => handleApprove(user._id)}
                        >
                          {processingId === user._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <CheckCircle className="size-4" />
                          )}
                          Approve
                        </button>

                        <button
                          className="btn btn-error btn-sm"
                          disabled={processingId === user._id}
                          onClick={() => handleReject(user)}
                        >
                          <XCircle className="size-4" />
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
