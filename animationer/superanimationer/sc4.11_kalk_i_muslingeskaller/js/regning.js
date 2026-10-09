/* =====================================================================
   regning.js - regnetrinene paa fane 2 (som sc5.1)

   Raekkerne i opgavekortet: i hvert trin kommer foerst formlen og saa
   tallet. Med mol skriver eleven selv formlen (brugerens oenske fra
   sc7.4). Uden mol vaelger eleven formlen blandt tre (D.FORMELVALG), og
   tallene bliver sat ind, saa der kun skal regnes (brugeren 9. okt.
   2026: animationen var for svaer til HF). I maaling 2 staar formlerne
   der i forvejen, som i vejledningen. Kun det aktive trin er aabent; de
   loeste er én linje med ✓, og de kommende er kun en overskrift.

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
            var formel = D.TRIN[id].formel && !opg.kunTal;
            var fe = { id: id, status: i === 0 ? "aktiv" : "laast", fase: formel ? "formel" : "tal" };
            /* Uden mol: formlen vaelges blandt tre, i tilfaeldig raekkefoelge */
            if (formel && opg.niveau === "nf" && D.FORMELVALG[id]) {
                fe.valg = NK.bland([{ t: D.TRIN[id].formel, ok: true }].concat(D.FORMELVALG[id]));
                fe.forkert = {};
            }
            return fe;
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };

    /* En broek med rigtig broekstreg: "A / B · C" bliver A over B, gange C */
    function broekHTML(t) {
        var i = t.indexOf(" / ");
        if (i < 0) return NK.html(t);
        var foer = t.slice(0, i), efter = t.slice(i + 3);
        var k = Math.max(foer.lastIndexOf(" = "), foer.lastIndexOf(" · "));
        var hoved = k >= 0 ? foer.slice(0, k + 3) : "", taeller = k >= 0 ? foer.slice(k + 3) : foer;
        var j = efter.indexOf(" · ");
        var naevner = j >= 0 ? efter.slice(0, j) : efter, hale = j >= 0 ? efter.slice(j) : "";
        return NK.html(hoved) + '<span class="broek"><span>' + NK.html(taeller) + "</span><span>" + NK.html(naevner) +
            "</span></span>" + NK.html(hale);
    }
    Regning.broekHTML = broekHTML;

    /* ----- Raekkerne ------------------------------------------------------------- */
    P.byg = function () {
        var mig = this, o = this.opg, vaert = this.vaert, nf = o.niveau === "nf";
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = D.TRIN[f.id];
            var loest = f.status === "ok" || f.status === "svar";
            var rk = document.createElement("div");
            rk.className = "raekke " + (loest ? "loest" : f.status);
            var hoved = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(t.navn) + "</span></div>";
            f.feltEl = null;
            f.input = null;
            /* Et kommende trin er kun en overskrift */
            if (f.status === "laast") { rk.innerHTML = hoved; vaert.appendChild(rk); return; }
            var fe = document.createElement("div");
            f.feltEl = fe;
            var pre = T.venstre(f.id) + " =";
            if (loest) {
                rk.innerHTML = hoved + '<div class="felter"></div>';
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">' + NK.html(pre) + '</span><span class="felt-svar"><b>' +
                    NK.html(T.facitTekst(f.id, o)) + '</b></span><span class="felt-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
                rk.querySelector(".felter").appendChild(fe);
                vaert.appendChild(rk);
                return;
            }
            var spm = nf && t.spm ? '<p class="raekke-spm">' + NK.html(t.spm) + "</p>" : "";
            if (f.fase === "formel" && f.valg) {
                /* Uden mol: vaelg formlen blandt tre */
                rk.innerHTML = hoved + spm + '<p class="raekke-hvad">Vælg formlen for ' + NK.html(T.venstre(f.id)) + ':</p><div class="formelvalg"></div>';
                fe.className = "formelvalg-ramme";
                var vaelger = rk.querySelector(".formelvalg");
                f.feltEl = vaelger;
                f.valg.forEach(function (v, j) {
                    var b = document.createElement("button");
                    b.type = "button";
                    b.className = "formelknap" + (f.forkert[j] ? " forkert" : "");
                    b.disabled = !!f.forkert[j];
                    b.innerHTML = broekHTML(v.t);
                    b.addEventListener("click", function () { mig.vaelgFormel(j); });
                    vaelger.appendChild(b);
                });
                vaert.appendChild(rk);
                return;
            }
            var formel = f.fase === "formel";
            var formelKendt = t.formel && !formel;
            var indsat = formelKendt && nf ? T.indsat(f.id, o) : "";
            rk.innerHTML = hoved + spm + (formelKendt ? '<div class="raekke-formel">' + broekHTML(T.formelTekst(f.id, o)) + "</div>" : "") +
                (indsat ? '<div class="raekke-indsat">= ' + broekHTML(indsat) + "</div>" : "") + '<div class="felter"></div>';
            fe.className = "felt aktiv" + (formel ? " formelfelt" : "");
            fe.innerHTML = '<span class="felt-pre">' + NK.html(indsat ? "=" : pre) + "</span>" +
                '<input type="text" inputmode="' + (formel ? "text" : "decimal") + '" autocomplete="off" spellcheck="false" aria-label="' +
                NK.html((formel ? "Formlen for " : "") + t.navn) + '" placeholder="' + (formel ? "skriv formlen" : "tallet") + '">' +
                (formel ? "" : '<span class="felt-efter">' + NK.html(t.enhed) + "</span>") +
                '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1">' + (formel ? "↵" : "Tjek") + "</button>";
            var inp = fe.querySelector("input");
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
            });
            fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
            f.input = inp;
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    /* Uden mol: eleven har valgt en af de tre formler */
    P.vaelgFormel = function (j) {
        var f = this.aktivt();
        if (!f || !f.valg || f.fase !== "formel" || this.fane.auto || f.forkert[j]) return;
        var v = f.valg[j];
        if (v.ok) { this.formelOk(false); return; }
        f.forkert[j] = true;
        this.byg();
        this.ryst(f);
        this.fane.regnFejl(v.f, false, f.id);
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
        if (f.fase === "formel") return NK.html(D.TRIN[f.id].formelHint);
        return NK.html(this.opg.niveau === "nf" ? T.lommeHint(f.id, this.opg) : T.talHint(f.id, this.opg));
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
        /* Uden mol staar det naeste skridt i selve trinnet (spoergsmaalet og
           "Vælg formlen"), saa linjen har kun hint, fejl og ros */
        if (this.opg.niveau === "nf") return "";
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
                var ind = aktiv && o.niveau === "nf" ? T.indsat(fe.id, o) : "";
                dele = [T.formelTekst(fe.id, o), ind ? "= " + ind + " = ?" : "= ?"];
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
                this.besked("<b>Formlen:</b> " + NK.html(formel) + ". Regn nu tallet ud.", "gul");
            } else {
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
