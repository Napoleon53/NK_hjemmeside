/* =====================================================================
   sim_salt.js - fane 4: Fra to atomer til et salt

   Den gamle animation tvang metal og ikke-metal til at passe sammen
   én til én. Her maa man kombinere frit, og saa er det MODELLEN, der
   regner ud, hvor mange atomer der skal til, foer regnskabet gaar op:

       Mg afgiver 2 elektroner, men Cl kan kun tage 1 hver
       -> der skal to chloratomer til, og formlen bliver MgCl₂

   Det er praecis den optaelling, eleven selv skal kunne lave - den
   fulde forklaring ligger i "Læs mere"-knappens pop op, ikke i teksten
   under scenen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.SimSalt = function () {
        this.l = new NK.Laerred(NK.el("salt-laerred"));
        this.metal = D.findSymbol("Na");
        this.ikkemetal = D.findSymbol("Cl");
        this.fase = "atomer";        /* atomer | overfoert | samlet */
        this.brikker = [];           /* {atom, g, rolle, x, y, mx, my} */
        this.ur = 0;
        this.gitterUr = 0;           /* hvor laenge gitteret har vaeret fremme - til indtoning */
        this.ventende = null;

        this.fyldVaelgere();
        this.koblKnapper();
        this.nyOpstilling();
    };

    NK.SimSalt.prototype.fyldVaelgere = function () {
        function fyld(id, symboler, valgt, erMetal) {
            var v = NK.el(id);
            v.innerHTML = "";
            for (var i = 0; i < symboler.length; i++) {
                var g = D.findSymbol(symboler[i]);
                var o = document.createElement("option");
                o.value = g.symbol;
                var antal = Math.abs(g.ion);
                var verbum = erMetal ? "afgiver" : "optager";
                o.textContent = g.symbol + " (" + verbum + " " + NK.talform(antal, "e⁻", "e⁻") + ")";
                v.appendChild(o);
            }
            v.value = valgt;
        }
        fyld("salt-metal", D.SALT_METALLER, this.metal.symbol, true);
        fyld("salt-ikkemetal", D.SALT_IKKEMETALLER, this.ikkemetal.symbol, false);
    };

    NK.SimSalt.prototype.koblKnapper = function () {
        var mig = this;
        NK.el("salt-metal").addEventListener("change", function () {
            mig.metal = D.findSymbol(this.value);
            mig.nyOpstilling();
        });
        NK.el("salt-ikkemetal").addEventListener("change", function () {
            mig.ikkemetal = D.findSymbol(this.value);
            mig.nyOpstilling();
        });
        NK.el("salt-knap").addEventListener("click", function () {
            if (mig.fase === "atomer") mig.overfoer();
            else if (mig.fase === "overfoert") mig.saml();
        });

        NK.el("salt-laes-mere").addEventListener("click", function () {
            NK.saetTekst("salt-forklaring-titel", "Hvorfor " + D.saltformel(mig.metal, mig.ikkemetal) + "?");
            NK.saetTekst("salt-forklaring-tekst", mig.forklaringTekst());
            NK.saetTekst("salt-forklaring-skema", mig.reaktionsskema());
            NK.el("salt-forklaring").classList.add("vis");
        });
        NK.el("salt-forklaring-luk").addEventListener("click", function () {
            NK.el("salt-forklaring").classList.remove("vis");
        });
        NK.el("salt-forklaring").addEventListener("click", function (e) {
            if (e.target.id === "salt-forklaring") this.classList.remove("vis");
        });
    };

    /* ----- Opstillingen ------------------------------------------------------ */
    NK.SimSalt.prototype.nyOpstilling = function () {
        var f = D.formelforhold(this.metal.ion, this.ikkemetal.ion);
        var i;
        this.forhold = f;
        this.fase = "atomer";
        this.ventende = null;
        this.gitterUr = 0;
        this.brikker = [];

        for (i = 0; i < f.antalPositive; i++) this.brikker.push(nyBrik(this.metal, "metal"));
        for (i = 0; i < f.antalNegative; i++) this.brikker.push(nyBrik(this.ikkemetal, "ikkemetal"));

        this.opdaterPanel();
    };

    function nyBrik(g, rolle) {
        var a = new NK.Atom();
        var n = D.hyppigsteIsotop(g.z).a - g.z;
        a.saetStraks(g.z, n, g.z);
        return { atom: a, g: g, rolle: rolle, x: 0, y: 0, mx: 0, my: 0, foerste: true };
    }

    /* ----- De tre trin -------------------------------------------------------- */
    NK.SimSalt.prototype.overfoer = function () {
        if (this.fase !== "atomer") return;
        var i;
        /* Metallerne slipper deres yderelektroner mod hoejre. */
        for (i = 0; i < this.brikker.length; i++) {
            var b = this.brikker[i];
            if (b.rolle !== "metal") continue;
            b.atom.retning = { x: 1, y: 0 };
            b.atom.saet(b.g.z, b.atom.n, b.g.z - b.g.ion);
        }
        /* Ikke-metallerne griber dem et oejeblik senere. */
        this.ventende = 0.42;
        this.fase = "overfoert";
        this.opdaterPanel();
    };

    NK.SimSalt.prototype.grib = function () {
        for (var i = 0; i < this.brikker.length; i++) {
            var b = this.brikker[i];
            if (b.rolle !== "ikkemetal") continue;
            b.atom.retning = { x: 1, y: 0 };
            b.atom.saet(b.g.z, b.atom.n, b.g.z - b.g.ion);
        }
    };

    NK.SimSalt.prototype.saml = function () {
        if (this.fase !== "overfoert") return;
        this.fase = "samlet";
        this.gitterUr = 0;
        this.opdaterPanel();
    };

    /* ----- Panelet ------------------------------------------------------------ */
    NK.SimSalt.prototype.opdaterPanel = function () {
        var m = this.metal, ik = this.ikkemetal;

        if (this.fase === "atomer") {
            NK.saetTekst("salt-formel", m.symbol + " og " + ik.symbol);
        } else if (this.fase === "overfoert") {
            NK.saetTekst("salt-formel", m.symbol + NK.ladningHaevet(m.ion) + " og " + ik.symbol + NK.ladningHaevet(ik.ion));
        } else {
            NK.saetTekst("salt-formel", D.saltformel(m, ik));
        }
        if (this.fase === "atomer") {
            NK.saetTekst("salt-navn", m.navn.toLowerCase() + " og " + ik.navn.toLowerCase());
        } else if (this.fase === "overfoert") {
            NK.saetTekst("salt-navn", D.kationNavn(m) + " og " + D.anionNavn(ik));
        } else {
            NK.saetTekst("salt-navn", D.saltnavn(m, ik));
        }

        var knap = NK.el("salt-knap");
        if (this.fase === "atomer") {
            NK.saetTekst("salt-knap-tekst", "Overfør elektronerne");
            NK.saetTekst("salt-knap-tegn", "⚡");
            knap.disabled = false;
            knap.classList.remove("groen");
            knap.classList.add("orange");
        } else if (this.fase === "overfoert") {
            NK.saetTekst("salt-knap-tekst", "Saml ionerne til et salt");
            NK.saetTekst("salt-knap-tegn", "🧂");
            knap.disabled = false;
            knap.classList.remove("orange");
            knap.classList.add("groen");
        } else {
            NK.saetTekst("salt-knap-tekst", "Saltet er dannet");
            NK.saetTekst("salt-knap-tegn", "✓");
            knap.disabled = true;
        }
    };

    /* Reaktionsskemaet, altid med eksplicit koefficient (ogsaa "1"),
       saa det matcher den skrivemaade, eleven moeder i teoribogen:
       3 K⁺ + 1 N³⁻ ⟶ K₃N */
    NK.SimSalt.prototype.reaktionsskema = function () {
        var m = this.metal, ik = this.ikkemetal, f = this.forhold;
        return f.antalPositive + " " + m.symbol + NK.ladningHaevet(m.ion) + " + "
            + f.antalNegative + " " + ik.symbol + NK.ladningHaevet(ik.ion) + " ⟶ "
            + D.saltformel(m, ik);
    };

    /* Den fulde forklaring bag "Læs mere": hvorfor netop dette forhold,
       og hvad der sker, naar ionerne samles til et salt. I lobende
       prosa, saa den kan laeses som en sammenhaengende forklaring - ikke
       som stikord. */
    NK.SimSalt.prototype.forklaringTekst = function () {
        var m = this.metal, ik = this.ikkemetal, f = this.forhold;
        var mAedel = D.aedelgasStruktur(m.z - m.ion);
        var ikAedel = D.aedelgasStruktur(ik.z - ik.ion);
        var mAbs = Math.abs(m.ion), ikAbs = Math.abs(ik.ion);

        var t = m.navn + " afgiver " + NK.talform(mAbs, "elektron", "elektroner") + " for at ligne "
            + (mAedel ? mAedel.navn.toLowerCase() : "en ædelgas") + ", og " + ik.navn.toLowerCase()
            + " optager " + NK.talform(ikAbs, "elektron", "elektroner") + " for at ligne "
            + (ikAedel ? ikAedel.navn.toLowerCase() : "en ædelgas") + ". ";

        if (f.antalPositive === 1 && f.antalNegative === 1) {
            t += "De to tal passer sammen 1:1: ét " + m.navn.toLowerCase() + "atom afgiver præcis så mange "
                + "elektroner, som ét " + ik.navn.toLowerCase() + "atom kan tage imod, så ladningsregnskabet "
                + "går op med kun ét atom af hver.";
        } else {
            t += "De to tal går ikke lige op hver for sig, så der skal " + f.antalPositive + " " + m.symbol
                + " og " + f.antalNegative + " " + ik.symbol + " til, før det samlede regnskab lander på nul.";
        }

        t += " Resultatet er " + D.saltnavn(m, ik) + ", " + D.saltformel(m, ik) + ". Det er ikke ét molekyle, "
            + "men et iongitter bygget af " + m.symbol + NK.ladningHaevet(m.ion) + "- og " + ik.symbol
            + NK.ladningHaevet(ik.ion) + "-ioner i forholdet " + f.antalPositive + ":" + f.antalNegative
            + ", hvor hver ion er omgivet af ioner med modsat ladning i alle retninger.";

        return t;
    };

    /* Bunden af grundstofvaelgerne (de to dropdowns), maalt direkte i
       DOM'en. Bruges alle steder, scenen skal holde sig under dem, saa
       hverken atommodeller, pil eller gitter ryger op i dem - saerligt
       vigtigt ved 1:3-forhold, hvor tre atomer stables i én soejle. */
    NK.SimSalt.prototype.vaelgerBund = function () {
        var mV = document.querySelector(".saltvalg-metal");
        var ikV = document.querySelector(".saltvalg-ikkemetal");
        var bund = 0;
        if (mV && mV.offsetWidth) bund = Math.max(bund, mV.offsetTop + mV.offsetHeight);
        if (ikV && ikV.offsetWidth) bund = Math.max(bund, ikV.offsetTop + ikV.offsetHeight);
        return bund;
    };

    /* ----- Hvor skal atomerne staa, foer de er samlet? ------------------------- */
    NK.SimSalt.prototype.laegUd = function () {
        var l = this.l;
        var oeverst = Math.max(18, this.vaelgerBund() + 14);
        var baand = l.h - oeverst - 56;
        var i, b;

        /* To soejler: metallerne til venstre, ikke-metallerne til hoejre.
           Lidt mindre end fuld hoejde, saa der er plads til taeksten om
           antal protoner/elektroner under hver atommodel. */
        var mAntal = this.forhold.antalPositive, ikAntal = this.forhold.antalNegative;
        var flest = Math.max(mAntal, ikAntal);
        this.plads = Math.min(baand / flest * 0.40, l.b * 0.19, 130);
        var mNr = 0, ikNr = 0;
        for (i = 0; i < this.brikker.length; i++) {
            b = this.brikker[i];
            var erMetal = b.rolle === "metal";
            var antal = erMetal ? mAntal : ikAntal;
            var nr = erMetal ? mNr++ : ikNr++;
            b.mx = l.b * (erMetal ? 0.27 : 0.73);
            b.my = oeverst + baand * (nr + 0.5) / antal;
        }
    };

    /* ----- Tegning -------------------------------------------------------------- */
    NK.SimSalt.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimSalt.prototype.nulstil = function () { this.nyOpstilling(); };

    NK.SimSalt.prototype.opdater = function (dt) {
        this.ur += dt;
        if (this.ventende !== null) {
            this.ventende -= dt;
            if (this.ventende <= 0) { this.grib(); this.ventende = null; }
        }
        if (this.fase === "samlet") { this.gitterUr += dt; return; }

        this.laegUd();
        for (var i = 0; i < this.brikker.length; i++) {
            var b = this.brikker[i];
            if (b.foerste) { b.x = b.mx; b.y = b.my; b.foerste = false; }
            else {
                b.x = NK.mod(b.x, b.mx, 4.5, dt);
                b.y = NK.mod(b.y, b.my, 4.5, dt);
            }
            b.atom.opdater(dt);
        }
    };

    NK.SimSalt.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        var i, b;
        l.ryd("#14141a");

        if (this.fase === "samlet") { this.tegnGitter(c); return; }

        /* Pilen mellem soejlerne: elektronerne gaar kun én vej. */
        var oeverst = Math.max(18, this.vaelgerBund() + 14);
        var y = oeverst + (l.h - oeverst - 56) / 2;
        var x1 = l.b * 0.42, x2 = l.b * 0.58;
        var staerk = this.fase === "overfoert";
        c.save();
        c.strokeStyle = staerk ? "rgba(242, 197, 61, 0.85)" : "rgba(169, 176, 186, 0.3)";
        c.lineWidth = staerk ? 3 : 2;
        c.beginPath();
        c.moveTo(x1, y);
        c.lineTo(x2 - 9, y);
        c.stroke();
        c.beginPath();
        c.moveTo(x2, y);
        c.lineTo(x2 - 12, y - 7);
        c.lineTo(x2 - 12, y + 7);
        c.closePath();
        c.fillStyle = staerk ? "rgba(242, 197, 61, 0.85)" : "rgba(169, 176, 186, 0.3)";
        c.fill();
        c.restore();
        NK.tekst(c, this.forhold.ladningIAlt + " e⁻", (x1 + x2) / 2, y - 15, {
            font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: staerk ? "#f2c53d" : "#7e8590", kant: true
        });

        var visLadning = this.fase !== "atomer";
        for (i = 0; i < this.brikker.length; i++) {
            b = this.brikker[i];
            var q = visLadning ? b.g.ion : 0;
            b.atom.tegn(c, b.x, b.y, this.plads, {
                fremhaevValens: this.fase === "atomer",
                ladning: q,
                maerkat: b.g.symbol + NK.ladningHaevet(q)
            });

            /* Antal protoner og antal elektroner - kort under hver
               atommodel, saa man kan SE, at det er elektrontallet, der
               aendrer sig, ikke protontallet. */
            var geo = b.atom.sidsteGeo;
            if (geo) {
                var yderste = b.atom.fordeling.length - 1;
                var r = geo.geo.rSkal[Math.max(0, yderste)] * geo.s;
                NK.tekst(c, b.atom.p + " protoner · " + b.atom.e + " elektroner", b.x, geo.cy + r + 41, {
                    font: "600 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                    farve: "#9aa1ab", kant: true, kantBredde: 2.5
                });
            }
        }
    };

    /* Et lille, indrammet udsnit af iongitteret - ikke hele laerredet
       fyldt op, for et gitter, der daekker skaermkant til skaermkant,
       ser ikke ud af noget. Rammen goer det tydeligt, at det er en
       byggesten, hentet ud af et moenster, der fortsaetter udenfor.

       Forholdet mellem kationer og anioner foelger saltets virkelige
       formelforhold (this.forhold), IKKE altid 1:1: moenstret gentager
       en celle paa (antalPositive + antalNegative) felter paa skraa, saa
       fx MgCl₂ rent faktisk viser dobbelt saa mange Cl som Mg. Ved 1:1
       (NaCl, CaO, ...) reducerer det praecis til det gamle skakbraet.
       Det er ikke den rigtige krystalstruktur - den er tit lagdelt og
       tredimensionel paa maader, et fladt gitter ikke kan vise - men
       forholdstallet er rigtigt, og det er dét, eleven skal kunne se. */
    NK.SimSalt.prototype.tegnGitter = function (c) {
        var l = this.l;
        var blod = NK.blod(NK.klamp(this.gitterUr / 0.6, 0, 1));

        /* Formlen skal staa UNDER grundstofvaelgerne, ikke klemt ind
           imellem dem: ved en smal scene er der ikke vandret luft nok
           til en centreret titel mellem de to bokse. */
        var vaelgerBund = this.vaelgerBund();

        var formelY = vaelgerBund + 28;
        var navnY = vaelgerBund + 50;

        var formel = D.saltformel(this.metal, this.ikkemetal);
        NK.tekst(c, formel, l.b / 2, formelY, {
            font: "700 26px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: "rgba(242, 243, 245, " + blod + ")", kant: true, kantBredde: 5
        });
        NK.tekst(c, D.saltnavn(this.metal, this.ikkemetal), l.b / 2, navnY, {
            font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: "rgba(169, 176, 186, " + blod + ")", kant: true
        });

        /* Vinduet, gitteret vises igennem. */
        var vTop = navnY + 22;
        var vBund = l.h - 58;
        var vindueH = NK.klamp(vBund - vTop, 140, 340);
        var vindueB = NK.klamp(l.b * 0.56, 260, 480);
        var vx = (l.b - vindueB) / 2;
        var vy = vTop;

        c.save();
        c.globalAlpha = blod;
        NK.rundtRekt(c, vx, vy, vindueB, vindueH, 10);
        c.fillStyle = "rgba(255, 255, 255, 0.03)";
        c.fill();
        c.strokeStyle = "rgba(255, 255, 255, 0.16)";
        c.lineWidth = 1.5;
        c.stroke();
        c.restore();

        var trin = NK.klamp(vindueB / 6, 38, 60);
        var rMaks = trin * 0.34;
        var r = rMaks * blod;
        var f = this.forhold;
        var enhed = f.antalPositive + f.antalNegative;

        var mFarve = ["#ff9384", "#e05446"];    /* proton-roed: metallets kationer */
        var ikFarve = ["#8fcaf0", "#3d9ee0"];   /* blaa: ikke-metallets anioner */

        c.save();
        NK.rundtRekt(c, vx, vy, vindueB, vindueH, 10);
        c.clip();

        var raekke = 0;
        for (var y = vy - trin; y < vy + vindueH + trin; y += trin, raekke++) {
            var soejle = 0;
            for (var x = vx - trin; x < vx + vindueB + trin; x += trin, soejle++) {
                var erMetal = ((raekke + soejle) % enhed) < f.antalPositive;
                var g = erMetal ? this.metal : this.ikkemetal;
                var farve = erMetal ? mFarve : ikFarve;
                NK.tegnKugle(c, x, y, r, farve[0], farve[1], blod);
                if (rMaks > 15) {
                    NK.tekst(c, g.symbol + NK.ladningHaevet(g.ion), x, y + 0.5, {
                        font: "700 " + Math.round(NK.klamp(rMaks * 0.55, 10, 15)) + "px 'Segoe UI', sans-serif",
                        justering: "center", linje: "middle",
                        farve: "rgba(255, 255, 255, " + (0.92 * blod) + ")", kant: true, kantBredde: 2
                    });
                }
            }
        }
        c.restore();

        NK.tekst(c, "Udsnit af gitteret. Mønstret fortsætter i alle retninger.", l.b / 2, vy + vindueH + 22, {
            font: "600 18px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: "rgba(169, 176, 186, " + blod + ")", kant: true
        });
    };
}());
