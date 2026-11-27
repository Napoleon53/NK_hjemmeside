/* =====================================================================
   topliste.js - Top 10 i Parring (27. nov. 2026)

   Den faelles liste er det samme Google-regneark med Apps Script som
   samlebaandet i sc2.3 og Millionaer paa tid (koden i
   ~/NK_hjemmeside/.claude/highscore/highscore.gs). Hvert indbygget saet
   har sin egen liste, "spil9-grundstoffer", "spil9-ioner" osv. Listen er
   paa tid: den laveste tid vinder.

   Listen vises foerst, naar scriptet svarer med en liste. Svarer det
   "ukendt spil", fordi den nye version ikke er lagt op endnu, ser
   spillet ud som foer.

   Selvtesten saetter NK.ingenNet, saa en test aldrig sender en tid til
   den rigtige liste, og nulstil() glemmer et svar, der kom foer testen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var ADRESSE = "https://script.google.com/macros/s/AKfycbz7CVe8KVRM-EB3oaiRYC8ezwq3th65d-eJ4NHq_J5L3eyO1mN8mRi04AhjqnAkCAXr/exec";
    var NAVN = "nk-spil-navn";
    var GAMMELT_NAVN = "orgSortering_playerName";     /* navnet fra spillet om organiske grupper */

    var svarer = {};       /* spil -> true (har en liste) eller false (ukendt spil) */
    var lister = {};       /* spil -> { uge, alle, tid } */
    var udgave = 0;        /* et svar fra foer nulstil() bruges ikke */

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

    /* Har scriptet svaret med en liste for et af saettene? Saa er den nye
       version lagt op, og et saet, der ikke er spurgt endnu, har nok ogsaa
       en liste. */
    function kendt() {
        for (var k in svarer) if (svarer[k] === true) return true;
        return false;
    }

    function harListe(spil) {
        if (!spil) return false;
        if (svarer[spil] !== undefined) return svarer[spil];
        return kendt();
    }

    function liste(spil) { return lister[spil] || null; }

    /* Scriptets svar: { uge: [...], alle: [...] } med { navn, sekunder } */
    function modtag(spil, d, u) {
        if (u !== udgave) return null;
        if (d && d.fejl === "ukendt spil") { svarer[spil] = false; delete lister[spil]; return null; }
        if (!d || !d.alle) return null;
        svarer[spil] = true;
        lister[spil] = { uge: d.uge || [], alle: d.alle || [], tid: Date.now() };
        return { uge: lister[spil].uge, alle: lister[spil].alle, ok: d.ok };
    }

    function hent(spil) {
        if (!spil || !kanSpoerge()) return Promise.resolve(null);
        var u = udgave;
        return window.fetch(ADRESSE + "?spil=" + encodeURIComponent(spil))
            .then(function (r) { return r.json(); })
            .then(function (d) { return modtag(spil, d, u); })
            .catch(function () { return null; });
    }

    /* Sender en tid { spil, navn, kort, par, sekunder } og giver listen
       bagefter. Content-Type udelades, saa det er en simpel forespoergsel
       uden CORS-forespoergsel foerst (Apps Script kan ikke svare paa den). */
    function send(res) {
        if (!kanSpoerge() || svarer[res.spil] !== true) return Promise.resolve(null);
        var u = udgave;
        var krop = JSON.stringify({ spil: res.spil, navn: rens(res.navn) || "Anonym", point: res.kort,
            niveau: res.par, sekunder: Math.round(res.sekunder * 10) / 10 });
        return window.fetch(ADRESSE, { method: "POST", body: krop })
            .then(function (r) { return r.json(); })
            .then(function (d) { return modtag(res.spil, d, u) || hent(res.spil); })
            .catch(function () { return hent(res.spil); });
    }

    function nulstil() { svarer = {}; lister = {}; udgave++; }

    NK.Topliste = { kanSpoerge: kanSpoerge, kendt: kendt, harListe: harListe, liste: liste,
        hent: hent, send: send, navn: navn, rens: rens, nulstil: nulstil };
}());
