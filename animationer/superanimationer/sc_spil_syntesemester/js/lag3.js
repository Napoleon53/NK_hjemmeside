/* =====================================================================
   lag3.js - Syntesen: skriv ruten fra udgangsstoffet til maalet

   Ombygget 27. nov. 2026 efter Niels' dom ("interfacet er lidt
   uoverskueligt ... der er en hylde og en kolbe.. jeg forstaar det ikke
   helt"): ruten staar som et reaktionsskema fra venstre mod hoejre, som
   synteserne i bogen B4.7. Hvert reagenskort virker paa det sidste stof i
   ruten. Maalet staar til venstre. Der er intet opgavekort; opgaven staar
   i én linje oeverst.

   Kan der dannes flere stoffer (1- og 2-brompropan), vaelger eleven,
   hvilket ruten fortsaetter med. Hydrolysens andet stof kommer paa
   lageret. Kondensationen tager en partner fra ruten eller lageret (de
   andre udgangsstoffer). Fortryd tager det sidste trin vaek.

   Seks synteser pr. runde, én fra hver raekke i D.LAG3.RUNDE. Den
   korteste vej regnes af NK.Rute.kaede. Point:
     vaerdi   = 300 pr. trin i den korteste vej
     minus    100 pr. trin ud over, 50 pr. kort uden reaktion og pr.
              fortrudt trin, 20 % efter hint 1 og 40 % efter hint 2
     plus     50 % for den korteste vej uden fejl og hint,
              hoejst 10 % for tiden (intet efter 120 s)
   "Vis en rute" giver 0 point for syntesen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var R = NK.Reaktion;
    var C = D.LAG3;
    var L = NK.Spillyd;
    var $ = NK.el;
    function App() { return NK.App; }

    var s = null;

    function kortAf(id) { return D.KORT.filter(function (k) { return k.id === id; })[0]; }
    function stort(t) { return NK.stortForbogstav(t); }
    function nu() { return s.kaede[s.kaede.length - 1].navn; }

    /* ----- Reagenskortene -------------------------------------------------- */
    function init() {
        var rk = $("l3-kort");
        rk.innerHTML = D.KORT.map(function (k) {
            return '<button class="reagenskort" type="button" data-kort="' + k.id + '"><span class="rk-over">' + k.over + '</span>' +
                '<span class="rk-pil"></span><span class="rk-under">' + (k.under || "&nbsp;") + '</span><span class="rk-titel">' + k.titel + "</span></button>";
        }).join("");
        Array.prototype.forEach.call(rk.querySelectorAll(".reagenskort"), function (b) {
            b.addEventListener("click", function () { brugKort(b.getAttribute("data-kort"), b); });
        });
        $("l3-fortryd").addEventListener("click", fortryd);
    }

    /* ----- Visningen ------------------------------------------------------ */
    function har() {
        /* Det, der kan bruges som partner: ruten (undtagen det sidste) og lageret */
        var ud = s.kaede.slice(0, -1).map(function (k) { return k.navn; });
        s.lager.forEach(function (n) { if (ud.indexOf(n) < 0) ud.push(n); });
        return ud;
    }

    function hoved() {
        var o = s.opg;
        var liste = "<b>" + o.start[0] + "</b>" + (o.start.length > 1 ? " og <b>" + o.start.slice(1).join("</b> og <b>") + "</b>" : "");
        $("l3-hoved").innerHTML = '<span class="l3-etiket">Syntese ' + (s.nr + 1) + " af " + C.RUNDE.length + "</span>" +
            '<span class="l3-opgave">Lav <b>' + o.maal + "</b> ud fra " + liste + ".</span>" +
            '<span class="l3-trin">Korteste vej: <b>' + o.par + "</b> trin · din rute: <b>" + (s.kaede.length - 1) + "</b></span>" +
            (s.loest ? "" : (s.hint < 2 ? '<button class="knap hintknap" type="button" id="l3-hint">Giv et hint</button>' :
                '<button class="knap hintknap" type="button" id="l3-vis">Vis en rute (0 point)</button>'));
        var hb = $("l3-hint");
        if (hb) hb.addEventListener("click", hint);
        var vb = $("l3-vis");
        if (vb) vb.addEventListener("click", visRute);
    }

    function storrelse() {
        var n = s.kaede.length;
        if (n <= 3) return { skala: 46, b: 190, h: 110 };
        if (n <= 4) return { skala: 40, b: 160, h: 96 };
        return { skala: 34, b: 130, h: 80 };
    }

    function molHTML(navn, klasse) {
        return '<div class="kd-mol ' + (klasse || "") + '"><span class="kd-tegn" data-tegn="' + NK.html(navn) + '"></span>' +
            '<span class="kd-navn">' + NK.html(navn) + "</span></div>";
    }

    function pilHTML(led) {
        var k = kortAf(led.kort);
        var over = led.kort === "kond" ? "+ " + led.partner : k.over;
        var under = led.kort === "kond" ? "H₂SO₄, varme" : k.under;
        return '<div class="kd-pil" style="--typefarve:' + D.TYPER[led.type].farve + '"><span class="kd-over">' + NK.html(over) + "</span><i></i>" +
            '<span class="kd-under">' + under + '</span><span class="kd-type">' + D.TYPER[led.type].navn + "</span></div>";
    }

    function visKaede() {
        var el = $("l3-kaede");
        var h = [molHTML(s.kaede[0].navn, "start" + (s.kaede.length === 1 ? " nu" : ""))];
        for (var i = 1; i < s.kaede.length; i++) {
            var sidste = i === s.kaede.length - 1;
            h.push('<div class="kd-led">' + pilHTML(s.kaede[i]) +
                molHTML(s.kaede[i].navn, sidste ? (s.loest && !s.vist ? "maal" : "nu") : "") + "</div>");
        }
        if (!s.loest) h.push('<div class="kd-led naeste"><div class="kd-pil tom"><span class="kd-over">?</span><i></i><span class="kd-under">&nbsp;</span></div>' +
            '<div class="kd-mol tom"><span>?</span></div></div>');
        el.innerHTML = h.join("");
        var st = storrelse();
        Array.prototype.forEach.call(el.querySelectorAll("[data-tegn]"), function (t) {
            K.tegnI(t, K.stof(t.getAttribute("data-tegn")), { skala: st.skala, maksB: st.b, maksH: st.h });
        });
        $("l3-fortryd").hidden = !!s.loest || s.kaede.length < 2;
        NK.saetTekst("l3-instruks-stof", nu());
        $("l3-instruks").hidden = !!s.loest;
    }

    function visMaal() {
        var st = K.stof(s.opg.maal);
        var m = $("l3-maal");
        m.innerHTML = '<div class="kb-tegn" id="l3-mal-tegn"></div><p class="kb-navn">' + NK.html(K.navn(st)) + "</p>" +
            '<p class="kb-klasse">' + K.klasseNavn(st.klasse) + "</p>";
        var r = $("l3-mal-tegn").getBoundingClientRect();
        K.tegnI($("l3-mal-tegn"), st, { skala: 50, maksB: Math.max(110, r.width - 16), maksH: Math.max(60, Math.min(160, r.height - 8)) });
        var lager = $("l3-lager");
        if (!s.lager.length) { lager.hidden = true; lager.innerHTML = ""; }
        else {
            lager.hidden = false;
            lager.innerHTML = '<p class="lg-titel">Du har også</p>' + s.lager.map(function (n) {
                return '<div class="lg-stof"><span class="lg-tegn" data-tegn="' + NK.html(n) + '"></span><span>' + NK.html(n) + "</span></div>";
            }).join("") + '<p class="lg-note">Kan bruges ved kondensation.</p>';
            Array.prototype.forEach.call(lager.querySelectorAll("[data-tegn]"), function (t) {
                K.tegnI(t, K.stof(t.getAttribute("data-tegn")), { skala: 22, maksB: 90, maksH: 40 });
            });
        }
        $("l3-maal").parentNode.classList.toggle("naaet", !!(s.loest && !s.vist));
    }

    function besked() {
        var b = $("l3-besked");
        var h = "";
        if (s.loest) {
            h = '<div class="l3-resultat ' + (s.loest.point > 0 ? "ok" : "nej") + '"><div><p><b>' + s.loest.tekst + "</b></p>" +
                (s.loest.dele ? '<p class="l3-dele">' + s.loest.dele + "</p>" : "") + "</div>" +
                '<button class="knap blaa" type="button" id="l3-naeste">' + (s.nr + 1 < C.RUNDE.length ? "Næste syntese" : "Se resultatet") + " ↵</button></div>";
        } else {
            if (s.besked) h += '<p class="bs ' + (s.besked.klasse || "") + '"' + (s.besked.farve ? ' style="--typefarve:' + s.besked.farve + '"' : "") + ">" + s.besked.html + "</p>";
            if (s.hintTekst) h += '<p class="bs hint">' + s.hintTekst + "</p>";
        }
        b.innerHTML = h;
        var n = $("l3-naeste");
        if (n) n.addEventListener("click", naeste);
    }

    function synteserKort() {
        var html = s.resultater.length ? '<ol class="rute">' + s.resultater.map(function (r) {
            return "<li>" + NK.html(r.opg.maal) + ": " + (r.vist ? "vist" : r.trin + " af " + r.opg.par + " trin") + " · <b>" + r.point + "</b>" +
                (r.perfekt ? " ★" : "") + "</li>";
        }).join("") + "</ol>" : '<p class="mat">Ingen synteser endnu.</p>';
        App().lagkort("Synteserne", html);
    }

    function panel() {
        if (!s) return;
        var t = s.kaede.length - 1;
        App().panel({
            point: s.point,
            tal2: { navn: "Trin", vaerdi: t + " / " + s.opg.par, klasse: t > s.opg.par ? "over" : "" },
            tal3: { navn: "Syntese", vaerdi: (s.nr + 1) + " af " + C.RUNDE.length },
            fremgang: { andel: s.nr / C.RUNDE.length, tekst: s.perfekte + (s.perfekte === 1 ? " perfekt rute" : " perfekte ruter") + " (korteste vej uden fejl)" }
        });
    }

    function visAlt() {
        App().opgave(null);
        hoved();
        visKaede();
        visMaal();
        besked();
        synteserKort();
        panel();
    }

    /* ----- Handlingerne ----------------------------------------------------- */
    function ryst(el) {
        if (!el) return;
        el.classList.remove("ryst");
        void el.offsetWidth;
        el.classList.add("ryst");
    }

    function fjernRing() {
        Array.prototype.forEach.call(document.querySelectorAll(".ring"), function (e) { e.classList.remove("ring"); });
    }

    function brugKort(id, knap) {
        if (!s || !s.koerer || s.loest || !$("valgkort").hidden) return;
        fjernRing();
        var st = K.stof(nu());
        if (id === "kond") { vaelgPartner(st, knap); return; }
        var r = R.anvend(st, id);
        if (r.ingen) { ingenReaktion(id, st, r, knap); return; }
        if (r.valg.length > 1 || r.begge) vaelgProdukt(id, st, r);
        else udfoer(id, st, null, r, r.valg[0].produkter[0].navn);
    }

    function ingenReaktion(id, st, r, knap) {
        s.spildt++;
        s.besked = { klasse: "advarsel", html: "<b>Ingen reaktion med " + R.kortTitel(id) + ".</b> " + r.grund };
        L.spil("ingen");
        ryst(knap);
        ryst(document.querySelector(".kd-mol.nu"));
        besked();
        panel();
    }

    function vaelgPartner(st, knap) {
        var mulige = har().map(function (n) {
            var p = K.stof(n);
            return { p: p, r: R.anvend(st, "kond", p) };
        }).filter(function (x) { return !x.r.ingen; });
        if (!mulige.length) {
            s.besked = { klasse: "advarsel", html: "<b>Ingen partner.</b> Kondensationen kræver en carboxylsyre og en alkohol eller en amin. " +
                (st.klasse === "syre" ? "Der er ingen alkohol eller amin i ruten eller på lageret." :
                    (st.klasse === "alkohol" || st.klasse === "amin" ? "Der er ingen carboxylsyre i ruten eller på lageret." :
                        stort(st.navn) + " er hverken en carboxylsyre, en alkohol eller en amin.")) };
            L.spil("ingen");
            ryst(knap);
            besked();
            return;
        }
        valgKort("Kondensation: hvilket stof skal reagere med " + st.navn + "?",
            mulige.map(function (x) { return { navn: x.p.navn, tekst: s.lager.indexOf(x.p.navn) >= 0 ? "fra lageret" : "fra ruten" }; }),
            function (i) {
                var x = mulige[i];
                udfoer("kond", st, x.p, x.r, x.r.valg[0].produkter[0].navn);
            });
    }

    function vaelgProdukt(id, st, r) {
        if (r.begge) {
            var pr = r.valg[0].produkter;
            valgKort("Hydrolysen giver to stoffer. Hvilket skal ruten fortsætte med? Det andet kommer på lageret.",
                pr.map(function (p) { return { navn: p.navn, tekst: K.klasseNavn(p.klasse) }; }),
                function (i) { udfoer(id, st, null, r, pr[i].navn); });
            return;
        }
        valgKort("Der kan dannes " + (r.valg.length === 2 ? "to" : r.valg.length) + " stoffer. Hvilket skal ruten fortsætte med?",
            r.valg.map(function (v) { return { navn: v.produkter[0].navn, tekst: K.klasseNavn(v.produkter[0].klasse) }; }),
            function (i) { udfoer(id, st, null, r, r.valg[i].produkter[0].navn); });
    }

    /* Valgkortet midt i scenen: tegninger at klikke paa, og Fortryd */
    function valgKort(titel, valg, naar) {
        var v = $("valgkort");
        v.className = "valgkort valg";
        v.innerHTML = '<p class="vk-titel">' + titel + '</p><div class="vk-valg">' + valg.map(function (x, i) {
            return '<button class="vk-mulighed" type="button" data-i="' + i + '"><span class="sv-nr">' + (i + 1) + '</span><span class="vk-tegn" data-tegn="' +
                NK.html(x.navn) + '"></span><span class="vk-navn">' + NK.html(x.navn) + '</span><span class="vk-ktekst">' + x.tekst + "</span></button>";
        }).join("") + '</div><div class="vk-knapper"><button class="tekstknap" type="button" id="vk-fortryd">Fortryd (Esc)</button></div>';
        v.hidden = false;
        Array.prototype.forEach.call(v.querySelectorAll("[data-tegn]"), function (el) {
            K.tegnI(el, K.stof(el.getAttribute("data-tegn")), { skala: 28, maksB: 200, maksH: 100 });
        });
        s.valg = function (i) {
            if (i < 0) { v.hidden = true; s.valg = null; return; }
            if (i >= valg.length) return;
            v.hidden = true;
            s.valg = null;
            naar(i);
        };
        Array.prototype.forEach.call(v.querySelectorAll(".vk-mulighed"), function (b) {
            b.addEventListener("click", function () { if (s.valg) s.valg(Number(b.getAttribute("data-i"))); });
        });
        $("vk-fortryd").addEventListener("click", function () { if (s.valg) s.valg(-1); });
    }

    function udfoer(id, st, partner, r, videre) {
        var v = r.valg.filter(function (x) { return x.produkter.some(function (p) { return p.navn === videre; }); })[0] || r.valg[0];
        var andre = v.produkter.map(function (p) { return p.navn; }).filter(function (n) { return n !== videre; });
        var lagt = andre.filter(function (n) { return s.lager.indexOf(n) < 0; });
        lagt.forEach(function (n) { s.lager.push(n); });
        s.kaede.push({ navn: videre, kort: id, partner: partner ? partner.navn : null, type: r.type, rnavn: r.navn, lagt: lagt });
        s.besked = { klasse: "reaktion", farve: D.TYPER[r.type].farve,
            html: "<b>" + r.navn + ":</b> " + r.om + (lagt.length ? " " + stort(lagt.join(" og ")) + " kom på lageret." : "") };
        s.hintTekst = "";
        L.spil("reaktion");
        if (videre === s.opg.maal) { loest(false); return; }
        visKaede();
        visMaal();
        hoved();
        besked();
        panel();
    }

    function fortryd() {
        if (!s || !s.koerer || s.loest || s.kaede.length < 2) return;
        var led = s.kaede.pop();
        led.lagt.forEach(function (n) { s.lager.splice(s.lager.indexOf(n), 1); });
        s.fortrudt++;
        s.besked = { klasse: "advarsel", html: "Trinnet med " + R.kortTitel(led.kort) + " er fortrudt. Ruten fortsætter fra " + nu() + "." };
        s.hintTekst = "";
        fjernRing();
        visKaede();
        visMaal();
        hoved();
        besked();
        panel();
    }

    /* ----- Hint og ruten ------------------------------------------------------- */
    function korteste() { return NK.Rute.kaedeFra(nu(), har(), s.opg.maal); }

    function hint() {
        if (!s || s.loest) return;
        var k = korteste();
        if (!k) { s.hintTekst = "Der er ingen vej herfra. Fortryd et trin."; besked(); return; }
        s.hint++;
        if (s.hint === 1) {
            var klasser = [K.klasseNavn(K.stof(nu()).klasse)].concat(k.rute.map(function (t) { return K.klasseNavn(K.stof(t.til).klasse); }));
            s.hintTekst = "<b>Hint:</b> Tænk baglæns fra " + s.opg.maal + ". Ruten på syntesekortet går: " + klasser.join(" → ") + ".";
        } else {
            var t = k.rute[0];
            s.hintTekst = "<b>Hint:</b> Næste trin er " + R.kortTitel(t.kort) + (t.partner ? " med " + t.partner : "") + ", så " + nu() + " bliver til " + t.til + ".";
            var kb = document.querySelector('.reagenskort[data-kort="' + t.kort + '"]');
            if (kb) kb.classList.add("ring");
        }
        hoved();
        besked();
    }

    function visRute() {
        if (!s || s.loest) return;
        var k = NK.Rute.kaede(s.opg.start, s.opg.maal);
        s.vist = true;
        var tekst = k.rute.map(function (t, i) {
            var r = t.kort === "kond" ? R.anvend(K.stof(t.fra), "kond", K.stof(t.partner)) : R.anvend(K.stof(t.fra), t.kort);
            return (i + 1) + ". " + r.navn + ": " + t.fra + (t.partner ? " + " + t.partner : "") + " → " + t.til;
        }).join("<br>");
        loest(true, tekst);
    }

    /* ----- Pointene ---------------------------------------------------------- */
    function beregn(o, trin, spildt, hint, sek) {
        var vaerdi = C.PR_TRIN * o.par;
        var ekstra = Math.max(0, trin - o.par);
        var hintKost = hint >= 2 ? C.HINT[1] : (hint === 1 ? C.HINT[0] : 0);
        var p = vaerdi - C.EKSTRA_TRIN * ekstra - C.SPILDT * spildt - Math.round(vaerdi * hintKost);
        p = Math.max(0, p);
        var perfekt = ekstra === 0 && spildt === 0 && hint === 0 && trin === o.par;
        var bonus = perfekt ? Math.round(vaerdi * C.PERFEKT) : 0;
        var tid = p > 0 ? Math.round(vaerdi * C.TIDSBONUS * Math.max(0, 1 - sek / C.TID_GRAENSE)) : 0;
        return { vaerdi: vaerdi, ekstra: ekstra, hintKost: hintKost, perfekt: perfekt, bonus: bonus, tid: tid,
                 point: p + bonus + tid, grund: p };
    }

    function loest(vist, ruteTekst) {
        var sek = (Date.now() - s.t0) / 1000;
        var o = s.opg, trin = s.kaede.length - 1;
        var b;
        if (vist) {
            b = { point: 0, perfekt: false };
            s.loest = { point: 0, tekst: "Sådan kan " + o.maal + " laves i " + o.par + " trin. Syntesen giver 0 point.", dele: ruteTekst };
            L.spil("ingen");
        } else {
            var fejl = s.spildt + s.fortrudt;
            b = beregn(o, trin, fejl, s.hint, sek);
            var dele = ["Værdi " + b.vaerdi];
            if (b.ekstra) dele.push(b.ekstra + " trin ekstra −" + C.EKSTRA_TRIN * b.ekstra);
            if (s.spildt) dele.push(s.spildt + " uden reaktion −" + C.SPILDT * s.spildt);
            if (s.fortrudt) dele.push(s.fortrudt + " fortrudt −" + C.SPILDT * s.fortrudt);
            if (s.hint) dele.push(s.hint + " hint −" + Math.round(b.vaerdi * b.hintKost));
            if (b.perfekt) dele.push("korteste vej uden fejl +" + b.bonus);
            if (b.tid) dele.push("tid +" + b.tid);
            s.loest = { point: b.point, tekst: "Rigtigt. " + stort(o.maal) + " er lavet i " + trin + " trin" +
                (trin === o.par ? ", og det er den korteste vej." : ". Den korteste vej har " + o.par + " trin.") + " +" + b.point + " point",
                dele: dele.join(" · ") };
            if (b.perfekt) s.perfekte++;
            L.spil("maal");
        }
        s.point += b.point;
        s.resultater.push({ opg: o, trin: trin, spildt: s.spildt, fortrudt: s.fortrudt, hint: s.hint, vist: vist, point: b.point, perfekt: b.perfekt });
        s.tidIalt += sek;
        fjernRing();
        $("lag3").classList.add("loest");
        visKaede();
        visMaal();
        hoved();
        besked();
        synteserKort();
        panel();
        var n = $("l3-naeste");
        if (n) n.focus({ preventScroll: true });
    }

    /* ----- Forloebet ---------------------------------------------------------- */
    function nyOpgave() {
        var raekke = C.RUNDE[s.nr];
        var valgt = s.valgte[s.nr] || NK.tilfaeldig(raekke);
        var k = NK.Rute.kaede(valgt.start, valgt.maal);
        s.opg = { start: valgt.start.slice(), maal: valgt.maal, par: k ? k.par : valgt.par };
        s.kaede = [{ navn: valgt.start[0], lagt: [] }];
        s.lager = valgt.start.slice(1);
        s.spildt = 0; s.fortrudt = 0; s.hint = 0; s.vist = false; s.loest = null;
        s.besked = { html: "Klik på et reagenskort. Det reagerer med det sidste stof i ruten." };
        s.hintTekst = "";
        s.t0 = Date.now();
        $("lag3").classList.remove("loest");
        fjernRing();
        visAlt();
    }

    function naeste() {
        if (!s || !s.koerer || !s.loest) return;
        s.nr++;
        if (s.nr >= C.RUNDE.length) { slut(); return; }
        nyOpgave();
    }

    function start(valgte) {
        s = { koerer: true, nr: 0, point: 0, perfekte: 0, resultater: [], tidIalt: 0, valgte: valgte || [], valg: null };
        nyOpgave();
    }

    function ryd() {
        $("l3-hoved").innerHTML = "";
        $("l3-kaede").innerHTML = "";
        $("l3-maal").innerHTML = "";
        $("l3-lager").innerHTML = "";
        $("l3-besked").innerHTML = "";
    }

    function stop() {
        if (s) s.koerer = false;
        $("valgkort").hidden = true;
        App().opgave(null);
        fjernRing();
        ryd();
    }

    function slut() {
        s.koerer = false;
        L.spil("slut");
        var linjer = ["<p><b>" + s.perfekte + "</b> af " + C.RUNDE.length + " synteser med den korteste vej uden fejl</p>",
            '<ol class="mk-synteser">' + s.resultater.map(function (r) {
                return '<li class="' + (r.perfekt ? "perfekt" : "") + '"><span>' + NK.html(r.opg.start.join(" + ")) + " → " + NK.html(r.opg.maal) + "</span>" +
                    "<span>" + (r.vist ? "vist" : r.trin + " / " + r.opg.par + " trin") + "</span><b>" + r.point + "</b></li>";
            }).join("") + "</ol>"];
        App().slut({ titel: "Runden er slut", point: s.point, niveau: C.RUNDE.length, sekunder: s.tidIalt, linjer: linjer, rekord: true });
        ryd();
    }

    function tast(e) {
        if (!s || !s.koerer) return false;
        if (s.valg) {
            if (e.key === "Escape") { s.valg(-1); return true; }
            if (/^[1-9]$/.test(e.key)) { s.valg(Number(e.key) - 1); return true; }
            return false;
        }
        if (e.key === "Enter") { if (s.loest) naeste(); return true; }
        if (e.key === "Backspace" && !s.loest) { fortryd(); return true; }
        return false;
    }

    NK.Lag = NK.Lag || {};
    NK.Lag[3] = {
        titel: "Syntesen",
        startTekst: "<p><b>Skriv ruten fra udgangsstoffet til målet.</b> Hvert reagenskort reagerer med det sidste stof i ruten, " +
            "og produktet kommer på som næste led, som i et reaktionsskema.</p>" +
            "<p>Seks synteser, der bliver længere. Flest point giver den korteste vej uden kort, der ikke reagerer, og uden hint. " +
            "Tiden giver kun en lille bonus.</p>",
        init: init,
        vis: function () {
            $("lag3").hidden = false;
            App().panel({ point: 0, tal2: { navn: "Trin", vaerdi: "0", klasse: "" }, tal3: { navn: "Syntese", vaerdi: "1 af " + C.RUNDE.length }, fremgang: null });
            App().lagkort("Synteserne", '<p class="mat">Ingen synteser endnu.</p>');
        },
        skjul: function () { stop(); $("lag3").hidden = true; },
        start: function () { start(); },
        stop: stop,
        koerer: function () { return !!(s && s.koerer); },
        tast: tast,
        /* Til selvtesten */
        _s: function () { return s; },
        _start: start,
        _brug: brugKort,
        _fortryd: fortryd,
        _beregn: beregn,
        _naeste: naeste,
        _hint: hint
    };
}());
