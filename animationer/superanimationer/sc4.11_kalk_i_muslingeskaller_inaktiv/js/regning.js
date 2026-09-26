/* =====================================================================
   regning.js - regnetrinene paa fane 2 (som sc5.1)

   Raekkerne i opgavekortet: i hvert trin skriver eleven foerst formlen
   og saa tallet (brugerens oenske fra sc7.4). I maaling 2 staar
   formlerne der i forvejen, som i vejledningen, og eleven skriver kun
   tallene. Kun det aktive trin er aabent.

   Tavlen i scenen viser reaktionen, opgavens tal og beregningerne. Et
   trin staar som "m(CO₂) = ?", til formlen er skrevet, saa som
   "m(CO₂) = m(før) − m(efter) = ?", og til sidst som den paene
   beregning. I vejen med mol staar molarmasserne ogsaa paa tavlen.

   NK.Regning.paa(P) giver fanen trinInfo, trinLinje, opgaveFaerdig og
   de kald, raekkerne bruger (formelOk, regnLoest, regnFejl).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    function Regning(o) {
        this.vaert = o.vaert;
        this.fane = o.fane;
        this.opg = null;
        this.felter = [];
        this.k = 0;
    }
    var P = Regning.prototype;

    P.saet = function (opg) {
        this.opg = opg;
        this.k = 0;
        this.felter = opg.trin.map(function (id, i) {
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: D.TRIN[id].formel && !opg.kunTal ? "formel" : "tal" };
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };

    /* ----- Raekkerne ------------------------------------------------------------- */
    P.byg = function () {
        var mig = this, o = this.opg, vaert = this.vaert;
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = D.TRIN[f.id];
            var rk = document.createElement("div");
            rk.className = "raekke";
            var formelKendt = t.formel && (f.fase === "tal" || f.status === "ok" || f.status === "svar");
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(t.navn) +
                '</span></div>' + (formelKendt ? '<div class="raekke-formel">' + NK.html(T.formelTekst(f.id, o)) + "</div>" : "") +
                '<div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            var pre = T.venstre(f.id) + " =";
            if (f.status === "ok" || f.status === "svar") {
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">' + NK.html(pre) + '</span><span class="felt-svar"><b>' +
                    NK.html(T.facitTekst(f.id, o)) + '</b></span><span class="felt-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var fra = f.status === "aktiv" ? "" : " disabled";
                var formel = f.fase === "formel";
                fe.className = "felt " + f.status + (formel ? " formelfelt" : "");
                fe.innerHTML = '<span class="felt-pre">' + NK.html(pre) + '</span>' +
                    '<input type="text" inputmode="' + (formel ? "text" : "decimal") + '" autocomplete="off" spellcheck="false" aria-label="' +
                    NK.html((formel ? "Formlen for " : "") + t.navn) + '" placeholder="' + (formel ? "skriv formlen" : "tallet") + '"' + fra + '>' +
                    (formel ? "" : '<span class="felt-efter">' + NK.html(t.enhed) + '</span>') +
                    '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + fra + '>↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                });
                inp.addEventListener("input", function () { if (mig.fane.k) mig.fane.k.skriver(); });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                f.input = inp;
            }
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var f = this.aktivt();
        if (f && f.input) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.ryst = function (f) {
        if (!f.feltEl) return;
        f.feltEl.classList.remove("ryst");
        void f.feltEl.offsetWidth;
        f.feltEl.classList.add("ryst");
    };

    /* ----- Tjek ------------------------------------------------------------------ */
    P.tjek = function () {
        var f = this.aktivt();
        if (!f || !f.input || this.fane.auto) return;
        var raa = f.input.value, svar;
        if (f.fase === "formel") {
            svar = T.formel(f.id, raa);
            if (svar.ok) { this.formelOk(false, svar.note); return; }
        } else {
            svar = T.trin(f.id, raa, this.opg);
            if (svar.ok) { this.loes("ok"); return; }
        }
        if (!svar.tom) this.ryst(f);
        this.fane.regnFejl(svar.besked, svar.tom, f.id);
    };

    P.formelOk = function (vist, note) {
        var f = this.aktivt();
        f.fase = "tal";
        this.byg();
        this.fane.formelOk(vist, note, T.formelTekst(f.id, this.opg));
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        if (f.fase === "formel") f.fase = "tal";
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
        this.byg();
        this.fane.regnLoest(f.id, maade);
    };

    /* ----- Hint og svar ---------------------------------------------------------- */
    P.hintHTML = function () {
        var f = this.aktivt();
        if (!f) return "";
        return NK.html(f.fase === "formel" ? D.TRIN[f.id].formelHint : T.talHint(f.id, this.opg));
    };

    P.visSvar = function () {
        var f = this.aktivt();
        if (!f) return;
        if (f.fase === "formel") this.formelOk(true);
        else this.loes("svar");
    };

    P.regningHTML = function (id) {
        var r = T.regning(id, this.opg);
        return NK.html(r[0] + " " + r[1]);
    };

    P.trinTekst = function () {
        var f = this.aktivt();
        if (!f) return "";
        var n = this.felter.length;
        var hvad = f.fase === "formel" ? "Skriv <b>formlen</b> for " + NK.html(T.venstre(f.id)) + "." : "Skriv <b>tallet</b>.";
        return (n > 1 ? "Trin " + (this.k + 1) + " af " + n + ": " : "") + NK.html(D.TRIN[f.id].navn) + ". " + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. info: { reaktion, M: [linjer] eller null, tal: [linjer] } */
    function linje(ctx, dele, x, y, b, f, farver) {
        var hel = dele.join(" ");
        ctx.font = Tg.font("600", f);
        if (ctx.measureText(hel).width <= b || dele.length < 2) {
            var xx = x;
            if (dele.length < 2) NK.passendeSkrift(ctx, hel, b, f, 12, "600");
            var fnt = ctx.font;
            dele.forEach(function (d, i) {
                NK.tekst(ctx, d, xx, y, { font: fnt, linje: "middle", farve: farver[i] || farver[0] });
                xx += ctx.measureText(d + " ").width;
            });
            return 1;
        }
        NK.passendeSkrift(ctx, dele[0], b, f, 12, "600");
        NK.tekst(ctx, dele[0], x, y, { font: ctx.font, linje: "middle", farve: farver[0] });
        var s = NK.passendeSkrift(ctx, dele.slice(1).join(" "), b - f * 1.5, f, 12, "600");
        NK.tekst(ctx, dele.slice(1).join(" "), x + f * 1.5, y + f * 1.5, { font: Tg.font("600", s), linje: "middle", farve: farver[1] || farver[0] });
        return 2;
    }

    /* Hoejden, tavlen skal bruge med skriften f. Beregningerne maales,
       som de staar, naar alle trin er loest, saa skriften ikke hopper. */
    P.tavleHoejde = function (ctx, f, b, info) {
        var o = this.opg, lh = f * 1.55;
        var h = f * 1.2 + lh * 0.85 + lh + (info.M ? lh : 0) + lh * 0.15 + lh * 0.85;
        ctx.font = Tg.font("600", f);
        h += ctx.measureText(info.tal.join("     ")).width <= b ? lh : info.tal.length * lh * 0.95;
        h += lh * 0.25 + lh * 0.85;
        this.felter.forEach(function (fe) {
            var dele = T.regning(fe.id, o);
            h += lh * (ctx.measureText(dele.join(" ")).width <= b ? 1.15 : 1.95);
        });
        return h;
    };

    P.tegnTavle = function (ctx, r, info, tid) {
        Tg.tavle(ctx, r);
        var o = this.opg, mig = this;
        var bb = r.b - 2.2 * 12;
        var f = NK.klamp(r.b / 26, 12, 20);
        while (f > 12 && this.tavleHoejde(ctx, f, r.b - f * 2.2, info) > r.h) f -= 0.5;
        void bb;
        var x = r.x + f * 1.1, b = r.b - f * 2.2, y = r.y + f * 1.2, lh = f * 1.55;
        var lille = Tg.font("700", NK.klamp(f * 0.72, 12, 14));
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)", groen = "#1d7a48", gul = "#9a6a00", blaa = "#1d5d9c";
        NK.tekst(ctx, "REAKTIONEN", x, y, { font: lille, linje: "middle", farve: "#6a7280" });
        y += lh * 0.85;
        NK.passendeSkrift(ctx, info.reaktion, b, f * 1.05, 12, "700");
        NK.tekst(ctx, info.reaktion, x, y, { font: ctx.font, linje: "middle", farve: moerk });
        y += lh;
        if (info.M) {
            NK.passendeSkrift(ctx, info.M.join("     "), b, f, 12, "600");
            NK.tekst(ctx, info.M.join("     "), x, y, { font: ctx.font, linje: "middle", farve: blaa });
            y += lh;
        }
        y += lh * 0.15;
        NK.tekst(ctx, "OPGAVENS TAL", x, y, { font: lille, linje: "middle", farve: "#6a7280" });
        y += lh * 0.85;
        NK.passendeSkrift(ctx, info.tal.join("     "), b, f, 12, "600");
        if (ctx.measureText(info.tal.join("     ")).width <= b) {
            NK.tekst(ctx, info.tal.join("     "), x, y, { font: ctx.font, linje: "middle", farve: moerk });
            y += lh;
        } else {
            info.tal.forEach(function (d) {
                NK.tekst(ctx, d, x, y, { font: Tg.font("600", f), linje: "middle", farve: moerk });
                y += lh * 0.95;
            });
        }
        y += lh * 0.25;
        NK.tekst(ctx, "BEREGNINGEN", x, y, { font: lille, linje: "middle", farve: "#6a7280" });
        y += lh * 0.85;
        var puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);
        this.felter.forEach(function (fe) {
            var loest = fe.status === "ok" || fe.status === "svar";
            var aktiv = fe.status === "aktiv";
            var dele, farver;
            if (loest) {
                dele = T.regning(fe.id, o);
                farver = [moerk, fe.status === "svar" ? gul : groen];
            } else if (fe.fase === "tal" && D.TRIN[fe.id].formel) {
                dele = [T.formelTekst(fe.id, o), "= ?"];
                farver = [moerk, moerk];
            } else {
                dele = [T.venstre(fe.id) + " = ?"];
                farver = [aktiv ? moerk : svag];
            }
            if (aktiv) {
                ctx.save();
                ctx.strokeStyle = "rgba(214, 160, 20, " + (0.4 + 0.5 * puls) + ")";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, x - f * 0.45, y - lh * 0.55, b + f * 0.6, lh * 1.1, 6);
                ctx.stroke();
                ctx.restore();
            }
            var n = linje(ctx, dele, x, y, b, f, farver);
            y += lh * (n === 2 ? 1.95 : 1.15);
            mig.sidstY = y;
        });
    };

    NK.Regning = Regning;

    /* ----- Det, fane 2 faar paa sin prototype -------------------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinTekst(); };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        P2.formelOk = function (vist, note, formel) {
            this.hjaelp = 0;
            if (vist) {
                var h = "<b>Formlen:</b> " + NK.html(formel) + ".";
                if (this.k.sig(h, "svar", { lukVedSkriv: true })) this.besked("Regn nu tallet ud.", "");
                else this.besked(h + " Regn nu tallet ud.", "gul");
            } else {
                this.k.tie();
                this.besked((note ? NK.html(note) + " <b>" + NK.html(formel) + "</b>." : "Rigtig formel.") + " Regn nu tallet ud.", "god");
            }
            this.visKnap();
            this.fokus();
        };

        P2.regnLoest = function (id, maade) {
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) + "." : null);
        };

        P2.regnFejl = function (besked, tom) {
            this.besked(NK.html(besked), tom ? "gul" : "skidt");
            this.fokus();
        };
    };
}());
