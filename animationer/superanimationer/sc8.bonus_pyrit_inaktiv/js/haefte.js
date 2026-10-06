/* =====================================================================
   haefte.js - haeftet: reaktionsskemaet skrevet som i haanden

   Samme opskrivning som i sc8.5 (Kaliumpermanganat): skemaet staar paa
   ternet papir, oxidationstallet staar over de atomer, der skifter,
   en klamme gaar under skemaet fra atomet foer pilen til det samme
   grundstof efter pilen (kun dér har klammen en pilespids), og midt paa
   klammen, under reaktionspilen, staar stigningen (↑) eller faldet (↓)
   for ét atom med gangetallet og antallet af atomer foran:
   "2 · 2 S ↑7 = 28" og "7 · 2 O ↓2 = 28" (2 FeS₂ med 2 S, der hver
   stiger 7). Antallet af atomer taeller eleven selv, og imens lyser det
   lille tal i formlen (S₂).
   Under hver side staar ladningen, H-atomerne og til sidst O-atomerne
   som kontrol.

   Nyt i forhold til sc8.5: en formel kan have flere maerkede atomer
   (FeS₂ har Fe med blyant og S som felt), der kan vaere flere end to
   klammer, og et stof, der foelger med uden at skifte, faar sit tal i
   et felt foran formlen.

   Haeftet tegner kun det, fanen (js/sim_haefte.js) siger: hvilke
   felter der er aktive, hvilke tal der er fundet, og hvad der endnu
   ikke er naaet. Felterne bygges én gang pr. reaktion, saa det, eleven
   skriver, bliver staaende, mens haeftet tegnes om.

   Noeglerne til felterne:
     ox<led>_<E>     oxidationstallet over atomet E i led nr.
     for<led>        tallet foran et led (forafstemning og det, der foelger med)
     kl<k>, g<k>     stigningen eller faldet og gangetallet ved klamme k
     n<k>            antallet af atomer i formlen foer pilen ved klamme k
     lad-v, lad-h    ladningen foer og efter pilen
     ion-v, ion-h    H⁺ foer og efter pilen
     brint-v, brint-h  H-atomerne foer og efter pilen
     vand-v, vand-h  H₂O foer og efter pilen
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var X = NK.Redox;
    var lav = NK.Formel.lav;

    function Haefte(el) {
        this.el = el;
        this.felter = {};
        this.vis = null;
        this.fs = 36;
    }

    var P = Haefte.prototype;

    /* ----- Et felt: et lille indtastningsfelt med en ramme ------------------------- */
    P.lavFelt = function (noegle, klasse, aria) {
        var mig = this;
        var f = lav("span", "hf-felt " + (klasse || ""));
        var inp = document.createElement("input");
        inp.type = "text";
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.setAttribute("aria-label", aria);
        inp.setAttribute("data-noegle", noegle);
        inp.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); if (mig.vedEnter) mig.vedEnter(noegle); return; }
            if (mig.vedTast && mig.vedTast(noegle, e)) e.preventDefault();
        });
        inp.addEventListener("input", function () {
            f.classList.remove("fejl");
            if (mig.vedInput) mig.vedInput(noegle, inp);
        });
        f.appendChild(inp);
        this.felter[noegle] = { felt: f, inp: inp };
        return f;
    };

    P.inp = function (noegle) { var f = this.felter[noegle]; return f ? f.inp : null; };

    P.ryst = function (noegle) {
        var f = this.felter[noegle];
        if (!f) return;
        f.felt.classList.remove("fejl");
        void f.felt.offsetWidth;
        f.felt.classList.add("fejl");
    };

    /* ----- Byg haeftet til en reaktion --------------------------------------------------- */
    P.byg = function (opg) {
        var mig = this, R = opg.R, el = this.el;
        this.opg = opg;
        this.felter = {};
        el.innerHTML = "";
        el.classList.remove("faerdig");

        this.navnEl = lav("div", "hf-navn");
        el.appendChild(this.navnEl);

        /* Maaleelementet: det faerdige skema i samme skrift, saa skriften kan
           vaelges, saa det hele kan staa paa én linje, ogsaa til sidst */
        this.maal = lav("span", "hf-maal", X.skemaTekst(R) + (R.miljoe ? " + 00 H₂O" : " 00"));
        el.appendChild(this.maal);

        var skema = lav("div", "hf-skema");
        this.skema = skema;
        this.led = [];
        var sider = { v: [], h: [] };
        R.led.forEach(function (l) { sider[l.side].push(l); });

        ["v", "h"].forEach(function (side) {
            sider[side].forEach(function (l, j) {
                if (j > 0) skema.appendChild(lav("span", "hf-plus", "+"));
                var led = lav("span", "hf-led");
                var koef = lav("span", "hf-koef");
                var koefTal = lav("span", "hf-koeftal");
                koef.appendChild(koefTal);
                koef.appendChild(mig.lavFelt("for" + l.nr, "for", "Tallet foran " + l.st.tekst));
                led.appendChild(koef);
                var formel = lav("span", "hf-formel");
                led.appendChild(formel);
                skema.appendChild(led);
                /* De maerkede atomer, i formlens raekkefoelge */
                var maerker = {}, set = {};
                l.st.atomer.forEach(function (a, i) {
                    if (R.maerker[l.nr][a.s] && !set[a.s]) { maerker[i] = R.maerker[l.nr][a.s]; set[a.s] = true; }
                });
                var pladser = NK.Formel.byg(formel, l.st, maerker, {
                    noegle: function (nr, a) { return "ox" + l.nr + "_" + a.s; },
                    felt: function (noegle, a) { return mig.lavFelt(noegle, "ox", "Oxidationstallet for " + a.s + " i " + l.st.tekst); }
                });
                mig.led[l.nr] = { el: led, koef: koef, koefTal: koefTal, formel: formel, l: l, pladser: pladser };
            });
            /* H⁺ og vand bagerst paa siden */
            ["ion", "vand"].forEach(function (slags) {
                var x = lav("span", "hf-ekstra " + slags);
                x.appendChild(lav("span", "hf-plus", "+"));
                x.appendChild(mig.lavFelt(slags + "-" + side, slags, (slags === "ion" ? R.ionSt.tekst : "H₂O") + (side === "v" ? " før pilen" : " efter pilen")));
                x.appendChild(lav("span", "hf-tal"));
                x.appendChild(lav("span", "hf-fx", slags === "ion" ? R.ionSt.tekst : "H₂O"));
                skema.appendChild(x);
                mig[slags + side] = x;
            });
            if (side === "v") {
                mig.pil = lav("span", "hf-pil");
                mig.pil.setAttribute("aria-label", "reaktionspil");
                skema.appendChild(mig.pil);
            }
        });
        el.appendChild(skema);

        /* Klammerne */
        var ns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(ns, "svg");
        this.svg.setAttribute("class", "hf-klammer");
        el.appendChild(this.svg);
        this.etiket = [];
        this.tag = [];
        this.pilKnap = [];
        R.K.forEach(function (K, k) {
            var e = lav("div", "hf-etiket " + K.type);
            var g = lav("span", "hf-gange");
            g.appendChild(mig.lavFelt("g" + k, "g", "Gangetallet ved klammen for " + K.E));
            g.appendChild(lav("span", "hf-gtal"));
            g.appendChild(lav("span", "hf-prik", "·"));
            e.appendChild(g);
            /* Antallet af atomer i formlen foer pilen, naar der er flere end
               ét: "2 S". Eleven taeller dem selv (bidden antal). */
            var an = lav("span", "hf-antal");
            an.appendChild(mig.lavFelt("n" + k, "n", "Antallet af " + K.E + " i " + R.led[K.v].st.tekst));
            an.appendChild(lav("span", "hf-ntal"));
            an.appendChild(lav("span", "hf-nsym", K.E));
            e.appendChild(an);
            var knap = lav("button", "hf-pilknap", "↕");
            knap.type = "button";
            knap.title = "Klik for at vende pilen";
            knap.setAttribute("aria-label", "Pilen ved " + K.E + ": op eller ned");
            knap.addEventListener("click", function () { if (mig.vedPil) mig.vedPil(k); });
            e.appendChild(knap);
            e.appendChild(mig.lavFelt("kl" + k, "kl", "Hvor meget " + K.E + " stiger eller falder"));
            e.appendChild(lav("span", "hf-kltal"));
            e.appendChild(lav("span", "hf-prod"));
            mig.tag[k] = lav("div", "hf-tag " + K.type, K.type === "ox" ? "oxidation" : "reduktion");
            el.appendChild(mig.tag[k]);
            el.appendChild(e);
            mig.etiket[k] = e;
            mig.pilKnap[k] = knap;
        });

        /* Et valg under skemaet (redoxreaktion eller ej) */
        this.valg = lav("div", "hf-valg");
        el.appendChild(this.valg);

        /* Raekkerne under skemaet */
        this.rad = {};
        [["lad", "Ladning"], ["brint", "H-atomer"], ["ilt", "O-atomer"]].forEach(function (r) {
            var rad = lav("div", "hf-rad " + r[0]);
            rad.appendChild(lav("span", "hf-radnavn", r[1]));
            var celler = {};
            ["v", "h"].forEach(function (side) {
                var c = lav("span", "hf-celle");
                if (r[0] !== "ilt") c.appendChild(mig.lavFelt(r[0] + "-" + side, "rk", r[1] + (side === "v" ? " før pilen" : " efter pilen")));
                c.appendChild(lav("span", "hf-vaerdi"));
                rad.appendChild(c);
                celler[side] = c;
            });
            el.appendChild(rad);
            mig.rad[r[0]] = { el: rad, celle: celler };
        });
    };

    /* ----- Vis tilstanden ------------------------------------------------------------
       v er et objekt fra fanen (visning i js/sim_haefte.js):
         navn           den korte linje oeverst
         aktiv          noeglerne til de felter, der kan skrives i nu
         tal(noegle)    { v, slags } for et fundet tal (slags ok, vist, blyant) eller null
         koef(i)        { tekst, slags } for tallet foran led i
         klammer        klammerne kan ses
         pil(k)         true (op), false (ned) eller null
         pilLaast(k)    stigningen eller faldet er fundet
         gange          gangetallene kan ses
         antal(k)       antallet af atomer ("2 S") staar ved klammen
         taeller(k)     hvor det lille tal i formlen lyser: "v", "vh" eller ""
         prod(k)        teksten "= 28" ved klammen
         ekstra(slags, side)  "felt", "tal" eller "" (skjult)
         rad(r)         raekken kan ses
         celle(r, side) teksten i en celle, naar den ikke er et felt
         valg           [{ id, tekst, forkert, rigtig }] eller null
         faerdig        skemaet er afstemt
    */
    P.visTilstand = function (v) {
        var mig = this, R = this.opg.R;
        this.vis = v;
        this.navnEl.textContent = v.navn || "";
        var aktiv = {};
        (v.aktiv || []).forEach(function (k) { aktiv[k] = true; });

        function saetFelt(noegle, vis) {
            var f = mig.felter[noegle];
            if (!f) return;
            var er = !!aktiv[noegle] && vis !== false;
            f.felt.hidden = !er;
            f.felt.classList.toggle("aktiv", er);
        }

        /* Leddene: tallet foran og oxidationstallene */
        this.led.forEach(function (L, i) {
            var k = v.koef(i);
            L.koefTal.textContent = k.tekst || "";
            L.koefTal.className = "hf-koeftal" + (k.slags ? " " + k.slags : "");
            saetFelt("for" + i);
            Object.keys(L.pladser).forEach(function (noegle) {
                var p = L.pladser[noegle], t = v.tal(noegle);
                p.tal.textContent = t ? X.ox(t.v) : "";
                p.tal.className = "hf-oxtal" + (t ? " " + t.slags : "");
                saetFelt(noegle);
            });
        });

        /* H⁺ og vand */
        ["ion", "vand"].forEach(function (slags) {
            ["v", "h"].forEach(function (side) {
                var x = mig[slags + side], m = v.ekstra(slags, side);
                x.hidden = !m;
                saetFelt(slags + "-" + side, m === "felt");
                var tal = x.querySelector(".hf-tal");
                var t = m === "tal" ? v.tal(slags + "-" + side) : null;
                tal.textContent = t && t.v !== 1 ? String(t.v) : "";
                tal.className = "hf-tal" + (t ? " " + t.slags : "");
                x.classList.toggle("fundet", m === "tal");
            });
        });

        /* Klammerne og etiketterne */
        R.K.forEach(function (K, k) {
            var e = mig.etiket[k];
            e.hidden = !v.klammer;
            mig.tag[k].hidden = !v.klammer || !v.pilLaast(k);
            if (!v.klammer) return;
            var p = v.pil(k), knap = mig.pilKnap[k];
            knap.textContent = p === null ? "↕" : (p ? "↑" : "↓");
            knap.classList.toggle("valgt", p !== null);
            knap.disabled = !!v.pilLaast(k);
            knap.classList.toggle("laast", !!v.pilLaast(k));
            saetFelt("kl" + k);
            var kt = v.tal("kl" + k);
            var kl = e.querySelector(".hf-kltal");
            kl.textContent = kt ? String(kt.v) : "";
            kl.className = "hf-kltal" + (kt ? " " + kt.slags : "");
            var gs = e.querySelector(".hf-gange");
            gs.hidden = !v.gange;
            saetFelt("g" + k);
            var gt = v.tal("g" + k);
            var g = e.querySelector(".hf-gtal");
            g.textContent = gt ? String(gt.v) : "";
            g.className = "hf-gtal" + (gt ? " " + gt.slags : "");
            /* Antallet af atomer: "2 S" foran pilen, og en prik efter gangetallet */
            var medAntal = !!(v.antal && v.antal(k));
            var an = e.querySelector(".hf-antal");
            an.hidden = !medAntal;
            gs.querySelector(".hf-prik").hidden = !medAntal;
            saetFelt("n" + k);
            var nt = v.tal("n" + k);
            var ntal = an.querySelector(".hf-ntal");
            ntal.textContent = nt ? String(nt.v) : "";
            ntal.className = "hf-ntal" + (nt ? " " + nt.slags : "");
            /* Det lille tal i formlen lyser, mens atomerne taelles */
            var hvor = v.taeller ? v.taeller(k) : "";
            [["v", K.v], ["h", K.h]].forEach(function (x) {
                var pl = mig.led[x[1]].pladser["ox" + x[1] + "_" + K.E];
                if (pl && pl.idx) pl.idx.classList.toggle("taeller", hvor.indexOf(x[0]) >= 0);
            });
            var pr = e.querySelector(".hf-prod");
            var prod = v.prod(k);
            pr.textContent = prod.tekst || "";
            pr.className = "hf-prod" + (prod.slags ? " " + prod.slags : "");
            e.classList.toggle("fundet", !!v.pilLaast(k));
        });

        /* Raekkerne */
        Object.keys(this.rad).forEach(function (r) {
            var rad = mig.rad[r];
            rad.el.hidden = !v.rad(r);
            ["v", "h"].forEach(function (side) {
                saetFelt(r + "-" + side);
                var c = v.celle(r, side);
                var ve = rad.celle[side].querySelector(".hf-vaerdi");
                ve.innerHTML = c ? c.html : "";
                ve.className = "hf-vaerdi" + (c && c.slags ? " " + c.slags : "");
            });
        });

        /* Valget */
        this.valg.innerHTML = "";
        this.valg.hidden = !v.valg;
        if (v.valg) {
            v.valg.forEach(function (o) {
                var k = lav("button", "hf-valgknap" + (o.forkert ? " forkert" : "") + (o.rigtig ? " rigtig" : ""), o.tekst);
                k.type = "button";
                k.disabled = !!o.forkert || !!o.laast;
                k.setAttribute("data-valg", o.id);
                k.addEventListener("click", function () { if (mig.vedValg) mig.vedValg(o.id); });
                mig.valg.appendChild(k);
            });
        }

        this.el.classList.toggle("faerdig", !!v.faerdig);
        this.placer();
    };

    /* ----- Skriftstoerrelsen og pladsen ------------------------------------------------
       Hoejden: linjen oeverst, feltet over, skemaet, en klamme pr. par
       og raekkerne (tre i vand, ellers kun O-atomerne). */
    P.enheder = function () {
        var R = this.opg.R, n = Math.max(1, R.K.length), rader = R.miljoe ? 3 : 1;
        return 0.62 + 1.5 * (n - 1) + 0.95 + 0.98 * rader;
    };

    P.tilpas = function (b, h) {
        if (!this.opg) return;
        this.b = b;
        this.h = h;
        var enh = this.enheder();
        var fsH = (h - 34) / (1.85 + enh + 0.45);
        this.el.style.setProperty("--fs", "100px");
        var w100 = this.maal ? this.maal.offsetWidth : 0;
        var margen = this.margen();
        /* Maaleteksten har "⟶" (ca. 1 em); pilen i haeftet er 3 em lang */
        var fsB = w100 ? 100 * (b - margen - 24) / (w100 + 230) : 40;
        var fs = NK.klamp(Math.min(fsH, fsB), 17, 44);
        this.fs = fs;
        /* Den lodrette luft vokser, naar der er plads */
        this.vs = NK.klamp((h - 42 - 1.85 * fs) / (enh + 0.3), fs, fs * 1.5);
        this.el.style.setProperty("--fs", fs.toFixed(1) + "px");
        this.el.style.setProperty("--margen", margen + "px");
        /* Er der luft til overs, rykker det hele lidt ned mod midten */
        var brugt = 42 + 1.85 * fs + (enh + 0.3) * this.vs;
        if (this.skema) this.skema.style.top = Math.round(26 + Math.max(0, h - brugt) * 0.35) + "px";
        this.placer();
    };

    /* Margenen til raekkernes navne: plads til "O-atomer" i raekkeskriften */
    P.margen = function () {
        return Math.round(NK.klamp(this.b * 0.11, 94, 112));
    };

    /* Bredden af det, der staar i skemaet lige nu */
    P.indholdBredde = function () {
        var v = Infinity, h = -Infinity, b = this.skema.children;
        for (var i = 0; i < b.length; i++) {
            if (b[i].hidden) continue;
            var r = b[i].getBoundingClientRect();
            if (!r.width) continue;
            v = Math.min(v, r.left);
            h = Math.max(h, r.right);
        }
        return h > v ? h - v : 0;
    };

    function rect(e, o) {
        var r = e.getBoundingClientRect();
        return { x: r.left - o.left, y: r.top - o.top, b: r.width, h: r.height, cx: r.left - o.left + r.width / 2, bund: r.bottom - o.top, hoejre: r.right - o.left };
    }

    /* Klammerne, etiketterne, raekkerne og valget placeres ud fra, hvor
       atomerne og pilen staar lige nu */
    P.placer = function () {
        if (!this.opg || !this.vis || !this.el.offsetWidth) return;
        var mig = this, R = this.opg.R, v = this.vis;
        var o = this.el.getBoundingClientRect();
        var fs = this.fs;
        var sk = rect(this.skema, o);
        /* Bliver skemaet for bredt (fx med felter paa begge sider), bliver
           skriften lidt mindre, indtil det kan vaere der */
        var plads = this.b - this.margen() - 16, bredde = this.indholdBredde();
        if (bredde > plads && fs > 17.5 && !this.krymper) {
            this.krymper = true;
            this.fs = Math.max(17, fs * plads / bredde - 0.3);
            this.el.style.setProperty("--fs", this.fs.toFixed(1) + "px");
            this.placer();
            this.krymper = false;
            return;
        }
        var pil = rect(this.pil, o);
        var bund = sk.bund;
        var vs = this.vs || fs;
        var ns = "http://www.w3.org/2000/svg";
        var svg = this.svg;
        svg.setAttribute("width", Math.round(o.width));
        svg.setAttribute("height", Math.round(o.height));
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var sidsteY = bund + vs * 0.1;

        /* Etiketterne staar midt under reaktionspilen. Er den bredeste for
           bred til det, faar de alle samme venstre kant lige efter den
           sidste lodrette streg foer pilen, saa ingen etiket daekker en
           streg, og felterne staar under hinanden. */
        var lodV = -Infinity, lodH = Infinity, bredest = 0;
        R.K.forEach(function (K, k) {
            var a = mig.led[K.v].pladser["ox" + K.v + "_" + K.E], b = mig.led[K.h].pladser["ox" + K.h + "_" + K.E];
            if (a) lodV = Math.max(lodV, rect(a.sym, o).cx);
            if (b) lodH = Math.min(lodH, rect(b.sym, o).cx);
            if (v.klammer) bredest = Math.max(bredest, mig.etiket[k].offsetWidth);
        });
        var luft = fs * 0.4;
        var kant = pil.cx - bredest / 2 < lodV + luft || pil.cx + bredest / 2 > lodH - luft ? lodV + luft : null;

        R.K.forEach(function (K, k) {
            var y = bund + vs * (0.62 + 1.5 * k);
            sidsteY = y;
            if (!v.klammer) return;
            var a = mig.led[K.v].pladser["ox" + K.v + "_" + K.E], b = mig.led[K.h].pladser["ox" + K.h + "_" + K.E];
            if (!a || !b) return;
            var ra = rect(a.sym, o), rb = rect(b.sym, o);
            var top = bund + fs * 0.1, fundet = v.pilLaast(k) ? " fundet" : "";
            var sti = document.createElementNS(ns, "path");
            sti.setAttribute("d", "M" + ra.cx.toFixed(1) + " " + top.toFixed(1) + " V" + y.toFixed(1) + " H" + rb.cx.toFixed(1) + " V" + top.toFixed(1));
            sti.setAttribute("class", "hf-sti " + K.type + fundet);
            svg.appendChild(sti);
            /* En lille pil op mod atomet efter reaktionspilen. Foer pilen gaar
               stregen op til atomet uden spids, saa klammen laeses fra
               reaktant til produkt (brugerens oenske 5. okt. 2026). */
            [rb.cx].forEach(function (x) {
                var sp = document.createElementNS(ns, "path");
                var s = Math.max(4, fs * 0.12);
                sp.setAttribute("d", "M" + (x - s).toFixed(1) + " " + (top + s * 1.5).toFixed(1) + " L" + x.toFixed(1) + " " + top.toFixed(1) +
                    " L" + (x + s).toFixed(1) + " " + (top + s * 1.5).toFixed(1));
                sp.setAttribute("class", "hf-sti spids " + K.type + fundet);
                svg.appendChild(sp);
            });
            /* Etiketten midt under reaktionspilen, og ordet oxidation eller
               reduktion lige under den */
            var e = mig.etiket[k];
            var ex = kant === null ? pil.cx : kant + e.offsetWidth / 2;
            e.style.left = ex.toFixed(1) + "px";
            e.style.top = y.toFixed(1) + "px";
            var tg = mig.tag[k];
            tg.style.left = ex.toFixed(1) + "px";
            tg.style.top = (y + fs * 0.42 + 3).toFixed(1) + "px";
        });

        /* Raekkerne: under hver side af pilen */
        var forste = null, sidste = null;
        for (var n = 0; n < this.skema.children.length; n++) {
            var c = this.skema.children[n];
            if (c.hidden || c === this.pil) continue;
            if (!forste) forste = c;
            sidste = c;
        }
        var venstre = forste ? rect(forste, o).x : sk.x;
        var hoejre = sidste ? rect(sidste, o).hoejre : sk.hoejre;
        var midt = { v: (venstre + pil.x) / 2, h: (pil.hoejre + hoejre) / 2 };
        var ry = sidsteY + vs * 0.95;
        var rh = vs * 0.98;
        var nr = 0;
        ["lad", "brint", "ilt"].forEach(function (r) {
            var rad = mig.rad[r];
            /* Uden ioner er der kun O-raekken, og den staar oeverst */
            if (!R.miljoe && r !== "ilt") return;
            rad.el.style.top = (ry + nr * rh).toFixed(1) + "px";
            nr++;
            ["v", "h"].forEach(function (side) { rad.celle[side].style.left = midt[side].toFixed(1) + "px"; });
        });

        /* Valget midt under skemaet */
        if (v.valg) {
            this.valg.style.left = ((venstre + hoejre) / 2).toFixed(1) + "px";
            this.valg.style.top = (bund + vs * 0.7).toFixed(1) + "px";
        }
    };

    /* Klammerne tegnes frem, naar de kommer: stregen vokser */
    P.tegnKlammerFrem = function () {
        var stier = this.svg.querySelectorAll(".hf-sti:not(.spids)");
        for (var i = 0; i < stier.length; i++) {
            var s = stier[i], l = 0;
            try { l = s.getTotalLength(); } catch (e) { l = 0; }
            if (!l) continue;
            s.style.transition = "none";
            s.style.strokeDasharray = l;
            s.style.strokeDashoffset = l;
            void s.getBoundingClientRect();
            s.style.transition = "stroke-dashoffset 0.9s ease-out " + (i * 0.25) + "s";
            s.style.strokeDashoffset = 0;
        }
    };

    /* ----- Tallene flyver fra gangetallet op til formlerne --------------------------------
       k: klammen, til: leddene. Kalder faerdig, naar de er fremme. */
    P.flyv = function (k, til, tekst, faerdig) {
        var mig = this, o = this.el.getBoundingClientRect();
        var e = this.etiket[k].querySelector(".hf-gange");
        var r0 = rect(e, o);
        var type = this.opg.R.K[k].type;
        var tilbage = til.length;
        til.forEach(function (i, n) {
            var L = mig.led[i];
            var r1 = rect(L.koef, o);
            var f = lav("span", "hf-flyver " + type, tekst);
            f.style.left = r0.cx + "px";
            f.style.top = (r0.y + r0.h / 2) + "px";
            mig.el.appendChild(f);
            void f.offsetWidth;
            setTimeout(function () {
                f.style.left = (r1.cx + mig.fs * 0.1) + "px";
                f.style.top = (r1.y + r1.h * 0.55) + "px";
            }, Haefte.FLYV_MS ? 30 + n * 90 : 0);
            setTimeout(function () {
                if (f.parentNode) f.parentNode.removeChild(f);
                tilbage--;
                if (!tilbage && faerdig) faerdig();
            }, Haefte.FLYV_MS ? Haefte.FLYV_MS + n * 90 : 0);
        });
        if (!til.length && faerdig) faerdig();
    };

    P.fokus = function (noegle) {
        var i = this.inp(noegle);
        if (i && !i.parentNode.hidden && document.activeElement !== i) {
            try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); }
        }
    };

    /* Hvor laenge tallene flyver (selvtesten saetter 0) */
    Haefte.FLYV_MS = 900;

    NK.Haefte = Haefte;
}());
