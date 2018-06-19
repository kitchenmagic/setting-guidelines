const axios = require('axios');
const firebase = require('firebase/app')
require('firebase/auth');
require('firebase/database');
const log = require('debug')('log');
const config = require('config');
// const express = require('express');
// const app = express();


log(config.get('firebase'));
firebase.initializeApp(config.get('firebase'));


function writeShiftData(shiftData){

    firebase.database().ref('shifts').update(shiftData, (err)=>{
        if(err){
            log(err);
        }
    })
}


function getScheduledShifts(){
    "use strict";

    return getRosterData()
    .then( ( response ) => { 
        if( response.status === 200 ){

            const shiftData = response.data;
            const shifts = {};
            for( let key in shiftData){
                let shift = new Shift(shiftData[key]);
                shifts[shift.id] = shift;
            }
            // return shiftData.map( (value) => { return new Shift(value); });;
            return shifts;
        } else {
            throw new Error(response.status);
        }
    }).catch( (err)=>{ 
        throw new Error(err);
    });


    //Fetches roster data (aka shifts) from deputy returns a promise
    function getRosterData(){

        const postOptions = 
        {
            method:'POST',
            url: config.get('deputyAPI.rosterPath') + 'QUERY',
            json: true,
            headers:
            {
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                authorization: config.get('deputyAPI.authToken')
            },
            data: //Query 
            {
                search:
                {
                    StartDate: { field: 'Date', data: '2017-02-15', type: 'ge' },
                    EndDate: { field: 'Date', data: '2017-02-16', type: 'le' }
                },
                max: 10,
                group: ['Employee']
            }
        };

        return axios(postOptions);
    }

    
    function Shift(rosterShift){
        this.id = rosterShift.Id;
        this.deputyRosterId = rosterShift.Id;
        this.startDateTime = rosterShift.StartTimeLocalized;
        this.endDateTime = rosterShift.EndTimeLocalized;
        this.regionName = rosterShift._DPMetaData.OperationalUnitInfo.OperationalUnitName;
        this.employeeId = rosterShift._DPMetaData.OperationalUnitInfo.Id;
        this.regionNumber = null;
        if(this.regionName.search(/Region/i) >= 0) {
            this.regionNumber = parseInt(this.regionName.substr(-(this.regionName.length - 6)).trim());
        }
    }
    
}

getScheduledShifts().then((shifts)=>{
    log("NEW",shifts);

    writeShiftData(shifts);
});











function getAvailabilityData(){

    const uri = 'https://setting-guidelines.firebaseio.com/appointment-availability.json';

    const headers = {
        "content-type": "application/json",
        "accept": "application/json"
    }

    const options = {
        uri: uri,
        method: 'GET',
        headers: headers
    }

    function reqCallback( error, res, body ){
        if (!error && res.statusCode == 200) {
            log('Body', JSON.parse(body));
        } else {
            log('Error: ', error);
        }
    }

    request(JSON.stringify(options), reqCallback);

}











/*
    Tasks
        1) Get roster data from deputy
            - Nightly refresh of all data
            - Webhooks for roster CRUDs
        2) Update database with cleaned capacity data
        3) Get appointment data 


    1) Get Sales Capacity

    2) Get Booked Appointments
    3) Compute Appointment Availability
    4) Write Appointment Availability to Database




    API REQUESTS
        GETs
            appointment availability
            booked appointments
            salesperson availability

        POSTs
            booked appointments




*/