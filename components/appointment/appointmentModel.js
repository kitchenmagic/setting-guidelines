'use strict'
const mongoose = require('mongoose');
const Event = require('../event/eventModel');


// Define appointment schema 
const appointmentSchema = new mongoose.Schema({
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

class AppointmentClass{
}

appointmentSchema.loadClass(AppointmentClass);

exports.Appointment = Event.discriminator('Appointment', appointmentSchema, 'appointment');