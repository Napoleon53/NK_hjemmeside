/* =====================================================================
   app.js - forsoegets side

   Hele skallen (tegneloekke, panel, zoomboble, lyd, intro, rundvisning,
   tastatur, logbog, forloebskort, Start forfra) ligger i
   ../../laboratoriet/js/side.js. Her staar kun det, der er saerligt for
   dette forsoeg: de to dele, billedet af de syv glas, de fire glas
   ovenfra og de to krav, der aabner quizzen og tegneserien.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var side = NK.Side.start({
        navn: "sb24",
        opstilling: NK.OPSTILLING,
        valg: NK.BORD_VALG,
        tekster: NK.TEKST,
        tomTekst: NK.TEKST["glas-tom-start"],
        forloeb: NK.FORLOEB,

        /* Kortet »Sagt i laboratoriet« (S13): forloebets replikker kommer
           altid med; her ogsaa Kemichaels uheld og advarsler. Smaasnakken
           (kaffen, kigget ind) kommer aldrig. */
        historik: ["spild", "voldsom", "affald", "vask"],

        /* F49: listen viser trinnene i den del, eleven staar i; den anden
           del staar som én linje og foldes ud, naar man kommer dertil */
        forloebDele: {
            titler: { 1: "Del 1: glassene", 2: "Del 2: fortynding" },
            nu: function () { return NK.DELE.nu(); }
        },

        /* »Fyld op til« (F39): de forslag, fortyndingen bruger. Til et af
           de fire baegerglas: det, makkeren i parret har (saa de to faar
           lige meget), det, det andet par har (saa par 1 kan fyldes op til
           par 2), og det dobbelte (fortyndingen). Andre steder motorens
           egne forslag. */
        fyldOpForslag: function (bord, c) {
            var O = NK.OVENFRA, B = NK.Beholder, i = O.BAEGERE.indexOf(c.navn);
            if (i < 0) return null;
            var V = B.volumen(c), maks = c.type.maks, ud = [];
            function til(mL, tekst) {
                mL = Math.round(mL);
                if (mL > V + 0.5 && mL <= maks - 0.1 && !ud.some(function (x) { return x.mL === mL; })) ud.push({ mL: mL, tekst: tekst });
            }
            var makker = bord.g[O.BAEGERE[i ^ 1]];
            if (makker) til(B.volumen(makker), "som " + makker.titel);
            var andet = i < 2 ? [2, 3] : [0, 1];
            var ander = Math.max.apply(null, andet.map(function (j) { return bord.g[O.BAEGERE[j]] ? B.volumen(bord.g[O.BAEGERE[j]]) : 0; }));
            if (ander > 0.5) til(ander, "som par " + (i < 2 ? 2 : 1));
            if (V > 0.5) til(2 * V, "dobbelt");
            return ud;
        },

        /* Quizzen (../../laboratoriet/js/quiz.js) laases op, naar eleven har
           taget billedet og noteret alle syv glas. Spoergsmaalene staar i
           js/tekst.js under "quiz". */
        quiz: { krav: { journal: "billede", faerdig: true } },

        /* Tegneserien (../../laboratoriet/js/tegneserie.js) laases op, naar
           BEGGE dele er gjort: billedet af de syv glas og sammenligningen
           ovenfra. Ruderne bygges af js/serie.js ud fra de to journalers
           oejebliksbilleder, og teksterne staar i js/tekst.js under
           "serie". */
        serie: { krav: { alle: [
            { journal: "billede", faerdig: true },
            { journal: "fortynding", faerdig: true }
        ] } },
        ruder: function (bord) { return NK.SERIE.ruder(bord); },

        tast: function (e) {
            if (e.key === "s" || e.key === "S") { this.visning(); return true; }
            if (e.key === "1") { this.skiftDel(1); return true; }
            if (e.key === "2") { this.skiftDel(2); return true; }
            return false;
        },

        /* Bordet bygges op fra opstillingen igen ved Start forfra, og saa
           staar begge deles udstyr fremme. Der skiftes aldrig del af sig
           selv (F28): eleven skifter med fanerne eller pilen. */
        vedAendring: function (grund) {
            if (grund === "nulstil") {
                var foer = NK.DELE.nulstil(this.bord());
                if (this.visDel) this.visDel();
                /* Kom man fra del 2, er begge dele ryddet, og man staar i
                   del 1 igen. Det skal siges, ellers ser det ud som om
                   noget gik galt. */
                if (foer === 2) this.bord().besked(NK.TEKST["forfra-del2"]);
                return;
            }
        },

        efterStart: function (s) {
            /* ----- De to dele ------------------------------------------- */
            s.skiftDel = function (n, stille) {
                if (NK.DELE.nu() === n) return;
                if (!NK.DELE.kanSkifte(s.bord())) {
                    if (!stille) s.bord().besked("Vent, til det, der er i gang, er færdigt.");
                    return;
                }
                s.lukOverlay();
                NK.BILLEDE.luk();
                NK.OVENFRA.luk();
                if (s.serie) s.serie.luk();
                if (NK.DELE.saet(s.bord(), n, stille)) s.visDel();
            };
            s.visDel = function () {
                var n = NK.DELE.nu();
                [1, 2].forEach(function (i) {
                    var k = NK.el("del" + i + "knap");
                    if (k) k.setAttribute("aria-pressed", i === n ? "true" : "false");
                });
                NK.el("billedknap").hidden = n !== 1;
                NK.el("ovenfraknap").hidden = n !== 2;
                /* Pilen til del 2 dukker op paa vaeggen og blinker, naar
                   del 1 er gjort (F28, F43) */
                s.bord().visPil(n === 1 && s.forloeb.flag("del1_gjort"));
                s.opdaterForloeb();
            };
            /* Panelet viser det trin, eleven kan gaa i gang med HER. Listen
               viser den dels trin, og den anden del som én linje (F49). */
            s.forloeb.kun = function (t) { return !t.del || t.del === NK.DELE.nu(); };
            [1, 2].forEach(function (i) {
                NK.el("del" + i + "knap").addEventListener("click", function () { s.skiftDel(i); });
            });
            s.bord().vedPil = function () { s.skiftDel(2); };
            NK.DELE.anvend(s.bord());
            s.visDel();

            /* ----- Billedet og visningen ovenfra ------------------------- */
            function efterSvar() {
                /* Et nyt svar kan goere trinnet faerdigt med det samme */
                s.forloeb.opdater();
                s.opdaterForloeb();
                s.opdaterPanel();
            }

            s.tagBillede = function () {
                if (NK.el("billede").classList.contains("vis")) { NK.BILLEDE.luk(); return; }
                s.lukOverlay();
                NK.BILLEDE.aabn(s.bord(), efterSvar);
            };
            s.seOvenfra = function () {
                if (NK.el("ovenfra").classList.contains("vis")) { NK.OVENFRA.luk(); return; }
                s.lukOverlay();
                NK.OVENFRA.aabn(s.bord(), efterSvar);
            };
            /* Tasten S viser den visning, delen hoerer til */
            s.visning = function () {
                if (NK.DELE.nu() === 2) s.seOvenfra(); else s.tagBillede();
            };

            NK.el("billedknap").addEventListener("click", function () { s.tagBillede(); });
            NK.el("billede-luk").addEventListener("click", function () { NK.BILLEDE.luk(); });
            NK.el("billede").addEventListener("click", function (e) {
                if (e.target === this) NK.BILLEDE.luk();
            });
            NK.el("ovenfraknap").addEventListener("click", function () { s.seOvenfra(); });
            NK.el("ovenfra-luk").addEventListener("click", function () { NK.OVENFRA.luk(); });
            NK.el("ovenfra").addEventListener("click", function (e) {
                if (e.target === this) NK.OVENFRA.luk();
            });

            NK.el("serie").addEventListener("click", function (e) {
                if (e.target === this && s.serie) s.serie.luk();
            });

            NK.billede = NK.BILLEDE;
            NK.ovenfra = NK.OVENFRA;

            /* Del 1 er forbi, naar der er ryddet op. Saa dukker pilen til
               del 2 op, og der kommer en besked - men bordet skifter ikke
               af sig selv (F28): man skal aldrig flyttes midt i noget.
               Tilbage til del 1 kan man altid. */
            s.forloeb.vedFlag = function (navn, sat) {
                if (navn !== "del1_gjort") return;
                s.visDel();
                if (sat && NK.DELE.nu() === 1) s.bord().besked(NK.TEKST["del1-gjort"]);
            };
        }
    });
}());
