export function setupStorySocket(io) {
  io.on("connection", (socket) => {
    console.log("New socket connection for stories:", socket.id);

    socket.on("join-user-room", (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on("story-created", (story) => {
      io.to(`user-${story.user._id}`).emit("new-story", story);
    });

    socket.on("story-viewed", (data) => {
      io.to(`user-${data.storyUserId}`).emit("story-view-update", data);
    });
  });
}