const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const League = mongoose.model('League', LeagueSchema)

module.exports = League;