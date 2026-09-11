/* =====================================================================
   data.js - grundstofferne 1-20 med isotoper

   Skalmodellen (2, 8, 8, 2) holder kun til og med calcium, og derfor
   stopper listen ved Z = 20. Det er ogsaa praecis det udsnit, kemi C
   arbejder med.

   Isotopmasser er de rigtige kernemasser i u (ikke massetallet), for
   det er dem, der skal til, hvis det vejede gennemsnit skal ramme den
   atommasse, der staar i det periodiske system.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    NK.Data = D;

    /* Hvor mange elektroner der er plads til i hver skal. */
    D.SKALPLADSER = [2, 8, 8, 2];

    /* type styrer farve og sprogbrug:
       metal - ikkemetal - halvmetal - aedelgas
       ion:   den ladning grundstoffet normalt faar. null = danner
              normalt ikke ioner (kulstofgruppen og halvmetallerne).
       isotoper: kun dem, der findes i naturen, med andel i procent.
       andre:    kendte isotoper uden for naturens blanding. De taeller
                 ikke med i den gennemsnitlige atommasse, men de skal
                 vaere med, naar byggeren skal sige, om en kerne findes. */
    D.GRUNDSTOFFER = [
        { z: 1, symbol: "H", navn: "Hydrogen", type: "ikkemetal", ion: 1, masse: 1.008,
          isotoper: [ { a: 1, masse: 1.007825, andel: 99.9885, navn: "protium" },
                      { a: 2, masse: 2.014102, andel: 0.0115, navn: "deuterium" } ],
          andre: [ { a: 3, navn: "tritium", note: "radioaktiv, dannes i atmosfæren" } ] },

        { z: 2, symbol: "He", navn: "Helium", type: "aedelgas", ion: 0, masse: 4.0026,
          isotoper: [ { a: 3, masse: 3.016029, andel: 0.000134 },
                      { a: 4, masse: 4.002602, andel: 99.999866 } ], andre: [] },

        { z: 3, symbol: "Li", navn: "Lithium", type: "metal", ion: 1, masse: 6.94,
          isotoper: [ { a: 6, masse: 6.015123, andel: 7.59 },
                      { a: 7, masse: 7.016003, andel: 92.41 } ], andre: [] },

        { z: 4, symbol: "Be", navn: "Beryllium", type: "metal", ion: 2, masse: 9.0122,
          isotoper: [ { a: 9, masse: 9.012183, andel: 100 } ],
          andre: [ { a: 10, navn: "beryllium-10", note: "radioaktiv, bruges til datering af is" } ] },

        { z: 5, symbol: "B", navn: "Bor", type: "halvmetal", ion: null, masse: 10.81,
          isotoper: [ { a: 10, masse: 10.012937, andel: 19.9 },
                      { a: 11, masse: 11.009305, andel: 80.1 } ], andre: [] },

        { z: 6, symbol: "C", navn: "Carbon", type: "ikkemetal", ion: null, masse: 12.011,
          isotoper: [ { a: 12, masse: 12.000000, andel: 98.93 },
                      { a: 13, masse: 13.003355, andel: 1.07 } ],
          andre: [ { a: 14, navn: "carbon-14", note: "radioaktiv, bruges til kulstof-14-datering" } ] },

        { z: 7, symbol: "N", navn: "Nitrogen", type: "ikkemetal", ion: -3, masse: 14.007,
          isotoper: [ { a: 14, masse: 14.003074, andel: 99.636 },
                      { a: 15, masse: 15.000109, andel: 0.364 } ], andre: [] },

        { z: 8, symbol: "O", navn: "Oxygen", type: "ikkemetal", ion: -2, masse: 15.999,
          isotoper: [ { a: 16, masse: 15.994915, andel: 99.757 },
                      { a: 17, masse: 16.999132, andel: 0.038 },
                      { a: 18, masse: 17.999160, andel: 0.205 } ], andre: [] },

        { z: 9, symbol: "F", navn: "Fluor", type: "ikkemetal", ion: -1, masse: 18.998,
          isotoper: [ { a: 19, masse: 18.998403, andel: 100 } ], andre: [] },

        { z: 10, symbol: "Ne", navn: "Neon", type: "aedelgas", ion: 0, masse: 20.180,
          isotoper: [ { a: 20, masse: 19.992440, andel: 90.48 },
                      { a: 21, masse: 20.993847, andel: 0.27 },
                      { a: 22, masse: 21.991385, andel: 9.25 } ], andre: [] },

        { z: 11, symbol: "Na", navn: "Natrium", type: "metal", ion: 1, masse: 22.990,
          isotoper: [ { a: 23, masse: 22.989769, andel: 100 } ], andre: [] },

        { z: 12, symbol: "Mg", navn: "Magnesium", type: "metal", ion: 2, masse: 24.305,
          isotoper: [ { a: 24, masse: 23.985042, andel: 78.99 },
                      { a: 25, masse: 24.985837, andel: 10.00 },
                      { a: 26, masse: 25.982593, andel: 11.01 } ], andre: [] },

        { z: 13, symbol: "Al", navn: "Aluminium", type: "metal", ion: 3, masse: 26.982,
          isotoper: [ { a: 27, masse: 26.981539, andel: 100 } ], andre: [] },

        { z: 14, symbol: "Si", navn: "Silicium", type: "halvmetal", ion: null, masse: 28.085,
          isotoper: [ { a: 28, masse: 27.976927, andel: 92.223 },
                      { a: 29, masse: 28.976495, andel: 4.685 },
                      { a: 30, masse: 29.973770, andel: 3.092 } ], andre: [] },

        { z: 15, symbol: "P", navn: "Phosphor", type: "ikkemetal", ion: -3, masse: 30.974,
          isotoper: [ { a: 31, masse: 30.973762, andel: 100 } ], andre: [] },

        { z: 16, symbol: "S", navn: "Svovl", type: "ikkemetal", ion: -2, masse: 32.06,
          isotoper: [ { a: 32, masse: 31.972071, andel: 94.99 },
                      { a: 33, masse: 32.971459, andel: 0.75 },
                      { a: 34, masse: 33.967867, andel: 4.25 },
                      { a: 36, masse: 35.967081, andel: 0.01 } ], andre: [] },

        { z: 17, symbol: "Cl", navn: "Chlor", type: "ikkemetal", ion: -1, masse: 35.45,
          isotoper: [ { a: 35, masse: 34.968853, andel: 75.76 },
                      { a: 37, masse: 36.965903, andel: 24.24 } ], andre: [] },

        { z: 18, symbol: "Ar", navn: "Argon", type: "aedelgas", ion: 0, masse: 39.95,
          isotoper: [ { a: 36, masse: 35.967545, andel: 0.3336 },
                      { a: 38, masse: 37.962732, andel: 0.0629 },
                      { a: 40, masse: 39.962383, andel: 99.6035 } ], andre: [] },

        { z: 19, symbol: "K", navn: "Kalium", type: "metal", ion: 1, masse: 39.098,
          isotoper: [ { a: 39, masse: 38.963706, andel: 93.2581 },
                      { a: 41, masse: 40.961825, andel: 6.7302 } ],
          andre: [ { a: 40, navn: "kalium-40", note: "radioaktiv — 0,0117 % af alt kalium, også i din krop" } ] },

        { z: 20, symbol: "Ca", navn: "Calcium", type: "metal", ion: 2, masse: 40.078,
          isotoper: [ { a: 40, masse: 39.962591, andel: 96.941 },
                      { a: 42, masse: 41.958618, andel: 0.647 },
                      { a: 43, masse: 42.958766, andel: 0.135 },
                      { a: 44, masse: 43.955482, andel: 2.086 },
                      { a: 46, masse: 45.953689, andel: 0.004 },
                      { a: 48, masse: 47.952523, andel: 0.187 } ], andre: [] }
    ];

    D.MAKS_Z = D.GRUNDSTOFFER.length;

    /* ----- Opslag ----------------------------------------------------- */
    D.grundstof = function (z) {
        return (z >= 1 && z <= D.MAKS_Z) ? D.GRUNDSTOFFER[z - 1] : null;
    };

    D.findSymbol = function (symbol) {
        for (var i = 0; i < D.GRUNDSTOFFER.length; i++) {
            if (D.GRUNDSTOFFER[i].symbol === symbol) return D.GRUNDSTOFFER[i];
        }
        return null;
    };

    /* Den hyppigste isotop - det er den, man normalt mener. */
    D.hyppigsteIsotop = function (z) {
        var g = D.grundstof(z);
        if (!g) return null;
        var bedst = g.isotoper[0];
        for (var i = 1; i < g.isotoper.length; i++) {
            if (g.isotoper[i].andel > bedst.andel) bedst = g.isotoper[i];
        }
        return bedst;
    };

    /* ----- Elektronfordeling ------------------------------------------ */
    /* Skallerne fyldes indefra og ud med 2, 8, 8 og 2 elektroner.
       Kalium og calcium er undtagelsen: deres sidste elektroner gaar i
       skal 4, selvom skal 3 kun er halvt fyldt. Det er netop derfor, de
       opfoerer sig som metaller med 1 og 2 yderelektroner. */
    D.skalfordeling = function (antalElektroner) {
        if (antalElektroner > 18 && antalElektroner <= 20) {
            return [2, 8, 8, antalElektroner - 18];
        }
        var rest = antalElektroner;
        var ud = [];
        for (var i = 0; i < D.SKALPLADSER.length && rest > 0; i++) {
            var n = Math.min(rest, D.SKALPLADSER[i]);
            ud.push(n);
            rest -= n;
        }
        return ud;
    };

    D.valenselektroner = function (antalElektroner) {
        var f = D.skalfordeling(antalElektroner);
        return f.length ? f[f.length - 1] : 0;
    };

    /* Har elektronskyen samme opbygning som en aedelgas? */
    D.aedelgasStruktur = function (antalElektroner) {
        if (antalElektroner === 2) return D.grundstof(2);
        if (antalElektroner === 10) return D.grundstof(10);
        if (antalElektroner === 18) return D.grundstof(18);
        return null;
    };

    /* ----- Kerner ------------------------------------------------------ */
    /* Hvad ved vi om kernen med z protoner og n neutroner?
       art: "naturlig" | "radioaktiv" | "findes-ikke" */
    D.kerne = function (z, n) {
        var g = D.grundstof(z);
        var a = z + n;
        if (!g) return { art: "findes-ikke", a: a, grundstof: null };

        var i;
        for (i = 0; i < g.isotoper.length; i++) {
            if (g.isotoper[i].a === a) {
                return { art: "naturlig", a: a, isotop: g.isotoper[i], grundstof: g };
            }
        }
        for (i = 0; i < g.andre.length; i++) {
            if (g.andre[i].a === a) {
                return { art: "radioaktiv", a: a, isotop: g.andre[i], grundstof: g };
            }
        }
        return { art: "findes-ikke", a: a, grundstof: g };
    };

    /* Den vejede gennemsnitsmasse af en blanding.
       andele er procenter, som ikke behoever at give praecis 100. */
    D.gennemsnitsmasse = function (isotoper, andele) {
        var sum = 0, vaegt = 0;
        for (var i = 0; i < isotoper.length; i++) {
            var p = andele ? andele[i] : isotoper[i].andel;
            sum += p * isotoper[i].masse;
            vaegt += p;
        }
        return vaegt > 0 ? sum / vaegt : 0;
    };

    /* ----- Ioner og salte ---------------------------------------------- */
    /* Navnet paa den negative ion: chlor bliver til chlorid. */
    D.ANIONNAVN = {
        F: "fluorid", Cl: "chlorid", O: "oxid", S: "sulfid", N: "nitrid", P: "phosphid"
    };

    /* De grundstoffer, det er trygt at bygge salte af paa kemi C. Bor og
       silicium staar med vilje ikke paa listerne: de danner ikke simple
       ioner, selvom de ligger i de samme grupper. */
    D.SALT_METALLER = ["Li", "Na", "K", "Mg", "Ca", "Al"];
    D.SALT_IKKEMETALLER = ["F", "Cl", "O", "S", "N"];

    function stoersteFaellesDivisor(a, b) {
        while (b) { var t = a % b; a = b; b = t; }
        return a;
    }

    /* Forholdet mellem metal og ikkemetal i saltet: den mindste
       kombination, hvor de positive og negative ladninger gaar lige op. */
    D.formelforhold = function (positiv, negativ) {
        var p = Math.abs(positiv);
        var n = Math.abs(negativ);
        var mindsteFaelles = p * n / stoersteFaellesDivisor(p, n);
        return {
            antalPositive: mindsteFaelles / p,
            antalNegative: mindsteFaelles / n,
            ladningIAlt: mindsteFaelles
        };
    };

    /* Formlen skrevet paent: MgCl₂, Al₂O₃ */
    D.saltformel = function (metal, ikkemetal) {
        var f = D.formelforhold(metal.ion, ikkemetal.ion);
        return metal.symbol + (f.antalPositive > 1 ? NK.saenket(f.antalPositive) : "")
             + ikkemetal.symbol + (f.antalNegative > 1 ? NK.saenket(f.antalNegative) : "");
    };

    D.saltnavn = function (metal, ikkemetal) {
        var anion = D.ANIONNAVN[ikkemetal.symbol] || ikkemetal.navn.toLowerCase();
        return metal.navn.toLowerCase() + anion;
    };
}());
