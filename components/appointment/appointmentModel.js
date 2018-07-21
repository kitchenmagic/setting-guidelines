'use strict'
const mongoose = require('mongoose');
const Slot = require('./slot/slot');
const config = require('config');
const moment = require('moment');
const util = require('../utilities');

let slots;
(async function(){
    slots = await Slot.find();
}())

// Define appointment schema 
const schema = new mongoose.Schema({
    kmid: String,
    name: {
        first: String,
        last: String
    },
    phone: String,
    email: String,
    address: {
        street: String,
        city: String, 
        state: String, 
        zipCode: {
            type: Number,
            min: 0,
            max: 99999   
        }
    },
    start: {
        type:Date, 
        required: [true, 'We need a date to create this appointment']
    },
    end: Date,
    duration: Number,
    setBy: String,
    setDate: Date,
    confirmedBy: String,
    confirmedDate: Date,
    region: {
        type: Number,
        min: 0,
        max: 100
    },
    notes: String,
    assignedTo: String
},{
    timestamps: true
});

schema.methods.setDuration = function(){

    // If the actual duration is less than the minumum shift duration, 
    // assign the minimum shift duration
    this.duration = config.get('appointment.duration');

    // Re-calculates the shift's end time
    this.end = moment(this.start).add(this.duration, 'minutes');

}

schema.pre('save', function(next){
    
    this.setDuration();
    next();
})

schema.post('save', function(next){

    next();
})

// Creates the Appointment model
const Appointment = mongoose.model('Appointment', schema);

module.exports = Appointment;