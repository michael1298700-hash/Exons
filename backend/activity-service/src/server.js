const express = require("express");
const activityRoutes = require("./routes");

const app = express();

const PORT = process.env.PORT || 3002;

app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );
    next();
});

// Endpoint utama
app.get("/", (req, res) => {
    res.json({
        service: "Activity Service",
        status: "running",
        version: "1.0.0"
    });
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "healthy"
    });
});

// Activity API
app.use("/activities", activityRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Activity Service berjalan pada port ${PORT}`);
});