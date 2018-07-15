'use strict';
/* 
 * SYNC SHIFTS
 * -------------------------------------------------
 * Gets shifts roster data (shifts) from Deputy and 
 * syncs it with Setting Guidelines Shifts
 */
const config = require('config');
const axios = require('axios');
const moment = require('moment');
const log = require('debug')('Sync Roster');

const Shift = require('../components/shift/shift');
const Slot = require('../components/appointment/slot/slot');
const util = require('../components/utilities');

/* 
 * Fetches roster data ("shifts") from deputy and returns a promise
 * Accepts Deputy query as argument https://www.deputy.com/api-doc/API/Resource_Calls#page_POST_resourceobjectQUERY
 */
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


/*
 * Helpers
 */ 
function rosterDocToShift(rosterDoc){
    return new Shift({
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

/*
 * MODULE EXPORT
 */
module.exports = async function(){

    let rosterQuery, rosterData, deputyShifts;

    try{

        rosterQuery =  config.get('deputy.roster.query');

        //Get the roster data from deputy
        rosterData = await getRosterData(rosterQuery);

    } catch(err) {
        throw new Error( err.message );
    }

    deputyShifts = rosterData
        //Create new shift objects from the deputy roster data 
        .map( ( rosterDoc ) => rosterDocToShift(rosterDoc) )
        // Save the shift to the database
        .map( async (deputyShift) => {

            try{
                await Shift.findOne( { deputyRosterId: deputyShift.deputyRosterId }, function(err, shift){
                    
                    if(err) return new Error(err);
                    
                    //Check if shift already exists
                    if( shift ) {
                        deputyShift = deputyShift.toObject();
                        delete deputyShift._id;
                        delete deputyShift.isNew;
                        Object.assign( shift, deputyShift );
                    }else{ 
                        shift = deputyShift;
                    }

                    shift.save( function(err, savedShift){
                        if(err) return new Error(err);
                        deputyShift = savedShift;
                    });

                })

                return deputyShift;

            }catch(err){
                throw new Error(err); 
            }
        });

    return Promise.all(deputyShifts);;

};

