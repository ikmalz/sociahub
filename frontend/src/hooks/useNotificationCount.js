import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const useNotificationCount = () => {
  const { data } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const unreadIncoming = data?.incomingReqs?.length || 0;
  const unreadAccepted = data?.acceptedReqs?.filter(
    (n) => !localStorage.getItem(`notif-read-${n._id}`)
  ).length || 0;

  return unreadIncoming + unreadAccepted;
};

export default useNotificationCount;
