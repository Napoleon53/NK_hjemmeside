/* =====================================================================
   sim_navne.js - fane 3: navne (de tre faner fra den gamle 6.4)

   Byg ud fra navnet
     Navnet staar i panelet. Eleven tegner molekylet paa tavlen. Naar alle
     C-atomer er brugt, tjekkes tegningen (NK.Tjek.tegning). Alkenerne med
     cis/trans skal tegnes rigtigt vendt.
   Giv navnet
     Molekylet staar paa tavlen. Eleven skriver navnet (NK.Tjek.navn).
     Hintet farver hovedkaeden groen og nummererer den.

   To slags: alkaner (NK.Opgaver.ALKANER) og alkener (ALKENER, de sidste
   fem med cis/trans). Hver af de fire kombinationer er en serie paa ti.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var O = NK.Opgaver;
    var GROEN = "#1d7a48", BLAA = "#2563eb";

    function nySerie(slags) {
        var liste = O.serie(slags === "alkener" ? O.ALKENER : O.ALKANER);
        return { liste: liste, nr: 0, status: liste.map(function () { return 0; }), mini: -1 };
    }

    function SimNavne() {
        this.retning = "byg";
        this.slags = "alkaner";
        this.serier = {};
        this.startFane();
        this.bygPanel();
        this.startOpgave();
    }

    var P = SimNavne.prototype;
    NK.Fane.bland(P, "nv");

    P.regler = function () {
        var mig = this;
        return {
            kunC: true, dobbelt: true, enDobbelt: true, knaek: true, sletAlt: false,
            maks: function () { return mig.maal ? mig.maal.antal : 99; },
            maksTekst: function () { return "Alle " + mig.maal.antal + " C-atomer er brugt."; }
        };
    };

    P.noegle = function () { return this.retning + "-" + this.slags; };

    P.serie = function () {
        var k = this.noegle();
        if (!this.serier[k]) this.serier[k] = nySerie(this.slags);
        return this.serier[k];
    };

    P.startOpgave = function () {
        var s = this.serie(), b = this.braet;
        this.maal = s.liste[s.nr];
        this.hjaelp = 0;
        this.loest = false;
        this.visteSvar = false;
        this.besked("", "");
        b.atomFarve = b.bindingFarve = b.lokanter = b.visC = null;
        b.hist = [];
        b.frem = [];
        var inp = NK.el("nv-input");
        inp.value = "";
        inp.disabled = false;
        NK.el("nv-felt").classList.remove("ok", "svar");
        if (this.retning === "byg") {
            b.laast = false;
            b.nulstil(true, true);
        } else {
            b.laast = true;
            var m = this.maal.mol.kopi();
            b.saet(m, true);
        }
        this.visPanel();
        if (this.retning === "navn" && NK.el("fane-navne").classList.contains("aktiv")) inp.focus();
    };

    P.naeste = function () {
        var s = this.serie(), ledig = -1;
        for (var k = 1; k <= s.liste.length; k++) {
            var i = (s.nr + k) % s.liste.length;
            if (!s.status[i]) { ledig = i; break; }
        }
        if (ledig < 0) this.serier[this.noegle()] = nySerie(this.slags);
        else s.nr = ledig;
        this.startOpgave();
    };

    P.nulstil = function () { if (this.retning === "byg" && !this.loest) this.braet.nulstil(true); };

    P.skala = function () {
        var t = this.lay ? this.lay.tavle : { b: 700, h: 450 };
        var s = NK.klamp(Math.min(t.b / 13, t.h / 7.2), 34, 58);
        /* Molekylet, der skal navngives, fylder tavlen */
        if (this.retning === "navn" && this.maal) {
            var g = this.maal.mol.graenser();
            var bb = g.x1 - g.x0 + 1.6, hh = g.y1 - g.y0 + 1.8;
            s = NK.klamp(Math.min((t.b - 40) / bb, (t.h - 40) / hh), 34, 74);
        }
        return Math.round(s);
    };

    /* ----- Byg ud fra navnet -------------------------------------------------- */
    P.aendret = function (hvad) {
        if (hvad === "laerer" || this.retning !== "byg" || this.loest) return;
        if (this.braet.antal() === this.maal.antal) {
            var res = NK.Navn.analyser(this.braet.mol);
            var r = NK.Tjek.tegning(res, this.maal, true);
            if (r.ok) { this.loes(res, false); return; }
            this.besked(NK.html(r.besked), "skidt");
        } else if (this.beskedKlasse === "skidt") this.besked("", "");
        this.visPanel();
    };

    P.loes = function (res, vist) {
        var s = this.serie();
        this.loest = true;
        this.visteSvar = vist;
        s.status[s.nr] = vist ? 2 : 1;
        s.mini = s.nr;
        this.braet.laast = true;
        this.farv(res, true);
        if (!vist) { if (this.afvisTilbud) this.afvisTilbud(); this.konfetti(false); }
        /* Serien er klaret: klistermaerket kraever, at hoejst tre svar er vist */
        if (s.status.every(function (x) { return x > 0; })) {
            var vistAntal = s.status.filter(function (x) { return x === 2; }).length;
            this.klaret("nv-" + this.retning + "-" + this.slags, vistAntal <= 3, D.ROS[this.retning]);
        }
        this.visPanel();
    };

    /* Hovedkaeden groen med numre, sidegrupperne blaa */
    P.farv = function (res, medSider) {
        var b = this.braet, kaede = {}, side = {}, lok = {};
        if (!res || !res.kaede) return;
        res.kaede.forEach(function (id, i) { kaede[id] = true; lok[id] = i + 1; });
        (res.sub || []).forEach(function (x) { x.atomer.forEach(function (id) { side[id] = true; }); });
        b.bindingFarve = function (bd) {
            if (kaede[bd.a] && kaede[bd.b]) return GROEN;
            if (medSider && (side[bd.a] || side[bd.b])) return BLAA;
            return null;
        };
        b.lokanter = lok;
    };

    /* ----- Giv navnet -------------------------------------------------------------- */
    P.tjekNavn = function () {
        if (this.retning !== "navn" || this.loest) return;
        var inp = NK.el("nv-input"), felt = NK.el("nv-felt");
        var r = NK.Tjek.navn(inp.value, this.maal);
        if (r.ok) {
            this.loes(this.maal.res, this.visteSvar);
            this.besked("<b>Rigtigt: " + NK.html(this.maal.navn) + ".</b>" + (r.note ? " " + NK.html(r.note) : ""), "god");
            felt.classList.add("ok");
            inp.disabled = true;
            return;
        }
        this.besked(NK.html(r.besked), r.tom ? "" : "skidt");
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    };

    /* ----- Knappen ------------------------------------------------------------------ */
    P.knap = function () {
        if (this.loest) { this.naeste(); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + this.hint(), "gul");
            this.visPanel();
            return;
        }
        this.visSvar();
    };

    P.hint = function () {
        var r = this.maal.res, n = r.kaede.length;
        var kaede = NK.Navn.kaedeNavn(r);
        if (this.retning === "byg") {
            var t = "Start med hovedkæden: " + kaede + " er " + n + " C i træk";
            if (r.dobbelt.length) t += " med dobbeltbindingen efter C" + r.dobbelt[0];
            t += ". Sæt så sidegrupperne på de C-atomer, numrene siger.";
            if (this.maal.stereo) t += this.maal.stereo === "cis" ? " cis: kædens to dele på samme side af dobbeltbindingen." : " trans: kædens to dele på hver sin side af dobbeltbindingen.";
            return t;
        }
        this.farv(r, false);
        return "Hovedkæden er grøn og nummereret: " + n + " C, altså " + kaede + ". Navngiv sidegrupperne efter numrene" +
            (this.maal.stereo ? ", og husk cis eller trans foran." : ".");
    };

    P.visSvar = function () {
        if (this.retning === "byg") {
            var m = this.maal.mol.kopi();
            this.braet.saet(m, true);
            this.loes(NK.Navn.analyser(m), true);
            this.besked("Sådan ser <b>" + NK.html(this.maal.navn) + "</b> ud. Hovedkæden er grøn, sidegrupperne blå.", "gul");
            return;
        }
        this.visteSvar = true;
        var inp = NK.el("nv-input");
        inp.value = this.maal.navn;
        inp.disabled = true;
        NK.el("nv-felt").classList.add("svar");
        this.loes(this.maal.res, true);
        this.besked("Svaret: <b>" + NK.html(this.maal.navn) + "</b>.", "gul");
    };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        NK.el("nv-knap").addEventListener("click", function () { mig.knap(); });
        NK.el("nv-ok").addEventListener("click", function () { mig.tjekNavn(); });
        NK.el("nv-input").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); if (mig.loest) mig.knap(); else mig.tjekNavn(); }
        });
        NK.el("nv-forfra").addEventListener("click", function () {
            mig.serier[mig.noegle()] = nySerie(mig.slags);
            mig.startOpgave();
        });
        function skifter(id, felt) {
            Array.prototype.forEach.call(document.querySelectorAll("#" + id + " button"), function (k) {
                k.addEventListener("click", function () {
                    var v = k.getAttribute("data-v");
                    if (mig[felt] === v) return;
                    mig[felt] = v;
                    mig.startOpgave();
                });
            });
        }
        skifter("nv-retning", "retning");
        skifter("nv-slags", "slags");
    };

    P.besked = function (html, klasse) {
        var e = NK.el("nv-besked");
        e.innerHTML = html;
        e.className = "besked" + (klasse ? " " + klasse : "");
        this.beskedKlasse = klasse;
    };

    P.visPanel = function () {
        var s = this.serie(), mig = this, byg = this.retning === "byg";
        [["nv-retning", "retning"], ["nv-slags", "slags"]].forEach(function (p) {
            Array.prototype.forEach.call(document.querySelectorAll("#" + p[0] + " button"), function (k) {
                k.classList.toggle("aktiv", k.getAttribute("data-v") === mig[p[1]]);
            });
        });
        NK.saetTekst("nv-titel", byg ? "Byg molekylet" : "Giv molekylet navn");
        NK.saetTekst("nv-nr", String(s.nr + 1));
        NK.saetHTML("nv-prompt", byg ? NK.html(this.maal.navn) + "<small>" + this.maal.formel + "</small>" : "");
        NK.saetTekst("nv-spm", byg ? "Tegn molekylet på tavlen." : "Molekylet står på tavlen. Skriv dets navn.");
        NK.el("nv-taelrad").hidden = !byg;
        NK.saetTekst("nv-tael", this.braet.antal() + " af " + this.maal.antal);
        NK.el("nv-felt").hidden = byg;
        var knap = NK.el("nv-knap");
        if (this.loest) {
            knap.textContent = s.status.every(function (x) { return x > 0; }) ? "Ny serie ↺" : "Næste molekyle →";
            knap.className = "knap blaa banker";
        } else {
            knap.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            knap.className = "knap";
        }
        NK.el("nv-kort").classList.toggle("sejr", this.loest && !this.visteSvar);
        NK.saetTekst("nv-loest", String(s.status.filter(function (x) { return x > 0; }).length));
        NK.Fane.prikker("nv-prikker", s.status, s.nr, function (i) { s.mini = i; mig.visMini(); });
        this.visMini();
        this.visStatus();
    };

    P.visMini = function () {
        var s = this.serie(), i = s.mini;
        if (i < 0 || !s.status[i]) { NK.saetHTML("nv-mini", ""); return; }
        var m = s.liste[i];
        NK.saetHTML("nv-mini", NK.Fane.miniature(m.mol, m.res, 360, 150) + NK.html(m.navn) +
            '<span class="mini-note">Molekyle ' + (i + 1) + (s.status[i] === 2 ? ", svaret vist" : "") + "</span>");
    };

    P.visStatus = function () {
        if (this.loest) { this.status(D.STATUS.loest); return; }
        if (this.retning === "navn") { this.status(D.STATUS.navnSkriv); return; }
        var n = this.braet.antal();
        this.status(n <= 1 ? D.STATUS.tegnStart : (n >= this.maal.antal ? D.STATUS.tegnFuld : D.STATUS.tegnVidere));
    };

    P.opdaterEkstra = function () {
        if (this.retning === "byg" && !this.loest) {
            NK.saetTekst("nv-tael", this.braet.antal() + " af " + this.maal.antal);
            this.visStatus();
        }
    };

    P.tegnFane = function (ctx) {
        var navn = this.retning === "navn";
        this.braet.tegn(ctx, navn ? { udenHaandtag: true, linje: Math.max(2.6, this.skala() * 0.055) } : null);
    };

    P.enter = function () { if (this.loest) this.knap(); else this.tjekNavn(); };
    P.fokus = function () { if (this.retning === "navn" && !this.loest) NK.el("nv-input").focus(); };

    NK.Praesentation.kobl(P, { noegle: "nk-sc6.2-intro-navne", tilbud: "nv-tilbud", spring: "nv-spring" });
    P.pegPaaFelt = function (til) { NK.el("nv-felt").classList.toggle("peg", til && this.retning === "navn"); };

    NK.SimNavne = SimNavne;
}());
