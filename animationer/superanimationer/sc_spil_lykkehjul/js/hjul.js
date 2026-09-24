/* =====================================================================
   hjul.js - hjulet: tegnet som SVG ud fra felterne i data.js

   new NK.Hjul(rod, felter, valg) bygger hjulet i elementet rod.
     hjul.drej({ felt, tid, tempo }, faerdig)
       drejer hjulet og kalder faerdig(felt), naar det staar stille.
       felt er valgfrit (til selvtesten); ellers er alle felter lige
       sandsynlige. Hjulet er ikke snydt.
     hjul.farve(css)   viserens farve (holdets)

   Felt 0 staar oeverst, og saa gaar det med uret. Hjulet drejer med
   uret, og vinklen phi er, hvor langt det er drejet. Feltet under viseren
   er det, hvis midte staar ved -phi.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SVGNS = "http://www.w3.org/2000/svg";
    var R = 470;

    function el(navn, attr, tekst) {
        var e = document.createElementNS(SVGNS, navn);
        Object.keys(attr || {}).forEach(function (k) { e.setAttribute(k, attr[k]); });
        if (tekst !== undefined) e.textContent = tekst;
        return e;
    }

    function punkt(grader, r) {
        var v = grader * Math.PI / 180;
        return (r * Math.sin(v)).toFixed(2) + " " + (-r * Math.cos(v)).toFixed(2);
    }

    function Hjul(rod, felter, valg) {
        valg = valg || {};
        this.rod = rod;
        this.felter = felter;
        this.N = felter.length;
        this.a = 360 / this.N;
        this.phi = valg.start === undefined ? -this.a * 0.35 : valg.start;
        this.koerer = false;
        this.byg(valg);
        this.saetVinkel(this.phi);
    }

    var P = Hjul.prototype;

    P.byg = function (valg) {
        var a = this.a, N = this.N;
        var svg = el("svg", { viewBox: "-520 -560 1040 1080", class: "hjul-svg", "aria-hidden": "true" });
        var defs = el("defs");
        defs.innerHTML =
            '<radialGradient id="nav-' + valg.id + '" cx="0.4" cy="0.35" r="0.75">'
            + '<stop offset="0" stop-color="#fff3a8"/><stop offset="0.55" stop-color="#f2b705"/><stop offset="1" stop-color="#9a6a00"/></radialGradient>'
            + '<radialGradient id="glans-' + valg.id + '" cx="0.5" cy="0.5" r="0.5">'
            + '<stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.28"/></radialGradient>';
        svg.appendChild(defs);

        /* Kanten med paerer */
        svg.appendChild(el("circle", { r: R + 34, fill: "#1b1f4a", stroke: "#0a0c24", "stroke-width": 6 }));
        var paerer = el("g", { class: "paerer" });
        for (var p = 0; p < 36; p++) {
            var v = p * 10 * Math.PI / 180;
            paerer.appendChild(el("circle", { cx: ((R + 18) * Math.sin(v)).toFixed(1), cy: (-(R + 18) * Math.cos(v)).toFixed(1), r: 7, class: p % 2 ? "paere b" : "paere a" }));
        }
        svg.appendChild(paerer);

        var drej = el("g", { class: "hjul-drej" });
        this.drejEl = drej;
        var self = this;
        this.felter.forEach(function (f, i) {
            var g = el("g", { transform: "rotate(" + (i * a) + ")" });
            g.appendChild(el("path", {
                d: "M 0 0 L " + punkt(-a / 2, R) + " A " + R + " " + R + " 0 0 1 " + punkt(a / 2, R) + " Z",
                fill: f.farve, stroke: "#20242e", "stroke-width": 2.5
            }));
            self.tekst(g, f, N);
            drej.appendChild(g);
        });
        /* Pindene mellem felterne */
        for (var k = 0; k < N; k++) {
            var vk = (k * a + a / 2) * Math.PI / 180;
            drej.appendChild(el("circle", { cx: ((R - 10) * Math.sin(vk)).toFixed(1), cy: (-(R - 10) * Math.cos(vk)).toFixed(1), r: 7, fill: "#d9dde6", stroke: "#555a66", "stroke-width": 2 }));
        }
        drej.appendChild(el("circle", { r: R, fill: "url(#glans-" + valg.id + ")", "pointer-events": "none" }));
        /* Navet */
        drej.appendChild(el("circle", { r: 118, fill: "#0e1a52", stroke: "#f2c53d", "stroke-width": 8 }));
        drej.appendChild(el("circle", { r: 92, fill: "url(#nav-" + valg.id + ")" }));
        if (valg.nav) {
            drej.appendChild(el("text", { x: 0, y: 0, class: "hjul-nav", "text-anchor": "middle", "dominant-baseline": "central" }, valg.nav));
        }
        svg.appendChild(drej);

        /* Viseren: en trekant oeverst i holdets farve */
        var viser = el("g", { class: "hjul-viser" });
        viser.appendChild(el("path", { d: "M -34 -548 L 34 -548 L 0 -455 Z", class: "viser-krop", stroke: "#ffffff", "stroke-width": 5, "stroke-linejoin": "round" }));
        viser.appendChild(el("circle", { cx: 0, cy: -530, r: 9, fill: "#ffffff" }));
        this.viser = viser;
        svg.appendChild(viser);

        this.rod.innerHTML = "";
        this.rod.appendChild(svg);
        this.svg = svg;
    };

    /* Beloeb staar som stablede cifre fra kanten og ind, ord staar langs
       radius. Alt er drejet med feltet. */
    P.tekst = function (g, f, N) {
        var stor = Math.min(78, 2 * Math.PI * R / N * 0.62);
        if (f.type === "vaerdi") {
            var cifre = String(f.v).split("");
            var trin = stor * 0.86;
            cifre.forEach(function (c, i) {
                g.appendChild(el("text", {
                    x: 0, y: (-R + 42 + stor * 0.5 + i * trin).toFixed(1), class: "hjul-ciffer",
                    "font-size": stor.toFixed(1), fill: f.skrift, "text-anchor": "middle", "dominant-baseline": "central"
                }, c));
            });
        } else if (f.type === "kuvert") {
            g.appendChild(el("text", {
                x: 0, y: (-R + 90).toFixed(1), class: "hjul-kuvert", "font-size": (stor * 0.9).toFixed(1),
                fill: f.skrift, "text-anchor": "middle", "dominant-baseline": "central"
            }, f.tekst));
        } else {
            var t = el("text", {
                x: 0, y: 0, class: "hjul-ord", "font-size": (stor * 0.62).toFixed(1), fill: f.skrift,
                "text-anchor": "middle", "dominant-baseline": "central",
                transform: "translate(0 " + (-R * 0.6).toFixed(1) + ") rotate(90)"
            }, f.tekst);
            g.appendChild(t);
        }
    };

    P.saetVinkel = function (phi) {
        this.phi = phi;
        this.drejEl.setAttribute("transform", "rotate(" + phi.toFixed(3) + ")");
    };

    /* Feltet under viseren ved vinklen phi */
    P.feltVed = function (phi) {
        var v = ((-phi % 360) + 360) % 360;
        return Math.round(v / this.a) % this.N;
    };

    P.farve = function (css) {
        this.svg.style.setProperty("--viser", css);
    };

    /* Viseren vipper, naar en pind passerer */
    P.vip = function (styrke) {
        var v = this.viser;
        v.classList.remove("vip");
        void v.getBoundingClientRect();
        v.style.setProperty("--vip", (-6 - 12 * styrke).toFixed(1) + "deg");
        v.classList.add("vip");
    };

    P.drej = function (valg, faerdig) {
        valg = valg || {};
        if (this.koerer) return false;
        var a = this.a, N = this.N;
        var maal = valg.felt === undefined ? Math.floor(Math.random() * N) : valg.felt;
        /* Et sted inde i feltet, ikke helt ude ved en pind */
        var inde = (Math.random() * 2 - 1) * a * 0.36;
        var phi0 = this.phi;
        var omgange = 3 + Math.floor(Math.random() * 3);
        var slutMod = -(maal * a + inde);
        var phi1 = phi0 + omgange * 360;
        phi1 += ((slutMod - phi1) % 360 + 360) % 360;
        var tid = (valg.tid || 5.3) * 1000 * (valg.tempo || 1);
        var t0 = performance.now();
        var self = this;
        var sidstePind = Math.floor((phi0 + a / 2) / a);
        this.koerer = true;
        this.svg.classList.add("koerer");
        var slut = false;

        /* Staar fanen i baggrunden, kommer der ingen billeder. Saa goeres
           drejet faerdigt af et ur, saa spillet ikke haenger. */
        var sikring = setTimeout(function () { trin(t0 + tid); }, tid + 400);

        function trin(nu) {
            if (slut) return;
            var x = NK.klamp((nu - t0) / tid, 0, 1);
            var e = 1 - Math.pow(1 - x, 3);
            var phi = phi0 + (phi1 - phi0) * e;
            self.saetVinkel(phi);
            var pind = Math.floor((phi + a / 2) / a);
            if (pind !== sidstePind) {
                sidstePind = pind;
                var fart = 3 * Math.pow(1 - x, 2);
                if (valg.tik) valg.tik(NK.klamp(fart, 0, 1));
                self.vip(NK.klamp(fart, 0, 1));
            }
            if (x < 1) {
                window.requestAnimationFrame(trin);
            } else {
                slut = true;
                clearTimeout(sikring);
                self.koerer = false;
                self.svg.classList.remove("koerer");
                var felt = self.feltVed(phi1);
                if (faerdig) faerdig(felt);
            }
        }
        window.requestAnimationFrame(trin);
        return true;
    };

    NK.Hjul = Hjul;
}());
