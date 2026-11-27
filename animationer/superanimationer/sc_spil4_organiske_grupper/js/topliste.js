/* =====================================================================
   topliste.js - rekorderne og den faelles top 10

   Personlig rekord (alle tider og denne uge) gemmes i browseren. B har
   de samme noegler som den gamle b_spil_organiske_grupper.html, saa
   elevernes rekorder foelger med. C havde ingen rekord foer.

   B har den faelles liste fra den gamle udgave: et Google-regneark med
   et Apps Script (opsaetningen staar i
   .claude/b_spil_organiske_grupper_HIGHSCORE_SETUP.txt paa hjemmesiden).

   C bruger det faelles script til spillene (samme adresse som
   samlebaandet i sc2.3, koden i .claude/highscore/highscore.gs) under
   navnet "spil4c" (27. nov. 2026). Listen vises foerst, naar scriptet
   kender spillet: svarer det "ukendt spil", fordi den nye version ikke
   er lagt op endnu, ser C ud som foer, med kun elevens egen rekord.

   Begge lister gives videre som { uge: [...], alle: [...] } med
   { navn, point }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var DELT = {
        c: { adresse: "https://script.google.com/macros/s/AKfycbz7CVe8KVRM-EB3oaiRYC8ezwq3th65d-eJ4NHq_J5L3eyO1mN8mRi04AhjqnAkCAXr/exec",
             spil: "spil4c" },
        b: { adresse: "https://script.google.com/macros/s/AKfycbzylCaGhhbRI8ogtLSU1s9yJS-k9SboCXgJqMWz7kmgTgdXhjvrZTQJY679Bb2haLQJNQ/exec",
             gammel: true }
    };

    /* Har det faelles script svaret med en liste? (kun C; B vises altid) */
    var svarer = {};

    var NOEGLER = {
        b: { alle: "orgSortering_bestAllTime", uge: "orgSortering_bestWeekly", ugeNr: "orgSortering_weekKey" },
        c: { alle: "nk-organiske-c-rekord", uge: "nk-organiske-c-uge", ugeNr: "nk-organiske-c-ugenr" }
    };
    var NAVN = "orgSortering_playerName";

    function laes(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function skriv(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ingen hukommelse */ } }

    /* ISO-ugenummer (aar-Wuge): ugerekorden nulstilles af sig selv */
    function ugeNr(dato) {
        var d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
        var dag = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dag);
        var aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var uge = Math.ceil((((d - aarStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + "-W" + (uge < 10 ? "0" : "") + uge;
    }

    function personlig(udgave) {
        var n = NOEGLER[udgave] || NOEGLER.c, nu = ugeNr(new Date());
        if (laes(n.ugeNr) !== nu) { skriv(n.ugeNr, nu); skriv(n.uge, "0"); }
        return { alle: Number(laes(n.alle)) || 0, uge: Number(laes(n.uge)) || 0 };
    }

    /* Gemmer et resultat. Giver { alle, uge }: sand, hvis det er ny rekord */
    function gem(udgave, point) {
        var n = NOEGLER[udgave] || NOEGLER.c, p = personlig(udgave);
        var ny = { alle: point > p.alle, uge: point > p.uge };
        if (ny.alle) skriv(n.alle, String(point));
        if (ny.uge) skriv(n.uge, String(point));
        return ny;
    }

    function navn(nyt) {
        if (nyt !== undefined) skriv(NAVN, String(nyt).trim().substring(0, 20));
        return (laes(NAVN) || "").trim().substring(0, 20);
    }

    /* Selvtesten saetter NK.ingenNet, saa en test aldrig sender en score
       til den rigtige liste. */
    function slukket() { return !!NK.ingenNet; }
    function kanSpoerge(udgave) { return !!DELT[udgave] && !!window.fetch && !slukket(); }

    /* Skal listen og navnefeltet vises? */
    function harDelt(udgave) {
        var d = DELT[udgave];
        return !!d && (d.gammel || svarer[udgave] === true);
    }

    function gamleLister(d) {
        function om(r) { return { navn: String(r.name || ""), point: Math.floor(Number(r.score) || 0) }; }
        return { uge: (d.weekly || []).map(om), alle: (d.allTime || []).map(om) };
    }

    /* Det faelles scripts svar. "ukendt spil" betyder, at den nye version
       ikke er lagt op endnu: saa er der ingen liste. */
    function nyeLister(udgave, d) {
        if (!d || d.fejl === "ukendt spil") { svarer[udgave] = false; return null; }
        if (!d.alle) return null;
        svarer[udgave] = true;
        return { uge: d.uge || [], alle: d.alle || [] };
    }

    /* Henter listen; null, hvis den ikke kan hentes */
    function hent(udgave) {
        if (!kanSpoerge(udgave)) return Promise.resolve(null);
        var d = DELT[udgave];
        var url = d.gammel ? d.adresse : d.adresse + "?spil=" + encodeURIComponent(d.spil);
        return window.fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (svar) { return d.gammel ? gamleLister(svar) : nyeLister(udgave, svar); })
            .catch(function () { return null; });
    }

    /* Sender et resultat { point, niveau, sekunder } og giver listen
       bagefter. Content-Type udelades, saa det er en simpel forespoergsel
       uden CORS-forespoergsel foerst (Apps Script kan ikke svare paa den). */
    function send(udgave, res) {
        if (!kanSpoerge(udgave) || !harDelt(udgave)) return Promise.resolve(null);
        if (!(res.point > 0)) return hent(udgave);
        var d = DELT[udgave], n = navn() || "Anonym";
        if (d.gammel) {
            return window.fetch(d.adresse, { method: "POST", body: JSON.stringify({ name: n, score: res.point }) })
                .catch(function () { return null; })
                .then(function () { return hent(udgave); });
        }
        var krop = JSON.stringify({ spil: d.spil, navn: n, point: res.point,
            niveau: res.niveau || 0, sekunder: Math.floor(res.sekunder || 0) });
        return window.fetch(d.adresse, { method: "POST", body: krop })
            .then(function (r) { return r.json(); })
            .then(function (svar) { return nyeLister(udgave, svar) || hent(udgave); })
            .catch(function () { return hent(udgave); });
    }

    NK.Topliste = { personlig: personlig, gem: gem, navn: navn, harDelt: harDelt, kanSpoerge: kanSpoerge,
        hent: hent, send: send, ugeNr: ugeNr };
}());
