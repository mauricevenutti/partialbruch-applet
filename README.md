# Partialbruchzerlegung – Übungsapplet

## Wolfram Cloud

Die Prüfung läuft gegen eine fest in `app.js` (`WOLFRAM_ENDPOINT`) hinterlegte Wolfram-Cloud-URL, die mit `wolfram-cloud-verifier.wl` bereitgestellt wurde. Um die URL zu ändern, `WOLFRAM_ENDPOINT` in `app.js` anpassen.

Das Applet sendet nur zwei symbolische mathematische Ausdrücke an diese URL. Eine Lösung wird erst nach der exakten Bestätigung durch `Together` angezeigt. `Apart` wird zusätzlich als unabhängige Zerlegung berechnet.

## Lokal starten

Im Ordner des Applets einen statischen Webserver starten, zum Beispiel:

```sh
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen.

## Generatorregeln

- Reelle Nullstellen: ganzzahlig zwischen 1 und 5.
- Komplexe Nullstellen: konjugierte Paare `a ± b i` mit `a,b` zwischen 1 und 5.
- Höchstens fünf Nullstellen, wobei Vielfachheiten und beide komplexen Partner einzeln zählen.
- Kleine ganzzahlige Partialbruchkoeffizienten.
- Aufgaben mit zu grossen Zählerkoeffizienten werden verworfen und neu erzeugt.
