/* =====================================================================
   sim_tael.js - fane 2: Tæl i mol

   Seks opgaver, hvor mol bruges som et antal, ligesom et dusin: fra
   dusin aeg til mol aeg, fra et antal molekyler til mol (hele saekke
   og en halv saek), atomerne i et molekyle og til sidst, hvor lidt
   1 mol er brug for, naar det gaelder mennesker.

   Laerredet viser opgaven som bakker og saekke. Naar svaret er rigtigt,
   fyldes saekkene, og regnestykket kommer frem over dem. Et forkert svar
   bliver roedt, forklaringen staar i kortets nederste raekke, og den gule
   knap lyser stille op. Knappen giver ét hint ad gangen og til sidst
   svaret.

   Loeste opgaver huskes i browseren (nk-sc5.12-tael). R starter forfra.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var NOEGLE = "nk-sc5.12-tael";
    var VISTID = 2.6;          /* sekunder for saekkene, naar svaret er rigtigt */

    NK.SimTael = function () {
        var mig = this;
        this.L = new NK.Laerred(NK.el("t-laerred"));
        this.kort = new NK.Kort("t", {
            valg: function (i) { mig.svarValg(i); },
            videre: function () { mig.videre(); },
            knap: function () { mig.knap(); }
        });
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = D.OPGAVER.map(function (o) {
            var s = gemt[o.id];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.bygListe();
        var mig2 = this;
        this.L.canvas.addEventListener("pointerdown", function () {
            if (mig2.fase === "spm") mig2.kort.blink();
        });
        var i = this.foersteUloeste();
        this.vaelg(i < 0 ? 0 : i);
    };

    var P = NK.SimTael.prototype;

    P.foersteUloeste = function () {
        for (var i = 0; i < this.status.length; i++) if (!this.status[i].loest) return i;
        return -1;
    };

    P.antalLoest = function () {
        return this.status.filter(function (s) { return s.loest; }).length;
    };

    P.gem = function () {
        var ud = {};
        D.OPGAVER.forEach(function (o, i) {
            var s = this.status[i];
            if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
        }, this);
        NK.gem(NOEGLE, ud);
    };

    P.o = function () { return D.OPGAVER[this.nr]; };

    /* ----- Listen i panelet ----------------------------------------------------- */
    P.bygListe = function () {
        var mig = this;
        var liste = NK.el("t-liste");
        liste.innerHTML = "";
        this.chips = [];
        var raekke = document.createElement("div");
        raekke.className = "opg-chips lodret";
        D.OPGAVER.forEach(function (o, i) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "opg-chip";
            k.innerHTML = '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.htmlPotens(o.titel) + '</span><i class="oc-m"></i>';
            k.addEventListener("click", function () { mig.vaelg(i); });
            raekke.appendChild(k);
            mig.chips[i] = k;
        });
        liste.appendChild(raekke);
    };

    P.visListe = function () {
        var mig = this;
        this.status.forEach(function (s, i) {
            var c = mig.chips[i];
            c.classList.toggle("valgt", i === mig.nr && mig.fase !== "slut");
            c.classList.toggle("loest", s.loest);
            c.classList.toggle("stjerne", s.stjerne);
            c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        });
        NK.saetTekst("t-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven ----------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.hjaelp = 0;
        this.forkerte = [];
        this.brugtSvar = false;
        this.visT = 0;
        if (this.status[i].loest) {
            this.fase = "loest";
            this.visT = VISTID;
            this.loestKort(false);
        } else {
            this.fase = "spm";
            this.spmKort();
            this.kort.bund("");
            this.saetKnap();
        }
        this.visListe();
    };

    P.spmKort = function () {
        var o = this.o(), mig = this;
        var html = NK.Kort.chip("Opgave " + (this.nr + 1) + " af " + D.OPGAVER.length) +
            '<p class="sk-tekst">' + NK.htmlPotens(o.spm) + "</p>" +
            NK.Kort.svarknapper(o.svar, function (i) { return mig.forkerte.indexOf(i) >= 0 ? "forkert" : ""; }, false);
        this.kort.vis("spm", html);
    };

    P.saetKnap = function () {
        var o = this.o();
        if (this.fase !== "spm") { this.kort.knap(null); return; }
        var tekst = this.hjaelp === 0 ? "Giv et hint" : (this.hjaelp < o.hint.length ? "Næste hint" : "Vis svaret");
        var klasse = this.hjaelp >= o.hint.length ? "svar" : "";
        if (this.pegKnap) klasse += (klasse ? " " : "") + "peg";
        this.kort.knap(tekst, klasse);
    };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        var o = this.o(), s = o.svar[j];
        if (s.ok) {
            this.loest(this.forkerte.length === 0 && this.hjaelp === 0, false);
            return;
        }
        if (this.forkerte.indexOf(j) < 0) this.forkerte.push(j);
        this.pegKnap = true;
        this.spmKort();
        this.kort.bund(s.f, "skidt");
        this.kort.ryst();
        this.saetKnap();
    };

    P.knap = function () {
        if (this.fase === "slut") { this.nulstil(); return; }
        if (this.fase !== "spm") return;
        var o = this.o();
        this.pegKnap = false;
        if (this.hjaelp < o.hint.length) {
            this.kort.bund("Hint: " + o.hint[this.hjaelp], "hint");
            this.hjaelp++;
            this.saetKnap();
        } else {
            this.loest(false, true);
        }
    };

    P.loest = function (stjerne, medSvar) {
        var s = this.status[this.nr];
        s.loest = true;
        if (stjerne) s.stjerne = true;
        this.gem();
        this.fase = "loest";
        this.visT = 0;
        this.brugtSvar = medSvar;
        this.pegKnap = false;
        this.loestKort(medSvar);
        this.visListe();
    };

    P.loestKort = function (medSvar) {
        var o = this.o(), ret = "";
        o.svar.forEach(function (s) { if (s.ok) ret = s.t; });
        var sidste = this.foersteUloeste() < 0;
        var tekst = '<span class="sk-svaret">' + NK.htmlPotens(ret) + ".</span> " + NK.htmlPotens(o.forkl);
        this.kort.vis(medSvar ? "loest svar" : "loest", NK.Kort.slut(medSvar ? "Svaret" : "Rigtigt ✓", tekst, sidste ? "Færdig →" : "Næste opgave →"));
        this.kort.knap(null);
        this.kort.bund("");
    };

    P.videre = function () {
        if (this.fase !== "loest") return;
        var n = this.foersteUloeste();
        if (n < 0) { this.slut(); return; }
        var naeste = n;
        for (var k = 1; k <= this.status.length; k++) {
            var j = (this.nr + k) % this.status.length;
            if (!this.status[j].loest) { naeste = j; break; }
        }
        this.vaelg(naeste);
    };

    P.slut = function () {
        this.fase = "slut";
        this.kort.vis("loest", NK.Kort.slut("Færdig", NK.htmlPotens(D.FAERDIG.t), null));
        this.kort.knap("Start forfra", "almindelig");
        this.kort.bund("");
        this.visListe();
    };

    P.enter = function () {
        if (this.fase === "loest") this.videre();
    };

    P.nulstil = function () {
        this.status.forEach(function (s) { s.loest = false; s.stjerne = false; });
        this.gem();
        this.vaelg(0);
    };

    P.fokus = function () { /* intet felt */ };

    /* ----- Loekken ----------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas()) this.layout();
    };

    P.kortZone = function () { return this.L.h < 720 ? 192 : 214; };

    P.layout = function () {
        var top = 10 + this.kortZone() + 8;
        var e = NK.el("t-anker-scene");
        if (e) {
            e.style.left = "20px"; e.style.top = top + "px";
            e.style.width = (this.L.b - 40) + "px"; e.style.height = (this.L.h - top - 16) + "px";
        }
    };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.fase === "loest" && this.visT < VISTID) this.visT = Math.min(VISTID, this.visT + dt);
    };

    P.tegn = function () {
        var c = this.L.ctx, b = this.L.b, h = this.L.h;
        this.L.ryd("#14141a");
        var top = 10 + this.kortZone() + 8, bund = h - 12;
        var gulv = top + (bund - top) * 0.74;
        /* Lagerrummet: en vaeg (ogsaa bag kortet) og et gulv */
        var g = c.createLinearGradient(0, 8, 0, bund);
        var k = (gulv - 8) / (bund - 8);
        g.addColorStop(0, "#1a1e29");
        g.addColorStop(k, "#283041");
        g.addColorStop(k, "#3d342a");
        g.addColorStop(1, "#28221b");
        c.save();
        NK.rundtRekt(c, 8, 8, b - 16, bund - 8, 12);
        c.fillStyle = g;
        c.fill();
        c.clip();
        var o = this.fase === "slut" ? D.OPGAVER[D.OPGAVER.length - 1] : this.o();
        var u = this.fase === "spm" ? 0 : (this.fase === "slut" ? 1 : this.visT / VISTID);
        var omr = { x: 8, y: top, b: b - 16, h: bund - top, gulv: gulv };
        var s = NK.klamp(Math.min(omr.b / 7.5, omr.h / 2.6), 54, 120);
        switch (o.scene) {
        case "bakker": this.tegnBakker(c, o, omr, s, u); break;
        case "saekke": this.tegnSaekke(c, o, omr, s, u); break;
        case "bunke": this.tegnBunke(c, o, omr, s, u); break;
        case "split": this.tegnSplit(c, o, omr, s, u); break;
        case "mennesker": this.tegnMennesker(c, o, omr, s, u); break;
        }
        c.restore();
    };

    /* ----- Tegningerne ----------------------------------------------------------- */
    function skrift(s, f, v) { return (v || "800") + " " + Math.round(s * f) + "px 'Segoe UI', sans-serif"; }

    function etiket(c, tekst, x, y, s, farve) {
        NK.tekst(c, tekst, x, y, { font: skrift(s, 0.2), justering: "center", linje: "middle", farve: farve || "#ffffff", kant: true, kantBredde: 4, kantFarve: "rgba(10, 12, 18, 0.85)" });
    }

    /* Resultatet i en groen pille over tingene */
    function resultat(c, tekst, x, y, s, a) {
        if (a <= 0) return;
        c.save();
        c.globalAlpha = NK.klamp(a, 0, 1);
        c.font = skrift(s, 0.24);
        var b = NK.tekstBredde(c, tekst) + 34, h = s * 0.46;
        NK.rundtRekt(c, x - b / 2, y - h / 2, b, h, h / 2);
        c.fillStyle = "#17402c";
        c.fill();
        c.lineWidth = 2.5;
        c.strokeStyle = "#5fcf92";
        c.stroke();
        NK.tekst(c, tekst, x, y + 1, { font: skrift(s, 0.24), justering: "center", linje: "middle", farve: "#c9f5da" });
        c.restore();
    }

    function glod(c, x, y, r, a) {
        if (a <= 0) return;
        var g = c.createRadialGradient(x, y, r * 0.2, x, y, r);
        g.addColorStop(0, "rgba(255, 223, 107, " + (0.5 * a).toFixed(3) + ")");
        g.addColorStop(1, "rgba(255, 223, 107, 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }

    function bakke(c, x, y, s) {
        NK.Ikon.tegn(c, "aeggebakke", x, y, s * 1.8);
    }

    /* En saek, der er fyldt f (0 til 1). Den tomme del er bleg. */
    function saek(c, x, y, s, f, tekst, ikon) {
        c.save();
        c.globalAlpha = 0.28;
        NK.Ikon.tegn(c, "saek", x, y, s);
        c.restore();
        if (f > 0) {
            var bundY = y + s * 0.42, hoej = s * 0.8 * NK.klamp(f, 0, 1);
            c.save();
            c.beginPath();
            c.rect(x - s, bundY - hoej, s * 2, hoej + s * 0.2);
            c.clip();
            NK.Ikon.tegn(c, "saek", x, y, s);
            c.restore();
        }
        if (tekst) NK.tekst(c, tekst, x, y + s * 0.02, { font: skrift(s, 0.17), justering: "center", linje: "middle", farve: "#ffffff", kant: true, kantBredde: 3.5, kantFarve: "rgba(60, 40, 12, 0.85)" });
        if (ikon) NK.Ikon.tegn(c, ikon, x, y + s * 0.24, s * 0.2);
    }

    P.tegnBakker = function (c, o, omr, s, u) {
        var n = o.antal, mx = omr.x + omr.b / 2, y = omr.gulv - s * 0.45;
        var afst = s * 2.25;
        for (var k = 0; k < n; k++) {
            var x = mx + (k - (n - 1) / 2) * afst;
            var tk = NK.klamp((u * VISTID - 0.3 - k * 0.55) / 0.4, 0, 1);
            glod(c, x, y, s * 1.2, tk > 0 && tk < 1 ? 1 - Math.abs(tk - 0.5) * 2 : 0);
            bakke(c, x, y, s);
            etiket(c, "1 dusin", x, y + s * 0.68, s);
            if (tk > 0) etiket(c, String(12 * (k + 1)), x, y - s * 0.78, s * 1.3, "#ffdf6b");
        }
        resultat(c, "3 · 12 = 36 æg", mx, omr.y + s * 0.5, s, (u * VISTID - 2.0) / 0.4);
    };

    P.tegnSaekke = function (c, o, omr, s, u) {
        var n = o.antal, mx = omr.x + omr.b / 2, y = omr.gulv - s * 0.38;
        var afst = s * 1.9;
        var tal = ["6,0 · 10²³", "1,2 · 10²⁴", "1,8 · 10²⁴"];
        for (var k = 0; k < n; k++) {
            var x = mx + (k - (n - 1) / 2) * afst;
            var tk = NK.klamp((u * VISTID - 0.3 - k * 0.55) / 0.4, 0, 1);
            glod(c, x, y, s * 1.1, tk > 0 && tk < 1 ? 1 - Math.abs(tk - 0.5) * 2 : 0);
            saek(c, x, y, s * 1.25, 1, "1 mol", "aeg");
            if (tk > 0) etiket(c, tal[k], x, y - s * 0.86, s, "#ffdf6b");
        }
        resultat(c, "3 · 6,02 · 10²³ = 1,8 · 10²⁴ æg", mx, omr.y + s * 0.42, s, (u * VISTID - 2.0) / 0.4);
    };

    /* En bunke af smaa molekyler eller atomer. a er hvor meget der er tilbage. */
    function bunke(c, x, y, s, a, ikon) {
        var raekker = 5, i = 0;
        for (var r = 0; r < raekker; r++) {
            var antal = raekker - r + 3;
            for (var k = 0; k < antal; k++) {
                i++;
                if (i / 30 > a) continue;
                var px = x + (k - (antal - 1) / 2) * s * 0.2 + Math.sin(i * 7.3) * s * 0.02;
                var py = y - r * s * 0.16;
                NK.Ikon.tegn(c, ikon, px, py, s * 0.22);
            }
        }
    }

    P.tegnBunke = function (c, o, omr, s, u) {
        var ikon = o.ting === "C" ? "atom" : "h2o";
        var bx = omr.x + omr.b * 0.22, y = omr.gulv - s * 0.15;
        var p = NK.klamp((u * VISTID - 0.2) / 1.6, 0, 1);
        bunke(c, bx, y, s * 1.4, 1 - p, ikon);
        etiket(c, (o.ting === "C" ? "3 · 10²³ carbonatomer" : "1,2 · 10²⁴ H₂O-molekyler"), bx, omr.gulv + s * 0.32, s, "#ffffff");
        /* Pilen og tre saekke med plads til 1 mol i hver */
        var sx0 = omr.x + omr.b * 0.52, afst = s * 1.55;
        NK.tekst(c, "→", omr.x + omr.b * 0.39, y - s * 0.3, { font: skrift(s, 0.6), justering: "center", linje: "middle", farve: "#f2c53d" });
        for (var k = 0; k < 3; k++) {
            var x = sx0 + k * afst;
            var f = NK.klamp(o.n * p - k, 0, 1);
            saek(c, x, omr.gulv - s * 0.36, s * 1.15, f, "1 mol", ikon);
        }
        resultat(c, "n = " + (o.ting === "C" ? "0,5" : "2") + " mol", sx0 + afst, omr.y + s * 0.42, s, (u * VISTID - 1.9) / 0.4);
    };

    P.tegnSplit = function (c, o, omr, s, u) {
        var y = omr.gulv - s * 0.36;
        var x0 = omr.x + omr.b * 0.2;
        saek(c, x0, y, s * 1.3, 1, "1 mol", "h2o");
        etiket(c, "1 mol H₂O", x0, omr.gulv + s * 0.32, s);
        NK.tekst(c, "→", omr.x + omr.b * 0.39, y, { font: skrift(s, 0.6), justering: "center", linje: "middle", farve: "#f2c53d" });
        var navne = ["H", "H", "O"], afst = s * 1.5, sx0 = omr.x + omr.b * 0.52;
        for (var k = 0; k < 3; k++) {
            var x = sx0 + k * afst;
            var tk = NK.klamp((u * VISTID - 0.3 - k * 0.45) / 0.4, 0, 1);
            saek(c, x, y, s * 1.15, tk, tk > 0 ? "1 mol" : "?", null);
            if (tk > 0) {
                var farve = navne[k] === "O" ? ["#ff8a7a", "#b3261a"] : ["#ffffff", "#b9c0c8"];
                kugleMini(c, x, y + s * 0.27, s * 0.11, farve[0], farve[1], navne[k]);
                etiket(c, "1 mol " + navne[k], x, omr.gulv + s * 0.32, s);
            }
        }
        resultat(c, "1 mol H₂O har 2 mol H og 1 mol O", omr.x + omr.b / 2, omr.y + s * 0.42, s, (u * VISTID - 1.8) / 0.4);
    };

    function kugleMini(c, x, y, r, lys, mork, t) {
        var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, mork);
        c.fillStyle = g;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
        c.lineWidth = 1.2; c.strokeStyle = "rgba(0, 0, 0, 0.45)"; c.stroke();
        NK.tekst(c, t, x, y + 1, { font: "800 " + Math.round(r * 1.2) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: t === "O" ? "#ffffff" : "#333a44" });
    }

    P.tegnMennesker = function (c, o, omr, s, u) {
        var y = omr.gulv - s * 0.36;
        var px = omr.x + omr.b * 0.2;
        var p = NK.klamp((u * VISTID - 0.2) / 1.2, 0, 1);
        var sx = omr.x + omr.b * 0.62;
        /* Menneskene flytter ind i saekken og bliver til en prik i bunden */
        var mx = px + (sx - px) * p, my = y + (s * 0.32) * p;
        var ms = s * 1.3 * (1 - p) + s * 0.04 * p;
        saek(c, sx, y, s * 1.5, 0, "1 mol", null);
        if (p < 1) NK.Ikon.tegn(c, "mennesker", mx, my, ms);
        else {
            c.fillStyle = "#ffdf6b";
            c.beginPath(); c.arc(sx, y + s * 0.6, 1.6, 0, Math.PI * 2); c.fill();
        }
        etiket(c, "8 · 10⁹ mennesker", px, omr.gulv + s * 0.32, s);
        etiket(c, "Plads til 1 mol", sx, omr.gulv + s * 0.32, s);
        /* Luppen, der viser prikken */
        var a = NK.klamp((u * VISTID - 1.4) / 0.4, 0, 1);
        if (a > 0) {
            var lx = sx + s * 1.6, ly = y - s * 0.75, lr = s * 0.5;
            c.save();
            c.globalAlpha = a;
            c.strokeStyle = "#ffdf6b";
            c.lineWidth = 2;
            c.beginPath(); c.moveTo(sx + 3, y + s * 0.6); c.lineTo(lx - lr * 0.7, ly + lr * 0.7); c.stroke();
            c.beginPath(); c.arc(lx, ly, lr, 0, Math.PI * 2);
            c.fillStyle = "#1d2230"; c.fill();
            c.lineWidth = 4; c.stroke();
            NK.Ikon.tegn(c, "mennesker", lx, ly - lr * 0.1, lr * 1.1);
            c.restore();
            NK.tekst(c, "Her er alle mennesker", lx, ly - lr - s * 0.16, { font: skrift(s, 0.15, "700"), justering: "center", linje: "middle", farve: "#ffdf6b", kant: true, kantBredde: 3, kantFarve: "rgba(10, 12, 18, 0.85)" });
        }
        resultat(c, "n = 1 · 10⁻¹⁴ mol", omr.x + omr.b / 2, omr.y + s * 0.42, s, (u * VISTID - 2.0) / 0.4);
    };
}());
