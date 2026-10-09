/* =====================================================================
   fx.js - det, der sker, naar der er noget at fejre

   Et laerred over hele siden, som ikke tager imod klik:

     NK.Fx.moenter(fra, til, n)   moenter flyver fra et element til et andet
     NK.Fx.konfetti()             ved en ny titel
     NK.Fx.tal(el, tekst, klasse) et tal, der stiger op fra et element
     NK.Fx.forfrem(titel, note)   skiltet med den nye titel

   Intet her aendrer spillet. Har eleven bedt om faerre bevaegelser
   (prefers-reduced-motion), tegnes der ingen moenter og ingen konfetti.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var L = null;
    var dele = [];
    var rolig = false;
    var skiltT = 0;
    var FARVER = ["#f2c53d", "#3d9ee0", "#3fae72", "#e6892a", "#9b6bd6", "#e05446"];

    function start() {
        var c = NK.el("fx");
        if (!c) return;
        L = new NK.Laerred(c);
        try { rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { rolig = false; }
        NK.el("forfremmelse").addEventListener("click", function () { skiltT = 0; NK.el("forfremmelse").hidden = true; });
    }

    function midte(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function moenter(fra, til, n) {
        if (!L || rolig || !fra || !til) return;
        var a = midte(fra), b = midte(til);
        n = NK.klamp(n || 6, 3, 14);
        for (var i = 0; i < n; i++) {
            dele.push({
                type: "moent", t: -i * 0.06, tid: NK.r(0.55, 0.8),
                x0: a.x + NK.r(-18, 18), y0: a.y + NK.r(-10, 10), x1: b.x, y1: b.y,
                loeft: NK.r(40, 110), r: NK.r(6, 8)
            });
        }
    }

    function konfetti() {
        if (!L || rolig) return;
        var W = window.innerWidth;
        for (var i = 0; i < 110; i++) {
            dele.push({
                type: "konfetti", t: 0, tid: NK.r(2.2, 3.4),
                x: W / 2 + NK.r(-60, 60), y: window.innerHeight * 0.36,
                vx: NK.r(-420, 420), vy: NK.r(-620, -160),
                v: NK.r(0, 6), dv: NK.r(-9, 9), b: NK.r(6, 11), h: NK.r(4, 7),
                farve: NK.tilfaeldig(FARVER)
            });
        }
    }

    /* Et tal, der stiger op og forsvinder (almindeligt element, saa
       skriften er den samme som resten af siden) */
    function tal(el, tekst, klasse) {
        if (!el) return;
        var p = midte(el);
        var e = document.createElement("span");
        e.className = "fx-tal " + (klasse || "");
        e.textContent = tekst;
        e.style.left = p.x + "px";
        e.style.top = p.y + "px";
        document.body.appendChild(e);
        window.setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 1700);
    }

    function forfrem(titel, note) {
        NK.saetTekst("ff-titel", titel);
        NK.saetTekst("ff-note", note || "");
        var e = NK.el("forfremmelse");
        e.hidden = false;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
        skiltT = 3.6;
        konfetti();
    }

    function opdater(dt) {
        if (skiltT > 0) {
            skiltT -= dt;
            if (skiltT <= 0) NK.el("forfremmelse").hidden = true;
        }
        dele = dele.filter(function (p) {
            p.t += dt;
            if (p.type === "konfetti") {
                p.vy += 900 * dt;
                p.vx *= Math.pow(0.35, dt);
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.v += p.dv * dt;
            }
            return p.t < p.tid;
        });
    }

    function tegn() {
        if (!L) return;
        if (!dele.length && !L.snavset) return;
        L.tilpas();
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        L.snavset = dele.length > 0;
        dele.forEach(function (p) {
            if (p.t < 0) return;
            if (p.type === "moent") {
                var u = NK.blod(p.t / p.tid);
                var x = NK.lerp(p.x0, p.x1, u);
                var y = NK.lerp(p.y0, p.y1, u) - Math.sin(u * Math.PI) * p.loeft;
                var bredde = p.r * (0.35 + 0.65 * Math.abs(Math.cos(p.t * 9)));
                ctx.beginPath();
                ctx.ellipse(x, y, bredde, p.r, 0, 0, Math.PI * 2);
                ctx.fillStyle = "#f2c53d";
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#a87b12";
                ctx.stroke();
                return;
            }
            ctx.save();
            ctx.globalAlpha = NK.klamp((p.tid - p.t) / 0.6, 0, 1);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.v);
            ctx.fillStyle = p.farve;
            ctx.fillRect(-p.b / 2, -p.h / 2, p.b, p.h);
            ctx.restore();
        });
    }

    NK.Fx = { start: start, moenter: moenter, konfetti: konfetti, tal: tal, forfrem: forfrem, opdater: opdater, tegn: tegn,
        antal: function () { return dele.length; } };
}());
