/* =====================================================================
   sim_opraab.js - fane 3: opraabet

   Montren er spillepladen. Tavlen under den viser et opraab, og man
   svarer, foer tiden er gaaet:

     navn       "natrium": klik paa rummet i udstillingen
     symbol     et rum blinker: vaelg navnet blandt fire
     struktur   "2,8,5": klik paa det grundstof, der har den struktur

   De forkerte navne til symbolerne er de forvekslinger, elever laver
   (D.FORVEKSLING). Et forkert svar eller en tid, der loeber ud, koster
   et liv, og efter tre er spillet slut. Hvert femte rigtige svar giver
   et nyt niveau; fra niveau 4 er det hele blandet, og tiden bliver
   kortere. Rekorden huskes i browseren.

   Hvem er jeg? er en tillaegsoevelse med sin egen knap (this.spil er
   "hvem"). Tavlen viser en gaade (D.HVEM, bygget paa linjen om stoffet
   paa fane 1), og man klikker paa grundstoffet. Der er ingen liv: et
   forkert svar eller en tid, der loeber ud, laegger gaaden bagest i
   bunken, og spillet slutter, naar alle 20 er fundet. Egen rekord.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc1.2-opraab";
    var PR_NIVEAU = 5;
    var LIV = 3;
    var HVEM_TID = 20;

    /* De to spil: knappen i panelet og det, kortet Sådan siger */
    var SPIL = {
        opraab: { knap: "opraab-knap", start: "Start opråbet", igen: "Spil igen", titel: "Opråb",
            saadan: "Tavlen siger et grundstof. Klik på det i udstillingen, før kridtstregen er væk. Blinker et rum, vælger du navnet på tavlen. En fejl koster et liv." },
        hvem: { knap: "opraab-hvem", start: "Hvem er jeg?", igen: "Hvem er jeg? igen", titel: "Hvem er jeg?",
            saadan: "Tavlen fortæller noget om et grundstof. Klik på det i udstillingen, før kridtstregen er væk. Svarer du forkert, kommer det igen senere. Find alle 20." }
    };

    var ALMINDELIGE = D.GRUNDSTOFFER.filter(function (g) { return g.z <= 20 || g.z === 26 || g.z === 29 || g.z === 30; });
    var HOVED_20 = D.GRUNDSTOFFER.filter(function (g) { return g.z <= 20; });
    var HOVED_ALLE = D.GRUNDSTOFFER.filter(function (g) { return !g.ovg; });

    var NIVEAUER = [
        { navn: "Navn → plads", slags: ["navn"], tid: 12 },
        { navn: "Symbol → navn", slags: ["symbol"], tid: 12 },
        { navn: "Elektronstruktur → plads", slags: ["struktur"], tid: 16 },
        { navn: "Det hele blandet", slags: ["navn", "symbol", "struktur"], tid: 12 }
    ];

    function niveau(n) {
        if (n < NIVEAUER.length) return NIVEAUER[n];
        var b = NIVEAUER[NIVEAUER.length - 1];
        return { navn: b.navn, slags: b.slags, tid: Math.max(6, b.tid * Math.pow(0.88, n - NIVEAUER.length + 1)) };
    }

    /* Symbolet til et navn i svarmulighederne (ogsaa kulstof, sølv og tin) */
    function symbolFor(navn) {
        var i, g;
        for (i = 0; i < D.GRUNDSTOFFER.length; i++) {
            g = D.GRUNDSTOFFER[i];
            if (g.navn === navn || g.alt.indexOf(navn) >= 0) return g.s;
        }
        for (i = 0; i < D.UDENFOR.length; i++) if (D.UDENFOR[i].navn === navn) return D.UDENFOR[i].s;
        return "";
    }

    function pulje(slags, n) {
        if (slags === "struktur") return n >= 3 ? HOVED_ALLE : HOVED_20;
        return n >= 3 ? D.GRUNDSTOFFER : ALMINDELIGE;
    }

    function SimOpraab() {
        this.L = new NK.Laerred(NK.el("opraab-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, { rekord: 0 });
        this.rekorder = { opraab: gemt.rekord || 0, hvem: gemt.hvem || 0 };
        this.spil = "opraab";
        this.rekord = this.rekorder.opraab;
        this.lay = null;
        this.over = null;
        this.blink = {};
        this.floats = [];
        this.nulstilSpil();
        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visPanel();
    }

    var P = SimOpraab.prototype;

    P.nulstilSpil = function () {
        this.tilstand = "klar";
        this.point = 0;
        this.stime = 0;
        this.liv = LIV;
        this.nivNr = 0;
        this.rigtigeINiveau = 0;
        this.opraab = null;
        this.svar = null;
        this.banner = null;
        this.sidste = [];
        this.fejlListe = [];
        this.nyRekord = false;
        this.blink = {};
        this.floats = [];
        /* Hvem er jeg?: gaaderne, der mangler, og dem, der er fundet */
        this.bunke = this.spil === "hvem" ? NK.bland(D.HVEM.slice()) : [];
        this.fundet = 0;
        this.visValg(false);
        var liste = NK.el("opraab-log");
        if (liste) liste.innerHTML = "";
        var kort = NK.el("opraab-log-kort");
        if (kort) kort.hidden = true;
    };

    /* Montren paa fane 1: hvilke proever staar der? */
    P.proeveInde = function (z) {
        var m = NK.sims && NK.sims["fane-montre"];
        return m ? m.inde(z) : false;
    };

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.gulvY = Math.round(H * 0.95);
        lay.m = Tg.montreLay(kant, kant, W - 2 * kant, H * 0.56);
        var top = lay.m.y + lay.m.h + NK.klamp(H * 0.03, 10, 24);
        /* Til venstre for tavlen er der plads til Kemichael */
        var tx = NK.klamp(W * 0.3, 120, 320);
        var tb = Math.min(W - kant - tx, 820);
        var ledigH = Math.max(110, lay.gulvY - 14 - top);
        var th = Math.min(ledigH, Math.max(170, tb * 0.42));
        lay.tavle = { x: tx, y: top + (ledigH - th) * 0.35, b: tb, h: th };
        this.lay = lay;

        /* Svarknapperne ligger nederst paa tavlen */
        var v = NK.el("opraab-valg");
        var ind = { x: lay.tavle.x + 7, y: lay.tavle.y + 7, b: lay.tavle.b - 14, h: lay.tavle.h - 14 };
        var vh = NK.klamp(ind.h * 0.3, 36, 52);
        v.style.left = Math.round(ind.x + 14) + "px";
        v.style.width = Math.round(ind.b - 28) + "px";
        v.style.top = Math.round(ind.y + ind.h - vh - 12) + "px";
        v.style.height = Math.round(vh) + "px";

        this.saetAnker("opraab-anker-montre", lay.m.x, lay.m.y, lay.m.b, lay.m.h);
        this.saetAnker("opraab-anker-tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Panelet og knapperne ----------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        NK.el("opraab-knap").addEventListener("click", function () { mig.spilKnap("opraab"); });
        NK.el("opraab-hvem").addEventListener("click", function () { mig.spilKnap("hvem"); });
        NK.el("opraab-spring").addEventListener("click", function () { mig.springIntro(); });
        this.bygTilbud();
        this.valgKnapper = [];
        var v = NK.el("opraab-valg");
        for (var i = 0; i < 4; i++) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap";
            k.setAttribute("data-nr", String(i));
            (function (nr) { k.addEventListener("click", function () { mig.vaelgSvar(nr); }); }(i));
            v.appendChild(k);
            this.valgKnapper.push(k);
        }
    };

    P.visValg = function (vis) {
        var v = NK.el("opraab-valg");
        if (v) v.hidden = !vis;
    };

    P.visPanel = function () {
        var hvem = this.spil === "hvem";
        NK.saetTekst("opraab-point", String(this.point));
        NK.saetTekst("opraab-rekord", String(this.rekord));
        NK.saetTekst("opraab-niveau-navn", hvem ? "Fundet" : "Niveau");
        NK.saetTekst("opraab-niveau", hvem ? this.fundet + "/" + D.HVEM.length : (this.nivNr + 1) + " · " + niveau(this.nivNr).navn);
        NK.saetTekst("opraab-stime", "×" + this.gange());
        var hjerter = "";
        for (var i = 0; i < LIV; i++) hjerter += i < this.liv ? "♥" : "♡";
        NK.saetTekst("opraab-liv", hjerter);
        NK.el("opraab-liv-raekke").style.display = hvem ? "none" : "";
        NK.saetTekst("opraab-saadan", SPIL[this.spil].saadan);
        /* Det valgte spils knap er blaa og siger Pause, Fortsaet eller Spil
           igen. Den anden starter det andet spil og er vaek, mens der spilles. */
        var mig = this;
        Object.keys(SPIL).forEach(function (navn) {
            var knap = NK.el(SPIL[navn].knap);
            var valgt = navn === mig.spil;
            var tekst = valgt ? { klar: SPIL[navn].start, koerer: "Pause", pause: "Fortsæt", slut: SPIL[navn].igen }[mig.tilstand] : SPIL[navn].start;
            var tegn = valgt && mig.tilstand === "koerer" ? "❚❚" : "▶";
            knap.innerHTML = "<span>" + tekst + "</span><span class=\"tegn\">" + tegn + "</span>";
            knap.className = "knap stor" + (valgt ? " blaa" : "") + (valgt && mig.tilstand !== "koerer" ? " banker" : "");
            knap.style.display = !valgt && mig.tilstand === "koerer" ? "none" : "";
        });
    };

    /* Et klik paa et spils knap: det valgte spil pauser eller fortsaetter,
       det andet starter forfra */
    P.spilKnap = function (spil) {
        if (spil !== this.spil) this.vaelgSpil(spil);
        this.startKnap();
    };

    /* Skift mellem Opraab og Hvem er jeg? (ogsaa fra linket index.html#hvem) */
    P.vaelgSpil = function (spil) {
        if (!SPIL[spil] || spil === this.spil) return;
        this.spil = spil;
        this.rekord = this.rekorder[spil];
        this.nulstilSpil();
        this.visPanel();
    };

    P.gange = function () { return Math.min(4, 1 + Math.floor(this.stime / 3)); };

    P.startKnap = function () {
        if (this.tilstand === "koerer") { this.tilstand = "pause"; this.visPanel(); return; }
        if (this.tilstand === "pause") { this.tilstand = "koerer"; this.visPanel(); return; }
        if (this.laererIntroVaek) this.laererIntroVaek();
        if (this.afvisTilbud) this.afvisTilbud();
        this.nulstilSpil();
        this.tilstand = "koerer";
        this.banner = { tekst: this.spil === "hvem" ? "Hvem er jeg?" : "Niveau 1 · " + niveau(0).navn, t: 0 };
        this.opraab = null;
        this.venter = 1.3;
        this.visPanel();
    };

    P.nulstil = function () {
        this.nulstilSpil();
        this.visPanel();
    };

    /* ----- Opraabene ---------------------------------------------------------- */
    P.nytOpraab = function () {
        if (this.spil === "hvem") {
            this.visValg(false);
            this.opraab = { slags: "hvem", g: this.bunke.shift(), tid: HVEM_TID, t: 0 };
            this.svar = null;
            return;
        }
        var nv = niveau(this.nivNr);
        var slags = NK.tilfaeldig(nv.slags);
        var mig = this;
        var liste = pulje(slags, this.nivNr).filter(function (g) { return mig.sidste.indexOf(g.z) < 0; });
        var g = NK.tilfaeldig(liste);
        this.sidste.push(g.z);
        if (this.sidste.length > 6) this.sidste.shift();
        var o = { slags: slags, g: g, tid: nv.tid, t: 0 };
        if (slags === "symbol") {
            var valg = NK.bland([g.navn].concat(D.FORVEKSLING[g.s]));
            o.valg = valg;
            o.rigtig = valg.indexOf(g.navn);
            this.valgKnapper.forEach(function (k, i) {
                k.textContent = valg[i];
                k.className = "valgknap";
                k.disabled = false;
            });
            this.visValg(true);
        } else {
            this.visValg(false);
        }
        this.opraab = o;
        this.svar = null;
    };

    /* Et klik paa et rum i montren */
    P.klikRum = function (z) {
        var o = this.opraab;
        if (this.tilstand !== "koerer" || !o || this.svar || o.slags === "symbol") return;
        this.afgoer(z === o.g.z, z);
    };

    P.vaelgSvar = function (nr) {
        var o = this.opraab;
        if (this.tilstand !== "koerer" || !o || this.svar || o.slags !== "symbol") return;
        this.valgKnapper.forEach(function (k, i) {
            k.disabled = true;
            if (i === o.rigtig) k.className = "valgknap rigtig";
            else if (i === nr) k.className = "valgknap forkert";
        });
        this.afgoer(nr === o.rigtig, nr);
    };

    /* Genvej: tasterne 1-4 vaelger et svar, naar der er fire at vaelge i */
    P.tast = function (tast) {
        var o = this.opraab;
        if (this.tilstand === "koerer" && o && o.slags === "symbol" && !this.svar && /^[1-4]$/.test(tast)) {
            this.vaelgSvar(parseInt(tast, 10) - 1);
            return true;
        }
        return false;
    };

    P.afgoer = function (rigtigt, hvad) {
        var o = this.opraab, g = o.g;
        var rum = this.lay.m.rum[g.z];
        if (rigtigt) {
            var rest = Math.max(0, o.tid - o.t);
            this.stime++;
            var faar = Math.round((100 + 100 * rest / o.tid) * this.gange() / 10) * 10;
            this.point += faar;
            if (o.slags === "hvem") this.fundet++;
            else this.rigtigeINiveau++;
            this.blink[g.z] = { farve: "63, 174, 114", a: 1.2 };
            this.floats.push({ tekst: "+" + faar, x: rum.x + rum.b / 2, y: rum.y, t: 0 });
            this.svar = { rigtigt: true, t: 0, varighed: o.slags === "hvem" ? 1.4 : 0.9, tekst: "Rigtigt · " + g.s + " " + g.navn };
        } else {
            this.stime = 0;
            /* Hvem er jeg?: ingen liv, gaaden kommer igen til sidst */
            if (o.slags === "hvem") this.bunke.push(g);
            else this.liv--;
            this.blink[g.z] = { farve: "63, 174, 114", a: 2.4 };
            if (typeof hvad === "number" && o.slags !== "symbol" && hvad !== g.z) this.blink[hvad] = { farve: "224, 84, 70", a: 1.6 };
            this.svar = { rigtigt: false, t: 0, varighed: o.slags === "hvem" ? 2.8 : 2.3, tekst: this.forklaring(o, hvad) };
            this.logFejl(o);
        }
        this.visPanel();
    };

    /* Hvad der var rigtigt, og hvad det klikkede var */
    P.forklaring = function (o, hvad) {
        var g = o.g;
        if (hvad === "tid") return "Tiden løb ud. Det var " + g.s + ", " + g.navn + ".";
        if (o.slags === "symbol") {
            var valgt = o.valg[hvad], s2 = symbolFor(valgt);
            return g.s + " er " + g.navn + "." + (s2 ? " " + valgt.charAt(0).toUpperCase() + valgt.slice(1) + " er " + s2 + "." : "");
        }
        var andet = D.efterZ(hvad);
        var t = "Det var " + g.s + ", " + (o.slags === "struktur" ? g.struktur : g.navn) + ".";
        if (andet) t += " " + andet.s + " er " + (o.slags === "struktur" && !andet.ovg ? andet.struktur : andet.navn) + ".";
        return t;
    };

    P.logFejl = function (o) {
        var g = o.g;
        /* En gaade, der kommer igen, staar kun én gang i listen */
        if (o.slags === "hvem" && this.fejlListe.some(function (x) { return x.g === g; })) return;
        this.fejlListe.push(o);
        var li = document.createElement("li");
        li.innerHTML = "<b>" + g.s + "</b>" + NK.html(g.navn) + (o.slags === "struktur" ? " · " + g.struktur : "") +
            (o.slags === "hvem" ? "<em>" + NK.html(g.gaade) + "</em>" : "");
        NK.el("opraab-log").appendChild(li);
    };

    P.naesteEfterSvar = function () {
        if (this.spil === "hvem") {
            if (!this.bunke.length) this.slut();
            else this.nytOpraab();
            return;
        }
        if (this.liv <= 0) { this.slut(); return; }
        if (this.rigtigeINiveau >= PR_NIVEAU) {
            this.nivNr++;
            this.rigtigeINiveau = 0;
            this.banner = { tekst: "Niveau " + (this.nivNr + 1) + " · " + niveau(this.nivNr).navn, t: 0 };
            this.venter = 1.4;
            this.opraab = null;
            this.visValg(false);
            this.visPanel();
            return;
        }
        this.nytOpraab();
    };

    P.slut = function () {
        this.tilstand = "slut";
        this.opraab = null;
        this.visValg(false);
        if (this.point > this.rekord) {
            this.nyRekord = this.rekord > 0 || this.point > 0;
            this.rekord = this.point;
            this.rekorder[this.spil] = this.point;
            NK.gem(NOEGLE, { rekord: this.rekorder.opraab, hvem: this.rekorder.hvem });
        }
        NK.el("opraab-log-kort").hidden = this.fejlListe.length === 0;
        this.visPanel();
        var art = this.point === 0 ? "ingen" : (this.nyRekord ? "rekord" : (this.point >= 1500 ? "mange" : "faa"));
        if (this.spil === "hvem") art = this.nyRekord ? "rekord" : "hvem";
        if (this.laererSlut) this.laererSlut(art);
    };

    /* ----- Kemichaels praesentation ----------------------------------------
       Tilbuddet med Start praesentation og Nej tak: js/praesentation.js */
    NK.Praesentation.kobl(P, { noegle: "nk-sc1.2-intro-opraab", tilbud: "opraab-tilbud", spring: "opraab-spring" });

    P.enter = function () {
        if (this.tilstand !== "koerer") this.startKnap();
    };

    P.fokus = function () {};

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        Object.keys(this.blink).forEach(function (z) {
            mig.blink[z].a -= dt * 1.1;
            if (mig.blink[z].a <= 0) delete mig.blink[z];
        });
        this.floats = this.floats.filter(function (f) { f.t += dt; return f.t < 1.1; });
        if (this.banner) {
            this.banner.t += dt;
            if (this.banner.t > 1.6) this.banner = null;
        }

        if (this.tilstand === "koerer") {
            if (this.venter > 0) {
                this.venter -= dt;
                if (this.venter <= 0) this.nytOpraab();
            } else if (this.svar) {
                this.svar.t += dt;
                if (this.svar.t >= this.svar.varighed) this.naesteEfterSvar();
            } else if (this.opraab) {
                this.opraab.t += dt;
                if (this.opraab.t >= this.opraab.tid) {
                    if (this.opraab.slags === "symbol") {
                        var o = this.opraab;
                        this.valgKnapper.forEach(function (k, i) {
                            k.disabled = true;
                            if (i === o.rigtig) k.className = "valgknap rigtig";
                        });
                    }
                    this.afgoer(false, "tid");
                }
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, o = this.opraab;
        Tg.rum(ctx, lay.W, lay.H, lay.gulvY);

        var maal = 0;
        if (o && o.slags === "symbol" && !this.svar) maal = o.g.z;
        var klikbar = this.tilstand === "koerer" && o && o.slags !== "symbol" && !this.svar;
        Tg.montre(ctx, lay.m, {
            tid: this.tid,
            inde: function (z) { return mig.proeveInde(z); },
            lys: klikbar && this.over && this.over.slags === "rum" ? this.over.z : 0,
            maal: maal,
            blink: this.blink,
            tavleLys: 0
        });

        this.tegnTavle(ctx);

        /* Point, der flyver op */
        this.floats.forEach(function (f) {
            ctx.save();
            ctx.globalAlpha = NK.klamp(1.2 - f.t, 0, 1);
            NK.tekst(ctx, f.tekst, f.x, f.y - 6 - f.t * 30, {
                font: Tg.font("800", 18), justering: "center", farve: "#7ee0a8", kant: true
            });
            ctx.restore();
        });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnTavle = function (ctx) {
        var lay = this.lay, t = lay.tavle, o = this.opraab;
        var ind = Tg.tavle(ctx, t.x, t.y, t.b, t.h);
        var cx = ind.x + ind.b / 2;
        var stor = NK.klamp(ind.h * 0.3, 22, 54);
        var lille = NK.klamp(ind.h * 0.11, 13, 18);
        var symbolRunde = o && o.slags === "symbol";
        /* Ved fire svarmuligheder er opraabet rykket op */
        var midt = symbolRunde ? ind.y + ind.h * 0.36 : ind.y + ind.h * 0.44;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (this.tilstand === "klar" || (this.tilstand === "slut" && !this.laererTaler())) {
            ctx.fillStyle = Tg.KRIDT;
            if (this.tilstand === "klar") {
                NK.passendeSkrift(ctx, SPIL[this.spil].titel, ind.b - 30, stor, 14, "700");
                ctx.fillText(SPIL[this.spil].titel, cx, midt);
                ctx.font = Tg.font("600", lille);
                ctx.fillStyle = "rgba(238, 242, 234, 0.7)";
                ctx.fillText(this.rekord ? "Rekord: " + this.rekord + " point" : "Tryk Start i panelet", cx, midt + stor * 0.8);
            } else {
                ctx.font = Tg.font("700", stor * 0.8);
                ctx.fillText(this.point + " point", cx, midt);
                ctx.font = Tg.font("600", lille);
                ctx.fillStyle = this.nyRekord ? "#f7d774" : "rgba(238, 242, 234, 0.7)";
                var under = this.spil === "hvem" ? "Alle " + D.HVEM.length + " fundet" + (this.nyRekord ? " · ny rekord" : "")
                    : (this.nyRekord ? "Ny rekord" : "Niveau " + (this.nivNr + 1) + " nået");
                ctx.fillText(under, cx, midt + stor * 0.75);
            }
            ctx.restore();
            return;
        }
        if (this.tilstand === "slut") {
            ctx.restore();
            return;
        }
        if (this.banner && !o) {
            ctx.fillStyle = "#f7d774";
            NK.passendeSkrift(ctx, this.banner.tekst, ind.b - 30, stor * 0.7, 12, "700");
            ctx.fillText(this.banner.tekst, cx, midt);
            ctx.restore();
            return;
        }
        if (!o) { ctx.restore(); return; }
        if (o.slags === "hvem") { this.tegnGaade(ctx, ind, o, lille); ctx.restore(); return; }

        var spm = o.slags === "symbol" ? "Hvad hedder det, der blinker?" : (o.slags === "struktur" ? "Find grundstoffet med elektronstrukturen" : "Find");
        ctx.font = Tg.font("600", lille);
        ctx.fillStyle = "rgba(238, 242, 234, 0.75)";
        ctx.fillText(spm, cx, midt - stor * 0.85);
        var tekst = o.slags === "symbol" ? o.g.s : (o.slags === "struktur" ? o.g.struktur : o.g.navn);
        ctx.fillStyle = Tg.KRIDT;
        NK.passendeSkrift(ctx, tekst, ind.b - 40, stor, 14, "700");
        ctx.fillText(tekst, cx, midt);

        /* Tiden: en kridtstreg, der bliver kortere */
        var rest = this.svar ? 0 : NK.klamp(1 - o.t / o.tid, 0, 1);
        var sb = ind.b * 0.5, sy = midt + stor * 0.72;
        ctx.fillStyle = "rgba(238, 242, 234, 0.15)";
        ctx.fillRect(cx - sb / 2, sy, sb, 5);
        ctx.fillStyle = rest < 0.3 ? "#f0776a" : "rgba(238, 242, 234, 0.8)";
        ctx.fillRect(cx - sb / 2, sy, sb * rest, 5);

        if (this.svar) {
            ctx.font = Tg.font("700", NK.klamp(lille * 1.05, 14, 19));
            ctx.fillStyle = this.svar.rigtigt ? "#b8f0cf" : "#f5b0a9";
            var fy = symbolRunde ? sy + 22 : sy + lille * 1.8;
            NK.passendeSkrift(ctx, this.svar.tekst, ind.b - 30, NK.klamp(lille * 1.05, 14, 19), 12, "700");
            ctx.fillText(this.svar.tekst, cx, Math.min(fy, ind.y + ind.h - 12));
        }
        ctx.restore();
    };

    /* Hvem er jeg?: overskriften, gaaden i hoejst tre linjer, kridtstregen
       og svaret. Det hele centreres paa tavlen; skriften bliver mindre,
       til det kan vaere der. gaadeMaal giver skriften og linjerne (og om
       det passede), saa selvtesten kan proeve alle gaader. */
    P.gaadeMaal = function (tekst, ind, lille) {
        var ctx = this.L.ctx, bredde = ind.b - 50;
        var px, linjer, hoejde, passer = false;
        for (px = NK.klamp(Math.round(ind.h * 0.15), 16, 34); px >= 13; px--) {
            ctx.font = Tg.font("700", px);
            linjer = Tg.ombryd(ctx, tekst, bredde);
            hoejde = lille * 1.5 + linjer.length * px * 1.28 + px * 0.5 + 5 + lille * 2;
            if (linjer.length <= 3 && hoejde <= ind.h - 14) { passer = true; break; }
        }
        return { px: Math.max(px, 13), linjer: linjer, hoejde: hoejde, passer: passer };
    };

    /* Tavlens indre og den lille skrift, som tegnTavle regner dem ud */
    P.tavleIndre = function () {
        var t = this.lay.tavle;
        var ind = { x: t.x + 7, y: t.y + 7, b: t.b - 14, h: t.h - 14 };
        return { ind: ind, lille: NK.klamp(ind.h * 0.11, 13, 18) };
    };

    P.tegnGaade = function (ctx, ind, o, lille) {
        var cx = ind.x + ind.b / 2;
        var mg = this.gaadeMaal(o.g.gaade, ind, lille);
        var px = mg.px, linjer = mg.linjer, hoejde = mg.hoejde;
        var y = ind.y + Math.max(6, (ind.h - hoejde) / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = Tg.font("600", lille);
        ctx.fillStyle = "rgba(238, 242, 234, 0.75)";
        ctx.fillText("Hvem er jeg?", cx, y + lille * 0.6);
        y += lille * 1.5;
        ctx.font = Tg.font("700", px);
        ctx.fillStyle = Tg.KRIDT;
        linjer.forEach(function (l) {
            ctx.fillText(l, cx, y + px * 0.64);
            y += px * 1.28;
        });
        /* Tiden: en kridtstreg, der bliver kortere */
        var rest = this.svar ? 0 : NK.klamp(1 - o.t / o.tid, 0, 1);
        var sb = ind.b * 0.5, sy = y + px * 0.5;
        ctx.fillStyle = "rgba(238, 242, 234, 0.15)";
        ctx.fillRect(cx - sb / 2, sy, sb, 5);
        ctx.fillStyle = rest < 0.3 ? "#f0776a" : "rgba(238, 242, 234, 0.8)";
        ctx.fillRect(cx - sb / 2, sy, sb * rest, 5);
        if (this.svar) {
            ctx.fillStyle = this.svar.rigtigt ? "#b8f0cf" : "#f5b0a9";
            NK.passendeSkrift(ctx, this.svar.tekst, ind.b - 30, NK.klamp(lille * 1.05, 14, 19), 12, "700");
            ctx.fillText(this.svar.tekst, cx, Math.min(sy + 5 + lille * 1.2, ind.y + ind.h - 12));
        }
    };

    P.laererTaler = function () {
        var L = this.laerer;
        return !!(L && (L.scene || L.taleAlfa > 0.05));
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            mig.over = null;
            if (mig.laererUnder && mig.laererUnder(pt.x, pt.y)) { mig.over = { slags: "laerer" }; }
            else if (mig.lay) {
                var z = Tg.montreRum(mig.lay.m, pt.x, pt.y);
                if (z) mig.over = { slags: "rum", z: z };
            }
            var klikbar = mig.tilstand === "koerer" && mig.opraab && mig.opraab.slags !== "symbol" && !mig.svar;
            c.style.cursor = (mig.over && mig.over.slags === "rum" && klikbar) || (mig.over && mig.over.slags === "laerer") ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            if (!mig.lay) return;
            var z = Tg.montreRum(mig.lay.m, pt.x, pt.y);
            if (z) mig.klikRum(z);
        });
    };

    NK.SimOpraab = SimOpraab;
    NK.OPRAAB_NIVEAUER = NIVEAUER;
}());
