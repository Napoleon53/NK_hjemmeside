/* =====================================================================
   topliste.js - rekorderne og den faelles top 10

   Personlig rekord (alle tider og denne uge) gemmes i browseren. B har
   de samme noegler som den gamle b_spil_organiske_grupper.html, saa
   elevernes rekorder foelger med. C havde ingen rekord foer.

   B har ogsaa den faelles liste fra den gamle udgave: et Google-regneark
   med et Apps Script (opsaetningen staar i
   .claude/b_spil_organiske_grupper_HIGHSCORE_SETUP.txt paa hjemmesiden).
   Hver score sendes med elevens navn, og listen viser top 10 denne uge
   og alle tider. C har ingen faelles liste, fordi arket ikke kan skille
   C og B ad.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var DELT = {
        c: "",
        b: "https://script.google.com/macros/s/AKfycbzylCaGhhbRI8ogtLSU1s9yJS-k9SboCXgJqMWz7kmgTgdXhjvrZTQJY679Bb2haLQJNQ/exec"
    };

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

    function harDelt(udgave) { return !!DELT[udgave]; }

    /* Selvtesten saetter NK.ingenNet, saa en test aldrig sender en score
       til den rigtige liste. */
    function slukket() { return !!NK.ingenNet; }

    /* Henter listen: { uge: [...], alle: [...] } med { name, score } */
    function hent(udgave) {
        if (!DELT[udgave] || !window.fetch || slukket()) return Promise.resolve(null);
        return window.fetch(DELT[udgave]).then(function (r) { return r.json(); }).then(function (d) {
            return { uge: d.weekly || [], alle: d.allTime || [] };
        });
    }

    /* Sender en score og henter saa listen. Content-Type udelades, saa
       det er en simpel forespoergsel uden CORS-forespoergsel foerst (Apps
       Script kan ikke svare paa den). */
    function send(udgave, point) {
        if (!DELT[udgave] || !window.fetch || slukket()) return Promise.resolve(null);
        if (point <= 0) return hent(udgave);
        var n = navn() || "Anonym";
        return window.fetch(DELT[udgave], { method: "POST", body: JSON.stringify({ name: n, score: point }) })
            .catch(function () { return null; })
            .then(function () { return hent(udgave); });
    }

    NK.Topliste = { personlig: personlig, gem: gem, navn: navn, harDelt: harDelt, hent: hent, send: send, ugeNr: ugeNr };
}());
