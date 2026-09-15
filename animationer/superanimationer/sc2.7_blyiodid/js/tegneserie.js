/* =====================================================================
   tegneserie.js - forsoeget opsummeret som en tegneserie

   Bag knappen Tegneserie, som laases op, naar forsoeget er slut. Hver
   iagttagelse i logbogen bliver en rude: et lille laerred med et udsnit
   af bordet, tegnet med de samme funktioner som scenen, og en kort
   tekst. Ruderne bruger elevens egne tal: masserne og temperaturerne.
   Sidste rude er maalingerne med tabel og graf.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;

    var B = 300, H = 214;

    /* Udsnit af tegnebordet: oeverste venstre hjoerne og skala */
    var UDSNIT = {
        glas:  { x: 505, y: 232, k: 0.75 },
        vaegt: { x: 8, y: 330, k: 0.84 },
        dunk:  { x: 612, y: 214, k: 0.72 }
    };

    function tekst(ctx, t, x, y, opt) {
        opt = opt || {};
        NK.tekst(ctx, t, x, y, { font: opt.font || "700 12px 'Segoe UI', sans-serif", justering: opt.justering || "center", linje: "middle", farve: opt.farve || "#dfe5ec", kant: true });
    }

    function rude(container, nr, tekstStr, tegn) {
        var div = document.createElement("div");
        div.className = "rude";
        var canvas = document.createElement("canvas");
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(B * dpr);
        canvas.height = Math.round(H * dpr);
        var ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, B, H);
        ctx.clip();
        tegn(ctx);
        ctx.restore();
        div.appendChild(canvas);
        var p = document.createElement("p");
        var sp = document.createElement("span");
        sp.className = "nr";
        sp.textContent = String(nr);
        p.appendChild(sp);
        p.appendChild(document.createTextNode(tekstStr));
        div.appendChild(p);
        container.appendChild(div);
    }

    function udsnit(ctx, u, tegn) {
        ctx.save();
        ctx.scale(u.k, u.k);
        ctx.translate(-u.x, -u.y);
        S.tegnBaggrund(ctx, { urMinutter: M.UR.start });
        tegn();
        ctx.restore();
    }

    /* Faste krystaller, saa tegningen er den samme hver gang */
    function tal(i, s) {
        var x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
        return x - Math.floor(x);
    }

    function flager(antal, falder) {
        var ud = [];
        for (var i = 0; i < antal; i++) {
            ud.push({
                x: 14 + tal(i, 1) * 84,
                y: falder ? 84 + tal(i, 2) * 36 : 112 + tal(i, 3) * 12,
                a: i * 0.9, s: 2 + (i % 3) * 0.6, alfa: 1, fart: 2 + (i % 4), fase: i * 1.7
            });
        }
        return ud;
    }

    /* Varmepladen med baegerglas, foeler og termometer.
       s = { T, varme, omroer, vand, uklar, bundlag, flager, falder, koger } */
    function opstilling(ctx, s) {
        S.tegnLedning(ctx, 0);
        S.tegnStang(ctx, 0);
        S.tegnTermometer(ctx, s.T, true, false, 0);
        S.tegnVarmeplade(ctx, {
            varme: !!s.varme, omroer: !!s.omroer, effekt: s.varme ? 1 : 0,
            vinkelVarme: s.varme ? 0.9 : -2.3, vinkelOmroer: s.omroer ? 0.9 : -2.3
        }, 0);
        var bobler = [];
        if (s.koger) for (var i = 0; i < 16; i++) bobler.push({ x: 16 + i * 5.5, y: 84 + (i * 17) % 36, r: 1.3 + (i % 3) * 0.5 });
        S.tegnBaegerglas(ctx, {
            p: S.HJEM.baegerglas, vandAreal: s.vand === false ? 0 : M.VAND.mL * S.BAEGER_PR_ML,
            uklar: s.uklar || 0, bundlag: s.bundlag || 0, flager: flager(s.flager || 0, s.falder),
            bobler: bobler, magnet: true, spin: 0.5, hvirvel: s.omroer ? 4.5 : 0, boelge: s.koger ? 0.8 : 0
        }, 1.3);
        if (s.T > 55) {
            var dampe = [];
            for (var j = 0; j < 6; j++) dampe.push({ x: 620 + j * 12, y: 270 - (j * 13) % 40, r: 8 + j, liv: 1 });
            S.tegnDamp(ctx, dampe);
        }
    }

    function vaegtUdsnit(ctx, masse) {
        S.tegnStofglas(ctx, "pbGlas", S.HJEM.pbGlas, 0, true);
        S.tegnStofglas(ctx, "kiGlas", S.HJEM.kiGlas, 0, true);
        S.tegnVaegt(ctx, masse, 0);
        S.tegnVejebaad(ctx, S.HJEM.vejebaad, masse);
        S.tegnSpatel(ctx, S.HJEM.spatel, false);
    }

    function grader(T) {
        return M.komma(T, 1) + " °C";
    }

    /* ----- Ruderne for hver iagttagelse -------------------------------- */
    var RUDER = {
        vand: function (f, e) {
            return { tekst: e.tekst, tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () { opstilling(ctx, { T: e.T }); });
                tekst(ctx, "100 mL vand", 110, 20);
            } };
        },
        pulver: function (f, e) {
            var t = f.tilsaetninger[0];
            var tal = t ? " Første gang blev der afvejet " + M.komma(t.pb, 3) + " g Pb(NO₃)₂ og " + M.komma(t.ki, 3) + " g KI." : "";
            return { tekst: e.tekst + tal, tegn: function (ctx) {
                udsnit(ctx, UDSNIT.vaegt, function () { vaegtUdsnit(ctx, t ? t.pb : 0.1); });
            } };
        },
        pb_oploest: function (f, e) {
            return { tekst: e.tekst, tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () {
                    opstilling(ctx, { T: e.T });
                    var korn = [];
                    for (var i = 0; i < 24; i++) korn.push({ x: 640 + (i * 23) % 26, y: 300 + (i * 31) % 70, liv: 1 });
                    S.tegnKorn(ctx, korn);
                });
                tekst(ctx, M.formel("Pb2+", true) + " + " + M.formel("NO3-", true), 110, 20, { farve: "#c8ced6" });
            } };
        },
        bundfald: function (f, e) {
            return { tekst: e.tekst + " " + M.ligning(M.REAKTIONER.faeldning, true) + ".", tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () { opstilling(ctx, { T: e.T, uklar: 0.55, bundlag: 5, flager: 30 }); });
                tekst(ctx, M.formel("PbI2", true), 110, 20, { farve: "#ffd84a" });
            } };
        },
        intet: function (f, e) {
            return { tekst: e.tekst, tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () { opstilling(ctx, { T: e.T, varme: e.varme, omroer: e.omroer }); });
            } };
        },
        klar: function (f, e) {
            return { tekst: e.tekst + " Første gang skete det ved " + grader(e.T) + ".", tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () { opstilling(ctx, { T: e.T, varme: true, omroer: true }); });
                tekst(ctx, "varm og klar", 110, 20, { farve: "#ffb27a" });
            } };
        },
        regn: function (f, e) {
            return { tekst: e.tekst + " Første gang skete det ved " + grader(e.T) + ". Den temperatur noteres.", tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () { opstilling(ctx, { T: e.T, uklar: 0.06, bundlag: 1, flager: 24, falder: true }); });
                tekst(ctx, "gyldne regn", 110, 20, { farve: "#ffd84a" });
            } };
        },
        koger: function (f, e) {
            return { tekst: e.tekst + " Der var for meget stof til 100 mL vand.", tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () { opstilling(ctx, { T: 100, varme: true, omroer: true, uklar: 0.35, flager: 20, koger: true }); });
            } };
        },
        spild: function (f, e) {
            return { tekst: e.tekst + " Kemichael tørrede op.", tegn: function (ctx) {
                udsnit(ctx, UDSNIT.vaegt, function () {
                    vaegtUdsnit(ctx, 0);
                    S.tegnSpild(ctx, { x: 250, rx: 34, alfa: 1 });
                    NK.Sprites.tegnPositur(ctx, "papir", { x: 330, y: S.BORD - 30, v: 0.2 }, S.ANKER.papir);
                });
            } };
        },
        varmt: function (f, e) {
            return { tekst: e.tekst + " Kemichael tørrede op.", tegn: function (ctx) {
                udsnit(ctx, UDSNIT.glas, function () {
                    opstilling(ctx, { T: e.T, varme: e.varme, omroer: e.omroer });
                    S.tegnSkvulp(ctx, { x: 590, rx: 32, alfa: 1, farve: { r: 240, g: 206, b: 90, a: 0.8 } });
                });
                tekst(ctx, grader(e.T), 110, 20, { farve: "#f0918a" });
            } };
        },
        affald: function (f, e) {
            return { tekst: e.tekst, tegn: function (ctx) {
                udsnit(ctx, UDSNIT.dunk, function () {
                    S.tegnVarmeplade(ctx, { varme: false, omroer: false, effekt: 0, vinkelVarme: -2.3, vinkelOmroer: -2.3 }, 0);
                    S.tegnDunk(ctx);
                    var p = S.HAELD_DUNK;
                    S.tegnBaegerglas(ctx, { p: p, vandAreal: 40 * S.BAEGER_PR_ML, uklar: 0.2, bundlag: 0, flager: [], bobler: [], magnet: false }, 0);
                    var d = S.DUNK.aabning;
                    S.tegnStraale(ctx, NK.tilVerden(p, S.ANKER.baegerglas, 106, 6), { x: d.x, y: d.y + 6 }, { r: 240, g: 206, b: 90, a: 0.8 }, 3.5, 0);
                });
            } };
        }
    };

    function maalingTabel(f) {
        var tabel = document.createElement("table");
        tabel.className = "maalinger";
        var hoved = document.createElement("tr");
        ["Nr.", "Pb(NO₃)₂", "KI", "PbI₂", "Temp."].forEach(function (t) {
            var th = document.createElement("th");
            th.textContent = t;
            hoved.appendChild(th);
        });
        tabel.appendChild(hoved);
        f.maalinger.forEach(function (m) {
            var tr = document.createElement("tr");
            [String(m.nr), M.komma(m.pb, 3) + " g", M.komma(m.ki, 3) + " g", M.komma(m.pbi2, 3) + " g", grader(m.T)].forEach(function (t) {
                var td = document.createElement("td");
                td.textContent = t;
                tr.appendChild(td);
            });
            tabel.appendChild(tr);
        });
        return tabel;
    }

    NK.Tegneserie = {
        RUDER: RUDER,
        byg: function (f, container) {
            container.innerHTML = "";
            var nr = 0;
            f.logbog.forEach(function (e) {
                var lav = RUDER[e.noegle];
                if (!lav) return;
                var r = lav(f, e);
                rude(container, ++nr, r.tekst, r.tegn);
            });

            /* Sidste rude: maalingerne */
            var sidste = document.createElement("div");
            sidste.className = "rude";
            var p = document.createElement("p");
            var sp = document.createElement("span");
            sp.className = "nr";
            sp.textContent = String(++nr);
            p.appendChild(sp);
            p.appendChild(document.createTextNode("Målingerne. Masserne er i alt i 100 mL vand, og temperaturen er noteret, da de første krystaller kom."));
            sidste.appendChild(p);
            sidste.appendChild(maalingTabel(f));
            var canvas = document.createElement("canvas");
            var dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(B * dpr);
            canvas.height = Math.round(190 * dpr);
            var ctx = canvas.getContext("2d");
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            NK.Graf.tegn(ctx, B, 190, { maalinger: f.maalinger, visKurve: true });
            sidste.appendChild(canvas);
            var konklusion = f.logbog.filter(function (e) { return e.noegle === "kurve" || e.noegle === "kurve_afvig"; })[0];
            if (konklusion) {
                var pk = document.createElement("p");
                pk.textContent = konklusion.tekst + " Opløseligheden af PbI₂ stiger med temperaturen.";
                sidste.appendChild(pk);
            }
            container.appendChild(sidste);
        }
    };
}());
