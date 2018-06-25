const config = require('config');
const mongoose = require('mongoose');
// const log = require('debug')('log');

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{console.log('Connected to MongoDB...');})
    .catch((err)=>{console.log(err);});
mongoose.set('debug',true);

//Get reference to database 
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));


const shiftSchema = new mongoose.Schema({
    deputyRosterId: String,
    startDateTime: Date,
    endDateTime: Date,
    regionName: String,
    regionNumber: Number,
    employeeId: Number
});

//Set regionNumber
shiftSchema.pre('save', function(next){
    this.regionNumber = parseRegionNumber(this.regionName);
    next();
})

const Model = mongoose.model('Shift', shiftSchema);






//CRUD FUNCTIONS
function insert(shift, callback){
    return Model.create(shift, callback);
}

//Inserts many documents (shifts) into the database in one call.
//Atomic function
function insertMany(shiftsArray, callback){
    return Model.insertMany(shiftsArray, callback );
}


async function update(id){}

function upsertByDeputyRosterId(shifts){

    let query = {};
    const options = { upsert: true, new:true, overwrite:true };

    if(Array.isArray(shifts)){
        const updatedShifts = [];
        shifts.forEach(shift => {
            query = { deputyRosterId: shift.deputyRosterId };
            console.log('Shift ', shift);
            Model.findOneAndUpdate(query, shift, options, (error, doc)=>{
                if(error){
                    throw new Error(error.message)
                }
                console.log('New Doc:',doc);
                updatedShifts.push(doc);
            });
        });
        return updatedShifts;
    } else {
        query = { deputyRosterId: shifts.deputyRosterId };

        console.log('Shift to be updated', shifts);
        return Model.findOneAndUpdate( query, {$set:shifts} , options );
    } 


}

async function remove(id){
    const result = await Model.deleteOne({_id:id});
}


function get(){} 





//Utilities
function parseRegionNumber(regionName){
    if(regionName.search(/Region/i) >= 0) {
        return parseInt(regionName.substr(-(regionName.length - 6)).trim());
    }
    return null;
}

function parseDeputyRoster(rosterData){
    "use strict";

    if(Array.isArray(rosterData)){
        return rosterData.map( rosterDoc => {
            return rosterDocToShift(rosterDoc);
        });
    }else{
        return rosterDocToShift(rosterData);
    }

    function rosterDocToShift(rosterDoc){
        return {
            deputyRosterId: rosterDoc.Id,
            startDateTime: rosterDoc.StartTimeLocalized,
            endDateTime: rosterDoc.EndTimeLocalized,
            regionName: rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName,
            employeeId: rosterDoc._DPMetaData.OperationalUnitInfo.Id
        };
    }

}




module.exports = {
    Model,
    insert,
    insertMany,
    update,
    remove,
    upsertByDeputyRosterId,
    parseDeputyRoster
}

//

//Get Shifts
//Insert shifts
//Update shifts
//Delete Shifts



