/* =====================================================================
   tegneserie.js - forsoeget opsummeret i ruder

   Alle tre gamle tegneserier (sc2.7, sc6.8, sc8.6) var det samme moenster
   skrevet tre gange: hver rude er ET UDSNIT AF TEGNEBORDET, tegnet med
   scenens egne tegnefunktioner ud fra en GEMT TILSTAND - ikke en ny
   tegning - plus et lag ovenpaa med pil, lup og etiketter, og en sidste
   rude med resultatskemaet. Her staar maskineriet én gang.

   Reglen er den samme som journalens: ruden viser glasset, som det saa
   ud, da eleven noterede det, og ikke som det ser ud nu. Derfor tager
   rammen et oejebliksbillede - en loesreven kopi af genstanden - og
   tegner det med T.tegnBeholder og de andre af tegningens funktioner.
   Kopien er den samme slags, journalen allerede gemmer sammen med hvert
   svar; den er bare fuld nok til at kunne tegnes.

   ----- En rude -------------------------------------------------------

       { tekst:   "Glas 1 fik Fe(NO3)3 og blev moerkere.",
         udsnit:  { x: 300, y: 300, b: 420 },   // i tegnebordets enheder
         ting:    [ kopi1, kopi2 ],             // gemt tilstand
         tegn:    function (ctx) { … },         // mere, i tegnebordsenheder
         oven:    function (ctx, pt) { … },     // i rudens pixels
         froe:    3,                            // deterministisk tilfaeldighed
         fejl:    true,                         // roed rude
         ren:     true,                         // ingen scene, kun oven
         bred:    true,                         // fylder hele raekken
         dom:     function (div) { … } }        // frit indhold, fx en tabel

   udsnit er et vindue ind i tegnebordet: x, y er oeverste venstre hjoerne
   og b bredden. Hoejden foelger rudens forhold af sig selv, saa et udsnit
   aldrig kan blive forvraenget. pt(x, y) i oven omregner fra
   tegnebordets enheder til rudens pixels, saa en pil kan pege fra noget
   i scenen ud til en etiket ved siden af.

   ----- Deterministisk tilfaeldighed ----------------------------------
   Scenen bruger Math.random nogle steder (draaber, skaar, kugler i
   boblen). En tegneserie, der saa forskellig ud hver gang, den blev
   aabnet, ville vaere en anden slags dokument. Derfor laaner rammen
   Math.random, mens en rude tegnes, og giver den et froe pr. rude:
   samme rude, samme billede, hver gang.

   ----- Laasen --------------------------------------------------------
   Som quizzen: kravet er et almindeligt vilkaar (vilkaar.js) i sidens
   valg, saa serien aabner af sig selv, naar eleven har gjort det, der
   skulle til.

       NK.Side.start({ … serie: { krav: { journal: "billede", faerdig: true } },
                       ruder: function (bord, TS) { return [ … ]; } })

   Teksterne - overskriften, den laaste besked og den klare - staar i
   forsoegets tekst.js under noeglen "serie", saa al prosa i et forsoeg
   stadig kan laeses ét sted.

   ----- Markup'en i forsoegets index.html -----------------------------

     <button class="knap" id="serieknap" type="button">Tegneserie</button>

     <div class="overlay" id="serie">
         <div class="overlay-boks bred" role="dialog" aria-labelledby="serie-titel">
             <h2 id="serie-titel">Tegneserien</h2>
             <p class="besked" id="serie-tekst"></p>
             <div class="serie" id="serie-ruder"></div>
             <div class="knaprad"><button class="knap blaa" id="serie-luk" type="button">Luk</button></div>
         </div>
     </div>

   Stilen (.serie, .rude, .rude.fejl, .rude.bred, .resultater) staar i
   laboratoriet/css/grund.css.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tegning;

    /* Rudens laerred i CSS-pixels. Laerredet straekkes til rudens bredde
       af CSS'en, saa tallene her afgoer forholdet og skarpheden, ikke
       stoerrelsen paa skaermen. En bred rude fylder hele raekken og faar
       derfor et laerred, der er tre gange saa bredt. */
    var B = 300, H = 214, BRED = 3;

    /* Rammens egne ord. Forsoeget skriver kun laast, klar og titel. */
    var ORD = {
        titel: "Tegneserien",
        laast: "Tegneserien er ikke låst op endnu.",
        klar: "Sådan gik forsøget."
    };

    function el(id) { return NK.el(id); }

    /* ----- Deterministisk tilfaeldighed ---------------------------------
       Et lille froe-drevet tal i stedet for Math.random, mens en rude
       tegnes. Samme rude, samme billede, hver gang. */
    function medFroe(froe, fn) {
        var gammel = Math.random, n = (froe || 1) >>> 0;
        Math.random = function () {
            n = (n * 1664525 + 1013904223) >>> 0;
            return n / 4294967296;
        };
        try { fn(); }
        finally { Math.random = gammel; }
    }

    /* ----- Oejebliksbilledet --------------------------------------------
       En genstand loesrevet fra bordet: nok til at blive tegnet, og
       intet af det, der hoerer til at staa paa et bord (baeres, valgt,
       boelger, markeret). p maa saettes, hvis genstanden skal staa et
       andet sted i ruden end paa sin plads i scenen. */
    function kopi(gg, p) {
        if (!gg) return null;
        var St = NK.Stof;
        return {
            navn: gg.navn, type: gg.type, anker: gg.anker, skala: gg.skala,
            kan: gg.kan, titel: gg.titel, etiket: gg.etiket, nr: gg.nr,
            spec: gg.spec, skilt: gg.skilt,
            indhold: gg.indhold ? St.kopi(gg.indhold) : null,
            lag: gg.lag ? St.kopi(gg.lag) : null,
            lagBund: gg.lagBund,
            bund: 1, korn: [], niveau: null, bobler: [],
            p: p ? { x: p.x, y: p.y, v: p.v || 0 } : { x: gg.p.x, y: gg.p.y, v: gg.p.v },
            valgt: false, skjult: false, fremhaev: false, i: null, paa: null
        };
    }

    /* Flere paa én gang, hver paa sin egen plads i scenen */
    function gem(bord, navne) {
        if (!bord) return [];
        if (!navne) navne = bord.liste.map(function (gg) { return gg.navn; });
        return navne.map(function (n) {
            return typeof n === "string" ? kopi(bord.g[n]) : kopi(bord.g[n.navn], n);
        }).filter(function (k) { return !!k; });
    }

    /* Stiller kopier paa en raekke med lige stor afstand */
    function paaRaekke(kopier, x0, y, afstand) {
        kopier.forEach(function (k, i) {
            if (k) k.p = { x: x0 + i * afstand, y: y, v: 0 };
        });
        return kopier;
    }

    /* ----- Scenens egne tegnefunktioner, uden et levende bord -----------
       Samme fordeling som bord.tegnGenstand, men uden det, der kun giver
       mening, mens der staar en haand over bordet. */
    function tegnTing(ctx, gg, tid) {
        if (!gg) return;
        var t = gg.type, k = gg.kan || {};
        if (t && t.sprite && !k.holder && !k.varmer && !k.flamme && !k.vaegt && !k.luge
                && !k.dypper && !k.ph && !k.spatel && !k.roerer && !k.maaler) {
            T.skygge(ctx, gg.p.x - gg.anker.x + t.b / 2, t.b * 0.45, 0.3, gg.p.y - gg.anker.y + t.h - 3);
            NK.Sprites.tegnPositur(ctx, t.sprite, gg.p, gg.anker, undefined, gg.skala);
            T.tegnEtiket(ctx, gg);
            return;
        }
        if (k.flamme) T.tegnBraender(ctx, gg, tid);
        else if (k.varmer) T.tegnVarmeplade(ctx, gg, tid);
        else if (k.vaegt) T.tegnVaegt(ctx, gg, gg.vaegtTekst || "", true);
        else if (k.luge) T.tegnLuge(ctx, gg, gg.skilt || "", 0, tid);
        else if (k.dypper) T.tegnPodetraad(ctx, gg);
        else if (k.ph) T.tegnPHmeter(ctx, gg, false);
        else if (k.holder) {
            gg.niveau = T.tegnBeholder(ctx, gg, tid, {});
            if (gg.bobler && gg.bobler.length && !t.skjulIndhold) T.tegnBobler(ctx, gg, gg.bobler);
        }
        else if (k.spatel) T.tegnSpatel(ctx, gg);
        else if (k.roerer) T.tegnStav(ctx, gg);
        else if (k.maaler) T.tegnTermometer(ctx, gg, false);
    }

    /* ----- Laget ovenpaa: pil, etiket, lup, tavle, soejle ---------------
       Alt her regnes i rudens pixels, saa det staar lige skarpt, uanset
       hvor taet udsnittet gaar paa scenen. */
    function etiket(ctx, t, x, y, opt) {
        opt = opt || {};
        NK.tekst(ctx, t, x, y, {
            font: opt.font || "700 13px 'Segoe UI', sans-serif",
            justering: opt.justering || "center", linje: opt.linje || "middle",
            farve: opt.farve || "#dfe5ec", kant: opt.kant !== false,
            kantBredde: 3, kantFarve: "rgba(0, 0, 0, 0.65)"
        });
    }

    function pil(ctx, x1, y1, x2, y2, farve) {
        var v = Math.atan2(y2 - y1, x2 - x1);
        ctx.save();
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.fillStyle = farve || "#f2c53d";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - Math.cos(v) * 6, y2 - Math.sin(v) * 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(v - 0.5) * 9, y2 - Math.sin(v - 0.5) * 9);
        ctx.lineTo(x2 - Math.cos(v + 0.5) * 9, y2 - Math.sin(v + 0.5) * 9);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* En ring om noget i ruden, som en lup der peger paa det */
    function lup(ctx, x, y, r, farve) {
        ctx.save();
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    /* En rude uden scene: en moerk tavle til tal og soejler */
    function tavle(ctx, m) {
        m = m || { b: B, h: H };
        ctx.save();
        ctx.fillStyle = "#1d2128";
        ctx.fillRect(0, 0, m.b, m.h);
        ctx.restore();
    }

    /* En vandret soejle med navn til venstre og tal til hoejre */
    function soejle(ctx, y, navn, del, tekst, farve) {
        etiket(ctx, navn, 14, y, { justering: "left", font: "600 12px 'Segoe UI', sans-serif", farve: "#c8ced6" });
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        NK.rundtRekt(ctx, 104, y - 6, 130, 12, 6);
        ctx.fill();
        ctx.fillStyle = farve || "#f2c53d";
        NK.rundtRekt(ctx, 104, y - 6, 130 * NK.klamp(del, 0.02, 1), 12, 6);
        ctx.fill();
        if (tekst) etiket(ctx, tekst, 290, y, { justering: "right" });
    }

    /* ----- Resultatskemaet ----------------------------------------------
       En tabel af data. En celle er en streng eller et element, saa et
       forsoeg kan laegge en farveproeve eller et facit ind i den. */
    function tabel(raekker, klasse) {
        var t = document.createElement("table");
        t.className = "resultater" + (klasse ? " " + klasse : "");
        (raekker || []).forEach(function (r, nr) {
            var celler = r, hoved = nr === 0;
            if (r && r.celler) { celler = r.celler; hoved = !!r.hoved; }
            var tr = document.createElement("tr");
            celler.forEach(function (c, i) {
                var e = document.createElement(hoved || i === 0 ? "th" : "td");
                if (c === null || c === undefined) e.textContent = "";
                else if (typeof c === "string" || typeof c === "number") e.textContent = String(c);
                else e.appendChild(c);
                tr.appendChild(e);
            });
            t.appendChild(tr);
        });
        return t;
    }

    /* En celle med en farveproeve foran teksten og et facit under, hvis
       eleven svarede noget andet, end verden sagde */
    function svarCelle(o) {
        var span = document.createElement("span");
        if (o.farve) {
            var sw = document.createElement("span");
            sw.className = "farveprove";
            sw.style.backgroundColor = NK.css(o.farve, 1);
            span.appendChild(sw);
        }
        span.appendChild(document.createTextNode(o.svar === undefined || o.svar === null ? "" : String(o.svar)));
        if (o.facit && o.svar && o.svar !== o.facit) {
            var f = document.createElement("span");
            f.className = "facit";
            f.textContent = o.facitTekst || ("Det var " + o.facit + ".");
            span.appendChild(f);
        }
        return span;
    }

    /* ----- Ruden som DOM ------------------------------------------------ */
    function byg(container, ruder, plakat) {
        container.innerHTML = "";
        var nr = 0;
        (ruder || []).forEach(function (r) {
            if (!r) return;
            var div = document.createElement("div");
            div.className = "rude" + (r.fejl ? " fejl" : "") + (r.bred ? " bred" : "");
            if (!r.uden) {
                var m = maal(r);
                var lrd = document.createElement("canvas");
                var dpr = window.devicePixelRatio || 1;
                lrd.width = Math.round(m.b * dpr);
                lrd.height = Math.round(m.h * dpr);
                if (r.alt) lrd.setAttribute("aria-label", r.alt);
                var ctx = lrd.getContext("2d");
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                tegnRude(ctx, r, plakat);
                div.appendChild(lrd);
            }
            var p = document.createElement("p");
            var sp = document.createElement("span");
            sp.className = "nr";
            sp.textContent = String(++nr);
            p.appendChild(sp);
            p.appendChild(document.createTextNode(r.tekst || ""));
            if (r.uden) div.appendChild(p);
            if (r.dom) r.dom(div);
            if (!r.uden) div.appendChild(p);
            container.appendChild(div);
        });
        return nr;
    }

    /* Selve tegningen: udsnittet, scenen, tingene og laget ovenpaa */
    function tegnRude(ctx, r, plakat) {
        var u = r.udsnit, m = maal(r);
        medFroe(r.froe === undefined ? 1 : r.froe, function () {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, m.b, m.h);
            ctx.clip();
            if (r.ren || !u) {
                tavle(ctx, m);
            } else {
                var s = m.b / u.b;
                ctx.save();
                ctx.scale(s, s);
                ctx.translate(-u.x, -u.y);
                T.tegnBaggrund(ctx, { plakat: plakat || null });
                (r.ting || []).forEach(function (g) { tegnTing(ctx, g, r.tid || 0); });
                if (r.tegn) r.tegn(ctx);
                ctx.restore();
            }
            if (r.oven) r.oven(ctx, punkt(u, m.b), m);
            ctx.restore();
        });
    }

    /* Rudens maal: en bred rude er tre gange saa bred */
    function maal(r) {
        return r && r.bred ? { b: B * BRED, h: H } : { b: B, h: H };
    }

    /* pt(x, y): fra tegnebordets enheder til rudens pixels */
    function punkt(u, b) {
        b = b || B;
        if (!u) return function (x, y) { return { x: x, y: y }; };
        var s = b / u.b;
        return function (x, y) { return { x: (x - u.x) * s, y: (y - u.y) * s }; };
    }

    /* Et udsnit, der lige rummer de ting, der er med. Saa behoever et
       forsoeg ikke at slaa koordinater op i scenen for hver rude. */
    function omkring(ting, margen, forhold) {
        var m = margen === undefined ? 40 : margen;
        var f = forhold || H / B;
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        (ting || []).forEach(function (g) {
            if (!g || !g.type) return;
            var vx = g.p.x - g.anker.x * (g.skala || 1), vy = g.p.y - g.anker.y * (g.skala || 1);
            x0 = Math.min(x0, vx);
            y0 = Math.min(y0, vy);
            x1 = Math.max(x1, vx + g.type.b * (g.skala || 1));
            y1 = Math.max(y1, vy + g.type.h * (g.skala || 1));
        });
        if (!isFinite(x0)) return { x: 0, y: 0, b: NK.Scene.BREDDE };
        x0 -= m; y0 -= m; x1 += m; y1 += m;
        /* Hoejden foelger rudens forhold: bredden er den, der skal vaere
           stor nok til begge dele, saa intet bliver klippet af */
        var b = Math.max(x1 - x0, (y1 - y0) / f);
        return { x: (x0 + x1) / 2 - b / 2, y: (y0 + y1) / 2 - b * f / 2, b: b };
    }

    /* ----- Serien: laasen, knappen og overlayet ------------------------- */
    function Serie(valg, side) {
        this.valg = valg || {};
        this.side = side || null;
        this.ord = {};
        this.antal = 0;
        this.saetIndhold(this.valg.indhold);
        var mig = this;
        if (el("serieknap")) el("serieknap").addEventListener("click", function () { mig.aabn(); });
        if (el("serie-luk")) el("serie-luk").addEventListener("click", function () { mig.luk(); });
        this.opdaterLaas();
    }

    var S = Serie.prototype;

    S.saetIndhold = function (indhold) {
        indhold = indhold || {};
        this.ord = {
            titel: indhold.titel || ORD.titel,
            laast: indhold.laast || ORD.laast,
            klar: indhold.klar || ORD.klar
        };
        if (el("serie-titel")) NK.saetTekst("serie-titel", this.ord.titel);
    };

    /* Kravet er et vilkaar over verden, som quizzens: det proeves, hver
       gang panelet opdateres, saa serien aabner af sig selv. */
    S.laast = function () {
        var krav = this.valg.krav;
        if (krav === undefined || krav === null) return false;
        if (!NK.Vilkaar) return false;
        var bord = this.side && this.side.bord ? this.side.bord() : null;
        return !NK.Vilkaar.opfyldt(krav, bord, NK.Forloeb && NK.Forloeb.nu);
    };

    S.opdaterLaas = function () {
        var laast = this.laast();
        var knap = el("serieknap");
        if (knap) {
            knap.disabled = laast;
            knap.title = laast ? this.ord.laast : this.ord.klar;
            knap.classList.toggle("laast", laast);
        }
        if (el("serie-laast")) NK.saetTekst("serie-laast", laast ? this.ord.laast : this.ord.klar);
        if (laast && this.aaben()) this.luk();
    };

    /* Overlayet er det, der siger, om serien staar aaben - ikke et flag
       her. Esc lukker ethvert overlay uden at spoerge os foerst. */
    S.aaben = function () {
        return !!(el("serie") && el("serie").classList.contains("vis"));
    };

    S.ruder = function () {
        var bord = this.side && this.side.bord ? this.side.bord() : NK.bord;
        var liste = this.valg.ruder ? this.valg.ruder(bord, NK.Tegneserie) : [];
        return liste.filter(function (r) { return !!r; });
    };

    S.aabn = function () {
        if (this.laast()) return false;
        var container = el("serie-ruder");
        if (!container) return false;
        var bord = this.side && this.side.bord ? this.side.bord() : NK.bord;
        var pl = bord && bord.plakat ? { x: bord.plakat.x, y: bord.plakat.y, regel: 0 } : null;
        this.antal = byg(container, this.ruder(), pl);
        NK.saetTekst("serie-tekst", this.ord.klar);
        if (el("serie")) el("serie").classList.add("vis");
        return true;
    };

    S.luk = function () {
        if (el("serie")) el("serie").classList.remove("vis");
    };

    S.nulstil = function () {
        this.luk();
        this.antal = 0;
        if (el("serie-ruder")) el("serie-ruder").innerHTML = "";
        this.opdaterLaas();
    };

    NK.Tegneserie = {
        Serie: Serie,
        lav: function (valg, side) { return new Serie(valg, side); },
        /* Maalene, saa et forsoeg kan regne i rudens pixels */
        B: B, H: H, BRED: BRED,
        maal: maal,
        /* Oejebliksbilledet */
        kopi: kopi,
        gem: gem,
        paaRaekke: paaRaekke,
        omkring: omkring,
        /* Tegningen */
        byg: byg,
        tegnRude: tegnRude,
        tegnTing: tegnTing,
        punkt: punkt,
        medFroe: medFroe,
        /* Laget ovenpaa */
        etiket: etiket,
        pil: pil,
        lup: lup,
        tavle: tavle,
        soejle: soejle,
        /* Skemaet */
        tabel: tabel,
        svarCelle: svarCelle
    };
}());
