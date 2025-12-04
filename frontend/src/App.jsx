import React from "react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import OnBoardingPage from "./pages/OnboardingPage.jsx";
import useAuthUser from "./hooks/useAuthUser.js";

const App = () => {
  // tanstack query crash course

  const { isLoading, authUser } = useAuthUser();

  const isAutheticanted = Boolean(authUser);
  const isOnBoarded = authUser?.isOnBoarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen " data-theme="night">
      <Routes>
        <Route
          path="/"
          element={
            isAutheticanted && isOnBoarded ? (
              <HomePage />
            ) : (
              <Navigate to={!isAutheticanted ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={!isAutheticanted ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!isAutheticanted ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={
            isAutheticanted ? <NotificationsPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/call"
          element={isAutheticanted ? <CallPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isAutheticanted ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/onboarding"
          element={
            isAutheticanted ? <OnBoardingPage /> : <Navigate to="/login" />
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
