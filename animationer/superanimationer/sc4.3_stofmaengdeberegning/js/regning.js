/* =====================================================================
   regning.js - regnetrinene paa Vaegten (som sc5.1)

   Raekkerne i opgavekortet: i hvert trin skriver eleven foerst formlen
   og saa tallet med enheden (brugerens oenske fra sc7.4; enheden skal
   skrives her, fordi den er en del af det, der skal laeres). Kun det
   aktive trin er aabent.

   Tavlen i scenen viser opgavens tal og beregningerne. Et trin staar
   som "n = ?", til formlen er skrevet, saa som "n = m / M = ?", og til
   sidst som den paene beregning med enhederne.

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
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: "formel" };
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
            var formelKendt = f.fase === "tal" || f.status === "ok" || f.status === "svar";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(t.navn) +
                '</span></div>' + (formelKendt ? '<div class="raekke-formel">' + NK.html(T.formelTekst(f.id, o)) + "</div>" : "") +
                '<div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            var pre = T.venstre(f.id, o) + " =";
            if (f.status === "ok" || f.status === "svar") {
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">' + NK.html(pre) + '</span><span class="felt-svar"><b>' +
                    NK.html(T.facitTekst(f.id, o)) + '</b></span><span class="felt-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var fra = f.status === "aktiv" ? "" : " disabled";
                var formel = f.fase === "formel";
                fe.className = "felt " + f.status + (formel ? " formelfelt" : "");
                fe.innerHTML = '<span class="felt-pre">' + NK.html(pre) + '</span>' +
                    '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="' +
                    NK.html((formel ? "Formlen for " : "Tal og enhed for ") + t.navn.toLowerCase()) + '" placeholder="' +
                    (formel ? "skriv formlen" : "tal og enhed") + '"' + fra + '>' +
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
        var tal = f.fase === "tal" ? T.svar(raa) : null;
        this.fane.regnFejl(svar.besked, svar.tom, f.id, tal && !svar.talOk ? tal.v : null);
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
        f.fase = "tal";
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

    /* Trekanten er det andet hint, naar formlen skal vendes */
    P.hint2 = function () {
        var f = this.aktivt();
        if (!f || f.fase !== "formel" || !D.TRIN[f.id].vend) return null;
        return { maal: f.id };
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
        var hvad = f.fase === "formel" ? "Skriv <b>formlen</b> for " + NK.html(T.venstre(f.id, this.opg)) + "." :
            "Skriv <b>tallet og enheden</b>.";
        return (n > 1 ? "Trin " + (this.k + 1) + " af " + n + ": " : "") + NK.html(D.TRIN[f.id].navn) + ". " + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. data: linjerne med opgavens tal. hoejre: plads, der
       skal holdes fri i hoejre side (til trekanten). */
    function linje(ctx, dele, x, y, b, f, farver) {
        var hel = dele.join(" ");
        ctx.font = Tg.font("600", f);
        if (ctx.measureText(hel).width <= b || dele.length < 2) {
            var s0 = NK.passendeSkrift(ctx, hel, b, f, 12, "600");
            var xx = x;
            dele.forEach(function (d, i) {
                NK.tekst(ctx, d, xx, y, { font: Tg.font("600", s0), linje: "middle", farve: farver[i] || farver[0] });
                ctx.font = Tg.font("600", s0);
                xx += ctx.measureText(d + " ").width;
            });
            return 1;
        }
        NK.tekst(ctx, dele[0], x, y, { font: Tg.font("600", f), linje: "middle", farve: farver[0] });
        var s = NK.passendeSkrift(ctx, dele.slice(1).join(" "), b - f * 1.5, f, 12, "600");
        NK.tekst(ctx, dele.slice(1).join(" "), x + f * 1.5, y + f * 1.5, { font: Tg.font("600", s), linje: "middle", farve: farver[1] || farver[0] });
        return 2;
    }

    P.tegnTavle = function (ctx, r, data, tid, hoejre, skrift) {
        Tg.tavle(ctx, r);
        var o = this.opg;
        var f = skrift || NK.klamp(Math.min(r.h / 12, r.b / 30), 13, 20);
        var x = r.x + f * 1.1, b = r.b - f * 2.2 - (hoejre || 0), y = r.y + f * 1.3, lh = f * 1.55;
        var lille = NK.klamp(f * 0.72, 12, 14);
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)", groen = "#1d7a48", gul = "#9a6a00";
        Tg.etiket(ctx, "Opgavens tal", x, y, lille);
        y += lh * 0.85;
        var dtekst = data.join("     ");
        NK.passendeSkrift(ctx, dtekst, b, f, 12, "600");
        if (ctx.measureText(dtekst).width <= b) {
            NK.tekst(ctx, dtekst, x, y, { font: ctx.font, linje: "middle", farve: moerk });
            y += lh;
        } else {
            data.forEach(function (d) {
                NK.tekst(ctx, d, x, y, { font: Tg.font("600", f), linje: "middle", farve: moerk });
                y += lh * 0.95;
            });
        }
        y += lh * 0.25;
        Tg.etiket(ctx, "Beregningen", x, y, lille);
        y += lh * 0.85;
        var puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);
        this.felter.forEach(function (fe) {
            var loest = fe.status === "ok" || fe.status === "svar";
            var aktiv = fe.status === "aktiv";
            var dele, farver;
            if (loest) {
                dele = T.regning(fe.id, o);
                farver = [moerk, fe.status === "svar" ? gul : groen];
            } else if (fe.fase === "tal") {
                dele = [T.formelTekst(fe.id, o), "= ?"];
                farver = [moerk, moerk];
            } else {
                dele = [T.venstre(fe.id, o) + " = ?"];
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
        });
    };

    NK.Regning = Regning;

    /* ----- Det, Vaegten faar paa sin prototype ------------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), hint2: r.hint2(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinTekst(); };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        P2.formelOk = function (vist, note, formel) {
            this.hjaelp = 0;
            this.trekant = null;
            if (vist) {
                var h = "<b>Formlen:</b> " + NK.html(formel) + ".";
                if (this.k.sig(h, "svar", { lukVedSkriv: true })) this.besked("Regn nu tallet ud, og skriv enheden.", "");
                else this.besked(h + " Regn nu tallet ud, og skriv enheden.", "gul");
            } else {
                this.k.tie();
                this.besked((note ? NK.html(note) + " <b>" + NK.html(formel) + "</b>." : "Rigtig formel.") +
                    " Regn nu tallet ud, og skriv enheden.", "god");
            }
            if (this.efterFormel) this.efterFormel();
            this.visKnap();
            this.fokus();
        };

        P2.regnLoest = function (id, maade) {
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) + "." : null);
        };

        P2.regnFejl = function (besked, tom, id, v) {
            this.besked(NK.html(besked), tom ? "gul" : "skidt");
            if (!tom && this.efterFejl) this.efterFejl(id, v);
            this.fokus();
        };
    };
}());
