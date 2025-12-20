import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

// ============================
// CLIENT FUNCTIONS
// ============================

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
 * CLIENT - Create project (hanya client)
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
 * Get my projects (client & employee)
 */
export const getMyProjects = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "client") {
      filter.client = req.user._id;
    } else if (req.user.role === "employee") {
      filter.employees = req.user._id;
    }

    const projects = await Project.find(filter)
      .populate("client", "fullName institutionName profilePic")
      .populate("employees", "fullName profilePic")
      .populate({
        path: "notes.user",
        select: "fullName profilePic role",
      });

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
/**
 * Update project progress (employee bisa update, client juga bisa lihat)
 */
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

/**
 * Mark project as completed
 */
export const markProjectAsCompleted = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (userRole === "client") {
      if (project.client.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "This is not your project",
        });
      }
    } else if (userRole === "employee") {
      if (!project.employees.includes(userId)) {
        return res.status(403).json({
          message: "You are not assigned to this project",
        });
      }
    }

    project.status = "completed";
    project.progress = 100;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project marked as completed",
      project,
    });
  } catch (error) {
    console.error("Error marking project as completed:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * ADMIN - Get all projects
 */
export const getProjects = async (req, res) => {
  try {
    console.log("🔄 [GET /projects] Called by:", {
      userId: req.user._id,
      role: req.user.role,
      email: req.user.email
    });

    let filter = {};

    if (req.user.role === "admin") {
      console.log("👑 Admin accessing all projects");
    } 
    else if (req.user.role === "client") {
      filter.client = req.user._id;
      console.log("🏢 Client accessing their projects");
    }
    else if (req.user.role === "employee") {
      filter.employees = req.user._id;
      console.log("👷 Employee accessing assigned projects");
    }
    else {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const projects = await Project.find(filter)
      .populate("client", "fullName institutionName profilePic email phone")
      .populate("employees", "fullName profilePic department position skills expertise")
      .populate({
        path: "notes.user",
        select: "fullName profilePic role",
      })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${projects.length} projects for ${req.user.role}`);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("❌ Error in getProjects:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    await Task.deleteMany({ project: projectId });

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

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

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
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (progress !== undefined) task.progress = progress;
    if (status) task.status = status;

    if (assignedTo) {
      const employee = await User.findById(assignedTo);
      if (!employee || employee.role !== "employee") {
        return res.status(400).json({ message: "Invalid employee" });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();

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

/**
 * ADMIN - Assign task to employee
 */
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

// ============================
// NOTES FUNCTIONS (SIMPLE - Instagram Style)
// ============================

/**
 * Add note to project (like Instagram comment)
 */
export const addProjectNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { note } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        message: "Note cannot be empty",
      });
    }

    if (note.length > 500) {
      return res.status(400).json({
        message: "Note is too long (max 500 characters)",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check access
    const hasAccess =
      project.client.toString() === userId.toString() ||
      project.employees.some((emp) => emp.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        message: "You don't have access to this project",
      });
    }

    // Determine note type based on role
    let noteType = "client_note";
    if (userRole === "employee") {
      noteType = "employee_note";
    }

    // Add note
    const newNote = {
      user: userId,
      note: note.trim(),
      type: noteType,
    };

    project.notes.push(newNote);
    
    // Update lastNote for preview
    project.lastNote = {
      user: userId,
      note: note.trim(),
      createdAt: new Date(),
    };

    await project.save();

    // Populate user info
    const populatedNote = {
      ...newNote,
      user: await User.findById(userId).select("fullName profilePic role"),
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      note: populatedNote,
    });
  } catch (error) {
    console.error("Error adding project note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get project notes (like Instagram comments)
 */
export const getProjectNotes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId)
      .populate({
        path: "notes.user",
        select: "fullName profilePic role",
      })
      .populate({
        path: "lastNote.user",
        select: "fullName profilePic role",
      });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check access
    const hasAccess =
      project.client.toString() === userId.toString() ||
      project.employees.some((emp) => emp.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      notes: project.notes,
      lastNote: project.lastNote,
      count: project.notes.length,
    });
  } catch (error) {
    console.error("Error getting project notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add note to task
 */
export const addTaskNote = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { note } = req.body;
    const userId = req.user._id;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        message: "Note cannot be empty",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access to project
    const project = await Project.findById(task.project);
    const hasAccess =
      project.client.toString() === userId.toString() ||
      project.employees.some((emp) => emp.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Add note to task
    task.notes.push({
      user: userId,
      note: note.trim(),
    });

    await task.save();

    // Populate user info
    const populatedNote = {
      ...task.notes[task.notes.length - 1].toObject(),
      user: await User.findById(userId).select("fullName profilePic role"),
    };

    res.status(201).json({
      success: true,
      message: "Note added to task",
      note: populatedNote,
    });
  } catch (error) {
    console.error("Error adding task note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get task notes
 */
export const getTaskNotes = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId)
      .populate({
        path: "notes.user",
        select: "fullName profilePic role",
      })
      .populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access
    const project = task.project;
    const hasAccess =
      project.client.toString() === userId.toString() ||
      project.employees.some((emp) => emp.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      notes: task.notes,
      count: task.notes.length,
    });
  } catch (error) {
    console.error("Error getting task notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all projects (no auth, for admin maybe)
 */
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("client", "fullName email institutionName")
      .populate("employees", "fullName email department position")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error in getAllProjects controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteProjectNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const hasAccess =
      project.client.toString() === userId.toString() ||
      project.employees.some((emp) => emp.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        message: "You don't have access to this project",
      });
    }

    const noteIndex = project.notes.findIndex(
      (note) => note._id.toString() === noteId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: "Note not found" });
    }

    const note = project.notes[noteIndex];

    const isNoteOwner = note.user.toString() === userId.toString();
    const isClient = project.client.toString() === userId.toString();

    if (!isNoteOwner && !isClient) {
      return res.status(403).json({
        message: "You can only delete your own notes",
      });
    }

    project.notes.splice(noteIndex, 1);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project note:", error);
    res.status(500).json({ message: "Server error" });
  }
};