/* =====================================================================
   figur.js - raekkerne, baandene og de 100 personer

   Hvert erhverv er en raekke: navn, antal og en bane med personer.
   Raekkerne ligger i baand: foerst i "Erhvervene i 1940", og naar de er
   sorteret, i de tre sektorer. Uoplyst kan ikke sorteres. Den staar
   nederst blandt de usorterede, til resten er paa plads, og ender saa
   under sektorerne.

   Personerne er ét lag oven paa figuren. Hver person faar sin plads fra
   modellen (raekke og nummer i raekken) og flyttes med transform, saa
   man kan se dem gaa fra den ene raekke til den anden.

   Figuren ved ikke, hvad der er rigtigt. Den melder, hvad eleven goer
   (klik, slip), til js/forloeb.js gennem NK.Figur.paa...
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data, M = NK.Model;

    var E = D.ERHVERV.length;
    var PLADSER = Math.ceil(M.stoersteRaekke() / 5) * 5;   /* banens laengde i personer */
    var RK_MIN = 22, RK_MAX = 44;                          /* raekkens hoejde i px */

    var figur, bord, personlag;
    var raekker = [], baner = [], antalFelter = [], personer = [];
    var baand = {};                 /* id -> { el, raekker (beholder), sum } */
    var plads = [];                 /* erhverv -> baandets id ("x" = ikke sorteret) */
    var forrigeRaekke = [];         /* person -> raekken ved sidste placering */

    var aar = D.FOERSTE;
    var valgt = -1;
    var rk = 30, skridt = 14, gab = 4, pb = 10, ph = 20;
    var traek = null;               /* { k, id, x0, y0, sidst, igang, spoeg, kan } */
    var vindueBundet = false;

    function el(id) { return NK.el(id); }
    function saet(e, t) { if (e && e.textContent !== t) e.textContent = t; }

    /* ----- Byg ----------------------------------------------------------- */
    function bygBaand() {
        var ids = ["x", "p", "s", "t", "u"];
        for (var i = 0; i < ids.length; i++) {
            var b = el("baand-" + ids[i]);
            baand[ids[i]] = {
                el: b,
                raekker: b.querySelector(".b-raekker"),
                sum: b.querySelector(".b-sum b")
            };
        }
        el("x-navn").textContent = D.TEKST.usorteret;
        for (var s = 0; s < D.SEKTORER.length; s++) {
            var sek = D.SEKTORER[s], be = baand[sek.id].el;
            be.querySelector(".b-navn").textContent = sek.navn;
            be.querySelector(".b-def").textContent = sek.def;
            be.querySelector(".b-slip").textContent = D.TEKST.slipHer;
            be.querySelector(".b-af").textContent = D.TEKST.afHundrede;
        }
    }

    function bygRaekker() {
        for (var k = 0; k < E; k++) {
            var e = D.ERHVERV[k];
            var r = document.createElement("div");
            r.className = "raekke";
            r.id = "rk-" + e.id;
            r.setAttribute("data-k", k);
            r.title = e.daekker;

            var navn = document.createElement("button");
            navn.type = "button";
            navn.className = "r-navn";
            navn.textContent = e.navn;

            var antal = document.createElement("b");
            antal.className = "r-antal";

            var bane = document.createElement("span");
            bane.className = "r-bane";

            r.appendChild(navn);
            r.appendChild(antal);
            r.appendChild(bane);
            raekker.push(r);
            baner.push(bane);
            antalFelter.push(antal);
            bindRaekke(r, k);
        }
    }

    function bygPersoner() {
        for (var i = 0; i < M.N; i++) {
            var p = document.createElement("i");
            p.className = "person";
            personlag.appendChild(p);
            personer.push(p);
            forrigeRaekke.push(-1);
        }
    }

    /* ----- Raekkernes plads i baandene ------------------------------------ */
    function erSorteret(k) { return plads[k] !== "x"; }

    function altSorteret() {
        for (var k = 0; k < E; k++) if (!erSorteret(k)) return false;
        return true;
    }

    function foersteLoese() {
        for (var k = 0; k < E; k++) if (!erSorteret(k)) return k;
        return -1;
    }

    /* Raekken laegges i baandets beholder, i erhvervenes faste raekkefoelge. */
    function iBeholder(k, beholder) {
        var efter = null, boern = beholder.children;
        for (var i = 0; i < boern.length; i++) {
            if (parseInt(boern[i].getAttribute("data-k"), 10) > k) { efter = boern[i]; break; }
        }
        beholder.insertBefore(raekker[k], efter);
    }

    function laegIBaand(k, id) {
        plads[k] = id;
        raekker[k].classList.toggle("loes", id === "x");
        raekker[k].setAttribute("data-sektor", id === "x" ? "" : id);
        if (id !== "u") iBeholder(k, baand[id].raekker);
    }

    /* Uoplyst staar blandt de usorterede, til de andre er paa plads. */
    function ordnBaand() {
        var faerdig = altSorteret();
        for (var k = 0; k < E; k++) {
            if (plads[k] === "u") iBeholder(k, faerdig ? baand.u.raekker : baand.x.raekker);
        }
        for (var b in baand) baand[b].el.classList.toggle("tom", !baand[b].raekker.children.length);
        figur.classList.toggle("sorteret", faerdig);
    }

    /* ----- Maal og placering ---------------------------------------------- */
    function pladsX(s) { return s * skridt + Math.floor(s / 5) * gab; }

    /* Raekkens hoejde og personernes stoerrelse efter den plads, der er. */
    function maal() {
        var stil = window.getComputedStyle(bord);
        var hoejde = bord.clientHeight - parseFloat(stil.paddingTop) - parseFloat(stil.paddingBottom);
        var fast = figur.offsetHeight - E * rk;            /* overskrifter og luft */
        var ny = Math.floor((hoejde - fast) / E);
        ny = NK.klamp(ny, RK_MIN, RK_MAX);
        if (ny !== rk) {
            rk = ny;
            figur.style.setProperty("--rk", rk + "px");
        }

        var bredde = baner[0].clientWidth;
        var grupper = PLADSER / 5 - 1;
        gab = bredde > 640 ? 6 : (bredde > 460 ? 4 : 3);
        skridt = Math.floor(((bredde - grupper * gab) / PLADSER) * 4) / 4;
        skridt = NK.klamp(skridt, 7, 24);
        pb = Math.max(6, Math.round(skridt - (skridt > 15 ? 5 : (skridt > 11 ? 4 : 2.5))));
        ph = Math.min(rk - 6, Math.round(pb * 1.95));
        personlag.style.setProperty("--pb", pb + "px");
        personlag.style.setProperty("--ph", ph + "px");
    }

    function placer(stille) {
        var fr = figur.getBoundingClientRect();
        var bx = [], by = [], k, i;
        for (k = 0; k < E; k++) {
            var r = baner[k].getBoundingClientRect();
            bx.push(r.left - fr.left);
            by.push(r.top - fr.top + (r.height - ph) / 2);
        }

        if (stille) personlag.classList.add("stille");
        var pl = M.pladser(aar);
        for (i = 0; i < M.N; i++) {
            var p = pl[i], pe = personer[i];
            var x = Math.round((bx[p.r] + pladsX(p.s)) * 2) / 2;
            var y = Math.round(by[p.r] * 2) / 2;
            pe.style.transform = "translate(" + x + "px," + y + "px)";
            var farve = erSorteret(p.r) ? D.ERHVERV[p.r].sektor : "n";
            if (pe.getAttribute("data-s") !== farve) pe.setAttribute("data-s", farve);
            if (!stille && forrigeRaekke[i] >= 0 && forrigeRaekke[i] !== p.r) gaar(pe);
            forrigeRaekke[i] = p.r;
        }
        if (stille) {
            void personlag.offsetWidth;
            personlag.classList.remove("stille");
        }
    }

    /* En person, der skifter raekke, lyser et oejeblik, saa man kan foelge den. */
    function gaar(pe) {
        pe.classList.add("gaar");
        if (pe._ur) window.clearTimeout(pe._ur);
        pe._ur = window.setTimeout(function () { pe.classList.remove("gaar"); pe._ur = 0; }, 750);
    }

    function visTal() {
        var a = M.antal(aar), k;
        for (k = 0; k < E; k++) saet(antalFelter[k], String(a[k]));
        for (var s = 0; s < D.SEKTORER.length; s++) {
            var id = D.SEKTORER[s].id, sum = 0;
            for (k = 0; k < E; k++) if (plads[k] === id) sum += a[k];
            saet(baand[id].sum, String(sum));
        }
    }

    /* ----- Det, js/forloeb.js kalder --------------------------------------- */
    function visAar(nytAar, stille) {
        aar = M.klampAar(nytAar);
        visTal();
        placer(stille);
    }

    function tilpas() {
        maal();
        maal();          /* anden gang: raekkens hoejde kan aendre banens bredde en anelse */
        placer(true);
    }

    function flyt(k, id) {
        laegIBaand(k, id);
        ordnBaand();
        visTal();
        maal();
        placer(false);
    }

    function nulstil(sorteret) {
        for (var k = 0; k < E; k++) {
            var e = D.ERHVERV[k];
            laegIBaand(k, (sorteret || e.sektor === "u") ? e.sektor : "x");
        }
        ordnBaand();
        vaelg(-1);
        marker(-1);
        peg(-1);
        aar = D.FOERSTE;
        visTal();
        maal();
        maal();
        placer(true);
    }

    function vaelg(k) {
        valgt = k;
        for (var i = 0; i < E; i++) raekker[i].classList.toggle("valgt", i === k);
        figur.classList.toggle("har-valgt", k >= 0);
    }

    /* Raekken, hintet handler om, faar en gul ramme. */
    function marker(k) {
        for (var i = 0; i < E; i++) raekker[i].classList.toggle("hintes", i === k);
    }

    /* En lille pil viser, hvilken raekke eleven kan begynde med. */
    function peg(k) {
        for (var i = 0; i < E; i++) raekker[i].classList.toggle("naeste", i === k);
    }

    function blink(id, klasse) {
        if (baand[id]) NK.genstart(baand[id].el, klasse);
    }

    /* ----- Mus, finger og tastatur paa en raekke ---------------------------- */
    function baandUnder(x, y) {
        var e = document.elementFromPoint(x, y);
        var b = e && e.closest ? e.closest(".baand.sektor") : null;
        return b ? b.getAttribute("data-baand") : null;
    }

    function visMaal(id) {
        for (var s = 0; s < D.SEKTORER.length; s++) {
            var b = baand[D.SEKTORER[s].id];
            b.el.classList.toggle("maal", D.SEKTORER[s].id === id);
        }
    }

    /* Rydder alt, et traek kan have efterladt: maerket ved musen, den nedtonede
       raekke og de lysende maal. Der ryddes efter alle maerker og ikke kun det
       aktuelle, saa et maerke aldrig kan blive haengende i figuren. */
    function slutTraek() {
        var gamle = document.querySelectorAll(".traek-spoeg");
        for (var i = 0; i < gamle.length; i++) gamle[i].parentNode.removeChild(gamle[i]);
        for (var k = 0; k < E; k++) raekker[k].classList.remove("traekkes");
        figur.classList.remove("traekker");
        visMaal(null);
        traek = null;
    }

    /* Et traek foelger én mus eller finger (pointerId). Bevaegelse og slip foelges
       paa vinduet og ikke paa raekken, saa traekket ogsaa slutter rigtigt, naar
       raekken har mistet grebet om musen. */
    function bevaegTraek(ev) {
        if (!traek || ev.pointerId !== traek.id) return;
        traek.sidst = Date.now();
        if (!traek.kan) return;
        var k = traek.k;
        if (!traek.igang) {
            if (Math.abs(ev.clientX - traek.x0) + Math.abs(ev.clientY - traek.y0) < 7) return;
            traek.igang = true;
            var s = document.createElement("div");
            s.className = "traek-spoeg";
            s.innerHTML = NK.html(D.ERHVERV[k].navn) + " <b>" + antalFelter[k].textContent + "</b>";
            document.body.appendChild(s);
            traek.spoeg = s;
            raekker[k].classList.add("traekkes");
            figur.classList.add("traekker");
        }
        traek.spoeg.style.left = (ev.clientX + 14) + "px";
        traek.spoeg.style.top = (ev.clientY + 10) + "px";
        visMaal(baandUnder(ev.clientX, ev.clientY));
    }

    function slipTraek(ev) {
        if (!traek || ev.pointerId !== traek.id) return;
        var k = traek.k, varIgang = traek.igang;
        var maalId = varIgang ? baandUnder(ev.clientX, ev.clientY) : null;
        slutTraek();
        if (varIgang) {
            if (maalId) NK.Figur.paaSlip(k, maalId);
            else NK.Figur.paaForbi(k);
        } else if (raekker[k].contains(ev.target)) {
            NK.Figur.paaKlikRaekke(k);
        }
    }

    /* Et nyt tryk fra den samme mus eller finger betyder, at det forrige traek
       aldrig blev sluppet. Det samme goer et traek, der har staaet stille laenge. */
    function nytTryk(ev) {
        if (traek && (ev.pointerId === traek.id || Date.now() - traek.sidst >= 1500)) slutTraek();
    }

    function bindVindue() {
        if (vindueBundet) return;
        vindueBundet = true;
        window.addEventListener("pointerdown", nytTryk, true);
        window.addEventListener("pointermove", bevaegTraek);
        window.addEventListener("pointerup", slipTraek);
        window.addEventListener("pointercancel", function (ev) { if (traek && ev.pointerId === traek.id) slutTraek(); });
        window.addEventListener("blur", function () { if (traek) slutTraek(); });
        document.addEventListener("visibilitychange", function () { if (document.hidden && traek) slutTraek(); });
    }

    function bindRaekke(r, k) {
        r.addEventListener("pointerdown", function (ev) {
            if (ev.button !== undefined && ev.button !== 0) return;
            if (traek && traek.igang) return;       /* en anden finger overtager ikke et traek, der er i gang */
            slutTraek();
            traek = { k: k, id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, sidst: Date.now(), igang: false, spoeg: null, kan: !erSorteret(k) && NK.Figur.kanSortere() };
            if (traek.kan && r.setPointerCapture) {
                try { r.setPointerCapture(ev.pointerId); } catch (fejl) { /* aeldre browsere */ }
            }
        });

        /* Grebet om musen er tabt uden et slip (et systemvindue, et vinduesskift):
           traekket er slut. Efter et almindeligt slip er der ikke noget at rydde. */
        r.addEventListener("lostpointercapture", function (ev) {
            if (traek && traek.k === k && traek.id === ev.pointerId) slutTraek();
        });

        /* Tastatur: Enter eller mellemrum paa navnet giver et klik uden mus. */
        r.addEventListener("click", function (ev) {
            ev.stopPropagation();
            if (ev.detail === 0) NK.Figur.paaKlikRaekke(k);
        });
    }

    function bindBaand() {
        for (var s = 0; s < D.SEKTORER.length; s++) {
            (function (id) {
                baand[id].el.addEventListener("click", function () { NK.Figur.paaKlikBaand(id); });
            }(D.SEKTORER[s].id));
        }
    }

    function byg() {
        figur = el("figur");
        bord = el("bord");
        personlag = el("personer");
        bygBaand();
        bygRaekker();
        bygPersoner();
        bindBaand();
        bindVindue();
        figur.style.setProperty("--rk", rk + "px");
        nulstil(false);
    }

    NK.Figur = {
        byg: byg,
        tilpas: tilpas,
        visAar: visAar,
        flyt: flyt,
        nulstil: nulstil,
        vaelg: vaelg,
        marker: marker,
        peg: peg,
        blink: blink,
        valgt: function () { return valgt; },
        aar: function () { return aar; },
        erSorteret: erSorteret,
        altSorteret: altSorteret,
        foersteLoese: foersteLoese,
        baandFor: function (k) { return plads[k]; },
        PLADSER: PLADSER,
        maalene: function () { return { rk: rk, skridt: skridt, gab: gab, pb: pb, ph: ph }; },

        /* Saettes af js/forloeb.js */
        kanSortere: function () { return false; },
        paaSlip: function () {},
        paaForbi: function () {},
        paaKlikRaekke: function () {},
        paaKlikBaand: function () {}
    };
}());
