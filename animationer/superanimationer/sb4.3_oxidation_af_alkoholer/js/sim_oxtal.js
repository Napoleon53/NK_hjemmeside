/* =====================================================================
   sim_oxtal.js - fane 1: Oxidationstallet

   Afloeser den gamle b5.3 (ethanol → ethanal → ethansyre med
   elektronegativitet og elektronforskydning). Her goer eleven det selv,
   og tre alkoholer viser bogens tre typer.

   Hver alkohol oxideres trin for trin. Et trin har to spoergsmaal:
     ox   hvad er oxidationstallet for det markerede carbonatom? Eleven
          vaelger et romertal paa kortet og trykker Indsend svar. Er det
          rigtigt, staar tallet og regnestykket under formlen, og hver
          binding faar sit tal (−1, +1, 0)
     h    oxidationsmidlet tager et hydrogenatom fra det markerede
          carbonatom: eleven klikker paa det (eller vaelger "Intet
          hydrogenatom") og trykker Indsend svar. Saa oxideres molekylet
          (K.plan og K.udfoer i kemi.js), og et nyt trin begynder
   Har carbonatomet ikke flere hydrogenatomer, er serien slut.

   Elektronparrene (kontakten i panelet) staar paa det markerede
   carbonatoms bindinger og glider over til det mest elektronegative
   atom. Prikkerne har farven fra det atom, elektronen kom fra (som i
   den gamle b5.3 og i sc8.2).

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
    var PRIK = { C: "#4b5563", H: "#2563eb", O: "#d23b2c" };

    function SimOxtal() {
        var mig = this;
        this.hentStatus();
        this.visPar = false;
        this.visEN = false;
        this.parT = 0;
        this.startFane();
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
        return {
            slags: "opgave", chip: "Oxidation",
            tekst: "Oxidationsmidlet tager et hydrogenatom fra det markerede carbonatom i " + navn + ". Klik på hydrogenatomet, og tryk Indsend svar. Er der intet, så vælg det nedenfor.",
            svar: this.fase === "anim" ? [] : [{ t: "Carbonatomet har intet hydrogenatom", valgt: this.valgt === "intet", forkert: !!this.forkert.intet }]
        };
    };

    P.svarValg = function (j) {
        if (this.fase === "ox") this.valgt = this.valgt === j ? null : j;
        else if (this.fase === "h") this.valgt = this.valgt === "intet" ? null : "intet";
        this.visKort();
    };

    P.kanSendes = function () { return this.fase !== "anim" && this.valgt !== null && this.valgt !== undefined; };

    P.indsendTekst = function () {
        if (this.fase === "ox" && this.valgt !== null) return "Indsend svar: " + D.rom(D.OXTAL[this.valgt]);
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.fase === "ox") return "Vælg et oxidationstal på kortet først.";
        return "Klik på et hydrogenatom i formlen, eller vælg Carbonatomet har intet hydrogenatom.";
    };

    /* ----- Indsend svar ------------------------------------------------------------ */
    P.indsend = function () {
        if (this.fase === "ox") this.indsendOx(false);
        else if (this.fase === "h") this.indsendH(false);
    };

    P.indsendOx = function (vist) {
        var v = D.OXTAL[this.valgt], rigtig = K.oxtal(this.mol, this.c);
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
        this.oxVist = true;
        this.sejrT = 0;
        this.fase = "h";
        this.valgt = null;
        this.forkert = {};
        this.nulstilHjaelp();
        this.visKort();
        var tekst = K.regnestykke(this.mol, this.c) + ". I alt " + D.rom(rigtig) + ".";
        if (forrige !== null) tekst += " Oxidationstallet steg " + D.fortegn(rigtig - forrige).replace("+", "") + ".";
        this.godLinje(tekst, vist ? "Svaret" : "Rigtigt ✓");
        this.visTrappe();
    };

    P.indsendH = function (vist) {
        var h = this.hAtomer(), mig = this;
        if (this.valgt === "intet") {
            if (h.length) {
                this.forkert.intet = true;
                this.fejl = true;
                this.valgt = null;
                this.visKort();
                this.fejlLinje("Se igen. Det markerede carbonatom har " + (h.length === 1 ? "ét hydrogenatom" : D.TAL[h.length] + " hydrogenatomer") + ".");
                return;
            }
            this.slutSerie(vist);
            return;
        }
        var id = this.valgt;
        var plan = K.plan(this.mol, this.c, id);
        if (!plan) {
            this.fejl = true;
            this.valgt = null;
            var oh = K.ohPaa(this.mol, this.c);
            this.visKort();
            if (oh && oh.h === id) this.fejlLinje("Det hydrogenatom sidder på oxygenatomet. Det forsvinder også, men oxidationsmidlet skal have et hydrogenatom fra selve det markerede carbonatom.");
            else if (!h.length) this.fejlLinje("Det hydrogenatom sidder på et andet carbonatom. Se efter hydrogenatomer på selve det markerede carbonatom.");
            else this.fejlLinje("Det hydrogenatom sidder på et andet carbonatom. Det er det markerede carbonatom, der bliver oxideret.");
            return;
        }
        /* Oxidationen: aldehyd til syre udfoeres med det samme, og H glider ud,
           mens det nye O kommer frem. Alkohol til C=O udfoeres til sidst. */
        var fra = this.stof.navn;
        this.anim = { plan: plan, t: 0, varighed: 1.5, fra: fra, vist: vist };
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
        this.valgt = null;
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
        this.nytTrin();
        var kl = D.KLASSER[this.stof.klasse];
        this.godLinje(D.stor(a.fra) + " er oxideret til " + this.stof.navn + (kl ? ", " + kl.ental : "") + ".", a.vist ? "Svaret" : "Oxideret ✓");
    };

    /* Serien er slut: carbonatomet har ingen hydrogenatomer tilbage */
    P.slutSerie = function (vist) {
        var s = this.status[this.nr], navn = this.stof.navn, t = this.trin;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv);
        this.gem();
        var tekst = "Carbonatomet med " + (t.length > 1 ? "den funktionelle gruppe" : "OH-gruppen") + " har ingen hydrogenatomer, så " + navn +
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
        this.groen = { maade: vist || this.sv ? "svar" : "selv", fed: "", tekst: tekst, knap: knap, chip: vist ? "Svaret" : "Slut ✓" };
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
        var t = K.optael(this.mol, this.c);
        if (this.fase === "ox") {
            var dele = [];
            if (t.H) dele.push(t.H + (t.H === 1 ? " binding" : " bindinger") + " til H");
            if (t.O) dele.push(t.O + (t.O === 1 ? " binding" : " bindinger") + " til O" + (t.dobbeltO ? " (dobbeltbindingen tæller som 2)" : ""));
            if (t.C) dele.push(t.C + (t.C === 1 ? " binding" : " bindinger") + " til C");
            return ["Se på bindingerne fra det markerede carbonatom. En binding til H tæller −1, en binding til O +1 og en binding til C 0.",
                "Det markerede carbonatom har " + dele.join(", ").replace(/, ([^,]*)$/, " og $1") + ". Læg tallene sammen."];
        }
        var n = this.hAtomer().length;
        return ["Oxidationsmidlet tager et hydrogenatom, der sidder direkte på det markerede carbonatom, ikke på oxygenatomet eller på et andet carbonatom.",
            n ? "Det markerede carbonatom har " + (n === 1 ? "ét hydrogenatom" : D.TAL[n] + " hydrogenatomer") + ". Klik på " + (n === 1 ? "det" : "et af dem") + "."
              : "Se på de fire bindinger fra det markerede carbonatom. Går nogen af dem til H?"];
    };

    /* Det foerste hint om oxidationstallet viser elektronparrene */
    P.efterHint = function (n) {
        if (this.fase === "ox" && n === 1 && !this.visPar) this.saetPar(true);
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "ox") {
            this.valgt = D.OXTAL.indexOf(K.oxtal(this.mol, this.c));
            this.indsendOx(true);
            return;
        }
        if (this.fase === "h") {
            var h = this.hAtomer();
            this.valgt = h.length ? h[0] : "intet";
            this.indsendH(true);
        }
    };

    /* ----- Klik i formlen ------------------------------------------------------------- */
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

    P.overScene = function (pt) {
        this.over = null;
        if (!pt || this.groen || this.fase !== "h") return null;
        var id = this.atomVed(pt);
        if (id !== null && this.mol.atom(id).el === "H") this.over = id;
        return this.over !== null ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "anim") return;
        var id = this.atomVed(pt);
        if (this.fase === "ox") {
            if (id !== null) this.kortBlink();
            return;
        }
        if (id === null) return;
        if (this.mol.atom(id).el !== "H") {
            this.kortBesked("Klik på et hydrogenatom. Oxidationsmidlet tager et H fra det markerede carbonatom.", 3.5);
            return;
        }
        this.valgt = this.valgt === id ? null : id;
        this.visKort();
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
           Er tavlen lav (en baerbar), staar navnet og regnestykket til venstre
           for formlen i stedet for under den */
        this.tekstSide = t.h < 440;
        if (this.tekstSide) {
            var sideB = 250;
            this.s = Math.max(30, Math.min((t.b - sideB - 40) / 4.6, (t.h - 36) / 3.6, 132));
            this.ox0 = t.x + sideB + (t.b - sideB) / 2;
            this.oy0 = t.y + t.h / 2;
        } else {
            var bundTekst = 92, molH = t.h - bundTekst - 34;
            this.s = Math.max(30, Math.min((t.b - 60) / 4.6, molH / 3.6, 132));
            this.ox0 = t.x + t.b / 2;
            this.oy0 = t.y + 22 + molH / 2;
        }
    };

    P.opdaterScene = function (dt) {
        if (this.visPar && this.parT < 1) this.parT = Math.min(1, this.parT + dt / 0.9);
        if (this.anim) {
            this.anim.t += dt;
            if (this.anim.t >= this.anim.varighed) this.efterAnim();
        }
    };

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
        this.geo = NK.Struktur.geometri(mol, {
            skala: s, ox: this.ox0, oy: this.oy0, stil: "alle", farve: BLAEK,
            skrift: NK.klamp(s * 0.34, 15, 30), linje: NK.klamp(s * 0.045, 2, 3.6),
            atomFarve: function (id) { return farve(alfa[id]); },
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
        if (this.fase === "h" && !this.groen) {
            if (this.over !== null && this.over !== this.valgt && g.P[this.over]) F.ring(ctx, g.P[this.over], s * 0.24, "rgba(214, 158, 12, 0.9)", "rgba(242, 197, 61, 0.18)", 2.5);
            if (typeof this.valgt === "number" && g.P[this.valgt]) F.ring(ctx, g.P[this.valgt], s * (0.25 + 0.03 * puls), GUL, GUL_FYLD, 4);
        }
        NK.Struktur.tegnGeo(ctx, g);

        if (!a) {
            this.optaget = this.optagetPunkter();
            if (this.visPar) this.tegnPar(ctx);
            if (this.oxVist) this.tegnBindingstal(ctx);
            if (this.visEN) this.tegnEN(ctx);
        }
        this.tegnTekst(ctx, tv);
        this.tegnSejr(ctx, tv);
    };

    /* ----- Pladsen til tallene ---------------------------------------------------
       Tallene ved bindingerne og elektronegativiteten maa ikke ligge oven i
       atomer, bindinger eller hinanden. optaget er punkter i pixels: atomerne
       og fire punkter langs hver binding. plads vaelger den kandidat, der
       ligger laengst fra alt optaget, og laegger den til. */
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

    P.plads = function (kandidater) {
        var opt = this.optaget, bedst = kandidater[0], bedstD = -1;
        kandidater.forEach(function (k) {
            var d = Infinity;
            opt.forEach(function (o) { d = Math.min(d, Math.hypot(k.x - o.x, k.y - o.y)); });
            if (d > bedstD + 0.5) { bedstD = d; bedst = k; }
        });
        opt.push(bedst);
        return bedst;
    };

    /* Tallet ved hver binding fra det markerede carbonatom: −1, +1, +2 eller 0.
       Ved en binding til et endeatom (H, =O) staar tallet gerne lige uden for
       atomet; ellers ved siden af bindingens midte */
    P.tegnBindingstal = function (ctx) {
        var mig = this, g = this.geo, s = this.s, c = this.c, pc = g.P[c], mol = this.mol;
        K.bindingerFra(mol, c).forEach(function (b) {
            var pn = g.P[b.nabo], dx = pn.x - pc.x, dy = pn.y - pc.y, l = Math.hypot(dx, dy) || 1;
            var ux = dx / l, uy = dy / l, mx = pc.x + dx / 2, my = pc.y + dy / 2, d = s * 0.27;
            var k = [{ x: mx - uy * d, y: my + ux * d }, { x: mx + uy * d, y: my - ux * d }];
            if (mol.naboer(b.nabo).length === 1) k.unshift({ x: pn.x + ux * s * 0.4, y: pn.y + uy * s * 0.4 });
            var p = mig.plads(k);
            NK.tekst(ctx, D.fortegn(b.tal), p.x, p.y, {
                font: "800 " + Math.round(NK.klamp(s * 0.21, 13, 22)) + "px 'Segoe UI', sans-serif",
                farve: b.tal > 0 ? PLUS : (b.tal < 0 ? MINUS : NUL), justering: "center", linje: "middle",
                kant: true, kantFarve: "rgba(255, 255, 255, 0.95)", kantBredde: 4
            });
        });
    };

    /* Elektronparrene paa det markerede carbonatoms bindinger. De glider fra
       midten af bindingen over til det mest elektronegative atom */
    P.tegnPar = function (ctx) {
        var g = this.geo, s = this.s, c = this.c, pc = g.P[c], mol = this.mol;
        var t = this.parT * this.parT * (3 - 2 * this.parT), r = NK.klamp(s * 0.055, 3, 6);
        K.bindingerFra(mol, c).forEach(function (b) {
            var pn = g.P[b.nabo], dx = pn.x - pc.x, dy = pn.y - pc.y, l = Math.hypot(dx, dy) || 1;
            var ux = dx / l, uy = dy / l;
            var midt = l / 2, maal = midt;
            if (b.tal > 0) maal = l - s * 0.32;
            else if (b.tal < 0) maal = s * 0.34;
            var pos = midt + (maal - midt) * t;
            for (var k = 0; k < b.orden; k++) {
                var side = b.orden === 1 ? 0 : (k === 0 ? 0.1 : -0.1);
                var bx = pc.x + ux * pos - uy * s * side, by = pc.y + uy * pos + ux * s * side;
                [[-1, PRIK.C], [1, PRIK[b.el]]].forEach(function (p) {
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

    /* Elektronegativiteten ved det markerede carbonatom og dets naboer, i et
       af de otte hjoerner rundt om atomet, hvor der er plads */
    P.tegnEN = function (ctx) {
        var mig = this, g = this.geo, s = this.s, mol = this.mol, c = this.c;
        [c].concat(mol.naboer(c)).forEach(function (id) {
            var p = g.P[id], e = mol.atom(id).el, k = [];
            for (var i = 0; i < 8; i++) {
                var v = (i * 45 + 45) * Math.PI / 180;
                k.push({ x: p.x + Math.cos(v) * s * 0.4, y: p.y + Math.sin(v) * s * 0.4 });
            }
            var q = mig.plads(k);
            NK.tekst(ctx, String(D.EN[e]).replace(".", ","), q.x, q.y, {
                font: "700 " + Math.round(NK.klamp(s * 0.16, 12, 16)) + "px 'Segoe UI', sans-serif",
                farve: "#6b4fc4", justering: "center", linje: "middle",
                kant: true, kantFarve: "rgba(255, 255, 255, 0.95)", kantBredde: 3
            });
        });
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
