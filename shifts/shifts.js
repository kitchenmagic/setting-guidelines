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

module.exports.getScheduledShifts();