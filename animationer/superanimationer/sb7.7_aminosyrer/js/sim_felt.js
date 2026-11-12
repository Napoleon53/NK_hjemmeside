/* =====================================================================
   sim_felt.js - fane 3: Det elektriske felt

   Fire trin (D.FELT). Eleven finder foerst formerne, foer der skal
   forudsiges noget (brugeren 12. nov. 2026; foer var trin 1 et gaet):
     1 former   formlerne staar uladede som i bogen; eleven klikker paa
                grupperne, saa de passer til pH 6 (hver −COOH afgiver og
                hver −NH₂ optager en hydron), og saa staar ladningerne der
     2 minuspol hvilken aminosyre vandrer mod minuspolen? (lysin)
     3 stroem   strømmen sluttes, og pletterne vandrer efter ladningen;
                kortet bliver staaende med en knap videre
     4 ph1      ved hvilken pH vandrer alle tre mod minuspolen? (pH 1, og
                saa koerer forsoeget igen ved pH 1)
     5 ukendt   to ukendte aminosyrer, X og Y, vandrer ved pH 6 (X mod
                pluspolen, Y mod minuspolen); formlerne har ? for enden af
                sidekaeden
     6 struktur eleven klikker paa ?, til gruppen for enden passer med
                forsoeget (−CH₃, −OH, −COOH eller −NH₂): X faar −COOH
                (glutaminsyre) og Y −NH₂ (lysin). Metoden fra trin 1 bruges
                baglaens (brugeren 12. nov. 2026: "en ukendt opgave.. hvor man
                skal bruge metoden til at løse en struktur")
   Bagefter er pH-skyderen fri, og pletterne vandrer igen, naar eleven
   slipper den.

   Modellen: en plet flytter sig D.VANDRING af den halve strimmel for hver
   ladning (gennemsnittet D.ladning ved pH). d er positiv mod minuspolen til
   venstre, saa en positiv aminosyre vandrer mod minuspolen. Stoerrelsen er
   ikke med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Mol;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.7-felt";

    var KOER = 2.4;          /* sekunder, strømmen er sluttet */
    var IGEN = 0.35;         /* pletterne kommer tilbage til start */
    var GRUPPER = ["carboxyl", "amino", "side"];

    function SimFelt() {
        var mig = this;
        this.trinListe = D.FELT;
        this.raekke = D.FELT_RAEKKE;
        this.hentStatus();
        this.startFane();
        NK.el("e-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimFelt.prototype;
    F.paa(P, "e");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };
    P.naesteUloeste = function () { return 0; };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(t.navn) + "</span></li>";
        });
        NK.saetHTML("e-trin", html);
        NK.saetTekst("e-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.fri = false;
        this.sejrT = null;
        this.ph = 6;
        this.raekke = D.FELT_RAEKKE;
        this.vis = "bog";
        this.pletIon = false;
        this.koer = null;
        this.igen = null;
        this.stroemPaa = false;
        this.klikket = 0;
        this.kortKasser = {};
        this.elevT = {};
        this.valgSide = { x: null, y: null };
        this.loestUkendt = false;
        this.d = {};
        this.d0 = {};
        this.dMaal = {};
        var mig = this;
        D.FELT_RAEKKE.concat(D.UKENDT_RAEKKE).forEach(function (id) { mig.d[id] = 0; mig.d0[id] = 0; mig.dMaal[id] = 0; });
        D.FELT_RAEKKE.forEach(function (id) { mig.elevT[id] = bogTilst(D.AMINOSYRER[id]); });
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        var mig = this;
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.fase = this.trin.slags;
        /* De ukendte: X og Y afloeser de tre aminosyrer ved pH 6 */
        if (this.trin.ukendt && this.raekke !== D.UKENDT_RAEKKE) {
            this.raekke = D.UKENDT_RAEKKE;
            this.ph = this.trin.ph;
            this.vis = "bog";
            this.pletIon = false;
            this.stroemPaa = false;
            this.koer = null;
            this.igen = null;
            this.klikket = 0;
            this.kortKasser = {};
            this.raekke.forEach(function (id) { mig.d[id] = 0; });
        }
        this.valgt = null;
        this.forkert = {};
        this.groen = null;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "former" || this.fase === "struktur") return { slags: "spm", chip: chip, tekst: t.tekst };
        if (this.fase === "forsoeg") {
            if (this.koer) return { slags: "opgave", chip: chip, tekst: t.koerer };
            return { slags: "opgave", chip: chip, tekst: t.tekst,
                     ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">' + NK.html(t.knap) + "</button></div>" };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst,
                 svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg"; };
    P.skjulHint = function () { return this.fase === "forsoeg"; };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.fase === "former" || this.fase === "struktur") return this.klikket > 0;
        return this.fase === "spm" && this.valgt !== null;
    };
    P.indsendTekst = function () { return "Indsend svar"; };
    P.ingentingTekst = function () { return this.trin.fejlIntet || "Vælg et af svarene på kortet først."; };

    P.indsend = function () { this.bedoem(false); };

    /* Den foerste gruppe, der ikke passer til pH 6, og forklaringen til den */
    P.formFejl = function () {
        var t = this.trin, ph = t.ph;
        for (var i = 0; i < D.FELT_RAEKKE.length; i++) {
            var id = D.FELT_RAEKKE[i], aa = D.AMINOSYRER[id], maal = D.tilstand(aa, ph), elev = this.elevT[id];
            for (var k = 0; k < GRUPPER.length; k++) {
                var g = GRUPPER[k];
                if (maal[g] === undefined || maal[g] === elev[g]) continue;
                if (g === "side") return aa.sideSlags === "carboxyl" ? t.fejlSideCarboxyl : t.fejlSideAmino;
                return (g === "carboxyl" ? t.fejlCarboxyl : t.fejlAmino).replace("{navn}", aa.navn);
            }
        }
        return null;
    };

    /* Den foerste ukendte, hvis gruppe ikke passer med forsoeget */
    P.strukturFejl = function () {
        var t = this.trin;
        for (var i = 0; i < D.UKENDT_RAEKKE.length; i++) {
            var u = D.UKENDTE[D.UKENDT_RAEKKE[i]], v = this.valgSide[u.id], tekst;
            if (v === u.facit) continue;
            if (!v) tekst = t.fejlMangler;
            else if (v === "CH3" || v === "OH") tekst = t.fejlNeutral.replace("{gruppe}", D.ENDE_TEKST[v]);
            else tekst = v === "amino" ? t.fejlAmino : t.fejlCarboxyl;
            return tekst.replace("{navn}", u.navn);
        }
        return null;
    };

    P.bedoem = function (vist) {
        var t = this.trin, fejlTekst;
        if (this.fase === "former") {
            fejlTekst = this.formFejl();
            if (fejlTekst) { this.fejl = true; this.fejlLinje(fejlTekst); return; }
            this.vis = "ion";
            this.pletIon = true;
        } else if (this.fase === "struktur") {
            fejlTekst = this.strukturFejl();
            if (fejlTekst) { this.fejl = true; this.fejlLinje(fejlTekst); return; }
            this.vis = "ion";
            this.loestUkendt = true;
        } else if (this.valgt !== t.rigtig) {
            this.fejl = true;
            var tekst = t.fejl[this.valgt];
            this.forkert[this.valgt] = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        var sidste = this.trinNr === this.trinListe.length - 1, tekst2 = t.forkl, foerste = false;
        if (t.id === "ph1") this.nyRunde(t.ph);
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            this.fri = true;
            tekst2 += " " + D.FELT_FAERDIG;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
                       knap: sidste ? "Se teorien →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-e").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        var e = NK.el("teori");
        if (e) { e.classList.add("vis"); if (NK.tegnTeori) NK.tegnTeori(); }
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen && !this.koer) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen || this.fase === "forsoeg") return [];
        return this.trin.hint || [];
    };

    P.visSvar = function () {
        var mig = this;
        this.sv = true;
        if (this.fase === "former") {
            D.FELT_RAEKKE.forEach(function (id) { mig.elevT[id] = D.tilstand(D.AMINOSYRER[id], mig.trin.ph); });
        } else if (this.fase === "struktur") {
            D.UKENDT_RAEKKE.forEach(function (id) { mig.valgSide[id] = D.UKENDTE[id].facit; });
        } else this.valgt = this.trin.rigtig;
        this.bedoem(true);
    };

    /* ----- Forsoeget -------------------------------------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.koer || this.groen) return;
        /* Ved de ukendte ses kun pletterne; formlerne beholder deres ? */
        if (!this.trin.ukendt) this.vis = "ion";
        this.pletIon = true;
        this.startKoer();
        this.visKort();
    };

    /* Den rigtige aminosyre bag et id (X er glutaminsyre, Y er lysin) */
    P.sand = function (id) { return D.UKENDTE[id] ? D.AMINOSYRER[D.UKENDTE[id].rigtig] : D.AMINOSYRER[id]; };

    /* Den aminosyre, formlen viser: for X og Y med den gruppe, eleven har valgt */
    P.vist = function (id) {
        var u = D.UKENDTE[id];
        if (!u) return D.AMINOSYRER[id];
        var sand = this.sand(id), e = this.valgSide[id];
        var aa = { id: id, navn: u.navn, kort: u.kort, side: "ukendt", n: u.n, ende: e,
                   grupper: { carboxyl: sand.grupper.carboxyl, amino: sand.grupper.amino } };
        if (e === "carboxyl" || e === "amino") { aa.sideSlags = e; aa.grupper.side = D.ENDE_PKS[e]; }
        return aa;
    };

    P.ladning = function (id) { return D.ladning(this.sand(id), this.ph); };

    P.startKoer = function () {
        var mig = this;
        this.koer = { t: 0 };
        this.stroemPaa = true;
        this.raekke.forEach(function (id) {
            mig.d0[id] = mig.d[id];
            mig.dMaal[id] = NK.klamp(mig.ladning(id) * D.VANDRING, -0.92, 0.92);
        });
    };

    /* Pletterne kommer tilbage til start, og forsoeget koerer ved en ny pH */
    P.nyRunde = function (ph) {
        var mig = this;
        this.ph = Math.round(ph / D.PH_SKRIDT) * D.PH_SKRIDT;
        this.vis = "ion";
        this.pletIon = true;
        this.koer = null;
        this.raekke.forEach(function (id) { mig.d[id] = 0; });
        this.igen = { t: 0 };
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        if (this.igen) {
            this.igen.t += dt;
            if (this.igen.t >= IGEN) { this.igen = null; this.startKoer(); }
        }
        if (this.koer) {
            this.koer.t += dt;
            var u = NK.blod(this.koer.t / KOER);
            this.raekke.forEach(function (id) { mig.d[id] = NK.lerp(mig.d0[id], mig.dMaal[id], u); });
            if (this.koer.t >= KOER) {
                this.koer = null;
                /* Forsoeget er slut: kortet bliver staaende med en knap videre */
                if (this.fase === "forsoeg" && !this.groen) {
                    this.groen = { spm: true, maade: "selv", maerke: "Forsøget", tekst: this.trin.efter, knap: "Næste trin →" };
                    this.besked("", "");
                    this.visKort();
                    this.visListe();
                }
            }
        }
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.paaPapir = function (pt) {
        var s = this.strimmel;
        return pt && s && pt.x > s.x - 50 && pt.x < s.x + s.b + 50 && pt.y > s.y && pt.y < s.y + s.h;
    };

    P.overScene = function (pt) {
        if (!pt) return null;
        if (T.paaSkala(this.skala, pt)) return this.fri ? "ew-resize" : "not-allowed";
        if (this.fase === "forsoeg" && !this.koer && !this.groen && this.paaPapir(pt)) return "pointer";
        if ((this.fase === "former" || this.fase === "struktur") && !this.groen && this.gruppeVed(pt)) return "pointer";
        return null;
    };

    P.nedScene = function (pt) {
        if (!T.paaSkala(this.skala, pt) || !this.fri) return false;
        this.grebSkyder = true;
        this.saetPh(T.xTilPh(this.skala, pt.x));
        return true;
    };

    P.saetPh = function (ph) {
        this.ph = Math.round(ph / D.PH_SKRIDT) * D.PH_SKRIDT;
        this.vis = "ion";
        this.pletIon = true;
    };

    P.flytScene = function (pt) { if (this.grebSkyder) this.saetPh(T.xTilPh(this.skala, pt.x)); };
    P.opScene = function () {
        if (!this.grebSkyder) return;
        this.grebSkyder = false;
        this.nyRunde(this.ph);
    };

    P.klikScene = function (pt) {
        if (T.paaSkala(this.skala, pt)) {
            if (!this.fri) { this.kortBlink(); this.kortBesked("Skyderen er låst, til alle trin er løst.", 3); }
            return;
        }
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && !this.koer && this.paaPapir(pt)) { this.udfoer(); return; }
        if (this.fase === "former" || this.fase === "struktur") {
            var h = this.gruppeVed(pt);
            if (h && this.fase === "former") {
                /* Gruppen faar eller afgiver sin hydron */
                this.elevT[h.id][h.g] = 1 - this.elevT[h.id][h.g];
            } else if (h) {
                /* Gruppen for enden af sidekaeden skifter: −CH₃, −OH, −COOH, −NH₂ */
                var e = this.valgSide[h.id];
                this.valgSide[h.id] = D.ENDER[(D.ENDER.indexOf(e) + 1) % D.ENDER.length];
            }
            if (h) {
                this.klikket++;
                this.besked("", "");
                this.visIndsend();
                return;
            }
        }
        this.kortBlink();
    };

    /* Den gruppe i formlerne, musen er over: { id, g } */
    P.gruppeVed = function (pt) {
        if (!pt) return null;
        var gr = this.fase === "struktur" ? ["side"] : GRUPPER;
        for (var i = 0; i < this.raekke.length; i++) {
            var id = this.raekke[i], kk = this.kortKasser[id];
            if (!kk) continue;
            for (var k = 0; k < gr.length; k++) {
                var b = kk[gr[k]], m = 5;
                if (b && pt.x > b.x - m && pt.x < b.x + b.w + m && pt.y > b.y - m && pt.y < b.y + b.h + m) return { id: id, g: gr[k] };
            }
        }
        return null;
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        /* En lav tavle (baerbar i menuen) faar en smallere strimmel og en skyder
           med tallet til venstre, saa formlerne stadig kan laeses */
        this.kompakt = t.h < 440;
        var skalaPlads = this.kompakt ? 44 : 82;
        var stribeH = Math.round(NK.klamp(t.h * 0.26, 84, 170));
        var kortB = (t.b - 4 * 14) / 3;
        var ledig = t.h - 12 - 26 - stribeH - 14 - skalaPlads;
        var fs = Math.round(NK.klamp(Math.min((ledig - 10) / 13.2, kortB / 10.8), 10, 17) * 2) / 2;
        this.fs = fs;
        var kortH = Math.min(ledig, Math.round(13.2 * fs + 10));
        var n = this.raekke.length, x0 = t.x + (t.b - n * kortB - (n - 1) * 14) / 2;
        this.kort = this.raekke.map(function (id, i) { return { id: id, x: x0 + i * (kortB + 14), y: t.y + 12, b: kortB, h: kortH }; });
        var sy = t.y + 12 + kortH + 26 + Math.max(0, (ledig - kortH) * 0.5);
        this.strimmel = { x: t.x + 74, y: sy, b: t.b - 148, h: stribeH };
        this.skala = { x: t.x + 70 + (this.kompakt ? 30 : 0), y: t.y + t.h - (this.kompakt ? 30 : 34), b: t.b - 140 - (this.kompakt ? 30 : 0) };
        this.saetAnker("formler", t.x + 8, t.y + 6, t.b - 16, kortH + 12);
        this.saetAnker("papir", this.strimmel.x - 60, sy - 24, this.strimmel.b + 120, stribeH + 46);
        this.saetAnker("skyder", this.skala.x - 40, this.skala.y - 46, this.skala.b + 80, 70);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(ctx, lay);
        this.kort.forEach(function (k) { mig.tegnKort(ctx, k); });
        this.tegnPapir(ctx);
        T.phSkala(ctx, this.skala, this.ph, { laast: !this.fri, greb: this.grebSkyder, kompakt: this.kompakt });
        this.tegnSejr(ctx, t);
    };

    /* Den uladede formel, som i bogens figur af de syv aminosyrer */
    function bogTilst(aa) {
        var t = { amino: 0, carboxyl: 1 };
        if (aa.grupper.side !== undefined) t.side = aa.sideSlags === "amino" ? 0 : 1;
        return t;
    }

    P.tegnKort = function (ctx, k) {
        var aa = this.vist(k.id), u = D.UKENDTE[k.id], fs = this.fs, F2 = D.FARVE;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 12);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#cfd8de";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        var ion = this.vis === "ion";
        var tilst = ion ? D.tilstand(aa, this.ph) : (u ? bogTilst(aa) : this.elevT[k.id]);
        var kk = M.tegn(ctx, aa, tilst, k.x + k.b / 2, k.y + 10 + 0.62 * fs, fs, { gloed: 1 });
        this.kortKasser[k.id] = kk;
        /* Grupperne, eleven kan klikke paa: alle i trin 1, enden af sidekaeden i trin 6 */
        if (!this.groen && (this.fase === "former" || this.fase === "struktur")) {
            (this.fase === "former" ? GRUPPER : ["side"]).forEach(function (g) { if (kk[g]) T.valgRamme(ctx, kk[g], "#d69e0c", true); });
        }
        var yN = k.y + k.h - 2.1 * fs, sand = this.sand(k.id);
        var navn = u ? (this.loestUkendt ? u.navn + ": " + sand.navn : u.navn) : aa.navn;
        var om = u ? (this.loestUkendt ? sand.om : "ukendt sidekæde") : aa.om;
        NK.tekst(ctx, navn, k.x + k.b / 2, yN, { font: "800 " + Math.round(fs * 0.95) + "px " + M.FONT, farve: F2.blaek, justering: "center", linje: "middle" });
        var linje2 = om + (ion ? " · ladning " + NK.fortegn(D.tilstandLadning(aa, tilst)) : "");
        NK.tekst(ctx, linje2, k.x + k.b / 2, yN + 1.15 * fs, { font: "600 " + Math.round(fs * 0.78) + "px " + M.FONT, farve: ion ? F2.amfo : F2.daempet, justering: "center", linje: "middle" });
    };

    P.tegnPapir = function (ctx) {
        var s = this.strimmel, mig = this, F2 = D.FARVE, t = this.lay.tavle;
        var stroem = !!this.koer || this.stroemPaa;
        /* Polerne */
        [[s.x - 50, "−", "minuspol", F2.base], [s.x + s.b + 6, "+", "pluspol", F2.syre]].forEach(function (p) {
            ctx.save();
            var g = ctx.createLinearGradient(p[0], 0, p[0] + 44, 0);
            g.addColorStop(0, "#5c6673");
            g.addColorStop(0.5, "#8b95a1");
            g.addColorStop(1, "#5c6673");
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, p[0], s.y - 4, 44, s.h + 8, 8);
            ctx.fill();
            if (stroem) { ctx.strokeStyle = p[3]; ctx.lineWidth = 3; ctx.stroke(); }
            ctx.restore();
            NK.tekst(ctx, p[1], p[0] + 22, s.y + s.h / 2, { font: "800 30px " + T.FONT, farve: "#ffffff", justering: "center", linje: "middle" });
            NK.tekst(ctx, p[2], p[0] + 22, s.y - 18, { font: "700 13px " + T.FONT, farve: p[3], justering: "center", linje: "middle" });
        });
        /* Papiret, fugtet med opløsningen */
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        var pg = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
        pg.addColorStop(0, "#f4efe3");
        pg.addColorStop(1, "#e8e0cd");
        ctx.fillStyle = pg;
        ctx.fillRect(s.x, s.y, s.b, s.h);
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#c9bea5";
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x, s.y, s.b, s.h);
        /* Startlinjen */
        ctx.strokeStyle = "rgba(90, 80, 60, 0.45)";
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(s.x + s.b / 2, s.y + 4); ctx.lineTo(s.x + s.b / 2, s.y + s.h - 4); ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "start", s.x + s.b / 2, s.y - 10, { font: "600 12px " + T.FONT, farve: T.DAEMPET, justering: "center", linje: "middle" });

        /* Pletterne */
        var halv = s.b / 2, rh = s.h / this.raekke.length, alfa = this.igen ? NK.klamp(this.igen.t / IGEN, 0, 1) : 1;
        this.raekke.forEach(function (id, i) {
            var aa = mig.sand(id), x = s.x + halv - mig.d[id] * halv, y = s.y + rh * (i + 0.5);
            var q = mig.pletIon ? D.tilstandLadning(aa, D.tilstand(aa, mig.ph)) : 0;
            var farve = !mig.pletIon || q === 0 ? "#7d8896" : (q > 0 ? F2.syre : F2.base);
            ctx.save();
            ctx.globalAlpha = alfa;
            var g = ctx.createRadialGradient(x, y, 2, x, y, 18);
            g.addColorStop(0, farve);
            g.addColorStop(0.65, farve);
            g.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.ellipse(x, y, 19, Math.min(13, rh * 0.32), 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            var etiket = D.UKENDTE[id] ? D.UKENDTE[id].kort : aa.kort;
            NK.tekst(ctx, etiket, x, y - Math.min(13, rh * 0.32) - 9, { font: "800 13px " + T.FONT, farve: T.BLAEK, justering: "center", linje: "middle" });
        });

        if (this.fase === "forsoeg" && !this.koer && !this.groen) {
            T.skilt(ctx, s.x + s.b / 2, s.y + 2, "Klik: slut strømmen", { min: t.x + 4, maks: t.x + t.b - 4 });
        }
    };

    NK.SimFelt = SimFelt;
}());
