import requests
import Adafruit_DHT
import HPMA115S0
import sys
import os
import socket

DHT22Pin = 4 #One-wire pin
MHZ19Pin = 19 #Pwm pin
hpma115S0 = HPMA115S0.HPMA115S0("/dev/ttyAMA0")

hostname = None
role = None
joinToken = None
deviceId = None
temperaturevalue = None
humidityvalue = None
pm25value = None
pm10value = None
ozonevalue = None
carbonmonoxidevalue = None
carbondioxidevalue = None
nitrogendioxidevalue = None

def RegisterDevice():
    #url = "http://" + hostname +".local:3000/api/device/register"
    url = "http://127.0.0.1:3000/api/device/register"
    headers = {"Content-Type": "application/json"}
    data = '{ "hostname": "' + str(hostname) + '", "manager": ' + str(1 if role == "manager" else 0) + ' }'

    print("Device was not registered yet, registering device...")
    response = requests.post(url, headers = headers, data = data)
    responseBody = response.json()

    # Checking status:
    if (response.status_code == requests.codes.ok):
        return responseBody["deviceId"];
    else:
        return None

def FetchDeviceId():
    #url = "http://" + hostname +".local:3000/api/device/id?hostname=" + str(hostname)
    url = "http://127.0.0.1:3000/api/device/id?hostname=" + str(hostname)
    headers = {"Content-Type": "application/json"}

    print("Requesting device id...")
    response = requests.get(url, headers=headers)
    responseBody = response.json()

    print("Fetched response...")
    #Checking status:
    if(response.status_code == requests.codes.ok):
        return responseBody["deviceId"]
    else:
        #checking if not registered:
        if('registered' in responseBody and not responseBody['registered']):
            return RegisterDevice()
        else:
            return None

def RegisterJoinToken():
    print("Registering join-token to database..")
    url = "http://127.0.0.1:3000/api/device/" + str(deviceId) + "/jointoken"
    headers = {"Content-Type": "application/json"}
    data = '{ "joinToken": "' + str(joinToken) + '" }'

    response = requests.post(url, headers=headers, data=data)

    # Checking status:
    if (response.status_code == requests.codes.ok):
        return True
    else:
        return False

def Initialize():
    global hostname, deviceId, role, joinToken

    #fetching hostname:
    hostname  = socket.gethostname()
    role = sys.argv[1]
    joinToken = sys.argv[2] if len(sys.argv) == 3 else None
    # hostname = os.environ["HOSTNAME"]
    # role = os.environ["ROLE"]
    # joinToken = os.environ["JOINTOKEN"]

    # print("devicename: " + hostname)
    # print("role: " + role)
    # print("save: " + str(joinToken) if joinToken else "")

    #Fetching deviceId
    deviceId = FetchDeviceId()
    print("Device id: " + str(deviceId))

    #Checking if joinToken is empty
    if(joinToken and len(joinToken) > 0 ):
        RegisterJoinToken()

    #future: Fetch sensos from db.
    hpma115S0.init()

    return

def ReadSensors():
    global humidityvalue, temperaturevalue, pm25value, pm10value

    #reading temperature and humidity values:
    humidityvalue, temperaturevalue = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, DHT22Pin)

    #reading findedust values:
    if(hpma115S0.readParticleMeasurement()):
        pm25value = hpma115S0._pm2_5
        pm10value = hpma115S0._pm10


    return

def FetchJsonString():
    # Parsing to json:
    json = '{ \"deviceId\": ' + str(deviceId) + ', \"sensorData\": ['

    if(temperaturevalue != None and humidityvalue != None):
        json += "{ \"sensorId\": 1, \"name\":\"humTempSensor\", \"sensorName\":\"DHT22\", \"temperature\":\"" + str(
            temperaturevalue) + "\", \"humidity\":\"" + str(humidityvalue) + "\"}"

    if(pm25value != None and pm10value != None):
        json += ",{ \"sensorId\": 2,\"name\":\"fineDustSensor\", \"sensorName\":\"HPMA115S0\", \"pm25\":\"" + str(
            pm25value) + "\", \"pm10\":\"" + str(pm10value) + "\"}"

    if(ozonevalue != None):
        json += "{ \"sensorId\": 4,\"name\":\"ozoneSensor\", \"sensorName\":\"Ozone2Click\", \"ozoneValue\":\"" + str(
            ozonevalue) + "\"}"

    if(carbondioxidevalue != None):
        json += "{ \"sensorId\": 3,\"name\":\"carbonDioxideSensor\", \"sensorName\":\"MH-Z19\", \"carbonDioxideValue\":\"" + str(
            carbondioxidevalue) + "\"}"

    if(nitrogendioxidevalue != None and carbonmonoxidevalue != None):
        json += "{ \"sensorId\": 5,\"name\":\"multiGasSensor\", \"sensorName\":\"MiCS-6814\", \"carbonMonoxideValue\":\"" + str(
            carbonmonoxidevalue) + "\", \"nitrogenDioxideValue\":\"" + str(nitrogendioxidevalue) + "\"}"

    json += "] }"

    return json

def SendSensorData(sensorData):
    url = "http://127.0.0.1:3000/api/data/insert"
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers = headers, data = sensorData)

    return response.json()

def ResetFields():
    global  temperaturevalue, humidityvalue, pm25value, pm10value, ozonevalue, carbonmonoxidevalue, carbondioxidevalue, nitrogendioxidevalue
    temperaturevalue = None
    humidityvalue = None
    pm25value = None
    pm10value = None
    ozonevalue = None
    carbonmonoxidevalue = None
    carbondioxidevalue = None
    nitrogendioxidevalue = None

    return

#initializing sensors that need it:
Initialize()

#Main loop
while True:

    #Grabbing sensor data:
    ReadSensors()

    #Converting sensorData to json:
    output = FetchJsonString()

    print(output)
    #Send sensor data to api:
    SendSensorData(output)

    #restoring sensorData fields:
    ResetFields()


