import { useState } from "react";
import { TrendingUp, Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectProgress } from "../lib/api";

const ProjectProgressUpdate = ({ project }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [progress, setProgress] = useState(project.progress || 0);
  const queryClient = useQueryClient();

  const { mutate: updateProgress, isPending } = useMutation({
    mutationFn: () => updateProjectProgress(project._id, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      setShowUpdateModal(false);
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
      alert("Failed to update progress");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (progress < 0 || progress > 100) {
      alert("Progress must be between 0 and 100");
      return;
    }
    updateProgress();
  };

  return (
    <>
      {/* Progress Display & Update Button */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <span className="text-xs font-medium">Progress</span>
          </div>
          <button
            onClick={() => setShowUpdateModal(true)}
            className="btn btn-xs btn-outline btn-primary"
            disabled={isPending}
          >
            Update
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <progress
            className="progress progress-primary flex-1"
            value={project.progress || 0}
            max="100"
          ></progress>
          <span className="text-sm font-semibold min-w-10 text-right">
            {project.progress || 0}%
          </span>
        </div>
      </div>

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Update Project Progress</h3>
              <p className="text-sm opacity-70 mb-4">
                Update progress for: <strong>{project.title}</strong>
              </p>

              <form onSubmit={handleSubmit}>
                {/* Progress Input */}
                <div className="mb-6">
                  <label className="label">
                    <span className="label-text">Progress Percentage</span>
                    <span className="label-text-alt">{progress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="range range-primary w-full"
                  />
                  <div className="flex justify-between text-xs px-2 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  
                  <div className="flex items-center justify-center mt-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setProgress(value);
                        }
                      }}
                      className="input input-bordered w-24 text-center"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>

                {/* Status based on progress */}
                <div className="mb-6 p-3 bg-base-200 rounded-lg">
                  <p className="text-sm font-medium mb-1">Status:</p>
                  <div className="flex items-center gap-2">
                    <div className={`badge ${
                      progress === 0 ? 'badge-info' :
                      progress < 100 ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {progress === 0 ? 'Not Started' :
                       progress < 100 ? 'In Progress' :
                       'Completed'}
                    </div>
                    <span className="text-xs opacity-70">
                      {progress === 100 ? 'Project will be marked as completed' :
                       progress >= 75 ? 'Almost done!' :
                       progress >= 50 ? 'Halfway there!' :
                       'Getting started'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="btn btn-ghost flex-1"
                    disabled={isPending}
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save Progress
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectProgressUpdate;