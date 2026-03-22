const express = require("express");
const taskRoute = require("./routes/taskRoute");

try {
  require("dotenv").config();
} catch (error) {
  // Allow the app to run even when dotenv is not installed.
}

const createApp = () => {
  const app = express();

  app.use(express.json());

  app.use("/tasks", taskRoute);

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({ message: "Invalid JSON payload" });
    }

    return next(error);
  });

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
};

const app = createApp();

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
