var express = require('express');
var bodyParser = require("body-parser");
const {Pool} = require("pg");

var app = express();
var jsonParser = bodyParser.json();

app.all('*', function(req, res, next) {
   res.header('Content-Type', 'application/json');
   res.header('Access-Control-Allow-Origin', '*');
   next();
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

//Setting routing:
var dataController = require('./dataController');
var deviceController = require('./deviceController');
var router = express.Router();

//Data routes
router.route('/data/:id/temperature').get(dataController.temperature);
router.route('/data/:id/humidity').get(dataController.humidity);
router.route('/data/:id/finedust2.5').get(dataController.finedust25);
router.route('/data/:id/finedust10').get(dataController.finedust10);
router.route('/data/:id/ozone').get(dataController.ozone);
router.route('/data/:id/carbon_monoxide').get(dataController.carbonMonoxide);
router.route('/data/:id/carbon_dioxide').get(dataController.carbonDioxide);
router.route('/data/:id/nitrogen_dioxide').get(dataController.nitrogenOxide);
router.route('/data/:id/current_data').get(dataController.currentData);

router.route('/data/:id/temperature').post(dataController.temperature);
router.route('/data/:id/humidity').post(dataController.humidity);
router.route('/data/:id/finedust2.5').post(dataController.finedust25);
router.route('/data/:id/finedust10').post(dataController.finedust10);
router.route('/data/:id/ozone').post(dataController.ozone);
router.route('/data/:id/carbon_monoxide').post(dataController.carbonMonoxide);
router.route('/data/:id/carbon_dioxide').post(dataController.carbonDioxide);
router.route('/data/:id/nitrogen_dioxide').post(dataController.nitrogenOxide);
router.route('/data/insert').post(dataController.insert);

//Device routes:
router.route('/device/id').get(deviceController.id);
router.route('/device/list').get(deviceController.list);
router.route('/device/list_unregistered').get(deviceController.listUnregistered);
router.route('/device/jointoken').get(deviceController.getJoinToken);
router.route('/device/:id/sensors').get(deviceController.listSensors);
router.route('/device/:id').get(deviceController.device);

router.route('/device/register').post(deviceController.register);
router.route('/device/:id/name').post(deviceController.name);
router.route('/device/:id/jointoken').post(deviceController.jointoken);
router.route('/device/:id/active').post(deviceController.active);
router.route('/device/:id/sensors/add').post(deviceController.addSensor);
router.route('/device/:id/sensors/remove').post(deviceController.removeSensor);

app.use(jsonParser);
app.use('/api', router);

//Setting up database:
const config = {
    user: 'nodeserver',
    password: 'nodeserverpassword',
    database: 'sis_datastorage',
    port: 5432,
    host: 'database'
}

const pool = new Pool(config);
app.pool = pool;

app.listen(3000, function () {
  console.log('Serverless IoT solution API running on port 3000');
});

//Listing helper functions:
exports.checkDeviceId = async function (db, deviceId) {
    var query = {
        text: 'SELECT id FROM tbl_devices WHERE id = $1',
        values: [deviceId]
    };

    //Check if device id is valid:
    var result = await db.query(query);
    return result.rows.length < 1 ? false : true;
}

exports.checkSensorId = async function (db, sensorId) {
    var query = {
        text: 'SELECT id FROM tbl_sensors WHERE id = $1',
        values: [sensorId]
    };

    //Check if device id is valid:
    var result = await db.query(query);
    return result.rows.length < 1 ? false : true;
}