var helper = require('./server')

module.exports = {
    insert: insertData,
    temperature: fetchTemperatureData,
    humidity: fetchHumidityData,
    finedust25: fetchFineDust25Data,
    finedust10: fetchFineDust10Data,
    ozone: fetchOzoneData,
    carbonMonoxide: fetchCarbonMonoxideData,
    carbonDioxide: fetchCarbonDioxideData,
    nitrogenOxide: fetchNitrogenOxideData,
    currentData: fetchCurrentData
};

var table = Object.freeze({
    temperature: { value: 1, name: 'temperature', tableName: 'tbl_dataTemperature'},
    humidity: { value: 2, name: 'humidity', tableName: 'tbl_dataHumidity'},
    pm25: { value: 3, name: 'pm2.5', tableName: 'tbl_dataFinedust25'},
    pm10: { value: 4, name: 'pm10', tableName: 'tbl_dataFinedust10'}
});


function insertData(req, res) {
    //Checking if body is not empty:
    if (req.body && req.body.deviceId && req.body.sensorData && !isNaN(req.body.deviceId)) {

        //Check deviceid:
        helper.checkDeviceId(req.app.pool, req.body.deviceId).then(function (result) {
           if (result) {
               var deviceId = req.body.deviceId;
               var successfull = 0, unsuccessfull = 0;
               var promises = [];

               //Looping over all the sensors:
               req.body.sensorData.forEach(function (val) {
                   if (val.sensorId == 1) {
                       promises.push(insertSensorData(req.app.pool, deviceId, val.temperature, val.sensorId, table.temperature));
                       promises.push(insertSensorData(req.app.pool, deviceId, val.humidity, val.sensorId, table.humidity));
                   }
                   if (val.sensorId == 2) {
                       promises.push(insertSensorData(req.app.pool, deviceId, val.pm25, val.sensorId, table.pm25));
                       promises.push(insertSensorData(req.app.pool, deviceId, val.pm10, val.sensorId, table.pm10));
                   }
               });

               //Waiting for the results:
               Promise.all(promises).then(function (result) {
                   for(var i = 0; i < promises.length; i++) {
                       result[i] ? successfull++ : unsuccessfull++;
                   }

                   var status = unsuccessfull == 0 ? "Successfull" : successfull == 0 ? "Unsuccessfull" : "Warning";
                   res.send('{ "status": "' + status + '", "successfull": ' + successfull + ', "unsuccessfull": ' + unsuccessfull + ' }');
               }).catch(e => console.error(e.stack));
           }
           else {
               res.writeHead(400);
               res.end('{ "error": "Invalid device_id."}');
           }
        });
    }
    else {
        res.writeHead(400);
        res.end('{ "error": "No device id or sensor data available".}');
    }
}

function insertSensorData(db, deviceId, data, sensorId, type) {

    var query = {
        text: 'INSERT INTO ' + type.tableName + '(deviceid, sensorid, value) VALUES($1, $2, $3)',
        values: [deviceId, sensorId, data]
    }

    // //Posting data to database:
    return new Promise((resolve, reject) => {
        db.query(query, (err) => {
            if (err) {
                console.log("Failed to insert sensor " + type.name + " data, error: " + err.stack);
                resolve(false);
            } else {
                console.log("Successfully inserted " + data + " data into " + type.name + " database");
                resolve(true);
            }
        });
    });
}

async function fetchTemperatureData(req, res) {
    var temperatureData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datatemperature");

    //Checking if valid data was fetched, else send error message:
    if(temperatureData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(temperatureData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(temperatureData);
    }
}

async function fetchHumidityData(req, res) {
    var humidityData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datahumidity");

    //Checking if valid data was fetched, else send error message:
    if(humidityData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(humidityData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(humidityData);
    }
}

async function fetchFineDust25Data(req, res) {
    var fineDustData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datafinedust25");

    //Checking if valid data was fetched, else send error message:
    if(fineDustData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(fineDustData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(fineDustData);
    }
}

async function fetchFineDust10Data(req, res) {
    var fineDustData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datafinedust10");

    //Checking if valid data was fetched, else send error message:
    if(fineDustData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(fineDustData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(fineDustData);
    }
}

async function fetchOzoneData(req, res) {
    var ozoneData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_dataozone");

    //Checking if valid data was fetched, else send error message:
    if(ozoneData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(ozoneData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(ozoneData);
    }
}

async function fetchCarbonMonoxideData(req, res) {
    var carbonMonoxideData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datacarbonmonoxide");

    //Checking if valid data was fetched, else send error message:
    if(carbonMonoxideData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(carbonMonoxideData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(carbonMonoxideData);
    }
}

async function fetchCarbonDioxideData(req, res) {
    var carbonDioxideData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datacarbondioxide");

    //Checking if valid data was fetched, else send error message:
    if(carbonDioxideData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(carbonDioxideData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(carbonDioxideData);
    }
}

async function fetchNitrogenOxideData(req, res) {
    var nitrogenOxideData = await fetchSensorData(req.app.pool, req.params.id, req.body, "tbl_datanitrogenoxide");

    //Checking if valid data was fetched, else send error message:
    if(nitrogenOxideData.constructor === Array)
    {
        res.send('{ "data": ' + JSON.stringify(nitrogenOxideData) + ' }');
    }
    else {
        res.writeHead(400);
        res.end(nitrogenOxideData);
    }
}

async function fetchCurrentData(req, res) {
    var deviceId = req.params.id;

    if(!isNaN(deviceId)) {

        //Checking if the device id is valid:
        helper.checkDeviceId(req.app.pool, deviceId).then(async function (result) {
            if (result) {

                var temperature = await fetchCurrentDataFromTable(req.app.pool, deviceId, 'tbl_datatemperature');
                var humidity = await fetchCurrentDataFromTable(req.app.pool, deviceId, 'tbl_datahumidity');
                var pm25 = await fetchCurrentDataFromTable(req.app.pool, deviceId, 'tbl_datafinedust25');
                var pm10 = await fetchCurrentDataFromTable(req.app.pool, deviceId, 'tbl_datafinedust10');

                res.send('{ "temperature": ' + temperature.value +
                    ', "humidity": ' + humidity.value +
                    ', "fineDust25": ' + pm25.value +
                    ', "fineDust10": ' + pm10.value + ' }');
            }
            else {
               return '{ "error": "Invalid device id."}';
            }
        });
    }
    else {
        return '{ "error": "Invalid deviceId, a device id can only be a number.}';
    }
}

async function fetchSensorData(db, deviceId, body, tableName) {
    if(!isNaN(deviceId)) {

        //Checking if the device id is valid:
        var result = await helper.checkDeviceId(db, deviceId).then(async function (result) {
            if (result) {

                //Checking if request has body with parameters:
                var from = body.from ? body.from : undefined;
                var to = body.to ? body.to : undefined;

                //Creating query based on dates:
                var query = fetchDataQuery(deviceId, from, to, tableName);

                //Requesting sensor data:
                try {
                    var result = await db.query(query);
                    return result.rows;
                } catch(e) {
                    return '{ "error": ' + err.stack + ' }';
                }
            }
            else {
               return '{ "error": "Invalid device id."}';
            }
        });

        return result;
    }
    else {
        return '{ "error": "Invalid deviceId, a device id can only be a number.}';
    }
}

function fetchDataQuery(deviceId, from, to, tableName) {
    var queryText = 'SELECT id, deviceid, sensorid, value, created AT TIME ZONE \'MEST\' AS created FROM ' + tableName + ' WHERE deviceId = $1';

    if(from === undefined && to === undefined) {
        return {
            text: queryText,
            values: [deviceId]
        }
    }
    else if(from !== undefined && to == undefined) {
        return {
            text: queryText + ' AND created >= $2',
            values: [deviceId, from]
        }
    }
    else if(from === undefined && to !== undefined) {
        return {
            text: queryText + ' AND created <= $2',
            values: [deviceId, to]
        }
    }
    else {
        return {
            text: queryText + ' AND created >= $2 AND created <= $3',
            values: [deviceId, from, to]
        }
    }
}

async function fetchCurrentDataFromTable(db, deviceId, tableName) {
    var query = {
        text: 'SELECT value FROM ' + tableName + ' WHERE deviceid = $1 ORDER BY created DESC limit 1',
        values: [deviceId]
    };

    //Requesting sensor data:
    try {
        var result = await db.query(query);
        return result.rows[0];
    } catch(e) {
        return '{ "error": ' + err.stack + ' }';
    }
}
