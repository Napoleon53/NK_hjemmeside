/* =====================================================================
   sim_kaede.js - fane 1: Byg kaeden

   To opgaver (D.KAEDE): amylose og cellulose. Kaeden begynder med tre
   glucoseenheder tegnet som bogens haworthformler. Hver opgave har tre trin:
     vaelg   eleven klikker paa α-glucose eller β-glucose nederst paa tavlen;
             den valgte glucose flyver op ved siden af kaeden
     oh      (amylose) eleven klikker paa de to OH-grupper, der reagerer;
             ringen glider ind, og der fraspaltes et vandmolekyle
     vend    (cellulose) eleven traekker op eller ned i den nye ring og
             vender den om; saa reagerer OH-grupperne, og et spoergsmaal
     spm     knappen Byg videre: kaeden vokser, ses paa afstand og bliver
             til en spiral (amylose) eller til lige kaeder side om side med
             hydrogenbindinger (cellulose); saa et spoergsmaal
   Intet bedoemmes foer Indsend svar. Traekket er en handling, ikke et svar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var E = NK.Enhed;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.3-kaede";

    var AFST = D.AFSTAND;      /* mellem to enheder i kaeden (i ringens enheder) */
    var GAB = 1.35;            /* ekstra afstand til den nye ring, foer den bindes */
    var FLYV = 0.8;            /* den valgte glucose flyver op til kaeden */
    var KOND = 1.6;            /* kondensationen: ringen glider ind, vandet gaar */
    var GLID = 0.45;           /* heraf: ringen glider ind */
    var VOKS_DT = 0.2;         /* en ny enhed pr. 0,2 s, naar kaeden vokser */
    var SKEMA_D = 0.7;         /* fra haworthformler til sekskanter */
    var FORM_D = 1.7;          /* fra lige kaede til spiral eller til fibre */
    var VAND_D = 1.3;          /* et vandmolekyle svaever vaek */
    var VEND_OK = 0.5;         /* slippes ringen efter halvvejen, vender den helt */

    function SimKaede() {
        var mig = this;
        this.opgaver = D.KAEDE;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("k-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("k-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimKaede.prototype;
    F.paa(P, "k");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var g = gemt[o.id] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.opgaver[i].id] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.bygListe = function () {
        var html = "";
        this.opgaver.forEach(function (o, i) {
            html += '<button type="button" class="opg-chip" data-opg="' + i + '"><span class="oc-f"><b>' + (i + 1) + "</b> " +
                NK.html(o.navn) + '</span><i class="oc-m"></i></button>';
        });
        NK.el("k-liste").innerHTML = html;
    };

    P.visListe = function () {
        var chips = NK.el("k-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("k-loest", String(this.antalLoest()));
        var mig = this, html = "";
        this.opg.trin.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span>" + NK.html(t.navn) + "</li>";
        });
        NK.saetHTML("k-trin", html);
        NK.saetTekst("k-trin-navn", this.opg.navn);
    };

    /* ----- En opgave ---------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.form = this.opg.form;
        this.enh = [];
        for (var k = 0; k < this.opg.start; k++) this.enh.push({ vend: this.vendFor(k), t: 9 });
        this.ny = null;
        this.vandL = [];
        this.kond = null;
        this.voks = null;
        this.vendAnim = null;
        this.skema = 0;
        this.formU = 0;
        this.efter = null;
        this.binsA = 1;
        this.cam = null;
        this.fejl = false;
        this.sv = false;
        this.sejrT = null;
        this.kasser = {};
        this.startTrin(0);
    };

    /* Hver anden enhed i cellulose er vendt om; i amylose ingen */
    P.vendFor = function (k) { return this.form === "beta" && k % 2 === 1 ? 1 : 0; };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.opg.trin[j];
        if (this.trin.slags === "vaelg") this.fase = "vaelg";
        else if (this.trin.slags === "oh") this.fase = "oh";
        else if (this.trin.traek) this.fase = "traek";
        else if (this.trin.forsoeg) this.fase = "forsoeg";
        else this.fase = "spm";
        this.valgt = null;
        this.valg = [];
        this.binValg = null;
        this.forkert = {};
        this.groen = null;
        this.hover = null;
        this.trukket = false;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var t = this.trin, mig = this;
        var chip = "Opgave " + (this.nr + 1) + " · Trin " + (this.trinNr + 1) + " af " + this.opg.trin.length;
        if (this.fase === "forsoeg") {
            if (this.voks) return { slags: "opgave", chip: chip, tekst: "Kæden vokser. Følg den, til den ses på afstand." };
            return { slags: "opgave", chip: chip, tekst: t.forsoeg.tekst,
                     ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">' + NK.html(t.forsoeg.knap) + "</button></div>" };
        }
        if (this.fase === "traek") return { slags: "opgave", chip: chip, tekst: this.kond ? "Ringen er vendt om, og OH-grupperne reagerer." : t.traek.tekst };
        if (this.fase === "spm") {
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
        }
        return { slags: "opgave", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg" || this.fase === "traek"; };
    P.skjulHint = function () { return this.fase === "forsoeg" || this.fase === "traek"; };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.fase === "vaelg") return this.binValg !== null;
        if (this.fase === "oh") return this.valg.length === 2;
        if (this.fase === "spm") return this.valgt !== null;
        return false;
    };

    P.indsendTekst = function () {
        if (this.fase === "vaelg" && this.binValg) return "Indsend svar: " + (this.binValg === "alfa" ? "α-glucose" : "β-glucose");
        if (this.fase === "oh" && this.valg.length) return "Indsend svar (" + this.valg.length + " af 2 valgt)";
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.fase === "vaelg") return "Klik på α-glucose eller β-glucose nederst på tavlen først.";
        if (this.fase === "oh") return "Klik på to OH-grupper på tavlen først.";
        return "Vælg et af svarene på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var t = this.trin, tekst = null;
        if (this.fase === "vaelg") {
            if (this.binValg !== t.rigtig) {
                tekst = t.fejl[this.binValg];
                this.forkert[this.binValg] = true;
                this.binValg = null;
            }
        } else if (this.fase === "oh") {
            tekst = this.ohFejl(this.valg);
            if (tekst) {
                var mig = this;
                this.valg.forEach(function (id) { mig.forkert[id] = true; });
                this.valg = [];
            }
        } else if (this.fase === "spm") {
            if (this.valgt !== t.rigtig) {
                tekst = t.fejl[this.valgt];
                this.forkert[this.valgt] = true;
                this.valgt = null;
            }
        } else return;
        if (tekst) {
            this.fejl = true;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        this.rigtig(vist);
    };

    /* Forklaringen til et forkert par af OH-grupper (null, naar parret er rigtigt) */
    P.ohFejl = function (valg) {
        var t = this.trin, v = valg.slice().sort();
        if (v.length === 2 && v[0] === "e1" && v[1] === "n4") return null;
        if (v.length === 2 && v[0].charAt(0) === v[1].charAt(0)) return t.fejlSamme;
        if (v.some(function (id) { return id.charAt(1) === "6"; })) return t.fejl6;
        if (v.some(function (id) { return id.charAt(1) === "2" || id.charAt(1) === "3"; })) return t.fejl23;
        return t.fejlVej;
    };

    P.rigtig = function (vist) {
        var t = this.trin, sidste = this.trinNr === this.opg.trin.length - 1;
        var tekst = t.forkl, foerste = false, alle = false;
        if (sidste) {
            var st = this.status[this.nr];
            foerste = !st.loest;
            st.loest = true;
            st.stjerne = st.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            alle = this.antalLoest() === this.opgaver.length;
            if (alle && foerste) tekst += " " + D.KAEDE_FAERDIG;
        }
        var knap;
        if (!sidste) knap = "Næste trin →";
        else if (this.naesteUloeste() >= 0) knap = "Næste opgave →";
        else knap = "Videre til Forgreninger →";
        this.groen = { spm: true, svarNr: this.fase === "spm" ? t.rigtig : undefined, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: knap };
        this.sejrT = 0;
        this.besked("", "");
        /* Det rigtige svar saetter scenen i gang */
        if (this.fase === "vaelg") this.flyvOp();
        if (this.fase === "oh") this.startKond();
        this.visKort();
        this.visListe();
        if (sidste && alle && foerste) NK.konfettiRegn(NK.el("fane-k").querySelector(".scene"), 60);
        else if (sidste) NK.konfetti(this.el.skort, 18);
    };

    /* Kortets knap gaar altid fremad. Begynd forfra staar i panelet */
    P.videre = function () {
        this.faerdiggoer();
        if (this.trinNr < this.opg.trin.length - 1) { this.startTrin(this.trinNr + 1); return; }
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-g");
    };

    /* Er en bevaegelse i gang, naar eleven trykker videre, springes den til slutningen */
    P.faerdiggoer = function () {
        if (this.ny && this.ny.fly) this.ny.fly = null;
        if (this.kond) { this.kond.t = KOND; this.opdaterKond(0); }
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () {
        if (this.groen || this.kond || this.voks || this.efter) return;
        this.vaelg(this.nr);
    };

    /* ----- Hjaelpen ------------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen || this.fase === "forsoeg" || this.fase === "traek") return [];
        return this.trin.hint;
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "vaelg") this.binValg = this.trin.rigtig;
        else if (this.fase === "oh") this.valg = ["e1", "n4"];
        else this.valgt = this.trin.rigtig;
        this.bedoem(true);
    };

    /* ----- Bevaegelserne -------------------------------------------------------------- */
    /* Den valgte glucose flyver fra kassen op ved siden af kaeden */
    P.flyvOp = function () {
        var b = this.bins && this.bins[this.binValg];
        this.ny = { vend: 0, form: this.binValg, fly: b ? { t: 0, X: b.mx, Y: b.my, s: b.s } : null };
    };

    P.gabX = function () { return this.enh.length * AFST + GAB; };

    P.startKond = function () {
        if (!this.ny || this.kond) return;
        if (this.ny.fly) this.ny.fly = null;
        this.kond = { t: 0, vand: false };
    };

    P.opdaterKond = function (dt) {
        var k = this.kond;
        if (!k) return;
        k.t += dt;
        if (k.t >= GLID && !k.vand) {
            k.vand = true;
            this.vandL.push({ i: this.enh.length, t: 0 });
        }
        if (k.t >= KOND) {
            this.enh.push({ vend: this.ny.vend >= 0.5 ? 1 : 0, t: 9 });
            this.ny = null;
            this.kond = null;
            /* Efter vendingen kommer spoergsmaalet */
            if (this.fase === "traek") {
                this.fase = "spm";
                this.valgt = null;
                this.nulstilHjaelp();
                this.visKort();
            }
        }
    };

    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.voks || this.groen) return;
        this.voks = { t: 0 };
        this.visKort();
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        /* Den valgte glucose paa vej op */
        if (this.ny && this.ny.fly) {
            this.ny.fly.t += dt;
            if (this.ny.fly.t >= FLYV) this.ny.fly = null;
        }
        /* Kasserne toner ud, naar glucosen er valgt */
        this.binsA = NK.mod(this.binsA, this.fase === "vaelg" && !this.groen ? 1 : 0, 6, dt);
        /* Ringen, der vendes */
        if (this.vendAnim && this.ny) {
            var v = this.vendAnim;
            this.ny.vend = NK.mod(this.ny.vend, v.maal, 9, dt);
            if (Math.abs(this.ny.vend - v.maal) < 0.01) {
                this.ny.vend = v.maal;
                this.vendAnim = null;
                if (v.maal === 1) this.startKond();
            }
        }
        this.opdaterKond(dt);
        this.vandL.forEach(function (w) { w.t += dt; });
        this.vandL = this.vandL.filter(function (w) { return w.t < VAND_D; });
        this.enh.forEach(function (u) { u.t += dt; });

        /* Kaeden vokser */
        if (this.voks) {
            this.voks.t += dt;
            while (this.voks && this.voks.t >= VOKS_DT && this.enh.length < this.opg.voks) {
                this.voks.t -= VOKS_DT;
                this.enh.push({ vend: this.vendFor(this.enh.length), t: 0 });
                this.vandL.push({ i: this.enh.length - 1, t: 0 });
            }
            if (this.voks && this.enh.length >= this.opg.voks && this.voks.t > 0.5) {
                this.voks = null;
                this.efter = { fase: "skema", t: 0 };
            }
        }
        if (this.efter) {
            var ef = this.efter;
            ef.t += dt;
            if (ef.fase === "skema") {
                this.skema = NK.klamp(ef.t / SKEMA_D, 0, 1);
                if (ef.t >= SKEMA_D + 0.25) { this.efter = { fase: "form", t: 0 }; }
            } else {
                this.formU = NK.klamp(ef.t / FORM_D, 0, 1);
                if (ef.t >= FORM_D + 0.3) {
                    this.efter = null;
                    this.fase = "spm";
                    this.valgt = null;
                    this.nulstilHjaelp();
                    this.visKort();
                }
            }
        }
        /* Kameraet foelger kaeden */
        var m = this.kameraMaal();
        if (!this.cam) this.cam = { x: m.x, s: m.s };
        this.cam.x = NK.mod(this.cam.x, m.x, 3, dt);
        this.cam.s = NK.mod(this.cam.s, m.s, 3, dt);
        this.rowY = NK.mod(this.rowY || m.y, m.y, 6, dt);
        void mig;
    };

    /* Hvor kameraet skal staa: hele kaeden (og den nye ring) i billedet */
    P.kameraMaal = function () {
        var t = this.lay.tavle, n = this.enh.length;
        /* Mens kaeden vokser, zoomer kameraet ud til hele den faerdige kaede */
        if (this.voks || this.efter || this.formU > 0) n = Math.max(n, this.opg.voks);
        var venstre = -1.9, hoejre = (n - 1) * AFST + 1.7;
        if (this.ny) hoejre = this.gabX() + 1.7;
        var s = Math.min(this.sMax, (t.b - 44) / (hoejre - venstre));
        var y = this.binsA > 0.02 || this.fase === "vaelg" ? this.radY.op : this.radY.midt;
        return { x: (venstre + hoejre) / 2, s: s, y: y };
    };

    /* ----- Kaedens enheder paa skaermen --------------------------------------------------
       Hver enhed faar en plads (X, Y), en skala s, en sekskant h og en dybde z.
       Paa afstand glider de fra den lige kaede til spiralen eller til fibrene. */
    P.pladser = function () {
        var n = this.enh.length, cam = this.cam, t = this.lay.tavle, cx = t.x + t.b / 2;
        var ud = [], u = NK.blod(this.formU);
        var hS = this.form === "alfa" ? NK.klamp(Math.min(t.h * 0.03, t.b / (n * 1.6)), 7, 12) : NK.klamp(Math.min(t.h * 0.04, t.b / (n * 2.6)), 8, 15);
        for (var i = 0; i < n; i++) {
            var p = { X: cx + (i * AFST - cam.x) * cam.s, Y: this.rowY, s: cam.s, h: cam.s * 0.9, z: 0 };
            if (u > 0) {
                var X2, Y2, z2 = 0;
                if (this.form === "alfa") {
                    var sp = D.spiralPunkt(i, hS);
                    X2 = cx - (n - 1) * D.SPIRAL.dx * hS / 2 + sp.x;
                    Y2 = this.rowY + sp.y;
                    z2 = sp.z;
                } else {
                    var dxc = 2.3 * hS;
                    X2 = cx - (n - 1) * dxc / 2 + i * dxc;
                    Y2 = this.rowY;
                }
                p.X = NK.lerp(p.X, X2, u);
                p.Y = NK.lerp(p.Y, Y2, u);
                p.h = NK.lerp(p.h, hS * (1 + 0.12 * z2), u);
                p.z = z2 * u;
            }
            ud.push(p);
        }
        this.hS = hS;
        return ud;
    };

    /* Hvor tydelige grupperne er ved en skala */
    function tekstAf(s) { return NK.klamp((s - 15) / 9, 0, 1); }

    /* ----- Musen ----------------------------------------------------------------------- */
    P.klikbare = function () {
        if (this.groen || this.kond) return [];
        if (this.fase === "oh") return ["e1", "e2", "e3", "e6", "n1", "n2", "n3", "n4", "n6"];
        return [];
    };

    P.ramt = function (pt) {
        if (!pt) return null;
        var liste = this.klikbare(), bedst = null, afst = 1e9, mig = this;
        liste.forEach(function (id) {
            var k = mig.kasser[id];
            if (!k) return;
            var m = 6;
            if (pt.x > k.x - m && pt.x < k.x + k.w + m && pt.y > k.y - m && pt.y < k.y + k.h + m) {
                var d = Math.abs(pt.x - (k.x + k.w / 2)) + Math.abs(pt.y - (k.y + k.h / 2));
                if (d < afst) { afst = d; bedst = id; }
            }
        });
        return bedst;
    };

    P.binRamt = function (pt) {
        if (!pt || this.fase !== "vaelg" || this.groen || !this.bins) return null;
        var ud = null;
        ["alfa", "beta"].forEach(function (id) {
            var b = this.bins[id];
            if (b && pt.x > b.x && pt.x < b.x + b.b && pt.y > b.y && pt.y < b.y + b.h) ud = id;
        }, this);
        return ud;
    };

    /* Kan den nye ring gribes her? */
    P.paaNy = function (pt) {
        if (!pt || this.fase !== "traek" || !this.ny || this.ny.fly || this.kond || this.groen || this.vendAnim) return false;
        var c = this.nyPlads;
        if (!c) return false;
        return Math.abs(pt.x - c.X) < c.s * 1.6 && Math.abs(pt.y - c.Y) < c.s * 1.5;
    };

    P.overScene = function (pt) {
        this.hover = this.ramt(pt) || this.binRamt(pt);
        if (this.hover) return "pointer";
        if (this.fase === "traek") return this.trukket ? "grabbing" : (this.paaNy(pt) ? "grab" : null);
        if (this.fase === "forsoeg" && !this.voks && pt && this.paaTavle(pt)) return "pointer";
        return null;
    };

    P.paaTavle = function (pt) {
        var t = this.lay && this.lay.tavle;
        return t && pt.x > t.x && pt.x < t.x + t.b && pt.y > t.y && pt.y < t.y + t.h;
    };

    P.nedScene = function (pt) {
        if (!this.paaNy(pt)) return false;
        this.grebY = pt.y;
        this.grebV = this.ny.vend;
        this.trukket = true;
        this.besked("", "");
        this.L.canvas.style.cursor = "grabbing";
        return true;
    };

    /* Ringen drejer om sin vandrette akse, naar eleven traekker op eller ned */
    P.flytScene = function (pt) {
        if (!this.trukket || !pt || !this.ny) return;
        var s = this.nyPlads ? this.nyPlads.s : 40;
        var u = NK.klamp(this.grebV + Math.abs(pt.y - this.grebY) / (1.5 * s), 0, 1);
        this.ny.vend = u;
        if (u >= 0.97) {
            this.greb = false;
            this.trukket = false;
            this.ny.vend = 1;
            this.L.canvas.style.cursor = "default";
            this.startKond();
            this.visKort();
        }
    };

    P.opScene = function () {
        if (!this.trukket || !this.ny) return;
        this.trukket = false;
        this.L.canvas.style.cursor = "default";
        if (this.ny.vend >= VEND_OK) { this.vendAnim = { maal: 1 }; this.visKort(); return; }
        if (this.ny.vend > 0.03) this.kortBesked("Træk længere op eller ned, så ringen vender helt om.", 3);
        this.vendAnim = { maal: 0 };
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "forsoeg") {
            if (!this.voks && this.paaTavle(pt)) { this.udfoer(); return; }
            this.kortBlink();
            return;
        }
        if (this.fase === "traek") {
            if (this.paaNy(pt)) this.kortBesked("Hold musen nede, og træk op eller ned i ringen.", 3);
            else this.kortBlink();
            return;
        }
        if (this.fase === "vaelg") {
            var b = this.binRamt(pt);
            if (!b) { this.kortBesked("Klik på α-glucose eller β-glucose nederst på tavlen.", 3); return; }
            if (this.forkert[b]) return;
            this.binValg = this.binValg === b ? null : b;
            this.besked("", "");
            this.visKort();
            return;
        }
        if (this.fase === "oh") {
            var id = this.ramt(pt);
            if (!id) { this.kortBesked("Klik på en OH-gruppe på en af de to ringe til højre.", 3); return; }
            var i = this.valg.indexOf(id);
            if (i >= 0) this.valg.splice(i, 1);
            else {
                this.valg.push(id);
                if (this.valg.length > 2) this.valg.shift();
            }
            delete this.forkert[id];
            this.besked("", "");
            this.visKort();
            return;
        }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.sMax = Math.round(NK.klamp(t.h / 7.2, 24, 54));
        this.radY = { op: t.y + t.h * 0.36, midt: t.y + t.h * 0.5 };
        /* De to kasser med α-glucose og β-glucose nederst */
        var sb = NK.klamp(Math.min(t.h * 0.085, t.b * 0.04), 17, 30);
        var bb = sb * 4.6, bh = sb * 4.1, by = t.y + t.h - bh - 14;
        this.bins = {};
        var mig = this;
        [["alfa", 0.36], ["beta", 0.64]].forEach(function (p) {
            var bx = t.x + t.b * p[1] - bb / 2;
            mig.bins[p[0]] = { x: bx, y: by, b: bb, h: bh, s: sb, mx: bx + bb / 2, my: by + sb * 1.75 };
        });
        if (!this.cam && this.enh) { var m = this.kameraMaal(); this.cam = { x: m.x, s: m.s }; this.rowY = m.y; }
        this.saetAnker("kaede", t.x + 8, this.radY.op - this.sMax * 1.6, t.b - 16, this.sMax * 3.2);
        this.saetAnker("glucose", t.x + t.b * 0.36 - bb / 2 - 8, by - 6, t.b * 0.28 + bb + 16, bh + 12);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay || !this.cam || !this.enh) return;
        var t = lay.tavle;
        if (t.b < 160) return;          /* fanen er skjult og har ingen bredde */
        T.tavle(ctx, lay);
        this.kasser = {};

        /* Taelleren oeverst til venstre */
        var n = this.enh.length;
        var vand = Math.max(0, n - 1) + (this.kond && this.kond.vand ? 1 : 0);
        NK.tekst(ctx, "Glucoseenheder: " + (n + (this.kond && this.kond.vand ? 1 : 0)) + "   ·   Fraspaltet vand: " + vand,
            t.x + 14, t.y + 20, { font: "700 13px " + T.FONT, farve: T.DAEMPET, linje: "middle" });

        if (this.binsA > 0.02) this.tegnBins(ctx);

        var pl = this.pladser(), sk = this.skema, fU = NK.blod(this.formU);

        /* Cellulose: to kaeder mere glider ind, og hydrogenbindingerne kommer */
        if (this.form === "beta" && fU > 0) this.tegnNaboer(ctx, pl, fU);

        /* Bindingerne mellem enhederne og enhederne selv. Paa spiralen tegnes det
           bagerste foerst, saa kaeden snor sig rundt om noget. */
        var ting = [];
        for (var i = 0; i < n; i++) {
            ting.push({ z: pl[i].z, slags: "enhed", i: i });
            if (i > 0) ting.push({ z: (pl[i].z + pl[i - 1].z) / 2 - 0.01, slags: "bro", i: i });
        }
        ting.sort(function (a, b) { return a.z - b.z; });
        var V = [];
        /* Foerst hjoernerne (brugt af bindingerne) */
        for (i = 0; i < n; i++) {
            V.push(E.hjoerner({ X: pl[i].X, Y: pl[i].Y, s: pl[i].s, vend: this.enh[i].vend, skema: sk, h: pl[i].h }));
        }
        var nyLab = null;
        /* Paa afstand (kun sekskanter): et sammenhaengende roer som i bogens figur,
           det bagerste foerst */
        if (sk >= 0.999) {
            var pts = pl.map(function (p) { return { x: p.X, y: p.Y, z: p.z }; });
            var w = Math.max(2.5, pl[0].h * 0.42), U = NK.blod(this.formU), hS = this.hS, cx0 = lay.tavle.x + lay.tavle.b / 2, rY = this.rowY;
            /* Roeret foelger spiralens bane mellem enhederne */
            var bane = this.form === "alfa" ? function (i, u) {
                var sp = D.spiralPunkt(i + u, hS);
                var hx = cx0 - (n - 1) * D.SPIRAL.dx * hS / 2 + sp.x, hy = rY + sp.y;
                var lx = NK.lerp(pl[i].X, pl[i + 1].X, u), ly = NK.lerp(pl[i].Y, pl[i + 1].Y, u);
                return { x: NK.lerp(lx, hx, U), y: NK.lerp(ly, hy, U), z: sp.z * U };
            } : null;
            ["bag", "for"].forEach(function (lag) {
                E.roer(ctx, pts, { w: w, lag: lag, bane: bane });
                pl.forEach(function (p, i) {
                    if ((p.z < 0) !== (lag === "bag")) return;
                    E.hex(ctx, p.X, p.Y, p.h, { alfa: 0.6 + 0.4 * (p.z + 1) / 2 });
                });
            });
            ting = [];
        }
        ting.forEach(function (ti) {
            var p = pl[ti.i], dyb = fU > 0 && mig.form === "alfa" ? 0.45 + 0.55 * (p.z + 1) / 2 : 1;
            if (ti.slags === "bro") mig.tegnBro(ctx, ti.i, pl, V, sk, dyb);
            else {
                var u = mig.enh[ti.i], ind = NK.klamp(u.t / 0.25, 0, 1);
                var sub = { 1: ti.i === n - 1 && !(mig.kond && mig.kond.vand) ? "OH" : null, 4: ti.i === 0 ? "OH" : null };
                var farve = {};
                if (ti.i === n - 1 && mig.kond && !mig.kond.vand) farve[1] = E.GROEN;
                var r = E.enhed(ctx, { X: p.X, Y: p.Y, s: p.s, vend: u.vend, form: mig.form, sub: sub, tekst: tekstAf(p.s),
                    skema: sk, h: p.h, alfa: dyb * ind, farve: farve, numre: mig.visNumre(ti.i) ? 1 : 0 });
                if (ti.i === n - 1) { ["1", "2", "3", "6"].forEach(function (k) { if (r.lab[k]) mig.kasser["e" + k] = r.lab[k]; }); }
            }
        });

        /* Den nye ring */
        this.nyPlads = null;
        if (this.ny) nyLab = this.tegnNy(ctx, pl, V);

        /* Vandmolekylerne, der fraspaltes */
        this.vandL.forEach(function (w) {
            var o = mig.broO(w.i, pl, V);
            if (!o) return;
            var u = w.t / VAND_D, dir = o.dir;
            var f = E.skrift(mig.cam.s) * NK.klamp(mig.cam.s / 30, 0.7, 1);
            T.vand(ctx, o.x + u * 0.8 * mig.cam.s, o.y + dir * (0.55 + u * 1.3) * mig.cam.s, Math.max(11, f), NK.klamp(1.4 - u * 1.4, 0, 1) * NK.klamp(w.t / 0.12, 0, 1));
        });

        /* Elevens valg af OH-grupper og de forkerte forsoeg */
        if (this.fase === "oh") {
            Object.keys(this.forkert).forEach(function (id) { if (mig.valg.indexOf(id) < 0) T.valgRamme(ctx, mig.kasser[id], T.FORKERT, true); });
            this.valg.forEach(function (id) { T.valgRamme(ctx, mig.kasser[id], mig.groen ? "#2e8b57" : T.VALG); });
        }
        if (this.hover && !this.groen && this.fase === "oh" && this.valg.indexOf(this.hover) < 0) {
            ctx.save(); ctx.globalAlpha = 0.5; T.valgRamme(ctx, this.kasser[this.hover], T.VALG, true); ctx.restore();
        }

        /* Det, kortet spoerger om, har en gul ramme */
        if (this.fase === "spm" && !this.groen) this.tegnOm(ctx, pl, V);

        /* Navnet under kaeden */
        var navn = this.form === "alfa" ? "Et stykke af en amylosekæde" : "Et stykke af en cellulosekæde";
        if (fU > 0.5) navn = this.form === "alfa" ? "Amylosekæden på afstand" : "Cellulosekæder på afstand";
        if (this.binsA < 0.5) T.billedtekst(ctx, t.x + t.b / 2, t.y + t.h - 20, navn, { farve: this.voks || this.efter ? T.DAEMPET : T.BLAEK });

        /* Skiltet, naar forsoeget eller traekket venter */
        if (this.fase === "forsoeg" && !this.voks && !this.efter) {
            T.skilt(ctx, t.x + t.b / 2, this.rowY - this.cam.s * 1.5, "Klik: byg videre", { min: t.x + 4, maks: t.x + t.b - 4 });
        }
        if (this.fase === "traek" && this.nyPlads && !this.trukket && !this.kond && !this.vendAnim && this.ny.vend < 0.02) {
            T.skilt(ctx, this.nyPlads.X, this.nyPlads.Y - this.nyPlads.s * 1.45, "Træk op eller ned", { min: t.x + 4, maks: t.x + t.b - 4 });
        }
        void nyLab;
        this.tegnSejr(ctx, t);
    };

    /* Numrene staar paa de to ringe, der skal bindes sammen */
    P.visNumre = function (i) {
        if (this.voks || this.efter || this.formU > 0) return false;
        return i === this.enh.length - 1 && (this.fase === "oh" || this.fase === "traek" || this.fase === "vaelg");
    };

    /* Oxygenatomet i bindingen foran enhed i (fra carbonatom 1 i enhed i-1 til carbonatom 4 i enhed i) */
    P.broO = function (i, pl, V) {
        var a = V[i - 1], b = V[i];
        if (!a || !b) {
            /* Bindingen til den nye ring, der er ved at blive dannet */
            if (i === this.enh.length && this.nyV && V[i - 1]) b = this.nyV; else return null;
        }
        var u = this.enh[i - 1];
        var dir = E.retning1(this.form) * (u.vend >= 0.5 ? -1 : 1);
        var s = pl[i - 1].s;
        return { x: (a[1].x + b[4].x) / 2, y: (a[1].y + b[4].y) / 2 + dir * 0.42 * s * (1 - this.skema), dir: dir, a: a[1], b: b[4] };
    };

    P.tegnBro = function (ctx, i, pl, V, sk, dyb) {
        var o = this.broO(i, pl, V);
        if (!o) return;
        var nyest = this.enh[i].t;
        var alfa = dyb * NK.klamp(nyest / 0.25, 0, 1);
        E.bro(ctx, o.a, o.b, o, pl[i].s, { skema: sk, h: pl[i].h, tekst: tekstAf(pl[i].s), alfa: alfa, gloed: true });
    };

    /* Den nye ring: paa vej op fra kassen, ved siden af kaeden eller paa vej ind */
    P.tegnNy = function (ctx, pl, V) {
        var ny = this.ny, n = this.enh.length, cam = this.cam, t = this.lay.tavle, cx = t.x + t.b / 2;
        var X = cx + (this.gabX() - cam.x) * cam.s, Y = this.rowY, s = cam.s;
        if (this.kond) {
            var u = NK.blod(NK.klamp(this.kond.t / GLID, 0, 1));
            X = cx + (NK.lerp(this.gabX(), n * AFST, u) - cam.x) * cam.s;
        }
        if (ny.fly) {
            var f = NK.blod(ny.fly.t / FLYV);
            X = NK.lerp(ny.fly.X, X, f);
            Y = NK.lerp(ny.fly.Y, Y, f) - Math.sin(f * Math.PI) * 30;
            s = NK.lerp(ny.fly.s, s, f);
        }
        this.nyPlads = { X: X, Y: Y, s: s };
        var vand = this.kond && this.kond.vand;
        var farve = {};
        if (this.kond && !vand) farve[4] = E.GROEN;
        var sub = { 1: "OH", 4: vand ? null : "OH" };
        var r = E.enhed(ctx, { X: X, Y: Y, s: s, vend: ny.vend, form: ny.form || this.form, sub: sub, tekst: tekstAf(s), farve: farve,
            numre: this.fase === "oh" || this.fase === "traek" ? 1 : 0 });
        this.nyV = r.v;
        var mig = this;
        ["1", "2", "3", "4", "6"].forEach(function (k) { if (r.lab[k]) mig.kasser["n" + k] = r.lab[k]; });
        /* Bindingen, der dannes */
        if (vand) {
            var o = this.broO(n, pl.concat([{ s: s }]), V.concat([r.v]));
            if (o) E.bro(ctx, o.a, o.b, o, s, { alfa: NK.klamp((this.kond.t - GLID) / 0.3, 0, 1), gloed: true });
        }
        /* Under traekket: en stiplet ramme om ringen, der kan gribes */
        if (this.fase === "traek" && !this.kond && !this.trukket && !this.vendAnim && !this.groen) {
            T.gulRamme(ctx, X - s * 1.45, Y - s * 1.3, s * 2.9, s * 2.6, 12);
        }
        return r;
    };

    /* Cellulose: to kaeder mere og de prikkede hydrogenbindinger mellem dem */
    P.tegnNaboer = function (ctx, pl, fU) {
        var n = pl.length, hS = this.hS, gab = 3.7 * hS, t = this.lay.tavle, mig = this;
        this.raekker = [-1, 1].map(function (k) {
            var glid = (1 - fU) * t.h * 0.45;
            return { k: k, dy: k * (gab + glid), a: NK.klamp(fU * 1.6 - 0.2, 0, 1) };
        });
        this.raekker.forEach(function (r) {
            ctx.save();
            ctx.globalAlpha = r.a;
            ctx.strokeStyle = T.BRUN;
            ctx.lineWidth = Math.max(1.4, hS * 0.14);
            ctx.beginPath();
            ctx.moveTo(pl[0].X - hS * 1.6, pl[0].Y + r.dy);
            ctx.lineTo(pl[n - 1].X + hS * 1.6, pl[n - 1].Y + r.dy);
            ctx.stroke();
            ctx.restore();
            pl.forEach(function (p) { E.hex(ctx, p.X, p.Y + r.dy, hS, { alfa: r.a }); });
        });
        /* Hydrogenbindingerne kommer, naar kaederne ligger side om side */
        var hb = NK.klamp((fU - 0.65) / 0.35, 0, 1);
        if (hb > 0) {
            ctx.save();
            ctx.globalAlpha = hb;
            ctx.strokeStyle = "#e05446";
            ctx.lineWidth = 2;
            ctx.setLineDash([2, 4]);
            ctx.lineCap = "round";
            pl.forEach(function (p, i) {
                if (i % 2 === 1) return;
                [-1, 1].forEach(function (k) {
                    var y1 = p.Y + k * hS * 1.0, y2 = p.Y + k * (gab - hS * 1.0);
                    ctx.beginPath(); ctx.moveTo(p.X + hS * 0.9, y1); ctx.lineTo(p.X + hS * 0.9, y2); ctx.stroke();
                });
            });
            ctx.restore();
        }
        this.hbFelt = { x: pl[0].X - hS * 1.4, y: pl[0].Y - gab + hS * 0.4, b: pl[n - 1].X - pl[0].X + hS * 2.8, h: 2 * gab - hS * 0.8 };
        void mig;
    };

    /* De to kasser med α-glucose og β-glucose */
    P.tegnBins = function (ctx) {
        var mig = this, a = this.binsA;
        ctx.save();
        ctx.globalAlpha = a;
        ["alfa", "beta"].forEach(function (id) {
            var b = mig.bins[id];
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;
            NK.rundtRekt(ctx, b.x, b.y, b.b, b.h, 12);
            ctx.fillStyle = mig.hover === id && !mig.groen ? "#fffdf4" : "#ffffff";
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.strokeStyle = "#c9d0da";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
            /* Glucosen i kassen (vaek, naar den er fløjet op) */
            var fl = mig.ny && mig.ny.form === id;
            if (!fl) E.enhed(ctx, { X: b.mx, Y: b.my, s: b.s, form: id, sub: { 1: "OH", 4: "OH" }, tekst: 1, alfa: 1 });
            T.billedtekst(ctx, b.mx, b.y + b.h - 15, id === "alfa" ? "α-glucose" : "β-glucose", { str: 15 });
            if (mig.forkert[id]) T.valgRamme(ctx, { x: b.x + 4, y: b.y + 4, w: b.b - 8, h: b.h - 8 }, T.FORKERT, true);
            if (mig.binValg === id) T.valgRamme(ctx, { x: b.x + 4, y: b.y + 4, w: b.b - 8, h: b.h - 8 }, mig.groen ? "#2e8b57" : T.VALG);
            else if (mig.hover === id && !mig.groen && mig.fase === "vaelg") {
                ctx.save(); ctx.globalAlpha = a * 0.5; T.valgRamme(ctx, { x: b.x + 4, y: b.y + 4, w: b.b - 8, h: b.h - 8 }, T.VALG, true); ctx.restore();
            }
        });
        ctx.restore();
    };

    /* Den gule ramme om det, spoergsmaalet handler om */
    P.tegnOm = function (ctx, pl, V) {
        var om = this.trin.om, n = this.enh.length;
        if (om === "bro") {
            var o = this.broO(n - 1, pl, V);
            if (!o) return;
            var s = pl[n - 1].s, k = { x: o.a.x - s * 0.2, y: Math.min(o.a.y, o.b.y, o.y) - s * 0.75, w: o.b.x - o.a.x + s * 0.4, h: Math.abs(o.y - o.a.y) + s * 1.5 };
            T.gulRamme(ctx, k.x, k.y, k.w, k.h, 10);
        } else if (om === "hbind" && this.hbFelt) {
            var f = this.hbFelt;
            T.gulRamme(ctx, f.x, f.y, f.b, f.h, 12);
        }
    };

    NK.SimKaede = SimKaede;
}());
