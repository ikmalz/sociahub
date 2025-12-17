import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
/**
 * CLIENT - Ambil employee yang diizinkan admin
 */
export const getAllowedEmployees = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Access denied" });
    }

    const employees = await User.find({
      role: "employee",
      isActive: true,
      approvalStatus: "approved",
      assignedClients: req.user._id,
    }).select("fullName expertise skills profilePic");

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CLIENT - Create project
 */
export const createProject = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res
        .status(403)
        .json({ message: "Only client can create project" });
    }

    const { title, description, employeeIds } = req.body;

    if (!title || !description || !employeeIds?.length) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validEmployees = await User.find({
      _id: { $in: employeeIds },
      role: "employee",
      assignedClients: req.user._id,
    });

    if (validEmployees.length !== employeeIds.length) {
      return res.status(400).json({
        message: "One or more employees are not allowed",
      });
    }

    const project = await Project.create({
      title,
      description,
      client: req.user._id,
      employees: employeeIds,
      createdBy: "client",
    });

    console.log("✅ Project created:", {
      title: project.title,
      client: project.client,
      employees: project.employees,
      employeeCount: project.employees.length,
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CLIENT / EMPLOYEE - Get my projects
 */
// Di project.controller.js, cek fungsi getMyProjects:
export const getMyProjects = async (req, res) => {
  try {
    let filter = {};

    console.log("🔍 User requesting projects:", {
      userId: req.user._id,
      role: req.user.role,
    });

    if (req.user.role === "client") {
      filter.client = req.user._id;
      console.log("👤 Client filter:", filter);
    }

    if (req.user.role === "employee") {
      filter.employees = req.user._id;
      console.log("👷 Employee filter:", filter);
    }

    const projects = await Project.find(filter)
      .populate("client", "fullName institutionName")
      .populate("employees", "fullName profilePic");

    console.log("📋 Found projects:", projects.length);
    console.log(
      "📋 Projects data:",
      projects.map((p) => ({
        id: p._id,
        title: p.title,
        employees: p.employees.map((e) => e._id),
      }))
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("❌ Error in getMyProjects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Di project.controller.js, tambahkan fungsi ini:
export const assignTaskToEmployee = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "employee") {
      return res.status(400).json({ message: "Invalid employee" });
    }

    task.assignedTo = employeeId;
    task.status = "in-progress";
    await task.save();

    res.status(200).json({
      success: true,
      message: "Task assigned to employee",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "fullName email institutionName")
      .populate("employees", "fullName email profilePic");

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN - Get project by ID
 */
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("client", "fullName email institutionName profilePic")
      .populate("employees", "fullName email profilePic skills expertise");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN - Update project
 */
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, employeeIds } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (employeeIds) project.employees = employeeIds;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN - Delete project
 */
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Hapus semua task terkait project
    await Task.deleteMany({ project: projectId });

    // Hapus project
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN - Create task
 */
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignedTo } = req.body;

    if (!projectId || !title) {
      return res
        .status(400)
        .json({ message: "Project ID and title are required" });
    }

    // Cek apakah project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Cek apakah assignedTo valid (jika ada)
    if (assignedTo) {
      const employee = await User.findById(assignedTo);
      if (!employee || employee.role !== "employee") {
        return res.status(400).json({ message: "Invalid employee assigned" });
      }
    }

    const task = await Task.create({
      project: projectId,
      title,
      description,
      assignedTo: assignedTo || null,
      createdBy: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN - Update task
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, progress, status, assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (progress !== undefined) task.progress = progress;
    if (status) task.status = status;

    // Update assignedTo jika ada
    if (assignedTo) {
      const employee = await User.findById(assignedTo);
      if (!employee || employee.role !== "employee") {
        return res.status(400).json({ message: "Invalid employee" });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();

    // Recalculate project progress
    if (progress !== undefined) {
      const tasks = await Task.find({ project: task.project });
      const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
      const avgProgress = Math.round(totalProgress / tasks.length);

      await Project.findByIdAndUpdate(task.project, {
        progress: avgProgress,
        status: avgProgress === 100 ? "completed" : "active",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (progress < 0 || progress > 100) {
      return res
        .status(400)
        .json({ message: "Progress must be between 0 and 100" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (userRole === "employee") {
      if (!project.employees.includes(userId)) {
        return res.status(403).json({
          message: "You are not assigned to this project",
        });
      }
    } else if (userRole === "client") {
      if (project.client.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "This is not your project",
        });
      }
    }

    // Update progress
    project.progress = progress;

    if (progress === 0) {
      project.status = "pending";
    } else if (progress < 100) {
      project.status = "active";
    } else {
      project.status = "completed";
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project progress updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};
