import { useState } from "react";
import { X, Users, FileText, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../lib/api";

const ProjectCreateModal = ({ isOpen, onClose, availableEmployees }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: createProjectMutation, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      resetForm();
      onClose();
      alert("Project request submitted successfully!");
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedEmployees([]);
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || selectedEmployees.length === 0) {
      alert("Please fill all fields and select at least one employee");
      return;
    }

    setIsSubmitting(true);
    createProjectMutation({
      title,
      description,
      employeeIds: selectedEmployees,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Request New Project</h2>
              <p className="text-sm opacity-60">
                Submit a project request to selected team members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Project Title */}
          <div className="mb-6">
            <label className="label">
              <span className="label-text font-semibold">Project Title</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Website Redesign, Mobile App Development"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="label">
              <span className="label-text font-semibold">Project Description</span>
            </label>
            <textarea
              placeholder="Describe your project requirements, goals, and timeline..."
              className="textarea textarea-bordered w-full min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="text-xs opacity-60 mt-1">
              Be specific about what you need
            </div>
          </div>

          {/* Select Employees */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Users className="size-4" />
                    Select Team Members
                  </span>
                </label>
                <p className="text-sm opacity-60">
                  Choose employees to work on this project
                </p>
              </div>
              <span className="badge badge-primary">
                {selectedEmployees.length} selected
              </span>
            </div>

            {availableEmployees.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-base-300 rounded-lg">
                <Users className="size-12 opacity-40 mx-auto mb-3" />
                <p className="font-medium mb-1">No team members available</p>
                <p className="text-sm opacity-60">
                  Contact admin to assign employees to your account
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedEmployees.includes(employee._id)
                        ? "border-primary bg-primary/5"
                        : "border-base-300 hover:border-primary/50"
                    }`}
                    onClick={() => handleEmployeeToggle(employee._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                          <img
                            src={employee.profilePic || "/default-avatar.png"}
                            alt={employee.fullName}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {employee.fullName}
                        </h4>
                        <p className="text-xs opacity-70">
                          {employee.expertise || "General"}
                        </p>
                        {employee.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {employee.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="badge badge-sm badge-outline"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedEmployees.includes(employee._id)
                          ? "bg-primary border-primary"
                          : "border-base-300"
                      }`}>
                        {selectedEmployees.includes(employee._id) && (
                          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-base-100"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isPending || selectedEmployees.length === 0}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Submit Project Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;