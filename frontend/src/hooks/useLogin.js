import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending,
    error,
  } = useMutation({
    mutationFn: login,
    onSuccess: (res) => {

      localStorage.setItem("user", JSON.stringify(res));

      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      window.location.href = "/";
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
