const axios = require('axios');
const config = require('config');
const shifts = require('../components/shifts/shifts');
const Shift = shifts.Model;



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

        let allRosterData =[], response;
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
        
        console.log('All roster data size: ', allRosterData.length);
        return allRosterData;

    } catch(err) {
        throw new Error(err);
    }

}


//Gets shifts roster data (shifts) from Deputy and syncs it with Setting Guidelines Shifts
async function syncShiftsWithDeputyRoster(){

    try{
        const rosterData = await getRosterData();
        const shiftsArray = shifts.parseDeputyRoster(rosterData);

        shifts.upsertByDeputyRosterId(shiftsArray);

    } catch(error) {
        throw new Error(error.message);
    }

}

syncShiftsWithDeputyRoster();

