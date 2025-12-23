import React from "react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import { Toaster } from "react-hot-toast";
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

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

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
