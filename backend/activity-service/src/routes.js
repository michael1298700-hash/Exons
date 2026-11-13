
const express = require("express");
const { randomUUID } = require("crypto");
const {
  readActivities,
  saveActivities
} = require("./storage");

const router = express.Router();

// GET: Melihat semua aktivitas
router.get("/", async (req, res) => {
  try {
    const activities = await readActivities();
    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil aktivitas"
    });
  }
});

// POST: Menambahkan aktivitas
router.post("/", async (req, res) => {
  try {
    const { taskId, action, description } = req.body;

    if (!taskId || !action) {
      return res.status(400).json({
        message: "taskId dan action wajib diisi"
      });
    }

    const activities = await readActivities();

    const newActivity = {
      id: randomUUID(),
      taskId,
      action,
      description: description || "",
      createdAt: new Date().toISOString()
    };

    activities.push(newActivity);
    await saveActivities(activities);

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({
      message: "Gagal menyimpan aktivitas"
    });
  }
});

// GET: Melihat aktivitas berdasarkan taskId
router.get("/task/:taskId", async (req, res) => {
  try {
    const activities = await readActivities();

    const result = activities.filter(
      activity => activity.taskId === req.params.taskId
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil aktivitas"
    });
  }
});

module.exports = router;
