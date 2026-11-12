/* =====================================================================
   sim_ukendt.js - fane 4: Ukendt prøve

   Eleven faar udleveret et rumfang af en ukendt syre eller base og en
   buret med kendt titrator. Opgaven er den samme som i laboratoriet:
   find ækvivalensvolumenet, regn koncentrationen ud - og aflaes pKs i
   halvtitrerpunktet, hvis stoffet er svagt.

   Proeven maales med pH-meter alene. Der er ingen indikator, saa man
   skal bruge kurven, ikke en farve.

   Papirkortet (6. nov. 2026, ../faelles/papirkort.css og papirkort.js):
   opgaven, hint, bedoemmelsen og knapperne staar paa et lyst kort oeverst
   i midten af scenen. Felterne bliver i panelet. Indsend svar er graa,
   til der staar noget i et felt, og Enter i et felt er det samme. Giv et
   hint giver to eller tre hint og derefter Vis svaret. Er alt rigtigt (eller
   vist), bliver kortet paa opgaven med forklaringen, og Ny ukendt proeve
   staar, hvor Indsend svar stod. Apparatet tegnes under kortZone().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    /* Puljen, der traekkes fra. 'svag' afgoer, om der ogsaa spoerges
       om pKs. */
    var SYRER = ["eddikesyre", "myresyre", "propansyre", "benzoesyre", "maelkesyre",
                 "chloreddikesyre", "hf", "hno2", "acetylsalicylsyre", "hocl"];
    var BASER = ["ammoniak", "methylamin", "pyridin", "ethanolamin", "tris", "hydroxylamin"];
    var STAERKE_SYRER = ["hcl", "hno3"];
    var STAERKE_BASER = ["naoh", "koh"];

    var C_TITRATOR = [0.0500, 0.1000, 0.2000];
    var V_PROEVE = [10, 20, 25];
    var VMAKS = 30;      /* buretten er altid 30 mL, ligesom i laboratoriet */

    /* Hvor taet skal svaret vaere for at kunne godkendes. */
    var TOL_V = 0.02;      /* relativt */
    var TOL_C = 0.03;      /* relativt */
    var TOL_PKS = 0.35;    /* absolut */

    function vaelg(liste) {
        return liste[Math.floor(Math.random() * liste.length)];
    }

    function html(t) {
        return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /* Felterne i panelet: id, navnet i en saetning og om det spoerges */
    var FELTER = [
        { id: "ukendt-svar-v", noegle: "V", navn: "ækvivalensvolumenet" },
        { id: "ukendt-svar-c", noegle: "c", navn: "prøvens koncentration" },
        { id: "ukendt-svar-pks", noegle: "pKs", navn: "pKs" }
    ];

    /* Den tomme luft oeverst i apparatets tegning (enheder): maerkaten over
       buretten begynder ved 44, saa tegningen maa gaa lidt op under kortet. */
    var LEDIG_TOP = 40;

    NK.SimUkendt = function () {
        this.l = new NK.Laerred(NK.el("ukendt-laerred"));
        this.graf = new NK.Kurve(NK.el("ukendt-graf"), { kompakt: true });
        this.bord = new NK.Bord();
        this.bord.ind = Kemi.findIndikator("ingen");
        this.bord.flow = 0.5;
        this.opgave = null;
        this.markoer = null;
        this.afsloeret = false;
        this.hjaelp = 0;          /* hvor mange hint der er givet */
        this.loest = null;        /* null, "rigtig" eller "svar" (vist) */
        this.besked = null;       /* { html, klasse } i kortets nederste raekke */
        this.felt = {};           /* "ok" eller "fejl" pr. felt */
        this.el = {
            skort: NK.el("ukendt-skort"), ind: NK.el("ukendt-ind"), status: NK.el("ukendt-status"),
            besked: NK.el("ukendt-besked"), knap: NK.el("ukendt-knap"), indsend: NK.el("ukendt-indsend")
        };

        this.koblKnapper();
        this.nyOpgave();
    };

    /* ----- Ny opgave -------------------------------------------------- */
    NK.SimUkendt.prototype.nyOpgave = function () {
        var erSyre = Math.random() < 0.5;
        var svag = Math.random() < 0.72;
        var id;
        if (erSyre) id = svag ? vaelg(SYRER) : vaelg(STAERKE_SYRER);
        else id = svag ? vaelg(BASER) : vaelg(STAERKE_BASER);

        var stof = Kemi.findStof(id);
        var V0 = vaelg(V_PROEVE);
        var c = Math.round((0.02 + Math.random() * 0.13) * 1000) / 1000;
        var titrator = Kemi.findStof(erSyre ? "naoh" : "hcl");

        /* Vaelg en titratorkoncentration, saa aekvivalensvolumenet lander
           et sted inde i den 30 mL buret, med luft nok til at overtitrere
           lidt uden at loebe toer. */
        var cT = null, Vae = 0;
        var blandet = C_TITRATOR.slice().sort(function () { return Math.random() - 0.5; });
        for (var i = 0; i < blandet.length; i++) {
            var forsoeg = c * V0 / blandet[i];
            if (forsoeg >= 5 && forsoeg <= 24) { cT = blandet[i]; Vae = forsoeg; break; }
        }
        if (cT === null) {
            cT = Math.round(c * V0 / 15 * 10000) / 10000;
            Vae = c * V0 / cT;
        }

        var ops = {
            proeve: [{ stof: stof, c: c }],
            V0: V0,
            titrator: { stof: titrator, c: cT },
            Vmaks: VMAKS
        };

        this.opgave = {
            stof: stof,
            erSyre: erSyre,
            svag: svag,
            c: c,
            V0: V0,
            cT: cT,
            titrator: titrator,
            ops: ops,
            aekv: Kemi.aekvivalenspunkter(ops)
        };
        this.opgave.Vae = this.opgave.aekv.length ? this.opgave.aekv[0].V : Vae;
        this.opgave.pKs = stof.pKa.length ? stof.pKa[0] : NaN;

        this.afsloeret = false;
        this.bord.saetOps(ops);
        this.markoer = null;
        this.hjaelp = 0;
        this.loest = null;
        this.besked = null;
        this.felt = {};
        this.peg = false;

        NK.saetTekst("ukendt-titrator", NK.tal(cT, 4) + " M " + titrator.formel);
        NK.el("ukendt-pks-felt").style.display = svag ? "grid" : "none";
        FELTER.forEach(function (f) {
            var e = NK.el(f.id);
            e.value = "";
            e.disabled = false;
            e.classList.remove("ok", "fejl");
        });
        this.visKort();
    };

    /* ----- Papirkortet ------------------------------------------------- */
    NK.SimUkendt.prototype.opgaveTekst = function () {
        var o = this.opgave;
        return "Du har fået " + NK.tal(o.V0, 1) + " mL af en ukendt " + (o.svag ? "svag " : "stærk ") +
            (o.erSyre ? "syre" : "base") + ". I buretten står " + NK.tal(o.cT, 4) + " M " + o.titrator.formel + ". " +
            (o.svag ? "Hvad er ækvivalensvolumenet, prøvens koncentration og pKs?" : "Hvad er ækvivalensvolumenet og prøvens koncentration?");
    };

    /* De felter, opgaven spoerger om */
    NK.SimUkendt.prototype.felter = function () {
        var o = this.opgave;
        return FELTER.filter(function (f) { return f.noegle !== "pKs" || o.svag; });
    };

    NK.SimUkendt.prototype.hint = function () {
        var o = this.opgave, t = o.titrator.formel;
        var h = [
            "Ækvivalenspunktet er dér, hvor pH-kurven er stejlest. Aflæs det tilsatte volumen af " + t + " dér.",
            "Ved ækvivalenspunktet er n(" + t + ")\u00a0=\u00a0c\u00a0·\u00a0V. Prøven har samme stofmængde " +
                (o.erSyre ? "syre" : "base") + ". Divider med prøvens volumen."
        ];
        if (o.svag) h.push("pKs er pH ved det halve ækvivalensvolumen. Aflæs pH dér på kurven.");
        return h;
    };

    /* Stoffets navn midt i en saetning: lille forbogstav, uden tilnavnet
       i parentes (Acetylsalicylsyre (aspirin) bliver acetylsalicylsyre) */
    function navnISaetning(stof) {
        var n = stof.navn.replace(/\s*\(.*\)\s*$/, "");
        return /^Tris\b/.test(n) ? n : n.charAt(0).toLowerCase() + n.slice(1);
    }

    NK.SimUkendt.prototype.facitTekst = function (nutid) {
        var o = this.opgave, er = nutid ? "er" : "var";
        return "Prøven " + er + " " + NK.tal(o.c, 4) + " M " + navnISaetning(o.stof) + " (" + o.stof.formel + ")" +
            (o.svag ? " med pKs " + NK.tal(o.pKs, 2) : "") + ". Ækvivalensvolumenet " + er + " " + NK.tal(o.Vae, 2) + " mL.";
    };

    NK.SimUkendt.prototype.harSvar = function () {
        return this.felter().some(function (f) { return NK.el(f.id).value.trim() !== ""; });
    };

    /* Hoejden, kortet har sat af oeverst i scenen. Selvtesten maaler kortet
       med de laengste tekster i en almindelig og en lav skaerm. */
    NK.SimUkendt.prototype.kortZone = function () {
        var z = window.innerHeight <= 720 ? 112 : 132;
        var b = this.l.b || 900;
        if (b < 560) z += 72;
        else if (b < 760) z += 30;
        return z;
    };

    NK.SimUkendt.prototype.visKort = function () {
        var e = this.el, slut = !!this.loest, vist = this.loest === "svar";
        var kl = "scenekort " + (slut ? "loest bliv" + (vist ? " svar" : "") : "opgave");
        if (e.skort.className.replace(" blink", "") !== kl) e.skort.className = kl;
        var ind = '<p class="sk-tekst"><span class="sk-chip">Ukendt prøve</span>' + NK.Papir.tekst(html(this.opgaveTekst())) + "</p>";
        if (slut) ind += NK.Papir.bliv(html(this.facitTekst(vist)), vist ? "Svaret" : "Rigtigt", "Ny ukendt prøve →", vist);
        if (e.ind.innerHTML !== ind) e.ind.innerHTML = ind;
        e.status.hidden = slut;
        if (slut) return;

        var b = this.besked || { html: "Titrér prøven. Skriv svarene i felterne i panelet, og tryk Indsend svar.", klasse: "peger" };
        if (e.besked.innerHTML !== b.html) e.besked.innerHTML = b.html;
        var ryster = e.status.classList.contains("ryster");
        e.status.className = "sk-bund " + (b.klasse || "peger") + (ryster ? " ryster" : "");

        var h = this.hint(), tekst = "Giv et hint", knapKl = "knap hjaelp";
        if (this.hjaelp > 0 && this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
        else if (this.hjaelp >= h.length) { tekst = "Vis svaret"; knapKl += " svar"; }
        if (this.peg) knapKl += " peg";
        if (e.knap.textContent !== tekst) e.knap.textContent = tekst;
        if (e.knap.className !== knapKl) e.knap.className = knapKl;

        var kan = this.harSvar();
        e.indsend.classList.toggle("klar", kan);
        e.indsend.classList.toggle("ikke-klar", !kan);
        e.indsend.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    NK.SimUkendt.prototype.blink = function () {
        var e = this.el.skort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    NK.SimUkendt.prototype.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    NK.SimUkendt.prototype.hjaelpKlik = function () {
        if (this.loest) return;
        var h = this.hint();
        this.peg = false;
        if (this.hjaelp >= h.length) { this.facit(); return; }
        this.besked = { html: "<b>Hint:</b> " + html(h[this.hjaelp]), klasse: "hint" };
        this.hjaelp++;
        this.visKort();
    };

    /* ----- Knapper ---------------------------------------------------- */
    NK.SimUkendt.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("ukendt-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("ukendt-hane").addEventListener("click", function () {
            mig.bord.saetHane(!mig.bord.aaben);
        });
        NK.el("ukendt-draabe").addEventListener("click", function () { mig.bord.draabe(); });
        NK.el("ukendt-plus01").addEventListener("click", function () { mig.bord.tilfoej(0.1); });
        NK.el("ukendt-plus1").addEventListener("click", function () { mig.bord.tilfoej(1); });
        NK.el("ukendt-nulstil").addEventListener("click", function () { mig.bord.nulstil(); });
        this.el.indsend.addEventListener("click", function () { mig.el.indsend.blur(); mig.tjek(); });
        this.el.knap.addEventListener("click", function () { mig.el.knap.blur(); mig.hjaelpKlik(); });
        /* Knappen, der foerer videre, naar kortet bliver paa opgaven */
        this.el.ind.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-videre]")) mig.nyOpgave();
        });
        FELTER.forEach(function (f) {
            var e = NK.el(f.id);
            e.addEventListener("input", function () {
                if (mig.felt[f.noegle]) { delete mig.felt[f.noegle]; e.classList.remove("ok", "fejl"); }
                mig.visKort();
            });
            e.addEventListener("keydown", function (ev) {
                if (ev.key === "Enter") { ev.preventDefault(); mig.tjek(); }
            });
        });

        var laerred = NK.el("ukendt-graf");
        laerred.addEventListener("mousemove", function (e) {
            var r = laerred.getBoundingClientRect();
            var p = mig.graf.fraSkaerm(e.clientX - r.left, e.clientY - r.top);
            mig.markoer = p ? { V: NK.klamp(p.V, 0, mig.bord.maksV()) } : null;
        });
        laerred.addEventListener("mouseleave", function () { mig.markoer = null; });
    };

    /* ----- Rettelse: Indsend svar ---------------------------------------
       Kun det, der staar i felterne, bedoemmes. Et felt, der passer, bliver
       groent i panelet, et forkert roedt. Kortet siger, hvad der passer, og
       giver et raad til det foerste, der ikke passer. */
    NK.SimUkendt.prototype.tjek = function () {
        if (this.loest) return;
        if (!this.harSvar()) { this.blink(); return; }
        var o = this.opgave, mig = this;
        var ok = [], forkert = [], mangler = [];
        this.felter().forEach(function (f) {
            var e = NK.el(f.id), tekst = e.value.trim(), v = NK.laesTal(tekst), passer;
            e.classList.remove("ok", "fejl");
            delete mig.felt[f.noegle];
            if (tekst === "") { mangler.push(f); return; }
            if (f.noegle === "V") passer = isFinite(v) && Math.abs(v - o.Vae) <= Math.max(0.15, o.Vae * TOL_V);
            else if (f.noegle === "c") passer = isFinite(v) && Math.abs(v - o.c) <= o.c * TOL_C;
            else passer = isFinite(v) && Math.abs(v - o.pKs) <= TOL_PKS;
            mig.felt[f.noegle] = passer ? "ok" : "fejl";
            e.classList.add(passer ? "ok" : "fejl");
            (passer ? ok : forkert).push({ f: f, tal: isFinite(v) });
        });

        if (!forkert.length && !mangler.length) {
            this.loest = "rigtig";
            this.afsloeret = true;
            this.laasFelter();
            this.visKort();
            return;
        }

        var dele = [];
        if (ok.length) {
            var navne = ok.map(function (x) { return x.f.navn; });
            var liste = navne.length > 1 ? navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1] : navne[0];
            dele.push(stort(liste) + " passer.");
        }
        if (forkert.length) {
            var x = forkert[0];
            if (!x.tal) dele.push("Skriv " + x.f.navn + " som et tal.");
            else if (x.f.noegle === "V") dele.push("Ækvivalensvolumenet passer ikke. Aflæs volumenet, hvor kurven er stejlest.");
            else if (x.f.noegle === "c") dele.push("Prøvens koncentration passer ikke. Brug n\u00a0=\u00a0c\u00a0·\u00a0V for " + o.titrator.formel + " ved ækvivalenspunktet.");
            else dele.push("pKs passer ikke. Aflæs pH ved det halve ækvivalensvolumen.");
        } else {
            var mn = mangler.map(function (f) { return f.navn; });
            dele.push("Skriv også " + (mn.length > 1 ? mn.slice(0, -1).join(", ") + " og " + mn[mn.length - 1] : mn[0]) + " i panelet.");
        }
        this.besked = { html: html(dele.join(" ")), klasse: forkert.length ? "skidt" : "peger" };
        if (forkert.length) this.peg = true;
        this.visKort();
        this.ryst();
    };

    function stort(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

    NK.SimUkendt.prototype.laasFelter = function () {
        FELTER.forEach(function (f) { NK.el(f.id).disabled = true; });
    };

    /* Vis svaret (efter hintene): kortet bliver paa opgaven med svaret i gult */
    NK.SimUkendt.prototype.facit = function () {
        this.afsloeret = true;
        this.loest = "svar";
        this.laasFelter();
        this.visKort();
    };

    /* ----- Tid og tegning ---------------------------------------------- */
    NK.SimUkendt.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    NK.SimUkendt.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
    };

    NK.SimUkendt.prototype.nulstil = function () {
        this.bord.nulstil();
    };

    NK.SimUkendt.prototype.tegn = function () {
        var b = this.bord;
        var o = this.opgave;

        /* Apparatet staar under papirkortet: tegningen faar pladsen under
           kortZone() og maa gaa LEDIG_TOP enheder op under kortet, hvor den
           er tom. */
        var ctx = this.l.ctx, W = this.l.b, H = this.l.h;
        var top = 10 + this.kortZone() + 6;
        var BR = NK.Apparat.BREDDE, HO = NK.Apparat.HOEJDE;
        var sk = Math.max(0.05, Math.min(W / BR, (H - top) / (HO - LEDIG_TOP)));
        var y0 = top - LEDIG_TOP * sk + Math.max(0, ((H - top) - (HO - LEDIG_TOP) * sk) / 2);
        this.apparatTop = y0 + LEDIG_TOP * sk;
        ctx.save();
        ctx.fillStyle = "#191a22";
        ctx.fillRect(0, 0, W, H);
        ctx.translate(0, y0);
        NK.Apparat.tegn(ctx, W, HO * sk, b.tilstand({
            titratorNavn: NK.tal(o.cT, 4) + " M " + o.titrator.formel,
            proeveNavn: NK.tal(o.V0, 1) + " mL ukendt " + (o.erSyre ? "syre" : "base")
        }));
        ctx.restore();

        var V = [], pH = [];
        for (var i = 0; i < b.punkter.length; i++) {
            V.push(b.punkter[i].V);
            pH.push(b.punkter[i].pH);
        }

        var markoer = null;
        if (this.markoer) {
            markoer = { V: this.markoer.V, pH: Kemi.pHVed(o.ops, this.markoer.V) };
            NK.saetTekst("ukendt-hover", "V = " + NK.tal(markoer.V, 2) + " mL · pH = " + NK.tal(markoer.pH, 2));
        } else {
            NK.saetTekst("ukendt-hover", "");
        }

        this.graf.tegn({
            Vmaks: b.maksV(),
            kurver: [{ V: V, pH: pH, farve: "#9b6bd6", navn: "din måling" }],
            aekv: this.afsloeret ? o.aekv : null,
            visAekv: this.afsloeret,
            nu: { V: b.V, pH: b.pH },
            markoer: markoer
        });

        NK.saetTekst("ukendt-ph", NK.tal(NK.klamp(b.pHVist, -1.99, 15.99), 2));
        NK.saetTekst("ukendt-v", NK.tal(b.V, 2) + " mL");
        NK.el("ukendt-farveprik").style.backgroundColor = "#eef3f7";

        var knap = NK.el("ukendt-hane");
        NK.saetTekst("ukendt-hane-tekst", b.aaben ? "Luk hanen" : "Åbn hanen");
        knap.classList.toggle("groen", !b.aaben);
        knap.classList.toggle("roed", b.aaben);
    };
}());
