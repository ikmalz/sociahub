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

export const getAllProjects = async () => {
  try {
    console.log("🔄 [API] Fetching all projects...");
    
    try {
      const adminRes = await axiosInstance.get("/admin/projects");
      console.log("✅ Admin endpoint response:", {
        success: adminRes.data?.success,
        count: adminRes.data?.projects?.length || 0
      });
      
      if (adminRes.data?.success && Array.isArray(adminRes.data.projects)) {
        return adminRes.data.projects;
      }
    } catch (adminError) {
      console.log("⚠️ Admin endpoint failed, trying regular endpoint...");
    }
    
    const res = await axiosInstance.get("/projects");
    console.log("📊 Regular endpoint response:", {
      data: res.data,
      hasProjects: !!res.data?.projects,
      count: res.data?.projects?.length || 0
    });
    
    if (res.data && res.data.success !== undefined) {
      return res.data.projects || [];
    } else if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && Array.isArray(res.data.projects)) {
      return res.data.projects;
    }
    
    console.warn("⚠️ Unexpected response structure:", res.data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching all projects:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

export const getAdminAllProjects = async () => {
  try {
    console.log("🔄 [API] Fetching admin projects...");
    const res = await axiosInstance.get("/admin/projects");
    
    console.log("✅ Admin projects response:", {
      success: res.data?.success,
      count: res.data?.count,
      projectsLength: res.data?.projects?.length || 0
    });
    
    if (res.data?.success && Array.isArray(res.data.projects)) {
      console.log(`✅ Found ${res.data.projects.length} projects for admin`);
      return res.data.projects;
    }
    
    if (res.data?.projects) {
      return res.data.projects;
    }
    
    return [];
  } catch (error) {
    console.error("❌ Error in getAdminAllProjects:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    try {
      const fallbackRes = await axiosInstance.get("/projects");
      if (fallbackRes.data?.projects) {
        return fallbackRes.data.projects;
      }
      if (Array.isArray(fallbackRes.data)) {
        return fallbackRes.data;
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message);
    }
    
    return [];
  }
};

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
    console.log("📊 API Response for /posts:", res.data);
    
    if (Array.isArray(res.data)) {
      console.log(`✅ Found ${res.data.length} posts`);
      return res.data;
    }
    
    if (res.data && Array.isArray(res.data.posts)) {
      console.log(`✅ Found ${res.data.posts.length} posts in posts property`);
      return res.data.posts;
    }
    
    console.warn("⚠️ Unexpected response structure:", res.data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    console.error("Error response:", error.response?.data);
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

// Project Notes API
export const addProjectNote = async (projectId, note) => {
  try {
    const res = await axiosInstance.post(`/projects/${projectId}/notes`, { note });
    return res.data;
  } catch (error) {
    console.error("Error adding project note:", error);
    throw error;
  }
};

export const getProjectNotes = async (projectId) => {
  try {
    const res = await axiosInstance.get(`/projects/${projectId}/notes`);
    return res.data;
  } catch (error) {
    console.error("Error fetching project notes:", error);
    throw error;
  }
};

export const addTaskNote = async (taskId, note) => {
  try {
    const res = await axiosInstance.post(`/projects/tasks/${taskId}/notes`, { note });
    return res.data;
  } catch (error) {
    console.error("Error adding task note:", error);
    throw error;
  }
};

export const getTaskNotes = async (taskId) => {
  try {
    const res = await axiosInstance.get(`/projects/tasks/${taskId}/notes`);
    return res.data;
  } catch (error) {
    console.error("Error fetching task notes:", error);
    throw error;
  }
};

export const deleteProjectNote = async (projectId, noteId) => {
  try {
    const res = await axiosInstance.delete(`/projects/${projectId}/notes/${noteId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting project note:", error);
    throw error;
  }
};

export const markProjectAsComplete = async (projectId) => {
  try {
    const res = await axiosInstance.patch(`/projects/${projectId}/complete`);
    return res.data;
  } catch (error) {
    console.error("Error marking project as complete:", error);
    throw error;
  }
};

export const updateProjectStatus = async (projectId, status) => {
  try {
    const res = await axiosInstance.put(`/projects/${projectId}/progress`, {
      progress: status === "completed" ? 100 : 0,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};

export const checkApprovalStatus = async (email) => {
  try {
    const res = await axiosInstance.get(
      `/auth/check-approval`,
      { params: { email } }
    );

    return res.data;
  } catch (error) {
    console.error("❌ Error checking approval status:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// HAPUS YANG INI KARENA SUDAH ADA DI ATAS
// export const getPostById = async (postId) => {
//   const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
//     credentials: "include",
//   });
//   if (!response.ok) throw new Error("Failed to fetch post");
//   return response.json();
// };
