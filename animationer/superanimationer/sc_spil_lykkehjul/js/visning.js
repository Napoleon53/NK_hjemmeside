/* =====================================================================
   visning.js - tavlen, bogstaverne, knapperne, podierne og hjulscenen

   Tegner det, app.js beder om. Her staar ingen regler: point og faser
   kommer fra NK.Spil.

   Tavlen har 52 fliser (12 + 14 + 14 + 12), bygget én gang. En gaade
   faar sine felter tildelt; resten er groenne. Et felt er:
     .felt    hvidt og tomt: et bogstav, der ikke er gaettet
     .lyser   blaat: bogstavet er sagt, og feltet vendes om lidt
     .vist    hvidt med bogstavet
   Mens felter lyser, holdes de skjult her (skjul), selv om NK.Spil
   allerede regner bogstavet som gaettet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Spil;
    var Tv = NK.Tavle;
    var el = NK.el;
    var V = NK.Visning = {};

    var fliser = {};
    var celleFlise = [];
    var skjul = {};
    var lys = {};
    var timere = [];
    var plakatNoegle = null;
    var knapNoegle = null;
    var knapHandlinger = {};
    var primaer = null;
    var hjul = {};

    function tid(sek) { return sek * 1000 * (NK.tempo || 1); }
    function senere(f, sek) { var t = setTimeout(f, tid(sek)); timere.push(t); return t; }

    /* ----- Tavlen -------------------------------------------------------- */
    V.bygTavle = function () {
        var rod = el("fliser");
        rod.innerHTML = "";
        fliser = {};
        for (var r = 0; r < 4; r++) {
            for (var k = 0; k < Tv.KOLONNER; k++) {
                if (!Tv.findes(r, k)) continue;
                var f = document.createElement("div");
                f.className = "flise";
                f.style.left = (5.5 + k * 6.4) + "%";
                f.style.top = (11 + r * 20) + "%";
                f.innerHTML = "<span></span>";
                rod.appendChild(f);
                fliser[r + "." + k] = f;
            }
        }
    };

    /* Stopper alle animationer paa tavlen og viser tilstanden, som den er */
    V.stopAnimation = function () {
        timere.forEach(clearTimeout);
        timere = [];
        skjul = {};
        lys = {};
        Object.keys(fliser).forEach(function (n) { fliser[n].classList.remove("taender", "vender"); });
    };

    V.animerer = function () { return timere.length > 0; };

    /* Tildeler gaadens felter til fliserne */
    V.visGaade = function (G) {
        V.stopAnimation();
        celleFlise = [];
        Object.keys(fliser).forEach(function (n) {
            var f = fliser[n];
            f.className = "flise";
            f.firstChild.textContent = "";
            f.removeAttribute("data-i");
        });
        if (!G) return;
        G.celler.forEach(function (c, i) {
            var f = fliser[c.r + "." + c.k];
            f.setAttribute("data-i", i);
            celleFlise[i] = f;
        });
        V.opdaterTavle();
    };

    V.opdaterTavle = function () {
        var G = S.aktuel();
        if (!G) return;
        G.celler.forEach(function (c, i) {
            var f = celleFlise[i];
            if (!f) return;
            var vist = S.synlig(i) && !skjul[i];
            f.classList.add("felt");
            f.classList.toggle("vist", vist);
            f.classList.toggle("lyser", !!lys[i]);
            f.classList.toggle("tegn", !c.bogstav);
            var t = vist ? c.tegn : "";
            if (f.firstChild.textContent !== t) f.firstChild.textContent = t;
        });
    };

    /* Tavlen taender: felterne bliver hvide fra venstre mod hoejre */
    V.taend = function (faerdig) {
        var G = S.aktuel();
        if (!G) return;
        G.celler.forEach(function (c, i) {
            var f = celleFlise[i];
            f.classList.remove("felt", "vist", "tegn");
            f.firstChild.textContent = "";
            senere(function () {
                f.classList.add("taender");
                V.opdaterTavle();
            }, 0.1 + c.k * 0.045 + c.r * 0.02);
        });
        senere(function () {
            timere = [];
            if (faerdig) faerdig();
        }, 0.9);
    };

    /* Felterne med bogstavet lyser blaat ét ad gangen med en ding, og
       vendes saa om. valg.hurtig bruges i toss-up. */
    V.afslor = function (felter, valg, faerdig) {
        valg = valg || {};
        var liste = felter.slice().sort(function (a, b) {
            var A = S.aktuel().celler[a], B = S.aktuel().celler[b];
            return A.r - B.r || A.k - B.k;
        });
        liste.forEach(function (i) { skjul[i] = true; });
        V.opdaterTavle();
        var mellem = valg.hurtig ? 0 : 0.5;
        liste.forEach(function (i, j) {
            senere(function () {
                lys[i] = true;
                V.opdaterTavle();
                if (valg.ding) valg.ding(i);
            }, j * mellem);
        });
        var vend = liste.length * mellem + (valg.hurtig ? 0.25 : 0.45);
        liste.forEach(function (i, j) {
            senere(function () {
                delete lys[i];
                delete skjul[i];
                var f = celleFlise[i];
                if (f) {
                    f.classList.remove("vender");
                    void f.offsetWidth;
                    f.classList.add("vender");
                }
                V.opdaterTavle();
            }, vend + j * (valg.hurtig ? 0 : 0.14));
        });
        senere(function () {
            timere = [];
            if (faerdig) faerdig();
        }, vend + liste.length * (valg.hurtig ? 0 : 0.14) + 0.3);
    };

    V.kategori = function (tekst, lille) {
        var k = el("kategori");
        var html = tekst ? "<span>" + NK.html(tekst) + "</span>" : "";
        if (k.innerHTML !== html) k.innerHTML = html;
        k.classList.toggle("tom", !tekst);
        NK.saetTekst("kategori-lille", lille || "");
    };

    /* ----- Displayet ved knapperne --------------------------------------- */
    V.display = function (tekst, klasse) {
        var d = el("drejet");
        NK.saetTekst("drejet", tekst || "");
        d.className = "drejet " + (klasse || "");
    };

    /* ----- Bogstaverne --------------------------------------------------- */
    V.bygBogstaver = function () {
        function gruppe(id, bogstaver) {
            var rod = el(id);
            rod.innerHTML = "";
            bogstaver.split("").forEach(function (b) {
                var k = document.createElement("button");
                k.type = "button";
                k.className = "bogstav";
                k.setAttribute("data-b", b);
                k.textContent = b;
                rod.appendChild(k);
            });
        }
        gruppe("konsonanter", D.KONSONANTER);
        gruppe("vokaler", D.VOKALER);
    };

    /* opt(b) giver { aktiv, brugt, fundet, valgt } */
    V.bogstaver = function (opt, tilstand) {
        el("bogstaver").setAttribute("data-tilstand", tilstand || "");
        var knapper = el("bogstaver").querySelectorAll(".bogstav");
        for (var i = 0; i < knapper.length; i++) {
            var k = knapper[i], o = opt ? opt(k.getAttribute("data-b")) || {} : {};
            k.disabled = !o.aktiv;
            k.classList.toggle("aktiv", !!o.aktiv);
            k.classList.toggle("brugt", !!o.brugt);
            k.classList.toggle("fundet", !!o.fundet);
            k.classList.toggle("valgt", !!o.valgt);
        }
    };

    /* ----- Knapperne ----------------------------------------------------- */
    /* liste: [{ id, tekst, klasse, handling, slaaet, titel }] */
    V.knapper = function (liste) {
        liste = liste.filter(function (k) { return !!k; });
        var noegle = JSON.stringify(liste.map(function (k) { return [k.id, k.tekst, k.klasse, !!k.slaaet, k.titel]; }));
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
            if (k.titel) b.title = k.titel;
            b.setAttribute("data-knap", k.id);
            rk.appendChild(b);
        });
    };

    V.knapHandling = function (id) { return knapHandlinger[id] || null; };
    V.primaer = function () { return primaer; };

    /* ----- Podierne ------------------------------------------------------ */
    /* opt(h) giver { stor, lille, knapper: [{ klasse, tekst, handling-id, titel }], tur, ude, note, vinder } */
    V.podier = function (opt) {
        var T = S.T();
        var rod = el("podier");
        var aktivt = document.activeElement;
        if (aktivt && rod.contains(aktivt) && aktivt.tagName === "INPUT") return;
        var html = "";
        (T ? T.hold : []).forEach(function (x, h) {
            var o = opt ? opt(h) || {} : {};
            var knapper = "";
            if (o.knapper && o.knapper.length) {
                knapper = '<div class="podie-knapper">' + o.knapper.map(function (k) {
                    return '<button type="button" class="' + k.klasse + '" data-h="' + h + '" data-podie="' + k.id + '"'
                        + (k.titel ? ' title="' + NK.html(k.titel) + '"' : "") + ">" + k.tekst + "</button>";
                }).join("") + "</div>";
            } else if (o.note) {
                knapper = '<div class="podie-note">' + o.note + "</div>";
            }
            html += '<div class="podie farve-' + D.HOLDFARVER[h] + (o.tur ? " tur" : "") + (o.ude ? " ude" : "") + (o.vinder ? " vinder" : "") + '" data-h="' + h + '">'
                + '<div class="podie-top">'
                + '<button type="button" class="podie-lys" data-h="' + h + '" title="Giv holdet turen" aria-label="Giv holdet turen"></button>'
                + '<button type="button" class="podie-navn" data-h="' + h + '" title="Ret navnet">' + NK.html(x.navn) + "</button>"
                + (o.top || "")
                + "</div>"
                + '<button type="button" class="podie-stor" data-h="' + h + '" data-hvad="' + (o.storHvad || "total") + '" title="Ret pointene">' + o.stor + "</button>"
                + (o.lille ? '<div class="podie-lille">' + o.lille + "</div>" : "")
                + knapper
                + "</div>";
        });
        if (rod.innerHTML !== html) rod.innerHTML = html;
    };

    /* Et navn eller et pointtal rettes direkte paa podiet */
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

    /* Et tal, der svaever op fra et podie: +1.800 kr. eller FALLIT */
    V.pop = function (h, tekst, klasse) {
        var p = el("podier").querySelector('.podie[data-h="' + h + '"]');
        if (!p) return;
        var s = document.createElement("div");
        s.className = "pop " + (klasse || "");
        s.textContent = tekst;
        p.appendChild(s);
        setTimeout(function () { s.remove(); }, 1900);
    };

    /* ----- Plakaten ------------------------------------------------------ */
    V.visPlakat = function (noegle, klasse, html) {
        var p = el("plakat");
        p.hidden = false;
        if (noegle === plakatNoegle) return false;
        plakatNoegle = noegle;
        p.className = "plakat " + (klasse || "");
        p.innerHTML = html;
        V.tilpasPlakat();
        return true;
    };

    V.skjulPlakat = function () {
        var p = el("plakat");
        if (p.hidden) return;
        p.hidden = true;
        plakatNoegle = null;
        p.innerHTML = "";
    };

    V.tilpasPlakat = function () {
        var h = el("scene").clientHeight;
        var stor = el("plakat").querySelectorAll(".tilpas");
        for (var i = 0; i < stor.length; i++) NK.tilpasTekst(stor[i], Math.max(28, h * 0.15), 18);
    };

    /* ----- Hjulscenen ---------------------------------------------------- */
    function hentHjul(type) {
        if (!hjul[type]) {
            var holder = document.createElement("div");
            holder.className = "hjul-holder hjul-" + type;
            el("hjul-plads").appendChild(holder);
            hjul[type] = new NK.Hjul(holder, type === "praemie" ? D.PRAEMIEHJUL : D.HJUL,
                { id: type, nav: type === "praemie" ? "★" : "KEMI" });
        }
        return hjul[type];
    }

    V.hjul = function (type) { return hentHjul(type); };

    V.visHjul = function (type, farveKlasse, navn) {
        var scene = el("hjulscene");
        scene.hidden = false;
        scene.className = "hjulscene farve-" + farveKlasse;
        Object.keys(hjul).forEach(function (k) { hjul[k].rod.hidden = k !== type; });
        var H = hentHjul(type);
        H.rod.hidden = false;
        NK.saetTekst("hjul-navn", navn || "");
        V.hjulBesked("");
        return H;
    };

    V.hjulBesked = function (tekst, klasse) {
        var b = el("hjul-besked");
        b.textContent = tekst;
        b.className = "hjul-besked " + (klasse || "");
        b.hidden = !tekst;
    };

    V.skjulHjul = function () {
        el("hjulscene").hidden = true;
    };

    V.hjulVises = function () { return !el("hjulscene").hidden; };

    /* ----- Finalens ur: ti lamper ---------------------------------------- */
    V.ur = function (vis, andel, slut) {
        var ur = el("ur");
        ur.hidden = !vis;
        if (!vis) return;
        if (ur.children.length !== D.FINAL_TID) {
            ur.innerHTML = "";
            for (var i = 0; i < D.FINAL_TID; i++) ur.appendChild(document.createElement("i"));
        }
        var taendt = Math.ceil(NK.klamp(andel, 0, 1) * D.FINAL_TID);
        for (var j = 0; j < D.FINAL_TID; j++) ur.children[j].classList.toggle("taendt", j < taendt);
        ur.classList.toggle("slut", !!slut);
    };

    V.tilpasAlt = function () {
        V.tilpasPlakat();
    };
}());
