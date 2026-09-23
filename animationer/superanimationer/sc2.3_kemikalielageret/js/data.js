/* =====================================================================
   data.js - grundstofferne, ionerne og de 30 stoffer paa lageret

   Alt, der kan regnes ud, regnes ud her og ikke i fanerne: formlen
   foelger af ionernes ladninger, navnet af ionernes navne, og trinene
   og hjaelpen af, hvilken slags ioner stoffet er bygget af. Saa kan en
   opgave aldrig komme til at sige noget andet end resten af animationen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Det periodiske system, periode 1-6 (uden lanthaniderne) -----
       [symbol, dansk navn, periode, soejle 1-18, slags]
       slags: m metal, i ikke-metal, h halvmetal, a aedelgas */
    var PT = [
        ["H", "hydrogen", 1, 1, "i"], ["He", "helium", 1, 18, "a"],
        ["Li", "lithium", 2, 1, "m"], ["Be", "beryllium", 2, 2, "m"], ["B", "bor", 2, 13, "h"], ["C", "carbon", 2, 14, "i"],
        ["N", "nitrogen", 2, 15, "i"], ["O", "oxygen", 2, 16, "i"], ["F", "fluor", 2, 17, "i"], ["Ne", "neon", 2, 18, "a"],
        ["Na", "natrium", 3, 1, "m"], ["Mg", "magnesium", 3, 2, "m"], ["Al", "aluminium", 3, 13, "m"], ["Si", "silicium", 3, 14, "h"],
        ["P", "phosphor", 3, 15, "i"], ["S", "svovl", 3, 16, "i"], ["Cl", "chlor", 3, 17, "i"], ["Ar", "argon", 3, 18, "a"],
        ["K", "kalium", 4, 1, "m"], ["Ca", "calcium", 4, 2, "m"], ["Sc", "scandium", 4, 3, "m"], ["Ti", "titan", 4, 4, "m"],
        ["V", "vanadium", 4, 5, "m"], ["Cr", "chrom", 4, 6, "m"], ["Mn", "mangan", 4, 7, "m"], ["Fe", "jern", 4, 8, "m"],
        ["Co", "cobalt", 4, 9, "m"], ["Ni", "nikkel", 4, 10, "m"], ["Cu", "kobber", 4, 11, "m"], ["Zn", "zink", 4, 12, "m"],
        ["Ga", "gallium", 4, 13, "m"], ["Ge", "germanium", 4, 14, "h"], ["As", "arsen", 4, 15, "h"], ["Se", "selen", 4, 16, "i"],
        ["Br", "brom", 4, 17, "i"], ["Kr", "krypton", 4, 18, "a"],
        ["Rb", "rubidium", 5, 1, "m"], ["Sr", "strontium", 5, 2, "m"], ["Y", "yttrium", 5, 3, "m"], ["Zr", "zirconium", 5, 4, "m"],
        ["Nb", "niobium", 5, 5, "m"], ["Mo", "molybdæn", 5, 6, "m"], ["Tc", "technetium", 5, 7, "m"], ["Ru", "ruthenium", 5, 8, "m"],
        ["Rh", "rhodium", 5, 9, "m"], ["Pd", "palladium", 5, 10, "m"], ["Ag", "sølv", 5, 11, "m"], ["Cd", "cadmium", 5, 12, "m"],
        ["In", "indium", 5, 13, "m"], ["Sn", "tin", 5, 14, "m"], ["Sb", "antimon", 5, 15, "h"], ["Te", "tellur", 5, 16, "h"],
        ["I", "iod", 5, 17, "i"], ["Xe", "xenon", 5, 18, "a"],
        ["Cs", "cæsium", 6, 1, "m"], ["Ba", "barium", 6, 2, "m"], ["La", "lanthan", 6, 3, "m"], ["Hf", "hafnium", 6, 4, "m"],
        ["Ta", "tantal", 6, 5, "m"], ["W", "wolfram", 6, 6, "m"], ["Re", "rhenium", 6, 7, "m"], ["Os", "osmium", 6, 8, "m"],
        ["Ir", "iridium", 6, 9, "m"], ["Pt", "platin", 6, 10, "m"], ["Au", "guld", 6, 11, "m"], ["Hg", "kviksølv", 6, 12, "m"],
        ["Tl", "thallium", 6, 13, "m"], ["Pb", "bly", 6, 14, "m"], ["Bi", "bismuth", 6, 15, "m"], ["Po", "polonium", 6, 16, "m"],
        ["At", "astat", 6, 17, "i"], ["Rn", "radon", 6, 18, "a"]
    ];

    D.GRUNDSTOFFER = PT.map(function (r) {
        return { s: r[0], navn: r[1], periode: r[2], soejle: r[3], slags: r[4] };
    });

    var efterSymbol = {};
    D.GRUNDSTOFFER.forEach(function (g) { efterSymbol[g.s] = g; });
    D.grundstof = function (s) { return efterSymbol[s] || null; };

    /* Hovedgruppenummeret 1-8, som det staar i bogen. Soejle 3-12 er
       overgangsmetallerne, som ikke har et hovedgruppenummer. */
    D.hovedgruppe = function (s) {
        var g = efterSymbol[s];
        if (!g) return null;
        if (g.soejle <= 2) return g.soejle;
        if (g.soejle >= 13) return g.soejle - 10;
        return null;
    };

    /* Metaller, der kan danne ioner med forskellig ladning. Sn og Pb
       staar i hovedgruppe 4, men ladningen kan heller ikke aflaeses. */
    D.FLERE_LADNINGER = ["Fe", "Cu", "Sn", "Pb", "Hg"];

    /* ----- Ionerne ---------------------------------------------------
       formel      med almindelige tal ("SO4"); vises med NK.formel
       q           ladningen
       stamme      positive ioner: navnet uden "ion" og uden romertal
       navn        negative ioner: navnet
       variabel    metallet kan have flere ladninger: romertal i navnet
       enkelt      metallet staar ikke i en hovedgruppe, men har kun én
                   ladning (Ag, Zn): ingen romertal, men ladningen kan
                   ikke aflaeses
       sammensat   en sammensat ion: den skal man kende */
    var ROM = { 1: "I", 2: "II", 3: "III", 4: "IV" };
    D.ROM = ROM;

    var IONER = {};
    function ion(o) { IONER[o.id] = o; }

    ion({ id: "Na", formel: "Na", q: 1, stamme: "natrium" });
    ion({ id: "K", formel: "K", q: 1, stamme: "kalium" });
    ion({ id: "Li", formel: "Li", q: 1, stamme: "lithium" });
    ion({ id: "Mg", formel: "Mg", q: 2, stamme: "magnesium" });
    ion({ id: "Ca", formel: "Ca", q: 2, stamme: "calcium" });
    ion({ id: "Ba", formel: "Ba", q: 2, stamme: "barium" });
    ion({ id: "Sr", formel: "Sr", q: 2, stamme: "strontium" });
    ion({ id: "Be", formel: "Be", q: 2, stamme: "beryllium" });
    ion({ id: "Al", formel: "Al", q: 3, stamme: "aluminium" });

    ion({ id: "Fe2", formel: "Fe", q: 2, stamme: "jern", variabel: true });
    ion({ id: "Fe3", formel: "Fe", q: 3, stamme: "jern", variabel: true });
    ion({ id: "Cu1", formel: "Cu", q: 1, stamme: "kobber", variabel: true });
    ion({ id: "Cu2", formel: "Cu", q: 2, stamme: "kobber", variabel: true });
    ion({ id: "Pb2", formel: "Pb", q: 2, stamme: "bly", variabel: true });
    ion({ id: "Pb4", formel: "Pb", q: 4, stamme: "bly", variabel: true });
    ion({ id: "Sn2", formel: "Sn", q: 2, stamme: "tin", variabel: true });
    ion({ id: "Hg2", formel: "Hg", q: 2, stamme: "kviksølv", variabel: true });
    ion({ id: "Ag", formel: "Ag", q: 1, stamme: "sølv", enkelt: true });
    ion({ id: "Zn", formel: "Zn", q: 2, stamme: "zink", enkelt: true });

    ion({ id: "NH4", formel: "NH4", q: 1, stamme: "ammonium", sammensat: true });

    ion({ id: "O", formel: "O", q: -2, navn: "oxid" });
    ion({ id: "S", formel: "S", q: -2, navn: "sulfid" });
    ion({ id: "F", formel: "F", q: -1, navn: "fluorid" });
    ion({ id: "Cl", formel: "Cl", q: -1, navn: "chlorid" });
    ion({ id: "Br", formel: "Br", q: -1, navn: "bromid" });
    ion({ id: "I", formel: "I", q: -1, navn: "iodid" });
    ion({ id: "N", formel: "N", q: -3, navn: "nitrid" });
    ion({ id: "P", formel: "P", q: -3, navn: "phosphid" });

    ion({ id: "OH", formel: "OH", q: -1, navn: "hydroxid", sammensat: true });
    ion({ id: "NO3", formel: "NO3", q: -1, navn: "nitrat", sammensat: true });
    ion({ id: "HCO3", formel: "HCO3", q: -1, navn: "hydrogencarbonat", sammensat: true });
    ion({ id: "SO4", formel: "SO4", q: -2, navn: "sulfat", sammensat: true });
    ion({ id: "CO3", formel: "CO3", q: -2, navn: "carbonat", sammensat: true });
    ion({ id: "PO4", formel: "PO4", q: -3, navn: "phosphat", sammensat: true });

    /* Det, der kan regnes ud af hver ion */
    Object.keys(IONER).forEach(function (id) {
        var i = IONER[id];
        i.tekst = NK.formel(i.formel) + NK.ladningHaevet(i.q);
        if (!i.sammensat) {
            i.grundnavn = efterSymbol[i.formel].navn;
            i.gruppe = D.hovedgruppe(i.formel);
        }
        if (i.q > 0) {
            i.saltdel = i.stamme + (i.variabel ? "(" + ROM[i.q] + ")" : "");
            i.navn = i.saltdel + "ion";
            i.navne = [i.navn];
            if (i.variabel) i.navne.push(i.stamme + "(" + i.q + "+)ion");
        } else {
            i.saltdel = i.navn;
            i.navne = [i.navn];
        }
        /* Ladningen kan ikke aflaeses i det periodiske system, men maa
           regnes ud af formlen, naar man kun har den */
        i.beregnes = !!(i.variabel || i.enkelt);
    });

    D.IONER = IONER;
    D.ion = function (id) { return IONER[id]; };

    /* De sammensatte ioner paa plakaten, i den raekkefoelge de staar der.
       HCO3- er ikke blandt kompendiets seks vigtige og kommer kun med,
       naar Sværere ioner er slaaet til. */
    D.PLAKAT_IONER = ["NH4", "OH", "NO3", "HCO3", "SO4", "CO3", "PO4"];
    D.plakatIoner = function (svaer) {
        return D.PLAKAT_IONER.filter(function (id) { return svaer || id !== "HCO3"; });
    };

    /* Kontakten Sværere ioner. Huskes i browseren. */
    NK.indstil = NK.indstil || {};
    NK.indstil.svaer = !!NK.hent("nk-sc2.3-svaer", false);

    /* ----- Hylderne ---------------------------------------------------- */
    D.HYLDER = [
        { navn: "Skriv formlen", kort: "navn → formel", farve: "#3d9ee0" },
        { navn: "Skriv navnet", kort: "formel → navn", farve: "#e6892a" },
        { navn: "Sammensatte ioner", kort: "begge veje", farve: "#3fae72" }
    ];

    /* ----- De 30 stoffer og de 6 sværere -----------------------------
       [positiv ion, negativ ion, retning, hylde, farve, form, fakta]
       retning "formel": etiketten har navnet, og eleven skriver formlen.
       retning "navn":   etiketten har formlen, og eleven skriver navnet.
       Farven er det vandfri stofs farve. form: pulver, krystal, piller.
       Alle stofferne findes og bruges til noget.

       Grundsaettet (S) holder sig til det, kompendiet til kapitel 2
       bruger: hovedgrupperne blandt de foerste 20 grundstoffer plus Br, I
       og Ba, metalionerne Fe, Cu, Ag og Zn og de seks vigtige sammensatte
       ioner. Pladsen paa hylden er raekkefoelgen inden for hylden. */
    var S = [
        ["Na", "O", "formel", 0, "#f2f0ea", "pulver", "Indgår i almindeligt vinduesglas."],
        ["Mg", "Cl", "formel", 0, "#f4f3ef", "krystal", "Får sojamælk til at stivne til tofu."],
        ["K", "I", "formel", 0, "#f6f5f0", "krystal", "Tabletter mod radioaktivt iod ved atomulykker."],
        ["Al", "O", "formel", 0, "#eeeeea", "pulver", "Rubin og safir er aluminiumoxid med lidt urenheder."],
        ["K", "S", "formel", 0, "#e6d59a", "pulver", "Giver sølv en mørk, antik overflade."],
        ["Ba", "F", "formel", 0, "#f3f3f3", "pulver", "Linser, der lukker infrarødt lys igennem."],
        ["Li", "N", "formel", 0, "#b8485e", "pulver", "Dannes, når lithium reagerer med luftens nitrogen."],
        ["Ca", "Cl", "formel", 0, "#f5f4f0", "krystal", "Vejsalt, der virker ved lavere temperatur end køkkensalt."],
        ["Be", "O", "formel", 0, "#f0f0ec", "pulver", "Keramik, der leder varme næsten som et metal."],
        ["Ca", "P", "formel", 0, "#8a5a44", "krystal", "Nødblus til søs: med vand dannes en gas, der selv tager fyr."],

        ["Fe2", "O", "navn", 1, "#2b2724", "pulver", "Sort. Findes i hammerskæl, der springer af under smedning."],
        ["Cu2", "Cl", "navn", 1, "#b98a35", "pulver", "Farver en flamme blågrøn."],
        ["Fe3", "O", "navn", 1, "#8b3a1e", "pulver", "Hovedbestanddelen i rust."],
        ["Zn", "O", "navn", 1, "#f7f7f5", "pulver", "Den hvide solcreme på næsen."],
        ["Cu1", "O", "navn", 1, "#a8322a", "pulver", "Rødt pigment i bundmaling til skibe."],
        ["Fe3", "Cl", "navn", 1, "#35331f", "krystal", "Bruges til at ætse printplader."],
        ["Ag", "Br", "navn", 1, "#e6dfa4", "pulver", "Det lysfølsomme stof i gammeldags fotofilm."],
        ["Cu2", "O", "navn", 1, "#221e1c", "pulver", "Det sorte lag på kobber, der har været varmet op."],
        ["Ag", "S", "navn", 1, "#2e2d30", "pulver", "Den sorte anløbning på sølvtøj."],
        ["Fe2", "Cl", "navn", 1, "#ddd6b8", "krystal", "Dannes, når jern opløses i saltsyre."],

        ["Na", "OH", "formel", 2, "#f6f6f3", "piller", "Kaustisk soda. Opløser fedt i afløbsrens."],
        ["NH4", "Cl", "navn", 2, "#f5f5f2", "krystal", "Salmiak: smagen i salt lakrids."],
        ["K", "CO3", "formel", 2, "#f3f2ee", "pulver", "Potaske: hævemiddel i brunkager."],
        ["K", "NO3", "navn", 2, "#f6f6f2", "krystal", "Salpeter: en af bestanddelene i sortkrudt."],
        ["Ba", "SO4", "formel", 2, "#f8f8f6", "pulver", "Drikkes før røntgen, så mave og tarm kan ses."],
        ["Cu2", "SO4", "navn", 2, "#e7e9e8", "pulver", "Hvidt uden vand. Med vand bliver det blåt."],
        ["Al", "SO4", "formel", 2, "#f1f1ed", "krystal", "Renser drikkevand: snavset fælder ud sammen med det."],
        ["Ca", "PO4", "navn", 2, "#efede6", "pulver", "Knoglernes mineral er en form for calciumphosphat."],
        ["NH4", "SO4", "formel", 2, "#f2f1ec", "krystal", "Gødning med både nitrogen og svovl."],
        ["Fe3", "OH", "navn", 2, "#9a4a22", "pulver", "Okker: det rødbrune slam i jernholdige vandløb."]
    ];

    /* De sværere: tilvalg med kontakten Sværere ioner. Hvert stof tager
       pladsen [hylde, plads] fra et stof i grundsaettet. */
    var SVAER = [
        ["Sr", "Cl", "formel", 0, "#f4f4f0", "krystal", "Farver en flamme rød.", 7],
        ["Pb4", "O", "navn", 1, "#3b2718", "pulver", "Sidder på pluspolen i et bilbatteri.", 7],
        ["Sn2", "F", "navn", 1, "#f5f5f2", "pulver", "Fluoren i nogle tandpastaer.", 8],
        ["Hg2", "O", "navn", 1, "#c23a20", "pulver", "Priestley fik ilt ud af det i 1774.", 9],
        ["Na", "HCO3", "navn", 2, "#f7f7f4", "pulver", "Natron: hævemiddel i bagepulver.", 3],
        ["Pb2", "NO3", "navn", 2, "#f4f4f1", "krystal", "Giver gult bundfald med kaliumiodid.", 5]
    ];

    /* Det, kontakten Sværere ioner tilføjer, med ord til knappens forklaring */
    D.SVAER_IONER = "Sr²⁺, Sn²⁺, Pb²⁺, Pb⁴⁺, Hg²⁺ og HCO₃⁻";

    /* Én del af formlen: ionen og antallet. En sammensat ion, der er
       flere af, kommer i parentes; et ettal skrives ikke. */
    function formelDel(i, antal) {
        if (antal === 1) return i.formel;
        return (i.sammensat ? "(" + i.formel + ")" : i.formel) + antal;
    }

    function lavStof(r, nr, plads, svaer) {
        var k = IONER[r[0]], a = IONER[r[1]];
        var g = NK.gcd(k.q, a.q);
        var p = Math.abs(a.q) / g, n = k.q / g;
        var st = {
            nr: nr,
            id: formelDel(k, p) + formelDel(a, n),
            kat: r[0], an: r[1],
            katIon: k, anIon: a,
            retning: r[2], hylde: r[3],
            farve: r[4], form: r[5], fakta: r[6],
            p: p, n: n,
            pladsPaaHylde: plads,
            svaer: svaer
        };
        st.formel = st.id;
        st.formelTekst = NK.formel(st.formel);
        st.navn = k.saltdel + a.navn;
        st.navne = [st.navn];
        if (k.variabel) st.navne.push(k.stamme + "(" + k.q + "+)" + a.navn);
        return st;
    }

    /* Alle 36 stoffer: grundsaettet foerst, saa de sværere */
    D.STOFFER = S.map(function (r, nr) { return lavStof(r, nr, nr % 10, false); })
        .concat(SVAER.map(function (r, i) { return lavStof(r, S.length + i, r[7], true); }));

    /* De 30 glas paa reolen, i pladsernes raekkefoelge. Med sværere ioner
       tager de sværere stoffer deres pladser. */
    D.aktive = function (svaer) {
        var ud = D.STOFFER.filter(function (st) { return !st.svaer; });
        if (svaer) {
            D.STOFFER.forEach(function (st) {
                if (!st.svaer) return;
                for (var i = 0; i < ud.length; i++) {
                    if (ud[i].hylde === st.hylde && ud[i].pladsPaaHylde === st.pladsPaaHylde) ud[i] = st;
                }
            });
        }
        return ud;
    };

    D.stof = function (id) {
        for (var i = 0; i < D.STOFFER.length; i++) if (D.STOFFER[i].id === id) return D.STOFFER[i];
        return null;
    };

    /* Den halvdel af etiketten, der er tilbage, naar man skal skrive
       den anden. */
    D.kendt = function (st, retning) {
        return (retning || st.retning) === "formel" ? st.navn : st.formelTekst;
    };

    /* ----- Trinene i en opgave ------------------------------------------
       Navn -> formel: de to ioner, saa formlen.
       Formel -> navn: de to ioner med formel og navn, saa stoffets navn.
       Kan metallets ladning ikke aflaeses (jern, kobber, soelv ...),
       kommer den negative ion foerst: dens ladning skal bruges til at
       regne metallets ud. */
    D.trin = function (st) {
        var k = st.katIon, a = st.anIon;
        if (st.retning === "formel") {
            return [
                { etiket: "Positiv ion", del: k.saltdel, ion: k, felter: [{ slags: "ion" }] },
                { etiket: "Negativ ion", del: a.navn, ion: a, felter: [{ slags: "ion" }] },
                { etiket: "Formel", slut: true, felter: [{ slags: "formel" }] }
            ];
        }
        var raekke = k.beregnes ? [a, k] : [k, a];
        var r = raekke.map(function (i) {
            return {
                etiket: i.q > 0 ? "Positiv ion" : "Negativ ion",
                del: NK.formel(i.formel),
                ion: i,
                felter: [{ slags: "ion" }, { slags: "ionnavn" }]
            };
        });
        r.push({ etiket: "Navn", slut: true, felter: [{ slags: "navn" }] });
        return r;
    };

    /* ----- Hjaelpen: foerst et hint, saa svaret ---------------------------
       Hintet hoerer til det felt, eleven staar i. Svaret forklarer ogsaa,
       hvorfor det er det svar. plakat siger, om hintet peger paa en af
       plakaterne, og fremhaev, hvad der skal lyse op paa den. */
    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    D.stort = stort;

    function elektroner(n) { return n + (n === 1 ? " elektron" : " elektroner"); }

    function antalTekst(antal, i) { return antal + " " + i.tekst; }
    D.antalTekst = antalTekst;

    D.hjaelp = function (st, raekke, felt) {
        var k = st.katIon, a = st.anIon;
        var i = raekke.ion;

        if (felt.slags === "ion") {
            if (i.sammensat) {
                return {
                    hint: "Find " + (st.retning === "formel" ? (i.q > 0 ? i.stamme : i.navn) : NK.formel(i.formel)) +
                        " på plakaten med sammensatte ioner.",
                    svar: "<b>" + i.tekst + "</b>. En sammensat ion med ladningen " + NK.ladningstekst(i.q) + ".",
                    plakat: "ioner"
                };
            }
            if (i.beregnes && st.retning === "navn") {
                var anden = i === k ? a : k;
                var antalAnden = i === k ? st.n : st.p;
                var antalDenne = i === k ? st.p : st.n;
                var sum = antalAnden * Math.abs(anden.q);
                return {
                    hint: st.formelTekst + " er neutral. Hvor meget " + (anden.q < 0 ? "minus" : "plus") +
                        " giver " + antalTekst(antalAnden, anden) + "?",
                    svar: "<b>" + i.tekst + "</b>. " + antalTekst(antalAnden, anden) + " giver " +
                        NK.fortegn(antalAnden * anden.q) + ". Så skal " +
                        (antalDenne === 1 ? i.formel : antalDenne + " " + i.formel) + " give " +
                        NK.fortegn(-antalAnden * anden.q) + (antalDenne > 1 ? ", altså " + NK.fortegn(i.q) + " hver" : "") + "." +
                        (i.enkelt ? " " + stort(i.grundnavn) + " danner kun denne ion." : "")
                };
            }
            if (i.beregnes) {
                return {
                    hint: "Tallet i parentesen i navnet er ionens ladning.",
                    svar: "<b>" + i.tekst + "</b>."
                };
            }
            var g = i.gruppe;
            return {
                hint: "Find " + i.grundnavn + " i det periodiske system. Hvilken hovedgruppe står det i?",
                svar: "<b>" + i.tekst + "</b>. " + stort(i.grundnavn) + " står i hovedgruppe " + g +
                    (i.q > 0
                        ? " og afgiver " + elektroner(g) + "."
                        : " og optager " + elektroner(8 - g) + ", så der er 8 i yderste skal."),
                plakat: "pt",
                fremhaev: i.formel
            };
        }

        if (felt.slags === "ionnavn") {
            if (i.sammensat) {
                return {
                    hint: "Find " + i.tekst + " på plakaten med sammensatte ioner.",
                    svar: "<b>" + i.navn + "</b>.",
                    plakat: "ioner"
                };
            }
            if (i.q < 0) {
                return {
                    hint: "En negativ ion af ét grundstof får endelsen -id.",
                    svar: "<b>" + i.navn + "</b>." + (i.formel === "S" ? " Navnet kommer af det latinske sulfur." : "")
                };
            }
            if (i.variabel) {
                return {
                    hint: stort(i.grundnavn) + " kan danne ioner med forskellig ladning. Ladningen skal stå i navnet med romertal i parentes.",
                    svar: "<b>" + i.navn + "</b>. " + ROM[i.q] + " er ladningen " + NK.ladningstekst(i.q) + "."
                };
            }
            if (i.enkelt) {
                return {
                    hint: stort(i.grundnavn) + " danner kun én ion, så ladningen skal ikke stå i navnet.",
                    svar: "<b>" + i.navn + "</b>."
                };
            }
            return {
                hint: "En positiv ion hedder som grundstoffet med -ion til sidst.",
                svar: "<b>" + i.navn + "</b>."
            };
        }

        if (felt.slags === "formel") {
            return {
                hint: "Plus og minus skal gå lige op. Hvor mange " + k.tekst + " og hvor mange " + a.tekst + " skal der til?",
                svar: "<b>" + st.formelTekst + "</b>. " + antalTekst(st.p, k) + " giver " + NK.fortegn(st.p * k.q) +
                    ", og " + antalTekst(st.n, a) + " giver " + NK.fortegn(st.n * a.q) + "." +
                    ((k.sammensat && st.p > 1) || (a.sammensat && st.n > 1)
                        ? " Den sammensatte ion står i parentes, fordi der er flere af den."
                        : ""),
                regnskab: true
            };
        }

        return {
            hint: "Navnet er den positive ion uden -ion og så den negative ion.",
            svar: "<b>" + st.navn + "</b>.",
            regnskab: true
        };
    };

    /* ----- Kemichaels replikker ---------------------------------------- */
    D.HYLDE_ROS = [
        "Ti glas med etiket. Den hylde har ikke set sådan ud siden 2009.",
        "Romertal og det hele. Jeg er rørt.",
        "Sammensatte ioner. Og ingen af dem gik i stykker."
    ];
    D.HYLDE_ROS_STJERNER = [
        "Ti glas, ti stjerner. Jeg tjekker lige, om jeg har tastet forkert.",
        "Ti stjerner. Jern, kobber og bly er ikke vant til så meget ros.",
        "Ti stjerner. Selv ammonium er imponeret."
    ];
    D.LAGER_FAERDIGT = "Hele lageret har etiketter. Nu mangler kun mit kontor.";

    D.SLUT_REPLIK = {
        ingen: "Alle glas i kassen. Den kasse har plads. Det har den haft siden 2009.",
        faa: "Kassen tager dem. Det gør den altid.",
        mange: "Det gik stærkere end kaffemaskinen.",
        rekord: "Ny rekord. Jeg skriver det ned. Et sted."
    };

    NK.Data = D;
}());
