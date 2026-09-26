/* =====================================================================
   haefte.js - hæftet: reaktionsskemaet skrevet som i hånden

   Skemaet står på ternet papir. Over de atomer, der skifter, står
   oxidationstallet. Under skemaet går en klamme fra atomet før pilen
   til det samme atom efter pilen, og midt på klammen, lige under
   reaktionspilen, står gangetallet og stigningen (↑) eller faldet (↓),
   som på brugerens tegning: "5 ↑1" og "1 ↓5". Under hver side står
   ladningen, O-atomerne og til sidst H-atomerne.

   Hæftet er et HTML-element oven på lærredet. Det tegner kun det, fanen
   (js/sim.js) siger: hvilke felter der er aktive, hvilke tal der er
   fundet, og hvad der endnu ikke er nået. Felterne bygges én gang pr.
   reaktion, så det, eleven skriver, bliver stående, mens hæftet tegnes
   om. Klammerne er en SVG, der regnes ud fra, hvor atomerne står.

   Nøglerne til felterne:
     ox0 … ox3   oxidationstallet over atomet i led 0 til 3
     for0 …      tallet foran et led i forafstemningen (indekstal)
     kl-ox, kl-red   stigningen og faldet ved klammerne
     g-ox, g-red     gangetallene ved klammerne
     lad-v, lad-h    ladningen før og efter pilen
     ion-v, ion-h    H⁺ eller OH⁻ før og efter pilen
     brint-v, brint-h  H-atomerne før og efter pilen (O-rækken er kontrollen til sidst)
     vand-v, vand-h  H₂O før og efter pilen
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var X = NK.Redox;

    function lav(tag, klasse, tekst) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (tekst !== undefined) e.textContent = tekst;
        return e;
    }

    function Haefte(el, navn) {
        this.el = el;
        this.navn = navn;
        this.felter = {};
        this.vis = null;
        this.fs = 36;
        this.pilKnap = {};
    }

    var P = Haefte.prototype;

    /* ----- Et felt: et lille indtastningsfelt med en ramme ------------------------- */
    P.lavFelt = function (noegle, klasse, aria, bredde) {
        var mig = this;
        var f = lav("span", "hf-felt " + (klasse || ""));
        var inp = document.createElement("input");
        inp.type = "text";
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.setAttribute("aria-label", aria);
        inp.setAttribute("data-noegle", noegle);
        if (bredde) inp.style.width = bredde;
        inp.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); if (mig.vedEnter) mig.vedEnter(noegle); return; }
            if (mig.vedTast && mig.vedTast(noegle, e)) e.preventDefault();
        });
        inp.addEventListener("input", function () {
            f.classList.remove("fejl");
            if (mig.vedInput) mig.vedInput(noegle, inp);
        });
        inp.addEventListener("focus", function () { if (mig.vedFokus) mig.vedFokus(noegle); });
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

    /* ----- Formlen: atomet, der skifter, får en plads til oxidationstallet ---------- */
    P.fyldFormel = function (boks, i, st, E) {
        boks.innerHTML = "";
        var foer = "", efter = "", fundet = false, atomEl = null;
        st.atomer.forEach(function (a) {
            var t = a.s + (a.n > 1 ? NK.saenket(a.n) : "");
            if (!fundet && a.s === E) {
                fundet = true;
                atomEl = a;
                efter += a.n > 1 ? NK.saenket(a.n) : "";
                return;
            }
            if (fundet) efter += t; else foer += t;
        });
        efter += NK.ladningHaevet(st.q);
        if (foer) boks.appendChild(lav("span", "hf-rest", foer));
        var atom = lav("span", "hf-atom");
        var over = lav("span", "hf-over");
        over.appendChild(this.lavFelt("ox" + i, "ox", "Oxidationstallet for " + E + " i " + st.tekst));
        over.appendChild(lav("span", "hf-oxtal"));
        atom.appendChild(over);
        var sym = lav("span", "hf-sym", atomEl ? atomEl.s : E);
        atom.appendChild(sym);
        boks.appendChild(atom);
        if (efter) boks.appendChild(lav("span", "hf-rest", efter));
        return { over: over, sym: sym };
    };

    /* ----- Byg hæftet til en reaktion --------------------------------------------------- */
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
        this.maal = lav("span", "hf-maal", X.skemaTekst(R) + " + 00 H₂O");
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
                if (l.nr === R.ox.v || l.nr === R.ox.h || l.nr === R.red.v || l.nr === R.red.h) {
                    koef.appendChild(mig.lavFelt("for" + l.nr, "for", "Tallet foran " + l.st.tekst));
                }
                led.appendChild(koef);
                var formel = lav("span", "hf-formel");
                led.appendChild(formel);
                var K = l.rolle === "ox" ? R.ox : R.red;
                var ukendt = lav("span", "hf-ukendt", "?");
                skema.appendChild(led);
                mig.led[l.nr] = { el: led, koef: koef, koefTal: koefTal, formel: formel, ukendt: ukendt, l: l, K: K, byget: false };
            });
            /* H⁺ eller OH⁻ og vand bagerst paa siden */
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
        this.etiket = {};
        this.tag = {};
        ["ox", "red"].forEach(function (t) {
            var K = R[t];
            var e = lav("div", "hf-etiket " + t);
            var g = lav("span", "hf-gange");
            g.appendChild(mig.lavFelt("g-" + t, "g", "Gangetallet ved klammen for " + K.E));
            g.appendChild(lav("span", "hf-gtal"));
            e.appendChild(g);
            var knap = lav("button", "hf-pilknap", "↕");
            knap.type = "button";
            knap.title = "Klik for at vende pilen";
            knap.setAttribute("aria-label", "Pilen ved " + K.E + ": op eller ned");
            knap.addEventListener("click", function () { if (mig.vedPil) mig.vedPil(t); });
            e.appendChild(knap);
            e.appendChild(mig.lavFelt("kl-" + t, "kl", "Hvor meget " + K.E + " stiger eller falder"));
            e.appendChild(lav("span", "hf-kltal"));
            e.appendChild(lav("span", "hf-prod"));
            mig.tag[t] = lav("div", "hf-tag " + t, t === "ox" ? "oxidation" : "reduktion");
            el.appendChild(mig.tag[t]);
            el.appendChild(e);
            mig.etiket[t] = e;
            mig.pilKnap[t] = knap;
        });

        /* Valget af manganstoffet */
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

    /* Formlen for et led bygges, naar den er kendt (produktet kendes foerst,
       naar eleven har valgt det) */
    P.sikrFormel = function (i) {
        var L = this.led[i];
        if (L.byget) return;
        var slot = this.fyldFormel(L.formel, i, L.l.st, L.K.E);
        L.over = slot.over;
        L.sym = slot.sym;
        L.byget = true;
    };

    /* ----- Vis tilstanden ------------------------------------------------------------
       v er et objekt fra fanen (sim.visning()):
         kendt(i)       formlen i led i kan ses
         ukendt(i)      led i vises som "?" (produktet er ikke valgt)
         aktiv          nøglerne til de felter, der kan skrives i nu
         tal(noegle)    { v, slags } for et fundet tal (slags ok, vist, blyant) eller null
         koef(i)        tallet foran led i eller ""
         klammer        klammerne kan ses
         pil(t)         true (op), false (ned) eller null
         pilLaast(t)    pilen er fundet
         gange          gangetallene kan ses
         prod(t)        teksten "= 10" ved klammen eller ""
         ekstra(slags, side)  "felt", "tal" eller "" (skjult)
         rad(r)         rækken kan ses
         celle(r, side) teksten i en celle, når den ikke er et felt
         valg           [{ f, tekst, forkert }] eller null
         navn           teksten øverst
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

        /* Leddene */
        this.led.forEach(function (L, i) {
            var kendt = v.kendt(i);
            L.el.hidden = !kendt && !v.ukendt(i);
            if (v.ukendt(i)) {
                if (L.ukendt.parentNode !== L.formel) { L.formel.innerHTML = ""; L.formel.appendChild(L.ukendt); }
            } else if (kendt) {
                if (L.ukendt.parentNode === L.formel) L.formel.removeChild(L.ukendt);
                mig.sikrFormel(i);
            }
            /* Koefficienten */
            var k = v.koef(i);
            L.koefTal.textContent = k.tekst || "";
            L.koefTal.className = "hf-koeftal" + (k.slags ? " " + k.slags : "");
            saetFelt("for" + i);
            /* Oxidationstallet */
            if (L.byget) {
                var t = v.tal("ox" + i);
                var oxtal = L.over.querySelector(".hf-oxtal");
                oxtal.textContent = t ? X.ox(t.v) : "";
                oxtal.className = "hf-oxtal" + (t ? " " + t.slags : "");
                saetFelt("ox" + i);
            }
        });
        /* Plus-tegnene: skjul et plus foran et skjult led */
        var boern = this.skema.children;
        for (var n = 0; n < boern.length; n++) {
            var b = boern[n];
            if (b.className === "hf-plus") {
                var naeste = b.nextSibling;
                b.hidden = !!(naeste && naeste.hidden);
            }
        }

        /* H⁺/OH⁻ og vand */
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
        ["ox", "red"].forEach(function (t) {
            var e = mig.etiket[t];
            e.hidden = !v.klammer;
            mig.tag[t].hidden = !v.klammer || !v.pilLaast(t);
            if (!v.klammer) return;
            var p = v.pil(t), knap = mig.pilKnap[t];
            knap.textContent = p === null ? "↕" : (p ? "↑" : "↓");
            knap.classList.toggle("valgt", p !== null);
            knap.disabled = !!v.pilLaast(t);
            knap.classList.toggle("laast", !!v.pilLaast(t));
            saetFelt("kl-" + t);
            var kt = v.tal("kl-" + t);
            var kl = e.querySelector(".hf-kltal");
            kl.textContent = kt ? String(kt.v) : "";
            kl.className = "hf-kltal" + (kt ? " " + kt.slags : "");
            var gs = e.querySelector(".hf-gange");
            gs.hidden = !v.gange;
            saetFelt("g-" + t);
            var gt = v.tal("g-" + t);
            var g = e.querySelector(".hf-gtal");
            g.textContent = gt ? String(gt.v) : "";
            g.className = "hf-gtal" + (gt ? " " + gt.slags : "");
            var pr = e.querySelector(".hf-prod");
            var prod = v.prod(t);
            pr.textContent = prod.tekst || "";
            pr.className = "hf-prod" + (prod.slags ? " " + prod.slags : "");
            e.classList.toggle("fundet", !!v.pilLaast(t));
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
                var k = lav("button", "hf-valgknap" + (o.forkert ? " forkert" : ""), o.tekst);
                k.type = "button";
                k.disabled = !!o.forkert;
                k.addEventListener("click", function () { if (mig.vedValg) mig.vedValg(o.f); });
                mig.valg.appendChild(k);
            });
        }

        this.el.classList.toggle("faerdig", !!v.faerdig);
        this.placer();
    };

    /* ----- Skriftstoerrelsen og pladsen ------------------------------------------------ */
    P.tilpas = function (b, h) {
        this.b = b;
        this.h = h;
        /* Hoejden: navnet, feltet over, skemaet, to klammer og tre raekker */
        var fsH = (h - 26) / 8.8;
        this.el.style.setProperty("--fs", "100px");
        var w100 = this.maal ? this.maal.offsetWidth : 0;
        var margen = this.margen();
        /* Maaleteksten har "⟶" (ca. 1 em); pilen i haeftet er 3 em lang */
        var fsB = w100 ? 100 * (b - margen - 24) / (w100 + 230) : 40;
        var fs = NK.klamp(Math.min(fsH, fsB), 17, 44);
        this.fs = fs;
        /* Den lodrette luft vokser, naar der er plads: klammerne og raekkerne
           fylder resten af haeftet ud */
        this.vs = NK.klamp((h - 42 - 1.85 * fs) / 5.93, fs, fs * 1.5);
        this.el.style.setProperty("--fs", fs.toFixed(1) + "px");
        this.el.style.setProperty("--margen", margen + "px");
        /* Er der luft til overs, rykker det hele lidt ned mod midten */
        var brugt = 42 + 1.85 * fs + 5.93 * this.vs;
        if (this.skema) this.skema.style.top = Math.round(26 + Math.max(0, h - brugt) * 0.35) + "px";
        this.placer();
    };

    /* Margenen til raekkernes navne: plads til "O-atomer" i raekkeskriften */
    P.margen = function () {
        return Math.round(NK.klamp(this.b * 0.11, 94, 112));
    };

    /* Bredden af det, der staar i skemaet lige nu (fra det foerste til det
       sidste synlige led) */
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
        /* Skemaets grundlinje: bunden af formlerne (uden feltet over) */
        var bund = sk.bund;
        var vs = this.vs || fs;
        var y1 = bund + vs * 0.62, y2 = y1 + vs * 1.5;
        var lag = { ox: y1, red: y2 };
        var ns = "http://www.w3.org/2000/svg";
        var svg = this.svg;
        svg.setAttribute("width", Math.round(o.width));
        svg.setAttribute("height", Math.round(o.height));
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var laengde = 0;

        if (v.klammer) {
            ["ox", "red"].forEach(function (t) {
                var K = R[t];
                var a = mig.led[K.v], b = mig.led[K.h];
                if (!a.sym || !b.sym) return;
                var ra = rect(a.sym, o), rb = rect(b.sym, o);
                var y = lag[t], top = bund + fs * 0.1;
                var d = "M" + ra.cx.toFixed(1) + " " + top.toFixed(1) + " V" + y.toFixed(1) + " H" + rb.cx.toFixed(1) + " V" + top.toFixed(1);
                var sti = document.createElementNS(ns, "path");
                sti.setAttribute("d", d);
                sti.setAttribute("class", "hf-sti " + t + (v.pilLaast(t) ? " fundet" : ""));
                svg.appendChild(sti);
                /* Smaa pile op mod atomerne i begge ender */
                [ra.cx, rb.cx].forEach(function (x) {
                    var sp = document.createElementNS(ns, "path");
                    var s = Math.max(4, fs * 0.12);
                    sp.setAttribute("d", "M" + (x - s).toFixed(1) + " " + (top + s * 1.5).toFixed(1) + " L" + x.toFixed(1) + " " + top.toFixed(1) +
                        " L" + (x + s).toFixed(1) + " " + (top + s * 1.5).toFixed(1));
                    sp.setAttribute("class", "hf-sti spids " + t + (v.pilLaast(t) ? " fundet" : ""));
                    svg.appendChild(sp);
                });
                laengde = Math.max(laengde, 2 * (y - top) + Math.abs(rb.cx - ra.cx));
                /* Etiketten midt under reaktionspilen */
                var e = mig.etiket[t];
                e.style.left = pil.cx.toFixed(1) + "px";
                e.style.top = y.toFixed(1) + "px";
                /* Ordet oxidation eller reduktion lige under etiketten, hvor ingen
                   lodrette streger krydser */
                var tg = mig.tag[t];
                tg.style.left = pil.cx.toFixed(1) + "px";
                tg.style.top = (y + fs * 0.42 + 3).toFixed(1) + "px";
            });
        }

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
        var ry = y2 + vs * 0.95;
        var rh = vs * 0.98;
        ["lad", "brint", "ilt"].forEach(function (r, i) {
            var rad = mig.rad[r];
            var y = ry + i * rh;
            rad.el.style.top = y.toFixed(1) + "px";
            ["v", "h"].forEach(function (side) { rad.celle[side].style.left = midt[side].toFixed(1) + "px"; });
        });

        /* Valget under spoergsmaalstegnet */
        if (v.valg) {
            var L = this.led[R.red.h];
            var ru = rect(L.formel, o);
            this.valg.style.left = ru.cx.toFixed(1) + "px";
            this.valg.style.top = (bund + fs * 0.35).toFixed(1) + "px";
        }
        this.stiLaengde = laengde;
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
       fra: etiketten ("ox" eller "red"), til: leddene. Kalder faerdig, naar
       de er fremme. */
    P.flyv = function (t, til, tekst, faerdig) {
        var mig = this, o = this.el.getBoundingClientRect();
        var e = this.etiket[t].querySelector(".hf-gange");
        var r0 = rect(e, o);
        var tilbage = til.length;
        til.forEach(function (i, n) {
            var L = mig.led[i];
            var r1 = rect(L.koef, o);
            var f = lav("span", "hf-flyver " + t, tekst);
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
