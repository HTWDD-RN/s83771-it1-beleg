<?php
header("Content-Type: application/json");

//Datei holen oder aufbauen (Auf Server nicht möglich gewesen, aber solange si da ist läufts)
$db = new SQLite3(__DIR__ . "/scores.sqlite");

//Normales SQLite, Text UNIQUE damit Namen eindeutig sind
$db->exec("
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        kategorie TEXT NOT NULL,
        richtig INTEGER NOT NULL,
        gesamt INTEGER NOT NULL,
        prozent INTEGER NOT NULL,
        datum TEXT NOT NULL
    )
");

//Filter für die Kategorie, wird im POST mit geliefert
$kategorie = $_GET["kategorie"] ?? "";

//Normales SQLite, LIMIT 10 um Tabelle zu begrenzen, Filter mit Kategorie
$stmt = $db->prepare("
    SELECT name, kategorie, richtig, gesamt, prozent, datum
    FROM scores
    WHERE kategorie = :kategorie
    ORDER BY prozent DESC, richtig DESC, datum DESC
    LIMIT 10
");

//Befüllen von :kategorie mit übergebenem Wert
$stmt->bindValue(":kategorie", $kategorie, SQLITE3_TEXT);

//Ausführen und result speichern
$result = $stmt->execute();

//Variable für alle scores erstellen
$scores = [];

//Alle Reihen durchgehen indem $result reihenweise mit fetchArray durchlaufen wird, das Resultat ist ein Array einer Zeile,
//SQLITE3_ASSOC damit das Schema passt
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    //Jede Reihe in ein (nun zweidimensionales) Array zusammenfügen
    $scores[] = $row;
}

//Ergebnis als Textanzeige ausliefern
echo json_encode($scores);
