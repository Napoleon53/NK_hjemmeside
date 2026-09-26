/* =====================================================================
   sim_forudsig.js - fane 3: forudsig

   Spaendingsraekken fra bogen haenger foroven. En metalstang haenger i
   et stativ over et glas med en oploesning, fx nikkel over kobber(II)-
   sulfat. Eleven svarer foerst, om der sker noget. Saa kommer stangen
   ned, og glasset og luppen viser svaret. Sker der noget, vaelger eleven
   de to stoffer, der dannes, og afstemmer til sidst skemaet, saa der
   afgives lige saa mange elektroner, som der optages.

   De foerste tolv opgaver staar i D.OPGAVER, fra det lette til det
   svaere. Bagefter kommer tilfaeldige par af stang og oploesning.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_ROS = "nk-sc8.1-ros-forudsig";
    var NED = 0.8;               /* sekunder om at saenke stangen */
    var SE = 2.2;                /* sekunder i glasset, foer svaret vises */

    function SimForudsig() {
        this.L = new NK.Laerred(NK.el("fu-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.lup = new NK.Lup();
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.nr = -1;
        this.rigtige = 0;
        this.besvarede = 0;
        this.log = [];
        this.brugt = {};
        this.tilfaeldige = [];
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyOpgave();
    }

    var P = SimForudsig.prototype;

    /* ----- Opgaverne ------------------------------------------------------------------ */
    P.naestePar = function () {
        if (this.nr < D.OPGAVER.length) return D.OPGAVER[this.nr];
        var mig = this;
        if (!this.tilfaeldige.length) {
            this.tilfaeldige = NK.bland(K.alleOpgaver().filter(function (p) { return !mig.brugt[p.join("/")]; }));
            if (!this.tilfaeldige.length) {
                this.brugt = {};
                this.tilfaeldige = NK.bland(K.alleOpgaver());
            }
        }
        return this.tilfaeldige.shift();
    };

    P.nyOpgave = function () {
        this.nr++;
        this.par = this.naestePar();
        this.brugt[this.par.join("/")] = true;
        var m = this.par[0], i = this.par[1];
        this.reag = K.reagerer(m, i);
        this.r = this.reag ? K.reaktion(m, i) : null;
        this.fase = "gaet";
        this.hjaelp = 0;
        this.valgt = -1;
        this.forste = -1;
        this.markeret = false;
        this.ned = 0;            /* 0: stangen oppe, 1: nede i glasset */
        this.gTid = 0;
        this.gx = 0;
        this.bobler = [];
        this.boble = 0;
        this.produkter = [null, null];
        this.forkerteChips = {};
        this.chips = this.reag ? this.lavChips() : [];
        this.koef = ["", "", "", ""];
        this.lup.saet(null, i);
        this.besked("", "");
        this.svar("", "");
        this.visKort();
    };

    /* Stofferne, eleven kan vaelge imellem: de to rigtige, stangen og
       ionen, som de var, og H som atomer, naar der dannes H₂ */
    P.lavChips = function () {
        var r = this.r;
        var liste = [
            { tekst: r.stoffer[2], rigtig: 0 },
            { tekst: r.stoffer[3], rigtig: 1 },
            { tekst: r.m + "(s)", slags: "m" },
            { tekst: K.ion(r.i) + "(aq)", slags: "i" }
        ];
        if (r.gas) liste.push({ tekst: "H(g)", slags: "h" });
        return NK.bland(liste);
    };

    /* ----- Forudsigelsen ------------------------------------------------------------------ */
    P.gaet = function (n) {
        if (this.fase !== "gaet") return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = n;
        if (this.forste === -1) this.forste = n;
        this.fase = "koerer";
        this.gTid = 0;
        this.visKort();
    };

    P.vurder = function () {
        var rigtigSvar = this.reag ? 0 : 1;
        var rigtigt = this.valgt === rigtigSvar;
        this.besvarede++;
        if (this.forste === rigtigSvar) this.rigtige++;
        this.markeret = true;
        this.svar(NK.html(D.fuSvar(this.par[0], this.par[1], rigtigt)), rigtigt ? "god" : "skidt");
        this.hjaelp = 0;
        if (this.reag) {
            this.fase = "produkt";
        } else {
            this.fase = "faerdig";
            this.tilLog("intet sker", rigtigt);
            this.tjekRos();
        }
        this.visKort();
    };

    /* ----- Produkterne -------------------------------------------------------------------- */
    P.vaelgChip = function (n) {
        if (this.fase !== "produkt") return;
        var c = this.chips[n];
        if (!c || c.placeret || this.forkerteChips[n]) return;
        if (c.rigtig === undefined) {
            this.forkerteChips[n] = true;
            this.besked(NK.html(D.produktForkert(this.r, c.slags)), "skidt");
            this.visKort();
            return;
        }
        c.placeret = true;
        this.produkter[c.rigtig] = c.tekst;
        this.besked("", "");
        if (this.produkter[0] && this.produkter[1]) {
            this.fase = "koef";
            this.hjaelp = 0;
        }
        this.visKort();
        if (this.fase === "koef") this.fokus();
    };

    /* ----- Koefficienterne ------------------------------------------------------------------ */
    P.laesKoef = function () {
        var felter = this.el.skema.querySelectorAll("input");
        var mig = this;
        for (var n = 0; n < felter.length; n++) mig.koef[n] = felter[n].value;
        return this.koef.map(function (v) {
            var s = String(v).trim();
            return /^\d+$/.test(s) ? parseInt(s, 10) : NaN;
        });
    };

    P.tjekKoef = function () {
        if (this.fase !== "koef") return;
        var t = this.laesKoef();
        var svar = K.tjekKoef(this.r, t);
        if (svar.ok) {
            this.fase = "faerdig";
            this.besked(NK.html((this.hjaelp < 2 ? "Rigtigt. " : "") + D.koefBesked(this.r, svar)), "god");
            this.tilLog(K.skemaTekst(this.r, null, true), this.forste === 0);
            this.tjekRos();
            this.visKort();
            return;
        }
        this.besked(NK.html(D.koefBesked(this.r, svar)), "skidt");
        var s = this.el.skema.querySelector(".skemalinje");
        if (s) {
            s.classList.remove("ryst");
            void s.offsetWidth;
            s.classList.add("ryst");
        }
    };

    P.tilLog = function (tekst, rigtigt) {
        this.log.unshift({ par: this.par[0] + " i " + K.ion(this.par[1]), tekst: tekst, rigtigt: rigtigt });
        if (this.log.length > 6) this.log.pop();
        this.visLog();
    };

    P.tjekRos = function () {
        if (this.nr === D.OPGAVER.length - 1 && !NK.hent(NOEGLE_ROS, false)) {
            NK.gem(NOEGLE_ROS, true);
            this.ventRos = 1.4;
        }
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Naeste opgave ----------------------------------------- */
    P.knap = function () {
        if (this.fase === "faerdig") { this.nyOpgave(); return; }
        if (this.fase === "koerer") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var t;
            if (this.fase === "gaet") { t = D.fuHint(this.par[0], this.par[1]); this.markeret = true; }
            else if (this.fase === "produkt") t = D.produktHint(this.r);
            else t = D.koefHint(this.r);
            this.besked("<b>Hint:</b> " + NK.html(t), "gul");
            this.visKort();
            return;
        }
        this.hjaelp = 2;
        if (this.fase === "gaet") {
            if (this.forste === -1) this.forste = -2;
            this.gaet(this.reag ? 0 : 1);
            return;
        }
        if (this.fase === "produkt") {
            var mig = this;
            this.chips.forEach(function (c) {
                if (c.rigtig !== undefined) { c.placeret = true; mig.produkter[c.rigtig] = c.tekst; }
            });
            this.fase = "koef";
            this.besked("", "");
            this.visKort();
            return;
        }
        this.koef = this.r.koef.map(String);
        this.visKort();
        this.tjekKoef();
    };

    P.nulstil = function () {
        this.nr = -1;
        this.rigtige = 0;
        this.besvarede = 0;
        this.log = [];
        this.brugt = {};
        this.tilfaeldige = [];
        this.visLog();
        this.nyOpgave();
    };

    /* ----- Panelet ---------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("fu-knap"),
            besked: NK.el("fu-besked"),
            svar: NK.el("fu-svar"),
            kort: NK.el("fu-kort"),
            valg: NK.el("fu-valg"),
            skema: NK.el("fu-skema"),
            chips: NK.el("fu-chips")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("fu-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("fu-nulstil").addEventListener("click", function () { mig.nulstil(); });
        this.visLog();
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.svar = function (html, klasse) {
        this.el.svar.innerHTML = html;
        this.el.svar.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visKort = function () {
        var mig = this, fase = this.fase, m = this.par[0], i = this.par[1];
        NK.saetTekst("fu-titel", "Opgave " + (this.nr + 1));
        NK.saetTekst("fu-taeller", this.nr < D.OPGAVER.length ? (this.nr + 1) + "/" + D.OPGAVER.length : "ekstra");
        NK.saetTekst("fu-prompt", D.opgaveTekst(m, i));
        /* Spoergsmaalet over ja og nej, og det naeste over skemaet */
        var spm2 = "";
        if (fase === "produkt") spm2 = D.PRODUKT_SPM;
        else if (fase === "koef") spm2 = D.KOEF_SPM;
        NK.saetTekst("fu-spm", D.FU_SPM);
        NK.saetTekst("fu-spm2", spm2);

        /* Ja og nej */
        var vaert = this.el.valg;
        vaert.innerHTML = "";
        var rad = document.createElement("div");
        rad.className = "vaelgerrad";
        D.FU_VALG.forEach(function (tekst, n) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaelger";
            b.textContent = tekst;
            var rigtig = (mig.reag ? 0 : 1) === n;
            if (mig.markeret && fase !== "gaet" && fase !== "koerer") {
                if (rigtig) b.className += " rigtig";
                else if (n === mig.valgt || n === mig.forste) b.className += " forkert";
                b.disabled = true;
            } else if (n === mig.valgt) {
                b.className += " valgt";
                b.disabled = true;
            } else if (fase !== "gaet") b.disabled = true;
            b.addEventListener("click", function () { mig.gaet(n); });
            rad.appendChild(b);
        });
        vaert.appendChild(rad);

        /* Skemaet, der bygges op */
        this.bygSkema();

        /* Stofferne at vaelge imellem */
        var ch = this.el.chips;
        ch.innerHTML = "";
        if (fase === "produkt") {
            this.chips.forEach(function (c, n) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "chip" + (c.placeret ? " brugt" : "") + (mig.forkerteChips[n] ? " forkert" : "");
                b.textContent = c.tekst;
                b.disabled = !!(c.placeret || mig.forkerteChips[n]);
                b.addEventListener("click", function () { mig.vaelgChip(n); });
                ch.appendChild(b);
            });
        }

        var tekst, klasse = "knap";
        if (fase === "faerdig") { tekst = "Næste opgave →"; klasse = "knap blaa banker"; }
        else if (fase === "koerer") tekst = "Stangen går ned …";
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = fase === "koerer";
        this.el.kort.classList.toggle("sejr", fase === "faerdig");
    };

    /* Skemaet i panelet: foerst reaktanterne og to tomme pladser, saa
       felter til koefficienterne, til sidst det faerdige skema */
    P.bygSkema = function () {
        var vaert = this.el.skema, fase = this.fase, r = this.r, mig = this;
        vaert.innerHTML = "";
        if (!r || fase === "gaet" || fase === "koerer") return;
        var linje = document.createElement("div");
        linje.className = "skemalinje";
        function led(tekst, n) {
            var s = document.createElement("span");
            s.className = "led";
            if (fase === "koef") {
                var inp = document.createElement("input");
                inp.type = "text";
                inp.inputMode = "numeric";
                inp.maxLength = 2;
                inp.className = "koeffelt";
                inp.value = mig.koef[n];
                inp.setAttribute("aria-label", "Koefficient foran " + tekst);
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjekKoef(); }
                });
                inp.addEventListener("input", function () { mig.koef[n] = inp.value; });
                s.appendChild(inp);
            } else if (fase === "faerdig" && r.koef[n] !== 1) {
                var k = document.createElement("b");
                k.className = "koef";
                k.textContent = r.koef[n] + " ";
                s.appendChild(k);
            }
            var t = document.createElement("span");
            if (tekst === null) {
                t.className = "tomplads";
                t.textContent = "?";
            } else t.textContent = tekst;
            s.appendChild(t);
            linje.appendChild(s);
        }
        function tegn(t) {
            var s = document.createElement("span");
            s.className = "tegn";
            s.textContent = t;
            linje.appendChild(s);
        }
        led(r.stoffer[0], 0);
        tegn("+");
        led(r.stoffer[1], 1);
        tegn("⟶");
        led(fase === "produkt" ? this.produkter[0] : r.stoffer[2], 2);
        tegn("+");
        led(fase === "produkt" ? this.produkter[1] : r.stoffer[3], 3);
        if (fase === "koef") {
            var ok = document.createElement("button");
            ok.type = "button";
            ok.className = "felt-ok lille";
            ok.textContent = "Tjek";
            ok.addEventListener("click", function () { mig.tjekKoef(); });
            linje.appendChild(ok);
        }
        if (fase === "faerdig") linje.classList.add("faerdig");
        vaert.appendChild(linje);
    };

    P.visLog = function () {
        var h = "";
        this.log.forEach(function (l) {
            h += '<div class="logrk"><span class="logpar">' + NK.html(l.par) + '</span><span class="logtekst">' + NK.html(l.tekst) +
                "</span><span class=\"logmrk " + (l.rigtigt ? "ja" : "nej") + "\">" + (l.rigtigt ? "✓" : "✗") + "</span></div>";
        });
        NK.saetHTML("fu-log", h || '<p class="note">Her kommer dine svar.</p>');
        NK.saetTekst("fu-rigtige", this.rigtige + " af " + this.besvarede);
    };

    P.fokus = function () {
        if (this.fase !== "koef") return;
        var felter = this.el.skema.querySelectorAll("input");
        for (var n = 0; n < felter.length; n++) {
            if (!felter[n].value) { felter[n].focus(); return; }
        }
        if (felter.length) felter[0].focus();
    };

    P.visStatus = function () {
        var m = this.par[0], i = this.par[1], t;
        if (this.info) t = this.info.tekst;
        else if (this.fase === "gaet") t = "Stangen med " + m + " venter over glasset med " + K.ion(i) + ". Sker der noget, når den kommer ned?";
        else if (this.ned < 1 || this.gTid < 0.8) t = "Stangen går ned i glasset.";
        else t = "<b>" + m + " i " + K.ion(i) + ":</b> " + D.iagttagelse(m, i) + ".";
        NK.saetHTML("fu-status", t);
    };

    /* ----- Layout ----------------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.12, 44, 80));
        lay.kop = { x: kant + 22, y: lay.bordY };
        var rk = kant + Tg.RAEKKE_KANT;
        lay.raekke = { x: rk, y: 96, b: W - 2 * rk, h: NK.klamp(H * 0.058, 28, 40) };
        var under = lay.raekke.y + lay.raekke.h + 52;
        var R = NK.klamp(Math.min(W * 0.2, (lay.bordY - under - 40) / 2), 70, 185);
        lay.lup = { cx: W - kant - R - 8, cy: under + 6 + R, R: R };
        var venstre = kant + 90, hoejre = lay.lup.cx - R - 24;
        var gb = NK.klamp(Math.min((hoejre - venstre) * 0.55, (lay.bordY - under) / (1.2 * 2.25)), 70, 200);
        var gcx = (venstre + hoejre) / 2 + gb * 0.2;
        lay.glas = Tg.glasMaal(gcx, lay.bordY, gb);
        lay.stang = { b: Math.max(10, gb * 0.13), l: gb * 1.2 * 1.3 };
        lay.topOppe = lay.glas.top - lay.stang.l - 14;
        lay.topNede = lay.glas.bundY - gb * 1.2 * 0.07 - lay.stang.l;
        lay.stativ = { x: gcx - gb * 0.95, top: lay.topOppe - 20, bund: lay.bordY, tilX: gcx };
        lay.skiltPx = NK.klamp(Math.round((H - lay.bordY - 20) / 2.4), 11, 15);
        lay.px = NK.klamp(W * 0.014, 12, 15);
        this.lay = lay;
        var g = lay.glas;
        this.saetAnker("fu-anker-raekke", lay.raekke.x - 60, lay.raekke.y - 34, lay.raekke.b + 120, lay.raekke.h + 40);
        this.saetAnker("fu-anker-glas", lay.stativ.x - 44, lay.topOppe - 30, g.x + g.b - lay.stativ.x + 50, lay.H - lay.topOppe + 30);
        this.saetAnker("fu-anker-lup", lay.lup.cx - R - 4, lay.lup.cy - R - 4, 2 * R + 8, 2 * R + 8);
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

    /* ----- Opdater og tegn ----------------------------------------------------------------------------- */
    P.opdater = function (dt) {
        var m = this.par[0], i = this.par[1], lay = this.lay;
        this.tid += dt;
        if (this.fase !== "gaet") {
            var foer = this.ned;
            this.ned = Math.min(1, this.ned + dt / NED);
            if (this.ned >= 1) {
                if (foer < 1) this.lup.saet(m, i);
                this.gTid += dt;
                if (this.reag) this.gx = 0.75 * (1 - Math.exp(-this.gTid / K.tau(m, i)));
                if (this.fase === "koerer" && this.gTid >= SE) this.vurder();
                if (this.reag && this.r.gas && lay) {
                    this.boble += dt * 60 / K.tau(m, i);
                    var y0 = lay.glas.overflade + 8, y1 = lay.topNede + lay.stang.l - 4, k = lay.glas.k;
                    while (this.boble >= 1) {
                        this.boble -= 1;
                        var side = Math.random() < 0.5 ? -1 : 1;
                        this.bobler.push({
                            x: lay.glas.cx + side * (lay.stang.b / 2 + 1.5), y: NK.r(y0, y1),
                            r: NK.r(2, 4.4) * k * 2, vy: -NK.r(40, 75) * k * 2, a: 1
                        });
                    }
                }
            }
        }
        if (lay) {
            var ov = lay.glas.overflade;
            this.bobler.forEach(function (b) {
                b.y += b.vy * dt;
                b.x += Math.sin((b.y + b.x) * 0.2) * 6 * dt;
                if (b.y < ov + 2) b.a -= dt * 6;
            });
            this.bobler = this.bobler.filter(function (b) { return b.a > 0; });
        }
        this.lup.opdater(dt);
        if (this.info) {
            this.info.tid -= dt;
            if (this.info.tid <= 0 || this.fase !== "gaet") this.info = null;
        }
        if (this.pegValg > 0) this.pegValg -= dt;
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererReplik) this.laererReplik(D.ROS_FORUDSIG, true);
        }
        this.visStatus();
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var m = this.par[0], i = this.par[1];
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Raekken foroven. Maerkerne kommer med hintet eller svaret. */
        var v = {};
        if (this.markeret) {
            v.lys = {};
            v.lys[m] = true;
            v.lys[i] = true;
            v.maerker = [
                { sym: m, tekst: "stangen", farve: "#9fd0f5" },
                { sym: i, tekst: "ionerne", farve: "#f5c28a" }
            ];
            if (this.reag && this.fase !== "gaet" && this.fase !== "koerer") v.pil = { fra: m, til: i, tekst: "e⁻" };
        }
        Tg.raekke(ctx, lay.raekke, K.RAEKKE, v);

        /* Keglen til luppen */
        var g = lay.glas;
        Tg.zoomKegle(ctx, g.cx - lay.stang.b / 2 - 2, (g.overflade + g.bundY) / 2, lay.lup.cx, lay.lup.cy, lay.lup.R);

        /* Stativet, glasset og stangen */
        var t = NK.blod(this.ned);
        var top = NK.lerp(lay.topOppe, lay.topNede, t);
        var st = lay.stativ;
        var stang = { x: g.cx, top: top, b: lay.stang.b, l: lay.stang.l, metal: m, px: NK.klamp(lay.px, 12, 14) };
        if (this.reag && !this.r.gas && this.ned >= 1) {
            stang.belaeg = { metal: i, x: this.gx / 0.75, fra: g.overflade, frø: Tg.frø(m + i) };
        }
        var lag = Tg.oplLag(i, this.reag ? m : null, this.gx, this.r ? this.r.koef[0] / this.r.koef[1] : 0);
        var iGlasset = top + lay.stang.l > g.top;
        if (!iGlasset) Tg.stang(ctx, stang);
        Tg.glas(ctx, g, lag, {
            inde: function (c) {
                if (iGlasset) Tg.stang(c, stang);
                if (mig.bobler.length) Tg.bobler(c, mig.bobler);
            }
        });
        Tg.stativ(ctx, { x: st.x, top: st.top, bund: st.bund, armY: top + 12, tilX: st.tilX });
        Tg.glasSkilt(ctx, g.cx, lay.bordY + 16, K.ion(i), K.saltFormel(i), { px: lay.skiltPx });

        /* Luppen */
        var titel = this.ned >= 1 ? m + "-stangen i " + K.ion(i) : "Glasset med " + K.ion(i);
        this.lup.tegn(ctx, lay.lup.cx, lay.lup.cy, lay.lup.R, { titel: titel });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var r = lay.raekke;
        if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return { slags: "raekke" };
        var g = lay.glas;
        if (pt.x >= lay.stativ.x - 20 && pt.x <= g.x + g.b && pt.y >= lay.topOppe - 24 && pt.y <= lay.H) return { slags: "glas" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "kop" || s === "laerer" || (s === "glas" && mig.fase === "gaet") ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; });
        c.addEventListener("pointerup", function (e) { mig.klik(mig.L.punkt(e)); });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "glas" && this.fase === "gaet") {
            this.info = { tekst: "Svar først i panelet: sker der noget? Så kommer stangen ned.", tid: 3 };
            this.pegValg = 1.6;
        } else if (u.slags === "raekke") {
            this.info = { tekst: "Spændingsrækken: uædel til venstre, ædel til højre.", tid: 3 };
        }
    };

    /* J og N svarer ja og nej */
    P.tast = function (e) {
        if (this.fase !== "gaet") return false;
        if (e.key === "j" || e.key === "J") { this.gaet(0); return true; }
        if (e.key === "n" || e.key === "N") { this.gaet(1); return true; }
        return false;
    };

    P.enter = function () {
        if (this.fase === "faerdig") this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc8.1-intro-forudsig", tilbud: "fu-tilbud", spring: "fu-spring" });

    P.pegPaaFelt = function (til) { this.el.valg.classList.toggle("peg", !!til || this.pegValg > 0); };

    NK.SimForudsig = SimForudsig;
}());
