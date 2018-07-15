'use strict'
const mongoose = require('mongoose');

// Define appointment schema 
const schema = new mongoose.Schema({
    kmid: Number,
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
    date: {
        type:Date, 
        required: [true, 'We need a date to create this appointment']
    },
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
});

// Creates the Appointment model
const Appointment = mongoose.model('Appointment', schema);

module.exports = Appointment;