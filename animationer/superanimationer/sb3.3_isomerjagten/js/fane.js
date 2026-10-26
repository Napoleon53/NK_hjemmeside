/* =====================================================================
   fane.js - scenekortet, hjaelpeknappen, Indsend svar, musen og konfetti

   Moensteret er scenekortet fra sc7.5, sb4.8 og sb3.1 med knappen
   Indsend svar fra sb4.4 (brugerens oensker 9. og 24. okt. 2026): AL
   tekst staar paa ét kort oeverst midt i scenen, der staar intet
   nederst, og intet loeses af et tilfaeldigt klik. Tegningen,
   spoergsmaalet og kogepunkterne bedoemmes foerst, naar eleven trykker
   Indsend svar. Whiteboardet begynder under kortet.

   NK.Fane.paa(P) laegger de faelles metoder paa fanens prototype.

   Fanen SKAL have:
     kortData()     { slags: "opgave" | "spm", chip, tekst, ekstra (HTML),
                      svar: [{ t, valgt, forkert }] }
     hintNu()       hinttrappen for det, eleven staar i lige nu
     visSvar()      hjaelpeknappens sidste trin
     kanSendes()    er der noget at sende ind?
     indsend()      eleven trykkede Indsend svar
     indsendTekst() teksten paa knappen (fx "Indsend svar: C₄H₁₀O")
     svarValg(j)    eleven valgte svar nummer j paa kortet
     videre()       eleven trykkede paa det groenne korts knap
     layout(), tegn()
   Fanen KAN have: opdaterScene(dt), overScene, nedScene, flytScene,
     opScene, klikScene, hoejreScene.

   Kortet er groent, naar this.groen er sat:
     { tekst, fed, maade: "selv" | "svar", knap: "Naeste ... →" }
   Saa sker der intet i scenen; kortets knap blinker (spaer).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function paa(P) {
        function el(id) { return NK.el("j-" + id); }

        P.startFane = function () {
            var mig = this;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.groen = null;
            this.el = {
                knap: el("knap"), indsend: el("indsend"), besked: el("besked"), status: el("status"),
                skort: el("skort"), ind: el("ind")
            };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            this.el.skort.addEventListener("click", function (e) {
                if (!e.target.closest) return;
                if (e.target.closest("[data-videre]")) { mig.videreKlik(); return; }
                var k = e.target.closest("[data-valg]");
                if (!k || k.disabled || mig.groen) return;
                mig.svarValg(parseInt(k.getAttribute("data-valg"), 10));
            });
            this.koblMus();
        };

        /* ----- Scenekortet ---------------------------------------------------- */
        P.kortZone = function () { return window.innerHeight <= 720 ? 172 : 196; };

        P.visKort = function () {
            var e = this.el.skort, html, kl;
            if (this.groen) {
                var g = this.groen;
                kl = "scenekort loest" + (g.maade === "svar" ? " svar" : "");
                html = '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + NK.html(g.chip || (g.maade === "svar" ? "Svaret" : "Rigtigt ✓")) + "</span>" +
                    (g.fed ? '<b class="sk-svaret">' + NK.html(g.fed) + "</b> " : "") + NK.html(g.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(g.knap) + "</button></div>";
            } else {
                var k = this.kortData();
                kl = "scenekort " + (k.slags === "spm" ? "spm" : "opgave") + (k.maal ? " medmaal" : "");
                html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(k.chip) + "</span>" + NK.html(k.tekst) + "</p>" + (k.ekstra || "");
                /* Den gule ramme med det, eleven jagter, staar til venstre for teksten */
                if (k.maal) html = '<div class="sk-maalrad">' + k.maal + '<div class="sk-maaltekst">' + html + "</div></div>";
                if (k.svar && k.svar.length) {
                    html += '<div class="sk-svar brikker" style="grid-template-columns: repeat(' + k.svar.length + ', minmax(0, 1fr));">';
                    k.svar.forEach(function (sv, j) {
                        html += '<button type="button" class="sk-knap brik' + (sv.valgt ? " valgt" : "") + (sv.forkert ? " forkert" : "") + '" data-valg="' + j + '"' +
                            (sv.forkert ? " disabled" : "") + "><span>" + NK.html(sv.t) + "</span></button>";
                    });
                    html += "</div>";
                }
            }
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            this.el.ind.innerHTML = NK.Data.sub(html);
            this.visKnap();
        };

        /* Kortet blinker: eleven klikkede i scenen, men skal foerst goere det,
           kortet siger. Er kortet groent, er det knappen, der blinker. */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        P.spaer = function () {
            if (!this.groen) return false;
            this.kortBlink();
            return true;
        };

        /* ----- Hjaelpeknappen og Indsend svar ------------------------------------- */
        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            var h = this.hintNu() || [];
            if (this.hjaelp === 0) tekst = "Giv et hint";
            else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
            else { tekst = "Vis svaret"; klasse += " svar"; }
            if (this.pegKnap) klasse += " peg";
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.visIndsend();
            this.visBund();
        };

        P.visIndsend = function () {
            var e = this.el.indsend;
            e.hidden = !!this.groen;
            if (this.groen) return;
            var kan = this.kanSendes();
            /* Teksten i ét <span>: knappen er en flexboks, som ellers ville skille
               de saenkede tal fra bogstaverne */
            var t = "<span>" + NK.Data.sub(NK.html(this.indsendTekst())) + "</span>";
            if (e.innerHTML !== t) e.innerHTML = t;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Kortets nederste raekke: beskeden, hjaelpeknappen og Indsend svar.
           Er kortet groent, er raekken vaek. */
        P.visBund = function () {
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = !!this.groen;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = !!this.groen;
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
        };

        P.knap = function () {
            if (this.groen) { this.videreKlik(); return; }
            var h = this.hintNu() || [];
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " + NK.html(h[this.hjaelp - 1]), "hint");
                this.visKnap();
                return;
            }
            this.hjaelp = 0;
            this.besked("", "");
            this.visSvar();
            this.visKnap();
        };

        P.nulstilHjaelp = function () {
            this.hjaelp = 0;
            this.pegKnap = false;
            this.visKnap();
        };

        P.indsendKlik = function () {
            if (this.groen) { this.kortBlink(); return; }
            if (!this.kanSendes()) {
                this.kortBlink();
                if (this.ingentingTekst) this.kortBesked(this.ingentingTekst(), 3.5);
                return;
            }
            this.indsend();
        };

        P.videreKlik = function () {
            if (!this.groen) return;
            this.videre();
        };

        /* ----- Kortets nederste raekke --------------------------------------------
           besked: den faste linje. kortBesked: en kort besked (fx fra tavlen),
           der forsvinder igen efter sek sekunder. */
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
            this.el.besked.innerHTML = NK.Data.sub(b.html);
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked.hidden ? "" : this.el.besked.textContent; };

        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">Ny isomer ✓</span> ' + NK.html(tekst), "god");
        };

        P.ryst = function () {
            var e = this.el.status;
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        /* Et forkert svar: forklaringen, et ryst og en hjaelpeknap, der lyser stille */
        P.fejlLinje = function (tekst, maerke) {
            this.besked('<span class="b-maerke">' + NK.html(maerke || "Ikke endnu") + "</span> " + NK.html(tekst), "skidt");
            this.pegKnap = true;
            this.visKnap();
            this.ryst();
        };

        /* ----- Stoerrelse, whiteboardet og tegneloekken --------------------------- */
        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el("j-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

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

        /* Det groenne glimt over whiteboardet, naar en isomer er fundet */
        P.tegnSejr = function (ctx, t) {
            if (this.sejrT === null || this.sejrT === undefined || this.sejrT > 0.9) return;
            ctx.save();
            ctx.globalAlpha = 0.16 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(t.x, t.y, t.b, t.h);
            ctx.restore();
        };

        /* ----- Musen ------------------------------------------------------------- */
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

    /* ----- Et molekyle tegnet ind i en kasse paa whiteboardet ----------------------
       kasse { x, y, b, h }. Molekylet faar den stoerste skala, der passer
       (hoejst maks), og staar midt i kassen. Giver { geo, s }. */
    function iKasse(mol, k, v) {
        v = v || {};
        function med(s, ox, oy) {
            return NK.Struktur.geometri(mol, {
                skala: s, ox: ox, oy: oy, stil: "zigzag", farve: v.farve || "#1d2433",
                skrift: NK.klamp(s * 0.4, 13, 28), linje: NK.klamp(s * 0.055, 2, 3.6),
                atomFarve: v.atomFarve
            });
        }
        var s0 = 50, g = med(s0, 0, 0);
        var b = (g.x1 - g.x0) || 1, h = (g.y1 - g.y0) || 1;
        var s = Math.min(s0 * (k.b - 20) / b, s0 * (k.h - 16) / h, v.maks || 70);
        s = Math.max(s, 14);
        g = med(s, 0, 0);
        var ox = k.x + k.b / 2 - (g.x0 + g.x1) / 2, oy = k.y + k.h / 2 - (g.y0 + g.y1) / 2;
        return { geo: med(s, ox, oy), s: s };
    }

    /* ----- Konfetti (som sb4.4) ------------------------------------------------
       NK.konfetti(el, antal): et pust ud fra elementets top, naar en jagt er
       klaret. NK.konfettiRegn(el, antal): regn over hele elementet til sejren. */
    var KONFETTI = ["#f2c53d", "#3d9ee0", "#e05446", "#3fae72", "#9b6bd6", "#ffffff"];

    function konfettiBoks(x, y) {
        var boks = document.createElement("div");
        boks.className = "konfetti";
        boks.setAttribute("aria-hidden", "true");
        boks.style.left = x + "px";
        boks.style.top = y + "px";
        document.body.appendChild(boks);
        window.setTimeout(function () { if (boks.parentNode) boks.parentNode.removeChild(boks); }, 4200);
        return boks;
    }

    function stykke(boks, i, dx, op, ned, forsink) {
        var b = document.createElement("i");
        b.style.backgroundColor = KONFETTI[i % KONFETTI.length];
        b.style.setProperty("--dx", dx.toFixed(0) + "px");
        b.style.setProperty("--op", op.toFixed(0) + "px");
        b.style.setProperty("--ned", ned.toFixed(0) + "px");
        b.style.setProperty("--rot", NK.r(-720, 720).toFixed(0) + "deg");
        b.style.animationDelay = forsink.toFixed(2) + "s";
        if (i % 3 === 0) b.style.borderRadius = "50%";
        boks.appendChild(b);
    }

    NK.konfetti = function (el, antal) {
        if (!el) return;
        var r = el.getBoundingClientRect();
        var boks = konfettiBoks(r.left + r.width / 2, r.top + 18);
        for (var i = 0; i < (antal || 46); i++) {
            var v = NK.r(-Math.PI * 0.95, -Math.PI * 0.05), fart = NK.r(80, 240);
            stykke(boks, i, Math.cos(v) * fart * 1.6, Math.sin(v) * fart, NK.r(180, 380), NK.r(0, 0.18));
        }
    };

    NK.konfettiRegn = function (el, antal) {
        if (!el) return;
        var r = el.getBoundingClientRect();
        var boks = konfettiBoks(r.left, r.top);
        boks.classList.add("regn");
        for (var i = 0; i < (antal || 120); i++) {
            var x = NK.r(0, r.width);
            stykke(boks, i, NK.r(-60, 60), NK.r(-40, 10), NK.r(r.height * 0.6, r.height + 40), NK.r(0, 1.2));
            boks.lastChild.style.left = x + "px";
        }
    };

    NK.Fane = { paa: paa, iKasse: iKasse };
}());
