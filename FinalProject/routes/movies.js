const express = require("express");
const router = express.Router();
// Import Express validatior
const { check, validationResult } = require("express-validator");
const movie = require("../models/movie");

// Import movie and User Mongoose schemas
let Movie = require("../models/movie");
let User = require("../models/user");

function ensureAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/users/login");
  }
}
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
    await check("name")
    .notEmpty()
    .withMessage("Name is required")
    .run(req);
    
  await check("description")
    .notEmpty()
    .withMessage("Description is required")
    .run(req);
  
  await check("year")
    .notEmpty()
    .withMessage("Year is required")
    .isNumeric()
    .withMessage("Year must be a number")
    .run(req);
  
  await check("genres")
    .notEmpty()
    .withMessage("Genre is required")
    .run(req);
  
  await check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isNumeric()
    .withMessage("Rating must be a number")
    .run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Create new movie from mongoose model
      let movie = new Movie();
      // Assign attributes based on form data
      movie.name = req.body.name;
      movie.description = req.body.description;
      movie.year = req.body.year;
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

  router
  .route("/:id")
  .get((req, res) => {
    // Get movie by id from MongoDB
    // Get user name by id from DB
    Movie.findById(req.params.id, function (err, movie) {
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

    Movie.findById(req.params.id, function (err, movie) {
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
    Movie.findById(req.params.id, function (err, movie) {
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
    movie.description = req.body.description;
    movie.year = req.body.year;
    movie.genres = req.body.genres;
    movie.rating = req.body.rating;

    let query = { _id: req.params.id };

    Movie.findById(req.params.id, function (err, movie_db) {
      // Restrict to only allowing user that posted to make updates
      if (movie_db.added_by != req.user._id) {
        res.redirect("/");
      } else {
        Movie.updateOne(query, movie, function (err) {
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
  router.post("/search", (req, res) => {
    const name = req.body.searchname;
  
    Movie.find({ name: new RegExp(name, 'i') }, (err, movies) => {
      if (err) {
        console.log(err);
      } else {
        if (movies.length === 0) {
        res.render("index", {
          movies: movies,
          user: req.user,
          noMoviesFound:true
        });
      }else{
        res.render("index", {
          movies: movies,
          user: req.user,
          noMoviesFound: false
        });
      }
    }
  });
});


module.exports = router;
