let mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    added_by: {
        type: String,
        required: true
    }
});


let movie = module.exports = mongoose.model("movie", movieSchema);