/* =====================================================================
   sim_hypoteser.js - fane 2: hypoteserne

   Runde T13d (28. nov. 2026, Niels: "Jeg synes du bare lige skal prøve
   dit forslag som i t12"). Intet panel (REGELSAET 2-3): fem opgaver i
   raekken oeverst og kortet under raekken (motoren er
   js/hypotese_opgaver.js). Scenen har tre ting:
     * Skemaet (venstre, oeverst): reaktionsskemaet for hypotesen i
       oeverste raekke og masse, molarmasse og stofmaengde under natron og
       produktet, som i en rapport (REGELSAET 48). Den celle, kortet
       spoerger om, har "?" med gul ramme; de kommende er tomme og
       stiplede (REGELSAET 28, 38). Under afstemningen har tallene foran
       stofferne "?".
     * Beregningen (venstre, nederst): et lyst ark, der vokser linje for
       linje med et navn i ord over hver linje. Stiplet, til den foerste
       linje er fundet.
     * Grafen (hoejre): elevens vejninger fra fane 1 og en stiplet streg
       for hver hypotese, der er regnet. Stiplet plads, til den foerste
       streg kommer (REGELSAET 13).
   I dommen (opgave 5) viser skemaets plads de tre hypoteser med deres
   masser, og efter dommen viser arket, hvad der sker i diglen.
   Har eleven ikke maalt selv, bruges et eksempel, og skemaet siger det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    var NOEGLE_DOM = "nk-sc5.7-dommen";
    var NOEGLE_JOURNAL = "nk-sc5.7-journal";
    NK.dommen = !!NK.hent(NOEGLE_DOM, false);
    NK.journal = NK.hent(NOEGLE_JOURNAL, null) || { fejl: 0, svar: 0, snyd: false, valgt: null };
    NK.gemJournal = function () { NK.gem(NOEGLE_JOURNAL, NK.journal); };

    function lex(v, px) { return v + " " + (Math.round(px * 10) / 10) + "px Lexend, 'Segoe UI', sans-serif"; }
    function html(s) { return NK.html(s); }

    /* Reaktionsskemaet som tekst, uden 1-taller: "2 NaHCO₃ → Na₂O + 2 CO₂ + H₂O" */
    NK.skemaTekst = function (hyp, koef) {
        var h = D.HYP[hyp], ud = "";
        koef = koef || h.koef;
        h.stoffer.forEach(function (id, i) {
            if (i === 1) ud += " → ";
            else if (i > 1) ud += " + ";
            ud += (koef[i] > 1 ? koef[i] + " " : "") + D.STOF[id].formel;
        });
        return ud;
    };

    /* "a, b og c" */
    function opremsning(liste) {
        if (liste.length < 2) return liste.join("");
        return liste.slice(0, -1).join(", ") + " og " + liste[liste.length - 1];
    }

    function SimHypoteser() {
        this.L = new NK.Laerred(NK.el("hyp-laerred"));
        this.e = { skort: NK.el("hyp-skort"), skema: NK.el("hyp-skema"), ark: NK.el("hyp-ark") };
        this.tid = 0;
        this.ny = {};
        this.loest = {};
        this.spm = null;
        this.maal = NK.maaling();
        this.opgaver = new NK.HypOpgaver(this);
        this.opdaterForventet();
        var mig = this;
        this.L.canvas.addEventListener("mousedown", function () { if (!mig.opgaver.erFri()) mig.opgaver.spaer(); });
        this.opgaver.start();
    }

    var P = SimHypoteser.prototype;

    /* ----- Maalingen og hypotesernes streger ---------------------------------------- */
    /* De forventede masser for de hypoteser, der er regnet, med den maaling,
       der bruges nu (fane 1 tegner dem ogsaa paa sin graf) */
    P.opdaterForventet = function () {
        var m = this.maal, O = this.opgaver;
        NK.forventet = {};
        NK.forventetFor = m.mf;
        D.HYP_IDS.forEach(function (h) { if (O.loest(h)) NK.forventet[h] = K.facit(m.mf, h).m_p; });
    };

    /* Fane 1 har en ny maaling, eller eleven kommer tilbage fra fane 1: har
       diglen en anden startmasse, begynder en opgave i gang forfra med de
       nye tal, saa der aldrig staar to forskellige digler paa fanen */
    P.nyMaaling = function () {
        var gl = this.maal, m = NK.maaling();
        this.maal = m;
        this.opdaterForventet();
        var nyMasse = !gl || gl.mf !== m.mf || gl.egen !== m.egen;
        var nySlut = !gl || gl.slut !== m.slut || gl.faerdig !== m.faerdig;
        if (!nyMasse && !nySlut) return;
        var O = this.opgaver, o = O.opgave();
        if (O.erFri()) { this.visScene(); return; }
        /* Ny masse: opgaven forfra med de nye tal. Ny slutmasse: kun dommen */
        if (O.nr >= 0 && (nyMasse || (o && o.dom))) O.aabn(O.nr, false);
        else if (this.o) { this.o.tal.slut = m.slut; this.visScene(); }
    };

    /* Er scenen, der blev gemt foer fri leg, regnet paa en anden masse end nu? */
    P.gammelScene = function (s) { return !!s && !!s.o && !s.o.fri && s.o.tal.mf !== this.maal.mf; };

    /* ----- Opgaven ------------------------------------------------------------------ */
    /* o: opgaven fra D.OPG_HYP eller den fri legs opgave ({ hyp, mf }) */
    P.nyOpgave = function (o, fremme) {
        this.saet(o, o.mf || this.maal.mf);
        this.loest = {};
        if (fremme) {
            var mig = this;
            o.trin.forEach(function (t) { mig.loest[t.type === "regn" || t.type === "valg" ? t.felt : t.type] = "ok"; });
        }
        this.spm = null;
        this.visScene();
    };

    P.saet = function (o, mf) {
        var hyp = o.hyp || null;
        this.o = { def: o, hyp: hyp, dom: !!o.dom, fri: o.id === "fri", tal: { mf: mf, slut: this.maal.slut } };
        this.o.facit = K.facit(mf, hyp);
    };

    /* Det, kortet spoerger om: et felt, "afstem", "dom" eller null */
    P.spoerg = function (felt) {
        this.spm = felt;
        this.visScene();
    };

    /* Et trin er loest: tallet kommer i skemaet og paa arket. Giver forklaringen. */
    P.loes = function (t, maade, sv) {
        var o = this.o;
        if (t.type === "dom") return this.doem(sv ? sv.id : this.rigtigDom(), maade);
        var id = t.type === "afstem" ? "afstem" : t.felt;
        this.loest[id] = maade;
        /* Massen af produktet er fundet: stregen kommer paa grafen */
        if (id === "m_p" && o.hyp && !o.fri) {
            NK.forventet[o.hyp] = o.facit.m_p;
            NK.forventetFor = o.tal.mf;
            this.ny[o.hyp] = 0;
        }
        this.visScene();
        return this.slutTekst(t);
    };

    P.opgaveLoest = function () { this.opdaterForventet(); };

    P.slutTekst = function (t) {
        if (t.type === "dom") return this.domSlut(NK.journal.valgt || this.rigtigDom());
        return this.tekster(t).slut || "";
    };

    P.journalFejl = function () { NK.journal.fejl++; NK.gemJournal(); };
    P.journalSvar = function () { NK.journal.svar++; NK.gemJournal(); };

    P.naesteFane = function () { if (NK.visFane) NK.visFane("fane-fejl"); };
    P.tilFane1 = function () { if (NK.visFane) NK.visFane("fane-forsoeg"); };

    /* En ny masse natron til den fri leg */
    P.nyFriMasse = function () {
        var sidst = this.friMasse;
        var mulige = D.PROEVER.filter(function (x) { return x !== sidst; });
        this.friMasse = NK.tilfaeldig(mulige.length ? mulige : D.PROEVER);
        return this.friMasse;
    };

    /* Fri leg: scenen, som den var, gemmes og hentes igen */
    P.gemTilstand = function () {
        return { o: this.o, loest: Object.assign({}, this.loest), spm: this.spm };
    };
    P.hentTilstand = function (s) {
        this.o = s.o;
        this.loest = Object.assign({}, s.loest);
        this.spm = s.spm;
        this.visScene();
    };

    /* ----- Teksterne ------------------------------------------------------------------ */
    P.stoffer = function () {
        var h = this.o.hyp;
        return h ? D.HYP[h].stoffer.map(function (id) { return D.STOF[id].formel; }) : ["NaHCO₃"];
    };
    P.antalStoffer = function () { return this.o.hyp ? D.HYP[this.o.hyp].stoffer.length : 0; };
    P.skemaTekst = function () { return this.o.hyp ? NK.skemaTekst(this.o.hyp) : ""; };

    P.venstre = function (felt) { return T.venstre(felt, this.o); };
    P.enhed = function (felt) { return felt === "m_p" ? "g" : "mol"; };
    P.svarLinje = function (felt) { return T.venstre(felt, this.o) + " = " + T.facitTekst(felt, this.o); };

    /* Pladsholderne i D.HYP_TEKST */
    P.fyld = function (s) {
        var o = this.o, f = o.facit, h = o.hyp, mig = this;
        if (s === undefined || s === null) return "";
        var v = { mf: K.g2(o.tal.mf), Mn: K.Mtekst("NaHCO3"), n: K.mol(f.n_nat), slut: o.tal.slut ? K.g2(o.tal.slut) : "?" };
        if (h) {
            var H = D.HYP[h], Pid = H.produkt, a = T.atomer(h, H.koef).v;
            v.H = h;
            v.P = D.STOF[Pid].formel;
            v.produkter = opremsning(H.stoffer.slice(1).map(function (id) { return D.STOF[id].navn; }));
            v.naP = D.STOF[Pid].atomer.Na;
            v.gasser = opremsning(H.stoffer.slice(2).map(function (id) { return D.STOF[id].formel; }));
            v.taelling = opremsning(D.GRUNDSTOFFER.map(function (x) { return a[x] + " " + x; }));
            v.kN = H.koef[0];
            v.kP = H.koef[1];
            v.np = K.mol(f.n_p);
            v.mp = K.g(f.m_p);
            v.Mp = K.Mtekst(Pid);
        }
        return String(s).replace(/\{(\w+)\}/g, function (hel, k) { return v[k] !== undefined ? v[k] : (mig.ekstra && mig.ekstra[k] !== undefined ? mig.ekstra[k] : hel); });
    };

    /* Et hint eller en afslutning, der afhaenger af forholdet */
    P.vaelgForhold = function (x) {
        if (!x || typeof x !== "object") return x;
        var h = this.o.hyp, en = h && D.HYP[h].koef[0] === 1 && D.HYP[h].koef[1] === 1;
        if (x.een !== undefined) return en ? x.een : x.ellers;
        if (x.lige !== undefined) return en ? x.lige : x.ulige;
        return x;
    };

    /* { tekst, spm, hint, slut } til trinet t. fase "formel": formlen vaelges */
    P.tekster = function (t, fase) {
        var TK = D.HYP_TEKST, base, mig = this;
        if (t.type === "afstem") base = TK.afstem;
        else if (t.type === "dom") base = this.domKlar() ? TK.dom : TK.dom.ikke;
        else base = TK[t.felt];
        var ud = { tekst: base.tekst || "", spm: base.spm, hint: base.hint || [],
                   slut: this.vaelgForhold(this.o.fri && base.friSlut ? base.friSlut : base.slut) };
        if (fase === "formel" && base.formel) { ud.tekst = base.formel.tekst; ud.spm = base.formel.spm; }
        ud.tekst = this.fyld(ud.tekst);
        ud.spm = this.fyld(ud.spm);
        ud.slut = this.fyld(ud.slut);
        ud.hint = ud.hint.map(function (x) { return mig.fyld(mig.vaelgForhold(x)); });
        return ud;
    };

    /* Svarene, naar n_p er et valg (hypotese A): de forkerte er typiske fejl */
    P.valgSvar = function (t) {
        var f = this.o.facit, n0 = K.r3(f.n_nat), V = D.HYP_TEKST.n_p.valg;
        return [{ t: K.mol(n0) + " mol", nej: this.fyld(V.samme) },
                { t: K.mol(2 * n0) + " mol", nej: this.fyld(V.vendt) },
                { t: K.mol(f.n_p) + " mol", ok: true }];
    };

    /* ----- Dommen --------------------------------------------------------------------- */
    P.domKlar = function () { return !!this.maal.faerdig && this.maal.slut !== null; };

    /* Den hypotese, hvis forventede masse ligger naermest den maalte */
    P.rigtigDom = function () {
        var slut = this.maal.slut, mf = this.maal.mf, bedst = null, afst = Infinity;
        D.HYP_IDS.forEach(function (h) {
            var a = Math.abs(K.facit(mf, h).m_p - slut);
            if (a < afst) { afst = a; bedst = h; }
        });
        return bedst;
    };

    P.domSvar = function () {
        var mig = this, ret = this.rigtigDom(), mf = this.maal.mf;
        return D.HYP_IDS.map(function (h) {
            mig.ekstra = { H: h, mp: K.g(K.facit(mf, h).m_p) };
            var nej = h === ret ? "" : mig.fyldDom(D.HYP_TEKST.dom.nej);
            mig.ekstra = null;
            return { id: h, t: h + ": " + D.STOF[D.HYP[h].produkt].formel, ok: h === ret, nej: nej };
        });
    };

    /* Dommens tekster bruger hypotesens bogstav og masse, ikke opgavens */
    P.fyldDom = function (s) {
        var e = this.ekstra || {};
        return String(s).replace(/\{H\}/g, e.H).replace(/\{mp\}/g, e.mp).replace(/\{slut\}/g, K.g2(this.maal.slut));
    };

    P.doem = function (h, maade) {
        NK.journal.valgt = h;
        NK.gemJournal();
        if (h === D.RIGTIG) {
            NK.dommen = true;
            NK.gem(NOEGLE_DOM, true);
        }
        this.loest.dom = maade;
        this.visScene();
        return this.domSlut(h);
    };

    P.domSlut = function (h) {
        var m = this.maal, s;
        if (h === D.RIGTIG) {
            s = D.DOM.rigtig;
            if (m.sprojt) s += " Pulveret sprøjtede i din digel, så massen er lidt for lav. Den passer alligevel bedst med hypotese B.";
        } else s = D.DOM.sprojt;
        var g = NK.gaet;
        if (g) s += g === h ? " Dit gæt fra forsøget holdt." : " Du gættede på " + D.STOF[D.HYP[g].produkt].formel + ".";
        return s;
    };

    /* ----- Felterne tjekkes ----------------------------------------------------------- */
    P.tjekTal = function (felt, raa) {
        var s = String(raa || "").trim();
        if (!s) return { tom: true, besked: "Skriv tallet i feltet først." };
        var p = T.svar(s);
        if (!p) return { besked: "Skriv kun tallet, fx " + (felt === "m_p" ? "3,24." : "0,0500.") };
        if (!p.enhed) s += " " + this.enhed(felt);
        return T.trin(felt, s, this.o);
    };

    P.tjekAfstem = function (raa) {
        var n = this.antalStoffer(), r = [];
        for (var i = 0; i < n; i++) r.push(raa[i] || "");
        return T.afstem(this.o.hyp, r);
    };

    /* ----- Kortets plads: opgaven med de laengste tal ------------------------------------ */
    P.medOpgave = function (o, fn) {
        var gemt = { o: this.o, loest: this.loest, spm: this.spm, maal: this.maal, visScene: this.visScene };
        this.visScene = function () {};
        this.maal = { mf: 5.45, slut: 3.44, faerdig: true, egen: true, sprojt: false, vejninger: [] };
        this.saet(o, 5.45);
        this.loest = {};
        try { fn(); } finally {
            for (var k in gemt) if (Object.prototype.hasOwnProperty.call(gemt, k)) this[k] = gemt[k];
        }
    };

    /* Typiske fejlbeskeder til et trin (til kortets plads) */
    P.fejlProever = function (t, fok) {
        if (t.type === "afstem") {
            return [D.AFSTEM.tom, D.AFSTEM.forkort, D.AFSTEM.nul, "Skriv hele tal foran stofferne.", "Der er 12 Na til venstre og 10 til højre."];
        }
        if (t.type !== "regn" || !fok) return [];
        var k = T.kandidater(t.felt, this.o);
        return k.fejl.map(function (x) { return x[1]; }).concat([
            "Tallet er rigtigt, men mol er ikke enheden. Regn enhederne: mol · g/mol = g.",
            "Tjek kommaet. Tallet er for stort.", "Det tal passer ikke. Tryk på Giv et hint, hvis du sidder fast.",
            "Skriv kun tallet, fx 0,0500.", "Skriv tallet i feltet først."]);
    };

    P.slutProever = function (t) {
        if (t.type !== "dom") return [this.slutTekst(t)];
        var gl = NK.gaet, ud = [];
        ["A", "B", "C", null].forEach(function (g) { NK.gaet = g; ud.push(this.domSlut("B")); }, this);
        NK.gaet = gl;
        return ud;
    };

    /* ----- Hvad der er fremme (REGELSAET 13) ---------------------------------------------- */
    P.grafSynlig = function () {
        var O = this.opgaver;
        return O.erFri() || Object.keys(NK.forventet || {}).length > 0 || this.o.dom;
    };

    P.fri = function () { return this.opgaver.erFri(); };
    P.nulstil = function () { this.opgaver.forfra(); };
    P.fokus = function () { this.opgaver.fokus(); };
    P.enter = function () { this.opgaver.enter(); };

    /* ----- Skemaet og arket (HTML i scenen) ------------------------------------------------ */
    /* En celle: kendt (opgavens tal), fundet (ok/svar), spoerges om (?) eller kommende (tom) */
    function celle(slags, tekst) {
        if (slags === "spm") return '<span class="hs-celle spm">?</span>';
        if (slags === "tom") return '<span class="hs-celle tom"></span>';
        return '<span class="hs-celle ' + slags + '">' + html(tekst) + "</span>";
    }

    /* Status for en stoerrelse: "kendt", "ok", "svar", "spm" eller "tom" */
    P.status = function (id) {
        if (this.loest[id]) return this.loest[id] === "svar" ? "svar" : "ok";
        if (this.spm === id) return "spm";
        return "tom";
    };

    P.skemaHTML = function () {
        var o = this.o, f = o.facit, mig = this, m = this.maal;
        var hoved = '<div class="hs-hoved"><span class="hs-titel">' + (o.fri ? "Nye tal" : (m.egen ? "Din digel" : "Eksemplets digel")) + "</span>" +
            (!o.fri && !m.egen ? '<span class="hs-note">Tallene er et eksempel. Lav forsøget på fanen Varm og vej for at bruge din egen digel.</span>' : "") + "</div>";
        if (o.dom) return hoved + this.domHTML();
        var h = o.hyp, H = h ? D.HYP[h] : null;
        var stoffer = H ? H.stoffer : ["NaHCO3"];
        /* Natron: stofmaengden er kendt i hypoteserne (fundet i opgave 1) */
        var nNat = o.def.trin.some(function (t) { return t.felt === "n_nat"; }) ? this.status("n_nat") : "kendt";
        var afst = o.fri ? "ok" : this.status("afstem");
        var r = '<table class="hs-tabel"><tr class="hs-reak"><th></th>';
        stoffer.forEach(function (id, i) {
            if (i === 1) r += '<td class="hs-op">→</td>';
            else if (i > 1) r += '<td class="hs-op">+</td>';
            var k = "";
            if (H) {
                if (afst === "spm") k = '<span class="hs-koef spm">?</span> ';
                else if (afst !== "tom" && H.koef[i] > 1) k = '<span class="hs-koef">' + H.koef[i] + "</span> ";
            }
            r += '<td class="hs-stof' + (i > 1 ? " gas" : "") + '">' + k + html(D.STOF[id].formel) + "</td>";
        });
        if (!H) r += '<td class="hs-op">→</td><td class="hs-stof ukendt">?</td>';
        r += "</tr>";
        var raekker = [["Masse", "m (g)", "m"], ["Molarmasse", "M (g/mol)", "M"], ["Stofmængde", "n (mol)", "n"]];
        raekker.forEach(function (rk) {
            r += '<tr><th><span class="hs-ord">' + rk[0] + '</span><span class="hs-sym">' + rk[1] + "</span></th>";
            stoffer.forEach(function (id, i) {
                if (i >= 1) r += "<td></td>";
                var c;
                if (i === 0) {
                    if (rk[2] === "m") c = celle("kendt", K.g2(o.tal.mf));
                    else if (rk[2] === "M") c = celle("kendt", K.Mtekst("NaHCO3"));
                    else c = celle(nNat === "kendt" ? "kendt" : nNat, K.mol(f.n_nat));
                } else if (i === 1) {
                    if (rk[2] === "M") c = celle("kendt", K.Mtekst(id));
                    else if (rk[2] === "n") c = celle(mig.status("n_p"), K.mol(f.n_p));
                    else c = celle(mig.status("m_p"), K.g(f.m_p));
                } else c = '<span class="hs-streg">–</span>';
                r += '<td class="hs-v' + (i > 1 ? " gas" : "") + '">' + c + "</td>";
            });
            if (!H) r += "<td></td><td></td>";
            r += "</tr>";
        });
        return hoved + r + "</table>";
    };

    /* Dommen: de tre hypoteser med den masse, diglen skal ende paa */
    P.domHTML = function () {
        var m = this.maal, ret = this.loest.dom ? (NK.journal.valgt || this.rigtigDom()) : null;
        var r = '<table class="hs-dom"><tr><th></th><th>Reaktionsskemaet</th><th class="hs-hoejre">Diglen skal veje</th></tr>';
        D.HYP_IDS.forEach(function (h) {
            var mm = NK.forventet && NK.forventet[h] !== undefined ? K.g(NK.forventet[h]) + " g" : "? g";
            r += '<tr class="' + (ret === h ? "rigtig" : (ret ? "dim" : "")) + '"><td><span class="hs-maerke h' + h + '">' + h + "</span></td>" +
                "<td>" + html(NK.skemaTekst(h)) + '</td><td class="hs-hoejre">' + mm + "</td></tr>";
        });
        r += "</table>";
        r += '<p class="hs-maalt">Diglen vejede <b>' + K.g2(m.mf) + " g</b> før opvarmningen og <b>" +
            (m.faerdig && m.slut !== null ? K.g2(m.slut) + " g" : "?") + "</b> til sidst.</p>";
        return r;
    };

    /* Arket med beregningen: én linje pr. fundet stoerrelse */
    P.arkHTML = function () {
        var o = this.o, mig = this;
        if (o.dom) return "";
        var navne = { n_nat: "Stofmængden af natron", n_p: "Stofmængden af " + T.P(o.hyp), m_p: "Massen af " + T.P(o.hyp) };
        var h = "";
        ["n_nat", "n_p", "m_p"].forEach(function (id) {
            if (!mig.loest[id] || (id === "n_nat" && o.hyp && !o.fri)) return;
            h += '<div class="va-linje' + (mig.loest[id] === "svar" ? " svar" : "") + '"><div class="va-navn">' + html(navne[id]) + "</div>" +
                '<div class="va-regn">' + T.regningHTML(id, o) + "</div></div>";
        });
        return h;
    };

    /* Skemaet og arket bygges om, naar noget har aendret sig */
    P.visScene = function () {
        if (!this.o) return;
        var s = this.skemaHTML();
        if (s !== this._skema) { this.e.skema.innerHTML = s; this._skema = s; }
        var a = this.arkHTML(), dom = this.o.dom;
        var tom = !a && !dom;
        var ah = tom ? '<p class="va-tom">Beregningen</p>' : a;
        if (ah !== this._ark) { this.e.ark.innerHTML = ah; this._ark = ah; this.tilpasArk(); }
        this.e.ark.classList.toggle("tom", tom);
        this.e.ark.hidden = !!dom;
    };

    /* Ingen rullebjaelke paa arket (REGELSAET 50): skriften bliver mindre */
    P.tilpasArk = function () {
        var e = this.e.ark;
        if (!this.lay || e.hidden) return;
        var px = this.lay.px;
        e.style.fontSize = px + "px";
        for (var i = 0; i < 12 && e.scrollHeight > e.clientHeight + 1 && px > 13.5; i++) {
            px -= 0.5;
            e.style.fontSize = px + "px";
        }
    };

    /* ----- Kortets plads ------------------------------------------------------------------
       Kortet staar under raekken (top 46 px). Pladsen er det hoejeste, kortet
       kan blive paa fanen, maalt i en usynlig kopi (REGELSAET 4). */
    P.zoneNoegle = function () {
        var e = this.e.skort;
        return e.parentNode.clientWidth + "x" + window.innerHeight + (document.fonts && document.fonts.status === "loaded" ? "f" : "");
    };

    P.kortZone = function () {
        var e = this.e.skort;
        var top = e.offsetTop || 46;
        if (!e.parentNode || !e.parentNode.clientWidth) return top + 150;
        var noegle = this.zoneNoegle();
        if (this.zone && this.zoneN === noegle) return top + this.zone;
        var kopi = e.cloneNode(true);
        kopi.removeAttribute("id");
        Array.prototype.forEach.call(kopi.querySelectorAll("[id]"), function (x) { x.removeAttribute("id"); });
        kopi.hidden = false;
        kopi.style.visibility = "hidden";
        kopi.style.pointerEvents = "none";
        kopi.classList.remove("blink");
        e.parentNode.appendChild(kopi);
        var h = this.opgaver.maalZone(kopi);
        kopi.parentNode.removeChild(kopi);
        this.zone = Math.max(80, Math.ceil(h) + 2);
        this.zoneN = noegle;
        return top + this.zone;
    };

    /* ----- Scenen ------------------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        if (W < 10) return;
        var lay = { W: W, H: H };
        lay.top = this.kortZone() + 10;
        lay.bordY = Math.round(H - NK.klamp(H * 0.03, 8, 16));
        var bund = lay.bordY - 6;
        var maxB = Math.min(W - 24, 1500), x0 = Math.round((W - maxB) / 2);
        var gap = Math.round(NK.klamp(maxB * 0.014, 12, 20));
        /* Grafen til hoejre; under 900 px er der kun plads til skemaet og arket */
        var gb = W < 900 ? 0 : Math.round(NK.klamp(maxB * 0.38, 330, 560));
        var lb = maxB - (gb ? gb + gap : 0);
        var fri = bund - lay.top;
        lay.px = Math.round(NK.klamp(Math.min(lb / 40, fri / 25), 13.5, 18) * 2) / 2;
        var sh = Math.round(lay.px * 13.4);
        lay.skema = { x: x0, y: lay.top, b: lb, h: sh };
        lay.ark = { x: x0, y: lay.top + sh + gap, b: lb, h: Math.max(80, bund - lay.top - sh - gap) };
        lay.graf = gb ? { x: x0 + lb + gap, y: lay.top, b: gb, h: fri } : null;
        this.lay = lay;
        this.saetBoks(this.e.skema, lay.skema);
        this.saetBoks(this.e.ark, lay.ark);
        this.e.skema.style.fontSize = lay.px + "px";
        this.tilpasArk();
        if (lay.graf) this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
        else this.saetAnker("graf", 0, 0, 1, 1);
    };

    P.saetBoks = function (e, r) {
        e.style.left = Math.round(r.x) + "px";
        e.style.top = Math.round(r.y) + "px";
        e.style.width = Math.round(r.b) + "px";
        e.style.height = Math.round(r.h) + "px";
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el("hyp-anker-" + id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(Math.max(1, b)) + "px";
        e.style.height = Math.round(Math.max(1, h)) + "px";
    };

    P.kortSkiftet = function () {};

    /* ----- Opdater ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        var mig = this;
        this.tid += dt;
        if (!this.lay) return;
        /* Skriften Lexend kan komme, efter kortet er maalt: maal igen */
        if (this.zoneN && this.e.skort.parentNode.clientWidth && this.zoneN !== this.zoneNoegle()) this.layout();
        Object.keys(this.ny).forEach(function (h) { mig.ny[h] = Math.min(1, mig.ny[h] + dt * 1.2); });
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.o) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        if (lay.graf) {
            if (this.grafSynlig()) this.tegnGrafArk(ctx, lay.graf);
            else Tg.plads(ctx, lay.graf, "Grafen");
        }
        /* Dommen: arkets plads viser, hvad der sker i diglen, naar dommen er faldet */
        if (this.o.dom) {
            var r = lay.ark;
            if (NK.dommen && this.loest.dom) this.tegnDiglen(ctx, r);
            else Tg.plads(ctx, r, "Det sker i diglen");
        }
    };

    /* Grafen paa et lyst ark: vejningerne og hypotesernes streger */
    P.tegnGrafArk = function (ctx, R) {
        Tg.lystArk(ctx, R);
        var m = this.maal, v = m.vejninger || [];
        var sidst = v.length ? v[v.length - 1].t : 0;
        var linjer = {};
        D.HYP_IDS.forEach(function (h) { if (NK.forventet && NK.forventet[h] !== undefined) linjer[h] = NK.forventet[h]; });
        var pad = 14;
        Tg.massegraf(ctx, { x: R.x + pad, y: R.y + pad, b: R.b - 2 * pad, h: R.h - 2 * pad }, {
            vejninger: v, yMax: Math.ceil(m.mf + 0.3), xMax: Math.max(15, Math.ceil((sidst + 1) / 5) * 5),
            linjer: linjer, dommen: !!NK.dommen, ny: this.ny,
            titel: m.egen ? "Din digel" : "Eksemplets digel" });
    };

    /* Efter dommen: reaktionen som kugler paa et lyst ark */
    P.tegnDiglen = function (ctx, R) {
        Tg.lystArk(ctx, R);
        NK.tekst(ctx, "Det sker i diglen", R.x + 16, R.y + 22, { font: lex("600", 16), linje: "middle", farve: "#1d2433" });
        var b = Math.min(R.b - 32, 640);
        var y = R.y + NK.klamp(R.h * 0.55, 60, R.h - 30);
        Tg.reaktionKugler(ctx, R.x + (R.b - b) / 2, y, b);
    };

    NK.SimHypoteser = SimHypoteser;
}());
