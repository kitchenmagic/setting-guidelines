'Use Strict';
const mongoose = require('mongoose');
const config = require('config');
const moment = require('moment');
const Slot = require('../appointment/slot/slot');
const util = require('../utilities');

let slots;
(async function(){
    slots = await Slot.find();
}())

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
},
{
    timestamps: true
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

    // Set the duration and adjust end time if slot duration is less than
    // minimum shift duration
    this.setDuration();
    // Get Relevant Slots for shifts
    this.slots = util.getRelevantSlots(this.start, this.end, slots).map( (slot) => {
        return {
            _id:slot._id,
            percentMatch: slot.percentMatch
        } 
    });

    next();
})

// Create the shift model
const Shift = mongoose.model('Shift', schema);

module.exports = Shift;