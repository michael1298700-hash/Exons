const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = process.env.DATA_FILE ||
    path.join(__dirname, "../data/activities.json");

async function readActivities() {
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

async function saveActivities(activities) {
    await fs.mkdir(path.dirname(DATA_FILE), {
        recursive: true
    });

    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(activities, null, 2)
    );
}

module.exports = {
    readActivities,
    saveActivities
};