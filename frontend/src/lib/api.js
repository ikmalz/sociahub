import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getUserById = async (userId) => {
  const res = await axiosInstance.get(`/users/${userId}`);
  return res.data;
};

export async function getAllUsers() {
  const response = await axiosInstance.get("/users/all");
  return response.data;
}

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// ========= POSTS API ========= //
export const getMyProjects = async () => {
  try {
    const res = await axiosInstance.get("/projects/my-projects");
    return res.data.projects || [];
  } catch (error) {
    console.error("Error fetching my projects:", error);
    return [];
  }
};

export const getPosts = async () => {
  try {
    const res = await axiosInstance.get("/posts");
    return res.data.posts || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const assignEmployeeToClient = async ({ clientId, employeeIds }) => {
  const res = await axiosInstance.post("/admin/assign-employee", {
    clientId,
    employeeIds,
  });
  return res.data;
};

export const getAllowedEmployees = async () => {
  try {
    const res = await axiosInstance.get("/projects/allowed-employees");
    return res.data.employees || [];
  } catch (error) {
    console.error("Error fetching allowed employees:", error);
    return [];
  }
};

export const updateProjectProgress = async (projectId, progress) => {
  try {
    const res = await axiosInstance.put(`/projects/${projectId}/progress`, {
      progress,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating project progress:", error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const res = await axiosInstance.post("/projects", projectData);
    return res.data;
  } catch (error) {
    console.error(
      "Error creating project:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export async function createPost(postData) {
  try {
    const response = await axiosInstance.post("/posts", postData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ Post created response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating post:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function getPostById(id) {
  try {
    const res = await axiosInstance.get(`/posts/${id}`);
    return res.data;
  } catch (error) {
    console.error("getPostById error:", error);
    throw error;
  }
}

export async function deletePost(id) {
  try {
    const res = await axiosInstance.delete(`/posts/${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Delete API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function likePost(postId) {
  const res = await axiosInstance.put(`/posts/like/${postId}`);
  return res.data;
}

export const fetchFriends = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/friends`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json();
};

export async function getNotifications() {
  const response = await axiosInstance.get("/notifications");
  return response.data;
}

export async function updatePost(id, postData) {
  try {
    const response = await axiosInstance.put(`/posts/${id}`, postData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ Post updated response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating post:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function createStory(storyData) {
  try {
    const response = await axiosInstance.post("/stories", storyData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ Story created response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating story:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function getStoryViewers(storyId) {
  const res = await axiosInstance.get(`/stories/${storyId}/viewers`);
  return res.data;
}

export async function getTimelineStories() {
  try {
    const res = await axiosInstance.get("/stories");
    return res.data;
  } catch (error) {
    console.error("getTimelineStories error:", error);
    return { success: false, stories: [] };
  }
}

export async function getMyStories() {
  try {
    const res = await axiosInstance.get("/stories/my");
    return res.data;
  } catch (error) {
    console.error("getMyStories error:", error);
    return { success: false, stories: [] };
  }
}

export async function getStory(id) {
  try {
    const res = await axiosInstance.get(`/stories/${id}`);
    return res.data;
  } catch (error) {
    console.error("getStory error:", error);
    return null;
  }
}

export async function deleteStory(id) {
  try {
    const res = await axiosInstance.delete(`/stories/${id}`);
    return res.data;
  } catch (error) {
    console.error("deleteStory error:", error);
    throw error;
  }
}

export async function markStoryAsViewed(id) {
  try {
    const res = await axiosInstance.post(`/stories/${id}/view`);
    return res.data;
  } catch (error) {
    console.error("markStoryAsViewed error:", error);
    return null;
  }
}

export const updateProfile = async (userData) => {
  const response = await axiosInstance.put("/auth/update-profile", userData);
  return response.data;
};

export async function getMyPosts() {
  try {
    const res = await axiosInstance.get("/posts/me");
    return res.data;
  } catch (error) {
    console.error("getMyPosts error:", error);
    return [];
  }
}

// ========= ADMIN - CLIENTS ========= //
export const getClients = async () => {
  const res = await axiosInstance.get("/admin/clients");
  return res.data.clients;
};

export const getEmployees = async () => {
  const res = await axiosInstance.get("/admin/employees");
  return res.data.employees;
};

export const getClientContacts = async () => {
  try {
    const res = await axiosInstance.get("/users/client-contacts");
    return res.data.users || [];
  } catch (error) {
    console.error("Error fetching client contacts:", error);
    return [];
  }
};

export const getProjects = async () => {
  try {
    const res = await axiosInstance.get("/projects");
    return res.data.projects || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export async function getPendingUsers() {
  try {
    console.log("🔄 Fetching pending users from API...");
    const response = await axiosInstance.get("/admin/pending-users");
    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching pending users:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function approveUser(userId, role = "client") {
  const response = await axiosInstance.put(`/admin/approve/${userId}`, {
    role,
  });
  return response.data;
}

export async function rejectUser(userId) {
  const response = await axiosInstance.put(`/admin/reject/${userId}`);
  return response.data;
}

// HAPUS YANG INI KARENA SUDAH ADA DI ATAS
// export const getPostById = async (postId) => {
//   const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
//     credentials: "include",
//   });
//   if (!response.ok) throw new Error("Failed to fetch post");
//   return response.json();
// };
