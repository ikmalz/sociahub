import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Clock, CheckCircle, XCircle, Mail } from "lucide-react";
import { checkApprovalStatus } from "../lib/api";

const WaitingApproval = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "-";
  const fullName = location.state?.fullName || "User";

  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState("");
  const [lastStatus, setLastStatus] = useState(null);

  const fetchStatus = async () => {
    if (!email || email === "-") return;

    try {
      const res = await checkApprovalStatus(email);

      const newStatus = res.status;
      setStatus(newStatus);
      setLoading(false);

      if (newStatus === "approved") {
        setTimeout(() => {
          navigate("/login", {
            state: {
              email,
              message: "Your account has been approved. Please log in.",
            },
          });
        }, 3000);
      }
    } catch (err) {
      console.error("Approval status error:", err);

      if (err.response?.status === 404) {
        setStatus("rejected");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const STATUS_CONFIG = {
    pending: {
      icon: <Clock className="size-12 text-warning" />,
      title: "Waiting for Approval",
      message:
        "Your account is currently under review by the admin. This page will update automatically.",
      badge: "Pending",
      badgeClass: "text-warning",
    },
    approved: {
      icon: <CheckCircle className="size-12 text-success" />,
      title: "Account Approved",
      message: "Your account has been approved. Redirecting to login...",
      badge: "Approved",
      badgeClass: "text-success",
    },
    rejected: {
      icon: <XCircle className="size-12 text-error" />,
      title: "Account Rejected",
      message:
        "Your registration was rejected. Please register again or contact admin.",
      badge: "Rejected",
      badgeClass: "text-error",
    },
  };

  const current = STATUS_CONFIG[status];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      {infoMessage && (
        <div className="absolute top-6 right-6 bg-base-100 border border-base-300 shadow-lg rounded-xl px-5 py-3 flex items-center gap-2 animate-bounce">
          <span className="text-sm font-medium">{infoMessage}</span>
        </div>
      )}
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-5">{current.icon}</div>

        <h1 className="text-2xl font-semibold mb-2">{current.title}</h1>

        <p className="text-sm text-base-content/70 mb-6">
          {status === "pending" &&
            "⏳ Your account is under admin review. We’ll notify you here once it’s approved or rejected."}
          {status === "approved" &&
            "🎉 Congratulations! Your account is approved. Redirecting you to login..."}
          {status === "rejected" &&
            "❌ Sorry, your registration was rejected. Please contact admin or register again."}
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

        {status !== "approved" && (
          <button
            className="btn btn-primary w-full"
            onClick={() =>
              navigate("/login", {
                state: {
                  email,
                  message:
                    status === "rejected"
                      ? "Your account was rejected. Please register again."
                      : "Your account is still pending approval.",
                },
              })
            }
          >
            Go to Login
          </button>
        )}

        <p className="text-xs text-base-content/50 mt-8">
          This page refreshes automatically every 10 seconds.
          <br />
          Contact admin if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
};

export default WaitingApproval;
