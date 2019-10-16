const express = require("express");
const mongoose = require("mongoose");

const app = express();

//Connect to database
mongoose.connect('mongodb://127.0.0.1:27017/projects', { useNewUrlParser: true, useUnifiedTopology: true });

//Project Schema
const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "is required"]
  },
  description: String,
  creationDate: Date
});

//ProjectModel
const Project = mongoose.model("Project", projectSchema);

//Middlewares
app.use(express.static("public"));
app.use(express.json());

//GET projects
app.get("/projects", async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

//POST projects
app.post("/projects", async (req, res, next) => {
  const newProject = req.body;
  newProject.creationDate = new Date();

  try {
    const project = await Project.create(newProject)
    res.json(project);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(422).json({ errors: err.errors });
    } else {
      next(err);
    }
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: err.message });
});

//Initialize Server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
