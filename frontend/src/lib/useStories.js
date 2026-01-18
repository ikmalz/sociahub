import { useQuery } from "@tanstack/react-query";
import { getTimelineStories, getMyStories } from "../lib/api";

export const useTimelineStories = () => {
  return useQuery({
    queryKey: ["stories"],
    queryFn: getTimelineStories,
    refetchInterval: 30000, 
  });
};

export const useMyStories = () => {
  return useQuery({
    queryKey: ["my-stories"],
    queryFn: getMyStories,
  });
};