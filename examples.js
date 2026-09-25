"use strict";

// Aufgaben aus dem Skript „Analysis III BAUG“ (V2), in denen eine Partialbruchzerlegung vorkommt.
// Hinterlegt ist nur die Zerlegung (gleiches Format wie beim Generator); Aufgabe und
// Lösungsschritte entstehen daraus genau wie bei den zufälligen Aufgaben.
// Reell: Term c/(s-r)^power. Komplex: (c s + d)/((s-a)^2+b^2).

const real = (r, power, c) => ({type: "real", r, power, c});
const quad = (a, b, c, d) => ({type: "complex", a, b, c, d});

const SCRIPT_EXAMPLES = [
  {source: "Beispiel 1.2.12", page: 15, terms: [real(0, 1, 1), quad(0, 1, 0, 1)]},
  {source: "Übung 1.2.19", page: 16, terms: [real(3, 1, 2/3), real(-3, 1, -2/3)]},
  {source: "Übung 1.2.20", page: 16, terms: [real(1, 1, 1), real(-1, 1, 1)]},
  {source: "Übung 1.2.21", page: 16, terms: [real(1, 2, 1/2), real(1, 1, -1/4), real(-1, 1, 1/4)]},
  {source: "Übung 1.2.23", page: 16, terms: [quad(-1/2, Math.sqrt(7)/2, 2/7, 1/7), real(-4, 1, -2/7)]},
  {source: "Übung 1.2.27", page: 17, terms: [real(0, 3, 4), real(0, 2, -2), real(0, 1, 1), real(-2, 1, -1)]},
  {source: "Beispiel 1.3.2", page: 18, terms: [quad(0, 1, 1/3, 0), quad(0, 2, -1/3, 0)]},
  {source: "Beispiel 1.3.3", page: 19, terms: [real(0, 2, -1), real(0, 1, 0), real(1, 1, 1/2), real(-1, 1, -1/2)]},
  {source: "Beispiel 1.3.18", page: 24, terms: [real(0, 1, 1), quad(0, 1, -1, 0)]},
  {source: "Beispiel 1.4.4", page: 28, terms: [real(0, 2, 1), real(0, 1, -1), real(-1, 1, 1)]},
  {source: "Übung 1.4.19", page: 34, terms: [real(0, 2, 5), real(0, 1, 0), quad(0, 1, 0, -5)]},
];
