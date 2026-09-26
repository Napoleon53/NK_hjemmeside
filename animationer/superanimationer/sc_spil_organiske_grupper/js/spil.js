/* =====================================================================
   spil.js - ét spil i én udgave (Kemi C eller Kemi B)

   Tegner ikke. Alt maales i enheder: scenen er D.HOEJDE (900) enheder
   hoej og saa bred, som laerredet tillader (tegning.js saetter W og H).

   Tilstande: klar (foer start), koerer, pause (eleven har brugt en af
   sine pauser), livTabt (3 s, efter et forkert molekyle), mester
   (Stofgruppemester ved 14.000 point, kortet med Spil videre) og slut.

   Reglerne er de gamle spils:
   * Molekylerne falder. Rammer et toppen af en spand, afgoeres det:
     den rigtige giver 100 point, den forkerte koster et liv. Falder det
     rigtigt af sig selv, taeller det ogsaa.
   * Efter et forkert molekyle staar spillet stille i 3 s, og saa ryddes
     skaermen. Efter tre forkerte er spillet slut.
   * Niveauerne naas ved en pointgraense (D.UDGAVER[..].niveauer). Kommer
     der en ny stofklasse til, ryddes skaermen. Ellers stiger kun farten.
   * Hjaelperne (fra niveau 2, én ad gangen) klikkes paa: katalysatoren
     giver halve point for alle molekyler paa skaermen og rydder den,
     inhibitoren bremser alt i 7 s, og +1 pause giver en pause mere.
   * Turboboost: op til fem tryk, hvert i 15 s, der laegges sammen.
   * Ved 14.000 point er eleven Stofgruppemester. Derefter kommer der
     10 % flere molekyler for hver 1000 point.

   Tiden er spillets egen (this.tid), saa pauser ikke skal regnes med.
   Spillet sender haendelser til app.js med this.naar(navn, data) og
   taeller this.version op, naar panelet skal tegnes om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;

    /* Tegningen af et faldende molekyle (i enheder) */
    var VIS = { bredde: 200, binding: 34, skrift: 20, linje: 3 };

    function Spil(udgave) {
        this.udgave = udgave;
        this.U = D.UDGAVER[udgave];
        this.alle = Kemi.molekyler(udgave);
        this.naar = function () {};
        this.version = 0;
        this.W = 1000;
        this.H = D.HOEJDE;
        this.rekord = NK.Topliste ? NK.Topliste.personlig(udgave).alle : 0;
        this.nulstil();
    }

    Spil.VIS = VIS;
    var P = Spil.prototype;

    P.nulstil = function () {
        this.tilstand = "klar";
        this.point = 0;
        this.liv = D.LIV;
        this.niveau = 0;
        this.ting = [];
        this.partikler = [];
        this.tid = 0;
        this.niveauStart = 0;
        this.nytUr = D.NYT_HVERT + 500;
        this.hjaelpUr = 0;
        this.naesteHjaelp = D.HJAELP.foerste;
        this.inhibitor = false;
        this.inhibitorSlut = 0;
        this.turbo = [];
        this.pauser = D.PAUSER;
        this.livUr = 0;
        this.sidsteLiv = false;
        this.mesterVist = false;
        this.mesterUr = 0;
        this.fyr = 0;
        this.fyrUr = 0;
        this.sorteret = {};
        this.rigtige = 0;
        this.sidste = null;
        this.kaffeSet = false;
        this.hjaelpSet = {};
        this.trukket = null;
        this.peger = { x: 0, y: 0 };
        this.forrigeMol = null;
        this.nyRekord = false;
        this.besked = null;
        this.tael = 0;
        this.spande = [];
        this.lavSpande();
        this.version++;
    };

    /* ----- Niveauerne ---------------------------------------------------- */
    P.niveauDef = function (i) { return this.U.niveauer[i === undefined ? this.niveau : i]; };

    /* Et turboniveau: ingen ny stofklasse, kun hurtigere */
    P.erTurbo = function (i) {
        if (i === undefined) i = this.niveau;
        return i > 0 && !this.U.niveauer[i].ny;
    };

    P.foersteTurbo = function () {
        for (var i = 1; i < this.U.niveauer.length; i++) if (this.erTurbo(i)) return i;
        return -1;
    };

    P.tidPaaNiveau = function () { return this.tid - this.niveauStart; };

    /* Stofklasserne, eleven har moedt indtil nu (panelet) */
    P.moedte = function () {
        var ud = {};
        for (var i = 0; i <= this.niveau; i++) this.U.niveauer[i].typer.forEach(function (k) { ud[k] = true; });
        return ud;
    };

    /* Det niveau, en stofklasse kommer paa foerste gang (1, 2, ...) */
    P.klasseNiveau = function (k) {
        for (var i = 0; i < this.U.niveauer.length; i++) if (this.U.niveauer[i].typer.indexOf(k) >= 0) return i + 1;
        return 0;
    };

    /* ----- Spandene ---------------------------------------------------------- */
    P.lavSpande = function () {
        var typer = this.niveauDef().typer, mig = this;
        var gamle = {};
        this.spande.forEach(function (s) { gamle[s.klasse] = s; });
        this.spande = typer.map(function (k) {
            return { klasse: k, farve: Kemi.klasseFarve(mig.udgave, k), puls: gamle[k] ? gamle[k].puls : 0, x: 0, b: 0 };
        });
        this.placerSpande();
    };

    P.placerSpande = function () {
        var n = this.spande.length, b = this.W / Math.max(1, n), H = this.H;
        this.spande.forEach(function (s, i) {
            s.x = i * b;
            s.b = b;
            s.y = H - D.SPAND_HOEJDE;
            s.h = D.SPAND_HOEJDE;
        });
    };

    /* Bliver scenen smallere, flyttes det, der falder, ind, saa det ikke
       lander uden for spandene (og koster et liv) */
    P.saetStoerrelse = function (W, H) {
        if (W === this.W && H === this.H) return;
        this.W = W;
        this.H = H;
        this.placerSpande();
        this.ting.forEach(function (t) {
            var hb = Math.min(t.hb || 40, W / 2 - 1);
            t.x = NK.klamp(t.x, hb, W - hb);
        });
    };

    P.spandVed = function (x) {
        for (var i = 0; i < this.spande.length; i++) {
            var s = this.spande[i];
            if (x > s.x && x < s.x + s.b) return s;
        }
        return null;
    };

    P.harSpand = function (k) {
        return this.spande.some(function (s) { return s.klasse === k; });
    };

    /* ----- Start, pause, slut ---------------------------------------------------- */
    P.start = function () {
        this.nulstil();
        this.tilstand = "koerer";
        this.saetBesked(D.BESKED.start, "hint", 6);
        this.naar("start");
        this.version++;
    };

    /* Den store knap: Start spil, Pause, Fortsaet, Spil videre, Spil igen */
    P.primaer = function () {
        if (this.tilstand === "klar" || this.tilstand === "slut") this.start();
        else if (this.tilstand === "koerer") this.pause();
        else if (this.tilstand === "pause" || this.tilstand === "mester") this.fortsaet();
    };

    P.pause = function () {
        if (this.tilstand !== "koerer") return false;
        if (this.pauser <= 0) { this.saetBesked(D.BESKED.ingenPause, "skidt", 3); return false; }
        this.pauser--;
        this.slipGreb();
        this.tilstand = "pause";
        this.version++;
        return true;
    };

    P.fortsaet = function () {
        if (this.tilstand !== "pause" && this.tilstand !== "mester") return false;
        this.tilstand = "koerer";
        this.version++;
        return true;
    };

    P.slut = function () {
        this.tilstand = "slut";
        this.slipGreb();
        this.nyRekord = this.point > this.rekord;
        if (this.nyRekord) this.rekord = this.point;
        this.naar("slut", { point: this.point, nyRekord: this.nyRekord, mester: this.mesterVist });
        this.version++;
    };

    /* ----- Beskeden i linjen under scenen ------------------------------------------- */
    P.saetBesked = function (tekst, art, tid) {
        this.besked = { tekst: tekst, art: art || "", ur: tid || 3 };
        this.version++;
    };

    P.linje = function () {
        if (this.tilstand === "klar") return { tekst: D.BESKED.klar, art: "" };
        if (this.tilstand === "pause") return { tekst: D.BESKED.pause, art: "" };
        if (this.tilstand === "slut") return { tekst: D.BESKED.slut, art: "" };
        if (this.tilstand === "mester") return { tekst: D.BESKED.mester, art: "haendelse" };
        if (this.besked) return this.besked;
        return { tekst: "", art: "" };
    };

    /* ----- Fart ------------------------------------------------------------------------ */
    P.turboFaktor = function () { return 1 + this.turbo.length * this.U.turboPrTryk; };

    P.fartFaktor = function () {
        return (this.inhibitor ? D.HJAELP.inhibitorFart : 1) * this.turboFaktor();
    };

    /* ms mellem molekylerne lige nu (foer fart) */
    P.nytHvert = function () {
        var turbo = this.erTurbo(), foerste = this.niveau === this.foersteTurbo();
        var ramp = NK.klamp(this.tidPaaNiveau() / (foerste ? 15 : (turbo ? 1 : 5)), 0, 1);
        var t = Math.max(D.NYT_MINDST, D.NYT_HVERT - this.niveau * D.NYT_PR_NIVEAU) + D.NYT_START * (1 - ramp);
        if (this.point > D.MESTER) t /= 1 + Math.floor((this.point - D.MESTER) / D.UENDELIG_TRIN) * 0.1;
        return t;
    };

    /* Faldfarten for et nyt molekyle, foer tilfaeldigheden (0,8 til 1,2) */
    P.faldFart = function () {
        var N = this.niveauDef(), turbo = this.erTurbo(), foerste = this.niveau === this.foersteTurbo();
        var ramp = NK.klamp(this.tidPaaNiveau() / (foerste ? 25 : (turbo ? 2 : 10)), 0, 1);
        return D.GRUNDFART * N.fart * (0.6 + 0.4 * ramp);
    };

    /* ----- Nye ting paa skaermen ---------------------------------------------------------- */
    function halvBredde(m) { return Kemi.tegning(m, VIS).b / 2; }

    P.xFor = function (hb) {
        var lav = hb + 10, hoej = this.W - hb - 10;
        if (hoej <= lav) return this.W / 2;
        return lav + Math.random() * (hoej - lav);
    };

    P.nytMolekyle = function (m) {
        var typer = this.niveauDef().typer;
        if (!m) {
            var mulige = this.alle.filter(function (x) { return typer.indexOf(x.klasse) >= 0; });
            if (!mulige.length) return null;
            m = NK.tilfaeldig(mulige);
            if (m === this.forrigeMol && mulige.length > 1) m = NK.tilfaeldig(mulige);
        }
        this.forrigeMol = m;
        var t = Kemi.tegning(m, VIS);
        var ting = {
            art: "mol", m: m, id: ++this.tael,
            x: this.xFor(t.b / 2), y: -70,
            vy: this.faldFart() * (0.8 + Math.random() * 0.4),
            rot: 0, drej: (Math.random() - 0.5) * 0.5,
            hint: !this.erTurbo() && this.tidPaaNiveau() < D.HINT_TID && this.niveau > 0,
            hb: t.b / 2, hh: t.h / 2
        };
        this.ting.push(ting);
        return ting;
    };

    P.nyHjaelper = function (slags) {
        var molekyler = this.ting.filter(function (t) { return t.art === "mol"; }).length;
        if (!slags) {
            if (molekyler >= 2 && Math.random() < 0.8) slags = "inhibitor";
            else if (Math.random() < 0.2) slags = "pause";
            else slags = "enzym";
        }
        var ting = {
            art: "hjaelp", slags: slags, id: ++this.tael,
            x: this.xFor(50), y: -70, vy: D.HJAELP.fald,
            rot: 0, drej: (Math.random() - 0.5) * 0.3, puls: Math.random() * Math.PI * 2
        };
        this.ting.push(ting);
        /* Foerste gang i spillet siger linjen, hvad den goer */
        this.hjaelpSet = this.hjaelpSet || {};
        if (!this.hjaelpSet[slags]) {
            this.hjaelpSet[slags] = true;
            this.saetBesked(D.BESKED.hjaelpNy[slags], "hint", 5);
        }
        return ting;
    };

    P.nyKaffe = function () {
        this.kaffeSet = true;
        var ting = { art: "kaffe", id: ++this.tael, x: this.xFor(30), y: -60, vy: D.HJAELP.fald * 1.2, rot: 0, drej: 0.4 };
        this.ting.push(ting);
        return ting;
    };

    /* ----- Hjaelperne ----------------------------------------------------------------------- */
    P.brugHjaelper = function (t) {
        this.fjern(t);
        if (t.slags === "enzym") {
            var pr = Math.round(D.POINT * D.HJAELP.enzymPoint), n = 0, mig = this;
            this.ting = this.ting.filter(function (x) {
                if (x.art !== "mol") return true;
                mig.eksplosion(x.x, x.y, "#ffd700");
                if (x === mig.trukket) mig.trukket = null;
                n++;
                return false;
            });
            this.point += pr * n;
            this.saetBesked(D.BESKED.enzym.replace("{p}", pr * n).replace("{n}", n), "haendelse", 3);
            this.naar("enzym", { n: n });
            this.tjekNiveau();
        } else if (t.slags === "pause") {
            this.pauser++;
            this.eksplosion(t.x, t.y, "#54a0ff");
            this.saetBesked(D.BESKED.pauseFaaet.replace("{n}", this.pauser), "haendelse", 3);
            this.naar("hjaelp");
        } else {
            this.inhibitor = true;
            this.inhibitorSlut = this.tid + D.HJAELP.inhibitorTid;
            this.eksplosion(t.x, t.y, "#00d2d3");
            this.saetBesked(D.BESKED.inhibitor.replace("{s}", D.HJAELP.inhibitorTid), "haendelse", 3);
            this.naar("hjaelp");
        }
        this.version++;
    };

    P.fjernInhibitor = function () {
        if (!this.inhibitor) return false;
        this.inhibitor = false;
        this.saetBesked(D.BESKED.inhibitorVaek, "", 2);
        this.version++;
        return true;
    };

    P.turboboost = function () {
        if (this.tilstand !== "koerer" || this.turbo.length >= D.TURBO.maks) return false;
        this.turbo.push({ slut: this.tid + D.TURBO.tid });
        this.saetBesked(D.TURBO_BESKED[this.turbo.length - 1] + " " + this.turbo.length + "/" + D.TURBO.maks, "skidt", 2.5);
        this.naar("turbo", { n: this.turbo.length });
        this.version++;
        return true;
    };

    /* ----- Point og niveauer ------------------------------------------------------------------ */
    /* Sand, hvis skaermen blev ryddet (ny stofklasse eller mester) */
    P.tjekNiveau = function () {
        var ryddet = false;
        if (!this.mesterVist && this.point >= D.MESTER) {
            this.mesterVist = true;
            this.rydSkaerm();
            this.fyr = 50;
            this.fyrUr = 0;
            this.mesterUr = 1.2;
            ryddet = true;
        }
        var naeste = this.U.niveauer[this.niveau + 1];
        while (naeste && this.point >= naeste.graense) {
            this.niveau++;
            this.niveauStart = this.tid;
            this.lavSpande();
            if (this.erTurbo()) {
                this.saetBesked(D.BESKED.niveau.replace("{n}", this.niveau + 1), "skidt", 2.5);
                this.naar("turboNiveau", { niveau: this.niveau });
            } else {
                var navne = naeste.ny.map(function (k) { return D.KLASSER[k].flertal.toLowerCase(); });
                this.saetBesked(D.BESKED.nyKlasse.replace("{klasser}", navne.join(" og ")), "haendelse", 4);
                this.naar("nyKlasse", { niveau: this.niveau, klasser: naeste.ny });
                this.rydSkaerm();
                ryddet = true;
            }
            this.version++;
            naeste = this.U.niveauer[this.niveau + 1];
        }
        return ryddet;
    };

    P.rydSkaerm = function () {
        var mig = this;
        this.ting.forEach(function (t) { mig.eksplosion(t.x, t.y, "#ffffff"); });
        this.ting = [];
        this.trukket = null;
    };

    /* ----- Afgoerelsen ---------------------------------------------------------------------------- */
    function artKlasse(k) { var K = D.KLASSER[k]; return K.art + " " + K.navn.toLowerCase(); }

    P.tekstRigtig = function (m) {
        return D.BESKED.rigtig.replace("{Navn}", NK.stortForbogstav(Kemi.fuldtNavn(m)))
            .replace("{art} {klasse}", artKlasse(m.klasse));
    };

    /* To linjer: hvad det er, og hvad der skiller det fra det valgte */
    P.tekstForkert = function (m, valgt) {
        var navn = NK.stortForbogstav(Kemi.fuldtNavn(m));
        var foerste = valgt
            ? D.BESKED.forkert.replace("{Navn}", navn).replace("{art} {klasse}", artKlasse(m.klasse)).replace("{art2} {klasse2}", artKlasse(valgt))
            : D.BESKED.naaede.replace("{Navn}", navn).replace("{art} {klasse}", artKlasse(m.klasse));
        var anden = (valgt && D.FORVEKSLING[m.klasse + ">" + valgt]) || D.KLASSER[m.klasse].kendetegn;
        return { foerste: foerste, anden: anden };
    };

    P.rigtig = function (t, spand) {
        this.point += D.POINT;
        this.rigtige++;
        this.sorteret[t.m.klasse] = (this.sorteret[t.m.klasse] || 0) + 1;
        this.eksplosion(t.x, t.y, "#00ff66");
        spand.puls = 20;
        this.sidste = { m: t.m, rigtig: true, valgt: t.m.klasse, tid: this.tid };
        this.saetBesked(this.tekstRigtig(t.m), "haendelse", 2.5);
        this.naar("rigtig", { m: t.m });
        this.version++;
    };

    P.forkert = function (t, valgt) {
        if (this.tilstand !== "koerer") return;
        this.liv--;
        this.sidsteLiv = this.liv <= 0;
        if (t.y > this.H - 80) t.y = this.H - 80;
        t.blink = this.tid;
        this.sidste = { m: t.m, rigtig: false, valgt: valgt, tid: this.tid, tekst: this.tekstForkert(t.m, valgt) };
        this.eksplosion(t.x, t.y, "#ff0000");
        this.slipGreb();
        this.tilstand = "livTabt";
        this.livUr = D.LIV_PAUSE;
        this.besked = null;
        this.naar("forkert", { m: t.m, valgt: valgt });
        this.version++;
    };

    P.fjern = function (t) {
        var i = this.ting.indexOf(t);
        if (i >= 0) this.ting.splice(i, 1);
        if (t === this.trukket) this.trukket = null;
    };

    /* ----- Musen ------------------------------------------------------------------------------------ */
    /* Er punktet paa tingen? Molekylet maales i sin egen drejede ramme. */
    P.rammer = function (t, x, y) {
        var dx = x - t.x, dy = y - t.y;
        if (Math.hypot(dx, dy) < D.GREB) return true;
        if (t.art !== "mol") return false;
        var c = Math.cos(-t.rot), s = Math.sin(-t.rot);
        var lx = dx * c - dy * s, ly = dx * s + dy * c;
        return Math.abs(lx) < t.hb + 14 && Math.abs(ly) < t.hh + 14;
    };

    /* Tryk: hjaelperne og kaffen vinder altid (de tegnes forrest), saa det
       oeverste molekyle. */
    P.tryk = function (x, y) {
        this.peger = { x: x, y: y };
        if (this.tilstand !== "koerer") return null;
        var i, t;
        for (i = this.ting.length - 1; i >= 0; i--) {
            t = this.ting[i];
            if (t.art === "hjaelp" && this.rammer(t, x, y)) { this.brugHjaelper(t); return t; }
        }
        for (i = this.ting.length - 1; i >= 0; i--) {
            t = this.ting[i];
            if (t.art === "kaffe" && this.rammer(t, x, y)) {
                this.fjern(t);
                this.damp(t.x, t.y);
                this.saetBesked(D.BESKED.kaffeKlik, "haendelse", 3.5);
                this.naar("kaffe", { klik: true });
                return t;
            }
        }
        for (i = this.ting.length - 1; i >= 0; i--) {
            t = this.ting[i];
            if (t.art === "mol" && this.rammer(t, x, y)) {
                this.trukket = t;
                t.trukket = true;
                t.hint = false;
                t.grebX = t.x - x;
                t.grebY = t.y - y;
                this.naar("greb");
                return t;
            }
        }
        return null;
    };

    P.flyt = function (x, y) { this.peger = { x: x, y: y }; };

    P.slipGreb = function () {
        if (this.trukket) this.trukket.trukket = false;
        this.trukket = null;
    };

    /* ----- Effekter -------------------------------------------------------------------------------------- */
    P.eksplosion = function (x, y, farve) {
        for (var i = 0; i < 15; i++) {
            this.partikler.push({ x: x, y: y, farve: farve, vx: (Math.random() - 0.5) * 900, vy: (Math.random() - 0.5) * 900, liv: 1 });
        }
    };

    P.damp = function (x, y) {
        for (var i = 0; i < 10; i++) {
            this.partikler.push({ x: x + NK.r(-12, 12), y: y, farve: "#dfe6ee", vx: NK.r(-40, 40), vy: NK.r(-160, -60), liv: 1, damp: true });
        }
    };

    /* ----- Tiden -------------------------------------------------------------------------------------------- */
    P.opdater = function (dt) {
        var i, t;
        if (this.besked && this.tilstand === "koerer") {
            this.besked.ur -= dt;
            if (this.besked.ur <= 0) { this.besked = null; this.version++; }
        }
        for (i = 0; i < this.spande.length; i++) if (this.spande[i].puls > 0.2) this.spande[i].puls *= Math.pow(0.9, dt * 60); else this.spande[i].puls = 0;

        /* Fyrvaerkeriet ved Stofgruppemester koerer ogsaa bag kortet */
        if (this.fyr > 0 && this.tilstand !== "pause") {
            this.fyrUr -= dt;
            while (this.fyrUr <= 0 && this.fyr > 0) {
                this.fyr--;
                this.fyrUr += 0.1;
                this.eksplosion(Math.random() * this.W, Math.random() * this.H * 0.8, "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 55%)");
            }
        }
        if (this.tilstand !== "pause") this.opdaterPartikler(dt);

        if (this.tilstand === "livTabt") {
            this.livUr -= dt;
            if (this.livUr <= 0) {
                this.rydSkaerm();
                if (this.sidsteLiv) this.slut();
                else { this.tilstand = "koerer"; this.version++; }
            }
            return;
        }
        if (this.tilstand !== "koerer") return;

        this.tid += dt;
        if (this.mesterUr > 0) {
            this.mesterUr -= dt;
            if (this.mesterUr <= 0) {
                this.tilstand = "mester";
                this.slipGreb();
                this.naar("mester");
                this.version++;
                return;
            }
        }
        if (this.inhibitor && this.tid >= this.inhibitorSlut) { this.inhibitor = false; this.version++; }
        var foer = this.turbo.length, tid = this.tid;
        this.turbo = this.turbo.filter(function (x) { return x.slut > tid; });
        if (this.turbo.length !== foer) this.version++;
        var fart = this.fartFaktor();

        /* Nye molekyler */
        this.nytUr += dt * 1000 * fart;
        if (this.nytUr > this.nytHvert()) {
            this.nytMolekyle();
            this.nytUr = 0;
            if (!this.kaffeSet && this.niveau >= D.KAFFE.fra && Math.random() < D.KAFFE.chance) this.nyKaffe();
        }

        /* Hjaelperne, fra niveau 2 og kun én ad gangen */
        if (this.niveau > 0) {
            this.hjaelpUr += dt;
            var harHjaelper = this.ting.some(function (x) { return x.art === "hjaelp"; });
            if (!harHjaelper && this.hjaelpUr > this.naesteHjaelp) {
                this.nyHjaelper();
                this.hjaelpUr = 0;
                this.naesteHjaelp = D.HJAELP.min + Math.random() * (D.HJAELP.maks - D.HJAELP.min);
            }
        }

        /* Bevaegelsen og afgoerelsen */
        for (i = this.ting.length - 1; i >= 0; i--) {
            t = this.ting[i];
            if (!t) continue;
            if (t.trukket) {
                var mx = NK.klamp(this.peger.x + t.grebX, 1, this.W - 1);
                var my = Math.max(-40, this.peger.y + t.grebY);
                t.x = NK.mod(t.x, mx, 18, dt);
                t.y = NK.mod(t.y, my, 18, dt);
            } else {
                t.y += t.vy * dt * fart * this.H / D.HOEJDE;
                t.rot += t.drej * dt;
            }
            if (t.art === "hjaelp") {
                t.puls += dt * 4.8;
                if (t.y > this.H + 50) this.ting.splice(i, 1);
                continue;
            }
            var spand = this.spandVed(t.x);
            if (t.art === "kaffe") {
                if (spand && t.y >= this.H - D.SPAND_HOEJDE) {
                    this.ting.splice(i, 1);
                    this.damp(t.x, t.y);
                    this.saetBesked(D.BESKED.kaffeSpand, "haendelse", 3.5);
                    this.naar("kaffe", { klik: false });
                } else if (t.y > this.H + 50) this.ting.splice(i, 1);
                continue;
            }
            if (spand && t.y >= this.H - D.SPAND_HOEJDE) {
                if (t.trukket) this.slipGreb();
                if (spand.klasse === t.m.klasse) {
                    this.ting.splice(i, 1);
                    this.rigtig(t, spand);
                    if (this.tjekNiveau()) break;
                } else if (!this.harSpand(t.m.klasse)) {
                    /* Klassen har ingen spand lige nu: forsvinder uden straf */
                    this.eksplosion(t.x, t.y, "#ffffff");
                    this.ting.splice(i, 1);
                } else {
                    this.forkert(t, spand.klasse);
                    break;
                }
            } else if (!spand && t.y > this.H + 50) {
                this.forkert(t, null);
                break;
            }
        }
        /* Spanden under det, der holdes, lyser op */
        var over = this.trukket ? this.spandVed(this.trukket.x) : null;
        this.spande.forEach(function (s) { s.over = s === over; });
    };

    P.opdaterPartikler = function (dt) {
        for (var i = this.partikler.length - 1; i >= 0; i--) {
            var p = this.partikler[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.liv -= (p.damp ? 1.2 : 3) * dt;
            if (p.liv <= 0) this.partikler.splice(i, 1);
        }
    };

    NK.Spil = Spil;
}());
