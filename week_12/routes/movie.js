const express = require("express");
const router = express.Router();
// Import Express validatior
const { check, validationResult } = require("express-validator");
const movie = require("../models/movie");

// Import movie and User Mongoose schemas
let Movie = require("../models/movie");
let User = require("../models/user");

// Genres
let genres = [
  "adventure",
  "science fiction",
  "tragedy",
  "romance",
  "horror",
  "comedy",
];

// Attach routes to router
router
  .route("/add")
  // Get method renders the pug add_movie page
  .get(ensureAuthenticated, (req, res) => {
    // Render page with list of genres
    res.render("add_movie", {
      genres: genres,
    });
    // Post method accepts form submission and saves movie in MongoDB
  })
  .post(ensureAuthenticated, async (req, res) => {
    // Async validation check of form elements
    await check("name", "name is required").notEmpty().run(req);
    await check("director", "director is required").notEmpty().run(req);
    await check("duration", "duration is required").notEmpty().run(req);
    await check("rating", "Rating is required").notEmpty().run(req);
    await check("genres", "Genre is required").notEmpty().run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Create new movie from mongoose model
      let movie = new Movie();
      // Assign attributes based on form data
      movie.name = req.body.name;
      movie.director = req.body.director;
      movie.duration = req.body.duration;
      movie.genres = req.body.genres;
      movie.rating = req.body.rating;
      movie.added_by = req.user.id;

      // Save movie to MongoDB
      movie.save(function (err) {
        if (err) {
          // Log error if failed
          console.log(err);
          return;
        } else {
          // Route to home to view movies if suceeeded
          res.redirect("/");
        }
      });
    } else {
      res.render("add_movie", {
        // Render form with errors
        errors: errors.array(),
        genres: genres,
      });
    }
  });

// Route that returns and deletes movie based on id
router
  .route("/:id")
  .get((req, res) => {
    // Get movie by id from MongoDB
    // Get user name by id from DB
    movie.findById(req.params.id, function (err, movie) {
      User.findById(movie.added_by, function (err, user) {
        if (err) {
          console.log(err);
        }
        res.render("movie", {
          movie: movie,
          added_by: user.name,
        });
      });
    });
  })
  .delete((req, res) => {
    // Restrict delete if user not logged in
    if (!req.user._id) {
      res.status(500).send();
    }

    // Create query dict
    let query = { _id: req.params.id };

    movie.findById(req.params.id, function (err, movie) {
      // Restrict delete if user did not post movie
      if (movie.added_by != req.user._id) {
        res.status(500).send();
      } else {
        // MongoDB delete with Mongoose schema deleteOne
        movie.deleteOne(query, function (err) {
          if (err) {
            console.log(err);
          }
          res.send("Successfully Deleted");
        });
      }
    });
  });

// Route that return form to edit movie
router
  .route("/edit/:id")
  .get(ensureAuthenticated, (req, res) => {
    // Get movie by id from MongoDB
    movie.findById(req.params.id, function (err, movie) {
      // Restrict to only allowing user that posted to make updates
      if (movie.added_by != req.user._id) {
        res.redirect("/");
      }
      res.render("edit_movie", {
        movie: movie,
        genres: genres,
      });
    });
  })
  .post(ensureAuthenticated, (req, res) => {
    // Create dict to hold movie values
    let movie = {};

    // Assign attributes based on form data
    movie.name = req.body.name;
    movie.director = req.body.director;
    movie.duration = req.body.duration;
    movie.genres = req.body.genres;
    movie.rating = req.body.rating;

    let query = { _id: req.params.id };

    movie.findById(req.params.id, function (err, movie_db) {
      // Restrict to only allowing user that posted to make updates
      if (movie_db.added_by != req.user._id) {
        res.redirect("/");
      } else {
        // Update movie in MongoDB
        movie.updateOne(query, movie, function (err) {
          if (err) {
            console.log(err);
            return;
          } else {
            res.redirect("/");
          }
        });
      }
    });
  });

// Function to protect routes from unauthenticated users
function ensureAuthenticated(req, res, next) {
  // If logged in proceed to next middleware
  if (req.isAuthenticated()) {
    return next();
    // Otherwise redirect to login page
  } else {
    res.redirect("/users/login");
  }
}

module.exports = router;
