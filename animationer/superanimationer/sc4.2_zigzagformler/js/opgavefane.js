/* =====================================================================
   opgavefane.js - det, de fire faner har til faelles

   Hver fane har sit eget laerred med tavlen, et tegnebraet (NK.Tegnebraet),
   en besked under papirkortet (toast), papirkortet oeverst i scenen med
   opgaven, hint, forklaringen og knapperne, og Kemichael. NK.Fane.bland(P, "zz") laegger metoderne
   paa fanens prototype; "zz" er forstavelsen paa fanens elementer i
   index.html (zz-laerred, zz-toast, zz-status ...).

   Fanen selv skal have:
     regler()            tegnebraettets regler
     aendret(hvad)       efter hver aendring paa tavlen
     tegnFane(ctx)       det, fanen tegner oven paa tavlen (valgfri)
     felt()              hvor man maa tegne (valgfri, standard: hele tavlen)
     musKrog(type, pt, e)  fanens egen haandtering af musen; sand = klaret
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Kaffekoppen er den samme paa alle fire faner: har Kemichael hentet den
       paa én fane, er den vaek paa dem alle, til siden aabnes igen */
    var KOP = { skjult: false, iHaand: false };

    function bland(P, pre) {
        P.pre = pre;

        P.startFane = function () {
            var mig = this;
            this.L = new NK.Laerred(NK.el(pre + "-laerred"));
            this.tid = 0;
            this.lay = null;
            this.g = { kaffekop: KOP };
            this.toastUr = 0;
            this.braet = new NK.Tegnebraet({
                felt: function () { return mig.felt(); },
                skala: function () { return mig.skala(); },
                regler: this.regler(),
                aendret: function (hvad) { mig.aendret(hvad); },
                toast: function (t, s) { mig.toast(t, s); }
            });
            this.linje = "";
            this.beskedKlasse = "";
            this.pegerTekst = "";
            this.bygKort();
            this.koblMus();
            this.bygTilbud();
            if (this.laererStart) this.laererStart();
        };

        /* ----- Layout -------------------------------------------------------- */
        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
        };

        P.layout = function () {
            this.lay = NK.Tavle.layout(this.L.b, this.L.h);
            var t = this.lay.tavle;
            /* Tavlen begynder under papirkortet */
            var dy = Math.max(0, this.kortTop() - t.y);
            t.y += dy;
            t.h -= dy;
            var toast = NK.el(pre + "-toast");
            if (toast) toast.style.top = Math.round(this.kortTop() + 4) + "px";
            this.saetAnker(pre + "-anker-tavle", t.x, t.y, t.b, t.h);
            if (this.layoutEkstra) this.layoutEkstra(this.lay);
        };

        P.felt = function () {
            var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 400, h: 300 };
            return { x: t.x + 8, y: t.y + 8, b: t.b - 16, h: t.h - 16 };
        };

        /* Bindingslaengden i pixels: stoerre paa en stor tavle */
        P.skala = function () {
            var t = this.lay ? this.lay.tavle : { b: 700, h: 450 };
            return Math.round(NK.klamp(Math.min(t.b / 13, t.h / 7.2), 34, 58));
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(b) + "px";
            e.style.height = Math.round(h) + "px";
        };

        /* ----- Beskeder -------------------------------------------------------- */
        P.toast = function (tekst, slags) {
            var e = NK.el(pre + "-toast");
            /* Skjul: den bliver lige staaende, saa den kan naa at blive laest */
            if (!tekst) { this.toastUr = Math.min(this.toastUr, 0.5); return; }
            if (e.textContent === tekst && !e.hidden) { this.toastUr = Math.max(this.toastUr, 1.2); return; }
            e.textContent = tekst;
            e.className = "toast " + (slags || "fejl");
            e.hidden = false;
            this.toastUr = 2.2;
        };

        /* Det naeste skridt: staar i kortets nederste raekke, naar der ikke
           er et hint eller en forklaring (statuslinjen nederst er vaek) */
        P.status = function (html) {
            if (this.pegerTekst === html) return;
            this.pegerTekst = html;
            this.visKort();
        };

        /* ----- Papirkortet (6. nov. 2026) ---------------------------------------
           Fanen giver kortData(): { chip, tekst (html), loest, vist, fejl,
           videre (knappens tekst), klar (Indsend svar kan trykkes), hint
           (hjaelpeknappens tekst eller null) } og har indsend(), hjaelpKlik()
           og videre(). Svarknapper, tegningen og felter vaelger kun; Indsend
           svar bedoemmer. Et rigtigt svar bliver paa opgaven: forklaringen
           staar under teksten, og knappen, der foerer videre, staar dér, hvor
           Indsend svar stod. Start forfra ligger i panelet. */
        /* Kortets plads oeverst i scenen; i en smal scene bliver teksten til
           flere linjer. Selvtesten maaler kortet i hoeje, lave og smalle skaerme. */
        P.kortZone = function () {
            var z = window.innerHeight <= 720 ? 128 : 142;
            return this.L && this.L.b < 760 ? z + 24 : z;
        };
        P.kortTop = function () { return 10 + this.kortZone() + 8; };

        P.bygKort = function () {
            var mig = this, e = NK.el(pre + "-skort");
            this.skort = e;
            this.kortHtml = null;
            e.addEventListener("click", function (ev) {
                var b = ev.target.closest ? ev.target.closest("button") : null;
                if (!b) return;
                b.blur();
                if (b.hasAttribute("data-videre")) { mig.videre(); return; }
                if (b.classList.contains("hjaelp")) { mig.hjaelpKlik(); return; }
                if (b.classList.contains("indsend")) {
                    var k = mig.kortData();
                    if (!k.klar) { mig.kortBlink(); return; }
                    mig.indsend();
                }
            });
        };

        P.besked = function (html, klasse) {
            this.linje = html || "";
            this.beskedKlasse = klasse || "";
            this.pegHjaelp = klasse === "skidt";
            this.visKort();
        };

        P.visKort = function () {
            var e = this.skort;
            if (!e || !this.kortData) return;
            var k = this.kortData();
            if (!k) return;
            var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(k.chip) + "</span>" + NK.Papir.tekst(k.tekst) + "</p>";
            if (k.loest) {
                if (k.fejl) {
                    html += '<div class="sk-bund bliv skidt"><p class="st-tekst">' + this.linje + "</p>" +
                        '<button type="button" class="sk-videre" data-videre="1">' + NK.html(k.videre) + "</button></div>";
                } else html += NK.Papir.bliv(this.linje, null, NK.html(k.videre), k.vist);
            } else {
                var lt = this.linje || this.pegerTekst || "";
                var kl = this.linje ? this.beskedKlasse : "peger";
                html += '<div class="sk-bund' + (kl ? " " + kl : "") + (lt ? "" : " tom") + '"><p class="st-tekst" aria-live="polite">' + lt + "</p>";
                if (k.hint) html += '<button type="button" class="knap hjaelp' + (/^Vis/.test(k.hint) ? " svar" : "") + (this.pegHjaelp ? " peg" : "") + '">' + NK.html(k.hint) + "</button>";
                html += '<button type="button" class="knap indsend ' + (k.klar ? "klar" : "ikke-klar") + '" aria-disabled="' + (k.klar ? "false" : "true") + '">Indsend svar</button></div>';
            }
            var kl2 = "scenekort " + (k.loest ? "loest bliv" + (k.vist ? " svar" : "") : "opgave");
            if (e.className.replace(" blink", "") !== kl2) e.className = kl2;
            if (html !== this.kortHtml) { this.kortHtml = html; e.innerHTML = html; }
        };

        /* Kortet blinker: eleven greb ud efter tavlen, men skal foerst trykke
           paa kortet (Naeste eller Indsend svar) */
        P.kortBlink = function () {
            var e = this.skort;
            if (!e) return;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        P.kortLaast = function () { var k = this.kortData && this.kortData(); return !!(k && k.loest); };

        /* ----- Musen ------------------------------------------------------------- */
        P.overKop = function (pt) {
            var kop = this.g.kaffekop, lay = this.lay;
            if (!lay || kop.skjult || kop.iHaand) return false;
            return Math.abs(pt.x - lay.kop.x) < 26 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 50;
        };

        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            c.addEventListener("pointerdown", function (e) {
                var pt = mig.L.punkt(e);
                mig.paaLaerer = !!(mig.laererUnder && mig.laererUnder(pt.x, pt.y));
                if (mig.paaLaerer || mig.overKop(pt)) return;
                if (mig.kortLaast()) { mig.kortBlink(); return; }
                if (mig.musKrog && mig.musKrog("ned", pt, e)) return;
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                mig.braet.ned(pt, e);
            });
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.musKrog && mig.musKrog("flyt", pt, e)) { c.style.cursor = mig.krogMarkoer || "pointer"; return; }
                mig.braet.flyt(pt);
                var paaL = mig.laererUnder && mig.laererUnder(pt.x, pt.y);
                c.style.cursor = paaL || mig.overKop(pt) ? "pointer" : mig.braet.markoer(pt);
            });
            c.addEventListener("pointerup", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.paaLaerer) return;
                if (mig.musKrog && mig.musKrog("op", pt, e)) return;
                mig.braet.op(pt);
            });
            c.addEventListener("pointerleave", function () { mig.braet.ud(); if (mig.musKrog) mig.musKrog("ud", null, null); });
            c.addEventListener("contextmenu", function (e) { e.preventDefault(); });
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
                if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
                if (mig.overKop(pt) && mig.klikKop) mig.klikKop();
            });
        };

        /* ----- Tid og tegning -------------------------------------------------------- */
        P.opdaterFane = function (dt) {
            this.tid += dt;
            if (this.toastUr > 0) {
                this.toastUr -= dt;
                if (this.toastUr <= 0) NK.el(pre + "-toast").hidden = true;
            }
            if (this.opdaterLaerer) this.opdaterLaerer(dt);
            this.opdaterIntro(dt);
        };

        P.opdater = function (dt) {
            this.opdaterFane(dt);
            this.opdaterKonfetti(dt);
            if (this.opdaterEkstra) this.opdaterEkstra(dt);
        };

        P.tegn = function () {
            var ctx = this.L.ctx, lay = this.lay;
            if (!lay) return;
            NK.Tavle.tegn(ctx, lay);
            if (this.tegnFane) this.tegnFane(ctx);
            else this.braet.tegn(ctx);
            var kop = this.g.kaffekop;
            if (!kop.skjult && !kop.iHaand) NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18, lay.kop.y - 40, 42, 40);
            if (this.laererTegnOver) this.laererTegnOver(ctx);
            this.tegnKonfetti(ctx);
        };

        P.fortryd = function () { return this.braet.fortryd(); };
        P.gentag = function () { return this.braet.gentag(); };

        /* ----- Fejring ----------------------------------------------------------
           Konfetti: stor, naar en quiz er klaret, lille ved hvert rigtigt svar */
        P.konfetti = function (stor) {
            var f = this.felt(), liste = this.konfettiListe || (this.konfettiListe = []);
            var n = stor ? 150 : 24;
            for (var i = 0; i < n; i++) {
                var p = { rot: NK.r(0, 6.3), vr: NK.r(-9, 9), b: NK.r(6, 11), h: NK.r(3, 6), t: 0,
                    farve: KONFETTI[i % KONFETTI.length] };
                if (stor) {
                    p.x = f.x + Math.random() * f.b; p.y = f.y - 10 - Math.random() * 90;
                    p.vx = NK.r(-70, 70); p.vy = NK.r(30, 170); p.liv = NK.r(2.4, 3.8);
                } else {
                    var v = NK.r(0, Math.PI * 2), fart = NK.r(120, 330);
                    p.x = f.x + f.b / 2 + NK.r(-20, 20); p.y = f.y + f.h / 2;
                    p.vx = Math.cos(v) * fart; p.vy = Math.sin(v) * fart - 140; p.liv = NK.r(0.9, 1.4);
                }
                liste.push(p);
            }
        };

        P.opdaterKonfetti = function (dt) {
            var l = this.konfettiListe;
            if (!l || !l.length) return;
            for (var i = l.length - 1; i >= 0; i--) {
                var p = l[i];
                p.t += dt;
                if (p.t > p.liv) { l.splice(i, 1); continue; }
                p.vy += 260 * dt;
                p.vx *= Math.exp(-1.2 * dt);
                p.vy *= Math.exp(-0.7 * dt);
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.rot += p.vr * dt;
            }
        };

        P.tegnKonfetti = function (ctx) {
            var l = this.konfettiListe;
            if (!l || !l.length) return;
            l.forEach(function (p) {
                ctx.save();
                ctx.globalAlpha = NK.klamp((p.liv - p.t) / 0.5, 0, 1);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.farve;
                ctx.fillRect(-p.b / 2, -p.h / 2, p.b, p.h * Math.abs(Math.cos(p.rot * 1.7)) + 1);
                ctx.restore();
            });
        };

        /* En quiz er klaret. egne: eleven har selv klaret de fleste opgaver
           og ikke bare set svarene. Er quizzens klistermaerke nyt, kommer det
           frem. Kemichael kommer kun, naar det var fanens sidste klistermaerke,
           saa hele fanen er klaret (brugerens regel 4. nov. 2026).
           krav: saetningen, der staar sidst i forklaringen paa papirkortet, naar for
           mange svar er vist, saa eleven ved, hvorfor klistermaerket udebliver.
           Forklaringen skal derfor vaere skrevet, foer klaret kaldes. */
        P.klaret = function (quiz, egne, krav) {
            if (!egne) {
                /* Efter svaret til den sidste opgave; et gammelt hint eller en
                   fejl bliver ikke staaende foran kravet */
                var gammel = this.linje;
                if (krav) {
                    if (gammel && !/^<b>Hint:/.test(gammel) && this.beskedKlasse !== "skidt") this.besked(gammel + " " + NK.html(krav), this.beskedKlasse);
                    else this.besked(NK.html(krav), "gul");
                }
                return null;
            }
            this.konfetti(true);
            var ny = NK.Skuffe.laasOp(quiz);
            if (ny) visGave(this, ny);
            if (ny && this.laererFaneKlaret) this.laererFaneKlaret(quiz);
            return ny;
        };
    }

    var KONFETTI = ["#f2c53d", "#3d9ee0", "#3fae72", "#e05446", "#9b6bd6", "#e6892a"];

    /* Vinduet med det nye klistermaerke, oeverst til hoejre i scenen.
       Knappen aabner tegnebraettet (sin egen side) i en ny fane med
       klistermaerket klar, saa quizzen her bliver staaende. */
    var TEGNEBRAET = "../tegnebraet/index.html";

    function visGave(sim, k) {
        var gl = document.querySelectorAll(".gave");
        Array.prototype.forEach.call(gl, function (x) { x.remove(); });
        var antal = NK.Skuffe.antalAabne(), alle = NK.Skuffe.ALLE.length;
        var e = document.createElement("div");
        e.className = "gave";
        e.innerHTML = '<button class="gave-luk" type="button" aria-label="Luk">✕</button>' +
            '<div class="gave-hoved">Fra Kemichaels skuffe</div>' +
            '<img src="' + k.adresse + '" alt="">' +
            '<div class="gave-navn">' + NK.html(k.titel) + "</div>" +
            '<p class="gave-tekst">' + (antal >= alle ? "Skuffen er tom. Alle ti klistermærker er dine." :
                "Klistermærket ligger nu på tegnebrættet. Du har " + antal + " af " + alle + " klistermærker.") + "</p>" +
            '<a class="knap blaa gave-proev" href="' + TEGNEBRAET + "#klister=" + encodeURIComponent(k.navn) +
            '" target="_blank" rel="noopener"><span>Prøv den på tegnebrættet</span><span class="tegn">↗</span></a>';
        sim.L.canvas.parentElement.appendChild(e);
        e.querySelector(".gave-luk").addEventListener("click", function () { e.remove(); });
        e.querySelector(".gave-proev").addEventListener("click", function () { e.remove(); });
    }

    /* ----- Serien som prikker: groen = loest selv, gul = med svaret, roed = forkert
       (kun paa fane 5, hvor et forkert svar ikke kan goeres om) ------------------------ */
    function prikker(id, status, nr, klik) {
        var e = NK.el(id);
        if (!e) return;
        if (e.children.length !== status.length) {
            e.innerHTML = "";
            status.forEach(function (s, i) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "prik";
                b.textContent = String(i + 1);
                b.addEventListener("click", function () { if (klik) klik(i); });
                e.appendChild(b);
            });
        }
        status.forEach(function (s, i) {
            var b = e.children[i];
            b.className = "prik" + (s === 1 ? " selv" : (s === 2 ? " vist" : (s === 3 ? " forkert" : ""))) + (i === nr ? " nu" : "");
            b.disabled = !s;
        });
    }

    /* ----- Et lille billede af et molekyle til panelet --------------------------------- */
    function miniature(mol, res, maksB, maksH) {
        var kaede = {}, farve = {};
        if (res && res.kaede) {
            res.kaede.forEach(function (id) { kaede[id] = true; });
            (res.sub || []).forEach(function (s) { s.atomer.forEach(function (id) { farve[id] = true; }); });
        }
        var gr = "#1d7a48", bl = "#2563eb";
        var s = 26;
        var svg = NK.Struktur.svg(mol, {
            skala: s, stil: "zigzag", farve: "#1d2433", linje: 2.2, skrift: 13,
            bindingFarve: res ? function (bd) {
                if (kaede[bd.a] && kaede[bd.b]) return gr;
                if (farve[bd.a] || farve[bd.b]) return bl;
                return null;
            } : null
        }, { pad: 8 });
        /* Skaleres ned, hvis det er for stort */
        var m = /width="(\d+)" height="(\d+)"/.exec(svg);
        if (m && maksB) {
            var b = +m[1], h = +m[2], k = Math.min(1, maksB / b, (maksH || 999) / h);
            svg = svg.replace(/width="\d+" height="\d+"/, 'width="' + Math.round(b * k) + '" height="' + Math.round(h * k) + '"');
        }
        return svg;
    }

    NK.Fane = { bland: bland, prikker: prikker, miniature: miniature };
}());
