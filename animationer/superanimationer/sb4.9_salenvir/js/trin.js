/* =====================================================================
   trin.js - kortet oeverst i scenen, listen over trinnene og hjaelpen

   Som scenekortet i sc7.5: al tekst staar paa ét kort oeverst midt i
   scenen, og der er ingen tekstlinje nederst. Kortet viser:
     gaet     et stort gult gaet foer forsoeget (trin 5)
     forsoeg  det, eleven skal goere nu: én del ad gangen (js/sim.js
              delNu), med prikker for trinnets dele
     spm      et spoergsmaal med svarknapper (trin 6, 7 og 10)
     felt     et felt til et tal (trin 9)
     mellem   en groen besked, foer der koeres en ny TLC-plade
     loest    det groenne kort med forklaringen og knappen Naeste trin
   Kortets nederste raekke har beskeden (hint, fejl, et svar paa noget
   i scenen) og den gule hjaelpeknap: Giv et hint > Vis svaret.

   Laasen: scenen kan kun bruges, mens kortet viser et forsoeg. Ellers
   blinker kortet (spaer).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var P = NK.Sim.prototype;

    function el(id) { return NK.el(id); }

    /* ----- Opstart og trinskift ------------------------------------------------ */
    P.startTrin = function (i) {
        if (i === undefined) i = 0;
        this.trinNr = i;
        var tr = D.TRIN[i];
        this.fase = tr.gaet ? "gaet" : "forsoeg";
        this.gaetValg = -1;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.brugtSvar = false;
        this.delSidst = undefined;      /* saa foerste tjek altid ser delen */
        this.spm = null;
        this.slutTekst = "";
        this.kortT = 0;
        this.besk = { html: "", klasse: "" };
        this.sejrT = null;
        if (!this.erBygget) this.bygPanel();
        this.visKort();
        this.visListe();
        if (this.lay) this.layout();
    };

    /* Spring til et trin: de foregaaende trin goeres efter opskriften */
    P.springTil = function (i) {
        this.greb = null;
        this.hold = null;
        this.draaber = []; this.skyer = []; this.bobler = []; this.stroemme = [];
        this.forbered(i);
        this.startTrin(i);
    };

    /* ----- Panelet: listen og maalingerne ------------------------------------- */
    P.bygPanel = function () {
        var mig = this, liste = el("liste");
        this.erBygget = true;
        liste.innerHTML = "";
        this.chips = [];
        D.TRIN.forEach(function (tr, i) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "opg-chip";
            k.title = "Gå til trin " + (i + 1) + ": " + tr.navn;
            k.innerHTML = '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.html(tr.navn) + '</span><i class="oc-m"></i>';
            k.addEventListener("click", function () { mig.springTil(i); });
            liste.appendChild(k);
            mig.chips.push(k);
        });
        el("forfra").addEventListener("click", function () { mig.springTil(0); });
        el("skort").addEventListener("click", function (e) {
            var v = e.target.closest ? e.target.closest("[data-videre]") : null;
            if (v) { mig.videre(); return; }
            var k = e.target.closest ? e.target.closest("[data-valg]") : null;
            if (k && !k.disabled) { mig.svarValg(parseInt(k.getAttribute("data-valg"), 10)); return; }
            var tj = e.target.closest ? e.target.closest("[data-tjek]") : null;
            if (tj) mig.feltTjek();
        });
        el("skort").addEventListener("keydown", function (e) {
            if (e.key === "Enter" && e.target && e.target.id === "felt") { e.preventDefault(); mig.feltTjek(); }
        });
        el("knap").addEventListener("click", function () { mig.knap(); });
    };

    P.visListe = function () {
        var mig = this;
        this.chips.forEach(function (c, i) {
            var loest = i < mig.trinNr || (i === mig.trinNr && mig.fase === "loest");
            c.classList.toggle("valgt", i === mig.trinNr);
            c.classList.toggle("loest", loest);
            c.querySelector(".oc-m").textContent = loest ? "✓" : "";
        });
    };

    /* ----- Kortet -------------------------------------------------------------- */
    P.kortHTML = function () {
        var tr = D.TRIN[this.trinNr], nr = this.trinNr + 1, html, mig = this;
        if (this.fase === "gaet") {
            var g = tr.gaet;
            html = '<span class="gk-maerke">Gæt først</span>';
            html += '<p class="gk-intro">' + NK.html(g.intro) + "</p>";
            html += '<p class="gk-tekst">' + NK.html(g.tekst) + '</p><div class="gk-svar">';
            g.svar.forEach(function (sv, j) {
                html += '<button type="button" class="gk-knap" data-valg="' + j + '"><span class="v-bogstav">' + "ABC".charAt(j) + "</span>" + NK.html(sv.t) + "</button>";
            });
            return html + "</div>";
        }
        if (this.fase === "loest" || this.fase === "mellem") {
            var chip = this.fase === "mellem" ? "Rigtigt ✓" : (this.brugtSvar ? "Trin " + nr + " · Svaret" : "Trin " + nr + " ✓");
            var knapTekst = this.fase === "mellem" ? "Ny TLC-plade →" : (this.trinNr === D.TRIN.length - 1 ? "Start forfra ↺" : "Næste trin →");
            return '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + chip + "</span>" + NK.html(this.slutTekst) + "</p>" +
                '<button type="button" class="sk-videre" data-videre="1">' + knapTekst + "</button></div>";
        }
        if (this.fase === "spm") {
            var s = this.spm;
            html = '<p class="sk-tekst"><span class="sk-chip">Spørgsmål</span>' + NK.html(s.tekst) + "</p>";
            html += '<div class="sk-svar n' + s.svar.length + '">';
            s.svar.forEach(function (sv, j) {
                var kl = "sk-knap", laast = false;
                if (s.forkert[j]) { kl += " forkert"; laast = true; }
                html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + '><span class="v-bogstav">' + "ABC".charAt(j) + "</span><span>" + NK.html(sv.t) + "</span></button>";
            });
            return html + "</div>";
        }
        if (this.fase === "felt") {
            var f = tr.felt;
            html = '<p class="sk-tekst"><span class="sk-chip">Trin ' + nr + " af 10</span>" + NK.html(f.tekst) + "</p>";
            html += '<div class="sk-felt"><label for="felt">m(Salenvir) =</label><input id="felt" type="text" inputmode="decimal" autocomplete="off" spellcheck="false">' +
                '<span class="enhed">' + f.enhed + '</span><button type="button" class="sk-tjek" data-tjek="1">Tjek</button></div>';
            return html;
        }
        /* Forsoeget: den del, eleven er ved */
        var del = this.delNu(), d = del ? this.delData(del) : null;
        var prikker = "";
        tr.dele.forEach(function (x, j) {
            var idx = tr.dele.map(function (y) { return y.id; }).indexOf(del);
            prikker += '<i class="' + (j < idx ? "gjort" : (j === idx ? "nu" : "")) + '"></i>';
        });
        void mig;
        return '<p class="sk-tekst"><span class="sk-chip">Trin ' + nr + ' af 10<span class="sk-prikker">' + prikker + "</span></span>" +
            NK.html(d ? d.tekst : "") + "</p>";
    };

    P.visKort = function () {
        var e = el("skort");
        var kl = "scenekort " + (this.fase === "gaet" ? "gaet" : (this.fase === "loest" || this.fase === "mellem" ? "loest" + (this.brugtSvar && this.fase === "loest" ? " svar" : "") : (this.fase === "spm" || this.fase === "felt" ? "spm" : "opgave")));
        if (e.className.replace(" blink", "") !== kl) e.className = kl;
        if (this.fase === "felt") {
            /* Feltet bygges kun én gang, saa det, eleven skriver, bliver staaende */
            if (!el("felt")) {
                NK.saetHTML("ind", this.kortHTML());
                var f = el("felt");
                if (f) setTimeout(function () { try { f.focus(); } catch (x) { /* intet */ } }, 30);
            }
        } else {
            NK.saetHTML("ind", this.kortHTML());
        }
        this.visKnap();
    };

    P.kortBlink = function () {
        var e = el("skort");
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Laasen: scenen virker kun, mens kortet viser et forsoeg */
    P.spaer = function () {
        if (this.fase === "forsoeg") return false;
        this.kortBlink();
        return true;
    };

    /* ----- Hver frame: hvilken del er eleven ved? ---------------------------------- */
    P.tjekTrin = function () {
        if (this.fase !== "forsoeg") return;
        var del = this.delNu();
        if (del !== this.delSidst) {
            this.delSidst = del;
            this.hjaelp = 0;
            this.pegKnap = false;
            if (this.besk.klasse === "hint") this.besk = { html: "", klasse: "" };
            if (del === null) { this.forsoegFaerdigt(); return; }
            this.visKort();
        }
    };

    P.kortOpdater = function (dt) {
        if (this.kortT > 0) { this.kortT -= dt; if (this.kortT <= 0) { this.kortT = 0; this.visBund(); } }
        if (this.sejrT !== null && this.sejrT !== undefined) this.sejrT += dt;
        this.tjekTrin();
        /* Linjen med det, eleven skal vide ud over kortets tekst */
        if (this.fase === "forsoeg" && !this.kortT && (this.besk.klasse === "" || this.besk.klasse === "info")) {
            var l = this.delSidst ? this.linje(this.delSidst) : "";
            var html = l ? NK.html(l) : "";
            if (html !== this.besk.html) { this.besk = { html: html, klasse: html ? "info" : "" }; this.visBund(); }
        }
        NK.saetHTML("maal", this.panelHTML());
        /* Uret */
        var ur = el("ur");
        var vis = this.trinNr >= 3 && this.fase !== "gaet";
        if (ur.hidden === vis) ur.hidden = !vis;
        if (vis) {
            var m = Math.floor(this.S.ur), s = Math.floor((this.S.ur - m) * 60);
            NK.saetTekst("urtid", m + ":" + (s < 10 ? "0" : "") + s);
            var vent = this.fase === "forsoeg" && ["en-vent", "filtr-kold", "vej-toer", "tlc-koer"].indexOf(this.delSidst) >= 0;
            if (this.delSidst === "vej-igen" && this.S.urglasSted[this.S.aktivU] === "lampe") vent = true;
            if (this.fase === "mellem") vent = true;
            if (this.trinNr === 5 && this.fase === "forsoeg" && this.S.tlc.sted === "kammer") vent = true;
            var k = el("spolknap");
            if (k.classList.contains("banker") !== vent) k.classList.toggle("banker", vent);
        }
    };

    /* Trinnets forsoeg er gjort: spoergsmaal, felt eller det groenne kort */
    P.forsoegFaerdigt = function () {
        var tr = D.TRIN[this.trinNr], mig = this;
        this.hjaelp = 0;
        this.pegKnap = false;
        if (tr.id === "tlc") {
            var v = this.tlcVurdering();
            this.spm = { tekst: D.TLC_SPM.tekst, svar: D.TLC_SPM.svar, rigtig: v.rigtig, forkert: {}, hint: D.TLC_SPM.hint, vurdering: v, slags: "tlc" };
            this.fase = "spm";
        } else if (tr.id === "smp") {
            var s = this.smpVurdering();
            this.spm = { tekst: D.SMP_SPM.tekst(s.a, s.b), svar: D.SMP_SPM.svar, rigtig: s.rigtig, forkert: {}, hint: D.SMP_SPM.hint, vurdering: s, slags: "smp" };
            this.fase = "spm";
        } else if (tr.spm) {
            var r = 0;
            tr.spm.svar.forEach(function (x, j) { if (x.ok) r = j; });
            this.spm = { tekst: tr.spm.tekst, svar: tr.spm.svar, rigtig: r, forkert: {}, hint: tr.spm.hint, slags: "fast" };
            this.fase = "spm";
        } else if (tr.felt) {
            this.fase = "felt";
        } else {
            this.loest(this.slutFor(tr));
            return;
        }
        this.besk = { html: "", klasse: "" };
        this.visKort();
        void mig;
    };

    P.slutFor = function (tr) {
        var s = typeof tr.slut === "function" ? tr.slut(this.tal()) : tr.slut;
        if (tr.gaet && this.gaetValg >= 0) s = (tr.gaet.svar[this.gaetValg].ok ? "Dit gæt holdt. " : "Dit gæt holdt ikke. ") + s;
        return s;
    };

    P.loest = function (tekst) {
        this.fase = "loest";
        this.slutTekst = tekst;
        this.besk = { html: "", klasse: "" };
        this.sejrT = 0;
        this.visKort();
        this.visListe();
    };

    /* ----- Svarknapperne ------------------------------------------------------------ */
    P.svarValg = function (j) {
        var tr = D.TRIN[this.trinNr];
        if (this.fase === "gaet") {
            this.gaetValg = j;
            this.fase = "forsoeg";
            this.delSidst = undefined;
            this.visKort();
            this.tjekTrin();
            return;
        }
        if (this.fase !== "spm") return;
        var s = this.spm;
        if (j === s.rigtig) { this.spmRigtigt(); return; }
        s.forkert[j] = true;
        this.visKort();
        this.fejlLinje(this.spmFejl(j));
        void tr;
    };

    P.spmFejl = function (j) {
        var s = this.spm;
        if (s.slags === "tlc") {
            if (j === 2) return D.TLC_SPM.fejl.nyPlet;
            return s.rigtig === 0 ? D.TLC_SPM.fejl.faerdigMenNej : D.TLC_SPM.fejl.ikkeFaerdigMenJa;
        }
        if (s.slags === "smp") return s.rigtig === 1 ? D.SMP_SPM.fejlRent : D.SMP_SPM.fejlUrent;
        return s.svar[j].f || "Prøv igen.";
    };

    P.spmRigtigt = function () {
        var s = this.spm, tr = D.TRIN[this.trinNr];
        if (s.slags === "tlc") {
            if (!s.vurdering.faerdig) {
                this.fase = "mellem";
                this.slutTekst = s.vurdering.tekst;
                this.besk = { html: "", klasse: "" };
                this.visKort();
                return;
            }
            this.loest(s.vurdering.tekst);
            return;
        }
        if (s.slags === "smp") {
            var v = s.vurdering;
            this.loest((v.rent ? D.SMP_SPM.godtRent : D.SMP_SPM.godtUrent(v.vaad)) + " " + D.FAERDIG);
            return;
        }
        this.loest(tr.spm.godt || this.slutFor(tr));
    };

    /* ----- Feltet med udbyttet -------------------------------------------------------- */
    function tal(s) {
        s = String(s || "").replace(/\s/g, "").replace(",", ".").replace(/g$/i, "");
        if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
        return parseFloat(s);
    }

    P.feltTjek = function () {
        if (this.fase !== "felt") return;
        var f = el("felt"), v = tal(f ? f.value : "");
        var t = this.tal();
        if (isNaN(v)) { this.fejlLinje("Skriv massen som et tal, fx 1,52."); return; }
        if (Math.abs(v - t.svar) <= 0.011) {
            this.S.feltSvar = t.svar;
            this.loest(this.slutFor(D.TRIN[this.trinNr]));
            return;
        }
        if (f) { f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst"); }
        this.fejlLinje(D.TRIN[this.trinNr].felt.fejl(v, t));
    };

    /* ----- Videre ------------------------------------------------------------------------ */
    P.videre = function () {
        if (this.fase === "mellem") {
            /* En ny TLC-plade */
            var S = this.S;
            S.tlc = { sted: "bord", P: null, R: null, front: 0, iKammer: false, udviklet: false, uvT: 0, set: false, cirkler: false };
            S.spids.p.indhold = null; S.spids.r.indhold = null;
            this.fase = "forsoeg";
            this.delSidst = undefined;
            this.hjaelp = 0;
            this.besk = { html: "", klasse: "" };
            this.visKort();
            this.tjekTrin();
            return;
        }
        if (this.fase !== "loest") return;
        if (this.trinNr >= D.TRIN.length - 1) { this.springTil(0); return; }
        /* Det, der skal flytte med til naeste trin */
        var naeste = this.trinNr + 1;
        if (naeste === 8) { this.S.termo.sted = "bord"; }
        if (naeste === 9) { this.S.urglasSted = ["bord", "bord"]; }
        this.startTrin(naeste);
    };

    /* ----- Hjaelpeknappen ----------------------------------------------------------------- */
    P.hintListe = function () {
        var tr = D.TRIN[this.trinNr];
        if (this.fase === "spm") return this.spm.hint || [];
        if (this.fase === "felt") return tr.felt.hint(this.tal());
        var d = this.delSidst ? this.delData(this.delSidst) : null;
        return d ? d.hint : [];
    };

    P.knap = function () {
        if (this.fase === "loest" || this.fase === "mellem") { this.videre(); return; }
        if (this.fase === "gaet") return;
        var h = this.hintListe();
        this.pegKnap = false;
        if (this.hjaelp < h.length) {
            this.hjaelp++;
            this.besk = { html: '<span class="b-maerke">Hint' + (h.length > 1 ? " " + this.hjaelp + " af " + h.length : "") + "</span> " + NK.html(h[this.hjaelp - 1]), klasse: "hint" };
            this.visKnap();
            return;
        }
        /* Vis svaret */
        this.brugtSvar = true;
        this.besk = { html: "", klasse: "" };
        if (this.fase === "spm") {
            this.spmRigtigt();
            return;
        }
        if (this.fase === "felt") {
            var t = this.tal();
            var f = el("felt");
            if (f) f.value = D.komma(t.svar, 2);
            this.S.feltSvar = t.svar;
            this.loest(this.slutFor(D.TRIN[this.trinNr]));
            return;
        }
        var del = this.delSidst;
        if (del) this.goer(del);
        this.hjaelp = 0;
        this.tjekTrin();
        this.visKnap();
    };

    P.nulstilHjaelp = function () {
        if (this.besk.klasse === "skidt") this.besk = { html: "", klasse: "" };
        this.pegKnap = false;
        this.visKnap();
    };

    P.visKnap = function () {
        var k = el("knap");
        var tekst, klasse = "knap hjaelp";
        var h = this.fase === "gaet" || this.fase === "loest" || this.fase === "mellem" ? [] : this.hintListe();
        if (this.hjaelp < h.length) tekst = this.hjaelp === 0 ? "Giv et hint" : "Næste hint";
        else { tekst = "Vis svaret"; klasse += " svar"; }
        if (this.pegKnap) klasse += " peg";
        if (k.textContent !== tekst) k.textContent = tekst;
        if (k.className !== klasse) k.className = klasse;
        this.visBund();
    };

    P.visBund = function () {
        var slut = this.fase === "loest" || this.fase === "mellem" || this.fase === "gaet";
        var b = this.kortT > 0 && this.kortB ? this.kortB : this.besk;
        var e = el("besked"), st = el("status");
        if (e.innerHTML !== b.html) e.innerHTML = b.html;
        el("knap").hidden = slut;
        st.hidden = slut && !b.html;
        var kl = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (st.classList.contains("ryster") ? " ryster" : "");
        if (st.className !== kl) st.className = kl;
    };

    P.fejlLinje = function (tekst) {
        this.besk = { html: '<span class="b-maerke">Ikke endnu</span> ' + NK.html(tekst), klasse: "skidt" };
        this.pegKnap = true;
        this.visKnap();
        var st = el("status");
        st.classList.remove("ryster");
        void st.offsetWidth;
        st.classList.add("ryster");
    };

    /* En besked som svar paa noget i scenen; forsvinder efter sek sekunder */
    P.kortBesked = function (tekst, sek) {
        this.kortT = sek || 4;
        this.kortB = { html: NK.html(tekst), klasse: "gul" };
        this.visBund();
    };
}());
