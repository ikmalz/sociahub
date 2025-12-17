import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      const user = res?.user || res;

      if (!user.isActive || user.approvalStatus !== "approved") {
        toast.error("Your account is not approved yet. Please wait for admin approval.");
        navigate("/waiting-approval", {
          state: {
            email: user.email,
            fullName: user.fullName,
            message: "Account pending approval"
          }
        });
        return;
      }

      if (!user.isOnBoarded) {
        toast.success("Account approved! Please complete your profile.");
        navigate("/onboarding");
      } else {
        toast.success("Login successful!");
        navigate("/");
      }

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      if (error.response?.data?.message?.includes("approval")) {
        navigate("/waiting-approval", {
          state: {
            message: error.response.data.message
          }
        });
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    }
  });

  return {
    error,
    isPending,
    loginMutation: mutate,
  };
};

export default useLogin;