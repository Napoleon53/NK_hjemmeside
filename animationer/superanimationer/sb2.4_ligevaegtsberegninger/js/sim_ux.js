/* =====================================================================
   sim_ux.js - fane 2: Uden x (runde 3, 21. nov. 2026)

   Niels: "i fane 2 bliver man bombarderet med informationer.. og det er
   svært at læse hvad det er man skal når man pludselig bliver bedt om at
   bestemme alle koncentrationer ved ligevægt.. Der står bare 'c'.. så hvad
   er det for en koncentration?" (REGELSAET 5a, 36, 41, 43)

   Fanen er nu trinvis som fane 1: Reaktionsskemaet staar med stort over
   kortet, kortet stiller ét spoergsmaal ad gangen, og svaret gives paa
   kortet (tre svarknapper eller et talfelt). Tavlen er et lyst papir med
   opgavens tal oeverst og én linje pr. trin. Linjen, kortet spoerger om,
   har "?" og gul ramme; de kommende linjer er der ikke endnu.

   K ud fra stofmaengder (type kc):
     1. ligevaegtsloven (tre broeker)
     2. koncentrationen af hvert stof for sig: "Hvad er koncentrationen af
        NOCl ved ligevaegt, [NOCl]?" med feltet "[NOCl] = __ M" paa kortet
     3. regnestykket med tallene sat ind (tre)
     4. K's tal (felt)
     5. K's enhed (tre)
   En ukendt koncentration (type ukendt):
     1. ligevaegtsloven
     2. ligningen med K og de kendte tal sat ind (tre)
     3. den ukendte koncentration (felt, CAS)

   Trinene laves af opgavens data (lavTrin), saa tallene altid passer med
   modellen i js/model.js. Fane 3 bruger stadig js/regn.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var H = NK.RegnHjaelp;

    function el(tag, klasse, html) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    function liste(ord) {
        if (ord.length < 2) return ord.join("");
        return ord.slice(0, -1).join(", ") + " og " + ord[ord.length - 1];
    }

    /* Reaktionsskemaet uden tilstandsformer: 2NOCl ⇌ 2NO + Cl₂ */
    function kort(o) { return M.skemaTekst(o).replace(/\((g|l|s|aq)\)/g, ""); }

    /* Et led i ligevaegtsloven: symbolet [NO]² eller tallet (0,0400 M)² */
    function led(l, tal) {
        var e = l.e > 1 ? NK.haevet(l.e) : "";
        if (tal === undefined) return M.kon(l.s) + e;
        if (typeof tal === "string") return tal + e;
        return (e ? "(" + NK.tal(tal) + " M)" : NK.tal(tal) + " M") + e;
    }

    function del(leds, fn, plus) {
        if (!leds.length) return "1";
        return leds.map(fn).join(plus ? " + " : " · ");
    }

    /* En broek som HTML og som tekst (til hint) */
    function broek(t, n) { return { html: H.broek(NK.html(t), NK.html(n)), tekst: t + " / " + (/[·+]/.test(n) ? "(" + n + ")" : n) }; }

    /* De tre broeker til et valg: den rigtige, en uden eksponenter (eller med
       plus i taelleren, naar ingen har eksponent) og den vendte */
    function treBroeker(lov, fn) {
        var num = lov.num, den = lov.den;
        var ret = broek(del(num, fn), del(den, fn));
        var eks = num.concat(den).some(function (l) { return l.e > 1; });
        var b;
        if (eks) {
            var fn1 = function (l) { return fn({ s: l.s, e: 1 }); };
            b = { b: broek(del(num, fn1), del(den, fn1)), nej: "Koefficienterne bliver til eksponenter i ligevægtsloven." };
        } else {
            b = { b: broek(num.length > 1 ? "(" + del(num, fn, true) + ")" : del(num, fn), del(den, fn)),
                nej: "Koncentrationerne i tælleren ganges med hinanden. De lægges ikke sammen." };
            if (num.length < 2) b = { b: broek(del(num, fn), den.length > 1 ? del(den, fn, true) : del(den, fn) + " · 2"),
                nej: "Koncentrationerne i nævneren ganges med hinanden. De lægges ikke sammen." };
        }
        var c = { b: broek(del(den, fn), del(num, fn)), nej: "Brøken er vendt om. Produkterne står i tælleren og reaktanterne i nævneren." };
        return [{ b: ret, ok: true }, b, c];
    }

    function enhedNavn(e) { return e || "ingen enhed"; }

    /* ----- Trinene for en opgave -------------------------------------------------------- */
    function lavTrin(o) {
        var lov = M.lovFacit(o), trin = [], k = kort(o);
        var symb = function (l) { return led(l); };
        var lovB = treBroeker(lov, symb);
        var lovTekst = "K = " + lovB[0].b.tekst;
        trin.push({ type: "valg", spm: "Hvilken brøk er ligevægtsloven for " + k + "?",
            svar: lovB.map(function (v) { return { html: "K = " + v.b.html, ok: v.ok, nej: v.nej }; }),
            hint: ["Produkterne står i tælleren og reaktanterne i nævneren.", "Koefficienterne bliver til eksponenter, og koncentrationerne ganges.", lovTekst + "."],
            slut: "Produkterne står i tælleren og reaktanterne i nævneren, og koefficienterne er eksponenter.",
            linje: { navn: "Ligevægtsloven", html: "K = " + lovB[0].b.html } });

        if (o.type === "kc") {
            var c = M.cAfN(o);
            Object.keys(o.n).forEach(function (s) {
                var n = o.n[s], V = o.V, kon = M.kon(s), regn = kon + " = n(" + M.skriv(s) + ") / V = " + NK.tal(n) + " mol / " + NK.tal(V) + " L";
                trin.push({ type: "tal", spm: "Hvad er koncentrationen af " + M.skriv(s) + " ved ligevægt, " + kon + "?",
                    pre: kon + " =", enhed: "M", facit: c[s], navn: "Koncentrationen af " + M.skriv(s),
                    fejl: function (v) {
                        if (M.ens(v, n * V, 0.02)) return "Der skal divideres med rumfanget, ikke ganges.";
                        if (M.ens(v, V / n, 0.02)) return "Brøken er vendt. Stofmængden står over brøkstregen.";
                        if (M.ens(v, n, 0.02)) return "Tallet er stofmængden i mol. Divider med rumfanget.";
                        return "Regn " + NK.tal(n) + " mol / " + NK.tal(V) + " L på lommeregneren.";
                    },
                    hint: ["Koncentrationen er stofmængden divideret med rumfanget.", regn + ".", kon + " = " + NK.tal(c[s]) + " M."],
                    slut: regn + " = " + NK.tal(c[s]) + " M.",
                    linje: { navn: "Koncentrationen af " + M.skriv(s) + " ved ligevægt", html: NK.html(regn) + " = ", svar: NK.html(NK.tal(c[s]) + " M") } });
            });
            var tal = function (l) { return led(l, c[l.s]); };
            var indB = treBroeker(lov, tal);
            trin.push({ type: "valg", spm: "Hvilket regnestykke giver K, når koncentrationerne sættes ind i ligevægtsloven?",
                svar: indB.map(function (v) { return { html: "K = " + v.b.html, ok: v.ok, nej: v.nej }; }),
                hint: ["Sæt hver koncentration ind på stoffets plads i ligevægtsloven.", "Husk eksponenterne fra ligevægtsloven.", "K = " + indB[0].b.tekst + "."],
                slut: "Koncentrationerne står på stoffernes pladser, og eksponenterne er de samme som i ligevægtsloven.",
                linje: { navn: "Koncentrationerne sat ind", html: "K = " + indB[0].b.html } });
            var K = M.kAf(o, c), Kvend = 1 / K;
            var Kuden = M.kAf(o, c) ? (function () {
                var t = 1, n = 1;
                lov.num.forEach(function (l) { t *= c[l.s]; });
                lov.den.forEach(function (l) { n *= c[l.s]; });
                return t / n;
            }()) : NaN;
            trin.push({ type: "tal", spm: "Hvad giver regnestykket for K?", pre: "K =", enhed: "", facit: K, navn: "K",
                fejl: function (v) {
                    if (M.ens(v, Kvend, 0.02)) return "Du har regnet den omvendte brøk. Produkterne står i tælleren.";
                    if (M.ens(v, Kuden, 0.02) && !M.ens(Kuden, K, 0.02)) return "Husk eksponenterne. Fx skal (" + NK.tal(c[lov.num[0].s]) + " M)² regnes som tallet i anden.";
                    return "Regn brøken på tavlen på lommeregneren. Svar med tre betydende cifre.";
                },
                hint: ["Regn brøken på tavlen på lommeregneren.", "Regn tælleren og nævneren hver for sig, og divider.", "K = " + NK.tal(K) + "."],
                slut: "K = " + NK.tal(K) + ". Nu mangler enheden.",
                linje: { navn: "K regnet ud", html: "K = ", svar: NK.html(NK.tal(K)) } });
            var enh = M.kEnhed(o), dn = M.deltaN(o);
            var modsat = dn === 0 ? "M" : M.enhedTekst(-dn);
            var tredje = dn === 0 ? "M⁻¹" : (dn === 1 || dn === -1 ? "ingen enhed" : (Math.abs(dn) === 2 ? M.enhedTekst(dn > 0 ? 1 : -1) : "M"));
            var p = 0, r = 0;
            lov.num.forEach(function (l) { p += l.e; });
            lov.den.forEach(function (l) { r += l.e; });
            var forkl = "Tælleren giver M" + (p > 1 ? NK.haevet(p) : "") + ", og nævneren giver M" + (r > 1 ? NK.haevet(r) : "") +
                ". Enheden er M opløftet i " + p + " − " + r + " = " + dn + (dn === 0 ? ", altså ingen enhed." : ".");
            trin.push({ type: "valg", spm: "Hvilken enhed har K for " + k + "?",
                svar: [{ html: NK.html(enhedNavn(enh)), ok: true }, { html: NK.html(enhedNavn(modsat)), nej: forkl }, { html: NK.html(tredje), nej: forkl }],
                hint: ["Sæt enheden M ind for hver koncentration i brøken.", "Tælleren giver M" + (p > 1 ? NK.haevet(p) : "") + ", og nævneren giver M" + (r > 1 ? NK.haevet(r) : "") + ".",
                    "Enheden er " + enhedNavn(enh) + "."],
                slut: forkl,
                linje: { navn: "Svaret med enhed", html: "K = ", svar: NK.html(M.kTekst(o, K)) } });
        } else {
            var u = o.ukendt, kendt = o.kendt;
            var medU = function (l) { return l.s === u ? led(l) : led(l, kendt[l.s]); };
            var lB = treBroeker(lov, medU);
            var Kt = M.kTekst(o);
            trin.push({ type: "valg", spm: "Ved ligevægt er Y lig med K. Hvilken ligning gælder, når de kendte tal sættes ind?",
                svar: lB.map(function (v) { return { html: NK.html(Kt) + " = " + v.b.html, ok: v.ok, nej: v.nej }; }),
                hint: ["Sæt K ind på venstre side og de kendte koncentrationer på deres pladser.", M.kon(u) + " bliver stående som den ubekendte.", Kt + " = " + lB[0].b.tekst + "."],
                slut: "Ligningen har " + M.kon(u) + " som den eneste ubekendte.",
                linje: { navn: "De kendte tal sat ind", html: NK.html(Kt) + " = " + lB[0].b.html } });
            var rod = M.loesUkendt(o).filter(function (v) { return v > 0; })[0];
            trin.push({ type: "tal", spm: "Hvad er koncentrationen af " + M.skriv(u) + " ved ligevægt, " + M.kon(u) + "?",
                pre: M.kon(u) + " =", enhed: "M", facit: rod, navn: "Koncentrationen af " + M.skriv(u),
                fejl: function (v) {
                    if (v < 0) return "En koncentration kan ikke være negativ.";
                    return "Løs ligningen på tavlen med CAS. " + M.kon(u) + " er den eneste ubekendte.";
                },
                hint: ["Ligningen på tavlen har " + M.kon(u) + " som den eneste ubekendte.", "Løs ligningen med CAS. Skriv fx y i stedet for " + M.kon(u) + ".", M.kon(u) + " = " + NK.tal(rod) + " M."],
                slut: M.kon(u) + " = " + NK.tal(rod) + " M.",
                linje: { navn: "Koncentrationen af " + M.skriv(u) + " ved ligevægt", html: NK.html(M.kon(u)) + " = ", svar: NK.html(NK.tal(rod) + " M") } });
        }
        return trin;
    }
    NK.lavTrinUx = lavTrin;

    /* Opgavens tal oeverst paa tavlen (5a: data staar ikke paa kortet) */
    function dataHTML(o) {
        if (o.type === "kc") {
            return NK.html("Lukket beholder på " + NK.tal(o.V) + " L ved " + o.T + ". Ved ligevægt er der " +
                liste(Object.keys(o.n).map(function (s) { return NK.tal(o.n[s]) + " mol " + M.skriv(s); })) + ".") +
                '<span class="bt-maal">' + NK.html("Opgaven er at finde K med enhed.") + "</span>";
        }
        return NK.html("Ved " + o.T + " er K = " + M.kTekst(o) + ". Ved ligevægt er " +
            liste(Object.keys(o.kendt).map(function (s) { return M.kon(s) + " = " + NK.tal(o.kendt[s]) + " M"; })) + ".") +
            '<span class="bt-maal">' + NK.html("Opgaven er at finde " + M.kon(o.ukendt) + ".") + "</span>";
    }

    /* ===================================================================
       Fanen
       =================================================================== */
    function SimUx() {
        this.startFane(D.UX, D.GRUPPER_UX);
        var mig = this;
        window.addEventListener("resize", function () { if (NK.el("fane-ux").classList.contains("aktiv")) mig.tilpas(); });
        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimUx.prototype;
    NK.Fane.paa(P, { navn: "ux", chip: "Opgave", naesteFane: "fane-mx", naesteNavn: "Fra start til ligevægt" });
    P.faneStart = P.startFane;
    P.startFane = function (o, g) { this.paab = {}; this.faneStart(o, g); };
    P.paabegyndt = function (i) { return !!(this.paab && this.paab[i]); };

    P.lavOpgave = function (i) {
        var o = this.o = this.opgaver[i];
        this.trinListe = lavTrin(o);
        this.trinNr = 0;
        this.tValgt = null;
        this.tForkert = {};
        this.feltV = "";
        var e = NK.el("ux-rx"), ny = this.rxId !== o.id;
        this.rxId = o.id;
        e.innerHTML = '<span class="rx-skema">' + NK.html(M.skemaTekst(o)).replace(/\((g|l|s|aq)\)/g, '<span class="rx-ti">($1)</span>') + "</span>" +
            (o.type === "ukendt" ? '<span class="rx-k">' + NK.html("K = " + M.kTekst(o) + " ved " + o.T) + "</span>" : '<span class="rx-k">' + NK.html(o.T) + "</span>");
        if (ny) { e.classList.remove("ny"); void e.offsetWidth; e.classList.add("ny"); }
        this.bygTavle();
    };

    P.trin = function () { return this.faerdig ? this.trinListe[this.trinListe.length - 1] : this.trinListe[this.trinNr]; };
    P.trinNu = function () { return this.faerdig ? null : this.trinListe[this.trinNr]; };

    /* ----- Kortet ----------------------------------------------------------------------- */
    P.kortData = function () {
        var t = this.trin(), mig = this, n = this.trinListe.length;
        var tb = this.trinBliv || (this.faerdig && this.slut ? { maade: this.slut.maade } : null);
        var d = { chip: "Trin " + (Math.min(this.trinNr, n - 1) + 1) + " af " + n, spm: NK.html(t.spm) };
        if (t.type === "valg") {
            var rot = (this.nr * 2 + this.trinNr) % t.svar.length;
            d.svar = t.svar.map(function (v, j) {
                return { j: j, t: v.html, valgt: !tb && j === mig.tValgt, forkert: !!mig.tForkert[j],
                    rigtig: !!(tb && v.ok && tb.maade !== "svar"), svarVist: !!(tb && v.ok && tb.maade === "svar"), laast: !!tb || !!mig.tForkert[j] };
            });
            d.svar = d.svar.slice(rot).concat(d.svar.slice(0, rot));
        } else {
            d.felt = { pre: NK.html(t.pre), enhed: t.enhed, v: this.feltV, laast: !!tb, navn: t.navn };
        }
        return d;
    };

    P.vaelgKortSvar = function (j) {
        var t = this.trinNu();
        if (!t || t.type !== "valg" || this.trinBliv || this.tForkert[j]) return;
        this.tValgt = j;
        this.paab[this.nr] = true;
        this.visKort();
    };

    P.kanIndsende = function () {
        var t = this.trinNu();
        if (!t) return false;
        return t.type === "valg" ? this.tValgt !== null : !!String(this.feltV || "").trim();
    };

    P.tjek = function () {
        var t = this.trinNu();
        if (!t) return;
        if (t.type === "valg") {
            var j = this.tValgt;
            if (j === null) return;
            if (t.svar[j].ok) { this.trinOk("ok"); return; }
            this.tForkert[j] = true;
            this.tValgt = null;
            this.visKort();
            this.fejlLinje(t.svar[j].nej, "Ikke rigtigt");
            return;
        }
        var v = M.laesTal(this.feltV);
        if (!isFinite(v)) { this.besked(NK.html("Skriv et tal i feltet, fx 0,300."), "gul"); this.feltFejl(); return; }
        if (M.ens(v, t.facit, 0.012)) { this.trinOk("ok"); return; }
        this.fejlLinje(t.fejl(v));
        this.feltFejl();
    };

    P.feltFejl = function () {
        var f = this.el.skort.querySelector("[data-kfelt]");
        if (!f) return;
        f.classList.remove("fejl");
        void f.offsetWidth;
        f.classList.add("fejl");
        f.focus();
    };

    /* Et trin er loest. Det sidste trin loeser opgaven. */
    P.trinOk = function (maade) {
        var t = this.trinNu();
        if (t.type === "valg") this.tValgt = t.svar.map(function (v) { return !!v.ok; }).indexOf(true);
        else if (maade === "svar") this.feltV = NK.tal(t.facit);
        if (this.trinNr === this.trinListe.length - 1) {
            this.loest(maade, NK.html(this.slutTekst()), maade === "svar" ? "Svaret" : "Rigtigt");
            this.bygTavle();
            return;
        }
        this.trinBliv = { maade: maade, tekst: NK.html(t.slut) };
        this.hjaelp = 0;
        this.hintS = null;
        this.pegKnap = false;
        this.besked("", "");
        this.visKort();
        this.bygTavle();
    };

    P.naesteTrin = function () {
        this.trinBliv = null;
        this.trinNr++;
        this.tValgt = null;
        this.tForkert = {};
        this.feltV = "";
        this.hjaelp = 0;
        this.pegKnap = false;
        this.visKort();
        this.naesteLinje("", "");
        this.bygTavle();
        this.fokus();
    };

    P.slutTekst = function () {
        var o = this.o;
        if (o.type === "kc") return "K = " + M.kTekst(o, M.kAf(o, M.cAfN(o))) + " ved " + o.T + ".";
        var rod = M.loesUkendt(o).filter(function (v) { return v > 0; })[0];
        return M.kon(o.ukendt) + " = " + NK.tal(rod) + " M.";
    };

    P.hintTrin = function () {
        var t = this.trinNu();
        return t ? { s: null, trin: t.hint } : null;
    };

    P.visSvar = function () { if (this.trinNu()) this.trinOk("svar"); };

    P.trinLinje = function () {
        var t = this.trinNu();
        if (!t) return "";
        if (t.type === "valg") return "Vælg et svar, og tryk Indsend svar.";
        return "Skriv tallet i feltet på kortet, og tryk Indsend svar.";
    };

    P.enter = function () {
        if (this.faerdig) { if (this.videreTekst()) this.knap(); return; }
        if (this.trinBliv) { this.knap(); return; }
        this.indsendKlik();
    };

    P.nulstil = function () { this.vaelg(this.nr); };

    P.fokusFelt = function () {
        var f = this.el.skort.querySelector("[data-kfelt]:not([disabled])");
        if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    };

    /* ----- Tavlen: opgavens tal og én linje pr. trin (regel 28, 36, 43) ------------------ */
    P.bygTavle = function () {
        var mig = this, w = NK.el("ux-tavle");
        w.innerHTML = "";
        var h = el("div", "bt-data");
        h.appendChild(el("div", "bt-navn", NK.html(this.o.navn)));
        h.appendChild(el("div", "bt-datatekst", dataHTML(this.o)));
        w.appendChild(h);
        this.trinListe.forEach(function (t, j) {
            var tilst = mig.faerdig || j < mig.trinNr || (j === mig.trinNr && mig.trinBliv) ? "kendt" : (j === mig.trinNr ? "spoerg" : "senere");
            if (tilst === "senere") return;
            var l = t.linje;
            var d = el("div", "bt-linje" + (tilst === "spoerg" ? " spoerg" : ""));
            d.appendChild(el("div", "bt-navn", NK.html(l.navn)));
            var regn;
            if (l.svar !== undefined) regn = NK.kc(l.html) + (tilst === "spoerg" ? '<span class="bt-felt">?</span>' : l.svar);
            else regn = tilst === "spoerg" ? '<span class="bt-felt">?</span>' : NK.kc(l.html);
            d.appendChild(el("div", "bt-regn", regn));
            w.appendChild(d);
        });
        this.tilpas();
    };

    /* Tavlen kan vaere der: skriften bliver mindre (ned til 14 px), og
       linjen med "?" rulles frem */
    P.tilpas = function () {
        var arb = NK.el("ux-arbejde"), w = NK.el("ux-tavle");
        if (!arb || !arb.offsetHeight) return;
        var fs = 19;
        w.style.fontSize = fs + "px";
        while (fs > 14 && arb.scrollHeight > arb.clientHeight) { fs -= 0.5; w.style.fontSize = fs + "px"; }
        var sp = w.querySelector(".spoerg") || w.lastElementChild;
        if (sp && arb.scrollHeight > arb.clientHeight + 1) {
            var ra = arb.getBoundingClientRect(), rs = sp.getBoundingClientRect();
            if (rs.bottom > ra.bottom) arb.scrollTop += rs.bottom - ra.bottom + 10;
        } else arb.scrollTop = 0;
    };

    P.opdater = function (dt) { this.opdaterBesked(dt); };

    NK.SimUx = SimUx;
}());
