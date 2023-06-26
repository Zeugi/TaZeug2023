#!/bin/python3

import mbus_master
import mariadb
import serial
import datetime
import json
import time

# Serieller Port mittels pySerial initialisieren
ser = serial.Serial(port='/dev/ttyUSB0', baudrate = 2400, parity=serial.PARITY_EVEN, stopbits=serial.STOPBITS_ONE, bytesize=serial.EIGHTBITS, timeout=2)

mydb = mariadb.connect(
  host="ess",
  user="energieSammler",
  password="",
  database="Energie"
)

# array für ausgelesenen Werte
ausleseWerte = []

# array für die Zähler abfrage [[Zähler Adresse],[maximale Telegram nummer],[baudrate für Abfrage],[mbus_master.Abfrage Objekt]]
zaehlers = [[],[],[],[]]

try:
    mycursor = mydb.cursor()

    ####################################################################
    # Abschnit Zähler Ausläsen und Werte zur Datenbank Schicken        #
    ####################################################################

    # Zaeler adressen und Abfragefelder von Datenbank holen
    mycursor.execute("SELECT AbfrageFelder.WertNr, AbfrageFelder.Adresse, AbfrageFelder.Bcd, AbfrageFelder.StartFeld, AbfrageFelder.EndFeld, AbfrageFelder.TeleNr, AbfrageFelder.Multiplikator, Werte.Speicherung, Z.Baudrate FROM AbfrageFelder INNER JOIN Werte on(Werte.WertNr = AbfrageFelder.WertNr) inner join Zaehler as Z on (AbfrageFelder.Adresse = Z.Adresse) WHERE Werte.Aktualisieren = true AND Werte.Berechnet = false;")

    # Empfangene daten sortieren und benötigte Zähler und ihre Max Tele nummer ausfindig zu machen
    # Empfangene Abfragefelder für Zähler speichern
    for (wertNr, adresse, bcd, startFeld, endFeld, teleNr, multiplikator, speicherung, baudrate) in mycursor:
        # Überprüfen ob Zähler vorhanden ist, falls nicht wird er zum array hinzugefügt, jeder Zähler darf nur einmal existieren
        if adresse not in zaehlers[0]:
            zaehlers[0].append(adresse)
            zaehlers[1].append(teleNr)
            zaehlers[2].append(baudrate)
        
        # Falls maximale Telenummer größer ist als die gesbeicherte Tele nummer, wiert der kleinere wert duch den höhere wert ersetzt
        if  zaehlers[1][zaehlers[0].index(adresse)] < teleNr:
            zaehlers[1][zaehlers[0].index(adresse)] = teleNr

        # benötigte Abfragefelder werden zum ausleseWerte Array hinzugefügt
        ausleseWerte.append({"WertNr": wertNr, "Adresse": adresse, "BCD": bool(bcd), "StartFeld": startFeld, "EndFeld": endFeld, "TeleNr": teleNr, "Multiplikator": multiplikator, "Speicherung": bool(speicherung)})

    # abfrage Objekt für jeden Zähler anlegen und anhand von der Max Tele nummer auslesen
    for zaehler in zaehlers[0]:
        try:
            ser.baudrate = zaehlers[2][zaehlers[0].index(zaehler)]
            if zaehlers[2][zaehlers[0].index(zaehler)] == 2400:
                ser.timeout = 2
            else:
                ser.timeout = 1
            print(zaehlers[2][zaehlers[0].index(zaehler)])
            zaehlers[3].append(mbus_master.Abfrage(zaehler, zaehlers[1][zaehlers[0].index(zaehler)], ser))
            zaehlers[3][zaehlers[0].index(zaehler)].zaehler_auslaesen()
        except:
            print(f"Zaehler {zaehler} nicht erreichbar")
        else:
            print(f"Zaehler {zaehler} erfolgreich ausgelesen")

    # Werte dekodieren und zur Datenbank Schicken
    for werte in ausleseWerte:
        try:
            # Werte aus Zähler Objekt holen und in neuerWert Zwischenspeichern
            neuerWert = zaehlers[3][zaehlers[0].index(werte["Adresse"])].get_value(werte["TeleNr"], werte["StartFeld"], werte["EndFeld"], werte["Multiplikator"], werte["BCD"])
            
            # Neue Werte mithilfe der WertNr aus ausleseWerte Array hochladen
            try: 
                mycursor.execute("Update Aktuell set Zeit = Now(), Wert = ? WHERE WertNr = ?", (neuerWert, werte["WertNr"], )) 
            except mariadb.Error as e: 
                print(f"Error: {e}")
            mydb.commit() 

            # Falls wert gespeichert werden soll wird er auch in die Verlauf tabelle hochgeladen
            if werte["Speicherung"]:
                try: 
                    mycursor.execute("INSERT INTO Verlauf(WertNr, Wert) Values(?, ?)", (werte["WertNr"], neuerWert, )) 
                except mariadb.Error as e: 
                    print(f"Error: {e}")
            mydb.commit()
            
        except:
            print(f"Fehler beim hochladen von {werte['WertNr']} für Zaehler {werte['Adresse']}")
        else:
            print(f"Wert {werte['WertNr']} für Zaehler {werte['Adresse']} erfolgreich hochegeladen")
    ####################################################################


    ####################################################################
    # Abschnit zum Berechnen der Zählerstände für: Stunde/Tag/Woche... #
    ####################################################################
    try:
        # Benötigte Werte von Datenbank holen
        mycursor.execute("SELECT ZR.Id, ZR.EingangsWertNr, ZR.AusgangsWertNr, ZR.ZeitstempelAnfang, ZR.Anfangsstand, ZR.Intervall, ZR.ZeitType, A.Wert, W.Speicherung FROM ZaehlerstandRechner as ZR inner join Aktuell as A on (ZR.EingangsWertNr = A.WertNr) inner join Werte as W on (ZR.AusgangsWertNr = W.WertNr)")
        daten = []
        # Benötigte Felder in daten JS-Objekt speichern
        for (Id, eingangsNr, ausgangsNr, zeitAnfang, anfangstand, intervall, zeitType, aktuell, speicherung) in mycursor:
            daten.append({"Id": Id, "eingangsNr" :eingangsNr, "ausgangsNr": ausgangsNr, "zeitAnfang": zeitAnfang, "anfangstand": anfangstand, "intervall": intervall, "zeitType": zeitType, "differenz": 0, "aktuell": aktuell, "speicherung": speicherung})
                    
    except mariadb.Error as e: 
        print(f"Error: {e}")

    for wert in daten:
        # Zeit Differenz zwischen letzter speicher zeit und jetzt ermitteln
        mycursor.execute(f"SELECT TIMESTAMPDIFF({wert['zeitType']},('{wert['zeitAnfang']}'),(SELECT now()));")
        for differenz in mycursor:
            wert["differenz"] = differenz[0]

        # Aktuuelle zweit zwischenspeichern
        aktuelleZeit = datetime.datetime.now()
        
        # Minuten und Sekunden auf 0 setzen um zeit Drifft zu vermeiden, start Tag und Monat auf 1 setzen
        if wert["zeitType"] == "MINUTE":
            aktuelleZeit = aktuelleZeit.replace(second= 0, microsecond= 0)
        elif wert["zeitType"] == "HOUR":
            aktuelleZeit = aktuelleZeit.replace(minute= 0, second= 0, microsecond= 0)
        elif wert["zeitType"] == "MONTH":
            aktuelleZeit = aktuelleZeit.replace(day= 1, hour= 0, minute= 0, second= 0, microsecond= 0)
        elif wert["zeitType"] == "YEAR":
            aktuelleZeit = aktuelleZeit.replace(month= 1, day= 1, hour= 0, minute= 0, second= 0, microsecond= 0)
        else:
            aktuelleZeit = aktuelleZeit.replace(hour= 0, minute= 0, second= 0, microsecond= 0)
        
        # überprüfen ob Zeit intervall überschritten
        if wert["differenz"] >= wert["intervall"]:

            # Wenn Speicherfeld gesetzt, dann wirt in Verlauf gespeichert
            if wert["speicherung"]:
                mycursor.execute("INSERT INTO Verlauf Values(?, ?, ?)", (wert["zeitAnfang"], wert["ausgangsNr"], wert["aktuell"] - wert["anfangstand"]))
                mydb.commit()

            # Falls intervall überschriten, wird der Intervall zaehler auf 0 gesetzt und die aktuelle Zeit als Startpunkt gesetzt
            mycursor.execute("Update ZaehlerstandRechner set ZeitstempelAnfang = ?, Anfangsstand = ? WHERE Id = ?", (aktuelleZeit, wert["aktuell"], wert["Id"]))
            mydb.commit()
            mycursor.execute("Update Aktuell set Zeit = Now(), Wert = ? WHERE WertNr = ?", (0, wert["ausgangsNr"]))
            mydb.commit()
        # Wenn noch nicht überschritten wird der Aktuelle stand angepast
        else:
            mycursor.execute("Update Aktuell set Zeit = Now(), Wert = ? WHERE WertNr = ?", (wert["aktuell"] - wert["anfangstand"], wert["ausgangsNr"]))
            mydb.commit()
    ####################################################################



    ####################################################################
    # Abschnit zum Berechnen von Individuellen Werte                   #
    ####################################################################

    # Benötigte komponeneen für berechnung aus Tabelle holen
    mycursor.execute("SELECT Berechnungen.EingangsWertNr, Berechnungen.berechnung, Berechnungen.AusgangsWertNr, Werte.Speicherung FROM Berechnungen inner Join Werte on (Werte.WertNr = Berechnungen.AusgangsWertNr)")

    for (eingang, rechnung, ausgang, speicherung) in mycursor:
        jre = json.loads(rechnung)


        jSwerte = jre["werte"]
        jSisNr = jre["isNr"]
        jSoperant = jre["operant"]

        jSwerte.insert(0, eingang)
        jSisNr.insert(0, True)

        # Werte für Felder aus Tabelle holen 
        mycursor2 = mydb.cursor()
        mycursor2.execute("SELECT WertNr, Wert FROM Aktuell")

        j = 0
        for (wertNr, wert) in mycursor2:
            for werte in jSwerte:
                if werte == wertNr and jSisNr[j]:
                    jSwerte[j] = wert
                    #print(jSwerte[j])
                j += 1
            j = 0


        # Berechnung durchführen (Punkt vor Strich wird nicht beachtet)
        ergebniss = jSwerte[0]
        i = 0
        while jSoperant[i] != "=":
            if jSoperant[i] == "-":
                ergebniss -= jSwerte[i+1]
            elif jSoperant[i] == "*":
                ergebniss *= jSwerte[i+1]
            elif jSoperant[i] == "/":
                ergebniss /= jSwerte[i+1]
            elif jSoperant[i] == "%":
                ergebniss %= jSwerte[i+1]
            else:
                ergebniss += jSwerte[i+1]
            i += 1

        #print()
        #print(ergebniss)

        # Ergebnis zur Datenbank hochladen
        mycursor3 = mydb.cursor()
        if speicherung:
            mycursor3.execute("Insert Into Verlauf(Zeit, Wert, WertNr) Values(now(),?,?)", (ergebniss, ausgang))
            mydb.commit()
            print(f"Wert {ausgang} in Verlauf eingefügt")
        
        mycursor3.execute("Update Aktuell set Zeit = now(), Wert = ? WHERE WertNr = ?", (ergebniss, ausgang))
        print(f"Wert {ausgang} in Aktuell eingefügt")
        mydb.commit()

    ####################################################################
except:
    print("datenbank nicht erreichbar")
finally:
    mydb.close()

