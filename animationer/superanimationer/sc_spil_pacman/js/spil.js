/* =====================================================================
   spil.js - reglerne, uden tegning

   Samme regler og samme raekkefoelge som Game.update() i den gamle
   c_spil_pacman_emner.html. Balancen afhaenger af raekkefoelgen, saa
   den er bevaret trin for trin:

     1. tiden (tid) taelles op, og "e" huskes, foer noget nulstilles
     2. spilleren flytter ét felt; et svarrum afgoer opgaven
     3. skjoldet taeller ned
     4. paa Svaer kommer der et nyt spoegelse hvert 5. sekund
     5. naar e er over sovetiden, tager spoegelserne et skridt, hver
        gang der er gaaet trinMs siden sidste skridt, og fanger spilleren,
        hvis de staar paa samme felt

   Et forkert rum nulstiller banen midt i trin 2, men trin 4 og 5 koerer
   videre med den gamle "e" (som i den gamle udgave). Derfor sover
   spoegelserne efter et forkert rum, til der er gaaet lige saa lang
   tid, som opgaven havde varet. vaagnerOm() regner den tid rigtigt ud,
   saa nedtaellingen viser det. Et spoegelse, der fanger en, giver den
   almindelige sovetid.

   Tider er i millisekunder. opdater(dtMs) kaldes én gang pr. billede.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var E = NK.Emner;

    var RETNINGER = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

    function mur(x, y) {
        var r = D.KORT[y];
        return !r || r[x] === undefined || r[x] === 1;
    }

    function bland(liste, rng) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /* rng: tilfaeldighed (Math.random); selvtesten giver sin egen */
    function Spil(rng) {
        this.rng = rng || Math.random;
        this.skaerm = "start";          /* start, spil, rigtigt, tabt, slut */
        this.koerer = false;
        this.svaerhed = null;
        this.emne = null;
        this.raekke = [];
        this.nr = 0;
        this.liv = D.LIV;
        this.tid = 0;
        this.q = null;
        this.rum = [];
        this.hint = "";
        this.forkerteIAlt = 0;
        this.mester = false;
        this.haendelser = [];
        this.spiller = { x: D.START.x, y: D.START.y, retning: { x: 0, y: 0 }, vendt: { x: 1, y: 0 }, skjold: false, skjoldMs: 0, skjoldMax: 0, flyt: 0 };
        this.spoegelser = [];
        this.skjolde = [];
        this.sidsteNyt = 0;
        this.sidsteSkridt = 0;
        this.vaagen = false;
        this.nulstilletNu = false;
    }

    var P = Spil.prototype;

    P.S = function () { return D.SVAERHED[this.svaerhed]; };

    P.haendelse = function (type, data) {
        this.haendelser.push({ type: type, data: data || null });
    };

    /* Haendelserne siden sidst (til visningen: beskeder og blink) */
    P.tagHaendelser = function () {
        var h = this.haendelser;
        this.haendelser = [];
        return h;
    };

    P.vaelgSvaerhed = function (k) {
        if (!D.SVAERHED[k]) return false;
        this.svaerhed = k;
        return true;
    };

    /* ----- Forloebet ----------------------------------------------------- */
    P.start = function (emne) {
        if (!this.svaerhed || !E.EMNER[emne]) return false;
        this.emne = emne;
        this.raekke = E.raekke(emne, this.rng);
        this.nr = 0;
        this.liv = D.LIV;
        this.mester = false;
        this.opgave();
        return true;
    };

    P.opgave = function () {
        this.skaerm = "spil";
        this.tid = 0;
        this.nulstilPladser();
        this.spiller.skjold = false;
        this.spiller.skjoldMs = 0;
        this.hint = "";
        this.forkerteIAlt = 0;

        this.q = E.lav(this.raekke[this.nr], this.rng);
        var svar = [{ t: this.q.rigtig, ok: true, hint: "" }].concat(this.q.forkerte.map(function (f) {
            return { t: f.t, ok: false, hint: f.hint };
        }));
        svar = bland(svar, this.rng);
        this.rum = D.RUM_ORDEN.map(function (z, i) {
            return { z: z, t: svar[i].t, ok: svar[i].ok, hint: svar[i].hint, proevet: false };
        });

        this.placerSkjold();
        this.koerer = true;
    };

    /* antal: saa mange spoegelser; uden antal ét i de foerste fire
       opgaver og to i resten */
    P.nulstilPladser = function (antal) {
        var sp = this.spiller;
        sp.x = D.START.x;
        sp.y = D.START.y;
        sp.retning = { x: 0, y: 0 };
        sp.flyt++;
        if (antal === undefined) antal = this.nr < D.TO_SPOEGELSER_FRA ? 1 : 2;
        this.spoegelser = [];
        for (var i = 0; i < antal; i++) this.spoegelser.push(this.nytSpoegelse(i));
        this.sidsteNyt = 0;
        this.sidsteSkridt = 0;
        this.vaagen = false;
        this.nulstilletNu = true;
    };

    P.nytSpoegelse = function (nr) {
        var s = D.SPOEGELSE_START[nr % D.SPOEGELSE_START.length];
        return { x: s.x, y: s.y, fraX: -1, fraY: -1, nr: nr, farve: D.SPOEGELSE_FARVER[nr % D.SPOEGELSE_FARVER.length] };
    };

    /* Skjoldet laegges paa et tilfaeldigt felt i gangene (ikke start) */
    P.placerSkjold = function () {
        this.skjolde = [];
        for (var i = 0; i < 50; i++) {
            var x = Math.floor(this.rng() * D.KOLONNER);
            var y = Math.floor(this.rng() * D.RAEKKER);
            if (D.KORT[y][x] === 0 && !(x === D.START.x && y === D.START.y)) {
                this.skjolde.push({ x: x, y: y });
                return;
            }
        }
    };

    P.naeste = function () {
        if (this.skaerm !== "rigtigt") return;
        this.nr++;
        if (this.nr >= this.raekke.length) this.slut();
        else this.opgave();
    };

    P.slut = function () {
        this.skaerm = "slut";
        this.koerer = false;
        this.mester = this.svaerhed === D.MESTER.svaerhed && this.emne === D.MESTER.emne;
        this.haendelse("slut", { mester: this.mester });
    };

    /* Mister man alle liv, starter emnet forfra i samme raekkefoelge */
    P.proevIgen = function () {
        if (!this.emne) return;
        this.liv = D.LIV;
        this.nr = 0;
        this.opgave();
    };

    P.tilStart = function () {
        this.koerer = false;
        this.skaerm = "start";
    };

    /* ----- Styring -------------------------------------------------------- */
    /* Et tastetryk: spilleren gaar ét felt i den retning, hvis der ikke er
       mur. Flytningen sker i naeste opdater(). */
    P.styr = function (dx, dy) {
        if (!this.koerer) return false;
        var sp = this.spiller;
        if (mur(sp.x + dx, sp.y + dy)) return false;
        sp.retning = { x: dx, y: dy };
        return true;
    };

    /* ----- Et billede ------------------------------------------------------ */
    P.opdater = function (dtMs) {
        if (!this.koerer) return;
        var S = this.S();
        this.nulstilletNu = false;
        this.tid += dtMs;
        var e = this.tid;
        var sp = this.spiller;

        /* 2. Spilleren */
        if (sp.retning.x || sp.retning.y) {
            sp.x += sp.retning.x;
            sp.y += sp.retning.y;
            sp.vendt = sp.retning;
            var zone = D.KORT[sp.y][sp.x];
            if (zone > 1) {
                var rum = this.rumFor(zone);
                sp.retning = { x: 0, y: 0 };
                this.koerer = false;
                if (rum.ok) { this.rigtigt(); return; }
                this.forkert(rum);
                if (!this.koerer) return;
            }
            for (var i = 0; i < this.skjolde.length; i++) {
                if (this.skjolde[i].x === sp.x && this.skjolde[i].y === sp.y) {
                    this.skjolde.splice(i, 1);
                    sp.skjold = true;
                    sp.skjoldMs = sp.skjoldMax = D.SKJOLD_MS;
                    this.haendelse("skjold");
                    break;
                }
            }
            sp.retning = { x: 0, y: 0 };
        }

        /* 3. Skjoldet */
        if (sp.skjold) {
            sp.skjoldMs -= dtMs;
            if (sp.skjoldMs <= 0) { sp.skjold = false; sp.skjoldMs = 0; }
        }

        /* 4. Nye spoegelser paa Svaer */
        if (S.nye && this.spoegelser.length < D.SPOEGELSE_START.length && e - this.sidsteNyt >= D.NYT_SPOEGELSE_MS) {
            this.spoegelser.push(this.nytSpoegelse(this.spoegelser.length));
            this.sidsteNyt = e;
            this.haendelse("nytSpoegelse");
        }

        /* 5. Spoegelserne vaagner efter sovetiden */
        if (e > S.sovMs) {
            if (e - this.sidsteSkridt >= S.trinMs) {
                this.sidsteSkridt = e;
                if (!this.nulstilletNu) this.vaagen = true;
                for (var g = 0; g < this.spoegelser.length; g++) this.skridt(this.spoegelser[g]);
            }
            for (var h = 0; h < this.spoegelser.length; h++) {
                var sg = this.spoegelser[h];
                if (sg.x === sp.x && sg.y === sp.y && !sp.skjold) {
                    this.mist("spoegelse");
                    break;
                }
            }
        }
    };

    /* Et skridt: mod spilleren (korteste vej i luftlinje ad gaderne), men
       ikke tilbage, hvor det kom fra, medmindre det er en blindgyde. Hvert
       fjerde skridt i gennemsnit gaar en tilfaeldig vej. */
    P.skridt = function (g) {
        var sp = this.spiller;
        var mulige = RETNINGER.filter(function (d) { return !mur(g.x + d.x, g.y + d.y); });
        var valg = mulige.filter(function (d) { return !(g.x + d.x === g.fraX && g.y + d.y === g.fraY); });
        if (valg.length === 0) valg = mulige;
        if (valg.length === 0) return;
        var bedst = valg[0], min = 9999;
        valg.forEach(function (d) {
            var afst = Math.abs(g.x + d.x - sp.x) + Math.abs(g.y + d.y - sp.y);
            if (afst < min) { min = afst; bedst = d; }
        });
        if (this.rng() < D.TILFAELDIGT_SKRIDT) bedst = valg[Math.floor(this.rng() * valg.length)];
        g.fraX = g.x;
        g.fraY = g.y;
        g.x += bedst.x;
        g.y += bedst.y;
    };

    P.rumFor = function (z) {
        for (var i = 0; i < this.rum.length; i++) if (this.rum[i].z === z) return this.rum[i];
        return null;
    };

    P.rigtigt = function () {
        this.skaerm = "rigtigt";
        this.koerer = false;
        this.haendelse("rigtigt");
    };

    P.forkert = function (rum) {
        rum.proevet = true;
        this.hint = rum.hint;
        this.forkerteIAlt++;
        this.haendelse("forkert", { rum: rum });
        this.mist("rum");
    };

    /* Et mistet liv: banen nulstilles med ét spoegelse, og sovetiden
       starter forfra. Er livene brugt, er forloebet tabt. */
    P.mist = function (grund) {
        this.liv--;
        this.haendelse("mist", { grund: grund });
        this.nulstilPladser(1);
        if (this.liv <= 0) {
            this.liv = 0;
            this.koerer = false;
            this.skaerm = "tabt";
            this.haendelse("tabt");
            return;
        }
        this.tid = 0;
        this.spiller.skjold = true;
        this.spiller.skjoldMs = this.spiller.skjoldMax = D.FREDET_MS;
        this.koerer = true;
    };

    /* ----- Til visningen --------------------------------------------------- */
    /* Sover spoegelserne endnu? Giver ms, til de tager foerste skridt, ellers 0 */
    P.vaagnerOm = function () {
        if (!this.koerer || this.vaagen) return 0;
        var S = this.S();
        return Math.max(0, S.sovMs - this.tid, this.sidsteSkridt + S.trinMs - this.tid);
    };

    P.antal = function () { return this.raekke.length; };

    NK.Spil = Spil;
    NK.Spil.mur = mur;
}());
