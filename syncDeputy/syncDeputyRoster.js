const config = require('config');
const axios = require('axios');
const moment = require('moment');
const log = require('debug')('Sync Roster');

const utilities = require('../components/utilities');
const shiftsModule = require('../components/shifts/shifts');
const slotsModule = require('../components/slots/slots');


//Gets shifts roster data (shifts) from Deputy and syncs it with Setting Guidelines Shifts
async function sync(){

    try{
        const rosterQuery =  config.get('deputy.roster.query');

        //Get the roster data from deputy
        const rosterData = await getRosterData(rosterQuery);
        
        //Get the current appointment slots 
        const slots = await slotsModule.getSlots();

        return rosterData

            //Create new shift objects from the roster data 
            .map( rosterDoc => {
                let shift = rosterDocToShift(rosterDoc);
                shift.slots = utilities.getRelevantSlots(shift.start, shift.end, slots).map(slot => {
                    return {
                        _id:slot._id,
                        percentMatch: slot.percentMatch
                    } 
                });

                return shiftsModule.upsert( { deputyRosterId: shift.deputyRosterId }, shift, null, function(err, res){
                    if(err){ throw new Error( err.message ); }
                    return res;
                }); 
            });

    } catch(err) {

        throw new Error( err.message );

    }

}





// Fetches roster data ("shifts") from deputy and returns a promise
// Accepts Deputy query as argument https://www.deputy.com/api-doc/API/Resource_Calls#page_POST_resourceobjectQUERY
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





function rosterDocToShift(rosterDoc){
// 
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




module.exports = sync;

