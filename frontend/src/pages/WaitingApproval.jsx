import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Clock, CheckCircle, XCircle, Mail } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const WaitingApproval = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, isApproved, refetch } = useAuthUser();

  const email =
    location.state?.email || authUser?.email || "-";
  const fullName =
    location.state?.fullName || authUser?.fullName || "User";

  /**
   * Tentukan status secara AMAN
   */
  let status = "pending";

  // PRIORITAS 1: dari state (penting untuk rejected + user deleted)
  if (location.state?.status === "rejected") {
    status = "rejected";
  }
  // PRIORITAS 2: dari backend
  else if (isApproved) {
    status = "approved";
  }

  useEffect(() => {
    // hanya refetch jika user masih ada
    if (status === "pending") {
      refetch();
      const interval = setInterval(refetch, 10000);
      return () => clearInterval(interval);
    }
  }, [refetch, status]);

  const STATUS_CONFIG = {
    pending: {
      icon: <Clock className="size-12 text-warning" />,
      title: "Waiting for Approval",
      message: "Your account is currently under review by the admin.",
      badge: "Pending",
      badgeClass: "text-warning",
    },
    approved: {
      icon: <CheckCircle className="size-12 text-success" />,
      title: "Account Approved",
      message: "Your account has been approved. You can now log in.",
      badge: "Approved",
      badgeClass: "text-success",
    },
    rejected: {
      icon: <XCircle className="size-12 text-error" />,
      title: "Account Rejected",
      message:
        "Your registration was rejected and your account has been removed from the system.",
      badge: "Rejected",
      badgeClass: "text-error",
    },
  };

  const current = STATUS_CONFIG[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-lg p-8 text-center">

        <div className="flex justify-center mb-5">
          {current.icon}
        </div>

        <h1 className="text-2xl font-semibold mb-2">
          {current.title}
        </h1>

        <p className="text-sm text-base-content/70 mb-6">
          {current.message}
        </p>

        <div className="space-y-3 text-sm mb-8">
          <div className="flex justify-between">
            <span className="text-base-content/60">Name</span>
            <span className="font-medium">{fullName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content/60">Email</span>
            <span className="flex items-center gap-1 font-medium">
              <Mail className="size-4" />
              {email}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base-content/60">Status</span>
            <span className={`font-medium ${current.badgeClass}`}>
              {current.badge}
            </span>
          </div>
        </div>

        {/* SINGLE BUTTON */}
        <button
          className="btn btn-primary w-full"
          onClick={() =>
            navigate("/login", {
              state: {
                email,
                message:
                  status === "approved"
                    ? "Your account has been approved. Please log in."
                    : status === "rejected"
                    ? "Your account was rejected. Please register again."
                    : "Your account is still pending approval.",
              },
            })
          }
        >
          Go to Login
        </button>

        <p className="text-xs text-base-content/50 mt-8">
          Contact admin if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
};

export default WaitingApproval;
