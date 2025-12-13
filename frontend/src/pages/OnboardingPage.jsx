import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding, updateProfile } from "../lib/api";
import {
  CameraIcon,
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  BuildingIcon,
  BriefcaseIcon,
  MailIcon,
  PhoneIcon,
  GlobeIcon,
} from "lucide-react";
import { DEPARTMENTS, POSITIONS } from "../constant";

const OnBoardingPage = ({ profileMode = false }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    phoneNumber: authUser?.phoneNumber || "",
    department: authUser?.department || "",
    position: authUser?.position || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    skills: authUser?.skills || [],
    expertise: authUser?.expertise || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: (data) =>
      profileMode ? updateProfile(data) : completeOnboarding(data),
    onSuccess: () => {
      toast.success(
        profileMode ? "Profile updated!" : "Profile onboarded successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    const diceBearAvatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`;

    setFormState({ ...formState, profilePic: diceBearAvatar });
    toast.success("Random avatar generated!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi tanpa employeeId
    if (!formState.department) {
      toast.error("Please select your department");
      return;
    }
    if (!formState.position) {
      toast.error("Please select your position");
      return;
    }

    onboardingMutation(formState);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {profileMode ? "Edit Your Profile" : "Welcome to Company Hub"}
            </h1>
            <p className="opacity-70 mt-2">
              {profileMode
                ? "Update your professional profile"
                : "Complete your employee profile to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTENT */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden border-4 border-base-100 shadow-lg">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://api.dicebear.com/7.x/avataaars/png?seed=default";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent btn-sm"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Random Avatar
                </button>
              </div>
            </div>

            {/* Grid untuk data personal - TANPA EMPLOYEE ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FULL NAME */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({ ...formState, fullName: e.target.value })
                  }
                  className="input input-bordered w-full"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="relative">
                  <MailIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-50" />
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="input input-bordered w-full pl-10"
                    placeholder="john.doe@company.com"
                    required
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Phone Number</span>
                  <span className="label-text-alt text-error">*Required</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-50" />
                  <input
                    type="tel"
                    value={formState.phoneNumber}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        phoneNumber: e.target.value.trim(),
                      })
                    }
                    className="input input-bordered w-full pl-10"
                    placeholder="+62 812-3456-7890"
                    required
                  />
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Department</span>
                </label>
                <select
                  value={formState.department}
                  onChange={(e) =>
                    setFormState({ ...formState, department: e.target.value })
                  }
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option value={dept} key={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* POSITION */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Position</span>
                </label>
                <select
                  value={formState.position}
                  onChange={(e) =>
                    setFormState({ ...formState, position: e.target.value })
                  }
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select your position</option>
                  {POSITIONS.map((pos) => (
                    <option value={pos} key={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  <GlobeIcon className="inline size-4 mr-2" />
                  Office Location
                </span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-50" />
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="Head Office - Floor 10, Jakarta"
                />
              </div>
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Professional Bio
                </span>
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder="Describe your role, expertise, and professional interests..."
                rows="4"
              />
            </div>

            {/* SKILLS/EXPERTISE */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  <BriefcaseIcon className="inline size-4 mr-2" />
                  Skills & Expertise
                </span>
              </label>
              <textarea
                value={formState.expertise}
                onChange={(e) =>
                  setFormState({ ...formState, expertise: e.target.value })
                }
                className="textarea textarea-bordered"
                placeholder="List your skills, technologies, or areas of expertise..."
                rows="3"
              />
              <label className="label">
                <span className="label-text-alt opacity-70">
                  Separate with commas (e.g., JavaScript, Project Management,
                  Data Analysis)
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="btn btn-primary w-full mt-4"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  {profileMode ? "Save Changes" : "Complete Profile Setup"}
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  {profileMode ? "Saving..." : "Setting up..."}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingPage;