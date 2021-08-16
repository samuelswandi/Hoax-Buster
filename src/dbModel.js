const mongoose = require('mongoose');

const databaseSchema = mongoose.Schema({
    Nama : String,
    Nim : String,
    Domisili : String,
    StatusCovid : String,
    StatusVaksin : String
})

// Collection inside the database
module.exports = mongoose.model('databaseInit', databaseSchema)
