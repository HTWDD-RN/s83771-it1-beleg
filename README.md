# Beleg IT1

## gelöste Aufgaben
Bis auf die Einbindung von AI sollte alles gelöst sein. Der externe Quiz-Server ist erreichbar und die Fragen beantwortbar, der Cache funktioniert, die Webseite funktioniert normal offline. Aufgaben werden gemischt etc..
Ich habe die meiste Zeit in Microsoft Edge und Visual Studio Code mit diversen Erweiterungen, die es mir leicher machen, gearbeitet.
## Vorgehen
Ich möchte von Anfang an klar sagen, dass ich ChatGPT als Recherche- und Korrektur-Tool durchaus regelmäßig verwendet habe. Der Ablauf war so, dass ich es selber programmiert habe und dann ChatGPT wenn Fehler, die ich nicht fand, da waren, oder ich etwas nicht verstand, zur Hand gezogen habe. Zum Teil habe ich es entsprechend im Code kommentiert, aber nicht überall. Code habe ich mir nur in sehr kleinen Teilen generieren lassen (maximal 10 Zeilen am Stück), wenn ich wirklich feststeckte. Korrektur habe ich mehr verwendet. Vielleicht hätte ich ansonsten noch die Anbindung mit der KI hingekriegt, aber ich will lieber lernen.

Ich habe langsam angefangen und mir erstmal ein minimal-framework gebaut, auf dem ich unformatiert und ohne css quizzes aus einem fragen.json nach kategorie laden und lösen konnte (Single-Choice). Das war soweit erstmal recht einfach, aber ein wichtiger Rahmen.

Danach habe ich mich mit der Statistik befasst und diese umgesetzt. Mich hat aber dann gestört, dass die Fragen immer gleich und in der gleichen Reihenfolge kamen, also habe ich mich über einen einfachen aber guten Misch-Algorithmus informiert und bin beim Fisher-Yates-Shuffle gelandet, den ich dannn eingebaut hatte.

Der nächste Schritt war KaTeX und Verschönerung des Designs. Ich habe sehr lange daran gesessen, speziell am CSS, Werte um 0.1 angepasst und mir angesehen was es gebracht hat. Ich habe mich dann entschieden mit der KI ein Logo/Icon erstellen zu lassen, sodass ich einen Farbrahmen habe. Ergebnis ist ganz witzig geworden. CSS hat mich aber weiter verfolgt und da sind die Meisten meiner Bugs entstanden. Farben habe ich mir von der KI anhand von dem Gelb im Logo erstellen lassen, das hat es für mich einfacher gemacht. Nach recherche zu KaTeX mit KI und Google hat mir ChtGPT vorgeschlagen KaTeX mit auto-render zusammen zu verwednen. Das habe ich dann auch so umgesetzt, es hat mir ermöglicht Teile der Sätze zu extrahieren und mit KaTeX zu rendern.

Danach habe ich mein Programm auf Mehrfachauswahl erweitert. Das hat Änderungen im fragen.json benötigt, die einzelnen Fragen mussten einen true oder false flag kriegen, ob sie richtig oder falsch sind. Dabei ist auch ein Bug aufgetreten, der mich einiges an Zeit gekostet hat. Ich habe die Dataset-Werte als booleans benutzt, ich dachte das geht, aber es sind Strings, daher war es bei mir dann immer falsch. 

Zusätzlich kam mir die Idee zu zeigen was man falsch gemacht hat. Also habe ich eine Markierung von richtigen Antworten sowie falsch ausgewählten hinzugefügt. Dazu habe ich noch einen Flash im Hintergrund (rot oder grün) implementiert, der einem direkt zeigt ob es falsch oder richtig war und bei grün genugtuend wirkt.
Dann habe ich die erste Version für mobile Endgeräte entwickelt, es waren tatsächlich nur wenige Anpassungen notwendig.

Die Anbindung an den externen Quiz-Server hat mich vor einige Probleme gestellt. Meine Notizen sind hier aber kurz, ich war hier deutlich frustriert. Die Anmeldung wollte nicht klappen und ich wollte auch neue Nutzer registrieren können, aber das hat Cors grundsätzlich blockiert. Insgesamt gab es einige Cors Probleme in diesem Teil. Einzelne Quizzes zu holen wurde mir immer blockiert, da aber auf den pages alle notwendigen Infos waren, habe ich keine einzelnen Quizzes mehr geholt, sondern direkt eine Seite und nur die Lösung versendet.

PWA hätte ich als letzten Schritt machen sollen. Bei mir hatte ich ständig das Problem, dass der Browser den alten Cache verwendete statt die Seite mit Änderungen neu zu laden. Ich habe teilweise lange gesucht, bis ich mich an diesen fehler gewöhnt hatte, in diesem Fall wustte ChatGPT dann auch nicht weiter, weil e ja eigentlich hätte laufen müssen. Insgesamt war es aber für sich weniger Aufwand als ich dachte, die Webseite https://freiheit.f4.htw-berlin.de/ikt/caching/ hat mir sehr geholfen. Für die Highscores hat es mir aber weiter Kopfschmerzen bereitet.

Am Ende habe ich noch die Speicherung der Highscores umgesetzt, PHP war mir gar nicht vertraut, aber SQL dafür umso besser. Insgesamt nach dem Verstehen der Architektur nur Probleme mit Zugriffsrechten und der Erstellung eines ansprechenden Designs. ChatGPT schlug mir hier einzelne Karten vor, was ich dann so umgesetzt habe. 

Im Test sind mir noch zu kleine Elemente für Mobilgeräte und kleinere Design-Anpassungen aufgefallen, aber nichts Großes mehr.
