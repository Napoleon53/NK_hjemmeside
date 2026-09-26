/* =====================================================================
   sim.js - de to faner: Urglassene og Flere reaktioner

   Begge faner gør det samme: eleven drypper i et urglas, ser farven,
   vælger, hvad mangan blev til, og afstemmer i hæftet i små bidder:

     dryp       træk flasken hen over glasset
     produkt    hvad blev MnO₄⁻ til? (farvekortet i panelet)
     ox         oxidationstallet over de atomer, der skifter
     for        (kun med indekstal) lige mange atomer på klammen
     klammer    stigning ↑ eller fald ↓ ved hver klamme
     gange      gangetallene: stigning gange tal = fald gange tal
     ladning    ladningen før og efter pilen
     ion        H⁺ eller OH⁻
     brint      H-atomerne før og efter pilen
     vand       H₂O på den side, der har færrest H (O er kontrollen til sidst)

   Kun den bid, eleven er ved, kan skrives i. Et forkert svar får en
   besked, der passer til fejlen. Giv hint og Vis svaret hører til
   bidden. Tomme felter tæller som ikke besvaret, og luppen og
   regnskabet viser kun tal, eleven selv har skrevet.

   NK.Fane.paa (js/fane.js) giver listen, knappen, linjen og Kemichael.
   Her er det, der er særligt for afstemningen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var X = NK.Redox;

    var TRIN_NAVN = {
        dryp: "Dryp i glasset", produkt: "Hvad blev mangan til?", ox: "Oxidationstal", "for": "Lige mange atomer",
        klammer: "Stigning og fald", gange: "Gangetal", ladning: "Ladning", ion: "", brint: "H-atomer", vand: "Vand"
    };

    var OBS = {
        klar: "Den violette farve forsvandt. Glasset er næsten farveløst.",
        brun: "Glasset blev brunt og uklart.",
        groen: "Glasset blev grønt.",
        lysgul: "Den violette farve forsvandt, og glasset er svagt gult.",
        iod: "Glasset blev brunt, men det er klart.",
        brom: "Glasset blev orange, men det er klart."
    };

    /* Glassets farve med ord, til beskeden ved et forkert valg */
    var GLAS_ORD = {
        klar: "næsten farveløst", brun: "brunt og uklart", groen: "grønt", lysgul: "svagt gult",
        iod: "brunt, men klart", brom: "orange, men klart"
    };

    var F = {};

    /* ----- Opstart ------------------------------------------------------------------ */
    F.init = function () {
        var mig = this, navn = this.cfg.navn;
        var opgaver = D.REAKTIONER.filter(function (r) { return r.fane === navn; });
        this.haefte = new NK.Haefte(NK.el(navn + "-haefte"), navn);
        this.haefte.vedEnter = function () { mig.tjekTrin(); };
        this.haefte.vedInput = function (k, inp) { mig.input(k, inp); };
        this.haefte.vedTast = function (k, e) { return mig.tast(k, e); };
        this.haefte.vedPil = function (t) { mig.vendPil(t); };
        this.haefte.vedValg = function (f) { mig.valgt(f, "selv"); };
        /* Ét urglas paa begge faner; fane 1 har to flasker */
        this.bord = new NK.Bord({ navn: navn, glas: [{ tekst: "", farve: "vand" }],
            flasker: D.FLASKER[navn].map(function (id) { return D.FLASKE[id]; }) });
        this.bord.visAktiv = true;
        this.kendtOx = {};
        this.token = 0;
        this.startFane(opgaver, D.GRUPPER[navn]);
        this.bygFarvekort();
        this.introNu = true;
        this.vaelg(0);
    };

    F.chipTekst = function (o) { return NK.html(o.kort); };

    F.aktivt = function () { return this.opg.trin[this.opg.nr]; };
    F.opgaveFaerdig = function () { return this.opg.nr >= this.opg.trin.length; };
    F.glasNr = function () { return 0; };

    /* Den flaske, reaktionen skal bruge (nummeret paa bordet) */
    F.flaskeNr = function () {
        var id = this.opg.def.flaske || D.FLASKER[this.cfg.navn][0];
        return D.FLASKER[this.cfg.navn].indexOf(id);
    };

    /* Paa fane 1 sker reaktionerne i samme glas efter hinanden: den naeste
       aabner foerst, naar skemaet foer den er afstemt */
    F.laast = function (i) {
        return this.cfg.navn === "ug" && i > 0 && !this.status[i - 1].loest;
    };

    /* ----- En ny opgave ------------------------------------------------------------------ */
    F.lavOpgave = function (i) {
        var def = this.opgaver[i], R = X.reaktion(def);
        this.token++;
        var trin = ["dryp", "produkt", "ox"];
        if (R.forafstem) trin.push("for");
        trin.push("klammer", "gange", "ladning");
        if (R.ion.antal) trin.push("ion");
        trin.push("brint");
        if (R.vand.antal) trin.push("vand");
        this.opg = {
            def: def, R: R, trin: trin, nr: 0,
            tal: {},                           /* fundne tal: { v, slags } */
            pil: { ox: null, red: null },      /* elevens pile ved klammerne */
            forkert: {},                       /* forkerte valg af manganstoffet */
            dryppet: false, produkt: false, koefFaerdig: false
        };
        this.bord.stop();
        this.bord.lupTom();
        this.saetGlassene();
        this.haefte.byg(this.opg);
        this.visHaefte();
        this.visFarvekort();
    };

    /* Glasset har farven fra foer reaktionen (paa fane 1: det, den forrige
       reaktion efterlod) */
    F.saetGlassene = function () {
        var d = this.opg.def;
        this.bord.saetGlas(0, d.foer, d.foerBundfald || null);
        this.bord.saetTekst(0, d.glasTekst);
        this.bord.aktiv = 0;
    };

    /* ----- Teksterne i opgavekortet ------------------------------------------------------ */
    F.promptHTML = function () {
        var d = this.opg.def;
        return '<p class="maal-tekst">' + NK.html(d.tekst) + "</p>" +
            (d.kontekst && this.opg.dryppet ? '<p class="opgave-spm">' + NK.html(d.kontekst) + "</p>" : "");
    };

    F.visKortEkstra = function () {
        var g = this.opg, html = "";
        var ion = g.R.ionSt.tekst;
        g.trin.forEach(function (t, i) {
            var navn = t === "ion" ? ion : TRIN_NAVN[t];
            if (i < g.nr) html += '<span class="tl-trin ok">✓ ' + NK.html(navn) + "</span>";
            else if (i === g.nr) html += '<span class="tl-trin nu">' + (i + 1) + ". " + NK.html(navn) + "</span>";
        });
        if (g.nr < g.trin.length) html += '<span class="tl-rest">' + (g.trin.length - g.nr - 1 ? "og " + (g.trin.length - g.nr - 1) + " mere" : "sidste") + "</span>";
        NK.saetHTML(this.navn + "-trin", html);
    };

    /* Naeste skridt i hele saetninger */
    F.trinLinje = function () {
        var g = this.opg, R = g.R, t = this.aktivt();
        var A = R.led[R.ox.v].st, M = R.led[R.red.v].st;
        switch (t) {
        case "dryp":
            var fl = D.FLASKE[D.FLASKER[this.cfg.navn][this.flaskeNr()]];
            return "Træk flasken med " + fl.navn + " (" + fl.tekst + ") hen over urglasset, og slip den. Du kan også klikke på glasset.";
        case "produkt":
            return "Hvad blev " + M.tekst + " til? Se på farven i glasset, find den på farvekortet, og vælg formlen i hæftet.";
        case "ox":
            var mangler = this.noegler("ox").filter(function (k) { return !g.tal[k]; }).length;
            return mangler < 4 ? "Skriv de sidste oxidationstal, og tryk Enter." :
                "Skriv oxidationstallet over " + R.ox.E + " og " + R.red.E + " på begge sider af pilen, og tryk Enter.";
        case "for":
            var K = R.ox.pv > 1 || R.ox.ph > 1 ? R.ox : R.red;
            var foran = R.led[K.pv > 1 ? K.v : K.h].st;
            return "Der er " + Math.max(K.nV, K.nH) + " " + K.E + " i " + R.led[K.nV > K.nH ? K.v : K.h].st.tekst + ", men kun " +
                Math.min(K.nV, K.nH) + " i " + foran.tekst + ". Skriv et tal foran " + foran.tekst + ", så der er lige mange " + K.E + " på begge sider.";
        case "klammer":
            var idx = [R.ox, R.red].filter(function (k) { return k.antal > 1; })[0];
            return "Stiger eller falder " + R.ox.E + " og " + R.red.E + "? Klik på pilen ved hver klamme, så den peger op eller ned, og skriv, hvor meget." +
                (idx ? " Tæl alle " + idx.antal + " " + idx.E + " på klammen med." : "");
        case "gange":
            return "Skriv et tal foran hver pil, så stigning gange tal bliver lige så meget som fald gange tal. Brug de mindste tal.";
        case "ladning":
            return "Tallene står nu foran formlerne. Læg ladningerne sammen på hver side af pilen, og skriv dem i rækken Ladning.";
        case "ion":
            if (R.miljoe === "surt") return "Glasset er surt. Sæt H⁺ på den side, hvor ladningen er lavest, så ladningen bliver ens på begge sider.";
            if (R.miljoe === "neutralt") return "Glasset er neutralt, så der er ingen H⁺ at tage af. Vand kan give OH⁻. Sæt OH⁻ på den side, hvor ladningen er højest.";
            return "Glasset er basisk. Sæt OH⁻ på den side, hvor ladningen er højest, så ladningen bliver ens på begge sider.";
        case "brint":
            return "Tæl H-atomerne på hver side af pilen, og skriv dem i rækken H-atomer. Husk tallene foran formlerne, og tæl H i " +
                R.ionSt.tekst + " med.";
        case "vand":
            return "Hvert H₂O har 2 H. Sæt H₂O på den side, der har færrest H, så der er lige mange H på begge sider.";
        }
        return "";
    };

    /* ----- Hæftet: det, der skal vises lige nu ------------------------------------------------- */
    F.noegler = function (t) {
        var R = this.opg.R, ud = [];
        switch (t) {
        case "ox": return [R.ox.v, R.red.v, R.ox.h, R.red.h].sort(function (a, b) { return a - b; }).map(function (i) { return "ox" + i; });
        case "for":
            [R.ox, R.red].forEach(function (K) {
                if (K.pv > 1) ud.push("for" + K.v);
                if (K.ph > 1) ud.push("for" + K.h);
            });
            return ud;
        case "klammer": return ["kl-ox", "kl-red"];
        case "gange": return ["g-ox", "g-red"];
        case "ladning": return ["lad-v", "lad-h"];
        case "ion": return ["ion-v", "ion-h"];
        case "brint": return ["brint-v", "brint-h"];
        case "vand": return ["vand-v", "vand-h"];
        }
        return [];
    };

    F.naaet = function (t) { var i = this.opg.trin.indexOf(t); return i >= 0 && i <= this.opg.nr; };
    F.forbi = function (t) { var i = this.opg.trin.indexOf(t); return i >= 0 && i < this.opg.nr; };

    F.vaerdi = function (k) { var i = this.haefte.inp(k); return i ? i.value : ""; };

    /* Et tal, eleven har skrevet (men ikke faaet tjekket): til luppen og raekkerne */
    F.skrevet = function (k) {
        var v = X.laesTal(this.vaerdi(k));
        return v === null || isNaN(v) ? null : v;
    };

    F.visning = function () {
        var mig = this, g = this.opg, R = g.R, t = this.faerdig ? null : this.aktivt();
        var aktiv = t ? this.noegler(t).filter(function (k) { return !g.tal[k]; }) : [];
        var d = g.def;
        var navn = d.navn;
        return {
            navn: navn,
            faerdig: this.faerdig,
            aktiv: aktiv,
            kendt: function (i) {
                var l = R.led[i];
                if (l.side === "v") return true;
                return g.dryppet && (i !== R.red.h || g.produkt);
            },
            ukendt: function (i) { return g.dryppet && i === R.red.h && !g.produkt; },
            tal: function (k) {
                if (g.tal[k]) return g.tal[k];
                return null;
            },
            koef: function (i) {
                if (g.koefFaerdig) {
                    var k = R.koef[i];
                    return { tekst: k === 1 ? "" : String(k), slags: g.tal["g-ox"] && g.tal["g-ox"].slags === "vist" ? "vist" : "ok" };
                }
                var f = g.tal["for" + i];
                if (f) return { tekst: String(f.v), slags: "blyant" };
                return { tekst: "" };
            },
            klammer: this.naaet("klammer"),
            pil: function (tt) { return g.pil[tt]; },
            pilLaast: function (tt) { return !!g.tal["kl-" + tt]; },
            gange: this.naaet("gange"),
            prod: function (tt) {
                var K = R[tt];
                if (g.tal["g-" + tt]) return { tekst: "= " + g.tal["g-" + tt].v * K.tot, slags: "ok" };
                if (t !== "gange") return { tekst: "" };
                var a = mig.skrevet("g-ox"), b = mig.skrevet("g-red"), v = mig.skrevet("g-" + tt);
                if (v === null || v <= 0) return { tekst: "" };
                var lige = a !== null && b !== null && a > 0 && b > 0 && a * R.ox.tot === b * R.red.tot;
                return { tekst: "= " + v * K.tot, slags: lige ? "lige" : "vent" };
            },
            ekstra: function (slags, side) {
                var trin = slags === "ion" ? "ion" : "vand";
                if (!mig.naaet(trin)) return "";
                if (mig.forbi(trin) || mig.faerdig) return R[slags].side === side ? "tal" : "";
                return "felt";
            },
            rad: function (r) {
                if (r === "lad") return mig.naaet("ladning");
                if (r === "brint") return mig.naaet("brint");
                return !!mig.faerdig;
            },
            celle: function (r, side) { return mig.celle(r, side); },
            valg: t === "produkt" ? this.valgListe() : null
        };
    };

    /* Teksten i en celle under skemaet. Efter H⁺/OH⁻ og vand vises det
       nye tal efter en pil: +9 → +17. Mens eleven skriver, er det nye
       tal gult, og det regnes kun af elevens eget tal. */
    F.celle = function (r, side) {
        var g = this.opg, R = g.R, t = this.faerdig ? null : this.aktivt();
        /* O-raekken er kontrollen til sidst: den kommer af sig selv */
        if (r === "ilt") return this.faerdig ? { html: String(R.slut[side].O || 0) + " ✓", slags: "ok" } : null;
        var noegle = r + "-" + side, fundet = g.tal[noegle];
        if (!fundet) return null;
        var html = String(r === "lad" ? X.lad(fundet.v) : fundet.v), slags = fundet.slags;
        var ekstra = r === "lad" ? "ion" : "vand";
        var stk = r === "lad" ? R.ionSt.q : 2;
        if (this.forbi(ekstra) || (this.faerdig && R[ekstra].side)) {
            if (R[ekstra].side === side) {
                var ny = fundet.v + R[ekstra].antal * stk;
                html += ' <span class="pil">→</span> ' + (r === "lad" ? X.lad(ny) : ny);
            }
            html += " ✓";
        } else if (t === ekstra) {
            var n = this.skrevet(ekstra + "-" + side);
            if (n) html += ' <span class="pil">→</span> <span class="vent">' + (r === "lad" ? X.lad(fundet.v + n * stk) : fundet.v + n * stk) + "</span>";
        } else if (this.forbi(r === "lad" ? "ladning" : "brint") && !R[ekstra].side) {
            html += " ✓";
        }
        return { html: html, slags: slags };
    };

    F.visHaefte = function () {
        this.haefte.visTilstand(this.visning());
        this.opdaterLup();
    };

    /* ----- Farvekortet i panelet ---------------------------------------------------------- */
    F.bygFarvekort = function () {
        var boks = NK.el(this.navn + "-farvekort");
        if (!boks) return;
        var html = "";
        D.MANGAN.forEach(function (m, i) {
            var st = X.stof(m.f);
            html += '<div class="fk-raekke" data-i="' + i + '"><span class="fk-farve" style="background:' + NK.Tegn.rgba(D.FARVE[m.farve], 1 / D.FARVE[m.farve][3]) +
                '"></span><span class="fk-formel">' + st.tekst + '</span><span class="fk-tekst">' + NK.html(m.tekst) +
                '</span><span class="fk-ox"></span></div>';
        });
        boks.innerHTML = html;
    };

    F.visFarvekort = function () {
        var boks = NK.el(this.navn + "-farvekort");
        if (!boks || !this.opg) return;
        var mig = this, g = this.opg, R = g.R;
        var produkt = g.produkt ? R.led[R.red.h].st.f : null, reaktant = R.led[R.red.v].st.f;
        var r = boks.querySelectorAll(".fk-raekke");
        D.MANGAN.forEach(function (m, i) {
            var e = r[i];
            var ox = mig.kendtOx[m.f];
            e.querySelector(".fk-ox").textContent = ox === undefined ? "" : X.ox(ox);
            e.classList.toggle("nu", m.f === produkt || m.f === reaktant);
        });
    };

    /* ----- Luppen -------------------------------------------------------------------------- */
    function farve(f) { return D.PARTIKEL[f] || "#cfd6de"; }

    F.lupData = function () {
        var g = this.opg, R = g.R, OX = R.ox, RED = R.red;
        var a = g.tal["g-ox"] ? g.tal["g-ox"].v : Math.max(0, this.skrevet("g-ox") || 0);
        var b = g.tal["g-red"] ? g.tal["g-red"].v : Math.max(0, this.skrevet("g-red") || 0);
        a = Math.min(a, 99); b = Math.min(b, 99);
        var A = R.led[OX.v].st, B = R.led[RED.v].st, PA = R.led[OX.h].st, PB = R.led[RED.h].st;
        return {
            a: { farve: farve(A.f), e: OX.ePrEnhed, n: a * OX.pv, tekst: A.tekst },
            b: { farve: farve(B.f), e: RED.ePrEnhed, n: b * RED.pv, tekst: B.tekst },
            pa: { farve: farve(PA.f), n: a * OX.ph, tekst: PA.tekst },
            pb: { farve: farve(PB.f), n: b * RED.ph, tekst: PB.tekst }
        };
    };

    F.opdaterLup = function () {
        if (!this.naaet("gange") && !this.faerdig) return;
        if (this.bord.lup.fase === "tom" || this.bord.lup.fase === "tal") this.bord.lupVis(this.lupData());
    };

    /* ----- Hvad eleven goer i hæftet ---------------------------------------------------------- */
    F.input = function (k, inp) {
        var g = this.opg;
        this.k.skriver();
        if (k.indexOf("kl-") === 0) {
            /* Et fortegn eller en pil i feltet vender pilen */
            var s = inp.value, t = k.slice(3), ny = s;
            if (/^[+↑]/.test(s)) { g.pil[t] = true; ny = s.slice(1); }
            else if (/^[-−–↓]/.test(s)) { g.pil[t] = false; ny = s.slice(1); }
            if (ny !== s) inp.value = ny;
        }
        this.visHaefte();
    };

    F.tast = function (k, e) {
        if (k.indexOf("kl-") !== 0) return false;
        var t = k.slice(3);
        if (e.key === "ArrowUp") { this.opg.pil[t] = true; this.visHaefte(); return true; }
        if (e.key === "ArrowDown") { this.opg.pil[t] = false; this.visHaefte(); return true; }
        return false;
    };

    F.vendPil = function (t) {
        var g = this.opg;
        if (this.aktivt() !== "klammer" || g.tal["kl-" + t]) return;
        g.pil[t] = g.pil[t] === true ? false : true;
        this.k.skriver();
        this.visHaefte();
        this.haefte.fokus("kl-" + t);
    };

    /* ----- Scenen: flasken og glassene ----------------------------------------------------------- */
    F.overScene = function (pt) {
        if (!pt) { this.bord.hover(null); return null; }
        var u = this.bord.hover(pt);
        return u === "greb" ? "greb" : (u ? "klik" : null);
    };

    F.nedScene = function (pt) {
        if (this.bord.optaget()) return false;
        return this.bord.grib(pt);
    };

    F.flytScene = function (pt) { this.bord.traek(pt); };

    F.opScene = function (pt) {
        var r = this.bord.slip(pt);
        if (r.klik) { this.slipPaaGlas(0, r.flaske); return; }
        if (r.glas !== undefined) { this.slipPaaGlas(r.glas, r.flaske); return; }
        if (this.k.under(pt) === "kop") this.k.svar(NK.html(D.KAFFE_FLASKE[this.cfg.navn]), "skidt", 4);
        else if (this.aktivt() === "dryp") this.kortBesked("Slip flasken over urglasset.", 4);
        this.bord.hjem(r.flaske);
    };

    F.klikScene = function (pt) {
        if (this.bord.optaget()) return;
        var gi = this.bord.glasUnder(pt, false);
        if (gi >= 0) { this.slipPaaGlas(gi); return; }
        var L = this.bord.lay && this.bord.lay.lup;
        if (L && Math.pow(pt.x - L.cx, 2) + Math.pow(pt.y - L.cy, 2) <= L.r * L.r) {
            this.kortBesked(this.naaet("gange") || this.faerdig ? "Luppen viser elektronerne med de gangetal, du har skrevet." :
                "Luppen viser elektronerne, når du skriver gangetallene.", 4);
        }
    };

    /* Flaske nr er sluppet over glasset (eller der er klikket paa det eller
       paa flasken). Uden nr bruges den flaske, reaktionen skal have. */
    F.slipPaaGlas = function (i, nr) {
        var rigtig = this.flaskeNr();
        if (nr === undefined) nr = rigtig;
        if (this.faerdig || this.aktivt() !== "dryp") {
            this.bord.hjem(nr);
            if (!this.faerdig) this.kortBesked("Der er dryppet i glasset. Afstem reaktionen i hæftet.", 4);
            else if (this.cfg.navn === "ug" && this.naesteUloeste() >= 0) this.kortBesked("Tryk Næste opgave for at dryppe igen.", 4);
            return;
        }
        if (nr !== rigtig) {
            var fl = D.FLASKE[D.FLASKER[this.cfg.navn][rigtig]];
            this.bord.hjem(nr);
            this.kortBesked("Nu skal der " + fl.navn + " i. Tag flasken med " + fl.tekst + ".", 4);
            return;
        }
        this.dryp();
    };

    F.dryp = function () {
        var mig = this, g = this.opg, token = this.token;
        if (g.dryppet || this.aktivt() !== "dryp" || this.bord.optaget()) return;
        this.bord.dryp(0, { til: g.def.efter, bundfald: g.def.bundfald, gas: g.def.gas }, function () {
            if (token !== mig.token) return;
            mig.dryppet();
        }, this.flaskeNr());
    };

    F.dryppet = function () {
        var g = this.opg, d = g.def;
        g.dryppet = true;
        g.nr++;
        if (d.glasEfter) this.bord.saetTekst(0, d.glasEfter);
        var obs = d.obs || OBS[d.efter] || "";
        if (d.bundfald === "gul") obs += " Der kommer et gult bundfald.";
        if (d.gas) obs += " Der kommer bobler.";
        this.visHaefte();
        this.visKort();
        this.nytTrin(obs, "");
    };

    /* ----- Manganstoffet ---------------------------------------------------------------------- */
    F.valgListe = function () {
        var g = this.opg, R = g.R, reaktant = R.led[R.red.v].st.f;
        return D.MANGAN.filter(function (m) { return m.f !== reaktant; }).map(function (m) {
            return { f: m.f, tekst: X.stof(m.f).tekst, forkert: !!g.forkert[m.f] };
        });
    };

    F.valgt = function (f, maade) {
        var g = this.opg, R = g.R, d = g.def;
        if (this.aktivt() !== "produkt") return;
        var rigtig = R.led[R.red.h].st;
        if (f === rigtig.f) {
            g.produkt = true;
            if (maade === "svar") this.forklaringNu = { trin: "produkt", medSvar: true };
            var m = D.MANGAN.filter(function (x) { return x.f === f; })[0];
            this.loesTrin(maade, maade === "selv" ? "Rigtigt. " + rigtig.tekst + " er " + m.ord + "." : "",
                maade === "svar" ? NK.html(rigtig.tekst + " er " + m.ord + ".") + LAES_MERE : "");
            return;
        }
        g.forkert[f] = true;
        var valgt = D.MANGAN.filter(function (x) { return x.f === f; })[0];
        var t = X.stof(f).tekst + " er " + valgt.ord + ". Glasset er " + GLAS_ORD[d.efter] + ".";
        if (d.kontekst && (d.efter === "iod" || d.efter === "brom" || d.efter === "lysgul")) t += " " + d.kontekst;
        this.visHaefte();
        this.fejlLinje(t);
    };

    /* ----- Tjek den bid, eleven er ved ------------------------------------------------------ */
    F.tjekTrin = function () {
        if (this.faerdig || this.auto) return;
        switch (this.aktivt()) {
        case "dryp": this.kortBesked("Træk flasken hen over urglasset først.", 3); return;
        case "produkt": this.kortBesked("Vælg formlen i hæftet under spørgsmålstegnet.", 3); return;
        case "ox": this.tjekOx(); return;
        case "for": this.tjekFor(); return;
        case "klammer": this.tjekKlammer(); return;
        case "gange": this.tjekGange(); return;
        case "ladning": this.tjekLad(); return;
        case "ion": this.tjekIon(); return;
        case "brint": this.tjekBrint(); return;
        case "vand": this.tjekVand(); return;
        }
    };

    /* Felterne i en bid, der tjekkes hver for sig. rigtig(k) giver det
       rigtige tal, laes(k) det skrevne, fejl(k, v) beskeden. */
    F.tjekHver = function (t, laes, rigtig, fejl, tomTekst, rosTekst) {
        var mig = this, g = this.opg, forste = null, noget = false;
        this.noegler(t).forEach(function (k) {
            if (g.tal[k]) return;
            var v = laes(k);
            if (v === null) return;
            noget = true;
            if (v === rigtig(k)) { g.tal[k] = { v: v, slags: "ok" }; return; }
            if (!forste) forste = { k: k, tekst: fejl(k, v) };
            mig.haefte.ryst(k);
        });
        var mangler = this.noegler(t).filter(function (k) { return !g.tal[k]; });
        if (!mangler.length) { this.loesTrin("selv", rosTekst ? rosTekst() : ""); return; }
        this.visHaefte();
        if (forste) { this.fejlLinje(forste.tekst); this.haefte.fokus(forste.k); return; }
        if (!noget) { this.fejlLinje(tomTekst); this.haefte.fokus(mangler[0]); return; }
        this.besked("Rigtigt. " + this.trinLinje(), "god");
        this.haefte.fokus(mangler[0]);
    };

    F.ledK = function (i) { var R = this.opg.R; return R.led[i].rolle === "ox" ? R.ox : R.red; };

    F.tjekOx = function () {
        var mig = this, R = this.opg.R;
        this.tjekHver("ox",
            function (k) { var v = X.laesOx(mig.vaerdi(k)); return v === null ? null : v; },
            function (k) { var i = +k.slice(2); return R.led[i].st.ox[mig.ledK(i).E]; },
            function (k, v) { var i = +k.slice(2); return X.oxFejl(R.led[i].st, v); },
            "Skriv et oxidationstal i feltet over atomet, fx +VII, −II eller 0.",
            null);
    };

    F.tjekFor = function () {
        var mig = this, R = this.opg.R;
        function rigtig(k) { var i = +k.slice(3), K = mig.ledK(i); return i === K.v ? K.pv : K.ph; }
        this.tjekHver("for",
            function (k) { return mig.skrevet(k) === null && mig.vaerdi(k).trim() ? NaN : mig.skrevet(k); },
            rigtig,
            function (k, v) {
                var i = +k.slice(3), K = mig.ledK(i), st = R.led[i].st, n = st.el[K.E];
                var anden = R.led[i === K.v ? K.h : K.v].st, m = anden.el[K.E];
                if (isNaN(v)) return "Skriv et helt tal foran " + st.tekst + ".";
                return "Med " + v + " " + st.tekst + " er der " + v * n + " " + K.E + " på den side, men " + m + " " + K.E + " i " + anden.tekst + ".";
            },
            "Skriv et tal i feltet foran formlen.",
            function () { return "Rigtigt. Nu er der lige mange " + (R.ox.pv > 1 || R.ox.ph > 1 ? R.ox.E : R.red.E) + " på begge sider."; });
    };

    F.tjekKlammer = function () {
        var mig = this, g = this.opg, R = g.R, forste = null, noget = false;
        ["ox", "red"].forEach(function (t) {
            var k = "kl-" + t;
            if (g.tal[k]) return;
            var K = R[t], op = g.pil[t], n = mig.skrevet(k);
            if (op === null && n === null && !mig.vaerdi(k).trim()) return;
            noget = true;
            if (n === null && mig.vaerdi(k).trim()) n = NaN;
            var f = X.klammeFejl(K, op, n);
            if (!f) { g.tal[k] = { v: K.tot, slags: "ok" }; return; }
            if (!forste) forste = { k: k, tekst: f };
            mig.haefte.ryst(k);
        });
        if (g.tal["kl-ox"] && g.tal["kl-red"]) {
            var A = R.led[R.ox.v].st, M = R.led[R.red.v].st;
            this.loesTrin("selv", "Rigtigt. " + R.ox.E + " stiger, så " + A.tekst + " oxideres. " + R.red.E + " falder, så " + M.tekst + " reduceres.");
            return;
        }
        this.visHaefte();
        var mangler = ["kl-ox", "kl-red"].filter(function (k) { return !g.tal[k]; });
        if (forste) { this.fejlLinje(forste.tekst); this.haefte.fokus(forste.k); return; }
        if (!noget) { this.fejlLinje("Klik på pilen ved klammen, så den peger op eller ned, og skriv tallet ved siden af."); this.haefte.fokus(mangler[0]); return; }
        this.besked("Rigtigt. Nu den anden klamme.", "god");
        this.haefte.fokus(mangler[0]);
    };

    F.tjekGange = function () {
        var g = this.opg, R = g.R, OX = R.ox, RED = R.red;
        var a = this.skrevet("g-ox"), b = this.skrevet("g-red");
        var ta = this.vaerdi("g-ox").trim(), tb = this.vaerdi("g-red").trim();
        if (!ta || !tb) {
            if (!ta) this.haefte.ryst("g-ox");
            if (!tb) this.haefte.ryst("g-red");
            this.fejlLinje("Skriv et tal foran begge pile. Skriv 1, hvis tallet er 1.");
            this.haefte.fokus(!ta ? "g-ox" : "g-red");
            return;
        }
        if (a === null || b === null || a <= 0 || b <= 0) { this.fejlLinje("Skriv et helt tal, der er større end 0."); return; }
        var ea = a * OX.tot, eb = b * RED.tot;
        if (ea !== eb) {
            this.haefte.ryst("g-ox");
            this.haefte.ryst("g-red");
            this.fejlLinje("Stigning: " + a + " · " + OX.tot + " = " + ea + ". Fald: " + b + " · " + RED.tot + " = " + eb + ". De to tal skal være lige store.");
            return;
        }
        var d = NK.gcd(a, b);
        if (d > 1) {
            this.fejlLinje("Det går op, men begge tal kan deles med " + d + ". Brug de mindste tal.");
            return;
        }
        g.tal["g-ox"] = { v: a, slags: "ok" };
        g.tal["g-red"] = { v: b, slags: "ok" };
        this.loesTrin("selv", this.gangeRos());
    };

    F.gangeRos = function () {
        var R = this.opg.R, OX = R.ox, RED = R.red;
        var t = "Rigtigt. " + OX.gange + " · " + OX.tot + " = " + RED.gange + " · " + RED.tot + " = " + R.elektroner + ". Der flytter " + R.elektroner + " elektroner.";
        if (R.forafstem) t += " Tallet foran bliver gangetallet gange tallet fra før.";
        return t;
    };

    F.tjekLad = function () {
        var mig = this, R = this.opg.R;
        this.tjekHver("ladning",
            function (k) { var v = mig.skrevet(k); return v === null && mig.vaerdi(k).trim() ? NaN : v; },
            function (k) { return R.ladning[k.slice(4)]; },
            function (k, v) { return mig.ladFejl(k.slice(4), v); },
            "Skriv ladningen som et tal med fortegn, fx +9 eller −8.",
            function () { return "Rigtigt. Ladningen er " + X.lad(R.ladning.v) + " før pilen og " + X.lad(R.ladning.h) + " efter."; });
    };

    F.ladFejl = function (side, svar) {
        var R = this.opg.R, uden = 0, eks = null, rigtig = R.ladning[side];
        if (svar === null || isNaN(svar)) return "Skriv ladningen som et tal med fortegn, fx +9 eller −8.";
        R.led.forEach(function (l, i) {
            if (l.side !== side) return;
            uden += l.st.q;
            if (!eks && R.koef[i] > 1 && l.st.q) eks = R.koef[i] + " " + l.st.tekst + " har ladningen " + R.koef[i] + " · " + X.ladP(l.st.q) + " = " + X.lad(R.koef[i] * l.st.q) + ".";
        });
        var hvor = side === "v" ? "Før pilen" : "Efter pilen";
        if (svar === uden && eks) return hvor + ": husk tallene foran. " + eks;
        if (svar === -rigtig) return hvor + ": tjek fortegnene.";
        return hvor + ": gang hver ladning med tallet foran, og læg sammen.";
    };

    F.tjekIon = function () {
        var g = this.opg, R = g.R, rig = R.ion, ion = R.ionSt.tekst;
        var tv = this.vaerdi("ion-v").trim(), th = this.vaerdi("ion-h").trim();
        var n = { v: this.skrevet("ion-v") || 0, h: this.skrevet("ion-h") || 0 };
        if ((tv && this.skrevet("ion-v") === null) || (th && this.skrevet("ion-h") === null) || n.v < 0 || n.h < 0) {
            this.fejlLinje("Skriv antallet som et helt tal.");
            return;
        }
        var anden = rig.side === "v" ? "h" : "v";
        if (n[rig.side] === rig.antal && !n[anden]) {
            g.tal["ion-" + rig.side] = { v: rig.antal, slags: "ok" };
            var q = X.ladninger(R, R.koef, R.ion);
            this.loesTrin("selv", "Rigtigt. Nu er ladningen " + X.lad(q.v) + " på begge sider.");
            return;
        }
        var q0 = R.ladning;
        if (n.v > 0 && n.h > 0) { this.ryst2("ion"); this.fejlLinje("Kun på den ene side. " + ion + " på begge sider går ud mod hinanden."); return; }
        if (!n.v && !n.h) { this.ryst2("ion"); this.fejlLinje("Skriv antallet af " + ion + " i feltet på den side, hvor de skal stå."); return; }
        if (n[anden] > 0) {
            this.haefte.ryst("ion-" + anden);
            this.fejlLinje(ion + " er " + (R.ionSt.q > 0 ? "positive" : "negative") + ". Før pilen er ladningen " + X.lad(q0.v) + ", og efter pilen er den " +
                X.lad(q0.h) + ". " + ion + " skal på den side, hvor ladningen er " + (R.ionSt.q > 0 ? "lavest" : "højest") + ".");
            return;
        }
        var q1 = X.ladninger(R, R.koef, { side: rig.side, antal: n[rig.side] });
        this.haefte.ryst("ion-" + rig.side);
        this.fejlLinje("Nu er ladningen " + X.lad(q1.v) + " før pilen og " + X.lad(q1.h) + " efter. Der er " +
            Math.abs(q1.v - q1.h) + " " + ion + " for " + (n[rig.side] > rig.antal ? "mange" : "få") + ".");
    };

    F.ryst2 = function (slags) { this.haefte.ryst(slags + "-v"); this.haefte.ryst(slags + "-h"); };

    /* H-atomerne: vandet afstemmer H, som man goer i Danmark */
    F.tjekBrint = function () {
        var mig = this, R = this.opg.R;
        this.tjekHver("brint",
            function (k) { var v = mig.skrevet(k); return v === null && mig.vaerdi(k).trim() ? NaN : v; },
            function (k) { return R.foer[k.slice(6)].H || 0; },
            function (k, v) { return mig.brintFejl(k.slice(6), v); },
            "Skriv antallet af H-atomer på hver side.",
            function () { return "Rigtigt. " + (R.foer.v.H || 0) + " H før pilen og " + (R.foer.h.H || 0) + " efter."; });
    };

    F.brintFejl = function (side, v) {
        var R = this.opg.R, uden = 0, eks = null, rigtig = R.foer[side].H || 0;
        if (v === null || isNaN(v)) return "Skriv antallet af H som et helt tal.";
        R.led.forEach(function (l, i) {
            var n = l.st.el.H || 0;
            if (l.side !== side || !n) return;
            uden += n;
            if (!eks && R.koef[i] > 1) eks = R.koef[i] + " " + l.st.tekst + " har " + R.koef[i] + " · " + n + " = " + R.koef[i] * n + " H.";
        });
        var ionH = R.ion.side === side ? R.ion.antal : 0;
        var hvor = side === "v" ? "Før pilen" : "Efter pilen";
        if (ionH && v === rigtig - ionH) return hvor + ": husk H i " + R.ion.antal + " " + R.ionSt.tekst + ".";
        if (eks && (v === uden || v === uden + ionH)) return hvor + ": husk tallene foran. " + eks;
        return hvor + ": gang antallet af H i hver formel med tallet foran, og læg sammen.";
    };

    F.tjekVand = function () {
        var g = this.opg, R = g.R, rig = R.vand;
        var tv = this.vaerdi("vand-v").trim(), th = this.vaerdi("vand-h").trim();
        var w = { v: this.skrevet("vand-v") || 0, h: this.skrevet("vand-h") || 0 };
        if ((tv && this.skrevet("vand-v") === null) || (th && this.skrevet("vand-h") === null) || w.v < 0 || w.h < 0) {
            this.fejlLinje("Skriv antallet som et helt tal.");
            return;
        }
        var anden = rig.side === "v" ? "h" : "v";
        if (w[rig.side] === rig.antal && !w[anden]) {
            g.tal["vand-" + rig.side] = { v: rig.antal, slags: "ok" };
            this.loesTrin("selv", "");
            return;
        }
        var t0 = R.foer;
        if (w.v > 0 && w.h > 0) { this.ryst2("vand"); this.fejlLinje("Kun på den ene side. Vand på begge sider går ud mod hinanden."); return; }
        if (!w.v && !w.h) { this.ryst2("vand"); this.fejlLinje("Skriv antallet af H₂O i feltet på den side, der mangler H."); return; }
        if (w[anden] > 0) {
            this.haefte.ryst("vand-" + anden);
            this.fejlLinje("Vandet skal på den side, der har færrest H. Før pilen er der " + (t0.v.H || 0) + " H, og efter pilen er der " + (t0.h.H || 0) + ".");
            return;
        }
        var nu = (t0[rig.side].H || 0) + 2 * w[rig.side], andenH = t0[anden].H || 0;
        this.haefte.ryst("vand-" + rig.side);
        if (w[rig.side] === 2 * rig.antal) {
            this.fejlLinje("Hvert H₂O har 2 H. Så skal der kun halvt så mange H₂O, som der mangler H.");
            return;
        }
        this.fejlLinje("Nu er der " + nu + " H på den ene side og " + andenH + " på den anden. Hvert H₂O giver 2 H.");
    };

    /* ----- En bid er loest --------------------------------------------------------------- */
    F.loesTrin = function (maade, ros, svarHTML) {
        var g = this.opg, t = this.aktivt();
        g.nr++;
        this.efterTrin(t);
        this.visHaefte();
        this.visKort();
        this.trinLoest(maade, svarHTML, ros);
        this.startTrin();
    };

    /* Det, der sker, naar en bid er klaret */
    F.efterTrin = function (t) {
        var mig = this, g = this.opg, R = g.R, token = this.token;
        if (t === "ox") {
            /* Farvekortet faar manganens oxidationstal */
            [R.red.v, R.red.h].forEach(function (i) {
                var st = R.led[i].st;
                if (st.el.Mn) mig.kendtOx[st.f] = st.ox.Mn;
            });
            this.visFarvekort();
        }
        if (t === "produkt") this.visFarvekort();
        if (t === "gange") {
            /* Gangetallene flyver op foran formlerne, og elektronerne flytter i luppen */
            this.bord.lupVis(this.lupData());
            this.bord.lupFlyt();
            var tilbage = 2;
            var faerdig = function () {
                if (token !== mig.token) return;
                tilbage--;
                if (!tilbage) { g.koefFaerdig = true; mig.visHaefte(); }
            };
            setTimeout(function () {
                if (token !== mig.token) return;
                mig.haefte.flyv("ox", [R.ox.v, R.ox.h], String(R.ox.gange), faerdig);
                mig.haefte.flyv("red", [R.red.v, R.red.h], String(R.red.gange), faerdig);
            }, NK.Haefte.FLYV_MS ? 60 : 0);
        }
    };

    /* Det, der sker, naar en ny bid begynder */
    F.startTrin = function () {
        var t = this.faerdig ? null : this.aktivt();
        if (t === "klammer") this.haefte.tegnKlammerFrem();
        if (t === "gange") this.bord.lupVis(this.lupData());
    };

    F.slutLinje = function () {
        var R = this.opg.R;
        return NK.html("O passer også: " + (R.slut.v.O || 0) + " = " + (R.slut.h.O || 0) + ". " + R.red.E + " faldt " + R.red.delta +
            " trin, og der flyttede " + R.elektroner + " elektroner.");
    };

    F.efterOpgave = function () {
        this.visHaefte();
        this.visFarvekort();
    };

    /* ----- Hjaelpen: Giv hint og Vis svaret ----------------------------------------------------
       Kemichael siger én kort saetning i almindelige ord. Den grundige
       forklaring ligger bag knappen Laes mere (js/forklaring.js), saa en
       svag elev ikke faar hele regnestykket i boblen (brugerens oenske
       26. sept. 2026). */
    var LAES_MERE = ' <button class="laes-mere" type="button">Læs mere</button>';

    F.trinInfo = function () {
        var mig = this, g = this.opg, R = g.R, t = this.aktivt();
        if (!t) return null;
        var OX = R.ox, RED = R.red, hint;
        switch (t) {
        case "dryp":
            var fl = D.FLASKE[D.FLASKER[this.cfg.navn][this.flaskeNr()]];
            return { hint: NK.html("Tag flasken med " + fl.tekst + ", og slip den over urglasset."),
                     svar: function () { mig.dryp(); }, svarNavn: "Dryp for mig", gratis: true };
        case "produkt":
            hint = "Se på farven i glasset. Find den samme farve på farvekortet.";
            break;
        case "ox":
            var forste = this.noegler("ox").filter(function (k) { return !g.tal[k]; })[0];
            var st = R.led[+forste.slice(2)].st, E = this.ledK(+forste.slice(2)).E;
            if (st.slags === "grundstof") hint = st.tekst + " er et grundstof. Så er tallet 0.";
            else if (st.slags === "ion") hint = st.tekst + " er en ion af ét atom. Tallet er ionens ladning.";
            else hint = "Se på " + st.tekst + ". Alle tallene skal give " + (st.q ? "ionens ladning, " + X.lad(st.q) : "0") + ". Hvad skal " + E + " så være?";
            break;
        case "for":
            var K = OX.pv > 1 || OX.ph > 1 ? OX : RED;
            hint = "Tæl " + K.E + " på hver side af pilen. Der skal være lige mange.";
            break;
        case "klammer":
            var Kk = g.tal["kl-ox"] ? RED : OX;
            hint = Kk.E + " går fra " + X.ox(Kk.fra) + " til " + X.ox(Kk.til) + ". Går det op eller ned, og hvor mange trin?";
            break;
        case "gange":
            hint = "Find det mindste tal, som både " + OX.tot + " og " + RED.tot + " går op i.";
            break;
        case "ladning":
            hint = "Gang hver ladning med tallet foran, og læg sammen.";
            break;
        case "ion":
            hint = R.ionSt.q > 0 ? "H⁺ er positive. Sæt dem på den side, hvor ladningen er lavest." :
                "OH⁻ er negative. Sæt dem på den side, hvor ladningen er højest.";
            break;
        case "brint":
            hint = "Tæl H i hver formel, og gang med tallet foran. Husk H i " + R.ionSt.tekst + ".";
            break;
        case "vand":
            hint = "Hvert H₂O har 2 H. Sæt vand på den side, der har færrest H.";
            break;
        }
        return { hint: NK.html(hint) + LAES_MERE, svar: t === "produkt" ?
            function () { mig.valgt(R.led[RED.h].st.f, "svar"); } : function () { mig.visSvar(t); } };
    };

    /* Efter et hint: Laes mere viser opstillingen uden facit */
    F.efterHint = function () {
        this.forklaringNu = { trin: this.aktivt(), medSvar: false };
    };

    /* Vis svaret: resten af bidden udfyldes med brunt blaek, og Kemichael siger
       kort, hvad der kom ud. Laes mere regner det hele ud. */
    F.visSvar = function (t) {
        var mig = this, g = this.opg, R = g.R, OX = R.ox, RED = R.red, kort = "";
        function vis(k, v) { if (!g.tal[k]) g.tal[k] = { v: v, slags: "vist" }; }
        function side(s) { return s === "v" ? "før pilen" : "efter pilen"; }
        switch (t) {
        case "ox":
            this.noegler("ox").forEach(function (k) {
                var i = +k.slice(2);
                vis(k, R.led[i].st.ox[mig.ledK(i).E]);
            });
            kort = "Her er tallene. " + OX.E + " går fra " + X.ox(OX.fra) + " til " + X.ox(OX.til) + ", og " +
                RED.E + " går fra " + X.ox(RED.fra) + " til " + X.ox(RED.til) + ".";
            break;
        case "for":
            this.noegler("for").forEach(function (k) {
                var i = +k.slice(3), K = mig.ledK(i), v = i === K.v ? K.pv : K.ph;
                vis(k, v);
                kort = "Der skal " + v + " foran " + R.led[i].st.tekst + ".";
            });
            break;
        case "klammer":
            [OX, RED].forEach(function (K) { g.pil[K.type] = K.op; vis("kl-" + K.type, K.tot); });
            kort = OX.E + " stiger " + OX.tot + ", og " + RED.E + " falder " + RED.tot + ".";
            break;
        case "gange":
            vis("g-ox", OX.gange);
            vis("g-red", RED.gange);
            kort = OX.gange + " og " + RED.gange + ". Så flytter der " + R.elektroner + " elektroner.";
            break;
        case "ladning":
            vis("lad-v", R.ladning.v);
            vis("lad-h", R.ladning.h);
            kort = "Ladningen er " + X.lad(R.ladning.v) + " før pilen og " + X.lad(R.ladning.h) + " efter.";
            break;
        case "ion":
            vis("ion-" + R.ion.side, R.ion.antal);
            kort = R.ion.antal + " " + R.ionSt.tekst + " " + side(R.ion.side) + ".";
            break;
        case "brint":
            vis("brint-v", R.foer.v.H || 0);
            vis("brint-h", R.foer.h.H || 0);
            kort = (R.foer.v.H || 0) + " H før pilen og " + (R.foer.h.H || 0) + " efter.";
            break;
        case "vand":
            vis("vand-" + R.vand.side, R.vand.antal);
            kort = R.vand.antal + " H₂O " + side(R.vand.side) + ".";
            break;
        }
        this.forklaringNu = { trin: t, medSvar: true };
        this.loesTrin("svar", "", NK.html(kort) + LAES_MERE);
    };

    /* Laes mere: Kemichaels forklaring i fuld skaerm */
    F.visForklaring = function () {
        var f = this.forklaringNu;
        if (!f || !this.opg) return;
        var d = this.opg.def;
        var fk = NK.Forklaring.lav(this.opg.R, f.trin, f.medSvar, { glas: GLAS_ORD[d.efter], kontekst: d.kontekst });
        NK.saetTekst("fx-titel", fk.titel);
        NK.saetTekst("fx-skema", fk.skema);
        NK.el("fx-indhold").innerHTML = fk.html;
        NK.el("forklaring").classList.add("vis");
    };

    /* ----- Fokus og taster --------------------------------------------------------------------- */
    F.fokusFelt = function () {
        var g = this.opg, t = this.aktivt();
        if (!t) return;
        var a = document.activeElement;
        var k = this.noegler(t).filter(function (x) { return !g.tal[x]; });
        if (a && a.getAttribute && k.indexOf(a.getAttribute("data-noegle")) >= 0) return;
        if (k.length) this.haefte.fokus(k[0]);
    };

    F.enter = function () {
        if (this.faerdig) { this.knap(); return; }
        if (this.aktivt() === "dryp") { this.dryp(); return; }
        this.tjekTrin();
    };

    /* ----- Scenen ---------------------------------------------------------------------------- */
    F.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var m = Math.round(NK.klamp(H * 0.016, 6, 14));
        var tilraadig = baand.y - m;
        var bordH = Math.round(NK.klamp(tilraadig * 0.36, 150, 236));
        this.bord.layout(0, m, W, bordH);
        var kant = Math.round(NK.klamp(W * 0.025, 10, 28));
        var hb = Math.min(W - 2 * kant, 1180);
        var hx = Math.round((W - hb) / 2), hy = m + bordH + 2;
        var hh = Math.round(baand.y - hy - NK.klamp(H * 0.018, 6, 14));
        var e = this.haefte.el;
        e.style.left = hx + "px";
        e.style.top = hy + "px";
        e.style.width = Math.round(hb) + "px";
        e.style.height = hh + "px";
        this.haefte.tilpas(hb, hh);
        this.lay = { W: W, H: H, baand: baand };
        var bl = this.bord.lay, g0 = bl.glas[0], g1 = bl.glas[bl.glas.length - 1];
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
        this.saetAnker("bord", bl.flaske.x - 40, bl.y, g1.cx + g1.b * 0.7 - (bl.flaske.x - 40), bordH);
        this.saetAnker("lup", bl.lup.cx - bl.lup.r - 6, bl.lup.cy - bl.lup.r - 6, bl.lup.r * 2 + 40, bl.lup.r * 2 + 50);
        void g0;
    };

    F.opdaterScene = function (dt) { this.bord.opdater(dt); };

    F.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.bord.lay) return;
        var bag = this.bord.lay.bagkant;
        NK.Tegn.vaeg(ctx, lay.W, bag);
        NK.Tegn.bord(ctx, lay.W, bag, lay.baand.y);
        this.bord.tegn(ctx);
        this.k.tegn(ctx);
        this.bord.tegnFlaske(ctx);
    };

    /* ----- Klasserne til de to faner ------------------------------------------------------------ */
    function lav(navn, valg) {
        function Sim() { this.init(); }
        var P = Sim.prototype;
        P.cfg = { navn: navn };
        NK.Fane.paa(P, { navn: navn, naesteFane: valg.naesteFane, naesteNavn: valg.naesteNavn });
        Object.keys(F).forEach(function (k) { P[k] = F[k]; });
        return Sim;
    }

    NK.SimUrglas = lav("ug", { naesteFane: "fane-fl", naesteNavn: "Flere reaktioner" });
    NK.SimFlere = lav("fl", {});
}());
