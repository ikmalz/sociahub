import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useMemo } from "react";
import { getPosts } from "../lib/api";
import PostCard from "../components/PostCard";

const PostDetailPage = () => {
  const { postId } = useParams();
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [posts]
  );

  const startIndex = useMemo(
    () => sortedPosts.findIndex((p) => p._id === postId),
    [sortedPosts, postId]
  );

  useEffect(() => {
    if (!containerRef.current || startIndex < 0) return;

    containerRef.current.scrollTo({
      top: startIndex * window.innerHeight,
      behavior: "instant",
    });

    setActiveIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const index = Math.round(el.scrollTop / window.innerHeight);
      setActiveIndex(index);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] bg-base-300/30 overflow-y-auto snap-y snap-mandatory overscroll-none"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <span className="loading loading-spinner loading-lg text-white" />
        </div>
      ) : (
        sortedPosts.map((post, index) => (
          <div
            key={post._id}
            className="h-[100dvh] snap-start flex items-center justify-center"
          >
            <PostCard
              post={post}
              fullscreen
              isActive={index === activeIndex}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default PostDetailPage;
