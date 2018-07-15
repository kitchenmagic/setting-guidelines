const mongoose = require('mongoose');
const config = require('config');
const log = require('debug')('appts');


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
    appointmentDate: {
        type:Date, 
        required: true
    },
    setBy: String,
    setDate: Date,
    confirmedBy: String,
    confirmedDate: Date,
    region: {
        type: Number,
        min:0
    },
    notes: String,
    assignedTo: String
});

const appointment = mongoose.model('appointments', schema);


module.exports = appointment;