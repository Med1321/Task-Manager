
const taskInput = document.getElementById("taskInput");
const taskDueDate = document.getElementById("taskDueDate");
const taskPriority = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const taskFilter = document.getElementById("taskFilter");
const taskSearch = document.getElementById("taskSearch");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");
const clearCompletedBtn =
  document.getElementById("clearCompletedBtn");

let editingTaskId = null;
const cancelEditBtn = document.getElementById("cancelEditBtn");
const taskSort = document.getElementById("taskSort");
const overdueTasks = document.getElementById("overdueTasks");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressContainer = document.getElementById("progressContainer");

const taskCategory = document.getElementById("taskCategory");


// 1. Load saved tasks

let tasks = [];

try {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks !== null) {
    const parsedTasks = JSON.parse(savedTasks);

    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks;
    } else {
      console.error("Saved tasks data is not an array.");
    }
  }
} catch (error) {
  console.error("Could not load saved tasks:", error);
}


// 2. Save tasks
function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);

    alert(
      "Could not save tasks. Browser storage may be full or unavailable."
    );

    return false;
  }
}

// 3. Display tasks
function renderTasks() {
  taskList.innerHTML = "";

  const selectedFilter = taskFilter.value;


  const searchText = taskSearch.value.trim().toLowerCase();

  const filteredTasks = tasks.filter(function (task) {
    const matchesSearch = task.text
      .toLowerCase()
      .includes(searchText);

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && !task.completed) ||
      (selectedFilter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });


  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3
  };

  if (taskSort.value === "priority") {
    filteredTasks.sort(function (a, b) {
      return (priorityOrder[a.priority] || 2) -
        (priorityOrder[b.priority] || 2);
    });
  } else if (taskSort.value === "date") {
    filteredTasks.sort(function (a, b) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return a.dueDate.localeCompare(b.dueDate);
    });
  } else if (taskSort.value === "newest") {
    filteredTasks.sort(function (a, b) {
      return b.id - a.id;
    });
  }


  filteredTasks.forEach(function (task) {
    const taskItem = document.createElement("li");

    taskItem.className =
      "list-group-item d-flex align-items-center gap-2 flex-wrap";

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = task.completed;

    // Task text
    const taskLabel = document.createElement("span");
    taskLabel.textContent = task.text;
    taskLabel.className = "flex-grow-1";

    if (task.completed) {
      taskLabel.classList.add("completed");
    }

    // Due date

    const dateLabel = document.createElement("small");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue =
      task.dueDate &&
      new Date(task.dueDate + "T00:00:00") < today &&
      !task.completed;

    if (isOverdue) {
      dateLabel.className = "text-danger fw-bold";
      dateLabel.textContent = "Overdue: " + task.dueDate;
    } else if (task.dueDate) {
      dateLabel.className = "text-muted";
      dateLabel.textContent = "Due: " + task.dueDate;
    } else {
      dateLabel.className = "text-muted";
      dateLabel.textContent = "No due date";
    }


    // Priority
    const priorityLabel = document.createElement("span");
    priorityLabel.className = "badge";

    const priority = task.priority || "Medium";
    priorityLabel.textContent = priority;

    if (priority === "High") {
      priorityLabel.classList.add("bg-danger");
    } else if (priority === "Low") {
      priorityLabel.classList.add("bg-success");
    } else {
      priorityLabel.classList.add("bg-warning", "text-dark");
    }

    // Checkbox event
    checkbox.addEventListener("change", function () {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });


    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-warning btn-sm";

    editBtn.addEventListener("click", function () {
      editingTaskId = task.id;

      taskInput.value = task.text;
      taskDueDate.value = task.dueDate || "";
      taskPriority.value = task.priority || "Medium";
      taskCategory.value = task.category || "Other";
      addTaskBtn.textContent = "Save Changes";
      cancelEditBtn.style.display = "block";

      taskInput.focus();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-danger btn-sm";

    deleteBtn.addEventListener("click", function () {
      tasks = tasks.filter(function (item) {
        return item.id !== task.id;
      });

      saveTasks();
      renderTasks();
    });
    // Category
    const categoryLabel = document.createElement("span");
    categoryLabel.className = "badge bg-info text-dark";
    categoryLabel.textContent = task.category || "Other";

    // Add elements to the task
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskLabel);
    taskItem.appendChild(dateLabel);
    taskItem.appendChild(priorityLabel);
    taskItem.appendChild(categoryLabel);
    taskItem.appendChild(editBtn);
    taskItem.appendChild(deleteBtn);
    taskList.appendChild(taskItem);
  });


  // Show the correct empty state
  if (tasks.length === 0) {
    emptyMessage.textContent = "No tasks yet. Add your first task!";
    emptyMessage.style.display = "block";
  } else if (filteredTasks.length === 0) {
    emptyMessage.textContent = "No matching tasks found.";
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }


  totalTasks.textContent = tasks.length;

  const completedCount = tasks.filter(function (task) {
    return task.completed;
  }).length;

  completedTasks.textContent = completedCount;

  remainingTasks.textContent =
    tasks.length - completedCount;

  const progress = tasks.length === 0
    ? 0
    : Math.round((completedCount / tasks.length) * 100);

  progressBar.style.width = progress + "%";
  progressText.textContent = progress + "%";
  progressContainer.setAttribute("aria-valuenow", progress);


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = tasks.filter(function (task) {
    return (
      task.dueDate &&
      new Date(task.dueDate + "T00:00:00") < today &&
      !task.completed
    );
  }).length;

  overdueTasks.textContent = overdueCount;

  function updatePriorityProgress() {
    const priorities = ["High", "Medium", "Low"];

    priorities.forEach(function (priority) {
      const priorityTasks = tasks.filter(function (task) {
        return (task.priority || "Medium") === priority;
      });

      const completed = priorityTasks.filter(function (task) {
        return task.completed;
      }).length;

      const percentage = priorityTasks.length === 0
        ? 0
        : Math.round((completed / priorityTasks.length) * 100);

      const key = priority.toLowerCase();

      document.getElementById(key + "PriorityText").textContent =
        percentage + "%";

      document.getElementById(key + "PriorityBar").style.width =
        percentage + "%";
    });
  }
  updatePriorityProgress();
}

// 4. Add a new task

addTaskBtn.addEventListener("click", function () {
  const taskText = taskInput.value.trim();
  const dueDate = taskDueDate.value;
  const priority = taskPriority.value;

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  if (editingTaskId !== null) {
    tasks = tasks.map(function (task) {
      if (task.id === editingTaskId) {
        return {
          ...task,
          text: taskText,
          dueDate: dueDate,
          priority: priority,
          category: taskCategory.value
        };
      }

      return task;
    });

    editingTaskId = null;
    addTaskBtn.textContent = "Add Task";
    cancelEditBtn.style.display = "none";
  } else {
    const newTask = {
      id: Date.now(),
      text: taskText,
      dueDate: dueDate,
      priority: priority,
      category: taskCategory.value,
      completed: false
    };

    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskDueDate.value = "";
  taskPriority.value = "Medium";
  taskCategory.value = "Study";
});

// 5. Display saved tasks when the page opens
renderTasks();
taskFilter.addEventListener("change", function () {
  renderTasks();
});
taskSearch.addEventListener("input", function () {
  renderTasks();
});

clearCompletedBtn.addEventListener("click", function () {
  const completedCount = tasks.filter(function (task) {
    return task.completed;
  }).length;

  if (completedCount === 0) {
    alert("There are no completed tasks to delete!");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete all completed tasks?"
  );

  if (!confirmed) {
    return;
  }

  tasks = tasks.filter(function (task) {
    return !task.completed;
  });

  saveTasks();
  renderTasks();
});

cancelEditBtn.addEventListener("click", function () {
  editingTaskId = null;

  taskInput.value = "";
  taskDueDate.value = "";
  taskPriority.value = "Medium";

  addTaskBtn.textContent = "Add Task";
  cancelEditBtn.style.display = "none";

  taskInput.focus();
});
taskSort.addEventListener("change", function () {
  renderTasks();
});

const darkModeBtn = document.getElementById("darkModeBtn");

// استرجاع الوضع المحفوظ
const savedDarkMode = localStorage.getItem("darkMode");

if (savedDarkMode === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeBtn.textContent = "☀️ Light Mode";
}

// التبديل بين الوضع الليلي والنهاري
darkModeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    darkModeBtn.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkModeBtn.textContent = "🌙 Dark Mode";
  }
});

const exportTasksBtn = document.getElementById("exportTasksBtn");

exportTasksBtn.addEventListener("click", function () {
  if (tasks.length === 0) {
    alert("No tasks to export!");
    return;
  }

  // تحويل المهام إلى JSON
  const data = JSON.stringify(tasks, null, 2);

  // إنشاء ملف قابل للتحميل
  const blob = new Blob([data], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "my-tasks.json";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

const importTasksInput = document.getElementById("importTasksInput");
const importTasksBtn = document.getElementById("importTasksBtn");

importTasksBtn.addEventListener("click", function () {
  const file = importTasksInput.files[0];

  if (!file) {
    alert("Please choose a JSON file first!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const importedTasks = JSON.parse(event.target.result);

      // التأكد أن الملف فيه لائحة ديال المهام

      if (
        !Array.isArray(importedTasks) ||
        !importedTasks.every(function (task) {
          return (
            task &&
            typeof task.text === "string" &&
            task.text.trim() !== "" &&
            typeof task.completed === "boolean" &&
            ["Low", "Medium", "High"].includes(
              task.priority || "Medium"
            ) &&
            (
              task.dueDate === undefined ||
              task.dueDate === "" ||
              (
                typeof task.dueDate === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) &&
                !Number.isNaN(
                  Date.parse(task.dueDate + "T00:00:00")
                )
              )
            ) &&
            (
              task.category === undefined ||
              typeof task.category === "string"
            )
          );
        })
      ) {
        alert("Invalid tasks file!");
        return;
      }

      const confirmed = confirm(
        "Importing will replace your current tasks. Continue?"
      );

      tasks = importedTasks.map(function (task) {
        return {
          id: Date.now() + Math.random(),
          text: task.text.trim(),
          dueDate: task.dueDate || "",
          priority: task.priority || "Medium",
          category: task.category || "Other",
          completed: task.completed
        };
      });

      saveTasks();
      renderTasks();

      alert("Tasks imported successfully!");
      importTasksInput.value = "";
    } catch (error) {
      alert("Could not read this JSON file!");
    }
  };

  reader.readAsText(file);
});

renderTasks();
