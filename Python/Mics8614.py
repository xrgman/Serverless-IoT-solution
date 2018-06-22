from smbus import SMBus
import time

ADDR_IS_SET = 0x00  #if this is the first time to run, if 1126, set
ADDR_FACTORY_ADC_NH3 = 2
ADDR_FACTORY_ADC_CO = 4
ADDR_FACTORY_ADC_NO2 = 6

ADDR_USER_ADC_HN3 = 8
ADDR_USER_ADC_CO = 10
ADDR_USER_ADC_NO2 = 12
ADDR_IF_CALI = 14  #IF USER HAD CALI

ADDR_I2C_ADDRESS = 20

CH_VALUE_NH3 = 1
CH_VALUE_CO = 2
CH_VALUE_NO2 = 3

CMD_ADC_RES0 = 1 #NH3
CMD_ADC_RES1 = 2 #CO
CMD_ADC_RES2 = 3 #NO2
CMD_ADC_RESALL = 4 #ALL CHANNEL
CMD_CHANGE_I2C = 5 #CHANGE I2C
CMD_READ_EEPROM = 0x06 #READ EEPROM VALUE, RETURN UNSIGNED INT
CMD_SET_R0_ADC = 7  #SET R0 ADC VALUE
CMD_GET_R0_ADC = 8  #GET R0 ADC VALUE
CMD_GET_R0_ADC_FACTORY = 9 #GET FACTORY R0 ADC VALUE
CMD_CONTROL_LED = 10
CMD_CONTROL_PWR  = 11

class Mics8614:

    def __init__(self, address, bus):
        self.r0_inited = False
        self.address = address
        self.bus = SMBus(bus)
        self.adcValueR0_NH3_Buf = None;
        self.adcValueR0_CO_Buf = None;
        self.adcValueR0_NO2_Buf = None;
        self.version = self.getVersion()

        print("Software version of MiCS-6814: " + str(self.version))

    # Get the current software version of the sensor:
    def getVersion(self):

        if(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_IS_SET) == 1126):
            self.version = 2
        else:
            self.version = 1

        return self.version

    def get_addr_dta(self, addr_reg):

        buffer = None

        while (buffer == None or (buffer[0] == 255 and buffer[1] == 255)):
            # sending request:
            self.bus.write_byte(self.address, addr_reg)

            try:
                buffer = self.bus.read_i2c_block_data(self.address, addr_reg, 2)
            except:
                continue

        dta = buffer[0];
        dta = (dta << 8) + buffer[1]

        # Ammoniak value:
        if(addr_reg == CH_VALUE_NH3):
            if (dta > 0):
                self.adcValueR0_NH3_Buf = dta;
            else:
                dta = self.adcValueR0_NH3_Buf;
        # Carbonmonoxide value:
        elif(addr_reg == CH_VALUE_CO):
            if (dta > 0):
                self.adcValueR0_CO_Buf = dta;
            else:
                dta = self.adcValueR0_CO_Buf;
        # Sulferdioxide value:
        elif(addr_reg == CH_VALUE_NO2):
            if (dta > 0):
                self.adcValueR0_NO2_Buf = dta;
            else:
                dta = self.adcValueR0_NO2_Buf;

        return dta;

    def get_addr_dta_register(self, addr_reg, __dta):

        buffer = None

        while(buffer == None or (buffer[0] == 255 and buffer[1] == 255)):
            # sending request:
            self.bus.write_byte_data(self.address, addr_reg, __dta)

            try:
                buffer = self.bus.read_i2c_block_data(self.address, addr_reg, 2)
            except:
                continue

        dta = buffer[0];
        dta = (dta << 8) + buffer[1]

        return dta

    # Powering on the heater:
    def powerOn(self):
        if (self.version == 1):
            self.bus.write_byte(self.address, 0x21)
        elif(self.version == 2):
            self.bus.write_byte_data(self.address, 0xB, 0x01)

        self.ledOn()
        print("Heater powered on!")

    # Powering off the heater:
    def powerOff(self):
        if (self.version == 1):
            self.bus.write_byte(self.address, 0x20)
        elif(self.version == 2):
            self.bus.write_byte_data(self.address, 0xB, 0x00)

        self.ledOff()
        print("Heater powered off!")

    # Turn on the heater led:
    def ledOn(self):
        self.bus.write_byte_data(self.address, CMD_CONTROL_LED, 1)

    # Turn off the heater led:
    def ledOff(self):
        self.bus.write_byte_data(self.address, CMD_CONTROL_LED, 0)

    # Display information about the device
    def display_eeprom(self):

        if(self.version == 1):
            print("ERROR: display_eeprom() is NOT support by V1 firmware.")
            return

        print("ADDR_IS_SET = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_IS_SET)))
        print("ADDR_FACTORY_ADC_NH3 = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_FACTORY_ADC_NH3)))
        print("ADDR_FACTORY_ADC_CO = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_FACTORY_ADC_CO)));
        print("ADDR_FACTORY_ADC_NO2 = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_FACTORY_ADC_NO2)));
        print("ADDR_USER_ADC_HN3 = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_USER_ADC_HN3)));
        print("ADDR_USER_ADC_CO = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_USER_ADC_CO)));
        print("ADDR_USER_ADC_NO2 = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_USER_ADC_NO2)));
        print("ADDR_I2C_ADDRESS = " + str(self.get_addr_dta_register(CMD_READ_EEPROM, ADDR_I2C_ADDRESS)));


#https://www.kernel.org/doc/Documentation/i2c/smbus-protocol
