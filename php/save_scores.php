<?php
header("Content-Type: application/json");

//Input lesen und speichern, hier mit true als Array
$input = json_decode(file_get_contents("php://input"), true);

//Wenn keine oder keine gültigen Daten erhalten werden, Fehler und Code ausgeben (Übervorsicht, Sollte nicht auftreten)
if (!$input) {
    http_response_code(400);
    echo json_encode(["message" => "Keine gültigen Daten erhalten."]);
    exit;
}

//Einzeldaten extrahieren
$name = trim($input["name"] ?? "");
$kategorie = trim($input["kategorie"] ?? "");
$richtig = intval($input["richtig"] ?? 0);
$gesamt = intval($input["gesamt"] ?? 0);
$prozent = intval($input["prozent"] ?? 0);

//Wenn keine gültigen Daten erhalten werden, hier wenn name oder kategorie leer sind, Fehler und Code ausgeben (Übervorsicht, Sollte nicht auftreten)
if ($name === "" || $kategorie === "" || $gesamt <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Ungültige Eingaben."]);
    exit;
}

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

//Normales SQLite, Aufbau der Insert-Anweisung mit allen Daten, Überschreiben wenn der Name schon vorhanden ist (UPSERT)
$stmt = $db->prepare("
    INSERT INTO scores
    (name, kategorie, richtig, gesamt, prozent, datum)
    VALUES
    (:name, :kategorie, :richtig, :gesamt, :prozent, datetime('now'))
    ON CONFLICT(name) DO UPDATE SET
        kategorie = excluded.kategorie,
        richtig = excluded.richtig,
        gesamt = excluded.gesamt,
        prozent = excluded.prozent,
        datum = excluded.datum
");

//Daten in Platzhalter setzen
$stmt->bindValue(":name", $name, SQLITE3_TEXT);
$stmt->bindValue(":kategorie", $kategorie, SQLITE3_TEXT);
$stmt->bindValue(":richtig", $richtig, SQLITE3_INTEGER);
$stmt->bindValue(":gesamt", $gesamt, SQLITE3_INTEGER);
$stmt->bindValue(":prozent", $prozent, SQLITE3_INTEGER);

$stmt->execute();

//Wenn erfolgreich, entsprechende Meldung ausgeben
echo json_encode(["message" => "Highscore gespeichert."]);
