/* =====================================================================
   svg.js - smaa hjaelpere til figurerne

   Figurerne er SVG, ikke canvas: fagordene er pladser, man kan traekke
   ord hen paa, og hele figuren skal kunne skaleres skarpt. Farverne er
   Kemibogens (atommodel, grundstofkort, stofinddeling og periodesystem).
   Animationerne bruger browserens egen element.animate, saa der er
   ingen tegneloekke, og intet bevaeger sig, naar et lag er bygget.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    var NS = "http://www.w3.org/2000/svg";
    var SV = NK.SV = {};

    /* Bogens farver */
    SV.F = {
        tekst:      "#1f2a33",
        svag:       "#5c6873",
        mat:        "#8a949e",
        teal:       "#1d7a72",
        tealLys:    "#d9efeb",
        metal:      "#f6e0a6",
        metalKant:  "#d6b55a",
        ikke:       "#a9ddd2",
        ikkeKant:   "#5fb3a1",
        halv:       "#dde1e6",
        halvKant:   "#99a2ac",
        spoeg:      "#b4bcc5",
        spoegFyld:  "#eef1f4",
        gul:        "#f2c53d",
        gulMoerk:   "#c99a12",
        groen:      "#3fae72",
        roed:       "#d9433a",
        blaa:       "#2f63c9",
        ark:        "#fcfcfa"
    };

    SV.el = function (tag, attr, foraelder) {
        var e = document.createElementNS(NS, tag);
        if (attr) {
            for (var k in attr) {
                if (Object.prototype.hasOwnProperty.call(attr, k) && attr[k] !== undefined && attr[k] !== null) {
                    e.setAttribute(k, attr[k]);
                }
            }
        }
        if (foraelder) foraelder.appendChild(e);
        return e;
    };

    SV.g = function (foraelder, attr) {
        return SV.el("g", attr || {}, foraelder);
    };

    /* Tekst. tekst kan indeholde _2 (saenket) og ^+ (haevet), som i
       formler: "H_2O", "Na^+", "2 H_2(g)". */
    SV.tekst = function (foraelder, x, y, tekst, attr) {
        var a = {
            x: x, y: y,
            "font-size": 16,
            "font-family": "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
            fill: SV.F.tekst,
            "text-anchor": "middle"
        };
        if (attr) for (var k in attr) if (Object.prototype.hasOwnProperty.call(attr, k)) a[k] = attr[k];
        var t = SV.el("text", a, foraelder);
        SV.formelInd(t, String(tekst));
        return t;
    };

    /* Fylder et text-element med tspans, saa _2 bliver saenket og ^+ haevet */
    SV.formelInd = function (t, s) {
        while (t.firstChild) t.removeChild(t.firstChild);
        var re = /([_^])(\{[^}]*\}|[0-9+−\-]+)/g;
        var sidst = 0, m, skift = 0;
        function stykke(tekst, slags) {
            if (!tekst) return;
            var ts = SV.el("tspan", {}, t);
            if (slags === "_") {
                ts.setAttribute("font-size", "68%");
                ts.setAttribute("dy", "0.32em");
                skift = -0.32;
            } else if (slags === "^") {
                ts.setAttribute("font-size", "68%");
                ts.setAttribute("dy", "-0.55em");
                skift = 0.55;
            } else if (skift) {
                /* tilbage paa linjen; dy maales i den foregaaende tspans skrift */
                ts.setAttribute("dy", (skift * 0.68) + "em");
                skift = 0;
            }
            ts.textContent = tekst;
        }
        while ((m = re.exec(s)) !== null) {
            stykke(s.slice(sidst, m.index), "");
            stykke(m[2].replace(/[{}]/g, ""), m[1]);
            sidst = re.lastIndex;
        }
        stykke(s.slice(sidst), "");
    };

    /* ----- Faelles defs: kugler med lys og skygge, blod skygge ---------- */
    var KUGLER = {
        proton:   ["#ff9a8c", "#e2483b", "#9c2a20"],
        neutron:  ["#ffffff", "#c9cdd3", "#7c838c"],
        elektron: ["#9cc6ff", "#3d7be0", "#1d4aa0"],
        valens:   ["#7aa6f0", "#1f4fb8", "#0f2a70"],
        H:        ["#ffffff", "#e3e6ea", "#9aa1aa"],
        O:        ["#ff9585", "#e0443a", "#962a20"],
        C:        ["#8d939b", "#4b5159", "#25292e"],
        guld:     ["#fff1b8", "#f0c23e", "#a87b0c"],
        Cl:       ["#d8f59a", "#8fcf3c", "#4f8a14"]
    };
    SV.KUGLER = KUGLER;

    /* Farveforloeb og skygger staar i ét faelles, usynligt svg-element.
       Hver figur kan ikke have sine egne: id'erne ville vaere ens, og en
       skjult fane (display: none) tager sine forloeb med sig i skjul. */
    SV.defs = function () {
        if (document.getElementById("faelles-defs")) return null;
        var rod = SV.el("svg", { id: "faelles-defs", width: 0, height: 0, "aria-hidden": "true", focusable: "false" });
        rod.style.position = "absolute";
        rod.style.width = "0";
        rod.style.height = "0";
        rod.style.overflow = "hidden";
        document.body.insertBefore(rod, document.body.firstChild);
        var d = SV.el("defs", {}, rod);
        Object.keys(KUGLER).forEach(function (navn) {
            var f = KUGLER[navn];
            var rg = SV.el("radialGradient", { id: "k-" + navn, cx: "36%", cy: "32%", r: "70%" }, d);
            SV.el("stop", { offset: "0%", "stop-color": f[0] }, rg);
            SV.el("stop", { offset: "55%", "stop-color": f[1] }, rg);
            SV.el("stop", { offset: "100%", "stop-color": f[2] }, rg);
        });
        /* Blod skygge under ting */
        var fs = SV.el("filter", { id: "skygge", x: "-30%", y: "-30%", width: "160%", height: "170%" }, d);
        SV.el("feDropShadow", { dx: 0, dy: 2, stdDeviation: 2.2, "flood-color": "#1b2633", "flood-opacity": 0.22 }, fs);
        var fs2 = SV.el("filter", { id: "skygge-stor", x: "-20%", y: "-20%", width: "140%", height: "150%" }, d);
        SV.el("feDropShadow", { dx: 0, dy: 4, stdDeviation: 5, "flood-color": "#1b2633", "flood-opacity": 0.18 }, fs2);
        /* Atomets sky */
        var sky = SV.el("radialGradient", { id: "sky", cx: "50%", cy: "50%", r: "50%" }, d);
        SV.el("stop", { offset: "0%", "stop-color": "#dbe8ff", "stop-opacity": 0.9 }, sky);
        SV.el("stop", { offset: "70%", "stop-color": "#e9f1ff", "stop-opacity": 0.55 }, sky);
        SV.el("stop", { offset: "100%", "stop-color": "#f4f8ff", "stop-opacity": 0 }, sky);
        /* Glas */
        var glas = SV.el("linearGradient", { id: "glas", x1: "0", y1: "0", x2: "1", y2: "0" }, d);
        SV.el("stop", { offset: "0%", "stop-color": "#c9d6e2", "stop-opacity": 0.75 }, glas);
        SV.el("stop", { offset: "18%", "stop-color": "#ffffff", "stop-opacity": 0.55 }, glas);
        SV.el("stop", { offset: "60%", "stop-color": "#e6eef5", "stop-opacity": 0.35 }, glas);
        SV.el("stop", { offset: "100%", "stop-color": "#b8c7d4", "stop-opacity": 0.75 }, glas);
        var vand = SV.el("linearGradient", { id: "vand", x1: "0", y1: "0", x2: "0", y2: "1" }, d);
        SV.el("stop", { offset: "0%", "stop-color": "#a8d4f2", "stop-opacity": 0.85 }, vand);
        SV.el("stop", { offset: "100%", "stop-color": "#5ea6dc", "stop-opacity": 0.9 }, vand);
        /* Luppens indre */
        var lup = SV.el("radialGradient", { id: "lup", cx: "50%", cy: "45%", r: "60%" }, d);
        SV.el("stop", { offset: "0%", "stop-color": "#ffffff" }, lup);
        SV.el("stop", { offset: "100%", "stop-color": "#eaf0f6" }, lup);
        return d;
    };

    /* En kugle med lys og skygge; tegn er "+" eller "−" eller et symbol */
    SV.kugle = function (foraelder, cx, cy, r, slags, tegn, attr) {
        var g = SV.g(foraelder, attr);
        SV.el("circle", { cx: cx, cy: cy, r: r, fill: "url(#k-" + slags + ")", stroke: KUGLER[slags][2], "stroke-width": Math.max(0.8, r * 0.07) }, g);
        if (tegn) SV.el("ellipse", { cx: cx - r * 0.38, cy: cy - r * 0.5, rx: r * 0.26, ry: r * 0.14, fill: "#ffffff", "fill-opacity": 0.45 }, g);
        else SV.el("ellipse", { cx: cx - r * 0.3, cy: cy - r * 0.36, rx: r * 0.32, ry: r * 0.2, fill: "#ffffff", "fill-opacity": 0.5 }, g);
        if (tegn) {
            var lys = slags === "neutron" || slags === "H" || slags === "guld" || slags === "Cl";
            SV.tekst(g, cx, cy + r * 0.36, tegn, {
                "font-size": r * (tegn.length > 1 ? 0.85 : 1.15),
                "font-weight": 700,
                fill: lys ? "#3a3f45" : "#ffffff"
            });
        }
        return g;
    };

    /* Tekstens bredde i figurens enheder (samme skrift som SV.tekst) */
    var maaler = null;
    NK.tekstBredde = function (tekst, stoerrelse, vaegt) {
        if (!maaler) maaler = document.createElement("canvas").getContext("2d");
        maaler.font = (vaegt || 400) + " " + stoerrelse + "px Segoe UI, Tahoma, Geneva, Verdana, sans-serif";
        return maaler.measureText(tekst).width;
    };

    /* Spoegelset af en kugle: en stiplet ring */
    SV.spoegKugle = function (foraelder, cx, cy, r) {
        return SV.el("circle", { cx: cx, cy: cy, r: r, fill: SV.F.spoegFyld, stroke: SV.F.spoeg, "stroke-width": 1.4, "stroke-dasharray": "3 2.5" }, foraelder);
    };

    /* ----- Animationer ------------------------------------------------- */
    function kan(el) { return el && typeof el.animate === "function" && !SV.stille; }

    /* Saettes til true af selvtesten og ved spring, saa alt bygges straks */
    SV.stille = false;

    SV.pop = function (el, forsinkelse, varighed) {
        if (!kan(el)) return;
        el.classList.add("anim");
        el.animate([
            { transform: "scale(0.2)", opacity: 0 },
            { transform: "scale(1.12)", opacity: 1, offset: 0.65 },
            { transform: "scale(1)", opacity: 1 }
        ], { duration: varighed || 480, delay: forsinkelse || 0, easing: "ease-out", fill: "backwards" });
    };

    SV.fade = function (el, forsinkelse, varighed) {
        if (!kan(el)) return;
        el.animate([{ opacity: 0 }, { opacity: 1 }],
            { duration: varighed || 450, delay: forsinkelse || 0, easing: "ease-out", fill: "backwards" });
    };

    /* En streg eller ring tegnes frem */
    SV.streg = function (el, forsinkelse, varighed) {
        if (!kan(el) || typeof el.getTotalLength !== "function") return;
        var l = 0;
        try { l = el.getTotalLength(); } catch (e) { l = 0; }
        if (!l) { SV.fade(el, forsinkelse, varighed); return; }
        el.animate([
            { strokeDasharray: l + " " + l, strokeDashoffset: l },
            { strokeDasharray: l + " " + l, strokeDashoffset: 0 }
        ], { duration: varighed || 700, delay: forsinkelse || 0, easing: "ease-in-out", fill: "backwards" });
    };

    /* Glider ind fra (dx, dy) */
    SV.glid = function (el, dx, dy, forsinkelse, varighed) {
        if (!kan(el)) return;
        el.animate([
            { transform: "translate(" + dx + "px," + dy + "px)", opacity: 0 },
            { transform: "translate(0,0)", opacity: 1 }
        ], { duration: varighed || 600, delay: forsinkelse || 0, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    };

    /* Et kort lysglimt (fx en kugle, der taelles) */
    SV.blink = function (el, forsinkelse) {
        if (!kan(el)) return;
        el.classList.add("anim");
        el.animate([
            { transform: "scale(1)", filter: "brightness(1)" },
            { transform: "scale(1.25)", filter: "brightness(1.35)", offset: 0.4 },
            { transform: "scale(1)", filter: "brightness(1)" }
        ], { duration: 420, delay: forsinkelse || 0, easing: "ease-out" });
    };

    /* Farven skifter, fx et felt i det periodiske system */
    SV.farve = function (el, fra, til, forsinkelse, varighed) {
        if (!kan(el)) return;
        el.animate([{ fill: fra }, { fill: til }],
            { duration: varighed || 380, delay: forsinkelse || 0, easing: "ease-out", fill: "backwards" });
    };

    /* Tekst, der taelles op til tallet, fx 12,01 */
    SV.taelOp = function (t, slut, decimaler, forsinkelse, varighed, efter) {
        var tekst = function (v) { return v.toFixed(decimaler).replace(".", ",") + (efter || ""); };
        if (SV.stille) { t.textContent = tekst(slut); return; }
        var start = null, d = varighed || 700;
        t.textContent = tekst(0);
        window.setTimeout(function () {
            function trin(ts) {
                if (start === null) start = ts;
                var x = Math.min(1, (ts - start) / d);
                t.textContent = tekst(slut * (1 - Math.pow(1 - x, 3)));
                if (x < 1) window.requestAnimationFrame(trin);
            }
            window.requestAnimationFrame(trin);
        }, forsinkelse || 0);
    };
}());
