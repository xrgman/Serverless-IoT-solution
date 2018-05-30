--creating database:
CREATE DATABASE sis_datastorage;

--Moving inside the database:
\c sis_datastorage

--Initialising tables:
CREATE TABLE tbl_devices(
    id serial primary key,
    hostname varchar(128) unique not null,
    name varchar(255),
    active bit default 0::bit not null,
    isManager bit default 0::bit not null,
    jointoken varchar(255));

CREATE TABLE tbl_sensors(
    id serial primary key,
    name varchar(128) not null,
    description varchar(255) not null);

CREATE TABLE tbl_devicesensors(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    unique (deviceId, sensorId));

CREATE TABLE tbl_dataTemperature(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value float not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataHumidity(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value float not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataFinedust25(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value integer not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataFinedust10(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value integer not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataOzone(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value integer not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataCarbonMonoxide(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value integer not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataCarbonDioxide(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value integer not null,
    created TIMESTAMPTZ default now() not null);

CREATE TABLE tbl_dataNitrogenOxide(
    id bigserial primary key,
    deviceId integer REFERENCES tbl_devices(id) not null,
    sensorId integer REFERENCES tbl_sensors(id) not null,
    value integer not null,
    created TIMESTAMPTZ default now() not null);

INSERT INTO tbl_sensors(name, description) VALUES('DHT22', 'Humidity & temperature sensor');
INSERT INTO tbl_sensors(name, description) VALUES('Honeywell HPMA115S0', 'Finedust sensor PM2.5 & PM10');
INSERT INTO tbl_sensors(name, description) VALUES('MH-Z19', 'Carbon dioxide sensor');
INSERT INTO tbl_sensors(name, description) VALUES('Ozone2Click', 'Ozone sensor');
INSERT INTO tbl_sensors(name, description) VALUES('MiCS-6814', 'Carbon monxide & Nitrogen oxide sensor');