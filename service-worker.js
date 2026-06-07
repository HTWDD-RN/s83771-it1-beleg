"use strict";

//In dieser Klasse ist fast alles anhand von https://freiheit.f4.htw-berlin.de/ikt/caching/, mit nur kleinen Anpassungen für die Deutlichkeit für mich

//Es gab Probleme mit dem Cache, wenn das nicht inkrementiert wird, bei größeren Änderungen später inkrementieren um neu zu Cachen
const CACHE_NAME = "lernprogramm-v2";

const DATEIEN_ZUM_CACHEN = [
    "./",
    "./index.html",
    "./stylesheet.css",
    "./javaScript.js",
    "./fragen.json",
    "./manifest.json",
    "./IconOhneHintergrund.png",
    "https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css",
    "https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.js",
    "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(DATEIEN_ZUM_CACHEN)));
});

//Hier musste ChatGPT mich korrigieren, hier bin ich stecken geblieben. 
//Der Filter auf die aktuelle Version ist wichitg und irgendetwas ging hier vorher schief. Jetzt läuft es
self.addEventListener("activate", (event) => {
    event.waitUntil(caches.keys().then((cacheNamen) =>
        Promise.all(cacheNamen.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then((antwort) => {
        return antwort || fetch(event.request);
    }));
});