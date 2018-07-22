'use strict'
const mongoose = require('mongoose');
const config = require('config');
const moment = require('moment');


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

    get duration(){
        // config.get('appointment.duration');
        if(!this.endDateTime) return;
        return (moment(this.endDateTime) - moment(this.startDateTime)) / 60000;
    }
}

appointmentSchema.loadClass(AppointmentClass);

appointmentSchema.pre('save', function(next){
    
    this.setDuration();
    next();
})

appointmentSchema.post('save', function(next){
    
    next();
})

const Appointment = Event.discriminator('Appointment', appointmentSchema, 'appointment');
module.exports = Appointment;