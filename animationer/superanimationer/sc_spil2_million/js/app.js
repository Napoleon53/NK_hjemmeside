/* =====================================================================
   app.js - forloebet, knapperne og tastaturet

   Skaermen er titel, spil eller slut. Alt, der ses, tegnes af tegn() ud
   fra tilstanden her og spillet S (js/spil.js), saa et sprogskift midt i
   et spil bare tegner det hele igen.

   Linket kan vaelge sproget: index.html#en.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Spil = NK.Spil;
    var V = NK.Visning;
    var Lyd = NK.Spillyd;
    var el = NK.el;

    var NOEGLE_REKORD = "nk-million-rekord";
    var NOEGLE_SPROG = "nk-million-sprog";

    var sprog = "da";
    var S = null;              /* spillet; null paa titelskaermen */
    var skaerm = "titel";      /* titel | spil | slut */
    var afsloeret = 4;         /* hvor mange svar der er kommet frem */
    var vist = false;          /* er det rigtige svar vist */
    var optaget = false;       /* svarene kommer frem, eller svaret er laast og venter */
    var spoerger = false;      /* spoerger, om eleven vil stoppe */
    var besked = null;         /* funktion, der giver statuslinjens tekst paa det valgte sprog */
    var slutData = null;       /* { rosNr, nyRekord } */
    var slutTid = 0;
    var timere = [];
    var spaendingslyd = null;

    function T() { return D.TEKST[sprog]; }

    function vent(ms, f) {
        timere.push(setTimeout(f, ms * NK.Tempo));
    }

    function rydTimere() {
        timere.forEach(function (id) { clearTimeout(id); });
        timere = [];
    }

    function rekord() { return Number(NK.hent(NOEGLE_REKORD, 0)) || 0; }

    /* Det hoejeste sikre trin under spoergsmaal nr, eller -1 */
    function sikkertTrin(nr) {
        var trin = -1;
        D.SIKRE.forEach(function (i) { if (nr > i) trin = i; });
        return trin;
    }

    /* ----- Tegning ------------------------------------------------------ */
    function tegnStige() {
        if (S.slut === "vundet") { V.stige(S.nr, S.nr + 1, S.nr); return; }
        if (S.slut === "stoppet") { V.stige(-1, S.nr, S.nr - 1); return; }
        if (vist && S.udfald === "forkert") {
            var trin = sikkertTrin(S.nr);
            V.stige(-1, trin + 1, trin);
            return;
        }
        V.stige(S.nr, vist ? S.nr + 1 : S.nr, -1);
    }

    function slutkort(t, animer) {
        var q = Spil.aktuelt(S);
        var data = { slags: S.slut, beloeb: S.gevinst, nyRekord: slutData.nyRekord ? t.nyRekord : "" };
        if (S.slut === "vundet") {
            data.titel = t.vundetTitel;
            data.tekst = t.vundetTekst;
            data.ekstra = NK.html(t.kaaret) + " <b>" + NK.html(D.TITEL) + "</b>.";
            data.ros = D.ROS[sprog][slutData.rosNr];
        } else {
            data.titel = S.slut === "tabt" ? t.tabtTitel : t.stoppetTitel;
            data.tekst = t.gaarHjem;
            data.ekstra = t.svaretVar(S.nr + 1, NK.html(q.svar[sprog][q.rigtig]));
        }
        V.slutkort(data, animer);
    }

    function tegn(animerSlut) {
        var t = T();
        el("titelskaerm").hidden = skaerm !== "titel";
        el("braet").hidden = skaerm === "titel";
        el("slutlag").hidden = skaerm !== "slut";

        var r = rekord();
        var rekordTekst = r ? NK.kr(r) : t.ingenRekord;

        if (!S) {
            V.stige(-1, 0, -1);
            V.tal(NK.kr(0), rekordTekst);
            V.status(t.sTitel, "");
            return;
        }

        var stille = optaget || spoerger || skaerm === "slut";
        V.spoergsmaal(S, sprog, t);
        V.svar(S, { afsloeret: afsloeret, vist: vist, stille: stille });
        V.livliner(S, t, stille);
        tegnStige();

        var sikret = S.slut ? S.gevinst : Spil.sikret(vist && S.udfald === "rigtig" ? S.nr + 1 : S.nr);
        V.tal(NK.kr(sikret), rekordTekst);

        /* Den ene knap: Laas svaret, saa Naeste spoergsmaal */
        var hoved = t.laasSvaret;
        if (vist && S.laast) {
            hoved = S.udfald === "forkert" ? t.seResultat
                : (S.nr >= D.BELOEB.length - 1 ? t.seGevinst : t.naeste);
        }
        NK.saetTekst("hoved-tekst", hoved);
        el("hovedknap").disabled = skaerm === "slut" || (vist ? false : (optaget || S.valgt === null));

        NK.saetTekst("stopknap", t.stopOgTag(NK.kr(Spil.har(S.nr))));
        el("stopknap").hidden = S.nr === 0;
        el("stopknap").classList.toggle("usynlig", S.nr === 0 || S.laast || skaerm === "slut");
        el("stopknap").disabled = optaget || !Spil.kanStoppe(S);

        el("handling").hidden = spoerger;
        el("bekraeft").hidden = !spoerger;
        if (spoerger) NK.saetTekst("bekraeft-tekst", t.bekraeft(NK.kr(Spil.har(S.nr))));

        var b = spoerger ? { html: t.sStop(NK.kr(Spil.sikret(S.nr))) } : (besked ? besked(t) : { html: "" });
        V.status(b.html, b.tone || "");

        if (skaerm === "slut") slutkort(t, animerSlut === true);

        /* En knap, der lige er slaaet fra, maa ikke holde paa tastaturet */
        var a = document.activeElement;
        if (a && a.disabled && a.blur) a.blur();
    }

    /* ----- Forloebet ---------------------------------------------------- */
    function start() {
        rydTimere();
        if (spaendingslyd) { spaendingslyd.stop(0.05); spaendingslyd = null; }
        Lyd.vaek();
        Lyd.hentMusik();
        Lyd.daemp(1);
        V.konfetti(false);
        S = Spil.nyt();
        skaerm = "spil";
        slutData = null;
        Lyd.spil("start");
        nytSpoergsmaal(true, "sLaes");
    }

    /* Beskrivelsen staar alene et oejeblik, saa kommer svarene ét ad gangen */
    function nytSpoergsmaal(medBaggrund, foerst) {
        vist = false;
        spoerger = false;
        optaget = true;
        afsloeret = 0;
        besked = function (t) { return { html: t[foerst] }; };
        V.lys("");
        if (medBaggrund) Lyd.seng(Spil.trin(S.nr), S.nr);
        tegn();
        vent(D.TEMPO.foer, afsloerNaeste);
    }

    function afsloerNaeste() {
        if (!optaget || afsloeret >= 4) return;
        Lyd.spil("afsloer", afsloeret);
        afsloeret++;
        if (afsloeret >= 4) { faerdigAfsloeret(); return; }
        tegn();
        vent(D.TEMPO.afsloer, afsloerNaeste);
    }

    function faerdigAfsloeret() {
        afsloeret = 4;
        optaget = false;
        besked = function (t) { return { html: t.sVaelg }; };
        tegn();
    }

    /* Et klik eller Enter, mens svarene kommer frem, viser dem alle */
    function visAlle() {
        if (!S || skaerm !== "spil" || !optaget || S.laast || afsloeret >= 4) return false;
        rydTimere();
        faerdigAfsloeret();
        return true;
    }

    function vaelg(i) {
        if (!S || skaerm !== "spil" || optaget || spoerger) return;
        if (!Spil.vaelg(S, i)) return;
        Lyd.spil("vaelg");
        besked = function (t) { return { html: t.sValgt("ABCD".charAt(i)) }; };
        tegn();
    }

    function laas() {
        if (!S || skaerm !== "spil" || optaget || spoerger || S.laast || S.valgt === null) return;
        Spil.laas(S);
        optaget = true;
        besked = function (t) { return { html: t.sLaast }; };
        V.lys("spaending");
        var ms = D.TEMPO.spaending[Spil.trin(S.nr)];
        Lyd.spil("laas");
        /* Spillets egen baggrund daempes i ventetiden. Musik fra filer spiller
           uforstyrret videre gennem ventetiden og udfaldet. */
        if (!Lyd.harMusik()) Lyd.daemp(0.3);
        spaendingslyd = Lyd.spil("spaending", ms / 1000);
        tegn();
        vent(ms, afsloerUdfald);
    }

    function forkertBesked(t) {
        var q = Spil.aktuelt(S);
        var html = t.sForkert(NK.html(q.svar[sprog][q.rigtig]));
        /* Er det forkerte svar selv et fagord i spillet, faar eleven at vide,
           hvad det passer til */
        var ord = q.svar[sprog][S.valgt];
        var b = Spil.beskrivelse(ord, sprog);
        if (b) html += " " + t.sPasserTil(NK.html(ord), NK.html(b));
        return { html: html, tone: "daarlig" };
    }

    function afsloerUdfald() {
        optaget = false;
        vist = true;
        if (spaendingslyd) { spaendingslyd.stop(0.15); spaendingslyd = null; }
        if (!Lyd.harMusik()) Lyd.seng(null);
        Lyd.daemp(1);
        if (S.udfald === "rigtig") {
            var sikker = D.SIKRE.indexOf(S.nr) >= 0;
            V.lys("jubel");
            Lyd.spil("rigtigt");
            if (sikker) Lyd.spil("sikret");
            besked = function (t) {
                var kr = NK.kr(Spil.beloeb(S.nr));
                return { html: sikker ? t.sSikret(kr) : t.sRigtigt(kr), tone: "god" };
            };
        } else {
            V.lys("fald");
            Lyd.spil("forkert");
            besked = forkertBesked;
        }
        tegn();
    }

    function videre() {
        if (!S || skaerm !== "spil" || optaget || !S.laast || !vist) return;
        Spil.videre(S);
        if (S.slut) { slut(); return; }
        nytSpoergsmaal(true, "sLaes");
    }

    function spoergStop() {
        if (!S || skaerm !== "spil" || optaget || spoerger || !Spil.kanStoppe(S)) return;
        spoerger = true;
        tegn();
    }

    function fortryd() {
        if (!spoerger) return;
        spoerger = false;
        tegn();
    }

    function stop() {
        if (!spoerger) return;
        spoerger = false;
        if (!Spil.stop(S)) { tegn(); return; }
        vist = true;
        besked = null;
        Lyd.seng(null);
        Lyd.spil("stop");
        slut();
    }

    function slut() {
        rydTimere();
        optaget = false;
        skaerm = "slut";
        slutTid = Date.now();
        Lyd.seng(null);
        var foer = rekord();
        slutData = {
            rosNr: Math.floor(Math.random() * D.ROS.da.length),
            nyRekord: S.gevinst > foer
        };
        if (slutData.nyRekord) NK.gem(NOEGLE_REKORD, S.gevinst);
        V.lys(S.slut === "vundet" ? "jubel" : (S.slut === "tabt" ? "fald" : ""));
        if (S.slut === "vundet") Lyd.spil("vundet");
        tegn(true);
        if (S.slut === "vundet") V.konfetti(true);
    }

    function livline(navn) {
        if (!S || skaerm !== "spil" || optaget || spoerger) return;
        if (!Spil.kan(S, navn)) return;
        Spil[navn](S);
        Lyd.spil("livline");
        if (navn === "byt") { nytSpoergsmaal(false, "sByt"); return; }
        var noegle = navn === "halv" ? "sHalv" : "sPublikum";
        besked = function (t) { return { html: t[noegle] }; };
        tegn();
    }

    /* Enter og den store knap */
    function hovedhandling() {
        if (skaerm === "titel") { start(); return; }
        if (skaerm === "slut") {
            /* Et Enter for meget maa ikke springe slutkortet over */
            if (Date.now() - slutTid < 1200 * NK.Tempo) return;
            start();
            return;
        }
        if (spoerger) return;
        if (visAlle()) return;
        if (!S.laast) laas();
        else videre();
    }

    /* ----- Sprog, lyd og pop op ----------------------------------------- */
    function saetSprog(nyt) {
        sprog = nyt === "en" ? "en" : "da";
        NK.gem(NOEGLE_SPROG, sprog);
        V.tekster(T(), sprog);
        V.lydknap(Lyd.til(), T());
        tegn();
    }

    function aabnRegler() { el("regler").classList.add("vis"); }
    function lukRegler() { el("regler").classList.remove("vis"); }
    function reglerAabne() { return el("regler").classList.contains("vis"); }

    function rundvisning() {
        NK.Rundvisning.start(T().tur, { naeste: T().turNaeste, afslut: T().turAfslut });
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tast(e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var k = e.key;

        if (k === "Escape") {
            if (reglerAabne()) { lukRegler(); e.preventDefault(); return; }
            if (NK.Rundvisning.aktiv()) { NK.Rundvisning.luk(); e.preventDefault(); return; }
            if (spoerger) { fortryd(); e.preventDefault(); }
            return;
        }
        if (reglerAabne() || NK.Rundvisning.aktiv()) return;
        Lyd.vaek();

        var m = e.target;
        var paaKnap = m && m.tagName === "BUTTON";
        if (k === "Enter" || k === " ") {
            /* En knap trykker paa sig selv. Staar man paa et svar, laaser
               Enter svaret i stedet for at vaelge det igen. */
            var paaSvar = paaKnap && m.classList.contains("svar");
            if (paaKnap && !(paaSvar && k === "Enter")) return;
            if (k === "Enter") { hovedhandling(); e.preventDefault(); }
            return;
        }
        if (k.length !== 1) return;
        var l = k.toLowerCase();

        if (spoerger) {
            if (l === "j" || l === "y") { stop(); e.preventDefault(); }
            if (l === "n") { fortryd(); e.preventDefault(); }
            return;
        }

        var i = "abcd".indexOf(l);
        if (i < 0) i = "1234".indexOf(l);
        if (i >= 0) { vaelg(i); e.preventDefault(); return; }
        if (l === "5") { livline("halv"); e.preventDefault(); return; }
        if (l === "6") { livline("publikum"); e.preventDefault(); return; }
        if (l === "7") { livline("byt"); e.preventDefault(); return; }
        if (l === "s") { spoergStop(); e.preventDefault(); return; }
        if (l === "m") { Lyd.skift(); e.preventDefault(); return; }
        if (l === "h") { rundvisning(); e.preventDefault(); return; }
    }

    /* ----- Start --------------------------------------------------------- */
    function init() {
        var hash = String(window.location.hash || "").toLowerCase().replace(/^#/, "").split("&");
        var gemt = NK.hent(NOEGLE_SPROG, "da");
        sprog = hash.indexOf("en") >= 0 ? "en" : (hash.indexOf("da") >= 0 ? "da" : (gemt === "en" ? "en" : "da"));

        V.byg();

        el("startknap").addEventListener("click", start);
        el("nytknap").addEventListener("click", start);
        el("hovedknap").addEventListener("click", hovedhandling);
        el("stopknap").addEventListener("click", spoergStop);
        el("jaknap").addEventListener("click", stop);
        el("nejknap").addEventListener("click", fortryd);

        var svar = document.querySelectorAll("#svarnet .svar");
        Array.prototype.forEach.call(svar, function (k) {
            k.addEventListener("click", function () { vaelg(Number(k.getAttribute("data-svar"))); });
        });
        var liner = document.querySelectorAll(".livline");
        Array.prototype.forEach.call(liner, function (k) {
            k.addEventListener("click", function () { livline(k.getAttribute("data-livline")); });
        });
        /* Et klik paa braettet viser alle svar med det samme. Et klik paa en
           knap er knappens eget og taeller ikke. */
        el("braet").addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("button")) return;
            visAlle();
        });

        el("lydknap").addEventListener("click", function () { Lyd.skift(); });
        Lyd.vedAendring(function (til) { V.lydknap(til, T()); });
        el("sprogknap").addEventListener("click", function () { saetSprog(sprog === "da" ? "en" : "da"); });
        el("regelknap").addEventListener("click", aabnRegler);
        el("regler-luk").addEventListener("click", lukRegler);
        el("regler").addEventListener("click", function (e) { if (e.target === el("regler")) lukRegler(); });
        el("hjaelpknap").addEventListener("click", rundvisning);

        document.addEventListener("keydown", tast);
        document.addEventListener("pointerdown", function () { Lyd.vaek(); });

        V.tekster(T(), sprog);
        V.lydknap(Lyd.til(), T());
        tegn();
        Lyd.hentMusik();
    }

    /* Til selvtesten */
    NK.App = {
        spil: function () { return S; },
        skaerm: function () { return skaerm; },
        sprog: function () { return sprog; },
        optaget: function () { return optaget; },
        vist: function () { return vist; },
        saetSprog: saetSprog,
        start: start
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
