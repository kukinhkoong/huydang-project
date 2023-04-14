const express = require("express");
const router = express.Router() 
const { check, validationResult } = require("express-validator");
const Recipe = require("../models/recipe");

router
  .route("/add")
  .get((req, res) => {
    res.render("add_recipe");    
  })
  .post(async (req, res) => {
    await check("name", "Name is required").notEmpty().run(req);
    await check("description", "Description is required").notEmpty().run(req);
    await check("difficulty", "Difficulty is required").notEmpty().run(req);
    await check("ingredients", "Ingredients are required").notEmpty().run(req);
    await check("steps", "Steps are required").notEmpty().run(req);

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      let recipe = new Recipe();
      recipe.name = req.body.name;
      recipe.description = req.body.description;
      recipe.difficulty = req.body.difficulty;
      recipe.ingredients = req.body.ingredients.split(',').map(i => i.trim());
      recipe.steps = req.body.steps.split('\n').map(s => s.trim());

      recipe.save(function (err) {
        if (err) {
          console.log(err);
          return;
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.render("add_recipe", {
        errors: errors.array(),
      });
    }
  });

router
  .route("/:id")
  .get((req, res) => {
    Recipe.findById(req.params.id, function (err, recipe) {
      if (err || !recipe) {
        res.status(404).send("Recipe not found.");
      } else {
        res.render("recipe", { recipe });
      }
    });
  })
  .delete((req, res) => {
    let query = { _id: req.params.id };

    Recipe.deleteOne(query, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.send("Successfully Deleted");
      }
    });
  });

router
  .route("/edit/:id")
  .get((req, res) => {
    Recipe.findById(req.params.id, function (err, recipe) {
      if (err || !recipe) {
        res.status(404).send("Recipe not found.");
      } else {
        res.render("edit_recipe", { recipe });
      }
    });
  })
  .post((req, res) => {
    let recipe = {};

    // Assign attributes based on form data
    recipe.name = req.body.name;
    recipe.description = req.body.description;
    recipe.difficulty = req.body.difficulty;
    recipe.ingredients = req.body.ingredients.split(',').map(i => i.trim());
    recipe.steps = req.body.steps.split('\n').map(s => s.trim());

    let query = { _id: req.params.id };
    
    Recipe.updateOne(query, recipe, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/");
      }
    });
  });

module.exports = router;