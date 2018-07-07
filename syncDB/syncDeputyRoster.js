const axios = require('axios');
const config = require('config');
const shift = require('../components/shifts/shifts');
const debug = require('debug')('syncDeputy');
const moment = require('moment');


//Gets shifts roster data (shifts) from Deputy and syncs it with Setting Guidelines Shifts
async function syncShiftsWithDeputyRoster(){

    try{
        const rosterData = await getRosterData();
        const shiftsArray = rosterData.map( rosterDoc => rosterDocToShift(rosterDoc) )

        const options = {
            upsert:true,
            new:true,
            runValidators:true
        }

        const result = shiftsArray.map( doc => { 
            return shift.upsert( { deputyRosterId: doc.deputyRosterId }, doc, options ); 
        });

        debug('Result', result[0]);

    } catch(error) {
        throw new Error(error.message);
    }

}



//Fetches roster data ("shifts") from deputy and returns a promise
async function getRosterData(query){
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
            data: query || config.get('deputy.roster.query')
        };

        let allRosterData = [], response;
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
        
        debug('All roster data size: ', allRosterData.length);
        return allRosterData;

    } catch(err) {
        throw new Error(err);
    }

}




// Updates a shift based on it's deputy 
function upsertByDeputyRosterId(shifts){

    if(Array.isArray(shifts))
        return shifts.map(shift => upsertShift(shift) );

    return upsertShift(shifts);

    function upsertShift(shift){

        if(!shift.deputyRosterId)
            return;

        try{
            let upsertData = shift.toObject();
            delete upsertData._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues
            
            let query = { 'deputyRosterId': shift.deputyRosterId };
            const options = { upsert: true, new:true }; //, overwrite:true
            return Model.findOneAndUpdate( query, {$set: upsertData, runValidators:true } , options, (err,doc)=>{
                if(err)
                    throw new Error(err.message);
                return doc;
            });

        }catch(err){
            throw new Error(err.message);
        }
    }

}



function rosterDocToShift(rosterDoc){

    return new shift.Model({
        deputyRosterId: rosterDoc.Id,
        start: moment(rosterDoc.StartTimeLocalized),
        end: moment(rosterDoc.EndTimeLocalized),
        regionName: rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName,
        employeeId: rosterDoc._DPMetaData.OperationalUnitInfo.Id,
        regionNumber: parseRegionNumber(rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName)
    });

}


//Gets region number from region name
function parseRegionNumber(regionName){

    if(regionName.search(/Region/i) >= 0)
        return parseInt(regionName.substr(-(regionName.length - 6)).trim());

    return null;
}




syncShiftsWithDeputyRoster();

