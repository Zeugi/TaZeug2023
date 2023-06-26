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

################################################################################################
# einzelne Werte mittels WertNr holen                                                          #
################################################################################################
if (isset($_GET['StartZeit']) && isset($_GET['EndZeit']) && isset($_GET['Medium'])) {

  $startDateTime  = date('Y-m-d H:i:s', $_GET['StartZeit']);
  $endDateTime  = date('Y-m-d H:i:s', $_GET['EndZeit']);
  $medium = $_GET['Medium'];

  try {
    $query = "SELECT WertNr, Zeit, Wert, Einheit FROM viewVerlauf WHERE Zeit >= ? AND Zeit <= ? AND Medium = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("sss", $startDateTime, $endDateTime, $medium);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
      $data[] = array('WertNr' => $row['WertNr'], 'Wert' => $row['Wert'], 'Zeit' => $row['Zeit'], 'Einheit' => $row['Einheit']);
    }

    $json = json_encode($data);
    
    echo $json;
  } catch (Exception $e) {
    die("Fehler bei Datenbankzugriff: " . $e->getMessage());
  }
}
################################################################################################


################################################################################################
# einzelne Werte mittels WertNr holen                                                          #
################################################################################################
elseif (isset($_GET['WertNr']) && isset($_GET['StartZeit']) && isset($_GET['EndZeit']))
{
  $WertNr = $_GET['WertNr'];
  $startDateTime  = date('Y-m-d H:i:s', $_GET['StartZeit']);
  $endDateTime  = date('Y-m-d H:i:s', $_GET['EndZeit']);
  $wert = [];
  $zeit = [];

  try {
    $query = "SELECT WertNr, Zeit, Wert FROM viewVerlauf WHERE Zeit >= ? AND Zeit <= ? AND WertNr = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("ssi", $startDateTime, $endDateTime, $WertNr);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
      if ($row['WertNr'] == $WertNr) {
        $wert[] = $row['Wert'];
        $zeit[] = $row['Zeit'];
      }
    }
    
    $data = array(
      array('WertNr' => $WertNr, 'Wert' => $wert, 'Zeit' => $zeit)
    );
    
    $json = json_encode($data);
    
    echo $json;

  } catch (Exception $e) {
    die("Fehler bei Datenbankzugriff: " . $e->getMessage());
  }
}
################################################################################################

else{
    echo "Fehlende Parameter";
}
?>