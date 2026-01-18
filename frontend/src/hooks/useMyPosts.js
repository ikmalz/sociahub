import { useQuery } from "@tanstack/react-query";
import { getMyPosts } from "../lib/api";

const useMyPosts = () => {
  return useQuery({
    queryKey: ["my-posts"],
    queryFn: getMyPosts,
  });
};

export default useMyPosts;
