var helper = require('./server');

module.exports = {
    register: registerDevice,
    name: registerDeviceName,
    jointoken: registerJoinToken,
    getJoinToken: fetchJoinToken,
    active: registerActive,
    addSensor: addSensor,
    removeSensor: removeSensor,
    id: fetchDeviceId,
    list: fetchDevices,
    listAll: fetchAllDevices,
    listSensors: fetchDeviceSensors
};

function registerDevice(req, res) {

    if(req.body.hasOwnProperty('hostname') && req.body.hostname.trim() && req.body.hasOwnProperty('manager')) {

        var queryText = 'INSERT INTO tbl_devices(hostname, isManager) VALUES($1, $2) RETURNING id';

        req.app.pool.query(queryText, [req.body.hostname, req.body.manager], (err, queryRes) => {
          if (err) {
              res.writeHead(500);
              res.end("{ \"error\": \"" + err.stack + "\"}");
          } else {
              res.send("{ \"deviceId\": " + queryRes.rows[0].id + "}");
          }
        });
    }
    else {
        res.writeHead(400);
        res.end('{ "error": "Invalid body, expected a valid hostname"}');
    }
}

function registerJoinToken(req, res) {
    if(req.body.hasOwnProperty('joinToken') && !isNaN(req.params.id)) {
        var name = req.body.joinToken;
        var deviceId = req.params.id;

        helper.checkDeviceId(req.app.pool, deviceId).then(function (result) {
            if(result) {

                //Removing old Join-token:
                query = {
                    text: 'UPDATE tbl_devices SET jointoken = null'
                }

                req.app.pool.query(query, (err, queryRes) => {
                    if (err) {
                        res.writeHead(500);
                        res.end("{ \"error\": \"" + err.stack + "\"}");
                    } else {
                        //Changing name of the device
                        query = {
                            text: 'UPDATE tbl_devices SET jointoken = $1 WHERE id = $2',
                            values: [name, deviceId]
                        }

                        req.app.pool.query(query, (err, queryRes) => {
                            if (err) {
                                res.writeHead(500);
                                res.end("{ \"error\": \"" + err.stack + "\"}");
                            } else {
                                res.send('{ "joinToken": "' + name + '" }');
                            }
                        });
                    }
                });
            }
            else {
                res.writeHead();
                res.end('{ "error": "Invalid device_id"}');
            }
        });
    }
    else { //Invalid body
        res.writeHead(400);
        res.end('{ "error": "Invalid body, expected a valid jointoken and a device id number"}');
    }
}

function registerDeviceName(req, res) {

    if(req.body.hasOwnProperty('name') && !isNaN(req.params.id)) {
        var name = req.body.name;
        var deviceId = req.params.id;

        helper.checkDeviceId(req.app.pool, deviceId).then(function (result) {
            if(result) {
               //Changing name of the device
                query = {
                    text: 'UPDATE tbl_devices SET name = $1 WHERE id = $2',
                    values: [name, deviceId]
                }

                req.app.pool.query(query, (err, queryRes) => {
                    if (err) {
                        res.writeHead(500);
                        res.end("{ \"error\": \"" + err.stack + "\"}");
                    } else {
                        res.send('{ "name": "' + name + '" }');
                    }
                });
            }
            else {
                res.writeHead();
                res.end('{ "error": "Invalid device_id"}');
            }
        });
    }
    else { //Invalid body
        res.writeHead(400);
        res.end('{ "error": "Invalid body, expected a valid name and a device id number"}');
    }
}

function registerActive(req, res) {
    if(req.body.hasOwnProperty('active') && !isNaN(req.params.id) && (req.body.active === 1 || req.body.active === 0)) {
        var active = req.body.active;
        var deviceId = req.params.id;

        helper.checkDeviceId(req.app.pool, deviceId).then(function (result) {
           if(result) {
                //Changing name of the device
                query = {
                    text: 'UPDATE tbl_devices SET active = $1 WHERE id = $2',
                    values: [active, deviceId]
                }

                req.app.pool.query(query, (err, queryRes) => {
                    if (err) {
                        res.writeHead(500);
                        res.end("{ \"reason\": \"" + err.stack + "\"}");
                    } else {
                        res.send('{ "active": ' + (active === 1 ? 'true' : 'false') + ' }');
                    }
                });
           }
           else {
                res.writeHead(400);
                res.end('{ "error": "Invalid deviceId"}');
           }
        });
    }
    else { //Invalid body
        res.writeHead(400);
        res.end('{ "error": "Invalid body, expected a valid name and deviceId"}');
    }
}

function addSensor(req, res) {
    if(req.body.hasOwnProperty('sensorId') && !isNaN(req.params.id) && !isNaN(req.body.sensorId)) {
        var sensorId = req.body.sensorId;
        var deviceId = req.params.id;

        //Checking if device id is valid:
        helper.checkDeviceId(req.app.pool, deviceId).then(function (result) {
           if(result) {

               //Checking if sensorId is valid:
               helper.checkSensorId(req.app.pool, sensorId).then(function (result) {
                    if(result) {
                        //Adding sensor to device:
                        query = {
                            text: 'INSERT INTO tbl_devicesensors(deviceid, sensorid) VALUES($1, $2)',
                            values: [deviceId, sensorId]
                        }

                        req.app.pool.query(query, (err, queryRes) => {
                            if (err) {
                                res.writeHead(500);
                                res.end("{ \"reason\": \"" + err.stack + "\"}");
                            } else {
                                res.send('{ "message": "Sensor with the id ' + sensorId + ' added to the device" }');
                            }
                        });
                    }
                    else {
                        res.writeHead(400);
                        res.end('{ "error": "Invalid sensorId"}');
                    }
               });
           }
           else {
                res.writeHead(400);
                res.end('{ "error": "Invalid deviceId"}');
           }
        });
    }
    else { //Invalid body
        res.writeHead(400);
        res.end('{ "reason": "Invalid body, expected a valid sensorId and deviceId"}');
    }
}

function removeSensor(req, res) {
    if(req.body.hasOwnProperty('sensorId') && !isNaN(req.params.id) && !isNaN(req.body.sensorId)) {
        var sensorId = req.body.sensorId;
        var deviceId = req.params.id;

        //Checking if device id is valid:
        helper.checkDeviceId(req.app.pool, deviceId).then(function (result) {
           if(result) {

               //Checking if device has this sensor:
               query = {
                   text: 'SELECT id FROM tbl_devicesensors where deviceid = $1 AND sensorId = $2',
                   values: [deviceId, sensorId]
               }

               req.app.pool.query(query, (err, queryRes) => {
                   if (err) {
                       res.writeHead(500);
                       res.end("{ \"error\": \"" + err.stack + "\"}");
                   } else if(queryRes.rows.length <= 0) {
                       res.writeHead(404);
                       res.end('{ "error": "Device does not have this sensor" }');
                   } else {

                       //Removing sensor from device:
                       query = {
                           text: 'DELETE FROM tbl_devicesensors WHERE deviceid = $1 AND sensorId = $2',
                           values: [deviceId, sensorId]
                       }

                       req.app.pool.query(query, (err, queryRes) => {
                           if (err) {
                               res.writeHead(500);
                               res.end("{ \"reason\": \"" + err.stack + "\"}");
                           } else {
                               res.send('{ "message": "Sensor with the id ' + sensorId + ' remove from the device"  }');
                           }
                        });
                   }
               });
           }
           else {
                res.writeHead(400);
                res.end('{ "error": "Invalid deviceId"}');
           }
        });
    }
    else { //Invalid body
        res.writeHead(400);
        res.end('{ "error": "Invalid body, expected a valid sensorId and deviceId"}');
    }
}

function fetchDeviceId(req, res) {

    var hostname = req.query.hostname;
    var queryText = 'SELECT id FROM tbl_devices WHERE hostname = $1';

    req.app.pool.query(queryText, [hostname], (err, queryRes) => {
      if (err) {
          res.writeHead(500);
          res.end("{ \"reason\": \"" + err.stack + "\"}");
      } else {
          if(!queryRes.rows[0]) {
              res.writeHead(404);
              res.end('{ "registered": false, "error": "Device not registered yet" }');
          }
          else {
              res.send('{ "deviceId": ' + queryRes.rows[0].id + ' }');
          }
      }
    });
}

function fetchJoinToken(req, res) {

    var queryText = 'SELECT jointoken FROM tbl_devices WHERE jointoken IS NOT NULL';

     req.app.pool.query(queryText, (err, queryRes) => {
       if (err) {
           res.writeHead(500);
           res.end("{ \"reason\": \"" + err.stack + "\"}");
       } else {
           if(!queryRes.rows[0]) {
               res.writeHead(404);
               res.end('{  "error": "No Jointoken available" }');
           }
           else {
               res.send('{ "joinToken": "' + queryRes.rows[0].jointoken + '" }');
           }
       }
    });
}

function fetchDevices(req, res) {

    var query = {
        text: 'SELECT * FROM tbl_devices WHERE name is not null'
    }

    req.app.pool.query(query, (err, queryRes) => {
        if (err) {
            res.writeHead(500);
            res.end('{ "error": ' + err.stack + '}');
        } else {
            res.send('{ "devices": ' + JSON.stringify(queryRes.rows) + ' }');
        }
    });
}

function fetchAllDevices(req, res) {
var query = {
        text: 'SELECT * FROM tbl_devices'
    }

    req.app.pool.query(query, (err, queryRes) => {
        if (err) {
            res.writeHead(500);
            res.end('{ "error": ' + err.stack + '}');
        } else {
            res.send('{ "devices": ' + JSON.stringify(queryRes.rows) + ' }');
        }
    });
}

function fetchDeviceSensors(req, res) {

    if (!isNaN(req.params.id)) {

        deviceId = req.params.id;

        //Checking if the device id exists:
        helper.checkDeviceId(req.app.pool, deviceId).then(function (result) {
            if(result) {
                //Fetching all the sensors
                query = {
                    text: 'SELECT ds.sensorid, s.name, s.description from tbl_devicesensors ds INNER JOIN tbl_sensors s ON ds.sensorid = s.id where ds.deviceid = $1',
                    values: [deviceId]
                }

                req.app.pool.query(query, (err, queryRes) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('{ "error": "' + err.stack + '" }');
                    } else {
                        res.send('{ "sensors": ' + JSON.stringify(queryRes.rows) + '  }');
                    }
                });
            }
            else {
                res.writeHead(400);
                res.end('{ "error": "Invalid deviceId"}');
            }
        });
    }
    else {
        res.writeHead(400);
        res.end('{ "error": "Please make sure you input a device id number" }');
    }
}
