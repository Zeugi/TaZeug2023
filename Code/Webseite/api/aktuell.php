<?php
$username = "energieweb";
$password = "";
$database = "Energie";
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
  $result = $mysqli->query("SELECT WertNr, Zeit, Bereich, Beschreibung, Wert, Einheit, Medium FROM viewAktuell");

  while ($row = $result->fetch_assoc()) {
    $data[] = array('WertNr' => $row['WertNr'], 'Wert' => $row['Wert'], 'Zeit' => $row['Zeit'], 'Bereich' => $row['Bereich'], 'Beschreibung' => $row['Beschreibung'], 'Einheit' => $row['Einheit'], 'Medium' => $row['Medium']);
  }

  
  $json = json_encode($data);
  
  echo $json;
} 

catch (Exception $e) {
  die("Fehler bei Datenbankzugriff: " . $e->getMessage());
}
?>