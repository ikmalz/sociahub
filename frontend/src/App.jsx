// App.jsx - sudah benar seperti yang Anda berikan
import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PostsPage from "./pages/PostsPage.jsx"; // Pastikan import ini benar
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

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAutheticanted = Boolean(authUser);
  const isOnBoarded = authUser?.isOnBoarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen " data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAutheticanted && isOnBoarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAutheticanted ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnBoarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAutheticanted ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnBoarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAutheticanted && isOnBoarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAutheticanted && isOnBoarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/chat/:id"
          element={
            isAutheticanted && isOnBoarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            isAutheticanted ? (
              !isOnBoarded ? (
                <OnBoardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAutheticanted ? (
              <Layout showSidebar={true}>
                <OnBoardingPage profileMode={true} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/friends"
          element={
            isAutheticanted && isOnBoarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/post/:postId"
          element={
            isAutheticanted && isOnBoarded ? (
              <PostDetailLayout>
                <PostDetailPage />
              </PostDetailLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ROUTE UNTUK VIEW ALL POSTS */}
        <Route
          path="/posts"
          element={
            isAutheticanted && isOnBoarded ? (
              <Layout showSidebar={true}>
                <PostsPage />
              </Layout>
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/my-posts"
          element={
            isAutheticanted && isOnBoarded ? (
              <Layout showSidebar={true}>
                <MyPostsPage />
              </Layout>
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
