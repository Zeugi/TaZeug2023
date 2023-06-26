let aktuelleDaten;
let abzugAlt;
let neubau = 0;

let tabLang = document.querySelector(".tabelleLangzeit");

/*************************************** 
 * Charts Einbinden 
****************************************/

/*************************************** 
 * Strom
****************************************/
//Data Block
const data = {
    labels:[],
    datasets: [
        {
            label: 'Solar',
            pointRadius: 1,
            data: [],
            borderColor: 'rgb(255, 243, 64)', 
            backgroundColor: 'rgba(255, 243, 64, 1)'
        },
        {
            label: 'Gesamt',
            pointRadius: 1,
            data: [],
            hidden: false,
            borderColor: 'rgba(255, 0, 0, 0.5)', 
            backgroundColor: 'rgba(255, 0, 0, 0.5)'
        }
    ]
};
  
//Config Block
const config = {
    type: 'bar',
    data,
    options: {
        maintainAspectRatio: false,
        plugins: {
        legend: {
            display: false,
        }
    },
    scales: {
        y: {
            stacked: false,
            ticks: {
            callback: function(value, index, ticks) {
                return value + " kWh";
            }
        }
        },
        x:{
            stacked: true,
            type: 'time',
            time:{
                isoWeekday: true,
                displayFormats: {hour: 'HH'},
                unit: 'hour'
            },
            title:{
                display: false,
                text: 'Stunde'
            },
            ticks: {
            //callback: function(value, index, ticks) {
            //    return value + " .00";
            //}
            }
        }
    }
    }
};
  


//Render Block
const myChart = new Chart(
    document.getElementById('myChart1'),
    config
);

/*************************************** 
 * Strom Markt Chart
****************************************/
//Data Block
const dataMarkt = {
    labels: [],
    datasets: [
            {
                label: 'Gesamt (Netzlast)',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(255, 64, 0)', 
                backgroundColor: 'rgba(255, 64, 0, 1)',
                yAxisID: 'y2',
            },{
                label: 'Residuallast',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(54, 162, 235)', 
                backgroundColor: 'rgba(54, 162, 235, 1)',
                yAxisID: 'y2',
            },{
                label: 'Pumpspeicher Verbrauch',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(0, 155, 202)', 
                backgroundColor: 'rgba(0, 155, 202, 1)',
                yAxisID: 'y2',
            },{
                label: 'Biomasse',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(81, 179, 81)', 
                backgroundColor: 'rgba(81, 179, 81, 1)',
                fill: true
            },{
                label: 'Wasserkraft',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(166, 226, 255)', 
                backgroundColor: 'rgba(166, 226, 255, 1)',
                fill: true
            },{
                label: 'etc. Konventionelle',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(117, 128, 117)', 
                backgroundColor: 'rgba(117, 128, 117, 1)',
                fill: true
            },{
                label: 'Wind Offshore',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(0, 213, 255)', 
                backgroundColor: 'rgba(0, 213, 255, 1)',
                fill: true
            },{
                label: 'Erdgas',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(199, 218, 218)', 
                backgroundColor: 'rgba(199, 218, 218, 1)',
                fill: true
            },{
                label: 'Pumpspeicher',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(67, 84, 116)', 
                backgroundColor: 'rgba(67, 84, 116, 1)',
                fill: true
            },{
                label: 'Wind Onshore',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(90, 103, 255)', 
                backgroundColor: 'rgba(90, 103, 255, 1)',
                fill: true
            },{
                label: 'Photovoltaik',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(255, 243, 64)', 
                backgroundColor: 'rgba(255, 243, 64, 1)',
                fill: true
            },{
                label: 'etc. Erneuerbare',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(135, 205, 92)', 
                backgroundColor: 'rgba(135, 205, 92, 1)',
                fill: true
            },{
                label: 'Kernenergie',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(141, 77, 77)', 
                backgroundColor: 'rgba(141, 77, 77, 1)',
                fill: true
            },{
                label: 'Steinkohle',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(65, 65, 65)', 
                backgroundColor: 'rgba(65, 65, 65, 1',
                fill: true
            },{
                label: 'Braunkohle',
                pointRadius: 1,
                data: [],
                borderColor: 'rgb(154, 123, 92)', 
                backgroundColor: 'rgba(154, 123, 92, 1)',
                fill: true
            }]
    };
    
//Config Block
const configMarkt = {
    type: 'line',
    data: dataMarkt,
    options: {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right'
            }
        },
        scales: {
            y: {
                stacked: true,
                ticks: {
                    callback: function(value, index, ticks) {
                        return value/1000 + " GWh";
                    }
                    }
            },
            y2: {
                display: false,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                }
            },
            x:{
                display: true,
                type: 'time',
                time:{
                    displayFormats: {day: 'dd.MM.yy'},
                    unit: 'day'
                }
            }
        }
    }
    };
    
//Render Block
const myChartMarkt = new Chart(
    document.getElementById('myChartMarkt'),
    configMarkt
);

/************************************************************************ 
 * Zeit einstellen
************************************************************************/
let intervallSelect = "Stunde";
let zahlenSelect = 24;
let aufloeserSelect = "Stunde";
let aufloeserAktuell = "Verbrauch_Stunde";
let aufloeserSolar = "Erzeugung_Stunde";
let startTimestamp;
let endTimestamp;


zeitIntervall();
getVerlauf();
getAktuell();


/************************************************************************ 
 * Berechnet anhand der ausgewählten Intervall den Zeitstempel dazu
************************************************************************/
function zeitIntervall() {
    let startZeit = new Date();
    switch (intervallSelect) {
        case "Minute":
            startZeit.setMinutes(startZeit.getMinutes() - 60); 
            break;
        case "Stunde":
            startZeit.setHours(startZeit.getHours() - 24); 
            break;
        case "Tag":
            startZeit.setDate(startZeit.getDate() - 10); 
            break;
        case "Woche":
            startZeit.setDate(startZeit.getDate() - (4 * 7)); 
            break;
        case "Monat":
            startZeit.setMonth(startZeit.getMonth() - 12); 
            break;
        case "Jahr":
            startZeit.setFullYear(startZeit.getFullYear() - 3); 
            break;
        default:
            break;
    }
    startTimestamp = Math.floor(startZeit.getTime() / 1000);
    endTimestamp = Math.floor(new Date().getTime() / 1000);
}

/************************************************************************ 
 * Holt anhand der auflösung benötigten Daten von der Verlauf tabelle
************************************************************************/
function getVerlauf(){
    let tabBody = document.querySelectorAll(".tabelleLangzeit tbody td");
    switch (aufloeserSelect) {
        case "Tag":
            resetBorder()
            tabBody[5].style.border = "0.2em solid rgba(255, 0, 0, 0.5)";
            myChart.config.options.scales.x.time.displayFormats = {day: 'dd.MM'};
            myChart.config.options.scales.x.time.unit = 'day';
            aufloeserAktuell = "Verbrauch_Tag";
            aufloeserSolar = "Erzeugung_Tag";
            holeVerlauf([60,52]);
            break;
        case "Woche":
            resetBorder()
            tabBody[10].style.border = "0.2em solid rgba(255, 0, 0, 0.5)";
            myChart.config.options.scales.x.time.displayFormats = {week: 'dd.MM.yy'};
            myChart.config.options.scales.x.time.unit = 'week';
            aufloeserAktuell = "Verbrauch_Woche";
            aufloeserSolar = "Erzeugung_Woche";
            holeVerlauf([61,53]);
            break;
        case "Monat":
            resetBorder()
            tabBody[15].style.border = "0.2em solid rgba(255, 0, 0, 0.5)";
            myChart.config.options.scales.x.time.displayFormats = {};
            myChart.config.options.scales.x.time.unit = 'month';
            aufloeserAktuell = "Verbrauch_Monat";
            aufloeserSolar = "Erzeugung_Monat";
            holeVerlauf([17,9]); 
            break;
        case "Jahr":
            resetBorder()
            tabBody[20].style.border = "0.2em solid rgba(255, 0, 0, 0.5)";
            myChart.config.options.scales.x.time.displayFormats = {};
            myChart.config.options.scales.x.time.unit = 'year';
            aufloeserAktuell = "Verbrauch_Jahr";
            aufloeserSolar = "Erzeugung_Jahr";
            holeVerlauf([18, 10]);
            break;
        default:
            resetBorder()
            tabBody[0].style.border = "0.2em solid rgba(255, 0, 0, 0.5)";
            myChart.config.options.scales.x.time.displayFormats = {hour: 'HH:mm'};
            myChart.config.options.scales.x.time.unit = 'hour';
            aufloeserAktuell = "Verbrauch_Stunde";
            aufloeserSolar = "Erzeugung_Stunde";
            holeVerlauf([59,51]);
            break;
    }
    
    function resetBorder(){
        tabBody.forEach(element => {
            element.style.border = '';
        });
    }
}

/************************************************************************ 
 * Hole aktuelle Daten
************************************************************************/
function getAktuell(){
    fetch("http://ess.elektronikschule.de/api/aktuell.php")
    .then(response => response.json())
    .then((json) =>{
        aktuelleDaten = json;
        restwertAktuell();
        werteFuellen();
    })
}


/************************************************************************ 
 * Tabelle füllen
************************************************************************/
function werteFuellen(){
    let tabBody = document.querySelectorAll(".tabelleLangzeit tbody tr td");

    aktuelleDaten.forEach(element => {
        if (element.Bereich === "Gesamt" && element.Medium === "Strom") {
            switch (element.Beschreibung) {
                case "Verbrauch_Stunde":
                    tabBody[1].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Tag":
                    tabBody[6].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Woche":
                    tabBody[11].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Monat":
                    tabBody[16].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Jahr":
                    tabBody[21].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                default:
                    break;
            }
        }
        if (element.Bereich === "Solar" && element.Medium === "Strom") {
            switch (element.Beschreibung) {
                case "Erzeugung_Stunde":
                    tabBody[2].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Erzeugung_Tag":
                    tabBody[7].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Erzeugung_Woche":
                    tabBody[12].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Erzeugung_Monat":
                    tabBody[17].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Erzeugung_Jahr":
                    tabBody[22].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                default:
                    break;
            }
        }
        if (element.Bereich === "Gesamt" && element.Medium === "Gas") {
            switch (element.Beschreibung) {
                case "Verbrauch_Stunde":
                    tabBody[3].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Tag":
                    tabBody[8].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Woche":
                    tabBody[13].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Monat":
                    tabBody[18].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Jahr":
                    tabBody[23].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                default:
                    break;
            }
        }
        if (element.Bereich === "Gesamt" && element.Medium === "Wasser") {
            switch (element.Beschreibung) {
                case "Verbrauch_Stunde":
                    tabBody[4].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Tag":
                    tabBody[9].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Woche":
                    tabBody[14].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Monat":
                    tabBody[19].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Jahr":
                    tabBody[24].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                default:
                    break;
            }
        }
    });
}


/************************************************************************ 
 * Convertiert Zeit von "YYYY-MM-DDTHH:MM:SS" in "YYYY-MM-DD HH:MM:SS"
************************************************************************/
function convertToTimestamp(zeiten) {
    var selectedDateTime = zeiten;
    
    var parts = selectedDateTime.split("T");
    var dateParts = parts[0].split("-");
    var timeParts = parts[1].split(":");
    
    var year = parseInt(dateParts[0]);
    var month = parseInt(dateParts[1]) - 1;
    var day = parseInt(dateParts[2]);
    
    var hour = parseInt(timeParts[0]);
    var minute = parseInt(timeParts[1]);
    
    var selectedDate = new Date(year, month, day, hour, minute);
    var timestamp = selectedDate.getTime() / 1000;
    
    return timestamp;
  }


/************************************************************************ 
 * Hole Verlauf
************************************************************************/
function holeVerlauf(wertArray){
    let urls = [];
    let promises = [];
    
    wertArray.forEach(wert => {
        urls.push("http://ess.elektronikschule.de/api/verlauf.php?WertNr="+wert+"&StartZeit="+startTimestamp+"&EndZeit="+endTimestamp);
    });
    
    urls.forEach(url => {
        promises.push(fetch(url).then(response => response.json()));
    });
    
    Promise.all(promises)
      .then(antwort => {
        verlaufDaten = antwort;
        fillCharts();
      });
}

/************************************************************************ 
 * Restwerte für aktulle Werte berechnen
************************************************************************/
function restwertAktuell() {
    let gesamtSum = 0;
        let altbauSum = 0;
        let indexGesamt;
        let indexAltbau;
        aktuelleDaten.forEach(element => {
            if (element.Medium === "Strom" && element.Beschreibung === aufloeserAktuell) {
                element.Wert = parseFloat(element.Wert);
                if (element.Bereich === "Gesamt") {
                    indexGesamt = aktuelleDaten.indexOf(element);
                } 
                else if (element.Bereich === "Altbau"){
                    indexAltbau = aktuelleDaten.indexOf(element);
                }
                else{              
                }
                
                switch (element.Bereich) {
                    case "IT":
                        altbauSum += element.Wert;
                        break;
                
                    case "Altbau Obergeschoss":
                        altbauSum += element.Wert;
                        break;

                    case "Heizung":
                        altbauSum += element.Wert;
                        break;

                    case "Metallwerkstatt":
                        gesamtSum += element.Wert;
                        break;

                    case "Elektrowerkstatt UV1":
                        gesamtSum += element.Wert;
                        break;

                    case "Elektrowerkstatt UV1":
                        gesamtSum += element.Wert;
                        break;

                    case "Lueftung":
                        gesamtSum += element.Wert;
                        break;

                    case "Cafetaria":
                        gesamtSum += element.Wert;
                        break;

                    default:
                        break;
                }
            }
        });

        

        aktuelleDaten[indexAltbau].Wert =  (aktuelleDaten[indexAltbau].Wert - altbauSum).toFixed(2);

        neubau = (aktuelleDaten[indexGesamt].Wert - gesamtSum).toFixed(2);

}


/************************************************************************ 
 * Charts Befüllen
************************************************************************/
function fillCharts() {
    myChart.data.datasets[0].data = verlaufDaten[0][0].Wert.map(parseFloat);
    myChart.data.datasets[1].data = verlaufDaten[1][0].Wert.map(parseFloat);
    myChart.data.labels = verlaufDaten[1][0].Zeit;
    myChart.update();
}

/************************************************************************ 
 * hole wetter
************************************************************************/
holeWetter();
function holeWetter(){
    let wetterListe = document.querySelectorAll(".wetter li span");
    let lastUpdate;
    let outdoortemp;
    let outdoorhumidity;
    let solarrad;
    let uvindex;
    let rainrate;
    let rainfall;
    let winddirection;
    let windspeed;
    let indoortemp;

    fetch("http://ess.elektronikschule.de/api/wetter.php")
      .then(response => response.json())
      .then((json) =>{
        for (let index = json.length -1; index >= 0; index--) {
            if (json[index][1] !== "-999.0") {
                outdoortemp = json[index][1];
                lastUpdate = json[index][0];
            }
            if (json[index][2] !== "-999") {
                outdoorhumidity = json[index][2];
            }
            if (json[index][3] !== "-999.0") {
                solarrad = json[index][3];
            }
            if (json[index][4] !== "-999.0") {
                uvindex = json[index][4];
            }
            if (json[index][5] !== "-999.0") {
                rainrate = json[index][5];
            }
            if (json[index][6] !== "-999.0") {
                rainfall = json[index][6];
            }
            if (json[index][7] !== "XX") {
                winddirection = json[index][7];
            }
            if (json[index][8] !== "-999.0") {
                windspeed = json[index][8];
            }
            if (json[index][9] !== "-999.0") {
                indoortemp = json[index][9];
            }
        }
        
        wetterListe[0].textContent = outdoortemp +" \u2103";
        wetterListe[1].textContent = indoortemp+" \u2103";
        wetterListe[2].textContent = outdoorhumidity +"%";
        wetterListe[3].textContent = solarrad + " W/m\u00B2";
        wetterListe[4].textContent = uvindex;
        wetterListe[5].textContent = rainrate +" mm/h";
        wetterListe[6].textContent = rainfall +" mm";
        wetterListe[7].textContent = winddirection;
        wetterListe[8].textContent = windspeed +" km/h";
        wetterListe[9].textContent = lastUpdate;
      }
    )
}

/************************************************************************ 
 * hole Netzdaten für Tettnang
 * API Für Netzauslastung
 * https://www.stromgedacht.de
************************************************************************/
holeNetzdaten();
function holeNetzdaten(){
    let ampelKinder = document.querySelectorAll(".ampel div");
    let ampelText = document.querySelector(".ampelText span");
    fetch("https://api.stromgedacht.de/v1/now?zip=88069")
    .then(response => response.json())
    .then((json) =>{
        switch (json.state) {
            case 1:
                ampelKinder[0].style.backgroundColor = 'rgba(0, 255, 0, 1)';
                ampelKinder[1].style.backgroundColor = '';
                ampelKinder[2].style.backgroundColor = '';
                ampelKinder[3].style.backgroundColor = '';
                ampelText.textContent = "Normalbetrieb – Du musst nichts weiter tun";
                break;
            case 2:
                ampelKinder[0].style.backgroundColor = '';
                ampelKinder[1].style.backgroundColor = 'rgba(255, 255, 0, 1)';
                ampelKinder[2].style.backgroundColor = '';
                ampelKinder[3].style.backgroundColor = '';
                ampelText.textContent = "Verbrauch vorverlegen – Strom jetzt nutzen";
                break;
            case 3:
                ampelKinder[0].style.backgroundColor = '';
                ampelKinder[1].style.backgroundColor = '';
                ampelKinder[2].style.backgroundColor = 'rgba(255, 166, 0, 1)';
                ampelKinder[3].style.backgroundColor = '';
                ampelText.textContent = "Verbrauch reduzieren, um Kosten und CO2 zu sparen";
                break;
            case 4:
                ampelKinder[0].style.backgroundColor = '';
                ampelKinder[1].style.backgroundColor = '';
                ampelKinder[2].style.backgroundColor = '';
                ampelKinder[3].style.backgroundColor = 'rgba(255, 0, 0, 1)';
                ampelText.textContent = "Verbrauch reduzieren, um Strommangel zu verhindern";
                break;
            default:
                break;
        }
    }
  )
}

/************************************************************************ 
 * hole Netzdaten Strommix für Deutschland
 * API SMARD für Strommarkt daten
 * https://www.smard.de/home
************************************************************************/
holeStrommarkt();
function holeStrommarkt(){
    fetch("http://ess.elektronikschule.de/api/strommarkt.php")
    .then(response => response.json())
    .then((json) =>{
        for (let index = 0; index < json.length; index++) {
            myChartMarkt.data.datasets[index].data = json[index].wert;
        }
        myChartMarkt.data.labels = json[0].zeit;
        myChartMarkt.update();
    }
  )
}

/*************************************** 
 * Jede minute Werte von Datenbank holen
****************************************/
let zaehler = 0;
setInterval(function() {
    let zeiten = ["Tag", "Woche", "Monat", "Jahr", "Stunde"];
    aufloeserSelect = zeiten[zaehler];
    intervallSelect =  zeiten[zaehler];
    zeitIntervall();
    if(zaehler >=4){
        zaehler = 0;
    }else{
        zaehler ++;
    }
    getVerlauf();
    getAktuell();
    werteFuellen();
    holeWetter();
  }, 0.5 * 60 * 1000);

/*************************************** 
 * API alle 15 min anfragen
****************************************/
setInterval(function() {
    holeNetzdaten();
    holeStrommarkt();
  }, 15 * 60 * 1000);
  