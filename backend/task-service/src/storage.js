const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = process.env.DATA_FILE ||
  path.join(__dirname, "../data/tasks.json");

async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function saveTasks(tasks) {
  await fs.mkdir(path.dirname(DATA_FILE), {
    recursive: true
  });

  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(tasks, null, 2)
  );
}

module.exports = { readTasks, saveTasks };