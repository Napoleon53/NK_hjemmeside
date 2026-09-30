/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for Kemikortene

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch: mappen
   skal ogsaa virke, naar index.html aabnes direkte fra harddisken
   (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.el = function (id) {
        return document.getElementById(id);
    };

    NK.klamp = function (v, lav, hoej) {
        return v < lav ? lav : (v > hoej ? hoej : v);
    };

    /* Blander en kopi af listen (Fisher-Yates). */
    NK.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    NK.tilfaeldig = function (liste) {
        return liste[Math.floor(Math.random() * liste.length)];
    };

    /* ----- Hukommelse i browseren ------------------------------------
       Egne saet, det valgte saet og rekorderne. Kan localStorage ikke
       bruges, virker spillet stadig - man mister bare det gemte. */
    NK.hent = function (noegle, standard) {
        try {
            var s = window.localStorage.getItem(noegle);
            return s ? JSON.parse(s) : standard;
        } catch (e) {
            return standard;
        }
    };

    NK.gem = function (noegle, vaerdi) {
        try { window.localStorage.setItem(noegle, JSON.stringify(vaerdi)); } catch (e) { /* ingen hukommelse */ }
    };

    NK.glem = function (noegle) {
        try { window.localStorage.removeItem(noegle); } catch (e) { /* ingen hukommelse */ }
    };

    NK.saetTekst = function (id, tekst) {
        var e = NK.el(id);
        if (e && e.textContent !== tekst) e.textContent = tekst;
    };

    /* Goer tekst sikker at saette ind som HTML. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    /* Tid som 1:07 */
    NK.tid = function (ms) {
        var s = Math.max(0, Math.round(ms / 1000));
        return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
    };

    /* Et kort fingeraftryk af en tekst. Bruges til id paa egne saet og
       til noeglen, en rekord gemmes under. */
    NK.fingeraftryk = function (s) {
        var h = 2166136261;
        for (var i = 0; i < String(s).length; i++) {
            h ^= String(s).charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h.toString(36);
    };

    /* Skriftstoerrelsen paa et kort falder med tekstens laengde, saa en
       lang forklaring ogsaa kan staa paa en brik. Trinene er valgt, saa
       ingen tekst bliver mindre end 13 px paa en normal skaerm. */
    NK.tekstklasse = function (tekst, foran) {
        var n = String(tekst || "").length;
        var trin = n <= 4 ? "t1" : (n <= 12 ? "t2" : (n <= 26 ? "t3" : (n <= 48 ? "t4" : "t5")));
        return (foran || "") + trin;
    };

    /* Kopierer til udklipsholderen og kvitterer paa knappen. */
    NK.kopier = function (tekst, knap) {
        var foer = knap.getAttribute("data-tekst") || knap.textContent;
        knap.setAttribute("data-tekst", foer);
        function kvittering(ok) {
            knap.textContent = ok ? "Kopieret ✓" : "Kunne ikke kopiere";
            setTimeout(function () { knap.textContent = foer; }, 2200);
        }
        function reserve() {
            var t = document.createElement("textarea");
            t.value = tekst;
            t.style.position = "fixed";
            t.style.opacity = "0";
            document.body.appendChild(t);
            t.select();
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
            t.remove();
            kvittering(ok);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(tekst).then(function () { kvittering(true); }, reserve);
        } else {
            reserve();
        }
    };

    /* Gemmer en tekst som fil. */
    NK.gemFil = function (tekst, navn) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(["﻿" + tekst], { type: "text/plain;charset=utf-8" }));
        a.download = navn;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };

    /* Dansk filnavn uden aegte bogstaver. */
    NK.filnavn = function (navn, forstavelse) {
        var rent = String(navn || "saet").toLowerCase()
            .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return (forstavelse || "kemikort-") + (rent || "saet") + ".txt";
    };
}());
