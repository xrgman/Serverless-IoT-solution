# FROM arm32v6/python:3.7.0b1-alpine3.7
#FROM python:3-slim-jessie
#
#WORKDIR /app/tmp
#
## RUN apk --no-cache add git gcc
##RUN apt-get update
#RUN apt-get update && apt-get install -y git gcc
#RUN git clone https://github.com/adafruit/Adafruit_Python_DHT
#
#WORKDIR /app/tmp/Adafruit_Python_DHT
#
#RUN python setup.py install --force-pi
#
#WORKDIR /app
#ADD . /app
#
#CMD [ "python", "./python.py" ]


#this is it:
#FROM python:slim-jessie

# Use a single layer to minimize image size
#RUN apt-get -q update && apt-get -qy install python-dev python-pip gcc git && pip install rpi.gpio


#FROM arm32v6/node:alpine
#
#WORKDIR /app
#
#ADD package.json /app
#RUN npm install
#
#ADD server.js /app
#
#EXPOSE 3000
#
#CMD [ "npm", "start"]
#
#FROM arm32v6/postgres:alpine
#
#WORKDIR /app
#ADD InitialiseDatabase.sql /app
#
#EXPOSE 5432

FROM whek/armv6-python-gpio

WORKDIR /app/tmp
RUN git clone https://github.com/adafruit/Adafruit_Python_DHT

WORKDIR /app/tmp/Adafruit_Python_DHT
RUN python setup.py install --force-pi2

RUN pip install pyserial requests

WORKDIR /app
ADD SensorReading.py HPMA115S0.py /app/

CMD [ "python", "-u", "./SensorReading.py" ]

