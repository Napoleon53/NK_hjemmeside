/* =====================================================================
   tjek.js - tjekker det, eleven skriver

   Fire slags svar: en ions formel (Al3+), en ions navn (aluminiumion),
   stoffets formel (Al2O3) og stoffets navn (aluminiumoxid). Hvert tjek
   giver { ok, tom, besked, note }:
     ok     svaret er rigtigt
     tom    feltet er tomt (taeller ikke som et forsoeg)
     besked forklaringen, naar svaret er forkert. Den passer til fejlen:
            ladningen glemt, fortegnet vendt, tallene byttet om, -ion i
            stoffets navn, sulfid i stedet for sulfat osv.
     note   en bemaerkning til et rigtigt svar, fx om stavemaaden

   Man maa skrive haevet og saenket skrift eller almindelige tal, og
   mellemrum er ligegyldige. Store og smaa bogstaver taeller i formler,
   ikke i navne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};

    /* ----- Rensning af det indtastede ------------------------------------ */
    function rens(s) {
        return NK.ascii(s).replace(/\s+/g, "").replace(/\^/g, "");
    }

    function rensNavn(s) {
        return NK.ascii(s).toLowerCase().replace(/[\s\-_.·]+/g, "");
    }

    /* Stavemaader, der er forstaaelige, men ikke kemiens */
    var STAVNING = [
        [/fosf/g, "phosph"], [/klor/g, "chlor"], [/jod/g, "iod"], [/karbon/g, "carbon"],
        [/kalcium/g, "calcium"], [/caesium|cesium/g, "cæsium"], [/aluminum/g, "aluminium"],
        [/sulph/g, "sulf"], [/oxyd/g, "oxid"], [/nikel/g, "nikkel"], [/kobolt/g, "cobalt"]
    ];

    function stav(s) {
        STAVNING.forEach(function (r) { s = s.replace(r[0], r[1]); });
        return s;
    }

    var stort = D.stort;

    /* ----- Forvekslinger, elever faktisk laver ----------------------------
       Noeglen er ionens id, og inde i den det rensede, forkerte navn. */
    var FORVEKSLING = {
        SO4: {
            sulfid: "Sulfid er S²⁻. I SO₄²⁻ er der også oxygen.",
            sulfit: "Sulfit er SO₃²⁻. SO₄²⁻ har ét oxygen mere.",
            svovlsyre: "Svovlsyre er H₂SO₄, et molekyle. Ionen har sit eget navn."
        },
        NO3: {
            nitrit: "Nitrit er NO₂⁻. NO₃⁻ har ét oxygen mere.",
            nitrid: "Nitrid er N³⁻. I NO₃⁻ er der også oxygen."
        },
        PO4: {
            phosphid: "Phosphid er P³⁻. I PO₄³⁻ er der også oxygen.",
            phosphit: "Phosphit har et oxygen mindre. PO₄³⁻ har sit eget navn."
        },
        CO3: {
            carbid: "Carbid er noget helt andet. Find CO₃²⁻ på plakaten.",
            hydrogencarbonat: "Hydrogencarbonat er HCO₃⁻. I CO₃²⁻ er der intet H.",
            kuldioxid: "Kuldioxid er CO₂, et molekyle. Ionen har sit eget navn."
        },
        HCO3: {
            carbonat: "Carbonat er CO₃²⁻. HCO₃⁻ har også et H.",
            bicarbonat: "Bicarbonat er et gammelt navn. Find det nye på plakaten."
        },
        OH: {
            oxid: "Oxid er O²⁻. OH⁻ har også et H.",
            hydrid: "Hydrid er H⁻. OH⁻ har også et O.",
            hydrogenoxid: "Tæt på, men ionen har sit eget navn. Find den på plakaten."
        },
        NH4: {
            ammoniak: "Ammoniak er NH₃, et molekyle. NH₄⁺ er en ion med sit eget navn.",
            ammoniakion: "Ammoniak er NH₃, et molekyle. NH₄⁺ er en ion med sit eget navn."
        },
        S: {
            sulfat: "Sulfat er SO₄²⁻. Her er der kun svovl.",
            sulfit: "Sulfit er SO₃²⁻. Her er der kun svovl.",
            svovlid: "Tæt på. Navnet kommer af det latinske navn for svovl, sulfur."
        },
        O: {
            oxygenid: "Tæt på. Oxygen bliver til oxid.",
            iltid: "Tæt på. Oxygen bliver til oxid.",
            hydroxid: "Hydroxid er OH⁻. Her er der kun oxygen."
        },
        N: {
            nitrat: "Nitrat er NO₃⁻. Her er der kun nitrogen.",
            nitrit: "Nitrit er NO₂⁻. Her er der kun nitrogen.",
            nitrogenid: "Tæt på. Nitrogen bliver til nitrid."
        },
        P: {
            phosphat: "Phosphat er PO₄³⁻. Her er der kun phosphor.",
            phosphorid: "Tæt på. Phosphor bliver til phosphid."
        },
        Cl: { chlorat: "Chlorat er ClO₃⁻. Her er der kun chlor." },
        Br: { bromat: "Bromat er BrO₃⁻. Her er der kun brom." },
        I: { iodat: "Iodat er IO₃⁻. Her er der kun iod." }
    };

    function forveksling(ion, s) {
        var f = FORVEKSLING[ion.id];
        return f && f[s] ? f[s] : null;
    }

    /* Hverdagsnavne. De er ikke forkerte, men glasset vil have det
       kemiske navn. Noeglen er stoffets formel. */
    var HVERDAG = {
        Fe2O3: { rust: "Rust står der på cyklen." },
        NaHCO3: { natron: "Natron står der på pakken i køkkenet.", bicarbonat: "Bicarbonat står der på pakken." },
        NH4Cl: { salmiak: "Salmiak står der på lakridsposen." },
        K2CO3: { potaske: "Potaske står der i opskriften på brunkager." },
        NaOH: { kaustisksoda: "Kaustisk soda står der på dunken." },
        "Fe(OH)3": { okker: "Okker står der i kommunens rapport om vandløbet." },
        ZnO: { zinksalve: "Zinksalve står der på tuben." },
        KNO3: { salpeter: "Salpeter står der på den gamle krukke." },
        CuSO4: { blåvitriol: "Blåvitriol er det gamle navn.", kobbervitriol: "Kobbervitriol er det gamle navn." },
        CaCl2: { vejsalt: "Vejsalt står der på sækken." }
    };

    /* Formler, som ikke er et af lagerets stoffer */
    var PAASKE_FORMEL = {
        H2O: "H₂O er vand. Det er ikke det, der står i glasset.",
        NaCl: "NaCl er køkkensalt. Det står i et andet skab.",
        CO2: "CO₂ er kuldioxid. Det står slet ikke på et lager."
    };

    /* ----- Ionens formel ---------------------------------------------- */
    function fortegnsBesked(ion) {
        if (ion.q > 0) {
            return ion.sammensat ? stort(ion.stamme) + " er en positiv ion."
                : "Metaller afgiver elektroner og bliver til positive ioner.";
        }
        return ion.sammensat ? stort(ion.navn) + " er en negativ ion."
            : "Ikke-metaller optager elektroner og bliver til negative ioner.";
    }

    function stoerrelsesBesked(ion, tal, st, retning) {
        if (ion.sammensat) return "Tjek ladningen på plakaten med sammensatte ioner.";
        if (ion.beregnes) {
            if (retning === "navn" && st) {
                var a = st.anIon;
                return "Regn efter. " + st.formelTekst + " er neutral. Hvor meget minus giver " + D.antalTekst(st.n, a) + "?";
            }
            return "Tallet i parentesen i navnet er ionens ladning.";
        }
        if (ion.q < 0 && tal === ion.gruppe) {
            return "Ikke så mange. " + stort(ion.grundnavn) + " optager kun de elektroner, der mangler, før yderste skal er fuld.";
        }
        return "Tjek, hvilken hovedgruppe " + ion.grundnavn + " står i.";
    }

    function symbolBesked(s, ion) {
        if (ion.sammensat) {
            return "Tjek formlen for " + (ion.q > 0 ? ion.stamme : ion.navn) + " på plakaten med sammensatte ioner.";
        }
        if (/^[a-zæøå]/.test(s)) return "Et symbol starter altid med stort bogstav.";
        var m = /^([A-Z][a-z]?)/.exec(s);
        var g = m ? D.grundstof(m[1]) : null;
        if (g) return m[1] + " er " + g.navn + ". Find " + ion.grundnavn + " i det periodiske system.";
        return "Find " + ion.grundnavn + " i det periodiske system, og skriv symbolet med ladning.";
    }

    T.ion = function (raa, ion, st, retning) {
        var s = rens(raa);
        if (!s) return { tom: true, besked: "Skriv ionen med symbol og ladning, fx Na+ eller O2-." };
        var f = ion.formel, m = Math.abs(ion.q), fg = ion.q > 0 ? "+" : "-";
        var rigtig = f + (m > 1 ? m : "") + fg;
        if (s === rigtig) return { ok: true };
        if (m === 1 && s === f + "1" + fg) {
            return { ok: true, note: "Rigtigt. En ladning på 1 skrives bare som " + (ion.q > 0 ? "+" : "−") + ": " + ion.tekst + "." };
        }
        if (s.toLowerCase() === rigtig.toLowerCase()) {
            return { besked: "Store og små bogstaver betyder noget. Det skrives " + NK.formel(f) + "." };
        }
        if (/(\+\+|--)$/.test(s)) return { besked: "Skriv ladningen med tal og fortegn, fx O2- for O²⁻." };
        if (/^[a-zæøå()]{4,}$/i.test(s)) {
            return { besked: "Skriv ionens formel med ladning, ikke navnet. Fx Na+ eller O2-." };
        }

        var sl = s.toLowerCase(), fl = f.toLowerCase();
        if (sl.indexOf(fl) === 0) {
            var rest = s.slice(f.length);
            if (rest === "") return { besked: "Husk ladningen. En ion har altid en ladning." };
            if (/^\d+$/.test(rest)) return { besked: "Husk fortegnet: + eller − efter tallet." };
            var mt = /^(\d*)([+-])$/.exec(rest), mo = /^([+-])(\d+)$/.exec(rest);
            var tal, tegn, omvendt = false;
            if (mt) { tal = mt[1] === "" ? 1 : parseInt(mt[1], 10); tegn = mt[2]; }
            else if (mo) { tal = parseInt(mo[2], 10); tegn = mo[1]; omvendt = true; }
            else return { besked: "Skriv ionen som symbol og ladning, fx Mg2+ eller O2-." };
            if (tal === m && tegn === fg) {
                if (omvendt) return { besked: "Tallet står før fortegnet: " + ion.tekst + "." };
                return { besked: "Store og små bogstaver betyder noget. Det skrives " + NK.formel(f) + "." };
            }
            if (tegn !== fg) return { besked: fortegnsBesked(ion) };
            return { besked: stoerrelsesBesked(ion, tal, st, retning) };
        }
        return { besked: symbolBesked(s, ion) };
    };

    /* ----- Ionens navn ------------------------------------------------- */
    T.ionNavn = function (raa, ion) {
        var s = rensNavn(raa);
        if (!s) return { tom: true, besked: "Skriv ionens navn." };
        var gyldige = ion.navne.map(rensNavn);
        if (gyldige.indexOf(s) >= 0) return { ok: true };
        var s2 = stav(s);
        if (gyldige.indexOf(s2) >= 0) return { ok: true, note: "Rigtigt. I kemi staves det " + ion.navn + "." };
        s = s2;

        var f = forveksling(ion, s) || forveksling(ion, s.replace(/ion$/, ""));
        if (ion.q < 0) {
            if (/ion$/.test(s) && gyldige.indexOf(s.replace(/ion$/, "")) >= 0) {
                return { besked: "Negative ioner får ikke endelsen -ion." };
            }
            if (f) return { besked: f };
            if (ion.sammensat) return { besked: "Find " + ion.tekst + " på plakaten med sammensatte ioner." };
            if (s.indexOf(rensNavn(ion.grundnavn)) === 0 || s.indexOf("ilt") === 0) {
                return { besked: "Ionen hedder ikke det samme som grundstoffet. Den får endelsen -id." };
            }
            return { besked: "Negative ioner af ét grundstof ender på -id." };
        }

        var stamme = rensNavn(ion.stamme);
        if (s === rensNavn(ion.saltdel) || (ion.variabel && s.indexOf(stamme + "(") === 0 && !/ion$/.test(s))) {
            return { besked: "En positiv ion får endelsen -ion, når den står alene." };
        }
        if (ion.variabel) {
            if (s === stamme + "ion") {
                return { besked: stort(ion.grundnavn) + " kan danne ioner med forskellig ladning. Ladningen skal stå i navnet: " + ion.stamme + "(?)ion." };
            }
            if (s.indexOf(stamme + "(") === 0) {
                if (/\(\+\d\)/.test(s)) return { besked: "Skriv ladningen som romertal, fx " + ion.stamme + "(II)ion, eller som 2+." };
                return { besked: "Tjek tallet i parentesen. Det er ionens ladning, skrevet med romertal." };
            }
        } else if (s.indexOf(stamme + "(") === 0) {
            if (ion.enkelt && (s === stamme + "(" + D.ROM[ion.q].toLowerCase() + ")ion" || s === stamme + "(" + ion.q + "+)ion")) {
                return { ok: true, note: "Rigtigt. " + stort(ion.grundnavn) + " danner kun én ion, så tallet kan udelades: " + ion.navn + "." };
            }
            return { besked: stort(ion.grundnavn) + " danner kun én ion, så der skal ikke tal i navnet." };
        }
        if (f) return { besked: f };
        if (ion.sammensat) return { besked: "Find " + ion.tekst + " på plakaten med sammensatte ioner." };
        if (s.indexOf(stamme) !== 0) return { besked: "Tjek grundstoffets navn i det periodiske system." };
        return { besked: "En positiv ion hedder som grundstoffet med -ion til sidst." };
    };

    /* ----- Stoffets formel --------------------------------------------- */

    /* Laeser én ion med antal fra plads i: "(SO4)3", "SO43", "Al2", "O" */
    function laesDel(s, i, ion) {
        var f = ion.formel, j = i, parentes = false;
        if (s.substr(j, f.length + 2) === "(" + f + ")") { parentes = true; j += f.length + 2; }
        else if (s.substr(j, f.length) === f) { j += f.length; }
        else return null;
        var m = /^\d+/.exec(s.slice(j));
        var antal = 1, ettal = false;
        if (m) { antal = parseInt(m[0], 10); ettal = m[0] === "1"; j += m[0].length; }
        return { antal: antal, parentes: parentes, ettal: ettal, slut: j };
    }

    /* Formlen laest som foerste ion efterfulgt af anden ion, eller null */
    function laesSalt(s, foerste, anden) {
        var a = laesDel(s, 0, foerste);
        if (!a) return null;
        var b = laesDel(s, a.slut, anden);
        if (!b || b.slut !== s.length) return null;
        return { p: a.antal, n: b.antal, pParentes: a.parentes, nParentes: b.parentes, ettal: a.ettal || b.ettal };
    }

    /* Antal atomer af hvert grundstof, parenteser ganget ud */
    function atomer(s) {
        var stak = [{}], i = 0;
        function laeg(o, e, n) { o[e] = (o[e] || 0) + n; }
        while (i < s.length) {
            var c = s.charAt(i);
            if (c === "(") { stak.push({}); i++; continue; }
            if (c === ")") {
                i++;
                var t = /^\d+/.exec(s.slice(i));
                var k = t ? parseInt(t[0], 10) : 1;
                if (t) i += t[0].length;
                var top = stak.pop();
                if (!stak.length) return null;
                for (var e in top) if (Object.prototype.hasOwnProperty.call(top, e)) laeg(stak[stak.length - 1], e, top[e] * k);
                continue;
            }
            var m = /^([A-Z][a-z]?)(\d*)/.exec(s.slice(i));
            if (!m || !m[0]) return null;
            laeg(stak[stak.length - 1], m[1], m[2] ? parseInt(m[2], 10) : 1);
            i += m[0].length;
        }
        return stak.length === 1 ? stak[0] : null;
    }

    function sammeAtomer(s, t) {
        var a = atomer(s), b = atomer(t);
        if (!a || !b) return false;
        var ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
        if (ka.join() !== kb.join()) return false;
        return ka.every(function (e) { return a[e] === b[e]; });
    }

    T.atomer = atomer;

    T.formel = function (raa, st) {
        var s = rens(raa);
        if (!s) return { tom: true, besked: "Skriv formlen, fx Na2O." };
        if (s === st.formel) return { ok: true };
        if (PAASKE_FORMEL[s]) return { besked: PAASKE_FORMEL[s] };
        if (/[+-]/.test(s)) return { besked: "Skriv formlen uden ladninger. De går ud med hinanden." };
        if (s.toLowerCase() === st.formel.toLowerCase()) return { besked: "Store og små bogstaver betyder noget i en formel." };

        var k = st.katIon, a = st.anIon;
        var t = laesSalt(s, k, a);
        if (!t) {
            if (laesSalt(s, a, k)) return { besked: "Den positive ion skrives først i formlen." };
            if (sammeAtomer(s, st.formel)) {
                return { besked: (k.sammensat || a.sammensat)
                    ? "Atomerne passer, men den sammensatte ion skal stå samlet. Er der flere af den, kommer den i parentes."
                    : "Atomerne passer, men den positive ion skrives først." };
            }
            return { besked: "Formlen skal bygges af " + k.tekst + " og " + a.tekst + "." };
        }
        var sum = t.p * k.q + t.n * a.q;
        if (sum !== 0) {
            if (t.p === st.n && t.n === st.p && st.p !== st.n) {
                return { besked: "Tallene er byttet om. Der skal flest af den ion, der har den mindste ladning." };
            }
            return { besked: "Plus og minus går ikke lige op: " + D.antalTekst(t.p, k) + " giver " + NK.fortegn(t.p * k.q) +
                ", og " + D.antalTekst(t.n, a) + " giver " + NK.fortegn(t.n * a.q) + "." };
        }
        if (NK.gcd(t.p, t.n) > 1) return { besked: "Ladningen går op, men forholdet kan forkortes. Brug de mindste hele tal." };
        var mangler = (k.sammensat && t.p > 1 && !t.pParentes) ? k : ((a.sammensat && t.n > 1 && !t.nParentes) ? a : null);
        if (mangler) {
            var antal = mangler === k ? t.p : t.n;
            return { besked: "Når der er flere af en sammensat ion, skal den stå i parentes: (" + NK.formel(mangler.formel) + ")" + NK.saenket(antal) + "." };
        }
        if ((t.pParentes && !(k.sammensat && t.p > 1)) || (t.nParentes && !(a.sammensat && t.n > 1))) {
            return { besked: "Parentesen bruges kun om en sammensat ion, når der er flere af den." };
        }
        if (t.ettal) return { besked: "Tallet 1 skrives ikke i en formel." };
        return { besked: "Næsten. Tjek skrivemåden." };
    };

    /* ----- Stoffets navn ----------------------------------------------- */
    T.navn = function (raa, st) {
        var s = rensNavn(raa);
        if (!s) return { tom: true, besked: "Skriv stoffets navn." };
        var gyldige = st.navne.map(rensNavn);
        if (gyldige.indexOf(s) >= 0) return { ok: true };
        var s2 = stav(s);
        if (gyldige.indexOf(s2) >= 0) return { ok: true, note: "Rigtigt. I kemi staves det " + st.navn + "." };
        s = s2;

        var k = st.katIon, a = st.anIon;
        var stamme = rensNavn(k.stamme), katDel = rensNavn(k.saltdel), anDel = rensNavn(a.navn);

        if (k.enkelt) {
            var med = [stamme + "(" + D.ROM[k.q].toLowerCase() + ")" + anDel, stamme + "(" + k.q + "+)" + anDel];
            if (med.indexOf(s) >= 0) {
                return { ok: true, note: "Rigtigt. " + stort(k.grundnavn) + " danner kun én ion, så tallet kan udelades: " + st.navn + "." };
            }
        }
        var hverdag = HVERDAG[st.formel] && HVERDAG[st.formel][s];
        if (hverdag) return { besked: hverdag + " Glasset skal have det kemiske navn." };

        if (s.indexOf("ion") >= 0 && gyldige.indexOf(s.replace(/ion/g, "")) >= 0) {
            return { besked: "I stoffets navn skrives -ion ikke. Det gør man kun, når ionen står alene." };
        }
        if (s.indexOf(anDel) === 0 && s.length > anDel.length) return { besked: "Den positive ion kommer først i navnet." };
        if (/^(mono|di|tri|tetra|penta)/.test(s) ||
            /(mono|di|tri|tetra|penta)(oxid|sulfid|fluorid|chlorid|bromid|iodid|nitrid|phosphid|hydroxid|nitrat|sulfat|carbonat|phosphat)/.test(s)) {
            return { besked: "Ionforbindelser får ikke talord som di- og tri- i navnet. Antallet følger af ladningerne." };
        }
        if (k.variabel) {
            if (s === stamme + anDel) {
                return { besked: stort(k.grundnavn) + " kan danne ioner med forskellig ladning. Ladningen skal stå i navnet: " + k.stamme + "(?)" + a.navn + "." };
            }
            if (s.indexOf(stamme + "(") === 0) {
                var slut = s.indexOf(")");
                if (slut > 0 && s.slice(slut + 1) === anDel) {
                    if (/\(\+\d\)/.test(s)) return { besked: "Skriv ladningen som romertal, fx " + k.stamme + "(II), eller som 2+." };
                    return { besked: "Tjek ladningen i parentesen. " + st.formelTekst + " er neutral." };
                }
            }
        } else if (s.indexOf(stamme + "(") === 0) {
            return { besked: stort(k.grundnavn) + " danner kun én ion, så der skal ikke tal i navnet." };
        }
        if (s.indexOf(katDel) === 0) {
            var rest = s.slice(katDel.length);
            var f = forveksling(a, rest);
            if (f) return { besked: f };
            if (!a.sammensat && rest.indexOf(rensNavn(a.grundnavn)) === 0) {
                return { besked: "Den negative ion hedder ikke det samme som grundstoffet. Den får endelsen -id." };
            }
            return { besked: "Tjek navnet på den negative ion." };
        }
        if (s.length > anDel.length && s.slice(-anDel.length) === anDel) {
            var fk = forveksling(k, s.slice(0, -anDel.length));
            if (fk) return { besked: fk };
            return { besked: "Tjek navnet på den positive ion." };
        }
        return { besked: "Navnet er den positive ion uden -ion og så den negative ion." };
    };

    /* ----- Visning i etiketmaskinens display ---------------------------
       Det indtastede skrevet, som det ser ud i bogen: O2- bliver O²⁻,
       Al2(SO4)3 bliver Al₂(SO₄)₃. Navne vises, som de er skrevet. */
    T.pynt = function (raa, slags, ion) {
        if (slags === "ionnavn" || slags === "navn") return String(raa || "");
        var s = NK.ascii(raa).replace(/\s+/g, "");
        if (!s) return "";
        if (slags === "ion") {
            var f = ion ? ion.formel : "";
            if (f && s.toLowerCase().indexOf(f.toLowerCase()) === 0) {
                var rest = s.slice(f.length);
                return NK.formel(s.slice(0, f.length)) + (/^\d*[+-]$/.test(rest) ? NK.haevet(rest) : rest);
            }
            var m = /^(.*?)(\d?)([+-])$/.exec(s);
            if (m) return NK.formel(m[1]) + NK.haevet(m[2] + m[3]);
            return NK.formel(s);
        }
        return NK.formel(s);
    };

    NK.Tjek = T;
}());
