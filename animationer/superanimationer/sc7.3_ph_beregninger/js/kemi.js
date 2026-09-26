/* =====================================================================
   kemi.js - modellen: pH og koncentrationerne, trinene i opgaverne og
   tjekket af elevens svar

   Alt er ved 25 °C, hvor vands ionprodukt er K_w = 1,0 · 10⁻¹⁴ M².
   Et trin er én beregning fra én stoerrelse til den naeste paa
   regnevejen: [H₃O⁺] -> pH, pH -> [H₃O⁺], [H₃O⁺] -> [OH⁻] osv. Trinet
   ved selv sit facit, sin paene beregning, Maple-koden, tasterne paa
   lommeregneren og forklaringerne paa de typiske fejl.

   Koncentrationer skrives med to betydende cifre og pH med to
   decimaler, som i bogen. Et trin regner videre med det tal, der staar
   i beregningen foer det (det afrundede), saa beregningerne passer
   sammen, sadan som eleven selv ville skrive dem.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    K.KW = 1.0e-14;

    function log10(x) { return Math.log(x) / Math.LN10; }
    K.log10 = log10;

    K.ph = function (h) { return -log10(h); };
    K.h3o = function (ph) { return Math.pow(10, -ph); };

    /* ----- Tal ------------------------------------------------------------ */
    function eksponent(v) {
        return Math.floor(log10(Math.abs(v)) + 1e-9);
    }

    /* Rundet til cifre betydende cifre (standard 2) */
    K.rund = function (v, cifre) {
        cifre = cifre || 2;
        if (!v) return 0;
        var e = eksponent(v);
        var f = Math.pow(10, cifre - 1 - e);
        return Math.round(v * f * (1 + 1e-12)) / f;
    };

    /* Tallet delt i mantisse og tierpotens: 3,8 · 10⁻⁴ -> { m: "3,8", e: -4 } */
    K.mantisse = function (v, cifre) {
        cifre = cifre || 2;
        var r = K.rund(v, cifre);
        var e = eksponent(r);
        var m = r / Math.pow(10, e);
        if (m >= 9.9999) { m /= 10; e++; }
        return { m: m.toFixed(cifre - 1).replace(".", ","), mTal: parseFloat(m.toFixed(cifre - 1)), e: e };
    };

    /* "3,8 · 10⁻⁴" */
    K.potens = function (v) {
        var p = K.mantisse(v);
        return p.m + " · 10" + NK.haevet(p.e);
    };

    /* "3,8 · 10⁻⁴ M" */
    K.konc = function (v) { return K.potens(v) + " M"; };

    /* Som kommatal med to betydende cifre: 0,050 */
    K.decimal = function (v) { return NK.betydende(v, 2); };

    /* pH med to decimaler og dansk komma */
    K.phTekst = function (ph, dec) {
        dec = dec === undefined ? 2 : dec;
        var v = Math.round(ph * Math.pow(10, dec) * (1 + 1e-12)) / Math.pow(10, dec);
        if (Math.abs(v) < 1e-9) v = 0;
        return v.toFixed(dec).replace(".", ",").replace("-", "−");
    };

    /* pH rundet, som den skrives: 2,30 */
    K.phRund = function (ph) { return Math.round(ph * 100 * (1 + 1e-12)) / 100; };

    /* Et kommatal, som eleven har skrevet det, i Maple: 5,0 -> 5.0 */
    K.mapleTal = function (tekst) {
        var t = String(tekst).replace(",", ".");
        if (t.charAt(0) === ".") t = "0" + t;
        return t;
    };

    /* En koncentration i Maple: 5.0*10^(-3) */
    K.maplePotens = function (v) {
        var p = K.mantisse(v);
        return K.mapleTal(p.m) + "*10^(" + p.e + ")";
    };

    /* Tasterne til et tal: "0,015" -> 0 , 0 1 5 */
    K.tasterTekst = function (tekst) {
        return String(tekst).replace("−", "-").split("").map(function (c) { return c === "-" ? "−" : c; });
    };

    /* Tasterne til en koncentration: 5 , 0 · 10^( − 3 ) */
    K.tasterPotens = function (v) {
        var p = K.mantisse(v);
        return K.tasterTekst(p.m).concat(["·", "10^("], K.tasterTekst(String(p.e)), [")"]);
    };

    /* HTML: 10 med en haevet eksponent, fx 10<sup>−3,42</sup> */
    K.tiI = function (eksp) {
        return "10<sup>" + eksp + "</sup>";
    };

    /* HTML: en broek med taeller over naevner */
    K.broek = function (t, n) {
        return '<span class="brok"><span class="brok-t">' + t + '</span><span class="brok-n">' + n + "</span></span>";
    };

    var KW_TEKST = "1,0 · 10⁻¹⁴";

    /* ----- Elevens svar ----------------------------------------------------
       Et felt kan indeholde "2,30", "2.3", "0,00038", "3,8e-4", "3,8·10^-4"
       osv. Tallet laeses med lommeregnerens egen parser (regner.js), saa
       det er de samme regler. d: antal decimaler i det foerste tal,
       bc: antal betydende cifre i det. */
    K.laesTal = function (tekst) {
        /* Haevede tegn (10⁻⁴) laeses af lommeregneren selv, saa de maa ikke
           laves om til almindelige tegn foerst */
        var t = String(tekst || "").replace(/\s+/g, "");
        if (!t) return null;
        var v = NK.Regner ? NK.Regner.vaerdi(t) : parseFloat(t.replace(",", "."));
        if (v === null || !isFinite(v)) return null;
        var foerste = (NK.ascii(t).match(/^[−-]?[0-9]*[.,]?[0-9]*/) || [""])[0].replace(/^[−-]/, "");
        var dele = foerste.split(/[.,]/);
        var d = dele.length > 1 ? dele[1].length : 0;
        var cifre = foerste.replace(/[.,]/g, "").replace(/^0+/, "");
        var bc = cifre.length;
        if (!bc && /0/.test(foerste)) bc = 1;
        return { v: v, d: d, bc: bc };
    };

    /* En koncentration fra to felter: mantissen og eksponenten. Er
       eksponenten tom, laeses hele tallet fra det foerste felt. */
    K.laesKonc = function (mTekst, eTekst) {
        var m = K.laesTal(mTekst);
        if (!m) return null;
        var e = NK.ascii(eTekst || "").replace(/\s+/g, "");
        if (!e) return m;
        var eTal = K.laesTal(e);
        if (!eTal || Math.round(eTal.v) !== eTal.v) return null;
        return { v: m.v * Math.pow(10, eTal.v), d: m.d, bc: m.bc };
    };

    function naerPh(a, b) { return Math.abs(a - b) <= 0.02; }
    function naerRel(a, b, tol) { return b !== 0 && isFinite(a) && Math.abs(a / b - 1) <= (tol || 0.03); }

    /* Samme cifre, forkert tierpotens */
    function potensFejl(svar, facit) {
        if (!(svar > 0) || !(facit > 0)) return false;
        var k = Math.round(log10(svar / facit));
        return k !== 0 && naerRel(svar, facit * Math.pow(10, k));
    }

    /* Den foerste kandidat, der passer: [vaerdi, besked] eller [vaerdi, besked, "abs"] */
    function find(svar, kandidater, rel) {
        for (var i = 0; i < kandidater.length; i++) {
            var k = kandidater[i];
            if (!isFinite(k[0])) continue;
            if (k[2] === "abs" ? naerPh(svar, k[0]) : (rel ? naerRel(svar, k[0]) : naerPh(svar, k[0]))) return k[1];
        }
        return null;
    }

    /* ----- Trinene -----------------------------------------------------------
       Et trin er én beregning fra én stoerrelse til den naeste:
         { slags, felt ("ph", "konc" eller "tal"), stoerrelse, spm, fra, til,
           facit, alternativ, facitTekst, beregning, maple, taster, fejl,
           formler, formelHint, tastTekst, tastHint, skrivTekst, skrivHint }
       fra og til er stationerne paa regnevejen: c, oh, h, ph.

       Trinet deles i smaa bider, som eleven tager én ad gangen:
         formel  vaelg formlen blandt tre (de forkerte er de typiske fejl)
         tast    saet tallet ind, og tast det paa lommeregneren
         skriv   rund af, og skriv svaret
       Et trin uden formler springer den foerste bid over, og et trin uden
       taster den anden. Formlerne skrives "10^{−pH}" og "K_{w}" (se
       tegning.js); K.formelHtml laver dem om til HTML. */

    K.formelHtml = function (f) {
        return K.hel(String(f).replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>").replace(/_\{([^}]*)\}/g, "<sub>$1</sub>"));
    };

    /* Et tal som 1,0 · 10⁻¹⁴ M² maa ikke deles over to linjer */
    K.hel = function (html) {
        return String(html).replace(/ · /g, " · ").replace(/([0-9⁰¹²³⁴⁵⁶⁷⁸⁹]) M(?![a-zæøå])/g, "$1 M");
    };

    var RUND_PH = "pH skrives med to decimaler. Se på det tredje ciffer efter kommaet: er det 5 eller mere, runder du op.";
    var RUND_KONC = "Behold to cifre: 6,172839506 · 10⁻⁵ bliver til 6,2 · 10⁻⁵. Tallet foran · 10 skrives i det store felt og eksponenten, her −5, i det lille.";

    /* [H₃O⁺] -> pH.  ekstra: flere typiske fejl foerst, fx pOH ved baser */
    K.trinPhAfH = function (h, ekstra) {
        var p = K.mantisse(h);
        var hT = K.potens(h);
        var facit = -log10(h);
        return {
            slags: "ph_af_h", felt: "ph", stoerrelse: "pH", fra: "h", til: "ph",
            spm: "Find pH",
            facit: facit, facitTekst: K.phTekst(facit),
            beregning: "pH = −log(" + hT + ") = " + K.phTekst(facit),
            maple: "-log10(" + K.maplePotens(h) + ")",
            taster: ["−", "log("].concat(K.tasterPotens(h), [")"]),
            formler: [
                { f: "pH = −log[H₃O⁺]", rigtig: true },
                { f: "pH = log[H₃O⁺]", forkl: "Uden minus bliver pH negativ. Der skal minus foran log." },
                { f: "pH = 10^{−[H₃O⁺]}", forkl: "10 opløftet i noget er vejen den anden vej, fra pH til [H₃O⁺]." }
            ].concat(ekstra ? [{ f: "pH = −log[OH⁻]", forkl: "pH regnes altid ud fra [H₃O⁺], ikke ud fra [OH⁻]." }] : []),
            formelHint: "Du kender [H₃O⁺] og skal finde pH. Den formel starter med pH = og har −log i sig.",
            tastTekst: "Skriv " + hT + " i stedet for [H₃O⁺] i formlen. Tast det på lommeregneren, og tryk =.",
            tastHint: "Sådan ser det ud med tallet sat ind: pH = −log(" + hT + "). Husk minus foran log.",
            skrivTekst: "Rund af til to decimaler, og skriv pH i feltet.",
            skrivHint: RUND_PH,
            fejl: function (svar) {
                var k = (ekstra || []).concat([
                    [-facit, "Minusset foran log mangler. Tast − før log."],
                    [-Math.log(h), "Det er ln-tasten. Brug log."],
                    [Math.log(h), "Det er ln-tasten, og minusset mangler. Brug −log."],
                    [-log10(p.mTal), "Du har kun taget log af " + p.m + ". Hele tallet " + hT + " skal stå inde i parentesen efter log."],
                    [-log10(p.mTal) + p.e, "Eksponenten skal være negativ: 10" + NK.haevet(p.e) + ", ikke 10" + NK.haevet(-p.e) + "."],
                    [14 - facit, "Du har regnet 14 − pH. Her skal du bare bruge pH = −log[H₃O⁺]."]
                ]);
                if (Math.abs(p.mTal - 1) > 0.05) k.push([-p.e, "Du har kun brugt 10" + NK.haevet(p.e) + ". Tallet " + p.m + " foran skal også med."]);
                var b = find(svar, k);
                if (b) return b;
                if (svar < 0) return "pH er ikke negativ her. Tjek minusset foran log.";
                return null;
            }
        };
    };

    /* pH -> [H₃O⁺] */
    K.trinHAfPh = function (ph) {
        var pT = K.phTekst(ph);
        var facit = K.h3o(ph);
        var hel = Math.floor(ph);
        return {
            slags: "h_af_ph", felt: "konc", stoerrelse: "[H₃O⁺]", fra: "ph", til: "h",
            spm: "Find [H₃O⁺]",
            facit: facit, facitTekst: K.konc(facit),
            beregning: "[H₃O⁺] = " + K.tiI("−" + pT) + " M = " + K.konc(facit),
            maple: "10^(-" + K.mapleTal(pT) + ")",
            taster: ["10^(", "−"].concat(K.tasterTekst(pT), [")"]),
            formler: [
                { f: "[H₃O⁺] = 10^{−pH}", rigtig: true },
                { f: "[H₃O⁺] = 10^{pH}", forkl: "Uden minus bliver tallet kæmpestort. Der skal minus i eksponenten." },
                { f: "[H₃O⁺] = −log(pH)", forkl: "−log er vejen den anden vej, fra [H₃O⁺] til pH." }
            ],
            formelHint: "Du kender pH og skal finde [H₃O⁺]. Så skal pH op i eksponenten på 10, med minus foran.",
            tastTekst: "Skriv " + pT + " i stedet for pH i formlen. Brug tasten 10ˣ, og tryk =.",
            tastHint: "Sådan ser det ud med tallet sat ind: [H₃O⁺] = " + K.tiI("−" + pT) + ". Tast 10ˣ, så −" + pT + ", så ) og =.",
            skrivTekst: "Rund af til to cifre, og skriv [H₃O⁺] i felterne.",
            skrivHint: RUND_KONC,
            fejl: function (svar) {
                var k = [
                    [Math.pow(10, ph), "Minusset mangler: " + K.tiI("−" + pT) + ", ikke " + K.tiI(pT) + "."],
                    [Math.exp(-ph), "Det er e-tasten. Brug 10ˣ."],
                    [Math.pow(10, -(14 - ph)), "Det er [OH⁻]. [H₃O⁺] finder du med 10<sup>−pH</sup>."]
                ];
                if (ph - hel >= 0.1) k.push([Math.pow(10, -hel), "Du har kun brugt " + hel + " af pH " + pT + ". Hele " + pT + " skal op i eksponenten."]);
                var b = find(svar, k, true);
                if (b) return b;
                b = find(svar, [
                    [-log10(ph), "Du har taget log af pH. Den modsatte vej går med 10ˣ.", "abs"],
                    [ph, "Det er pH-værdien. Her skal du skrive koncentrationen.", "abs"]
                ]);
                if (b) return b;
                if (potensFejl(svar, facit)) return "Cifrene passer, men eksponenten i det lille felt er forkert.";
                return null;
            }
        };
    };

    /* Fra den ene ion til den anden over vands ionprodukt.
       fra: "h" eller "oh", v: den kendte koncentration */
    function trinKw(fra, v, ph) {
        var kendt = fra === "h" ? "[H₃O⁺]" : "[OH⁻]";
        var ukendt = fra === "h" ? "[OH⁻]" : "[H₃O⁺]";
        var p = K.mantisse(v);
        var vT = K.potens(v);
        var facit = K.KW / K.rund(v);
        return {
            slags: fra === "h" ? "oh_af_h" : "h_af_oh", felt: "konc", stoerrelse: ukendt,
            fra: fra, til: fra === "h" ? "oh" : "h",
            spm: "Find " + ukendt,
            facit: facit, alternativ: K.KW / v, facitTekst: K.konc(facit),
            beregning: ukendt + " = " + K.broek(KW_TEKST + " M²", vT + " M") + " = " + K.konc(facit),
            maple: "1.0*10^(-14)/(" + K.maplePotens(v) + ")",
            taster: ["1", ",", "0", "·", "10^(", "−", "1", "4", ")", "/", "("].concat(K.tasterPotens(v), [")"]),
            formler: [
                { f: ukendt + " = K_{w} / " + kendt, rigtig: true },
                { f: ukendt + " = K_{w} · " + kendt, forkl: kendt + " gange " + ukendt + " giver K_{w}. Så skal du dele med " + kendt + ", ikke gange." },
                { f: ukendt + " = " + kendt + " / K_{w}", forkl: "Brøken er vendt om. K_{w} skal stå øverst." }
            ],
            formelHint: "[H₃O⁺] og [OH⁻] ganget sammen giver altid K_{w} = 1,0 · 10⁻¹⁴ M². Så finder du " + ukendt + " ved at dele K_{w} med " + kendt + ".",
            tastTekst: "Skriv tallene ind: K_{w} = 1,0 · 10⁻¹⁴ og " + kendt + " = " + vT + ". Sæt parentes om tallet under brøkstregen, og tryk =.",
            tastHint: "Sådan ser det ud med tallene sat ind: " + ukendt + " = " + KW_TEKST + " / (" + vT + "). Uden parentesen deler lommeregneren kun med " + p.m + ".",
            skrivTekst: "Rund af til to cifre, og skriv " + ukendt + " i felterne.",
            skrivHint: RUND_KONC,
            fejl: function (svar) {
                var k = [
                    [K.KW * v, "Du har ganget. " + ukendt + " = K<sub>w</sub> / " + kendt + ", altså dele."],
                    [v / K.KW, "Du har vendt brøken om. K<sub>w</sub> skal stå øverst."],
                    [v, "Det er " + kendt + ". Brug K<sub>w</sub> til at finde " + ukendt + "."],
                    [K.KW / p.mTal * Math.pow(10, p.e),
                        "Lommeregneren har kun delt med " + p.m + " og ganget med 10" + NK.haevet(p.e) + " bagefter. Sæt parentes om tallet under brøkstregen: " +
                        KW_TEKST + "/(" + vT + ")."],
                    [1e14 / v, "K<sub>w</sub> er " + KW_TEKST + ". Minusset i eksponenten mangler."]
                ];
                var b = find(svar, k, true);
                if (b) return b;
                if (ph !== undefined) {
                    b = find(svar, [[14 - ph, "14 − pH er ikke en koncentration. Brug " + ukendt + " = K<sub>w</sub> / " + kendt + ".", "abs"],
                        [ph, "Det er pH. Her skal du skrive en koncentration.", "abs"]]);
                    if (b) return b;
                }
                if (potensFejl(svar, facit)) return "Cifrene passer, men eksponenten i det lille felt er forkert.";
                return null;
            }
        };
    }

    K.trinOhAfH = function (h, ph) { return trinKw("h", h, ph); };
    K.trinHAfOh = function (oh) { return trinKw("oh", oh); };

    /* Et eksempel paa at skrive et kommatal med tierpotens, som ikke er facit */
    function kommaEksempel(c) {
        var ex = Math.abs(c - 0.03) < 1e-12 ? 0.007 : 0.03;
        return K.decimal(ex) + " = " + K.potens(ex);
    }

    /* En staerk syre: [H₃O⁺] = c.  s = { formel, navn, skema } */
    K.trinHAfSyre = function (s, c) {
        var cT = K.decimal(c);
        return {
            slags: "h_af_syre", felt: "konc", stoerrelse: "[H₃O⁺]", fra: "c", til: "h",
            spm: "Find [H₃O⁺]",
            skema: s.skema,
            facit: c, facitTekst: K.konc(c),
            beregning: "[H₃O⁺] = c(" + s.formel + ") = " + cT + " M = " + K.konc(c),
            maple: null,
            taster: null,
            formler: [
                { f: "[H₃O⁺] = c", rigtig: true },
                { f: "[H₃O⁺] = 2 · c", forkl: "Hvert " + s.formel + "-molekyle giver én H₃O⁺, ikke to. Se reaktionsskemaet." },
                { f: "[H₃O⁺] = K_{w} / c", forkl: s.formel + " er en syre. Den giver H₃O⁺ direkte, så K_{w} skal ikke bruges." }
            ],
            formelHint: s.formel + " er en stærk syre. Alle molekyler reagerer, og hvert molekyle giver én H₃O⁺ (se skemaet). Så er der lige så mange H₃O⁺, som der var " + s.formel + ".",
            skrivTekst: "c(" + s.formel + ") = " + cT + " M. Skriv tallet som et tal gange 10 i en potens.",
            skrivHint: "Flyt kommaet, til der står ét ciffer foran det, og tæl, hvor mange pladser det flyttede. Fx er " + kommaEksempel(c) + ".",
            fejl: function (svar) {
                var b = find(svar, [
                    [2 * c, "Én " + s.formel + " giver én H₃O⁺. [H₃O⁺] = c."],
                    [K.KW / c, "Det er [OH⁻]. For en stærk syre er [H₃O⁺] = c."]
                ], true);
                if (b) return b;
                b = find(svar, [[-log10(c), "Det er pH. Her skal du skrive koncentrationen.", "abs"]]);
                if (b) return b;
                if (potensFejl(svar, c)) return "Eksponenten i det lille felt er forkert. Tæl, hvor mange pladser kommaet flytter.";
                return null;
            }
        };
    };

    /* En staerk base: hvor mange OH⁻ giver én formelenhed?
       b = { formel, ion, n } */
    K.trinNOh = function (b) {
        return {
            slags: "n_oh", felt: "tal", stoerrelse: "OH⁻", fra: "c", til: "oh",
            spm: "Hvor mange OH⁻ giver én " + b.formel + "?",
            skemaFoer: b.formel + "(s) → " + b.ion + "(aq) +",
            skemaEfter: "OH⁻(aq)",
            facit: b.n, facitTekst: String(b.n),
            beregning: b.formel + "(s) → " + b.ion + "(aq) + " + (b.n > 1 ? b.n + " " : "") + "OH⁻(aq)",
            maple: null,
            taster: null,
            formler: null,
            skrivTekst: "Når " + b.formel + " opløses, bliver hver OH til en OH⁻. Tæl OH i formlen, og skriv tallet i feltet.",
            skrivHint: b.n > 1 ? "(OH)₂ betyder to OH. Tallet efter parentesen ganger alt inde i den." : b.formel + " har kun én OH.",
            fejl: function (svar) {
                if (b.n === 2 && svar === 1) return "Parentesen (OH)₂ betyder to OH.";
                if (b.n === 1 && svar === 2) return b.formel + " har kun én OH.";
                if (svar === 0) return "Der dannes OH⁻. Tæl OH i formlen " + b.formel + ".";
                return "Tæl OH i formlen " + b.formel + ".";
            }
        };
    };

    /* En staerk base: [OH⁻] = n · c */
    K.trinOhAfBase = function (b, c) {
        var cT = K.decimal(c);
        var facit = b.n * c;
        var regn = b.n > 1 ? b.n + " · c(" + b.formel + ")" : "c(" + b.formel + ")";
        var tal = b.n > 1 ? b.n + " · " + cT + " M = " + K.decimal(facit) + " M" : cT + " M";
        var formler = b.n > 1 ? [
            { f: "[OH⁻] = " + b.n + " · c", rigtig: true },
            { f: "[OH⁻] = c", forkl: "Hver " + b.formel + " giver " + b.n + " OH⁻. Så bliver der " + b.n + " gange så mange OH⁻." },
            { f: "[OH⁻] = c / " + b.n, forkl: "Der bliver flere OH⁻, ikke færre. Du skal gange med " + b.n + "." }
        ] : [
            { f: "[OH⁻] = c", rigtig: true },
            { f: "[OH⁻] = 2 · c", forkl: b.formel + " har kun én OH. Den giver én OH⁻." },
            { f: "[OH⁻] = K_{w} / c", forkl: b.formel + " er en base. Den giver OH⁻ direkte, så K_{w} skal ikke bruges." }
        ];
        return {
            slags: "oh_af_base", felt: "konc", stoerrelse: "[OH⁻]", fra: "c", til: "oh",
            spm: "Find [OH⁻]",
            facit: facit, facitTekst: K.konc(facit),
            beregning: "[OH⁻] = " + regn + " = " + tal + " = " + K.konc(facit),
            maple: b.n > 1 ? b.n + "*" + K.mapleTal(cT) : null,
            taster: b.n > 1 ? [String(b.n), "·"].concat(K.tasterTekst(cT)) : null,
            formler: formler,
            formelHint: "Du fandt lige, at én " + b.formel + " giver " + (b.n > 1 ? b.n + " OH⁻" : "én OH⁻") + ". Hvad betyder det for, hvor mange OH⁻ der er?",
            tastTekst: "Skriv c = " + cT + " ind i formlen. Tast " + b.n + " · " + cT + " på lommeregneren, og tryk =.",
            tastHint: "Sådan ser det ud med tallet sat ind: [OH⁻] = " + b.n + " · " + cT + " M.",
            skrivTekst: b.n > 1 ? "Skriv [OH⁻] som et tal gange 10 i en potens, i felterne." :
                "c(" + b.formel + ") = " + cT + " M. Skriv tallet som et tal gange 10 i en potens.",
            skrivHint: "Flyt kommaet, til der står ét ciffer foran det, og tæl, hvor mange pladser det flyttede. Fx er " + kommaEksempel(facit) + ".",
            fejl: function (svar) {
                var k = b.n > 1 ? [
                    [c, "Hver " + b.formel + " giver " + b.n + " OH⁻. Gang med " + b.n + "."],
                    [c / b.n, "Der bliver flere OH⁻, ikke færre. Gang med " + b.n + "."]
                ] : [
                    [2 * c, b.formel + " giver kun én OH⁻. [OH⁻] = c."]
                ];
                k.push([K.KW / facit, "Det er [H₃O⁺]. Find først [OH⁻] = " + regn + "."]);
                var r = find(svar, k, true);
                if (r) return r;
                if (potensFejl(svar, facit)) return "Eksponenten i det lille felt er forkert. Tæl, hvor mange pladser kommaet flytter.";
                return null;
            }
        };
    };

    /* ----- Tjekket af et svar ----------------------------------------------------
       tal: det, K.laesTal/K.laesKonc gav. Svar { rigtig, besked, note } */
    K.tjek = function (trin, tal) {
        var v = tal.v;
        if (trin.felt === "tal") {
            if (v === trin.facit) return { rigtig: true, besked: "" };
            return { rigtig: false, besked: trin.fejl(v) };
        }
        if (trin.felt === "ph") {
            var tol = tal.d === 1 ? 0.05 : 0.02;
            if (Math.abs(v - trin.facit) <= tol + 1e-9) {
                var note = tal.d !== 2 ? "Skriv pH med to decimaler: " + trin.facitTekst + "." : "";
                return { rigtig: true, besked: "", note: note };
            }
            return { rigtig: false, besked: trin.fejl(v) };
        }
        /* En koncentration */
        if (naerRel(v, trin.facit) || (trin.alternativ && naerRel(v, trin.alternativ))) {
            return { rigtig: true, besked: "", note: tal.bc !== 2 ? "Med to betydende cifre: " + trin.facitTekst + "." : "" };
        }
        var b = trin.fejl(v);
        if (b) return { rigtig: false, besked: b };
        if (!(v > 0)) return { rigtig: false, besked: v === 0 ? "En koncentration er større end 0." : "En koncentration kan ikke være negativ." };
        return { rigtig: false, besked: null };
    };

    NK.Kemi = K;
}());
