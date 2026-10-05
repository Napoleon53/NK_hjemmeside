/* =====================================================================
   spil.js - reglerne, uden tegning

   Et spil er et almindeligt objekt S, og alle funktioner tager det som
   foerste argument:

     nr          hvilket spoergsmaal man er ved (0 til 14)
     spoergsmaal de 15 spoergsmaal med blandede svar
     valgt       det svar, eleven har peget paa (0 til 3 eller null)
     laast       er svaret laast
     udfald      "rigtig" eller "forkert", naar svaret er laast
     fjernet     hvilke svar en livline har taget vaek
     publikum    publikums stemmer i procent, naar de er spurgt
     livliner    hvilke livliner der er brugt
     slut        null, "vundet", "tabt" eller "stoppet"
     gevinst     det, eleven gaar hjem med
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var NOEGLE_SET = "nk-million-set";

    /* Svarene blandes, saa det rigtige ikke altid er A. I data staar det
       rigtige foerst. */
    function stil(sp) {
        var orden = NK.bland([0, 1, 2, 3]);
        return {
            id: sp.id,
            kap: sp.kap,
            b: sp.b,
            svar: {
                da: orden.map(function (i) { return sp.svar.da[i]; }),
                en: orden.map(function (i) { return sp.svar.en[i]; })
            },
            rigtig: orden.indexOf(0)
        };
    }

    /* Traekker spoergsmaal fra kapitlerne. Dem, eleven ikke har set, kommer
       foerst; derefter dem, det er laengst siden, eleven saa. */
    function traek(kapitler, antal, brugte) {
        var set = NK.hent(NOEGLE_SET, []);
        var pulje = D.SPOERGSMAAL.filter(function (s) {
            return kapitler.indexOf(s.kap) >= 0 && !brugte[s.id];
        });
        var nye = NK.bland(pulje.filter(function (s) { return set.indexOf(s.id) < 0; }));
        var gamle = pulje.filter(function (s) { return set.indexOf(s.id) >= 0; })
            .sort(function (a, b) { return set.indexOf(a.id) - set.indexOf(b.id); });
        var valgt = nye.concat(gamle).slice(0, antal);
        valgt.forEach(function (s) { brugte[s.id] = true; });
        return valgt.map(stil);
    }

    /* Et spoergsmaal er set, naar det har staaet paa skaermen. */
    function husk(sp) {
        var set = NK.hent(NOEGLE_SET, []);
        var i = set.indexOf(sp.id);
        if (i >= 0) set.splice(i, 1);
        set.push(sp.id);
        NK.gem(NOEGLE_SET, set);
    }

    function trin(nr) {
        for (var i = 0; i < D.TRIN.length; i++) {
            if (nr <= D.TRIN[i].til) return i;
        }
        return D.TRIN.length - 1;
    }

    function forkerteTilbage(S) {
        var q = S.spoergsmaal[S.nr];
        return [0, 1, 2, 3].filter(function (i) { return i !== q.rigtig && !S.fjernet[i]; });
    }

    function tagVaek(S, liste) {
        liste.forEach(function (i) {
            S.fjernet[i] = true;
            if (S.valgt === i) S.valgt = null;
        });
    }

    var Spil = NK.Spil = {
        NOEGLE_SET: NOEGLE_SET,
        trin: trin,

        nyt: function () {
            var brugte = {};
            var liste = [];
            var fra = 0;
            D.TRIN.forEach(function (t) {
                liste = liste.concat(traek(t.kap, t.til - fra + 1, brugte));
                fra = t.til + 1;
            });
            var S = {
                nr: 0,
                spoergsmaal: liste,
                brugte: brugte,
                valgt: null,
                laast: false,
                udfald: null,
                fjernet: [false, false, false, false],
                livliner: { halv: false, publikum: false, byt: false },
                publikum: null,
                slut: null,
                gevinst: 0
            };
            husk(liste[0]);
            return S;
        },

        aktuelt: function (S) { return S.spoergsmaal[S.nr]; },

        /* Det, spoergsmaalet gaelder */
        beloeb: function (nr) { return D.BELOEB[nr]; },

        /* Det, eleven har vundet, foer spoergsmaal nr er besvaret */
        har: function (nr) { return nr > 0 ? D.BELOEB[nr - 1] : 0; },

        /* Det, eleven beholder ved et forkert svar paa spoergsmaal nr */
        sikret: function (nr) {
            var kr = 0;
            D.SIKRE.forEach(function (i) { if (nr > i) kr = D.BELOEB[i]; });
            return kr;
        },

        vaelg: function (S, i) {
            if (S.slut || S.laast || i < 0 || i > 3 || S.fjernet[i]) return false;
            S.valgt = i;
            return true;
        },

        laas: function (S) {
            if (S.slut || S.laast || S.valgt === null) return null;
            S.laast = true;
            S.udfald = S.valgt === S.spoergsmaal[S.nr].rigtig ? "rigtig" : "forkert";
            return S.udfald;
        },

        /* Efter et laast svar: naeste spoergsmaal, eller spillet er slut */
        videre: function (S) {
            if (S.slut || !S.laast) return false;
            if (S.udfald === "forkert") {
                S.slut = "tabt";
                S.gevinst = Spil.sikret(S.nr);
                return true;
            }
            if (S.nr >= D.BELOEB.length - 1) {
                S.slut = "vundet";
                S.gevinst = D.BELOEB[D.BELOEB.length - 1];
                return true;
            }
            S.nr++;
            S.valgt = null;
            S.laast = false;
            S.udfald = null;
            S.fjernet = [false, false, false, false];
            S.publikum = null;
            husk(S.spoergsmaal[S.nr]);
            return true;
        },

        kanStoppe: function (S) { return !S.slut && !S.laast && S.nr > 0; },

        stop: function (S) {
            if (!Spil.kanStoppe(S)) return false;
            S.slut = "stoppet";
            S.gevinst = Spil.har(S.nr);
            return true;
        },

        forkerteTilbage: forkerteTilbage,

        /* Kan livlinen bruges nu? */
        kan: function (S, navn) {
            if (S.slut || S.laast || S.livliner[navn]) return false;
            if (navn === "byt") return Spil.erstatning(S).length > 0;
            if (navn === "publikum") return true;
            return forkerteTilbage(S).length >= 2;
        },

        /* To vaek: ét forkert svar bliver staaende ved siden af det rigtige */
        halv: function (S) {
            if (!Spil.kan(S, "halv")) return false;
            var forkerte = NK.bland(forkerteTilbage(S));
            tagVaek(S, forkerte.slice(1));
            S.livliner.halv = true;
            return true;
        },

        /* Sandsynligheden for hver linje i D.PUBLIKUM ved spoergsmaal nr (talt
           fra 0): publikum bliver daarligere, jo laengere man kommer. */
        publikumAndele: function (nr) {
            return D.PUBLIKUM.map(function (k, i) {
                return Math.max(0, k.andel + nr * D.PUBLIKUM_TRIN[i]);
            });
        },

        /* Publikums stemmer i procent, én pr. svar (0 for et fjernet svar).
           Foerst traekkes, hvor godt publikum rammer (D.PUBLIKUM), saa faar
           det rigtige svar et tal i det spaend, og resten deles tilfaeldigt
           mellem de forkerte svar, der staar tilbage. */
        stemmer: function (rigtig, forkerte, nr) {
            var andele = Spil.publikumAndele(nr || 0);
            var r = Math.random(), sum = 0, k = D.PUBLIKUM[D.PUBLIKUM.length - 1];
            for (var i = 0; i < D.PUBLIKUM.length; i++) {
                sum += andele[i];
                if (r < sum) { k = D.PUBLIKUM[i]; break; }
            }
            var ud = [0, 0, 0, 0];
            ud[rigtig] = Math.round(k.fra + Math.random() * (k.til - k.fra));
            if (!forkerte.length) { ud[rigtig] = 100; return ud; }
            var rest = 100 - ud[rigtig];
            var vaegt = forkerte.map(function () { return Math.random(); });
            var ialt = vaegt.reduce(function (a, b) { return a + b; }, 0) || 1;
            var dele = vaegt.map(function (v) { return rest * v / ialt; });
            var brugt = 0;
            forkerte.forEach(function (nr, j) { ud[nr] = Math.floor(dele[j]); brugt += ud[nr]; });
            /* de sidste procent gaar til dem, der blev rundet mest ned */
            var orden = forkerte.map(function (nr, j) { return j; }).sort(function (a, b) {
                return (dele[b] - Math.floor(dele[b])) - (dele[a] - Math.floor(dele[a]));
            });
            for (var n = 0; brugt < rest; n++, brugt++) ud[forkerte[orden[n % orden.length]]]++;
            return ud;
        },

        /* Spoerg publikum */
        publikum: function (S) {
            if (!Spil.kan(S, "publikum")) return false;
            S.publikum = Spil.stemmer(S.spoergsmaal[S.nr].rigtig, forkerteTilbage(S), S.nr);
            S.livliner.publikum = true;
            return true;
        },

        /* De spoergsmaal fra samme trin, der ikke er med i spillet */
        erstatning: function (S) {
            var kap = D.TRIN[trin(S.nr)].kap;
            return D.SPOERGSMAAL.filter(function (s) {
                return kap.indexOf(s.kap) >= 0 && !S.brugte[s.id];
            });
        },

        /* Nyt spoergsmaal af samme svaerhedsgrad */
        byt: function (S) {
            if (!Spil.kan(S, "byt")) return false;
            var ny = traek(D.TRIN[trin(S.nr)].kap, 1, S.brugte)[0];
            S.spoergsmaal[S.nr] = ny;
            S.valgt = null;
            S.fjernet = [false, false, false, false];
            S.publikum = null;
            S.livliner.byt = true;
            husk(ny);
            return true;
        },

        /* Beskrivelsen til et fagord, hvis ordet er svaret paa et andet
           spoergsmaal. Bruges til at forklare et forkert svar. */
        beskrivelse: function (ord, sprog) {
            for (var i = 0; i < D.SPOERGSMAAL.length; i++) {
                if (D.SPOERGSMAAL[i].svar[sprog][0] === ord) return D.SPOERGSMAAL[i].b[sprog];
            }
            return null;
        }
    };
}());
