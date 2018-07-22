'Use Strict';
const mongoose = require('mongoose');
const Event = require('../event/eventModel');
const Slot = require('../appointment/slot/slotModel');
const axios = require('axios');
const moment = require('moment');

// Define schema for shifts
const shiftSchema = new mongoose.Schema({
    deputyRosterId: String,
    employeeId: Number,
    slots: [ {
        _id: mongoose.Schema.Types.ObjectId,
        percentMatch: Number 
    }]
},
{
    timestamps: true
});


shiftSchema.pre('save', function(next){

    if(!this.endDateTime) return next();
    
    // Get Relevant Slots for shifts
    this.slots = Slot.getRelevantSlots(this.startDateTime, this.endDateTime, slots).map( (slot) => {
        return {
            _id:slot._id,
            percentMatch: slot.percentMatch
        } 
    });

    next();
})

exports.getRosterData = async function(query){
    "use strict";
    
    try{
        const postOptions = {
            method:'POST',
            url: config.get('deputy.roster.path') + 'QUERY',
            json: true,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                authorization: "OAuth " + config.get('deputy.authToken')
            },
            data: query || null
        };

        let allRosterData = [], 
            response;

        const maxRecords = postOptions.data.max = 500;
        
        postOptions.data.start = 0;

        do{
            //Send the api call
            response = await axios(postOptions);

            //Add the returned roster documents to the allRosterData array
            allRosterData = allRosterData.concat(response.data);
            
            //Update the starting position of the query
            postOptions.data.start += maxRecords; 
        }
        //Get more records if the previous fetch hit the max number documents. Eg. the query limit  
        while( response.data.length === maxRecords );  
        
        log('All roster data size: ', allRosterData.length);

        return allRosterData;

    } catch(err) {
        throw new Error(err);
    }

}


/*
 * Helpers
 */ 
exports.rosterDocToShift = function(rosterDoc){
    return new Shift({
        deputyRosterId: rosterDoc.Id,
        startDateTime: moment(rosterDoc.StartTimeLocalized),
        endDateTime: moment(rosterDoc.EndTimeLocalized),
        regionName: rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName,
        regionNumber: Shift.parseRegionNumber(rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName),
        employeeId: rosterDoc._DPMetaData.OperationalUnitInfo.Id
    });
}

//Gets region number from region name
exports.parseRegionNumber = function(regionName){

    if(regionName.search(/Region/i) >= 0)
        return parseInt(regionName.substr(-(regionName.length - 6)).trim());

    return null;
}


// Create the shift model
exports.Shift = Event.discriminator('Shift', shiftSchema, "shift");