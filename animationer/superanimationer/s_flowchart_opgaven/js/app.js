/* =====================================================================
   Kan du løse opgaven? - siden
   Binder kernen og tegningen sammen: panelet med kassen, udfordringen og
   kommentaren, brikkens tur ad pilene, kameraet, der følger brikken, og
   genvejene. NK.app bruges af _selvtest.html.
   ===================================================================== */

(function () {
    "use strict";

    var D = NK.D;
    var K = NK.Kerne(D);

    function $(id) { return document.getElementById(id); }

    var scene = $("scene");
    var papir = $("papir");
    var svg = $("diagram");
    var hovedkort = $("hovedkort");
    var el = {
        kicker: $("kicker"),
        paastand: $("paastand"),
        titel: $("kasse-titel"),
        lille: $("kasse-lille"),
        trin: $("trin"),
        valg: $("valg"),
        kommentar: $("kommentar"),
        kHoved: $("k-hoved"),
        kTekst: $("k-tekst"),
        tilbage: $("antal-tilbage"),
        besvaret: $("antal-besvaret"),
        heleknap: $("heleknap"),
        hjaelp: $("hjaelp")
    };

    var bevaegelse = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.05 : 1;

    var T = NK.Tegning(svg, D, {
        ord: function (pid) { vaelgOrd(D.PILE.filter(function (p) { return p.id === pid; })[0].ord); },
        kasse: klikKasse,
        brik: null
    });

    /* ---------------------------------------------------------------
       KAMERA: flowchartet fylder scenens bredde og ruller med brikken.
       "Vis hele" viser hele flowchartet på én gang.
       --------------------------------------------------------------- */
    var visHele = false;
    var skala = 1;
    var kamera = { maal: null, fri: false };
    var POLSTRING = 16;

    function tilpas() {
        var v = D.VIEW;
        var bw = Math.max(200, scene.clientWidth - 2 * POLSTRING);
        var bh = Math.max(200, scene.clientHeight - 2 * POLSTRING);
        skala = visHele ? Math.min(bw / v[2], bh / v[3]) : Math.min(bw / v[2], 1.3);
        svg.setAttribute("width", Math.round(v[2] * skala));
        svg.setAttribute("height", Math.round(v[3] * skala));
        papir.classList.toggle("hele", visHele);
        el.heleknap.textContent = visHele ? "Zoom ind" : "Vis hele";
        el.heleknap.classList.toggle("taendt", visHele);
    }

    function sigteMod(y) {
        var v = D.VIEW;
        kamera.maal = (y - v[1]) * skala + POLSTRING - scene.clientHeight * 0.42;
        kamera.fri = false;
    }

    function kameraSkridt() {
        if (kamera.fri || kamera.maal === null) return;
        var maks = scene.scrollHeight - scene.clientHeight;
        var maal = Math.max(0, Math.min(maks, kamera.maal));
        var nu = scene.scrollTop;
        var d = maal - nu;
        if (Math.abs(d) < 1) { scene.scrollTop = maal; kamera.maal = null; return; }
        scene.scrollTop = nu + d * (bevaegelse < 1 ? 1 : 0.14);
    }

    ["wheel", "touchstart", "mousedown"].forEach(function (h) {
        scene.addEventListener(h, function () { kamera.fri = true; kamera.maal = null; }, { passive: true });
    });

    /* ---------------------------------------------------------------
       BRIKKEN PÅ VEJ
       --------------------------------------------------------------- */
    var brik = { x: 0, y: 0 };
    var tur = null;   // { pts, laengder, total, t, varighed, flyt }

    function placerBrik(id) {
        var h = T.hvile(id);
        brik.x = h[0]; brik.y = h[1];
        T.saetBrik(brik.x, brik.y, 0);
    }

    function startTur(flyt) {
        var pts = T.rute(flyt);
        var laengder = [0];
        for (var i = 1; i < pts.length; i++) {
            var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
            laengder.push(laengder[i - 1] + Math.sqrt(dx * dx + dy * dy));
        }
        var total = laengder[laengder.length - 1];
        var varighed = flyt.tilbage ? Math.min(1.5, 0.55 + total / 900) : Math.min(2.4, 0.7 + total / 750);
        if (total < 1) varighed = 0.45;
        tur = { pts: pts, laengder: laengder, total: total, t: 0, varighed: varighed * bevaegelse, flyt: flyt };
        T.saetTilstand(K.s);
    }

    function blid(u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

    function turSkridt(dt) {
        if (!tur) return;
        tur.t = Math.min(1, tur.t + dt / tur.varighed);
        var u = blid(tur.t);
        var d = u * tur.total;
        var pts = tur.pts, L = tur.laengder, n = pts.length;
        var i = 1;
        while (i < n - 1 && L[i] < d) i++;
        var segL = L[i] - L[i - 1];
        var f = segL > 0 ? (d - L[i - 1]) / segL : 1;
        var x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f;
        var y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;

        if (n > 2 && (i === 1 || i === n - 1)) {
            y -= Math.sin(Math.PI * f) * Math.min(55, 16 + segL * 0.3);   // hop over kassen
        } else {
            y -= Math.abs(Math.sin(d / 16)) * 3;                          // små skridt
        }
        if (n === 2 && tur.total < 1) y -= Math.sin(Math.PI * tur.t) * 26;  // hop på stedet

        var vinkel = tur.flyt.tilbage ? -360 * u : 0;
        brik.x = x; brik.y = y;
        T.saetBrik(x, y, vinkel);
        if (!kamera.fri && !visHele) sigteMod(y);

        if (tur.t >= 1) slutTur();
    }

    function slutTur() {
        var flyt = tur.flyt;
        tur = null;
        K.ankom();
        placerBrik(K.s.node);
        if (flyt.tilbage) {
            T.stempel(K.s.node);
            T.ryst();
        }
        if (K.s.fase === "slut") T.konfetti();
        T.saetTilstand(K.s);
        visPanel();
        if (!visHele) sigteMod(midtAf(K.s.node));
    }

    function midtAf(id) {
        var k = D.KASSER[id];
        return k.y + k.h / 2;
    }

    /* Spring til slutningen af turen (selvtesten og Enter under turen) */
    function spol() {
        if (tur) { tur.t = 1; turSkridt(0); }
    }

    /* ---------------------------------------------------------------
       PANELET
       --------------------------------------------------------------- */
    function knap(tekst, klasse, handling, tast) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "knap " + (klasse || "");
        if (tast) {
            var s = document.createElement("span");
            s.className = "tast";
            s.textContent = tast;
            b.appendChild(s);
        }
        var t = document.createElement("span");
        t.className = "knaptekst";
        t.textContent = tekst;
        b.appendChild(t);
        b.addEventListener("click", handling);
        el.valg.appendChild(b);
        return b;
    }

    function kassetekst(k) { return k.linjer.join(" "); }

    function visPanel() {
        var s = K.s;
        var k = D.KASSER[s.node];
        hovedkort.classList.remove("venter");
        hovedkort.className = "kort hovedkort";
        el.valg.innerHTML = "";
        el.valg.className = "valg";
        el.trin.innerHTML = "";
        el.trin.hidden = true;
        el.paastand.hidden = true;
        el.lille.hidden = true;

        if (s.fase === "slut") {
            hovedkort.classList.add("slut");
            el.kicker.textContent = "Slut";
            el.titel.textContent = kassetekst(k);
            visTrin([D.SLUTTEKST[s.via] || "", K.omveje(s.tilbage), D.TEKST.konfetti], "slutliste");
            knap("Forfra", "stor blaa", forfra, "R");
            return;
        }

        if (s.fase === "udfordring") {
            var u = s.udf;
            hovedkort.classList.add(u.undskyldning ? "undskyld" : "udfordring");
            el.kicker.textContent = u.undskyldning ? "Vælg en undskyldning" : "Udfordring";
            el.paastand.hidden = false;
            el.paastand.innerHTML = "";
            if (u.ord) {
                el.paastand.appendChild(document.createTextNode(D.TEKST.paastand.replace("{ord}", u.ord) + " "));
                var b = document.createElement("b");
                b.textContent = kassetekst(k);
                el.paastand.appendChild(b);
            } else {
                el.paastand.textContent = D.TEKST.paastandO;
            }
            el.titel.textContent = u.spm;
            el.valg.classList.add("svarliste");
            u.svar.forEach(function (sv, i) {
                knap(sv.t, "svar", function () { vaelgSvar(i); }, String(i + 1));
            });
            return;
        }

        if (k.slags === "spm") {
            hovedkort.classList.add("spm");
            el.kicker.textContent = "Spørgsmål";
            el.titel.textContent = kassetekst(k);
            if (k.lille) { el.lille.hidden = false; el.lille.textContent = k.lille.join(" "); }
            el.valg.classList.add("janej");
            D.PILE.filter(function (p) { return p.fra === s.node && p.ord; }).forEach(function (p) {
                var b = knap(p.ord, "stor " + (p.ord === "Ja" ? "ja" : "nej"), function () { vaelgOrd(p.ord); }, p.ord.charAt(0));
                b.addEventListener("mouseenter", function () { T.peg(p.id, true); });
                b.addEventListener("mouseleave", function () { T.peg(p.id, false); });
            });
            return;
        }

        /* "Gør det!"-kasserne */
        var h = K.handling();
        hovedkort.classList.add("handling");
        el.kicker.textContent = "Gør det";
        el.titel.textContent = kassetekst(k);
        if (k.lille) { el.lille.hidden = false; el.lille.textContent = k.lille.join(" "); }
        visTrin(h.trin, "trinliste");
        knap(h.knap, "stor blaa banker", goer, "Enter");
    }

    function visTrin(linjer, klasse) {
        el.trin.hidden = false;
        el.trin.className = klasse;
        linjer.forEach(function (t) {
            if (!t) return;
            var li = document.createElement("li");
            li.textContent = t;
            el.trin.appendChild(li);
        });
    }

    function kommenter(slags, hoved, tekst) {
        el.kommentar.className = "kort kommentar " + slags;
        el.kHoved.textContent = hoved || "";
        el.kHoved.hidden = !hoved;
        el.kTekst.textContent = tekst;
        el.kommentar.classList.remove("ny");
        void el.kommentar.offsetWidth;
        el.kommentar.classList.add("ny");
    }

    function opdaterTal() {
        var n = K.s.tilbage;
        el.tilbage.textContent = n + (n === 1 ? " gang" : " gange");
        el.besvaret.textContent = String(K.s.besvaret);
    }

    /* ---------------------------------------------------------------
       HANDLINGER
       --------------------------------------------------------------- */
    function vaelgOrd(ord) {
        if (tur) return;
        var u = K.vaelg(ord);
        if (!u) return;
        T.saetTilstand(K.s);
        visPanel();
        hovedkort.classList.add("ind");
    }

    function vaelgSvar(i) {
        if (tur || K.s.fase !== "udfordring") return;
        var knapper = el.valg.querySelectorAll("button");
        var r = K.svar(i);
        if (!r) return;
        Array.prototype.forEach.call(knapper, function (b, j) {
            b.disabled = true;
            if (j === i) b.classList.add("valgt", r.udfald);
        });
        hovedkort.classList.add("venter");
        kommenter(r.udfald, D.TEKST[r.udfald], r.svar.r);
        opdaterTal();
        if (NK.app.hurtig) startTur(r.flyt);
        else setTimeout(function () { startTur(r.flyt); }, 380 * bevaegelse);
    }

    function goer() {
        if (tur) return;
        var r = K.goer();
        if (!r) return;
        if (r.udf) {
            T.saetTilstand(K.s);
            visPanel();
            return;
        }
        if (r.flyt.fra === "L") {
            kommenter("info", "", D.TEKST.koe.replace("{n}", K.s.koe));
        }
        hovedkort.classList.add("venter");
        Array.prototype.forEach.call(el.valg.querySelectorAll("button"), function (b) { b.disabled = true; });
        startTur(r.flyt);
    }

    function klikKasse(id) {
        if (id === D.SLUT && K.s.fase !== "slut") {
            kommenter("info", "", D.TEKST.paaskeaeg);
            T.vrik(id);
        }
    }

    function forfra() {
        tur = null;
        K.nulstil();
        T.ryd();
        placerBrik(K.s.node);
        T.saetTilstand(K.s);
        kommenter("start", "", D.TEKST.start);
        opdaterTal();
        visPanel();
        kamera.fri = false;
        kamera.maal = 0;
    }

    function skiftHele() {
        visHele = !visHele;
        tilpas();
        if (!visHele) { kamera.fri = false; sigteMod(brik.y); }
    }

    /* ---------------------------------------------------------------
       HJÆLP OG GENVEJE
       --------------------------------------------------------------- */
    function aabnHjaelp() { el.hjaelp.classList.add("vis"); }
    function lukHjaelp() { el.hjaelp.classList.remove("vis"); }

    $("hjaelpknap").addEventListener("click", aabnHjaelp);
    $("forfraknap").addEventListener("click", forfra);
    el.heleknap.addEventListener("click", skiftHele);
    el.hjaelp.addEventListener("click", function (e) {
        if (e.target === el.hjaelp || e.target.hasAttribute("data-luk")) lukHjaelp();
    });

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var t = e.key;
        if (t === "Escape") { lukHjaelp(); return; }
        if (el.hjaelp.classList.contains("vis")) return;
        var s = K.s;
        var tl = t.toLowerCase();
        if (tl === "j" && s.fase === "spm") { vaelgOrd("Ja"); e.preventDefault(); }
        else if (tl === "n" && s.fase === "spm") { vaelgOrd("Nej"); e.preventDefault(); }
        else if (/^[1-4]$/.test(t) && s.fase === "udfordring") { vaelgSvar(Number(t) - 1); e.preventDefault(); }
        else if (t === "Enter") {
            if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
            if (tur) spol();
            else if (s.fase === "spm" && D.KASSER[s.node].slags === "handling") goer();
            else if (s.fase === "slut") forfra();
            e.preventDefault();
        }
        else if (tl === "v") skiftHele();
        else if (tl === "r") forfra();
        else if (tl === "h" || t === "?") aabnHjaelp();
    });

    /* ---------------------------------------------------------------
       LØKKEN
       --------------------------------------------------------------- */
    var sidst = null;
    function loekke(tid) {
        var dt = sidst === null ? 0 : Math.min(0.05, (tid - sidst) / 1000);
        sidst = tid;
        turSkridt(dt);
        kameraSkridt();
        requestAnimationFrame(loekke);
    }

    window.addEventListener("resize", function () {
        tilpas();
        if (!visHele) { kamera.fri = false; sigteMod(brik.y); }
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { T.tilpasTekst(); });
    }

    tilpas();
    forfra();
    requestAnimationFrame(loekke);

    /* Til _selvtest.html */
    NK.app = {
        kerne: K,
        tegning: T,
        vaelg: vaelgOrd,
        svar: vaelgSvar,
        goer: goer,
        spol: spol,
        forfra: forfra,
        skiftHele: skiftHele,
        undervejs: function () { return !!tur; },
        kameraNu: function () {
            if (kamera.maal === null) return;
            var maks = scene.scrollHeight - scene.clientHeight;
            scene.scrollTop = Math.max(0, Math.min(maks, kamera.maal));
            kamera.maal = null;
        },
        panel: function () {
            return {
                kicker: el.kicker.textContent,
                titel: el.titel.textContent,
                knapper: Array.prototype.map.call(el.valg.querySelectorAll("button .knaptekst"), function (b) { return b.textContent; }),
                kommentar: el.kTekst.textContent
            };
        }
    };
})();
