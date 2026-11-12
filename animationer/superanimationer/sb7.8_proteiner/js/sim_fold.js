/* =====================================================================
   sim_fold.js - fane 2: Foldningen

   Fire trin (D.FOLD):
     1 hbind     to stykker kaede som i bogens b7-hbinding-kaeder: eleven
                 traekker fra H til O og tegner de seks hydrogenbindinger,
                 og trykker Indsend svar. Saa bliver kaederne til pilene i
                 et β-foldeblad.
     2 helix     eleven skubber enden af en lige kaede mod venstre, til den
                 er snoet helt; hydrogenbindingerne kommer mellem
                 vindingerne, og kortet spoerger, hvad der holder den sammen.
     3 tertiaer  spiralen traekkes ned over foldebladet, sidekaederne moedes,
                 og de fire bindinger dannes; eleven giver dem navne.
     4 spm       haemoglobin: hvilket niveau er placeringen af fire kaeder?
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fane;
    var T = NK.Tegning;
    var Fm = NK.Formel;
    var Pr = NK.Protein;
    var NOEGLE = "nk-sb7.8-fold";

    var BLAD = 1.1;          /* formlen bliver til pile */
    var NT = 5;              /* vindinger i den store spiral */
    var HB = 0.9;            /* hydrogenbindingerne i spiralen kommer */
    var DANNES = 0.45;       /* tid mellem de fire bindinger i trin 3 */
    var SAML = 1.6;          /* de fire kaeder samles */

    function SimFold() {
        var mig = this;
        this.trinListe = D.FOLD;
        this.hentStatus();
        this.startFane();
        NK.el("f-forfra").addEventListener("click", function () { mig.forfra(); });
    }

    var P = SimFold.prototype;
    F.paa(P, "f");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };

    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(t.navn) + "</span></li>";
        });
        NK.saetHTML("f-trin", html);
        NK.saetTekst("f-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
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
        this.besked("", "");
        this.blad = null;
        this.traek = null;
        this.valgtAtom = null;
        this.hold = null;
        this.view = null;
        if (j === 0) {
            this.fase = "hbind";
            this.mol = Fm.strenge();
            this.linjer = [];
        } else if (j === 1) {
            this.fase = "traek";
            this.w = 0;
            this.wMaal = null;
            this.hbT = 0;
            this.holdt = false;
        } else if (j === 2) {
            this.fase = "fold";
            this.dy = Pr.G.DY0;
            this.dyMaal = null;
            this.dannet = [0, 0, 0, 0];
            this.dannesT = null;
            this.navne = [null, null, null, null];
            this.gulJ = 0;
            this.forkertJ = {};
        } else {
            this.fase = "spm";
            this.saml = null;
        }
        this.nulstilHjaelp();
        this.layout();
        this.visKort();
        this.visListe();
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "traek") return { slags: "opgave", chip: chip, tekst: t.traekTekst };
        if (this.fase === "fold") return { slags: "opgave", chip: chip, tekst: t.foldTekst };
        if (this.fase === "navne") {
            if (this.groen) return { slags: "spm", chip: chip, tekst: t.tekst };
            if (this.dannesT !== null) return { slags: "opgave", chip: chip, tekst: "Sidekæderne mødes, og der dannes fire bindinger mellem dem." };
            var nu = this.navne[this.gulJ];
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     svar: t.navne.map(function (n) { return { t: n, valgt: nu === n }; }) };
        }
        if (this.fase === "spm") {
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fase === "traek" || this.fase === "fold" || (this.fase === "navne" && this.dannesT !== null); };
    P.skjulHint = function () { return (this.fase === "navne" && this.dannesT !== null) || !!this.blad; };

    P.svarValg = function (j) {
        if (this.fase === "spm") { this.valgt = this.valgt === j ? null : j; this.visKort(); return; }
        if (this.fase === "navne" && this.dannesT === null) {
            this.navne[this.gulJ] = this.trin.navne[j];
            delete this.forkertJ[this.gulJ];
            this.besked("", "");
            /* Videre til den naeste binding uden navn */
            for (var d = 1; d <= 4; d++) {
                var i = (this.gulJ + d) % 4;
                if (!this.navne[i]) { this.gulJ = i; break; }
            }
            this.visKort();
        }
    };

    P.antalUdenNavn = function () { return this.navne.filter(function (n) { return !n; }).length; };

    P.kanSendes = function () {
        if (this.fase === "hbind") return this.linjer.length > 0 && !this.blad;
        if (this.fase === "spm") return this.valgt !== null;
        if (this.fase === "navne") return this.dannesT === null && this.antalUdenNavn() < 4;
        return false;
    };

    P.indsendTekst = function () {
        if (this.fase === "hbind" && this.linjer.length) return "Indsend svar: " + D.antalTekst(this.linjer.length, "hydrogenbinding", "hydrogenbindinger");
        if (this.fase === "spm" && this.valgt !== null) return "Indsend svar: " + this.trin.svar[this.valgt];
        if (this.fase === "navne") return "Indsend svar: " + (4 - this.antalUdenNavn()) + " af 4 navne";
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.fase === "hbind") return this.trin.fejlIntet;
        if (this.fase === "navne") return this.trin.fejlIntet;
        return "Vælg et af svarene på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    /* Er linjen et af de seks par? */
    P.erPar = function (l) {
        return this.mol.par.some(function (p) { return p[0] === l.h && p[1] === l.o; });
    };

    P.bedoem = function (vist) {
        var t = this.trin, mig = this;
        if (this.fase === "hbind") {
            var skaeve = this.linjer.filter(function (l) { return !mig.erPar(l); });
            if (skaeve.length) {
                this.fejl = true;
                this.linjer = this.linjer.filter(function (l) { return mig.erPar(l); });
                this.fejlLinje(t.fejlSkaev);
                return;
            }
            var mangler = this.mol.par.length - this.linjer.length;
            if (mangler > 0) {
                this.fejl = true;
                this.fejlLinje(D.flet(t.fejlMangler, { antal: D.antalTekst(mangler, "hydrogenbinding", "hydrogenbindinger") }));
                return;
            }
            this.blad = { t: 0 };
            this.loes(vist, t.forkl);
            return;
        }
        if (this.fase === "spm") {
            var v = this.valgt;
            if (v !== t.rigtig) {
                this.fejl = true;
                this.forkert[v] = true;
                this.valgt = null;
                this.visKort();
                this.fejlLinje(t.fejl[v]);
                return;
            }
            if (this.trinNr === 3) this.saml = { t: 0 };
            this.loes(vist, t.forkl, t.rigtig);
            return;
        }
        if (this.fase === "navne") {
            var uden = this.antalUdenNavn();
            if (uden > 0) {
                this.kortBlink();
                this.kortBesked(D.flet(t.fejlMangler, { antal: String(uden) }), 3.5);
                return;
            }
            var forste = -1;
            D.KONTAKTER.forEach(function (k, j) {
                if (mig.navne[j] !== k.navn) {
                    mig.forkertJ[j] = true;
                    if (forste < 0) forste = j;
                }
            });
            if (forste >= 0) {
                this.fejl = true;
                var k = D.KONTAKTER[forste];
                D.KONTAKTER.forEach(function (kk, j) { if (mig.forkertJ[j]) mig.navne[j] = null; });
                this.gulJ = forste;
                this.visKort();
                this.fejlLinje(D.flet(t.fejl[k.id], { nr: forste + 1 }));
                return;
            }
            this.forkertJ = {};
            this.loes(vist, t.forkl);
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
                       knap: sidste ? "Videre til Denaturering →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-f").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        if (NK.visFane) NK.visFane("fane-d");
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen) return [];
        if (this.fase === "traek") return this.trin.traekHint;
        if (this.fase === "fold") return this.trin.foldHint;
        if (this.fase === "navne" && this.dannesT !== null) return [];
        return this.trin.hint;
    };

    P.visSvar = function () {
        var mig = this;
        this.sv = true;
        if (this.fase === "hbind") {
            this.linjer = this.mol.par.map(function (p) { return { h: p[0], o: p[1] }; });
            this.bedoem(true);
            return;
        }
        if (this.fase === "traek") { this.wMaal = 1; this.holdt = true; return; }
        if (this.fase === "fold") { this.dyMaal = 0; this.hold = null; return; }
        if (this.fase === "navne") {
            D.KONTAKTER.forEach(function (k, j) { mig.navne[j] = k.navn; });
            this.bedoem(true);
            return;
        }
        if (this.fase === "spm") { this.valgt = this.trin.rigtig; this.bedoem(true); }
    };

    /* ----- Tiden ---------------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (this.blad) { this.blad.t += dt; if (this.blad.t > BLAD) this.blad.t = BLAD; }
        if (this.trinNr === 1) {
            if (this.wMaal !== null) {
                var fart = 2.2 * dt;
                if (Math.abs(this.wMaal - this.w) <= fart) {
                    this.w = this.wMaal;
                    var maal = this.wMaal;
                    this.wMaal = null;
                    if (maal === 1) this.holdt = true;
                } else this.w += this.wMaal > this.w ? fart : -fart;
            }
            if (this.holdt && this.w >= 1 && this.fase === "traek") {
                this.hbT = Math.min(1, this.hbT + dt / HB);
                if (this.hbT >= 1) {
                    this.fase = "spm";
                    this.nulstilHjaelp();
                    this.visKort();
                }
            }
        }
        if (this.trinNr === 2) {
            if (this.dyMaal !== null) {
                var f2 = 2.6 * dt;
                if (Math.abs(this.dyMaal - this.dy) <= f2) {
                    this.dy = this.dyMaal;
                    var m2 = this.dyMaal;
                    this.dyMaal = null;
                    if (m2 === 0 && this.fase === "fold") {
                        this.fase = "navne";
                        this.dannesT = 0;
                        this.nulstilHjaelp();
                        this.visKort();
                        this.layout();
                    }
                } else this.dy += this.dyMaal > this.dy ? f2 : -f2;
            }
            if (this.dannesT !== null) {
                this.dannesT += dt;
                for (var j = 0; j < 4; j++) this.dannet[j] = NK.klamp((this.dannesT - j * DANNES) / 0.35, 0, 1);
                if (this.dannesT >= 3 * DANNES + 0.6) {
                    this.dannesT = null;
                    this.dannet = [1, 1, 1, 1];
                    this.nulstilHjaelp();
                    this.visKort();
                }
            }
        }
        if (this.saml) { this.saml.t += dt; if (this.saml.t > SAML) this.saml.t = SAML; }
        /* Kameraet glider blødt til det nye udsnit */
        if (this.view && this.viewMaal) {
            this.view.cx = NK.mod(this.view.cx, this.viewMaal.cx, 6, dt);
            this.view.cy = NK.mod(this.view.cy, this.viewMaal.cy, 6, dt);
            this.view.s = NK.mod(this.view.s, this.viewMaal.s, 6, dt);
        }
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x + 10, t.y + 6, t.b - 20, t.h - 12);
        if (this.trinNr === 0) {
            var L = Math.min((t.b - 40) / 10.2, (t.h - 50) / 4.3, 96);
            this.bl = L;
            this.fs = Math.round(NK.klamp(L * 0.34, 13, 30));
            this.o = { x: t.x + t.b / 2 - 4 * L, y: t.y + t.h / 2 - 1.15 * L - 4 };
        } else if (this.trinNr === 1) {
            this.spLaengde = Math.min(t.b - 150, 700);
            this.spX0 = t.x + (t.b - this.spLaengde) / 2 - 10;
            this.spY = t.y + t.h / 2 + 8;
        } else if (this.trinNr === 2) {
            var vm = this.viewFor();
            this.viewMaal = vm;
            if (!this.view) this.view = { cx: vm.cx, cy: vm.cy, s: vm.s };
        } else {
            var s4 = Math.min(t.b / 26, t.h / 14);
            this.s4 = s4;
            this.mid = { x: t.x + t.b / 2, y: t.y + t.h / 2 };
        }
    };

    /* Udsnittet, der viser proteinet (og navnene under det, naar de skal bruges) */
    P.viewFor = function () {
        var t = this.lay.tavle, G = Pr.G;
        var foldet = this.fase !== "fold";
        var y0 = foldet ? G.HY - G.HR - 0.55 : G.HY + G.DY0 - G.HR - 0.55, y1 = G.S2Y + (foldet ? 1.75 : 0.85);
        var x0 = -4.5, x1 = 4.75;
        var s = Math.min((t.b - 24) / (x1 - x0), (t.h - 16) / (y1 - y0), 110);
        return { cx: t.x + t.b / 2 - (x0 + x1) / 2 * s, cy: t.y + 8 + (t.h - 16) / 2 - (y0 + y1) / 2 * s, s: s };
    };

    P.tilstand = function () {
        return { dy: this.dy, d: 0, svag: 1, ss: this.dannet[0] >= 1, dannet: this.dannet, aspQ: -1, lysQ: 1,
                 gul: this.fase === "navne" && this.dannesT === null && !this.groen ? this.gulJ : null,
                 nr: this.fase === "navne", valgt: this.valgtMarker() };
    };

    P.valgtMarker = function () {
        if (this.fase !== "navne" || this.dannesT !== null || this.groen) return null;
        var mig = this, ud = {};
        this.navne.forEach(function (n, j) { if (mig.forkertJ[j]) ud[j] = "forkert"; });
        return ud;
    };

    /* Navnepladserne under proteinet */
    P.pladser = function () {
        var v = this.view, G = Pr.G, mig = this;
        if (!v) return [];
        var str = v.s < 70 ? 13 : 14;
        var maks = T.brikMaal(this.L.ctx, "londonbindinger", str) + 8;
        var forskudt = (Pr.KX[1] - Pr.KX[0]) * v.s < maks;
        var y = v.cy + (G.S2Y + 0.72) * v.s;
        return Pr.KX.map(function (x, j) {
            var r = forskudt && j % 2 ? 1 : 0;
            return { x: v.cx + x * v.s, y: y + r * (str * 2 + 8), b: maks, h: str * 2, str: str, j: j };
            void mig;
        });
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.strengPos = function (a) { return { x: this.o.x + a.x * this.bl, y: this.o.y + a.y * this.bl }; };

    P.atomVedStreng = function (pt) {
        var mig = this, bedst = null, bd = Math.pow(this.fs * 0.9, 2);
        this.mol.atomer.forEach(function (a) {
            if (a.el !== "H" && a.el !== "O") return;
            var p = mig.strengPos(a), d = (p.x - pt.x) * (p.x - pt.x) + (p.y - pt.y) * (p.y - pt.y);
            if (d < bd) { bd = d; bedst = a; }
        });
        return bedst;
    };

    P.linjeVed = function (pt) {
        var mig = this, ud = -1;
        this.linjer.forEach(function (l, i) {
            var a = mig.strengPos(mig.mol.ind[l.h]), b = mig.strengPos(mig.mol.ind[l.o]);
            if (Fm.afstandTilStykke(pt, a, b) < 7) ud = i;
        });
        return ud;
    };

    P.forbind = function (a, b) {
        if (a.id === b.id) return;
        if (a.el === b.el) { this.kortBesked(this.trin.fejlSamme, 3.5); return; }
        if (a.kaede === b.kaede) { this.kortBesked(this.trin.fejlKaede, 3.5); return; }
        var h = a.el === "H" ? a : b, o = a.el === "O" ? a : b;
        for (var i = 0; i < this.linjer.length; i++) {
            if (this.linjer[i].h === h.id || this.linjer[i].o === o.id) {
                if (this.linjer[i].h === h.id && this.linjer[i].o === o.id) { this.linjer.splice(i, 1); this.visKort(); return; }
            }
        }
        /* Et atom har kun én hydrogenbinding: en ny streg fra samme atom afloeser den gamle */
        this.linjer = this.linjer.filter(function (l) { return l.h !== h.id && l.o !== o.id; });
        this.linjer.push({ h: h.id, o: o.id });
        this.besked("", "");
        this.visKort();
    };

    P.overScene = function (pt) {
        if (!pt || this.groen) return null;
        if (this.fase === "hbind") return this.atomVedStreng(pt) ? "crosshair" : (this.linjeVed(pt) >= 0 ? "pointer" : null);
        if (this.fase === "traek") return this.vedHaandtag(pt) ? "grab" : null;
        if (this.fase === "fold" && this.view) {
            var k = Pr.helixKasse(this.dy, this.view);
            return pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y && pt.y < k.y + k.h ? "grab" : null;
        }
        if (this.fase === "navne" && this.dannesT === null) return this.kontaktVed(pt) !== null ? "pointer" : null;
        return null;
    };

    P.vedHaandtag = function (pt) {
        var h = this.haandtag();
        return h && Math.hypot(pt.x - h.x, pt.y - h.y) < 26;
    };

    P.haandtag = function () {
        if (this.trinNr !== 1) return null;
        var sp = Pr.spiral(this.spX0, this.spY, this.spLaengde, this.w, NT);
        var p = sp.pkt[sp.pkt.length - 1];
        return { x: p.x, y: p.y };
    };

    P.kontaktVed = function (pt) {
        if (!this.kasser) return null;
        for (var j = 0; j < this.kasser.length; j++) {
            var k = this.kasser[j];
            if (pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y - 10 && pt.y < k.y + k.h + 10) return j;
        }
        var pl = this.pladser();
        for (j = 0; j < pl.length; j++) {
            if (Math.abs(pt.x - pl[j].x) < pl[j].b / 2 && Math.abs(pt.y - pl[j].y) < pl[j].h / 2 + 2) return j;
        }
        return null;
    };

    P.nedScene = function (pt) {
        if (this.groen) return false;
        if (this.fase === "hbind" && !this.blad) {
            var a = this.atomVedStreng(pt);
            if (a) { this.traek = { fra: a, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y }; return true; }
        }
        if (this.fase === "traek" && this.vedHaandtag(pt)) {
            this.hold = { dx: this.haandtag().x - pt.x };
            this.wMaal = null;
            this.nulstilHjaelp();
            return true;
        }
        if (this.fase === "fold" && this.view && this.dyMaal === null) {
            var k = Pr.helixKasse(this.dy, this.view);
            if (pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y && pt.y < k.y + k.h) {
                this.hold = { y0: pt.y, dy0: this.dy };
                this.nulstilHjaelp();
                return true;
            }
        }
        return false;
    };

    P.flytScene = function (pt) {
        if (this.traek) { this.traek.x = pt.x; this.traek.y = pt.y; return; }
        if (this.fase === "traek" && this.hold) {
            var x = pt.x + this.hold.dx;
            this.w = NK.klamp((this.spX0 + this.spLaengde - x) / (Pr.SPIRAL_KORT * this.spLaengde / 2), 0, 1);
            return;
        }
        if (this.fase === "fold" && this.hold) {
            this.dy = NK.klamp(this.hold.dy0 + (pt.y - this.hold.y0) / this.view.s, Pr.G.DY0 - 0.3, 0.12);
        }
    };

    P.opScene = function (pt) {
        if (this.traek) {
            var tr = this.traek;
            this.traek = null;
            var b = this.atomVedStreng(pt);
            var flyttet = Math.hypot(pt.x - tr.x0, pt.y - tr.y0) > 6;
            if (b && b.id !== tr.fra.id) { this.valgtAtom = null; this.forbind(tr.fra, b); return; }
            if (!flyttet) {
                /* Et klik: vaelg atomet, eller forbind med det valgte */
                if (this.valgtAtom && this.valgtAtom.id !== tr.fra.id) { var v = this.valgtAtom; this.valgtAtom = null; this.forbind(v, tr.fra); }
                else this.valgtAtom = this.valgtAtom && this.valgtAtom.id === tr.fra.id ? null : tr.fra;
            }
            return;
        }
        if (this.fase === "traek" && this.hold) {
            this.hold = null;
            if (this.w >= 0.93) this.wMaal = 1;
            else { this.wMaal = 0; this.holdt = false; if (this.w > 0.08) this.kortBesked(this.trin.tilbage, 3.5); }
            return;
        }
        if (this.fase === "fold" && this.hold) {
            this.hold = null;
            if (Math.abs(this.dy) < 0.38) this.dyMaal = 0;
            else { this.dyMaal = Pr.G.DY0; if (Math.abs(this.dy - Pr.G.DY0) > 0.1) this.kortBesked(this.trin.tilbage, 3.5); }
        }
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "hbind") {
            var i = this.linjeVed(pt);
            if (i >= 0) { this.linjer.splice(i, 1); this.visKort(); }
            return;
        }
        if (this.fase === "navne" && this.dannesT === null) {
            var j = this.kontaktVed(pt);
            if (j !== null) { this.gulJ = j; this.visKort(); }
            return;
        }
        if (this.fase === "spm") this.kortBlink();
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var c = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(c, lay);
        if (this.trinNr === 0) this.tegnBlad(c);
        else if (this.trinNr === 1) this.tegnSpiral(c);
        else if (this.trinNr === 2) this.tegnTertiaer(c);
        else this.tegnKvaternaer(c);
        this.tegnSejr(c, t);
    };

    /* Trin 1: to stykker kaede og hydrogenbindingerne */
    P.tegnBlad = function (c) {
        var mig = this, fs = this.fs, L = this.bl, b = this.blad;
        var u = b ? NK.klamp(b.t / BLAD, 0, 1) : 0;
        var fA = 1 - NK.klamp(u * 1.8, 0, 1), pA = NK.klamp((u - 0.35) / 0.65, 0, 1);
        var pos = function (a) { return mig.strengPos(a); };
        if (fA > 0.01) {
            c.save();
            c.globalAlpha *= fA;
            Fm.tegn(c, this.mol, pos, fs, {
                farve: function (a) {
                    if (mig.valgtAtom && mig.valgtAtom.id === a.id) return T.VALG;
                    return a.farve || null;
                }
            });
            if (this.valgtAtom) { var vp = pos(this.valgtAtom); T.ring(c, vp.x, vp.y, fs * 0.66, T.VALG, "rgba(47, 111, 222, 0.10)", 2.2); }
            c.restore();
        }
        /* Hydrogenbindingerne, eleven har tegnet */
        var kantO = this.o.y + L * 0.42 * 0.55, kantU = this.o.y + this.mol.afst * L - L * 0.42 * 0.55;
        this.linjer.forEach(function (l) {
            var a = pos(mig.mol.ind[l.h]), o = pos(mig.mol.ind[l.o]);
            var dx = o.x - a.x, dy = o.y - a.y, len = Math.hypot(dx, dy);
            var r = fs * 0.5;
            var p1 = { x: a.x + dx / len * r, y: a.y + dy / len * r }, p2 = { x: o.x - dx / len * r, y: o.y - dy / len * r };
            /* Naar kaederne er blevet til pile, naar prikkerne fra pil til pil */
            var op = p1.y < p2.y ? p1 : p2, ned = p1.y < p2.y ? p2 : p1;
            op.y += (kantO + 4 - op.y) * pA;
            ned.y += (kantU - 4 - ned.y) * pA;
            T.hprikker(c, op, ned, { r: Math.max(1.8, fs * 0.13), afst: fs * 0.42 });
        });
        if (this.traek) {
            var f = pos(this.traek.fra);
            c.save();
            c.strokeStyle = "rgba(224, 83, 63, 0.75)";
            c.lineWidth = 2;
            c.setLineDash([3, 5]);
            c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(this.traek.x, this.traek.y); c.stroke();
            c.restore();
        }
        /* Pilene i β-foldebladet */
        if (pA > 0.01) {
            var y0 = this.o.y, y1 = this.o.y + this.mol.afst * L, h = L * 0.42;
            T.strengPil(c, { x: this.o.x - 0.6 * L, y: y0 }, { x: this.o.x + 8.75 * L, y: y0 }, h, { alfa: pA });
            T.strengPil(c, { x: this.o.x + 8.6 * L, y: y1 }, { x: this.o.x - 0.75 * L, y: y1 }, h, { alfa: pA });
            NK.tekst(c, "β-foldeblad", this.o.x + 4 * L, y1 + 1.15 * L, { font: "800 " + Math.round(fs * 0.95) + "px " + Fm.FONT, farve: D.FARVE.groen, justering: "center", linje: "middle" });
        }
        if (!this.linjer.length && !this.traek && !this.groen && !this.valgtAtom) {
            var h0 = pos(this.mol.ind.k0h0);
            T.skilt(c, h0.x, h0.y - fs * 0.7, "Træk fra H til O", { min: this.lay.tavle.x + 6, maks: this.lay.tavle.x + this.lay.tavle.b - 6 });
        }
    };

    /* Trin 2: den store spiral */
    P.tegnSpiral = function (c) {
        var w = this.w, sp = Pr.spiral(this.spX0, this.spY, this.spLaengde, w, NT), pkt = sp.pkt;
        var b = Math.max(10, Math.min(18, this.spLaengde * 0.024));
        var maalX = this.spX0 + this.spLaengde * (1 - Pr.SPIRAL_KORT / 2);
        /* Den stiplede streg, enden skal skubbes hen til */
        if (!this.holdt) {
            c.save();
            c.strokeStyle = T.GUL;
            c.lineWidth = 2;
            c.setLineDash([6, 5]);
            c.beginPath(); c.moveTo(maalX, this.spY - this.spLaengde * 0.11); c.lineTo(maalX, this.spY + this.spLaengde * 0.11); c.stroke();
            c.restore();
        }
        /* Bagerste del lysere, saa forreste */
        var bag = [], i;
        var lys = { moerk: "#2f7d74", farve: "#6cc0b2", lys: "#c6ece5" };
        for (i = 0; i < pkt.length; i++) {
            if (pkt[i].z < -0.05 && w > 0.02) { if (!bag.length && i > 0) bag.push(pkt[i - 1]); bag.push(pkt[i]); }
            else if (bag.length) { bag.push(pkt[i]); T.roer(c, bag, b, lys); bag = []; }
        }
        if (bag.length > 1) T.roer(c, bag, b, lys);
        var front = [];
        for (i = 0; i < pkt.length; i++) {
            if (pkt[i].z >= -0.05 || w <= 0.02) front.push(pkt[i]);
            else if (front.length) { T.roer(c, front, b); front = []; }
        }
        if (front.length > 1) T.roer(c, front, b);
        /* Hydrogenbindingerne mellem vindingerne */
        if (this.hbT > 0) {
            for (var k = 0; k < NT - 1; k++) {
                if (this.hbT < (k + 1) / NT) continue;
                [0.32, 0.68].forEach(function (f) {
                    var phi = 2 * Math.PI * (k + 0.75), t1 = phi / (2 * Math.PI * NT), t2 = (phi + 2 * Math.PI) / (2 * Math.PI * NT);
                    var ax = sp.ax;
                    var x1 = sp.x0 + sp.A * t1 + ax, x2 = sp.x0 + sp.A * t2 + ax;
                    var yy = this.spY - sp.r * (f - 0.5) * 1.1;
                    T.hprikker(c, { x: x1 + b * 0.55, y: yy }, { x: x2 - b * 0.55, y: yy }, { r: 2.4 });
                }, this);
            }
        }
        /* Haandtaget for enden */
        var h = pkt[pkt.length - 1];
        if (!this.holdt && !this.groen) {
            T.ring(c, h.x, h.y, 17, T.GUL, "rgba(242, 197, 61, 0.22)", 3);
            if (!this.hold && w < 0.05) T.skilt(c, h.x, h.y - 20, "Skub mod venstre", { min: this.lay.tavle.x + 6, maks: this.lay.tavle.x + this.lay.tavle.b - 6 });
        }
        var fs = 15;
        NK.tekst(c, "N-enden", sp.x0 - sp.ax - b - 6, this.spY + 1, { font: "800 " + fs + "px " + Fm.FONT, farve: D.FARVE.nende, justering: "right", linje: "middle" });
        if (this.hbT >= 1) NK.tekst(c, "α-helix", sp.x0 + sp.A / 2, this.spY + sp.r + 36, { font: "800 17px " + Fm.FONT, farve: D.FARVE.groen, justering: "center", linje: "middle" });
    };

    /* Trin 3: spiralen over foldebladet, sidekaederne og navnene */
    P.tegnTertiaer = function (c) {
        if (!this.view) return;
        var mig = this, v = this.view;
        var ud = Pr.tegn(c, this.tilstand(), v);
        this.kasser = ud.kasser;
        if (this.fase === "fold" && !this.hold && this.dyMaal === null && !this.groen) {
            var k = Pr.helixKasse(this.dy, v);
            T.skilt(c, k.cx, k.y + 2, "Træk spiralen ned", { min: this.lay.tavle.x + 6, maks: this.lay.tavle.x + this.lay.tavle.b - 6 });
        }
        if (this.fase === "navne" && this.dannesT === null) {
            this.pladser().forEach(function (p) {
                var navn = mig.navne[p.j], gul = mig.gulJ === p.j && !mig.groen;
                var rig = !!mig.groen;
                if (navn) T.brik(c, p.x, p.y, navn, { str: p.str, min: p.b - 8, gul: gul, valgt: !gul && !rig, rigtig: rig });
                else T.plads(c, p.x, p.y, p.b - 8, p.h, { lys: gul });
                /* Nummeret til venstre for pladsen */
                var nx = p.x - p.b / 2 - 2, ny = p.y;
                c.save();
                c.beginPath(); c.arc(nx, ny, 9, 0, Math.PI * 2);
                c.fillStyle = gul ? "#f2c53d" : "#ffffff"; c.fill();
                c.strokeStyle = gul ? "#b8901a" : "#8a8270"; c.lineWidth = 1.4; c.stroke();
                c.restore();
                NK.tekst(c, String(p.j + 1), nx, ny + 1, { font: "800 12px " + T.FONT, farve: "#3a2c00", justering: "center", linje: "middle" });
            });
        }
    };

    /* Trin 4: fire kaeder (to og to ens) som i bogens kvaternaere struktur */
    P.tegnKvaternaer = function (c) {
        var s = this.s4, m = this.mid, u = this.saml ? NK.blod(this.saml.t / SAML) : 0;
        var ud = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        var spred = { x: 5.6 * s, y: 3.2 * s }, taet = { x: 4.7 * s, y: 2.55 * s };
        ud.forEach(function (q, i) {
            var cx = m.x + q[0] * (spred.x + (taet.x - spred.x) * u), cy = m.y + q[1] * (spred.y + (taet.y - spred.y) * u);
            Pr.tegn(c, { udenSider: true, farve: (i === 0 || i === 3) ? "orange" : null, udenBladH: true }, { cx: cx, cy: cy, s: s });
        });
        if (u > 0.99) {
            c.save();
            var g = c.createRadialGradient(m.x, m.y, 10, m.x, m.y, 9 * s);
            g.addColorStop(0, "rgba(15, 118, 110, 0.06)");
            g.addColorStop(1, "rgba(15, 118, 110, 0)");
            c.fillStyle = g;
            c.fillRect(m.x - 10 * s, m.y - 6 * s, 20 * s, 12 * s);
            c.restore();
        }
        NK.tekst(c, "hæmoglobin: fire peptidkæder", m.x, this.lay.tavle.y + this.lay.tavle.h - 18, { font: "800 15px " + Fm.FONT, farve: D.FARVE.blaek, justering: "center", linje: "middle" });
    };

    NK.SimFold = SimFold;
}());
