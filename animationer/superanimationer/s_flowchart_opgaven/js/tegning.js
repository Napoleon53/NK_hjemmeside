/* =====================================================================
   Kan du løse opgaven? - tegningen
   Flowchartet som SVG på hvidt papir: kasser, pile med spidser, ordene Ja
   og Nej (som knapper ved den kasse, brikken står i), brikken, stemplet
   TILBAGE! og de tre stykker konfetti. Ved ingenting om panelet.
   ===================================================================== */

var NK = window.NK || {};
window.NK = NK;

NK.Tegning = function (svg, D, kald) {
    "use strict";

    var NS = "http://www.w3.org/2000/svg";
    var SKRIFT = "Tahoma, Verdana, \"Segoe UI\", sans-serif";
    var LUFT = 14;          // indre margen i kasserne

    var kasser = {};        // id -> { g, ramme, tekst, glod }
    var pile = {};          // id -> path
    var ord = {};           // pil-id -> { g, pille, tekst }
    var brik, brikIndre, haand;
    var effekter;

    function el(navn, attr, far) {
        var e = document.createElementNS(NS, navn);
        if (attr) for (var k in attr) e.setAttribute(k, attr[k]);
        if (far) far.appendChild(e);
        return e;
    }

    function punkterTilD(p) {
        return p.map(function (q, i) { return (i ? "L" : "M") + q[0] + " " + q[1]; }).join(" ");
    }

    /* ---------------------------------------------------------------
       OPBYGNING
       --------------------------------------------------------------- */
    function byg() {
        var v = D.VIEW;
        svg.setAttribute("viewBox", v.join(" "));
        svg.setAttribute("font-family", SKRIFT);

        var defs = el("defs", null, svg);
        ["blaek", "frem", "tilbage", "peg"].forEach(function (navn) {
            var m = el("marker", {
                id: "spids-" + navn, viewBox: "0 0 10 10", refX: 8.5, refY: 5,
                markerWidth: 15, markerHeight: 15, markerUnits: "userSpaceOnUse", orient: "auto"
            }, defs);
            el("path", { d: "M0 0.6 L10 5 L0 9.4 Z", "class": "spids " + navn }, m);
        });

        el("rect", { x: v[0], y: v[1], width: v[2], height: v[3], "class": "papirflade" }, svg);

        var gPile = el("g", { "class": "pile" }, svg);
        var gKasser = el("g", { "class": "kasser" }, svg);
        var gOrd = el("g", { "class": "ordlag" }, svg);
        var gBrik = el("g", { "class": "briklag" }, svg);
        effekter = el("g", { "class": "effekter" }, svg);

        D.PILE.forEach(function (p) {
            var sti = el("path", { d: punkterTilD(p.p), "class": "pil", "marker-end": "url(#spids-blaek)" }, gPile);
            sti.dataset.pil = p.id;
            pile[p.id] = sti;
        });

        Object.keys(D.KASSER).forEach(function (id) { bygKasse(id, gKasser); });

        D.PILE.forEach(function (p) {
            if (!p.ord) return;
            var g = el("g", { "class": "ord", transform: "translate(" + p.ov[0] + " " + p.ov[1] + ")" }, gOrd);
            g.dataset.pil = p.id;
            var bredde = p.ord === "Ja" ? 46 : 56;
            var pille = el("rect", { x: -bredde / 2, y: -21, width: bredde, height: 29, rx: 14.5, "class": "pille" }, g);
            var t = el("text", { x: 0, y: 0, "text-anchor": "middle", "class": "ordtekst" }, g);
            t.textContent = p.ord;
            g.addEventListener("click", function () { if (g.classList.contains("aktiv")) kald.ord(p.id); });
            g.addEventListener("mouseenter", function () { if (g.classList.contains("aktiv")) peg(p.id, true); });
            g.addEventListener("mouseleave", function () { peg(p.id, false); });
            ord[p.id] = { g: g, pille: pille, tekst: t };
        });

        bygBrik(gBrik);
        tilpasTekst();
    }

    function bygKasse(id, far) {
        var k = D.KASSER[id];
        var g = el("g", { "class": "kasse " + k.slags }, far);
        g.dataset.id = id;
        var rx = k.stor ? 20 : 14;

        var glod = el("rect", { x: k.x - 7, y: k.y - 7, width: k.w + 14, height: k.h + 14, rx: rx + 6, "class": "glod" }, g);
        var ramme = el("rect", { x: k.x, y: k.y, width: k.w, height: k.h, rx: rx, "class": "ramme" + (k.kant ? " " + k.kant : "") }, g);
        if (k.kant === "dobbelt") {
            el("rect", { x: k.x + 6, y: k.y + 6, width: k.w - 12, height: k.h - 12, rx: rx - 4, "class": "ramme indre" }, g);
        }
        var tekst = el("text", { "class": "kassetekst" + (k.stor ? " stor" : "") }, g);
        g.addEventListener("click", function () { kald.kasse(id); });
        kasser[id] = { g: g, ramme: ramme, tekst: tekst, glod: glod };
    }

    /* Teksten sættes linje for linje. Er en linje for bred til kassen
       (anden skrift end Tahoma), bliver skriften i den kasse mindre. */
    function saetTekst(id, skala) {
        var k = D.KASSER[id];
        var t = kasser[id].tekst;
        while (t.firstChild) t.removeChild(t.firstChild);

        var fs = (k.stor ? 38 : 20) * skala;
        var fsLille = 13.5 * skala;
        var lh = fs * 1.27;
        var lhLille = fsLille * 1.32;
        var lille = k.lille || [];
        var hoejde = k.linjer.length * lh + (lille.length ? 5 + lille.length * lhLille : 0);
        var y = k.y + (k.h - hoejde) / 2 + fs * 0.93;
        var x = k.midt ? k.x + k.w / 2 : k.x + LUFT + 2;

        t.setAttribute("text-anchor", k.midt ? "middle" : "start");
        k.linjer.forEach(function (linje, i) {
            var ts = el("tspan", { x: x, y: y + i * lh, "font-size": fs.toFixed(2) }, t);
            ts.textContent = linje;
        });
        var yl = y + (k.linjer.length - 1) * lh + 5 + lhLille;
        lille.forEach(function (linje, i) {
            var ts = el("tspan", { x: x, y: yl + i * lhLille, "font-size": fsLille.toFixed(2), "class": "lille" }, t);
            ts.textContent = linje;
        });
    }

    function tilpasTekst() {
        Object.keys(D.KASSER).forEach(function (id) {
            var k = D.KASSER[id];
            saetTekst(id, 1);
            var bredest = 0;
            try {
                Array.prototype.forEach.call(kasser[id].tekst.childNodes, function (ts) {
                    bredest = Math.max(bredest, ts.getComputedTextLength());
                });
            } catch (e) { bredest = 0; }
            var plads = k.w - 2 * LUFT;
            if (bredest > plads) saetTekst(id, Math.max(0.7, plads / bredest));
        });
    }

    function bygBrik(far) {
        brik = el("g", { "class": "brik" }, far);
        brikIndre = el("g", null, brik);
        el("ellipse", { cx: 0, cy: -1, rx: 13, ry: 3.5, "class": "brik-skygge" }, brikIndre);
        el("path", { d: "M-14 -3 Q-14 -9 -10 -9 L10 -9 Q14 -9 14 -3 Q14 1 0 1 Q-14 1 -14 -3 Z", "class": "brik-krop" }, brikIndre);
        el("path", { d: "M-10 -9 Q-9 -17 -5.5 -22 L5.5 -22 Q9 -17 10 -9 Z", "class": "brik-krop" }, brikIndre);
        el("ellipse", { cx: 0, cy: -23, rx: 8, ry: 2.6, "class": "brik-krop" }, brikIndre);
        el("circle", { cx: 0, cy: -32, r: 8.5, "class": "brik-krop" }, brikIndre);
        el("ellipse", { cx: -2.8, cy: -35, rx: 2.6, ry: 1.8, "class": "brik-glans" }, brikIndre);
        haand = el("text", { x: 9, y: -38, "class": "haand", "font-size": 22 }, brikIndre);
        haand.textContent = "✋";
        haand.style.display = "none";
        brik.addEventListener("click", function () { if (kald.brik) kald.brik(); });
    }

    /* ---------------------------------------------------------------
       TILSTAND
       --------------------------------------------------------------- */
    function saetTilstand(s) {
        Object.keys(kasser).forEach(function (id) {
            var g = kasser[id].g;
            g.classList.toggle("nu", id === s.node && s.fase !== "flytter");
            g.classList.toggle("besoegt", !!s.besoegt[id]);
            g.classList.toggle("naaet", id === D.SLUT && s.fase === "slut");
        });
        Object.keys(pile).forEach(function (id) {
            var st = s.pile[id];
            var sti = pile[id];
            sti.classList.toggle("frem", st === "frem");
            sti.classList.toggle("tilbage", st === "tilbage");
            sti.setAttribute("marker-end", "url(#spids-" + (st || "blaek") + ")");
        });
        var aktiv = s.fase === "spm" && D.KASSER[s.node].slags === "spm";
        Object.keys(ord).forEach(function (pid) {
            var p = D.PILE.filter(function (x) { return x.id === pid; })[0];
            var er = aktiv && p.fra === s.node;
            ord[pid].g.classList.toggle("aktiv", er);
            ord[pid].g.classList.toggle("valgt", !!(s.udf && s.udf.pilId === pid && s.fase === "udfordring"));
            if (!er) peg(pid, false);
        });
        haand.style.display = s.haand ? "" : "none";
    }

    /* Pilen lyser op, mens musen holdes over Ja eller Nej */
    function peg(pid, til) {
        var sti = pile[pid];
        if (!sti) return;
        sti.classList.toggle("peg", til);
        if (til) sti.setAttribute("marker-end", "url(#spids-peg)");
        else {
            var st = sti.classList.contains("tilbage") ? "tilbage" : sti.classList.contains("frem") ? "frem" : "blaek";
            sti.setAttribute("marker-end", "url(#spids-" + st + ")");
        }
    }

    function hvile(id) {
        var k = D.KASSER[id];
        return k.brik ? [k.brik[0], k.brik[1]] : [k.x + 26, k.y];
    }

    /* Vejen, brikken følger: fra hvilestedet over pilen til hvilestedet.
       Første og sidste stykke er hop (brikken springer over kassen). */
    function rute(flyt) {
        var start = hvile(flyt.fra);
        var slut = hvile(flyt.til);
        if (!flyt.pil) return [start, slut];
        var p = D.PILE.filter(function (x) { return x.id === flyt.pil; })[0].p.slice();
        if (flyt.baglaens) p.reverse();
        return [start].concat(p, [slut]);
    }

    function saetBrik(x, y, vinkel) {
        brik.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(1.12)");
        brikIndre.setAttribute("transform", vinkel ? "rotate(" + vinkel.toFixed(1) + " 0 -20)" : "");
    }

    /* ---------------------------------------------------------------
       EFFEKTER
       --------------------------------------------------------------- */
    /* Stemplet lander midt på den kasse, brikken blev sendt til */
    function stempel(id) {
        var k = D.KASSER[id];
        var g = el("g", { transform: "translate(" + (k.x + k.w / 2) + " " + (k.y + k.h / 2) + ")" }, effekter);
        var indre = el("g", { "class": "stempel" }, g);
        el("rect", { x: -78, y: -24, width: 156, height: 44, rx: 6, "class": "stempel-ramme" }, indre);
        var t = el("text", { x: 0, y: 10, "text-anchor": "middle", "class": "stempel-tekst" }, indre);
        t.textContent = D.TEKST.stempel;
        setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 2300);
    }

    function ryst() {
        brik.classList.remove("ryster");
        void brik.getBBox();
        brik.classList.add("ryster");
        setTimeout(function () { brik.classList.remove("ryster"); }, 600);
    }

    function vrik(id) {
        var g = kasser[id].g;
        g.classList.remove("vrikker");
        void g.getBBox();
        g.classList.add("vrikker");
        setTimeout(function () { g.classList.remove("vrikker"); }, 700);
    }

    /* Konfetti er dyrt. Tre stykker. */
    function konfetti() {
        fjernKonfetti();
        var k = D.KASSER[D.SLUT];
        var farver = ["#e05446", "#3d9ee0", "#f2c53d"];
        [0.28, 0.52, 0.76].forEach(function (f, i) {
            var g = el("g", { "class": "konfetti", transform: "translate(" + (k.x + k.w * f) + " " + (k.y - 4) + ")" }, effekter);
            var r = el("rect", { x: -5, y: -9, width: 10, height: 16, rx: 1.5, fill: farver[i], "class": "stykke s" + i }, g);
            r.style.animationDelay = (i * 0.35) + "s";
        });
    }

    function fjernKonfetti() {
        Array.prototype.slice.call(effekter.querySelectorAll(".konfetti")).forEach(function (g) { g.parentNode.removeChild(g); });
    }

    function ryd() {
        while (effekter.firstChild) effekter.removeChild(effekter.firstChild);
    }

    byg();

    return {
        saetTilstand: saetTilstand,
        tilpasTekst: tilpasTekst,
        peg: peg,
        hvile: hvile,
        rute: rute,
        saetBrik: saetBrik,
        stempel: stempel,
        ryst: ryst,
        vrik: vrik,
        konfetti: konfetti,
        ryd: ryd,
        kasse: function (id) { return kasser[id]; }
    };
};
