import { useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "./useAuthUser";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function useChatNotifications() {
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    let client;
    let isMounted = true;

    const playSound = () => {
      const audio = new Audio("/notif.mp3");
      audio.play().catch(() => {});
    };

    const init = async () => {
      client = StreamChat.getInstance(STREAM_API_KEY);

      if (!client.userID) {
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
      }

      const channels = await client.queryChannels({
        members: { $in: [authUser._id] },
      });

      channels.forEach((ch) => ch.watch());

      const handleNewMessage = (event) => {
        if (!isMounted) return;

        const message = event.message;
        const senderId = message.user?.id;
        const channelId = event.channel_id;

        if (!senderId || senderId === authUser._id) return;

        // 🔕 MUTE CHECK
        const muted = JSON.parse(localStorage.getItem("mutedChannels")) || [];
        if (muted.includes(channelId)) return;

        const existing =
          JSON.parse(localStorage.getItem("chatNotifications")) || [];

        const index = existing.findIndex(
          (n) => n.senderId === senderId && n.channelId === channelId
        );

        let updated;

        if (index !== -1) {
          updated = [...existing];
          updated[index] = {
            ...updated[index],
            count: updated[index].count + 1,
            lastMessage: message.text,
            createdAt: message.created_at,
          };
        } else {
          updated = [
            {
              id: `${senderId}-${channelId}`,
              channelId,
              senderId,
              senderName: message.user?.name,
              senderImage: message.user?.image,
              lastMessage: message.text,
              count: 1,
              createdAt: message.created_at,
            },
            ...existing,
          ];
        }

        localStorage.setItem("chatNotifications", JSON.stringify(updated));
        window.dispatchEvent(new Event("chat-notification"));
        playSound();

        window.dispatchEvent(
          new CustomEvent("chat-toast", {
            detail: {
              senderName: message.user?.name,
              text: message.text,
              senderImage: message.user?.image,
            },
          })
        );
      };

      client.on("message.new", handleNewMessage);

      return () => {
        client.off("message.new", handleNewMessage);
      };
    };

    init();

    return () => {
      isMounted = false;
      if (client) client.disconnectUser();
    };
  }, [authUser, tokenData]);
}
