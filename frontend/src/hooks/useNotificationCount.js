import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const useNotificationCount = () => {
  const { data } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const incoming = data?.incomingReqs?.length || 0;
  const accepted = data?.acceptedReqs?.length || 0;

  return incoming + accepted;
};

export default useNotificationCount;
