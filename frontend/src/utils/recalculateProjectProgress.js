import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const recalculateProjectProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });

  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }

  const total = tasks.reduce((sum, t) => sum + t.progress, 0);
  const avg = Math.round(total / tasks.length);

  await Project.findByIdAndUpdate(projectId, {
    progress: avg,
    status: avg === 100 ? "completed" : "active",
  });
};
