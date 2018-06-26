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


// async function update(id){}

function upsertByDeputyRosterId(shifts){

    if(Array.isArray(shifts)){
        return shifts.map(shift => { return upsertShift(shift); });
    }     

    return upsertShift(shifts);

    function upsertShift(shift){
        try{
            let query = {'deputyRosterId': shift.deputyRosterId};
            const options = { upsert: true, new:true }; //, overwrite:true
            let upsertData = shift.toObject();
            delete upsertData._id;

            return Model.findOneAndUpdate( query, {$set: upsertData } , options, (err,doc)=>{
                if(err)
                    throw new Error(err.message);
                return doc;
            });

        }catch(err){
            throw new Error(err.message);
        }
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
        return new Model({
            deputyRosterId: rosterDoc.Id,
            startDateTime: rosterDoc.StartTimeLocalized,
            endDateTime: rosterDoc.EndTimeLocalized,
            regionName: rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName,
            employeeId: rosterDoc._DPMetaData.OperationalUnitInfo.Id
        });
    }

}




module.exports = {
    Model,
    insert,
    insertMany,
    // update,
    remove,
    upsertByDeputyRosterId,
    parseDeputyRoster
}

//

//Get Shifts
//Insert shifts
//Update shifts
//Delete Shifts



