
let aktuelleDaten;
let verlaufDaten;
let abzugGesamt;
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
            label: 'AltbauSonstiges',
            pointRadius: 1,
            data: [],
            hidden: false,
            borderColor: 'rgba(255, 176, 176, 1)',
            backgroundColor: 'rgba(255, 176, 176, 1)'
        },
        {
            label: 'NeubauSonstiges',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(158, 253, 153, 1)',
            backgroundColor: 'rgba(158, 253, 153, 1)' 
        },
        {
            label : 'Cafetaria',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(255, 218, 142, 1)',
            backgroundColor: 'rgba(255, 218, 142, 1)' 
        },
        {
            label : 'AltbauOg',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(142, 228, 245, 1)',
            backgroundColor: 'rgba(142, 228, 245, 1)'  
        },
        {
            label : 'Lueftung',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(142, 245, 186, 1)',
            backgroundColor: 'rgba(142, 245, 186, 1)'  
        },
        {
            label : 'IT',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(168, 142, 245, 1)',
            backgroundColor: 'rgba(168, 142, 245, 1)'  
        },
        {
            label : 'Metallwerkstatt',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(232, 142, 245, 1)',
            backgroundColor: 'rgba(232, 142, 245, 1)'  
        },
        {
            label : 'Heizung',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(245, 142, 203, 1)',
            backgroundColor: 'rgba(245, 142, 203, 1)' 
        },
        {
            label : 'Elektro UV1',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(255, 220, 178, 1)',
            backgroundColor: 'rgba(255, 220, 178, 1)' 
        },
        {
            label : 'Elektro UV2',
            pointRadius: 1,
            data: [],
            borderColor: 'rgba(255, 195, 142, 1)',
            backgroundColor: 'rgba(255, 195, 142, 1)' 
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
            stacked: true,
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
 * Solar
****************************************/
//Data Block
const data2 = {
labels:[],
datasets: [{
    label: 'Gesamt',
    pointRadius: 1,
    data: []
}
]
};
  
//Config Block
const config2 = {
  type: 'bar',
  data: data2,
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
          display: false,
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value, index, ticks) {
              return value + " kWh";
          }
        }
      },
      x:{
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
const myChart2 = new Chart(
  document.getElementById('myChart2'),
  config2
);

/*************************************** 
 * Line Chart
****************************************/
//Data Block
const dataLine = {
labels: [],
datasets: [{
        label: 'Altbau',
        pointRadius: 1,
        data: []
    },
    {
        label: 'Cafetaria',
        pointRadius: 1,
        data: []
    },
    {
        label: 'Lueftung',
        pointRadius: 1,
        data: []
    }
]
};

//Config Block
const configLine = {
    maintainAspectRatio: false,
    type: 'line',
    data: dataLine,
    options: {
        plugins: {
            legend: {
                display: false,
            }
        },
        scales: {
        y: {
            ticks: {
                callback: function(value, index, ticks) {
                    return value + " kW";
                }
                }
        },
        x:{
            display: true,
            type: 'time',
            time:{
            displayFormats: {hour: 'HH:mm'},
            unit: 'hour'
            }
        }
        }
    }
  };
  
//Render Block
const myChartLine = new Chart(
    document.getElementById('myChartLine'),
    configLine
);

/************************************************************************ 
 * Filter
****************************************/
const filter = document.getElementById("filter");
const datumDiv = document.querySelector(".datum");
const anzahlDiv = document.querySelector(".anzahl");
let filterSelect = "Anzahl";

filter.addEventListener("change", () =>{
    filterSelect = filter.value;
    if (filterSelect === "Datum") {
        datumDiv.style.display = "block";
        anzahlDiv.style.display = "none";
    }
    else{
        datumDiv.style.display = "none";
        anzahlDiv.style.display = "block";
    }
})

/************************************************************************ 
 * Intervall suche
************************************************************************/
const intervall = document.getElementById("intervall");
const zahlen = document.getElementById("zahlen");
let intervallSelect = "Stunde";
let zahlenSelect = 24;

intervall.addEventListener("change", () =>{
    intervallSelect = intervall.value;
    zahlenSelect = parseInt(zahlen.value);
    zeitIntervall();
    getVerlauf();
    getAktuell();
})

zahlen.addEventListener("change", () =>{
    intervallSelect = intervall.value;
    zahlenSelect = parseInt(zahlen.value);
    zeitIntervall();
    getVerlauf();
    getAktuell();
})

/************************************************************************ 
 * Aufloesung aendern
************************************************************************/
const aufloeser = document.getElementById("aufloesung");
let aufloeserSelect = "Stunde";
let aufloeserAktuell = "Verbrauch_Stunde";
let aufloeserSolar = "Erzeugung_Stunde";

aufloeser.addEventListener("change", () =>{
    aufloeserSelect = aufloeser.value;
    getVerlauf();
    getAktuell();
})

/************************************************************************ 
 * Datum suche
************************************************************************/
const startDate = document.getElementById("startdate");
const endDate = document.getElementById("enddate");
let startTimestamp;
let endTimestamp;

startDate.addEventListener("change", () =>{
    startTimestamp = convertToTimestamp(startDate.value);
    getVerlauf();
    getAktuell();
})

endDate.addEventListener("change", () =>{
    endTimestamp = convertToTimestamp(endDate.value);
    getVerlauf();
    getAktuell();
})


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
            startZeit.setMinutes(startZeit.getMinutes() - zahlenSelect); 
            break;
        case "Stunde":
            startZeit.setHours(startZeit.getHours() - zahlenSelect); 
            break;
        case "Tag":
            startZeit.setDate(startZeit.getDate() - zahlenSelect); 
            break;
        case "Woche":
            startZeit.setDate(startZeit.getDate() - (zahlenSelect * 7)); 
            break;
        case "Monat":
            startZeit.setMonth(startZeit.getMonth() - zahlenSelect); 
            break;
        case "Jahr":
            startZeit.setFullYear(startZeit.getFullYear() - zahlenSelect); 
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
    let tabWerteHeader = document.querySelectorAll(".werteUebersicht thead tr th");
    /*
    if (filterSelect === "Anzahl") {
        intervall.value = aufloeserSelect;
        intervallSelect = aufloeserSelect;
        zeitIntervall();
    }
    */
    switch (aufloeserSelect) {
        case "Tag":
            abzugGesamt = ["97","92","72","64","45","40"] //52-
            abzugAlt = ["82","67","48"] //40-
            myChart.config.options.scales.x.time.displayFormats = {day: 'dd.MM'};
            myChart.config.options.scales.x.time.unit = 'day';
            myChart2.config.options.scales.x.time.displayFormats = {day: 'dd.MM'};
            myChart2.config.options.scales.x.time.unit = 'day';
            aufloeserAktuell = "Verbrauch_Tag";
            aufloeserSolar = "Erzeugung_Tag";
            tabWerteHeader[1].textContent = "Aktueller Tag";
            holeVerlauf([97,92,72,64,45,60,40,82,67,48,52]);
            getLeistund([1,11,21]);
            break;
        case "Woche":
            abzugGesamt = ["98","93","74","65","46","62"] //53-
            abzugAlt = ["83","68","49"] //62
            myChart.config.options.scales.x.time.displayFormats = {week: 'dd.MM.yy'};
            myChart.config.options.scales.x.time.unit = 'week';
            myChart2.config.options.scales.x.time.displayFormats = {week: 'dd.MM.yy'};
            myChart2.config.options.scales.x.time.unit = 'week';
            aufloeserAktuell = "Verbrauch_Woche";
            aufloeserSolar = "Erzeugung_Woche";
            tabWerteHeader[1].textContent = "Aktuelle Woche";
            holeVerlauf([98,93,74,65,46,61,62,83,68,49,53]);
            getLeistund([1,11,21]);
            break;
        case "Monat":
            abzugGesamt = ["99","94","75","19","5","101"] //9-
            abzugAlt = ["27","25","7"] //101
            myChart.config.options.scales.x.time.displayFormats = {};
            myChart.config.options.scales.x.time.unit = 'month';
            myChart2.config.options.scales.x.time.displayFormats = {};
            myChart2.config.options.scales.x.time.unit = 'month';
            aufloeserAktuell = "Verbrauch_Monat";
            aufloeserSolar = "Erzeugung_Monat";
            tabWerteHeader[1].textContent = "Aktueller Monat";
            holeVerlauf([99,94,75,19,5,17,101,27,25,7,9]); 
            getLeistund([1,11,21]);
            break;
        case "Jahr":
            abzugGesamt = ["100","95","76","20","6","102"] //10-
            abzugAlt = ["28","26","8"] //102
            myChart.config.options.scales.x.time.displayFormats = {};
            myChart.config.options.scales.x.time.unit = 'year';
            myChart2.config.options.scales.x.time.displayFormats = {};
            myChart2.config.options.scales.x.time.unit = 'year';
            aufloeserAktuell = "Verbrauch_Jahr";
            aufloeserSolar = "Erzeugung_Jahr";
            tabWerteHeader[1].textContent = "Aktuelles Jahr";
            holeVerlauf([100,95,76,20,6,18,102,28,26,8,10]);
            getLeistund([1,11,21]);
            break;
        default:
            abzugGesamt = ["96","91","71","63","44","39"] //51-
            abzugAlt = ["81","66","47"]//39-
            myChart.config.options.scales.x.time.displayFormats = {hour: 'HH:mm'};
            myChart.config.options.scales.x.time.unit = 'hour';
            myChart2.config.options.scales.x.time.displayFormats = {hour: 'HH:mm'};
            myChart2.config.options.scales.x.time.unit = 'hour';
            aufloeserAktuell = "Verbrauch_Stunde";
            aufloeserSolar = "Erzeugung_Stunde";
            tabWerteHeader[1].textContent = "Aktuelle Stunde";
            holeVerlauf([96,91,71,63,44,59,39,81,66,47,51]);
            getLeistund([1,11,21]);
            break;
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
    let tabWerte = document.querySelectorAll(".werteUebersicht tbody tr td");

    aktuelleDaten.forEach(element => {
        if (element.Bereich === "Gesamt" && element.Medium === "Strom") {
            switch (element.Beschreibung) {
                case "Verbrauch_Stunde":
                    tabBody[1].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Tag":
                    tabBody[3].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Woche":
                    tabBody[5].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Monat":
                    tabBody[7].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Verbrauch_Jahr":
                    tabBody[9].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                default:
                    break;
            }
        }
        if (element.Beschreibung === aufloeserAktuell && element.Medium === "Strom") {
            switch (element.Bereich) {
                case "Altbau Obergeschoss":
                    tabWerte[1].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "IT":
                    tabWerte[3].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Heizung":
                    tabWerte[5].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Altbau":
                    tabWerte[7].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Metallwerkstatt":
                    tabWerte[9].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Elektrowerkstatt UV1":
                    tabWerte[11].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Elektrowerkstatt UV2":
                    tabWerte[13].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Lueftung":
                    tabWerte[15].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Cafetaria":
                    tabWerte[17].textContent = parseFloat(element.Wert)+" kWh";
                    break;
                case "Gesamt":
                    tabWerte[19].textContent = parseFloat(neubau)+" kWh";
                    break;
                default:
                    break;
            }
        }
        if (element.Beschreibung === aufloeserSolar && element.Medium === "Strom") {
            switch (element.Bereich) {
                case "Solar":
                    tabWerte[21].textContent = parseFloat(element.Wert)+" kWh";
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
        restwert();
        fillCharts();
      });
}

/************************************************************************ 
 * Restwerte berechnen
************************************************************************/
function restwert() {
    // Restwert Verlauf
    let gesamt = verlaufDaten[10][0].Wert;
    let alt = verlaufDaten[6][0].Wert;
    verlaufDaten.forEach(daten => {
        let wertNr = daten[0].WertNr;
        if (abzugGesamt.includes(wertNr)) {
            if (daten[0].Wert.length < gesamt.length){
                for (let index = 0; index < daten[0].Wert.length; index++) {
                    gesamt[index] -= daten[0].Wert[index];
                }  
            }
            else{
                for (let index = 0; index < gesamt.length; index++) {
                    gesamt[index] -= daten[0].Wert[index];
                }  
            }
        }

        if (abzugAlt.includes(wertNr)) {
            if (daten[0].Wert.length < alt.length){
                for (let index = 0; index < daten[0].Wert.length; index++) {
                    alt[index] -= daten[0].Wert[index];
                }  
            }
            else{
                for (let index = 0; index < alt.length; index++) {
                    alt[index] -= daten[0].Wert[index];
                }  
            }
        }
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
    myChart2.data.datasets[0].data = verlaufDaten[5][0].Wert.map(parseFloat);
    myChart2.data.labels = verlaufDaten[5][0].Zeit;
    myChart2.update();

    myChart.data.datasets[2].data = verlaufDaten[4][0].Wert.map(parseFloat);
    myChart.data.datasets[3].data = verlaufDaten[9][0].Wert.map(parseFloat);
    myChart.data.datasets[4].data = verlaufDaten[3][0].Wert.map(parseFloat);
    myChart.data.datasets[5].data = verlaufDaten[8][0].Wert.map(parseFloat);
    myChart.data.datasets[6].data = verlaufDaten[2][0].Wert.map(parseFloat);
    myChart.data.datasets[7].data = verlaufDaten[7][0].Wert.map(parseFloat);
    myChart.data.datasets[8].data = verlaufDaten[1][0].Wert.map(parseFloat);
    myChart.data.datasets[9].data = verlaufDaten[0][0].Wert.map(parseFloat);
    myChart.data.datasets[1].data = verlaufDaten[10][0].Wert.map(parseFloat);
    myChart.data.datasets[0].data = verlaufDaten[6][0].Wert.map(parseFloat);
    myChart.data.labels = verlaufDaten[10][0].Zeit;
    myChart.update();
}

/************************************************************************ 
 * hole Leistung
************************************************************************/
function getLeistund(wertArray){
    let urls = [];
    let promises = [];
    let startZeit = new Date();
    startZeit.setHours(startZeit.getHours() - 12); 
    st = Math.floor(startZeit.getTime() / 1000);
    et = Math.floor(new Date().getTime() / 1000);

    wertArray.forEach(wert => {
        urls.push("http://ess.elektronikschule.de/api/verlauf.php?WertNr="+wert+"&StartZeit="+st+"&EndZeit="+et);
    });
    
    urls.forEach(url => {
        promises.push(fetch(url).then(response => response.json()));
    });
    
    Promise.all(promises)
      .then(antwort => {
        console.log(antwort[0][0].Wert);
        myChartLine.data.datasets[0].data = antwort[0][0].Wert.map(parseFloat);
        myChartLine.data.datasets[1].data = antwort[1][0].Wert.map(parseFloat);
        myChartLine.data.datasets[2].data = antwort[2][0].Wert.map(parseFloat);
        myChartLine.data.labels = antwort[0][0].Zeit;
        myChartLine.update();
      });
}