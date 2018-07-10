const axios = require('axios');
const config = require('config');
const shiftsModule = require('../components/shifts/shifts');
const slotsModule = require('../components/slots/slots');
const debug = require('debug')('syncDeputy');
const moment = require('moment');
const utilities = require('../components/utilities');

let slots; 
let initialized = false;

(async function init(){
    slots = await slotsModule.getSlots();
    initialized = true;
}());

//Gets shifts roster data (shifts) from Deputy and syncs it with Setting Guidelines Shifts
async function sync(){

    if(!initialized)
        await init();

    try{
        const options = {
            upsert:true,
            new:true,
            runValidators:true
        }

        const rosterData = await getRosterData();

        const shiftArray = rosterData.map( rosterDoc => rosterDocToShift(rosterDoc) );

        shiftArray.map( shift => { 
            return shiftsModule.upsert( { deputyRosterId: shift.deputyRosterId }, shift, options, function(err, res){

                if(err)
                    throw new Error( err.message );

                return res;
            }); 
        });

    } catch(err) {

        throw new Error( err.message );

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



function rosterDocToShift(rosterDoc){

    return new shiftsModule.Model({
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




module.exports = {
    sync
}

