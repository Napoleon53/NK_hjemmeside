/* =====================================================================
   sim_oxtal.js - fane 1: Oxidationstallet

   Afloeser den gamle b5.3 (ethanol → ethanal → ethansyre med
   elektronegativitet og elektronforskydning). Her goer eleven det selv,
   og tre alkoholer viser bogens tre typer.

   Hver alkohol oxideres trin for trin. Et trin har et spoergsmaal og en knap:
     ox   hvad er oxidationstallet for det markerede carbonatom? Eleven
          vaelger et romertal paa kortet og trykker Indsend svar. Er det
          rigtigt, staar tallet og regnestykket ved formlen, elektronparrene
          slaas til, og alle atomer faar deres oxidationstal skraat oppe til
          hoejre. Foer stod der et tal ved hver binding (−1, +1, 0); det var
          svaert at se, hvilket atom tallet hoerte til (brugeren 3. nov. 2026)
     h    kortet siger, hvad oxidationsmidlet goer, og eleven trykker
          Oxidér. Saa oxideres molekylet (K.plan og K.udfoer i kemi.js):
          de hydrogenatomer, der forlader molekylet, faar en gul ring og
          glider vaek, og et nyt trin begynder. Eleven klikkede foer selv
          paa hydrogenatomet; det var forvirrende (brugeren 3. nov. 2026)
   Har carbonatomet ikke flere hydrogenatomer, er serien slut, saa snart
   oxidationstallet er fundet.

   Elektronparrene (kontakten i panelet) staar paa alle bindinger og
   glider over til det mest elektronegative atom; mellem to C bliver
   parret i midten. Prikkerne har farven fra det atom, elektronen kom fra
   (som i den gamle b5.3 og i sc8.2). Oxidationstallet staar skraat oppe
   til hoejre for atomet og elektronegativiteten skraat nede til hoejre,
   som i sc8.2.

   Det, der er klaret, huskes i browseren (nk-sb4.3-serier). En serie
   faar en stjerne, naar den er klaret uden Vis svaret og uden et
   forkert svar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.3-serier";

    var BLAEK = "#1d2433";
    var GUL = "#d69e0c", GUL_FYLD = "rgba(242, 197, 61, 0.32)";
    var TEAL = "#0f8a8a", TEAL_FYLD = "rgba(15, 138, 138, 0.12)";
    var PLUS = "#cf3327", MINUS = "#2563eb", NUL = "#7a8494";
    var OXFARVE = "#b4321f";
    /* Grundstoffernes farver: H blaa, C sort, O roed (brugerens valg). Atomerne,
       deres elektroner og deres EN-tal har samme farve */
    var PRIK = { C: "#1d2433", H: "#2563eb", O: "#d23b2c" };
    function medAlfa(hex, al) {
        var n = parseInt(hex.slice(1), 16);
        return "rgba(" + (n >> 16 & 255) + ", " + (n >> 8 & 255) + ", " + (n & 255) + ", " + al.toFixed(3) + ")";
    }

    function SimOxtal() {
        var mig = this;
        this.hentStatus();
        this.visPar = false;
        this.visEN = false;
        this.parT = 0;
        this.startFane();
        this.el.skort.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-handling]") : null;
            if (k && k.getAttribute("data-handling") === "oxider") mig.oxider();
        });
        NK.el("o-serieliste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-serie]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-serie"), 10));
        });
        NK.el("o-kontakter").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-vis]") : null;
            if (!k) return;
            if (k.getAttribute("data-vis") === "par") mig.saetPar(!mig.visPar);
            else mig.visEN = !mig.visEN;
            mig.visKontakter();
        });
        this.bygSerieliste();
        this.visKontakter();
    }

    var P = SimOxtal.prototype;
    F.paa(P, "o");

    /* ----- Hukommelsen ------------------------------------------------------- */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = D.SERIER.map(function (s) {
            var g = gemt[s.id] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {};
        this.status.forEach(function (s, i) { ud[D.SERIER[i].id] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet: alkoholerne, trappen og kontakterne ------------------------------- */
    P.bygSerieliste = function () {
        var html = "";
        D.SERIER.forEach(function (s, i) {
            html += '<button type="button" class="opg-chip serie" data-serie="' + i + '">' +
                '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" +
                '<span class="serie-navn">' + NK.html(s.navn) + '<small>' + NK.html(D.TYPER[s.type].navn) + " alkohol</small></span></span>" +
                '<i class="oc-m"></i></button>';
        });
        NK.el("o-serieliste").innerHTML = html;
    };

    P.visListe = function () {
        var mig = this, knapper = NK.el("o-serieliste").querySelectorAll("[data-serie]");
        for (var i = 0; i < knapper.length; i++) {
            var s = this.status[i];
            knapper[i].classList.toggle("valgt", i === mig.nr);
            knapper[i].classList.toggle("loest", s.loest);
            knapper[i].classList.toggle("stjerne", s.stjerne);
            knapper[i].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("o-klaret", String(this.status.filter(function (s) { return s.loest; }).length));
        this.visTrappe();
    };

    /* Trappen: romertallene fra +III til −III, og hvert stof, eleven har fundet
       oxidationstallet for, staar ud for sit tal */
    P.visTrappe = function () {
        var mig = this, html = "";
        D.OXTAL.slice().reverse().forEach(function (v) {
            var her = mig.trin.filter(function (t) { return t.ox === v; });
            html += '<div class="trappe-trin' + (her.length ? " fyldt" : "") + (v === 0 ? " nul" : "") + '">' +
                '<span class="tt-tal">' + D.rom(v) + '</span><span class="tt-streg"></span>';
            her.forEach(function (t) {
                var kl = D.KLASSER[t.klasse];
                html += '<span class="tt-stof" style="--klassefarve:' + (kl ? kl.farve : "#a9b0ba") + '">' + NK.html(t.navn) +
                    (t.steg !== null ? '<em>steg ' + t.steg + "</em>" : "") + "</span>";
            });
            html += "</div>";
        });
        NK.saetHTML("o-trappe", html);
    };

    P.saetPar = function (til) {
        this.visPar = til;
        this.parT = 0;
        this.visKontakter();
    };

    P.visKontakter = function () {
        var k = NK.el("o-kontakter").querySelectorAll("[data-vis]");
        for (var i = 0; i < k.length; i++) {
            var til = k[i].getAttribute("data-vis") === "par" ? this.visPar : this.visEN;
            k[i].classList.toggle("til", til);
            k[i].setAttribute("aria-checked", til ? "true" : "false");
        }
        NK.el("o-forklaring").hidden = !this.visPar;
    };

    /* ----- En alkohol ---------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.serie = D.SERIER[i];
        this.b = K.byg(this.serie);
        this.mol = this.b.mol;
        this.c = this.b.c;
        this.trin = [];
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.anim = null;
        this.prod = null;
        this.besked("", "");
        this.nytTrin();
        this.visListe();
        this.layout();
    };

    P.nytTrin = function () {
        this.fase = "ox";
        this.valgt = null;
        this.forkert = {};
        this.oxVist = false;
        this.over = null;
        var n = K.navn(this.mol);
        this.stof = { navn: n.navn, klasse: n.klasse };
        this.nulstilHjaelp();
        this.visKort();
    };

    P.hAtomer = function () { return K.hPaa(this.mol, this.c); };

    /* ----- Kortet ---------------------------------------------------------------- */
    P.kortData = function () {
        var mig = this, navn = this.stof.navn;
        if (this.fase === "ox") {
            return {
                slags: "spm", chip: "Trin " + (this.trin.length + 1),
                tekst: "Hvad er oxidationstallet for det markerede carbonatom i " + navn + "? Vælg tallet, og tryk Indsend svar.",
                svar: D.OXTAL.map(function (v, j) { return { t: D.rom(v), valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
            };
        }
        /* Oxidationen sker af sig selv, naar eleven trykker Oxidér (brugerens
           oenske 3. nov. 2026: at klikke paa hydrogenatomet var forvirrende) */
        var oh = K.ohPaa(this.mol, this.c);
        var hvad = oh ? "Oxidationsmidlet tager et hydrogenatom fra det markerede carbonatom og et fra OH-gruppen, og C−O bliver til C=O."
            : "Oxidationsmidlet tager hydrogenatomet fra det markerede carbonatom, og et oxygenatom kommer ind i stedet.";
        /* Det, der dannes, staar paa kortet foer Oxidér: efter oxidationen gaar
           animationen direkte videre til naeste spoergsmaal (brugerens oenske) */
        var fra = this.anim ? this.anim.fra : navn, pr = this.prod;
        if (pr) hvad += " " + D.stor(fra) + " bliver oxideret til " + pr.navn + (D.KLASSER[pr.klasse] ? ", " + D.KLASSER[pr.klasse].ental : "") + ".";
        if (this.fase === "anim") return { slags: "opgave", chip: "Oxidation", tekst: hvad };
        return {
            slags: "opgave", chip: "Oxidation", tekst: hvad + " Tryk på knappen, og se det ske.",
            ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-handling="oxider">Oxidér ' + NK.html(navn) + "</button></div>"
        };
    };

    P.svarValg = function (j) {
        if (this.fase !== "ox") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.fase === "ox" && this.valgt !== null && this.valgt !== undefined; };

    P.skjulIndsend = function () { return this.fase !== "ox"; };

    P.indsendTekst = function () {
        if (this.fase === "ox" && this.valgt !== null) return "Indsend svar: " + D.rom(D.OXTAL[this.valgt]);
        return "Indsend svar";
    };

    P.ingentingTekst = function () { return "Vælg et oxidationstal på kortet først."; };

    /* ----- Indsend svar ------------------------------------------------------------ */
    P.indsend = function () { if (this.fase === "ox") this.indsendOx(false); };

    P.indsendOx = function (vist) {
        var nr = this.valgt, v = D.OXTAL[this.valgt], rigtig = K.oxtal(this.mol, this.c);
        if (v !== rigtig) {
            this.forkert[this.valgt] = true;
            this.fejl = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(K.oxFejl(this.mol, this.c, v));
            return;
        }
        var forrige = this.trin.length ? this.trin[this.trin.length - 1].ox : null;
        this.trin.push({ navn: this.stof.navn, klasse: this.stof.klasse, ox: rigtig, steg: forrige === null ? null : D.fortegn(rigtig - forrige) });
        /* Oxidationstallene kommer frem paa alle atomer, samtidig med at
           elektronparrene vises paa alle bindinger (brugerens oenske) */
        this.oxVist = true;
        this.oxT = 0;
        if (!this.visPar) this.saetPar(true);
        this.sejrT = 0;
        this.valgt = null;
        this.forkert = {};
        var tekst = K.regnestykke(this.mol, this.c) + ". I alt " + D.rom(rigtig) + ".";
        if (forrige !== null) tekst += " Oxidationstallet steg " + D.fortegn(rigtig - forrige).replace("+", "") + ".";
        this.visTrappe();
        /* Uden hydrogenatomer paa carbonatomet er serien slut */
        this.sidsteSvar = nr;
        if (!this.hAtomer().length) { this.slutSerie(vist, tekst); return; }
        /* Papirkortet: kortet bliver paa spoergsmaalet med svaret groent og
           forklaringen under det, til eleven trykker Naeste trin */
        this.groen = {
            spm: true, svarNr: nr, kortChip: "Trin " + this.trin.length, maade: vist ? "svar" : "selv",
            tekst: tekst, knap: "Næste trin →",
            naeste: function () { this.fase = "h"; this.prod = this.produkt(); this.nulstilHjaelp(); this.visKort(); }
        };
        this.besked("", "");
        this.visKort();
    };

    /* Det stof, oxidationen giver: regnet paa en kopi af molekylet */
    P.produkt = function () {
        var m = this.mol.kopi(), h = K.hPaa(m, this.c), plan = h.length ? K.plan(m, this.c, h[0]) : null;
        if (!plan) return null;
        K.udfoer(m, this.c, plan);
        return K.navn(m);
    };

    /* Oxidér: oxidationsmidlet tager det foerste hydrogenatom paa carbonatomet */
    P.oxider = function () {
        if (this.fase !== "h") return;
        var mig = this, h = this.hAtomer();
        if (!this.prod) this.prod = this.produkt();
        var plan = K.plan(this.mol, this.c, h[0]);
        /* Aldehyd til syre udfoeres med det samme, og H glider ud, mens det nye O
           kommer frem. Alkohol til C=O udfoeres til sidst. */
        var fra = this.stof.navn;
        this.anim = { plan: plan, t: 0, varighed: 1.8, fra: fra };
        if (plan.slags === "aldehyd") this.anim.nytO = K.udfoer(this.mol, this.c, plan);
        else {
            this.anim.start = {};
            [plan.h, plan.oh].forEach(function (a) { var at = mig.mol.atom(a); mig.anim.start[a] = { x: at.x, y: at.y }; });
            this.anim.retning = {};
            var c = this.mol.atom(this.c), o = this.mol.atom(plan.o);
            this.anim.retning[plan.h] = enhed(this.mol.atom(plan.h), c);
            this.anim.retning[plan.oh] = enhed(this.mol.atom(plan.oh), o);
        }
        this.fase = "anim";
        this.besked("", "");
        this.visKort();
    };

    function enhed(a, fra) {
        var dx = a.x - fra.x, dy = a.y - fra.y, l = Math.hypot(dx, dy) || 1;
        return { x: dx / l, y: dy / l };
    }

    P.efterAnim = function () {
        var a = this.anim;
        if (a.plan.slags === "alkohol") K.udfoer(this.mol, this.c, a.plan);
        this.anim = null;
        this.prod = null;
        /* Direkte videre til naeste spoergsmaal: kortet sagde foer Oxidér, hvad
           der dannes (brugerens oenske 3. nov. 2026: et klik mindre). nytTrin
           skjuler oxidationstallene, for det nye stofs tal er spoergsmaalet */
        this.nytTrin();
    };

    /* Serien er slut: carbonatomet har ingen hydrogenatomer tilbage */
    P.slutSerie = function (vist, foran) {
        var s = this.status[this.nr], navn = this.stof.navn, t = this.trin;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv);
        this.gem();
        var tekst = (foran ? foran + " " : "") + "Carbonatomet med " + (t.length > 1 ? "den funktionelle gruppe" : "OH-gruppen") + " har ingen hydrogenatomer, så " + navn +
            (t.length > 1 ? " kan ikke oxideres videre." : " kan ikke oxideres.");
        if (t.length > 1) {
            tekst += " Oxidationstallet steg fra " + t.map(function (x) { return D.rom(x.ox); }).join(" til ") + ", altså 2 ved hver oxidation.";
        }
        tekst += " " + { primaer: "En primær alkohol kan oxideres to gange.", sekundaer: "En sekundær alkohol kan oxideres én gang.",
            tertiaer: "En tertiær alkohol kan ikke oxideres." }[this.serie.type];
        var alle = this.status.every(function (x) { return x.loest; });
        var naeste = this.naesteUloeste();
        var knap = naeste >= 0 ? "Næste alkohol: " + D.SERIER[naeste].navn + " →" : "Videre til Hvad dannes? →";
        if (alle) tekst += " " + D.FAERDIG.o;
        this.groen = { spm: true, svarNr: this.sidsteSvar, kortChip: "Trin " + t.length, maade: vist || this.sv ? "svar" : "selv", fed: "", tekst: tekst, knap: knap,
            maerke: vist ? "Svaret" : "Slut", chip: vist ? "Svaret" : "Slut ✓" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        NK.konfetti(this.el.skort, alle ? 80 : 40);
    };

    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-p");
        this.vaelg((this.nr + 1) % D.SERIER.length);
    };

    /* ----- Hjaelpen ----------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen || this.fase === "anim") return [];
        if (this.fase === "h") return ["Tryk på den blå knap Oxidér på kortet."];
        var t = K.optael(this.mol, this.c);
        var dele = [];
        if (t.H) dele.push(t.H + (t.H === 1 ? " binding" : " bindinger") + " til H");
        if (t.O) dele.push(t.O + (t.O === 1 ? " binding" : " bindinger") + " til O" + (t.dobbeltO ? " (dobbeltbindingen tæller som 2)" : ""));
        if (t.C) dele.push(t.C + (t.C === 1 ? " binding" : " bindinger") + " til C");
        return ["Se på bindingerne fra det markerede carbonatom. En binding til H tæller −1, en binding til O +1 og en binding til C 0.",
            "Det markerede carbonatom har " + dele.join(", ").replace(/, ([^,]*)$/, " og $1") + ". Læg tallene sammen."];
    };

    /* Det foerste hint om oxidationstallet viser elektronparrene */
    P.efterHint = function (n) {
        if (this.fase === "ox" && n === 1 && !this.visPar) this.saetPar(true);
    };

    P.visSvar = function () {
        /* Oxidér er ikke et svar: knappen goer det bare og koster intet */
        if (this.fase === "h") { this.oxider(); return; }
        if (this.fase !== "ox") return;
        this.sv = true;
        this.valgt = D.OXTAL.indexOf(K.oxtal(this.mol, this.c));
        this.indsendOx(true);
    };

    /* ----- Klik i formlen: spoergsmaalet og knappen staar paa kortet ----------------- */
    P.atomVed = function (pt) {
        if (!this.geo) return null;
        var bedst = null, bd = this.s * 0.32, mol = this.mol, g = this.geo;
        mol.atomer.forEach(function (a) {
            var p = g.P[a.id];
            if (!p) return;
            var d = Math.hypot(pt.x - p.x, pt.y - p.y);
            if (d < bd) { bd = d; bedst = a.id; }
        });
        return bedst;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "anim") return;
        if (this.atomVed(pt) !== null) this.kortBlink();
    };

    P.nulstil = function () {
        if (this.groen) return;
        this.vaelg(this.nr);
    };

    /* ----- Tegningen ---------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        /* Fast skala for hele serien, saa formlen ikke hopper, naar den aendrer sig.
           Navnet og regnestykket staar til venstre for formlen, naar tavlen er
           bred nok eller lav; ellers under den. Bindingerne er lange og
           molekylet stort, saa elektronparrene kan ses flytte sig */
        if (!this.b) return;
        var g = K.graenser(this.b), bw = g.x1 - g.x0 + 1.3, bh = g.y1 - g.y0 + 1.3;
        this.tekstSide = t.b >= 860 || t.h < 440;
        var fx, fy, fb, fh;
        if (this.tekstSide) { fx = t.x + 250; fy = t.y + 14; fb = t.b - 270; fh = t.h - 28; }
        else { fx = t.x + 20; fy = t.y + 14; fb = t.b - 40; fh = t.h - 120; }
        this.s = Math.max(34, Math.min(fb / bw, fh / bh, 112));
        this.ox0 = fx + fb / 2 - ((g.x0 + g.x1) / 2) * this.s;
        this.oy0 = fy + fh / 2 - ((g.y0 + g.y1) / 2) * this.s;
    };

    P.opdaterScene = function (dt) {
        if (this.visPar && this.parT < 1) this.parT = Math.min(1, this.parT + dt / 0.9);
        if (this.oxVist && this.oxT < 1) this.oxT = Math.min(1, (this.oxT || 0) + dt / 0.6);
        if (this.anim) {
            this.anim.t += dt;
            if (this.anim.t >= this.anim.varighed) this.efterAnim();
        }
    };

    /* Skriften foelger ikke skalaen helt med, saa et stort molekyle ikke faar
       kaempebogstaver; bindingerne bliver lange i stedet */
    P.skrift = function () { return NK.klamp(this.s * 0.28, 15, 28); };

    /* Den del af animationen, der er gaaet (0 til 1), blod i begge ender */
    P.animF = function () {
        if (!this.anim) return 1;
        var f = NK.klamp(this.anim.t / this.anim.varighed, 0, 1);
        return f * f * (3 - 2 * f);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.mol) return;
        var tv = lay.tavle, s = this.s, mol = this.mol, a = this.anim, f = this.animF();

        /* Atomer, der er paa vej ud eller ind, faar en gennemsigtig farve */
        var alfa = {};
        if (a && a.plan.slags === "alkohol") {
            [a.plan.h, a.plan.oh].forEach(function (id) {
                var st = a.start[id], r = a.retning[id], at = mol.atom(id);
                at.x = st.x + r.x * 1.1 * f;
                at.y = st.y + r.y * 1.1 * f;
                alfa[id] = 1 - f;
            });
            mol.binding(this.c, a.plan.o).orden = f > 0.45 ? 2 : 1;
        } else if (a && a.plan.slags === "aldehyd") {
            var h = mol.atom(a.plan.h);
            h.x = a.plan.fra.x + (a.plan.nytH.x - a.plan.fra.x) * f;
            h.y = a.plan.fra.y + (a.plan.nytH.y - a.plan.fra.y) * f;
            /* Det nye O kommer frem der, hvor H sad, og glider ud bag det */
            var nyO = mol.atom(a.nytO);
            nyO.x = a.plan.fra.x + (a.plan.nytO.x - a.plan.fra.x) * f;
            nyO.y = a.plan.fra.y + (a.plan.nytO.y - a.plan.fra.y) * f;
            alfa[a.nytO] = f;
        }
        function farve(al) { return al === undefined ? null : "rgba(29, 36, 51, " + al.toFixed(3) + ")"; }
        /* Atomerne har altid grundstoffets farve, ogsaa naar de toner ud eller ind */
        function atomFarve(id) {
            var at = mol.atom(id), f = PRIK[at.el] || BLAEK;
            return alfa[id] === undefined ? f : medAlfa(f, alfa[id]);
        }
        this.geo = NK.Struktur.geometri(mol, {
            skala: s, ox: this.ox0, oy: this.oy0, stil: "alle", farve: BLAEK,
            skrift: this.skrift(), linje: NK.klamp(s * 0.04, 2, 3.4),
            atomFarve: atomFarve,
            bindingFarve: function (bd) {
                var al = alfa[bd.a] !== undefined ? alfa[bd.a] : alfa[bd.b];
                return farve(al);
            }
        });
        var g = this.geo, pc = g.P[this.c];

        /* Det markerede carbonatom: gult, naar kortet spoerger om det, ellers
           bogens groenblaa ring */
        var puls = 0.5 + 0.5 * Math.sin(this.tid * 4);
        if (this.fase === "ox" && !this.groen) F.ring(ctx, pc, s * (0.3 + 0.03 * puls), GUL, GUL_FYLD, 4);
        else F.ring(ctx, pc, s * 0.3, TEAL, TEAL_FYLD, 3);
        /* Under oxidationen faar de hydrogenatomer, der forlader molekylet, en gul ring */
        if (a) {
            var ud = a.plan.slags === "alkohol" ? [a.plan.h, a.plan.oh] : [a.plan.h];
            ud.forEach(function (id) {
                if (g.P[id]) F.ring(ctx, g.P[id], s * 0.24, "rgba(214, 158, 12, " + (1 - f * 0.8).toFixed(2) + ")", "rgba(242, 197, 61, " + (0.3 * (1 - f)).toFixed(2) + ")", 3);
            });
        }
        NK.Struktur.tegnGeo(ctx, g);

        if (!a) {
            /* Pladserne regnes altid i samme raekkefoelge, saa et tal ikke
               flytter sig, naar en kontakt slaas til eller fra */
            this.optaget = this.optagetPunkter();
            var oxP = this.pladser("ox");
            var enP = this.pladser("en");
            if (this.visPar) this.tegnPar(ctx);
            if (this.visEN) this.tegnTal(ctx, enP, 1);
            if (this.oxVist) this.tegnTal(ctx, oxP, this.oxT === undefined ? 1 : this.oxT);
        }
        this.tegnTekst(ctx, tv);
        this.tegnSejr(ctx, tv);
    };

    /* ----- Pladsen til tallene ---------------------------------------------------
       Oxidationstallene og elektronegativiteten maa ikke ligge oven i atomer,
       bindinger eller hinanden. optaget er punkter i pixels: atomerne, tre
       punkter langs hver binding og de tal, der allerede har faaet en plads.
       Tallene staar helt inde ved atomets bogstav (brugeren: "endnu tættere
       på stamatomet"), saa afstanden regnes af bogstavets og tallets stoerrelse.
       Ved et carbonatom eller et O med to bindinger staar oxidationstallet
       skraat oppe til hoejre (som en ladning) og elektronegativiteten skraat
       nede til hoejre, som i sc8.2; et andet hjoerne kun, hvis der er en
       binding. Ved et endeatom (H, =O) staar oxidationstallet lige ud for
       atomet i bindingens forlaengelse og elektronegativiteten skraat bag
       atomet, saa tallene aldrig kommer ind mellem to atomer. */
    var OX_HJ = [[1, -1], [-1, -1], [1, 1], [-1, 1]];
    var EN_HJ = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

    P.optagetPunkter = function () {
        var g = this.geo, ud = [];
        this.mol.atomer.forEach(function (a) { if (g.P[a.id]) ud.push(g.P[a.id]); });
        this.mol.bindinger.forEach(function (bd) {
            var A = g.P[bd.a], B = g.P[bd.b];
            if (!A || !B) return;
            [0.25, 0.5, 0.75].forEach(function (f) { ud.push({ x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f }); });
        });
        return ud;
    };

    /* Tallet ved et atom: teksten, skriften og farven */
    P.etiket = function (slags, at) {
        var s = this.s, er = at.id === this.c;
        if (slags === "ox") {
            return { t: D.rom(K.oxtal(this.mol, at.id)), px: Math.round(er ? NK.klamp(s * 0.22, 16, 24) : NK.klamp(s * 0.17, 13, 18)),
                vaegt: "800", farve: er ? OXFARVE : BLAEK, kant: 4 };
        }
        return { t: String(D.EN[at.el]).replace(".", ","), px: Math.round(NK.klamp(s * 0.15, 12, 16)),
            vaegt: "700", farve: PRIK[at.el], kant: 3 };
    };

    /* En plads til hvert atoms tal: id -> { x, y, e } (midten af tallet) */
    P.pladser = function (slags) {
        var mig = this, ctx = this.L.ctx, g = this.geo, s = this.s, c = this.c, mol = this.mol, opt = this.optaget, ud = {};
        var hw = this.skrift() * 0.36, hh = this.skrift() * 0.38;    /* det halve bogstav */
        var R = s * 0.3 * 0.68;                                       /* inden for ringen om det markerede C */
        var luft = slags === "ox" ? 2 : 4;
        var hj = slags === "ox" ? OX_HJ : EN_HJ;
        function fri(pt) {
            var d = Infinity;
            opt.forEach(function (o) { d = Math.min(d, Math.hypot(pt.x - o.x, pt.y - o.y)); });
            return d;
        }
        mol.atomer.forEach(function (at) {
            var p = g.P[at.id];
            if (!p) return;
            var e = mig.etiket(slags, at);
            ctx.save();
            ctx.font = e.vaegt + " " + e.px + "px 'Segoe UI', sans-serif";
            var w = ctx.measureText(e.t).width;
            ctx.restore();
            var lh = e.px * 0.72, er = at.id === c;
            /* Midten af tallet, naar det skal staa i retningen (ux, uy) fra atomet.
               Lige ud (op, ned, til siden) og i et hjoerne (skraat) */
            function ved(ux, uy) {
                var x, y;
                if (Math.abs(uy) < 0.35) { x = Math.sign(ux) * (hw + luft + 1 + w / 2); y = uy * (hh + lh / 2); }
                else if (Math.abs(ux) < 0.35) { x = ux * (hw + w / 2); y = Math.sign(uy) * (hh + luft + 1 + lh / 2); }
                else {
                    x = Math.sign(ux) * (hw + luft + w / 2);
                    y = Math.sign(uy) * (hh * 0.75 + luft + lh / 2);
                    /* Det markerede carbonatom har en ring: tallet staar lige uden for den */
                    if (er) { x = Math.sign(ux) * Math.max(Math.abs(x), R + w / 2); y = Math.sign(uy) * Math.max(Math.abs(y), R + lh / 2); }
                }
                return { x: p.x + x, y: p.y + y };
            }
            function saet(pt) { pt.e = e; opt.push(pt); ud[at.id] = pt; }
            var nb = mol.naboer(at.id), vaek = null;
            if (nb.length === 1 && g.P[nb[0]]) {
                var q = g.P[nb[0]], l = Math.hypot(p.x - q.x, p.y - q.y) || 1;
                vaek = { x: (p.x - q.x) / l, y: (p.y - q.y) / l };
            }
            /* Endeatomet: oxidationstallet lige ud for atomet */
            if (slags === "ox" && vaek) {
                var lige = ved(vaek.x, vaek.y);
                if (fri(lige) >= Math.hypot(lige.x - p.x, lige.y - p.y) - 1) { saet(lige); return; }
            }
            /* Endeatomet: elektronegativiteten 60 grader fra bindingens forlaengelse,
               til den side, der er friest (helst nedad og til hoejre) */
            if (slags === "en" && vaek) {
                var to = [Math.PI / 3, -Math.PI / 3].map(function (v) {
                    var cs = Math.cos(v), sn = Math.sin(v);
                    var ux = vaek.x * cs - vaek.y * sn, uy = vaek.x * sn + vaek.y * cs;
                    var pt = { x: p.x + ux * (hw + luft + w / 2), y: p.y + uy * (hh + luft + lh / 2) };
                    return { pt: pt, d: fri(pt), vej: pt.x - p.x + pt.y - p.y };
                });
                var fb = Math.max(to[0].d, to[1].d);
                to = to.filter(function (x) { return x.d >= fb - 5; }).sort(function (a, b) { return b.vej - a.vej; });
                if (to[0].d >= hw) { saet(to[0].pt); return; }
            }
            /* Ellers et skraat hjoerne: det foerste i listen, medmindre et andet er
               tydeligt friere. Et endeatom proever foerst hjoernerne bag sig */
            var k = hj.map(function (h, i) {
                var pt = ved(h[0], h[1]);
                var prik = vaek ? Math.round((h[0] * vaek.x + h[1] * vaek.y) * 10) : 0;
                return { pt: pt, d: fri(pt), prik: prik, i: i };
            });
            k.sort(function (a, b) { return b.prik - a.prik || a.i - b.i; });
            var bedst = Math.max.apply(null, k.map(function (x) { return x.d; }));
            saet(k.filter(function (x) { return x.d >= bedst - 5; })[0].pt);
        });
        return ud;
    };

    /* Elektronparrene paa alle bindinger. De glider fra midten af bindingen
       over til det mest elektronegative atom; mellem to ens atomer bliver
       parret i midten. Hver prik har farven fra det atom, den kom fra */
    P.tegnPar = function (ctx) {
        var g = this.geo, s = this.s, mol = this.mol;
        var t = this.parT * this.parT * (3 - 2 * this.parT), r = NK.klamp(s * 0.06, 3.5, 7);
        var naer = this.skrift() * 0.55 + r * 2.4;     /* lige uden for atomets bogstav */
        mol.bindinger.forEach(function (bd) {
            var A = g.P[bd.a], B = g.P[bd.b];
            if (!A || !B) return;
            var elA = mol.atom(bd.a).el, elB = mol.atom(bd.b).el;
            var dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1;
            var ux = dx / l, uy = dy / l;
            var midt = l / 2, maal = midt;
            if (D.EN[elB] > D.EN[elA]) maal = l - naer;
            else if (D.EN[elB] < D.EN[elA]) maal = naer;
            var pos = midt + (maal - midt) * t;
            for (var k = 0; k < bd.orden; k++) {
                var side = bd.orden === 1 ? 0 : (k === 0 ? 0.1 : -0.1);
                var bx = A.x + ux * pos - uy * s * side, by = A.y + uy * pos + ux * s * side;
                [[-1, PRIK[elA]], [1, PRIK[elB]]].forEach(function (p) {
                    ctx.beginPath();
                    ctx.arc(bx + ux * p[0] * r * 1.15, by + uy * p[0] * r * 1.15, r, 0, Math.PI * 2);
                    ctx.fillStyle = p[1];
                    ctx.fill();
                    ctx.lineWidth = 1.2;
                    ctx.strokeStyle = "#ffffff";
                    ctx.stroke();
                });
            }
        });
    };

    /* Tallene ved atomerne. Oxidationstallene toner frem, naar de kommer */
    P.tegnTal = function (ctx, pladser, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa;
        Object.keys(pladser).forEach(function (id) {
            var p = pladser[id], e = p.e;
            NK.tekst(ctx, e.t, p.x, p.y, {
                font: e.vaegt + " " + e.px + "px 'Segoe UI', sans-serif",
                farve: e.farve, justering: "center", linje: "middle",
                kant: true, kantFarve: "rgba(255, 255, 255, 0.95)", kantBredde: e.kant
            });
        });
        ctx.restore();
    };

    /* Under formlen, som i bogens figur: navnet, oxidationstallet og regnestykket */
    P.tegnTekst = function (ctx, tv) {
        var side = this.tekstSide, just = side ? "left" : "center";
        var x = side ? tv.x + 26 : tv.x + tv.b / 2, y = side ? tv.y + tv.h / 2 - 46 : tv.y + tv.h - 82;
        var navn = this.anim ? this.anim.fra : this.stof.navn;
        var kl = this.anim ? null : D.KLASSER[this.stof.klasse];
        NK.tekst(ctx, navn + (kl ? "  ·  " + kl.navn : ""), x, y, {
            font: "700 19px 'Segoe UI', sans-serif", farve: "#1d2433", justering: just, linje: "middle"
        });
        if (this.oxVist && !this.anim) {
            var ox = K.oxtal(this.mol, this.c);
            NK.tekst(ctx, D.rom(ox), x, y + 30, {
                font: "800 26px 'Segoe UI', sans-serif", farve: OXFARVE, justering: just, linje: "middle"
            });
            /* Regnestykket: paa én linje under formlen, eller én del pr. linje ved siden af */
            var dele = side ? K.regnestykke(this.mol, this.c).split(", ") : [K.regnestykke(this.mol, this.c)];
            dele.forEach(function (d, i) {
                NK.tekst(ctx, d, x, y + 58 + i * 19, {
                    font: "600 14px 'Segoe UI', sans-serif", farve: "#5d6878", justering: just, linje: "middle"
                });
            });
        } else if (!this.anim) {
            NK.tekst(ctx, "oxidationstal: ?", x, y + 30, {
                font: "700 17px 'Segoe UI', sans-serif", farve: "#9aa3b0", justering: just, linje: "middle"
            });
        }
    };

    NK.SimOxtal = SimOxtal;
}());
