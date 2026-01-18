import React, { useState, useEffect } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import useLogin from "../hooks/useLogin";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isPending, error, loginMutation } = useLogin();

  // Tampilkan pesan jika ada dari state (misalnya dari signup)
  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message, {
        icon: location.state.message.includes("approved") ? "✅" : "⏳",
        duration: 5000,
      });
    }
  }, [location]);

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary tracking-wider">
              Sociahub
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>
                {error.response?.data?.message?.includes("approval")
                  ? "Your account is pending admin approval. Please wait."
                  : error.response?.data?.message || "Login failed. Please try again."}
              </span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">
                    Sign in to your account to continue your languange journey
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="tes@gmail.com"
                      className="input input-bordered w-full"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="******"
                      className="input input-bordered w-full"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-primary hover:underline"
                      >
                        Create One
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
              <p className="text-sm text-center">
                <span className="font-semibold">Note:</span> New accounts require admin approval before login.
                <br />
                <span className="text-xs opacity-70">
                  You will be redirected to a waiting page if your account is pending.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/ip.png"
                alt="Languange connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with languange partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversation, make friends, and improve your languange
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;