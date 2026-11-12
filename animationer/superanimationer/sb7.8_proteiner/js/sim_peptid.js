/* =====================================================================
   sim_peptid.js - fane 1: Peptidbindingen

   Fire trin (D.PEPTID):
     1 vand    alanin og glycin: eleven klikker paa de tre atomer, der
               bliver til vand, og trykker Indsend svar. Saa gaar vandet
               af, glycin glider ind, og peptidbindingen kommer i en kasse.
     2 ende    serin traekkes hen til den ende af Ala-Gly, saa tripeptidet
               hedder Ala-Gly-Ser (C-enden), og eleven trykker Indsend svar.
     3 spm     hvor mange vandmolekyler fraspaltes ved 8 aminosyrer? (7)
     4 byg     formlen bliver til perler (primaer struktur), og eleven
               traekker aminosyrerne fra bakken til C-enden efter opskriften.
   Vandet samles i raekken nederst paa tavlen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fane;
    var T = NK.Tegning;
    var Fm = NK.Formel;
    var NOEGLE = "nk-sb7.8-peptid";

    var GAB = 2.3;                       /* afstanden mellem alanin og glycin foer reaktionen */
    var REAK = 2.6;                      /* reaktionen i trin 1 */
    var HAEFT = 1.05;                    /* serin saettes paa i trin 2 */
    var MORF = 1.3;                      /* formlen bliver til perler */
    var FLYV = 0.8;                      /* et vandmolekyle flyver ned i raekken */
    var AUTO = 0.55;                     /* Vis svaret i trin 4: tid mellem perlerne */

    function SimPeptid() {
        var mig = this;
        this.trinListe = D.PEPTID;
        this.hentStatus();
        this.startFane();
        NK.el("p-forfra").addEventListener("click", function () { mig.forfra(); });
    }

    var P = SimPeptid.prototype;
    F.paa(P, "p");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(t.navn) + "</span></li>";
        });
        NK.saetHTML("p-trin", html);
        NK.saetTekst("p-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.sejrT = null;
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.groen = null;
        this.valgt = null;
        this.forkert = {};
        this.valgtAtomer = [];
        this.reak = null;
        this.haeft = null;
        this.morf = null;
        this.grebPerle = null;
        this.grebSerin = null;
        this.serinVed = null;
        this.flyv = [];
        this.auto = null;
        this.blink = null;
        this.serinPaa = false;
        this.besked("", "");
        this.fase = this.trin.slags;
        if (j === 0) {
            this.ala = Fm.kaede(["ala"], { eksplicit: true });
            this.gly = Fm.kaede(["gly"], { eksplicit: true, paritet: 1, start: 3 });
            this.gab = GAB;
            this.vand = 0;
            this.efterReak = false;
        } else if (j === 1) {
            this.kaede = Fm.kaede(["ala", "gly"]);
            this.ser = Fm.kaede(["ser"], { start: 6 });
            this.vand = 1;
        } else if (j === 2) {
            this.kaede = Fm.kaede(["ala", "gly", "ser"]);
            this.vand = 2;
        } else {
            this.kaede = Fm.kaede(["ala", "gly", "ser"]);
            this.vand = 2;
            this.antalPerler = 3;
            this.bakke = D.BAKKE.map(function (id, i) { return { id: id, i: i, brugt: false }; });
            this.morf = { t: 0 };
        }
        this.nulstilHjaelp();
        this.layout();
        this.visKort();
        this.visListe();
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "spm") {
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
        }
        if (this.fase === "byg") return { slags: "opgave", chip: chip, tekst: t.tekst };
        return { slags: "spm", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fase === "byg"; };
    P.skjulHint = function () { return !!this.morf; };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.fase === "vand") return this.valgtAtomer.length > 0 && !this.reak;
        if (this.fase === "ende") return !!this.serinVed && !this.haeft;
        if (this.fase === "spm") return this.valgt !== null;
        return false;
    };

    /* Det valgte som formel: "O og 2 H" */
    P.valgtTekst = function (liste) {
        var o = 0, h = 0, mig = this;
        (liste || this.valgtAtomer).forEach(function (v) { var a = mig.atomAf(v); if (a.el === "O") o++; else h++; });
        var dele = [];
        if (o) dele.push((o > 1 ? o + " " : "") + "O");
        if (h) dele.push((h > 1 ? h + " " : "") + "H");
        return dele.join(" og ");
    };

    P.indsendTekst = function () {
        if (this.fase === "vand" && this.valgtAtomer.length) return "Indsend svar: " + this.valgtTekst();
        if (this.fase === "ende" && this.serinVed) return "Indsend svar: serin ved " + (this.serinVed === "N" ? "N-enden" : "C-enden");
        if (this.fase === "spm" && this.valgt !== null) return "Indsend svar: " + this.trin.svar[this.valgt];
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.fase === "vand") return "Klik på atomerne i formlerne først.";
        if (this.fase === "ende") return this.trin.fejlIntet;
        return "Vælg et af svarene på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    /* ----- Bedoemmelsen --------------------------------------------------------------- */
    P.atomAf = function (v) { return (v.m === "ala" ? this.ala : this.gly).ind[v.id]; };

    /* Trin 1: hvilke tre atomer? Giver null (rigtigt) eller fejlteksten. */
    P.vandFejl = function (valg) {
        var t = this.trin, mig = this;
        var at = valg.map(function (v) { return { m: v.m, a: mig.atomAf(v) }; });
        var o = at.filter(function (x) { return x.a.el === "O"; }), h = at.filter(function (x) { return x.a.el === "H"; });
        if (o.length !== 1 || h.length !== 2) return D.flet(t.fejlAntal, { antal: this.valgtTekst(valg) });
        if (o[0].a.rolle === "dobbeltO") return t.fejlDobbelt;
        function har(m, rolle) { return h.some(function (x) { return x.m === m && x.a.rolle === rolle; }); }
        if (o[0].m === "ala" && o[0].a.rolle === "hydroxylO" && har("ala", "hydroxylH") && har("gly", "aminoH")) return null;
        if (o[0].m === "gly" && o[0].a.rolle === "hydroxylO" && har("gly", "hydroxylH") && har("ala", "aminoH")) return t.fejlVendt;
        if (o[0].m === "ala" && o[0].a.rolle === "hydroxylO") return t.fejlOH;
        return t.fejlAndet;
    };

    P.bedoem = function (vist) {
        var t = this.trin, mig = this;
        if (this.fase === "vand") {
            var f = this.vandFejl(this.valgtAtomer);
            if (f) {
                this.fejl = true;
                this.valgtAtomer = [];
                this.fejlLinje(f);
                return;
            }
            /* Det H i glycin, eleven valgte, gaar af; det andet glider ned */
            var hg = this.valgtAtomer.filter(function (v) { return v.m === "gly" && mig.gly.ind[v.id].el === "H"; })[0];
            this.reak = { t: 0, ud: hg.id, bliver: hg.id === "r0Ha" ? "r0Hb" : "r0Ha" };
            this.valgtAtomer = [];
            this.loes(vist, t.forkl);
            return;
        }
        if (this.fase === "ende") {
            if (this.serinVed !== "C") {
                this.fejl = true;
                this.forkert.N = true;
                this.serinVed = null;
                this.fejlLinje(t.fejlN);
                return;
            }
            this.haeft = { t: 0 };
            this.serinVed = null;
            this.loes(vist, t.forkl);
            return;
        }
        if (this.fase === "spm") {
            var valg = this.valgt;
            if (valg !== t.rigtig) {
                this.fejl = true;
                this.forkert[valg] = true;
                this.valgt = null;
                this.visKort();
                this.fejlLinje(t.fejl[valg]);
                return;
            }
            this.loes(vist, t.forkl, t.rigtig);
        }
    };

    P.loes = function (vist, tekst, svarNr) {
        var sidste = this.trinNr === this.trinListe.length - 1, foerste = false;
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
        }
        this.groen = { spm: true, svarNr: svarNr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
                       maerke: this.fase === "byg" ? (vist || this.sv ? "Svaret" : "Kæden er færdig") : undefined,
                       knap: sidste ? "Videre til Foldningen →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-p").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        if (NK.visFane) NK.visFane("fane-f");
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen && !this.reak && !this.haeft && !this.morf) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen || this.morf) return [];
        return this.trin.hint;
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "vand") {
            this.valgtAtomer = [{ m: "ala", id: "r0OH" }, { m: "ala", id: "r0HO" }, { m: "gly", id: "r0Hb" }];
            this.bedoem(true);
            return;
        }
        if (this.fase === "ende") { this.serinVed = "C"; this.bedoem(true); return; }
        if (this.fase === "spm") { this.valgt = this.trin.rigtig; this.bedoem(true); return; }
        if (this.fase === "byg") { this.grebPerle = null; this.auto = { t: AUTO }; }
    };

    /* ----- Trin 4: perlerne ---------------------------------------------------------------- */
    P.naesteId = function () { return D.OPSKRIFT[this.antalPerler]; };

    P.saetPerle = function (b, auto) {
        b.brugt = true;
        var fra = b.pos ? { x: b.pos.x, y: b.pos.y } : this.bakkePos(b.i);
        var j = this.antalPerler;
        this.antalPerler++;
        this.perleGlid = { j: j, fra: fra, t: 0 };
        var p1 = this.perlePos(j - 1), p2 = this.perlePos(j);
        this.flyv.push({ fra: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }, t: -0.25 });
        if (this.antalPerler >= D.OPSKRIFT.length) {
            this.grebPerle = null;
            this.auto = null;
            this.loes(!!auto, this.trin.forkl);
        }
    };

    /* ----- Tiden ---------------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var mig = this;
        if (this.reak) {
            this.reak.t += dt;
            var r = this.reak;
            this.gab = GAB * (1 - NK.blod((r.t - 0.7) / 1.0));
            if (r.t >= 1.55 && !r.flyver) { r.flyver = true; this.flyv.push({ fra: this.vandMoede(), t: 0 }); }
            if (r.t >= REAK) { this.reak = null; this.gab = 0; this.efterReak = true; }
        }
        if (this.haeft) {
            this.haeft.t += dt;
            if (this.haeft.t >= 0.75 && !this.haeft.flyver) {
                this.haeft.flyver = true;
                var oh = this.kpos(this.kaede.ind.r1OH);
                this.flyv.push({ fra: { x: oh.x, y: oh.y + this.bl * 0.5 }, t: 0 });
            }
            if (this.haeft.t >= HAEFT) {
                this.haeft = null;
                this.serinPaa = true;
                this.kaede = Fm.kaede(["ala", "gly", "ser"]);
            }
        }
        if (this.morf) {
            this.morf.t += dt;
            if (this.morf.t >= MORF) { this.morf = null; this.visKort(); this.visKnap(); }
        }
        if (this.perleGlid) {
            this.perleGlid.t += dt;
            if (this.perleGlid.t >= 0.35) this.perleGlid = null;
        }
        if (this.auto && !this.groen) {
            this.auto.t += dt;
            if (this.auto.t >= AUTO) {
                this.auto.t = 0;
                var id = this.naesteId();
                var b = this.bakke.filter(function (x) { return !x.brugt && x.id === id; })[0];
                if (b) this.saetPerle(b, true);
            }
        }
        this.flyv.forEach(function (f) {
            f.t += dt;
            if (f.t >= FLYV && !f.ankommet) { f.ankommet = true; mig.vand++; }
        });
        this.flyv = this.flyv.filter(function (f) { return !f.ankommet; });
        if (this.blink) { this.blink.t += dt; if (this.blink.t > 0.9) this.blink = null; }
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, L;
        this.vandRad = { x: t.x + 18, y: t.y + t.h - 22 };
        var bund = 44;
        var fri;
        if (this.trinNr === 0) {
            L = Math.min((t.b - 30) / 9.4, (t.h - bund - 16) / 4.3, 98);
            this.bl = L;
            fri = Math.max(0, (t.h - bund - 16 - 4.3 * L) / 2);
            this.o = { x: t.x + t.b / 2 - 3.65 * L, y: t.y + 10 + fri + 1.45 * L };
        } else if (this.trinNr === 1) {
            L = Math.min((t.b - 30) / 10.6, (t.h - bund - 12) / 8.1, 90);
            this.bl = L;
            fri = Math.max(0, (t.h - bund - 12 - 8.1 * L) / 2);
            this.o = { x: t.x + t.b / 2 - 3.8 * L, y: t.y + 8 + fri + 1.75 * L };
            this.bakkeC = { x: t.x + t.b / 2, y: this.o.y + 4.35 * L };
        } else {
            L = Math.min((t.b - 30) / 10.4, (t.h - bund - 12) / 4.6, 90);
            this.bl = L;
            fri = Math.max(0, (t.h - bund - 12 - 4.6 * L) / 2);
            this.o = { x: t.x + t.b / 2 - 3.75 * L, y: t.y + 8 + fri + 1.75 * L };
        }
        this.fs = Math.round(NK.klamp(L * 0.37, 13, 32));
        /* Perlerne i trin 4 */
        var dx = Math.min((t.b - 70) / 8.2, 86);
        this.pr = Math.round(NK.klamp(dx * 0.36, 16, 28));
        this.perle0 = { x: t.x + t.b / 2 - 3.5 * dx, y: t.y + Math.max(70, t.h * 0.36), dx: dx, dy: Math.min(dx * 0.3, 20) };
        this.opskriftY = t.y + 24;
        this.bakkeY = Math.min(t.y + t.h - bund - this.pr - 16, this.perle0.y + this.perle0.dy + this.pr * 2 + 46);
        this.saetAnker("formel", t.x + 10, t.y + 6, t.b - 20, t.h - bund - 12);
        this.saetAnker("vand", t.x + 8, t.y + t.h - 40, Math.min(t.b - 16, 520), 34);
    };

    P.kpos = function (a) { return { x: this.o.x + a.x * this.bl, y: this.o.y + a.y * this.bl }; };

    P.perlePos = function (j) {
        var p = this.perle0;
        return { x: p.x + j * p.dx, y: p.y + (j % 2 ? p.dy : -p.dy) };
    };

    P.bakkePos = function (i) {
        var t = this.lay.tavle, n = D.BAKKE.length, sp = Math.min(this.pr * 3, (t.b - 60) / n);
        return { x: t.x + t.b / 2 + (i - (n - 1) / 2) * sp, y: this.bakkeY };
    };

    /* Hvor vandet samles i trin 1 (under reaktionsstedet) */
    P.vandMoede = function () {
        var c = this.kpos(this.ala.ind.r0C);
        return { x: c.x + 1.3 * this.bl, y: c.y + 2.25 * this.bl };
    };

    P.vandPladsX = function (i) {
        var bw = this.fs * 2.6 + 8;
        return this.vandRad.x + 128 + i * bw + bw / 2;
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.atomerT0 = function () {
        var ud = [], mig = this;
        ["ala", "gly"].forEach(function (m) {
            var mol = mig[m];
            mol.atomer.forEach(function (a) { if (a.vis) ud.push({ m: m, a: a, p: mig.posT0(m, a) }); });
        });
        return ud;
    };

    P.atomVedT0 = function (pt) {
        var bedst = null, bd = Math.pow(this.fs * 0.85, 2);
        this.atomerT0().forEach(function (x) {
            var d = (x.p.x - pt.x) * (x.p.x - pt.x) + (x.p.y - pt.y) * (x.p.y - pt.y);
            if (d < bd) { bd = d; bedst = x; }
        });
        return bedst;
    };

    P.zoner = function () {
        var sid = this.kaede.rester.length - 1;
        var n = this.kpos(this.kaede.ind.r0N), c = this.kpos(this.kaede.ind["r" + sid + "OH"]), r = this.bl * 0.78;
        return { N: { x: n.x - 1.3 * this.bl, y: n.y + 0.1 * this.bl, r: r }, C: { x: c.x + 1.05 * this.bl, y: c.y + 0.15 * this.bl, r: r } };
    };

    function inde(z, pt, m) { return z && pt && Math.hypot(pt.x - z.x, pt.y - z.y) < z.r + (m || 0); }

    P.serinKasse = function () {
        var c = this.bakkeC, L = this.bl;
        return { x: c.x - 1.9 * L, y: c.y - 1.6 * L, w: 3.8 * L, h: 3.4 * L };
    };

    P.perleVed = function (pt) {
        var mig = this, r = this.pr + 4;
        var ud = null;
        this.bakke.forEach(function (b) {
            if (b.brugt) return;
            var p = mig.bakkePos(b.i);
            if (Math.hypot(pt.x - p.x, pt.y - p.y) < r) ud = b;
        });
        return ud;
    };

    P.overScene = function (pt) {
        if (!pt || this.groen) return null;
        if (this.fase === "vand" && !this.reak) {
            var x = this.atomVedT0(pt);
            if (x) return x.a.el === "O" || x.a.el === "H" ? "pointer" : "not-allowed";
        }
        if (this.fase === "ende" && !this.haeft) {
            var k = this.serinKasse();
            if (pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y && pt.y < k.y + k.h) return "grab";
        }
        if (this.fase === "byg" && !this.morf && !this.auto && this.perleVed(pt)) return "grab";
        return null;
    };

    P.nedScene = function (pt) {
        if (this.groen || this.reak || this.haeft || this.morf) return false;
        if (this.fase === "ende") {
            var k = this.serinKasse();
            if (pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y && pt.y < k.y + k.h) {
                this.grebSerin = { x: pt.x, y: pt.y, dx: pt.x - this.bakkeC.x, dy: pt.y - this.bakkeC.y };
                this.serinVed = null;
                this.nulstilHjaelp();
                this.besked("", "");
                return true;
            }
        }
        if (this.fase === "byg" && !this.auto) {
            var b = this.perleVed(pt);
            if (b) {
                var p = this.bakkePos(b.i);
                this.grebPerle = { b: b, x: pt.x, y: pt.y, dx: pt.x - p.x, dy: pt.y - p.y };
                return true;
            }
        }
        return false;
    };

    P.flytScene = function (pt) {
        if (this.grebSerin) { this.grebSerin.x = pt.x; this.grebSerin.y = pt.y; this.visIndsend(); }
        if (this.grebPerle) { this.grebPerle.x = pt.x; this.grebPerle.y = pt.y; }
    };

    P.opScene = function (pt) {
        if (this.grebSerin) {
            var g = this.grebSerin, z = this.zoner();
            var c = { x: g.x - g.dx, y: g.y - g.dy };
            this.grebSerin = null;
            if (inde(z.C, c, this.bl) || inde(z.C, pt, this.bl * 0.4)) this.serinVed = "C";
            else if (inde(z.N, c, this.bl) || inde(z.N, pt, this.bl * 0.4)) this.serinVed = "N";
            else this.kortBesked("Slip serin ved en af enderne af kæden.", 3.5);
            this.visKort();
            return;
        }
        if (this.grebPerle) {
            var gp = this.grebPerle, b = gp.b, midt = { x: gp.x - gp.dx, y: gp.y - gp.dy };
            this.grebPerle = null;
            var maal = this.perlePos(this.antalPerler), nZ = this.perlePos(0);
            nZ = { x: nZ.x - this.perle0.dx, y: nZ.y + this.perle0.dy };
            var r = this.pr * 1.7;
            if (Math.hypot(midt.x - maal.x, midt.y - maal.y) < r) {
                if (b.id === this.naesteId()) {
                    b.pos = midt;
                    this.besked("", "");
                    this.saetPerle(b, false);
                } else {
                    this.fejl = true;
                    this.blink = { i: b.i, t: 0 };
                    this.fejlLinje(D.flet(this.trin.fejlForkert, { rigtig: D.navn(this.naesteId()), valgt: D.navn(b.id) }));
                }
            } else if (Math.hypot(midt.x - nZ.x, midt.y - nZ.y) < r) {
                this.blink = { i: b.i, t: 0 };
                this.fejlLinje(this.trin.fejlEnde);
            } else {
                this.kortBesked("Slip aminosyren ved C-enden af kæden til højre.", 3.5);
            }
        }
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "vand" && !this.reak) {
            var x = this.atomVedT0(pt);
            if (!x) return;
            if (x.a.el !== "O" && x.a.el !== "H") { this.kortBesked(this.trin.fejlCN, 3.5); return; }
            var i = -1;
            this.valgtAtomer.forEach(function (v, j) { if (v.m === x.m && v.id === x.a.id) i = j; });
            if (i >= 0) this.valgtAtomer.splice(i, 1);
            else this.valgtAtomer.push({ m: x.m, id: x.a.id });
            this.besked("", "");
            this.visKort();
            return;
        }
        if (this.fase === "spm") this.kortBlink();
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    /* Atomernes plads i trin 1, ogsaa mens vandet gaar af */
    P.posT0 = function (m, a) {
        var L = this.bl, gab = m === "gly" ? this.gab : 0;
        var p = { x: this.o.x + (a.x + gab) * L, y: this.o.y + a.y * L };
        var r = this.reak;
        if (!r && !this.efterReak) return p;
        if (m === "gly" && a.id === (r ? r.bliver : this.bliverH)) {
            /* Det H, der bliver, glider ned under nitrogenatomet */
            var n = this.gly.ind.r0N, maal = { x: this.o.x + (n.x + gab) * L, y: this.o.y + (n.y + 0.62) * L };
            var u = r ? NK.blod((r.t - 0.7) / 1.0) : 1;
            return { x: p.x + (maal.x - p.x) * u, y: p.y + (maal.y - p.y) * u };
        }
        return p;
    };

    P.erVandAtom = function (m, a) {
        var r = this.reak;
        if (!r && !this.efterReak) return false;
        if (m === "ala") return a.id === "r0OH" || a.id === "r0HO";
        return a.id === (r ? r.ud : this.udH);
    };

    P.tegn = function () {
        var c = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;          /* fanen er skjult og har ingen bredde */
        T.tavle(c, lay);
        if (this.trinNr === 0) this.tegnT0(c);
        else if (this.trinNr === 1) this.tegnT1(c);
        else if (this.trinNr === 2) this.tegnKaede(c, 1);
        else this.tegnT3(c);
        this.tegnVand(c);
        this.tegnSejr(c, t);
    };

    /* Trin 1: alanin og glycin med alle H paa aminogrupperne og OH-grupperne */
    P.tegnT0 = function (c) {
        var mig = this, fs = this.fs, L = this.bl, r = this.reak;
        if (r) { this.bliverH = r.bliver; this.udH = r.ud; }
        /* De to grupper, der reagerer (det, kortet taler om) */
        if (this.fase === "vand" && !r && !this.efterReak && !this.groen) {
            var kA = this.kasseAf("ala", ["r0C", "r0O", "r0OH", "r0HO"]), kG = this.kasseAf("gly", ["r0N", "r0Ha", "r0Hb"]);
            T.gulRamme(c, kA.x, kA.y, kA.w, kA.h, 10, 0.7);
            T.gulRamme(c, kG.x, kG.y, kG.w, kG.h, 10, 0.7);
        }
        /* Peptidbindingens kasse */
        var nyA = r ? NK.klamp((r.t - 1.6) / 0.5, 0, 1) : (this.efterReak ? 1 : 0);
        if (nyA > 0) {
            var kc = this.posT0("ala", this.ala.ind.r0C), ko = this.posT0("ala", this.ala.ind.r0O), kn = this.posT0("gly", this.gly.ind.r0N);
            var hb = this.posT0("gly", this.gly.ind[this.bliverH || "r0Ha"]);
            this.peptidKasse(c, Math.min(kc.x, kn.x) - 0.42 * L, Math.min(ko.y, kc.y) - 0.42 * L, Math.abs(kn.x - kc.x) + 0.84 * L, Math.max(hb.y, kn.y) - Math.min(ko.y, kc.y) + 0.84 * L, nyA);
        }
        ["ala", "gly"].forEach(function (m) {
            var mol = mig[m];
            Fm.tegn(c, mol, function (a) { return mig.posT0(m, a); }, fs, {
                alfa: function (a) { return mig.erVandAtom(m, a) ? 0 : 1; },
                farve: function (a) {
                    var v = mig.valgtAtomer.some(function (x) { return x.m === m && x.id === a.id; });
                    return v ? T.VALG : null;
                }
            });
        });
        /* Ringene om de valgte atomer */
        this.valgtAtomer.forEach(function (v) {
            var p = mig.posT0(v.m, mig.atomAf(v));
            T.ring(c, p.x, p.y, fs * 0.62, T.VALG, "rgba(47, 111, 222, 0.10)", 2.2);
        });
        /* Den nye binding mellem C og N */
        if (nyA > 0) {
            var pc = this.posT0("ala", this.ala.ind.r0C), pn = this.posT0("gly", this.gly.ind.r0N);
            var dx = pn.x - pc.x, dy = pn.y - pc.y, l = Math.hypot(dx, dy);
            if (l > fs * 0.6) {
                c.save();
                c.globalAlpha *= nyA;
                c.strokeStyle = D.FARVE.groen;
                c.lineWidth = Math.max(2.2, fs * 0.15);
                c.lineCap = "round";
                c.beginPath(); c.moveTo(pc.x, pc.y); c.lineTo(pn.x - dx / l * fs * 0.5, pn.y - dy / l * fs * 0.5); c.stroke();
                c.restore();
            }
        }
        /* Vandet, mens det samles */
        if (r && r.t < 1.6) this.tegnVandAtomer(c, r.t);
        /* Navnene */
        var yN = this.o.y + 2.05 * L;
        if (this.efterReak || (r && r.t > 1.8)) {
            var a0 = this.posT0("ala", this.ala.ind.r0N), g1 = this.posT0("gly", this.gly.ind.r0OH);
            NK.tekst(c, "dipeptidet Ala-Gly", (a0.x + g1.x) / 2, yN, { font: "800 " + Math.round(fs * 0.85) + "px " + Fm.FONT, farve: D.FARVE.blaek, justering: "center", linje: "middle" });
        } else {
            var pa = this.posT0("ala", this.ala.ind.r0Ca), pg = this.posT0("gly", this.gly.ind.r0C);
            NK.tekst(c, "alanin", pa.x + 0.2 * L, yN, { font: "800 " + Math.round(fs * 0.85) + "px " + Fm.FONT, farve: D.FARVE.blaek, justering: "center", linje: "middle" });
            NK.tekst(c, "glycin", pg.x - 0.1 * L, yN, { font: "800 " + Math.round(fs * 0.85) + "px " + Fm.FONT, farve: D.FARVE.blaek, justering: "center", linje: "middle" });
        }
    };

    P.kasseAf = function (m, ids) {
        var mig = this, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, mol = this[m], pad = this.fs * 0.62;
        ids.forEach(function (id) {
            var p = mig.posT0(m, mol.ind[id]);
            x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
        });
        return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    };

    /* O og de to H samles til et vandmolekyle under reaktionsstedet */
    P.tegnVandAtomer = function (c, tid) {
        var r = this.reak, fs = this.fs, L = this.bl;
        var M = this.vandMoede();
        var fra = [this.posT0("ala", this.ala.ind.r0OH), this.posT0("ala", this.ala.ind.r0HO), this.posT0("gly", this.gly.ind[r.ud])];
        /* posT0 for gly bruger den aktuelle afstand; vandet tager udgangspunkt i starten */
        fra[2] = { x: this.o.x + (this.gly.ind[r.ud].x + GAB) * L, y: this.o.y + this.gly.ind[r.ud].y * L };
        var til = [M, { x: M.x - 0.62 * L, y: M.y - 0.38 * L }, { x: M.x + 0.62 * L, y: M.y - 0.38 * L }];
        var u = NK.blod(tid / 0.9), a = 1 - NK.klamp((tid - 1.15) / 0.4, 0, 1);
        var P2 = fra.map(function (p, i) { return { x: p.x + (til[i].x - p.x) * u, y: p.y + (til[i].y - p.y) * u - Math.sin(u * Math.PI) * 0.4 * L }; });
        c.save();
        c.globalAlpha *= a;
        c.strokeStyle = D.FARVE.groen;
        c.lineWidth = Math.max(2, fs * 0.12);
        if (u > 0.85) {
            [1, 2].forEach(function (i) {
                var dx = P2[i].x - P2[0].x, dy = P2[i].y - P2[0].y, l = Math.hypot(dx, dy);
                c.beginPath(); c.moveTo(P2[0].x + dx / l * fs * 0.5, P2[0].y + dy / l * fs * 0.5); c.lineTo(P2[i].x - dx / l * fs * 0.42, P2[i].y - dy / l * fs * 0.42); c.stroke();
            });
        }
        Fm.tekst(c, "O", P2[0].x, P2[0].y, fs, D.FARVE.groen, "center");
        Fm.tekst(c, "H", P2[1].x, P2[1].y, fs, D.FARVE.groen, "center");
        Fm.tekst(c, "H", P2[2].x, P2[2].y, fs, D.FARVE.groen, "center");
        c.restore();
    };

    P.peptidKasse = function (c, x, y, b, h, alfa) {
        c.save();
        c.globalAlpha *= alfa;
        NK.rundtRekt(c, x, y, b, h, 9);
        c.fillStyle = "rgba(215, 238, 234, 0.85)";
        c.fill();
        c.strokeStyle = D.FARVE.groen;
        c.lineWidth = 1.6;
        c.stroke();
        c.restore();
    };

    /* Peptidbindingernes kasser i en kaede (compakt formel) */
    P.peptidKasser = function (c, mol, pos, alfa) {
        var L = this.bl;
        for (var i = 0; i < mol.rester.length - 1; i++) {
            var C = pos(mol.ind["r" + i + "C"]), O = pos(mol.ind["r" + i + "O"]), N = pos(mol.ind["r" + (i + 1) + "N"]), H = pos(mol.ind["r" + (i + 1) + "H"]);
            var y0 = Math.min(C.y, O.y, N.y, H.y), y1 = Math.max(C.y, O.y, N.y, H.y);
            this.peptidKasse(c, Math.min(C.x, N.x) - 0.4 * L, y0 - 0.4 * L, Math.abs(N.x - C.x) + 0.8 * L, y1 - y0 + 0.8 * L, alfa);
        }
    };

    /* N-enden og C-enden med bogens bloede gloed (b7-peptidkaede) */
    P.tegnEnder = function (c, mol, pos, alfa) {
        var L = this.bl, fs = this.fs, n = mol.rester.length;
        var pN = pos(mol.ind.r0N), pC = pos(mol.ind["r" + (n - 1) + "C"]), pO = pos(mol.ind["r" + (n - 1) + "OH"]), pO2 = pos(mol.ind["r" + (n - 1) + "O"]);
        c.save();
        c.globalAlpha *= alfa === undefined ? 1 : alfa;
        gloedEllipse(c, pN.x - 0.25 * L, pN.y, 0.85 * L, 0.5 * L, "29, 78, 216");
        gloedEllipse(c, (pC.x + pO.x) / 2, (pO2.y + pO.y) / 2, 0.95 * L, 1.0 * L, "169, 50, 38");
        c.restore();
        var top = Math.min(pO2.y, pN.y) - 0.62 * L;
        NK.tekst(c, "N-enden", pN.x - 0.25 * L, Math.min(pN.y - 0.75 * L, top + 0.1 * L), { font: "800 " + Math.round(fs * 0.78) + "px " + Fm.FONT, farve: D.FARVE.nende, justering: "center", linje: "middle" });
        NK.tekst(c, "C-enden", (pC.x + pO.x) / 2 + 0.2 * L, Math.min(pO2.y, pO.y) - 0.62 * L, { font: "800 " + Math.round(fs * 0.78) + "px " + Fm.FONT, farve: D.FARVE.cende, justering: "center", linje: "middle" });
    };

    function gloedEllipse(c, x, y, rx, ry, rgb) {
        c.save();
        c.translate(x, y);
        c.scale(1, ry / rx);
        var g = c.createRadialGradient(0, 0, rx * 0.1, 0, 0, rx);
        g.addColorStop(0, "rgba(" + rgb + ", 0.22)");
        g.addColorStop(1, "rgba(" + rgb + ", 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill();
        c.restore();
    }

    /* Den kompakte kaede (trin 2, 3 og starten af 4) med navnet under */
    P.tegnKaede = function (c, alfa) {
        var mig = this, mol = this.kaede, fs = this.fs, L = this.bl;
        var pos = function (a) { return mig.kpos(a); };
        if (alfa < 0.01) return;
        c.save();
        c.globalAlpha *= alfa;
        this.peptidKasser(c, mol, pos, 1);
        this.tegnEnder(c, mol, pos, 1);
        Fm.tegn(c, mol, pos, fs, { bindFarve: function (b) { return b.peptid ? D.FARVE.groen : null; } });
        var navn = mol.rester.map(D.kort).join("-");
        var x0 = pos(mol.ind.r0N).x, x1 = pos(mol.ind["r" + (mol.rester.length - 1) + "OH"]).x;
        /* I trin 2 staar navnet foerst, naar serin sidder paa (bakken er lige under) */
        if (this.trinNr !== 1 || this.serinPaa) NK.tekst(c, (mol.rester.length === 3 ? "tripeptidet " : "dipeptidet ") + navn, (x0 + x1) / 2, this.o.y + 2.75 * L,
            { font: "800 " + Math.round(fs * 0.85) + "px " + Fm.FONT, farve: D.FARVE.blaek, justering: "center", linje: "middle" });
        c.restore();
    };

    /* Trin 2: Ala-Gly og serin paa bakken */
    P.tegnT1 = function (c) {
        var mig = this, L = this.bl, fs = this.fs, h = this.haeft;
        var z = this.zoner();
        if (this.serinPaa) { this.tegnKaede(c, 1); return; }
        if (!h) {
            /* Enderne, man kan slippe serin ved */
            var holder = !!this.grebSerin;
            ["N", "C"].forEach(function (e) {
                var zz = z[e], valgt = mig.serinVed === e, fk = !!mig.forkert[e];
                var farve = fk ? T.FORKERT : (valgt ? T.VALG : T.GUL);
                if (holder || valgt || fk) T.ring(c, zz.x, zz.y, zz.r, farve, valgt ? "rgba(47, 111, 222, 0.10)" : (holder ? "rgba(242, 197, 61, 0.14)" : null), 2.4, !valgt);
                if (valgt) T.perle(c, zz.x, zz.y, Math.min(zz.r * 0.7, 26), "Ser", {});
            });
        }
        this.tegnKaede(c, 1);
        /* Glycins OH-gruppe gaar af, naar serin saettes paa */
        if (h) {
            var u = NK.blod(h.t / 0.9);
            var pos0 = function (a) {
                var bak = { x: mig.bakkeC.x - 6.5 * L + a.x * L, y: mig.bakkeC.y - 0.5 * L + a.y * L };
                var paa = mig.kpos(a);
                return { x: bak.x + (paa.x - bak.x) * u, y: bak.y + (paa.y - bak.y) * u };
            };
            /* Daek glycins OH, mens det gaar af */
            var oh = this.kpos(this.kaede.ind.r1OH);
            c.save();
            c.fillStyle = "#f5f7f6";
            c.globalAlpha = NK.klamp((h.t - 0.5) / 0.3, 0, 1);
            c.fillRect(oh.x - 0.55 * L, oh.y - 0.45 * L, 1.2 * L, 0.9 * L);
            c.restore();
            Fm.tegn(c, this.ser, pos0, fs, {});
            if (h.t > 0.9) {
                var C = this.kpos(this.kaede.ind.r1C), Ns = pos0(this.ser.ind.r0N);
                c.save();
                c.globalAlpha *= NK.klamp((h.t - 0.9) / 0.3, 0, 1);
                c.strokeStyle = D.FARVE.groen;
                c.lineWidth = Math.max(2.2, fs * 0.15);
                c.lineCap = "round";
                c.beginPath(); c.moveTo(C.x, C.y); c.lineTo(C.x + (Ns.x - C.x) * 0.62, C.y + (Ns.y - C.y) * 0.62); c.stroke();
                c.restore();
            }
            return;
        }
        /* Serin paa bakken eller i haanden */
        var gb = this.grebSerin, cx = this.bakkeC.x, cy = this.bakkeC.y;
        if (gb) { cx = gb.x - gb.dx; cy = gb.y - gb.dy; }
        var pos = function (a) { return { x: cx - 6.5 * L + a.x * L, y: cy - 0.5 * L + a.y * L }; };
        c.save();
        if (this.serinVed) c.globalAlpha *= 0.4;
        if (gb) { c.shadowColor = "rgba(0,0,0,0.2)"; c.shadowBlur = 10; }
        Fm.tegn(c, this.ser, pos, fs, {});
        c.restore();
        NK.tekst(c, "serin", cx, cy + 1.95 * L, { font: "800 " + Math.round(fs * 0.85) + "px " + Fm.FONT, farve: D.FARVE.blaek, justering: "center", linje: "middle" });
        if (!gb && !this.serinVed && !this.groen) T.skilt(c, cx - 1.2 * L, cy - 1.25 * L, "Træk serin", { min: this.lay.tavle.x + 6, maks: this.lay.tavle.x + this.lay.tavle.b - 6 });
    };

    /* Trin 4: formlen bliver til perler, opskriften og bakken */
    P.tegnT3 = function (c) {
        var mig = this, m = this.morf, t = this.lay.tavle, L = this.bl;
        var n = this.antalPerler;
        if (m) {
            var u1 = NK.klamp(m.t / 0.55, 0, 1), u2 = NK.blod((m.t - 0.55) / (MORF - 0.55));
            this.tegnKaede(c, 1 - u1);
            for (var j = 0; j < 3; j++) {
                var a = this.kpos(this.kaede.ind["r" + j + "Ca"]), b = this.perlePos(j);
                var p = { x: a.x + (b.x - a.x) * u2, y: a.y + (b.y - a.y) * u2 };
                if (j > 0) {
                    var q0 = this.kpos(this.kaede.ind["r" + (j - 1) + "Ca"]), q1 = this.perlePos(j - 1);
                    var q = { x: q0.x + (q1.x - q0.x) * u2, y: q0.y + (q1.y - q0.y) * u2 };
                    this.stang(c, q, p, u1);
                }
            }
            for (j = 0; j < 3; j++) {
                var a2 = this.kpos(this.kaede.ind["r" + j + "Ca"]), b2 = this.perlePos(j);
                T.perle(c, a2.x + (b2.x - a2.x) * u2, a2.y + (b2.y - a2.y) * u2, this.pr * (0.4 + 0.6 * u1), D.kort(D.OPSKRIFT[j]), { alfa: u1 });
            }
            return;
        }
        /* Opskriften */
        this.tegnOpskrift(c);
        /* Kaeden */
        var glid = this.perleGlid;
        for (var i = 1; i < n; i++) {
            var p0 = this.perlePos(i - 1), p1 = this.perlePos(i);
            if (glid && glid.j === i) {
                var w = NK.blod(glid.t / 0.35);
                p1 = { x: glid.fra.x + (p1.x - glid.fra.x) * w, y: glid.fra.y + (p1.y - glid.fra.y) * w };
            }
            this.stang(c, p0, p1, 1);
        }
        for (i = 0; i < n; i++) {
            var pp = this.perlePos(i);
            if (glid && glid.j === i) {
                var w2 = NK.blod(glid.t / 0.35);
                pp = { x: glid.fra.x + (pp.x - glid.fra.x) * w2, y: glid.fra.y + (pp.y - glid.fra.y) * w2 };
            }
            T.perle(c, pp.x, pp.y, this.pr, D.kort(D.OPSKRIFT[i]), {});
        }
        var fs = this.fs, fsE = Math.round(NK.klamp(fs * 0.78, 12, 17));
        var pf = this.perlePos(0), pl = this.perlePos(Math.max(0, n - 1));
        NK.tekst(c, "N-enden", pf.x, pf.y - this.pr - 14, { font: "800 " + fsE + "px " + Fm.FONT, farve: D.FARVE.nende, justering: "center", linje: "middle" });
        if (n < D.OPSKRIFT.length) {
            /* Pladsen til den naeste perle */
            var nx = this.perlePos(n), holder = !!this.grebPerle;
            T.ring(c, nx.x, nx.y, this.pr + 3, holder ? T.GUL : "#9aa3ae", holder ? "rgba(242, 197, 61, 0.16)" : "rgba(255,255,255,0.5)", holder ? 2.6 : 1.6, true);
        }
        NK.tekst(c, "C-enden", pl.x, pl.y + (n % 2 === 0 ? -1 : 1) * 0 + (((n - 1) % 2) ? this.pr + 16 : -this.pr - 14), { font: "800 " + fsE + "px " + Fm.FONT, farve: D.FARVE.cende, justering: "center", linje: "middle" });
        /* Bakken */
        if (n < D.OPSKRIFT.length) {
            NK.tekst(c, "Bakken", t.x + 18, this.bakkeY, { font: "700 13px " + Fm.FONT, farve: T.DAEMPET, linje: "middle" });
            this.bakke.forEach(function (b) {
                if (b.brugt) return;
                var gb = mig.grebPerle && mig.grebPerle.b === b;
                if (gb) return;
                var p = mig.bakkePos(b.i), bl = mig.blink && mig.blink.i === b.i ? Math.sin(mig.blink.t * 18) > 0 : false;
                T.perle(c, p.x, p.y, mig.pr, D.kort(b.id), bl ? { kant: T.FORKERT, fyld: "#f6c9c4" } : {});
            });
            if (this.grebPerle) {
                var g = this.grebPerle;
                T.perle(c, g.x - g.dx, g.y - g.dy, this.pr, D.kort(g.b.id), { greb: true });
            }
            if (!this.grebPerle && !this.groen && !this.auto && n === 3) {
                var nb = this.bakke.filter(function (b) { return !b.brugt && b.id === mig.naesteId(); })[0];
                if (nb) { var bp = this.bakkePos(nb.i); T.skilt(c, bp.x, bp.y - this.pr - 2, "Træk " + D.kort(nb.id), { min: t.x + 6, maks: t.x + t.b - 6 }); }
            }
        }
        void L;
    };

    P.stang = function (c, a, b, alfa) {
        c.save();
        c.globalAlpha *= alfa;
        c.strokeStyle = D.FARVE.groen;
        c.lineWidth = Math.max(3, this.pr * 0.22);
        c.lineCap = "round";
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        c.restore();
    };

    P.tegnOpskrift = function (c) {
        var t = this.lay.tavle, n = this.antalPerler, y = this.opskriftY, mig = this;
        var str = t.b < 620 ? 13 : 14;
        var tekster = D.OPSKRIFT.map(D.kort);
        var bredder = tekster.map(function (s) { return T.brikMaal(c, s, str); });
        var mel = 12, foran = "Opskrift:";
        c.save(); c.font = "800 " + str + "px " + Fm.FONT; var fb = c.measureText(foran).width + 12; c.restore();
        var tot = fb + bredder.reduce(function (a, b) { return a + b; }, 0) + mel * (tekster.length - 1);
        var x = t.x + t.b / 2 - tot / 2;
        NK.tekst(c, foran, x, y + 1, { font: "800 " + str + "px " + Fm.FONT, farve: T.DAEMPET, linje: "middle" });
        x += fb;
        tekster.forEach(function (s, i) {
            var b = bredder[i];
            T.brik(c, x + b / 2, y, s, { str: str, rigtig: i < n, gul: i === n && !mig.groen });
            x += b + mel;
            void mig;
        });
    };

    /* Raekken med det fraspaltede vand nederst paa tavlen */
    P.tegnVand = function (c) {
        var mig = this, fs = Math.round(NK.klamp(this.fs * 0.62, 12, 15));
        var y = this.vandRad.y;
        if (this.vand > 0 || this.flyv.length) {
            NK.tekst(c, "Fraspaltet vand:", this.vandRad.x, y + 1, { font: "700 13px " + Fm.FONT, farve: T.DAEMPET, linje: "middle" });
        }
        for (var i = 0; i < this.vand; i++) T.vand(c, this.vandPladsX(i), y, fs);
        this.flyv.forEach(function (f) {
            if (f.t < 0) return;
            var u = NK.blod(f.t / FLYV), til = { x: mig.vandPladsX(mig.vand), y: y };
            var x = f.fra.x + (til.x - f.fra.x) * u, yy = f.fra.y + (til.y - f.fra.y) * u - Math.sin(u * Math.PI) * 30;
            T.vand(c, x, yy, fs + (1 - u) * 3, Math.min(1, f.t / 0.15));
        });
    };

    NK.SimPeptid = SimPeptid;
}());
