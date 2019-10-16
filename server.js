const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require('cookie-session')

const app = express();

//Connect to database
mongoose.connect('mongodb+srv://admin:admin@test-5s8sm.mongodb.net/IssuesProject?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true });

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
const Project = mongoose.model("Projects", projectSchema, "Projects");

//User Schema
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "is required"]
  },
  password: {
    type: String,
    required: [true, "is required"]
  },
});

//UserModel
const User = mongoose.model("User", userSchema);

//-----------------Middlewares---------------------------------------------
//Static folder
app.use(express.static("public"));

//JSON parser
app.use(express.json());

//Cookie session
app.use(cookieSession({
  secret: "da344483bb83f6f7f89b358cd1440e53",
  // Cookie Options
  httpOnly: false,
  maxAge: 30 * 60 * 1000 // 30 min
}))


//GET projects
app.get("/projects", async (req, res, next) => {
  if (req.session.userId) {
    try {
      const projects = await Project.find();
      res.json(projects);
    } catch (err) {
      next(err);
    }
  } else {
    res.status(401).json({ error: "Not Authenticated" })
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

//POST register (User registration)
app.post("/register", async (req, res, next) => {
  const newUser = req.body;

  try {
    const user = await User.create(newUser)
    res.json(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(422).json({ errors: err.errors });
    } else {
      next(err);
    }
  }
});

//POST register (User registration)
app.post("/login", async (req, res, next) => {
  const newLogin = req.body;

  try {
    const user = await User.findOne({ email: newLogin.email, password: newLogin.password });
    if (user) {
      req.session.userId = user._id;
      res.json(user);
    } else {
      res.status(401).json({ error: "Combinación de correo/contraseña incorrectos" });
    }
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
