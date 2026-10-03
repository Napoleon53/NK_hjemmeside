/* =====================================================================
   sim_rust.js - fane 3: Rusten

   En jernplade set helt taet paa, med en draabe vand og luft over. Tre
   kontakter: Vand, Ilt og Salt. Naar der baade er vand og ilt, forlader
   jernatomerne pladen midt under draaben som Fe²⁺, elektronerne gaar
   gennem jernet ud til draabens kant, hvor ilt og vand optager dem og
   bliver til OH⁻, og Fe²⁺ og OH⁻ moedes og bliver til Fe(OH)₂ og videre
   til rust. Med salt gaar det tre gange saa hurtigt.

   Hele scenen er ét partikelbillede (js/mikro.js). Fanen bestemmer kun,
   hvornaar og hvor et jernatom afgiver sine elektroner (K.rustFart).
   Eleven afstemmer de fire skemaer paa tavlen under scenen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var RAEK = 6;
    var SET_SEK = 4;       /* saa laenge skal en mulighed ses, foer den taeller som proevet */
    var SALT_SEK = 5;

    function SimRust() {
        var mig = this;
        this.til = { vand: true, ilt: true, salt: false };
        this.knap3 = { vand: NK.el("j-vand"), ilt: NK.el("j-ilt"), salt: NK.el("j-salt") };
        this.tavle = NK.el("j-tavle");
        this.set = {};
        this.akk = 0;
        this.cyklus = 0;
        this.tomT = 0;
        ["vand", "ilt", "salt"].forEach(function (navn) {
            mig.knap3[navn].addEventListener("click", function () { mig.skift(navn); mig.fokus(); });
        });
        this.tavle.addEventListener("click", function (e) {
            if (e.target && e.target.id === "j-tjek") mig.tjek();
        });
        this.tavle.addEventListener("input", function () { mig.nulstilHjaelp(); });
        this.tavle.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); mig.tjek(); }
        });
        this.startFane(D.J_MAAL);
        if (this.erLoest("krav")) D.KOMBI.forEach(function (k) { mig.set[mig.noegle(k)] = SET_SEK; });
        this.visPanel();
    }

    var P = SimRust.prototype;
    NK.Fane.paa(P, { navn: "j" });

    /* ----- Kontakterne ------------------------------------------------------------- */
    P.skift = function (navn) {
        this.til[navn] = !this.til[navn];
        if (navn === "vand" && !this.til.vand) this.til.salt = false;      /* intet vand, intet saltvand */
        if (navn === "salt" && this.til.salt) this.til.vand = true;
        this.brugTil();
        this.akk = Math.max(this.akk, 0.6);      /* det foerste atom kommer hurtigt */
        this.nulstilHjaelp();
        if (!this.faerdig) this.naesteLinje("", "");
    };

    /* Paa tavlen skrives der tal: saa skifter et tal paa tastaturet ikke fane */
    P.tagerTal = function () { return !this.faerdig && this.opg.fase === "felter"; };

    P.brugTil = function () {
        var mig = this;
        if (this.M) this.M.saet(this.til);
        ["vand", "ilt", "salt"].forEach(function (navn) {
            mig.knap3[navn].classList.toggle("til", mig.til[navn]);
            mig.knap3[navn].setAttribute("aria-pressed", mig.til[navn] ? "true" : "false");
        });
    };

    P.noegle = function (k) { return (k.vand ? "v" : "-") + (k.ilt ? "i" : "-"); };

    P.fart = function () { return K.rustFart(this.til.vand, this.til.ilt, this.til.salt); };

    /* ----- Pladen -------------------------------------------------------------------- */
    P.nyPlade = function () {
        var lay = this.lay;
        var kol = lay ? lay.kol : 27, over = lay ? lay.over : 8;
        this.M = new NK.Mikro({
            kol: kol, raek: RAEK, over: over, vand: "draabe", faeldning: true, o2: 6, n2: 8,
            draabe: this.draabeMaal(kol, over),
            metal: function () { return "Fe"; }
        });
        if (this.gammelTael) this.M.tael = this.gammelTael;
        this.M.saet(this.til);
        this.akk = 0;
        this.cyklus = 0;
        this.tomT = 0;
    };

    P.draabeMaal = function (kol, over) {
        return { cx: kol / 2, R: Math.min(kol * 0.36, 12), h: NK.klamp(over - 2.6, 2.4, 6.2) };
    };

    P.nulstilScene = function () {
        this.gammelTael = null;
        this.nyPlade();
    };

    /* Kolonnen, det naeste jernatom forlader: midt under draaben, det laveste hul foerst */
    P.anodeKolonne = function () {
        var M = this.M, d = M.draabe, bedst = -1, bv = 1e9;
        var graense = d.R * 0.52;
        for (var c = 0; c < M.kol; c++) {
            var afstand = Math.abs(c + 0.5 - d.cx);
            if (afstand > graense || !M.kanAfgive(c)) continue;
            var v = M.top[c] * 1.6 + afstand * 0.9 + Math.random() * 1.4;
            if (v < bv) { bv = v; bedst = c; }
        }
        return bedst;
    };

    /* Stedet ved draabens kant, hvor elektronerne optages: skiftevis venstre og hoejre */
    P.katodeKolonne = function () {
        var d = this.M.draabe, side = Math.floor(this.cyklus / 2) % 2 ? 1 : -1;
        return NK.klamp(Math.floor(d.cx + side * (d.R - 1.7)), 0, this.M.kol - 1);
    };

    /* ----- Maalene ---------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.saltSet = { med: 0, uden: 0 };
        /* Maal 1 begynder med et tomt skema: de fire muligheder proeves igen */
        if (o.id === "krav") { this.set = {}; if (this.status) this.visPanel(); }
        this.byggTavle();
        this.visEkstra();
    };

    P.nyFase = function () { this.byggTavle(); this.visEkstra(); };

    /* Har eleven proevet alle fire muligheder foer gaettet, taeller de */
    P.efterGaet = function () {
        if (this.opg.o.id === "krav" && !this.mangler()) this.forsoegKlaret("");
    };

    P.efterOpgave = function () {
        this.byggTavle();
        this.visEkstra();
        this.visPanel();
    };

    P.visEkstra = function () {
        var o = this.opg ? this.opg.o : null;
        var vis = this.erLoest("salt") || (o && o.id === "salt" && this.opg.fase !== "gaet");
        this.knap3.salt.hidden = !vis;
        if (!vis && this.til.salt) { this.til.salt = false; }
        this.brugTil();
    };

    P.sceneLinje = function () {
        var g = this.opg, id = g.o.id, t = this.til;
        if (g.fase === "felter") {
            return (t.vand && t.ilt ? "" : "Slå Vand og Ilt til, så du kan se, hvad der sker. ") + "Skriv tallene på tavlen, og tryk på Tjek.";
        }
        if (id === "krav") {
            var mangler = this.mangler();
            if (this.set[this.noegle(t)] >= SET_SEK && mangler) {
                return "Den mulighed er prøvet. Skift Vand eller Ilt med kontakterne. Der mangler " + mangler + ".";
            }
            return "Se, om jernatomerne forlader pladen. Skift så Vand eller Ilt med kontakterne øverst til venstre.";
        }
        if (!t.vand || !t.ilt) return "Slå både Vand og Ilt til.";
        var s = this.saltSet;
        if (t.salt) return s.med < SALT_SEK ? "Salt er slået til. Se på tælleren øverst til højre." : "Slå nu Salt fra, og sammenlign.";
        return s.uden < SALT_SEK && s.med >= SALT_SEK ? "Salt er slået fra. Se på tælleren øverst til højre." : "Slå Salt til med kontakten øverst til venstre.";
    };

    P.spmLinje = function () {
        return this.opg.o.id === "salt" && !this.til.salt ? "Slå Salt til, og se, hvor Na⁺ og Cl⁻ bevæger sig hen. Vælg så et svar i opgavekortet til højre." : "";
    };

    P.mangler = function () {
        var mig = this;
        return D.KOMBI.filter(function (k) { return !(mig.set[mig.noegle(k)] >= SET_SEK); }).length;
    };

    P.forsoegSvar = function (o) {
        var mig = this;
        if (o.id === "krav") D.KOMBI.forEach(function (k) { mig.set[mig.noegle(k)] = SET_SEK; });
        else {
            this.saltSet = { med: SALT_SEK, uden: SALT_SEK };
            this.til = { vand: true, ilt: true, salt: true };
            this.brugTil();
        }
        this.visPanel();
    };

    /* ----- Tavlen med skemaet ---------------------------------------------------------- */
    P.skemaId = function () {
        var g = this.opg;
        return g && g.o.felter ? g.o.felter.skema : null;
    };

    P.byggTavle = function () {
        var id = this.skemaId();
        var vis = !!id;
        this.tavle.hidden = !vis;
        if (!vis) { if (this.lay) this.layout(); return; }
        var loest = this.faerdig, facit = K.facit(id), html = "";
        html += '<span class="st-navn">' + NK.html(K.SKEMA[id].navn) + "</span>";
        html += '<div class="st-linje">';
        var forrige = null;
        K.led(id).forEach(function (l) {
            if (forrige) html += '<span class="st-tegn">' + (forrige.side === l.side ? "+" : "→") + "</span>";
            html += '<span class="st-led">';
            if (l.felt) {
                if (loest) html += '<b class="st-tal">' + facit[l.nr] + "</b>";
                else html += '<input class="st-felt" type="text" inputmode="numeric" maxlength="2" autocomplete="off" data-felt="' + l.nr + '" aria-label="Tal foran ' + NK.html(l.f) + '">';
            } else if (l.k !== 1) {
                html += '<span class="st-fast">' + l.k + "</span>";
            }
            html += '<span class="st-formel">' + NK.html(l.f) + "</span></span>";
            forrige = l;
        });
        html += "</div>";
        if (loest) html += '<span class="st-stempel">AFSTEMT ✓</span>';
        else html += '<button class="tjekknap" id="j-tjek" type="button">Tjek</button>';
        this.tavle.innerHTML = html;
        this.tavle.classList.toggle("faerdig", !!loest);
        if (this.lay) this.layout();
    };

    P.felter = function () { return this.tavle.querySelectorAll("input.st-felt"); };

    P.fokusFelt = function () {
        if (this.faerdig || this.opg.fase !== "felter") return;
        var f = this.felter();
        if (document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("st-felt")) return;
        for (var i = 0; i < f.length; i++) if (!f[i].value) { f[i].focus(); return; }
    };

    P.tjek = function () {
        if (this.faerdig || this.opg.fase !== "felter") return;
        var id = this.skemaId(), f = this.felter(), tal = [], tomt = false, i;
        for (i = 0; i < f.length; i++) {
            var tekst = NK.ascii(f[i].value).trim();
            if (!/^[1-9][0-9]?$/.test(tekst)) { tomt = true; f[i].classList.add("mangler"); }
            else { f[i].classList.remove("mangler"); tal.push(parseInt(tekst, 10)); }
        }
        if (tomt) { this.fejlLinje(D.TOMT_FELT); this.rystTavle(); return; }
        var res = K.tjekSkema(id, tal);
        if (res.ok) {
            this.loest("selv", K.skemaTekst(id) + ". " + this.opg.o.loest);
            return;
        }
        this.fejlLinje(D.skemaFejl(id, tal, res));
        this.rystTavle();
    };

    P.rystTavle = function () {
        var e = this.tavle;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.felterSvar = function (o) {
        this.loest("svar", K.skemaTekst(o.felter.skema) + ". " + o.loest);
    };

    P.enter = function () { if (this.opg.fase === "felter") this.tjek(); };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.visPanel = function () {
        var mig = this, html = "";
        var NAVN = { "vi": "Vand og ilt", "v-": "Vand, men ingen ilt", "-i": "Ilt, men intet vand", "--": "Hverken vand eller ilt" };
        D.KOMBI.forEach(function (k) {
            var n = mig.noegle(k), set = mig.set[n] >= SET_SEK, ruster = K.rustFart(k.vand, k.ilt, false) > 0;
            html += '<div class="talraekke"><span>' + NAVN[n] + '</span><span class="tal' + (set && ruster ? " roed" : "") + '">' +
                (set ? (ruster ? "ruster" : "ruster ikke") : "ikke prøvet") + "</span></div>";
        });
        NK.saetHTML("j-forsoeg", html);

        var linjer = "";
        ["ox", "red", "samlet", "rust"].forEach(function (id) {
            if (!mig.erLoest(id)) return;
            if (id === "rust") linjer += '<div class="regn-linje"><span class="rl-navn">I dråben</span>Fe²⁺ + 2 OH⁻ → Fe(OH)₂</div>';
            linjer += '<div class="regn-linje"><span class="rl-navn">' + K.SKEMA[id].navn + "</span>" + NK.html(K.skemaTekst(id)) + "</div>";
        });
        NK.saetHTML("j-skemaer", linjer);
        NK.el("j-skemakort").hidden = !linjer;
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        var tavleH = this.tavle.hidden ? 0 : (this.tavle.offsetHeight || 92);
        this.tavle.style.bottom = (baand.h + 10) + "px";
        lay.rekt = { x: 0, y: 0, b: W, h: Hs - (tavleH ? tavleH + 20 : 0) };
        var s = NK.klamp(W / 27, 25, 34);
        lay.kol = Math.max(16, Math.round(W / s));
        lay.s = W / lay.kol;
        lay.over = lay.rekt.h / lay.s - RAEK;
        lay.y0 = lay.rekt.y + lay.rekt.h - RAEK * lay.s;
        lay.boks = { x: W - 232, y: 12, b: 220, h: 116 };
        this.lay = lay;
        if (!this.M || this.M.kol !== lay.kol) {
            if (this.M) this.gammelTael = this.M.tael;
            this.nyPlade();
        } else {
            this.M.over = lay.over;
            this.M.draabe = this.draabeMaal(lay.kol, lay.over);
        }
        var d = this.M.draabe;
        this.saetAnker("draabe", (d.cx - d.R) * lay.s, lay.y0 - d.h * lay.s, 2 * d.R * lay.s, d.h * lay.s + 2 * lay.s);
        this.saetAnker("plade", lay.boks.x, lay.boks.y, lay.boks.b, lay.boks.h);
    };

    P.opdaterScene = function (dt) {
        var M = this.M, g = this.opg;
        var fart = this.fart();

        /* Jernatomerne afgiver elektroner i den fart, modellen siger */
        if (fart > 0 && M.elektronerUndervejs() < 14) {
            this.akk += fart * dt;
            while (this.akk >= 1) {
                this.akk -= 1;
                var c = this.anodeKolonne();
                if (c < 0) { if (!this.tomT) this.tomT = 0.01; break; }
                if (M.afgiv(c, this.katodeKolonne())) this.cyklus++;
            }
        }
        /* Jernet under draaben er brugt op: en ny plade */
        if (this.tomT > 0 && fart > 0) {
            this.tomT += dt;
            if (this.tomT > 3.5) {
                this.gammelTael = M.tael;
                this.nyPlade();
                this.kortBesked("Jernet under dråben er tæret væk. Her er en ny plade.", 5);
            }
        }
        M.opdater(dt);

        /* Hvad eleven har set */
        var n = this.noegle(this.til);
        var foer = this.set[n] || 0;
        this.set[n] = foer + dt;
        if (foer < SET_SEK && this.set[n] >= SET_SEK) {
            this.visPanel();
            if (!this.faerdig && g.o.id === "krav" && g.fase === "forsoeg") {
                if (!this.mangler()) this.forsoegKlaret("");
                else this.naesteLinje("", "");
            }
        }
        if (!this.faerdig && g.o.id === "salt" && g.fase === "forsoeg" && this.til.vand && this.til.ilt) {
            if (this.til.salt) this.saltSet.med += dt; else this.saltSet.uden += dt;
            if (this.saltSet.med >= SALT_SEK && this.saltSet.uden >= SALT_SEK) this.forsoegKlaret(g.o.forsoeg.set);
        }
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        this.M.tegn(ctx, lay.rekt, {});
        this.tegnTekster(ctx, lay);
        this.tegnBoks(ctx, lay);
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    P.tegnTekster = function (ctx, lay) {
        var M = this.M, d = M.draabe, s = lay.s, y0 = lay.y0, t = this.til;
        Tg.maerkat(ctx, t.ilt ? "luft" : "luft uden ilt", 14, 78, { justering: "left" });
        if (t.vand) Tg.maerkat(ctx, t.salt ? "saltvand" : "vand", d.cx * s, y0 - (d.h - 0.6) * s, { farve: "#a8d4f5" });
        Tg.maerkat(ctx, "jern", 14, y0 + RAEK * s - 16, { justering: "left" });
        /* Naar skemaet er afstemt, faar stedet sit navn */
        if (this.erLoest("ox")) Tg.maerkat(ctx, "oxidation", d.cx * s, y0 + RAEK * s - 16, { farve: "#f7e4ab" });
        if (this.erLoest("red")) {
            [-1, 1].forEach(function (side) {
                Tg.maerkat(ctx, "reduktion", (d.cx + side * (d.R - 1.2)) * s, y0 + RAEK * s - 16, { farve: "#c7d0ff" });
            });
        }
    };

    /* Pladen i almindelig stoerrelse og taelleren, oeverst til hoejre */
    P.tegnBoks = function (ctx, lay) {
        var B = lay.boks, tael = this.M.tael, t = this.til;
        NK.rundtRekt(ctx, B.x, B.y, B.b, B.h, 10);
        ctx.fillStyle = "#15161d";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#3d4150";
        ctx.stroke();
        NK.tekst(ctx, "JERNPLADEN", B.x + 12, B.y + 20, { font: Tg.font("700", 12), farve: "#f2c53d" });
        /* Pladen med draaben og rusten */
        var px = B.x + 14, py = B.y + 50, pb = 78;
        ctx.fillStyle = "#7b8695";
        ctx.fillRect(px, py, pb, 10);
        ctx.fillStyle = "#3d4551";
        ctx.fillRect(px, py + 10, pb, 3);
        var rust = Math.min(1, tael.rust / 48);
        if (rust > 0) {
            ctx.fillStyle = "#a9521f";
            ctx.fillRect(px + pb / 2 - 26, py - 1, 52, 2 + rust * 3);
            ctx.fillRect(px + pb / 2 - 24, py - 3 - rust * 3, 9, 3 + rust * 3);
            ctx.fillRect(px + pb / 2 + 15, py - 3 - rust * 3, 9, 3 + rust * 3);
        }
        if (t.vand) {
            ctx.beginPath();
            ctx.ellipse(px + pb / 2, py, 24, 13, 0, Math.PI, 0);
            ctx.closePath();
            ctx.fillStyle = "rgba(90, 170, 240, 0.55)";
            ctx.fill();
            ctx.strokeStyle = "rgba(190, 225, 255, 0.7)";
            ctx.stroke();
        }
        var x = B.x + 106;
        NK.tekst(ctx, "Jernatomer væk", x, B.y + 40, { font: Tg.font("600", 12), farve: "#a9b0ba" });
        NK.tekst(ctx, String(tael.afgivet), x, B.y + 62, { font: Tg.font("700", 20), farve: "#f2f3f5" });
        NK.tekst(ctx, "Pr. minut", x, B.y + 84, { font: Tg.font("600", 12), farve: "#a9b0ba" });
        NK.tekst(ctx, String(Math.round(this.fart() * 60)), x, B.y + 106, { font: Tg.font("700", 20), farve: this.fart() > 0 ? "#f0a070" : "#f2f3f5" });
    };

    /* ----- Musen: et klik paa en partikel siger, hvad den er ------------------------------ */
    P.klikScene = function (pt) {
        var lay = this.lay, M = this.M;
        var x = pt.x / lay.s, y = (pt.y - lay.y0) / lay.s;
        function ved(liste, r) {
            for (var i = 0; i < liste.length; i++) if (Math.hypot(liste[i].x - x, liste[i].y - y) < r) return liste[i];
            return null;
        }
        var p;
        if (ved(M.el, 0.5)) this.kortBesked("En elektron, e⁻. Den går gennem jernet fra midten ud til dråbens kant.", 5);
        else if (ved(M.ion, 0.6)) this.kortBesked("En jernion, Fe²⁺. Den var et jernatom i pladen og har afgivet to elektroner.", 5);
        else if (ved(M.oh, 0.6)) this.kortBesked("En hydroxidion, OH⁻. Den er dannet af ilt, vand og elektroner ved dråbens kant.", 5);
        else if ((p = ved(M.salt, 0.6))) this.kortBesked(p.type === "Na" ? "En natriumion, Na⁺, fra saltet. Den bliver ikke brugt." : "En chloridion, Cl⁻, fra saltet. Den bliver ikke brugt.", 5);
        else if ((p = ved(M.gas, 0.8))) this.kortBesked(p.type === "o2" ? "Et iltmolekyle, O₂, fra luften." : "Et nitrogenmolekyle, N₂. Det reagerer ikke med jern.", 5);
        else if ((p = ved(M.dep, 0.45))) this.kortBesked(p.type === "rust" ? "Rust, FeO(OH)." : "Fe(OH)₂. Ilt gør det til rust.", 5);
        else if (y > 0) this.kortBesked("Jernatomer, Fe, i pladen.", 4);
    };

    NK.SimRust = SimRust;
}());
