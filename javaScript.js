"use strict";

//container für alle Daten aus dem fragen.json, wird beim Laden der Seite gefüllt
let daten = {};

//Array für die aktuell gemischten Fragen der gewählten Kategorie
let gemischteFragen = [];

//Index der aktuellen Frage im Array der gemischten Fragen
let aktuelleFrageIndex = 0;

//Anzahl der beantworteten Fragen pro Durchlauf
let beantwortet = 0;

//Anzahl der RICHTIG beantworteten Fragen pro Durchlauf
let richtigBeantwortet = 0;

//Kategorie in der man sich gerade befindet, z.B. "Mathe" oder "Allgemein"
let aktuelleKategorie = "";

//Speicher für eine gesamte Frage für die externen Quiz-Fragen
let aktuelleServerFrage = null;

//Speicher für die Seitenzahl bei den Quizzes, die man Seitenweise durchgehen kann
let aktuelleServerSeite = 0;

//Tag um zu merken, dass man auf der letzten Seite bei den Quizzes vom Server ist, um den Button "Weiter" abzuschalten
let serverLetzteSeite = false;

//Tag um zu merken, dass man auf der letzten Seite bei den Quizzes vom Server ist, um den Button "Zurück" abzuschalten
let serverErsteSeite = true;

//Konstante für die URL für die Quiz-Engine
const SERVER_URL = "https://idefix.informatik.htw-dresden.de:8888";

//Laden aller Fragen wenn das Fenster geöffnet wird
window.onload = async () => {
    await ladeFragen();
    zeigeStartseite();
};

//Funktion zum Ansichtenwechsel zwischen allen Ansichten (siehe Sections im HTML bis auf die Score-Tabelle)
function zeigeAnsicht(ansichtId) {
    document.getElementById("startseite").hidden = true;
    document.getElementById("quizseite").hidden = true;
    document.getElementById("statistikseite").hidden = true;
    document.getElementById("serverLoginseite").hidden = true;
    document.getElementById("serverAuswahlseite").hidden = true;
    document.getElementById("quizseiteServer").hidden = true;

    document.getElementById(ansichtId).hidden = false;
}

//Funktion zum zeigen der Startseite mit kleinen resets
function zeigeStartseite() {
    zeigeAnsicht("startseite");
    document.getElementById("highscoreMeldung").textContent = "";
    document.getElementById("highscoreSpeichern").disabled = false;
}

//Funktion zum Zeigen der Statistikseite, es wird die div statistik mit den zentral gespeicherten Daten befüllt und in eigenen Paragraphen angezeigt
function zeigeStatistikseite() {
    zeigeAnsicht("statistikseite");
    const statistikDiv = document.getElementById("statistik");
    statistikDiv.innerHTML = `<p>Beantwortete Fragen: ${beantwortet}</p>
                              <p>Richtig beantwortete Fragen: ${richtigBeantwortet}</p>
                              <p>Prozent: ${berechneProzent(richtigBeantwortet, beantwortet)}%</p>`;
    ladeHighscores();
}

//Funktion zum Anzeigen der Quizseite
function zeigeQuizseite() {
    zeigeAnsicht("quizseite");
}

//Funktion um eine bestimmte Kategorie zu starten, z.B. "Web"
function starteKategorie(kategorieName) {
    //Kategorienamen zentral speichern
    aktuelleKategorie = kategorieName;
    //Aus allen Daten aus der fragen.json die Kategorie finden
    const kategorie = daten.kategorien.find(
        eintrag => eintrag.kategorie === kategorieName
    );
    //Fragen mischen und zentral speichern
    gemischteFragen = fisherYatesShuffle([...kategorie.fragen]);

    starteDurchlauf();
}

//Variablen und ein paar Textfelder resetten, Fragen mischen und erste Frage anzeigen
function starteDurchlauf() {
    aktuelleFrageIndex = 0;
    beantwortet = 0;
    richtigBeantwortet = 0;

    document.getElementById("highscoreMeldung").textContent = "";
    document.getElementById("highscoreSpeichern").disabled = false;

    const ueberschrift = document.getElementById("ueberschrift");
    ueberschrift.textContent = `Kategorie: ${aktuelleKategorie}`;

    aktualisiereFortschritt();

    zeigeQuizseite();
    zeigeFrage();
}

// Funktion zum Laden der Daten aus der JSON-Datei
async function ladeFragen() {
    try {
    const antwort = await fetch("fragen.json");
    daten = await antwort.json();
    } catch (error) {
        console.error("Fehler beim Laden der JSON-Daten:", error);
    }
}

// Funktion zum Anzeigen der aktuellen Frage und Antworten
function zeigeFrage() {
    //Frage prüfen Button erstmal abschalten
    document.getElementById("fragePruefen").disabled = true;

    const frage = gemischteFragen[aktuelleFrageIndex];

    // Fortschrittsanzeige aktualisieren
    const fortschrittText = document.getElementById("fortschrittText");
    fortschrittText.textContent = `Frage ${aktuelleFrageIndex + 1} von ${gemischteFragen.length}`;

    // Frage anzeigen
    const frageDiv =
    document.getElementById("frage");
    frageDiv.innerHTML = frage.frage;

    // Mathematische Formeln rendern, falls Kategorie "Mathe" ist
    if (aktuelleKategorie === "Mathe") {
        renderMathInElement(
            frageDiv,
            {
                delimiters: [
                    {
                        left: "$$",
                        right: "$$",
                        display: true
                    },
                    {
                        left: "$",
                        right: "$",
                        display: false
                    }
                ]
            }
        );
    }

    const antwortenDiv = document.getElementById("antworten");
    antwortenDiv.innerHTML = "";

    //Alle Antworten mischen und anzeigen
    const antworten = fisherYatesShuffle([...frage.antworten]);

    //Über alle Antworten iterieren
    antworten.forEach((antwort) => {

        //label erstellen und hinzufügen, antwort-option mit antwort-lokal für klare Trennung zwischen lokalen Fragen und Server-Fragen, 
        //String(), da normales true und false zu Fehlern führte
        const label = document.createElement("label");
        label.classList.add("antwort-option", "antwort-lokal");
        label.dataset.richtig = String(antwort.richtig);

        //checkbox kreieren und anreichern. antwortLokal als Name für klare Trennung zwischen lokalen Fragen und Server-Fragen
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "antwortLokal";
        checkbox.value = antwort.richtig;

        label.appendChild(checkbox);
        label.append(" " + antwort.text);

        //label anhängen
        antwortenDiv.appendChild(label);

        antwortenDiv.appendChild(document.createElement("br"));
        
        //Wenn Kategorie Mathe, dann mit KaTeX rendern, die Limiter sind $. Auto-render wird verwendet
        if (aktuelleKategorie === "Mathe") {
        renderMathInElement( antwortenDiv, {
                delimiters: [{
                        left: "$$",
                        right: "$$",
                        display: true
                    }, {
                        left: "$",
                        right: "$",
                        display: false
                    }]
            });
        }
    });
    
    //Alle checkboxen angucken und gucken, ob eine Veränderung passiert ist (Angeklickt), 
    //wenn ja, dann überprüfen ob Button disabled oder enabled sein muss
    const checkboxen = document.querySelectorAll('#antworten input[type="checkbox"]');
    checkboxen.forEach(checkbox => {
        checkbox.addEventListener("change", aktualisierePruefButton);
    });
}

// Funktion zum Berechnen eines Prozentsatzes
function berechneProzent(anz1,anz2) {
    const prozent = (anz1 / anz2) * 100;
    //keine Nachkommastellen
    return prozent.toFixed(0);
}

// Funktion zum Mischen eines Arrays (Fisher-Yates-Algorithmus)
function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        // Wähle einen zufälligen Index zwischen 0 und i
        const j = Math.floor(Math.random() * (i + 1));
        // Tausche die Elemente
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Funktion zum Überprüfen der ausgewählten Antworten und Aktualisieren der Statistik
function pruefeAntwort() {

    // Speichern, wie viele Antworten ausgewählt wurden
    const ausgewaehlt = document.querySelectorAll('input[name="antwortLokal"]:checked');

    let richtigFalsch = true;

    //Nur wenn etwas ausgewählt wurde, sonst Meldung
    if (ausgewaehlt.length > 0) {  
        document.querySelectorAll(".antwort-lokal").forEach(label => {
            const checkbox = label.querySelector("input");
            const istRichtig = label.dataset.richtig === "true";
            const istAusgewaehlt = checkbox.checked;

            if (istRichtig !== istAusgewaehlt) {
                richtigFalsch = false;
            }
        });

        //wenn richtig, Statistik für richtig Beantwortete erhöhen
        if (richtigFalsch) {
            richtigBeantwortet++;
        }

        //sonst nur Statistik der Beantworteten
        beantwortet++;

        zeigeFeedback(richtigFalsch);

        markiereAntworten();

        // Alle Checkboxen deaktivieren sobald überprüft wird
        document.querySelectorAll('input[name="antwortLokal"]').forEach(checkbox => {
            checkbox.disabled = true;
        });

        // Button-Text und Funktion auf "Weiter" ändern
        const button = document.getElementById("fragePruefen");

        button.textContent = "Weiter";
        button.onclick = naechsteFrage;

    } else {
            alert("Bitte wählen Sie eine Antwort aus.");
    }
}

// Richtige Antworten grün markieren, falsche Antworten rot markieren
function markiereAntworten() {
    document.querySelectorAll(".antwort-lokal").forEach(label => {

        const checkbox = label.querySelector("input");

        //Hier sind String-Vergleiche, deswegen vorher Arbeit mit String()
        if (label.dataset.richtig === "true") {
            label.classList.add("antwort-richtig");
        }

        if (label.dataset.richtig === "false" && checkbox.checked) {
            label.classList.add("antwort-falsch");
        }

        checkbox.disabled = true;
    });
}

// Funktion zum Laden der nächsten Frage oder Anzeigen der Statistikseite, wenn alle Fragen beantwortet wurden
function naechsteFrage() {
    
    aktuelleFrageIndex++;

    // Fortschrittsanzeige aktualisieren
    aktualisiereFortschritt();

    // Button-Text und Funktion zurücksetzen
    const button =  document.getElementById("fragePruefen");
    button.textContent = "Antwort überprüfen";
    button.onclick = pruefeAntwort;

    // Wenn alle Fragen beantwortet wurden, Statistikseite anzeigen
    if (aktuelleFrageIndex >= gemischteFragen.length) {
        zeigeStatistikseite();
        gemischteFragen = fisherYatesShuffle([...gemischteFragen]);
        return;
    }

    zeigeFrage();
}

// Funktion zum Anzeigen von Feedback (grün für richtig, rot für falsch) und Entfernen des Feedbacks nach kurzer Zeit
function zeigeFeedback(richtig) {
    document.body.classList.add(richtig ? "feedback-richtig" : "feedback-falsch");

    setTimeout(() => {
        document.body.classList.remove("feedback-richtig", "feedback-falsch");
    }, 500);
}

// Funktion zum Abbrechen des aktuellen Durchlaufs, Reset und Zurückkehren zur Startseite
function abbrechen() {
    aktuelleFrageIndex = 0;
    beantwortet = 0;
    richtigBeantwortet = 0;
    zeigeStartseite();
}

//Anzeige des Fortschritts
function aktualisiereFortschritt() {
    const prozent = berechneProzent(beantwortet, gemischteFragen.length);

    document.getElementById("fragenFortschritt").style.width = `${prozent}%`;
}

//Funktion um eine Serverseitige Frage anzuzeigen, ähnlich zeigeFrage, aber nicht ganz gleich
function zeigeServerFrage(serverFrage) {
    //Frage prüfen Button erstmal abschalten
    document.getElementById("fragePruefenServer").disabled = true;

    //Titel anzeigen
    document.getElementById("ueberschriftServer").textContent = `Server-Quiz: ${serverFrage.title}`;

    //Frage anzeigen
    document.getElementById("frageServer").textContent = serverFrage.text;

    //antworten erstmal leeren
    const antwortenDiv = document.getElementById("antwortenServer");
    antwortenDiv.innerHTML = "";

    //Server-Frage mit Indexen anreichern um nach dem Mischen nicht durcheinander zu kommen
    const optionen = serverFrage.options.map((text, index) => ({
        text: text,
        originalIndex: index
    }));

    //Mischen und analog zu zeigeFrage anzeigen
    fisherYatesShuffle(optionen).forEach((option) => {
        const label = document.createElement("label");
        //Achtung, erneut Trennung externer Server und Lokal
        label.classList.add("antwort-option", "antwort-server");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "antwortServer";
        checkbox.value = option.originalIndex;

        label.appendChild(checkbox);
        label.append(" " + option.text);

        antwortenDiv.appendChild(label);
    });

    //Wieder den listener hinzufügen um den Prüfbutton aus und an zu schalten (siehe zeigeFrage)
    const checkboxen = document.querySelectorAll('#antwortenServer input[type="checkbox"]');
    checkboxen.forEach(checkbox => {
        checkbox.addEventListener("change", aktualisierePruefButtonServer);
    });
}

//Funktion zum Testen ob der Prüfbutton beim Server disabled oder enabled sein soll
function aktualisierePruefButtonServer() {
    const checkboxen = document.querySelectorAll(
        '#antwortenServer input[type="checkbox"]'
    );

    const mindestensEineAusgewaehlt =
        Array.from(checkboxen).some(checkbox => checkbox.checked);

    document.getElementById("fragePruefenServer").disabled =
        !mindestensEineAusgewaehlt;
}

//Funktion zum Testen ob der Prüfbutton disabled oder enabled sein soll
function aktualisierePruefButton() {

    const checkboxen = document.querySelectorAll('#antworten input[type="checkbox"]');

    //Hier die Prüfung ob eine Antwort ausgewählt ist. Guter Fund: Some guckt ob irgendein Eintrag im Array true ist
    const mindestensEineAusgewaehlt = Array.from(checkboxen).some(checkbox => checkbox.checked);

    document.getElementById("fragePruefen").disabled = !mindestensEineAusgewaehlt;
}

//Senden der Antwort an den externen Quiz-Server und warten auf Antwort
async function pruefeServerAntwort() {
    //Alle ausgewählten Antworten holen
    const ausgewaehlt = document.querySelectorAll('input[name="antwortServer"]:checked');

    //Indexe rausholen und zu einem Arrayzusammensetzen
    const antwortIndexe = Array.from(ausgewaehlt).map(input => Number(input.value));

    //Mit Post an den externen Quiz-Server schicken und auf Antwort warten und diese speichern
    const antwort = await fetch(
        `${SERVER_URL}/api/quizzes/${aktuelleServerFrage.id}/solve`, {
            method: "POST",
            headers: {
                "Authorization": erstelleAuthorizationHeader(),
                "Content-Type": "application/json"
            },
            //Array aus Indexen zu Json umformatieren
            body: JSON.stringify(antwortIndexe)
        }
    );

    //ergebnis der Server-Antwort speichern
    const ergebnis = await antwort.json();

    //Feedback ob richtig oder falsch zeigen und als Text displayen
    zeigeFeedback(ergebnis.success);

    const feedbackServer = document.getElementById("feedbackServer");
    feedbackServer.textContent = ergebnis.success ? "Richtig!" : "Falsch!";

    document.querySelectorAll('input[name="antwortServer"]').forEach(input => input.disabled = true);

    //button Frage prüfen abändern
    const button = document.getElementById("fragePruefenServer");
    button.textContent = "Zurück zur Auswahl";
    button.onclick = zurueckZurServerAuswahl;
}

//Auuthorization Header erstellen und mit gemerktem user und passwort aus der Anmeldung befüllen
function erstelleAuthorizationHeader() {
    const user = document.getElementById("user").value;
    const passwort = document.getElementById("passwort").value;

    return "Basic " + btoa(`${user}:${passwort}`);
}

//Server-Auswahl starten, dafür auf erfolgreiches Laden der ersten Quiz-Seite vom externen Server warten
async function starteServerAuswahl() {
    const erfolgreich = await ladeServerQuizSeite(0);

    if (erfolgreich) {
        zeigeAnsicht("serverAuswahlseite");
    }
}

//Eine Seite vom externen Server holen
async function ladeServerQuizSeite(seite) {
    //mit try catch um eventuelle Error auszubügeln und die Meldung anzeigen zu können
    try {
        //Seite mit Quizzes mit Aufruf analog zur Doku holen 
        const antwort = await fetch(`${SERVER_URL}/api/quizzes?page=${seite}`, {
            headers: {
                "Authorization": erstelleAuthorizationHeader()
            }
        });

        //Wenn der zurückkommende Status 401 ist, dann ist wahrscheinlich der User nicht vorhanden oder das Passwort falsch
        if (antwort.status === 401) {
            zeigeServerMeldung("Authentifikation fehlgeschlagen.");
            return false;
        }

        //Wenn es einen anderen Fehler gibt, generische Antwort zeigen
        if (!antwort.ok) {
            zeigeServerMeldung("Server-Anfrage fehlgeschlagen.");
            return false;
        }

        //Daten verarbeiten, Wichtige Nummern zentral abspeichern um Button an und ausschalten zu können, 
        //sowie Seiten chronologisch durchgehen zu können
        const daten = await antwort.json();

        aktuelleServerSeite = daten.number;
        serverLetzteSeite = daten.last;
        serverErsteSeite = daten.first;

        zeigeServerQuizzes(daten);

        aktualisierePagingButtons();

        return true;
    } catch (error) {
        console.error(error);
        zeigeServerMeldung("Server ist nicht erreichbar.");
        return false;
    }
}

//reset einiger Sachen (zum Teil übermäßig vorsichtig) und Anzeige der Serverseite
function starteServerQuiz(quiz) {
    aktuelleKategorie = "Server";
    aktuelleServerFrage = quiz;
    beantwortet = 0;
    richtigBeantwortet = 0;

    zeigeAnsicht("quizseiteServer");
    zeigeServerFrage(quiz);
}

//Alle Quizzes einer Seite anzeigen
function zeigeServerQuizzes(daten) {
    const container = document.getElementById("serverQuizAnzeige");
    container.innerHTML = "";

    //Wenn etwas schief geht, wird es hier abgefangen, sollte nie auftreten
    if (daten.empty || daten.content.length === 0) {
        container.textContent = "Keine Quizzes auf dieser Seite.";
        return;
    }

    //Für jedes Quiz vom Server den Titel, den Text und einen Button erstellen, mit dem man zum Quiz kommt, 
    //es ist als einzelne "Karten" gestaltet, das sieht besser aus
    daten.content.forEach((quiz) => {
        const card = document.createElement("div");
        card.classList.add("server-quiz-card");

        const titel = document.createElement("h2");
        titel.textContent = quiz.title;

        const text = document.createElement("p");
        text.textContent = quiz.text;

        const button = document.createElement("button");
        button.classList.add("kategorie-button");
        button.textContent = "Quiz starten";
        button.onclick = () => starteServerQuiz(quiz);

        card.appendChild(titel);
        card.appendChild(text);
        card.appendChild(button);

        container.appendChild(card);
    });
}

//Nächste Seite laden und mit ladeServerQuizSeite (mit +1 zu Seite) vom Server holen
function naechsteServerSeite() {
    //Übervorsicht, sollte nie auftreten
    if (serverLetzteSeite) {
        alert("Du bist bereits auf der letzten Seite.");
        return;
    }

    ladeServerQuizSeite(aktuelleServerSeite + 1);
}

//Seite davor holen, analog zu hierüber nur mit -1
function vorherigeServerSeite() {
    //Übervorsicht, sollte nie auftreten
    if (serverErsteSeite) {
        alert("Du bist bereits auf der ersten Seite.");
        return;
    }

    ladeServerQuizSeite(aktuelleServerSeite - 1);
}

//Enabled oder disabled die Buttons "Zurück" und "Weiter" je nach Seite, deswegen der Test und Abfrage oben übervorsichtig
function aktualisierePagingButtons() {

    document.getElementById("vorherigeSeite").disabled = serverErsteSeite;

    document.getElementById("naechsteSeite").disabled = serverLetzteSeite;
}

//In den Container serverMeldung eine etwaige Meldung eintragen
function zeigeServerMeldung(text) {
    document.getElementById("serverMeldung").textContent = text;
}

//Funktion um zurück zur Auswahl der Quizzes auf dem Server zu kommen, diverse resets und laden der Seite auf der man vorher war
function zurueckZurServerAuswahl() {
    const feedbackServer = document.getElementById("feedbackServer");
    feedbackServer.textContent = "";
    aktuelleServerFrage = null;
    ladeServerQuizSeite(aktuelleServerSeite);
    zeigeAnsicht("serverAuswahlseite");
    const button =  document.getElementById("fragePruefenServer");
    button.textContent = "Antwort überprüfen";
    button.onclick = pruefeServerAntwort;
}

//Funktion zum Speichern der Hichscores mit php
async function speichereHighscore() {
    //eingetragenen Namen holen, unnötige Leerzeichen entfernen
    const name = document.getElementById("spielerName").value.trim();

    //Wenn Name leer ist oder nur Leerzeichen, dann Hinweis und Abbruch
    if (name.length === 0) {
        document.getElementById("highscoreMeldung").textContent = "Bitte gib einen Namen ein.";
        return;
    }

    //Alle Daten zusammenfügen, die dann ans php gegeben werden
    const daten = {
        name: name,
        kategorie: aktuelleKategorie,
        richtig: richtigBeantwortet,
        gesamt: beantwortet,
        prozent: Number(berechneProzent(richtigBeantwortet, beantwortet))
    };

    //Daten mit POST an php geben. Für klare Trennung gibt es ein php für das Speichern und eines für das Holen der Scores
    const antwort = await fetch("php/save_scores.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(daten)
    });

    //Ergebnis des php abwarten und die Message anzeigen
    const ergebnis = await antwort.json();

    document.getElementById("highscoreMeldung").textContent = ergebnis.message;

    //Button Highscore speichern abschalten um Dopplung zu vermeiden
    document.getElementById("highscoreSpeichern").disabled = true;

    //Tabelle updaten
    await ladeHighscores();
}

async function ladeHighscores() {
    //Besten 10 Scores aus der Datenbank mit php holen, "&t=" + Date.now() angefügt, weil es aus dem Cache geladen wurde und nicht geupdatet
    const antwort = await fetch(
        "php/get_scores.php?kategorie=" +
        encodeURIComponent(aktuelleKategorie) +
        "&t=" + Date.now());

    //Wenn etwas schief geht oder keine Scores da sind, kommt diese Meldung und Abbruch
    if (!antwort.ok) {
        document.getElementById("highscoreListe").textContent = "Highscores konnten nicht geladen werden.";
        return;
    }

    //alle scores speichern
    const scores = await antwort.json();

    //reset Tabelle
    const liste = document.getElementById("highscoreListe");
    liste.innerHTML = "";

    //Tabelle erstellen, klare Trennung der Elemente mit spans, damit die Tabelle gut designt werden kann
    scores.forEach((score, index) => {
        const eintrag = document.createElement("div");
        eintrag.classList.add("highscore-eintrag");

        const rang = document.createElement("span");
        rang.classList.add("highscore-rang");
        rang.textContent = `${index + 1}.`;

        const name = document.createElement("span");
        name.classList.add("highscore-name");
        name.textContent = score.name;

        const punkte = document.createElement("span");
        punkte.classList.add("highscore-score");
        punkte.textContent = `${score.richtig}/${score.gesamt} · ${score.prozent}%`;

        eintrag.appendChild(rang);
        eintrag.appendChild(name);
        eintrag.appendChild(punkte);

        liste.appendChild(eintrag);
    });
}

//Service Worker Registrierung, so kopiert, Konsolenausgabe war immer sinnvoll
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
        .then(() => {
            console.log("Service Worker registriert");
        })
        .catch((error) => {
            console.error("Service Worker Fehler:", error);
        });
}

