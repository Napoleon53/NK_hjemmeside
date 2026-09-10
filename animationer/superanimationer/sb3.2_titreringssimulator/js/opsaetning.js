/* =====================================================================
   opsaetning.js - den faelles opstilling

   Én tilstand deles af laboratoriet, kurven og fordelingsdiagrammet:
   hvad er der i kolben, hvad staar der i buretten, hvilken indikator.
   Alle tre faner lytter med og tegner sig selv om, naar noget aendres.

   Stoffer vaelges ud fra deres id i NK.Kemi.STOFFER. To id'er er
   saerlige: "egen_syre" og "egen_base" bygges paa stedet ud fra de
   pKs-vaerdier, brugeren selv skriver ind.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    var Ops = {};
    NK.Ops = Ops;

    /* ----- Tilstanden ----------------------------------------------- */
    Ops.t = {
        proeve: [{ id: "eddikesyre", c: 0.1 }, { id: "vand", c: 0 }],
        V0: 20,
        titrator: { id: "naoh", c: 0.1 },
        indikator: "phenolphthalein",
        Vmaks: 30,
        autoVmaks: true,
        egen: { syre: [4.50, NaN, NaN], base: [9.50, NaN, NaN] }
    };

    /* ----- Faerdige forsoeg ----------------------------------------- */
    Ops.FORSOEG = [
        {
            id: "staerk", navn: "Stærk syre med stærk base",
            note: "HCl med NaOH. Springet er stort, og ækvivalenspunktet ligger ved pH 7.",
            saet: { proeve: [{ id: "hcl", c: 0.1 }, { id: "vand", c: 0 }], V0: 25, titrator: { id: "naoh", c: 0.1 }, indikator: "bromthymolblaat" }
        },
        {
            id: "eddike", navn: "Eddikesyre med natriumhydroxid",
            note: "Klassikeren. Bufferområdet ses tydeligt, og ækvivalenspunktet ligger i det basiske.",
            saet: { proeve: [{ id: "eddikesyre", c: 0.1 }, { id: "vand", c: 0 }], V0: 20, titrator: { id: "naoh", c: 0.1 }, indikator: "phenolphthalein" }
        },
        {
            id: "ammoniak", navn: "Ammoniak med saltsyre",
            note: "Nu den anden vej: en svag base titreres med en stærk syre, og ækvivalenspunktet ligger i det sure.",
            saet: { proeve: [{ id: "ammoniak", c: 0.1 }, { id: "vand", c: 0 }], V0: 20, titrator: { id: "hcl", c: 0.1 }, indikator: "methylroedt" }
        },
        {
            id: "phosphor", navn: "Phosphorsyre med natriumhydroxid",
            note: "To spring, ikke tre: det sidste trin (pKs 12,35) er for svagt til at kunne titreres.",
            saet: { proeve: [{ id: "phosphorsyre", c: 0.05 }, { id: "vand", c: 0 }], V0: 20, titrator: { id: "naoh", c: 0.1 }, indikator: "phenolphthalein" }
        },
        {
            id: "soda", navn: "Soda med saltsyre (dobbeltindikator)",
            note: "Na₂CO₃ giver to spring: først til hydrogencarbonat ved pH 8,3, så til kulsyre ved pH 4.",
            saet: { proeve: [{ id: "na2co3", c: 0.05 }, { id: "vand", c: 0 }], V0: 20, titrator: { id: "hcl", c: 0.1 }, indikator: "methylorange" }
        },
        {
            id: "blanding", navn: "Blanding af stærk og svag syre",
            note: "HCl og eddikesyre i samme kolbe. Det første spring tæller kun den stærke syre.",
            saet: { proeve: [{ id: "hcl", c: 0.05 }, { id: "eddikesyre", c: 0.05 }], V0: 20, titrator: { id: "naoh", c: 0.1 }, indikator: "phenolphthalein" }
        },
        {
            id: "citron", navn: "Citronsyre i sodavand",
            note: "Tre pKs-værdier så tæt på hinanden, at springene smelter sammen til ét.",
            saet: { proeve: [{ id: "citronsyre", c: 0.03 }, { id: "vand", c: 0 }], V0: 25, titrator: { id: "naoh", c: 0.1 }, indikator: "phenolphthalein" }
        },
        {
            id: "glycin", navn: "Glycin med natriumhydroxid",
            note: "En aminosyre. Prøv også at titrere den med saltsyre og find det isoelektriske punkt midt imellem.",
            saet: { proeve: [{ id: "glycin", c: 0.1 }, { id: "vand", c: 0 }], V0: 20, titrator: { id: "naoh", c: 0.1 }, indikator: "thymolphthalein" }
        },
        {
            id: "puffer", navn: "Puffer: eddikesyre og acetat",
            note: "Start i en puffer. Se hvor lidt pH flytter sig, indtil pufferen er brugt op.",
            saet: { proeve: [{ id: "eddikesyre", c: 0.1 }, { id: "natriumacetat", c: 0.1 }], V0: 20, titrator: { id: "naoh", c: 0.1 }, indikator: "phenolphthalein" }
        },
        {
            id: "fortyndet", navn: "Meget fortyndet syre",
            note: "0,001 M HCl. Springet skrumper, og valg af indikator bliver pludselig kritisk.",
            saet: { proeve: [{ id: "hcl", c: 0.001 }, { id: "vand", c: 0 }], V0: 25, titrator: { id: "naoh", c: 0.001 }, indikator: "bromthymolblaat" }
        },
        {
            id: "svagsvag", navn: "Svag syre med svag base",
            note: "Eddikesyre med ammoniak. Næsten intet spring — derfor bruger man altid en stærk titrator.",
            saet: { proeve: [{ id: "eddikesyre", c: 0.1 }, { id: "vand", c: 0 }], V0: 20, titrator: { id: "ammoniak", c: 0.1 }, indikator: "lakmus" }
        },
        {
            id: "khp", navn: "Standardisering mod KHP",
            note: "Kaliumhydrogenphthalat er en primær standard: man vejer den af og bestemmer NaOH-opløsningens koncentration.",
            saet: { proeve: [{ id: "khp", c: 0.05 }, { id: "vand", c: 0 }], V0: 25, titrator: { id: "naoh", c: 0.1 }, indikator: "phenolphthalein" }
        }
    ];

    /* ----- Lyttere --------------------------------------------------- */
    var lyttere = [];

    /* aarsag: "opstilling" (kolben aendret - titreringen skal starte
       forfra) eller "visning" (fx ny indikator - kurven er den samme). */
    Ops.paaAendring = function (fn) {
        lyttere.push(fn);
    };

    Ops.meld = function (aarsag) {
        for (var i = 0; i < lyttere.length; i++) lyttere[i](aarsag || "opstilling");
    };

    /* ----- Opslag ---------------------------------------------------- */
    Ops.stof = function (id) {
        if (id === "egen_syre") return Kemi.egetStof("syre", Ops.t.egen.syre);
        if (id === "egen_base") return Kemi.egetStof("base", Ops.t.egen.base);
        return Kemi.findStof(id);
    };

    /* Opsaetningen, som NK.Kemi vil have den. */
    Ops.beregning = function () {
        var proeve = [];
        for (var i = 0; i < Ops.t.proeve.length; i++) {
            var s = Ops.stof(Ops.t.proeve[i].id);
            proeve.push({ stof: s, c: (s && s.id !== "vand") ? Ops.t.proeve[i].c : 0 });
        }
        var ops = {
            proeve: proeve,
            V0: Ops.t.V0,
            titrator: { stof: Ops.stof(Ops.t.titrator.id), c: Ops.t.titrator.c },
            Vmaks: Ops.t.Vmaks
        };
        if (Ops.t.autoVmaks) ops.Vmaks = Kemi.forslaaVmaks(ops);
        return ops;
    };

    Ops.indikator = function () {
        return Kemi.findIndikator(Ops.t.indikator);
    };

    /* En kort tekst om, hvad der staar i kolben. */
    Ops.proeveTekst = function () {
        var dele = [];
        for (var i = 0; i < Ops.t.proeve.length; i++) {
            var s = Ops.stof(Ops.t.proeve[i].id);
            if (!s || s.id === "vand" || !(Ops.t.proeve[i].c > 0)) continue;
            dele.push(NK.tal(Ops.t.proeve[i].c, 3) + " M " + s.formel);
        }
        return dele.length ? dele.join(" + ") : "rent vand";
    };

    Ops.titratorTekst = function () {
        var s = Ops.stof(Ops.t.titrator.id);
        return s ? NK.tal(Ops.t.titrator.c, 3) + " M " + s.formel : "-";
    };

    /* ================================================================
       BRUGERFLADEN I VENSTRE SPALTE
       ================================================================ */
    var GRUPPER = ["Stærke syrer", "Svage syrer", "Flerprotonede syrer", "Aminosyrer",
                   "Stærke baser", "Svage baser", "Salte", "Andet"];

    function fyldStofVaelger(vaelger, medEgen) {
        var i, g, gruppe, o;
        for (g = 0; g < GRUPPER.length; g++) {
            gruppe = document.createElement("optgroup");
            gruppe.label = GRUPPER[g];
            for (i = 0; i < Kemi.STOFFER.length; i++) {
                var s = Kemi.STOFFER[i];
                if (s.gruppe !== GRUPPER[g]) continue;
                o = document.createElement("option");
                o.value = s.id;
                o.textContent = s.navn + " (" + s.formel + ")";
                gruppe.appendChild(o);
            }
            if (gruppe.children.length) vaelger.appendChild(gruppe);
        }
        if (medEgen) {
            gruppe = document.createElement("optgroup");
            gruppe.label = "Dit eget stof";
            o = document.createElement("option");
            o.value = "egen_syre";
            o.textContent = "Egen syre — skriv pKs selv";
            gruppe.appendChild(o);
            o = document.createElement("option");
            o.value = "egen_base";
            o.textContent = "Egen base — skriv pKs selv";
            gruppe.appendChild(o);
            vaelger.appendChild(gruppe);
        }
    }

    /* Koncentrationsfelt: accepterer baade komma og punktum. */
    function bindTal(id, laes, skriv, mindst, stoerst) {
        var e = NK.el(id);
        if (!e) return;
        function gem() {
            var v = NK.laesTal(e.value);
            if (isFinite(v)) {
                v = NK.klamp(v, mindst, stoerst);
                skriv(v);
                Ops.meld("opstilling");
            }
            e.value = NK.tal(laes(), e.getAttribute("data-dec") ? parseInt(e.getAttribute("data-dec"), 10) : 3);
        }
        e.addEventListener("change", gem);
        e.addEventListener("blur", gem);
        e.addEventListener("keydown", function (ev) { if (ev.key === "Enter") e.blur(); });
    }

    function visEgenFelter() {
        var brugSyre = false, brugBase = false, i;
        for (i = 0; i < Ops.t.proeve.length; i++) {
            if (Ops.t.proeve[i].id === "egen_syre") brugSyre = true;
            if (Ops.t.proeve[i].id === "egen_base") brugBase = true;
        }
        if (Ops.t.titrator.id === "egen_syre") brugSyre = true;
        if (Ops.t.titrator.id === "egen_base") brugBase = true;
        NK.el("egen-syre-boks").style.display = brugSyre ? "block" : "none";
        NK.el("egen-base-boks").style.display = brugBase ? "block" : "none";
    }

    function opdaterFelter() {
        var i;
        for (i = 0; i < 2; i++) {
            NK.el("proeve-stof-" + i).value = Ops.t.proeve[i].id;
            NK.el("proeve-c-" + i).value = NK.tal(Ops.t.proeve[i].c, 3);
            NK.el("proeve-c-" + i).parentNode.style.opacity = (Ops.t.proeve[i].id === "vand") ? "0.35" : "1";
        }
        NK.el("proeve-v0").value = NK.tal(Ops.t.V0, 1);
        NK.el("titrator-stof").value = Ops.t.titrator.id;
        NK.el("titrator-c").value = NK.tal(Ops.t.titrator.c, 3);
        NK.el("indikator-vaelger").value = Ops.t.indikator;

        var ind = Ops.indikator();
        NK.saetTekst("indikator-omslag", ind.id === "ingen" ? "" : "Omslag ved pH " + ind.omslag);

        NK.el("vmaks-auto").checked = Ops.t.autoVmaks;
        NK.el("vmaks-felt").disabled = Ops.t.autoVmaks;
        NK.el("vmaks-felt").value = NK.tal(Ops.beregning().Vmaks, 1);

        for (i = 0; i < 3; i++) {
            var a = NK.el("egen-syre-pks-" + i);
            var b = NK.el("egen-base-pks-" + i);
            if (a) a.value = isFinite(Ops.t.egen.syre[i]) ? NK.tal(Ops.t.egen.syre[i], 2) : "";
            if (b) b.value = isFinite(Ops.t.egen.base[i]) ? NK.tal(Ops.t.egen.base[i], 2) : "";
        }
        visEgenFelter();

        /* Advarsel, hvis titratoren ikke kan titrere noget */
        var beregning = Ops.beregning();
        var t = Kemi.titratorType(beregning.titrator.stof);
        var ae = Kemi.aekvivalenspunkter(beregning);
        var advarsel = "";
        if (t.type === "ingen") advarsel = "Det stof i buretten kan hverken afgive eller optage protoner.";
        else if (ae.length === 0) advarsel = "Der er ikke noget i kolben, som denne titrator kan omsætte.";
        var boks = NK.el("ops-advarsel");
        boks.textContent = advarsel;
        boks.style.display = advarsel ? "block" : "none";
    }

    Ops.opdaterFelter = opdaterFelter;

    Ops.byg = function () {
        var i;

        for (i = 0; i < 2; i++) {
            fyldStofVaelger(NK.el("proeve-stof-" + i), true);
        }
        fyldStofVaelger(NK.el("titrator-stof"), true);

        var ind = NK.el("indikator-vaelger");
        for (i = 0; i < Kemi.INDIKATORER.length; i++) {
            var o = document.createElement("option");
            o.value = Kemi.INDIKATORER[i].id;
            o.textContent = Kemi.INDIKATORER[i].navn;
            ind.appendChild(o);
        }

        var forsoeg = NK.el("forsoeg-vaelger");
        for (i = 0; i < Ops.FORSOEG.length; i++) {
            var f = document.createElement("option");
            f.value = Ops.FORSOEG[i].id;
            f.textContent = Ops.FORSOEG[i].navn;
            forsoeg.appendChild(f);
        }

        /* --- Bindinger --- */
        function bindStof(vaelger, saet) {
            vaelger.addEventListener("change", function () {
                saet(vaelger.value);
                opdaterFelter();
                Ops.meld("opstilling");
            });
        }
        for (i = 0; i < 2; i++) {
            (function (n) {
                bindStof(NK.el("proeve-stof-" + n), function (v) {
                    Ops.t.proeve[n].id = v;
                    if (v !== "vand" && !(Ops.t.proeve[n].c > 0)) Ops.t.proeve[n].c = 0.1;
                });
                bindTal("proeve-c-" + n,
                    function () { return Ops.t.proeve[n].c; },
                    function (v) { Ops.t.proeve[n].c = v; }, 0, 5);
            }(i));
        }
        bindStof(NK.el("titrator-stof"), function (v) { Ops.t.titrator.id = v; });
        bindTal("titrator-c", function () { return Ops.t.titrator.c; },
            function (v) { Ops.t.titrator.c = v; }, 0.0001, 5);
        bindTal("proeve-v0", function () { return Ops.t.V0; },
            function (v) { Ops.t.V0 = v; }, 1, 500);
        bindTal("vmaks-felt", function () { return Ops.t.Vmaks; },
            function (v) { Ops.t.Vmaks = v; }, 1, 1000);

        NK.el("vmaks-auto").addEventListener("change", function () {
            Ops.t.autoVmaks = NK.el("vmaks-auto").checked;
            if (!Ops.t.autoVmaks) Ops.t.Vmaks = Ops.beregning().Vmaks;
            opdaterFelter();
            Ops.meld("opstilling");
        });

        ind.addEventListener("change", function () {
            Ops.t.indikator = ind.value;
            opdaterFelter();
            Ops.meld("visning");
        });

        for (i = 0; i < 3; i++) {
            (function (n) {
                function bindPks(id, liste) {
                    var e = NK.el(id);
                    if (!e) return;
                    function gem() {
                        var tekst = String(e.value || "").trim();
                        var v = tekst === "" ? NaN : NK.klamp(NK.laesTal(tekst), -3, 15);
                        liste[n] = v;
                        opdaterFelter();
                        Ops.meld("opstilling");
                    }
                    e.addEventListener("change", gem);
                    e.addEventListener("blur", gem);
                    e.addEventListener("keydown", function (ev) { if (ev.key === "Enter") e.blur(); });
                }
                bindPks("egen-syre-pks-" + n, Ops.t.egen.syre);
                bindPks("egen-base-pks-" + n, Ops.t.egen.base);
            }(i));
        }

        forsoeg.addEventListener("change", function () {
            Ops.hentForsoeg(forsoeg.value);
        });

        opdaterFelter();
    };

    Ops.hentForsoeg = function (id) {
        var f = null;
        for (var i = 0; i < Ops.FORSOEG.length; i++) if (Ops.FORSOEG[i].id === id) f = Ops.FORSOEG[i];
        if (!f) return;
        Ops.t.proeve = [
            { id: f.saet.proeve[0].id, c: f.saet.proeve[0].c },
            { id: f.saet.proeve[1].id, c: f.saet.proeve[1].c }
        ];
        Ops.t.V0 = f.saet.V0;
        Ops.t.titrator = { id: f.saet.titrator.id, c: f.saet.titrator.c };
        Ops.t.indikator = f.saet.indikator;
        Ops.t.autoVmaks = true;
        NK.el("forsoeg-vaelger").value = id;
        NK.saetTekst("forsoeg-note", f.note);
        opdaterFelter();
        Ops.meld("opstilling");
    };
}());
