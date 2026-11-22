/* =====================================================================
   topliste.js - samlebaandets faelles highscoreliste (22. nov. 2026)

   Listen er et Google-regneark med et Apps Script, som Niels selv har
   lagt op (opsaetningen staar i
   ~/NK_hjemmeside/.claude/highscore/VEJLEDNING.html, koden i
   highscore.gs samme sted). Scriptet kan bruges af flere spil: hvert
   spil har sit eget navn (SPIL) og sit eget faneblad i arket.

   Saa laenge ADRESSE er tom, er der ingen faelles liste, og arket i
   scenen viser kun elevens egen rekord.

   Selvtesten saetter NK.ingenNet, saa en test aldrig sender en score
   til den rigtige liste.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var ADRESSE = "https://script.google.com/macros/s/AKfycbz7CVe8KVRM-EB3oaiRYC8ezwq3th65d-eJ4NHq_J5L3eyO1mN8mRi04AhjqnAkCAXr/exec";
    var SPIL = "sc2.3";
    var NAVN = "nk-spil-navn";
    var GAMMELT_NAVN = "orgSortering_playerName";     /* navnet fra spillet om organiske grupper */

    function laes(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function skriv(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ingen hukommelse */ } }

    function rens(navn) {
        return String(navn || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().substring(0, 20);
    }

    function navn(nyt) {
        if (nyt !== undefined) skriv(NAVN, rens(nyt));
        return rens(laes(NAVN) || laes(GAMMELT_NAVN) || "");
    }

    function findes() { return !!ADRESSE && !!window.fetch && !NK.ingenNet; }

    function lister(d) {
        if (!d || !d.alle) return null;
        return { uge: d.uge || [], alle: d.alle || [] };
    }

    /* Henter listen: { uge: [...], alle: [...] } med { navn, point } */
    function hent() {
        if (!findes()) return Promise.resolve(null);
        return window.fetch(ADRESSE + "?spil=" + encodeURIComponent(SPIL))
            .then(function (r) { return r.json(); })
            .then(lister)
            .catch(function () { return null; });
    }

    /* Sender et resultat og giver listen bagefter. Content-Type udelades,
       saa det er en simpel forespoergsel uden CORS-forespoergsel foerst
       (Apps Script kan ikke svare paa den). */
    function send(res) {
        if (!findes()) return Promise.resolve(null);
        var krop = JSON.stringify({ spil: SPIL, navn: rens(res.navn) || "Anonym", point: res.point,
            niveau: res.niveau, sekunder: res.sekunder });
        return window.fetch(ADRESSE, { method: "POST", body: krop })
            .then(function (r) { return r.json(); })
            .then(function (d) { return lister(d) || hent(); })
            .catch(function () { return hent(); });
    }

    NK.Topliste = { findes: findes, hent: hent, send: send, navn: navn, rens: rens };
}());
