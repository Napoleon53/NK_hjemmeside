/* =====================================================================
   fane.js - det, de tre faner har til faelles

   Moensteret er scenekortet fra sc7.5 og sc6.4: der er ingen laerer, og
   der staar ingen tekst nederst i scenen. AL tekst staar paa ét kort
   oeverst midt i scenen (brugerens oensker 9. okt. 2026), og den gule
   hjaelpeknap sidder paa kortet. Whiteboardet begynder under kortet.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa fanens id'er), naesteFane og naesteNavn
   (knappen efter den sidste opgave).

     * opgaverne: fanen laver dem ud fra de stofklasser, der er slaaet til
       (lavOpgaver). Skifter eleven stofklasser, bygges listen om, og det,
       der er loest, huskes paa stoffets navn (saetAktive)
     * listen i panelet: opgaverne som numre i grupperne Let, Middel og
       Svaer, med flueben og stjerne (huskes i browseren)
     * scenekortet (visKort): opgaven eller spoergsmaalet, det, fanen
       laegger paa kortet (navnets dele), og svarene som knapper. Naar
       opgaven er loest, bliver kortet groent med forklaringen og knappen
       Naeste opgave
     * kortets nederste raekke: hint, forklaringen til et forkert svar og
       svaret paa et klik i scenen, og den gule hjaelpeknap: Giv et hint >
       Naeste hint > Vis svaret
     * laasen: naar kortet er groent og venter paa Naeste, sker der intet
       ved et klik i scenen; kortets groenne knap blinker (spaer)
     * musen i scenen

   Fanen selv SKAL have:
     lavOpgaver(aktive) listen af opgaver: [{ id, niv, ... }]
     nyOpgave(o)        stil scenen op til opgaven
     kortData()         { slags: "opgave" | "spm", chip, tekst, ekstra (HTML),
                          svar: [{ t, klasse, laast }], kolonner }
     slutEkstra()       HTML oeverst paa det groenne kort (eller "")
     svarValg(j)        eleven trykkede paa svar nummer j
     hintNu()           hinttrappen for det, eleven staar i lige nu
     visSvar()          goer det for eleven (hjaelpeknappens sidste trin)
     layout(), tegn()
   Fanen KAN have: efterHint(n), opdaterScene(dt), nulstilScene(),
   overScene, nedScene, flytScene, opScene, klikScene, hoejreScene.

   Fanen KALDER: loest(maade, tekst), fejlLinje(tekst), godLinje(tekst),
   kortBesked(tekst, sek), visKort(), nulstilHjaelp().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb4.8-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function () {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = [];
            this.status = [];
            this.nr = 0;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.el = { knap: el("knap"), liste: el("liste"), besked: el("besked"), status: el("status"), skort: el("skort") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.skort.addEventListener("click", function (e) {
                if (!e.target.closest) return;
                if (e.target.closest("[data-videre]")) { mig.knap(); return; }
                var k = e.target.closest("[data-valg]");
                if (!k || k.disabled || mig.faerdig) return;
                mig.svarValg(parseInt(k.getAttribute("data-valg"), 10));
            });
            this.koblMus();
        };

        /* ----- Opgaverne og stofklasserne ---------------------------------------
           Kaldes ved start, og hver gang eleven slaar en stofklasse til eller
           fra. Den opgave, eleven staar i, bliver staaende, hvis den stadig er med. */
        P.saetAktive = function (aktive) {
            var nu = this.opg ? this.opg.id : null;
            this.aktive = aktive.slice();
            this.opgaver = this.lavOpgaver(this.aktive);
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = this.opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.bygListe();
            var i = nu === null ? -1 : this.idx(nu);
            if (i >= 0) {
                this.nr = i;
                if (this.aktiveSkiftet) this.aktiveSkiftet();
                this.visKort();
                this.visListe();
                return;
            }
            this.nr = this.opgaver.length - 1;
            var foerste = this.naesteUloeste();
            this.vaelg(foerste >= 0 ? foerste : 0);
        };

        P.idx = function (id) {
            for (var i = 0; i < this.opgaver.length; i++) if (this.opgaver[i].id === id) return i;
            return -1;
        };

        /* ----- Hukommelse: det, der er loest, huskes paa stoffets navn ------------- */
        P.gem = function () {
            var ud = NK.hent(NOEGLE, {}) || {}, mig = this;
            this.opgaver.forEach(function (o, i) {
                var s = mig.status[i];
                if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
            });
            NK.gem(NOEGLE, ud);
        };

        P.antalLoest = function () {
            return this.status.filter(function (s) { return s.loest; }).length;
        };

        /* ----- Listen i panelet -------------------------------------------------- */
        P.bygListe = function () {
            var mig = this;
            this.el.liste.innerHTML = "";
            this.chips = [];
            [1, 2, 3].forEach(function (niv) {
                var med = mig.opgaver.filter(function (o) { return o.niv === niv; });
                if (!med.length) return;
                var boks = document.createElement("div");
                boks.className = "opg-gruppe";
                var hoved = document.createElement("div");
                hoved.className = "opg-hoved";
                hoved.innerHTML = "<span>" + D.NIVEAUER[niv - 1] + '</span><span class="opg-tal" id="' + navn + "-gt-" + niv + '"></span>';
                boks.appendChild(hoved);
                var raekke = document.createElement("div");
                raekke.className = "opg-chips";
                mig.opgaver.forEach(function (o, i) {
                    if (o.niv !== niv) return;
                    var knap = document.createElement("button");
                    knap.type = "button";
                    knap.className = "opg-chip";
                    knap.title = "Opgave " + (i + 1);
                    knap.innerHTML = '<span class="oc-f">' + (i + 1) + '</span><i class="oc-m"></i>';
                    knap.addEventListener("click", function () { mig.vaelg(i); });
                    raekke.appendChild(knap);
                    mig.chips[i] = knap;
                });
                boks.appendChild(raekke);
                mig.el.liste.appendChild(boks);
            });
            NK.saetTekst(navn + "-ialt", String(this.opgaver.length));
        };

        P.visListe = function () {
            var mig = this, pr = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
            this.status.forEach(function (s, i) {
                var c = mig.chips[i], o = mig.opgaver[i];
                pr[o.niv][1]++;
                if (s.loest) pr[o.niv][0]++;
                if (!c) return;
                c.classList.toggle("valgt", i === mig.nr);
                c.classList.toggle("loest", s.loest);
                c.classList.toggle("stjerne", s.stjerne);
                c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
            });
            [1, 2, 3].forEach(function (niv) {
                var e = NK.el(navn + "-gt-" + niv);
                if (e) e.textContent = pr[niv][0] + "/" + pr[niv][1];
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.slut = null;
            this.sejrT = null;
            this.opg = this.opgaver[i];
            this.besked("", "");
            this.nyOpgave(this.opg);
            this.visKort();
            this.layout();
            this.visListe();
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Scenekortet ---------------------------------------------------------- */
        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "Start forfra ↺";
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen. Whiteboardet begynder
           under den, saa intet flytter sig, naar kortet skifter indhold. */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? 214 : 244;
        };

        P.visKort = function () {
            var e = this.el.skort, html, kl;
            if (!this.opg) return;
            if (this.faerdig) {
                var slut = this.slut || { maade: "selv", tekst: "" };
                kl = "scenekort loest" + (slut.maade === "svar" ? " svar" : "");
                html = (this.slutEkstra ? this.slutEkstra() : "") +
                    '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + (slut.maade === "svar" ? "Svaret" : "Løst ✓") + "</span>" +
                    (slut.fed ? '<b class="sk-svaret">' + NK.html(slut.fed) + "</b> " : "") + NK.html(slut.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(this.videreTekst()) + "</button></div>";
            } else {
                var k = this.kortData();
                kl = "scenekort " + (k.slags === "spm" ? "spm" : "opgave");
                html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(k.chip) + "</span>" + NK.html(k.tekst) + "</p>" + (k.ekstra || "");
                if (k.svar && k.svar.length) {
                    html += '<div class="sk-svar brikker" style="grid-template-columns: repeat(' + (k.kolonner || k.svar.length) + ', minmax(0, 1fr));">';
                    k.svar.forEach(function (sv, j) {
                        html += '<button type="button" class="sk-knap brik' + (sv.prik ? " medprik" : "") + (sv.klasse ? " " + sv.klasse : "") + '" data-valg="' + j + '"' +
                            (sv.laast ? " disabled" : "") + ">" + (sv.prik ? '<i class="brikprik" style="background-color:' + sv.prik + '"></i>' : "") +
                            "<span>" + NK.html(sv.t) + "</span></button>";
                    });
                    html += "</div>";
                }
            }
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", html);
            this.visKnap();
        };

        /* Kortet blinker: eleven klikkede i scenen, men skal foerst goere det,
           kortet siger. Er kortet groent, er det knappen Naeste, der blinker. */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: er opgaven loest, sker der intet i scenen, foer eleven gaar videre */
        P.spaer = function () {
            if (!this.faerdig) return false;
            this.kortBlink();
            return true;
        };

        /* ----- Hjaelpeknappen: ét skridt hjaelp ad gangen ------------------------------ */
        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            if (this.faerdig) tekst = this.videreTekst();
            else {
                var h = this.hintNu() || [];
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.visBund();
        };

        /* Kortets nederste raekke: beskeden og hjaelpeknappen. Naar opgaven er loest,
           er raekken vaek, medmindre et klik i scenen lige har faaet et svar. */
        P.visBund = function () {
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = !!this.faerdig;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = !!this.faerdig && !harTekst;
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
        };

        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg((this.nr + 1) % this.opgaver.length);
                return;
            }
            var h = this.hintNu() || [];
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " + NK.html(h[this.hjaelp - 1]), "hint");
                if (this.efterHint) this.efterHint(this.hjaelp);
                this.visKnap();
                return;
            }
            this.brugtSvar = true;
            this.hjaelp = 0;
            this.besked("", "");
            this.visSvar();
            this.visKnap();
        };

        /* Eleven er kommet et skridt videre: hinttrappen begynder forfra */
        P.nulstilHjaelp = function () {
            this.hjaelp = 0;
            this.pegKnap = false;
            this.visKnap();
        };

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (maade, tekst, fed) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            if (this.brugtSvar) maade = "svar";
            this.faerdig = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            this.sejrT = 0;
            var alle = this.antalLoest() === this.opgaver.length;
            this.slut = { maade: maade, fed: fed || "", tekst: (tekst || "") + (alle && foerste ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
            this.visKort();
            this.visListe();
        };

        /* ----- Kortets nederste raekke ------------------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen, der
           forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (tekst, sek, klasse) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: klasse || "peger" });
        };

        P.visBesked = function (b) {
            this.el.besked.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked.hidden ? "" : this.el.besked.textContent; };

        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">Rigtigt</span> ' + NK.html(tekst), "god");
        };

        /* Et forkert svar: forklaringen, et ryst og en hjaelpeknap, der lyser stille */
        P.fejlLinje = function (tekst) {
            this.besked('<span class="b-maerke">Ikke endnu</span> ' + NK.html(tekst), "skidt");
            this.pegKnap = true;
            this.visKnap();
            var e = this.el.status;
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        /* ----- Forfra, stoerrelse og tegneloekken ---------------------------------- */
        P.nulstil = function () {
            if (this.faerdig) return;
            if (this.nulstilScene) this.nulstilScene();
        };

        P.fokus = function () { };

        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(navn + "-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

        /* Whiteboardet under kortet */
        P.tavleLayout = function () {
            var L = this.L, top = 10 + this.kortZone() + 12, side = Math.round(NK.klamp(L.b * 0.02, 12, 22));
            var bund = Math.round(NK.klamp(L.h * 0.035, 14, 24));
            var t = { x: side, y: top, b: L.b - 2 * side, h: Math.max(160, L.h - top - bund - 12) };
            return { W: L.b, H: L.h, tavle: t, bakke: { x: t.x - 6, y: t.y + t.h, b: t.b + 12, h: 12 } };
        };

        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.sejrT !== undefined && this.sejrT !== null) this.sejrT += dt;
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* Det groenne glimt over whiteboardet, naar en opgave er loest */
        P.tegnSejr = function (ctx, t) {
            if (!this.faerdig || this.sejrT === null || this.sejrT === undefined || this.sejrT > 0.9) return;
            ctx.save();
            ctx.globalAlpha = 0.16 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(t.x, t.y, t.b, t.h);
            ctx.restore();
        };

        /* ----- Musen -------------------------------------------------------------
           Holder fanen tag i noget, faar den ogsaa flytningerne og slippet,
           ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt, e); return; }
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u || "default";
            });
            c.addEventListener("pointerleave", function () {
                if (!mig.greb) { if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; }
            });
            c.addEventListener("pointerdown", function (e) {
                var pt = mig.L.punkt(e);
                if (e.button === 2) { if (mig.hoejreScene) mig.hoejreScene(pt, e); return; }
                if (e.button !== undefined && e.button !== 0) return;
                mig.slapNetop = false;
                if (mig.nedScene && mig.nedScene(pt, e)) {
                    mig.greb = true;
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                    e.preventDefault();
                }
            });
            function slip(e) {
                if (!mig.greb) return;
                mig.greb = false;
                if (mig.opScene) mig.opScene(mig.L.punkt(e), e);
                mig.slapNetop = true;
            }
            c.addEventListener("pointerup", slip);
            c.addEventListener("pointercancel", slip);
            c.addEventListener("contextmenu", function (e) { e.preventDefault(); });
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.slapNetop) { mig.slapNetop = false; return; }
                if (mig.klikScene) mig.klikScene(pt);
            });
        };
    }

    /* ----- Faelles tegning: molekylet paa whiteboardet --------------------------
       geo(mol, tavle, valg): motorens geometri, skaleret saa molekylet fylder
       tavlen uden at blive kaempestort. Giver { geo, s }. */
    function geo(mol, tv, v) {
        v = v || {};
        function med(s, ox, oy) {
            return NK.Struktur.geometri(mol, {
                skala: s, ox: ox, oy: oy, stil: "zigzag", farve: "#1d2433",
                skrift: NK.klamp(s * 0.36, 15, 30), linje: NK.klamp(s * 0.05, 2.2, 3.8),
                atomFarve: v.atomFarve, bindingFarve: v.bindingFarve, lokanter: v.lokanter
            });
        }
        var s0 = 60, g = med(s0, 0, 0);
        var b = (g.x1 - g.x0) || 1, h = (g.y1 - g.y0) || 1;
        var s = Math.min(s0 * (tv.b - 150) / b, s0 * (tv.h - 96) / h, v.maks || 104);
        s = Math.max(s, 26);
        g = med(s, 0, 0);
        var ox = tv.x + tv.b / 2 - (g.x0 + g.x1) / 2, oy = tv.y + tv.h / 2 + (v.ned || 0) - (g.y0 + g.y1) / 2;
        return { geo: med(s, ox, oy), s: s };
    }

    /* Det atom, der er naermest punktet (inden for en halv binding) */
    function atomVed(mol, g, s, pt) {
        var bedst = null, bd = s * 0.45;
        mol.atomer.forEach(function (a) {
            var p = g.P[a.id];
            if (!p) return;
            var d = Math.hypot(pt.x - p.x, pt.y - p.y);
            if (d < bd) { bd = d; bedst = a.id; }
        });
        return bedst;
    }

    /* En bred, gennemsigtig streg langs bindingerne mellem atomerne i maengden,
       og en plet bag de atomer, der staar alene */
    function glorie(ctx, mol, g, s, maengde, farve, alfa, bredde) {
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 0.28 : alfa;
        ctx.strokeStyle = ctx.fillStyle = farve;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = s * (bredde || 0.46);
        var iBinding = {};
        ctx.beginPath();
        mol.bindinger.forEach(function (bd) {
            if (!maengde[bd.a] || !maengde[bd.b]) return;
            var A = g.P[bd.a], B = g.P[bd.b];
            if (!A || !B) return;
            iBinding[bd.a] = iBinding[bd.b] = true;
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
        });
        ctx.stroke();
        Object.keys(maengde).forEach(function (k) {
            if (!maengde[k] || iBinding[k]) return;
            var p = g.P[k];
            if (!p) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, s * (bredde ? bredde * 0.62 : 0.3), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    function ring(ctx, p, r, farve, fyld, bredde) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        if (fyld) { ctx.fillStyle = fyld; ctx.fill(); }
        ctx.strokeStyle = farve;
        ctx.lineWidth = bredde || 3;
        ctx.stroke();
        ctx.restore();
    }

    /* Navnets dele som farvede brikker paa kortet.
       dele: [{ type, tekst, fyldt, aktiv, vist }]. En tom plads er stiplet,
       den plads, eleven er ved, er gul. etiketter: skriv delens navn under. */
    function navnHTML(dele, valg) {
        valg = valg || {};
        var html = '<div class="navnelinje' + (valg.stor ? " stor" : "") + (valg.klasse ? " " + valg.klasse : "") + '">';
        if (valg.foran) html += '<span class="nl-foran">' + NK.html(valg.foran) + "</span>";
        dele.forEach(function (d) {
            var info = D.DELE[d.type];
            var kl = "nl-del" + (d.fyldt ? " fyldt" : " tom") + (d.aktiv ? " aktiv" : "") + (d.vist ? " vist" : "");
            html += '<span class="' + kl + '" style="--delfarve:' + info.farve + '">' +
                '<span class="nl-tekst">' + (d.fyldt ? NK.html(d.tekst) : "?") + "</span>" +
                '<span class="nl-etiket">' + NK.html(info.navn) + "</span></span>";
        });
        return html + "</div>";
    }

    NK.Fane = { paa: paa, geo: geo, atomVed: atomVed, glorie: glorie, ring: ring, navnHTML: navnHTML };
}());
