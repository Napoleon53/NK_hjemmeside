/* =====================================================================
   topliste.js - rekorderne og de faelles top 10 (én pr. lag)

   Den personlige rekord (alle tider og denne uge) gemmes i browseren.
   Den faelles liste er det faelles script til spillene (adressen staar i
   D.TOPLISTE, koden i .claude/highscore/highscore.gs paa hjemmesiden).
   Listen vises foerst, naar scriptet kender spillet: svarer det "ukendt
   spil", fordi den nye version ikke er lagt op endnu, ser spillet ud som
   uden liste, med kun elevens egen rekord (moensteret fra Organiske
   grupper C, 27. nov. 2026).

   Navnet deles med Organiske grupper, saa eleven kun skal skrive det én
   gang. Selvtesten saetter NK.ingenNet, saa en test aldrig sender en
   score til den rigtige liste.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var NAVN = "orgSortering_playerName";
    var svarer = {};
    /* index.html?ingenNet: ingen forbindelse til listen (selvtesten) */
    if (/[?&]ingenNet\b/.test(window.location.search)) NK.ingenNet = true;

    function laes(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function skriv(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ingen hukommelse */ } }

    function noegler(lag) {
        var p = "nk-syntese-" + lag + "-";
        return { alle: p + "rekord", uge: p + "uge", ugeNr: p + "ugenr" };
    }

    /* ISO-ugenummer (aar-Wuge): ugerekorden nulstilles af sig selv */
    function ugeNr(dato) {
        var d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
        var dag = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dag);
        var aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var uge = Math.ceil((((d - aarStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + "-W" + (uge < 10 ? "0" : "") + uge;
    }

    function personlig(lag) {
        var n = noegler(lag), nu = ugeNr(new Date());
        if (laes(n.ugeNr) !== nu) { skriv(n.ugeNr, nu); skriv(n.uge, "0"); }
        return { alle: Number(laes(n.alle)) || 0, uge: Number(laes(n.uge)) || 0 };
    }

    /* Gemmer et resultat. Giver { alle, uge }: sand, hvis det er ny rekord */
    function gem(lag, point) {
        var n = noegler(lag), p = personlig(lag);
        var ny = { alle: point > p.alle, uge: point > p.uge };
        if (ny.alle) skriv(n.alle, String(point));
        if (ny.uge) skriv(n.uge, String(point));
        return ny;
    }

    function navn(nyt) {
        if (nyt !== undefined) skriv(NAVN, String(nyt).trim().substring(0, 20));
        return (laes(NAVN) || "").trim().substring(0, 20);
    }

    function kanSpoerge() { return !!window.fetch && !NK.ingenNet && !!D.TOPLISTE.adresse; }
    function harDelt(lag) { return svarer[lag] === true; }

    function lister(lag, d) {
        if (!d || d.fejl === "ukendt spil") { svarer[lag] = false; return null; }
        if (!d.alle) return null;
        svarer[lag] = true;
        return { uge: d.uge || [], alle: d.alle || [] };
    }

    /* Henter listen; null, hvis den ikke kan hentes */
    function hent(lag) {
        if (!kanSpoerge()) return Promise.resolve(null);
        var url = D.TOPLISTE.adresse + "?spil=" + encodeURIComponent(D.TOPLISTE.spil[lag]);
        return window.fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (svar) { return lister(lag, svar); })
            .catch(function () { return null; });
    }

    /* Sender et resultat { point, niveau, sekunder } og giver listen bagefter.
       Content-Type udelades, saa det er en simpel forespoergsel uden
       CORS-forespoergsel foerst (Apps Script kan ikke svare paa den). */
    function send(lag, res) {
        if (!kanSpoerge() || !harDelt(lag)) return Promise.resolve(null);
        if (!(res.point > 0)) return hent(lag);
        var krop = JSON.stringify({ spil: D.TOPLISTE.spil[lag], navn: navn() || "Anonym", point: res.point,
            niveau: res.niveau || 0, sekunder: Math.floor(res.sekunder || 0) });
        return window.fetch(D.TOPLISTE.adresse, { method: "POST", body: krop })
            .then(function (r) { return r.json(); })
            .then(function (svar) { return lister(lag, svar) || hent(lag); })
            .catch(function () { return hent(lag); });
    }

    NK.Topliste = { personlig: personlig, gem: gem, navn: navn, harDelt: harDelt, kanSpoerge: kanSpoerge,
        hent: hent, send: send, ugeNr: ugeNr };
}());
