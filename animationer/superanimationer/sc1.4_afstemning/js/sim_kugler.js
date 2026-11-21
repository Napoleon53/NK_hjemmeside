/* =====================================================================
   sim_kugler.js - fane 1: kuglerne

   Oeverst staar reaktionsskemaet paa en tavle. Tallet foran hvert stof
   aendres med + og −. Under tavlen staar to bakker: molekylerne foer
   pilen som kugler, og efter pilen de pladser, produkterne har brug for,
   som stiplede ringe. Under bakkerne taelles atomerne paa hver side.

   Runde 2 (21. nov. 2026, Niels' ja til forslagene efter REGELSAET):
   panelet er vaek, og reaktionerne staar i opgaveraekken oeverst. Taellingen
   staar under bakkerne, og ✓ og ✗ kommer foerst, naar molekylerne har
   reageret (REGELSAET 38). Scenen er samlet med en stoerste bredde og
   stoerre molekyler (REGELSAET 32). Den foerste reaktion er trinvis
   (D.TRIN_KUGLER, REGELSAET 11-12): + og − er vaek, mens kortet spoerger,
   og kun den knap, eleven skal bruge, er fremme med gul ramme og boble
   (REGELSAET 19a og 20). Atomerne beholder hver sin farve: her er det
   netop atomerne, eleven skal foelge (REGELSAET 45 gaelder ikke).

   Lad dem reagere: molekylerne rystes i stykker, og hvert atom flyver hen
   til en ledig plads af sin slags efter pilen. Det, der er regnet, er det,
   der ses: et atom uden plads ligger tilovers med en roed ring, og en
   plads uden atom bliver roed. Passer alt, og kan tallene ikke forkortes,
   er opgaven loest.

   Det lille tal i formlen kan ogsaa aendres (klik paa atomet i formlen).
   Saa bliver det et andet stof: kuglerne aendrer sig, og selv om atomerne
   kommer til at passe, godtages det ikke. Det er den fejl, elever laver.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var A = NK.Afst;
    var T = NK.Tegn;

    var RYST = 0.45, SPREDNING = 0.5, FLYV = 1.1;
    var VARIGHED = RYST + SPREDNING + FLYV;
    var TAEL_H = 34;           /* hoejden paa taellingen under bakkerne */
    /* Runde 3: har eleven sprunget gennemgangen over, huskes det i browseren */
    var NOEGLE_SET = "nk-sc1.4-kg-gennemgang";

    function SimKugler() {
        var mig = this;
        this.skema = NK.el("kg-skema");
        this.taelV = NK.el("kg-taelV");
        this.taelH = NK.el("kg-taelH");
        this.lysE = null;
        this.startFane(D.KUGLER, D.GRUPPER);
        this.skema.addEventListener("click", function (e) { mig.klikSkema(e); });
        /* Musen over et atom i taellingen faar atomerne af den slags til at lyse */
        [this.taelV, this.taelH].forEach(function (t) {
            t.addEventListener("pointerover", function (e) {
                var r = e.target.closest ? e.target.closest("[data-e]") : null;
                mig.lysE = r ? r.getAttribute("data-e") : null;
                mig.lysERegnskab = !!r;
            });
            t.addEventListener("pointerleave", function () { mig.lysE = null; mig.lysERegnskab = false; });
        });
        /* Svarene paa kortet i det trinvise spoergsmaal og Spring gennemgangen over */
        this.el.skort.addEventListener("click", function (e) {
            if (e.target && e.target.closest && e.target.closest("[data-spring]")) { mig.springGennemgang(); return; }
            var k = e.target && e.target.closest ? e.target.closest("[data-valg]") : null;
            if (k && !k.disabled) mig.vaelgSvar(parseInt(k.getAttribute("data-valg"), 10));
        });
        this.introNu = true;
        this.vaelg(0);
    }

    var P = SimKugler.prototype;
    NK.Fane.paa(P, { navn: "kg", naesteFane: "fane-sk", naesteNavn: "Afstem uden kugler", zone: [156, 134], laasTitler: true, raekke: true });

    P.chipTekst = function (o) { return NK.html(o.navn); };

    function F(f) { return A.skriv(f); }
    function enere(n) { var a = []; for (var i = 0; i < n; i++) a.push(1); return a; }

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.opg = {
            o: o,
            cr: enere(o.r.length), cp: enere(o.p.length),
            dr: o.r.map(A.dele), dp: o.p.map(A.dele),      /* formlerne, som de staar nu */
            fase: "klar", t: 0, loest: false, svarNu: false
        };
        this.reagerer = false;
        this.auto = false;
        this.vent = null;
        /* Den foerste reaktion er en trinvis gennemgang, til den er loest eller
           sprunget over (runde 3). Start forfra giver gennemgangen igen. */
        this.trin = null;
        if (i === 0 && D.TRIN_KUGLER && (this.medTrin || (!this.status[0].loest && !NK.hent(NOEGLE_SET, 0)))) this.trin = nytTrin(0);
        this.bygSkema();
        this.visRegnskab();
    };

    function nytTrin(nr) { return { nr: nr, valgt: null, forkert: {}, rigtig: null, vist: false, klikket: false }; }

    /* ----- Trinene i den foerste reaktion (D.TRIN_KUGLER) ------------------------------- */
    P.trinNu = function () { return this.trin ? D.TRIN_KUGLER[this.trin.nr] || null : null; };

    /* Trinene gaelder, til reaktionen er afstemt */
    P.iTrin = function () { return !!this.trinNu() && !this.opg.loest; };

    var kortHTMLGrund = P.kortHTML;
    P.kortHTML = function () {
        var t = this.trinNu(), mig = this;
        if (!t) return kortHTMLGrund.call(this);
        var tekst = t.tekst ? NK.html(t.tekst) + " " : "";
        /* Runde 3 (Niels: "så er det jo ligefør at den skal markeres som en
           præsentation, som man kan skippe?"): etiketten siger Gennemgang, og en
           stille knap i kortets oeverste hjoerne springer den over. Den staar
           aldrig, hvor Indsend svar og Naeste staar. */
        var spring = this.iTrin();
        var html = '<p class="sk-tekst' + (spring ? " med-spring" : "") + '">' +
            (spring ? '<button type="button" class="sk-spring" data-spring="1">Spring gennemgangen over</button>' : "") +
            '<span class="sk-chip">Gennemgang · Trin ' + (this.trin.nr + 1) + " af " + D.TRIN_KUGLER.length + "</span>" +
            tekst + '<span class="sk-spm' + (t.tekst ? " sk-linje" : "") + '">' + NK.html(t.spm) + "</span></p>";
        if (t.type === "valg") {
            var tr = this.trin, laast = !!this.trinSlut;
            html += '<div class="sk-svar n' + t.svar.length + '">' + t.svar.map(function (sv, j) {
                var kl = "sk-knap" + (tr.rigtig === j ? (tr.vist ? " svar-vist" : " rigtig") : "") +
                    (tr.forkert[j] ? " forkert" : "") + (tr.valgt === j && tr.rigtig !== j ? " valgt" : "");
                return '<button type="button" class="' + kl + '" data-valg="' + j + '"' +
                    (laast || tr.forkert[j] ? " disabled" : "") + ">" + NK.html(sv.t) + "</button>";
            }).join("") + "</div>";
        }
        var b = this.blivNu();
        if (b) html += NK.Papir.bliv(b.html, b.maerke || (b.vist ? "Svaret" : "Afstemt"), NK.html(b.knap || mig.videreTekst()), b.vist);
        return html;
    };

    /* Spring gennemgangen over: koekkensalt bliver en almindelig reaktion med
       alt fremme, + og − synlige og ikke loest, saa eleven selv afstemmer den.
       Det huskes i browseren, saa gennemgangen ikke kommer igen ved
       genindlaesning. Start forfra giver den igen. */
    P.springGennemgang = function () {
        if (!this.trin || this.opg.loest) return;
        NK.gem(NOEGLE_SET, 1);
        this.vaelg(0);
    };

    P.vaelgSvar = function (j) {
        var t = this.trinNu();
        if (!t || t.type !== "valg" || this.trinSlut || this.trin.forkert[j]) return;
        this.trin.valgt = j;
        this.visKort();
        this.visIndsend();
    };

    P.tjekValg = function () {
        var t = this.trinNu(), j = this.trin.valgt, sv = t.svar[j];
        if (!sv) return;
        if (sv.ok) {
            this.trin.rigtig = j;
            this.trinLoest(NK.html(t.slut), false);
            return;
        }
        this.trin.forkert[j] = true;
        this.trin.valgt = null;
        this.visKort();
        this.fejlLinje(sv.nej);
    };

    /* Et trin er loest: forklaringen og Naeste trin staar paa kortet */
    P.trinLoest = function (html, vist) {
        this.trinSlut = { html: html, vist: !!vist, maerke: vist ? "Svaret" : "Rigtigt", knap: "Næste trin →" };
        this.hjaelp = 0;
        this.hintE = null;
        this.pegKnap = false;
        this.fast = { html: "", klasse: "" };
        this.kortT = 0;
        this.visBesked(this.fast);
        this.visKort();
    };

    P.naesteTrin = function () {
        if (!this.trin || this.opg.loest) return;
        if (this.trin.nr + 1 >= D.TRIN_KUGLER.length) return;
        this.trin = nytTrin(this.trin.nr + 1);
        this.trinSlut = null;
        this.auto = false;
        this.vent = null;
        this.hjaelp = 0;
        this.hintE = null;
        this.pegKnap = false;
        this.fast = { html: "", klasse: "" };
        this.kortT = 0;
        /* Kortet foerst, saa det aldrig et oejeblik har baade det gamle og det nye */
        this.visKort();
        this.visBesked(this.fast);
        this.visSkema();
        this.visRegnskab();
        this.fokus();
    };

    P.formlerR = function () { return this.opg.dr.map(A.saml); };
    P.formlerP = function () { return this.opg.dp.map(A.saml); };

    /* De formler, eleven har aendret: [{ fra, til }] */
    P.aendret = function () {
        var o = this.opg.o, ud = [];
        this.formlerR().forEach(function (f, i) { if (f !== o.r[i]) ud.push({ fra: o.r[i], til: f }); });
        this.formlerP().forEach(function (f, i) { if (f !== o.p[i]) ud.push({ fra: o.p[i], til: f }); });
        return ud;
    };

    P.opgaveFaerdig = function () { return this.opg.loest; };

    /* Opgaven paa papirkortet: det, reaktionen handler om, og hvad der skal goeres */
    P.kortTekst = function () {
        return this.opg.o.tekst + " Hvilke tal skal stå foran stofferne, så der er lige mange af hvert atom før og efter pilen?";
    };

    P.trinLinje = function () {
        if (this.opg.fase === "reageret") return "Ret tallene foran stofferne, og send igen.";
        return "Ret tallene foran stofferne med + og −. Tryk så Indsend svar.";
    };

    /* Indsend svar: molekylerne reagerer, og saa bedoemmes resultatet.
       Graa, til eleven har rettet et tal (efter en reaktion: rettet igen). */
    P.kanSendes = function () {
        var g = this.opg, t = this.trinNu();
        if (!g || g.loest || this.reagerer) return false;
        if (t && !this.trinSlut) {
            if (t.type === "indsend") return g.fase === "klar";
            if (t.type === "valg") return this.trin.valgt !== null;
            if (t.type === "plus") return !!t.indsend && this.trin.klikket && g.fase === "klar";
        }
        return g.fase === "klar" && !!g.roert;
    };

    P.ikkeKlarTekst = function () {
        var t = this.trinNu();
        if (t && !this.opg.loest) {
            if (t.type === "valg") return "Vælg først et af svarene på kortet.";
            if (t.type === "plus") return "Klik først på + foran " + F(t.side === "r" ? this.opg.o.r[t.i] : this.opg.o.p[t.i]) + ".";
        }
        if (this.opg.fase === "reageret") return "Molekylerne har allerede reageret. Ret et tal foran et stof, og send igen.";
        return "Ret først tallene foran stofferne med + og −.";
    };

    P.indsend = function () {
        var t = this.trinNu();
        if (t && t.type === "valg" && !this.opg.loest) { this.tjekValg(); return; }
        this.reager();
    };

    P.slutLinje = function () {
        return A.ligning(this.formlerR(), this.formlerP(), this.opg.cr, this.opg.cp) + ".";
    };

    /* ----- Hinttrappen og Vis svaret ---------------------------------------------------- */
    P.hintTrin = function () {
        var t = this.trinNu();
        if (t && !this.opg.loest) {
            /* Hintet i spoergsmaalet fremhaever ikke svaret i scenen */
            var e = t.type === "plus" ? (t.side === "p" ? "Cl" : "Na") : null;
            return { e: e, trin: t.hint };
        }
        var a = this.aendret();
        if (a.length) {
            return { e: null, trin: [
                "Se på formlerne. Én af dem er ikke den, opgaven handler om.",
                "Der står " + F(a[0].til) + ", hvor der skulle stå " + F(a[0].fra) + ". Det lille tal hører til stoffet og må ikke ændres.",
                "Klik på formlen, til der står " + F(a[0].fra) + " igen. Afstem så med tallene foran."
            ] };
        }
        return A.hintTrin(this.formlerR(), this.formlerP(), this.opg.cr, this.opg.cp);
    };

    P.visSvar = function () {
        var g = this.opg, o = g.o, t = this.trinNu();
        if (t && !g.loest) {
            if (t.type === "indsend") { this.reager(); return; }
            if (t.type === "valg") {
                var ok = 0;
                t.svar.forEach(function (sv, j) { if (sv.ok) ok = j; });
                this.trin.rigtig = ok;
                this.trin.vist = true;
                this.trin.valgt = ok;
                this.trinLoest(NK.html(t.slut), true);
                return;
            }
            if (t.type === "plus" && !t.indsend) {
                this.trin.klikket = true;
                this.aendr(t.side, t.i, 1);
                this.reager();
                return;
            }
        }
        g.dr = o.r.map(A.dele);
        g.dp = o.p.map(A.dele);
        g.cr = o.facit.slice(0, o.r.length);
        g.cp = o.facit.slice(o.r.length);
        g.fase = "klar";
        g.svarNu = true;
        this.brugtSvar = true;
        this.besked("", "");
        this.bygSkema();
        this.visRegnskab();
        this.byg();
        this.reager(true);
    };

    /* ----- Tallene foran og de smaa tal ------------------------------------------------- */
    P.klikSkema = function (e) {
        var m = e.target.closest ? e.target.closest("[data-h]") : null;
        if (!m) return;
        var h = m.getAttribute("data-h"), side = m.getAttribute("data-s");
        var i = parseInt(m.getAttribute("data-i"), 10);
        /* I trinene virker kun den ene + knap, kortet beder om; resten er laast */
        var t = this.trinNu();
        if (t && !this.opg.loest) {
            if (t.type === "plus" && !this.trin.klikket && !this.auto && !this.reagerer &&
                h === "op" && side === t.side && i === t.i) {
                this.trin.klikket = true;
                this.aendr(side, i, 1);
                if (!t.indsend) {
                    /* Molekylerne reagerer af sig selv lidt efter (REGELSAET 33) */
                    this.auto = true;
                    this.vent = { t: 0.5, fn: "reager" };
                    this.visKnap();
                }
                this.visSkema();
                this.visKort();
                return;
            }
            this.kortBlink();
            return;
        }
        if (h === "op") this.aendr(side, i, 1);
        else if (h === "ned") this.aendr(side, i, -1);
        else if (h === "idx") this.skiftIndeks(side, i, parseInt(m.getAttribute("data-j"), 10));
    };

    P.laast = function () {
        if (this.reagerer) return true;
        if (this.opg.loest) {
            this.kortBlink();
            return true;
        }
        return false;
    };

    /* Efter en reaktion staar molekylerne klar igen, saa snart der rettes */
    P.klarIgen = function () {
        var g = this.opg;
        g.roert = true;
        if (g.fase !== "klar") {
            g.fase = "klar";
            this.naesteLinje("", "");
            this.visRegnskab();
        }
    };

    P.aendr = function (side, i, d) {
        if (this.laast()) return;
        var koef = side === "r" ? this.opg.cr : this.opg.cp;
        var v = koef[i] + d;
        if (v < 1) { this.kortBesked("Tallet foran skal være mindst 1, for uden stoffet er der ingen reaktion.", 4); return; }
        if (v > D.MAKS_KUGLER) {
            this.kortBesked("Tallet foran kan højst være " + D.MAKS_KUGLER + " her. Flere molekyler kan ikke ses i bakken, og så mange skal der ikke til.", 5);
            return;
        }
        koef[i] = v;
        this.nulstilHjaelp();
        this.klarIgen();
        this.visSkema();
        this.visRegnskab();
        this.byg();
    };

    /* Det lille tal: et klik paa et atom i formlen goer tallet én stoerre,
       to gange, og saa er det tilbage */
    P.skiftIndeks = function (side, i, j) {
        if (this.laast()) return;
        var g = this.opg;
        var dele = side === "r" ? g.dr[i] : g.dp[i];
        var orig = A.dele(side === "r" ? g.o.r[i] : g.o.p[i]);
        var n0 = orig[j].n, n = dele[j].n;
        dele[j] = { s: dele[j].s, n: n >= n0 + 2 ? n0 : n + 1 };
        var fra = A.saml(orig), til = A.saml(dele);
        this.nulstilHjaelp();
        this.klarIgen();
        this.visSkema();
        this.visRegnskab();
        this.byg();
        if (til === fra) {
            this.kortBesked("Nu står der " + F(fra) + " igen.", 3);
            return;
        }
        var navn = D.ANDRE_STOFFER[til];
        var t = "Nu står der " + F(til) + ". " +
            (navn ? "Det er " + navn + ", ikke " + F(fra) + "." : "Det er ikke " + F(fra) + " længere.") +
            " Det lille tal hører til stoffet. Tallet foran " + F(fra) + " siger, hvor mange " + F(fra) + " der er.";
        if (til === "O3") t += " " + D.OZON;
        this.kortBesked(t, til === "O3" ? 9 : 7);
    };

    /* ----- Tavlen med skemaet ------------------------------------------------------------ */
    P.bygSkema = function () {
        this.skema.classList.remove("faerdig");
        this.visSkema();
    };

    P.visSkema = function () {
        var g = this.opg, mig = this;
        /* I trinene er + og − vaek (de fylder stadig, saa intet hopper), og det
           lille tal kan ikke klikkes. Kun den + knap, kortet beder om, er fremme
           med gul ramme og boblen "Klik: +" (REGELSAET 19a, 19 og 20). */
        var t = this.trinNu(), iTrin = !!t && !g.loest;
        function stof(side, i) {
            var koef = side === "r" ? g.cr[i] : g.cp[i];
            var dele = side === "r" ? g.dr[i] : g.dp[i];
            var orig = A.dele(side === "r" ? g.o.r[i] : g.o.p[i]);
            var f = dele.map(function (d, j) {
                var ind = d.s + (d.n > 1 ? "<sub>" + d.n + "</sub>" : "");
                if (iTrin) return '<span class="fx">' + ind + "</span>";
                var kl = "fx" + (d.n !== orig[j].n ? " aendret" : "");
                return '<button type="button" class="' + kl + '" data-h="idx" data-s="' + side + '" data-i="' + i + '" data-j="' + j +
                    '" title="Det lille tal">' + ind + "</button>";
            }).join("");
            var peg = iTrin && t.type === "plus" && t.side === side && t.i === i && !mig.trin.klikket && !mig.trinSlut;
            var plusKl = "st-knap" + (iTrin ? (peg ? " opfordring" : " skjult") : "");
            var minusKl = "st-knap" + (iTrin ? " skjult" : "");
            var skjul = ' tabindex="-1" aria-hidden="true"';
            return '<span class="sk-stof">' +
                '<span class="stepper">' +
                '<button type="button" class="' + plusKl + '" data-h="op" data-s="' + side + '" data-i="' + i + '" aria-label="Et mere"' +
                (peg ? ' data-boble="Klik: +"' : (iTrin ? skjul : "")) + ">+</button>" +
                '<span class="st-tal' + (koef === 1 ? " en" : "") + '">' + koef + "</span>" +
                '<button type="button" class="' + minusKl + '" data-h="ned" data-s="' + side + '" data-i="' + i + '" aria-label="Et mindre"' +
                (iTrin ? skjul : "") + ">−</button>" +
                "</span>" +
                '<span class="sk-formel">' + f + "</span></span>";
        }
        var html = g.o.r.map(function (f, i) { return stof("r", i); }).join('<span class="sk-plus">+</span>') +
            '<span class="sk-pil">→</span>' +
            g.o.p.map(function (f, i) { return stof("p", i); }).join('<span class="sk-plus">+</span>');
        if (this.skema._html !== html) {
            this.skema.innerHTML = '<div class="sk-linje">' + html + "</div>";
            this.skema._html = html;
            this.tilpasSkema();
        }
        this.skema.classList.toggle("faerdig", !!g.loest);
        this.skema.classList.toggle("laast", !!g.loest || !!mig.reagerer);
    };

    /* Skriften paa tavlen bliver mindre, hvis skemaet ikke kan vaere der */
    P.tilpasSkema = function () {
        var t = this.skema;
        if (!t.offsetWidth) return;
        var fs = this.skemaFs || 30;
        t.style.setProperty("--fs", fs + "px");
        var linje = t.querySelector(".sk-linje");
        while (fs > 16 && linje && (linje.scrollWidth > t.clientWidth - 24 || t.scrollWidth > t.clientWidth)) {
            fs -= 1;
            t.style.setProperty("--fs", fs + "px");
        }
    };

    /* ----- Taellingen under bakkerne (runde 2) -----------------------------------------------
       "Atomer: Na 1 · Cl 2" under hver bakke i atomernes farver. Groen og roed
       og ✓ og ✗ (efter pilen) kommer foerst, naar molekylerne har reageret,
       og forsvinder igen, naar et tal rettes (REGELSAET 38). Hintets atom
       har en gul ramme. */
    P.visRegnskab = function () {
        var g = this.opg;
        if (!g) return;
        var rows = A.regnskab(this.formlerR(), this.formlerP(), g.cr, g.cp);
        var dom = g.fase === "reageret" || !!g.loest;
        var lys = this.faerdig ? null : this.hintE;
        function side(efter) {
            return '<span class="tl-hoved">Atomer:</span>' + rows.map(function (x) {
                var a = D.ATOM[x.e] || D.ATOM.H, ok = x.v === x.h;
                var kl = "tl-e" + (dom ? (ok ? " ok" : " skidt") : "") + (x.e === lys ? " lys" : "");
                return '<span class="' + kl + '" data-e="' + x.e + '"><i style="background:' + a.farve + ";border-color:" + a.kant + '"></i>' +
                    x.e + " <b>" + (efter ? x.h : x.v) + "</b>" +
                    (dom && efter ? '<span class="tl-m">' + (ok ? "✓" : "✗") + "</span>" : "") + "</span>";
            }).join('<span class="tl-prik">·</span>');
        }
        NK.saetHTML("kg-taelV", side(false));
        NK.saetHTML("kg-taelH", side(true));
    };

    /* ----- Scenen ----------------------------------------------------------------------------- */
    /* Scenen er samlet (runde 2, REGELSAET 32 og 37): tavlen med skemaet lige
       under kortet, saa de to bakker tæt om pilen med en stoerste bredde,
       centreret, og taellingen under hver bakke. Paa en stor skaerm bliver
       bakkerne og molekylerne stoerre, ikke afstandene. */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var kant = NK.klamp(W * 0.022, 10, 26), top = this.top();
        var midt = NK.klamp(W * 0.075, 90, 130);
        var bbMaks = NK.klamp(W * 0.28, 420, 560);
        var bb = Math.min((W - 2 * kant - midt) / 2, bbMaks);
        var blokB = 2 * bb + midt, x0 = (W - blokB) / 2;
        var t = this.skema;
        var sb = Math.min(W - 2 * kant, Math.max(blokB, 640));
        t.style.left = Math.round((W - sb) / 2) + "px";
        t.style.top = top + "px";
        t.style.width = Math.round(sb) + "px";
        this.skemaFs = Math.round(NK.klamp(Math.min(W / 36, H / 24), 20, 32));
        this.tilpasSkema();
        var sh = t.offsetHeight || 90;
        var y0 = top + sh + NK.klamp(H * 0.022, 10, 18);
        var gap = 6;
        var ledig = baand.y - y0 - gap - TAEL_H - 4;
        var bh = Math.max(120, Math.min(ledig, bb * 0.78));
        var lay = { W: W, H: H, baand: baand, zone: this.kortZone() };
        lay.L = { x: x0, y: y0, b: bb, h: bh };
        lay.R = { x: x0 + bb + midt, y: y0, b: bb, h: bh };
        lay.midt = { x: x0 + bb, b: midt, cy: y0 + bh / 2 };
        lay.kmaks = NK.klamp(bb / 220, 1.6, 2.3);
        this.lay = lay;
        this.saetAnker("bakker", lay.L.x, lay.L.y, lay.R.x + lay.R.b - lay.L.x, lay.L.h);
        var ty = Math.round(y0 + bh + gap);
        [[this.taelV, lay.L], [this.taelH, lay.R]].forEach(function (x) {
            x[0].style.left = Math.round(x[1].x) + "px";
            x[0].style.top = ty + "px";
            x[0].style.width = Math.round(x[1].b) + "px";
            x[0].style.height = TAEL_H + "px";
        });
        this.byg();
        if (this.status) this.visListe();
    };

    /* Kuglemodellen for en formel. Er det lille tal aendret, faar
       grundformen de ekstra atomer rundt om sig. */
    function geo(f, orig) {
        var base = (D.GEO[orig] || D.GEO[f] || []).map(function (a) { return { e: a[0], x: a[1], y: a[2] }; });
        if (f === orig || !D.GEO[orig]) return base;
        var skal = A.laes(f), har = A.laes(orig);
        var R = 0;
        base.forEach(function (a) { R = Math.max(R, Math.sqrt(a.x * a.x + a.y * a.y) + D.ATOM[a.e].r); });
        var vinkler = [0, Math.PI, -Math.PI / 2, Math.PI / 2, -Math.PI / 4, Math.PI * 3 / 4];
        var nr = 0;
        Object.keys(skal).forEach(function (e) {
            for (var n = har[e] || 0; n < skal[e]; n++) {
                var v = vinkler[nr++ % vinkler.length], r = D.ATOM[e].r;
                base.push({ e: e, x: Math.cos(v) * (R + r * 0.3), y: Math.sin(v) * (R + r * 0.3) });
            }
        });
        return base;
    }

    function kasse(atomer) {
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        atomer.forEach(function (a) {
            var r = D.ATOM[a.e].r;
            x0 = Math.min(x0, a.x - r); x1 = Math.max(x1, a.x + r);
            y0 = Math.min(y0, a.y - r); y1 = Math.max(y1, a.y + r);
        });
        return { x0: x0, y0: y0, b: x1 - x0 + 14, h: y1 - y0 + 14, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    }

    /* Molekylerne paa én side: hvert stof i sin egen blok med saa mange
       soejler, at kuglerne bliver stoerst muligt */
    function placer(formler, orig, koef, rect, strimmel, KMAKS) {
        var ix = rect.x + 12, iy = rect.y + 30, ib = rect.b - 24, ih = rect.h - 38 - strimmel;
        var etiket = 28, mellem = 18;
        var gr = formler.map(function (f, i) {
            var g = geo(f, orig[i]);
            return { f: f, geo: g, k: kasse(g), n: koef[i] };
        });
        var bedst = null;
        function proev(j, valg) {
            if (j === gr.length) {
                var sumB = 0, maksH = 0, raekker = 0;
                gr.forEach(function (g, i) {
                    var r = Math.ceil(g.n / valg[i]);
                    sumB += valg[i] * g.k.b;
                    maksH = Math.max(maksH, r * g.k.h);
                    raekker += r;
                });
                var k = Math.min(KMAKS, (ib - mellem * (gr.length - 1)) / sumB, (ih - etiket) / maksH);
                if (!bedst || k > bedst.k + 1e-6 || (Math.abs(k - bedst.k) < 1e-6 && raekker < bedst.raekker)) {
                    bedst = { k: k, valg: valg.slice(), raekker: raekker };
                }
                return;
            }
            for (var c = 1; c <= gr[j].n; c++) { valg.push(c); proev(j + 1, valg); valg.pop(); }
        }
        proev(0, []);
        var k = Math.max(0.2, bedst.k);
        var brugt = mellem * (gr.length - 1);
        gr.forEach(function (g, i) { brugt += bedst.valg[i] * g.k.b * k; });
        var x = ix + (ib - brugt) / 2;
        var atomer = [], grupper = [];
        gr.forEach(function (g, i) {
            var c = bedst.valg[i], r = Math.ceil(g.n / c);
            var bB = c * g.k.b * k, bH = r * g.k.h * k;
            var gy = iy + (ih - etiket - bH) / 2;
            for (var m = 0; m < g.n; m++) {
                var row = Math.floor(m / c), col = m % c;
                var iRaekke = row === r - 1 ? g.n - row * c : c;       /* sidste raekke centreres */
                var ox = (c - iRaekke) * g.k.b * k / 2;
                var mx = x + ox + (col + 0.5) * g.k.b * k, my = gy + (row + 0.5) * g.k.h * k;
                g.geo.forEach(function (a) {
                    atomer.push({ e: a.e, x: mx + (a.x - g.k.cx) * k, y: my + (a.y - g.k.cy) * k,
                        r: D.ATOM[a.e].r * k, f: g.f, mol: i + ":" + m });
                });
            }
            grupper.push({ f: g.f, n: g.n, x: x + bB / 2, y: gy + bH + etiket / 2 + 2 });
            x += bB + mellem;
        });
        return { atomer: atomer, grupper: grupper, k: k };
    }

    P.byg = function () {
        var lay = this.lay, g = this.opg;
        if (!lay || !g) return;
        this.strimmel = NK.klamp(lay.L.h * 0.16, 30, 46);
        this.venstre = placer(this.formlerR(), g.o.r, g.cr, lay.L, this.strimmel, lay.kmaks);
        this.hoejre = placer(this.formlerP(), g.o.p, g.cp, lay.R, this.strimmel, lay.kmaks);
        if (g.fase !== "klar") this.planlaeg();
    };

    /* ----- Reaktionen ------------------------------------------------------------------------ */
    /* Hvert atom foer pilen faar en plads af sin slags efter pilen, fra
       venstre mod hoejre. Atomer uden plads lander i strimlen forneden. */
    P.planlaeg = function () {
        var lay = this.lay, V = this.venstre.atomer, H = this.hoejre.atomer;
        var fly = [], optaget = [];
        var slags = [];
        V.forEach(function (a) { if (slags.indexOf(a.e) < 0) slags.push(a.e); });
        H.forEach(function (a) { if (slags.indexOf(a.e) < 0) slags.push(a.e); });
        function efterX(a, b) { return a.x - b.x || a.y - b.y; }
        var tilovers = [];
        slags.forEach(function (e) {
            var va = V.filter(function (a) { return a.e === e; }).sort(efterX);
            var hp = H.map(function (a, i) { return i; }).filter(function (i) { return H[i].e === e; })
                .sort(function (a, b) { return efterX(H[a], H[b]); });
            va.forEach(function (a, n) {
                if (n < hp.length) {
                    var p = H[hp[n]];
                    optaget[hp[n]] = true;
                    fly.push({ a: a, x1: p.x, y1: p.y, r1: p.r, slags: "plads" });
                } else tilovers.push(a);
            });
        });
        /* Tilovers: paa en raekke i strimlen i bunden af bakken efter pilen */
        var R = lay.R, s = this.strimmel;
        var sy = R.y + R.h - s / 2 - 6;
        var r0 = Math.min(s * 0.36, 16);
        var start = R.x + 86, plads = R.x + R.b - 16 - start;
        var skridt = tilovers.length > 1 ? Math.min(2 * r0 + 5, plads / (tilovers.length - 1)) : 0;
        tilovers.forEach(function (a, n) {
            fly.push({ a: a, x1: start + r0 + n * skridt, y1: sy, r1: Math.min(a.r, r0), slags: "tilovers" });
        });
        var N = fly.length;
        fly.forEach(function (f, n) { f.forsink = N > 1 ? SPREDNING * n / (N - 1) : 0; });
        this.fly = fly;
        this.antalTilovers = tilovers.length;
        this.mangler = H.map(function (a, i) { return !optaget[i]; });
        this.antalMangler = this.mangler.filter(function (m) { return m; }).length;
    };

    P.reager = function (fraSvar) {
        var g = this.opg;
        if (this.reagerer) return;
        if (g.loest) { this.laast(); return; }
        if (g.fase === "reageret") {
            this.kortBesked("Molekylerne har allerede reageret. Ret et tal foran et stof, så står de klar igen.", 4);
            return;
        }
        if (!fraSvar) g.svarNu = false;
        this.nulstilHjaelp();
        this.planlaeg();
        g.fase = "reagerer";
        g.t = 0;
        this.reagerer = true;
        this.auto = true;
        this.visSkema();
        this.visKnap();
    };

    P.efterReaktion = function () {
        var g = this.opg;
        g.fase = "reageret";
        this.reagerer = false;
        this.auto = false;
        var d = A.dom(this.formlerR(), this.formlerP(), g.cr, g.cp);
        var a = this.aendret();
        if (d.ok && !a.length) {
            g.loest = true;
            this.sejrT = 0;              /* stemplet popper frem, og scenen glimter groent */
            this.visSkema();
            this.visRegnskab();
            this.loest(g.svarNu ? "svar" : "selv", g.svarNu ? A.svarTekst(g.o) : "");
            return;
        }
        this.fejlT = 0;                  /* pilen bliver roed et oejeblik */
        this.visSkema();
        this.visRegnskab();
        this.visKnap();
        /* I trinene bedoemmes reaktionen ikke: kortet gaar selv videre ca. 1 s
           efter, at molekylerne har reageret (REGELSAET 33) */
        var tr = this.trinNu();
        if (tr && (tr.type === "indsend" || (tr.type === "plus" && !tr.indsend))) {
            this.auto = true;
            this.vent = { t: 1.0, fn: "naesteTrin" };
            this.visKnap();
            return;
        }
        var t;
        if (a.length) {
            t = "Atomerne " + (d.gaarOp ? "passer" : "passer heller ikke") + ", men der står " + F(a[0].til) +
                ". Det er ikke det stof, der skal laves. Sæt det lille tal tilbage, og ret tallet foran.";
        } else {
            var dele = [];
            if (this.antalTilovers) dele.push(this.antalTilovers + " atom" + (this.antalTilovers > 1 ? "er" : "") + " tilovers");
            if (this.antalMangler) dele.push(this.antalMangler + " tom" + (this.antalMangler > 1 ? "me" : "") + " plads" + (this.antalMangler > 1 ? "er" : ""));
            t = (dele.length ? dele.join(" og ") + ". " : "") + A.fejl(this.formlerR(), this.formlerP(), g.cr, g.cp);
            t = t.charAt(0).toUpperCase() + t.slice(1);
        }
        this.fejlLinje(t);
    };

    P.opdaterScene = function (dt) {
        var g = this.opg;
        if (this.vent) {
            this.vent.t -= dt;
            if (this.vent.t <= 0) {
                var fn = this.vent.fn;
                this.vent = null;
                this.auto = false;
                this[fn]();
            }
        }
        if (g && g.fase === "reagerer") {
            g.t += dt;
            if (g.t >= VARIGHED) this.efterReaktion();
        }
        if (this.sejrT !== null && this.sejrT !== undefined) this.sejrT += dt;
        if (this.fejlT !== null && this.fejlT !== undefined) this.fejlT += dt;
    };

    /* ----- Tegning ---------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.venstre) return;
        T.vaeg(ctx, lay.W, lay.baand.y);
        this.tegnBakker(ctx);
        /* Det groenne glimt over hele scenen, naar reaktionen gik op */
        if (this.opg.loest && this.sejrT < 0.9) {
            ctx.save();
            ctx.globalAlpha = 0.16 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(0, 0, lay.W, lay.baand.y);
            ctx.restore();
        }
    };

    P.tegnBakker = function (ctx) {
        var lay = this.lay, g = this.opg;
        /* Farven siger, hvordan det gik: groen ved afstemt, roed lige efter en
           reaktion, der ikke gik op */
        var skidt = g.fase === "reageret" && !g.loest;
        var pilFarve = g.loest ? "#7ee0a8" : (skidt ? "#ff6b5c" : "#8d93a3");
        T.bakke(ctx, lay.L, "Før pilen");
        T.bakke(ctx, lay.R, "Efter pilen", g.loest ? "rgba(63, 174, 114, 0.85)" : (skidt ? "rgba(255, 107, 92, 0.6)" : null));
        T.pil(ctx, lay.midt.x + 16, lay.midt.x + lay.midt.b - 16, lay.midt.cy - 6, pilFarve);
        if (g.loest) T.stempel(ctx, lay.midt.x + lay.midt.b / 2, lay.midt.cy - 46, "Afstemt ✓", NK.pop(this.sejrT / 0.45));

        /* Hintet og musen over regnskabet fremhaever ét atom */
        var puls = 0.5 + 0.5 * Math.sin(this.tid * 6);
        var lysE = this.lysE || (this.faerdig ? null : this.hintE);
        function lys(e) { return lysE === e ? puls : 0; }

        /* Etiketterne under blokkene: tallet foran og formlen */
        this.etiketter(ctx, this.venstre.grupper);
        this.etiketter(ctx, this.hoejre.grupper);

        var fase = g.fase, t = g.t;
        var H = this.hoejre.atomer;
        /* Pladserne efter pilen */
        var mig = this;
        H.forEach(function (a, i) {
            var fyldt = fase === "reageret" && !mig.mangler[i];
            if (!fyldt) T.plads(ctx, a.e, a.x, a.y, a.r, { lys: lys(a.e), mangler: fase === "reageret" && mig.mangler[i] });
        });
        if (fase === "reageret" && this.antalTilovers) this.strimmelTekst(ctx, "Tilovers");

        if (fase === "klar") {
            this.venstre.atomer.forEach(function (a) { T.atom(ctx, a.e, a.x, a.y, a.r, { lys: lys(a.e) }); });
            return;
        }
        if (fase === "reageret") {
            this.venstre.atomer.forEach(function (a) { T.plads(ctx, a.e, a.x, a.y, a.r, { spoegelse: true }); });
        }
        /* Rystes og flyver: hvert atom foelger sin egen tid */
        this.fly.forEach(function (f) {
            var a = f.a, x = a.x, y = a.y, r = a.r;
            if (fase === "reagerer" && t < RYST) {
                var s = 2.2 * Math.min(1, t / 0.15);
                x += Math.sin(t * 60 + a.x) * s;
                y += Math.cos(t * 55 + a.y) * s;
            } else {
                var u = fase === "reageret" ? 1 : NK.blod((t - RYST - f.forsink) / FLYV);
                x = NK.lerp(a.x, f.x1, u);
                y = NK.lerp(a.y, f.y1, u) - Math.sin(u * Math.PI) * 26;
                r = NK.lerp(a.r, f.r1, u);
            }
            T.atom(ctx, a.e, x, y, r, { lys: lys(a.e), roed: fase === "reageret" && f.slags === "tilovers" });
        });
    };

    P.etiketter = function (ctx, grupper) {
        grupper.forEach(function (gr) {
            var f = F(gr.f);
            ctx.save();
            ctx.textBaseline = "middle";
            ctx.font = T.font("500", 17);
            var tal = gr.n > 1 ? gr.n + " " : "";
            var b1 = ctx.measureText(tal).width, b2 = ctx.measureText(f).width;
            var x = gr.x - (b1 + b2) / 2;
            ctx.textAlign = "left";
            ctx.fillStyle = "#f2c53d";
            ctx.fillText(tal, x, gr.y);
            ctx.fillStyle = "#dfe3ea";
            ctx.fillText(f, x + b1, gr.y);
            ctx.restore();
        });
    };

    P.strimmelTekst = function (ctx, tekst) {
        var R = this.lay.R, s = this.strimmel;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 107, 92, 0.35)";
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(R.x + 12, R.y + R.h - s - 10);
        ctx.lineTo(R.x + R.b - 12, R.y + R.h - s - 10);
        ctx.stroke();
        ctx.font = T.font("500", 14);
        ctx.fillStyle = "#ff9d92";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, R.x + 16, R.y + R.h - s / 2 - 6);
        ctx.restore();
    };

    /* ----- Musen i scenen ---------------------------------------------------------------------- */
    P.find = function (pt) {
        if (!this.venstre) return null;
        var g = this.opg, i, a;
        if (g.fase === "reageret") {
            for (i = 0; i < this.fly.length; i++) {
                var f = this.fly[i];
                if (Math.hypot(pt.x - f.x1, pt.y - f.y1) <= f.r1 + 2) return { slags: f.slags === "tilovers" ? "tilovers" : "fyldt", a: f.a };
            }
        } else if (g.fase === "klar") {
            for (i = 0; i < this.venstre.atomer.length; i++) {
                a = this.venstre.atomer[i];
                if (Math.hypot(pt.x - a.x, pt.y - a.y) <= a.r + 2) return { slags: "molekyle", a: a };
            }
        }
        for (i = 0; i < this.hoejre.atomer.length; i++) {
            a = this.hoejre.atomer[i];
            if (Math.hypot(pt.x - a.x, pt.y - a.y) <= a.r + 2) {
                return { slags: g.fase === "reageret" && this.mangler[i] ? "mangler" : "plads", a: a };
            }
        }
        return null;
    };

    P.overScene = function (pt) {
        /* I trinene lægger intet i scenen op til et klik (REGELSAET 19a) */
        if (this.iTrin()) { this.lysScene = null; if (!this.lysERegnskab) this.lysE = null; return null; }
        var u = pt ? this.find(pt) : null;
        this.lysScene = u ? u.a.e : null;
        if (!this.lysERegnskab) this.lysE = this.lysScene;
        return u ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        /* Scenen er laast i trinene: kortet blinker (REGELSAET 15) */
        if (this.iTrin()) { this.kortBlink(); return; }
        var u = this.find(pt);
        if (!u) {
            var lay = this.lay;
            if (pt.y > lay.L.y && pt.y < lay.L.y + lay.L.h) {
                this.kortBesked("Tallene foran stofferne står på tavlen. Ret dem med + og −.", 4);
            }
            return;
        }
        var a = u.a, e = a.e;
        if (u.slags === "molekyle") {
            var l = A.laes(a.f);
            var dele = Object.keys(l).map(function (x) { return l[x] + " " + x; });
            var hvad = dele.length === 1 && l[e] === 1 ? "Det er ét " + e + "-atom." :
                "Ét " + F(a.f) + " har " + dele.join(" og ") + ".";
            this.kortBesked(hvad + " Tallet foran " + F(a.f) + " siger, hvor mange " + F(a.f) + " der er.", 5);
        } else if (u.slags === "plads") {
            this.kortBesked("Her skal der sidde et " + e + " i " + F(a.f) + ". Det skal komme fra stofferne før pilen.", 5);
        } else if (u.slags === "mangler") {
            this.kortBesked("Her mangler et " + e + ". Der var ikke nok " + e + " før pilen.", 5);
        } else if (u.slags === "tilovers") {
            this.kortBesked("Dette " + e + " fik ingen plads efter pilen. Der var for mange " + e + " før pilen.", 5);
        } else {
            this.kortBesked("Dette " + e + " sidder nu i " + F(this.findEfter(a)) + ".", 4);
        }
    };

    P.findEfter = function (a) {
        for (var i = 0; i < this.fly.length; i++) {
            if (this.fly[i].a === a) {
                var f = this.fly[i];
                for (var j = 0; j < this.hoejre.atomer.length; j++) {
                    var h = this.hoejre.atomer[j];
                    if (h.x === f.x1 && h.y === f.y1) return h.f;
                }
            }
        }
        return a.f;
    };

    NK.SimKugler = SimKugler;
}());
