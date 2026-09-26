/* =====================================================================
   sim_en.js - fane 1: elektronegativitet

   To atomer deler ét elektronpar. Eleven vaelger atomerne i det lille
   periodiske system i panelet, og scenen viser tovtraekningen:

     elektronparret  ligger midt imellem, naar atomerne traekker lige
                     haardt, og glider mod det, der traekker haardest.
                     Ved ΔEN = 2,0 eller mere tager det atom det helt.
     elektronskyen   er tykkest ved det atom, der traekker haardest.
     δ+ og δ−        ved en polaer binding; + og − ved ioner.
     skalaen         nederst viser ΔEN og de tre slags bindinger.

   Et klik i tabellen saetter atomet paa pladsen med den gule ring, og
   ringen hopper saa til det andet atom. Et klik paa et atom i scenen
   flytter ringen. Et metal kan kun saettes sammen med N, O, F eller Cl
   (D.tilladt i data.js); ellers siger scenen hvorfor.

   Hvor langt parret glider, er ΔEN / 2 (hoejst 0,92 for en polaer
   binding). Det er en tegning af tovtraekningen, ikke en beregning af
   elektrontaetheden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var PLUS = "#f39a8f";
    var MINUS = "#8fcaf0";
    var GUL = "#f2c53d";
    var SKALA_MAKS = 3.5;
    var SPRITE_KUGLE = 128 / 120;     /* atomspritet er 128 bredt, kuglen 120 */
    var START = ["H", "Cl"];

    /* De grundstoffer, der ikke er med, staar som tomme felter, saa
       tabellen ligner det periodiske system. De svarer ogsaa paa klik. */
    var KOLONNER = [1, 2, 13, 14, 15, 16, 17];
    var TOMME = {
        "2-2": ["Be", "beryllium"], "2-13": ["B", "bor"],
        "3-2": ["Mg", "magnesium"], "3-13": ["Al", "aluminium"], "3-14": ["Si", "silicium"], "3-15": ["P", "phosphor"], "3-16": ["S", "svovl"],
        "4-2": ["Ca", "calcium"], "4-13": ["Ga", "gallium"], "4-14": ["Ge", "germanium"], "4-15": ["As", "arsen"], "4-16": ["Se", "selen"], "4-17": ["Br", "brom"]
    };

    function en(el) { return D.GRUNDSTOFFER[el].en; }
    function navn(el) { return D.GRUNDSTOFFER[el].navn; }
    function binding(a, b) { return a + "-" + b; }
    function har(a, b, el) { return a === el || b === el; }
    function tal(v) { return NK.tal(v, 1); }

    /* "3,0 − 2,1 = 0,9": den stoerste minus den mindste */
    function regning(a, b) {
        var hoej = en(a) >= en(b) ? a : b, lav = hoej === a ? b : a;
        return tal(en(hoej)) + " − " + tal(en(lav)) + " = " + tal(D.dEN(a, b));
    }

    /* Farven i tabellen: blaa ved lav elektronegativitet, gennem lilla til
       roed ved hoej, saa man kan se den stige mod fluor. */
    function enFarve(v, lys) {
        var t = NK.klamp((v - 0.8) / 3.2, 0, 1);
        var hue = Math.round(228 + 140 * t) % 360;
        return "hsl(" + hue + ", " + (lys ? "72%, 64%" : (40 + 18 * t) + "%, " + (26 + 8 * t) + "%") + ")";
    }

    function begrund(a, b) {
        var t = D.bindingstype(a, b);
        var grund = t === "upolaer" ? "Det er under 0,5, så bindingen er upolær."
            : t === "polaer" ? "Det er mellem 0,5 og 2,0, så bindingen er polær."
            : "Det er 2,0 eller mere, så det er en ionbinding.";
        return "ΔEN = " + regning(a, b) + ". " + grund;
    }

    /* ----- Opgaverne ---------------------------------------------------------- */
    function parAfType(sim, type) {
        var nu = sim.par.slice().sort().join();
        var liste = D.par().filter(function (p) {
            return D.bindingstype(p[0], p[1]) === type && p.slice().sort().join() !== nu;
        });
        return NK.bland(NK.tilfaeldig(liste));
    }

    /* Byg-opgaverne: eleven saetter selv atomerne sammen. fejl() giver et
       svar paa det, eleven har bygget, naar det ikke passer. */
    var BYG = [
        {
            tekst: "Byg en binding, hvor carbon bliver δ+.",
            ok: function (a, b) { return har(a, b, "C") && D.bindingstype(a, b) === "polaer" && D.staerkest(a, b) !== "C"; },
            fejl: function (a, b) {
                if (!har(a, b, "C")) return "Carbon skal være med.";
                if (a === b) return "C-C er upolær. Sæt et andet atom på carbon.";
                return binding(a, b) + " er upolær. Vælg et atom, der trækker hårdere end carbon.";
            },
            hint: "Carbon har elektronegativiteten 2,5. Hvilke atomer har mindst 0,5 mere?",
            eksempel: ["C", "O"],
            svar: "Fx C-O. Oxygen trækker hårdere end carbon (3,5 mod 2,5), så carbon bliver δ+. N, F og Cl virker også."
        },
        {
            tekst: "Byg en upolær binding mellem to forskellige atomer.",
            ok: function (a, b) { return a !== b && D.bindingstype(a, b) === "upolaer"; },
            fejl: function (a, b) {
                if (a === b) return "Atomerne skal være forskellige.";
                return binding(a, b) + " er " + D.TYPER[D.bindingstype(a, b)].navn + ". Find to atomer, der trækker næsten lige hårdt.";
            },
            hint: "Find to forskellige atomer, hvis elektronegativitet højst er 0,4 fra hinanden.",
            eksempel: ["C", "H"],
            svar: "Fx C-H: 2,5 − 2,1 = 0,4, som er under 0,5. N-Cl virker også: 3,0 − 3,0 = 0."
        },
        {
            tekst: "Byg den mest polære binding, der har hydrogen med.",
            ok: function (a, b) { return har(a, b, "H") && har(a, b, "F"); },
            fejl: function (a, b) {
                if (!har(a, b, "H")) return "Hydrogen skal være med.";
                if (a === b) return "H-H er upolær.";
                return binding(a, b) + " har ΔEN = " + tal(D.dEN(a, b)) + ". Der findes en, der er mere polær.";
            },
            hint: "Jo større forskel i elektronegativitet, jo mere polær er bindingen. Hvilket atom har den største?",
            eksempel: ["H", "F"],
            svar: "H-F: 4,0 − 2,1 = 1,9. Fluor har den største elektronegativitet."
        },
        {
            tekst: "Byg en ionbinding.",
            ok: function (a, b) { return D.bindingstype(a, b) === "ion"; },
            fejl: function (a, b) {
                return binding(a, b) + " har ΔEN = " + tal(D.dEN(a, b)) + ". Forskellen skal være 2,0 eller mere.";
            },
            hint: "Sæt et atom med lav elektronegativitet sammen med et, der har høj.",
            eksempel: ["Na", "Cl"],
            svar: "Fx Na-Cl: 3,0 − 0,9 = 2,1. Chlor tager elektronerne helt, og der dannes ioner."
        },
        {
            tekst: "Byg en binding, hvor oxygen bliver δ+.",
            ok: function (a, b) { return har(a, b, "O") && har(a, b, "F"); },
            fejl: function (a, b) {
                if (!har(a, b, "O")) return "Oxygen skal være med.";
                return "I " + binding(a, b) + " trækker oxygen hårdest. Find et atom, der trækker endnu hårdere.";
            },
            hint: "Oxygen har 3,5. Kun ét atom i tabellen trækker hårdere.",
            eksempel: ["O", "F"],
            svar: "O-F: fluor trækker hårdere end oxygen (4,0 mod 3,5), så oxygen bliver δ+. Det sker sjældent."
        }
    ];

    var OPGAVER = [
        /* Hvilket atom bliver δ−? Parret staar i midten, til opgaven er loest. */
        function (sim) {
            var p = parAfType(sim, "polaer");
            var minus = D.staerkest(p[0], p[1]), plus = minus === p[0] ? p[1] : p[0];
            return {
                tekst: "Klik på det atom i " + binding(p[0], p[1]) + ", der bliver δ−.",
                hint: "Det atom, der har den største elektronegativitet, trækker elektronparret til sig.",
                svar: minus + " har den største elektronegativitet (" + tal(en(minus)) + ") og trækker elektronparret til sig. " +
                    minus + " bliver δ−, og " + plus + " bliver δ+.",
                start: function (s) { s.startOpgavePar(p, { skift: true }); },
                klik: function (s, i) {
                    if (i < 0) return false;
                    if (s.par[i] === minus) return true;
                    return s.par[i] + " har den mindste elektronegativitet. Prøv det andet atom.";
                },
                slut: function (s) { s.slutOpgavePar(); }
            };
        },
        /* Upolaer, polaer eller ionbinding? */
        function (sim) {
            var type = NK.tilfaeldig(D.TYPE_ORDEN);
            var p = parAfType(sim, type);
            return {
                tekst: "Hvilken slags binding er " + binding(p[0], p[1]) + "?",
                valg: D.TYPE_ORDEN.map(function (t) { return D.TYPER[t].knap; }),
                rigtig: D.TYPE_ORDEN.indexOf(type),
                hint: "Træk den mindste elektronegativitet fra den største. Grænserne er 0,5 og 2,0.",
                svar: begrund(p[0], p[1]),
                start: function (s) { s.startOpgavePar(p, { skift: true, type: true }); },
                slut: function (s) { s.slutOpgavePar(); }
            };
        },
        /* Byg selv en binding, der passer. Aldrig én, der allerede staar. */
        function (sim) {
            var b = NK.tilfaeldig(BYG.filter(function (x) { return x !== sim.sidsteByg && !x.ok(sim.par[0], sim.par[1]); }));
            sim.sidsteByg = b;
            var start = 0;
            return {
                tekst: b.tekst,
                hint: b.hint,
                svar: b.svar,
                start: function (s) { start = s.aendringer; },
                tjek: function (s) {
                    if (b.ok(s.par[0], s.par[1])) return true;
                    if (s.aendringer === start) return null;
                    return b.fejl(s.par[0], s.par[1]);
                },
                visSvar: function (s) { s.saetPar(b.eksempel[0], b.eksempel[1]); }
            };
        },
        /* Hvilken binding er mest polaer? Fire bindinger med forskellig ΔEN */
        function () {
            var valgte = [], set = {};
            NK.bland(D.par().filter(function (p) { return D.bindingstype(p[0], p[1]) !== "ion"; })).forEach(function (p) {
                var d = D.dEN(p[0], p[1]);
                if (valgte.length < 4 && !set[d]) { set[d] = true; valgte.push(p); }
            });
            var bedst = valgte.reduce(function (x, p) { return D.dEN(p[0], p[1]) > D.dEN(x[0], x[1]) ? p : x; }, valgte[0]);
            var navne = valgte.map(function (p) {
                var hoej = en(p[0]) >= en(p[1]) ? p[0] : p[1];
                return binding(hoej, hoej === p[0] ? p[1] : p[0]);
            });
            return {
                tekst: "Hvilken binding er mest polær?",
                valg: navne,
                rigtig: valgte.indexOf(bedst),
                hint: "Beregn ΔEN for hver binding. Jo større forskel, jo mere polær.",
                svar: navne[valgte.indexOf(bedst)] + ": " + regning(bedst[0], bedst[1]) + " er den største forskel.",
                visSvar: function (s) { s.saetPar(bedst[0], bedst[1]); }
            };
        }
    ];

    /* ----- Simulationen --------------------------------------------------------- */
    NK.SimEN = function () {
        this.laerred = new NK.Laerred(NK.el("en-laerred"));
        this.par = START.slice();
        this.slot = 0;
        this.skjul = {};
        this.fastPar = false;
        this.aendringer = 0;
        this.tid = 0;
        this.pop = [0, 0];
        this.ryk = 0;
        this.hover = -1;
        this.geo = null;
        this.sidsteByg = null;
        this.vist = { skift: this.maalSkift(), adskil: this.maalAdskil(), dEN: D.dEN(START[0], START[1]) };
        this.OPGAVER = OPGAVER;
        this.BYG = BYG;
        this.opgaver = new NK.Opgaver("en", OPGAVER, this);
        this._bygTabel();
        this._bindMus();
    };

    var P = NK.SimEN.prototype;

    /* ----- Parret ---------------------------------------------------------- */
    P.type = function () { return D.bindingstype(this.par[0], this.par[1]); };

    /* Hvor langt elektronparret er glidet: −1 helt til venstre, +1 helt
       til hoejre. Under en opgave, der skjuler det, staar det i midten. */
    P.maalSkift = function () {
        if (this.skjul.skift) return 0;
        var a = this.par[0], b = this.par[1];
        var staerk = D.staerkest(a, b);
        if (!staerk) return 0;
        var s = this.type() === "ion" ? 1 : Math.min(D.dEN(a, b) / 2, 0.92);
        return staerk === a ? -s : s;
    };

    P.maalAdskil = function () {
        return !this.skjul.skift && this.type() === "ion" ? 1 : 0;
    };

    P.besked = function (tekst) {
        var e = NK.el("en-besked");
        e.textContent = tekst;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
        window.clearTimeout(this._beskedUr);
        this._beskedUr = window.setTimeout(function () { e.classList.remove("vis"); }, 3000);
    };

    /* Saetter begge atomer paa én gang (opgaverne og selvtesten). */
    P.saetPar = function (a, b) {
        if (this.par[0] !== a) this.pop[0] = 1;
        if (this.par[1] !== b) this.pop[1] = 1;
        this.par = [a, b];
        this.aendringer++;
        this.opdaterTabel();
    };

    /* Et klik i tabellen: atomet kommer ind paa pladsen med ringen. */
    P.vaelg = function (el) {
        if (this.fastPar) {
            this.besked("Opgaven bruger de to atomer, der står nu. Tryk Vis svaret for at komme videre.");
            return false;
        }
        var andet = this.par[1 - this.slot];
        var ok = D.tilladt(el, andet);
        if (ok !== true) { this.besked(ok); return false; }
        if (this.par[this.slot] !== el) {
            this.par[this.slot] = el;
            this.pop[this.slot] = 1;
            this.aendringer++;
        }
        this.slot = 1 - this.slot;
        this.opdaterTabel();
        return true;
    };

    P.startOpgavePar = function (p, skjul) {
        this.saetPar(p[0], p[1]);
        this.skjul = skjul || {};
        this.fastPar = true;
        this.opdaterTabel();
    };

    P.slutOpgavePar = function () {
        this.skjul = {};
        this.fastPar = false;
        this.opdaterTabel();
    };

    /* ----- Tabellen i panelet ------------------------------------------------ */
    P._bygTabel = function () {
        var mig = this;
        var vaert = NK.el("en-tabel");
        var efterPlads = {};
        D.EN_ORDEN.forEach(function (el) {
            var g = D.GRUNDSTOFFER[el];
            efterPlads[g.periode + "-" + g.gruppe] = el;
        });
        this.celler = {};
        for (var periode = 1; periode <= 4; periode++) {
            KOLONNER.forEach(function (gruppe) {
                var noegle = periode + "-" + gruppe;
                var el = efterPlads[noegle];
                var tom = TOMME[noegle];
                var b;
                if (el) {
                    b = document.createElement("button");
                    b.type = "button";
                    b.className = "pt-felt";
                    b.setAttribute("data-el", el);
                    b.title = D.stort(navn(el));
                    b.style.backgroundColor = enFarve(en(el));
                    b.style.borderColor = enFarve(en(el), true);
                    b.innerHTML = '<span class="pt-symbol"></span><span class="pt-en"></span>';
                    b.querySelector(".pt-symbol").textContent = el;
                    b.querySelector(".pt-en").textContent = tal(en(el));
                    b.addEventListener("click", function () { mig.vaelg(el); });
                    mig.celler[el] = b;
                } else if (tom) {
                    b = document.createElement("button");
                    b.type = "button";
                    b.className = "pt-felt tom";
                    b.title = D.stort(tom[1]);
                    b.textContent = tom[0];
                    b.addEventListener("click", function () {
                        mig.besked(D.stort(tom[1]) + " er ikke med her. Brug de farvede felter.");
                    });
                } else {
                    b = document.createElement("span");
                    b.className = "pt-hul";
                }
                vaert.appendChild(b);
            });
        }
        this.opdaterTabel();
    };

    P.opdaterTabel = function () {
        var mig = this;
        var andet = this.par[1 - this.slot];
        Object.keys(this.celler).forEach(function (el) {
            var c = mig.celler[el];
            c.classList.toggle("valgt", mig.par.indexOf(el) >= 0);
            c.classList.toggle("spaerret", mig.fastPar || D.tilladt(el, andet) !== true);
            c.setAttribute("aria-pressed", mig.par.indexOf(el) >= 0 ? "true" : "false");
        });
    };

    /* ----- Musen: klik paa et atom i scenen ------------------------------------ */
    P._punkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    P.atomVed = function (x, y) {
        var g = this.geo;
        if (!g) return -1;
        for (var i = 0; i < 2; i++) {
            if (Math.hypot(x - g.x[i], y - g.y) <= Math.max(g.R[i] + 6, 20)) return i;
        }
        return -1;
    };

    P._bindMus = function () {
        var mig = this;
        var cvs = this.laerred.canvas;
        cvs.addEventListener("pointerdown", function (e) {
            var p = mig._punkt(e);
            var i = mig.atomVed(p.x, p.y);
            if (mig.opgaver.klik(i)) return;
            if (i >= 0 && !mig.fastPar) {
                mig.slot = i;
                mig.opdaterTabel();
            }
        });
        cvs.addEventListener("pointermove", function (e) {
            var p = mig._punkt(e);
            mig.hover = mig.atomVed(p.x, p.y);
            cvs.style.cursor = mig.hover >= 0 && (!mig.fastPar || mig.opgaver.igang()) ? "pointer" : "default";
        });
        cvs.addEventListener("pointerleave", function () { mig.hover = -1; });
    };

    /* ----- Panelet --------------------------------------------------------------- */
    P.opdaterPanel = function () {
        var a = this.par[0], b = this.par[1];
        var t = this.type();
        NK.saetTekst("en-formel", binding(a, b));
        NK.saetTekst("en-navn", navn(a) + " og " + navn(b));
        NK.saetTekst("en-regning", this.skjul.type ? regning(a, b).replace(/= .*$/, "= ?") : regning(a, b));
        if (this.skjul.type) {
            NK.saetTekst("en-type", "?");
            NK.saetKlasse("en-type", "maerke graa");
        } else {
            NK.saetTekst("en-type", D.TYPER[t].navn);
            NK.saetKlasse("en-type", "maerke " + (t === "upolaer" ? "groen" : t === "polaer" ? "orange" : "roed"));
        }
    };

    /* Billedteksten over skalaen: hvad scenen viser lige nu */
    P.billedtekst = function () {
        var a = this.par[0], b = this.par[1];
        if (this.skjul.skift) return "Hvem trækker hårdest i elektronparret?";
        var staerk = D.staerkest(a, b);
        var t = this.type();
        if (!staerk) return "Lige stærkt træk. Elektronparret ligger i midten.";
        var svag = staerk === a ? b : a;
        if (t === "upolaer") return staerk + " trækker kun lidt hårdere end " + svag + ". Bindingen er upolær.";
        if (t === "polaer") return staerk + " trækker hårdest. Elektronparret ligger tættest på " + staerk + ".";
        return staerk + " tager elektronerne helt. Der dannes ioner.";
    };

    /* ----- Faelles graenseflade -------------------------------------------------- */
    P.tilpas = function () {
        this.laerred.tilpas();
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.vist.skift = NK.mod(this.vist.skift, this.maalSkift(), 5, dt);
        this.vist.adskil = NK.mod(this.vist.adskil, this.maalAdskil(), 5, dt);
        this.vist.dEN = NK.mod(this.vist.dEN, D.dEN(this.par[0], this.par[1]), 7, dt);
        this.pop[0] = Math.max(0, this.pop[0] - dt * 3);
        this.pop[1] = Math.max(0, this.pop[1] - dt * 3);
        /* Mens Kemichael praesenterer fanen fra venstre, rykker atomerne
           til hoejre, saa hans taleboble ikke daekker dem. */
        var L = NK.laerer;
        var taler = !!(L && L.laererIIntro && L.laererIIntro() && L.introId === "fane-en");
        this.ryk = NK.mod(this.ryk, taler ? 0.2 : 0, 4, dt);
        this.opgaver.opdater();
        this.opdaterPanel();
    };

    /* Atomernes plads og stoerrelse paa laerredet */
    P.geometri = function () {
        var b = this.laerred.b, h = this.laerred.h;
        var bund = 150;
        var U = NK.klamp(Math.min(b / 7.4, (h - bund) / 3.4), 34, 100);
        var cy = (h - bund) * 0.5 + 18;
        var s = this.vist.skift, ad = this.vist.adskil;
        var R = [0, 1].map(function (i) {
            var g = D.GRUNDSTOFFER[this.par[i]];
            var r = U * (0.5 + g.r);
            /* Ionerne: den positive mister sin yderste skal, den negative vokser */
            var negativ = i === 0 ? s < 0 : s > 0;
            if (ad > 0.001) r *= negativ ? 1 + 0.14 * ad : 1 - 0.28 * ad;
            return r * (1 + 0.12 * Math.sin(this.pop[i] * Math.PI));
        }, this);
        var gab = U * (0.95 + 0.85 * ad);
        var afst = R[0] + R[1] + gab;
        var midt = b / 2 + (R[0] - R[1]) / 2 + this.ryk * b;
        this.geo = { U: U, y: cy, x: [midt - afst / 2, midt + afst / 2], R: R, bund: bund };
        return this.geo;
    };

    function sky(ctx, x, y, r, alfa) {
        if (alfa < 0.01) return;
        var g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        g.addColorStop(0, "rgba(92, 172, 240, " + alfa.toFixed(3) + ")");
        g.addColorStop(0.6, "rgba(92, 172, 240, " + (alfa * 0.45).toFixed(3) + ")");
        g.addColorStop(1, "rgba(92, 172, 240, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    /* Parret glider fra midten af mellemrummet mod overfladen af det atom,
       der traekker haardest. Ved ioner ender det inde i den negative ion. */
    P.parPlads = function (g) {
        var s = this.vist.skift;
        var sL = g.x[0] + g.R[0], sR = g.x[1] - g.R[1];
        var m = (sL + sR) / 2;
        var ind = 0.12 + 0.38 * this.vist.adskil;
        var maal = s < 0 ? g.x[0] + g.R[0] * (1 - ind) : g.x[1] - g.R[1] * (1 - ind);
        return m + Math.abs(s) * (maal - m);
    };

    P.tegnAtom = function (ctx, i, g) {
        var el = this.par[i];
        var R = g.R[i], x = g.x[i], y = g.y;
        var s = R * SPRITE_KUGLE;
        NK.Sprites.tegn(ctx, "atom_" + el, x - s, y - s, 2 * s, 2 * s);
        var fs = NK.klamp(R * 0.62, 16, 44);
        var moerk = D.GRUNDSTOFFER[el].moerkTekst;
        NK.tekst(ctx, el, x, y + 1, {
            font: "700 " + Math.round(fs) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: moerk ? "#2b2f36" : "#ffffff", kant: !moerk, kantFarve: "rgba(0, 0, 0, 0.45)", kantBredde: Math.max(2, fs * 0.14)
        });
        /* Elektronegativiteten og navnet under atomet */
        NK.etiket(ctx, "EN " + tal(en(el)), x, y + R + 24, { font: "700 16px 'Segoe UI', sans-serif", hoejde: 26, kant: "rgba(255, 255, 255, 0.18)" });
        NK.tekst(ctx, navn(el), x, y + R + 52, { font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#9aa1ab" });

        /* Ringen om det atom, et klik i tabellen skifter ud */
        if (i === this.slot && !this.fastPar) {
            ctx.save();
            ctx.setLineDash([7, 6]);
            ctx.lineDashOffset = -this.tid * 18;
            ctx.strokeStyle = GUL;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, R + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (i === this.hover && (!this.fastPar || this.opgaver.igang())) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, R + 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    };

    P.tegnLadning = function (ctx, g) {
        var s = this.vist.skift, ad = this.vist.adskil;
        if (Math.abs(s) < 0.05 || this.skjul.skift) return;
        var delta = NK.el("en-delta").checked;
        for (var i = 0; i < 2; i++) {
            var negativ = i === 0 ? s < 0 : s > 0;
            var x = g.x[i] + g.R[i] * 0.72 + 6, y = g.y - g.R[i] * 0.72 - 6;
            if (ad > 0.5) {
                /* Ioner: en hel ladning i en lille cirkel */
                ctx.save();
                ctx.globalAlpha = NK.klamp((ad - 0.5) * 2, 0, 1);
                ctx.fillStyle = "rgba(14, 14, 20, 0.9)";
                ctx.strokeStyle = negativ ? MINUS : PLUS;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(x + 6, y + 2, 17, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                NK.tekst(ctx, negativ ? "−" : "+", x + 6, y + 3, { font: "700 26px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: negativ ? MINUS : PLUS });
                ctx.restore();
            } else if (delta && this.type() === "polaer") {
                NK.tekst(ctx, negativ ? "δ−" : "δ+", x, y, {
                    font: "700 22px 'Segoe UI', sans-serif", justering: "left", linje: "middle",
                    farve: negativ ? MINUS : PLUS, kant: true, kantBredde: 4
                });
            }
        }
    };

    P.tegnPar = function (ctx, g) {
        var px = this.parPlads(g);
        var r = NK.klamp(g.U * 0.075, 5, 8);
        ctx.save();
        ctx.fillStyle = GUL;
        ctx.strokeStyle = "rgba(60, 40, 0, 0.7)";
        ctx.lineWidth = 1.5;
        [-1, 1].forEach(function (t) {
            ctx.beginPath();
            ctx.arc(px, g.y + t * r * 1.35, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
    };

    P.tegnSkala = function (ctx, g) {
        var b = this.laerred.b, h = this.laerred.h;
        var x0 = Math.max(56, b * 0.09), x1 = b - Math.max(28, b * 0.06);
        var y = h - 64, hh = 26;
        function xAf(v) { return x0 + (x1 - x0) * v / SKALA_MAKS; }
        var zoner = [[0, D.POLAER_GRAENSE, "upolaer"], [D.POLAER_GRAENSE, D.ION_GRAENSE, "polaer"], [D.ION_GRAENSE, SKALA_MAKS, "ion"]];
        var FARVE = { upolaer: "63, 174, 114", polaer: "230, 137, 42", ion: "224, 84, 70" };
        var t = this.type();
        var skjult = !!this.skjul.type;
        zoner.forEach(function (z) {
            var a = xAf(z[0]), c = xAf(z[1]);
            var aktiv = !skjult && z[2] === t;
            ctx.fillStyle = "rgba(" + FARVE[z[2]] + ", " + (aktiv ? 0.42 : 0.18) + ")";
            ctx.fillRect(a, y, c - a, hh);
            ctx.strokeStyle = "rgba(" + FARVE[z[2]] + ", 0.7)";
            ctx.lineWidth = 1;
            ctx.strokeRect(a + 0.5, y + 0.5, c - a - 1, hh - 1);
            NK.tekst(ctx, D.TYPER[z[2]].navn, (a + c) / 2, y + hh / 2 + 1, {
                font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: D.TYPER[z[2]].farve
            });
        });
        NK.tekst(ctx, "ΔEN", x0 - 10, y + hh / 2 + 1, { font: "700 14px 'Segoe UI', sans-serif", justering: "right", linje: "middle", farve: "#c8ced6" });
        for (var v = 0; v <= SKALA_MAKS + 1e-9; v += 0.5) {
            var x = xAf(v);
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(x - 0.5, y + hh, 1, 5);
            NK.tekst(ctx, tal(v), x, y + hh + 17, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#9aa1ab" });
        }
        if (skjult) {
            NK.etiket(ctx, "ΔEN = ?", xAf(SKALA_MAKS / 2), y - 22, { font: "700 15px 'Segoe UI', sans-serif", farve: GUL, hoejde: 26 });
            return;
        }
        var xm = xAf(NK.klamp(this.vist.dEN, 0, SKALA_MAKS));
        ctx.save();
        ctx.fillStyle = GUL;
        ctx.strokeStyle = "rgba(10, 10, 16, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xm, y + 2);
        ctx.lineTo(xm - 9, y - 11);
        ctx.lineTo(xm + 9, y - 11);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        var lx = NK.klamp(xm, x0 + 50, x1 - 50);
        NK.etiket(ctx, "ΔEN = " + tal(D.dEN(this.par[0], this.par[1])), lx, y - 26, { font: "700 15px 'Segoe UI', sans-serif", farve: GUL, hoejde: 26 });
    };

    P.tegn = function () {
        var ctx = this.laerred.ctx;
        var b = this.laerred.b, h = this.laerred.h;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, b, h);
        var glod = ctx.createRadialGradient(b / 2, h * 0.4, 0, b / 2, h * 0.4, Math.min(b, h) * 0.6);
        glod.addColorStop(0, "rgba(61, 158, 224, 0.07)");
        glod.addColorStop(1, "rgba(61, 158, 224, 0)");
        ctx.fillStyle = glod;
        ctx.fillRect(0, 0, b, h);

        var g = this.geometri();
        var s = this.vist.skift;

        /* Elektronskyen: tykkest ved det atom, der traekker haardest */
        if (NK.el("en-sky").checked) {
            var w = [0.5 - 0.5 * s, 0.5 + 0.5 * s];
            sky(ctx, g.x[0], g.y, g.R[0] * 1.75, 0.62 * w[0]);
            sky(ctx, g.x[1], g.y, g.R[1] * 1.75, 0.62 * w[1]);
            sky(ctx, this.parPlads(g), g.y, g.U * 1.15, 0.38 * (1 - 0.6 * this.vist.adskil));
        }

        this.tegnAtom(ctx, 0, g);
        this.tegnAtom(ctx, 1, g);
        this.tegnPar(ctx, g);
        this.tegnLadning(ctx, g);

        NK.tekst(ctx, this.billedtekst(), b / 2, h - 120, {
            font: "600 17px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#e9eef4"
        });
        this.tegnSkala(ctx, g);
    };

    P.nulstil = function () {
        this.opgaver.nulstil();
        this.slutOpgavePar();
        this.par = START.slice();
        this.slot = 0;
        this.aendringer++;
        this.opdaterTabel();
    };

    P.skiftVinkelmaaler = function () { /* ingen vinkelmaaler her */ };

    NK.SimEN.regning = regning;
}());
