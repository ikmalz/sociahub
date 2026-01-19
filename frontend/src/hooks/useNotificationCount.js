// hooks/useNotificationCount.js
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const useNotificationCount = () => {
  const { data } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const [chatCount, setChatCount] = useState(0);

  const calculateChatCount = () => {
    const stored =
      JSON.parse(localStorage.getItem("chatNotifications")) || [];

    // 🔥 HITUNG TOTAL SEMUA PESAN
    const total = stored.reduce(
      (sum, n) => sum + (n.count || 1),
      0
    );

    setChatCount(total);
  };

  useEffect(() => {
    calculateChatCount();

    const handler = () => calculateChatCount();

    window.addEventListener("chat-notification", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("chat-notification", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const unreadIncoming = data?.incomingReqs?.length || 0;

  const unreadAccepted =
    data?.acceptedReqs?.filter(
      (n) => !localStorage.getItem(`notif-read-${n._id}`)
    ).length || 0;

  const total = unreadIncoming + unreadAccepted + chatCount;

  return total;
};

export default useNotificationCount;
