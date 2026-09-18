/* =====================================================================
   molekyle.js - molekylerne, som de tegnes i zoomboblen og i glasset

   Et molekyle bygges én gang ud fra sin beskrivelse i data.js og
   gemmes. Derefter er det bare en liste af kugler og streger i lokale
   koordinater, som kan tegnes hvor som helst, drejet og skaleret.

   Lokale koordinater: 1 enhed = én binding mellem to carbonatomer.
   Molekylet er flyttet, saa (0,0) er dets midte, og yderradius er
   afstanden ud til den fjerneste kugle. Det er den radius, fysikken i
   de to faner regner med, saa et stort molekyle ogsaa fylder mest.

   Farvesproget er det samme som i de oevrige superanimationer:
     oxygen roed, hydrogen lys graa, carbon moerkegraa.
   Den polaere ende er den, hvor oxygen sidder; δ− og δ+ tegnes der,
   naar de er slaaet til.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = {};
    NK.Mol = M;

    M.OXYGEN   = "#e05446";
    M.HYDROGEN = "#e6ebf0";
    M.CARBON   = "#5c636e";

    var R = { C: 0.42, O: 0.40, H: 0.25 };

    /* ----- Bygningen ---------------------------------------------------- */
    /* En knude er { x, y, r, farve, art }. art bruges til δ-maerkerne:
       "O" faar δ−, "Hpolaer" faar δ+. */
    function knude(x, y, art) {
        return {
            x: x, y: y,
            r: R[art === "Hpolaer" ? "H" : art],
            farve: art === "C" ? M.CARBON : (art === "O" ? M.OXYGEN : M.HYDROGEN),
            art: art
        };
    }

    /* Et zigzag-led: carbonkaeden ligger vandret med knaek op og ned,
       ligesom en streg-formel i bogen. */
    function kaedePunkt(i) {
        return { x: i * 0.82, y: (i % 2 === 0 ? -0.30 : 0.30) };
    }

    function byg(spec) {
        var k = [], b = [], i;

        if (spec.type === "vand") {
            /* Vinklen mellem bindingerne er ca. 104,5°. */
            k.push(knude(0, 0, "O"));
            var v = 104.5 * Math.PI / 180 / 2;
            k.push(knude(-Math.sin(v) * 0.62, Math.cos(v) * 0.62, "Hpolaer"));
            k.push(knude(Math.sin(v) * 0.62, Math.cos(v) * 0.62, "Hpolaer"));
            b.push([0, 1], [0, 2]);

        } else if (spec.type === "kaede") {
            for (i = 0; i < spec.c; i++) {
                var p = kaedePunkt(i);
                k.push(knude(p.x, p.y, "C"));
                if (i > 0) b.push([i - 1, i]);
            }
            if (spec.oh) {
                var sidste = kaedePunkt(spec.c);
                k.push(knude(sidste.x, sidste.y, "O"));
                b.push([spec.c - 1, spec.c]);
                k.push(knude(sidste.x + 0.52, sidste.y + (spec.c % 2 === 0 ? -0.34 : 0.34), "Hpolaer"));
                b.push([spec.c, spec.c + 1]);
            }

        } else if (spec.type === "olie") {
            /* Et fedtstof: en kort rygrad med tre estergrupper og tre
               lange, upolaere haler. Halerne er kortet ned til seks
               carbonatomer, saa molekylet kan ses i en zoomboble, men det
               er stadig det stoerste af de fem. */
            var rygrad = [];
            for (i = 0; i < 3; i++) {
                k.push(knude(-1.6, (i - 1) * 1.05, "C"));
                rygrad.push(k.length - 1);
                if (i > 0) b.push([rygrad[i - 1], rygrad[i]]);
            }
            for (i = 0; i < 3; i++) {
                var y0 = (i - 1) * 1.05;
                k.push(knude(-0.8, y0, "O"));
                var o = k.length - 1;
                b.push([rygrad[i], o]);
                var forrige = o;
                for (var j = 0; j < 6; j++) {
                    k.push(knude(0, y0 + (j % 2 === 0 ? -0.28 : 0.28), "C"));
                    k[k.length - 1].x = j * 0.82;
                    b.push([forrige, k.length - 1]);
                    forrige = k.length - 1;
                }
            }
        }

        /* Flyt molekylet, saa (0,0) er midten, og find yderradius. */
        var sx = 0, sy = 0;
        for (i = 0; i < k.length; i++) { sx += k[i].x; sy += k[i].y; }
        sx /= k.length; sy /= k.length;
        var yder = 0;
        for (i = 0; i < k.length; i++) {
            k[i].x -= sx;
            k[i].y -= sy;
            yder = Math.max(yder, Math.hypot(k[i].x, k[i].y) + k[i].r);
        }

        /* Den polaere ende: midten af de knuder, der baerer δ. Den
           bruges til at vende molekylet rigtigt i zoomboblen. */
        var px = 0, py = 0, n = 0;
        for (i = 0; i < k.length; i++) {
            if (k[i].art === "O" || k[i].art === "Hpolaer") { px += k[i].x; py += k[i].y; n++; }
        }
        var midte = n ? { x: px / n, y: py / n } : { x: 0, y: 0 };

        /* Hvor stort skaeret om den polaere ende skal vaere: ud til den
           fjerneste af de polaere knuder plus lidt luft. */
        var polaerR = 0;
        for (i = 0; i < k.length; i++) {
            if (k[i].art !== "O" && k[i].art !== "Hpolaer") continue;
            polaerR = Math.max(polaerR, Math.hypot(k[i].x - midte.x, k[i].y - midte.y) + k[i].r * 1.7);
        }

        /* Et fedtstof har estergrupper med oxygen i, men molekylet er saa
           stort og saa upolaert, at det ville vaere misvisende at pege paa
           dem som "den polaere ende". Derfor kan et stof sige fra.  */
        return {
            knuder: k, bindinger: b, yder: yder,
            polaerEnde: midte, polaerR: polaerR,
            harPolaer: n > 0 && !spec.skjulPolaer
        };
    }

    /* ----- Opslag ------------------------------------------------------- */
    var lager = {};

    M.form = function (v) {
        if (!lager[v.id]) lager[v.id] = byg(v.mol);
        return lager[v.id];
    };

    /* Molekylets radius i tegneenheder, naar det tegnes med denne skala. */
    M.radius = function (v, skala) {
        return M.form(v).yder * skala;
    };

    /* ----- Tegningen ---------------------------------------------------- */
    /* x, y er molekylets midte, vinkel dets drejning og skala antallet af
       pixels pr. binding.
       opt.alpha    gennemsigtighed
       opt.delta    tegn δ− og δ+ ved den polaere ende (kun store nok)
       opt.ring     en farve: en ring om hele molekylet
       opt.enkel    én kugle pr. knude uden skygge - til mange molekyler */
    M.tegn = function (ctx, form, x, y, vinkel, skala, opt) {
        opt = opt || {};
        var c = Math.cos(vinkel), s = Math.sin(vinkel);
        var k = form.knuder, b = form.bindinger, i;

        function til(n) {
            return [x + (n.x * c - n.y * s) * skala, y + (n.x * s + n.y * c) * skala];
        }

        ctx.save();
        if (opt.alpha !== undefined) ctx.globalAlpha = opt.alpha;

        /* Den polaere ende maerkes med et blodt skaer. δ-tegnene kan kun
           laeses paa de store molekyler, og molekylerne i en zoomboble
           er sjaeldent saa store; skaeret virker i alle stoerrelser. */
        if (opt.delta && form.harPolaer) {
            var pe = form.polaerEnde;
            var px = x + (pe.x * c - pe.y * s) * skala;
            var py = y + (pe.x * s + pe.y * c) * skala;
            var pr = form.polaerR * skala;
            var gl = ctx.createRadialGradient(px, py, pr * 0.2, px, py, pr);
            gl.addColorStop(0, "rgba(255, 214, 120, 0.42)");
            gl.addColorStop(1, "rgba(255, 214, 120, 0)");
            ctx.fillStyle = gl;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Bindingerne foerst, saa kuglerne daekker enderne. */
        ctx.strokeStyle = "rgba(210, 218, 228, 0.5)";
        ctx.lineWidth = Math.max(1, 0.17 * skala);
        ctx.lineCap = "round";
        ctx.beginPath();
        for (i = 0; i < b.length; i++) {
            var p1 = til(k[b[i][0]]), p2 = til(k[b[i][1]]);
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
        }
        ctx.stroke();

        for (i = 0; i < k.length; i++) {
            var p = til(k[i]);
            var r = k[i].r * skala;
            if (r < 0.7) continue;
            if (!opt.enkel && r >= 5) {
                var g = ctx.createRadialGradient(p[0] - r * 0.32, p[1] - r * 0.36, r * 0.1, p[0], p[1], r);
                g.addColorStop(0, lys(k[i].farve));
                g.addColorStop(1, k[i].farve);
                ctx.fillStyle = g;
            } else {
                ctx.fillStyle = k[i].farve;
            }
            ctx.beginPath();
            ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
            ctx.fill();
        }

        if (opt.ring) {
            ctx.strokeStyle = opt.ring;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, form.yder * skala + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        /* δ-maerkerne staar uden for det drejede system, saa de altid kan
           laeses. De kommer kun paa de store molekyler. */
        if (opt.delta && form.harPolaer && skala >= 30) {
            ctx.save();
            if (opt.alpha !== undefined) ctx.globalAlpha = opt.alpha;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for (i = 0; i < k.length; i++) {
                if (k[i].art !== "O" && k[i].art !== "Hpolaer") continue;
                var q = til(k[i]);
                var minus = k[i].art === "O";
                ctx.font = "700 " + (skala * (minus ? 0.42 : 0.30)).toFixed(1) + "px 'Segoe UI', sans-serif";
                ctx.fillStyle = minus ? "#ffffff" : "#3a3a47";
                ctx.fillText(minus ? "δ−" : "δ+", q[0], q[1]);
            }
            ctx.restore();
        }
    };

    /* En lysere udgave af en farve til hoejlyset paa kuglen. */
    function lys(hex) {
        var n = parseInt(hex.slice(1), 16);
        var r = Math.min(255, (n >> 16) + 70);
        var g = Math.min(255, ((n >> 8) & 255) + 70);
        var b = Math.min(255, (n & 255) + 70);
        return "rgb(" + r + "," + g + "," + b + ")";
    }
    M.lys = lys;

    /* ----- Tegnforklaring ------------------------------------------------ */
    /* En lille udgave af molekylet til en knap eller en forklaring.
       Tegnes centreret i (x, y) og skaleret, saa det fylder bredden b. */
    M.miniature = function (ctx, v, x, y, b) {
        var form = M.form(v);
        M.tegn(ctx, form, x, y, 0, b / (2 * form.yder), { enkel: true });
    };
}());
