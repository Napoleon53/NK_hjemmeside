/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Boblen viser den valgte beholder i en cirkel med radius R. Hvor mange
   partikler der skal vaere af hver slags, kommer fra oploesningen
   (NK.Stof.partikelTal). Boblen afstemmer sig selv mod de tal.

   Men den afstemmer sig ikke i stilhed. **Naar et tal aendrer sig, fordi
   der sker en reaktion, saa sker reaktionen ogsaa i boblen**: to
   partikler finder hinanden og bliver til én, én gaar i stykker til to,
   et bundfald dannes og synker. Det er dét, eleven skal se - ikke at
   kuglerne bare bliver flere eller faerre.

   ----- Haendelserne udledes af stoftabellen --------------------------
   Der staar ikke ét stofnavn i denne fil (ud over vandet i baggrunden),
   og selvtesten holder den paa det. Hvilke haendelser der kan ses, laeses
   af NK.Stof.REAKTIONER, hvor hver reaktion allerede er skrevet som data
   - her med bogstaver, fordi de rigtige navne hoerer hjemme i
   stoftabellen og ikke her:

       { venstre: [[1, "A"], [1, "B"]], hoejre: [[1, "AB"]],
         slags: "ligevaegt" }

   En **ligevaegt** kan gaa begge veje, en **faeldning**, en **fuld**
   reaktion og en **oploesning** kun den ene. Formen paa haendelsen
   foelger af tallene og faserne, ikke af hvilke stoffer det er:

       faerre partikler ud end ind            bind
       flere partikler ud end ind             split
       et fast stof blandt produkterne        faeld  (kuglen synker)
       et fast stof blandt udgangsstofferne   oploes
       lige mange, eller intet af ovenstaaende omdan

   Derfor virker det ogsaa for en reaktion, der fanger seks partikler paa
   én gang (permanganat og fem jern(II), som den gamle sc8.6 havde), uden
   at der skal skrives noget nyt: alle udgangsstofferne moedes i midten,
   og produkterne springer ud.

   ----- Dynamisk ligevaegt --------------------------------------------
   Staar alle tal i maal, sker der stadig noget: en ligevaegt faar med
   jaevne mellemrum et skub den ene vej (LIGEVAEGT_UR). Saa er der ét
   kompleks for meget, og afstemningen retter det ved at lade et andet gaa
   i stykker. Bind og split kommer altsaa lige ofte af sig selv - det er
   ikke en regel, der er skrevet ind, men foelgen af, at boblen altid
   retter mod tallene, og at den retter med en reaktion, naar der findes
   en. Efter et indgreb dominerer den ene retning, til tallene passer
   igen.

   ----- Valget mellem at reagere og at lade partikler komme og gaa -----
   Er et stof for faa eller for mange, ser boblen foerst efter en
   reaktion, der kan lukke hullet, og vaelger den vej, der samlet bringer
   flest tal taettere paa maalet (`gevinst`). Findes ingen, falder en ny
   partikel ned oppefra, eller en overfloedig toner ud, som foer.
   Et stof, som hverken staar i maalet eller findes i boblen, vises ikke
   og taeller ikke med - det er saadan, vandets egne ioner holder sig ude
   af regnestykket.

   Hver partikel er én kugle med formlen paa: en sammensat ion som NO₃⁻
   er én kugle, ikke fire, der sidder sammen. Farven er stoffets farve i
   oploesning eller graa, naar det er farveloest. Vandmolekylerne ligger
   svagt i baggrunden.

   Det er et modelbillede af, hvad der sker, ikke et regnskab.

   new NK.Mikro(R, k): R er boblens radius, k stoerrelsen af det, der er
   inde i den (kugler, skrift, vandmolekyler, legende og gitter), hvor 1 er
   standard. Et forsoeg kan altsaa goere boblen mindre og indholdet endnu
   mindre (bobleR og bobleIndhold i NK.BORD_VALG).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Stof = NK.Stof;
    var r = NK.r;

    NK.Mikro = function (R, k) {
        this.R = R || 120;
        this.k = k || 1;
        this.nulstil();
        this.foerste = true;
    };

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.partikler = [];
        this.haendelser = [];
        this.blink = [];
        this.taeller = { bind: 0, split: 0, faeld: 0, oploes: 0, omdan: 0 };
        this.spawnUr = 0;
        this.evUr = 0;
        this.spontanUr = 0;
        this.spilNoegle = null;
        this.spil = [];
        this.venter = null;
        this.taal = {};
        this.foerste = false;
        this.fast = null;
        this.s = { ryst: 0 };
    };

    P.toem = function () { this.nulstil(); };

    /* Faa, store kugler: en enkelt ion er 14 enheder, lange formler op til
       22, ganget med k */
    function radius(navn, k) {
        var s = Stof.STOFFER[navn];
        k = k || 1;
        if (!s) return 14 * k;
        if (s.fase === "s") return 16 * k;
        var l = (s.kort || s.formel).replace(/[₀-₉]/g, "").length;
        return NK.klamp(11 + l * 1.9, 14, 22) * k;
    }

    /* Formlen paa en kugle: fed skrift uden kant, inde i kuglen. Moerk
       skrift paa lyse kugler og hvid paa moerke, som i sc6.8 - en sort kant
       om smaa bogstaver goer dem grynede. basis er skriftens stoerrelse;
       er formlen for bred, goeres skriften hoejst ned til mindst, og saa
       stoerre kuglen i stedet (rad i svaret), saa en lang formel som SO4 2-
       stadig kan laeses. */
    function lysstyrke(f) { return 0.299 * f.r + 0.587 * f.g + 0.114 * f.b; }

    function etiketStil(ctx, tekst, rad, farve, basis, mindst) {
        var str = basis;
        ctx.font = "700 " + str.toFixed(2) + "px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width, maks = rad * 1.8;
        if (b > maks) {
            str = Math.max(mindst, str * maks / b);
            rad = Math.max(rad, b * str / basis / 1.8);
        }
        /* Farven midt paa kuglen: mellem den lyse top og den moerke kant */
        var midt = { r: farve.r * 0.82 + 36, g: farve.g * 0.82 + 36, b: farve.b * 0.82 + 36 };
        return { font: "700 " + str.toFixed(2) + "px 'Segoe UI', sans-serif", farve: lysstyrke(midt) > 150 ? "#14181e" : "#ffffff", rad: rad };
    }

    function tegnEtiket(ctx, tekst, x, y, stil) {
        ctx.font = stil.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = stil.farve;
        ctx.fillText(tekst, x, y + 0.5);
    }

    function farveAf(navn) {
        var s = Stof.STOFFER[navn];
        if (s && s.farve) return s.farve;
        if (s && s.q > 0) return { r: 214, g: 190, b: 150 };
        if (s && s.q < 0) return { r: 150, g: 190, b: 214 };
        return { r: 190, g: 196, b: 205 };
    }

    P.ny = function (navn, x, y, vx, vy) {
        var s = Stof.STOFFER[navn];
        var p = {
            navn: navn, x: x, y: y, vx: vx || 0, vy: vy || 0, rad: radius(navn, this.k), alfa: 0,
            fast: !!(s && s.fase === "s"), tekst: s && s.kort ? s.kort : Stof.formel(navn), farve: farveAf(navn),
            fase: r(0, 6.28), doer: false, laast: false, falder: false
        };
        this.partikler.push(p);
        return p;
    };

    P.antal = function (navn) {
        var n = 0;
        for (var i = 0; i < this.partikler.length; i++) if (this.partikler[i].navn === navn && !this.partikler[i].doer) n++;
        return n;
    };

    /* Foerste gang boblen fyldes, ligger partiklerne bare fordelt i den.
       Der er ikke tilsat noget: det er en beholder, man kigger ned i, og
       saa skal indholdet ikke falde ned oppefra. Fast stof ligger i
       bunden. */
    P.fyldOp = function (maal) {
        var R = this.R, mig = this;
        Object.keys(maal).forEach(function (navn) {
            for (var i = mig.antal(navn); i < maal[navn]; i++) {
                var rad = radius(navn, mig.k), fast = Stof.STOFFER[navn] && Stof.STOFFER[navn].fase === "s";
                var v = r(0, 6.28), d = Math.sqrt(Math.random()) * (R - rad - 6);
                var p = mig.ny(navn, Math.cos(v) * d, fast ? r(R * 0.3, R * 0.6) : Math.sin(v) * d, 0, 0);
                p.alfa = 1;
            }
        });
    };

    /* Fast stof: boblen viser stoffets gitter (Stof.gitter) i stedet for
       partikler i en oploesning */
    P.visFast = function (f) {
        this.nulstil();
        this.fast = f || null;
    };

    /* =================================================================
       HAENDELSERNE
       Reaktionerne fra stoftabellen, laest som noget, der kan ses.
       ================================================================= */

    var MAKS_HAENDELSER = 4;     /* hvor mange der maa vaere i gang paa én gang */
    var EV_UR = 0.14;            /* sekunder mellem to nye haendelser */
    var LIGEVAEGT_UR = 1.7;      /* sekunder mellem ligevaegtens egne skub */
    var MOEDE_FART = 85;         /* hvor hurtigt udgangsstofferne moedes */
    var MOEDE_MAKS = 2.2;        /* giv op efter saa lang tid, og reagér alligevel */
    var SPLIT_TID = 0.35;        /* hvor laenge én partikel ryster, foer den deles */
    var VENTE_UR = 3;            /* hvor laenge en spaerret vejs udgangsstoffer er fredet */
    var TAAL_UR = 2.5;           /* hvor laenge boblen venter paa, at noget bliver DANNET */

    function side(rx, retning) { return retning > 0 ? rx.venstre : rx.hoejre; }

    /* Maa denne reaktion gaa baglaens? Kun en ligevaegt. */
    function begge(rx) { return rx.slags === "ligevaegt"; }

    function fastStof(navn) {
        var s = Stof.STOFFER[navn];
        return !!(s && s.fase === "s");
    }

    /* Haendelsens form foelger af tallene og faserne - ikke af hvilke
       stoffer det er. Navnet bruges til farven paa glimtet og til
       taelleren, selvtesten laeser. */
    function form(rx, retning) {
        var kilde = side(rx, retning), maalSide = side(rx, -retning);
        var ind = 0, ud = 0, i;
        for (i = 0; i < kilde.length; i++) ind += kilde[i][0];
        for (i = 0; i < maalSide.length; i++) ud += maalSide[i][0];
        var udFast = maalSide.some(function (l) { return fastStof(l[1]); });
        var indFast = kilde.some(function (l) { return fastStof(l[1]); });
        if (udFast && !indFast) return "faeld";
        if (indFast && !udFast) return "oploes";
        /* Flere slags stof paa BEGGE sider: noget bliver til noget andet,
           og det er hverken en sammenlaegning eller en deling. Saadan
           kendes en redox fra en kompleksdannelse uden at vide, hvilke
           stoffer det er. */
        if (kilde.length > 1 && maalSide.length > 1) return "omdan";
        if (ud < ind) return "bind";
        if (ud > ind) return "split";
        return "omdan";
    }

    var GLIMT = {
        bind:   "255, 110, 80",
        split:  "255, 230, 150",
        faeld:  "255, 255, 255",
        oploes: "200, 230, 255",
        omdan:  "170, 240, 170"
    };

    /* De partikler af en slags, der er frie til at gaa ind i en haendelse */
    P.ledige = function (navn) {
        var ud = [];
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            if (p.navn === navn && !p.laast && !p.doer && !p.falder) ud.push(p);
        }
        return ud;
    };

    /* Optaellingen, som den BLIVER, naar de igangvaerende haendelser er
       faerdige. Ellers ville boblen bestille den samme rettelse to gange. */
    P.telle = function () {
        var c = {};
        this.partikler.forEach(function (p) { if (!p.doer) c[p.navn] = (c[p.navn] || 0) + 1; });
        this.haendelser.forEach(function (h) {
            h.ind.forEach(function (p) { c[p.navn] = (c[p.navn] || 0) - 1; });
            h.ud.forEach(function (u) { c[u.navn] = (c[u.navn] || 0) + u.n; });
        });
        return c;
    };

    P.travl = function () { return this.haendelser.length > 0; };

    /* Et stof, der hverken staar i maalet eller findes i boblen, vises
       ikke. Saadan holder vandets egne ioner sig ude af regnestykket. */
    function vises(navn, maal, c) {
        return !!(maal[navn] || c[navn]);
    }

    /* Staar alle tal, som de skal? Kun da aander ligevaegten. Er boblen
       midt i at indhente et indgreb, ville et skub den anden vej tage en
       ion, som en faeldning stod og manglede - og saa blev indgrebet ikke
       vist. */
    function iMaal(maal, c) {
        var n;
        for (n in maal) if (Object.prototype.hasOwnProperty.call(maal, n) && (c[n] || 0) !== maal[n]) return false;
        for (n in c) if (Object.prototype.hasOwnProperty.call(c, n) && (maal[n] || 0) !== c[n]) return false;
        return true;
    }

    /* Hvor meget naermere maalet kommer tallene, hvis denne vej gaas?
       Positivt betyder taettere paa. Det er hele valget: boblen behoever
       ikke at vide, hvad reaktionen handler om. */
    P.gevinst = function (rx, retning, maal, c) {
        var d = {}, i, l;
        var kilde = side(rx, retning), maalSide = side(rx, -retning);
        for (i = 0; i < kilde.length; i++) { l = kilde[i]; d[l[1]] = (d[l[1]] || 0) - l[0]; }
        for (i = 0; i < maalSide.length; i++) { l = maalSide[i]; d[l[1]] = (d[l[1]] || 0) + l[0]; }
        var g = 0;
        for (var n in d) {
            if (!Object.prototype.hasOwnProperty.call(d, n) || !d[n]) continue;
            if (!Stof.STOFFER[n]) return null;
            if (!vises(n, maal, c)) continue;          /* usynligt: taeller ikke */
            var nu = c[n] || 0, m = maal[n] || 0;
            g += Math.abs(m - nu) - Math.abs(m - (nu + d[n]));
        }
        return g;
    };

    /* Er der partikler nok paa kildesiden? */
    P.harKilde = function (rx, retning) {
        var kilde = side(rx, retning);
        for (var i = 0; i < kilde.length; i++) {
            if (this.ledige(kilde[i][1]).length < kilde[i][0]) return false;
        }
        return true;
    };

    /* Reaktionerne, der overhovedet er i spil: mindst ét af deres stoffer
       vises i boblen. Listen regnes én gang pr. saet af stoffer og gemmes,
       saa REAKTIONER ikke gennemgaas i hver ramme. */
    P.iSpil = function (maal, c) {
        var navne = {}, n;
        for (n in maal) if (Object.prototype.hasOwnProperty.call(maal, n) && maal[n]) navne[n] = true;
        for (n in c) if (Object.prototype.hasOwnProperty.call(c, n) && c[n]) navne[n] = true;
        var noegle = Object.keys(navne).sort().join("|");
        if (this.spilNoegle === noegle) return this.spil;
        var liste = [];
        Stof.REAKTIONER.forEach(function (rx) {
            if (rx.afledt) return;                     /* den afledte baseudgave er den samme haendelse */
            var roert = rx.venstre.concat(rx.hoejre).some(function (l) { return navne[l[1]]; });
            if (!roert) return;
            liste.push({ rx: rx, retning: 1, form: form(rx, 1) });
            if (begge(rx)) liste.push({ rx: rx, retning: -1, form: form(rx, -1) });
        });
        this.spilNoegle = noegle;
        this.spil = liste;
        return liste;
    };

    /* Den vej, der bringer flest tal taettest paa maalet, og som mindst
       flytter `mindst`. Findes ingen, staar boblen i maal. */
    P.bedsteVej = function (maal, c, mindst) {
        var mig = this, bedst = null, bedstG = mindst - 0.0001;
        this.iSpil(maal, c).forEach(function (v) {
            if (!mig.harKilde(v.rx, v.retning)) return;
            var g = mig.gevinst(v.rx, v.retning, maal, c);
            if (g === null || g <= bedstG) return;
            bedstG = g;
            bedst = v;
        });
        return bedst;
    };

    /* Den bedste vej, der er SPAERRET, fordi der mangler et udgangsstof.
       Den er vigtig: uden den ville boblen lade bundfaldet falde ned
       oppefra i stedet for at danne det, naar der ikke er frie ioner
       tilbage. Med den bliver det til en kaede - et kompleks gaar i
       stykker, saa ionen bliver fri, og saa kan faeldningen ses. */
    P.spaerretVej = function (maal, c, mindst) {
        var mig = this, bedst = null, bedstG = mindst - 0.0001;
        this.iSpil(maal, c).forEach(function (v) {
            if (mig.harKilde(v.rx, v.retning)) return;
            var g = mig.gevinst(v.rx, v.retning, maal, c);
            if (g === null || g <= bedstG) return;
            if (!mig.kanSkaffes(v, maal, c)) return;
            bedstG = g;
            bedst = v;
        });
        return bedst;
    };

    /* Det nytter kun at vente paa en spaerret vej, hvis det manglende
       faktisk er paa vej: enten staar det i maalet - saa kommer det af sig
       selv - eller ogsaa kan en anden reaktion danne det. Ellers stod
       boblen og ventede paa noget, der aldrig kom, og saa blev den tom. */
    P.kanSkaffes = function (v, maal, c) {
        var mig = this, mangler = this.mangler(v);
        return Object.keys(mangler).every(function (n) {
            if (maal[n]) return true;
            var et = {};
            et[n] = true;
            return !!mig.vejTil(et, maal, c);
        });
    };

    /* De stoffer, den spaerrede vej mangler - og dem, den allerede har.
       Begge dele skal fredes: det, der mangler, saa det ikke toner ud, saa
       snart det er skaffet, og det, den har, saa det stadig er der, naar
       resten kommer. */
    P.mangler = function (v) {
        var mig = this, ud = {};
        side(v.rx, v.retning).forEach(function (l) {
            if (mig.ledige(l[1]).length < l[0]) ud[l[1]] = true;
        });
        return ud;
    };

    P.kilden = function (v) {
        var ud = {};
        side(v.rx, v.retning).forEach(function (l) { ud[l[1]] = true; });
        return ud;
    };

    /* Er der en reaktion, der kan danne stoffet HER OG NU? Saa skal den
       have lov: et bundfald falder ikke ned oppefra, det bliver dannet.
       "Her og nu" er vigtigt - ellers ville en ion, der bliver haeldt i fra
       en flaske, ogsaa staa og vente paa en reaktion, der slet ikke har
       sine udgangsstoffer. Den vej, boblen netop nu venter paa (venter),
       taeller ogsaa med: den mangler noget, men det er paa vej. */
    P.kanDannesNu = function (navn, maal, c) {
        var mig = this;
        return this.iSpil(maal, c).some(function (v) {
            if (!side(v.rx, -v.retning).some(function (l) { return l[1] === navn; })) return false;
            if (mig.harKilde(v.rx, v.retning)) return true;
            return !!(mig.venter && mig.venter.rx === v.rx && mig.venter.retning === v.retning);
        });
    };

    /* Og omvendt: de stoffer, en reaktion gerne VIL bruge. De maa ikke tone
       ud imens - saa ville boblen bruge dem op paa at rette et tal i stedet
       for at vise, hvad der sker med dem. Det er den samme pointe som
       ovenfor, bare den anden vej: et thiocyanat forsvinder ikke, det
       faelder. */
    P.brugesAf = function (maal, c) {
        var mig = this, ud = {};
        this.iSpil(maal, c).forEach(function (v) {
            var g = mig.gevinst(v.rx, v.retning, maal, c);
            if (g === null || g < 1) return;
            side(v.rx, v.retning).forEach(function (l) { ud[l[1]] = true; });
        });
        return ud;
    };

    /* En vej, der danner mindst ét af de manglende stoffer, og som kan gaas
       nu. Det er ét skridt frem - ikke en soegning, bare naeste led. */
    P.vejTil = function (navne, maal, c) {
        var mig = this, bedst = null, bedstG = -Infinity;
        this.iSpil(maal, c).forEach(function (v) {
            if (!mig.harKilde(v.rx, v.retning)) return;
            var giver = side(v.rx, -v.retning).some(function (l) { return navne[l[1]]; });
            if (!giver) return;
            var g = mig.gevinst(v.rx, v.retning, maal, c);
            if (g === null || g <= bedstG) return;
            bedstG = g;
            bedst = v;
        });
        return bedst;
    };

    /* Ligevaegtens eget skub: en tilfaeldig af de veje, en ligevaegt kan gaa
       lige nu. Den RETTER ikke noget - den flytter tvaertimod ét tal væk fra
       maalet, og det er meningen. Afstemningen retter det bagefter med en
       reaktion den anden vej, og saa er bind og split kommet lige ofte. */
    P.aandedrag = function (maal, c) {
        var mig = this, veje = [];
        this.iSpil(maal, c).forEach(function (v) {
            if (!begge(v.rx) || !mig.harKilde(v.rx, v.retning)) return;
            /* Kun veje, hvor baade det, der bruges, og det, der dannes, er
               noget, boblen viser - ellers ville en usynlig partikel opstaa */
            var ok = side(v.rx, v.retning).concat(side(v.rx, -v.retning)).every(function (l) {
                return !!Stof.STOFFER[l[1]] && vises(l[1], maal, c);
            });
            if (ok) veje.push(v);
        });
        return veje.length ? veje[Math.floor(Math.random() * veje.length)] : null;
    };

    /* De partikler, haendelsen tager: én tilfaeldig at begynde ved, og
       resten de naermeste, saa moedet bliver kort og tydeligt. */
    P.samlInd = function (rx, retning) {
        var kilde = side(rx, retning), ind = [], mx = 0, my = 0, i, j;
        for (i = 0; i < kilde.length; i++) {
            var fri = this.ledige(kilde[i][1]).filter(function (p) { return ind.indexOf(p) < 0; });
            if (fri.length < kilde[i][0]) return null;
            for (j = 0; j < kilde[i][0]; j++) {
                var valgt;
                if (!ind.length) valgt = fri[Math.floor(Math.random() * fri.length)];
                else {
                    var cx = mx / ind.length, cy = my / ind.length, bedst = null, afst = Infinity;
                    fri.forEach(function (p) {
                        if (ind.indexOf(p) >= 0) return;
                        var d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
                        if (d < afst) { afst = d; bedst = p; }
                    });
                    valgt = bedst;
                }
                if (!valgt) return null;
                ind.push(valgt);
                mx += valgt.x;
                my += valgt.y;
            }
        }
        return ind;
    };

    P.start = function (v, maal, c) {
        var ind = this.samlInd(v.rx, v.retning);
        if (!ind) return false;
        var maalSide = side(v.rx, -v.retning), ud = [];
        maalSide.forEach(function (l) {
            if (!Stof.STOFFER[l[1]]) return;
            if (!vises(l[1], maal, c)) return;          /* usynligt produkt tegnes ikke */
            ud.push({ navn: l[1], n: l[0] });
        });
        ind.forEach(function (p) { p.laast = true; });
        this.haendelser.push({ rx: v.rx, retning: v.retning, form: v.form, ind: ind, ud: ud, t: 0 });
        this.taeller[v.form] = (this.taeller[v.form] || 0) + 1;
        return true;
    };

    P.opdaterHaendelser = function (dt) {
        for (var i = this.haendelser.length - 1; i >= 0; i--) {
            var h = this.haendelser[i];
            h.t += dt;
            var mx = 0, my = 0, j, p;
            for (j = 0; j < h.ind.length; j++) { mx += h.ind[j].x; my += h.ind[j].y; }
            mx /= h.ind.length;
            my /= h.ind.length;

            var klar;
            if (h.ind.length === 1) {
                /* Én partikel, der skal dele sig: den ryster foerst */
                h.ind[0].x += Math.sin(h.t * 70) * 0.5;
                klar = h.t > SPLIT_TID;
            } else {
                /* Flere, der skal moedes: alle traekkes mod midten */
                var fjernest = 0;
                for (j = 0; j < h.ind.length; j++) {
                    p = h.ind[j];
                    var dx = mx - p.x, dy = my - p.y;
                    var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    var skridt = Math.min(MOEDE_FART * dt, d);
                    p.x += dx / d * skridt;
                    p.y += dy / d * skridt;
                    p.vx = 0;
                    p.vy = 0;
                    fjernest = Math.max(fjernest, d - p.rad);
                }
                klar = fjernest < 2 || h.t > MOEDE_MAKS;
            }
            if (!klar) continue;

            /* Produkterne springer ud fra midten, fordelt hele vejen rundt,
               saa de ikke ligger oven i hinanden i det oejeblik, de bliver
               til. Afstanden er den stoerste af de kugler, der gik ind. */
            var spred = 0;
            for (j = 0; j < h.ind.length; j++) spred = Math.max(spred, h.ind[j].rad);
            for (j = 0; j < h.ind.length; j++) this.fjern(h.ind[j]);
            var antal = 0;
            h.ud.forEach(function (u) { antal += u.n; });
            var nr = 0, v0 = Math.random() * 6.283;
            var mig = this;
            h.ud.forEach(function (u) {
                for (var m = 0; m < u.n; m++) {
                    var vink = antal > 1 ? v0 + (nr / antal) * 6.283 : v0;
                    var af = antal > 1 ? spred : 0;
                    var ny = mig.ny(u.navn, mx + Math.cos(vink) * af, my + Math.sin(vink) * af,
                                    Math.cos(vink) * 55, Math.sin(vink) * 55);
                    ny.alfa = 1;
                    nr++;
                }
            });
            this.blink.push({ x: mx, y: my, liv: 1, farve: GLIMT[h.form] || GLIMT.omdan });
            this.haendelser.splice(i, 1);
        }
    };

    P.fjern = function (p) {
        var i = this.partikler.indexOf(p);
        if (i >= 0) this.partikler.splice(i, 1);
    };

    /* ----- Afstemningen mod maalet -------------------------------------
       Foerst en reaktion, hvis der findes en, der bringer tallene taettere
       paa. Saa en partikel, der falder ned eller toner ud. Og staar alt i
       maal, faar en ligevaegt lov at aande. */
    P.afstem = function (dt, maal) {
        var c = this.telle(), i, p;
        this.spawnUr -= dt;
        this.evUr -= dt;
        this.spontanUr -= dt;
        if (this.venter) {
            this.venter.ur -= dt;
            if (this.venter.ur <= 0) this.venter = null;
        }

        if (this.haendelser.length < MAKS_HAENDELSER && this.evUr <= 0) {
            var v = this.bedsteVej(maal, c, 1);
            if (v && this.start(v, maal, c)) {
                this.evUr = EV_UR;
                if (this.venter && this.venter.rx === v.rx && this.venter.retning === v.retning) this.venter = null;
                return;
            }
            /* Ingen vej lige nu. Er der en, der ville hjaelpe, men mangler et
               udgangsstof, saa tag det skridt, der skaffer det. */
            var sp = this.spaerretVej(maal, c, 1);
            if (sp) {
                /* Hele kildesiden fredes, mens der ventes: det, der mangler,
                   saa det ikke toner ud, saa snart det er skaffet, og det,
                   vejen allerede har, saa det stadig er der, naar resten
                   kommer. Uret loeber ud af sig selv, saa boblen aldrig kan
                   staa og vente paa noget, der ikke kommer. */
                this.venter = { rx: sp.rx, retning: sp.retning, navne: this.kilden(sp), ur: VENTE_UR };
                var hjaelp = this.vejTil(this.mangler(sp), maal, c);
                if (hjaelp && this.start(hjaelp, maal, c)) { this.evUr = EV_UR; return; }
            }
        }

        /* Taalmodigheden: hvor laenge et stof har staaet og vaeret for faa
           eller for mange. Er der en reaktion, der kan danne eller bruge
           det, faar den lov foerst - og foerst naar taalmodigheden slipper
           op, falder en partikel ned oppefra eller toner ud. Saadan kan
           boblen ikke staa og vente i det uendelige paa noget, der aldrig
           kommer, og den snyder ikke ved at lade et bundfald falde ned. */
        var navne = {}, n;
        Object.keys(maal).forEach(function (x) { navne[x] = true; });
        this.partikler.forEach(function (q) { navne[q.navn] = true; });
        navne = Object.keys(navne);
        for (i = 0; i < navne.length; i++) {
            n = navne[i];
            if ((c[n] || 0) !== (maal[n] || 0)) this.taal[n] = (this.taal[n] || 0) + dt;
            else this.taal[n] = 0;
        }

        /* Uden en reaktion: én partikel ad gangen, som foer */
        if (this.spawnUr <= 0) {
            var gjort = false;
            for (i = 0; i < navne.length && !gjort; i++) {
                n = navne[i];
                if ((c[n] || 0) < (maal[n] || 0)) {
                    if (this.taal[n] < TAAL_UR && this.kanDannesNu(n, maal, c)) continue;
                    if (fastStof(n)) {
                        /* Et bundfald regner ikke ned oppefra. Naaede boblen
                           ikke at danne det hele, toner resten frem nede i
                           bunden, hvor det i forvejen ligger. */
                        this.ny(n, r(-this.R * 0.5, this.R * 0.5), r(this.R * 0.35, this.R * 0.6), 0, 0);
                    } else {
                        this.ny(n, r(-this.R * 0.6, this.R * 0.6), -this.R - 10, r(-10, 10), r(40, 90)).falder = true;
                    }
                    this.spawnUr = 0.12;
                    gjort = true;
                }
            }
            if (!gjort) {
                var bruges = this.brugesAf(maal, c);
                for (i = this.partikler.length - 1; i >= 0; i--) {
                    p = this.partikler[i];
                    if (p.doer || p.laast) continue;
                    if (this.venter && this.venter.navne[p.navn]) continue;
                    if (bruges[p.navn] && this.taal[p.navn] < TAAL_UR) continue;
                    if ((c[p.navn] || 0) > (maal[p.navn] || 0)) { p.doer = true; this.spawnUr = 0.12; break; }
                }
            }
        }

        /* Dynamisk ligevaegt: alt staar i maal, men ligevaegten staar ikke
           stille. Et skub den ene vej giver én for meget, og saa retter
           afstemningen ovenfor det med en reaktion den anden vej. */
        if (this.spontanUr <= 0 && !this.haendelser.length && iMaal(maal, c)) {
            this.spontanUr = LIGEVAEGT_UR * r(0.7, 1.3);
            var lige = this.aandedrag(maal, c);
            if (lige) this.start(lige, maal, c);
        }
    };

    /* maal: { stof: antal }. s: { ryst } */
    P.opdater = function (dt, maal, s) {
        var R = this.R, i, p;
        this.s = s || this.s;
        if (this.fast) return;
        maal = maal || {};
        var ryst = this.s.ryst || 0;
        if (this.foerste) { this.foerste = false; this.fyldOp(maal); }

        this.afstem(dt, maal);

        for (i = this.partikler.length - 1; i >= 0; i--) {
            p = this.partikler[i];
            p.alfa = NK.mod(p.alfa, p.doer ? 0 : 1, 4, dt);
            if (p.doer && p.alfa < 0.03) { this.partikler.splice(i, 1); continue; }
            /* En laast partikel er paa vej ind i en haendelse og flyttes af
               den, ikke af sin egen fart */
            if (p.laast) continue;
            if (p.falder) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.y > -R * 0.55) { p.falder = false; p.vy *= 0.3; }
                continue;
            }
            var fart = p.fast ? 0 : 16 + 60 * ryst;
            if (p.fast) {
                p.vy += 120 * dt;
                p.vx *= Math.exp(-3 * dt);
                if (ryst > 0.3) { p.vx += r(-200, 200) * ryst * dt; p.vy -= r(0, 300) * ryst * dt; }
            } else {
                p.vx += r(-1, 1) * fart * 8 * dt;
                p.vy += r(-1, 1) * fart * 8 * dt;
                var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (v > fart * 2) { p.vx *= fart * 2 / v; p.vy *= fart * 2 / v; }
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            /* Inden for cirklen */
            var d = Math.sqrt(p.x * p.x + p.y * p.y), maks = R - p.rad - 2;
            if (d > maks) {
                var nx = p.x / d, ny = p.y / d;
                p.x = nx * maks; p.y = ny * maks;
                var dot = p.vx * nx + p.vy * ny;
                if (dot > 0) { p.vx -= 1.6 * dot * nx; p.vy -= 1.6 * dot * ny; }
                if (p.fast) { p.vx *= 0.3; p.vy = Math.min(p.vy, 0); }
            }
        }

        /* Partiklerne skubber hinanden lidt fra sig. Dem, der er paa vej ind
           i en haendelse, skubber ikke - ellers kunne de aldrig moedes. */
        for (i = 0; i < this.partikler.length; i++) {
            var a = this.partikler[i];
            if (a.laast || a.falder) continue;
            for (var j = i + 1; j < this.partikler.length; j++) {
                var b = this.partikler[j];
                if (b.laast || b.falder) continue;
                var dx = b.x - a.x, dy = b.y - a.y, dd = Math.sqrt(dx * dx + dy * dy) || 0.01;
                var min = a.rad + b.rad + 1;
                if (dd < min) {
                    var k = (min - dd) * 0.5;
                    a.x -= dx / dd * k; a.y -= dy / dd * k;
                    b.x += dx / dd * k; b.y += dy / dd * k;
                }
            }
        }

        this.opdaterHaendelser(dt);

        for (i = this.blink.length - 1; i >= 0; i--) {
            this.blink[i].liv -= dt * 2.2;
            if (this.blink[i].liv <= 0) this.blink.splice(i, 1);
        }
    };

    P.tegnKant = function (ctx, alfa) {
        var R = this.R;
        ctx.globalAlpha = alfa;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.stroke();
        /* F72: glansbuen i det oeverste venstre hjoerne er fjernet; den saa
           ud som en streg, der ikke hoerte til noget */
    };

    /* Et udsnit af det faste stof: iongitteret med stoffets eget
       formelforhold, eller ens byggesten, der ligger taet */
    P.tegnGitter = function (ctx) {
        var R = this.R, k = this.k, f = this.fast, x, y;
        var celle = [];
        if (f.dele) f.dele.forEach(function (d) { for (var i = 0; i < d.antal; i++) celle.push(d.navn); });
        var mol = f.molekyle || null;
        var trin = R * 0.27 * k;
        var rad = mol ? trin * 0.5 : trin * 0.44;
        var raekkeH = mol ? trin * 0.87 : trin;
        var raekke = 0;
        for (y = -R - trin; y < R + trin; y += raekkeH, raekke++) {
            var soejle = 0;
            for (x = -R - trin + (mol && raekke % 2 ? trin / 2 : 0); x < R + trin; x += trin, soejle++) {
                var navn = mol || celle[(raekke + soejle) % celle.length];
                var fa = farveAf(navn);
                NK.kugle(ctx, x, y, rad,
                    NK.css({ r: Math.min(255, fa.r + 60), g: Math.min(255, fa.g + 60), b: Math.min(255, fa.b + 60) }),
                    NK.css({ r: fa.r * 0.55, g: fa.g * 0.55, b: fa.b * 0.55 }));
                var st = Stof.STOFFER[navn];
                var tekst = st && st.kort ? st.kort : Stof.formel(navn);
                var basis = tekst.length > 5 ? rad * 0.5 : (tekst.length > 3 ? rad * 0.62 : rad * 0.78);
                tegnEtiket(ctx, tekst, x, y, etiketStil(ctx, tekst, rad, fa, basis, rad * 0.4));
            }
        }
    };

    /* Forklaringen staar inde i boblen, hvor der er bredde nok til den.
       F77: i to linjer (»Iongitter: …« og »i forholdet …«) og lidt hoejere
       oppe, saa den hverken gaar ud over boblens kant eller ind under
       luppen i hjoernet (bord.js, R · 0,66) */
    P.tegnGitterTekst = function (ctx, alfa) {
        var R = this.R, k = this.k, ly0 = R * 0.38;
        var tekst = this.fast.tekst, i = tekst.indexOf(" i forholdet ");
        var linjer = i > 0 ? [tekst.slice(0, i), tekst.slice(i + 1)] : [tekst];
        var lh = 15 * k, h = lh * linjer.length + 8 * k;
        ctx.globalAlpha = alfa;
        ctx.fillStyle = "rgba(0, 0, 0, 0.74)";
        ctx.fillRect(-R, ly0, R * 2, h);
        linjer.forEach(function (l, n) {
            NK.tekst(ctx, l, 0, ly0 + 4 * k + lh * (n + 0.5), { str: 11 * k, vaegt: 600, maks: R * 1.05, justering: "center", linje: "middle", farve: "#f2f4f7" });
        });
    };

    /* Boblen tegnes med centrum i (cx, cy). forbind: punktet, den hoerer til */
    P.tegn = function (ctx, cx, cy, alfa, tid, forbind, farve) {
        if (alfa < 0.02) return;
        var R = this.R, k = this.k, i;
        ctx.save();
        ctx.globalAlpha = alfa;

        if (forbind) {
            var dx = forbind.x - cx, dy = forbind.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.4;
            ctx.setLineDash([4, 5]);
            ctx.beginPath();
            ctx.moveTo(cx + dx / d * R, cy + dy / d * R);
            ctx.lineTo(forbind.x, forbind.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.arc(forbind.x, forbind.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.translate(cx, cy);
        var g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
        var f = farve || { r: 40, g: 60, b: 80 };
        g.addColorStop(0, NK.css({ r: f.r + 30, g: f.g + 30, b: f.b + 30, a: 0.96 }));
        g.addColorStop(1, NK.css({ r: f.r * 0.6, g: f.g * 0.6, b: f.b * 0.6, a: 0.96 }));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.clip();

        /* Fast stof: gitteret i stedet for partikler i vand */
        if (this.fast) {
            this.tegnGitter(ctx);
            this.tegnGitterTekst(ctx, alfa);
            ctx.restore();
            this.tegnKant(ctx, alfa);
            ctx.restore();
            return;
        }

        /* Vand i baggrunden */
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        for (i = 0; i < 14; i++) {
            var wx = Math.sin(i * 2.7 + tid * 0.3) * R * 0.8, wy = Math.cos(i * 1.9 + tid * 0.25) * R * 0.8;
            ctx.beginPath();
            ctx.arc(wx, wy, 6 * k, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Haendelserne: en stiplet streg mellem de partikler, der er paa
           vej mod hinanden, saa det kan ses, at de HOERER sammen - og ikke
           bare tilfaeldigvis driver tae for. Under kuglerne. */
        ctx.globalAlpha = alfa * 0.75;
        ctx.strokeStyle = "rgba(255, 244, 210, 0.75)";
        ctx.lineWidth = 1.6 * k;
        ctx.setLineDash([3 * k, 3 * k]);
        for (i = 0; i < this.haendelser.length; i++) {
            var h = this.haendelser[i];
            if (h.ind.length < 2) continue;
            ctx.beginPath();
            for (var m = 1; m < h.ind.length; m++) {
                ctx.moveTo(h.ind[0].x, h.ind[0].y);
                ctx.lineTo(h.ind[m].x, h.ind[m].y);
            }
            ctx.stroke();
        }
        ctx.setLineDash([]);

        for (i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            ctx.globalAlpha = alfa * p.alfa;
            if (!p.etiket) {
                var basis = (p.tekst.length > 5 ? 11 : (p.tekst.length > 3 ? 13 : 15)) * k;
                p.etiket = etiketStil(ctx, p.tekst, p.rad, p.farve, basis, basis * 0.8);
                p.rad = p.etiket.rad;
            }
            var lys = { r: Math.min(255, p.farve.r + 60), g: Math.min(255, p.farve.g + 60), b: Math.min(255, p.farve.b + 60) };
            var moerk = { r: p.farve.r * 0.55, g: p.farve.g * 0.55, b: p.farve.b * 0.55 };
            NK.kugle(ctx, p.x, p.y, p.rad, NK.css(lys), NK.css(moerk));
            /* En tynd kant giver kuglen et skarpt omrids mod baggrunden;
               fast stof har en lys kant */
            ctx.strokeStyle = p.fast ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.rad - 0.5, 0, Math.PI * 2);
            ctx.stroke();
            tegnEtiket(ctx, p.tekst, p.x, p.y, p.etiket);
        }

        /* Glimtet dér, hvor en haendelse skete */
        for (i = 0; i < this.blink.length; i++) {
            var bl = this.blink[i];
            NK.skaer(ctx, bl.x, bl.y, (13 + 12 * (1 - bl.liv)) * k, "rgba(" + bl.farve + ", 0.9)", alfa * bl.liv * 0.9);
        }

        /* Legende for de forkortede navne, nederst i boblen */
        var legende = [], set = {};
        for (i = 0; i < this.partikler.length; i++) {
            var q = this.partikler[i], sq = Stof.STOFFER[q.navn];
            if (sq && sq.kort && !set[q.navn] && q.alfa > 0.2) { set[q.navn] = true; legende.push(sq.kort + " = " + sq.dansk); }
        }
        if (legende.length) {
            ctx.globalAlpha = alfa;
            var lh = 14 * k, ly0 = R - 10 * k - legende.length * lh;
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(-R, ly0 - 6 * k, R * 2, R - ly0 + 6 * k);
            legende.forEach(function (tekst, j) {
                NK.tekst(ctx, tekst, 0, ly0 + j * lh + lh / 2, { font: "600 " + (11 * k).toFixed(1) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2f4f7" });
            });
        }
        ctx.restore();
        this.tegnKant(ctx, alfa);
        ctx.restore();
    };
}());
