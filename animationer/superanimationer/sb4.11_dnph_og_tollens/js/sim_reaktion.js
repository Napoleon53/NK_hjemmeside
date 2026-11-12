/* =====================================================================
   sim_reaktion.js - fane 2: Reaktionerne

   Tre opgaver (D.REAKTIONER): DNPH med ethanal og propanon og én
   afstemning med Tollens' reagens. Hver har sine trin, og hvert trin
   bedoemmes ved Indsend svar:

   DNPH (kondensationen):
     vand       eleven klikker paa de tre atomer, der bliver til vand
                (O fra C=O og de to H paa NH₂-gruppen)
     reaktion   knappen Naeste paa kortet saetter reaktionen i gang: vandet
                gaar af, DNPH glider ind, og C=O bliver til C=N
     ekstra     kondensation eller C=N
   Tollens (afstemningen i bogens trin):
     oxFra      oxidationstallet for carbonylgruppens carbonatom
     oxTil      det samme carbonatom i carboxylat-ionen
     ag         antallet af Ag⁺ (stigning og fald)
     oh         ladningen afstemmes med OH⁻
     h2o        hydrogen afstemmes med H₂O; oxygen er et tjek
     ekstra     ammoniakken

   Alle tal regnes af modellen (K.dnphScene og K.tollensSkema i kemi.js).
   Skemaet tegnes som afstemningsfigurerne i C-bogens afsnit 8.4:
   oxidationstal over atomerne, en orange og en blaa pil fra atom til atom
   under skemaet med "↑ 2" og "oxidation" midt under reaktionspilen,
   groenblaa koefficienter og regnestykkerne for ladning, hydrogen og
   oxygen under hver sin side af skemaet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.11-reaktion";
    var FONT = "'Segoe UI', sans-serif";

    var GUL = "#d69e0c", GUL_FYLD = "rgba(242, 197, 61, 0.28)";
    var TEAL = "#0f766e";
    var BLAEK = "#1d2433";
    var AF = D.AFSTEM_FARVE;
    var ANIM = 2.4;                  /* sekunder for reaktionen */

    var TRIN_TOLLENS = ["oxFra", "oxTil", "ag", "oh", "h2o"];
    var maaleCtx = null;

    function SimReaktion() {
        var mig = this;
        this.opgaver = D.REAKTIONER.map(function (r, i) {
            var o = { nr: i, r: r, id: r.id, slags: r.slags, stof: r.stof };
            o.trin = r.slags === "dnph" ? ["vand", "reaktion"] : TRIN_TOLLENS.slice();
            if (r.ekstra) o.trin.push("ekstra");
            return o;
        });
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("r-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("r-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimReaktion.prototype;
    F.paa(P, "r");

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
        var html = "";
        this.opgaver.forEach(function (o, i) {
            var hoved = o.slags === "dnph" ? "DNPH" : "Tollens' reagens";
            html += '<button type="button" class="opg-chip serie" data-opg="' + i + '">' +
                '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" +
                '<span class="serie-navn">' + NK.html(hoved) + " og " + NK.html(o.stof) + "<small>" +
                (o.slags === "dnph" ? "kondensation" : "oxidation og afstemning") + "</small></span></span>" +
                '<i class="oc-m"></i></button>';
        });
        NK.el("r-liste").innerHTML = html;
    };

    P.visListe = function () {
        var knapper = NK.el("r-liste").querySelectorAll("[data-opg]");
        for (var i = 0; i < knapper.length; i++) {
            var s = this.status[i];
            knapper[i].classList.toggle("valgt", i === this.nr);
            knapper[i].classList.toggle("loest", s.loest);
            knapper[i].classList.toggle("stjerne", s.stjerne);
            knapper[i].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("r-loest", String(this.antalLoest()));
    };

    /* ----- En opgave ------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.trinNr = 0;
        this.kendt = {};
        this.valgt = null;
        this.valgtAtomer = [];
        this.overAtom = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.hintMaerke = 0;
        this.animT = null;
        this.faerdig = false;
        if (this.opg.slags === "dnph") {
            this.sc = K.dnphScene(this.opg.stof);
            this.efter = K.dnphEfter(this.sc);
            this.union = this.sc.mol.kopi();
            var u = this.union;
            this.sc.dannes.forEach(function (p) { u.bind(p[0], p[1], p[2]); });
            this.sk = null;
        } else {
            this.sk = K.tollensSkema(this.opg.stof);
            this.aldT = K.tegneMol(this.opg.stof);
            this.sc = null;
        }
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.trin = function () { return this.opg.trin[this.trinNr]; };

    /* Er eleven naaet til trinnet (eller forbi det)? */
    P.naaet = function (navn) {
        var i = this.opg.trin.indexOf(navn);
        return i >= 0 && this.trinNr >= i;
    };

    P.ekstra = function () { return D.EKSTRA[this.opg.r.ekstra]; };

    /* Svarene paa kortet for det trin, eleven staar i */
    P.svarListe = function () {
        var tr = this.trin();
        if (tr === "oxFra" || tr === "oxTil") return D.OXTAL.map(function (v) { return { t: D.rom(v), v: v }; });
        if (tr === "ag" || tr === "oh" || tr === "h2o") return D.KOEF_VALG.map(function (v) { return { t: String(v), v: v }; });
        if (tr === "ekstra") return this.ekstra().svar.map(function (s, j) { return { t: s, v: j }; });
        return [];
    };

    P.rigtigVaerdi = function () {
        var tr = this.trin(), s = this.sk;
        if (tr === "oxFra") return s.cFra;
        if (tr === "oxTil") return s.cTil;
        if (tr === "ag") return s.kAg;
        if (tr === "oh") return s.oh;
        if (tr === "h2o") return s.h2o;
        if (tr === "ekstra") return this.ekstra().rigtig;
        return null;
    };

    P.kortData = function () {
        var mig = this, tr = this.trin(), chip = "Opgave " + (this.nr + 1), st = this.opg.stof, tekst;
        if (tr === "vand")
            return { slags: "opgave", chip: chip, tekst: "Når " + st + " reagerer med DNPH, fraspaltes der vand. Klik på de tre atomer, der bliver til vand, og tryk Indsend svar." };
        if (tr === "reaktion")
            return { slags: "opgave", chip: "Reaktionen", tekst: "Oxygenatomet fra C=O og de to hydrogenatomer fra NH₂-gruppen fraspaltes som vand, og nitrogenatomet binder sig til carbonatomet." };
        var s = this.sk;
        if (tr === "oxFra") tekst = "Hvad er oxidationstallet for carbonatomet i carbonylgruppen i " + st + "? Vælg, og tryk Indsend svar.";
        else if (tr === "oxTil") tekst = D.stor(st) + " oxideres til " + s.produkt + "-ionen. Hvad er oxidationstallet for det samme carbonatom nu?";
        else if (tr === "ag") tekst = "Oxidationstallet for carbonatomet stiger " + s.stigning + ", og for sølv falder det " + s.fald + ". Hvor mange Ag⁺ skal der til pr. " + st + "molekyle?";
        else if (tr === "oh") tekst = "Ladningen afstemmes med OH⁻. Hvor mange OH⁻ skal der stå til venstre i skemaet?";
        else if (tr === "h2o") tekst = "Hydrogen afstemmes med H₂O. Hvor mange H₂O skal der stå til højre i skemaet?";
        else tekst = this.ekstra().spm;
        return {
            slags: "spm", chip: chip, tekst: tekst,
            svar: this.svarListe().map(function (sv, j) { return { t: sv.t, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
        };
    };

    P.svarValg = function (j) {
        if (this.trin() === "vand" || this.trin() === "reaktion") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.skjulIndsend = function () { return this.trin() === "reaktion"; };
    P.skjulHint = function () { return this.trin() === "reaktion"; };

    P.kanSendes = function () {
        if (this.trin() === "vand") return this.valgtAtomer.length > 0;
        return this.valgt !== null;
    };

    /* Det valgte som formel: "O og 2 H" */
    P.valgtTekst = function () {
        var mol = this.sc.mol, t = {};
        this.valgtAtomer.forEach(function (id) { var e = mol.atom(id).el; t[e] = (t[e] || 0) + 1; });
        var dele = Object.keys(t).sort(function (a, b) { return a === "O" ? -1 : (b === "O" ? 1 : (a < b ? -1 : 1)); }).map(function (e) {
            return (t[e] > 1 ? t[e] + " " : "") + (e === "I" ? "NO₂" : e);
        });
        if (dele.length <= 1) return dele.join("");
        return dele.slice(0, -1).join(", ") + " og " + dele[dele.length - 1];
    };

    P.indsendTekst = function () {
        if (this.trin() === "vand") return this.valgtAtomer.length ? "Indsend svar: " + this.valgtTekst() : "Indsend svar";
        if (this.valgt === null) return "Indsend svar";
        return "Indsend svar: " + this.svarListe()[this.valgt].t;
    };

    P.ingentingTekst = function () {
        if (this.trin() === "vand") return "Klik på atomerne på tavlen først.";
        return "Vælg et svar på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var tr = this.trin();
        if (tr === "vand") { this.bedoemVand(vist); return; }
        var liste = this.svarListe(), nr = this.valgt, v = liste[nr].v, rigtig = this.rigtigVaerdi();
        if (v !== rigtig) {
            this.forkert[nr] = true;
            this.fejl = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(this.fejlTekst(tr, v, nr));
            return;
        }
        this.valgt = null;
        this.kendt[tr] = true;
        this.sejrT = 0;
        this.rigtigt(nr, this.forklaring(tr), vist);
    };

    /* Et rigtigt svar: kortet bliver paa spoergsmaalet med forklaringen. Er
       det sidste trin, er opgaven loest */
    P.rigtigt = function (svarNr, tekst, vist) {
        var sidst = this.trinNr === this.opg.trin.length - 1;
        if (!sidst) {
            var knap = this.opg.trin[this.trinNr + 1] === "reaktion" ? "Lad molekylerne reagere →" : "Næste spørgsmål →";
            this.groen = { spm: true, svarNr: svarNr, maade: vist ? "svar" : "selv", tekst: tekst, knap: knap,
                naeste: function () { this.naesteTrin(); } };
            this.besked("", "");
            this.visKort();
            return;
        }
        this.loest(svarNr, tekst, vist);
    };

    P.loest = function (svarNr, tekst, vist) {
        var s = this.status[this.nr], foerste = !s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        this.faerdig = true;
        var alle = this.antalLoest() === this.opgaver.length;
        if (alle && foerste) tekst += " " + D.FAERDIG.r;
        var naeste = this.naesteUloeste();
        var knap = naeste >= 0 ? "Næste opgave →" : "Videre til Ukendte stoffer →";
        if (svarNr === null) this.groen = { chip: "Reaktionen", maade: "selv", tekst: tekst, knap: knap };
        else this.groen = { spm: true, svarNr: svarNr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: knap };
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-r").querySelector(".scene"), 140);
        else NK.konfetti(this.el.skort, 36);
    };

    P.naesteTrin = function () {
        this.trinNr++;
        this.valgt = null;
        this.forkert = {};
        this.hintMaerke = 0;
        this.nulstilHjaelp();
        if (this.trin() === "reaktion") this.animT = 0;
        this.visKort();
    };

    /* Reaktionen er faerdig: naeste spoergsmaal, eller opgaven er loest */
    P.efterReaktion = function () {
        this.kendt.reaktion = true;
        if (this.trinNr === this.opg.trin.length - 1) {
            var f = this.sc.farve === "orange" ? "orange" : "gult";
            this.loest(null, D.stor(this.opg.stof) + " og DNPH er bundet sammen, og der er fraspaltet vand. Produktet er tungtopløseligt og falder ud som et " + f + " bundfald.", false);
            return;
        }
        this.naesteTrin();
    };

    P.bedoemVand = function (vist) {
        var ret = K.vandAtomer(this.sc), valgt = this.valgtAtomer.slice().sort();
        if (JSON.stringify(ret) !== JSON.stringify(valgt)) {
            this.fejl = true;
            this.fejlLinje(K.vandFejl(this.sc, this.valgtAtomer));
            this.valgtAtomer = [];
            this.visKort();
            return;
        }
        this.kendt.vand = true;
        this.sejrT = 0;
        this.rigtigt(undefined, "Oxygenatomet fra C=O og de to hydrogenatomer fra NH₂-gruppen bliver til H₂O. Tryk på Lad molekylerne reagere, og se reaktionen.", vist);
    };

    /* Forklaringerne til det rigtige svar */
    P.forklaring = function (tr) {
        var s = this.sk;
        if (tr === "oxFra") return K.regnestykke(s.ald.mol, s.cA) + ". Oxidationstallet er " + D.rom(s.cFra) + ".";
        if (tr === "oxTil") return K.regnestykke(s.prod.mol, s.cP) + ". Oxidationstallet stiger fra " + D.rom(s.cFra) + " til " + D.rom(s.cTil) + ", så aldehydet er oxideret.";
        if (tr === "ag") return "Oxidationstallet stiger " + s.stigning + " for carbonatomet og falder " + s.fald + " for hvert sølvatom fra Ag⁺ til Ag. Der skal " + s.kAg + " Ag⁺ til, og der dannes " + s.kAg + " Ag.";
        if (tr === "oh") return "Til venstre giver " + s.kAg + " Ag⁺ ladningen " + D.fortegn(s.ladV0) + ". Til højre er ladningen " + D.fortegn(s.ladH) + ". Med " + s.oh + " OH⁻ er ladningen " + D.fortegn(s.ladH) + " på begge sider.";
        if (tr === "h2o") return "Til venstre er der " + s.hAld + " + " + s.oh + " = " + s.hV + " H. Med " + s.h2o + " H₂O er der også " + s.hV + " til højre. Oxygen passer: " + s.oV + " på hver side.";
        if (tr === "ekstra") return this.ekstra().forklaring;
        return "";
    };

    P.fejlTekst = function (tr, v, nr) {
        var s = this.sk;
        if (tr === "oxFra") return K.oxFejl(s.ald.mol, s.cA, v);
        if (tr === "oxTil") return K.oxFejl(s.prod.mol, s.cP, v);
        if (tr === "ag") {
            if (v < s.kAg) return "Oxidationstallet falder kun " + s.fald + " for ét Ag⁺, men stiger " + s.stigning + " for carbonatomet. Der skal flere sølv(I)ioner til.";
            return "Stigningen og faldet skal være lige store: " + s.stigning + " = antallet af Ag⁺ · " + s.fald + ".";
        }
        if (tr === "oh") return "Tæl ladningen: til venstre " + D.fortegn(s.ladV0) + " fra Ag⁺ og −1 for hvert OH⁻. Til højre " + D.fortegn(s.ladH) + ".";
        if (tr === "h2o") return "Til venstre er der " + s.hV + " H. Til højre har " + s.produkt + " " + s.hProd + " H, og hvert H₂O har 2.";
        if (tr === "ekstra") return this.ekstra().forkert[nr] || "Prøv et andet svar.";
        return "";
    };

    /* Kortets knap gaar altid fremad */
    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-u");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    /* ----- Hjaelpen ------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen) return [];
        var tr = this.trin(), s = this.sk;
        if (tr === "vand") return ["Vand er H₂O. Oxygenatomet kommer fra carbonylgruppen, C=O.", "De to hydrogenatomer sidder på NH₂-gruppen for enden af DNPH."];
        if (tr === "oxFra") return ["Se på de fire bindinger fra det markerede carbonatom: til H −1, til O +1 og til C 0.", "En dobbeltbinding til O tæller +2."];
        if (tr === "oxTil") return ["Carbonatomet har nu tre bindinger til oxygen og ingen til H.", "Dobbeltbindingen til O tæller +2 og enkeltbindingen +1."];
        if (tr === "ag") return ["Den samlede stigning skal være lige så stor som det samlede fald."];
        if (tr === "oh") return ["Tæl ladningen på hver side. OH⁻ står til venstre og giver −1 hver.", "Til venstre: " + D.fortegn(s.ladV0) + " fra Ag⁺. Til højre: " + D.fortegn(s.ladH) + ". Hvor mange gange −1 mangler til venstre?"];
        if (tr === "h2o") return ["Tæl H på hver side. Hvert H₂O har 2 H.", "Til venstre: " + s.hV + " H. Til højre: " + s.hProd + " H i " + s.produkt + "."];
        if (tr === "ekstra") return this.ekstra().hint;
        return [];
    };

    P.efterHint = function (n) { this.hintMaerke = n; };

    P.visSvar = function () {
        this.sv = true;
        var tr = this.trin();
        if (tr === "vand") {
            this.valgtAtomer = K.vandAtomer(this.sc);
            this.bedoem(true);
            return;
        }
        var rigtig = this.rigtigVaerdi(), liste = this.svarListe();
        for (var j = 0; j < liste.length; j++) if (liste[j].v === rigtig) this.valgt = j;
        this.bedoem(true);
    };

    /* ----- Klik paa atomerne (trinnet vand) ---------------------------------------- */
    P.atomVed = function (pt) {
        if (!this.geo || !this.sc) return null;
        var mol = this.sc.mol, bedst = null, bd = (this.skala || 40) * 0.42;
        mol.atomer.forEach(function (a) {
            if (a.el !== "O" && a.el !== "H" && a.el !== "N") return;
            var p = this.geo.P[a.id];
            if (!p) return;
            var d = Math.hypot(pt.x - p.x, pt.y - p.y);
            if (d < bd) { bd = d; bedst = a.id; }
        }, this);
        return bedst;
    };

    P.overScene = function (pt) {
        this.overAtom = null;
        if (!pt || this.groen || this.trin() !== "vand") return null;
        this.overAtom = this.atomVed(pt);
        return this.overAtom !== null ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.trin() !== "vand") return;
        var id = this.atomVed(pt);
        if (id === null) return;
        var i = this.valgtAtomer.indexOf(id);
        if (i >= 0) this.valgtAtomer.splice(i, 1);
        else this.valgtAtomer.push(id);
        this.visKort();
    };

    P.nulstil = function () {
        if (this.groen || this.trin() === "reaktion") return;
        this.vaelg(this.nr);
    };

    /* ----- Layout og tegning ------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        this.saetAnker("skema", t.x + 12, t.y + 12, t.b - 24, t.h * 0.62);
    };

    P.opdaterScene = function (dt) {
        if (this.animT !== null && this.trin() === "reaktion") {
            this.animT += dt;
            /* animT nulstilles, foer opgaven gaar videre. Ellers bliver
               reaktionen faerdig igen i hvert billede, naar den er det
               sidste trin (konfetti uden ende og en knap, der ikke svarer) */
            if (this.animT >= ANIM) { this.animT = null; this.efterReaktion(); }
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle;
        NK.Tavle.tegn(ctx, lay);
        if (!this.opg) return;
        if (this.opg.slags === "dnph") this.tegnDnph(ctx, tv);
        else this.tegnTollens(ctx, tv);
        this.tegnSejr(ctx, tv);
    };

    /* ----- DNPH: scenen med de to molekyler ---------------------------------------- */
    P.animE = function () {
        if (this.kendt.reaktion) return 1;
        if (this.animT === null) return 0;
        return NK.blod(this.animT / ANIM);
    };

    /* Atomernes pladser paa tidspunktet e (0 foer, 1 efter). Vandets atomer gaar
       i en bue under DNPH, saa de ikke krydser ringen */
    P.pladser = function (e) {
        var sc = this.sc, ud = {}, vand = {};
        sc.vand.forEach(function (id) { vand[id] = true; });
        Object.keys(sc.start).forEach(function (k) {
            var a = sc.start[k], b = sc.slut[k];
            if (vand[k]) {
                var c = { x: (a.x + b.x) / 2, y: 2.6 };
                var u = 1 - e;
                ud[k] = { x: u * u * a.x + 2 * u * e * c.x + e * e * b.x, y: u * u * a.y + 2 * u * e * c.y + e * e * b.y };
            } else ud[k] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
        });
        return ud;
    };

    /* Skalaen og nulpunktet, saa baade foer og efter kan vaere paa tavlen */
    P.dnphRamme = function (tv) {
        var sc = this.sc, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        [sc.start, sc.slut].forEach(function (pl) {
            Object.keys(pl).forEach(function (k) {
                x0 = Math.min(x0, pl[k].x); x1 = Math.max(x1, pl[k].x);
                y0 = Math.min(y0, pl[k].y); y1 = Math.max(y1, pl[k].y);
            });
        });
        x0 -= 0.9; x1 += 1.3; y0 -= 0.8; y1 += 0.8;
        var top = tv.y + 30, hoejde = tv.h - 120;
        var s = Math.min(62, (tv.b - 50) / (x1 - x0), hoejde / (y1 - y0));
        return { s: s, ox: tv.x + tv.b / 2 - s * (x0 + x1) / 2, oy: top + hoejde / 2 - s * (y0 + y1) / 2, y1: y1 };
    };

    P.tegnDnph = function (ctx, tv) {
        var sc = this.sc, e = this.animE(), mig = this;
        var ramme = this.dnphRamme(tv), s = ramme.s;
        this.skala = s;
        var mol, alfaBd = null;
        if (e <= 0) mol = sc.mol;
        else if (e >= 1) mol = this.efter;
        else {
            mol = this.union;
            var brydes = sc.brydes, dannes = sc.dannes;
            alfaBd = function (bd) {
                function er(p) { return (bd.a === p[0] && bd.b === p[1]) || (bd.a === p[1] && bd.b === p[0]); }
                if (brydes.some(er)) return 1 - NK.klamp(e / 0.45, 0, 1);
                if (dannes.some(er)) return NK.klamp((e - 0.5) / 0.4, 0, 1);
                return 1;
            };
        }
        var pl = this.pladser(e);
        mol.atomer.forEach(function (a) { var p = pl[a.id]; if (p) { a.x = p.x; a.y = p.y; } });
        var vand = {};
        sc.vand.forEach(function (id) { vand[id] = true; });
        var valgt = {}, rigtigVist = !!this.kendt.vand;
        this.valgtAtomer.forEach(function (id) { valgt[id] = true; });
        var geo = NK.Struktur.geometri(mol, {
            skala: s, ox: ramme.ox, oy: ramme.oy, stil: "zigzag", farve: BLAEK,
            skrift: NK.klamp(s * 0.42, 13, 26), linje: NK.klamp(s * 0.05, 1.8, 3.2),
            atomFarve: function (id) { return rigtigVist && vand[id] ? TEAL : null; },
            bindingFarve: function (bd) {
                var a = alfaBd ? alfaBd(bd) : 1;
                if (a >= 1) return null;
                return "rgba(29, 36, 51, " + Math.max(0, a).toFixed(3) + ")";
            }
        });
        this.nitroTekst(geo, mol);
        this.geo = geo;

        /* Ringene om atomerne: det valgte (gult), musen og hintet */
        var r = s * 0.34;
        if (this.trin() === "vand" && !this.groen) {
            if (this.hintMaerke >= 1) F.ring(ctx, geo.P[sc.id.O], r * 1.15, GUL, null, 2);
            if (this.hintMaerke >= 2) [sc.id.Hb1, sc.id.Hb2].forEach(function (id) { F.ring(ctx, geo.P[id], r * 1.15, GUL, null, 2); });
            if (this.overAtom !== null && !valgt[this.overAtom]) F.ring(ctx, geo.P[this.overAtom], r, "rgba(214, 158, 12, 0.85)", null, 2);
            this.valgtAtomer.forEach(function (id) { F.ring(ctx, geo.P[id], r, GUL, GUL_FYLD, 3); });
        } else if (rigtigVist && e < 0.05) {
            sc.vand.forEach(function (id) { F.ring(ctx, geo.P[id], r, TEAL, "rgba(15, 118, 110, 0.10)", 2.5); });
        }
        NK.Struktur.tegnGeo(ctx, geo);

        /* Plus og navne foer og efter */
        var fs = NK.klamp(s * 0.55, 18, 30);
        function punkt(p) { return { x: ramme.ox + p.x * s, y: ramme.oy + p.y * s }; }
        var foer = 1 - NK.klamp(e / 0.3, 0, 1), efter = NK.klamp((e - 0.7) / 0.3, 0, 1);
        ctx.save();
        if (foer > 0) {
            ctx.globalAlpha = foer;
            var pf = punkt(sc.plus.foer);
            NK.tekst(ctx, "+", pf.x, pf.y, { font: "700 " + fs + "px " + FONT, farve: BLAEK, justering: "center", linje: "middle" });
        }
        if (efter > 0) {
            ctx.globalAlpha = efter;
            var pe = punkt(sc.plus.efter);
            NK.tekst(ctx, "+", pe.x, pe.y, { font: "700 " + fs + "px " + FONT, farve: BLAEK, justering: "center", linje: "middle" });
        }
        ctx.restore();

        var ny = ramme.oy + ramme.y1 * s + 34, ikkeDnph = {};
        sc.dnph.forEach(function (id) { ikkeDnph[id] = true; });
        function midtX(ids, pos) {
            var a = Infinity, b = -Infinity;
            ids.forEach(function (id) { var p = pos[id]; a = Math.min(a, p.x); b = Math.max(b, p.x); });
            return ramme.ox + s * (a + b) / 2;
        }
        var alle = sc.mol.atomer.map(function (a) { return a.id; });
        var carbonyl = alle.filter(function (id) { return !ikkeDnph[id]; });
        var nf = { font: "700 17px " + FONT, farve: BLAEK, justering: "center", linje: "middle" };
        var nu = { font: "600 14px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" };
        if (foer > 0) {
            ctx.save();
            ctx.globalAlpha = foer;
            NK.tekst(ctx, this.opg.stof, midtX(carbonyl, sc.start), ny, nf);
            NK.tekst(ctx, K.klasse(this.opg.stof), midtX(carbonyl, sc.start), ny + 20, nu);
            NK.tekst(ctx, "DNPH", midtX(sc.dnph, sc.start), ny, nf);
            NK.tekst(ctx, "2,4-dinitrophenylhydrazin", midtX(sc.dnph, sc.start), ny + 20, nu);
            ctx.restore();
        }
        if (efter > 0) {
            var prod = alle.filter(function (id) { return !vand[id]; });
            ctx.save();
            ctx.globalAlpha = efter;
            var f = sc.farve === "orange" ? "orange" : "gult";
            NK.tekst(ctx, "produktet", midtX(prod, sc.slut), ny, nf);
            NK.tekst(ctx, f + " bundfald", midtX(prod, sc.slut), ny + 20, { font: "700 14px " + FONT, farve: sc.farve === "orange" ? "#c2570c" : "#a77a07", justering: "center", linje: "middle" });
            NK.tekst(ctx, "vand", midtX(sc.vand, sc.slut), ny, nf);
            ctx.restore();
        }
    };

    /* Nitrogrupperne er atomer med grundstoffet I i grafen. Tegningen skriver
       NO₂ (eller O₂N, naar bindingen gaar mod hoejre) */
    P.nitroTekst = function (geo, mol) {
        mol.atomer.forEach(function (a) {
            if (a.el !== "I") return;
            var p = geo.P[a.id];
            geo.tekster.forEach(function (t) {
                if (t.t !== "I" || Math.abs(t.x - p.x) > 0.5 || Math.abs(t.y - p.y) > 0.5) return;
                var nb = mol.naboer(a.id)[0], b = nb !== undefined ? mol.atom(nb) : null;
                var hoejre = b && b.x > a.x + 0.1;
                if (!maaleCtx) maaleCtx = document.createElement("canvas").getContext("2d");
                var ctxM = maaleCtx;
                ctxM.font = t.font;
                var wN = ctxM.measureText("N").width;
                if (hoejre) { t.t = "O₂N"; t.juster = "right"; t.x = p.x + wN / 2; }
                else { t.t = "NO₂"; t.juster = "left"; t.x = p.x - wN / 2; }
                t.b = ctxM.measureText(t.t).width;
            });
        });
    };

    /* ----- Tollens: reaktionsskemaet ------------------------------------------------- */
    P.tegnTollens = function (ctx, tv) {
        var s = this.sk, mig = this, tr = this.trin(), faerdig = this.faerdig;
        var kendt = this.kendt;
        var aktiv = function (navn) { return tr === navn && !mig.groen; };
        /* Delene i skemaet. Molekylerne maales foerst ved skala 1 */
        var prodT = { mol: s.prod.mol, c: s.cP };
        var dele = [
            { slags: "mol", t: this.aldT.mol, c: this.aldT.c, side: 0 },
            { slags: "plus" },
            { slags: "ion", t: "Ag⁺", koef: "ag", ag: true, side: 0 },
            { slags: "plus" },
            { slags: "ion", t: "OH⁻", koef: "oh", side: 0 },
            { slags: "pil" },
            { slags: "mol", t: prodT.mol, c: prodT.c, side: 1 },
            { slags: "plus" },
            { slags: "ion", t: "Ag", koef: "ag", ag: true, side: 1 },
            { slags: "plus" },
            { slags: "ion", t: "H₂O", koef: "h2o", side: 1 }
        ];
        /* Skalaen: hele skemaet skal kunne vaere i bredden */
        function maal(sk) {
            var fs = NK.klamp(sk * 0.56, 13, 26), w = 0;
            dele.forEach(function (d) {
                if (d.slags === "mol") {
                    d.geo0 = NK.Struktur.geometri(d.t, { skala: sk, stil: "zigzag", farve: BLAEK, visC: function (id) { return id === d.c; },
                        skrift: NK.klamp(sk * 0.42, 13, 24), linje: NK.klamp(sk * 0.05, 1.8, 3) });
                    d.b = d.geo0.x1 - d.geo0.x0;
                } else if (d.slags === "ion") {
                    ctx.font = "600 " + fs + "px " + FONT;
                    d.b = ctx.measureText(d.t).width + fs * 1.15;      /* plads til koefficienten */
                } else d.b = d.slags === "pil" ? fs * 2.6 : fs * 1.2;
                w += d.b + fs * 0.35;
            });
            return { w: w, fs: fs };
        }
        /* Skalaen: bredden og hoejden skal passe paa tavlen */
        function hoejde() {
            return Math.max.apply(null, dele.filter(function (d) { return d.slags === "mol"; }).map(function (d) { return d.geo0.y1 - d.geo0.y0; }));
        }
        /* Under skemaet: to pile og tre linjer med regnestykker */
        function forHoejt() {
            var h = hoejde(), top = Math.max(tv.h * 0.3, h / 2 + m.fs * 1.6 + 12);
            return top + h / 2 + m.fs * 8.6 > tv.h - 8;
        }
        var sk = 64, m = maal(sk), n = 0;
        while ((m.w > tv.b - 40 || hoejde() > tv.h * 0.42 || forHoejt()) && sk > 18 && n++ < 40) { sk *= 0.94; m = maal(sk); }
        var fs = m.fs, x = tv.x + tv.b / 2 - m.w / 2;
        var halv = Math.max.apply(null, dele.filter(function (d) { return d.slags === "mol"; }).map(function (d) { return (d.geo0.y1 - d.geo0.y0) / 2; }));
        var ry = tv.y + Math.max(tv.h * 0.3, halv + fs * 1.6 + 12);
        var tekstF = { font: "600 " + fs + "px " + FONT, farve: BLAEK, justering: "left", linje: "middle" };
        var C = {};
        dele.forEach(function (d) {
            d.x = x;
            if (d.slags === "mol") {
                var g = NK.Struktur.geometri(d.t, { skala: sk, ox: x - d.geo0.x0, oy: ry - (d.geo0.y0 + d.geo0.y1) / 2, stil: "zigzag", farve: BLAEK,
                    visC: function (id) { return id === d.c; }, skrift: NK.klamp(sk * 0.42, 13, 24), linje: NK.klamp(sk * 0.05, 1.8, 3),
                    atomFarve: function (id) { return id === d.c && (d.side === 0 ? kendt.oxFra : kendt.oxTil) ? AF.ox : null; } });
                var pc = g.P[d.c];
                var ringAktiv = (d.side === 0 && aktiv("oxFra")) || (d.side === 1 && aktiv("oxTil"));
                if (ringAktiv) F.ring(ctx, pc, sk * 0.4, GUL, "rgba(242, 197, 61, 0.22)", 3);
                NK.Struktur.tegnGeo(ctx, g);
                C[d.side] = { x: pc.x, y: pc.y, top: g.y0, bund: g.y1 };
                var ox = d.side === 0 ? (kendt.oxFra ? s.cFra : null) : (kendt.oxTil ? s.cTil : null);
                var lp = mig.friPlads(d.t, d.c, pc, sk * 0.66);
                if (ox !== null) NK.tekst(ctx, D.rom(ox), lp.x, lp.y, { font: "800 " + Math.round(fs * 0.78) + "px " + FONT, farve: AF.ox, justering: "center", linje: "middle" });
                d.bund = g.y1;
            } else if (d.slags === "ion") {
                var kw = fs * 1.0, tx = x + kw + fs * 0.15;
                mig.tegnKoef(ctx, d.koef, x, ry, kw, fs);
                NK.tekst(ctx, d.t, tx, ry, tekstF);
                ctx.font = tekstF.font;
                var w = ctx.measureText(d.t).width;
                if (d.ag) {
                    C["ag" + d.side] = { x: tx + ctx.measureText("Ag").width / 2, y: ry };
                    if (mig.naaet("ag")) NK.tekst(ctx, d.side === 0 ? "+I" : "0", tx + ctx.measureText("Ag").width / 2, ry - fs * 1.05, { font: "800 " + Math.round(fs * 0.78) + "px " + FONT, farve: AF.red, justering: "center", linje: "middle" });
                }
                d.bund = ry + fs * 0.6;
                d.w = w;
            } else if (d.slags === "plus") {
                NK.tekst(ctx, "+", x + d.b / 2, ry, { font: "600 " + fs + "px " + FONT, farve: BLAEK, justering: "center", linje: "middle" });
            } else {
                ctx.save();
                ctx.strokeStyle = BLAEK;
                ctx.fillStyle = BLAEK;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(x + 4, ry);
                ctx.lineTo(x + d.b - 12, ry);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + d.b - 2, ry);
                ctx.lineTo(x + d.b - 14, ry - 6);
                ctx.lineTo(x + d.b - 14, ry + 6);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            x += d.b + fs * 0.35;
        });

        /* Pilene under skemaet som i C-bogens afsnit 8.4: fra atomet til det
           samme atom paa den anden side, og stigningen og faldet staar midt
           under reaktionspilen */
        var pilD = dele.filter(function (d) { return d.slags === "pil"; })[0];
        var midt = pilD.x + pilD.b / 2, slutX = x - fs * 0.35;
        var bund = Math.max.apply(null, dele.map(function (d) { return d.bund || ry; }));
        var y1 = bund + fs * 1.0, y2 = y1 + fs * 2.3;
        var visRed = this.naaet("ag"), agKendt = !!kendt.ag;
        if (kendt.oxTil && C[0] && C[1]) {
            this.klamme(ctx, { fra: C[0].x, fraY: C[0].bund + 6, til: C[1].x, tilY: C[1].bund + 6, y: y1, midt: midt, fs: fs,
                farve: AF.ox, ord: "oxidation", huller: visRed ? [C.ag0.x] : [],
                tekst: agKendt ? [[String(s.kAld), AF.koef], [" ↑ " + s.stigning + " = " + s.kAld * s.stigning, AF.ox]] : [["↑ " + s.stigning, AF.ox]] });
        }
        if (visRed) {
            this.klamme(ctx, { fra: C.ag0.x, fraY: ry + fs * 0.75, til: C.ag1.x, tilY: ry + fs * 0.75, y: y2, midt: midt, fs: fs,
                farve: AF.red, ord: "reduktion", huller: [],
                tekst: agKendt ? [[String(s.kAg), AF.koef], [" ↓ " + s.fald + " = " + s.kAg * s.fald, AF.red]] : [["↓ " + s.fald, AF.red]] });
        }

        /* Regnestykkerne: venstre side under venstre side af skemaet og
           hoejre side under hoejre side. Ladningen til venstre regnes om,
           naar OH⁻ er fundet */
        var ly = y2 + fs * 2.1, lh = Math.round(fs * 1.12);
        var omr = {
            v: { a: tv.x + 14, b: midt - fs * 0.7, c: (dele[0].x + pilD.x) / 2 },
            h: { a: midt + fs * 0.7, b: tv.x + tv.b - 14, c: (pilD.x + pilD.b + slutX) / 2 }
        };
        function linje(tekstV, tekstH, ok) {
            var farve = ok ? TEAL : "#3d4654";
            mig.sideTekst(ctx, tekstV, omr.v, ly, fs, farve);
            mig.sideTekst(ctx, tekstH, omr.h, ly, fs, farve);
            ly += lh;
        }
        if (this.naaet("oh")) {
            var ladH = "Ladning højre = " + (s.kAld === 1 ? "" : s.kAld + " · (" + D.fortegn(s.qProd) + ") = ") + D.fortegn(s.ladH);
            if (kendt.oh) linje("Ladning venstre = " + s.kAg + " · (+1) + " + s.oh + " · (−1) = " + D.fortegn(s.ladH), ladH, true);
            else linje("Ladning venstre = " + s.kAg + " · (+1) = " + D.fortegn(s.ladV0), ladH, false);
        }
        if (this.naaet("h2o")) {
            var hV = "H venstre = " + s.kAld * s.hAld + " + " + s.oh + " = " + s.hV;
            if (kendt.h2o) linje(hV, "H højre = " + s.kAld * s.hProd + " + " + s.h2o + " · 2 = " + s.hV, true);
            else linje(hV, "H højre = " + s.kAld * s.hProd, false);
        }
        if (kendt.h2o) linje("O venstre = " + s.kAld * s.oAld + " + " + s.oh + " = " + s.oV, "O højre = " + s.kAld * s.oProd + " + " + s.h2o + " = " + s.oH, true);
        if (faerdig && ly + 8 < tv.y + tv.h - 12) NK.tekst(ctx, "Sølvet sætter sig som et spejl på glasset.", tv.x + tv.b / 2, ly + 8, { font: "700 " + Math.round(fs * 0.74) + "px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" });
    };

    /* En tekst under den ene side af skemaet: midt under siden, men aldrig
       ind over reaktionspilens midte. Skriften bliver mindre, hvis der ikke
       er plads */
    P.sideTekst = function (ctx, tekst, o, y, fs, farve) {
        var maks = o.b - o.a, str = NK.passendeSkrift(ctx, tekst, maks, Math.round(fs * 0.74), 10, "600");
        ctx.font = "600 " + str + "px " + FONT;
        var w = ctx.measureText(tekst).width, cx = NK.klamp(o.c, o.a + w / 2, o.b - w / 2);
        NK.tekst(ctx, tekst, cx, y, { font: "600 " + str + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
    };

    /* Pladsen til oxidationstallet ved et atom: midt i det hul mellem
       bindingerne, der vender mest opad (C-bogens figurer har tallet over) */
    P.friPlads = function (mol, id, p, afst) {
        var a = mol.atom(id), v = mol.naboer(id).map(function (n) {
            var b = mol.atom(n);
            return Math.atan2(b.y - a.y, b.x - a.x);
        }).sort(function (x, y) { return x - y; });
        if (!v.length) return { x: p.x, y: p.y - afst };
        var bedst = null, score = -Infinity;
        v.forEach(function (st, j) {
            var slut = j + 1 < v.length ? v[j + 1] : v[0] + 2 * Math.PI, gab = slut - st, midt = st + gab / 2;
            if (gab < 1.4) return;
            var op = -Math.sin(midt);
            var sc = op + gab * 0.25;
            if (sc > score) { score = sc; bedst = midt; }
        });
        if (bedst === null) bedst = -Math.PI / 2;
        return { x: p.x + Math.cos(bedst) * afst, y: p.y + Math.sin(bedst) * afst };
    };

    /* En koefficient foran en ion: groenblaa, naar den er fundet; et gult felt
       med ?, naar kortet spoerger om den; ellers et graat ? */
    P.tegnKoef = function (ctx, navn, x, y, b, fs) {
        var kendt = this.kendt[navn], aktiv = this.trin() === navn && !this.groen;
        var vaerdi = { ag: this.sk.kAg, oh: this.sk.oh, h2o: this.sk.h2o }[navn];
        if (kendt) {
            NK.tekst(ctx, String(vaerdi), x + b / 2, y, { font: "800 " + fs + "px " + FONT, farve: AF.koef, justering: "center", linje: "middle" });
            return;
        }
        ctx.save();
        NK.rundtRekt(ctx, x, y - fs * 0.62, b, fs * 1.24, 6);
        ctx.fillStyle = aktiv ? "rgba(242, 197, 61, 0.3)" : "rgba(255, 255, 255, 0.6)";
        ctx.fill();
        ctx.strokeStyle = aktiv ? GUL : "#c3c9d1";
        ctx.lineWidth = aktiv ? 2.5 : 1.5;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "?", x + b / 2, y + 1, { font: "800 " + Math.round(fs * 0.8) + "px " + FONT, farve: aktiv ? "#8a6200" : "#a3abb6", justering: "center", linje: "middle" });
    };

    /* En pil under skemaet fra et atom til det samme atom paa den anden side
       (C-bogens afstemningsfigurer): ned fra atomet, vandret og op med en
       pilespids. Teksten staar i et hul i den vandrette streg midt under
       reaktionspilen med ordet oxidation eller reduktion under.
       k.tekst er stykker [tekst, farve], k.huller er x, hvor en anden pil
       krydser */
    P.klamme = function (ctx, k) {
        var fs = k.fs, lf = "800 " + Math.round(fs * 0.78) + "px " + FONT;
        ctx.save();
        ctx.font = lf;
        var bredder = k.tekst.map(function (d) { return ctx.measureText(d[0]).width; });
        var bw = bredder.reduce(function (a, b) { return a + b; }, 0);
        var huller = [[k.midt - bw / 2 - 8, k.midt + bw / 2 + 8]].concat(k.huller.map(function (hx) { return [hx - 5, hx + 5]; }))
            .sort(function (a, b) { return a[0] - b[0]; });
        ctx.strokeStyle = k.farve;
        ctx.fillStyle = k.farve;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(k.fra, k.fraY);
        ctx.lineTo(k.fra, k.y);
        var fx = k.fra;
        huller.forEach(function (h) {
            if (h[1] <= fx || h[0] >= k.til) return;
            if (h[0] > fx) ctx.lineTo(h[0], k.y);
            fx = Math.max(fx, h[1]);
            ctx.moveTo(fx, k.y);
        });
        if (fx < k.til) ctx.lineTo(k.til, k.y);
        else ctx.moveTo(k.til, k.y);
        ctx.lineTo(k.til, k.tilY + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(k.til, k.tilY);
        ctx.lineTo(k.til - 6, k.tilY + 11);
        ctx.lineTo(k.til + 6, k.tilY + 11);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        var tx = k.midt - bw / 2;
        k.tekst.forEach(function (d, j) {
            NK.tekst(ctx, d[0], tx, k.y, { font: lf, farve: d[1], justering: "left", linje: "middle" });
            tx += bredder[j];
        });
        NK.tekst(ctx, k.ord, k.midt, k.y + fs * 0.82, { font: "700 " + Math.round(fs * 0.58) + "px " + FONT, farve: k.farve, justering: "center", linje: "middle" });
    };

    NK.SimReaktion = SimReaktion;
}());
