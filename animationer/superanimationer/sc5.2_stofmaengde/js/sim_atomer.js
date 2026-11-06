/* =====================================================================
   sim_atomer.js - fane 2: flest atomer

   To vaegte med hver sin proeve i en vejebaad. En proeve er givet i mol
   ("1 mol guld") eller i gram ("10,00 g carbon"), og vaegtene viser
   massen. Eleven gaetter, hvor der er flest atomer: venstre, lige mange
   eller hoejre. Saa taeller vaegtene: displayet skifter fra gram til
   antallet af atomer, et stort <, = eller > staar mellem dem, og
   skiltet paa bordet viser beregningen.

   Parrene (D.PAR) er valgt efter fejlen "tungest har flest atomer". En
   runde er ni par, tre fra hvert niveau. Rekorden huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc5.2-atomer";
    var TAEL_TID = 0.9;

    function SimAtomer() {
        this.L = new NK.Laerred(NK.el("atomer-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.rekord = (NK.hent(NOEGLE, {}) || {}).rekord || 0;
        this.g = { kaffekop: { skjult: true, iHaand: false } };

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyRunde();
    }

    var P = SimAtomer.prototype;

    /* ----- Runden ---------------------------------------------------------- */
    P.nyRunde = function () {
        var runde = [];
        D.RUNDE.forEach(function (antal, niveau) {
            var puljen = NK.bland(D.PAR.filter(function (p) { return p.niveau === niveau; }));
            runde = runde.concat(puljen.slice(0, antal));
        });
        this.runde = runde.map(function (p) {
            var byt = Math.random() < 0.5;
            return { v: byt ? p.b : p.a, h: byt ? p.a : p.b, niveau: p.niveau, hvorfor: p.hvorfor };
        });
        this.nr = 0;
        this.point = 0;
        this.stime = 0;
        this.slut = false;
        this.nytPar();
    };

    P.nytPar = function () {
        this.par = this.runde[this.nr];
        this.svar = null;
        this.valgt = null;
        this.hjaelp = 0;
        this.visteSvar = false;
        this.taelT = 0;
        this.besked("", "");
        this.visPanel();
    };

    /* Den side, der har flest atomer: "v", "l" eller "h" */
    P.facit = function (par) {
        par = par || this.par;
        var a = par.v.n, b = par.h.n;
        if (Math.abs(a - b) <= D.LIGE * Math.max(a, b)) return "l";
        return b > a ? "h" : "v";
    };

    /* Brugerens regel 24. okt. 2026: svarknapperne (og piletasterne)
       vaelger kun. Svaret bedoemmes foerst med Indsend svar. Saa taeller
       vaegtene, og kortet bliver paa spoergsmaalet med det valgte svar
       groent (eller roedt og det rigtige groent) og forklaringen under
       svarene (papirkortet, 6. nov. 2026). */
    P.vaelg = function (s) {
        if (this.slut || this.svar || !this.par) return;
        if (["v", "l", "h"].indexOf(s) < 0) return;
        this.valgt = s;
        this.visPanel();
    };

    P.indsend = function () {
        if (this.slut || this.svar || !this.par) { this.kort.blink(); return; }
        if (!this.valgt) {
            this.kort.blink();
            this.kort.besked("Vælg først Venstre, Lige mange eller Højre på kortet.", "peger");
            return;
        }
        this.vaelgSvar(this.valgt);
    };

    var ORD = { v: "Flest atomer til venstre", h: "Flest atomer til højre", l: "Lige mange atomer" };

    /* Bedoemmer svaret s (efter Indsend svar eller Vis svaret) */
    P.vaelgSvar = function (s) {
        if (this.slut || this.svar || !this.par) return;
        this.svar = s;
        this.valgt = s;
        var f = this.facit();
        var rigtigt = s === f && !this.visteSvar;
        this.rigtigt = rigtigt;
        if (rigtigt) { this.point++; this.stime++; } else { this.stime = 0; }
        this.taelT = 0;
        if (this.afvisTilbud) this.afvisTilbud();
        if (this.nr === this.runde.length - 1) this.afslut();
        this.visPanel();
    };

    P.afslut = function () {
        var ny = this.point > this.rekord;
        if (ny) {
            this.rekord = this.point;
            NK.gem(NOEGLE, { rekord: this.rekord });
        }
        this.slutVent = { t: 2.4, rekord: ny && this.point > 0 };
    };

    /* Knappen, der foerer videre: Naeste par, Se resultatet */
    P.videre = function () {
        if (this.slut || !this.svar) return;
        if (this.nr >= this.runde.length - 1) {
            this.slut = true;
            this.visPanel();
            return;
        }
        this.nr++;
        this.nytPar();
    };

    /* Giv hint, saa Vis svaret */
    P.hint = function () {
        if (this.slut || this.svar) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.visPanel();
        } else {
            this.visteSvar = true;
            this.vaelgSvar(this.facit());
        }
    };

    /* Den gamle knap (selvtesten): videre, ellers hint. Efter runden: ny runde. */
    P.knap = function () {
        if (this.slut) { this.nyRunde(); return; }
        if (this.svar) { this.videre(); return; }
        this.hint();
    };

    P.nulstil = function () { this.nyRunde(); };

    /* ----- Kortet og panelet ---------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.kort = new NK.SceneKort("atomer", {
            valg: function (j) { mig.vaelg(j); },
            hint: function () { mig.hint(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.el = { besked: this.kort.beskedEl, knap: this.kort.hintEl, indsend: this.kort.indsendEl };
        NK.el("atomer-nulstil").addEventListener("click", function () { mig.nyRunde(); });
    };

    /* Beskeden nulstilles ved et nyt par; resten styrer visKort */
    P.besked = function () {};

    P.visPanel = function () {
        NK.saetTekst("atomer-point", String(this.point));
        NK.saetTekst("atomer-par", Math.min(this.nr + 1, this.runde.length) + "/" + this.runde.length);
        NK.saetTekst("atomer-stime", String(this.stime));
        NK.saetTekst("atomer-rekord", String(this.rekord));
        this.visKort();
    };

    P.visKort = function () {
        var k = this.kort, mig = this;
        if (this.slut) {
            var tekst = "Du fik " + this.point + " af " + this.runde.length + " rigtige. Din rekord er " + this.rekord +
                " rigtige. Knappen Ny runde i panelet giver ni nye par.";
            k.vis({ kl: "loest", chip: "Runden er slut", tekst: NK.html(tekst) });
            k.bliv(null);
            k.besked("", "");
            k.knapper({});
            this.tjekZone();
            return;
        }
        if (!this.par) return;
        var f = this.facit();
        var svar = [["v", "←", "Venstre"], ["l", "↓", "Lige mange"], ["h", "→", "Højre"]].map(function (r) {
            var s = r[0], sendt = !!mig.svar;
            return {
                j: s, t: '<span class="pil">' + r[1] + "</span>" + r[2],
                valgt: !sendt && mig.valgt === s,
                rigtig: sendt && s === f && !mig.visteSvar,
                svarVist: sendt && s === f && mig.visteSvar,
                forkert: sendt && s === mig.svar && s !== f,
                dim: sendt && s !== f && s !== mig.svar
            };
        });
        k.vis({
            kl: this.svar ? "loest" + (this.rigtigt ? "" : " svar") : "spm",
            chip: "Par " + (this.nr + 1) + " af " + this.runde.length + " · " + D.PAR_NIVEAUER[this.par.niveau].navn,
            tekst: NK.html("Skiltet på bordet viser de to prøver, og vægtene viser massen. Hvor er der flest atomer?"),
            svar: svar,
            laast: !!this.svar
        });
        if (this.svar) {
            var knap = this.nr >= this.runde.length - 1 ? "Se resultatet →" : "Næste par →";
            var forkl = NK.html(ORD[f] + ". " + this.par.hvorfor);
            if (this.visteSvar) k.bliv(forkl, "Svaret", knap, "svar");
            else if (this.rigtigt) k.bliv(forkl, "Rigtigt", knap, "god");
            else k.bliv(forkl, "Ikke rigtigt", knap, "nej");
        } else {
            k.bliv(null);
            if (this.hjaelp > 0) k.besked('<span class="b-maerke">Hint</span> ' + NK.html(D.PAR_NIVEAUER[this.par.niveau].hint), "gul");
            else k.besked("", "");
            k.knapper({ hint: this.hjaelp === 0 ? "Giv hint" : "Vis svaret", indsend: true, klar: !!this.valgt,
                indsendTekst: this.valgt ? "Indsend svar: " + { v: "Venstre", l: "Lige mange", h: "Højre" }[this.valgt] : "Indsend svar" });
        }
        this.tjekZone();
    };

    /* Kortets plads oeverst i scenen: [almindelig skaerm, lav skaerm] */
    var ZONE = [132, 118];
    P.kortZone = function () { return this.kort.zone(ZONE); };
    P.tjekZone = function () {
        if (this.lay && this.kortZone() !== this.lay.zone) this.layout();
    };

    /* Tastatur: pilene vaelger */
    P.tast = function (key) {
        if (this.svar || this.slut) return false;
        if (key === "ArrowLeft") { this.vaelg("v"); return true; }
        if (key === "ArrowRight") { this.vaelg("h"); return true; }
        if (key === "ArrowDown") { this.vaelg("l"); return true; }
        return false;
    };

    /* Enter: Indsend svar, naar et svar er valgt, ellers videre */
    P.enter = function () {
        if (this.slut) return;
        if (this.svar) { this.videre(); return; }
        if (this.valgt) this.indsend();
        else this.kort.blink();
    };
    P.fokus = function () {};

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        var pb = NK.klamp(W * 0.3, 150, 300);
        /* Plakaten begynder under papirkortet */
        lay.zone = this.kortZone();
        lay.plakat = { x: kant, y: lay.zone, b: pb, h: Math.round(pb * 0.4) };
        /* Bordet staar lidt hoejt, saa skiltet med beregningerne kan sidde paa forsiden */
        lay.bordY = Math.round(H - NK.klamp(H * 0.2, 70, 150));
        var vb = NK.klamp(Math.min(W * 0.34, (lay.bordY - lay.plakat.y - lay.plakat.h) * 0.75), 130, 320);
        lay.vaegtB = vb;
        lay.vaegte = [W * 0.29, W * 0.71].map(function (x) {
            return { x: Math.round(x), skaal: Tg.vaegtSkaal(Math.round(x), lay.bordY, vb) };
        });
        lay.skilt = { x: kant, y: lay.bordY + 16, b: W - 2 * kant, h: H - lay.bordY - 22 };
        this.lay = lay;

        var vh = Tg.vaegtHoejde(vb);
        var top = lay.bordY - vh - vb * 0.35;
        this.saetAnker("atomer-anker-vaegte", lay.vaegte[0].x - vb / 2, top, lay.vaegte[1].x - lay.vaegte[0].x + vb, lay.bordY - top);
        this.saetAnker("atomer-anker-skilt", lay.skilt.x, lay.skilt.y, lay.skilt.b, lay.skilt.h);
        this.saetAnker("atomer-anker-plakat", lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h);
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
        else this.tjekZone();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.svar) this.taelT = Math.min(3, this.taelT + dt);
        if (this.slutVent) {
            this.slutVent.t -= dt;
            if (this.slutVent.t <= 0 && this.laererSlut) {
                var sv = this.slutVent;
                this.slutVent = null;
                this.laererSlut(this.point, sv.rekord);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Displayet: gram foer svaret, atomer bagefter */
    P.display = function (side) {
        if (!this.svar || this.taelT < 0.35) return { t: Tg.gram(side.m), lys: 0 };
        var a = NK.klamp((this.taelT - 0.35) / TAEL_TID, 0, 1);
        return { t: Tg.displayAntal(D.antal(side.n)), etiket: "atomer", lys: a < 1 ? 1 : 0.4 };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.par) return;
        var mig = this;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.molPlakat(ctx, lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h, {});
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        [this.par.v, this.par.h].forEach(function (side, i) {
            var v = lay.vaegte[i], d = mig.display(side);
            Tg.vaegt(ctx, v.x, lay.bordY, lay.vaegtB, d.t, { lys: d.lys, etiket: d.etiket });
            var bb = v.skaal.b * 0.82;
            Tg.bunke(ctx, v.x, v.skaal.y + 1, bb, side.st, 1, Tg.bunkeHoejde(bb, D.rumfang(side.st, side.m)), side.st.nr + i * 7);
        });

        /* Soejlerne: antallet af atomer over hver vaegt, i samme maalestok */
        if (this.svar && this.taelT > 0.35) {
            var sj = this.soejler(), vokset = NK.blod(NK.klamp((this.taelT - 0.35) / TAEL_TID, 0, 1));
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.setLineDash([4, 5]);
            ctx.beginPath();
            ctx.moveTo(lay.vaegte[0].x - sj.b, sj.bund + 0.5);
            ctx.lineTo(lay.vaegte[1].x + sj.b, sj.bund + 0.5);
            ctx.stroke();
            ctx.setLineDash([]);
            [this.par.v, this.par.h].forEach(function (side, i) {
                var hh = sj.h[i] * vokset, x = lay.vaegte[i].x - sj.b / 2;
                var g = ctx.createLinearGradient(x, 0, x + sj.b, 0);
                g.addColorStop(0, Tg.nuance(side.st.farve, 0.2));
                g.addColorStop(1, Tg.nuance(side.st.farve, -0.2));
                ctx.fillStyle = g;
                ctx.fillRect(x, sj.bund - hh, sj.b, hh);
                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 0.5, sj.bund - hh + 0.5, sj.b - 1, hh);
                if (vokset > 0.6) {
                    NK.tekst(ctx, NK.potens(D.antal(side.n), 3), lay.vaegte[i].x, sj.bund - hh - 10, {
                        justering: "center", font: Tg.font("700", NK.klamp(sj.b * 0.3, 13, 17)), kant: true,
                        farve: "#f2f3f5"
                    });
                }
            });
            ctx.restore();
        }

        /* Sammenligningen mellem vaegtene */
        if (this.svar && this.taelT > 0.35 + TAEL_TID * 0.6) {
            var f = this.facit();
            var tegn = { v: ">", l: "=", h: "<" }[f];
            var a = NK.klamp((this.taelT - 0.35 - TAEL_TID * 0.6) / 0.4, 0, 1);
            var mx = (lay.vaegte[0].x + lay.vaegte[1].x) / 2;
            var my = lay.bordY - Tg.vaegtHoejde(lay.vaegtB) * 0.7;
            var px = NK.klamp(lay.vaegtB * 0.3, 30, 80);
            ctx.save();
            ctx.globalAlpha = a;
            NK.tekst(ctx, tegn, mx, my, { justering: "center", linje: "middle", font: Tg.font("800", px * NK.pop(a)),
                farve: "#f2c53d", kant: true, kantBredde: 5 });
            NK.tekst(ctx, "atomer", mx, my + px * 0.75, { justering: "center", linje: "middle", font: Tg.font("600", NK.klamp(px * 0.26, 12, 16)),
                farve: "#c8ced6" });
            ctx.restore();
        }

        this.tegnSkilt(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Soejlernes bund, bredde og hoejder i px: den stoerste naar op til
       lige under plakaten, den anden i samme maalestok */
    P.soejler = function (par) {
        var lay = this.lay;
        par = par || this.par;
        var bb = lay.vaegte[0].skaal.b * 0.82;
        var bund = lay.vaegte[0].skaal.y - bb * 0.36 - 22;
        var top = lay.plakat.y + lay.plakat.h + 40;
        var maks = Math.max(20, bund - top);
        var Nv = par.v.n, Nh = par.h.n, stoerst = Math.max(Nv, Nh);
        return {
            bund: bund, top: top, b: NK.klamp(lay.vaegtB * 0.2, 26, 64),
            h: [maks * Nv / stoerst, maks * Nh / stoerst]
        };
    };

    /* Linjerne paa skiltet for én proeve.
       trin 0: foer hintet, 1: hintet (molarmassen ved niveau 1 og 2), 2: svaret */
    P.skiltLinjer = function (side, trin, niveau) {
        var st = side.st, l = [{ t: D.proeveTekst(side), fed: true }];
        if (trin === 1 && niveau > 0) l.push({ t: "M(" + st.s + ") = " + NK.komma(st.M) + " g/mol" });
        if (trin === 2) {
            var nTekst = side.givet === "mol" ? D.nTekst(side.tal) : NK.betydende(side.n, 3);
            if (side.givet === "g") {
                l.push({ t: "n = " + NK.komma(side.m) + " g / " + NK.komma(st.M) + " g/mol = " + nTekst + " mol" });
            }
            l.push({ t: "N = " + nTekst + " mol · " + D.NA_TEKST + " = " + NK.potens(D.antal(side.n), 3), groen: true });
        }
        return l;
    };

    /* Skriften paa skiltet: den stoerste, hvor alle linjer kan vaere i en
       halv skiltbredde, og tre linjer kan vaere i hoejden. par: et andet
       par end det aktuelle (til selvtesten). */
    P.skiltPlan = function (ctx, trin, par) {
        var s = this.lay.skilt, mig = this;
        par = par || this.par;
        var sider = [par.v, par.h].map(function (side) { return mig.skiltLinjer(side, trin, par.niveau); });
        var bred = s.b / 2 - 24;
        var px = NK.klamp((s.h - 10) / 3 / 1.3, 9, 17);
        function passer() {
            ctx.font = "600 " + px + "px 'Segoe UI', sans-serif";
            return sider.every(function (l) { return l.every(function (x) { return ctx.measureText(x.t).width <= bred; }); });
        }
        while (px > 9 && !passer()) px -= 0.5;
        return { px: px, sider: sider, bred: bred };
    };

    P.tegnSkilt = function (ctx) {
        var s = this.lay.skilt;
        var trin = this.svar ? 2 : (this.hjaelp > 0 ? 1 : 0);
        var plan = this.skiltPlan(ctx, trin);
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(s.x + 3, s.y + 4, s.b, s.h);
        ctx.fillStyle = "#fbfbf7";
        NK.rundtRekt(ctx, s.x, s.y, s.b, s.h, 5);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x + s.b / 2, s.y + 8);
        ctx.lineTo(s.x + s.b / 2, s.y + s.h - 8);
        ctx.stroke();
        var lh = plan.px * 1.3;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        plan.sider.forEach(function (linjer, i) {
            var cx = s.x + s.b * (i === 0 ? 0.25 : 0.75);
            var y = s.y + (s.h - linjer.length * lh) / 2 + lh / 2;
            linjer.forEach(function (l) {
                ctx.font = (l.fed ? "700 " : "600 ") + plan.px + "px 'Segoe UI', sans-serif";
                ctx.fillStyle = l.fed ? "#1c1f26" : (l.groen ? "#1d7a48" : (trin === 1 ? "#6a5210" : "#4a4f5a"));
                ctx.fillText(l.t, cx, y);
                y += lh;
            });
        });
        ctx.restore();
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            var paa = (mig.laererUnder && mig.laererUnder(pt.x, pt.y)) || (!mig.svar && mig.overVaegt(pt) >= 0);
            c.style.cursor = paa ? "pointer" : "default";
        });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            /* Foer svaret er sendt, er vaegtene laast: et klik i scenen faar
               kortet til at blinke. Et klik paa en vaegt er ikke et svar,
               for saa kunne man ikke svare lige mange. */
            if (!mig.svar && !mig.slut) mig.kort.blink();
        });
    };

    /* Vaegten under punktet: 0, 1 eller -1 */
    P.overVaegt = function (pt) {
        var lay = this.lay;
        if (!lay) return -1;
        for (var i = 0; i < 2; i++) {
            var v = lay.vaegte[i];
            if (Math.abs(pt.x - v.x) <= lay.vaegtB / 2 && pt.y <= lay.bordY && pt.y >= lay.bordY - Tg.vaegtHoejde(lay.vaegtB) - lay.vaegtB * 0.35) return i;
        }
        return -1;
    };

    /* ----- Kemichaels praesentation ---------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc5.2-intro-atomer", tilbud: "atomer-tilbud" });

    NK.SimAtomer = SimAtomer;
}());
