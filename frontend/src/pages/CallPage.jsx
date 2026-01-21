import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [isConnecting, setIsConnecting] = useState(true);

  const clientRef = useRef(null);
  const callRef = useRef(null);
  const hasJoinedRef = useRef(false);
  let globalCallLock = false;

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser?._id || !callId) return;

      const sessionKey = `joined-call-${callId}-${authUser._id}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log("Already joined this call in this session");
        setIsConnecting(false);
        return;
      }

      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: String(authUser._id),
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: false });

        console.log("Joined call successfully");

        clientRef.current = videoClient;
        callRef.current = callInstance;

        sessionStorage.setItem(sessionKey, "true");
      } catch (error) {
        console.log("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
        hasJoinedRef.current = false;
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      console.log("Cleaning up call...");

      hasJoinedRef.current = false;

      const sessionKey = `joined-call-${callId}-${authUser?._id}`;
      sessionStorage.removeItem(sessionKey);

      if (callRef.current) {
        callRef.current.leave();
        callRef.current = null;
      }

      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
      }
    };
  }, [tokenData?.token, authUser?._id, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {clientRef.current && callRef.current ? (
          <StreamVideo client={clientRef.current}>
            <StreamCall call={callRef.current}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    try {
      if (window.opener) {
        window.opener.postMessage({ type: "CALL_ENDED" }, "*");
      }

      window.close();

      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err) {
      console.log("Auto-close failed:", err);
      navigate("/");
    }

    return null;
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
