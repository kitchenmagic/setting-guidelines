const config = require('config');
const mongoose = require('mongoose');

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{console.log('Connected to MongoDB...');})
    .catch();

//Get reference to database 
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));


const shiftSchema = new mongoose.Schema({
    deputyRosterId: String,
    startDateTime: Date,
    endDateTime: Date,
    regionName: String,
    regionNumber: Number,
    employeeId: String
});

const Shift = mongoose.model('Shift', shiftSchema);


function insertShift(){}

function insertShifts(shiftsArray, callback){
    return Shift.insertMany(shiftsArray, callback );
}


async function updateShift(id){
    const shift = await Shift.findByIdAndUpdate(id, {
        $set: {}
    });
}

async function removeShift(id){
    const result = await Shift.deleteOne({_id:id});
}

function getShift(){} 


module.exports = {
    "Shift": Shift,
    "insertShifts": insertShifts
}

//

//Get Shifts
//Insert shifts
//Update shifts
//Delete Shifts



