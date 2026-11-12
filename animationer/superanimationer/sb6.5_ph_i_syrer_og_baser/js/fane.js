/* =====================================================================
   fane.js - scenekortet, hjaelpeknappen, Indsend svar, musen og konfetti

   Kopieret fra sb6.1 (nyt i sb6.5: efterKort() kaldes, naar kortet er
   bygget, saa felterne kan faa elevens tekst tilbage uden at gaa gennem
   HTML). sb6.1 har det fra sb7.7 Aminosyrer (som har det fra sb7.3, sb7.2, sb4.11,
   sb4.3, sb3.3, sc7.5, sb4.8 og sb4.4, brugerens oensker 9. og 24. okt. 2026).
   AL tekst staar paa ét kort oeverst midt i scenen, der staar intet
   nederst, og intet loeses af et tilfaeldigt klik: et svar paa kortet
   vaelger kun, og det bedoemmes foerst, naar eleven trykker Indsend svar.
   NK.Fane.paa(P, navn) faar fanens forstavelse (k, r eller u). Nyt her:
   groen.knap kan vaere null efter den sidste opgave (ingen knap).

   Fanen SKAL have:
     kortData()     { slags: "opgave" | "spm", chip, tekst, ekstra (HTML),
                      svar: [{ t, valgt, forkert }] }
     hintNu()       hinttrappen for det, eleven staar i lige nu
     visSvar()      hjaelpeknappens sidste trin
     kanSendes()    er der noget at sende ind?
     indsend()      eleven trykkede Indsend svar
     indsendTekst() teksten paa knappen
     svarValg(j)    eleven valgte svar nummer j paa kortet
     videre()       eleven trykkede paa det groenne korts knap
     layout(), tegn()
   Fanen KAN have: opdaterScene(dt), overScene, klikScene, efterHint(n),
     ingentingTekst(), skjulIndsend(), skjulHint().

   Kortet er groent, naar this.groen er sat:
     { spm: true, svarNr, maade: "selv" | "svar", tekst, maerke, knap, naeste }
   Saa sker der intet i scenen; kortets knap blinker (spaer).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function paa(P, navn) {
        function el(id) { return NK.el(navn + "-" + id); }

        P.startFane = function () {
            var mig = this;
            this.navn = navn;
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
            if (this.groen && this.groen.spm && NK.Papir) {
                /* Papirkortet (brugerens valg 3. nov. 2026): kortet bliver paa
                   spoergsmaalet. Svaret er groent dér, hvor eleven klikkede,
                   forklaringen staar under svarene, og knappen, der foerer
                   videre, staar dér, hvor Indsend svar stod. groen kan have
                   svarNr (det rigtige svar), kortChip og kortTekst (kortet, som
                   det stod), maerke og naeste (det, knappen goer). Saetningen
                   om at trykke Indsend svar er vaek, naar svaret er givet. */
                var gb = this.groen, kb = this.kortData(), vist = gb.maade === "svar";
                /* Kun hele saetninger fjernes (ikke fra "Kₛ" midt i en saetning);
                   er hele teksten en saetning, fjernes kun ", og tryk Indsend svar" */
                var kt0 = gb.kortTekst || kb.tekst;
                var kt = kt0.replace(/(^|[.?!]\s+)[A-ZÆØÅ][^.?!]*Indsend svar\.\s*/g, "$1").trim();
                if (!kt) kt = kt0.replace(/,\s*og tryk Indsend svar\./g, ".");
                kl = "scenekort loest bliv" + (vist ? " svar" : "");
                html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(gb.kortChip || kb.chip) + "</span>" + NK.Papir.tekst(NK.html(kt)) + "</p>";
                if (kb.svar && kb.svar.length) {
                    html += '<div class="sk-svar brikker" style="grid-template-columns: repeat(' + kb.svar.length + ', minmax(0, 1fr));">';
                    kb.svar.forEach(function (sv, j) {
                        var r = gb.svarNr !== undefined ? j === gb.svarNr : sv.valgt;
                        html += '<button type="button" class="sk-knap brik ' + (r ? (vist ? "svar-vist" : "rigtig") : "dim") + '" data-valg="' + j + '" disabled><span>' +
                            NK.html(sv.t) + "</span></button>";
                    });
                    html += "</div>";
                }
                html += NK.Papir.bliv(NK.html(gb.tekst || ""), gb.maerke || (vist ? "Svaret" : "Rigtigt"), NK.html(gb.knap || ""), vist);
                /* Efter den sidste opgave er der ingen knap (Begynd forfra staar i panelet) */
                if (!gb.knap) html = html.replace(/<button[^>]*data-videre[^>]*>[\s\S]*?<\/button>/, "");
            } else if (this.groen) {
                var g = this.groen;
                kl = "scenekort loest" + (g.maade === "svar" ? " svar" : "");
                html = '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + NK.html(g.chip || (g.maade === "svar" ? "Svaret" : "Rigtigt ✓")) + "</span>" +
                    (g.fed ? '<b class="sk-svaret">' + NK.html(g.fed) + "</b> " : "") + NK.html(g.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(g.knap) + "</button></div>";
            } else {
                var k = this.kortData();
                kl = "scenekort " + (k.slags === "spm" ? "spm" : "opgave") + (k.maal ? " medmaal" : "");
                html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(k.chip) + "</span>" + (NK.Papir ? NK.Papir.tekst(NK.html(k.tekst)) : NK.html(k.tekst)) + "</p>" + (k.ekstra || "");
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
            if (this.efterKort) this.efterKort();
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
            e.hidden = !!this.groen || !!(this.skjulIndsend && this.skjulIndsend());
            if (e.hidden) return;
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
            this.el.knap.hidden = !!this.groen || !!(this.skjulHint && this.skjulHint());
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
                if (this.efterHint) this.efterHint(this.hjaelp);
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
            /* Et rigtigt svar midt i en opgave: knappen foerer til naeste trin */
            if (this.groen.naeste) {
                var f = this.groen.naeste;
                this.groen = null;
                this.besked("", "");
                f.call(this);
                return;
            }
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

        P.godLinje = function (tekst, maerke) {
            this.besked('<span class="b-maerke">' + NK.html(maerke || "Rigtigt") + "</span> " + NK.html(tekst), "god");
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
            var e = NK.el(navn + "-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

        /* Tavlen begynder under kortet */
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

        /* Det groenne glimt over whiteboardet, naar et svar er rigtigt */
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

    /* En ring om et punkt (det markerede atom, det valgte H) */
    function ring(ctx, p, r, farve, fyld, bredde) {
        if (!p || !(r > 0)) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        if (fyld) { ctx.fillStyle = fyld; ctx.fill(); }
        ctx.strokeStyle = farve;
        ctx.lineWidth = bredde || 3;
        ctx.stroke();
        ctx.restore();
    }

    NK.Fane = { paa: paa, ring: ring };
}());
