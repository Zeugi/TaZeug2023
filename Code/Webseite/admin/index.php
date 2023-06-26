<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../style/main.css" rel="stylesheet" type="text/css" media="all">
    <title>admin</title>
</head>
<body>
    <header>
        <h1>Energiespiegel</h1>
        <nav>
            <ul>
            <li><a href="../index.html">Dashboard</a></li>
            <li><a href="../strom.html">Strom</a></li>
            <li><a href="../wasser.html">Wasser</a></li>
            <li><a href="../gas.html">Gas</a></li>
            <li><a href="index.php">Login</a></li>
            </ul>
        </nav>
        </header>

    <main>
    <?php
    $mysqli = new mysqli("localhost", "energieAdmin", "", "Energie");
    ?>
    <fieldset>
        <legend>Zähler</legend>
        <table>
        <tr>
            <th>Adresse</th>
            <th>Beschreibung</th>
        </tr>
        <?php
            if ($mysqli->connect_errno) {
                echo "Failed to connect to MySQL: (" .
                $mysqli->connect_errno . ") " .
                $mysqli->connect_error;
            }

            $result = $mysqli->query("SELECT * FROM Zaehler") or die($mysqli->error);
            while ($row = $result->fetch_object()) {
                echo '<tr>';
                echo '<td>' . $row->Adresse . '</td>';
                echo '<td>' . $row->Beschreibung . '</td>';  
                echo '</tr>';
        }
        ?>
        <tr>
            <form action="./input.php" method="get">
            <td><input type="text" name="Adresse"></td>
            <td><input type="text" name="Beschreibung"></td>
        </tr>
    </table>
    <input type="text" name="delAdress" placeholder="Adresse zum Löschen">
    <button type="submit">Weiter</button>
    </form>
    </fieldset>

    <fieldset>
        <legend>Werte</legend>
        <form action="./index.php" method="get">
    <input type="text" name="Adresse"value= <?php echo $_GET["Adresse"];?>>
    <input type="submit" value="Zeige Adresse">
    <table>
        <tr>
            <th>Zeit</th>
            <th>Bereich</th>
            <th>Beschreibung</th>
            <th>Wert</th>
            <th>Einheit</th>
            <th>Medium</th>
        </tr>
    <?php
    if ($_GET["Adresse"]>0) {
        try {
            $stmt = $mysqli->prepare("SELECT * FROM viewAktuell where Bereich = ? order by Bereich");
            $stmt->bind_param("s", $_GET["Adresse"]);
            $stmt->execute();
            $result = $stmt->get_result();

            while($row = $result->fetch_object())
              {
                  echo "<tr>\n";
                  echo "<td>".$row->Zeit."</td>";
                  echo "<td>".$row->Bereich."</td>";
                  echo "<td>".$row->Beschreibung."</td>";
                  echo "<td>".$row->Wert."</td>";
                  echo "<td>".$row->Einheit."</td>";
                  echo "<td>".$row->Medium."</td>";
                  echo "</tr>\n";
              }
          } catch (Exception $e) {
            die("Fehler bei Datenbankzugriff: " . $e->getMessage());
          }
    }
    else{
        try {
            $result = $mysqli->query("SELECT * FROM viewAktuell order by Bereich, Medium");
            while($row = $result->fetch_object())
              {
                  echo "<tr>\n";
                  echo "<td>".$row->Zeit."</td>";
                  echo "<td>".$row->Bereich."</td>";
                  echo "<td>".$row->Beschreibung."</td>";
                  echo "<td>".$row->Wert."</td>";
                  echo "<td>".$row->Einheit."</td>";
                  echo "<td>".$row->Medium."</td>";
                  echo "</tr>\n";
              }
          } catch (Exception $e) {
            die("Fehler bei Datenbankzugriff: " . $e->getMessage());
          }
    }

    $result->close();
    $mysqli->close();
    ?>
    </table>
    </form>
    </fieldset>
    </main>
</body>
</html>
