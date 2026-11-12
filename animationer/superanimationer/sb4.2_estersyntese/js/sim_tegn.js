/* =====================================================================
   sim_tegn.js - fane 2: Forudsig esteren

   Ni opgaver (D.OPGAVER) i tre niveauer:
     Let     syren og alkoholen staar som zigzagformler oeverst paa tavlen
     Middel  kun navnene staar oeverst paa tavlen
       trin: tegn   eleven tegner esteren paa tavlen og trykker Indsend
                    svar (knappen viser tegningens molekylformel). Motoren
                    navngiver tegningen, og K.tegneFejl siger, hvad der er
                    galt (byttet om, forkert antal carbonatomer, en syre
                    eller en alkohol i stedet for en ester ...)
             navn   hvad hedder esteren? Tegningen har nu bogens farver
     Svaer   baglaens (opgave B4.5.1): esterens formel staar paa tavlen
       trin: syre, alkohol, navn
             Syredelen bliver groen, naar syren er fundet, og alkoholdelen
             har gul baggrund, mens kortet spoerger om den.

   Tavlen er motorens (som i sb3.3 og sb4.1). Vaerktoejerne:
     C   traek fra et atom tegner en kaede. Et klik paa et C saetter et
         carbonatom paa, og et klik paa et O med én binding saetter et
         carbonatom paa oxygenatomet (saadan bliver en syre til en ester)
     O   traek fra et carbonatom saetter et oxygenatom paa. Et klik paa et C
         goer det til O, og et klik paa et O goer det til C igen
     =O  et klik paa et carbonatom saetter et oxygenatom paa med en
         dobbeltbinding. Bagefter gaar vaerktoejet tilbage til C
   To oxygenatomer maa ikke sidde sammen. En forkert tegning koster ikke
   stjernen (det er at proeve sig frem); et forkert svar paa et spoergsmaal
   goer. Visningen (zigzag eller alle atomer) huskes i nk-sb4.2-stil.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.2-tegn";
    var STIL_NOEGLE = "nk-sb4.2-stil";
    var FONT = "'Segoe UI', sans-serif";

    var GUL_FYLD = "rgba(242, 197, 61, 0.42)";
    var BLAEK = D.FARVE.blaek;
    var FS = D.FARVE.syre.blaek, FA = D.FARVE.alkohol.blaek;

    function SimTegn() {
        var mig = this;
        this.opgaver = D.OPGAVER.map(function (o, i) {
            return { nr: i, id: o.ester, o: o, syre: o.syre, alkohol: o.alkohol, om: o.om, niv: o.niv, baglaens: !!o.baglaens,
                navnValg: o.navnValg, alkoholValg: o.alkoholValg, syreValg: o.syreValg,
                trin: o.baglaens ? ["syre", "alkohol", "navn"] : ["tegn", "navn"] };
        });
        this.vaerktoejEl = NK.el("t-vaerktoej");
        this.braet = new NK.Tegnebraet({
            felt: function () { return mig.felt(); },
            skala: function () { return mig.skala(); },
            regler: {
                kunC: false, dobbelt: false, tripel: false, knaek: true, sletAlt: false, ringe: false,
                maks: function () { return mig.opg ? K.antalC(mig.opg.syre) + K.antalC(mig.opg.alkohol) + 6 : 20; },
                maksTekst: function () { return "Der er ikke plads til flere atomer. Slet et atom med højreklik, eller tryk Fortryd."; },
                forbudt: function (a, el) { return el === "O" && a.el === "O" ? "To oxygenatomer må ikke sidde sammen." : null; }
            },
            aendret: function (hvad) { mig.aendret(hvad); },
            toast: function (t) { if (t && !mig.groen && mig.trin() === "tegn") mig.kortBesked(t, 3.5); }
        });
        var b = this.braet;
        b.klik = function (u) {
            var v = this.vaerktoej;
            if (v === "gruppe:O") {
                if (!u || u.slags !== "atom" || u.atom.el !== "C") { this.toast("Klik på et carbonatom for at sætte =O på."); return; }
                if (this.saetGruppe(u.atom.id, "O")) mig.vaelgVaerktoej("C");
                return;
            }
            if (!u) { this.toast("Klik på et atom, eller træk fra et atom, for at tegne videre."); return; }
            if (u.slags === "binding") { this.toast("Træk fra et atom for at tegne. Dobbeltbindingen til O sætter du med =O."); return; }
            if (u.slags !== "atom") return;
            var a = u.atom, mol = this.mol;
            if (this.grundstof === "O") { mig.skiftO(a); return; }
            if (a.el === "O") {
                if (mol.bindingssum(a.id) >= 2) {
                    this.toast(mol.naboer(a.id).length === 1 ? "Der kan ikke sidde mere på oxygenatomet med dobbeltbindingen." :
                        "Oxygenatomet har allerede to bindinger. Vælg O, og klik på det for at gøre det til C.");
                    return;
                }
            }
            this.nytFra(a.id, "C");
        };
        NK.el("t-fortryd").addEventListener("click", function () { mig.fortryd(); });
        NK.el("t-ryd").addEventListener("click", function () { mig.nulstil(); });
        this.vaerktoejEl.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-vt]") : null;
            if (k) mig.vaelgVaerktoej(k.getAttribute("data-vt"));
            var st = e.target.closest ? e.target.closest("[data-stil]") : null;
            if (st) mig.vaelgStil(st.getAttribute("data-stil"));
        });
        this.stil = NK.hent(STIL_NOEGLE, "zigzag") === "alle" ? "alle" : "zigzag";
        this.braet.stil = this.stil;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        this.bygVaerktoej();
        NK.el("t-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("t-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimTegn.prototype;
    F.paa(P, "t");

    /* ----- Hukommelsen ----------------------------------------------------------- */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var g = gemt[o.id] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.opgaver[i].id] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet --------------------------------------------------------------- */
    P.bygListe = function () {
        var mig = this, html = "";
        [1, 2, 3].forEach(function (niv) {
            html += '<div class="opg-gruppe"><div class="opg-hoved"><span>' + D.NIVEAUER[niv - 1] + (niv === 3 ? " · baglæns" : "") +
                '</span><span class="opg-tal" id="t-gt-' + niv + '"></span></div><div class="opg-chips">';
            mig.opgaver.forEach(function (o, i) {
                if (o.niv !== niv) return;
                var titel = o.baglaens ? "Find syren og alkoholen" : o.syre + " og " + o.alkohol;
                html += '<button type="button" class="opg-chip" data-opg="' + i + '" title="' + NK.html(titel) + '">' +
                    '<span class="oc-f">' + (i + 1) + '</span><i class="oc-m"></i></button>';
            });
            html += "</div></div>";
        });
        NK.el("t-liste").innerHTML = html;
        NK.saetTekst("t-ialt", String(this.opgaver.length));
    };

    P.visListe = function () {
        var mig = this, pr = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
        var chips = NK.el("t-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        this.opgaver.forEach(function (o, i) {
            pr[o.niv][1]++;
            if (mig.status[i].loest) pr[o.niv][0]++;
        });
        [1, 2, 3].forEach(function (niv) { NK.saetTekst("t-gt-" + niv, pr[niv][0] + "/" + pr[niv][1]); });
        NK.saetTekst("t-loest", String(this.antalLoest()));
    };

    /* ----- En opgave ------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.trinNr = 0;
        this.kendt = {};
        this.valgt = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.hintMaerke = 0;
        this.faerdig = false;
        var o = this.opg;
        this.ester = K.byg(o.syre, o.alkohol);
        this.vist = o.baglaens ? K.medH(this.ester.mol) : null;
        this.navne = K.navnValg(o);
        this.syrer = o.baglaens ? K.syreValg(o) : null;
        this.alkoholer = o.baglaens ? K.alkoholValg(o) : null;
        this.reagenser = o.niv === 1 ? [K.medH(K.normaliserSyre(K.stof(o.syre).mol.kopi())), K.normaliserAlkohol(K.stof(o.alkohol).mol.kopi())] : null;
        var b = this.braet;
        b.laast = !!o.baglaens;
        b.hist = [];
        b.frem = [];
        b.atomFarve = b.bindingFarve = null;
        this.saetter = true;
        b.nulstil(true, true);
        this.saetter = false;
        this.vaelgVaerktoej("C", true);
        this.besked("", "");
        this.nulstilHjaelp();
        this.layout();
        this.visKort();
        this.visListe();
    };

    P.trin = function () { return this.opg ? this.opg.trin[this.trinNr] : "tegn"; };

    /* ----- Vaerktoejerne -------------------------------------------------------- */
    P.bygVaerktoej = function () {
        var html = "";
        D.VAERKTOEJ.forEach(function (v) {
            html += '<button type="button" class="vtknap' + (v.el ? " vt-el" : "") + '" data-vt="' + v.id + '" title="' + NK.html(v.titel) + '">' + NK.html(v.tekst) + "</button>";
        });
        NK.saetHTML("t-vt", html);
        html = "";
        D.STIL.forEach(function (s) {
            html += '<button type="button" data-stil="' + s.id + '" title="' + NK.html(s.titel) + '">' + NK.html(s.tekst) + "</button>";
        });
        NK.saetHTML("t-stil", html);
        this.visVaerktoej();
    };

    /* C og O er grundstoffer (vaerktoejet "tegn"), =O og Slet er vaerktoejer */
    P.vaelgVaerktoej = function (id, stille) {
        if (!stille && (this.groen || this.trin() !== "tegn")) { this.kortBlink(); return; }
        var v = D.VAERKTOEJ.filter(function (x) { return x.id === id; })[0];
        if (!v && id !== "slet") v = D.VAERKTOEJ[0];
        this.braet.vaerktoej = v && v.el ? "tegn" : id;
        this.braet.grundstof = v && v.el ? v.el : "C";
        this.visVaerktoej();
    };

    P.visVaerktoej = function () {
        var b = this.braet, nu = b.vaerktoej === "tegn" ? b.grundstof : b.vaerktoej, stil = this.stil;
        Array.prototype.forEach.call(this.vaerktoejEl.querySelectorAll("[data-vt]"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-vt") === nu);
        });
        Array.prototype.forEach.call(this.vaerktoejEl.querySelectorAll("[data-stil]"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-stil") === stil);
        });
        this.vaerktoejEl.classList.toggle("laast", !!this.groen || this.trin() !== "tegn");
    };

    P.vaelgStil = function (stil) {
        if (stil !== "alle") stil = "zigzag";
        this.stil = stil;
        this.braet.stil = stil;
        NK.gem(STIL_NOEGLE, stil);
        this.visVaerktoej();
    };

    /* Et klik med O valgt: carbonatomet bliver til et oxygenatom, og et
       oxygenatom bliver til carbon igen */
    P.skiftO = function (a) {
        var b = this.braet, mol = b.mol;
        if (a.el === "O") {
            if (mol.bindingssum(a.id) === 2 && mol.naboer(a.id).length === 1) { b.toast("Oxygenatomet med dobbeltbindingen fjernes med højreklik."); return; }
            b.skiftGrundstof(a, "C");
            return;
        }
        if (a.el !== "C") { b.toast("Klik på et carbonatom."); return; }
        if (mol.bindingssum(a.id) > 2) { b.toast("Et oxygenatom kan kun have to bindinger. Klik på et C med højst to naboer."); return; }
        if (mol.naboer(a.id).some(function (x) { return mol.atom(x).el === "O"; })) { b.toast("To oxygenatomer må ikke sidde sammen."); return; }
        b.skiftGrundstof(a, "O");
    };

    P.slet = function (u) {
        var b = this.braet;
        if (!u || u.slags !== "atom") { b.toast("Klik på et atom for enden af kæden."); return; }
        if (b.antal() <= 1) { b.toast("Det første atom på tavlen kan ikke slettes. Vælg C for at tegne."); return; }
        if (b.sletAtom(u.atom) && b.antal() <= 1) this.vaelgVaerktoej("C");
    };

    P.fortryd = function () {
        if (this.groen || this.trin() !== "tegn") { this.kortBlink(); return; }
        if (!this.braet.fortryd()) this.kortBesked("Der er ikke mere at fortryde.", 3);
    };

    /* Ryd tavlen (ogsaa tasten R): kun startatomet bliver. Fortryd faar tegningen tilbage. */
    P.nulstil = function () {
        if (this.groen || this.trin() !== "tegn") { this.kortBlink(); return; }
        this.braet.nulstil(true);
        this.vaelgVaerktoej("C");
        this.besked("", "");
    };

    P.aendret = function (hvad) {
        if (this.saetter) return;
        this.visVaerktoej();
        if (hvad === "vaerktoej" || hvad === "valg") return;
        if (this.fast.klasse === "skidt") this.besked("", "");
        this.visIndsend();
    };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.svarListe = function () {
        var tr = this.trin();
        if (tr === "syre") return this.syrer;
        if (tr === "alkohol") return this.alkoholer;
        if (tr === "navn") return this.navne;
        return [];
    };

    P.kortData = function () {
        var mig = this, tr = this.trin(), o = this.opg, chip = "Opgave " + (this.nr + 1) + " · " + D.NIVEAUER[o.niv - 1], tekst;
        if (tr === "tegn")
            return { slags: "opgave", chip: chip, tekst: "Hvordan ser esteren af " + o.syre + " og " + o.alkohol + " ud? Tegn den på tavlen, og tryk Indsend svar." };
        if (tr === "syre") tekst = "Esteren på tavlen er dannet af en carboxylsyre og en alkohol. Hvad hedder carboxylsyren?";
        else if (tr === "alkohol") tekst = "Syredelen er grøn. Hvilken alkohol er esteren dannet af?";
        else tekst = "Esteren er dannet af " + o.syre + " og " + o.alkohol + ". Hvad hedder esteren?";
        return {
            slags: "spm", chip: chip, tekst: tekst,
            svar: this.svarListe().map(function (v, j) { return { t: v.t, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
        };
    };

    P.svarValg = function (j) {
        if (this.trin() === "tegn") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.groen) return false;
        if (this.trin() === "tegn") {
            var mol = this.braet.mol;
            return mol.atomer.length > 1;
        }
        return this.valgt !== null;
    };

    P.indsendTekst = function () {
        if (this.trin() === "tegn") return this.kanSendes() ? "Indsend svar: " + K.formelTekst(K.optael(this.braet.mol)) : "Indsend svar";
        if (this.valgt === null) return "Indsend svar";
        return "Indsend svar: " + this.svarListe()[this.valgt].t;
    };

    P.ingentingTekst = function () {
        if (this.trin() === "tegn") return "Tegn esteren først. Træk fra carbonatomet, så vokser kæden.";
        return "Vælg et svar på kortet først.";
    };

    P.indsend = function () {
        if (this.trin() === "tegn") { this.indsendTegning(false); return; }
        this.bedoem(false);
    };

    P.indsendTegning = function (vist) {
        var fejl = K.tegneFejl(this.opg, this.braet.mol);
        if (fejl) { this.fejlLinje(fejl); return; }
        var b = this.braet;
        b.laast = true;
        b.traek = null;
        b.spoegelse = null;
        this.farvTegning();
        this.kendt.tegn = true;
        this.sejrT = 0;
        this.groen = { spm: true, maade: vist ? "svar" : "selv", knap: "Næste spørgsmål →", tekst: K.tegneForklaring(this.opg),
            naeste: function () { this.naesteTrin(); } };
        this.besked("", "");
        this.visKort();
        this.visVaerktoej();
    };

    /* Den rigtige tegning faar bogens farver: syredelen groen, alkoholdelen orange */
    P.farvTegning = function () {
        var b = this.braet, d = K.esterDele(b.mol), iS = {};
        if (!d) return;
        d.syre.forEach(function (x) { iS[x] = true; });
        b.atomFarve = function (id) { return iS[id] ? FS : FA; };
        b.bindingFarve = function (bd) { return iS[bd.a] || iS[bd.b] ? (iS[bd.a] && iS[bd.b] ? FS : FS) : FA; };
    };

    P.bedoem = function (vist) {
        var tr = this.trin(), liste = this.svarListe(), nr = this.valgt, v = liste[nr];
        if (v.type !== "rigtig") {
            this.forkert[nr] = true;
            this.fejl = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(tr === "syre" ? K.syreFejl(this.opg, v) : (tr === "alkohol" ? K.alkoholFejl(this.opg, v) : K.navnFejl(this.opg, v)));
            return;
        }
        this.valgt = null;
        this.kendt[tr] = true;
        this.sejrT = 0;
        var sidst = this.trinNr === this.opg.trin.length - 1;
        if (sidst) { this.loest(nr, K.navnForklaring(this.opg), vist); return; }
        this.groen = { spm: true, svarNr: nr, maade: vist ? "svar" : "selv", knap: "Næste spørgsmål →",
            tekst: tr === "syre" ? K.syreForklaring(this.opg) : K.alkoholForklaring(this.opg),
            naeste: function () { this.naesteTrin(); } };
        this.besked("", "");
        this.visKort();
    };

    P.loest = function (svarNr, tekst, vist) {
        var s = this.status[this.nr], foerste = !s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        this.faerdig = true;
        var alle = this.antalLoest() === this.opgaver.length;
        if (alle && foerste) tekst += " " + D.FAERDIG.t;
        var naeste = this.naesteUloeste();
        var knap = naeste >= 0 ? "Næste opgave →" : "Videre til Rens esteren →";
        this.groen = { spm: true, svarNr: svarNr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: knap };
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-t").querySelector(".scene"), 140);
        else NK.konfetti(this.el.skort, 36);
    };

    P.naesteTrin = function () {
        this.trinNr++;
        this.valgt = null;
        this.forkert = {};
        this.hintMaerke = 0;
        this.nulstilHjaelp();
        this.layout();
        this.visKort();
        this.visVaerktoej();
    };

    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-s");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    /* ----- Hjaelpen ------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen) return [];
        var tr = this.trin(), o = this.opg;
        if (tr === "tegn") return K.tegneHints(o);
        if (tr === "syre") return ["Syredelen er den del, der har C=O.", "Tæl carbonatomerne i den del med C=O, også carbonatomet i C=O."];
        if (tr === "alkohol") return ["Alkoholdelen er kæden på det enkeltbundne oxygenatom.", "Sæt H på oxygenatomet i stedet for syredelen. Hvilken alkohol er det?"];
        return K.navnHints(o);
    };

    P.efterHint = function (n) { this.hintMaerke = n; };

    P.visSvar = function () {
        this.sv = true;
        if (this.trin() === "tegn") {
            this.saetter = true;
            this.braet.saet(this.ester.mol.kopi(), true);
            this.saetter = false;
            this.indsendTegning(true);
            return;
        }
        var liste = this.svarListe();
        for (var j = 0; j < liste.length; j++) if (liste[j].type === "rigtig") this.valgt = j;
        this.bedoem(true);
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, e = this.vaerktoejEl, tegner = this.opg && !this.opg.baglaens;
        e.style.left = (t.x + 10) + "px";
        e.style.top = (t.y + 8) + "px";
        e.style.width = (t.b - 20) + "px";
        e.hidden = !tegner;
        this.visVaerktoej();
        var top = tegner ? 54 : 0;
        this.saetAnker("tavle", t.x, t.y + top + this.reagensH(), t.b, t.h - top - this.reagensH() - 12);
        this.saetAnker("reagens", t.x + t.b * 0.2, t.y + top, t.b * 0.6, Math.max(1, this.reagensH()));
    };

    /* Hoejden af feltet med syren og alkoholen oeverst paa tavlen */
    P.reagensH = function () {
        if (!this.opg || this.opg.baglaens) return 0;
        var t = this.lay ? this.lay.tavle : { h: 450 };
        return this.opg.niv === 1 ? Math.round(NK.klamp(t.h * 0.3, 80, 140)) : 44;
    };

    /* Der tegnes under vaerktoejslinjen og feltet med syren og alkoholen */
    P.felt = function () {
        var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 700, h: 450 }, top = 50 + this.reagensH();
        return { x: t.x, y: t.y + top, b: t.b, h: t.h - top - (this.kendt && this.kendt.tegn ? 44 : 14) };
    };

    P.skala = function () {
        var f = this.felt();
        return Math.round(NK.klamp(Math.min(f.b / 12, f.h / 5.2), 30, 68));
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    function svgMarkoer(svg, reserve) {
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") 16 16, ' + reserve;
    }
    var KRYDS_STREGER = "M16 3v9M16 20v9M3 16h9M20 16h9";
    var MARKOER_KRYDS = svgMarkoer("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
        "<path d='" + KRYDS_STREGER + "' stroke='#ffffff' stroke-width='7' stroke-linecap='round'/>" +
        "<path d='" + KRYDS_STREGER + "' stroke='#1d2433' stroke-width='3.4' stroke-linecap='round'/>" +
        "<circle cx='16' cy='16' r='3.8' fill='#2a76ac' stroke='#ffffff' stroke-width='1.8'/></svg>", "crosshair");
    var MARKOER_SLET = svgMarkoer("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
        "<path d='M7 7l18 18M25 7L7 25' stroke='#ffffff' stroke-width='8.5' stroke-linecap='round'/>" +
        "<path d='M7 7l18 18M25 7L7 25' stroke='#c8382b' stroke-width='4.4' stroke-linecap='round'/></svg>", "pointer");

    P.tegnerNu = function () { return this.trin() === "tegn" && !this.groen; };

    P.overScene = function (pt) {
        var b = this.braet;
        if (!this.tegnerNu()) return null;
        if (!pt) { b.ud(); return null; }
        b.flyt(pt);
        if (b.vaerktoej === "slet") return MARKOER_SLET;
        var m = b.markoer(pt);
        return m === "crosshair" ? MARKOER_KRYDS : m;
    };

    P.nedScene = function (pt, e) {
        if (!this.tegnerNu()) return false;
        var b = this.braet;
        if (b.vaerktoej === "slet" && !(e && e.button === 2)) { this.slet(b.under(pt)); return false; }
        return b.ned(pt, e);
    };

    P.hoejreScene = function (pt, e) {
        if (!this.tegnerNu()) return;
        this.braet.ned(pt, e);
    };

    P.flytScene = function (pt) { this.braet.flyt(pt); };
    P.opScene = function (pt) { this.braet.op(pt); };

    P.klikScene = function () {
        if (this.spaer()) return;
        if (!this.tegnerNu()) this.kortBlink();
    };

    /* ----- Tegningen ---------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle;
        NK.Tavle.tegn(ctx, lay);
        if (!this.opg) return;
        if (this.opg.baglaens) this.tegnBaglaens(ctx, tv);
        else {
            this.tegnReagenser(ctx, tv);
            this.braet.tegn(ctx, this.braet.laast ? { udenHaandtag: true, linje: Math.max(2.6, this.skala() * 0.055) } : null);
            if (this.kendt.navn) this.tegnNavn(ctx, tv.x + tv.b / 2, tv.y + tv.h - 26);
        }
        this.tegnSejr(ctx, tv);
    };

    /* Syren og alkoholen oeverst paa tavlen: formlerne (Let) eller navnene (Middel) */
    P.tegnReagenser = function (ctx, tv) {
        var h = this.reagensH(), y = tv.y + 54, o = this.opg;
        if (!h) return;
        var nf = { font: "700 16px " + FONT, justering: "center", linje: "middle" };
        if (o.niv !== 1) {
            ctx.save();
            ctx.font = nf.font;
            var t1 = o.syre, t2 = " + ", t3 = o.alkohol, t4 = "  →  ?";
            var w1 = ctx.measureText(t1).width, w2 = ctx.measureText(t2).width, w3 = ctx.measureText(t3).width, w4 = ctx.measureText(t4).width;
            var x = tv.x + tv.b / 2 - (w1 + w2 + w3 + w4) / 2, ym = y + h / 2 - 2;
            NK.rundtRekt(ctx, x - 14, y + 2, w1 + w2 + w3 + w4 + 28, h - 8, 10);
            ctx.fillStyle = "rgba(29, 36, 51, 0.04)";
            ctx.fill();
            ctx.strokeStyle = "rgba(29, 36, 51, 0.16)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, t1, x, ym, { font: nf.font, farve: FS, justering: "left", linje: "middle" });
            NK.tekst(ctx, t2, x + w1, ym, { font: nf.font, farve: BLAEK, justering: "left", linje: "middle" });
            NK.tekst(ctx, t3, x + w1 + w2, ym, { font: nf.font, farve: FA, justering: "left", linje: "middle" });
            NK.tekst(ctx, t4, x + w1 + w2 + w3, ym, { font: nf.font, farve: "#5d6878", justering: "left", linje: "middle" });
            ctx.restore();
            return;
        }
        /* Let: to smaa formler med navnene under og et plus imellem */
        var bred = Math.min(tv.b * 0.8, 620), x0 = tv.x + tv.b / 2 - bred / 2;
        var kh = h - 26, kb = bred * 0.36;
        var k1 = { x: x0, y: y, b: kb, h: kh }, k2 = { x: x0 + bred * 0.47, y: y, b: kb, h: kh };
        var g1 = F.iKasse(this.reagenser[0], k1, { maks: 40, farve: FS, atomFarve: function () { return FS; }, bindingFarve: function () { return FS; } });
        var g2 = F.iKasse(this.reagenser[1], k2, { maks: 40, farve: FA, atomFarve: function () { return FA; }, bindingFarve: function () { return FA; } });
        NK.Struktur.tegnGeo(ctx, g1.geo);
        NK.Struktur.tegnGeo(ctx, g2.geo);
        var ny = y + kh + 10, nf2 = { font: "700 14px " + FONT, justering: "center", linje: "middle" };
        NK.tekst(ctx, o.syre, k1.x + k1.b / 2, ny, { font: nf2.font, farve: FS, justering: "center", linje: "middle" });
        NK.tekst(ctx, o.alkohol, k2.x + k2.b / 2, ny, { font: nf2.font, farve: FA, justering: "center", linje: "middle" });
        NK.tekst(ctx, "+", x0 + bred * 0.415, y + kh / 2, { font: "700 22px " + FONT, farve: BLAEK, justering: "center", linje: "middle" });
        NK.tekst(ctx, "→  ?", x0 + bred * 0.92, y + kh / 2, { font: "700 20px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" });
    };

    /* Svaer: esterens formel midt paa tavlen. Syredelen bliver groen, naar
       syren er fundet. Den del, kortet spoerger om, har gul baggrund */
    P.tegnBaglaens = function (ctx, tv) {
        var mol = this.vist, d = K.esterDele(mol), kendt = this.kendt, tr = this.groen ? null : this.trin();
        var iS = {}, iA = {};
        d.syre.forEach(function (x) { iS[x] = true; });
        d.alkohol.forEach(function (x) { iA[x] = true; });
        function farve(id) {
            if (iS[id] && kendt.syre) return FS;
            if (iA[id] && kendt.alkohol) return FA;
            return null;
        }
        var kasse = { x: tv.x + 30, y: tv.y + 18, b: tv.b - 60, h: tv.h - 110 };
        var g = F.iKasse(mol, kasse, {
            maks: 72, atomFarve: farve,
            bindingFarve: function (bd) {
                if (iS[bd.a] || iS[bd.b]) return kendt.syre ? FS : null;
                return kendt.alkohol ? FA : null;
            }
        });
        var geo = g.geo, s = g.s;
        /* Gul baggrund: alkoholdelen, naar kortet spoerger om den. Hint 1 og 2
           til syren: C=O og saa hele syredelen */
        var gul = null;
        if (tr === "alkohol") gul = d.alkohol;
        else if (tr === "syre" && this.hintMaerke >= 2) gul = d.syre;
        else if (tr === "syre" && this.hintMaerke >= 1) gul = [d.c, d.oD];
        if (gul) this.markerDel(ctx, geo, mol, gul, s);
        NK.Struktur.tegnGeo(ctx, geo);
        /* Under formlen: "fra syren" og "fra alkoholen", som i bogens figur */
        var ny = geo.y1 + 30;
        function midtX(ids) {
            var a = Infinity, b = -Infinity;
            ids.forEach(function (x) { var p = geo.P[x]; if (p) { a = Math.min(a, p.x); b = Math.max(b, p.x); } });
            return (a + b) / 2;
        }
        var lille = { font: "600 14px " + FONT, justering: "center", linje: "middle" };
        var stor = { font: "700 16px " + FONT, justering: "center", linje: "middle" };
        if (kendt.syre) {
            NK.tekst(ctx, "fra syren", midtX(d.syre), ny, { font: stor.font, farve: FS, justering: "center", linje: "middle" });
            NK.tekst(ctx, this.opg.syre, midtX(d.syre), ny + 19, { font: lille.font, farve: FS, justering: "center", linje: "middle" });
        }
        if (kendt.alkohol) {
            NK.tekst(ctx, "fra alkoholen", midtX(d.alkohol), ny, { font: stor.font, farve: FA, justering: "center", linje: "middle" });
            NK.tekst(ctx, this.opg.alkohol, midtX(d.alkohol), ny + 19, { font: lille.font, farve: FA, justering: "center", linje: "middle" });
        }
        if (kendt.navn) this.tegnNavn(ctx, tv.x + tv.b / 2, Math.min(tv.y + tv.h - 22, ny + 48));
    };

    /* Gul baggrund bag en del af molekylet: tykke streger og cirkler */
    P.markerDel = function (ctx, geo, mol, ids, s) {
        var set = {};
        ids.forEach(function (x) { set[x] = true; });
        ctx.save();
        ctx.strokeStyle = GUL_FYLD;
        ctx.fillStyle = GUL_FYLD;
        ctx.lineCap = "round";
        ctx.lineWidth = s * 0.62;
        ctx.beginPath();
        mol.bindinger.forEach(function (bd) {
            if (!set[bd.a] || !set[bd.b]) return;
            var a = geo.P[bd.a], b = geo.P[bd.b];
            if (!a || !b) return;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
        });
        ctx.stroke();
        ids.forEach(function (x) {
            var p = geo.P[x];
            if (!p) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, s * 0.31, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    /* Navnet med alkoholdelen i orange og syredelen i groen */
    P.tegnNavn = function (ctx, x, y) {
        var a = K.alkyl(this.opg.alkohol), o = K.oat(this.opg.syre), font = "800 22px " + FONT;
        ctx.save();
        ctx.font = font;
        var wa = ctx.measureText(a).width, wo = ctx.measureText(o).width, x0 = x - (wa + wo) / 2;
        NK.tekst(ctx, a, x0, y, { font: font, farve: FA, justering: "left", linje: "middle" });
        NK.tekst(ctx, o, x0 + wa, y, { font: font, farve: FS, justering: "left", linje: "middle" });
        ctx.restore();
    };

    NK.SimTegn = SimTegn;
}());
