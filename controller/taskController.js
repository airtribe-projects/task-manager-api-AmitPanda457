let nextTaskId = 1;

const allowedPriorities = ["low", "medium", "high"];
const requiredFields = ["title", "description", "completed", "priority"];
const maxTitleLength = 100;
const maxDescriptionLength = 500;
const getCurrentTimestamp = () => new Date().toISOString();

const initialTasks = [
  {
    id: 1,
    title: "Create a new project",
    description: "Create a new project using Magic",
    completed: false,
    priority: "medium",
    createdAt: getCurrentTimestamp(),
  },
];

const tasks = structuredClone(initialTasks);
nextTaskId = tasks.length + 1;

const validateTaskPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return ["Request body must be a JSON object"];
  }

  const errors = [];

  for (const field of requiredFields) {
    if (!(field in payload)) {
      errors.push(`${field} is required`);
    }
  }

  if (typeof payload.title !== "string") {
    errors.push("title must be a string");
  } else if (!payload.title.trim()) {
    errors.push("title cannot be empty");
  } else if (payload.title.trim().length > maxTitleLength) {
    errors.push(`title cannot exceed ${maxTitleLength} characters`);
  }

  if (typeof payload.description !== "string") {
    errors.push("description must be a string");
  } else if (!payload.description.trim()) {
    errors.push("description cannot be empty");
  } else if (payload.description.trim().length > maxDescriptionLength) {
    errors.push(`description cannot exceed ${maxDescriptionLength} characters`);
  }

  if (typeof payload.completed !== "boolean") {
    errors.push("completed must be a boolean");
  }

  if (typeof payload.priority !== "string") {
    errors.push("priority must be a string");
  } else if (!allowedPriorities.includes(payload.priority.trim().toLowerCase())) {
    errors.push("priority must be one of: low, medium, high");
  }

  return errors;
};

const getTaskId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getPriority = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const buildTaskData = (body) => ({
  title: body.title.trim(),
  description: body.description.trim(),
  completed: body.completed,
  priority: getPriority(body.priority),
});

const getNextTaskId = () => {
  const taskId = nextTaskId;
  nextTaskId += 1;
  return taskId;
};

const findTaskById = (id) => tasks.find((task) => task.id === id);
const findTaskIndexById = (id) => tasks.findIndex((task) => task.id === id);

const sendValidationError = (res, errors) =>
  res.status(400).json({ message: "Validation failed", errors });

const getTaskFromParams = (req, res) => {
  const id = getTaskId(req.params.id);

  if (!id) {
    res.status(400).json({ message: "Invalid task id" });
    return null;
  }

  const task = findTaskById(id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return null;
  }

  return task;
};

const getTaskIndexFromParams = (req, res) => {
  const id = getTaskId(req.params.id);

  if (!id) {
    res.status(400).json({ message: "Invalid task id" });
    return null;
  }

  const taskIndex = findTaskIndexById(id);

  if (taskIndex === -1) {
    res.status(404).json({ message: "Task not found" });
    return null;
  }

  return taskIndex;
};

const getCompletedFilter = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
};

const getSortOrder = (value) => {
  if (value === undefined) {
    return "asc";
  }

  return value === "asc" || value === "desc" ? value : null;
};

const getAllTasks = (req, res) => {
  try {
    const completed = getCompletedFilter(req.query.completed);
    const sort = getSortOrder(req.query.sort);

    if (completed === null) {
      return res
        .status(400)
        .json({ message: "completed query must be true or false" });
    }

    if (sort === null) {
      return res
        .status(400)
        .json({ message: "sort query must be asc or desc" });
    }

    let result = [...tasks];

    if (completed !== undefined) {
      result = result.filter((task) => task.completed === completed);
    }

    result.sort((a, b) => {
      const firstTime = new Date(a.createdAt).getTime();
      const secondTime = new Date(b.createdAt).getTime();
      return sort === "asc" ? firstTime - secondTime : secondTime - firstTime;
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTasksByPriority = (req, res) => {
  try {
    const priority = String(req.params.level || "").trim().toLowerCase();

    if (!allowedPriorities.includes(priority)) {
      return res
        .status(400)
        .json({ message: "Priority level must be low, medium, or high" });
    }

    const result = tasks.filter((task) => task.priority === priority);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTaskById = (req, res) => {
  try {
    const task = getTaskFromParams(req, res);
    if (!task) {
      return;
    }

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createTask = (req, res) => {
  try {
    const errors = validateTaskPayload(req.body);

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const newTask = {
      id: getNextTaskId(),
      ...buildTaskData(req.body),
      createdAt: getCurrentTimestamp(),
    };

    tasks.push(newTask);
    return res.status(201).json(newTask);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTask = (req, res) => {
  try {
    const taskIndex = getTaskIndexFromParams(req, res);
    if (taskIndex === null) {
      return;
    }

    const errors = validateTaskPayload(req.body);

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...buildTaskData(req.body),
    };

    return res.status(200).json(tasks[taskIndex]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTask = (req, res) => {
  try {
    const taskIndex = getTaskIndexFromParams(req, res);
    if (taskIndex === null) {
      return;
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    return res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByPriority,
  updateTask,
};
