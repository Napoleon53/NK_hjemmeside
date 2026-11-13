/* =====================================================================
   motor.js - en fane: figuren, pladserne, bakken og lagene

   Hver fane er en figur fra et afsnit i kapitel 1, som bygges op i lag.
   I et lag staar nogle pladser i figuren gule, og fagordene ligger i
   bakken paa kortet oeverst. Eleven traekker (eller klikker) ordene paa
   plads og trykker Indsend svar. Et ord, der sidder rigtigt, laases, og
   den del af figuren, det peger paa, bliver bygget. Et forkert ord
   ryger tilbage i bakken med ordets forklaring fra bogen. Figuren er
   faerdig, naar det sidste lag er loest.

   Svaer udgave (kontakten oeverst i panelet, brugeren 2. nov. 2026): alle
   fagord paa én gang. Hele figuren staar graa fra start, og en del faar
   farve, naar ordet til den sidder. Den afloeste Mesterproeven, som kom
   efter lagene og "virkede lidt underlig at lave, naar man lige havde
   taget dem alle".

   Figuren beskrives i js/fig_*.js som
     { id, vb, lag: [{ navn, pladser, ekstra, ros }], pladser: [...], tegn(api) }
   En plads er { id, ord: [...], x, y, maal: [x, y], via, dele, omr, fejl }.
   omr er det, pladsen handler om, og bliver gult, mens der spoerges:
   { c: [x, y, r] } en cirkel, { ring: [x, y, r] } en ring,
   { r: [x, y, b, h], tom: true } et rektangel (tom: kun kanten).

   titel: true er en plads, der sidder som titel paa et kort, uden streg.
   par: "<id>" goer to pladser til et par for to navne paa det samme
   (oktetreglen og aedelgasreglen): de staar side om side med "eller"
   imellem og én faelles streg, saa man kan se, at begge raekkefoelger er
   rigtige (brugeren 1. nov. 2026). x er parrets midte; motoren placerer boksene.

   Figuren bliver afsloeret lag for lag. Det aktuelle lags dele staar
   graa (brugerens oenske 1. nov. 2026: "man vil ikke sige at figuren er
   der, men bare uden farver?"), og en del faar farve, naar ordet til den
   sidder rigtigt. De senere lag er skjult (brugeren samme dag: "afsloere
   figurene fortsat i takt med at delpunkterne klares (som foer)").
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    var SV = NK.SV;
    var PH = 34;                 /* pladsens hoejde i figurens enheder */
    var SKRIFT = 18;             /* skriften paa pladsen */
    var KANT = 14;

    var TAL = ["Ingen", "Et", "To", "Tre", "Fire", "Fem", "Seks", "Syv", "Otte", "Ni", "Ti", "Elleve", "Tolv"];
    function talOrd(n, stort) {
        var s = TAL[n] || String(n);
        return stort ? s : s.toLowerCase();
    }

    function html(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function bland(liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /* Ordenes bredde maales med et skjult canvas, saa alle pladser i en
       figur bliver lige brede: laengden maa ikke afsloere ordet */
    var maaler = null;
    function ordBredde(ord) {
        if (!maaler) maaler = document.createElement("canvas").getContext("2d");
        maaler.font = "700 " + SKRIFT + "px Segoe UI, Tahoma, Geneva, Verdana, sans-serif";
        return maaler.measureText(ord).width;
    }

    /* Animationer, der starter efter t0 ms */
    function animator(t0) {
        return {
            pop:   function (el, d, v) { SV.pop(el, t0 + (d || 0), v); },
            fade:  function (el, d, v) { SV.fade(el, t0 + (d || 0), v); },
            streg: function (el, d, v) { SV.streg(el, t0 + (d || 0), v); },
            glid:  function (el, dx, dy, d, v) { SV.glid(el, dx, dy, t0 + (d || 0), v); },
            blink: function (el, d) { SV.blink(el, t0 + (d || 0)); },
            farve: function (el, fra, til, d, v) { SV.farve(el, fra, til, t0 + (d || 0), v); },
            taelOp: function (t, slut, dec, d, v, efter) { SV.taelOp(t, slut, dec, t0 + (d || 0), v, efter); }
        };
    }

    /* =================================================================
       Bygger: én fane
       ================================================================= */
    function Bygger(rod, def) {
        var self = this;
        this.rod = rod;
        this.def = def;
        this.id = def.id;

        this.kort = rod.querySelector(".scenekort");
        this.figur = rod.querySelector(".figur");
        this.lagListe = rod.querySelector(".lagliste");
        this.ordListe = rod.querySelector(".ordliste");
        this.ordTaeller = rod.querySelector(".ord-taeller");
        this.stjerneTaeller = rod.querySelector(".stjerne-taeller");

        var vb = def.vb || [1000, 600];
        this.svg = SV.el("svg", {
            viewBox: "0 0 " + vb[0] + " " + vb[1],
            preserveAspectRatio: "xMidYMid meet",
            role: "img",
            "aria-label": "Figur til afsnit " + def.nr + " " + def.titel
        }, this.figur);
        SV.defs(this.svg);
        this.ark = SV.el("rect", { x: 3, y: 3, width: vb[0] - 6, height: vb[1] - 6, rx: 16, fill: SV.F.ark, stroke: "#dde2e7", "stroke-width": 1.5 }, this.svg);
        this.tegning = SV.g(this.svg, { "class": "tegning" });
        this.pladsLag = SV.g(this.svg, { "class": "pladser" });

        /* Delene af figuren */
        this.dele = {};
        this.deleListe = [];
        def.tegn(this.api());

        /* Lagene: hvilke pladser og ord */
        var pladsLag = {};
        this.lag = def.lag.map(function (l, i) {
            l.pladser.forEach(function (id) { pladsLag[id] = i; });
            return l;
        });

        /* Pladserne */
        this.bredde = 120;
        def.pladser.forEach(function (p) {
            p.ord.forEach(function (o) { self.bredde = Math.max(self.bredde, ordBredde(o) + 2 * KANT); });
        });
        this.bredde = Math.ceil(this.bredde);
        this.pladser = {};
        this.pladsListe = [];
        /* Et par staar side om side om parrets midte, med plads til "eller" */
        def.pladser.forEach(function (p) {
            if (!p.par || p.parMidte !== undefined) return;
            var q = def.pladser.filter(function (x) { return x.id === p.par; })[0];
            p.parMidte = p.x;
            p.x = p.parMidte - self.bredde / 2 - 22;
            q.x = p.parMidte + self.bredde / 2 + 22;
            q.y = p.y;
            q.titel = true;
            q.maal = p.maal;
        });
        def.pladser.forEach(function (p) {
            p.lag = pladsLag[p.id];
            self.lavPlads(p);
        });
        def.pladser.forEach(function (p) { if (p.par) self.lavPar(p, self.pladser[p.par]); });

        /* Alle fagord i figuren, i pladsernes raekkefoelge */
        this.alleOrd = [];
        this.pladsListe.forEach(function (p) {
            p.ord.forEach(function (o) { if (self.alleOrd.indexOf(o) < 0) self.alleOrd.push(o); });
        });

        this.svg.addEventListener("pointerdown", function (e) {
            if (e.target === self.svg || e.target === self.ark || self.tegning.contains(e.target)) self.klikFigur();
        });

        rod.querySelector(".forfraknap").addEventListener("click", function () { self.nulstil(); });

        /* Kontakten til den svaere udgave staar oeverst i panelet */
        var panel = rod.querySelector(".panel");
        if (panel) {
            var sv = document.createElement("label");
            sv.className = "kort svaer";
            sv.innerHTML = "<input type=\"checkbox\"><span class=\"svaer-kontakt\" aria-hidden=\"true\"></span>" +
                "<span class=\"svaer-tekst\"><b>Svær udgave</b><em>Alle fagord på én gang</em></span>";
            panel.insertBefore(sv, panel.firstChild);
            this.svaerKontakt = sv.querySelector("input");
            this.svaerKontakt.addEventListener("change", function () {
                if (NK.saetSvaer) NK.saetSvaer(self.svaerKontakt.checked);
                else self.saetAlt(self.svaerKontakt.checked);
            });
        }

        /* Kortet foelges, saa figuren kan rykke ned under det (se tilpasFigur) */
        this.svaerTop = 0;
        if (window.ResizeObserver) new window.ResizeObserver(function () { self.tilpasFigur(); }).observe(this.kort);

        this.alt = !!NK.svaer;
        if (this.svaerKontakt) this.svaerKontakt.checked = this.alt;
        this.nulstil();
    }

    /* ----- Det, figurfilerne tegner med -------------------------------- */
    Bygger.prototype.api = function () {
        var self = this;
        return {
            F: SV.F,
            SV: SV,
            /* Noget, der altid staar der */
            fast: function (fn) { fn(SV.g(self.tegning, { "class": "fast" })); },
            /* En del, der bygges, naar en plads (eller et lag) er loest */
            del: function (id, o) {
                var g = SV.g(self.tegning, { "class": "del", "data-del": id });
                var sp = SV.g(g, { "class": "spoeg" });
                var fu = SV.g(g, { "class": "fuld" });
                /* Spoegelset er den samme tegning uden farver (se stilarket) */
                if (o.fuld) o.fuld(sp);
                var refs = o.fuld ? o.fuld(fu) : null;
                var d = { id: id, lag: o.lag || 0, auto: !!o.auto, g: g, sp: sp, fu: fu, byg: o.byg, refs: refs || {}, tilstand: "" };
                self.dele[id] = d;
                self.deleListe.push(d);
                return d;
            }
        };
    };

    /* fuld() tegner delen faerdig; byg() laegger kun animationerne paa */
    Bygger.prototype.saetDel = function (d, tilstand, t0) {
        d.tilstand = tilstand;
        d.g.style.display = tilstand === "skjult" ? "none" : "";
        d.sp.style.display = tilstand === "spoeg" ? "" : "none";
        d.fu.style.display = tilstand === "bygget" ? "" : "none";
        if (tilstand === "bygget" && t0 !== undefined && t0 !== null && !SV.stille) {
            var A = animator(t0);
            if (d.byg) d.byg(d.fu, d.refs, A);
            else A.fade(d.fu, 0, 500);
            /* Den graa udgave toner ud, mens farverne kommer */
            if (d.sp.animate) {
                d.sp.style.display = "";
                var an = d.sp.animate([{ opacity: 0.6 }, { opacity: 0 }], { duration: 500, delay: t0 + 150, fill: "forwards" });
                an.onfinish = function () {
                    an.cancel();
                    if (d.tilstand === "bygget") d.sp.style.display = "none";
                };
            }
        }
    };

    /* ----- Pladserne ------------------------------------------------------ */
    Bygger.prototype.lavPlads = function (p) {
        var self = this;
        var B = this.bredde;
        var g = SV.g(this.pladsLag, { "class": "plads", "data-id": p.id });
        var mx = p.maal[0], my = p.maal[1];
        p.g = g;
        /* Det, pladsen handler om, bliver gult, mens der spoerges om det */
        (p.omr || [{ c: [mx, my, 15] }]).forEach(function (o) {
            if (o.c) SV.el("circle", { "class": "p-halo", cx: o.c[0], cy: o.c[1], r: o.c[2] }, g);
            else if (o.ring) SV.el("circle", { "class": "p-halo ring", cx: o.ring[0], cy: o.ring[1], r: o.ring[2] }, g);
            else if (o.r) SV.el("rect", { "class": "p-halo" + (o.tom ? " ring" : ""), x: o.r[0], y: o.r[1], width: o.r[2], height: o.r[3], rx: o.r[4] || 7 }, g);
        });

        /* Stregen fra kassens kant til maalet, evt. med et knaek */
        var fra = p.via || p.maal;
        var dx = fra[0] - p.x, dy = fra[1] - p.y;
        var t = Math.min(dx ? (B / 2) / Math.abs(dx) : 1e9, dy ? (PH / 2) / Math.abs(dy) : 1e9);
        if (!isFinite(t) || t > 1) t = 1;
        var kx = p.x + dx * t, ky = p.y + dy * t;
        var punkter = kx + "," + ky + " " + (p.via ? p.via[0] + "," + p.via[1] + " " : "") + mx + "," + my;
        if (!p.titel && !p.par) {
            p.streg = SV.el("polyline", { "class": "p-streg", points: punkter, fill: "none", stroke: "#59636e", "stroke-width": 1.6 }, g);
            p.prik = SV.el("circle", { "class": "p-prik", cx: mx, cy: my, r: 3.6, fill: "#3b4650" }, g);
        }

        p.boks = SV.el("rect", { "class": "p-boks", x: p.x - B / 2, y: p.y - PH / 2, width: B, height: PH, rx: 8, fill: "#ffffff", stroke: "#b9c6cf" }, g);
        p.tekst = SV.tekst(g, p.x, p.y + 6.3, "", { "class": "p-tekst", "font-size": SKRIFT, "font-weight": 700 });

        g.addEventListener("pointerdown", function (e) { self.pladsNed(e, p); });
        g.addEventListener("pointerenter", function (e) {
            if (p.laast && e.pointerType !== "touch") self.visForkl(p.boks, p.vist);
            /* Er et ord valgt, staar det svagt paa pladsen, man peger paa */
            if (!p.laast && self.valgt && self.tilstand === "opgave") {
                SV.formelInd(p.tekst, self.valgt);
                p.g.classList.add("forslag");
            }
        });
        g.addEventListener("pointerleave", function () {
            self.skjulForkl();
            if (p.g.classList.contains("forslag")) { p.g.classList.remove("forslag"); self.tegnPlads(p); }
        });

        this.pladser[p.id] = p;
        this.pladsListe.push(p);
    };

    /* Parret: en klamme under (eller over) begge bokse, der samles i én
       streg til maalet, og "eller" imellem boksene */
    Bygger.prototype.lavPar = function (p, q) {
        var B = this.bredde, mx = p.parMidte, y = p.y;
        var op = p.maal[1] < y;
        var kant = op ? y - PH / 2 - 3 : y + PH / 2 + 3;
        var knaek = op ? kant - 9 : kant + 9;
        var x1 = p.x - B / 2 + 16, x2 = q.x + B / 2 - 16;
        p.klamme = SV.el("path", { "class": "p-streg", d: "M" + x1 + "," + kant + " L" + x1 + "," + knaek + " L" + x2 + "," + knaek + " L" + x2 + "," + kant,
            fill: "none", stroke: "#59636e", "stroke-width": 1.6 }, p.g);
        p.streg = SV.el("polyline", { "class": "p-streg", points: mx + "," + knaek + " " + p.maal[0] + "," + p.maal[1], fill: "none", stroke: "#59636e", "stroke-width": 1.6 }, p.g);
        p.prik = SV.el("circle", { "class": "p-prik", cx: p.maal[0], cy: p.maal[1], r: 3.6, fill: "#3b4650" }, p.g);
        p.eller = SV.tekst(p.g, mx, y + 5, "eller", { "class": "p-eller", "font-size": 14, "font-style": "italic", fill: "#7e8893" });
    };

    Bygger.prototype.tegnPlads = function (p) {
        var c = p.g.classList;
        var synlig = p.synlig;
        p.g.style.display = synlig ? "" : "none";
        c.toggle("laast", !!p.laast);
        c.toggle("aktiv", synlig && !p.laast && !p.paa);
        c.toggle("fyldt", synlig && !p.laast && !!p.paa);
        c.toggle("hintet", this.hintPlads === p.id && !p.laast);
        c.remove("forslag");
        SV.formelInd(p.tekst, p.laast ? p.vist : (p.paa || ""));
    };

    Bygger.prototype.tegnPladser = function () {
        for (var i = 0; i < this.pladsListe.length; i++) this.tegnPlads(this.pladsListe[i]);
    };

    /* De pladser, der spoerges om nu */
    Bygger.prototype.aktive = function () {
        var self = this;
        return this.pladsListe.filter(function (p) {
            return p.synlig && !p.laast && (self.alt || p.lag === self.lagNr);
        });
    };

    /* =================================================================
       Forloebet
       ================================================================= */
    Bygger.prototype.nulstil = function () {
        this.stjerner = [];
        this.faerdig = false;
        if (NK.faneFaerdig) NK.faneFaerdig(this.id, false);
        this.springLag(0, true);
    };

    /* Svaer udgave til og fra: figuren begynder forfra */
    Bygger.prototype.saetAlt = function (alt) {
        this.alt = !!alt;
        if (this.svaerKontakt) this.svaerKontakt.checked = this.alt;
        this.svaerTop = 0;
        this.figur.style.top = "";
        this.nulstil();
        this.tilpasFigur();
    };

    /* I den svaere udgave kan bakken faa saa mange ord, at kortet bliver
       hoejere end pladsen over figuren, og pladserne foroven kom ind under
       kortet (B5.2 med ni fagord, 3. nov. 2026). Saa rykker figuren ned
       under kortet. Den rykker ikke op igen, mens der arbejdes, saa
       pladserne ikke flytter sig, naar bakken bliver mindre. */
    Bygger.prototype.tilpasFigur = function () {
        if (!this.alt || !this.kort.offsetHeight) return;
        var zone = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue("--kortzone")) || 0;
        var bund = this.kort.offsetTop + this.kort.offsetHeight + 10;
        if (bund <= zone || bund <= this.svaerTop) return;
        this.svaerTop = bund;
        this.figur.style.top = bund + "px";
    };

    /* Gaa til et lag: lagene foer bygges straks, laget selv staar graa,
       og resten er skjult. I den svaere udgave staar hele figuren graa. */
    Bygger.prototype.springLag = function (n, frisk) {
        var self = this, i;
        n = this.alt ? 0 : Math.max(0, Math.min(n, this.lag.length - 1));
        this.skjulForkl();
        var gem = SV.stille;
        SV.stille = true;
        for (i = 0; i < this.deleListe.length; i++) {
            var d = this.deleListe[i];
            if (this.alt) this.saetDel(d, d.auto ? "bygget" : "spoeg");
            else this.saetDel(d, d.lag < n ? "bygget" : (d.lag === n ? "spoeg" : "skjult"));
        }
        SV.stille = gem;
        this.pladsListe.forEach(function (p) {
            p.paa = null;
            p.synlig = !self.alt && p.lag < n;
            p.laast = !self.alt && p.lag < n;
            if (p.laast && !p.vist) p.vist = p.ord[0];
            if (!p.laast) p.vist = null;
        });
        /* Et par, der deler to pladser (aedelgasreglen og oktetreglen), skal have hver sit ord */
        this.pladsListe.forEach(function (p) {
            if (!p.laast) return;
            var brugt = self.pladsListe.filter(function (q) { return q !== p && q.laast && q.vist; }).map(function (q) { return q.vist; });
            if (brugt.indexOf(p.vist) >= 0) {
                for (var k = 0; k < p.ord.length; k++) if (brugt.indexOf(p.ord[k]) < 0) { p.vist = p.ord[k]; break; }
            }
        });
        if (frisk) this.stjerner = [];
        this.startLag(n);
    };

    Bygger.prototype.startLag = function (n) {
        var self = this;
        this.lagNr = n;
        this.forsoeg = 0;
        this.hjaelpBrugt = false;
        this.hintTrin = 0;
        this.hintPlads = null;
        this.valgt = null;
        this.rod.classList.remove("har-valgt");
        this.tilstand = "opgave";
        this.besked("", "");

        this.rod.classList.toggle("svaer-udgave", this.alt);
        if (this.alt) {
            /* Svaer udgave: alle pladser paa én gang og alle fagord i bakken */
            this.pladsListe.forEach(function (p) { p.synlig = true; p.laast = false; p.paa = null; p.vist = null; });
            this.bakke = bland(this.alleOrd);
        } else {
            var lag = this.lag[n];
            var t = 0;
            this.deleListe.forEach(function (d) {
                if (d.lag !== n) return;
                if (d.auto) { self.saetDel(d, "bygget", t); t += 150; }
                else if (d.tilstand === "skjult") {
                    /* Lagets dele kommer frem uden farver */
                    self.saetDel(d, "spoeg");
                    if (d.sp.animate && !SV.stille) d.sp.animate([{ opacity: 0 }, { opacity: 0.6 }], { duration: 450, delay: 100, fill: "backwards" });
                }
            });
            var ord = [];
            lag.pladser.forEach(function (id) {
                var p = self.pladser[id];
                p.synlig = true; p.laast = false; p.paa = null;
                p.ord.forEach(function (o) { if (ord.indexOf(o) < 0) ord.push(o); });
            });
            /* Et par ord til to pladser: kun saa mange som pladser */
            ord = ord.slice(0, lag.pladser.length);
            this.bakke = bland(ord.concat(lag.ekstra || []));
        }
        this.tegnPladser();
        this.tegnKort();
        this.tegnPanel();
    };

    /* ----- Placering ----------------------------------------------------- */
    Bygger.prototype.hvorEr = function (ord) {
        for (var i = 0; i < this.pladsListe.length; i++) if (this.pladsListe[i].paa === ord) return this.pladsListe[i];
        return null;
    };

    Bygger.prototype.placer = function (ord, p) {
        if (!p || p.laast || !p.synlig) return;
        var fra = this.hvorEr(ord);
        /* Ordet blev sluppet paa sin egen plads. Under traekket var det skjult
           paa pladsen, saa det tegnes igen (brugeren 2. nov. 2026: ordet
           "forsvandt simpelthen bare" og kom foerst frem ved naeste ord) */
        if (fra === p) { this.tegnPlads(p); return; }
        var gammel = p.paa;
        if (fra) fra.paa = null;
        var i = this.bakke.indexOf(ord);
        if (i >= 0) this.bakke.splice(i, 1);
        p.paa = ord;
        if (gammel) {
            /* Ordet, der sad der, bytter plads eller ryger i bakken */
            if (fra) fra.paa = gammel;
            else this.bakke.push(gammel);
        }
        this.vaelg(null);
        if (this.beskedSlags === "skidt") this.besked("", "");
        this.tegnPladser();
        this.tegnBakke();
        this.tegnKnapper();
    };

    /* Et klik paa et ord i bakken vaelger det (brugeren 1. nov. 2026: "en meget
       tydelig ring om det man har klikket"): ordet faar en gul ring og loefter
       sig, de gule pladser lyser op, og kortet siger, hvad der skal ske */
    Bygger.prototype.vaelg = function (ord) {
        this.valgt = ord || null;
        this.rod.classList.toggle("har-valgt", !!this.valgt);
        if (this.valgt) this.besked("<b>" + html(this.valgt) + "</b> er valgt. Klik på den gule plads, ordet hører til.", "valg", "Valgt");
        else if (this.beskedSlags === "valg") this.besked("", "");
        this.tegnBakke();
    };

    Bygger.prototype.tilBakken = function (p) {
        if (!p.paa) return;
        this.bakke.push(p.paa);
        p.paa = null;
        this.vaelg(null);
        this.tegnPladser();
        this.tegnBakke();
        this.tegnKnapper();
    };

    /* ----- Traek og klik --------------------------------------------------- */
    Bygger.prototype.laast = function () {
        if (this.tilstand === "opgave") return false;
        this.blinkKort();
        return true;
    };

    Bygger.prototype.klikFigur = function () {
        if (this.tilstand !== "opgave") this.blinkKort();
    };

    Bygger.prototype.pladsNed = function (e, p) {
        if (e.button !== undefined && e.button !== 0) return;
        if (p.laast) {
            if (e.pointerType === "touch") this.visForkl(p.boks, p.vist, true);
            else if (this.tilstand !== "opgave") this.blinkKort();
            return;
        }
        if (this.laast()) return;
        e.preventDefault();
        if (p.paa) this.traek(e, p.paa, p);
        else this.traek(e, null, p);
    };

    Bygger.prototype.ordNed = function (e, ord, knap) {
        if (e.button !== undefined && e.button !== 0) return;
        if (this.laast()) return;
        e.preventDefault();
        this.traek(e, ord, null, knap);
    };

    /* Faelles for bakken og pladserne: et traek flytter ordet, et klik
       vaelger ordet (bakken) eller saetter det valgte ord paa (pladsen) */
    Bygger.prototype.traek = function (e, ord, fraPlads, knap) {
        var self = this;
        var sx = e.clientX, sy = e.clientY;
        var i_luften = false, spoegelse = null, over = null, overBakke = false;
        var bakkeEl = this.kort.querySelector(".bakke");

        function find(x, y) {
            over = null;
            overBakke = false;
            /* Pladsen tæller, til man er 30 px fra den; den naermeste vinder
               (brugeren 1. nov. 2026: traekket var "minitræls") */
            var r, bedst = 30;
            var aktive = self.aktive();
            for (var i = 0; i < aktive.length; i++) {
                r = aktive[i].boks.getBoundingClientRect();
                var ax = Math.max(r.left - x, 0, x - r.right), ay = Math.max(r.top - y, 0, y - r.bottom);
                var afst = Math.sqrt(ax * ax + ay * ay);
                if (afst <= bedst) { bedst = afst; over = aktive[i]; }
            }
            if (!over && bakkeEl) {
                r = bakkeEl.getBoundingClientRect();
                overBakke = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
            }
            self.pladsListe.forEach(function (p) { p.g.classList.toggle("over", p === over); });
            if (bakkeEl) bakkeEl.classList.toggle("over", overBakke && !!fraPlads);
        }

        function ingenMarkering(ev) { ev.preventDefault(); }
        if (window.getSelection) { try { window.getSelection().removeAllRanges(); } catch (x) { /* intet */ } }
        document.addEventListener("selectstart", ingenMarkering);

        function flyt(ev) {
            if (!ord) return;
            var dx = ev.clientX - sx, dy = ev.clientY - sy;
            if (!i_luften && dx * dx + dy * dy > 36) {
                i_luften = true;
                document.body.classList.add("traekker");
                spoegelse = document.createElement("div");
                spoegelse.className = "ord traek";
                spoegelse.textContent = ord;
                document.body.appendChild(spoegelse);
                if (knap) knap.classList.add("i-luften");
                if (fraPlads) { fraPlads.paa = null; self.tegnPlads(fraPlads); fraPlads.paa = ord; }
                self.skjulForkl();
            }
            if (i_luften) {
                spoegelse.style.left = ev.clientX + "px";
                spoegelse.style.top = ev.clientY + "px";
                find(ev.clientX, ev.clientY);
            }
        }

        function op(ev) {
            document.removeEventListener("selectstart", ingenMarkering);
            document.body.classList.remove("traekker");
            window.removeEventListener("pointermove", flyt);
            window.removeEventListener("pointerup", op);
            window.removeEventListener("pointercancel", op);
            if (spoegelse && spoegelse.parentNode) spoegelse.parentNode.removeChild(spoegelse);
            if (knap) knap.classList.remove("i-luften");
            self.pladsListe.forEach(function (p) { p.g.classList.remove("over"); });
            if (bakkeEl) bakkeEl.classList.remove("over");

            if (i_luften) {
                find(ev.clientX, ev.clientY);
                if (over) self.placer(ord, over);
                else if (fraPlads) self.tilBakken(fraPlads);
                else self.tegnBakke();
                self.pladsListe.forEach(function (p) { p.g.classList.remove("over"); });
                return;
            }
            /* Et klik */
            if (fraPlads) {
                if (self.valgt && self.valgt !== fraPlads.paa) self.placer(self.valgt, fraPlads);
                else if (fraPlads.paa) self.tilBakken(fraPlads);
                else self.peg("Træk et fagord hen på den gule plads, eller klik først på ordet og så på pladsen.");
            } else if (ord) {
                self.vaelg(self.valgt === ord ? null : ord);
            }
        }

        window.addEventListener("pointermove", flyt);
        window.addEventListener("pointerup", op);
        window.addEventListener("pointercancel", op);
    };

    /* ----- Indsend svar ------------------------------------------------------ */
    Bygger.prototype.alleFyldt = function () {
        var a = this.aktive();
        for (var i = 0; i < a.length; i++) if (!a[i].paa) return false;
        return a.length > 0;
    };

    Bygger.prototype.indsend = function () {
        var self = this;
        if (this.tilstand !== "opgave") { this.blinkKort(); return; }
        var aktive = this.aktive();
        var tomme = aktive.filter(function (p) { return !p.paa; });
        if (tomme.length) {
            this.besked("Der mangler et fagord på " + (tomme.length === 1 ? "én gul plads" : talOrd(tomme.length) + " gule pladser") + " i figuren.", "skidt", "Ikke endnu");
            this.rystBund();
            return;
        }
        this.forsoeg++;
        var rigtige = [], forkerte = [];
        aktive.forEach(function (p) {
            if (p.ord.indexOf(p.paa) >= 0) rigtige.push(p);
            else forkerte.push(p);
        });

        /* De rigtige laases og bygges, en ad gangen */
        var t0 = 0;
        rigtige.forEach(function (p) {
            p.laast = true;
            p.vist = p.paa;
            p.paa = null;
            if (self.hintPlads === p.id) { self.hintPlads = null; self.hintTrin = 0; }
            p.g.classList.add("ny");
            (function (pp) { window.setTimeout(function () { pp.g.classList.remove("ny"); }, 1800); }(p));
            (p.dele || []).forEach(function (id) {
                var d = self.dele[id];
                if (d && d.tilstand !== "bygget") { self.saetDel(d, "bygget", t0); t0 += 260; }
            });
            t0 += 200;
        });

        /* De forkerte ryger tilbage i bakken */
        var foerste = forkerte[0];
        forkerte.forEach(function (p) {
            self.bakke.push(p.paa);
            p.forkertOrd = p.paa;
            p.paa = null;
            if (p.boks.animate && !SV.stille) {
                p.boks.classList.add("anim");
                p.boks.animate([
                    { transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" },
                    { transform: "translateX(-3px)" }, { transform: "translateX(0)" }
                ], { duration: 380 });
            }
        });

        this.tegnPladser();
        this.tegnPanel();

        if (!forkerte.length) {
            this.loest();
            return;
        }
        var n = rigtige.length + forkerte.length;
        var start = rigtige.length ? talOrd(rigtige.length, true) + " af " + talOrd(n) + " fagord sidder rigtigt. " : "";
        var w = foerste.forkertOrd;
        var tekst = (foerste.fejl && foerste.fejl[w])
            ? foerste.fejl[w]
            : "<b>" + html(w) + "</b> passer ikke på sin plads. Ordet betyder: <span class=\"fo\">" + html(NK.foersteSaetning(NK.FORKLARING[w] || "")) + "</span>";
        this.besked(start + tekst, "skidt", rigtige.length ? "Næsten" : "Ikke endnu");
        this.rystBund();
        this.tegnBakke();
        this.tegnKnapper();
        var hk = this.kort.querySelector(".knap.hjaelp");
        if (hk) hk.classList.add("peg");
    };

    Bygger.prototype.loest = function () {
        var stjerne = this.forsoeg === 1 && !this.hjaelpBrugt;
        this.stjerner[this.lagNr] = this.stjerner[this.lagNr] || stjerne;
        this.tilstand = "loest";
        this.hintPlads = null;
        this.tegnPladser();
        this.tegnPanel();
        if (this.sidste()) {
            this.faerdig = true;
            if (NK.faneFaerdig) NK.faneFaerdig(this.id, true);
            NK.konfetti(this.kort);
        }
        this.tegnKort(stjerne);
    };

    /* Det sidste, der skal loeses paa fanen: det sidste lag eller hele
       figuren i den svaere udgave */
    Bygger.prototype.sidste = function () {
        return this.alt || this.lagNr === this.lag.length - 1;
    };

    Bygger.prototype.naeste = function () {
        if (this.tilstand !== "loest") return;
        if (this.sidste()) {
            if (NK.naesteFane) NK.naesteFane(this.id);
            return;
        }
        this.startLag(this.lagNr + 1);
    };

    Bygger.prototype.enter = function () {
        if (this.tilstand === "loest") this.naeste();
        else this.indsend();
    };

    /* ----- Hjaelpen: et hint og saa svaret, en plads ad gangen ------------- */
    Bygger.prototype.hjaelp = function () {
        if (this.tilstand !== "opgave") { this.blinkKort(); return; }
        var self = this;
        var aktive = this.aktive();
        if (!aktive.length) return;
        this.hjaelpBrugt = true;

        /* Ordet, der skal paa en plads: for et par det, der ikke er brugt */
        function svaret(p) {
            for (var k = 0; k < p.ord.length; k++) {
                var o = p.ord[k];
                var andet = self.pladsListe.filter(function (q) { return q !== p && (q.laast ? q.vist === o : q.paa === o) && q.ord.indexOf(o) >= 0; });
                if (!andet.length) return o;
            }
            return p.ord[0];
        }

        if (this.hintTrin === 0 || !this.pladser[this.hintPlads] || this.pladser[this.hintPlads].laast) {
            var p = null;
            for (var i = 0; i < aktive.length; i++) {
                if (aktive[i].ord.indexOf(aktive[i].paa) < 0) { p = aktive[i]; break; }
            }
            if (!p) {
                this.besked("Alle de gule pladser har et fagord. Tryk på Indsend svar.", "hint", "Hint");
                return;
            }
            this.hintPlads = p.id;
            this.hintTrin = 1;
            this.besked("Fagordet til den orange plads betyder: <span class=\"fo\">" + html(NK.foersteSaetning(NK.FORKLARING[svaret(p)])) + "</span>", "hint", "Hint");
        } else {
            var q = this.pladser[this.hintPlads];
            var o = svaret(q);
            this.placer(o, q);
            this.hintTrin = 0;
            this.besked("<b>" + html(o) + "</b> er sat på den orange plads. Tryk på Indsend svar, når alle pladser har et fagord.", "hint", "Svaret");
            this.hintPlads = q.id;
        }
        this.tegnPladser();
        this.tegnKnapper();
    };

    /* =================================================================
       Kortet oeverst i scenen
       ================================================================= */
    Bygger.prototype.tegnKort = function (stjerne) {
        var self = this;
        var k = this.kort;
        var L = this.lag.length;
        k.classList.toggle("loest", this.tilstand === "loest");
        k.classList.toggle("mester", this.alt && this.tilstand !== "loest");

        if (this.tilstand === "loest") {
            var h = "<div class=\"sk-slut\"><div class=\"sk-slut-tekst\">";
            var antal = this.stjerner.filter(Boolean).length, mulige = this.alt ? 1 : L;
            var stjerneLinje = "<li>Stjerner: <b>" + "★".repeat(antal) + "☆".repeat(Math.max(0, mulige - antal)) + "</b> (" + antal + " af " + mulige + ")</li>";
            if (this.alt) {
                h += "<p class=\"sk-tekst\"><span class=\"sk-chip\">Figuren er færdig" + (stjerne ? " ★" : "") + "</span>Alle " + talOrd(this.alleOrd.length) +
                    " fagord fra afsnit " + this.def.nr + " sidder på plads.</p>";
                h += "<ul class=\"fl-liste\">" + stjerneLinje + "<li>Peg på et fagord i figuren for at se forklaringen fra bogen.</li></ul>";
            } else {
                var lag = this.lag[this.lagNr];
                h += "<p class=\"sk-tekst\"><span class=\"sk-chip\">" + (this.sidste() ? "Figuren er færdig" : "Rigtigt") + (stjerne ? " ★" : "") + "</span>" +
                    html(lag.ros || "Figuren har fået nye dele.") + "</p>";
                h += "<ul class=\"fl-liste\">";
                lag.pladser.forEach(function (id) {
                    var p = self.pladser[id];
                    h += "<li><b>" + html(p.vist) + "</b>" + html(NK.foersteSaetning(NK.FORKLARING[p.vist] || "")) + "</li>";
                });
                if (this.sidste() && L > 1) h += stjerneLinje;
                h += "</ul>";
            }
            /* Efter den sidste figur er der ingen knap her: en knap, der
               byggede forfra, blev trykket paa i forventning om en ny opgave */
            var knapTekst = null;
            if (!this.sidste()) knapTekst = "Næste lag →";
            else if (NK.naesteFaneNavn) knapTekst = NK.naesteFaneNavn(this.id);
            if (!knapTekst) {
                h += "<p class=\"sk-alle\">Alle figurerne til kapitel " + html(NK.KAPITEL) + " er bygget." +
                    (this.alt ? "" : " Slå <b>Svær udgave</b> til i panelet for at sætte alle fagord på én gang.") + "</p>";
            }
            h += "</div>";
            if (knapTekst) h += "<button class=\"sk-videre\" type=\"button\">" + html(knapTekst) + "</button>";
            h += "</div>";
            k.innerHTML = h;
            var vk = k.querySelector(".sk-videre");
            if (vk) vk.addEventListener("click", function () { self.naeste(); });
            return;
        }

        var chip, tekst;
        if (this.alt) {
            chip = "Svær udgave";
            tekst = "Sæt alle " + talOrd(this.alleOrd.length) + " fagord på figuren på én gang.";
        } else {
            var l = this.lag[this.lagNr];
            chip = "Lag " + (this.lagNr + 1) + " af " + L;
            if (this.lagNr === 0) tekst = "Træk hvert fagord hen på den gule plads, det hører til, eller klik på ordet og så på pladsen. Når ordet sidder rigtigt, bliver den del af figuren bygget.";
            else tekst = "Træk fagordene hen på de gule pladser i figuren.";
            if (l.ekstra && l.ekstra.length) tekst += (l.ekstra.length === 1 ? " Ét fagord er i overskud." : " " + talOrd(l.ekstra.length, true) + " fagord er i overskud.");
        }
        k.innerHTML =
            "<p class=\"sk-tekst\"><span class=\"sk-chip\">" + html(chip) + "</span>" + html(tekst) + "</p>" +
            "<div class=\"bakke\" aria-label=\"Fagordene\"></div>" +
            "<div class=\"sk-bund\"><p class=\"st-tekst\" aria-live=\"polite\"></p>" +
            "<button class=\"knap hjaelp\" type=\"button\">Giv et hint</button>" +
            "<button class=\"knap indsend\" type=\"button\">Indsend svar</button></div>";
        k.querySelector(".knap.hjaelp").addEventListener("click", function () { self.hjaelp(); });
        k.querySelector(".knap.indsend").addEventListener("click", function () { self.indsend(); });
        this.tegnBakke();
        this.tegnKnapper();
        this.visBesked();
    };

    Bygger.prototype.tegnBakke = function () {
        var self = this;
        var b = this.kort.querySelector(".bakke");
        if (!b) return;
        b.innerHTML = "";
        if (!this.bakke.length) {
            var tom = document.createElement("span");
            tom.className = "bakke-tom";
            tom.textContent = "Alle fagord er i figuren. Tryk på Indsend svar.";
            b.appendChild(tom);
            return;
        }
        b.classList.toggle("mange", this.bakke.length > 10);
        this.bakke.forEach(function (o) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "ord" + (self.valgt === o ? " valgt" : "");
            k.textContent = o;
            k.setAttribute("data-ord", o);
            k.addEventListener("pointerdown", function (e) { self.ordNed(e, o, k); });
            k.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    /* Tastatur: ordet kommer paa den foerste tomme plads */
                    var tom = self.aktive().filter(function (p) { return !p.paa; })[0];
                    if (tom) self.placer(o, tom);
                }
            });
            b.appendChild(k);
        });
    };

    Bygger.prototype.tegnKnapper = function () {
        var ind = this.kort.querySelector(".knap.indsend");
        var hj = this.kort.querySelector(".knap.hjaelp");
        if (ind) {
            var klar = this.alleFyldt();
            ind.classList.toggle("klar", klar);
            ind.classList.toggle("ikke-klar", !klar);
        }
        if (hj) {
            var svar = this.hintTrin === 1;
            hj.textContent = svar ? "Vis svaret" : "Giv et hint";
            hj.classList.toggle("svar", svar);
        }
    };

    Bygger.prototype.besked = function (tekst, slags, maerke) {
        this.beskedTekst = tekst || "";
        this.beskedSlags = slags || "";
        this.beskedMaerke = maerke || "";
        this.visBesked();
    };

    Bygger.prototype.visBesked = function () {
        var bund = this.kort.querySelector(".sk-bund");
        if (!bund) return;
        var t = bund.querySelector(".st-tekst");
        bund.classList.remove("skidt", "hint", "god");
        if (this.beskedSlags) bund.classList.add(this.beskedSlags);
        t.innerHTML = (this.beskedMaerke && this.beskedTekst ? "<span class=\"b-maerke\">" + html(this.beskedMaerke) + "</span>" : "") + this.beskedTekst;
    };

    Bygger.prototype.peg = function (tekst) {
        this.besked(html(tekst), "hint", "Sådan");
        var b = this.kort.querySelector(".bakke");
        if (b && b.animate) b.animate([{ borderColor: "#f2c53d" }, { borderColor: "#4a4f5e" }], { duration: 900 });
    };

    Bygger.prototype.rystBund = function () {
        var b = this.kort.querySelector(".sk-bund");
        if (!b) return;
        b.classList.remove("ryster");
        void b.offsetWidth;
        b.classList.add("ryster");
    };

    Bygger.prototype.blinkKort = function () {
        var k = this.kort;
        k.classList.remove("blink");
        void k.offsetWidth;
        k.classList.add("blink");
    };

    /* =================================================================
       Panelet: lagene og fagordene paa plads
       ================================================================= */
    Bygger.prototype.tegnPanel = function () {
        var self = this;
        var L = this.lag.length;
        this.lagListe.innerHTML = "";
        /* I den svaere udgave er der kun én linje: hele figuren */
        var linjer = this.alt ? 1 : L;
        for (var i = 0; i < linjer; i++) {
            var b = document.createElement("button");
            b.type = "button";
            var loest = this.alt ? this.tilstand === "loest" : (i < this.lagNr || (i === this.lagNr && this.tilstand === "loest"));
            b.className = "laglinje" + (i === this.lagNr ? " valgt" : "") + (loest ? " loest" : "") + (this.alt ? " mester" : "");
            var navn = this.alt ? "Alle fagord på én gang" : this.lag[i].navn;
            var under = (this.alt ? this.alleOrd.length : this.lag[i].pladser.length) + " fagord";
            b.innerHTML = "<span class=\"l-nr\">" + (loest ? "✓" : (this.alt ? "★" : (i + 1))) + "</span>" +
                "<span class=\"l-navn\">" + html(navn) + "<em>" + html(under) + "</em></span>" +
                "<span class=\"l-stjerne\">" + (this.stjerner[i] ? "★" : "") + "</span>";
            (function (n) { b.addEventListener("click", function () { self.springLag(n); }); }(i));
            this.lagListe.appendChild(b);
        }
        if (this.stjerneTaeller) this.stjerneTaeller.innerHTML = "<b>" + this.stjerner.filter(Boolean).length + "</b> ★";

        /* Fagordene, der sidder paa plads */
        this.ordListe.innerHTML = "";
        var paaPlads = this.pladsListe.filter(function (p) { return p.laast; });
        paaPlads.forEach(function (p) {
            var c = document.createElement("span");
            c.className = "ordchip";
            c.textContent = p.vist;
            c.addEventListener("pointerenter", function () { self.visForkl(c, p.vist); });
            c.addEventListener("pointerleave", function () { self.skjulForkl(); });
            c.addEventListener("click", function () { self.visForkl(c, p.vist, true); });
            self.ordListe.appendChild(c);
        });
        if (this.ordTaeller) this.ordTaeller.innerHTML = "<b>" + paaPlads.length + "</b>/" + this.alleOrd.length;
    };

    /* ----- Forklaringen fra bogen ved et ord, der sidder paa plads -------- */
    var forklEl = null, forklTimer = null;
    Bygger.prototype.visForkl = function (el, ord, kort) {
        if (!ord || !NK.FORKLARING[ord]) return;
        if (!forklEl) {
            forklEl = document.createElement("div");
            forklEl.className = "forkl-boks";
            document.body.appendChild(forklEl);
        }
        forklEl.innerHTML = "<b>" + html(ord) + "</b>" + html(NK.FORKLARING[ord]);
        forklEl.hidden = false;
        var r = el.getBoundingClientRect();
        var b = forklEl.offsetWidth, h = forklEl.offsetHeight;
        var x = Math.min(window.innerWidth - b - 8, Math.max(8, r.left + r.width / 2 - b / 2));
        var y = r.top - h - 8;
        if (y < 8) y = r.bottom + 8;
        forklEl.style.left = x + "px";
        forklEl.style.top = y + "px";
        window.clearTimeout(forklTimer);
        if (kort) forklTimer = window.setTimeout(function () { forklEl.hidden = true; }, 3500);
    };

    Bygger.prototype.skjulForkl = function () {
        if (forklEl) forklEl.hidden = true;
    };

    NK.Bygger = Bygger;

    /* ----- Konfetti (som sb4.4) ---------------------------------------------- */
    NK.konfetti = function (ved) {
        if (SV.stille) return;
        var r = ved.getBoundingClientRect();
        var k = document.createElement("div");
        k.className = "konfetti";
        k.style.left = (r.left + r.width / 2) + "px";
        k.style.top = (r.top + r.height * 0.6) + "px";
        var farver = ["#f2c53d", "#3fae72", "#3d9ee0", "#e05446", "#9b6bd6", "#ffffff"];
        for (var i = 0; i < 90; i++) {
            var s = document.createElement("i");
            s.style.background = farver[i % farver.length];
            s.style.setProperty("--dx", Math.round((Math.random() - 0.5) * 900) + "px");
            s.style.setProperty("--op", Math.round(-80 - Math.random() * 160) + "px");
            s.style.setProperty("--ned", Math.round(250 + Math.random() * 450) + "px");
            s.style.setProperty("--rot", Math.round((Math.random() - 0.5) * 1080) + "deg");
            s.style.animationDelay = Math.round(Math.random() * 250) + "ms";
            k.appendChild(s);
        }
        document.body.appendChild(k);
        window.setTimeout(function () { if (k.parentNode) k.parentNode.removeChild(k); }, 3200);
    };
}());
