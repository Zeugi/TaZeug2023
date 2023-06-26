#!/bin/python3
import serial

class Abfrage:
    def __init__(self, address:int, maxTelNum:int, ser:serial) -> None:
        self.frame = bytearray(b'\x10\x00\x00\x00\x16')
        self.address = address
        self.maxTelNum = maxTelNum
        self.tele = []
        self.ser = ser
        self.change_address(address)

    # Zaehler auslaesen, überprüft erst ob zähler vorhanden, wenn vorhanden wird er ausgelesen
    def zaehler_auslaesen(self):
        if self.__select_zaehler():
            self.__get_telegram()

    # Initialisiert zaehler, gibt False zurück fals Zaehler nicht vorhanden
    def __select_zaehler(self)-> bool:
        self.__set_controll("SND_NKE")
        self.ser.write(self.frame)
        if self.ser.read_until(b'')[0] == 0xe5:
            return True
        else:
            return False

    # Frägt den zaehler je nach anzahl der gewünschten telegramme ab
    def __get_telegram(self):
        self.__set_controll("REQ_UD2")
        i = 0
        # Schickt abfrage Frame auf den bus, und speichert Antwort. Nach jedem durchlauf wird das REQ_UD2 Bit gedreht dammit der Zähler das nächste Telegramm losschickt,
        # das wird so lange wiederholt bis die max tele nummer ereicht ist
        while i < self.maxTelNum:
            self.ser.write(self.frame)
            self.tele.append(self.ser.read_until(b''))
            self.__set_controll("REQ_UD2_toggle")
            i += 1

    # Gibt gewünschte werte zurueck
    def get_value(self, teleNum:int, start:int, stop:int, aufloesung:float, bcd:bool):
        rawValue = self.tele[teleNum-1][start-1:stop-1]
        ruckWert = 0

        # falls wert BCD Codiert ist wird er decodiert
        if bcd:
            zahlen = []
            zahlenstr = ""
            try:
                for value in reversed(rawValue):
                    chars = bin(value)[2:].zfill(8)
                    if int(chars[0:4], 2) < 10:
                        zahlen.append(int(chars[0:4], 2))
                    if int(chars[4:], 2) < 10:
                        zahlen.append(int(chars[4:], 2))

            except:
                chars = bin(rawValue)[2:].zfill(8)
                if int(chars[0:4], 2) < 10:
                    zahlen.append(int(chars[0:4], 2))
                if int(chars[4:], 2) < 10:
                    zahlen.append(int(chars[4:], 2))

            for zahl in zahlen:
                zahlenstr += str(zahl)

            ruckWert = float(zahlenstr)

        # fals er nicht codiert ist wird er als normaler int wert zurückgegeben
        else:
            #return round((int.from_bytes(rawValue, byteorder='little', signed=True)*aufloesung),2)
            ruckWert = int.from_bytes(rawValue, byteorder='little', signed=True)
        
        if aufloesung == 0:
            return round((ruckWert),2)
        else:
            return round((ruckWert * aufloesung),2)


    # Erstellt Controll Frame, anschließend wird neue Prüfsumme erechnet
    def __set_controll(self, art:str)-> bool:
        if art == "SND_NKE":            # ZählerInitialisierung
            self.frame[1] = 0x40
        elif art == "REQ_UD2":          # ZählerDaten anfrage
            self.frame[1] = 0x5b        
        elif art == "REQ_UD2_toggle":   # ZählerDaten anfrage wiederholung
            self.frame[1] = 0x7b
        else:
            return False
        self.__make_checksum()

    # Fuegt die adresse in den Frame ein, anschließend wir eine neue Prüfsumme erechnet 
    def change_address(self, address:int)-> bool:
        if address >= 0 and address <= 250:
            self.frame[2] = address
        else:
            return False
        self.__make_checksum()

    # Berechnet die cheksum und fuegt sie in den Frame ein
    def __make_checksum(self):
        offset = 0xff - self.frame[1]
        if offset < self.frame[2]:
           self.frame[3] = (self.frame[2] - offset) - 1
        else:
            self.frame[3] = self.frame[1] + self.frame[2]
