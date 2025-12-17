import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Clock, Mail, Shield, Home, CheckCircle } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const WaitingApproval = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, isApproved, isOnBoarded, refetch } = useAuthUser();

  const email = location.state?.email || authUser?.email;
  const fullName = location.state?.fullName || authUser?.fullName;

  useEffect(() => {
    const checkApproval = async () => {
      await refetch();
      
      if (isApproved) {
        if (isOnBoarded) {
          navigate("/", {
            state: { 
              message: "Your account has been approved!"
            }
          });
        } else {
          navigate("/onboarding", {
            state: { 
              message: "Your account has been approved! Please complete your profile."
            }
          });
        }
      }
    };

    checkApproval();

    const interval = setInterval(checkApproval, 10000);

    return () => clearInterval(interval);
  }, [isApproved, isOnBoarded, navigate, refetch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4">
      <div className="card bg-base-100 shadow-2xl max-w-lg w-full border border-primary/20">
        <div className="card-body items-center text-center p-8">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
            <Clock className="size-24 text-primary relative z-10 animate-pulse" />
          </div>

          <h1 className="card-title text-3xl font-bold mb-2">
            Waiting for Approval
          </h1>
          
          <p className="text-lg opacity-80 mb-6">
            Your registration is complete! 🎉
          </p>

          {/* Account Info Card */}
          <div className="bg-base-200 rounded-2xl p-6 w-full mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="size-6 text-info" />
              <h3 className="text-lg font-semibold">Account Status</h3>
            </div>
            
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{fullName || "User"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="flex items-center gap-1">
                  <Mail className="size-4" />
                  {email || "Not provided"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="badge badge-warning animate-pulse">
                  ⏳ Pending Approval
                </span>
              </div>
            </div>
          </div>

          <div className="alert alert-info w-full mb-6">
            <div className="text-left">
              <h4 className="font-bold mb-1">What happens next?</h4>
              <ul className="text-sm space-y-1">
                <li><CheckCircle className="size-4 inline mr-1" /> Your registration is complete</li>
                <li>⏳ Admin will review your account</li>
                <li>📧 You'll receive approval notification</li>
                <li>📝 Complete your profile (onboarding)</li>
                <li>🚀 Start using the platform!</li>
              </ul>
            </div>
          </div>

          <div className="card-actions w-full space-y-3">
            <button 
              className="btn btn-primary w-full"
              onClick={() => {
                refetch();
                if (isApproved) {
                  if (isOnBoarded) {
                    navigate("/");
                  } else {
                    navigate("/onboarding");
                  }
                } else {
                  navigate("/login", {
                    state: { 
                      email: email,
                      message: "Account still pending approval" 
                    }
                  });
                }
              }}
            >
              Check Approval Status
            </button>
            
            <div className="flex gap-3 w-full">
              <button 
                className="btn btn-outline flex-1"
                onClick={() => navigate("/login", {
                  state: { email: email }
                })}
              >
                Go to Login
              </button>
              
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => navigate("/")}
              >
                <Home className="size-4 mr-2" />
                Home
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-base-300">
            <p className="text-sm opacity-60">
              This page will automatically update when your account is approved.
              <br />
              For inquiries: <span className="text-primary">admin@sociahub.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingApproval;