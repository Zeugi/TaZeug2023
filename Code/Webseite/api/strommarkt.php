<?php
/************************************************************************ 
 * hole Netzdaten Strommix für Deutschland
 * API SMARD für Strommarkt daten
 * https://www.smard.de/home
************************************************************************/


/************************************************************************ 
 * hole sen letzten gültigen Zeitstempel
************************************************************************/
$url = 'https://www.smard.de/app/chart_data/1223/DE/index_hour.json';

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 

$response = curl_exec($ch);

curl_close($ch);

$timeArr = json_decode($response, true);

$lastPosTime = end($timeArr['timestamps']);
//$lastPosTime = 1686520800000;

/************************************************************************ 
 * Verfügbare bereiche:
 *   '1223' - Stromerzeugung: Braunkohle
 *   '1224' - Stromerzeugung: Kernenergie
 *   '1225' - Stromerzeugung: Wind Offshore
 *   '1226' - Stromerzeugung: Wasserkraft
 *   '1227' - Stromerzeugung: Sonstige Konventionelle
 *   '1228' - Stromerzeugung: Sonstige Erneuerbare
 *   '4066' - Stromerzeugung: Biomasse
 *   '4067' - Stromerzeugung: Wind Onshore
 *   '4068' - Stromerzeugung: Photovoltaik
 *   '4069' - Stromerzeugung: Steinkohle
 *   '4070' - Stromerzeugung: Pumpspeicher
 *   '4071' - Stromerzeugung: Erdgas
 *   '410' - Stromverbrauch: Gesamt (Netzlast)
 *   '4359' - Stromverbrauch: Residuallast
 *   '4387' - Stromverbrauch: Pumpspeicher
************************************************************************/


$mix = [['name' => 'Gesamt (Netzlast)','wert' => [],'zeit' => []], 
        ['name' => 'Residuallast','wert' => [],'zeit' => []], 
        ['name' => 'Pumpspeicher Verbrauch','wert' => [],'zeit' => []],
        ['name' => 'Biomasse','wert' => [],'zeit' => []], 
        ['name' => 'Wasserkraft','wert' => [],'zeit' => []], 
        ['name' => 'Sonstige Konventionelle','wert' => [],'zeit' => []],
        ['name' => 'Wind Offshore','wert' => [],'zeit' => []], 
        ['name' => 'Erdgas','wert' => [],'zeit' => []], 
        ['name' => 'Pumpspeicher','wert' => [],'zeit' => []],
        ['name' => 'Wind Onshore','wert' => [],'zeit' => []], 
        ['name' => 'Photovoltaik','wert' => [],'zeit' => []], 
        ['name' => 'Sonstige Erneuerbare','wert' => [],'zeit' => []],
        ['name' => 'Kernenergie','wert' => [],'zeit' => []], 
        ['name' => 'Steinkohle','wert' => [],'zeit' => []], 
        ['name' => 'Braunkohle','wert' => [],'zeit' => []]
        ];

$bereiche = [410, 4359, 4387, 4066, 1226, 1227, 1225, 4071, 4070, 4067, 4068, 1227, 1224, 4069, 1223];
$werte = [];
$address = [];

/************************************************************************ 
 * frage alle bereiche mit dem gültigen Zeitstempel an
************************************************************************/
foreach ($bereiche as $nummer) {
    $addresses[] = 'https://www.smard.de/app/chart_data/'.$nummer.'/DE/'.$nummer.'_DE_hour_'.$lastPosTime.'.json';
}

for ($i=0; $i < count($addresses); $i++) { 
    $ch = curl_init($addresses[$i]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if ($response === false) {
        echo 'Fehler beim Zugriff auf die Adresse ' . $addresses[$i] . ': ' . curl_error($ch) . PHP_EOL;
    } else {
        $json = json_decode($response);
        foreach ($json->series as $wert) {
            $mix[$i]['wert'][] = $wert[1];
            $mix[$i]['zeit'][] = date('Y-m-d H:i:s', ($wert[0]/1000));;
        }
    }
    curl_close($ch);
}

echo(json_encode($mix));

?>