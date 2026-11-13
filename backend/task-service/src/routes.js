
const express = require("express");
const { randomUUID } = require("crypto");
const { readTasks, saveTasks } = require("./storage");

const router = express.Router();

const ACTIVITY_SERVICE_URL =
  process.env.ACTIVITY_SERVICE_URL || "http://localhost:3002";

// Mengirim catatan ke Activity Service
async function logActivity(taskId, action, description) {
  try {
    const response = await fetch(`${ACTIVITY_SERVICE_URL}/activities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ taskId, action, description })
    });

    if (!response.ok) {
      console.error("Gagal mencatat aktivitas:", response.status);
    }
  } catch (error) {
    console.error(
      "Activity Service tidak dapat dihubungi:",
      error.message
    );
  }
}

// GET: Melihat semua tugas
router.get("/", async (req, res) => {
  const tasks = await readTasks();
  res.json(tasks);
});

// POST: Membuat tugas baru
router.post("/", async (req, res) => {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Judul tugas wajib diisi"
    });
  }

  const tasks = await readTasks();

  const newTask = {
    id: randomUUID(),
    title: title.trim(),
    description: description || "",
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  await logActivity(
    newTask.id,
    "created",
    `Tugas "${newTask.title}" dibuat`
  );

  res.status(201).json(newTask);
});

// GET: Melihat detail tugas
router.get("/:id", async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find(item => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Tugas tidak ditemukan"
    });
  }

  res.json(task);
});

// PATCH: Mengubah status tugas
router.patch("/:id", async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find(item => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Tugas tidak ditemukan"
    });
  }

  if (typeof req.body.completed !== "boolean") {
    return res.status(400).json({
      message: "Status completed harus boolean"
    });
  }

  task.completed = req.body.completed;
  task.updatedAt = new Date().toISOString();

  await saveTasks(tasks);

  await logActivity(
    task.id,
    "updated",
    `Status tugas "${task.title}" diubah menjadi ${task.completed ? "selesai" : "belum selesai"}`
  );

  res.json(task);
});

// DELETE: Menghapus tugas
router.delete("/:id", async (req, res) => {
  const tasks = await readTasks();

  const taskIndex = tasks.findIndex(
    item => item.id === req.params.id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "Tugas tidak ditemukan"
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  await saveTasks(tasks);

  await logActivity(
    deletedTask.id,
    "deleted",
    `Tugas "${deletedTask.title}" dihapus`
  );

  res.json({
    message: "Tugas berhasil dihapus",
    task: deletedTask
  });
});

module.exports = router;
