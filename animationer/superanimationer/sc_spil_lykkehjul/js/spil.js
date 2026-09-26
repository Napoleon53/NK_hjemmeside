/* =====================================================================
   spil.js - reglerne og pointene, uden tegning

   Hele spillet staar i én tilstand T, som gemmes i localStorage efter
   hver handling, saa en genindlaest side kan fortsaette. Foer hver
   handling i en gaade gemmes et aftryk, saa Fortryd kan traede et skridt
   tilbage (fx et forkert klik paa et bogstav).

   T.nr er den gaade, der spilles (indeks i Q.gaader; Q.gaader.length er
   finalen). T.g er gaadens tilstand:
     type     "tossup", "runde" eller "final"
     fase     runde:  tur | konsonant | vokal | loes | loest
              tossup: klar | koerer | pause | svarer | alle | loest
              final:  hold | rstlne | valg | ur | loest
     gaettet  de bogstaver, der er sagt (i raekkefoelge)
     aabne    felter, der er vist i en toss-up
     runde    holdenes point i denne runde
     tur      holdet, der har turen (runde)
     liv      alene: de liv, der er tilbage i runden
   T.hold[h].total er holdets samlede point.

   Alene (T.alene): én spiller og ingen laerer. Alt, der i holdspillet
   giver turen videre, koster et liv, og uden liv er runden tabt. En
   toss-up er mindre vaerd, jo flere bogstaver der er vist, og et forkert
   svar viser D.ALENE.straf bogstaver mere. Hver tilstand har sit eget
   gemte spil.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var VERSION = 1;
    var MAKS_AFTRYK = 60;
    var Q = null;
    var T = null;
    var alene = false;

    function lagernoegle() { return "nk-lykkehjul-spil-" + (alene ? "alene-" : "") + Q.id; }
    function rekordnoegle() { return "nk-lykkehjul-rekord-" + Q.id; }

    function erVokal(b) { return D.VOKALER.indexOf(b) >= 0; }
    function erKonsonant(b) { return D.KONSONANTER.indexOf(b) >= 0; }

    function gyldig(t) {
        return !!(t && t.version === VERSION && t.quiz === Q.id && t.hold && t.hold.length >= (alene ? 1 : D.MIN_HOLD)
            && !!t.alene === alene && t.faerdige && t.historik);
    }

    var S = NK.Spil = {};
    S.erVokal = erVokal;
    S.erKonsonant = erKonsonant;

    S.init = function (quiz, somAlene) {
        Q = quiz;
        alene = !!somAlene;
        T = NK.hent(lagernoegle(), null);
        if (!gyldig(T)) T = null;
        return T;
    };

    S.alene = function () { return alene; };

    S.Q = function () { return Q; };
    S.T = function () { return T; };
    S.gem = function () { if (T) NK.gem(lagernoegle(), T); };
    S.glem = function () { T = null; NK.glem(lagernoegle()); };

    function holdliste(navne) {
        return navne.map(function (n, h) {
            return { navn: String(n || "").trim() || D.FARVENAVNE[h], total: 0 };
        });
    }

    S.nyt = function (navne) {
        T = {
            version: VERSION,
            quiz: Q.id,
            alene: alene,
            nyRekord: false,
            hold: alene ? [{ navn: String(navne[0] || "").trim() || D.ALENE.navn, total: 0 }] : holdliste(navne),
            nr: -1,
            g: null,
            starter: 0,
            faerdige: {},
            slut: false,
            historik: []
        };
        S.gem();
        return T;
    };

    /* Navne og antal midt i et spil. Et nyt hold starter paa 0. */
    S.saetHold = function (navne) {
        var gamle = T.hold;
        T.hold = navne.map(function (n, h) {
            var navn = String(n || "").trim() || D.FARVENAVNE[h];
            return gamle[h] ? { navn: navn, total: gamle[h].total } : { navn: navn, total: 0 };
        });
        var antal = T.hold.length;
        if (T.g) {
            while (T.g.runde.length < antal) T.g.runde.push(0);
            T.g.runde.length = antal;
            if (T.g.tur >= antal) T.g.tur = 0;
            if (T.g.svarer !== null && T.g.svarer >= antal) { T.g.svarer = null; if (T.g.fase === "svarer") T.g.fase = "pause"; }
            T.g.ude = T.g.ude.filter(function (h) { return h < antal; });
            if (T.g.final && T.g.final.hold >= antal) T.g.final.hold = 0;
        }
        if (T.starter >= antal) T.starter = 0;
        T.historik = [];
        S.gem();
    };

    S.omdoeb = function (h, navn) {
        if (!T.hold[h]) return;
        T.hold[h].navn = String(navn || "").trim() || T.hold[h].navn;
        S.gem();
    };

    /* ----- Aftryk og Fortryd ------------------------------------------- */
    function aftryk() {
        T.historik.push(JSON.stringify({
            g: T.g,
            total: T.hold.map(function (x) { return x.total; }),
            starter: T.starter,
            faerdige: T.faerdige
        }));
        if (T.historik.length > MAKS_AFTRYK) T.historik.shift();
    }

    S.kanFortryde = function () { return !!(T && T.g && T.historik.length); };

    S.fortryd = function () {
        if (!S.kanFortryde()) return false;
        var a = JSON.parse(T.historik.pop());
        T.g = a.g;
        a.total.forEach(function (v, h) { if (T.hold[h]) T.hold[h].total = v; });
        T.starter = a.starter;
        T.faerdige = a.faerdige;
        S.gem();
        return true;
    };

    /* ----- Gaaderne ---------------------------------------------------- */
    S.antalGaader = function () { return Q.gaader.length; };
    S.harFinal = function () { return !!Q.final; };
    S.finalNr = function () { return Q.gaader.length; };
    S.gaade = function (nr) {
        if (nr === undefined) nr = T.nr;
        return nr === Q.gaader.length ? Q.final : Q.gaader[nr];
    };
    S.aktuel = function () { return T && T.g ? S.gaade(T.g.nr) : null; };

    S.start = function (nr) {
        var G = S.gaade(nr);
        if (!G) return false;
        var n = T.hold.length;
        var nul = T.hold.map(function () { return 0; });
        T.nr = nr;
        T.slut = false;
        T.historik = [];
        T.g = {
            nr: nr,
            type: G.type,
            fase: G.type === "tossup" ? "klar" : (G.type === "final" ? "hold" : "tur"),
            gaettet: [],
            aabne: [],
            runde: nul,
            tur: T.starter % n,
            drej: null,
            svarer: null,
            ude: [],
            vinder: null,
            gevinst: 0,
            loest: false,
            liv: alene && G.type === "runde" ? D.ALENE.liv : null,
            final: G.type === "final" ? { hold: alene ? 0 : S.rangliste()[0], praemie: null, valgt: [], vundet: null } : null
        };
        S.gem();
        return true;
    };

    /* Den naeste gaade, der ikke er spillet, eller finalen */
    S.naeste = function () {
        for (var i = 0; i < Q.gaader.length; i++) if (!T.faerdige[i]) return i;
        if (Q.final && !T.faerdige[Q.gaader.length]) return Q.gaader.length;
        return -1;
    };

    S.faerdig = function (nr) { return T.faerdige[nr] || null; };

    /* ----- Felterne ----------------------------------------------------- */
    S.synlig = function (i) {
        var G = S.aktuel(), c = G.celler[i];
        if (!c.bogstav || T.g.loest) return true;
        if (T.g.gaettet.indexOf(c.tegn) >= 0) return true;
        return T.g.aabne.indexOf(i) >= 0;
    };

    /* Felterne med bogstavet b */
    S.feltMed = function (b) {
        var ud = [];
        S.aktuel().celler.forEach(function (c, i) { if (c.tegn === b) ud.push(i); });
        return ud;
    };

    function tilbage(test) {
        var G = S.aktuel(), ud = [];
        Object.keys(G.antal).forEach(function (b) {
            if (test(b) && T.g.gaettet.indexOf(b) < 0) ud.push(b);
        });
        return ud;
    }
    S.konsonanterTilbage = function () { return tilbage(erKonsonant); };
    S.vokalerTilbage = function () { return tilbage(erVokal); };
    S.skjulteFelter = function () {
        var ud = [];
        S.aktuel().celler.forEach(function (c, i) { if (!S.synlig(i)) ud.push(i); });
        return ud;
    };

    /* ----- En runde med hjulet ----------------------------------------- */
    function naesteTur() {
        T.g.drej = null;
        if (alene) {
            mistLiv();
            return;
        }
        T.g.tur = (T.g.tur + 1) % T.hold.length;
        T.g.fase = "tur";
    }

    /* Alene: turen gaar ikke videre, men koster et liv. Uden liv er runden
       tabt, og loesningen vises uden point. */
    function mistLiv() {
        var g = T.g;
        g.liv = Math.max(0, (g.liv || 0) - 1);
        if (g.liv > 0) { g.fase = "tur"; return; }
        g.runde[0] = 0;
        g.loest = true;
        g.tabt = true;
        g.vinder = null;
        g.gevinst = 0;
        g.fase = "loest";
        T.faerdige[g.nr] = { vinder: null, gevinst: 0 };
    }

    S.kanDreje = function () {
        return T.g.type === "runde" && T.g.fase === "tur" && S.konsonanterTilbage().length > 0;
    };

    S.kanKoebeVokal = function () {
        return T.g.type === "runde" && T.g.fase === "tur" && T.g.runde[T.g.tur] >= D.VOKALPRIS
            && S.vokalerTilbage().length > 0;
    };

    /* Hjulet er stoppet paa felt nr. felt. Giver feltets type. */
    S.drejet = function (felt) {
        var f = D.HJUL[felt];
        if (!f || T.g.fase !== "tur") return null;
        aftryk();
        T.g.drej = { felt: felt, vaerdi: f.v || 0, type: f.type };
        if (f.type === "fallit") {
            T.g.runde[T.g.tur] = 0;
            T.g.sidst = { hold: T.g.tur, type: "fallit" };
            naesteTur();
        } else if (f.type === "mist") {
            T.g.sidst = { hold: T.g.tur, type: "mist" };
            naesteTur();
        } else {
            T.g.fase = "konsonant";
        }
        S.gem();
        return f.type;
    };

    S.koebVokal = function () {
        if (!S.kanKoebeVokal()) return false;
        aftryk();
        T.g.runde[T.g.tur] -= D.VOKALPRIS;
        T.g.fase = "vokal";
        S.gem();
        return true;
    };

    /* Kan bogstavet vaelges nu? */
    S.kanVaelge = function (b) {
        var g = T && T.g;
        if (!g || g.gaettet.indexOf(b) >= 0) return false;
        if (g.fase === "konsonant") return erKonsonant(b);
        if (g.fase === "vokal") return erVokal(b);
        if (g.fase === "valg") {
            if (D.FINAL_BOGSTAVER.indexOf(b) >= 0) return false;
            if (g.final.valgt.indexOf(b) >= 0) return true;
            var k = g.final.valgt.filter(erKonsonant).length, v = g.final.valgt.filter(erVokal).length;
            return erKonsonant(b) ? k < D.FINAL_KONSONANTER : (erVokal(b) ? v < D.FINAL_VOKALER : false);
        }
        return false;
    };

    /* Holdet siger et bogstav. Giver { antal, felter, point }. */
    S.vaelg = function (b) {
        if (!S.kanVaelge(b)) return null;
        var g = T.g;
        if (g.fase === "valg") {
            var i = g.final.valgt.indexOf(b);
            if (i >= 0) g.final.valgt.splice(i, 1);
            else g.final.valgt.push(b);
            S.gem();
            return { antal: 0, felter: [], point: 0, valg: true };
        }
        aftryk();
        var felter = S.feltMed(b);
        var point = 0;
        g.gaettet.push(b);
        var h = g.tur;
        if (g.fase === "konsonant" && felter.length) {
            point = felter.length * g.drej.vaerdi;
            g.runde[h] += point;
        }
        g.sidst = { hold: h, type: felter.length ? "rigtigt" : "forkert", bogstav: b, antal: felter.length, point: point };
        if (felter.length) {
            g.fase = "tur";
            g.drej = null;
        } else {
            naesteTur();
        }
        S.gem();
        return { antal: felter.length, felter: felter, point: point, hold: h };
    };

    S.loes = function () {
        if (T.g.type !== "runde" || T.g.fase !== "tur") return false;
        aftryk();
        T.g.fase = "loes";
        S.gem();
        return true;
    };

    /* Laereren doemmer loesningen. Et rigtigt svar giver rundens point,
       mindst D.MINDSTE_GEVINST, og de lægges til holdets samlede point. */
    S.loesSvar = function (rigtigt) {
        if (T.g.fase !== "loes") return false;
        aftryk();
        var h = T.g.tur;
        if (rigtigt) {
            var gevinst = Math.max(T.g.runde[h], D.MINDSTE_GEVINST);
            T.hold[h].total += gevinst;
            T.g.gevinst = gevinst;
            T.g.vinder = h;
            T.g.loest = true;
            T.g.fase = "loest";
            T.faerdige[T.g.nr] = { vinder: h, gevinst: gevinst };
            T.starter = (T.starter + 1) % T.hold.length;
        } else {
            T.g.sidst = { hold: h, type: "forkert-loesning" };
            naesteTur();
        }
        S.gem();
        return true;
    };

    /* Alene: fortryd "Løs gåden", foer der er svaret. Det koster intet. */
    S.fortrydLoes = function () {
        if (T.g.fase !== "loes") return false;
        T.g.fase = "tur";
        S.gem();
        return true;
    };

    /* Er den skrevne loesning rigtig? Store og smaa bogstaver, mellemrum,
       bindestreger og tegn er ligegyldige, og AE, OE og AA godtages for
       Æ, Ø og Å. */
    function kompakt(s) {
        return NK.Tavle.normaliser(s).replace(/Æ/g, "AE").replace(/Ø/g, "OE").replace(/Å/g, "AA").replace(/[^A-Z0-9]/g, "");
    }

    S.tjek = function (tekst) {
        var G = S.aktuel();
        var k = kompakt(tekst);
        return !!(G && k && k === kompakt(G.loesning));
    };

    S.giveTur = function (h) {
        if (!T.hold[h] || T.g.type !== "runde" || T.g.loest) return false;
        aftryk();
        T.g.tur = h;
        T.g.fase = "tur";
        T.g.drej = null;
        S.gem();
        return true;
    };

    S.naesteHold = function () {
        if (T.g.type !== "runde" || T.g.loest) return false;
        aftryk();
        naesteTur();
        S.gem();
        return true;
    };

    /* ----- Toss-up ------------------------------------------------------ */
    S.tossupStart = function () {
        var g = T.g;
        if (g.type !== "tossup" || !/^(klar|pause)$/.test(g.fase)) return false;
        g.fase = S.skjulteFelter().length ? "koerer" : "alle";
        S.gem();
        return true;
    };

    S.tossupPause = function () {
        if (T.g.fase !== "koerer") return false;
        T.g.fase = "pause";
        S.gem();
        return true;
    };

    /* Viser ét tilfaeldigt skjult bogstav. Giver feltets nummer eller -1. */
    S.tossupAfslor = function () {
        var g = T.g;
        if (g.fase !== "koerer") return -1;
        var skjulte = S.skjulteFelter();
        if (!skjulte.length) { g.fase = "alle"; S.gem(); return -1; }
        var i = NK.tilfaeldig(skjulte);
        g.aabne.push(i);
        if (skjulte.length === 1) g.fase = "alle";
        S.gem();
        return i;
    };

    S.tossupKanSvare = function (h) {
        var g = T.g;
        return g.type === "tossup" && /^(koerer|pause|alle|klar)$/.test(g.fase) && !!T.hold[h] && g.ude.indexOf(h) < 0;
    };

    S.tossupSvarer = function (h) {
        if (!S.tossupKanSvare(h)) return false;
        T.g.foer = T.g.fase === "klar" ? "pause" : T.g.fase;
        T.g.fase = "svarer";
        T.g.svarer = h;
        S.gem();
        return true;
    };

    S.tossupFortryd = function () {
        var g = T.g;
        if (g.fase !== "svarer") return false;
        g.fase = g.foer === "alle" ? "alle" : "pause";
        g.svarer = null;
        S.gem();
        return true;
    };

    /* Hvad toss-uppen er vaerd lige nu. Med hold hele beloebet. Alene den
       andel af bogstaverne, der stadig er skjult, rundet ned til hele
       D.ALENE.trin, men mindst ét trin, saa laenge der er noget skjult. */
    S.tossupVaerdi = function () {
        var G = S.aktuel();
        if (!alene) return G.vaerdi;
        var alle = G.celler.filter(function (c) { return c.bogstav; }).length;
        var skjulte = S.skjulteFelter().length;
        if (!skjulte || !alle) return 0;
        var trin = D.ALENE.trin;
        return Math.max(trin, Math.floor(G.vaerdi * skjulte / alle / trin) * trin);
    };

    S.tossupSvar = function (rigtigt) {
        var g = T.g;
        if (g.fase !== "svarer") return false;
        aftryk();
        var h = g.svarer;
        if (rigtigt) {
            var v = S.tossupVaerdi();
            T.hold[h].total += v;
            g.gevinst = v;
            g.vinder = h;
            g.loest = true;
            g.fase = "loest";
            T.faerdige[g.nr] = { vinder: h, gevinst: g.gevinst };
            T.starter = h;
        } else if (alene) {
            /* Alene: et forkert svar viser flere bogstaver, saa gaaden bliver mindre vaerd */
            for (var k = 0; k < D.ALENE.straf; k++) {
                var skjulte = S.skjulteFelter();
                if (!skjulte.length) break;
                g.aabne.push(NK.tilfaeldig(skjulte));
            }
            g.forkerte = (g.forkerte || 0) + 1;
            g.svarer = null;
            g.fase = S.skjulteFelter().length ? "koerer" : "alle";
        } else {
            g.ude.push(h);
            g.svarer = null;
            g.fase = S.skjulteFelter().length && g.foer !== "alle" ? "koerer" : "alle";
        }
        S.gem();
        return true;
    };

    /* Ingen fik den: loesningen vises uden point */
    S.tossupIngen = function () {
        var g = T.g;
        if (g.type !== "tossup" || g.loest) return false;
        aftryk();
        g.loest = true;
        g.vinder = null;
        g.svarer = null;
        g.fase = "loest";
        T.faerdige[g.nr] = { vinder: null, gevinst: 0 };
        S.gem();
        return true;
    };

    S.alleUde = function () { return T.g.ude.length >= T.hold.length; };

    /* ----- Finalen ------------------------------------------------------ */
    S.finalHold = function (h) {
        if (T.g.type !== "final" || T.g.fase !== "hold" || !T.hold[h]) return false;
        T.g.final.hold = h;
        S.gem();
        return true;
    };

    S.finalPraemie = function (beloeb) {
        if (T.g.fase !== "hold") return false;
        aftryk();
        T.g.final.praemie = beloeb;
        T.g.fase = "rstlne";
        S.gem();
        return true;
    };

    S.finalRSTLNE = function () {
        if (T.g.fase !== "rstlne") return null;
        aftryk();
        var felter = [];
        D.FINAL_BOGSTAVER.split("").forEach(function (b) {
            T.g.gaettet.push(b);
            felter = felter.concat(S.feltMed(b));
        });
        T.g.fase = "valg";
        S.gem();
        return felter;
    };

    S.finalValgKlar = function () {
        var v = T.g.final.valgt;
        return v.filter(erKonsonant).length === D.FINAL_KONSONANTER && v.filter(erVokal).length === D.FINAL_VOKALER;
    };

    S.finalVisValg = function () {
        if (T.g.fase !== "valg" || !S.finalValgKlar()) return null;
        aftryk();
        var felter = [];
        T.g.final.valgt.forEach(function (b) {
            T.g.gaettet.push(b);
            felter = felter.concat(S.feltMed(b));
        });
        T.g.fase = "ur";
        S.gem();
        return felter;
    };

    S.finalSvar = function (rigtigt) {
        var g = T.g;
        if (g.type !== "final" || g.fase !== "ur") return false;
        aftryk();
        g.loest = true;
        g.final.vundet = !!rigtigt;
        g.vinder = rigtigt ? g.final.hold : null;
        g.gevinst = rigtigt ? g.final.praemie : 0;
        if (rigtigt) T.hold[g.final.hold].total += g.final.praemie;
        g.fase = "loest";
        T.faerdige[g.nr] = { vinder: g.vinder, gevinst: g.gevinst };
        S.gem();
        return true;
    };

    /* Kuverten aabnes, naar finalen er afgjort */
    S.finalAabn = function () {
        if (T.g.type !== "final" || !T.g.loest) return false;
        T.g.final.aabnet = true;
        S.gem();
        return true;
    };

    /* En side, der blev lukket midt i en toss-up, fortsaetter paa pause */
    S.efterGenindlaesning = function () {
        if (T && T.g && T.g.fase === "koerer") { T.g.fase = "pause"; S.gem(); }
    };

    /* ----- Point -------------------------------------------------------- */
    S.saetTotal = function (h, v) {
        v = Math.round(Number(v));
        if (!T.hold[h] || !isFinite(v)) return false;
        if (T.g) aftryk();
        T.hold[h].total = v;
        S.gem();
        return true;
    };

    S.saetRunde = function (h, v) {
        v = Math.round(Number(v));
        if (!T.g || !isFinite(v) || T.g.runde[h] === undefined) return false;
        aftryk();
        T.g.runde[h] = Math.max(0, v);
        S.gem();
        return true;
    };

    S.slut = function () {
        if (alene && !T.slut) T.nyRekord = S.gemRekord();
        T.slut = true;
        S.gem();
    };

    /* ----- Rekorden (alene) --------------------------------------------- */
    S.rekord = function () {
        var r = NK.hent(rekordnoegle(), null);
        return r && isFinite(r.point) ? r : null;
    };

    /* Gemmer spillerens resultat, hvis det er bedre end rekorden. */
    S.gemRekord = function () {
        if (!alene || !T) return false;
        var r = S.rekord(), p = T.hold[0].total;
        if (r && r.point >= p) return false;
        if (p <= 0) return false;
        NK.gem(rekordnoegle(), { point: p, navn: T.hold[0].navn, dato: new Date().toISOString().slice(0, 10) });
        return true;
    };

    S.glemRekord = function () { NK.glem(rekordnoegle()); };

    S.tilbageFraSlut = function () {
        T.slut = false;
        S.gem();
    };

    /* Holdene efter samlede point, flest foerst */
    S.rangliste = function () {
        return T.hold.map(function (x, h) { return h; })
            .sort(function (a, b) { return T.hold[b].total - T.hold[a].total || a - b; });
    };

    S.vindere = function () {
        var liste = S.rangliste();
        var top = T.hold[liste[0]].total;
        return liste.filter(function (h) { return T.hold[h].total === top; });
    };
}());
