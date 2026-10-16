/* =====================================================================
   sim_zigzag.js - fane 2: zigzag (de to faner fra den gamle 6.2)

   Strukturformel -> zigzag
     Strukturformlen med alle atomer haenger paa et papir oeverst paa
     tavlen. Eleven tegner zigzagformlen nedenunder. Naar alle C-atomer er
     brugt, tjekkes tegningen. Rigtigt: hovedkaeden bliver groen,
     sidegrupperne blaa, og kaeden faar numre.
   Zigzag -> strukturformel
     En zigzagformel staar paa tavlen. Trin 1: klik paa hvert knaek og
     hver ende (C). Trin 2: klik paa hvert C for at saette H paa
     (hoejreklik fjerner). Trin 3: skriv molekylformlen.

   Hver retning er en serie paa ti molekyler med stigende svaerhed
   (NK.Opgaver.ZIGZAG og ATOMER, de samme trin som i den gamle 6.2).
   Opgavekortet har én knap: Giv hint -> Vis svaret -> Naeste molekyle.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var O = NK.Opgaver;
    var GROEN = "#1d7a48", BLAA = "#2563eb", ROED = "#c8473a";

    function nySerie(trin) {
        var liste = O.serie(trin);
        return { liste: liste, nr: 0, status: liste.map(function () { return 0; }), mini: -1 };
    }

    function SimZigzag() {
        this.retning = "tegn";
        this.serier = { tegn: nySerie(O.ZIGZAG), atomer: nySerie(O.ATOMER) };
        this.startFane();
        this.bygPanel();
        this.startOpgave();
    }

    var P = SimZigzag.prototype;
    NK.Fane.bland(P, "zz");

    P.regler = function () {
        var mig = this;
        return {
            kunC: true, dobbelt: true, enDobbelt: true, knaek: true, sletAlt: false,
            maks: function () { return mig.maal ? mig.maal.antal : 99; },
            maksTekst: function () { return "Alle " + mig.maal.antal + " C-atomer er brugt."; }
        };
    };

    P.serie = function () { return this.serier[this.retning]; };

    /* ----- En opgave ------------------------------------------------------ */
    P.startOpgave = function () {
        var s = this.serie(), b = this.braet, mig = this;
        this.maal = s.liste[s.nr];
        this.hjaelp = 0;
        this.loest = false;
        this.visteSvar = false;
        this.hintKaede = false;
        this.besked("", "");
        b.atomFarve = b.bindingFarve = b.lokanter = b.visC = null;
        b.hist = [];
        b.frem = [];
        if (this.retning === "tegn") {
            this.papirMol = NK.Layout.struktur90(this.maal.mol, this.maal.res);
            this.papirGeo = null;
            b.laast = false;
            b.nulstil(true, true);
        } else {
            this.trin = 1;
            this.c = {};
            this.h = {};
            this.forkerte = null;
            this.over = null;
            b.laast = true;
            b.saet(this.maal.mol.kopi(), true);
            b.visC = function (id) { return !!mig.c[id]; };
            NK.el("zz-input").value = "";
        }
        if (this.lay) this.layout();
        this.visPanel();
    };

    P.naeste = function () {
        var s = this.serie();
        var ledig = -1;
        for (var k = 1; k <= s.liste.length; k++) {
            var i = (s.nr + k) % s.liste.length;
            if (!s.status[i]) { ledig = i; break; }
        }
        if (ledig < 0) {
            this.serier[this.retning] = nySerie(this.retning === "tegn" ? O.ZIGZAG : O.ATOMER);
        } else s.nr = ledig;
        this.startOpgave();
    };

    P.nulstil = function () {
        if (this.retning === "tegn" && !this.loest) this.braet.nulstil(true);
    };

    /* ----- Papiret med strukturformlen ------------------------------------------ */
    P.layoutEkstra = function (lay) {
        var t = lay.tavle;
        this.papir = null;
        if (this.retning === "tegn" && this.papirMol) {
            var sp = NK.klamp(this.skala() * 0.78, 28, 42);
            var g = NK.Struktur.geometri(this.papirMol, { skala: sp, stil: "alle", skrift: Math.max(13, sp * 0.4) });
            var bb = g.x1 - g.x0, hh = g.y1 - g.y0;
            var maksB = t.b * 0.62, maksH = t.h * 0.42;
            var k = Math.min(1, maksB / (bb + 40), maksH / (hh + 44));
            if (k < 1) {
                sp *= k;
                g = NK.Struktur.geometri(this.papirMol, { skala: sp, stil: "alle", skrift: Math.max(12, sp * 0.4) });
                bb = g.x1 - g.x0; hh = g.y1 - g.y0;
            }
            var r = { b: bb + 40, h: hh + 40 };
            /* Oeverst til hoejre: midt foroven staar tilbuddet om praesentationen,
               og til venstre staar Kemichael, naar han kommer */
            r.x = t.x + t.b - r.b - 18;
            r.y = t.y + 16;
            this.papir = { r: r, sp: sp, ox: r.x + 20 - g.x0, oy: r.y + 24 - g.y0 };
            this.saetAnker("zz-anker-papir", r.x, r.y, r.b, r.h);
        } else {
            this.saetAnker("zz-anker-papir", t.x + t.b / 2, t.y, 0, 0);
        }
    };

    P.felt = function () {
        var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 400, h: 300 };
        if (this.retning === "tegn" && this.papir) {
            var top = this.papir.r.y + this.papir.r.h + 8;
            return { x: t.x + 8, y: top, b: t.b - 16, h: t.y + t.h - top - 8 };
        }
        return { x: t.x + 8, y: t.y + 8, b: t.b - 16, h: t.h - 16 };
    };

    P.skala = function () {
        var t = this.lay ? this.lay.tavle : { b: 700, h: 450 };
        var s = NK.klamp(Math.min(t.b / 13, t.h / 7.2), 34, 58);
        if (this.retning === "atomer") s = NK.klamp(s * 1.3, 40, 72);
        return Math.round(s);
    };

    /* ----- Aendringer paa tavlen ------------------------------------------------------ */
    P.aendret = function (hvad) {
        if (hvad === "laerer" || this.retning !== "tegn" || this.loest) return;
        var n = this.braet.antal();
        if (n === this.maal.antal) {
            var res = NK.Navn.analyser(this.braet.mol);
            var r = NK.Tjek.tegning(res, this.maal, false);
            if (r.ok) { this.loes(res, false); return; }
            this.besked(r.besked, "skidt");
        } else if (this.beskedKlasse === "skidt") {
            this.besked("", "");
        }
        this.visPanel();
    };

    /* Loest: groen hovedkaede, blaa sidegrupper og numre paa kaeden */
    P.loes = function (res, vist) {
        var s = this.serie(), b = this.braet;
        this.loest = true;
        this.visteSvar = vist;
        s.status[s.nr] = vist ? 2 : 1;
        s.mini = s.nr;
        b.laast = true;
        this.farvLoest(res);
        if (this.retning === "tegn") {
            this.besked((vist ? "Sådan ser zigzagformlen ud: " : "Rigtigt. Det er ") + "<b>" + NK.html(res.navnUdenStereo) + "</b>.", vist ? "gul" : "god");
        }
        if (!vist) { if (this.afvisTilbud) this.afvisTilbud(); this.konfetti(false); }
        /* Serien er klaret: klistermaerket kraever, at hoejst tre svar er vist */
        if (s.status.every(function (x) { return x > 0; })) {
            var vistAntal = s.status.filter(function (x) { return x === 2; }).length;
            this.klaret("zz-" + this.retning, vistAntal <= 3, D.ROS[this.retning]);
        }
        this.visPanel();
    };

    P.farvLoest = function (res) {
        var b = this.braet, kaede = {}, side = {}, lok = {};
        if (!res || !res.kaede) return;
        res.kaede.forEach(function (id, i) { kaede[id] = true; lok[id] = i + 1; });
        (res.sub || []).forEach(function (x) { x.atomer.forEach(function (id) { side[id] = true; }); });
        b.bindingFarve = function (bd) {
            if (kaede[bd.a] && kaede[bd.b]) return GROEN;
            if (side[bd.a] || side[bd.b]) return BLAA;
            return null;
        };
        if (this.retning === "tegn") b.lokanter = lok;
    };

    /* ----- Zigzag -> strukturformel: C, H og formlen ------------------------------------ */
    P.forventetH = function (id) { return this.braet.mol.implicitH(id); };

    P.antalC = function () { return Object.keys(this.c).length; };

    P.antalH = function () {
        var t = 0, h = this.h;
        Object.keys(h).forEach(function (k) { t += h[k]; });
        return t;
    };

    P.totalH = function () {
        var t = 0, mig = this;
        this.braet.mol.atomer.forEach(function (a) { t += mig.forventetH(a.id); });
        return t;
    };

    P.musKrog = function (type, pt, e) {
        if (this.retning !== "atomer") return false;
        if (type === "ud") { this.over = null; return true; }
        var a = this.braet.atomVed(pt, Math.max(18, this.skala() * 0.34));
        if (type === "flyt") {
            this.over = a ? a.id : null;
            this.krogMarkoer = a && !this.loest && this.trin < 3 ? "pointer" : "default";
            return true;
        }
        if (type !== "ned" || this.loest) return true;
        if (!a) {
            if (this.trin === 1) this.status("Klik lige på et knæk eller en ende af figuren.");
            return true;
        }
        var hoejre = e && e.button === 2;
        if (this.trin === 1) {
            if (hoejre || this.c[a.id]) delete this.c[a.id];
            else this.c[a.id] = true;
            if (this.antalC() === this.braet.mol.atomer.length) {
                this.trin = 2;
                this.besked("Alle C-atomer er sat. Sæt nu H på hvert C.", "god");
                this.hjaelp = 0;
            }
        } else if (this.trin === 2) {
            var n = this.h[a.id] || 0;
            n = hoejre ? Math.max(0, n - 1) : Math.min(4, n + 1);
            this.h[a.id] = n;
            this.forkerte = null;
            if (this.beskedKlasse === "skidt") this.besked("", "");
            if (this.antalH() === this.totalH()) this.tjekH();
        }
        this.visPanel();
        return true;
    };

    P.tjekH = function () {
        var mig = this, forkerte = {};
        var n = 0;
        this.braet.mol.atomer.forEach(function (a) {
            if ((mig.h[a.id] || 0) !== mig.forventetH(a.id)) { forkerte[a.id] = true; n++; }
        });
        if (!n) {
            this.trin = 3;
            this.hjaelp = 0;
            this.besked("Alle H-atomer er rigtige. Skriv molekylformlen.", "god");
            var inp = NK.el("zz-input");
            inp.disabled = false;
            this.visPanel();
            inp.focus();
            return;
        }
        this.forkerte = forkerte;
        this.besked(n === 1 ? "Ét C-atom har forkert antal H. Det er markeret med rødt. Hvert C har fire bindinger i alt."
            : n + " C-atomer har forkert antal H. De er markeret med rødt. Hvert C har fire bindinger i alt.", "skidt");
    };

    P.tjekFormel = function () {
        if (this.retning !== "atomer" || this.trin !== 3 || this.loest) return;
        var inp = NK.el("zz-input");
        var r = NK.Tjek.formel(inp.value, this.braet.mol.atomer.length, this.totalH(), this.maal.res.antalDobbelt > 0);
        var felt = NK.el("zz-felt");
        if (r.ok) {
            this.loes(this.maal.res, this.visteSvar);
            this.besked("<b>Rigtigt: " + this.maal.formel + ".</b> " + (r.note ? NK.html(r.note) + " " : "") + "Molekylet hedder " + NK.html(this.maal.navnUden) + ".", "god");
            felt.classList.add("ok");
            inp.disabled = true;
            this.visPanel();
            return;
        }
        this.besked(NK.html(r.besked), r.tom ? "" : "skidt");
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Naeste molekyle -------------------------------- */
    P.knap = function () {
        if (this.loest) { this.naeste(); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + this.hint(), "gul");
            this.visPanel();
            return;
        }
        this.visSvar();
    };

    P.hint = function () {
        var m = this.maal, r = m.res;
        if (this.retning === "tegn") {
            this.hintKaede = true;
            return "Start med den længste kæde. Den er grøn på papiret: " + r.kaede.length + " C" +
                (r.antalDobbelt ? " med dobbeltbindingen" : "") + ". Tegn den først, og sæt så sidegrupperne på.";
        }
        if (this.trin === 1) return "Hvert knæk og hver ende er et C-atom. Der er " + m.antal + ".";
        if (this.trin === 2) return "Tæl bindingerne ved hvert C. En dobbeltbinding tæller for to. Resten op til fire er H.";
        return "Tæl C og H på tegningen, og skriv tallene efter bogstaverne, fx C5H12.";
    };

    P.visSvar = function () {
        var mig = this;
        if (this.retning === "tegn") {
            var m = this.maal.mol.kopi();
            m.centrer(0, 0.2);
            this.braet.saet(m, true);
            this.loes(NK.Navn.analyser(m), true);
            return;
        }
        this.visteSvar = true;
        this.braet.mol.atomer.forEach(function (a) { mig.c[a.id] = true; mig.h[a.id] = mig.forventetH(a.id); });
        this.forkerte = null;
        this.trin = 3;
        NK.el("zz-input").value = this.maal.formel.replace(/[₀-₉]/g, function (c) { return String(c.charCodeAt(0) - 8320); });
        this.loes(this.maal.res, true);
        this.besked("Svaret: <b>" + this.maal.formel + "</b>. Molekylet hedder " + NK.html(this.maal.navnUden) + ".", "gul");
        this.visPanel();
    };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        NK.el("zz-knap").addEventListener("click", function () { mig.knap(); });
        NK.el("zz-ok").addEventListener("click", function () { mig.tjekFormel(); });
        NK.el("zz-input").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); if (mig.loest) mig.knap(); else mig.tjekFormel(); }
        });
        NK.el("zz-forfra").addEventListener("click", function () {
            mig.serier[mig.retning] = nySerie(mig.retning === "tegn" ? O.ZIGZAG : O.ATOMER);
            mig.startOpgave();
        });
        Array.prototype.forEach.call(document.querySelectorAll("#zz-retning button"), function (k) {
            k.addEventListener("click", function () {
                if (mig.retning === k.getAttribute("data-v")) return;
                mig.retning = k.getAttribute("data-v");
                mig.startOpgave();
            });
        });
    };

    P.besked = function (html, klasse) {
        var e = NK.el("zz-besked");
        e.innerHTML = html;
        e.className = "besked" + (klasse ? " " + klasse : "");
        this.beskedKlasse = klasse;
    };

    P.visPanel = function () {
        var s = this.serie(), mig = this;
        var tegn = this.retning === "tegn";
        Array.prototype.forEach.call(document.querySelectorAll("#zz-retning button"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-v") === mig.retning);
        });
        NK.saetTekst("zz-titel", tegn ? "Tegn zigzagformlen" : "Sæt atomerne på");
        NK.saetTekst("zz-nr", String(s.nr + 1));
        NK.saetTekst("zz-spm", tegn ? "Strukturformlen hænger på tavlen. Tegn samme molekyle som zigzagformel." :
            "Sæt C og H på zigzagformlen, og skriv molekylformlen.");
        NK.el("zz-trinrad").hidden = tegn;
        if (!tegn) {
            Array.prototype.forEach.call(document.querySelectorAll("#zz-trinrad .trinprik"), function (p) {
                var t = +p.getAttribute("data-t");
                p.className = "trinprik" + (t === mig.trin && !mig.loest ? " nu" : "") + (t < mig.trin || mig.loest ? " faerdig" : "");
            });
        }
        var taelVis = tegn || this.trin < 3;
        NK.el("zz-taelrad").hidden = !taelVis;
        if (tegn) {
            NK.saetTekst("zz-taelnavn", "C-atomer");
            NK.saetTekst("zz-tael", this.braet.antal() + " af " + this.maal.antal);
        } else if (this.trin === 1) {
            NK.saetTekst("zz-taelnavn", "C-atomer");
            NK.saetTekst("zz-tael", this.antalC() + " af " + this.braet.mol.atomer.length);
        } else {
            NK.saetTekst("zz-taelnavn", "H-atomer");
            NK.saetTekst("zz-tael", this.antalH() + " af " + this.totalH());
        }
        var felt = NK.el("zz-felt");
        felt.hidden = tegn || this.trin < 3;
        if (!this.loest) { felt.classList.remove("ok"); NK.el("zz-input").disabled = false; }

        var knap = NK.el("zz-knap");
        if (this.loest) {
            knap.textContent = s.status.every(function (x) { return x > 0; }) ? "Ny serie ↺" : "Næste molekyle →";
            knap.className = "knap blaa banker";
        } else {
            knap.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            knap.className = "knap";
        }
        NK.el("zz-kort").classList.toggle("sejr", this.loest && !this.visteSvar);

        NK.saetTekst("zz-loest", String(s.status.filter(function (x) { return x > 0; }).length));
        NK.Fane.prikker("zz-prikker", s.status, s.nr, function (i) { s.mini = i; mig.visMini(); });
        this.visMini();
        this.visStatus();
    };

    P.visMini = function () {
        var s = this.serie();
        var i = s.mini;
        if (i < 0 || !s.status[i]) { NK.saetHTML("zz-mini", ""); return; }
        var m = s.liste[i];
        NK.saetHTML("zz-mini", NK.Fane.miniature(m.mol, m.res, 360, 150) + NK.html(m.navnUden) +
            '<span class="mini-note">Molekyle ' + (i + 1) + (s.status[i] === 2 ? ", svaret vist" : "") + "</span>");
    };

    P.visStatus = function () {
        if (this.loest) { this.status(D.STATUS.loest); return; }
        if (this.retning === "tegn") {
            var n = this.braet.antal();
            this.status(n <= 1 ? D.STATUS.tegnStart : (n >= this.maal.antal ? D.STATUS.tegnFuld : D.STATUS.tegnVidere));
            return;
        }
        this.status(this.trin === 1 ? D.STATUS.atomerC : (this.trin === 2 ? D.STATUS.atomerH : D.STATUS.atomerFormel));
    };

    P.enter = function () { if (this.loest) this.knap(); else if (this.retning === "atomer" && this.trin === 3) this.tjekFormel(); };
    P.fokus = function () { if (this.retning === "atomer" && this.trin === 3 && !this.loest) NK.el("zz-input").focus(); };

    /* ----- Tegning ----------------------------------------------------------------------- */
    P.opdaterEkstra = function () {
        if (this.retning === "tegn" && !this.loest) this.visPanelTael();
    };

    P.visPanelTael = function () {
        NK.saetTekst("zz-tael", this.braet.antal() + " af " + this.maal.antal);
        this.visStatus();
    };

    P.tegnFane = function (ctx) {
        var mig = this, b = this.braet;
        if (this.retning === "tegn" && this.papir) {
            NK.Tavle.papir(ctx, this.papir.r);
            var kaede = {};
            if (this.hintKaede || this.loest) {
                var res2 = NK.Navn.analyser(this.papirMol);
                if (res2.kaede) res2.kaede.forEach(function (id) { kaede[id] = true; });
            }
            NK.Struktur.tegn(ctx, this.papirMol, {
                skala: this.papir.sp, ox: this.papir.ox, oy: this.papir.oy, stil: "alle",
                skrift: Math.max(13, this.papir.sp * 0.4), farve: "#1d2433",
                atomFarve: function (id) { return kaede[id] ? GROEN : null; },
                bindingFarve: function (bd) { return kaede[bd.a] && kaede[bd.b] ? GROEN : null; }
            });
            b.tegn(ctx);
            return;
        }
        /* Zigzag -> strukturformel */
        var s = this.skala();
        b.tegn(ctx, { udenHaandtag: true, linje: Math.max(2.6, s * 0.06) });
        var fs = NK.klamp(s * 0.36, 13, 26);
        b.mol.atomer.forEach(function (a) {
            var p = b.px(a);
            var n = mig.h[a.id] || 0;
            if (n) {
                var rC = mig.c[a.id] ? fs * 0.55 : 0, rH = fs * 0.5, hl = s * 0.62;
                NK.Layout.hRetninger(b.mol, a.id, n).forEach(function (v) {
                    var ux = Math.cos(v * Math.PI / 180), uy = Math.sin(v * Math.PI / 180);
                    ctx.strokeStyle = "#1d2433";
                    ctx.lineWidth = Math.max(1.6, s * 0.035);
                    ctx.beginPath();
                    ctx.moveTo(p.x + ux * rC, p.y + uy * rC);
                    ctx.lineTo(p.x + ux * (hl - rH), p.y + uy * (hl - rH));
                    ctx.stroke();
                    NK.tekst(ctx, "H", p.x + ux * hl, p.y + uy * hl + 1, { justering: "center", linje: "middle",
                        font: "600 " + fs + "px 'Segoe UI', sans-serif", farve: BLAA });
                });
            }
            if (!mig.c[a.id] && mig.trin === 1) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, mig.over === a.id ? 11 : 8, 0, Math.PI * 2);
                ctx.fillStyle = mig.over === a.id ? "rgba(61, 158, 224, 0.55)" : "rgba(226, 232, 240, 0.95)";
                ctx.fill();
                ctx.strokeStyle = mig.over === a.id ? "#3d9ee0" : "#94a3b8";
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (mig.trin === 2 && mig.over === a.id && !mig.loest) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, fs * 0.9, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(61, 158, 224, 0.8)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            if (mig.forkerte && mig.forkerte[a.id]) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, fs * 1.0, 0, Math.PI * 2);
                ctx.strokeStyle = ROED;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    };

    /* Kemichaels praesentation */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.2-intro-zigzag", tilbud: "zz-tilbud", spring: "zz-spring" });
    P.pegPaaFelt = function () {};

    NK.SimZigzag = SimZigzag;
}());
