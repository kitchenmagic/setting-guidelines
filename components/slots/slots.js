const mongoose = require('mongoose');
const config = require('config');
const log = require('debug')('slots');
const moment = require('moment');


// Define the Slot schema
const slotSchema = new mongoose.Schema({
    start: {
        hour: {
            type: Number,
            required: true,
            min: 0,
            max: 23
        },
        minute:{
            type: Number,
            min: 0,
            max: 59,
            default: 0
        }
    },
    end:{
        hour: {
            type: Number,
            required: true,
            min: 0,
            max: 23
        },
        minute:{
            type: Number,
            min: 0,
            max: 59,
            default: 0
        }
    },
    duration: {
        type: Number
    },
    daysOfWeek: {
        type: [Number],
        min: 0,
        max: 6
    }
        
})

// Create the Slot model
const Slot = mongoose.model('Slot', slotSchema);

slotSchema.methods.upsert = function(error, slot, cb){
    Slot.find();
};

slotSchema.pre('save', (next)=>{
    next();
})




module.exports = Slot;