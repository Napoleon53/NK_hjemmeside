/* =====================================================================
   sim_hypoteser.js - fane 2: hypoteserne

   Fem opgaver: stofmaengden af natron i elevens digel, én opgave pr.
   hypotese (afstem skemaet, stofmaengden af produktet og dets masse) og
   dommen. I hypotese A skriver eleven formlen og hele mellemregningen;
   i B og C er stilladset mindre. Hver gang en hypotese er regnet, kommer
   dens forventede masse som en stiplet streg paa grafen ved siden af
   elevens maalinger fra fane 1. Dommen: hvilken streg ender kurven paa?
   Har eleven ikke maalt selv, bruges et eksempel, og kortet siger det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    var NOEGLE_DOM = "nk-sc4.7-dommen";
    var NOEGLE_JOURNAL = "nk-sc4.7-journal";
    NK.dommen = !!NK.hent(NOEGLE_DOM, false);
    NK.journal = NK.hent(NOEGLE_JOURNAL, null) || { fejl: 0, svar: 0, snyd: false, valgt: null };

    function SimHypoteser() {
        this.over = null;
        this.ny = {};
        this.startFane(D.HYPOTESER);
        this.el.valg = NK.el("hypoteser-valg");
        this.el.snyd = NK.el("hypoteser-snyd");
        this.regning = new NK.Regning({ vaert: NK.el("hypoteser-raekker"), fane: this });
        var mig = this;
        if (this.el.snyd) this.el.snyd.addEventListener("click", function () { mig.snyd(); });
        this.opdaterForventet();
        this.introNu = true;
        this.vaelg(this.foersteUloeste(), false);
    }

    var P = SimHypoteser.prototype;
    NK.Fane.paa(P, { navn: "hypoteser", naesteFane: "fane-fejl", naesteNavn: "Fejlkilder" });
    NK.Regning.paa(P);

    P.foersteUloeste = function () {
        for (var i = 0; i < this.status.length; i++) if (!this.status[i].loest) return i;
        return 0;
    };

    NK.gemJournal = function () { NK.gem(NOEGLE_JOURNAL, NK.journal); };

    /* De forventede masser for de hypoteser, der er regnet, med den
       maaling, der bruges nu */
    P.opdaterForventet = function () {
        var m = NK.maaling(), mig = this;
        NK.forventet = {};
        NK.forventetFor = m.mf;
        D.HYPOTESER.forEach(function (o, i) {
            if (o.hyp && mig.status[i].loest) NK.forventet[o.hyp] = K.facit(m.mf, o.hyp).m_p;
        });
    };

    P.antalRegnet = function () { return Object.keys(NK.forventet || {}).length; };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var spec = D.HYPOTESER[i];
        var m = NK.maaling();
        this.maal = m;
        var o = { id: spec.id, titel: spec.titel, hyp: spec.hyp || null, kort: !!spec.kort, dom: !!spec.dom,
                  trin: spec.trin || [], tal: { mf: m.mf, slut: m.slut } };
        o.facit = K.facit(m.mf, o.hyp);
        this.opg = o;
        this.valgt = null;
        this.forkertDom = {};
        this.regning.saet(o);
        this.opdaterForventet();
    };

    P.harNyeTal = function () { return false; };
    P.harForfra = function () { return false; };

    /* Fane 1 har en ny maaling, eller eleven kommer tilbage fra fane 1:
       stregerne regnes om. Har diglen en anden startmasse end den, opgaven
       er regnet paa, begynder opgaven forfra med de nye tal; saa staar der
       aldrig to forskellige digler paa fanen. */
    P.nyMaaling = function () {
        var m = NK.maaling(), gl = this.maal;
        this.opdaterForventet();
        if (!this.opg) return;
        var nyeTal = !!gl && (gl.mf !== m.mf || gl.egen !== m.egen);
        if (!this.faerdig && (this.opg.dom || nyeTal || this.regning.k === 0)) {
            this.vaelg(this.nr, false);
            if (nyeTal && m.egen && this.harVist) this.naesteLinje("Tallene er nu fra din digel: " + K.g2(m.mf) + " g natron.", "");
        } else this.maal = m;
    };

    P.promptHTML = function () {
        var o = this.opg, m = this.maal, s;
        var note = m.egen ? "" : '<p class="note">Tallene er et eksempel. Lav forsøget på fanen Forsøget for at regne på din egen digel.</p>';
        if (o.id === "nat") s = (m.egen ? "Din digel" : "Diglen i eksemplet") + " havde " + K.g2(m.mf) + " g natron før opvarmningen. Hvor mange mol er det?";
        else if (o.hyp) s = "Hvis der dannes " + T.P(o.hyp) + ", hvad skal diglen så veje til sidst? Afstem skemaet først.";
        else {
            var mangler = this.mangler();
            s = mangler.length ? "Regn først " + mangler.map(function (h) { return "hypotese " + h; }).join(", ").replace(/, ([^,]*)$/, " og $1") + ". Så kan du sammenligne." :
                (m.faerdig ? D.DOM.spm : D.DOM.ikkeKonstant);
        }
        return '<p class="maal-tekst">' + NK.html(s) + "</p>" + note;
    };

    P.mangler = function () {
        var mig = this;
        return D.HYP_IDS.filter(function (h) { return !(NK.forventet && NK.forventet[h] !== undefined) || !mig.status[D.HYP_IDS.indexOf(h) + 1].loest; });
    };

    /* Valgknapperne til dommen */
    P.visKortEkstra = function () {
        var o = this.opg, mig = this, e = this.el.valg;
        if (!o.dom) { e.hidden = true; e.innerHTML = ""; return; }
        var klar = !this.mangler().length && this.maal.faerdig;
        e.hidden = !klar;
        e.innerHTML = "";
        if (!klar) return;
        var ret = this.rigtigDom();
        D.HYP_IDS.forEach(function (h) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = h + ": " + T.P(h);
            if (mig.faerdig) {
                b.disabled = true;
                if (h === ret) b.classList.add("rigtig");
            } else if (mig.forkertDom[h]) {
                b.disabled = true;
                b.classList.add("forkert");
            }
            b.addEventListener("click", function () { mig.doem(h, "ok"); });
            e.appendChild(b);
        });
    };

    /* Den hypotese, hvis forventede masse ligger naermest den maalte */
    P.rigtigDom = function () {
        var slut = this.maal.slut, bedst = null, afst = Infinity;
        D.HYP_IDS.forEach(function (h) {
            var a = Math.abs(NK.forventet[h] - slut);
            if (a < afst) { afst = a; bedst = h; }
        });
        return bedst;
    };

    P.doem = function (h, maade) {
        if (this.faerdig) return;
        var ret = this.rigtigDom(), m = this.maal;
        if (h !== ret) {
            this.forkertDom[h] = true;
            this.brugtSvar = true;
            NK.journal.fejl++;
            NK.gemJournal();
            var diff = Math.abs(NK.forventet[h] - m.slut);
            this.besked(NK.html("Hypotese " + h + " giver " + K.g(NK.forventet[h]) + " g. Diglen vejer " + K.g2(m.slut) + " g. Forskellen er " +
                K.g2(diff) + " g. Prøv en anden."), "skidt");
            this.visKort();
            return;
        }
        NK.journal.valgt = h;
        NK.gemJournal();
        var s;
        if (h === D.RIGTIG) {
            s = D.DOM.rigtig + " " + D.DOM.skema + ".";
            if (m.sprojt) s += " Pulveret sprøjtede i din digel, så massen er lidt for lav. Den passer alligevel bedst med B.";
            NK.dommen = true;
            NK.gem(NOEGLE_DOM, true);
        } else {
            s = D.DOM.sprojt;
        }
        var g = NK.gaet;
        if (g) s += g === h ? " Dit gæt fra forsøget holdt." : " Du gættede " + g + ": " + T.P(g) + ".";
        this.domTekst = s;
        this.valgt = h;
        this.trinLoest(maade, maade === "svar" ? NK.html("Hypotese " + h + ". Stregen ligger, hvor kurven ender.") : null);
    };

    /* ----- Knappen og linjen: regneopgaverne bruger regningen, dommen sig selv ----- */
    var trinInfoRegning = P.trinInfo, trinLinjeRegning = P.trinLinje, opgaveFaerdigRegning = P.opgaveFaerdig;

    P.trinInfo = function () {
        var o = this.opg, mig = this;
        if (!o.dom) return trinInfoRegning.call(this);
        if (this.faerdig) return null;
        var mangler = this.mangler();
        if (mangler.length) {
            var i = D.HYP_IDS.indexOf(mangler[0]) + 1;
            return { hint: NK.html("Hypotese " + mangler[0] + " står i listen over opgaverne herunder."),
                     svar: function () { mig.vaelg(i, false); } };
        }
        /* Massen er ikke konstant endnu: svaret er at gaa tilbage og varme */
        if (!this.maal.faerdig) return { hint: NK.html(D.DOM.konstantHint), svar: function () { if (NK.visFane) NK.visFane("fane-forsoeg"); } };
        return { hint: NK.html(D.DOM.hint), svar: function () { mig.doem(mig.rigtigDom(), "svar"); } };
    };

    P.trinLinje = function () {
        var o = this.opg;
        if (!o.dom) return trinLinjeRegning.call(this);
        if (this.faerdig) return "";
        if (this.mangler().length) return "Vælg den hypotese, der mangler, i listen herunder.";
        return this.maal.faerdig ? "Vælg den hypotese, der passer med din måling." : "Gå til fanen Forsøget, og varm videre.";
    };

    P.opgaveFaerdig = function () {
        if (this.opg.dom) return this.valgt !== null;
        return opgaveFaerdigRegning.call(this);
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit;
        if (o.dom) return NK.html(this.domTekst || "");
        if (o.id === "nat") return NK.html("Natronen i din digel er " + K.mol(f.n_nat) + " mol.");
        var m = K.g(f.m_p), s = "Hvis der dannes " + T.P(o.hyp) + ", skal diglen ende på " + m + " g. Stregen står på grafen.";
        return NK.html(s);
    };

    /* Et trin er regnet: en ny streg paa grafen, naar massen er fundet */
    P.efterTrin = function (id, maade) {
        var o = this.opg;
        if (maade === "svar") { NK.journal.svar++; NK.gemJournal(); }
        if (id === "m_p" && o.hyp) {
            NK.forventet[o.hyp] = o.facit.m_p;
            NK.forventetFor = o.tal.mf;
            this.ny[o.hyp] = 0;
        }
    };

    /* Fejl taeller i journalen (ingen fejl giver et maerke) */
    var regnFejlFaelles = P.regnFejl;
    P.regnFejl = function (besked, tom, id) {
        if (!tom) { NK.journal.fejl++; NK.gemJournal(); }
        regnFejlFaelles.call(this, besked, tom, id);
    };

    /* Snyd: alle regneopgaver udfyldes, og det staar i journalen */
    P.snyd = function () {
        var mig = this, m = NK.maaling();
        NK.journal.snyd = true;
        NK.gemJournal();
        D.HYPOTESER.forEach(function (o, i) {
            if (o.dom) return;
            var s = mig.status[i];
            if (!s.loest) { s.loest = true; s.stjerne = false; }
            if (o.hyp) { NK.forventet[o.hyp] = K.facit(m.mf, o.hyp).m_p; mig.ny[o.hyp] = 0; }
        });
        NK.forventetFor = m.mf;
        this.gem();
        if (this.el.snyd) { this.el.snyd.disabled = true; this.el.snyd.textContent = "Snydt. Det står i journalen."; }
        this.vaelg(D.HYPOTESER.length - 1, false);
    };

    /* ----- Opdater ------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        var mig = this;
        Object.keys(this.ny).forEach(function (h) { mig.ny[h] = Math.min(1, mig.ny[h] + dt * 1.2); });
        if (this.el.snyd && NK.journal.snyd && !this.el.snyd.disabled) { this.el.snyd.disabled = true; this.el.snyd.textContent = "Snydt. Det står i journalen."; }
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var g = lay.graf;
        if (pt.x >= g.x && pt.x <= g.x + g.b && pt.y >= g.y && pt.y <= g.y + g.h) return "graf";
        var r = lay.tavle;
        if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return "tavle";
        return null;
    };

    P.overScene = function (pt) { this.over = this.hvad(pt); return null; };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (u === "graf") this.kortBesked("Grafen: dine vejninger og stregerne for de hypoteser, du har regnet. Kurven ender på den, der passer.");
        if (u === "tavle") this.kortBesked("Tavlen viser skemaet, opgavens tal og beregningen, efterhånden som du skriver den.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.03, 8, 16));
        var smal = W < 620;
        var gb = smal ? 0 : Math.round(NK.klamp(W * 0.36, 200, 380));
        var tb = W - 36 - (gb ? gb + 20 : 0);
        var ctx = this.L.ctx;
        lay.opgY = 12;
        lay.opg = Tg.overTavle(ctx, this.overTekst(), tb - 14, NK.klamp(Math.min(W / 46, Hs / 24), 14, 19), 14);
        var ty = lay.opgY + lay.opg.h + 16;
        lay.tavle = { x: 20, y: ty, b: tb, h: Math.max(120, lay.bordY - ty - 16) };
        lay.graf = gb ? { x: W - gb - 14, y: ty - 6, b: gb, h: Math.max(120, lay.bordY - ty - 6) } :
            { x: 20, y: lay.bordY - 1, b: 1, h: 1 };
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
    };

    /* Handlingen paa én linje over tavlen */
    P.overTekst = function () {
        var o = this.opg;
        if (!o) return "";
        if (o.id === "nat") return "Find stofmængden af natron i diglen.";
        if (o.hyp) return "Hypotese " + o.hyp + ": regn ud, hvad diglen skal veje, hvis der dannes " + T.P(o.hyp) + ".";
        return "Sammenlign målingen med de tre hypoteser.";
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.data = function () {
        var o = this.opg, m = this.maal;
        if (o.id === "nat") return ["m(NaHCO₃) = " + K.g2(m.mf) + " g", "M(NaHCO₃) = " + K.Mtekst("NaHCO3") + " g/mol"];
        var Pid = D.HYP[o.hyp].produkt;
        return ["n(NaHCO₃) = " + K.mol(o.facit.n_nat) + " mol", "M(" + T.P(o.hyp) + ") = " + K.Mtekst(Pid) + " g/mol"];
    };

    P.tegnDom = function (ctx, r) {
        Tg.tavle(ctx, r);
        var m = this.maal, mig = this, ret = this.faerdig ? this.valgt : null;
        var f = NK.klamp(Math.min(r.b / 28, r.h / 11), 12, 20);
        var x = r.x + f * 1.1, y = r.y + f * 1.3, lh = f * 1.9, b = r.b - f * 2.2;
        Tg.etiket(ctx, m.egen ? "Din digel" : "Eksemplets digel", x, y, NK.klamp(f * 0.72, 12, 14));
        y += lh * 0.7;
        var foerTekst = "Før: " + K.g2(m.mf) + " g     Til sidst: " + (m.faerdig ? K.g2(m.slut) + " g" : "ikke konstant endnu");
        NK.passendeSkrift(ctx, foerTekst, b, f * 1.05, 12, "700");
        NK.tekst(ctx, foerTekst, x, y, { font: ctx.font, linje: "middle", farve: "#1f2530" });
        y += lh * 0.95;
        Tg.etiket(ctx, "Hypoteserne", x, y, NK.klamp(f * 0.72, 12, 14));
        y += lh * 0.7;
        D.HYP_IDS.forEach(function (h) {
            var mm = NK.forventet[h];
            var skema = NK.Regning.skemaTekst(h);
            var masse = mm !== undefined && mig.status[D.HYP_IDS.indexOf(h) + 1].loest ? K.g(mm) + " g" : "? g";
            var farve = ret === h ? "#1d7a48" : (mig.forkertDom[h] || (ret && ret !== h) ? "rgba(31, 37, 48, 0.45)" : "#1f2530");
            Tg.maerke(ctx, x + f * 0.6, y, f * 0.62, h, D.HYP_FARVE[h]);
            var px = NK.passendeSkrift(ctx, skema, b * 0.66, f, 12, "600");
            NK.tekst(ctx, skema, x + f * 1.7, y, { font: Tg.font("600", px), linje: "middle", farve: farve });
            NK.tekst(ctx, masse, x + b, y, { font: Tg.font("800", f * 1.05), justering: "right", linje: "middle", farve: farve });
            if (ret === h) {
                ctx.save();
                ctx.strokeStyle = "#1d7a48";
                ctx.lineWidth = 2.5;
                NK.rundtRekt(ctx, x - f * 0.35, y - lh * 0.45, b + f * 0.7, lh * 0.9, 6);
                ctx.stroke();
                ctx.restore();
            }
            y += lh;
        });
        /* Dommen er faldet: det, der skete i diglen, som kugler */
        if (ret === D.RIGTIG && y + lh * 2.2 < r.y + r.h) {
            y += lh * 0.3;
            Tg.etiket(ctx, "Det sker i diglen", x, y, NK.klamp(f * 0.72, 12, 14));
            Tg.reaktionKugler(ctx, x, y + lh * 1.05, Math.min(b, 560));
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg;
        if (!lay || !o) return;
        this.harVist = true;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var ot = this.overTekst();
        if (!lay.opg || lay.opgTekst !== ot) {
            lay.opgTekst = ot;
            lay.opg = Tg.overTavle(ctx, ot, lay.tavle.b - 14, NK.klamp(Math.min(lay.W / 46, lay.Hs / 24), 14, 19), 14);
        }
        Tg.tegnOverTavle(ctx, lay.opg, lay.tavle.x, lay.opgY);
        if (o.dom) this.tegnDom(ctx, lay.tavle);
        else this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        if (lay.graf.b > 10) {
            var m = this.maal;
            var xMax = Math.max(20, Math.ceil((m.vejninger[m.vejninger.length - 1].t + 1) / 5) * 5);
            Tg.graf(ctx, lay.graf, { serier: [{ punkter: m.vejninger, farve: "#f2a93d" }], linjer: NK.forventet, ny: this.ny,
                yMax: Math.ceil(m.mf + 0.3), xMax: xMax, titel: m.egen ? "Din digel" : "Eksemplet",
                fremhaev: this.opg.dom && this.faerdig ? this.valgt : null });
        }
    };

    NK.SimHypoteser = SimHypoteser;
}());
