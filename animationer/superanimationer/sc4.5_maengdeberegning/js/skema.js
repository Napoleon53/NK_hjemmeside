/* =====================================================================
   skema.js - maengdeberegningsskemaet paa tavlen (alle tre faner)

   Oeverst staar reaktionsskemaet med en kolonne under hver formel og
   tre raekker: m (g), M (g/mol) og n (mol). En celle er kendt (tallet
   staar), spurgt (eleven skriver den) eller uden betydning (en graa
   streg). Tavlen, formlerne, de kendte tal og pilene tegnes paa
   laerredet; felterne, eleven skriver i, ligger oven paa som DOM.

   Pilene viser vejen: ned i den kolonne, hvor massen er kendt (/ M),
   tvaers over under n-raekken med forholdet mellem koefficienterne og
   op i den kolonne, hvor massen soeges (· M). En pil kommer frem, naar
   cellen, den foerer til, er fundet.

   Trinvis: kun det naeste felt er aabent (som den gamle c4.5). Frit:
   alle felter er aabne, men skemaet skal afstemmes foerst.

   Opgaven bygges med NK.Skema.lavOpgave og haves af fanen. Skemaet
   ved, hvordan hver celle regnes, og laver hint, trintekst og den paene
   beregning til panelet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var RAEKKER = ["m", "M", "n"];
    var ETIKET = { m: "m (g)", M: "M (g/mol)", n: "n (mol)" };
    var ENHED = { m: "g", M: "g/mol", n: "mol" };
    var FARVE = { kendt: "#3fae72", pil: "#2f6fc4", tekst: "#1c1f26", koef: "#d9731a" };

    function cid(j, raekke) { return j + "_" + raekke; }

    /* ----- Opgaven -------------------------------------------------------------
       spec: {
         r:        reaktionen (D.reaktion),
         givet:    { stof: masse i gram } - de kendte masser,
         kilde:    stoffet, de andre stofmaengder regnes ud fra,
         visM:     stoffer, hvis molarmasse staar i skemaet fra start,
         spoerg:   trinene: "afstem", "valg" (fane 3) eller [stof, raekke],
         afstem:   skemaet staar uden koefficienter, til eleven har afstemt
       }
       Modellen regner n og m for hvert led: en kendt masse giver n = m / M,
       de andre foelger kilden med forholdet mellem koefficienterne. */
    function lavOpgave(spec) {
        var r = spec.r;
        var o = { r: r, spec: spec, trin: [], celler: {}, afstemt: !spec.afstem, n: [], m: [], givet: {} };
        o.kilde = D.plads(r, spec.kilde);
        Object.keys(spec.givet).forEach(function (s) { o.givet[D.plads(r, s)] = spec.givet[s]; });
        var nk = o.givet[o.kilde] / D.stof(spec.kilde).Mv;
        r.led.forEach(function (l, j) {
            var st = D.stof(l.s);
            o.n[j] = o.givet[j] !== undefined ? o.givet[j] / st.Mv : nk * l.k / r.led[o.kilde].k;
            o.m[j] = o.givet[j] !== undefined ? o.givet[j] : o.n[j] * st.Mv;
        });
        var spurgt = {};
        spec.spoerg.forEach(function (t) {
            if (typeof t === "string") { o.trin.push(t); return; }
            var id = cid(D.plads(r, t[0]), t[1]);
            spurgt[id] = true;
            o.trin.push(id);
        });
        var visM = spec.visM || [];
        r.led.forEach(function (l, j) {
            RAEKKER.forEach(function (rk) {
                var id = cid(j, rk), rolle = "tom";
                if (spurgt[id]) rolle = "spoerg";
                else if (rk === "m" && o.givet[j] !== undefined) rolle = "givet";
                else if (rk === "M" && visM.indexOf(l.s) >= 0) rolle = "givet";
                var fra = rk === "M" ? "M" : (rk === "m" ? "n" : (o.givet[j] !== undefined ? "m" : "forhold"));
                o.celler[id] = { id: id, j: j, raekke: rk, rolle: rolle, fra: fra, status: rolle === "spoerg" ? "ukendt" : rolle, v: 0 };
            });
        });
        o.loest = {};
        return o;
    }

    /* ----- Skemaet ------------------------------------------------------------
       o: { vaert (DOM-laget til felterne), navn (til id'er),
            kald: { tjek(id), afstem(), klik(id) } } */
    function Skema(o) {
        this.vaert = o.vaert;
        this.navn = o.navn;
        this.kald = o.kald || {};
        this.opg = null;
        this.lay = null;
        this.trinvis = true;
        this.pile = [];
        this.fremhaev = null;
        this.aktiv = null;
        this.el = {};
        this.koefEl = [];
    }

    var P = Skema.prototype;

    P.saet = function (opg) {
        this.opg = opg;
        this.pile = [];
        this.fremhaev = null;
        this.aktiv = null;
        this.byg();
        if (this.rekt) this.layout(this.rekt, this.ctx);
    };

    P.stof = function (j) { return D.stof(this.opg.r.led[j].s); };
    P.celle = function (id) { return this.opg ? this.opg.celler[id] : null; };

    /* Trinet, der er det naeste: det foerste, der ikke er loest */
    P.naeste = function () {
        var o = this.opg;
        if (!o) return null;
        for (var i = 0; i < o.trin.length; i++) {
            var t = o.trin[i];
            if (t === "afstem") { if (!o.afstemt) return t; continue; }
            if (t === "valg") { if (!o.valgt) return t; continue; }
            var c = o.celler[t];
            if (c.status !== "ok" && c.status !== "svar") return t;
        }
        return null;
    };

    /* Er cellen aaben for eleven nu? */
    P.erAaben = function (id) {
        var o = this.opg, c = o.celler[id];
        if (!c || c.rolle !== "spoerg" || c.status === "ok" || c.status === "svar") return false;
        if (!o.afstemt) return false;
        if (this.trinvis) return this.naeste() === id;
        /* Frit: alt aabent, bortset fra det, der foerst kan regnes efter valget (fane 3) */
        var vi = o.trin.indexOf("valg");
        return vi < 0 || o.valgt || o.trin.indexOf(id) < vi;
    };

    P.faerdig = function () { return this.naeste() === null; };

    /* ----- Felterne (DOM) ---------------------------------------------------------- */
    P.byg = function () {
        var mig = this, o = this.opg;
        var vaert = this.vaert;
        vaert.innerHTML = "";
        this.el = {};
        this.koefEl = [];
        if (!o) return;
        /* Koefficienterne, naar skemaet skal afstemmes */
        if (!o.afstemt) {
            o.r.led.forEach(function (l, j) {
                var e = document.createElement("div");
                e.className = "koeffelt";
                e.innerHTML = '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" maxlength="2" aria-label="Koefficienten foran ' +
                    D.stof(l.s).f + '">';
                var inp = e.querySelector("input");
                inp.addEventListener("keydown", function (ev) {
                    if (ev.key === "Enter") { ev.preventDefault(); mig.enterKoef(j); }
                });
                inp.addEventListener("input", function () { e.classList.remove("forkert"); if (mig.kald.skriver) mig.kald.skriver("afstem"); });
                inp.addEventListener("focus", function () { mig.aktiv = "afstem"; });
                vaert.appendChild(e);
                mig.koefEl.push({ el: e, input: inp });
            });
        }
        /* Cellerne, eleven skal udfylde */
        Object.keys(o.celler).forEach(function (id) {
            var c = o.celler[id];
            if (c.rolle !== "spoerg") return;
            var e = document.createElement("div");
            var enhed = ENHED[c.raekke];
            var navn = { m: "Massen", M: "Molarmassen", n: "Stofmængden" }[c.raekke] + " af " + mig.stof(c.j).f;
            if (c.status === "ok" || c.status === "svar") {
                e.className = "skemafelt " + c.status;
                e.innerHTML = '<span class="sf-tal">' + mig.vaerdiTekst(id) + '</span><span class="sf-enhed">' + enhed +
                    '</span><span class="sf-maerke">' + (c.status === "ok" ? "✓" : "↩") + "</span>";
            } else if (mig.erAaben(id)) {
                e.className = "skemafelt aktiv" + (c.forkert ? " forkert" : "");
                e.innerHTML = '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + navn + ' i ' + enhed + '">' +
                    '<span class="sf-enhed">' + enhed + '</span><button type="button" class="sf-ok" tabindex="-1" aria-label="Tjek svaret">↵</button>';
                var inp = e.querySelector("input");
                if (c.udkast) inp.value = c.udkast;
                inp.addEventListener("keydown", function (ev) {
                    if (ev.key === "Enter") { ev.preventDefault(); if (mig.kald.tjek) mig.kald.tjek(id); }
                });
                inp.addEventListener("input", function () {
                    e.classList.remove("forkert");
                    c.forkert = false;
                    c.udkast = inp.value;
                    if (mig.kald.skriver) mig.kald.skriver(id);
                });
                inp.addEventListener("focus", function () { mig.aktiv = id; });
                e.querySelector(".sf-ok").addEventListener("click", function () { if (mig.kald.tjek) mig.kald.tjek(id); });
                c.input = inp;
            } else {
                e.className = "skemafelt laast";
                e.innerHTML = '<span class="sf-laas" aria-hidden="true"></span>';
                e.addEventListener("click", function () { if (mig.kald.klik) mig.kald.klik(id); });
                c.input = null;
            }
            e.setAttribute("data-celle", id);
            mig.el[id] = e;
            vaert.appendChild(e);
        });
        this.placer();
    };

    /* ----- Layout -----------------------------------------------------------------
       rekt: tavlens indre, hvor skemaet staar. */
    P.layout = function (rekt, ctx) {
        this.rekt = rekt;
        this.ctx = ctx;
        var o = this.opg;
        if (!o) return;
        var n = o.r.led.length;
        var lay = {};
        var labelB = NK.klamp(rekt.b * 0.19, 70, 160);
        var tegnB = NK.klamp(rekt.b * 0.045, 16, 44);
        var kolB = (rekt.b - labelB - (n - 1) * tegnB) / n;
        kolB = Math.min(kolB, 200);
        var samlet = labelB + n * kolB + (n - 1) * tegnB;
        lay.x0 = rekt.x + (rekt.b - samlet) / 2;
        lay.labelB = labelB;
        lay.kolB = kolB;
        lay.tegnB = tegnB;
        /* Hoejderne: hovedet, tre raekker og plads under til pilene paa tvaers */
        var pilPlads = NK.klamp(rekt.h * 0.2, 34, 110);
        var rh = NK.klamp((rekt.h - pilPlads) / 4.25, 30, 84);
        lay.rh = rh;
        lay.hovedH = rh * 1.25;
        lay.y0 = rekt.y;
        lay.formelPx = Math.round(NK.klamp(Math.min(rh * 0.56, kolB * 0.2), 15, 36));
        lay.hovedY = lay.y0 + lay.hovedH * 0.5;
        lay.raekkeY = {};
        RAEKKER.forEach(function (rk, i) { lay.raekkeY[rk] = lay.y0 + lay.hovedH + rh * (i + 0.5); });
        lay.bund = lay.y0 + lay.hovedH + 3 * rh;
        lay.pilBund = Math.min(rekt.y + rekt.h, lay.bund + pilPlads);
        lay.midter = [];
        for (var j = 0; j < n; j++) lay.midter.push(lay.x0 + labelB + j * (kolB + tegnB) + kolB / 2);
        lay.tegnX = [];
        for (j = 0; j < n - 1; j++) lay.tegnX.push(lay.x0 + labelB + (j + 1) * kolB + j * tegnB + tegnB / 2);
        lay.feltB = Math.round(NK.klamp(kolB - 2 * NK.klamp(kolB * 0.12, 8, 24), 58, 156));
        lay.feltH = Math.round(NK.klamp(rh * 0.66, 26, 48));
        lay.feltPx = Math.round(NK.klamp(lay.feltH * 0.42, 14, 20));
        lay.smal = lay.feltB < 104;
        lay.rekt = { x: lay.x0, y: lay.y0, b: samlet, h: lay.bund - lay.y0 };
        this.lay = lay;
        this.placer();
    };

    P.feltRekt = function (id) {
        var lay = this.lay, c = this.celle(id);
        if (!lay || !c) return null;
        var x = lay.midter[c.j], y = lay.raekkeY[c.raekke];
        return { x: x - lay.feltB / 2, y: y - lay.feltH / 2, b: lay.feltB, h: lay.feltH, cx: x, cy: y };
    };

    P.placer = function () {
        var lay = this.lay, o = this.opg, mig = this;
        if (!lay || !o) return;
        this.vaert.classList.toggle("smal", lay.smal);
        Object.keys(this.el).forEach(function (id) {
            var r = mig.feltRekt(id), e = mig.el[id];
            e.style.left = Math.round(r.x) + "px";
            e.style.top = Math.round(r.y) + "px";
            e.style.width = Math.round(r.b) + "px";
            e.style.height = Math.round(r.h) + "px";
            e.style.fontSize = lay.feltPx + "px";
        });
        if (this.koefEl.length) {
            var ctx = this.ctx;
            if (ctx) ctx.font = Tg.font("700", lay.formelPx);
            var kb = Math.round(NK.klamp(lay.formelPx * 1.4, 30, 44));
            this.koefEl.forEach(function (k, j) {
                var fb = ctx ? ctx.measureText(mig.stof(j).formel).width : 40;
                k.el.style.width = kb + "px";
                k.el.style.height = Math.round(kb * 1.02) + "px";
                k.el.style.left = Math.round(lay.midter[j] - (fb + kb + 6) / 2) + "px";
                k.el.style.top = Math.round(lay.hovedY - kb * 0.52) + "px";
            });
        }
    };

    /* ----- Fokus ------------------------------------------------------------------- */
    P.fokus = function () {
        var o = this.opg;
        if (!o) return;
        var inp = null, mig = this;
        if (!o.afstemt) {
            this.koefEl.forEach(function (k) { if (!inp && !k.input.value) inp = k.input; });
            if (!inp && this.koefEl[0]) inp = this.koefEl[0].input;
        } else {
            var a = this.aktiv && this.celle(this.aktiv);
            if (a && a.input && this.erAaben(a.id)) inp = a.input;
            if (!inp) {
                var nx = this.naeste();
                var c = nx && this.celle(nx);
                if (c && c.input) inp = c.input;
            }
            if (!inp) {
                Object.keys(o.celler).forEach(function (id) {
                    var c2 = o.celler[id];
                    if (!inp && c2.input && mig.erAaben(id)) inp = c2.input;
                });
            }
        }
        if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }
    };

    /* ----- Afstemningen -------------------------------------------------------------- */
    P.koefVaerdier = function () { return this.koefEl.map(function (k) { return k.input.value; }); };

    P.enterKoef = function (j) {
        /* Tomme felter: Enter gaar videre til det naeste */
        var tom = null;
        this.koefEl.forEach(function (k, i) { if (tom === null && i > j && !k.input.value.trim()) tom = i; });
        if (tom === null) this.koefEl.forEach(function (k, i) { if (tom === null && !k.input.value.trim()) tom = i; });
        if (tom !== null) { this.koefEl[tom].input.focus(); return; }
        if (this.kald.afstem) this.kald.afstem();
    };

    P.tjekKoef = function () { return Tj.koefficienter(this.koefVaerdier(), this.opg.r); };

    P.rystKoef = function () {
        this.koefEl.forEach(function (k) {
            k.el.classList.remove("ryst");
            void k.el.offsetWidth;
            k.el.classList.add("ryst", "forkert");
        });
    };

    /* Skemaet er afstemt (maade: "ok" eller "svar") */
    P.afstem = function (maade) {
        this.opg.afstemt = true;
        this.opg.afstemMaade = maade;
        this.byg();
    };

    P.visKoefSvar = function () {
        var r = this.opg.r;
        this.koefEl.forEach(function (k, j) { k.input.value = String(r.led[j].k); });
    };

    /* ----- Modellen for hver celle ------------------------------------------------------
       Den vaerdi, cellen har, og tjekket af det, eleven skriver. */
    P.vaerdi = function (id) {
        var o = this.opg, c = o.celler[id], st = this.stof(c.j);
        if (c.raekke === "M") return st.Mv;
        if (c.raekke === "n") return o.n[c.j];
        return o.m[c.j];
    };

    P.vaerdiTekst = function (id) {
        var c = this.celle(id), st = this.stof(c.j);
        if (c.raekke === "M") return D.tekstMolar(st);
        if (c.raekke === "n") return D.tekstN(this.vaerdi(id));
        return D.tekstMasse(this.vaerdi(id));
    };

    /* Kildens plads for en stofmaengde, der regnes med koefficienterne */
    P.kildeFor = function () { return this.opg.kilde; };

    P.tjek = function (id, raa) {
        var o = this.opg, c = o.celler[id], st = this.stof(c.j), l = o.r.led[c.j];
        if (c.raekke === "M") return Tj.molar(raa, { st: st, k: l.k });
        var k = this.kildeFor(c.j), ks = this.stof(k), kl = o.r.led[k];
        var mKilde = o.givet[k];
        if (c.raekke === "n") {
            if (c.fra === "m") return Tj.nFraM(raa, { st: st, m: o.givet[c.j], k: l.k });
            var andre = [];
            o.r.led.forEach(function (x, j) { if (j !== c.j && j !== k) andre.push({ st: D.stof(x.s), n: o.n[j] }); });
            return Tj.nFraForhold(raa, { st: st, kilde: ks, nKilde: o.n[k], kj: l.k, kk: kl.k, mKilde: mKilde, andre: andre });
        }
        return Tj.mFraN(raa, { st: st, n: o.n[c.j], k: l.k, kilde: ks, mKilde: mKilde, nKilde: o.n[k], kj: l.k, kk: kl.k });
    };

    /* Cellen er fundet (maade: "ok" eller "svar"). Pilen, der foerer til den,
       kommer frem. */
    P.loes = function (id, maade) {
        var c = this.celle(id);
        c.status = maade;
        c.forkert = false;
        this.opg.loest[id] = maade;
        if (c.raekke === "n" && c.fra === "m") this.pile.push({ slags: "ned", j: c.j, t: 0 });
        if (c.raekke === "n" && c.fra === "forhold") this.pile.push({ slags: "tvaers", fra: this.kildeFor(c.j), j: c.j, t: 0 });
        if (c.raekke === "m") this.pile.push({ slags: "op", j: c.j, t: 0 });
        if (this.aktiv === id) this.aktiv = null;
        this.fremhaev = null;
        this.byg();
    };

    P.markerForkert = function (id) {
        var c = this.celle(id), e = this.el[id];
        c.forkert = true;
        if (e) {
            e.classList.remove("ryst");
            void e.offsetWidth;
            e.classList.add("ryst", "forkert");
        }
    };

    P.skrevet = function (id) {
        var c = this.celle(id);
        return c && c.input ? c.input.value : "";
    };

    /* ----- Tekster ------------------------------------------------------------------- */
    function broek(op, ned) {
        return '<span class="broek"><span>' + op + '</span><span>' + ned + '</span></span>';
    }
    Skema.broek = broek;

    P.navnHTML = function (raekke, j) { return raekke + "(" + this.stof(j).formel + ")"; };

    /* Den paene beregning, som den skal skrives */
    P.regnHTML = function (id) {
        var o = this.opg, c = o.celler[id], st = this.stof(c.j), l = o.r.led[c.j];
        var res = "<b>" + this.vaerdiTekst(id) + " " + ENHED[c.raekke] + "</b>";
        if (c.raekke === "M") {
            var led = D.molarLed(st);
            if (led === D.tekstMolar(st) + " g/mol") return "M(" + st.formel + ") = " + res;
            return "M(" + st.formel + ") = " + led + " = " + res;
        }
        if (c.raekke === "n" && c.fra === "m") {
            return "n(" + st.formel + ") = " + broek("m(" + st.formel + ")", "M(" + st.formel + ")") + " = " +
                broek(D.tekstMasse(o.givet[c.j]) + " g", D.tekstMolar(st) + " g/mol") + " = " + res;
        }
        var k = this.kildeFor(c.j), ks = this.stof(k), kl = o.r.led[k];
        if (c.raekke === "n") {
            return "n(" + st.formel + ") = " + broek(l.k, kl.k) + " · n(" + ks.formel + ") = " + broek(l.k, kl.k) + " · " +
                D.tekstN(o.n[k]) + " mol = " + res;
        }
        return "m(" + st.formel + ") = n(" + st.formel + ") · M(" + st.formel + ") = " + D.tekstN(o.n[c.j]) + " mol · " +
            D.tekstMolar(st) + " g/mol = " + res;
    };

    /* Hintet: formlen og hvor tallene staar */
    P.hintHTML = function (id) {
        var o = this.opg;
        if (id === "afstem") return D.AFSTEM_HINT[o.r.id] || "Tæl atomerne af hvert grundstof på begge sider.";
        var c = o.celler[id], st = this.stof(c.j), l = o.r.led[c.j], F = st.formel;
        if (c.raekke === "M") {
            var dele = Object.keys(st.antal).map(function (g) {
                var a = st.antal[g];
                return (a > 1 ? a + " · " : "") + NK.komma(D.ATOMMASSE[g]);
            });
            return "Læg atommasserne sammen: M(" + F + ") = (" + dele.join(" + ") + ") g/mol.";
        }
        if (c.raekke === "n" && c.fra === "m") {
            return "n = m / M. Massen og molarmassen af " + F + " står i skemaet.";
        }
        var k = this.kildeFor(c.j), K = this.stof(k).formel, kl = o.r.led[k];
        if (c.raekke === "n") {
            return "n(" + F + ") = " + broek(l.k, kl.k) + " · n(" + K + "). Koefficienten for " + F + " står øverst.";
        }
        return "m = n · M. Brug n(" + F + ") og M(" + F + ") fra skemaet.";
    };

    /* Det naeste skridt i én saetning */
    P.trinTekst = function (id) {
        if (!id) return "";
        if (id === "afstem") return "Afstem skemaet: skriv koefficienterne foran formlerne.";
        if (id === "valg") return "";
        var c = this.celle(id), F = this.stof(c.j).formel;
        if (c.raekke === "M") return "Skriv molarmassen af " + F + ".";
        if (c.raekke === "n" && c.fra === "m") return "Skriv stofmængden af " + F + ".";
        if (c.raekke === "n") return "Gå over til " + F + ": skriv stofmængden af " + F + ".";
        return "Skriv massen af " + F + ".";
    };

    /* ----- Tegning ------------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.pile.forEach(function (p) { p.t = Math.min(1, p.t + dt / 0.55); });
    };

    P.tegn = function (ctx, tid) {
        var lay = this.lay, o = this.opg, mig = this;
        if (!lay || !o) return;
        var r = o.r;
        ctx.save();
        ctx.textBaseline = "middle";
        /* Hovedet: formlerne med koefficienter og tegnene mellem dem */
        r.led.forEach(function (l, j) {
            var st = D.stof(l.s), mx = lay.midter[j];
            ctx.font = Tg.font("700", lay.formelPx);
            var fb = ctx.measureText(st.formel).width;
            ctx.textAlign = "left";
            if (!o.afstemt) {
                var kb = NK.klamp(lay.formelPx * 1.4, 30, 44);
                ctx.fillStyle = FARVE.tekst;
                ctx.fillText(st.formel, mx - (fb + kb + 6) / 2 + kb + 6, lay.hovedY);
                return;
            }
            var kt = l.k > 1 ? String(l.k) + " " : "";
            ctx.font = Tg.font("800", lay.formelPx);
            var kbb = ctx.measureText(kt).width;
            var sx = mx - (fb + kbb) / 2;
            ctx.fillStyle = o.afstemMaade === "svar" ? "#b8861a" : FARVE.koef;
            ctx.fillText(kt, sx, lay.hovedY);
            ctx.font = Tg.font("700", lay.formelPx);
            ctx.fillStyle = FARVE.tekst;
            ctx.fillText(st.formel, sx + kbb, lay.hovedY);
        });
        ctx.font = Tg.font("700", lay.formelPx);
        ctx.fillStyle = "#6a7080";
        ctx.textAlign = "center";
        lay.tegnX.forEach(function (x, i) {
            ctx.fillText(r.led[i].side === 0 && r.led[i + 1].side === 1 ? "⟶" : "+", x, lay.hovedY);
        });
        /* Linjerne */
        var xa = lay.x0, xb = lay.x0 + lay.rekt.b;
        ctx.fillStyle = "#2c3340";
        ctx.fillRect(xa, lay.y0 + lay.hovedH - 1.5, xb - xa, 3);
        ctx.fillStyle = "rgba(40, 46, 58, 0.16)";
        for (var i = 1; i < 3; i++) ctx.fillRect(xa, lay.y0 + lay.hovedH + i * lay.rh - 0.5, xb - xa, 1);
        ctx.fillRect(lay.x0 + lay.labelB - 6, lay.y0 + lay.hovedH, 1.5, 3 * lay.rh);
        /* Raekkernes navne. De slutter foer etiketten paa pilen ned i foerste
           kolonne (/ M), saa den ikke daekker enheden. */
        var etiketPlads = lay.midter[0] - lay.feltB / 2 - 5 - lay.rh * 0.34 - 22 - (lay.x0 + 2);
        var navnB = Math.max(40, Math.min(lay.labelB - 12, etiketPlads));
        RAEKKER.forEach(function (rk) {
            ctx.textAlign = "left";
            NK.passendeSkrift(ctx, ETIKET[rk], navnB, NK.klamp(lay.rh * 0.34, 12, 19), 10, "700");
            ctx.fillStyle = "#2a5d9c";
            ctx.fillText(ETIKET[rk], lay.x0 + 2, lay.raekkeY[rk]);
        });
        /* Cellerne, der tegnes: de kendte tal og stregerne */
        Object.keys(o.celler).forEach(function (id) {
            var c = o.celler[id], x = lay.midter[c.j], y = lay.raekkeY[c.raekke];
            if (c.rolle === "tom") {
                ctx.fillStyle = "rgba(60, 66, 80, 0.28)";
                ctx.fillRect(x - 9, y - 1, 18, 2.5);
                return;
            }
            if (c.rolle !== "givet") return;
            var tekst = mig.vaerdiTekst(id);
            if (c.raekke === "m") {
                /* Den kendte masse: groen stiplet boks, som i sc4.4 */
                var fb = lay.feltB, fh = lay.feltH;
                ctx.fillStyle = "rgba(63, 174, 114, 0.14)";
                NK.rundtRekt(ctx, x - fb / 2, y - fh / 2, fb, fh, 6);
                ctx.fill();
                ctx.strokeStyle = FARVE.kendt;
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = "#1f6e45";
                ctx.textAlign = "center";
                NK.passendeSkrift(ctx, tekst + " g", fb - 10, NK.klamp(lay.feltH * 0.46, 13, 22), 10, "800");
                ctx.fillText(tekst + " g", x, y + 1);
            } else {
                ctx.fillStyle = "#3a4150";
                ctx.textAlign = "center";
                NK.passendeSkrift(ctx, tekst, lay.feltB - 10, NK.klamp(lay.feltH * 0.44, 13, 21), 10, "700");
                ctx.fillText(tekst, x, y + 1);
            }
        });
        ctx.restore();
        this.tegnPile(ctx, tid);
    };

    /* Pilene for vejen. Nedad i en kolonne til venstre for feltet, op til
       hoejre for feltet og paa tvaers under n-raekken. */
    P.tegnPile = function (ctx, tid) {
        var lay = this.lay, o = this.opg, mig = this;
        if (!lay) return;
        var hb = lay.feltB / 2, px = NK.klamp(lay.rh * 0.3, 12, 14);
        var yM = lay.raekkeY.m, yN = lay.raekkeY.n;
        var sidst = this.pile.length - 1;
        this.pile.forEach(function (p, i) {
            var v = { t: p.t, lys: i === sidst ? 0 : 0 };
            var et = { alfa: NK.klamp((p.t - 0.6) / 0.4, 0, 1), px: px };
            var x = lay.midter[p.j];
            if (p.slags === "ned") {
                var xs = x - hb - 5;
                Tg.rutePil(ctx, xs, yM + 4, xs, yN - 4, xs - lay.rh * 0.55, (yM + yN) / 2, v);
                Tg.pilEtiket(ctx, xs - lay.rh * 0.34, (yM + yN) / 2, { tekst: "/ M" }, et);
            } else if (p.slags === "op") {
                var xo = x + hb + 5;
                Tg.rutePil(ctx, xo, yN - 4, xo, yM + 4, xo + lay.rh * 0.55, (yM + yN) / 2, v);
                Tg.pilEtiket(ctx, xo + lay.rh * 0.34, (yM + yN) / 2, { tekst: "· M" }, et);
            } else {
                /* Flere pile fra samme kilde spredes: de laengste gaar dybest og
                   starter laengst ude i feltet */
                var x0 = lay.midter[p.fra], x1 = x;
                var y0 = yN + lay.feltH / 2 + 3;
                var afst = Math.abs(x1 - x0) / (lay.kolB + lay.tegnB);
                var dyb = Math.min(20 + afst * 26, (lay.pilBund - y0) * 1.9);
                var ud = NK.klamp((afst - 1) * 14, 0, lay.feltB * 0.4);
                var sx0 = x0 + (x1 > x0 ? 1 : -1) * (10 + ud);
                Tg.rutePil(ctx, sx0, y0, x1 + (x1 > x0 ? -10 : 10), y0, (sx0 + x1) / 2, y0 + dyb, v);
                var l = o.r.led[p.j], k = o.r.led[p.fra];
                /* Etiketten sidder taet paa maalet, saa pilene ikke deler etiket */
                var ex1 = x1 + (x1 > x0 ? -10 : 10), kx = (sx0 + ex1) / 2;
                Tg.pilEtiket(ctx, 0.04 * sx0 + 0.32 * kx + 0.64 * ex1, y0 + 0.32 * dyb, { pre: "·", op: l.k, ned: k.k }, et);
            }
        });
        /* Hintet: den celle, der skal udfyldes, og det, den regnes fra */
        if (this.fremhaev) {
            var puls = 0.55 + 0.45 * Math.sin(tid * 6);
            var c = this.celle(this.fremhaev);
            if (c) {
                var fra = [];
                if (c.raekke === "n" && c.fra === "m") fra = [c.j + "_m", c.j + "_M"];
                else if (c.raekke === "n") fra = [this.kildeFor(c.j) + "_n"];
                else if (c.raekke === "m") fra = [c.j + "_n", c.j + "_M"];
                ctx.save();
                ctx.strokeStyle = "rgba(214, 150, 20, " + (0.5 + 0.5 * puls) + ")";
                ctx.lineWidth = 3;
                fra.forEach(function (id) {
                    var r = mig.feltRekt(id);
                    NK.rundtRekt(ctx, r.x - 4, r.y - 4, r.b + 8, r.h + 8, 8);
                    ctx.stroke();
                });
                ctx.restore();
            }
        }
    };

    Skema.lavOpgave = lavOpgave;
    Skema.ENHED = ENHED;
    NK.Skema = Skema;
}());
