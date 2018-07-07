const mongoose = require('mongoose');
const config = require('config');
const debug = require('debug')('slots');

let db;

mongoose.connect(config.get('mongoDB.path'))
    .then( () => {
        debug('Connected to MongoDB...');
        db = mongoose.connection;
    })
    .catch( err => { throw new Error( err.message ) } );



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


// Creates a slot in the database
async function createSlot(slot){
    slot = new Slot(slot);

    return await slot.save();
}

async function getSlots(query ,callback){
    return await Slot.find(query, callback);
}

module.exports = {
    Slot,
    createSlot,
    getSlots
}