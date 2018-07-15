'Use Strict';
const config = require('config');
const mongoose = require('mongoose');
const moment = require('moment');


// Define schema for shifts
const schema = new mongoose.Schema({
    deputyRosterId: String,
    start: {
        type: Date,
        required: true
    }, 
    end: {
        type: Date,
        required: true
    }, 
    duration: {
        type:Number
    },
    regionName: String,
    regionNumber: Number,
    employeeId: Number,
    slots: [ {
        _id: mongoose.Schema.Types.ObjectId,
        percentMatch: Number 
    }]
});


schema.methods.setDuration = function(){

    // Calculates shifts actual duration and converts it from milliseconds to minutes
    const actualDuration = (this.end - this.start) / 60000; 

    // If the actual duration is less than the minumum shift duration, assign the minimum shift duration
    this.duration = Math.max( actualDuration, config.get('shift.minimumDuration') );

    // Re-calculates the shift's end time
    this.end = moment(this.start).add(this.duration, 'minutes');

}

schema.pre('save', function(next){

    next();
});

// Create the shift model
const Shift = mongoose.model('Shift', schema);

module.exports = Shift;
