/* =====================================================================
   sim_beholder.js - fane 1: Beholderen

   En lukket beholder med molekyler og en skyder for x: hvor meget af
   et stof, der er omsat. Skemaet under beholderen viser start, aendring
   og ligevaegt som tal, der foelger skyderen, og reaktionsbroeken Y.
   Grafen til hoejre er Y som funktion af x med K som en vandret linje.

   Otte maal paa tre reaktioner (D.MAAL):
     * ligevaegt: traek x, til Y = K
     * udtryk:    skriv raekkerne i skemaet med x (tallene staar ved siden af)
     * forkast:   CAS loeser Y = K. Grafen zoomer ud, saa begge loesninger
                  ses, og det graa omraade, hvor en koncentration er negativ.
                  Eleven klikker paa den loesning, der ikke kan bruges.
     * graense:   x saa langt op som muligt, og klik paa det stof, der er
                  brugt op

   Molekylerne er tal: ét molekyle er rx.enhed M, og antallet, der er
   omsat, er x / enhed rundet af. Alt andet regnes af js/model.js.
   Paaskeaegget: et klik paa laaget aabner beholderen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var H = NK.RegnHjaelp;

    var KENDT = {
        "a-lige": { aendr: false, lig: false },
        "a-udtryk": { aendr: "felt", lig: "felt" },
        "b-aendr": { aendr: "felt", lig: false }
    };

    function el(tag, klasse, html) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    /* Tal med tre decimaler som paa skyderen: 0,078, −0,078 */
    function t3(v) {
        if (Math.abs(v) < 0.0005) return "0,000";
        return (v < 0 ? "−" : "") + Math.abs(v).toFixed(3).replace(".", ",");
    }

    function SimBeholder() {
        var mig = this;
        this.laerred = new NK.Laerred(NK.el("bh-laerred"));
        this.skyder = NK.el("bh-x");
        this.mol = [];
        this.laag = null;
        this.zoom = 0;
        this.traek = false;
        this.startFane(D.MAAL, D.GRUPPER_BH);

        this.skyder.addEventListener("input", function () { mig.saetX(parseFloat(mig.skyder.value)); });
        this.skyder.addEventListener("change", function () { mig.slutTraek(); });
        var c = this.laerred.canvas;
        c.addEventListener("pointerdown", function (e) { mig.ned(e); });
        c.addEventListener("pointermove", function (e) { mig.flyt(e); });
        c.addEventListener("pointerup", function (e) { mig.op(e); });
        c.addEventListener("pointercancel", function (e) { mig.op(e); });
        window.addEventListener("resize", function () { if (NK.el("fane-bh").classList.contains("aktiv")) mig.tilpas(); });

        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimBeholder.prototype;
    NK.Fane.paa(P, { navn: "bh", naesteFane: "fane-ux", naesteNavn: "Uden x", videreTekst: "Næste mål →" });

    P.maal = function () { return this.opgaver[this.nr]; };

    /* ----- Maalet ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var m = this.opgaver[i];
        var rx = D.RX[m.rx];
        var nyRx = this.rx !== rx;
        this.rx = rx;
        this.g = M.xGraenser(rx);
        this.xMax = this.g.hoej;
        this.kendt = KENDT[m.id] || { aendr: true, lig: true };
        this.v = {};
        this.fejlF = {};
        this.okF = {};
        this.roedder = null;
        this.zoom = 0;
        this.forkastet = -1;
        this.naaet = false;
        this.xEq = M.xFacit(rx);
        this.skyder.max = String(this.xMax);
        this.saetX(0, true);
        if (nyRx || !this.mol.length) this.nyeMolekyler();
        NK.saetHTML("bh-linje", NK.kc(NK.html(m.linje)));
        NK.saetHTML("bh-xdef", NK.html("koncentrationen af " + M.skriv(rx.xStof) + ", der er " + rx.xOrd));
        this.bygSkema();
        this.bygY();
        this.opdaterTal();
        this.tilpasSkema();
    };

    P.promptHTML = function () {
        var m = this.maal();
        var html = '<p class="note-tekst">' + NK.html(m.tekst) + "</p>";
        html += '<p class="spm"><span class="rx-navn">' + NK.html(this.rx.navn) + ", " + NK.html(this.rx.T) + ":</span> " +
            NK.html(M.skemaTekst(this.rx)) + ", K = " + NK.html(M.kTekst(this.rx)) + "</p>";
        return html;
    };

    /* ----- x ---------------------------------------------------------------------- */
    P.saetX = function (x, stille) {
        x = NK.klamp(isFinite(x) ? x : 0, 0, this.xMax);
        this.x = x;
        if (Math.abs(parseFloat(this.skyder.value) - x) > 1e-9) this.skyder.value = String(x);
        NK.saetTekst("bh-xtal", t3(x));
        if (!stille) {
            this.paab[this.nr] = true;
            this.opdaterTal();
            if (this.maal().type === "graense" && !this.faerdig && x >= this.xMax - 1e-9 && !this.naaet) this.naaGraense();
        }
    };

    /* Skyderen er sluppet: er maalet naaet? */
    P.slutTraek = function () {
        if (this.faerdig) return;
        var m = this.maal();
        if (m.type === "ligevaegt") {
            var Y = M.Y(this.rx, this.x);
            if (Math.abs(this.x - this.xEq) <= 0.0015 || Math.abs(Y - this.rx.K) <= 0.04 * this.rx.K) {
                this.loest("ok", NK.html(m.slut), "Ligevægt ✓");
            }
        }
    };

    P.naaGraense = function () {
        this.naaet = true;
        this.besked('<span class="b-maerke">Stop</span> ' + NK.html("Skyderen kan ikke komme længere. Hvilket stof er brugt op? Klik på det i skemaet."), "gul");
        this.visKnap();
    };

    /* ----- Molekylerne -------------------------------------------------------------- */
    P.nyeMolekyler = function () {
        var mig = this, rx = this.rx;
        this.mol = [];
        M.alle(rx).forEach(function (a) {
            var n = Math.round(M.c0(rx, a.s) / rx.enhed);
            for (var i = 0; i < n; i++) mig.mol.push(mig.nytMolekyle(a.s, Math.random(), Math.random()));
        });
        this.nOms = 0;
    };

    P.nytMolekyle = function (s, x, y) {
        var v = NK.r(0.05, 0.12), a = NK.r(0, Math.PI * 2);
        return { s: s, x: NK.klamp(x, 0.04, 0.96), y: NK.klamp(y, 0.04, 0.96), vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            rot: NK.r(0, Math.PI * 2), vr: NK.r(-1, 1), ny: 0, alfa: 1 };
    };

    function naermeste(liste, s, x, y, undtagen) {
        var bedst = null, d = Infinity;
        liste.forEach(function (m) {
            if (m.s !== s || undtagen.indexOf(m) >= 0 || m.ude) return;
            var dd = (m.x - x) * (m.x - x) + (m.y - y) * (m.y - y);
            if (dd < d) { d = dd; bedst = m; }
        });
        return bedst;
    }

    /* Én omsaetning frem (reaktanter > produkter) eller tilbage */
    P.omsaet = function (frem) {
        var rx = this.rx;
        var fra = frem ? rx.r : rx.p, til = frem ? rx.p : rx.r;
        var valgt = [];
        var start = this.mol.filter(function (m) { return m.s === fra[0][1] && !m.ude; });
        if (!start.length) return false;
        var foerste = NK.tilfaeldig(start);
        var cx = foerste.x, cy = foerste.y;
        for (var i = 0; i < fra.length; i++) {
            for (var k = 0; k < fra[i][0]; k++) {
                var m = i === 0 && k === 0 ? foerste : naermeste(this.mol, fra[i][1], cx, cy, valgt);
                if (!m) return false;
                valgt.push(m);
            }
        }
        var sx = 0, sy = 0;
        valgt.forEach(function (m) { sx += m.x; sy += m.y; });
        sx /= valgt.length;
        sy /= valgt.length;
        this.mol = this.mol.filter(function (m) { return valgt.indexOf(m) < 0; });
        var mig = this;
        til.forEach(function (t) {
            for (var j = 0; j < t[0]; j++) {
                var n = mig.nytMolekyle(t[1], sx + NK.r(-0.03, 0.03), sy + NK.r(-0.03, 0.03));
                n.ny = 0.7;
                mig.mol.push(n);
            }
        });
        return true;
    };

    P.opdaterMolekyler = function (dt) {
        var maal = Math.round(this.x / this.rx.enhed + 1e-9);
        var gange = 0;
        while (this.nOms !== maal && gange++ < 4) {
            var frem = this.nOms < maal;
            if (!this.omsaet(frem)) break;
            this.nOms += frem ? 1 : -1;
        }
        var aaben = this.laag && this.laag.t < 2.6;
        this.mol.forEach(function (m) {
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.rot += m.vr * dt;
            if (m.ny > 0) m.ny = Math.max(0, m.ny - dt);
            if (aaben && !m.ude && m.y < 0.35 && Math.random() < dt * 1.4) { m.ude = true; m.vy = -NK.r(0.25, 0.4); }
            if (m.ude) {
                m.alfa = Math.max(0, m.alfa - dt * 1.6);
                return;
            }
            if (m.alfa < 1) m.alfa = Math.min(1, m.alfa + dt * 1.5);
            if (m.x < 0.04) { m.x = 0.04; m.vx = Math.abs(m.vx); }
            if (m.x > 0.96) { m.x = 0.96; m.vx = -Math.abs(m.vx); }
            if (m.y < 0.05) { m.y = 0.05; m.vy = Math.abs(m.vy); }
            if (m.y > 0.95) { m.y = 0.95; m.vy = -Math.abs(m.vy); }
        });
        if (this.laag) {
            this.laag.t += dt;
            if (this.laag.t > 2.6 && !this.laag.lukket) {
                /* Laaget er paa igen: molekylerne kommer tilbage (det er jo en model) */
                this.laag.lukket = true;
                var mig = this;
                this.mol.forEach(function (m) {
                    if (!m.ude) return;
                    var n = mig.nytMolekyle(m.s, Math.random(), NK.r(0.4, 0.95));
                    m.x = n.x; m.y = n.y; m.vx = n.vx; m.vy = n.vy; m.ude = false; m.alfa = 0;
                });
            }
            if (this.laag.t > 3.2) this.laag = null;
        }
    };

    /* ----- Skemaet under beholderen ------------------------------------------------------ */
    var RAEKKER = ["start", "aendr", "lig"];
    var RNAVN = { start: "Start", aendr: "Ændring", lig: "Ligevægt" };

    P.bygSkema = function () {
        var mig = this, rx = this.rx;
        var w = NK.el("bh-skema");
        w.innerHTML = "";
        this.felter = [];
        var tab = el("table", "ice bh-ice");
        var hoved = el("tr");
        hoved.appendChild(el("th", "ice-hj", "c / M"));
        M.alle(rx).forEach(function (a) {
            var th = el("th");
            var b = el("button", "ice-stof", NK.html(M.skriv(a.s)));
            b.type = "button";
            b.setAttribute("data-s", a.s);
            b.addEventListener("click", function () { mig.klikStof(a); });
            th.appendChild(b);
            hoved.appendChild(th);
        });
        tab.appendChild(hoved);
        RAEKKER.forEach(function (r) {
            var tr = el("tr", "ice-" + r);
            tr.appendChild(el("th", "ice-r", RNAVN[r]));
            M.alle(rx).forEach(function (a) {
                var td = el("td");
                td.setAttribute("data-s", a.s);
                var key = r + "." + a.s;
                var k = r === "start" ? true : mig.kendt[r];
                var celle = el("span", "bh-celle");
                if (r !== "start" && k === "felt" && !mig.okF[key]) {
                    celle.appendChild(mig.input(key, "med x"));
                    celle.appendChild(el("span", "bh-lig", " = "));
                } else if (r !== "start" && k) {
                    celle.appendChild(el("span", "bh-u", NK.html(r === "aendr" ? M.aendrTekst(a) : M.ligTekst(rx, a.s, false))));
                    celle.appendChild(el("span", "bh-lig", " = "));
                }
                var tal = el("span", "bh-tal");
                tal.setAttribute("data-r", r);
                tal.setAttribute("data-s", a.s);
                celle.appendChild(tal);
                td.appendChild(celle);
                tr.appendChild(td);
            });
            tab.appendChild(tr);
        });
        w.appendChild(tab);
        if (this.maal().type === "udtryk" && !this.faerdig) {
            var k = el("button", "tjekknap", "Tjek");
            k.type = "button";
            k.addEventListener("click", function () { mig.tjek(); });
            w.appendChild(k);
        }
    };

    P.input = function (key, pladsholder) {
        var mig = this;
        var inp = document.createElement("input");
        inp.type = "text";
        inp.className = "ice-in" + (this.fejlF[key] ? " fejl" : "");
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.value = this.v[key] || "";
        inp.placeholder = pladsholder;
        inp.setAttribute("data-key", key);
        inp.setAttribute("aria-label", key);
        inp.addEventListener("input", function () {
            mig.v[key] = inp.value;
            mig.paab[mig.nr] = true;
            if (mig.fejlF[key]) { delete mig.fejlF[key]; inp.classList.remove("fejl"); }
            mig.nulstilHjaelp();
        });
        inp.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            var tomt = mig.felter.filter(function (f) { return f !== inp && !f.value.trim(); })[0];
            if (tomt && inp.value.trim()) { tomt.focus(); return; }
            mig.tjek();
        });
        this.felter.push(inp);
        return inp;
    };

    P.opdaterTal = function () {
        var rx = this.rx, x = this.x;
        var tal = NK.el("bh-skema").querySelectorAll(".bh-tal");
        for (var i = 0; i < tal.length; i++) {
            var r = tal[i].getAttribute("data-r"), s = tal[i].getAttribute("data-s"), a = M.find(rx, s);
            var v;
            if (r === "start") v = M.c0(rx, s);
            else if (r === "aendr") v = M.aendring(a) * x;
            else v = M.vaerdi(M.plads(rx, s), x);
            var tekst = r === "aendr" ? (v > 0 ? "+" : "") + t3(v) : t3(v);
            if (r === "start") tekst = M.c0(rx, s) ? NK.tal(M.c0(rx, s)) : "0";
            if (tal[i].textContent !== tekst) tal[i].textContent = tekst;
            tal[i].classList.toggle("nul", r === "lig" && Math.abs(v) < 0.0005);
        }
        var Y = M.Y(rx, x), K = rx.K;
        var yTekst = !isFinite(Y) ? "uendelig" : NK.tal(Y) + (M.kEnhed(rx) ? " " + M.kEnhed(rx) : "");
        NK.saetTekst("bh-yv", yTekst);
        var lige = isFinite(Y) && Math.abs(Y - K) <= 0.04 * K;
        var sml = lige ? "Y = K" : (!isFinite(Y) || Y > K ? "Y > K" : "Y < K");
        NK.saetTekst("bh-ysml", sml);
        var e = NK.el("bh-ysml");
        if (e) e.className = "y-sml" + (lige ? " lige" : "");
    };

    /* Et klik paa et stof i skemaet */
    P.klikStof = function (a) {
        var m = this.maal();
        if (m.type === "graense" && !this.faerdig) {
            if (!this.naaet) { this.kortBesked("Træk først x helt op, så langt det kan komme.", 3); return; }
            var c = M.vaerdi(M.plads(this.rx, a.s), this.x);
            if (Math.abs(c) < 1e-9) {
                this.loest("ok", NK.html(m.slut), "Rigtigt ✓");
                return;
            }
            this.fejlLinje("Der er stadig " + t3(c) + " M " + M.skriv(a.s) + ". Find det stof, der er 0 i rækken Ligevægt.");
            return;
        }
        var t = M.skriv(a.s) + " står " + (a.side === "r" ? "før pilen og bliver brugt." : "efter pilen og dannes.");
        if (a.k > 1) t += " Koefficienten er " + a.k + ".";
        this.kortBesked(t, 4);
    };

    /* ----- Reaktionsbroeken og CAS -------------------------------------------------------- */
    P.bygY = function () {
        var mig = this, rx = this.rx, m = this.maal();
        var w = NK.el("bh-y");
        var lov = M.lovFacit(rx);
        var html = '<div class="y-linje">Y = ' + H.broek(NK.html(M.ledene(lov.num)), NK.html(M.ledene(lov.den))) +
            ' = <b id="bh-yv"></b></div>';
        html += '<div class="y-k">K = ' + NK.html(M.kTekst(rx)) + ' <span class="y-sml" id="bh-ysml"></span></div>';
        if (m.type === "forkast") {
            var fn = function (l) { return NK.html(M.ligTekst(rx, l.s, false)); };
            html += '<div class="y-ligning"><span class="y-etiket">Ved ligevægt er Y = K</span>' + NK.tal(rx.K) + " = " +
                H.broek(H.delAf(lov.num, fn), H.delAf(lov.den, fn)) + "</div>";
            html += '<button type="button" class="cas-knap" id="bh-cas">Løs ligningen med CAS</button>';
            html += '<div class="bh-roedder" id="bh-roedder"></div>';
        }
        w.innerHTML = NK.kc(html);
        var k = NK.el("bh-cas");
        if (k) k.addEventListener("click", function () { mig.koerCas(); });
        NK.saetHTML("bh-yv", "");
        NK.saetHTML("bh-ysml", "");
        /* saetTekst husker den sidste tekst: glem den, saa tallet skrives igen */
        NK.saetTekst("bh-yv", "·");
        NK.saetTekst("bh-ysml", "·");
    };

    P.koerCas = function () {
        if (this.roedder) return;
        this.roedder = M.loesX(this.rx);
        this.paab[this.nr] = true;
        var mig = this, w = NK.el("bh-roedder");
        var knap = NK.el("bh-cas");
        if (knap) { knap.disabled = true; knap.textContent = "CAS: " + this.roedder.map(function (r) { return "x = " + NK.casTal(r); }).join("  ∨  "); }
        w.innerHTML = "";
        this.roedder.forEach(function (r, i) {
            var b = el("button", "lsn-x bh-rod", "x = " + NK.html(NK.tal(r)) + " M");
            b.type = "button";
            b.setAttribute("data-i", i);
            b.addEventListener("click", function () { mig.vaelgRod(i); });
            w.appendChild(b);
        });
        this.nulstilHjaelp();
        this.besked('<span class="b-maerke">CAS</span> ' + NK.html("To løsninger. Grafen viser nu begge. I det grå område bliver en koncentration negativ. Klik på den løsning, der ikke kan bruges."), "");
        this.visKnap();
    };

    P.vaelgRod = function (i) {
        if (this.faerdig || !this.roedder) return;
        var r = this.roedder[i], d = M.dom(this.rx, r);
        if (d.ok) {
            this.fejlLinje("x = " + NK.tal(r) + " M giver positive koncentrationer. Det er ligevægten, skyderen kan nå. Klik på den anden.");
            return;
        }
        this.forkastet = i;
        var b = NK.el("bh-roedder").querySelectorAll(".bh-rod");
        for (var j = 0; j < b.length; j++) b[j].classList.toggle(j === i ? "forkast" : "brug", true);
        this.loest("ok", NK.html(this.maal().slut), "Forkastet ✓");
    };

    /* ----- Tjek af felterne (maal med udtryk) ------------------------------------------------ */
    P.tjek = function () {
        var m = this.maal();
        if (this.faerdig) return;
        if (m.type !== "udtryk") {
            if (m.type === "forkast" && !this.roedder) { this.koerCas(); return; }
            this.besked(NK.html(this.trinLinje()), "gul");
            return;
        }
        var mig = this, rx = this.rx, forste = null, nogen = false;
        m.raekker.forEach(function (r) {
            M.alle(rx).forEach(function (a) {
                var key = r + "." + a.s;
                if (mig.okF[key]) return;
                var svar = H[r](rx, a.s, mig.v[key]);
                if (svar.ok) { mig.okF[key] = true; nogen = true; }
                else if (!forste || (forste.svar.tom && !svar.tom)) forste = { svar: svar, key: key, s: a.s };
            });
        });
        if (!forste) {
            m.raekker.forEach(function (r) { mig.kendt[r] = true; });
            this.loest("ok", NK.html(m.slut), "Rigtigt ✓");
            return;
        }
        if (nogen) { this.bygSkema(); this.opdaterTal(); this.tilpasSkema(); }
        this.hintS = forste.s;
        this.visLys();
        if (forste.svar.tom) this.besked(NK.html(forste.svar.besked), "gul");
        else this.fejlLinje(forste.svar.besked);
        var inp = this.felter.filter(function (f) { return f.getAttribute("data-key") === forste.key; })[0];
        if (inp) {
            this.fejlF[forste.key] = true;
            inp.classList.remove("fejl");
            void inp.offsetWidth;
            inp.classList.add("fejl");
            inp.focus();
        }
    };

    P.efterOpgave = function () {
        this.bygSkema();
        this.opdaterTal();
        this.tilpasSkema();
        var k = NK.el("bh-cas");
        if (k) k.disabled = true;
    };

    /* ----- Tekstboksen, hint og svar ---------------------------------------------------------
       Maalet staar lige over tekstboksen, saa linjen siger kun, hvor og
       hvordan: det, maalet ikke selv siger. */
    P.trinLinje = function () {
        var m = this.maal();
        if (m.type === "ligevaegt") return "Træk i skyderen eller på grafen. Y og K står nederst til højre i scenen.";
        if (m.type === "udtryk") {
            return m.raekker.length > 1 ? "Skriv i felterne i skemaet. Tallet efter = i hvert felt følger skyderen." :
                "Skriv ændringerne i felterne i skemaets række Ændring.";
        }
        if (m.type === "forkast") {
            if (!this.roedder) return "Ved ligevægt er Y = K. Det er en ligning med x. Knappen Løs ligningen med CAS står nederst til højre.";
            return "Klik på den løsning, der ikke kan bruges. På grafen er det grå område kemisk umuligt.";
        }
        if (!this.naaet) return "Træk x så langt op, som det kan komme.";
        return "Klik på det stof i skemaets øverste række, der er brugt op.";
    };

    P.hintTrin = function () {
        var m = this.maal(), rx = this.rx, mig = this;
        if (this.faerdig) return null;
        if (m.type === "ligevaegt") {
            var Y = M.Y(rx, this.x);
            return { s: null, trin: [
                "Y er reaktionsbrøken regnet med koncentrationerne i rækken Ligevægt. Ved ligevægt er Y = K.",
                isFinite(Y) && Y < rx.K ? "Y er for lille. Træk x større, så der bliver mere produkt." : "Y er for stor. Træk x mindre.",
                "Ligevægten ligger ved x ≈ " + t3(this.xEq) + " M."
            ] };
        }
        if (m.type === "udtryk") {
            var r = m.raekker.filter(function (q) { return M.alle(rx).some(function (a) { return !mig.okF[q + "." + a.s]; }); })[0] || m.raekker[0];
            var a = M.alle(rx).filter(function (b) { return !mig.okF[r + "." + b.s]; })[0] || M.alle(rx)[0];
            if (r === "aendr") {
                return { s: a.s, trin: [
                    "Se på tallene i rækken Ændring, mens du trækker i x. Hvordan hænger de sammen med x?",
                    "Reaktanterne bruges og får −, produkterne dannes og får +." + (a.k > 1 ? " Der står " + a.k + " foran " + M.skriv(a.s) + "." : ""),
                    "Ændring: " + M.alle(rx).map(function (b) { return M.skriv(b.s) + " " + M.aendrTekst(b); }).join(", ") + "."
                ] };
            }
            return { s: a.s, trin: [
                "Ligevægt = start + ændring.",
                M.skriv(a.s) + ": " + NK.tal(M.c0(rx, a.s)) + " + (" + M.aendrTekst(a) + ") = " + M.ligTekst(rx, a.s, false) + ".",
                "Ligevægt: " + M.alle(rx).map(function (b) { return M.skriv(b.s) + " " + M.ligTekst(rx, b.s, false); }).join(", ") + "."
            ] };
        }
        if (m.type === "forkast") {
            if (!this.roedder) return { s: null, trin: ["Tryk Løs ligningen med CAS under skemaet."] };
            var daarlig = this.roedder.filter(function (q) { return !M.dom(rx, q).ok; })[0];
            var d = M.dom(rx, daarlig);
            return { s: d.neg, trin: [
                "En løsning kan kun bruges, hvis den ligger der, hvor skyderen kan komme: mellem 0 og " + t3(this.xMax) + " M.",
                "Sæt hver løsning ind i rækken Ligevægt. Bliver en koncentration negativ, kan løsningen ikke bruges.",
                "x = " + NK.tal(daarlig) + " M giver " + M.kon(d.neg) + " = " + M.indsatTekst(rx, d.neg, daarlig) + ". Klik på den."
            ] };
        }
        var op = M.alle(rx).filter(function (b) { return Math.abs(M.vaerdi(M.plads(rx, b.s), mig.xMax)) < 1e-9; })[0];
        return { s: this.naaet ? op.s : null, trin: [
            "Træk x helt op, så langt skyderen kan komme.",
            "Se på beholderen og rækken Ligevægt. Hvilket stof er der ikke mere af?",
            M.skriv(op.s) + " er brugt op. Klik på " + M.skriv(op.s) + " i skemaet."
        ] };
    };

    P.visSvar = function () {
        var m = this.maal(), rx = this.rx, mig = this;
        if (m.type === "ligevaegt") {
            this.saetX(Math.round(this.xEq * 1000) / 1000);
            this.loest("svar", NK.html(m.slut));
            return;
        }
        if (m.type === "udtryk") {
            m.raekker.forEach(function (r) {
                M.alle(rx).forEach(function (a) {
                    mig.okF[r + "." + a.s] = true;
                    mig.v[r + "." + a.s] = r === "aendr" ? M.aendrTekst(a) : M.ligTekst(rx, a.s, false);
                });
                mig.kendt[r] = true;
            });
            this.loest("svar", NK.html(m.slut));
            return;
        }
        if (m.type === "forkast") {
            if (!this.roedder) this.koerCas();
            var i = this.roedder.map(function (q) { return M.dom(rx, q).ok; }).indexOf(false);
            this.forkastet = i;
            this.loest("svar", NK.html(m.slut));
            return;
        }
        this.saetX(this.xMax);
        this.naaet = true;
        this.loest("svar", NK.html(m.slut));
    };

    P.enter = function () {
        if (this.faerdig) { this.knap(); return; }
        this.tjek();
    };

    P.nulstil = function () {
        this.mol = [];
        this.vaelg(this.nr);
    };

    P.fokusFelt = function () {
        var f = (this.felter || []).filter(function (x) { return !x.value; })[0];
        if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } return; }
        if (this.maal().type === "ligevaegt" || this.maal().type === "graense") {
            try { this.skyder.focus({ preventScroll: true }); } catch (e2) { this.skyder.focus(); }
        }
    };

    P.paabegyndt = function (i) { return !!(this.paab && this.paab[i]); };

    P.faneStart = P.startFane;
    P.startFane = function (o, g) { this.paab = {}; this.faneStart(o, g); };

    /* ----- Musen paa laerredet: laaget, loesningerne og grafen ---------------------------- */
    P.ned = function (e) {
        var p = this.laerred.punkt(e), G = this.geo;
        if (!G) return;
        if (p.x >= G.laag.x && p.x <= G.laag.x + G.laag.w && p.y >= G.laag.y - 6 && p.y <= G.laag.y + G.laag.h + 6) {
            this.aabnLaag();
            return;
        }
        if (this.prikker) {
            for (var i = 0; i < this.prikker.length; i++) {
                var d = this.prikker[i];
                if ((p.x - d.x) * (p.x - d.x) + (p.y - d.y) * (p.y - d.y) < 16 * 16) { this.vaelgRod(d.i); return; }
            }
        }
        if (p.x >= G.g.x && p.x <= G.g.x + G.g.w && p.y >= G.g.y && p.y <= G.g.y + G.g.h) {
            this.traek = true;
            try { this.laerred.canvas.setPointerCapture(e.pointerId); } catch (err) { /* intet */ }
            this.traekTil(p.x);
        }
    };

    P.flyt = function (e) {
        var p = this.laerred.punkt(e), G = this.geo;
        if (this.traek) { this.traekTil(p.x); return; }
        if (!G) return;
        var over = (p.x >= G.laag.x && p.x <= G.laag.x + G.laag.w && p.y >= G.laag.y - 6 && p.y <= G.laag.y + G.laag.h + 6);
        if (!over && this.prikker) {
            over = this.prikker.some(function (d) { return (p.x - d.x) * (p.x - d.x) + (p.y - d.y) * (p.y - d.y) < 16 * 16; });
        }
        var graf = p.x >= G.g.x && p.x <= G.g.x + G.g.w && p.y >= G.g.y && p.y <= G.g.y + G.g.h;
        this.laerred.canvas.style.cursor = over ? "pointer" : (graf ? "ew-resize" : "default");
    };

    P.op = function () {
        if (!this.traek) return;
        this.traek = false;
        this.slutTraek();
    };

    P.traekTil = function (px) {
        var v = this.view;
        if (!v) return;
        var G = this.geo.g;
        var x = v.x0 + (px - G.x) / G.w * (v.x1 - v.x0);
        this.saetX(Math.round(NK.klamp(x, 0, this.xMax) * 1000) / 1000);
    };

    P.aabnLaag = function () {
        if (this.laag) return;
        this.laag = { t: 0 };
        this.kortBesked("Låget er af. Gassen slipper ud, og der bliver aldrig ligevægt. Derfor står der lukket beholder i alle opgaverne.", 5);
    };

    /* ----- Tegning ------------------------------------------------------------------------- */
    P.tilpas = function () {
        this.tilpasSkema();
        this.laerred.tilpas();
    };

    /* Er skemaet for bredt til sin plads, staar tallet under udtrykket */
    P.tilpasSkema = function () {
        var w = NK.el("bh-skema");
        w.classList.remove("stak");
        if (w.scrollWidth > w.clientWidth + 1) w.classList.add("stak");
    };

    P.opdater = function (dt) {
        this.opdaterBesked(dt);
        if (!NK.el("fane-bh").classList.contains("aktiv")) return;
        this.opdaterMolekyler(dt);
        if (this.roedder && this.zoom < 1) this.zoom = Math.min(1, this.zoom + dt / 1.1);
        this.tegn();
    };

    P.tegn = function () {
        var l = this.laerred;
        l.tilpas();
        var c = l.ctx, W = l.b, Hh = l.h;
        l.ryd();
        var pad = 12;
        var bhW = Math.min(W * 0.42, Hh * 1.05);
        var legH = 30;
        var beh = { x: pad, y: pad + 20, w: bhW - pad, h: Hh - pad * 2 - 20 - legH };
        var g = { x: bhW + 54, y: pad + 8, w: W - bhW - 54 - 20, h: Hh - pad * 2 - 30 };
        this.geo = { beh: beh, g: g, laag: { x: beh.x + beh.w * 0.08, y: beh.y - 16, w: beh.w * 0.84, h: 12 } };
        if (this.laag && this.laag.t < 2.6) {
            var op = Math.min(1, this.laag.t * 3) * (this.laag.t > 2.2 ? Math.max(0, (2.6 - this.laag.t) / 0.4) : 1);
            this.geo.laagLoeft = op;
        } else this.geo.laagLoeft = 0;
        this.tegnBeholder(c, beh);
        this.tegnLegende(c, beh, Hh - pad - legH + 6);
        if (g.w > 60 && g.h > 60) this.tegnGraf(c, g);
    };

    P.tegnBeholder = function (c, b) {
        var R = NK.klamp(Math.min(b.w, b.h) / 30, 4.5, 9.5);
        /* Glasset */
        c.save();
        NK.rundtRekt(c, b.x, b.y, b.w, b.h, 14);
        c.fillStyle = "rgba(160, 200, 230, 0.06)";
        c.fill();
        c.lineWidth = 3;
        c.strokeStyle = "rgba(190, 220, 240, 0.55)";
        c.stroke();
        c.clip();
        var ix = b.x + 6, iy = b.y + 6, iw = b.w - 12, ih = b.h - 12;
        var mig = this;
        this.mol.forEach(function (m) {
            if (m.alfa <= 0) return;
            var px = ix + m.x * iw, py = iy + m.y * ih;
            if (m.ude) py = iy + m.y * ih;
            mig.tegnMolekyle(c, m.s, px, py, R, m.rot, m.alfa, m.ny);
        });
        c.restore();
        /* Laaget */
        var L = this.geo.laag, loeft = this.geo.laagLoeft || 0;
        c.save();
        c.translate(L.x + L.w / 2, L.y + L.h / 2 - loeft * 22);
        c.rotate(-loeft * 0.18);
        NK.rundtRekt(c, -L.w / 2, -L.h / 2, L.w, L.h, 5);
        c.fillStyle = "#6c7480";
        c.fill();
        c.lineWidth = 1.5;
        c.strokeStyle = "#9aa4b1";
        c.stroke();
        NK.rundtRekt(c, -L.w * 0.12, -L.h / 2 - 6, L.w * 0.24, 7, 3);
        c.fillStyle = "#8a93a0";
        c.fill();
        c.restore();
        NK.tekst(c, "1 molekyle = " + NK.tal(this.rx.enhed).replace(/0+$/, "").replace(/,$/, "") + " M", b.x + 10, b.y + b.h - 10,
            { font: "600 12px 'Segoe UI', sans-serif", farve: "rgba(220,230,240,0.75)", kant: true });
    };

    P.tegnMolekyle = function (c, s, x, y, R, rot, alfa, ny) {
        var st = D.STOF[s];
        if (!st || !st.atomer) return;
        var co = Math.cos(rot), si = Math.sin(rot);
        var atomer = st.atomer.slice().sort(function (a, b) {
            return (b[1] * b[1] + b[2] * b[2]) - (a[1] * a[1] + a[2] * a[2]);
        });
        c.save();
        c.globalAlpha = alfa;
        if (ny > 0) {
            c.beginPath();
            c.arc(x, y, R * (2.2 + (0.7 - ny) * 2), 0, Math.PI * 2);
            c.strokeStyle = "rgba(242, 197, 61, " + (ny / 0.7 * 0.8) + ")";
            c.lineWidth = 2;
            c.stroke();
        }
        atomer.forEach(function (a) {
            var at = D.ATOM[a[0]];
            var ax = x + (a[1] * co - a[2] * si) * R * 1.55, ay = y + (a[1] * si + a[2] * co) * R * 1.55;
            var r = at.r * R;
            c.beginPath();
            c.arc(ax, ay, r, 0, Math.PI * 2);
            c.fillStyle = at.farve;
            c.fill();
            c.lineWidth = 1;
            c.strokeStyle = at.kant;
            c.stroke();
            c.beginPath();
            c.arc(ax - r * 0.32, ay - r * 0.32, r * 0.32, 0, Math.PI * 2);
            c.fillStyle = "rgba(255,255,255,0.35)";
            c.fill();
        });
        c.restore();
    };

    P.tegnLegende = function (c, b, y) {
        var mig = this, rx = this.rx, x = b.x + 4;
        var R = 5.2;
        M.alle(rx).forEach(function (a) {
            var n = mig.mol.filter(function (m) { return m.s === a.s && !m.ude; }).length;
            mig.tegnMolekyle(c, a.s, x + 12, y + 8, R, 0, 1, 0);
            var t = M.skriv(a.s) + ": " + n;
            NK.tekst(c, t, x + 28, y + 13, { font: "600 13px 'Segoe UI', sans-serif", farve: "#dfe6ee" });
            c.font = "600 13px 'Segoe UI', sans-serif";
            x += 40 + c.measureText(t).width;
        });
    };

    P.tegnGraf = function (c, G) {
        var rx = this.rx, K = rx.K, mig = this;
        var z = NK.blod(this.zoom);
        var span = this.xMax;
        var v0 = { x0: -0.05 * span, x1: span * 1.06, y0: -0.12 * K, y1: 2.5 * K };
        var v1 = v0;
        if (this.roedder) {
            var lo = Math.min(0, this.roedder[0]), hi = Math.max(this.xMax, this.roedder[this.roedder.length - 1]);
            var m = (hi - lo) * 0.12;
            v1 = { x0: lo - m, x1: hi + m, y0: -0.7 * K, y1: 2.5 * K };
        }
        var v = { x0: NK.lerp(v0.x0, v1.x0, z), x1: NK.lerp(v0.x1, v1.x1, z), y0: NK.lerp(v0.y0, v1.y0, z), y1: NK.lerp(v0.y1, v1.y1, z) };
        this.view = v;
        function px(x) { return G.x + (x - v.x0) / (v.x1 - v.x0) * G.w; }
        function py(y) { return G.y + G.h - (y - v.y0) / (v.y1 - v.y0) * G.h; }

        c.save();
        NK.rundtRekt(c, G.x, G.y, G.w, G.h, 8);
        c.fillStyle = "rgba(10, 12, 18, 0.45)";
        c.fill();
        c.clip();

        /* Det graa omraade, hvor en koncentration er negativ */
        if (this.roedder && z > 0.05) {
            c.globalAlpha = Math.min(1, z * 1.4);
            [[v.x0, 0, -1], [this.xMax, v.x1, 1]].forEach(function (zn) {
                var a = px(zn[0]), b = px(zn[1]);
                if (b - a < 2) return;
                c.fillStyle = "rgba(120, 125, 140, 0.22)";
                c.fillRect(a, G.y, b - a, G.h);
                c.save();
                c.beginPath();
                c.rect(a, G.y, b - a, G.h);
                c.clip();
                c.strokeStyle = "rgba(170, 175, 190, 0.18)";
                c.lineWidth = 1;
                for (var s = -G.h; s < b - a + G.h; s += 12) {
                    c.beginPath();
                    c.moveTo(a + s, G.y + G.h);
                    c.lineTo(a + s + G.h, G.y);
                    c.stroke();
                }
                c.restore();
                var xt = zn[2] < 0 ? -0.001 * span : mig.xMax + 0.001 * span;
                var d = M.dom(rx, xt);
                if (d.neg) {
                    var et = M.kon(d.neg) + " < 0";
                    c.font = "700 13px 'Segoe UI', sans-serif";
                    var eb = c.measureText(et).width / 2 + 6;
                    var ex = NK.klamp((a + b) / 2, G.x + eb, G.x + G.w - eb);
                    NK.tekst(c, et, ex, G.y + 20, { font: "700 13px 'Segoe UI', sans-serif", farve: "#d7dbe3", justering: "center", kant: true });
                }
            });
            c.globalAlpha = 1;
        }

        /* Akserne og gitteret */
        c.strokeStyle = "rgba(255,255,255,0.07)";
        c.lineWidth = 1;
        var skridt = (v.x1 - v.x0) > 0.3 ? 0.1 : 0.05;
        c.font = "12px 'Segoe UI', sans-serif";
        c.fillStyle = "#a9b0ba";
        for (var xt = Math.ceil(v.x0 / skridt) * skridt; xt <= v.x1 + 1e-9; xt += skridt) {
            c.beginPath(); c.moveTo(px(xt), G.y); c.lineTo(px(xt), G.y + G.h); c.stroke();
        }
        c.strokeStyle = "rgba(255,255,255,0.4)";
        c.beginPath(); c.moveTo(G.x, py(0)); c.lineTo(G.x + G.w, py(0)); c.stroke();
        c.beginPath(); c.moveTo(px(0), G.y); c.lineTo(px(0), G.y + G.h); c.stroke();

        /* K-linjen */
        c.setLineDash([7, 5]);
        c.strokeStyle = "rgba(242, 197, 61, 0.85)";
        c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(G.x, py(K)); c.lineTo(G.x + G.w, py(K)); c.stroke();
        c.setLineDash([]);

        /* Kurven: Y(x). Fuld streg, hvor alle koncentrationer er positive */
        var N = 360, rum = v.y1 - v.y0;
        function stykke(tilladt) {
            c.beginPath();
            var nede = true;
            for (var i = 0; i <= N; i++) {
                var x = v.x0 + (v.x1 - v.x0) * i / N;
                var ok = x >= -1e-12 && x <= mig.xMax + 1e-12;
                var Y = M.Y(rx, x);
                if (ok !== tilladt || !isFinite(Y) || Y > v.y1 + 4 * rum || Y < v.y0 - 4 * rum) { nede = true; continue; }
                if (nede) c.moveTo(px(x), py(Y)); else c.lineTo(px(x), py(Y));
                nede = false;
            }
            c.stroke();
        }
        if (this.roedder) {
            c.globalAlpha = Math.min(1, z * 1.4);
            c.setLineDash([6, 5]);
            c.strokeStyle = "rgba(200, 205, 215, 0.75)";
            c.lineWidth = 2;
            stykke(false);
            c.setLineDash([]);
            c.globalAlpha = 1;
        }
        c.strokeStyle = "#8ff0b4";
        c.lineWidth = 2.8;
        stykke(true);

        /* Det x, skyderen staar paa */
        var Yn = M.Y(rx, this.x);
        c.setLineDash([3, 4]);
        c.strokeStyle = "rgba(159, 211, 247, 0.7)";
        c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(px(this.x), G.y); c.lineTo(px(this.x), G.y + G.h); c.stroke();
        c.setLineDash([]);
        if (isFinite(Yn) && Yn <= v.y1) {
            c.beginPath();
            c.arc(px(this.x), py(Yn), 6.5, 0, Math.PI * 2);
            c.fillStyle = "#9fd3f7";
            c.fill();
            c.lineWidth = 2;
            c.strokeStyle = "#14141a";
            c.stroke();
        }

        /* Loesningerne fra CAS */
        this.prikker = null;
        if (this.roedder && z > 0.6) {
            this.prikker = [];
            this.roedder.forEach(function (r, i) {
                var X = px(r), Yp = py(K);
                var d = M.dom(rx, r);
                var forkastet = mig.forkastet === i;
                c.beginPath();
                c.arc(X, Yp, 9, 0, Math.PI * 2);
                c.fillStyle = forkastet ? "rgba(224, 84, 70, 0.9)" : (mig.faerdig && d.ok ? "rgba(63, 174, 114, 0.95)" : "rgba(242, 197, 61, 0.95)");
                c.fill();
                c.lineWidth = 2.5;
                c.strokeStyle = "#14141a";
                c.stroke();
                if (forkastet) {
                    c.strokeStyle = "#ffffff";
                    c.lineWidth = 2;
                    c.beginPath(); c.moveTo(X - 4, Yp - 4); c.lineTo(X + 4, Yp + 4); c.moveTo(X + 4, Yp - 4); c.lineTo(X - 4, Yp + 4); c.stroke();
                }
                NK.tekst(c, "x = " + NK.tal(r), X, Yp - 16, { font: "700 13px 'Segoe UI', sans-serif", farve: "#fff2cc", justering: "center", kant: true });
                mig.prikker.push({ x: X, y: Yp, i: i });
            });
        }
        c.restore();

        /* Tal paa akserne (uden for klippet) */
        c.fillStyle = "#a9b0ba";
        c.font = "12px 'Segoe UI', sans-serif";
        c.textAlign = "center";
        c.textBaseline = "top";
        for (xt = Math.ceil(v.x0 / skridt) * skridt; xt <= v.x1 + 1e-9; xt += skridt) {
            var tx = Math.abs(xt) < 1e-9 ? "0" : (xt < 0 ? "−" : "") + Math.abs(xt).toFixed(2).replace(".", ",");
            c.fillText(tx, px(xt), G.y + G.h + 5);
        }
        NK.tekst(c, "x / M", G.x - 8, G.y + G.h + 17, { font: "600 12px 'Segoe UI', sans-serif", farve: "#dfe6ee", justering: "right" });
        NK.tekst(c, "Y", G.x - 10, G.y + 10, { font: "italic 700 15px 'Times New Roman', serif", farve: "#dfe6ee", justering: "right" });
        NK.tekst(c, "K", G.x - 10, py(K) + 5, { font: "italic 700 15px 'Times New Roman', serif", farve: "#f2c53d", justering: "right" });
        NK.tekst(c, "0", G.x - 10, py(0) + 4, { font: "12px 'Segoe UI', sans-serif", farve: "#a9b0ba", justering: "right" });
    };

    NK.SimBeholder = SimBeholder;
}());
