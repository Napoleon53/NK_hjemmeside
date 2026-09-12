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
        function fyld(id, symboler, valgt) {
            var v = NK.el(id);
            v.innerHTML = "";
            for (var i = 0; i < symboler.length; i++) {
                var g = D.findSymbol(symboler[i]);
                var o = document.createElement("option");
                o.value = g.symbol;
                o.textContent = g.navn + " (" + g.symbol + ") · " + NK.ladningstekst(g.ion);
                v.appendChild(o);
            }
            v.value = valgt;
        }
        fyld("salt-metal", D.SALT_METALLER, this.metal.symbol);
        fyld("salt-ikkemetal", D.SALT_IKKEMETALLER, this.ikkemetal.symbol);
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
        NK.el("salt-overfoer").addEventListener("click", function () { mig.overfoer(); });
        NK.el("salt-saml").addEventListener("click", function () { mig.saml(); });

        NK.el("salt-laes-mere").addEventListener("click", function () {
            NK.saetTekst("salt-forklaring-titel", "Hvorfor " + D.saltformel(mig.metal, mig.ikkemetal) + "?");
            NK.saetTekst("salt-forklaring-tekst", mig.forklaringTekst());
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
        var m = this.metal, ik = this.ikkemetal, f = this.forhold;

        NK.saetTekst("salt-formel", D.saltformel(m, ik));
        NK.saetTekst("salt-navn", D.saltnavn(m, ik));
        NK.saetTekst("salt-balance", f.antalPositive + " · (" + NK.ladningstekst(m.ion) + ")   +   "
            + f.antalNegative + " · (" + NK.ladningstekst(ik.ion) + ")   =   0");

        NK.el("salt-overfoer").disabled = this.fase !== "atomer";
        NK.el("salt-saml").disabled = this.fase !== "overfoert";
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

    /* ----- Hvor skal atomerne staa, foer de er samlet? ------------------------- */
    NK.SimSalt.prototype.laegUd = function () {
        var l = this.l;
        var baand = l.h - 74;
        var oeverst = 18;
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
        var y = 18 + (l.h - 74) / 2;
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

    /* Et lille, beskaaret udsnit af det uendelige iongitter - skiftevis
       plus og minus i et fast moenster, uafhaengigt af saltets virkelige
       formelforhold (som i stedet staar helt praecist i panelet og i
       "Læs mere"). Ionerne er med vilje forenklede uden skaller - ved
       den staerke udzoomning handler det om MOENSTERET, ikke om den
       enkelte atommodel. */
    NK.SimSalt.prototype.tegnGitter = function (c) {
        var l = this.l;
        var baand = l.h - 74;
        var oeverst = 18;
        var trin = NK.klamp(l.b / 8, 42, 66);
        var rMaks = trin * 0.34;
        var blod = NK.blod(NK.klamp(this.gitterUr / 0.6, 0, 1));
        var r = rMaks * blod;

        var mFarve = ["#ff9384", "#e05446"];    /* proton-roed: metallets kationer */
        var ikFarve = ["#8fcaf0", "#3d9ee0"];   /* blaa: ikke-metallets anioner */

        var raekke = 0;
        for (var y = oeverst - trin * 0.3; y < oeverst + baand + trin * 0.3; y += trin, raekke++) {
            var soejle = 0;
            for (var x = -trin * 0.3; x < l.b + trin * 0.3; x += trin, soejle++) {
                var erMetal = (raekke + soejle) % 2 === 0;
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

        /* Titlen sidder paa en mørk bjaelke, saa den er laesbar ovenpaa gitteret. */
        c.save();
        c.globalAlpha = blod;
        c.fillStyle = "rgba(10, 10, 15, 0.72)";
        c.fillRect(0, 0, l.b, 62);
        c.restore();

        var formel = D.saltformel(this.metal, this.ikkemetal);
        NK.tekst(c, formel, l.b / 2, 26, {
            font: "700 30px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: "rgba(242, 243, 245, " + blod + ")", kant: true, kantBredde: 5
        });
        NK.tekst(c, D.saltnavn(this.metal, this.ikkemetal), l.b / 2, 50, {
            font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: "rgba(169, 176, 186, " + blod + ")", kant: true
        });
    };
}());
