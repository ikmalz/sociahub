import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Account created! Waiting for admin approval.");
        
        // JANGAN invalidate authUser karena user belum bisa login
        // queryClient.invalidateQueries({ queryKey: ["authUser"] });

        // Redirect ke waiting approval page dengan data user
        navigate("/waiting-approval", {
          state: {
            email: data.user?.email,
            fullName: data.user?.fullName,
            message: "Your account is pending admin approval"
          }
        });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  });

  return {
    isPending,
    error,
    signupMutation: mutate,
  };
};

export default useSignUp;