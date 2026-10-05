/* =====================================================================
   sim_udstilling.js - fane 1: Udstillingen

   Otte sten staar paa hylder, ordnet efter den negative ion, som paa
   Museo Geominero. Eleven klikker paa en sten og skriver
   oxidationstallet over atomerne paa stenens skilt. Et tal med blyant
   er givet. Tasterne under formlen skriver i det valgte felt, og naar
   alle felter er fyldt, tjekkes svaret af sig selv.

   Hver loest sten faar sine tal paa hylden og en prik paa trappen i
   panelet, hvor svovl og jern har hver sin raekke fra −II til +VI.

   Den sidste sten er pyrit: reglen for sulfid giver Fe +IV, men jern
   er +II, saa S bliver −I. Det er indgangen til fane 2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var X = NK.Redox;
    var lav = NK.Formel.lav;

    function Sim() { this.init(); }
    var P = Sim.prototype;
    NK.Fane.paa(P, { navn: "u", naesteFane: "fane-p", naesteNavn: "Pyrit" });

    P.init = function () {
        D.MINERALER.forEach(function (m) { m.formel = m.vis || X.stof(m.f).tekst + (m.efter || ""); });
        this.sten = {};
        this.klikPyrit = 0;
        this.skilt = NK.el("u-skilt");
        this.bygMontre();
        this.bygTaster();
        this.startFane(D.MINERALER);
        this.vaelg(this.startOpgave());
    };

    /* ----- Hylderne med stenene ----------------------------------------------------- */
    P.bygMontre = function () {
        var mig = this, el = NK.el("u-montre");
        el.innerHTML = "";
        D.HYLDER.forEach(function (hylde) {
            var h = lav("div", "hylde"), raekke = lav("div", "hy-sten"), braet = lav("div", "hy-braet");
            hylde.forEach(function (gr) {
                var kl = D.KLASSER[gr.klasse];
                var skilt = lav("span", "hy-skilt");
                skilt.style.gridColumn = "span " + gr.sten.length;
                skilt.innerHTML = NK.html(kl.navn) + (kl.ion ? " <b>" + NK.html(kl.ion) + "</b>" : "");
                braet.appendChild(skilt);
                gr.sten.forEach(function (id) {
                    var m = D.MINERALER.filter(function (x) { return x.id === id; })[0];
                    var k = lav("button", "sten");
                    k.type = "button";
                    k.setAttribute("data-id", id);
                    k.setAttribute("aria-label", m.navn);
                    k.innerHTML = '<span class="st-billede">' + NK.Mineraler[id] + '</span><span class="st-navn">' + NK.html(m.navn) +
                        '</span><span class="st-tal"></span>';
                    k.addEventListener("click", function () { mig.klikSten(id); });
                    raekke.appendChild(k);
                    mig.sten[id] = k;
                });
            });
            h.appendChild(raekke);
            h.appendChild(braet);
            el.appendChild(h);
        });
    };

    P.klikSten = function (id) {
        var i = this.idx(id);
        if (i === this.nr) {
            /* Paaskeaeg: pyrit bliver ikke til guld af at blive klikket paa */
            if (id === "pyrit" && ++this.klikPyrit >= 3) { this.klikPyrit = 0; this.kortBesked(D.PAASKEAEG, 5); }
            this.fokus();
            return;
        }
        this.vaelg(i);
    };

    /* ----- Tasterne under formlen -------------------------------------------------------- */
    P.bygTaster = function () {
        var mig = this, el = NK.el("u-taster");
        el.innerHTML = "";
        D.TASTER.forEach(function (v) {
            var k = lav("button", "tast", X.ox(v));
            k.type = "button";
            k.setAttribute("data-v", String(v));
            /* Feltet skal beholde sit fokus, naar der trykkes paa en tast */
            k.addEventListener("mousedown", function (e) { e.preventDefault(); });
            k.addEventListener("click", function () { mig.tast(v); });
            el.appendChild(k);
        });
    };

    /* ----- En ny sten paa skiltet -------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var mig = this, m = this.opgaver[i], st = X.stof(m.f);
        var maerker = {};
        st.atomer.forEach(function (a, n) {
            if (m.spoerg.indexOf(a.s) >= 0) maerker[n] = "felt";
            else if (m.givet.indexOf(a.s) >= 0) maerker[n] = "givet";
        });
        this.opg = { m: m, st: st, tal: {}, felter: {}, valgt: null };
        this.klikPyrit = 0;
        var boks = NK.el("u-formel");
        this.pladser = NK.Formel.byg(boks, st, maerker, {
            spredt: true,
            noegle: function (n) { return "a" + n; },
            felt: function (noegle, a) { return mig.lavFelt(noegle, a, m); }
        });
        if (m.efter) boks.appendChild(lav("span", "hf-rest efter", m.efter));
        this.feltNoegler = Object.keys(this.pladser).filter(function (k) { return mig.pladser[k].slags === "felt"; });
        Object.keys(this.pladser).forEach(function (k) {
            var p = mig.pladser[k];
            if (p.slags !== "givet") return;
            p.tal.textContent = X.ox(p.a.ox);
            p.tal.className = "hf-oxtal blyant";
        });
        var kl = D.KLASSER[m.klasse];
        NK.saetTekst("u-sknavn", m.navn);
        NK.saetTekst("u-skspansk", m.spansk);
        NK.saetTekst("u-skklasse", kl.navn + (kl.ion ? " · " + kl.ion : ""));
        this.opg.valgt = this.feltNoegler[0];
        this.visFelter();
    };

    P.lavFelt = function (noegle, a, m) {
        var mig = this;
        var f = lav("span", "hf-felt ox");
        var inp = document.createElement("input");
        inp.type = "text";
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.setAttribute("aria-label", "Oxidationstallet for " + a.s + " i " + m.navn);
        inp.setAttribute("data-noegle", noegle);
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); mig.tjek(); } });
        inp.addEventListener("input", function () { f.classList.remove("fejl"); });
        inp.addEventListener("focus", function () { mig.opg.valgt = noegle; mig.visFelter(); });
        f.appendChild(inp);
        this.opg.felter[noegle] = { felt: f, inp: inp };
        return f;
    };

    P.mangler = function () {
        var g = this.opg;
        return this.feltNoegler.filter(function (k) { return !g.tal[k]; });
    };

    P.visFelter = function () {
        var mig = this, g = this.opg;
        this.feltNoegler.forEach(function (k) {
            var f = g.felter[k], p = mig.pladser[k], fundet = g.tal[k];
            f.felt.hidden = !!fundet;
            f.felt.classList.toggle("aktiv", !fundet);
            f.felt.classList.toggle("valgt", !fundet && g.valgt === k);
            p.tal.textContent = fundet ? X.ox(fundet.v) : "";
            p.tal.className = "hf-oxtal" + (fundet ? " " + fundet.slags : "");
        });
        NK.el("u-taster").classList.toggle("slukket", !!this.faerdig);
        var fakta = NK.el("u-fakta");
        fakta.textContent = this.faerdig ? g.m.fakta : "";
        this.skilt.classList.toggle("faerdig", !!this.faerdig);
    };

    /* Stenene paa hylderne: den valgte, de loeste og deres tal */
    P.visSten = function () {
        var mig = this;
        this.opgaver.forEach(function (m, i) {
            var k = mig.sten[m.id], loest = mig.status[i].loest;
            k.classList.toggle("valgt", i === mig.nr);
            k.classList.toggle("loest", loest);
            k.querySelector(".st-tal").textContent = loest ? mig.talTekst(m) : "";
        });
    };

    /* "Zn +II · S −II", "Fe +II og +III" */
    P.talTekst = function (m) {
        var st = X.stof(m.f), ud = [];
        m.spoerg.forEach(function (E) {
            var tal = [];
            st.atomer.forEach(function (a) { if (a.s === E && tal.indexOf(X.ox(a.ox)) < 0) tal.push(X.ox(a.ox)); });
            ud.push(E + " " + tal.join(" og "));
        });
        return ud.join(" · ");
    };

    /* ----- Trappen i panelet: hvor svovl og jern staar i de loeste sten -------------------- */
    P.visTrappe = function () {
        var mig = this, T = D.TRAPPE, celler = {}, andre = [], navne = [];
        this.opgaver.forEach(function (m, i) {
            if (!mig.status[i].loest) return;
            var st = X.stof(m.f), set = {};
            navne.push('<span class="tr-navn"><i class="tr-prik" style="background:' + NK.MineralFarve[m.id] + '"></i>' + NK.html(m.navn) + "</span>");
            st.atomer.forEach(function (a) {
                var k = a.s + "|" + a.ox;
                if (set[k] || a.s === "O" || a.s === "H" || a.s === "C") return;
                set[k] = true;
                if (T.raekker.indexOf(a.s) >= 0) (celler[k] = celler[k] || []).push(m);
                else if (andre.indexOf(a.s + " " + X.ox(a.ox)) < 0) andre.push(a.s + " " + X.ox(a.ox));
            });
        });
        var html = '<div class="trappe"><div class="tr-raekke akse"><span></span>';
        var v;
        for (v = T.fra; v <= T.til; v++) html += "<span>" + X.ox(v) + "</span>";
        html += "</div>";
        T.raekker.forEach(function (E) {
            html += '<div class="tr-raekke"><b>' + E + "</b>";
            for (v = T.fra; v <= T.til; v++) {
                html += '<span class="tr-celle">';
                (celler[E + "|" + v] || []).forEach(function (m) {
                    html += '<i class="tr-prik" style="background:' + NK.MineralFarve[m.id] + '" title="' + NK.html(m.navn) + '"></i>';
                });
                html += "</span>";
            }
            html += "</div>";
        });
        html += "</div>";
        if (navne.length) html += '<p class="tr-navne">' + navne.join("") + "</p>";
        else html += '<p class="note-tekst">Hver sten, du løser, får en prik ved sit oxidationstal.</p>';
        if (andre.length) html += '<p class="note-tekst">Metallerne: ' + NK.html(andre.join(" · ")) + "</p>";
        NK.saetHTML("u-trappe", html);
    };

    P.efterListe = function () {
        this.visSten();
        this.visTrappe();
    };

    P.visKortEkstra = function () {
        NK.saetTekst("u-tekst", "Klik på en sten, og find oxidationstallet for atomerne i formlen. Hylden viser, hvilken negativ ion stenen har.");
    };

    /* ----- Teksterne ------------------------------------------------------------------- */
    P.trinLinje = function () {
        var m = this.opg.m;
        if (this.mangler().length < this.feltNoegler.length) return "Skriv også det andet oxidationstal.";
        return m.linje + (this.antalLoest() === 0 ? " Klik på en tast under formlen, eller skriv tallet og tryk Enter." : "");
    };

    P.hintNu = function () { return this.opg.m.hint; };
    P.harFelter = function () { return !this.faerdig; };
    P.tagerTal = function () { return !this.faerdig; };

    /* ----- Eleven svarer ------------------------------------------------------------------ */
    P.vaelgFelt = function (k) {
        this.opg.valgt = k;
        this.visFelter();
        this.fokusFelt();
    };

    /* En tast skriver i det valgte felt. Er alle felter fyldt, tjekkes svaret. */
    P.tast = function (v) {
        var g = this.opg;
        if (this.faerdig) return;
        var mangler = this.mangler();
        var k = mangler.indexOf(g.valgt) >= 0 ? g.valgt : mangler[0];
        if (!k) return;
        g.felter[k].inp.value = X.ox(v);
        g.felter[k].felt.classList.remove("fejl");
        var tomme = mangler.filter(function (x) { return !g.felter[x].inp.value.trim(); });
        if (tomme.length) { this.vaelgFelt(tomme[0]); return; }
        this.tjek();
    };

    P.rystFelt = function (k) {
        var f = this.opg.felter[k].felt;
        f.classList.remove("fejl");
        void f.offsetWidth;
        f.classList.add("fejl");
    };

    P.fejlTekst = function (a, v) {
        var g = this.opg, m = g.m;
        if (isNaN(v)) return "Skriv et oxidationstal, fx +II, −I eller 0.";
        var saer = D.FEJL[g.st.formel + "|" + a.s + "|" + v];
        if (saer) return saer;
        if (v === -a.ox && v !== 0) return "Tjek fortegnet. " + m.hint[0];
        return m.hint[0];
    };

    P.tjek = function () {
        if (this.faerdig) return;
        var mig = this, g = this.opg, forste = null, noget = false;
        this.mangler().forEach(function (k) {
            var v = X.laesOx(g.felter[k].inp.value), a = mig.pladser[k].a;
            if (v === null) return;
            noget = true;
            if (v === a.ox) { g.tal[k] = { v: v, slags: "ok" }; return; }
            if (!forste) forste = { k: k, tekst: mig.fejlTekst(a, v) };
            mig.rystFelt(k);
        });
        var mangler = this.mangler();
        if (!mangler.length) {
            this.faerdig = true;
            this.visFelter();
            /* Stenens historie staar paa skiltet; linjen siger kun tallene */
            this.loest("selv", this.svarTekst(g.m));
            return;
        }
        if (forste) { g.valgt = forste.k; this.visFelter(); this.fejlLinje(forste.tekst); this.fokusFelt(); return; }
        if (!noget) { this.visFelter(); this.fejlLinje("Klik på en tast under formlen, eller skriv tallet i feltet, og tryk Enter."); this.fokusFelt(); return; }
        g.valgt = mangler[0];
        this.visFelter();
        this.nulstilHjaelp();
        this.godLinje(this.trinLinje());
        this.fokusFelt();
    };

    P.visSvar = function () {
        var mig = this, g = this.opg;
        this.feltNoegler.forEach(function (k) {
            if (!g.tal[k]) g.tal[k] = { v: mig.pladser[k].a.ox, slags: "vist" };
        });
        this.faerdig = true;
        this.visFelter();
        this.loest("svar", this.svarTekst(g.m));
    };

    /* "Zn er +II, og S er −II i zinkblende." */
    P.svarTekst = function (m) {
        var dele = this.talTekst(m).split(" · ").map(function (d) {
            var i = d.indexOf(" ");
            return d.slice(0, i) + " er " + d.slice(i + 1);
        });
        return (dele.length > 1 ? dele.slice(0, -1).join(", ") + ", og " + dele[dele.length - 1] : dele[0]) + " i " + m.navn.toLowerCase() + ".";
    };

    P.efterOpgave = function () { this.visFelter(); };

    P.enter = function () {
        if (this.faerdig) { this.knap(); return; }
        this.tjek();
    };

    P.fokusFelt = function () {
        var g = this.opg;
        if (this.faerdig || !g) return;
        var k = this.mangler().indexOf(g.valgt) >= 0 ? g.valgt : this.mangler()[0];
        if (!k) return;
        var i = g.felter[k].inp;
        if (document.activeElement !== i) {
            try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); }
        }
    };

    /* Formlen paa skiltet er saa stor, som skiltet har plads til */
    P.tilpas = function () {
        if (!this.erAktiv()) return;
        var h = this.skilt.clientHeight, b = this.skilt.clientWidth;
        if (!h || !b) return;
        var fs = NK.klamp(Math.min((h - 96) / 2.3, b / 13), 26, 64);
        this.skilt.style.setProperty("--fs", fs.toFixed(1) + "px");
    };

    NK.SimUdstilling = Sim;
}());
