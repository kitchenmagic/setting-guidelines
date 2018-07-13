const mongoose = require('mongoose');
const config = require('config');
const log = require('debug')('slots');
const moment = require('moment');

let db;

mongoose.connect(config.get('mongoDB.path'))
    .then( () => {
        log('Connected to MongoDB...');
        db = mongoose.connection;
    })
    .catch( err => { throw new Error( err.message ) } );


// Define the Slot schema
const schema = new mongoose.Schema({
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
const Model = mongoose.model('Slot', schema);


// Creates a slot in the database
async function createSlot(slot){
    try{
        slot = new Model(slot);
        return await slot.save();
    }catch(err){
        throw new Error( err.message );
    }
}

async function getSlots(query ,callback){
    try{
        const results = await Model.find(query, callback);
        return results;
    }catch(err){
        throw new Error( err.message );
    }
}


module.exports = {
    Model,
    schema,
    createSlot,
    getSlots
}