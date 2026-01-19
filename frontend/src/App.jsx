import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import { Toaster, toast } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import OnBoardingPage from "./pages/OnboardingPage.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import FriendsPage from "./pages/FriendsPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import PostDetailLayout from "./components/PostDetailLayout.jsx";
import MyPostsPage from "./pages/MyPostsPage.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import WaitingApproval from "./pages/WaitingApproval.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import NetworkPage from "./pages/NetworkPage.jsx";
import AdminAssignEmployeePage from "./pages/AdminAssignEmployeePage.jsx";
import AdminProgressPage from "./pages/AdminProgressPage.jsx";
import useChatNotifications from "./hooks/useChatNotifications.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  useChatNotifications();

  useEffect(() => {
    const handler = (e) => {
      const { senderName, text, senderImage } = e.detail;

      const isMobile = window.innerWidth < 640;

      toast.custom(
        (t) => (
          <div
            className={`
            transform transition-all duration-500 ease-out
            ${
              t.visible
                ? "translate-y-0 opacity-100"
                : isMobile
                  ? "translate-y-6 opacity-0"
                  : "-translate-y-6 opacity-0"
            }
            bg-white dark:bg-base-200 shadow-xl rounded-2xl p-3 sm:p-4 flex gap-3 items-start border border-base-300 w-[92vw] sm:min-w-[280px] sm:max-w-sm animate-pulse-once`}
          >
            {/* Avatar */}
            <div className="avatar flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-300 overflow-hidden">
                <img
                  src={senderImage || "/default-avatar.png"}
                  alt={senderName}
                  className="object-cover w-full h-full"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {senderName || "New message"}
              </p>

              <p className="text-xs opacity-80 mt-0.5 line-clamp-2">
                {text || "Sent you a message"}
              </p>

              <p className="text-[10px] opacity-50 mt-1">just now</p>
            </div>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-xs opacity-40 hover:opacity-80 transition px-1"
            >
              ✕
            </button>
          </div>
        ),
        {
          position: isMobile ? "bottom-center" : "top-center",
          duration: 4500,
        },
      );
    };

    window.addEventListener("chat-toast", handler);
    return () => window.removeEventListener("chat-toast", handler);
  }, []);

  if (isLoading) return <PageLoader />;

  const isAuthenticated = Boolean(authUser);
  const isApproved =
    authUser?.isActive && authUser?.approvalStatus === "approved";
  const isOnBoarded = authUser?.isOnBoarded;
  const isAdmin = authUser?.role === "admin";

  const ProtectedRoute = ({
    element,
    requireApproved = true,
    requireOnboarded = true,
    requireAdmin = false,
  }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (requireApproved && !isApproved) {
      return (
        <Navigate
          to="/waiting-approval"
          state={{
            email: authUser.email,
            fullName: authUser.fullName,
          }}
        />
      );
    }

    if (requireAdmin && !isAdmin) {
      return <Navigate to="/" />;
    }

    if (requireOnboarded && !isOnBoarded) {
      return <Navigate to="/onboarding" />;
    }

    return element;
  };

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate
                to={
                  isApproved
                    ? isOnBoarded
                      ? "/"
                      : "/onboarding"
                    : "/waiting-approval"
                }
              />
            )
          }
        />

        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate
                to={
                  isApproved
                    ? isOnBoarded
                      ? "/"
                      : "/onboarding"
                    : "/waiting-approval"
                }
              />
            )
          }
        />

        <Route path="/waiting-approval" element={<WaitingApproval />} />

        {/* ROOT ROUTE */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              }
            />
          }
        />

        {/* ONBOARDING ROUTE */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated && isApproved ? (
              !isOnBoarded ? (
                <OnBoardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : !isAuthenticated ? (
              <Navigate to="/login" />
            ) : !isApproved ? (
              <Navigate
                to="/waiting-approval"
                state={{
                  email: authUser.email,
                  fullName: authUser.fullName,
                }}
              />
            ) : null
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <NotificationsPage />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/call/:id"
          element={<ProtectedRoute element={<CallPage />} />}
        />

        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/admin/progress"
          element={
            <ProtectedRoute
              requireAdmin={true}
              element={
                <AdminLayout>
                  <AdminProgressPage />
                </AdminLayout>
              }
            />
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <PostsPage />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/my-posts"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <MyPostsPage />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute
              element={
                <PostDetailLayout>
                  <PostDetailPage />
                </PostDetailLayout>
              }
            />
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <UserProfilePage />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/network"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <NetworkPage />
                </Layout>
              }
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <OnBoardingPage profileMode={true} />
                </Layout>
              }
              requireOnboarded={false}
            />
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute
              element={
                <Layout showSidebar={true}>
                  <FriendsPage />
                </Layout>
              }
            />
          }
        />

        {/* ADMIN ROUTES - HARUS ADMIN */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              requireAdmin={true}
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
          }
        />

        <Route
          path="/admin/assign-employee"
          element={
            <ProtectedRoute
              requireAdmin={true}
              element={
                <AdminLayout>
                  <AdminAssignEmployeePage />
                </AdminLayout>
              }
            />
          }
        />

        {/* FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
