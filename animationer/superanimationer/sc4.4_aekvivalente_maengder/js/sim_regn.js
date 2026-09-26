/* =====================================================================
   sim_regn.js - fane 3: aekvivalente maengder

   Paa tavlen staar reaktionsskemaet. Én stofmaengde er kendt (den groenne
   boks), og eleven skriver de andre i felterne under formlerne. Under
   hver formel staar en soejle: koefficienten er en stiplet stabel af
   blokke, og stofmaengden er fyldet i samme maalestok, hvor den kendte
   stofmaengde fylder netop sine blokke. Et rigtigt svar fylder ogsaa
   netop sine blokke; et forkert svar staar roedt og for hoejt eller for
   lavt. Saa ses forholdet, uden at det skal forklares.

   Tolv opgaver i tre niveauer. Paa Svaer staar skemaet uden koefficienter,
   og eleven afstemmer det foerst. Knappen giver et hint og saa svaret. En
   opgave, der er loest uden at se svaret, faar en stjerne. Svarene staar
   bagefter som paene beregninger i panelet. Fremskridtet huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc4.4-regn";
    var FARVE = { kendt: "#3fae72", ok: "#3d9ee0", svar: "#e0b43a", forkert: "#e05446" };

    function SimRegn() {
        this.L = new NK.Laerred(NK.el("regn-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = D.OPGAVER.map(function (o) {
            var s = gemt[o.nr];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = {};
        this.lay = null;
        this.over = null;
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        this.valgt = -1;
        this.opg = null;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(-1));
    }

    var P = SimRegn.prototype;

    /* ----- Hukommelse ------------------------------------------------------ */
    P.gem = function () {
        var ud = {}, mig = this;
        D.OPGAVER.forEach(function (o, i) {
            var s = mig.status[i];
            if (s.loest) ud[o.nr] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function (niveau) {
        var n = 0, mig = this;
        D.OPGAVER.forEach(function (o, i) {
            if ((niveau === undefined || o.niveau === niveau) && mig.status[i].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (niveau) {
        var n = 0, mig = this;
        D.OPGAVER.forEach(function (o, i) {
            if ((niveau === undefined || o.niveau === niveau) && mig.status[i].stjerne) n++;
        });
        return n;
    };

    P.iNiveau = function (niveau) {
        return D.OPGAVER.filter(function (o) { return o.niveau === niveau; }).length;
    };

    P.naesteUloeste = function (fra) {
        var n = D.OPGAVER.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return (fra + 1 + n) % n;
    };

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        var luft = NK.klamp(H * 0.1, 12, 74);
        lay.tavle = { x: kant + 6, y: luft, b: W - 2 * kant - 12, h: H - luft - 24 };
        this.lay = lay;
        this.layoutSkema();
    };

    /* Skemaets pladser paa tavlen. Afhaenger af opgaven (antal led og om
       der skal afstemmes), saa det regnes igen ved hver ny opgave. */
    P.layoutSkema = function () {
        var lay = this.lay, o = this.opg;
        if (!lay || !o) return;
        var t = lay.tavle, r = o.o.r, n = r.led.length;
        var pad = NK.klamp(t.b * 0.03, 10, 24);
        var ib = t.b - 2 * pad;
        lay.feltB = Math.round(NK.klamp(ib / (n * 1.22), 76, 132));
        var tegnB = NK.klamp(ib * 0.05, 18, 40);
        var ledB = (ib - (n - 1) * tegnB) / n;
        lay.formelPx = Math.round(NK.klamp(Math.min(ledB * 0.24, t.h * 0.085), 16, 38));
        lay.forklaring = t.y + 12;
        lay.skemaY = t.y + Math.max(lay.formelPx * 0.9 + 30, t.h * 0.15);
        lay.feltY = t.y + t.h - 52;
        lay.soejleTop = lay.skemaY + lay.formelPx * 0.75 + 16;
        lay.soejleBund = lay.feltY - 16;
        var maxK = 1;
        r.led.forEach(function (l) { maxK = Math.max(maxK, l.k); });
        var loft = lay.soejleBund - lay.soejleTop;
        lay.loft = loft;
        lay.blok = { b: NK.klamp(ledB * 0.42, 28, 66), h: NK.klamp(loft / (maxK + 0.8), 8, 48) };
        lay.midter = [];
        for (var i = 0; i < n; i++) lay.midter.push(t.x + pad + ledB / 2 + i * (ledB + tegnB));
        lay.tegnX = [];
        for (i = 0; i < n - 1; i++) lay.tegnX.push(t.x + pad + (i + 1) * ledB + i * tegnB + tegnB / 2);
        this.placerFelter();

        this.saetAnker("regn-anker-skema", t.x, lay.skemaY - lay.formelPx, t.b, lay.formelPx * 2);
        this.saetAnker("regn-anker-soejler", t.x, lay.soejleTop, t.b, lay.soejleBund - lay.soejleTop);
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

    /* Stofmaengden pr. blok: den kendte stofmaengde delt paa dens koefficient */
    P.pr = function () {
        var o = this.opg.o;
        return o.n / o.r.led[o.kendt].k;
    };

    /* ----- Panelet ---------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            felter: NK.el("regn-felter"),
            linjer: NK.el("regn-linjer"),
            besked: NK.el("regn-besked"),
            knap: NK.el("regn-knap"),
            kort: NK.el("regn-kort"),
            niveauer: NK.el("regn-niveauer"),
            nulstil: NK.el("regn-nulstil")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("regn-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });

        D.NIVEAUER.forEach(function (nv, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + nv.farve + '"></span>' +
                '<span class="hl-navn">' + nv.navn + '<em>' + nv.kort + '</em></span>' +
                '<span class="hl-tal" id="regn-n-tal-' + nr + '"></span>' +
                '<span class="hl-stjerner" id="regn-n-stj-' + nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgNiveau(nr); });
            mig.el.niveauer.appendChild(knap);
        });

        this.nulstilSikker = 0;
        this.el.nulstil.addEventListener("click", function () {
            if (mig.nulstilSikker > 0) {
                mig.nulstilSikker = 0;
                mig.nulstilAlt();
            } else {
                mig.nulstilSikker = 3;
            }
            mig.visNulstil();
        });
    };

    P.visNulstil = function () {
        NK.saetHTML("regn-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Start forfra</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgNiveau = function (nr) {
        var foerste = -1;
        for (var i = 0; i < D.OPGAVER.length; i++) {
            if (D.OPGAVER[i].niveau !== nr) continue;
            if (foerste < 0) foerste = i;
            if (!this.status[i].loest) { this.vaelg(i); return; }
        }
        this.vaelg(foerste);
    };

    P.opdaterFremskridt = function () {
        for (var n = 0; n < D.NIVEAUER.length; n++) {
            NK.saetTekst("regn-n-tal-" + n, this.antalLoest(n) + "/" + this.iNiveau(n));
            var s = this.antalStjerner(n);
            NK.saetTekst("regn-n-stj-" + n, s ? "★ " + s : "");
        }
        NK.saetTekst("regn-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.vaelg = function (i) {
        if (i === this.valgt && this.opg) return;
        this.valgt = i;
        this.nyOpgave(this.status[i].loest);
    };

    P.nyOpgave = function (gennemsyn) {
        var o = D.OPGAVER[this.valgt], r = o.r;
        var afstem = !!D.NIVEAUER[o.niveau].afstem && !gennemsyn;
        this.opg = {
            o: o,
            afstemt: !afstem,
            koef: r.led.map(function () { return { status: afstem ? "aktiv" : "ok" }; }),
            felter: r.led.map(function (l, j) {
                return { j: j, kendt: j === o.kendt, status: j === o.kendt ? "kendt" : "aktiv", v: j === o.kendt ? o.n : 0, forsoeg: 0 };
            }),
            hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn, aktiv: -1
        };
        var og = this.opg;
        og.felter.forEach(function (f) { f.vis = f.kendt ? 1 : 0; f.fyld = 0; });
        og.vis = og.afstemt ? 1 : 0;
        this.fremhaev = null;
        this.besked("", "");
        if (gennemsyn) {
            og.felter.forEach(function (f) { if (!f.kendt) { f.status = "ok"; f.v = o.svar[f.j].v; } });
            og.faerdig = true;
            this.besked(this.status[this.valgt].stjerne ? "Løst uden hjælp. ★" : "Løst.", "god");
        }
        this.layoutSkema();
        this.bygFelter();
        this.visKort();
        this.visLinjer();
        this.visStatus();
        if (!gennemsyn) this.fokus();
    };

    /* Feltet, som hint og svar gaelder: det, eleven sidst stod i, eller det foerste */
    P.aktivtFelt = function () {
        var og = this.opg;
        if (!og || og.faerdig || !og.afstemt) return null;
        var a = og.felter[og.aktiv];
        if (a && a.status === "aktiv") return a;
        for (var i = 0; i < og.felter.length; i++) if (og.felter[i].status === "aktiv") return og.felter[i];
        return null;
    };

    /* ----- Felterne oven paa tavlen ------------------------------------------------------ */
    P.bygFelter = function () {
        var mig = this, og = this.opg, r = og.o.r;
        var vaert = this.el.felter;
        vaert.innerHTML = "";
        /* Koefficienterne, naar skemaet skal afstemmes */
        og.koef.forEach(function (k, j) {
            k.el = null;
            if (og.afstemt) return;
            var e = document.createElement("div");
            e.className = "koeffelt";
            e.innerHTML = '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" maxlength="2" aria-label="Koefficienten foran ' +
                D.stof(r.led[j].s).f + '">';
            var inp = e.querySelector("input");
            inp.addEventListener("keydown", function (ev) {
                if (ev.key === "Enter") { ev.preventDefault(); mig.tjekKoef(j); }
            });
            inp.addEventListener("input", function () { e.classList.remove("forkert"); });
            k.el = e;
            k.input = inp;
            vaert.appendChild(e);
        });
        /* Stofmaengderne under formlerne */
        og.felter.forEach(function (f) {
            var e = document.createElement("div");
            f.el = e;
            f.input = null;
            if (f.kendt) { f.el = null; return; }
            if (f.status === "ok" || f.status === "svar") {
                e.className = "tavlefelt " + f.status;
                e.innerHTML = '<span class="tf-tal">' + og.o.svar[f.j].tekst + ' mol</span><span class="tf-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                e.className = "tavlefelt" + (og.afstemt ? "" : " skjult");
                e.innerHTML = '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Stofmængden af ' +
                    D.stof(r.led[f.j].s).f + ' i mol"><span class="tf-enhed">mol</span>' +
                    '<button type="button" class="tf-ok" tabindex="-1" aria-label="Tjek svaret">↵</button>';
                var inp = e.querySelector("input");
                inp.addEventListener("keydown", function (ev) {
                    if (ev.key === "Enter") { ev.preventDefault(); mig.tjek(f.j); }
                });
                inp.addEventListener("focus", function () { og.aktiv = f.j; });
                e.querySelector(".tf-ok").addEventListener("click", function () { mig.tjek(f.j); });
                f.input = inp;
            }
            vaert.appendChild(e);
        });
        this.placerFelter();
    };

    P.placerFelter = function () {
        var lay = this.lay, og = this.opg;
        if (!lay || !og) return;
        var fb = lay.feltB;
        this.el.felter.classList.toggle("smal", fb < 104);
        og.felter.forEach(function (f, j) {
            if (!f.el) return;
            f.el.style.left = Math.round(lay.midter[j] - fb / 2) + "px";
            f.el.style.top = Math.round(lay.feltY) + "px";
            f.el.style.width = Math.round(fb) + "px";
        });
        var ctx = this.L.ctx;
        ctx.font = Tg.font("700", lay.formelPx);
        og.koef.forEach(function (k, j) {
            if (!k.el) return;
            var fb2 = ctx.measureText(D.stof(og.o.r.led[j].s).formel).width;
            var kb = Math.round(NK.klamp(lay.formelPx * 1.4, 34, 48));
            k.el.style.width = kb + "px";
            k.el.style.height = Math.round(kb * 1.05) + "px";
            k.el.style.left = Math.round(lay.midter[j] - (fb2 + kb + 6) / 2) + "px";
            k.el.style.top = Math.round(lay.skemaY - kb * 0.55) + "px";
        });
    };

    P.fokus = function () {
        var og = this.opg;
        if (!og || og.faerdig || !NK.el("fane-regn").classList.contains("aktiv") ||
            document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        var inp = null;
        if (!og.afstemt) {
            og.koef.forEach(function (k) { if (!inp && k.input && !k.input.value) inp = k.input; });
            if (!inp && og.koef[0].input) inp = og.koef[0].input;
        } else {
            var f = this.aktivtFelt();
            inp = f && f.input;
        }
        if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }
    };

    /* ----- Tjek ----------------------------------------------------------------------- */
    P.tjekKoef = function (j) {
        var og = this.opg;
        /* Tomme felter: Enter gaar videre til det naeste */
        var tom = null;
        og.koef.forEach(function (k, i) { if (tom === null && i > j && !k.input.value.trim()) tom = i; });
        if (tom === null) og.koef.forEach(function (k, i) { if (tom === null && !k.input.value.trim()) tom = i; });
        if (tom !== null) { og.koef[tom].input.focus(); return; }
        var res = Tj.koefficienter(og.koef.map(function (k) { return k.input.value; }), og.o.r);
        if (res.ok) { this.afstemt("ok"); return; }
        this.besked(NK.html(res.besked), "skidt");
        og.koef.forEach(function (k) {
            k.el.classList.remove("ryst");
            void k.el.offsetWidth;
            k.el.classList.add("ryst");
        });
    };

    /* Skemaet er afstemt: koefficienterne staar, og soejlerne og felterne kommer frem */
    P.afstemt = function (maade) {
        var og = this.opg;
        og.afstemt = true;
        og.koef.forEach(function (k) { k.status = maade; });
        og.hjaelp = 0;
        if (maade === "svar") og.brugtSvar = true;
        this.fremhaev = null;
        this.besked(maade === "ok" ? "Skemaet er afstemt: " + NK.html(D.skema(og.o.r)) + ". Skriv nu stofmængderne." :
            NK.html(D.skema(og.o.r)) + ".", maade === "ok" ? "god" : "gul");
        if (this.afvisTilbud) this.afvisTilbud();
        this.bygFelter();
        this.visKort();
        this.visStatus();
        this.fokus();
    };

    P.tjek = function (j) {
        var og = this.opg, f = og.felter[j];
        if (!f || f.status !== "aktiv") return;
        og.aktiv = j;
        var res = Tj.mol(f.input ? f.input.value : "", og.o, j);
        if (res.tom) { this.besked(res.besked, ""); this.fokus(); return; }
        if (res.ok) { this.feltRigtigt(f, "ok"); return; }
        f.forsoeg++;
        /* Soejlen viser det forkerte tal */
        var v = Tj.tal(f.input.value);
        f.v = v === null ? 0 : v;
        f.forkert = true;
        f.vis = 1;
        this.besked(NK.html(res.besked), "skidt");
        if (f.el) {
            f.el.classList.remove("ryst");
            void f.el.offsetWidth;
            f.el.classList.add("ryst");
        }
        this.fokus();
    };

    P.feltRigtigt = function (f, maade) {
        var og = this.opg;
        f.status = maade;
        f.v = og.o.svar[f.j].v;
        f.forkert = false;
        f.vis = 1;
        og.hjaelp = 0;
        this.fremhaev = null;
        if (maade === "ok") this.besked("", "");
        if (maade === "svar") og.brugtSvar = true;
        if (this.afvisTilbud) this.afvisTilbud();
        if (og.felter.every(function (x) { return x.kendt || x.status === "ok" || x.status === "svar"; })) this.loes();
        this.bygFelter();
        this.visKort();
        this.visLinjer();
        this.visStatus();
        this.fokus();
    };

    P.loes = function () {
        var og = this.opg, i = this.valgt;
        og.faerdig = true;
        var s = this.status[i];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || !og.brugtSvar;
        this.gem();
        this.besked(og.brugtSvar ? "Alle stofmængderne er fundet." : "Alle stofmængderne passer med forholdet " + D.forhold(og.o.r) + ".", "god");
        var nv = D.OPGAVER[i].niveau;
        if (!foer && this.antalLoest(nv) === this.iNiveau(nv) && !this.rost[nv]) {
            this.rost[nv] = true;
            this.ventRos = { t: 1.6, niveau: nv, alt: this.antalLoest() === D.OPGAVER.length };
        }
    };

    /* ----- Knappen: Giv hint, Vis svaret, Naeste opgave ------------------------------------ */
    P.knap = function () {
        var og = this.opg;
        if (og.faerdig) {
            if (og.gennemsyn) this.nyOpgave(false);
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        var r = og.o.r;
        if (!og.afstemt) {
            if (og.hjaelp === 0) {
                og.hjaelp = 1;
                this.besked("<b>Hint:</b> " + NK.html(D.AFSTEM_HINT[r.id]), "gul");
                this.visKnap();
                this.fokus();
            } else {
                og.koef.forEach(function (k, j) { if (k.input) k.input.value = String(r.led[j].k); });
                this.afstemt("svar");
            }
            return;
        }
        var f = this.aktivtFelt();
        if (!f) return;
        if (og.hjaelp === 0) {
            og.hjaelp = 1;
            this.fremhaev = f.j;
            this.besked("<b>Hint:</b> " + this.hintHTML(f.j), "gul");
            this.visKnap();
            this.fokus();
        } else {
            this.feltRigtigt(f, "svar");
            this.besked(this.regnHTML(f.j) + ".", "gul");
        }
    };

    /* Et tal uden overfloedige nuller: 1,50 -> 1,5 og 2,00 -> 2 */
    function kort(v) {
        return NK.betydende(v, 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    }

    function broek(op, ned) {
        return '<span class="broek"><span>' + op + '</span><span>' + ned + '</span></span>';
    }

    function nHTML(s) { return "n(" + D.stof(s).formel + ")"; }

    /* Hintet: forholdet og hvad én blok er */
    P.hintHTML = function (j) {
        var o = this.opg.o, l = o.r.led[j], k = o.r.led[o.kendt];
        return nHTML(l.s) + " = " + broek(l.k, k.k) + " · " + nHTML(k.s) + ". Hver stiplet blok er " +
            kort(this.pr()) + " mol.";
    };

    /* Den paene beregning: n(O₂) = 1/2 · n(H₂) = 1/2 · 3,0 mol = 1,5 mol */
    P.regnHTML = function (j) {
        var o = this.opg.o, l = o.r.led[j], k = o.r.led[o.kendt];
        return nHTML(l.s) + " = " + broek(l.k, k.k) + " · " + nHTML(k.s) + " = " + broek(l.k, k.k) + " · " +
            o.nTekst + " mol = <b>" + o.svar[j].tekst + " mol</b>";
    };

    P.visLinjer = function () {
        var og = this.opg, mig = this, html = "";
        og.felter.forEach(function (f) {
            if (f.kendt || (f.status !== "ok" && f.status !== "svar")) return;
            html += '<div class="regn-linje' + (f.status === "svar" ? " svar" : "") + '">' + mig.regnHTML(f.j) + "</div>";
        });
        if (!html) html = '<p class="note">Beregningerne kommer her, når svarene er rigtige.</p>';
        NK.saetHTML("regn-linjer", html);
    };

    P.visKort = function () {
        var og = this.opg, o = og.o;
        var nv = D.NIVEAUER[o.niveau];
        NK.saetHTML("regn-niveau", '<span class="hyldeprik" style="background:' + nv.farve + '"></span>' + nv.navn);
        NK.saetTekst("regn-nr", String(o.plads + 1));
        NK.saetTekst("regn-antal", String(this.iNiveau(o.niveau)));
        NK.saetTekst("regn-prompt", o.nTekst + " mol " + D.stof(o.r.led[o.kendt].s).formel);
        NK.saetTekst("regn-spm", og.afstemt ? o.r.navn + ". Find de andre stofmængder, og skriv dem under formlerne."
            : o.r.navn + ". Afstem skemaet først: skriv koefficienterne foran formlerne.");
        this.el.kort.classList.toggle("sejr", og.faerdig && !og.gennemsyn);
        this.visKnap();
        this.opdaterFremskridt();
    };

    P.visKnap = function () {
        var og = this.opg, tekst, klasse = "knap blaa";
        if (og.faerdig) {
            if (og.gennemsyn) tekst = "Regn den igen";
            else { tekst = "Næste opgave →"; klasse += " banker"; }
        } else {
            tekst = og.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            klasse = "knap";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visStatus = function () {
        var og = this.opg, t;
        if (!og) return;
        if (og.faerdig) t = "Alle søjler fylder netop deres blokke. Det er det, forholdet betyder.";
        else if (!og.afstemt) t = "Skriv koefficienterne i felterne foran formlerne. Skriv 1, hvor der kun skal være én.";
        else t = "Skriv stofmængderne i felterne. Søjlerne viser, om de passer.";
        NK.saetHTML("regn-status", t);
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        this.status.forEach(function (s) { s.loest = false; s.stjerne = false; });
        this.rost = {};
        this.gem();
        this.valgt = -1;
        this.opg = null;
        this.vaelg(0);
    };

    P.enter = function () {
        if (this.opg && this.opg.faerdig && !this.opg.gennemsyn) this.knap();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var og = this.opg, lay = this.lay;
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        if (og && lay) {
            og.vis = NK.mod(og.vis, og.afstemt ? 1 : 0, 6, dt);
            var pr = this.pr();
            og.felter.forEach(function (f) {
                var maal = f.vis ? f.v / pr * lay.blok.h : 0;
                f.fyld = NK.mod(f.fyld, maal, 7, dt);
            });
        }
        if (this.ventRos) {
            this.ventRos.t -= dt;
            if (this.ventRos.t <= 0 && this.laererNiveau) {
                var v = this.ventRos;
                this.ventRos = null;
                this.laererNiveau(v.niveau, v.alt);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, og = this.opg;
        if (!lay || !og) return;
        var mig = this, r = og.o.r;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        Tg.rum(ctx, lay.W, lay.H, lay.H - 8);
        Tg.tavle(ctx, lay.tavle);

        /* Forklaringen oeverst til venstre: blokkene og fyldet */
        var t = lay.tavle, fx = t.x + 14, fy = lay.forklaring + 8;
        ctx.save();
        ctx.font = Tg.font("600", 12);
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(40, 46, 58, 0.7)";
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.4;
        ctx.strokeRect(fx, fy - 7, 14, 14);
        ctx.setLineDash([]);
        ctx.fillStyle = "#4a5160";
        ctx.fillText("koefficient", fx + 20, fy);
        var fx2 = fx + 20 + ctx.measureText("koefficient").width + 16;
        ctx.fillStyle = FARVE.ok;
        ctx.fillRect(fx2, fy - 7, 14, 14);
        ctx.fillStyle = "#4a5160";
        ctx.fillText("stofmængde", fx2 + 20, fy);
        ctx.restore();

        /* Skemaet */
        ctx.save();
        ctx.textBaseline = "middle";
        r.led.forEach(function (l, j) {
            var st = D.stof(l.s), mx = lay.midter[j];
            ctx.font = Tg.font("700", lay.formelPx);
            var fb = ctx.measureText(st.formel).width;
            if (!og.afstemt) {
                var kb = NK.klamp(lay.formelPx * 1.4, 34, 48);
                ctx.fillStyle = "#1c1f26";
                ctx.textAlign = "left";
                ctx.fillText(st.formel, mx - (fb + kb + 6) / 2 + kb + 6, lay.skemaY);
                return;
            }
            var kt = l.k > 1 ? String(l.k) + " " : "";
            ctx.font = Tg.font("800", lay.formelPx);
            var kbb = ctx.measureText(kt).width;
            var sx = mx - (fb + kbb) / 2;
            ctx.textAlign = "left";
            ctx.fillStyle = og.koef[j].status === "svar" ? "#b8861a" : "#d9731a";
            ctx.fillText(kt, sx, lay.skemaY);
            ctx.font = Tg.font("700", lay.formelPx);
            ctx.fillStyle = "#1c1f26";
            ctx.fillText(st.formel, sx + kbb, lay.skemaY);
        });
        ctx.font = Tg.font("700", lay.formelPx);
        ctx.fillStyle = "#6a7080";
        ctx.textAlign = "center";
        lay.tegnX.forEach(function (x, i) {
            ctx.fillText(r.led[i].side === 0 && r.led[i + 1].side === 1 ? "⟶" : "+", x, lay.skemaY);
        });
        ctx.restore();

        /* Soejlerne */
        og.felter.forEach(function (f, j) {
            var farve = f.kendt ? FARVE.kendt : (f.forkert ? FARVE.forkert : (f.status === "svar" ? FARVE.svar : FARVE.ok));
            Tg.soejle(ctx, lay.midter[j], lay.soejleBund, lay.blok, r.led[j].k, f.fyld, lay.loft, {
                farve: farve, vis: og.vis, lys: mig.fremhaev !== null && mig.fremhaev !== undefined ? puls * 0.9 : 0
            });
        });

        /* Hvad én blok er: vises med hintet ved den kendte soejle */
        if (this.fremhaev !== null && this.fremhaev !== undefined && og.afstemt) {
            var kx = lay.midter[og.o.kendt] + lay.blok.b / 2 + 6;
            var ky = lay.soejleBund - lay.blok.h / 2;
            Tg.maerkat(ctx, kx + 52, ky, "1 blok = " + kort(this.pr()) + " mol",
                { px: 12, farve: "#f2c53d" });
        }

        /* Den kendte stofmaengde: den groenne boks */

        var bx = lay.midter[og.o.kendt] - lay.feltB / 2, by = lay.feltY, bb = lay.feltB, bh = 40;
        ctx.save();
        ctx.fillStyle = "rgba(63, 174, 114, 0.14)";
        NK.rundtRekt(ctx, bx, by, bb, bh, 7);
        ctx.fill();
        ctx.strokeStyle = FARVE.kendt;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#1f6e45";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, og.o.nTekst + " mol", bb - 12, 18, 12, "800");
        ctx.fillText(og.o.nTekst + " mol", bx + bb / 2, by + bh / 2 + 1);
        ctx.restore();

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay, og = this.opg;
        if (!lay || !og) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        for (var j = 0; j < lay.midter.length; j++) {
            if (Math.abs(pt.x - lay.midter[j]) <= Math.max(lay.blok.b, lay.feltB) / 2 && pt.y >= lay.skemaY - lay.formelPx && pt.y <= lay.feltY + 40) {
                return { slags: "led", j: j };
            }
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) { mig.fokus(); return; }
            var og = mig.opg, l = og.o.r.led[u.j], st = D.stof(l.s), f = og.felter[u.j];
            if (f.kendt) {
                mig.besked("Det kendte: " + NK.html(og.o.nTekst) + " mol " + st.formel + ". Den fylder netop sine " + l.k +
                    (l.k === 1 ? " blok." : " blokke."), "");
            } else if (!og.afstemt) {
                mig.besked(st.formel + ": " + NK.html(st.navn) + ". Koefficienten skrives i feltet foran formlen.", "");
            } else if (f.status === "aktiv") {
                mig.besked(st.formel + " har koefficienten " + l.k + ". Skriv stofmængden i feltet under søjlen.", "");
                og.aktiv = u.j;
                if (f.input) f.input.focus();
                return;
            } else {
                mig.besked(mig.regnHTML(u.j) + ".", "");
            }
            mig.fokus();
        });
    };

    /* ----- Kemichaels praesentation ---------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.4-intro-regn", tilbud: "regn-tilbud", spring: "regn-spring" });

    /* Mens han siger, at man skriver under formlerne, blinker felterne */
    P.pegPaaFelt = function (til) {
        if (this.el && this.el.felter) this.el.felter.classList.toggle("peg", !!til);
    };

    NK.SimRegn = SimRegn;
}());
