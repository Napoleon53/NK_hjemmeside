/* =====================================================================
   sim_skema.js - fane 2: skemaet

   Kuglerne er vaek. Reaktionsskemaet staar paa tavlen med et felt foran
   hvert stof, og eleven skriver tallene. Et tomt felt taeller som 1, som
   i bogen. Under skemaet taeller regnskabet atomerne med elevens egne tal,
   mens der skrives. Enter tjekker. 24 reaktioner i tre grupper: Let,
   Middel (forbraendinger og syrer) og Svaer (parenteser, store tal og et
   halvt O2 undervejs).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var A = NK.Afst;

    function SimSkema() {
        var mig = this;
        this.tavle = NK.el("sk-tavle");
        this.taelKnap = NK.el("sk-optael");
        this.taelKnap.addEventListener("click", function () { mig.skiftTael(); });
        D.SKEMA.forEach(function (o, i) { if (!o.navn) o.navn = "Reaktion " + (i + 1); });
        this.startFane(D.SKEMA, D.GRUPPER);
        this.introNu = true;
        this.vaelg(0);
    }

    var P = SimSkema.prototype;
    NK.Fane.paa(P, { navn: "sk" });

    P.chipTekst = function (o) { return String(this.opgaver.indexOf(o) + 1); };

    function F(f) { return A.skriv(f); }

    /* ----- Opgaven ----------------------------------------------------------------
       Optaellingen er slaaet fra, hver gang en ny reaktion begynder: eleven
       skal selv taelle atomerne. Knappen under tavlen viser den, men kun for
       den ene opgave (brugerens valg 30. sept. 2026). */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.opg = { o: o, loest: false, vist: false };
        this.tael = false;
        this.bygTavle();
        this.visTaelKnap();
    };

    P.skiftTael = function () {
        this.tael = !this.tael;
        this.visTaelKnap();
        this.visRegnskab();
        this.tilpasTavle();
        this.fokus();
    };

    P.visTaelKnap = function () {
        var k = this.taelKnap;
        if (!k) return;
        k.textContent = this.tael ? "Skjul optællingen" : "Vis optællingen";
        k.classList.toggle("til", !!this.tael);
        k.title = this.tael ? "Tæl selv igen. Optællingen er slået fra ved hver ny reaktion" :
            "Vis, hvor mange af hvert atom der er på hver side. Den er slået fra igen ved næste reaktion";
    };

    P.opgaveFaerdig = function () { return this.opg.loest; };

    P.promptHTML = function () {
        return '<p class="maal-tekst">Skriv tallene foran stofferne, så reaktionen er afstemt.</p>' +
            '<p class="note-tekst">Et tomt felt tæller som 1.</p>';
    };

    P.trinLinje = function () {
        return "Skriv tallene i felterne på tavlen, og tryk Enter. Tæl selv atomerne på hver side.";
    };

    P.slutLinje = function () {
        var k = this.tal();
        return A.ligning(this.opg.o.r, this.opg.o.p, k.cr, k.cp) + ".";
    };

    /* Elevens tal: cr og cp, og det foerste felt, der ikke kan bruges */
    P.tal = function () {
        var o = this.opg.o, cr = [], cp = [], galt = null;
        this.felter.forEach(function (inp, i) {
            var v = A.laesTal(inp.value);
            if (typeof v !== "number" || isNaN(v) || v < 1 || v > D.MAKS_TAL) {
                if (!galt) galt = { i: i, v: v };
                v = 1;
            }
            if (i < o.r.length) cr.push(v); else cp.push(v);
        });
        return { cr: cr, cp: cp, galt: galt };
    };

    /* ----- Hinttrappen og Vis svaret -------------------------------------------------- */
    P.hintTrin = function () {
        var k = this.tal();
        if (k.galt) {
            return { e: null, trin: [
                "Se på felterne. Et af tallene kan ikke bruges.",
                "Der skal stå et helt tal foran hvert stof. Et tomt felt tæller som 1.",
                "Ret feltet, og tryk Enter igen."
            ] };
        }
        return A.hintTrin(this.opg.o.r, this.opg.o.p, k.cr, k.cp);
    };

    P.visSvar = function () {
        var o = this.opg.o;
        this.felter.forEach(function (inp, i) {
            inp.value = String(o.facit[i]);
            inp.parentNode.classList.remove("fejl");
            inp.parentNode.classList.add("vist");
        });
        this.opg.vist = true;
        this.laas();
        this.visRegnskab();
        this.loest("svar", A.svarTekst(o));
    };

    /* ----- Tjek -------------------------------------------------------------------------- */
    P.tjek = function () {
        if (this.opg.loest) return;
        var o = this.opg.o, k = this.tal();
        if (k.galt) {
            this.rystFelt(this.felter[k.galt.i]);
            var v = k.galt.v;
            this.fejlLinje(v === "broek" ? "Tallene foran skal være hele tal. Står du med et halvt, så gang alle tallene med 2." :
                v === 0 ? "0 foran et stof betyder, at stoffet ikke er med. Skriv mindst 1." :
                typeof v === "number" && v > D.MAKS_TAL ? "Så store tal skal der ikke til." :
                "Skriv hele tal i felterne, fx 2 eller 3.");
            return;
        }
        var d = A.dom(o.r, o.p, k.cr, k.cp);
        if (d.ok) {
            this.felter.forEach(function (inp) { inp.parentNode.classList.add("ok"); });
            this.laas();
            this.visRegnskab();
            this.loest("selv");
            return;
        }
        this.tavle.classList.remove("ryst");
        void this.tavle.offsetWidth;
        this.tavle.classList.add("ryst");
        this.fejlLinje(A.fejl(o.r, o.p, k.cr, k.cp));
    };

    P.laas = function () {
        this.opg.loest = true;
        this.felter.forEach(function (inp) { inp.readOnly = true; });
        this.tavle.classList.add("faerdig");
        /* Et groent stempel paa tavlen, saa det ses uden at laese linjen */
        var s = document.createElement("div");
        s.className = "tv-stempel";
        s.textContent = this.opg.vist ? "Svaret" : "Afstemt ✓";
        if (this.opg.vist) s.classList.add("gul");
        this.tavle.appendChild(s);
    };

    P.enter = function () {
        if (this.faerdig) this.knap();
        else this.tjek();
    };

    P.rystFelt = function (inp) {
        var f = inp.parentNode;
        f.classList.remove("fejl");
        void f.offsetWidth;
        f.classList.add("fejl");
        inp.focus();
    };

    /* ----- Tavlen ----------------------------------------------------------------------- */
    P.bygTavle = function () {
        var mig = this, o = this.opg.o, t = this.tavle;
        t.innerHTML = "";
        t.classList.remove("faerdig", "ryst");
        var navn = document.createElement("div");
        navn.className = "tv-navn";
        navn.textContent = o.navn;
        t.appendChild(navn);

        var linje = document.createElement("div");
        linje.className = "sk-linje skema-stor";
        linje.id = "sk-linje";
        this.felter = [];
        var alle = o.r.concat(o.p);
        alle.forEach(function (f, i) {
            if (i === o.r.length) {
                var pil = document.createElement("span");
                pil.className = "sk-pil";
                pil.textContent = "→";
                linje.appendChild(pil);
            } else if (i > 0) {
                var plus = document.createElement("span");
                plus.className = "sk-plus";
                plus.textContent = "+";
                linje.appendChild(plus);
            }
            var stof = document.createElement("span");
            stof.className = "sk-stof";
            var felt = document.createElement("span");
            felt.className = "sk-felt";
            var inp = document.createElement("input");
            inp.type = "text";
            inp.inputMode = "numeric";
            inp.className = "koeffelt";
            inp.autocomplete = "off";
            inp.spellcheck = false;
            inp.maxLength = 3;
            inp.setAttribute("aria-label", "Tallet foran " + F(f));
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); mig.enter(); }
            });
            inp.addEventListener("input", function () {
                felt.classList.remove("fejl");
                mig.nulstilHjaelp();
                mig.visRegnskab();
            });
            felt.appendChild(inp);
            stof.appendChild(felt);
            var fo = document.createElement("span");
            fo.className = "sk-formel";
            fo.textContent = F(f);
            stof.appendChild(fo);
            linje.appendChild(stof);
            mig.felter.push(inp);
        });
        t.appendChild(linje);

        var rs = document.createElement("div");
        rs.className = "tv-regnskab";
        rs.id = "sk-regnskab";
        t.appendChild(rs);
        this.rsEl = rs;
        this.visRegnskab();
        this.tilpasTavle();
    };

    /* Regnskabet med elevens egne tal (et tomt felt er 1). Det regnes altid,
       men vises kun, naar eleven har slaaet optaellingen til. */
    P.visRegnskab = function () {
        var o = this.opg.o, k = this.tal();
        this.rsEl.hidden = !this.tael;
        var rows = A.regnskab(o.r, o.p, k.cr, k.cp);
        var html = '<span class="tr-h"></span><span class="tr-h">Før pilen</span><span class="tr-h">Efter pilen</span><span class="tr-h"></span>';
        var lys = this.faerdig ? null : this.hintE;
        rows.forEach(function (x) {
            var ok = x.v === x.h, kl = (ok ? "ok" : "skidt") + (x.e === lys ? " lys" : "");
            html += '<span class="tr-e' + (x.e === lys ? " lys" : "") + '">' + x.e + "</span>" +
                '<span class="tr-t ' + kl + '">' + x.v + "</span>" +
                '<span class="tr-t ' + kl + '">' + x.h + "</span>" +
                '<span class="tr-m ' + kl + '">' + (ok ? "✓" : "✗") + "</span>";
        });
        if (this.rsEl._html !== html) { this.rsEl.innerHTML = html; this.rsEl._html = html; }
    };

    P.fokusFelt = function () {
        var a = document.activeElement;
        if (a && this.felter.indexOf(a) >= 0) return;
        for (var i = 0; i < this.felter.length; i++) {
            if (!this.felter[i].value) { this.felter[i].focus(); return; }
        }
        this.felter[0].focus();
    };

    /* Skriften foelger tavlen, og skemaet skal kunne staa paa én linje */
    P.tilpasTavle = function () {
        var t = this.tavle;
        if (!t.offsetWidth || !this.lay) return;
        var fs = this.lay.fs;
        var linje = NK.el("sk-linje");
        t.style.setProperty("--fs", fs + "px");
        while (fs > 18 && linje && (linje.scrollWidth > t.clientWidth - 30 || t.scrollWidth > t.clientWidth)) {
            fs -= 1;
            t.style.setProperty("--fs", fs + "px");
        }
    };

    /* ----- Scenen ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var lay = { W: W, H: H, baand: baand };
        var kant = NK.klamp(W * 0.03, 12, 34), top = NK.klamp(H * 0.035, 10, 26);
        var b = Math.min(W - 2 * kant, 1040);
        /* Tavlen skal ikke vaere et stort tomt felt: hoejden foelger skemaets
           egen stoerrelse, og resten af pladsen er luft omkring den */
        var plads = baand.y - top - NK.klamp(H * 0.03, 10, 22);
        var knap = 68;                                  /* plads til knappen under tavlen */
        var h = NK.klamp(b * 0.5, 200, plads - knap);
        lay.tavle = { x: Math.round((W - b) / 2), y: Math.round(top + (plads - knap - h) / 2), b: Math.round(b), h: Math.round(h) };
        lay.fs = Math.round(NK.klamp(Math.min(h / 6, b / 15), 24, 54));
        var t = this.tavle;
        t.style.left = lay.tavle.x + "px";
        t.style.top = lay.tavle.y + "px";
        t.style.width = lay.tavle.b + "px";
        t.style.height = lay.tavle.h + "px";
        var k = this.taelKnap, kb = NK.klamp(lay.tavle.b * 0.32, 260, 380);
        k.style.left = Math.round(lay.tavle.x + (lay.tavle.b - kb) / 2) + "px";
        k.style.width = Math.round(kb) + "px";
        k.style.top = Math.round(lay.tavle.y + lay.tavle.h + 14) + "px";
        this.lay = lay;
        this.tilpasTavle();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        NK.Tegn.vaeg(ctx, lay.W, lay.baand.y);

    };

    P.klikScene = function () {};

    NK.SimSkema = SimSkema;
}());
