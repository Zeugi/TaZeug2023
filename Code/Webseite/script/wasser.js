let aktuelleDaten;
let verlaufDaten;
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
            hidden: false
        },
        {
            label: 'NeubauSonstiges',
            pointRadius: 1,
            data: []
        },
        {
            label : 'Cafetaria',
            pointRadius: 1,
            data: []
        },
        {
            label : 'AltbauOg',
            pointRadius: 1,
            data: []
        },
        {
            label : 'Lueftung',
            pointRadius: 1,
            data: []
        },
        {
            label : 'IT',
            pointRadius: 1,
            data: []
        },
        {
            label : 'Metallwerkstatt',
            pointRadius: 1,
            data: []
        },
        {
            label : 'Heizung',
            pointRadius: 1,
            data: []
        },
        {
            label : 'Elektro UV1',
            pointRadius: 1,
            data: []
        },
        {
            label : 'Elektro UV2',
            pointRadius: 1,
            data: []
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
                return value + " m3";
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
                        return value + " l/h";
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
    switch (aufloeserSelect) {
        case "Tag":
            myChart.config.options.scales.x.time.displayFormats = {day: 'dd.MM'};
            myChart.config.options.scales.x.time.unit = 'day';
            aufloeserAktuell = "Verbrauch_Tag";
            holeVerlauf([87,105]);
            break;
        case "Woche":
            myChart.config.options.scales.x.time.displayFormats = {week: 'dd.MM.yy'};
            myChart.config.options.scales.x.time.unit = 'week';
            aufloeserAktuell = "Verbrauch_Woche";
            holeVerlauf([88,105]);
            break;
        case "Monat":
            myChart.config.options.scales.x.time.displayFormats = {};
            myChart.config.options.scales.x.time.unit = 'month';
            aufloeserAktuell = "Verbrauch_Monat";
            holeVerlauf([89,105]); 
            break;
        case "Jahr":
            myChart.config.options.scales.x.time.displayFormats = {};
            myChart.config.options.scales.x.time.unit = 'year';
            aufloeserAktuell = "Verbrauch_Jahr";
            holeVerlauf([90,105]);
            break;
        default:
            myChart.config.options.scales.x.time.displayFormats = {hour: 'HH:mm'};
            myChart.config.options.scales.x.time.unit = 'hour';
            aufloeserAktuell = "Verbrauch_Stunde";
            holeVerlauf([86,105]);
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
        werteFuellen();
    })
}


/************************************************************************ 
 * Tabelle füllen
************************************************************************/
function werteFuellen(){
    let tabBody = document.querySelectorAll(".tabelleLangzeit tbody tr td");
    let durchfluss = document.querySelector(".Durchfluss span");

    aktuelleDaten.forEach(element => {
        if (element.Bereich === "Gesamt" && element.Medium === "Wasser") {
            switch (element.Beschreibung) {
                case "Verbrauch_Stunde":
                    tabBody[1].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Tag":
                    tabBody[3].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Woche":
                    tabBody[5].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Monat":
                    tabBody[7].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Verbrauch_Jahr":
                    tabBody[9].textContent = parseFloat(element.Wert)+" m\u00B3";
                    break;
                case "Durchfluss":
                    durchfluss.textContent = parseFloat(element.Wert)+" l/h";
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
 * Charts Befüllen
************************************************************************/
function fillCharts() {
    myChart.data.datasets[0].data = verlaufDaten[0][0].Wert.map(parseFloat);
    myChart.data.labels = verlaufDaten[0][0].Zeit;
    myChart.update();

    myChartLine.data.datasets[0].data = verlaufDaten[1][0].Wert.map(parseFloat);
    myChartLine.data.labels = verlaufDaten[1][0].Zeit;
    myChartLine.update();
}
