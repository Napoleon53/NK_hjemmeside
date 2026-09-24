/* =====================================================================
   visning.js - braettet, kortet, plakaten, knapperne og podierne

   Tegner det, app.js beder om. Her staar ingen regler: point og faser
   kommer fra NK.Spil.

   Skaermen (#skaerm) har tre lag oven paa hinanden:
     #braet   kategorierne og beloebene
     #kort    et felt, der er zoomet op: ledetraad eller svar
     #plakat  alt det store: en kategori, Daily Double, Final, resultatet
   Knapperne under skaermen er hvide piller som i skabelonen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Spil;
    var el = NK.el;
    var V = NK.Visning = {};

    var byggetRunde = -1;
    var fyldTimere = [];
    var plakatNoegle = null;
    var knapNoegle = null;
    var knapHandlinger = {};
    var primaer = null;

    /* ----- Braettet ------------------------------------------------------ */
    V.bygBraet = function () {
        var T = S.T(), Q = S.Q(), R = Q.runder[T.runde];
        var braet = el("braet");
        braet.innerHTML = "";
        braet.style.setProperty("--kolonner", R.kategorier.length);
        braet.style.setProperty("--raekker", R.vaerdier.length);
        R.kategorier.forEach(function (K, k) {
            var h = document.createElement("div");
            h.className = "kategori";
            h.setAttribute("data-k", k);
            h.style.gridColumn = String(k + 1);
            h.style.gridRow = "1";
            h.innerHTML = "<span>" + K.navn + "</span>";
            braet.appendChild(h);
        });
        R.vaerdier.forEach(function (v, i) {
            R.kategorier.forEach(function (K, k) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "felt";
                b.setAttribute("data-n", S.noegle(T.runde, k, i));
                b.style.gridColumn = String(k + 1);
                b.style.gridRow = String(i + 2);
                b.textContent = NK.beloeb(v, Q.enhed);
                b.setAttribute("aria-label", NK.renTekst(K.navn) + ", " + NK.beloeb(v, Q.enhed));
                braet.appendChild(b);
            });
        });
        byggetRunde = T.runde;
        V.tilpasKategorier();
    };

    V.byggetRunde = function () { return byggetRunde; };

    /* En ny quiz: braettet bygges om ved naeste tegning */
    V.nulstil = function () {
        byggetRunde = -1;
        V.skjulKort();
        V.skjulPlakat();
    };

    /* skjulte: antal kategorier, der endnu ikke er vist (fra hoejre) */
    V.opdaterBraet = function (visteKategorier, tomme) {
        var hoveder = el("braet").querySelectorAll(".kategori");
        for (var k = 0; k < hoveder.length; k++) {
            hoveder[k].classList.toggle("skjult", k >= visteKategorier);
        }
        var felter = el("braet").querySelectorAll(".felt");
        for (var i = 0; i < felter.length; i++) {
            var n = felter[i].getAttribute("data-n");
            felter[i].classList.toggle("brugt", S.brugt(n));
            if (!tomme) felter[i].classList.remove("tom");
            felter[i].tabIndex = S.brugt(n) ? -1 : 0;
        }
    };

    /* Felterne tomme, og saa popper beloebene frem i tilfaeldig orden. */
    V.fyld = function (varighed, faerdig) {
        V.stopFyld();
        var felter = Array.prototype.slice.call(el("braet").querySelectorAll(".felt"));
        felter.forEach(function (f) { f.classList.add("tom"); f.classList.remove("popper"); });
        NK.bland(felter).forEach(function (f, i) {
            var t = Math.pow(i / felter.length, 0.85) * varighed * 1000;
            fyldTimere.push(setTimeout(function () {
                f.classList.remove("tom");
                f.classList.add("popper");
            }, t));
        });
        fyldTimere.push(setTimeout(function () {
            fyldTimere = [];
            if (faerdig) faerdig();
        }, varighed * 1000 + 250));
    };

    V.stopFyld = function () {
        fyldTimere.forEach(clearTimeout);
        fyldTimere = [];
        var felter = el("braet").querySelectorAll(".felt");
        for (var i = 0; i < felter.length; i++) felter[i].classList.remove("tom");
    };

    V.fylder = function () { return fyldTimere.length > 0; };

    /* ----- Kortet -------------------------------------------------------- */
    /* indhold: { venstre, hoejre, tekst, svar } */
    V.visKort = function (indhold) {
        var kort = el("kort");
        var ny = kort.hidden;
        kort.hidden = false;
        kort.classList.toggle("svar", !!indhold.svar);
        var hoved = "<span>" + indhold.venstre + "</span><span>" + (indhold.hoejre || "") + "</span>";
        if (el("kort-hoved").innerHTML !== hoved) el("kort-hoved").innerHTML = hoved;
        var t = el("kort-tekst");
        if (t.getAttribute("data-tekst") !== indhold.tekst) {
            t.setAttribute("data-tekst", indhold.tekst);
            t.innerHTML = "<span>" + indhold.tekst + "</span>";
            if (!ny) {
                t.classList.remove("skift");
                void t.offsetWidth;
                t.classList.add("skift");
            }
            V.tilpasKort();
        }
        return ny;
    };

    V.skjulKort = function () {
        var kort = el("kort");
        if (kort.hidden) return;
        kort.hidden = true;
        el("kort-tekst").removeAttribute("data-tekst");
        kort.style.transform = "";
        kort.style.transition = "";
    };

    /* Kortet vokser ud fra det felt, der blev klikket paa. */
    V.zoomFra = function (fraEl) {
        var kort = el("kort");
        if (!fraEl) return;
        var fra = fraEl.getBoundingClientRect(), til = kort.getBoundingClientRect();
        if (!til.width || !til.height) return;
        kort.style.transition = "none";
        kort.style.transformOrigin = "0 0";
        kort.style.transform = "translate(" + (fra.left - til.left) + "px, " + (fra.top - til.top) + "px) scale("
            + (fra.width / til.width) + ", " + (fra.height / til.height) + ")";
        kort.classList.add("zoomer");
        void kort.offsetWidth;
        kort.style.transition = "transform 0.5s cubic-bezier(0.2, 0.75, 0.25, 1)";
        kort.style.transform = "none";
        setTimeout(function () { kort.classList.remove("zoomer"); }, 480);
    };

    V.tilpasKort = function () {
        var t = el("kort-tekst");
        if (el("kort").hidden || !t.offsetHeight) return;
        var h = el("skaerm").clientHeight;
        NK.tilpasTekst(t, Math.max(22, h * 0.095), 16);
    };

    /* Uret: ni lamper, der slukker udefra og ind. andel = tid tilbage (0-1) */
    V.ur = function (vis, andel, slut) {
        var ur = el("ur");
        ur.hidden = !vis;
        if (!vis) return;
        if (ur.children.length !== 9) {
            ur.innerHTML = "";
            for (var i = 0; i < 9; i++) ur.appendChild(document.createElement("i"));
        }
        var taendt = Math.ceil(NK.klamp(andel, 0, 1) * 5);
        for (var j = 0; j < 9; j++) ur.children[j].classList.toggle("taendt", Math.abs(j - 4) < taendt);
        ur.classList.toggle("slut", !!slut);
    };

    /* ----- Plakaten ------------------------------------------------------ */
    /* Bygges kun om, naar noeglen skifter, saa et felt, man skriver i,
       ikke mister fokus. */
    V.visPlakat = function (noegle, klasse, html, efter) {
        var p = el("plakat");
        p.hidden = false;
        if (noegle === plakatNoegle) return false;
        plakatNoegle = noegle;
        p.className = "plakat " + (klasse || "");
        p.innerHTML = html;
        if (efter) efter(p);
        V.tilpasPlakat();
        return true;
    };

    V.skjulPlakat = function () {
        var p = el("plakat");
        p.hidden = true;
        plakatNoegle = null;
        p.innerHTML = "";
    };

    V.tilpasPlakat = function () {
        var h = el("skaerm").clientHeight;
        var stor = el("plakat").querySelectorAll(".tilpas");
        for (var i = 0; i < stor.length; i++) NK.tilpasTekst(stor[i], Math.max(28, h * 0.16), 18);
    };

    /* ----- Knapperne under skaermen -------------------------------------- */
    /* liste: [{ id, tekst, klasse, handling, slaaet }] */
    V.knapper = function (liste) {
        var noegle = JSON.stringify(liste.map(function (k) { return [k.id, k.tekst, k.klasse, !!k.slaaet]; }));
        knapHandlinger = {};
        primaer = null;
        liste.forEach(function (k) {
            knapHandlinger[k.id] = k.handling;
            if (/\bgul\b/.test(k.klasse || "") && !k.slaaet) primaer = k.handling;
        });
        if (noegle === knapNoegle) return;
        knapNoegle = noegle;
        var rk = el("knapper");
        rk.innerHTML = "";
        liste.forEach(function (k) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "pille " + (k.klasse || "");
            b.id = "k-" + k.id;
            b.innerHTML = k.tekst;
            b.disabled = !!k.slaaet;
            b.setAttribute("data-knap", k.id);
            rk.appendChild(b);
        });
    };

    V.knapHandling = function (id) { return knapHandlinger[id] || null; };

    /* Den gule knap: det naturlige naeste trin, som Mellemrum trykker paa */
    V.primaer = function () { return primaer; };

    /* ----- Podierne ------------------------------------------------------ */
    /* opt(h) giver { plus, minus, ude, note } for hvert hold:
       plus/minus: { tekst, valgt } eller null */
    V.podier = function (opt) {
        var T = S.T(), Q = S.Q();
        var rod = el("podier");
        var aktivt = document.activeElement;
        if (aktivt && rod.contains(aktivt) && aktivt.tagName === "INPUT") return;
        var html = "";
        var hold = T ? T.hold : [];
        hold.forEach(function (x, h) {
            var o = opt ? opt(h) || {} : {};
            var p = S.point(h);
            var knapper = "";
            if (o.plus || o.minus) {
                knapper = '<div class="podie-knapper">'
                    + (o.plus ? '<button type="button" class="plus' + (o.plus.valgt ? " valgt" : "") + '" data-h="' + h + '" data-retning="1" title="Rigtigt (' + (h + 1) + ')">' + o.plus.tekst + "</button>" : "")
                    + (o.minus ? '<button type="button" class="minus' + (o.minus.valgt ? " valgt" : "") + '" data-h="' + h + '" data-retning="-1" title="Forkert (Skift+' + (h + 1) + ')">' + o.minus.tekst + "</button>" : "")
                    + "</div>";
            } else if (o.note) {
                knapper = '<div class="podie-note">' + o.note + "</div>";
            }
            html += '<div class="podie' + (T.kontrol === h ? " kontrol" : "") + (o.ude ? " ude" : "") + '" data-h="' + h + '">'
                + '<div class="podie-lys"></div>'
                + '<button type="button" class="podie-point' + (p < 0 ? " minus-tal" : "") + '" data-h="' + h + '" title="Ret pointene">' + NK.beloeb(p, Q.enhed) + "</button>"
                + '<button type="button" class="podie-navn" data-h="' + h + '" title="Ret navnet">' + NK.html(x.navn) + "</button>"
                + knapper
                + "</div>";
        });
        if (rod.innerHTML !== html) rod.innerHTML = html;
    };

    /* Et navn eller et pointtal rettes direkte paa podiet. */
    V.retPaaPodie = function (knap, vaerdi, gem) {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "podie-ret";
        input.value = vaerdi;
        input.setAttribute("aria-label", "Ret");
        knap.replaceWith(input);
        input.focus();
        input.select();
        var faerdig = false;
        function slut(ok) {
            if (faerdig) return;
            faerdig = true;
            var v = input.value;
            input.blur();
            gem(ok ? v : null);
        }
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); slut(true); }
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); slut(false); }
        });
        input.addEventListener("blur", function () { slut(true); });
    };

    /* ----- Tilpasning ved ny stoerrelse --------------------------------- */
    /* Alle kategorier faar samme stoerrelse: den, som den laengste kan have. */
    V.tilpasKategorier = function () {
        var h = el("skaerm").clientHeight;
        var hoveder = el("braet").querySelectorAll(".kategori");
        var mindst = Infinity, i;
        for (i = 0; i < hoveder.length; i++) {
            var s = NK.tilpasTekst(hoveder[i], Math.max(14, h * 0.045), 12);
            if (s) mindst = Math.min(mindst, s);
        }
        if (!isFinite(mindst)) return;
        for (i = 0; i < hoveder.length; i++) hoveder[i].style.fontSize = mindst + "px";
    };

    V.tilpasAlt = function () {
        V.tilpasKategorier();
        V.tilpasKort();
        V.tilpasPlakat();
    };
}());
