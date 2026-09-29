/* =====================================================================
   opgaver.js - maalene og opgaverne paa fane 1 (vaegten)

   Foerst tre faste maal som opvarmning. Saa kommer fire slags opgaver
   paa skift, med nye tal hver gang:
     To klumper      find de to klumper, der tilsammen vejer x g
     To stoffer      n mol af to stoffer i alt, og vaegten skal vise x g
     Over grænsen    faa vaegten over x g med saa faa mol som muligt
     Tre stoffer     find tre klumper af hvert sit stof, der vejer x g
   Alle summer af to og af tre klumper er forskellige (selvtesten tjekker
   det), saa hver opgave har ét svar. Over grænsen har ét antal mol, men
   flere blandinger kan klare det.

   En opgave er { navn, tekst, hint, fremhaev, svar, start, efter, tjek }.
   svar er det, Vis svaret laegger paa vaegten: { symbol: antal }. start
   er det, der skal ligge paa vaegten, naar opgaven begynder (ellers
   toemmes den). tjek(k) faar det, der ligger paa vaegten (O.komp), og
   giver { ok: true }, { besked } eller null (intet at sige endnu).
   efter(k) er beskeden, naar opgaven er loest.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var O = {};

    function g(m) { return NK.komma(m) + " g"; }
    function Navn(st) { return st.Navn; }

    /* Det, der ligger paa vaegten: antal pr. symbol, delene i hyldens
       raekkefoelge, stofmaengden i alt og massen i hundrededele */
    O.komp = function (tal) {
        var dele = [], n = 0, m = 0;
        D.STOFFER.forEach(function (st) {
            var a = tal[st.s] || 0;
            if (!a) return;
            var dm = D.masse(st, a);
            dele.push({ st: st, n: a, m: dm });
            n += a;
            m += dm;
        });
        var rent = {};
        dele.forEach(function (d) { rent[d.st.s] = d.n; });
        return { tal: rent, dele: dele, n: n, m: m };
    };

    function ens(a, b) {
        var ka = Object.keys(a).filter(function (s) { return a[s]; });
        var kb = Object.keys(b).filter(function (s) { return b[s]; });
        return ka.length === kb.length && ka.every(function (s) { return a[s] === b[s]; });
    }
    O.ens = ens;

    function antal(svar) {
        return Object.keys(svar).reduce(function (s, x) { return s + svar[x]; }, 0);
    }

    /* "3 mol kobber og 3 mol guld" */
    function beskriv(svar) {
        var dele = D.STOFFER.filter(function (st) { return svar[st.s]; }).map(function (st) {
            return svar[st.s] + " mol " + st.navn;
        });
        return dele.length > 1 ? dele.slice(0, -1).join(", ") + " og " + dele[dele.length - 1] : dele[0];
    }

    /* "Kobber og sølv" eller "To klumper kobber" */
    function klumpNavne(k) {
        if (k.dele.length === 1) {
            var tal = ["", "Én klump", "To klumper", "Tre klumper"][k.n] || k.n + " klumper";
            return tal + " " + k.dele[0].st.navn;
        }
        var navne = k.dele.map(function (d, i) { return i === 0 ? Navn(d.st) : d.st.navn; });
        return navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1];
    }

    function forMeget(k, maal) {
        return klumpNavne(k) + " vejer " + g(k.m) + ". Det er for " + (k.m > maal ? "meget." : "lidt.");
    }

    /* Et maal, hvor der skal ligge netop det i svar */
    function praecis(svar) {
        var N = antal(svar);
        return function (k) {
            if (ens(k.tal, svar)) return { ok: true };
            if (k.n >= N) return { besked: "Der skal ligge præcis " + beskriv(svar) + "." };
            return null;
        };
    }

    /* ----- De tre maal ------------------------------------------------------ */
    var cu = D.stof("Cu"), au = D.stof("Au"), c = D.stof("C");
    O.MAAL = [
        {
            navn: "Opvarmning", tekst: "Læg 3 mol kobber på vægten.",
            hint: "Træk klumper fra krukken med kobber op på vægten. Hver klump er 1 mol.",
            fremhaev: ["Cu"], svar: { Cu: 3 }, tjek: praecis({ Cu: 3 }),
            efter: D.regnMasse(cu, 3, null, NK.komma(D.masse(cu, 3))) + ". Hver klump er 1 mol."
        },
        {
            navn: "Opvarmning", tekst: "Læg 3 mol guld ved siden af kobberet.",
            hint: "Træk tre klumper fra krukken med guld op. Kobberet bliver liggende.",
            fremhaev: ["Au"], svar: { Cu: 3, Au: 3 }, start: { Cu: 3 }, tjek: praecis({ Cu: 3, Au: 3 }),
            efter: "Lige mange mol af hver, men guldet vejer " + g(D.masse(au, 3)) +
                " og kobberet kun " + g(D.masse(cu, 3)) + "."
        },
        {
            navn: "Opvarmning", tekst: "Læg 3 mol på vægten, så den viser så lidt som muligt.",
            hint: "Molarmassen står på krukkerne. Det stof, der har den mindste molarmasse, giver den mindste masse.",
            fremhaev: "alle", svar: { C: 3 },
            tjek: function (k) {
                if (ens(k.tal, { C: 3 })) return { ok: true };
                if (k.n === 3) {
                    return { besked: (k.dele.length === 1 ? "3 mol " + k.dele[0].st.navn : "Blandingen") +
                        " vejer " + g(k.m) + ". Det kan gøres lettere." };
                }
                if (k.n > 3) return { besked: "Der skal ligge 3 mol, ikke " + k.n + "." };
                return null;
            },
            efter: "3 mol carbon vejer kun " + g(D.masse(c, 3)) + ". Carbon har den mindste molarmasse."
        }
    ];

    /* ----- De fire slags opgaver --------------------------------------------
       alle(): alle muligheder, som selvtesten kan gaa igennem. lav(p): opgaven. */
    var S = D.STOFFER;

    O.GRAENSER = [250, 350, 450, 500, 650, 750, 900];

    O.TYPER = [
        {
            navn: "To klumper",
            alle: function () {
                var ud = [];
                for (var i = 0; i < S.length; i++) for (var j = i + 1; j < S.length; j++) ud.push([i, j]);
                return ud;
            },
            lav: function (p) {
                var a = S[p[0]], b = S[p[1]], X = a.M + b.M, svar = {};
                svar[a.s] = 1;
                svar[b.s] = 1;
                return {
                    tekst: "Find to klumper, der tilsammen vejer " + g(X) + ".",
                    hint: "Den ene klump er " + b.navn + ". Hvad mangler der så op til " + g(X) + "?",
                    fremhaev: [b.s], svar: svar,
                    efter: Navn(a) + " og " + b.navn + ": m = " + g(a.M) + " + " + g(b.M) + " = " + g(X) + ".",
                    tjek: function (k) {
                        if (ens(k.tal, svar)) return { ok: true };
                        if (k.n === 2) return { besked: forMeget(k, X) };
                        if (k.n > 2) return { besked: "Der skal kun ligge to klumper." };
                        return null;
                    }
                };
            }
        },
        {
            navn: "To stoffer",
            alle: function () {
                var ud = [];
                for (var i = 0; i < S.length; i++) {
                    for (var j = i + 1; j < S.length; j++) {
                        for (var N = 3; N <= 6; N++) for (var kb = 1; kb < N; kb++) ud.push([i, j, N, kb]);
                    }
                }
                return ud;
            },
            lav: function (p) {
                var a = S[p[0]], b = S[p[1]], N = p[2], kb = p[3], ka = N - kb;
                var X = D.masse(a, ka) + D.masse(b, kb), svar = {};
                svar[a.s] = ka;
                svar[b.s] = kb;
                return {
                    tekst: "Bland " + a.navn + " og " + b.navn + ": " + N + " mol i alt, og vægten skal vise " + g(X) + ".",
                    hint: "Start med " + N + " mol " + a.navn + ". Hver klump, du bytter til " + b.navn +
                        ", lægger " + g(b.M - a.M) + " til.",
                    fremhaev: [a.s, b.s], svar: svar,
                    efter: beskriv(svar) + ": m = " + g(D.masse(a, ka)) + " + " + g(D.masse(b, kb)) + " = " + g(X) + ".",
                    tjek: function (k) {
                        if (ens(k.tal, svar)) return { ok: true };
                        var andre = k.dele.some(function (d) { return d.st !== a && d.st !== b; });
                        if (andre) return { besked: "Brug kun " + a.navn + " og " + b.navn + "." };
                        if (k.n === N) return { besked: N + " mol og " + g(k.m) + ". Det er for " + (k.m > X ? "meget." : "lidt.") };
                        if (k.n > N) return { besked: "Der skal ligge " + N + " mol i alt." };
                        return null;
                    }
                };
            }
        },
        {
            navn: "Over grænsen",
            alle: function () { return O.GRAENSER.map(function (x) { return [x]; }); },
            lav: function (p) {
                var X = p[0] * 100, tung = S[S.length - 1], nmin = Math.floor(X / tung.M) + 1, svar = {};
                svar[tung.s] = nmin;
                return {
                    tekst: "Få vægten over " + p[0] + " g med så få mol som muligt.",
                    hint: "Brug det stof, hvor 1 mol vejer mest.",
                    fremhaev: "alle", svar: svar, nmin: nmin,
                    efter: function (k) {
                        return k.n + " mol og " + g(k.m) + ". Med " + (nmin - 1) + " mol kan vægten højst vise " +
                            g(D.masse(tung, nmin - 1)) + ".";
                    },
                    tjek: function (k) {
                        if (k.m > X && k.n === nmin) return { ok: true };
                        if (k.m > X && k.n > nmin) {
                            return { besked: "Over " + p[0] + " g, men med " + k.n + " mol. Det kan gøres med færre." };
                        }
                        return null;
                    }
                };
            }
        },
        {
            navn: "Tre stoffer",
            alle: function () {
                var ud = [];
                for (var i = 0; i < S.length; i++) {
                    for (var j = i + 1; j < S.length; j++) for (var l = j + 1; l < S.length; l++) ud.push([i, j, l]);
                }
                return ud;
            },
            lav: function (p) {
                var a = S[p[0]], b = S[p[1]], t = S[p[2]], X = a.M + b.M + t.M, svar = {};
                svar[a.s] = 1;
                svar[b.s] = 1;
                svar[t.s] = 1;
                return {
                    tekst: "Find tre klumper af hvert sit stof, der tilsammen vejer " + g(X) + ".",
                    hint: "Den ene er " + t.navn + ". De to andre skal tilsammen veje " + g(X - t.M) + ".",
                    fremhaev: [t.s], svar: svar,
                    efter: Navn(a) + ", " + b.navn + " og " + t.navn + ": m = " + g(a.M) + " + " + g(b.M) +
                        " + " + g(t.M) + " = " + g(X) + ".",
                    tjek: function (k) {
                        if (ens(k.tal, svar)) return { ok: true };
                        if (k.n === 3 && k.dele.length === 3) return { besked: forMeget(k, X) };
                        if (k.n === 3) return { besked: "De tre klumper skal være af hvert sit stof." };
                        if (k.n > 3) return { besked: "Der skal kun ligge tre klumper." };
                        return null;
                    }
                };
            }
        }
    ];

    /* Opgave nr. i (fra 0). De tre foerste er maalene, saa kommer typerne
       paa skift. p: mulighedens nummer; uden p vaelges en tilfaeldig, men
       ikke undgaa (den, typen havde sidst). */
    O.type = function (i) {
        return i < O.MAAL.length ? null : O.TYPER[(i - O.MAAL.length) % O.TYPER.length];
    };

    O.opgave = function (i, p, undgaa) {
        var ty = O.type(i);
        if (!ty) return O.MAAL[i];
        var alle = ty.alle();
        if (p === undefined || p === null) {
            do { p = Math.floor(Math.random() * alle.length); } while (alle.length > 1 && p === undgaa);
        }
        var o = ty.lav(alle[p]);
        o.navn = ty.navn;
        o.p = p;
        return o;
    };

    O.efter = function (o, k) {
        return typeof o.efter === "function" ? o.efter(k) : o.efter;
    };

    NK.Opgaver = O;
}());
