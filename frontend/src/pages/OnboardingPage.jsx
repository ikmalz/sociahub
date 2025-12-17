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
  Briefcase,
  Landmark,
} from "lucide-react";
import { DEPARTMENTS, POSITIONS, INSTITUTION_TYPES } from "../constant";

const OnBoardingPage = ({ profileMode = false }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const isClient = authUser?.role === "client";
  const isEmployee = authUser?.role === "employee";

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    phoneNumber: authUser?.phoneNumber || "",
    department: authUser?.department || "",
    position: authUser?.position || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    expertise: authUser?.expertise || "",

    institutionName: authUser?.institutionName || "",
    institutionType: authUser?.institutionType || "",
    projectInterests: authUser?.projectInterests || "",
    governmentLevel: authUser?.governmentLevel || "",

    employeeId: authUser?.employeeId || "",
    skills: authUser?.skills || "",
    companyName: authUser?.companyName || "",
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

    if (isClient && !formState.institutionName) {
      toast.error("Please enter your institution name");
      return;
    }

    if (isEmployee && !formState.department) {
      toast.error("Please select your department");
      return;
    }

    const dataToSend = {
      fullName: formState.fullName,
      email: formState.email,
      phoneNumber: formState.phoneNumber,
      bio: formState.bio || "",
      location: formState.location || "",
      profilePic: formState.profilePic || "",
      expertise: formState.expertise || "",
    };

    if (isClient) {
      dataToSend.institutionName = formState.institutionName;
      dataToSend.institutionType = formState.institutionType || "";
      dataToSend.projectInterests = formState.projectInterests || "";
      dataToSend.governmentLevel = formState.governmentLevel || "";
      dataToSend.position = formState.position || "";
      dataToSend.department = "";
    } else {
      dataToSend.employeeId = formState.employeeId || "";
      dataToSend.department = formState.department;
      dataToSend.position = formState.position;
      dataToSend.skills = formState.skills || "";
      dataToSend.companyName = formState.companyName || "";
    }

    console.log("Submitting data:", dataToSend);
    onboardingMutation(dataToSend);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          {/* Header dengan Role Indicator */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              {isClient ? (
                <Landmark className="size-8 text-primary" />
              ) : (
                <Briefcase className="size-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {isClient
                ? profileMode
                  ? "Edit Institution Profile"
                  : "Complete Your Profile"
                : profileMode
                ? "Edit Employee Profile"
                : "Complete Your Profile"}
            </h1>
            <p className="opacity-70 mt-2">
              {isClient
                ? "Set up your institution profile to start collaborating"
                : "Complete your profile to join the team"}
            </p>

            {/* Role Badge */}
            <div
              className={`badge ${
                isClient ? "badge-primary" : "badge-secondary"
              } mt-3 gap-2`}
            >
              {isClient ? (
                <>
                  <Landmark className="size-4" />
                  Government Client
                </>
              ) : (
                <>
                  <Briefcase className="size-4" />
                  Company Employee
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
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
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="btn btn-accent btn-sm"
              >
                <ShuffleIcon className="size-4 mr-2" />
                Random Avatar
              </button>
            </div>

            {/* Grid untuk Personal Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution Name (Client only) */}
              {isClient && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      <BuildingIcon className="inline size-4 mr-2" />
                      Institution Name
                    </span>
                    <span className="label-text-alt text-error">*Required</span>
                  </label>
                  <input
                    type="text"
                    value={formState.institutionName}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        institutionName: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                    placeholder="e.g., Ministry of Technology"
                    required={isClient}
                  />
                </div>
              )}

              {/* Employee ID (Employee only) */}
              {isEmployee && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Employee ID
                    </span>
                    <span className="label-text-alt opacity-70">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={formState.employeeId}
                    onChange={(e) =>
                      setFormState({ ...formState, employeeId: e.target.value })
                    }
                    className="input input-bordered w-full"
                    placeholder="EMP-00123"
                  />
                </div>
              )}

              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    {isClient ? "Contact Person Name" : "Full Name"}
                  </span>
                  <span className="label-text-alt text-error">*Required</span>
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({ ...formState, fullName: e.target.value })
                  }
                  className="input input-bordered w-full"
                  placeholder={
                    isClient ? "Your name as contact person" : "John Doe"
                  }
                  required
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    {isClient ? "Official Email" : "Email"}
                  </span>
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
                    placeholder={
                      isClient
                        ? "official@institution.gov.id"
                        : "john.doe@company.com"
                    }
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
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

              {/* Institution Type (Client only) */}
              {isClient && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Institution Type
                    </span>
                  </label>
                  <select
                    value={formState.institutionType}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        institutionType: e.target.value,
                      })
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="">Select institution type</option>
                    {INSTITUTION_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Department (Employee only) */}
              {isEmployee && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Department</span>
                    <span className="label-text-alt text-error">*Required</span>
                  </label>
                  <select
                    value={formState.department}
                    onChange={(e) =>
                      setFormState({ ...formState, department: e.target.value })
                    }
                    className="select select-bordered w-full"
                    required={isEmployee}
                  >
                    <option value="">Select your department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option value={dept} key={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Position */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    {isClient ? "Your Position" : "Position"}
                  </span>
                  {isEmployee && (
                    <span className="label-text-alt text-error">*Required</span>
                  )}
                </label>
                <select
                  value={formState.position}
                  onChange={(e) =>
                    setFormState({ ...formState, position: e.target.value })
                  }
                  className="select select-bordered w-full"
                  required={isEmployee}
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

            {/* Location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  <MapPinIcon className="inline size-4 mr-2" />
                  {isClient ? "Institution Location" : "Work Location"}
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
                  placeholder={
                    isClient
                      ? "Main office address"
                      : "Office location or Remote"
                  }
                />
              </div>
            </div>

            {/* Project Interests (Client only) */}
            {isClient && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Project Interests / Needs
                  </span>
                </label>
                <textarea
                  value={formState.projectInterests}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      projectInterests: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered h-24"
                  placeholder="Describe your project needs or technology interests..."
                  rows="3"
                />
              </div>
            )}

            {/* Skills & Expertise (Employee only) */}
            {isEmployee && (
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
                  className="textarea textarea-bordered h-24"
                  placeholder="List your skills and expertise..."
                  rows="3"
                />
              </div>
            )}

            {/* Bio */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  {isClient ? "Additional Information" : "Professional Bio"}
                </span>
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder={
                  isClient
                    ? "Any additional information about your institution..."
                    : "Describe your professional background..."
                }
                rows="3"
              />
            </div>

            {/* Submit Button */}
            <button
              className="btn btn-primary w-full mt-4"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  {profileMode ? "Save Changes" : "Complete Profile"}
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
