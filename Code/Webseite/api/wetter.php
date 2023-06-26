<?php
$username = "weatherweb";
$password = "";
$database = "weatherstation";
$server = "ess";

try
{
  $mysqli = new mysqli($server, $username, $password, $database);
}
catch (Exception $e)
{
  echo "Failed to connect to MySQL: " . $e->getMessage();
  exit;
}

$data = [];

try {
  $result = $mysqli->query("SELECT zeit, outdoortemp, outdoorhumidity, solarrad, uvindex, rainrate, rainfall, winddirection, windspeed, indoortemp FROM weather order by Zeit desc limit 300");

  while ($row = $result->fetch_assoc()) {
    $data[] = [$row['zeit'], $row['outdoortemp'], $row['outdoorhumidity'], $row['solarrad'], $row['uvindex'], $row['rainrate'], $row['rainfall'], $row['winddirection'], $row['windspeed'], $row['indoortemp']];
  }

  
  $json = json_encode($data);
  
  echo $json;
} 

catch (Exception $e) {
  die("Fehler bei Datenbankzugriff: " . $e->getMessage());
}
?>