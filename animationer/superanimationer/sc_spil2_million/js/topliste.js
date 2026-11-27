/* =====================================================================
   topliste.js - de hurtigste millionaerer (27. nov. 2026)

   Den faelles liste er det samme Google-regneark med Apps Script som
   samlebaandet i sc2.3 og Organiske grupper C (koden i
   ~/NK_hjemmeside/.claude/highscore/highscore.gs, spillet hedder
   "spil2" der). Listen er paa tid: den laveste tid vinder, og kun en
   vundet million kan komme paa.

   Listen vises foerst, naar scriptet svarer med en liste. Svarer det
   "ukendt spil", fordi den nye version ikke er lagt op endnu, ser
   spillet ud som foer, med kun elevens egen bedste tid.

   Selvtesten saetter NK.ingenNet, saa en test aldrig sender en tid til
   den rigtige liste.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var ADRESSE = "https://script.google.com/macros/s/AKfycbz7CVe8KVRM-EB3oaiRYC8ezwq3th65d-eJ4NHq_J5L3eyO1mN8mRi04AhjqnAkCAXr/exec";
    var SPIL = "spil2";
    var NAVN = "nk-spil-navn";
    var GAMMELT_NAVN = "orgSortering_playerName";     /* navnet fra spillet om organiske grupper */

    var svarer = false;

    function laes(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function skriv(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ingen hukommelse */ } }

    function rens(navn) {
        return String(navn || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().substring(0, 20);
    }

    function navn(nyt) {
        if (nyt !== undefined) skriv(NAVN, rens(nyt));
        return rens(laes(NAVN) || laes(GAMMELT_NAVN) || "");
    }

    function kanSpoerge() { return !!ADRESSE && !!window.fetch && !NK.ingenNet; }
    function harListe() { return svarer; }

    /* Scriptets svar: { uge: [...], alle: [...] } med { navn, sekunder } */
    function lister(d) {
        if (!d || d.fejl === "ukendt spil") { svarer = false; return null; }
        if (!d.alle) return null;
        svarer = true;
        return { uge: d.uge || [], alle: d.alle || [] };
    }

    function hent() {
        if (!kanSpoerge()) return Promise.resolve(null);
        return window.fetch(ADRESSE + "?spil=" + encodeURIComponent(SPIL))
            .then(function (r) { return r.json(); })
            .then(lister)
            .catch(function () { return null; });
    }

    /* Sender en vundet million { navn, sekunder } og giver listen bagefter.
       Content-Type udelades, saa det er en simpel forespoergsel uden
       CORS-forespoergsel foerst (Apps Script kan ikke svare paa den). */
    function send(res) {
        if (!kanSpoerge() || !svarer) return Promise.resolve(null);
        var krop = JSON.stringify({ spil: SPIL, navn: rens(res.navn) || "Anonym", point: 1000000,
            niveau: 15, sekunder: Math.round(res.sekunder * 10) / 10 });
        return window.fetch(ADRESSE, { method: "POST", body: krop })
            .then(function (r) { return r.json(); })
            .then(function (d) { return lister(d) || hent(); })
            .catch(function () { return hent(); });
    }

    NK.Topliste = { kanSpoerge: kanSpoerge, harListe: harListe, hent: hent, send: send, navn: navn, rens: rens };
}());
