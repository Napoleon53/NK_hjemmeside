/* =====================================================================
   visning.js - det, der ses: stigen, ruderne, livlinerne, slutkortet,
   lyset i studiet og konfettien

   Her er ingen regler. app.js siger, hvad der skal vises, og kalder
   funktionerne igen, naar noget aendrer sig (ogsaa naar sproget skiftes).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var el = NK.el;

    /* Smaa flag til sprogknappen, tegnet her, saa knappen ikke afhaenger af,
       om computeren har flag-emojis (Windows viser dem som bogstaver). */
    var FLAG = {
        en: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'>" +
            "<rect width='30' height='20' fill='#012169'/>" +
            "<g stroke='#fff' stroke-width='4'><line x1='0' y1='0' x2='30' y2='20'/><line x1='30' y1='0' x2='0' y2='20'/></g>" +
            "<g stroke='#C8102E' stroke-width='2'><line x1='0' y1='0' x2='30' y2='20'/><line x1='30' y1='0' x2='0' y2='20'/></g>" +
            "<g stroke='#fff' stroke-width='6'><line x1='15' y1='0' x2='15' y2='20'/><line x1='0' y1='10' x2='30' y2='10'/></g>" +
            "<g stroke='#C8102E' stroke-width='3'><line x1='15' y1='0' x2='15' y2='20'/><line x1='0' y1='10' x2='30' y2='10'/></g>" +
            "</svg>",
        da: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'>" +
            "<rect width='30' height='20' fill='#C8102E'/>" +
            "<rect x='9' y='0' width='4' height='20' fill='#fff'/>" +
            "<rect x='0' y='8' width='30' height='4' fill='#fff'/>" +
            "</svg>"
    };

    var V = NK.Visning = {};

    function svarknapper() {
        return document.querySelectorAll("#svarnet .svar");
    }

    /* ----- Bygges én gang ---------------------------------------------- */
    V.byg = function () {
        var h = "";
        for (var i = D.BELOEB.length - 1; i >= 0; i--) {
            h += '<li data-nr="' + i + '"' + (D.SIKRE.indexOf(i) >= 0 ? ' class="sikker"' : "") + ">" +
                '<span class="nr">' + (i + 1) + "</span>" +
                '<span class="mk"></span>' +
                '<span class="kr">' + NK.kr(D.BELOEB[i]) + "</span></li>";
        }
        el("stige").innerHTML = h;
    };

    /* ----- De faste tekster (skifter med sproget) ---------------------- */
    V.tekster = function (t, sprog) {
        document.documentElement.lang = sprog;
        document.title = t.titel;
        NK.saetTekst("top-titel", t.titel);
        NK.saetTekst("fortitel", t.forTitel);
        NK.saetTekst("stortitel", t.storTitel);
        NK.saetTekst("undertitel", t.undertitel);
        el("chips").innerHTML = t.chips.map(function (c) { return "<li>" + NK.html(c) + "</li>"; }).join("");
        NK.saetTekst("start-tekst", t.start);
        NK.saetTekst("nyt-tekst", t.nytSpil);
        NK.saetTekst("regelknap", t.regler);
        NK.saetTekst("stige-titel", t.stige);
        NK.saetTekst("sikret-etiket", t.sikret);
        NK.saetTekst("rekord-etiket", t.rekord);
        el("sikret-boks").title = t.sikretTip;
        NK.saetTekst("ledetekst", t.ledetekst);
        NK.saetTekst("jaknap", t.ja);
        NK.saetTekst("nejknap", t.nej);
        el("hjaelpknap").title = t.rundvisning;

        var andet = sprog === "da" ? "en" : "da";
        var knap = el("sprogknap");
        knap.textContent = andet.toUpperCase();
        knap.title = t.skiftSprog;
        knap.setAttribute("aria-label", t.skiftSprog);
        knap.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(FLAG[andet]) + '")';

        NK.saetTekst("regler-titel", t.titel);
        el("regler-indhold").innerHTML = t.reglerDele.map(function (d) {
            return "<h3>" + NK.html(d[0]) + "</h3><p>" + d[1] + "</p>";
        }).join("") + "<h3>" + NK.html(t.genvejeTitel) + "</h3><p>" + t.genveje + "</p>";
        NK.saetTekst("regler-luk", t.luk);

        NK.saetTekst("rv-forrige", t.turForrige);

        var knapper = document.querySelectorAll(".livline");
        for (var i = 0; i < knapper.length; i++) {
            var navn = knapper[i].getAttribute("data-livline");
            knapper[i].querySelector(".ll-navn").textContent = t.livliner[navn].navn;
        }
    };

    V.lydknap = function (til, t) {
        var k = el("lydknap");
        k.textContent = til ? "🔊" : "🔇";
        k.title = til ? t.lydTil : t.lydFra;
        k.classList.toggle("fra", !til);
    };

    /* ----- Stigen ------------------------------------------------------ */
    /* nu: det trin, der spilles om (-1 = intet). vundet: saa mange trin er
       vundet. hjem: det trin, eleven gaar hjem med efter et forkert svar. */
    V.stige = function (nu, vundet, hjem) {
        var raekker = el("stige").children;
        for (var i = 0; i < raekker.length; i++) {
            var nr = Number(raekker[i].getAttribute("data-nr"));
            raekker[i].classList.toggle("nu", nr === nu);
            raekker[i].classList.toggle("vundet", nr < vundet);
            raekker[i].classList.toggle("hjem", nr === hjem);
        }
    };

    V.tal = function (sikret, rekord) {
        NK.saetTekst("sikret", sikret);
        NK.saetTekst("rekord", rekord);
    };

    /* ----- Spoergsmaalet og svarene ------------------------------------- */
    V.spoergsmaal = function (S, sprog, t) {
        var q = NK.Spil.aktuelt(S);
        var tekst = q.b[sprog];
        NK.saetTekst("taeller", t.spoergsmaalAf(S.nr + 1));
        NK.saetTekst("kapitel", t.kapitel(q.kap, D.KAPITLER[sprog][q.kap]));
        NK.saetTekst("pulje", t.spillerOm(NK.kr(NK.Spil.beloeb(S.nr))));
        NK.saetTekst("beskrivelse", tekst);
        var boks = el("spoergsmaal");
        boks.classList.toggle("lang", tekst.length > 70 && tekst.length <= 105);
        boks.classList.toggle("laengst", tekst.length > 105);

        var knapper = svarknapper();
        for (var i = 0; i < knapper.length; i++) {
            var svar = q.svar[sprog][i];
            var felt = knapper[i].querySelector(".svartekst");
            if (felt.textContent !== svar) felt.textContent = svar;
            knapper[i].classList.toggle("langt", svar.length > 19);
        }
    };

    /* tilstand: { afsloeret: antal viste svar, vist: er udfaldet vist,
                   stille: maa der ikke klikkes } */
    V.svar = function (S, tilstand) {
        var q = NK.Spil.aktuelt(S);
        var knapper = svarknapper();
        for (var i = 0; i < knapper.length; i++) {
            var k = knapper[i];
            var valgt = S.valgt === i;
            k.classList.toggle("venter", i >= tilstand.afsloeret);
            k.classList.toggle("fjernet", !!S.fjernet[i]);
            k.classList.toggle("valgt", valgt && !S.laast && !tilstand.vist);
            k.classList.toggle("laast", valgt && S.laast && !tilstand.vist);
            k.classList.toggle("rigtig", tilstand.vist && i === q.rigtig);
            k.classList.toggle("forkert", tilstand.vist && S.laast && valgt && i !== q.rigtig);
            k.classList.toggle("mat", tilstand.vist && i !== q.rigtig && !(S.laast && valgt));
            k.disabled = tilstand.stille || S.laast || !!S.fjernet[i] || i >= tilstand.afsloeret;
            k.setAttribute("aria-pressed", valgt ? "true" : "false");

            /* publikums stemmer */
            var st = k.querySelector(".stemmer");
            var procent = S.publikum && !S.fjernet[i] ? S.publikum[i] : null;
            st.hidden = procent === null;
            if (procent !== null) {
                st.querySelector("b").textContent = procent + " %";
                st.querySelector("i").style.width = procent + "%";
            } else {
                st.querySelector("i").style.width = "0";
            }
        }
    };

    V.livliner = function (S, t, stille) {
        var knapper = document.querySelectorAll(".livline");
        for (var i = 0; i < knapper.length; i++) {
            var navn = knapper[i].getAttribute("data-livline");
            var brugt = S.livliner[navn];
            var kan = NK.Spil.kan(S, navn);
            knapper[i].classList.toggle("brugt", brugt);
            knapper[i].disabled = stille || !kan;
            knapper[i].title = brugt ? t.brugt : (!kan && !S.laast && navn !== "byt" ? t.spaerret : t.livliner[navn].tip);
        }
    };

    /* ----- Statuslinjen og lyset --------------------------------------- */
    V.status = function (html, tone) {
        var s = el("status");
        var nyt = "<span>" + html + "</span>";
        if (s.innerHTML !== nyt) s.innerHTML = nyt;
        s.classList.toggle("god", tone === "god");
        s.classList.toggle("daarlig", tone === "daarlig");
    };

    /* "" (almindeligt), "spaending", "jubel" eller "fald" */
    V.lys = function (navn) {
        var f = el("spilflade");
        ["spaending", "jubel", "fald"].forEach(function (n) { f.classList.toggle(n, n === navn); });
    };

    /* ----- Slutkortet --------------------------------------------------- */
    var taeller = null;

    /* Beloebet taeller op fra 0 */
    function taelOp(felt, til, ms) {
        if (taeller) cancelAnimationFrame(taeller);
        taeller = null;
        if (!ms || til === 0) { felt.textContent = NK.kr(til); return; }
        var start = null;
        function trin(nu) {
            if (start === null) start = nu;
            var x = NK.klamp((nu - start) / ms, 0, 1);
            var blod = 1 - Math.pow(1 - x, 3);
            felt.textContent = NK.kr(til * blod);
            if (x < 1) taeller = requestAnimationFrame(trin);
            else { taeller = null; felt.textContent = NK.kr(til); }
        }
        felt.textContent = NK.kr(0);
        taeller = requestAnimationFrame(trin);
    }

    /* data: { slags, titel, tekst, beloeb, ekstra (HTML), ros, nyRekord }
       animer: beloebet taeller op (kun foerste gang kortet vises) */
    V.slutkort = function (data, animer) {
        var kort = el("slutkort");
        kort.className = "slutkort " + data.slags;
        NK.saetTekst("slut-titel", data.titel);
        NK.saetTekst("slut-tekst", data.tekst);
        el("slut-ekstra").innerHTML = data.ekstra || "";
        el("slut-ekstra").hidden = !data.ekstra;
        el("slut-ros").hidden = !data.ros;
        NK.saetTekst("slut-ros", data.ros || "");
        el("slut-maerke").hidden = !data.nyRekord;
        NK.saetTekst("slut-maerke", data.nyRekord || "");
        if (animer) taelOp(el("slut-beloeb"), data.beloeb, D.TEMPO.taelOp * NK.Tempo);
        else if (!taeller) el("slut-beloeb").textContent = NK.kr(data.beloeb);
    };

    /* ----- Konfetti ----------------------------------------------------- */
    var konfetti = null;

    V.konfetti = function (start) {
        var laerred = el("konfetti");
        if (konfetti) { cancelAnimationFrame(konfetti.billede); konfetti = null; }
        var g = laerred.getContext("2d");
        g.clearRect(0, 0, laerred.width, laerred.height);
        if (!start || !window.requestAnimationFrame) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        var b = laerred.clientWidth || 800, h = laerred.clientHeight || 500;
        laerred.width = b;
        laerred.height = h;
        var farver = ["#f5c542", "#fff4b8", "#ffffff", "#5b8cff", "#37c978", "#ef5a4c"];
        var stykker = [];
        for (var i = 0; i < 150; i++) {
            stykker.push({
                x: Math.random() * b,
                y: -Math.random() * h,
                vx: (Math.random() - 0.5) * 60,
                vy: 90 + Math.random() * 150,
                s: 5 + Math.random() * 7,
                r: Math.random() * 6.28,
                vr: (Math.random() - 0.5) * 8,
                f: farver[i % farver.length]
            });
        }
        konfetti = { billede: 0, sidst: null, alder: 0 };
        function tegn(nu) {
            if (!konfetti) return;
            var dt = konfetti.sidst === null ? 0 : Math.min(0.05, (nu - konfetti.sidst) / 1000);
            konfetti.sidst = nu;
            konfetti.alder += dt;
            g.clearRect(0, 0, b, h);
            var synlige = 0;
            stykker.forEach(function (p) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.r += p.vr * dt;
                /* De foerste otte sekunder begynder et stykke forfra, naar det er faldet ud */
                if (p.y > h + 20 && konfetti.alder < 8) { p.y = -20; p.x = Math.random() * b; }
                if (p.y <= h + 20) synlige++;
                g.save();
                g.translate(p.x, p.y);
                g.rotate(p.r);
                g.fillStyle = p.f;
                g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
                g.restore();
            });
            if (synlige) konfetti.billede = requestAnimationFrame(tegn);
            else konfetti = null;
        }
        konfetti.billede = requestAnimationFrame(tegn);
    };
}());
