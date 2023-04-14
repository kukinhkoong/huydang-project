const recipesRouter = require('./routes/recipes');
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/database");
const Recipe = require("./models/recipe");

// Initialize express app
const app = express();
// Connect to database
mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Check for DB errors
db.on("error", function (err) {
  console.log("DB Error");
});

// Initialize built-in middleware for urlencoding and json
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/recipes', recipesRouter);
app.use(express.static("public"));

// Load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Home route
app.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.render('index', { recipes });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});