import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUserQuery = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    staleTime: Infinity,         
    cacheTime: Infinity,         
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false,   
  });

  const userData = authUserQuery.data?.user;

  return {
    isLoading: authUserQuery.isLoading,
    authUser: userData,
    isApproved:
      userData?.isActive && userData?.approvalStatus === "approved",
    isOnBoarded: userData?.isOnBoarded,
    isAdmin: userData?.role === "admin",
    refetch: authUserQuery.refetch,
  };
};

export default useAuthUser;
