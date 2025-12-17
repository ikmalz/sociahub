import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
    const authUser = useQuery({
        queryKey: ["authUser"],
        queryFn: getAuthUser,
        retry: false,
    });

    const userData = authUser.data?.user;

    // Cek apakah user sudah di-approve
    const isApproved = userData?.isActive && userData?.approvalStatus === "approved";

    return {
        isLoading: authUser.isLoading, 
        authUser: userData,
        isApproved,
        isOnBoarded: userData?.isOnBoarded,
        isAdmin: userData?.role === "admin",
        refetch: authUser.refetch // tambah ini untuk bisa refresh di WaitingApproval
    };
};

// EKSPORT DEFAULT
export default useAuthUser;

// ATAU EKSPORT NAMED (pilih salah satu)
// export { useAuthUser };