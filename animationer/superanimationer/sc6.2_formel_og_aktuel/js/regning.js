/* =====================================================================
   regning.js - regnetrinene paa fane 2 og 3

   Raekkerne i panelet (kortet Regnetrinene): i hvert trin skriver eleven foerst formlen
   og saa tallet (brugerens oenske fra sc7.4). Trin, hvor formlen er
   tallet foran ionen, har kun tallet; opløsningsskemaet har to felter
   til tallene foran ionerne. Kun det aktive trin er aabent. Som sc6.1,
   men med skemaet.

   Tavlen i scenen viser opgavens tal og beregningerne. Et trin staar
   som "n = ?", til formlen er skrevet, saa som "n = c · V = ?", og til
   sidst som den paene beregning.

   NK.Regning.paa(P) giver fanen trinInfo, trinLinje, opgaveFaerdig, de
   kald, raekkerne bruger (formelOk, regnLoest, regnFejl), og papirkortet
   (6. nov. 2026): kortData, spmAaben, indsendKlar og indsendSvar. Opgaven,
   spoergsmaalet til det aktive trin, hint og fejl staar paa kortet oeverst
   i scenen; eleven skriver i feltet i panelet og trykker Indsend svar
   eller Enter. Raekkerne har ingen egen knap.
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
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: id === "afstem" ? "koef" : (T.harFormel(id) ? "formel" : "tal") };
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };
    P.fase = function (id) {
        var f = this.felter.filter(function (x) { return x.id === id; })[0];
        return f ? f.fase : null;
    };

    /* Etiketten staar med store bogstaver; saltenes formler maa ikke foelge med */
    function navnHTML(id, o) {
        var h = NK.html(D.TRIN[id].navn), t = o.tal;
        if (!t) return h;
        return h.replace("{A}", '<span class="formel">' + NK.html(D.salt(t.A).formel) + "</span>")
            .replace("{B}", '<span class="formel">' + NK.html(D.salt(t.B).formel) + "</span>");
    }

    /* ----- Raekkerne ------------------------------------------------------------- */
    P.byg = function () {
        var mig = this, o = this.opg, vaert = this.vaert;
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = D.TRIN[f.id], navn = T.navn(f.id, o);
            var rk = document.createElement("div");
            rk.className = "raekke";
            var formelKendt = t.formel && (f.fase === "tal" || f.status === "ok" || f.status === "svar");
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + navnHTML(f.id, o) +
                '</span></div>' + (formelKendt ? '<div class="raekke-formel">' + NK.html(T.formelTekst(f.id, o)) + "</div>" : "") +
                '<div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            var pre = T.venstre(f.id, o) + " =";
            if (f.fase === "koef") {
                mig.bygSkema(f, fe, rk);
                vaert.appendChild(rk);
                return;
            }
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
                    NK.html((formel ? "Formlen for " : "") + navn) + '" placeholder="' + (formel ? "skriv formlen" : "tallet") + '"' + fra + '>' +
                    (formel ? "" : '<span class="felt-efter">' + NK.html(t.enhed) + '</span>');
                var inp = fe.querySelector("input");
                /* Enter i feltet er det samme som Indsend svar paa kortet */
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.fane.indsendKlik(); }
                });
                inp.addEventListener("input", function () { mig.fane.visKnap(); });
                f.input = inp;
            }
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    /* Opløsningsskemaet: to smaa felter foran ionerne */
    P.bygSkema = function (f, fe, rk) {
        var mig = this, o = this.opg, st = D.salt(o.salt);
        var kat = D.ion(st.kat).t, an = D.ion(st.an).t;
        var loest = f.status === "ok" || f.status === "svar";
        fe.className = "skemarad " + f.status;
        if (loest) {
            fe.innerHTML = '<span class="sk-tekst">' + NK.html(NK.Kemi.skema(st)) + '</span><span class="felt-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
        } else {
            var fra = f.status === "aktiv" ? "" : " disabled";
            fe.innerHTML = '<span class="sk-tekst">' + NK.html(st.formel) + "(s) ⟶ </span>" +
                '<input class="koef" type="text" inputmode="numeric" maxlength="2" aria-label="Tallet foran ' + NK.html(kat) + '"' + fra + '>' +
                '<span class="sk-tekst">' + NK.html(kat) + "(aq) + </span>" +
                '<input class="koef" type="text" inputmode="numeric" maxlength="2" aria-label="Tallet foran ' + NK.html(an) + '"' + fra + '>' +
                '<span class="sk-tekst">' + NK.html(an) + "(aq)</span>";
            var ind = fe.querySelectorAll("input.koef");
            f.input = ind[0];
            f.input2 = ind[1];
            [ind[0], ind[1]].forEach(function (inp, j) {
                inp.addEventListener("keydown", function (e) {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    if (j === 0 && !ind[1].value.trim()) { ind[1].focus(); return; }
                    mig.fane.indsendKlik();
                });
                inp.addEventListener("input", function () { mig.fane.visKnap(); });
            });
        }
        rk.querySelector(".felter").appendChild(fe);
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
        if (f.fase === "koef") {
            svar = T.afstem(this.opg, f.input.value, f.input2.value);
            if (svar.ok) { this.loes("ok"); return; }
        } else if (f.fase === "formel") {
            svar = T.formel(f.id, raa, this.opg);
            if (svar.ok) { this.formelOk(false, svar.note); return; }
        } else {
            svar = T.trin(f.id, raa, this.opg);
            if (svar.ok) { this.loes("ok"); return; }
        }
        if (!svar.tom) this.ryst(f);
        var tal = f.fase === "tal" ? T.tal(raa) : null;
        this.fane.regnFejl(svar.besked, svar.tom, f.id, tal ? tal.v : null);
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
        if (f.fase === "koef") return NK.html(T.afstemHint());
        return NK.html(f.fase === "formel" ? T.formelHint(f.id) : T.talHint(f.id, this.opg));
    };

    P.visSvar = function () {
        var f = this.aktivt();
        if (!f) return;
        if (f.fase === "formel") this.formelOk(true);
        else this.loes("svar");
    };

    P.regningHTML = function (id) {
        if (id === "afstem") return NK.html(T.skemaTekst(this.opg, true));
        var r = T.regning(id, this.opg);
        return NK.html(r[0] + " " + r[1]);
    };

    /* Har det aktive felt noget at sende? */
    P.harSvar = function () {
        var f = this.aktivt();
        if (!f || !f.input) return false;
        if (f.fase === "koef") return !!(f.input.value.trim() && f.input2 && f.input2.value.trim());
        return !!f.input.value.trim();
    };

    /* Spoergsmaalet paa papirkortet til det aktive trin (ren tekst) */
    P.trinSpm = function () {
        var f = this.aktivt();
        if (!f) return "";
        var navn = T.navn(f.id, this.opg), v = T.venstre(f.id, this.opg);
        if (f.fase === "koef") return navn + ". Hvilke tal står foran ionerne?";
        if (f.fase === "formel") return navn + ". Hvilken formel giver " + v + "?";
        return navn + ". Hvad er " + v + "?";
    };

    P.trinChip = function () {
        var n = this.felter.length;
        return n > 1 ? "Trin " + Math.min(this.k + 1, n) + " af " + n : "Trin";
    };

    /* Linjen nederst paa kortet: hvor eleven skriver */
    P.trinVej = function () {
        var f = this.aktivt();
        if (!f) return "";
        if (f.fase === "koef") return "Skriv tallene foran ionerne i skemaet i panelet, og tryk på Indsend svar.";
        if (f.fase === "formel") return "Skriv formlen i feltet i panelet, og tryk på Indsend svar.";
        return "Skriv tallet i feltet i panelet, og tryk på Indsend svar.";
    };

    P.trinTekst = function () {
        var f = this.aktivt();
        if (!f) return "";
        var n = this.felter.length;
        var hvad = f.fase === "formel" ? "Skriv <b>formlen</b> for " + NK.html(T.venstre(f.id, this.opg)) + "." :
            (f.fase === "koef" ? "Skriv <b>tallene</b> foran ionerne." : "Skriv <b>tallet</b>.");
        return (n > 1 ? "Trin " + (this.k + 1) + " af " + n + ": " : "") + NK.html(T.navn(f.id, this.opg)) + ". " + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. data: linjerne med opgavens tal. Med tegn = false maales
       der kun (saa skriften kan skrumpe, til alt er paa tavlen). */
    function linje(ctx, dele, x, y, b, f, farver, tegn) {
        var hel = dele.join(" ");
        ctx.font = Tg.font("600", f);
        if (ctx.measureText(hel).width <= b || dele.length < 2) {
            if (!tegn) return 1;
            var s1 = NK.passendeSkrift(ctx, hel, b, f, 12, "600"), xx = x;
            dele.forEach(function (d, i) {
                NK.tekst(ctx, d, xx, y, { font: Tg.font("600", s1), linje: "middle", farve: farver[i] || farver[0] });
                ctx.font = Tg.font("600", s1);
                xx += ctx.measureText(d + " ").width;
            });
            return 1;
        }
        if (!tegn) return 2;
        NK.tekst(ctx, dele[0], x, y, { font: Tg.font("600", NK.passendeSkrift(ctx, dele[0], b, f, 12, "600")), linje: "middle", farve: farver[0] });
        var s = NK.passendeSkrift(ctx, dele.slice(1).join(" "), b - f * 1.5, f, 12, "600");
        NK.tekst(ctx, dele.slice(1).join(" "), x + f * 1.5, y + f * 1.5, { font: Tg.font("600", s), linje: "middle", farve: farver[1] || farver[0] });
        return 2;
    }

    P.tegnTavle = function (ctx, r, data, tid) {
        Tg.tavle(ctx, r);
        /* Skriften skrumper, naar der er mange trin, saa alt kan vaere der */
        var linjer = 3.4 + Math.max(0, data.length - 2) * 0.95 + this.felter.length * 1.25;
        var f = NK.klamp(Math.min(r.h / (linjer * 1.55 + 1.2), r.b / 30), 12, 20);
        while (f > 12 && this.tavleGennem(ctx, r, data, tid, f, false) > r.y + r.h - f * 0.2) f -= 0.5;
        this.tavleGennem(ctx, r, data, tid, f, true);
    };

    /* Én gang gennem tavlen med skriftstoerrelsen f; giver y under sidste linje */
    P.tavleGennem = function (ctx, r, data, tid, f, tegn) {
        var o = this.opg;
        var x = r.x + f * 1.1, b = r.b - f * 2.2, y = r.y + f * 1.3, lh = f * 1.55;
        var lille = Tg.font("700", NK.klamp(f * 0.72, 12, 14));
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)", groen = "#1d7a48", gul = "#9a6a00";
        if (tegn) NK.tekst(ctx, "OPGAVENS TAL", x, y, { font: lille, linje: "middle", farve: "#6a7280" });
        y += lh * 0.85;
        NK.passendeSkrift(ctx, data.join("     "), b, f, 12, "600");
        var dfont = ctx.font;
        /* Tre linjer eller flere (to salte og rumfanget) staar altid under hinanden */
        if (data.length <= 2 && ctx.measureText(data.join("     ")).width <= b) {
            if (tegn) NK.tekst(ctx, data.join("     "), x, y, { font: dfont, linje: "middle", farve: moerk });
            y += lh;
        } else {
            data.forEach(function (d) {
                var sd = NK.passendeSkrift(ctx, d, b, f, 12, "600");
                if (tegn) NK.tekst(ctx, d, x, y, { font: Tg.font("600", sd), linje: "middle", farve: moerk });
                y += lh * 0.95;
            });
        }
        y += lh * 0.25;
        if (tegn) NK.tekst(ctx, "BEREGNINGEN", x, y, { font: lille, linje: "middle", farve: "#6a7280" });
        y += lh * 0.85;
        var puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);
        this.felter.forEach(function (fe) {
            var loest = fe.status === "ok" || fe.status === "svar";
            var aktiv = fe.status === "aktiv";
            var dele, farver;
            if (fe.id === "afstem") {
                dele = [T.skemaTekst(o, loest)];
                farver = [loest ? (fe.status === "svar" ? gul : groen) : (aktiv ? moerk : svag)];
            } else if (loest) {
                dele = T.regning(fe.id, o);
                farver = [moerk, fe.status === "svar" ? gul : groen];
            } else if (fe.fase === "tal" && D.TRIN[fe.id].formel) {
                dele = [T.formelTekst(fe.id, o), "= ?"];
                farver = [moerk, moerk];
            } else {
                dele = [T.venstre(fe.id, o) + " = ?"];
                farver = [aktiv ? moerk : svag];
            }
            if (aktiv && tegn) {
                ctx.save();
                ctx.strokeStyle = "rgba(214, 160, 20, " + (0.4 + 0.5 * puls) + ")";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, x - f * 0.45, y - lh * 0.55, b + f * 0.6, lh * 1.1, 6);
                ctx.stroke();
                ctx.restore();
            }
            var n = linje(ctx, dele, x, y, b, f, farver, tegn);
            y += lh * (n === 2 ? 1.95 : 1.15);
        });
        if (tegn) this.sidstY = y;
        return y - lh * 0.6;
    };

    NK.Regning = Regning;

    /* ----- Det, fane 2 og 3 faar paa deres prototype --------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinVej(); };

        /* Papirkortet: opgaven, spoergsmaalet til det aktive trin og til sidst
           resultatet med knappen videre, hvor Indsend svar stod */
        P2.kortData = function () {
            var r = this.regning, intro = this.kortTekst();
            if (r.faerdig()) {
                return { slags: "loest", bliv: true, gul: this.sidstMaade === "svar", chip: this.kortChip(), intro: "", tekst: intro,
                         html: (this.slutLinje ? this.slutLinje() : "") + (this.slutEkstra ? " " + NK.html(this.slutEkstra) : ""),
                         videre: this.videreTekst() };
            }
            return { slags: "spm", chip: this.kortChip() + " · " + r.trinChip(), intro: intro, tekst: r.trinSpm() };
        };
        P2.spmAaben = function () { return !this.regning.faerdig() && !this.auto; };
        P2.indsendKlar = function () { return this.regning.harSvar(); };
        P2.indsendSvar = function () {
            var r = this.regning;
            if (!r.harSvar()) {
                this.blinkKort();
                this.kortBesked(NK.html(r.trinVej()), 3.5, "gul");
                r.fokus();
                return true;
            }
            r.tjek();
            return true;
        };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        /* Formlen er rigtig (eller vist): kortet spoerger nu om tallet i samme
           trin, og formlen staar i raekken i panelet */
        P2.formelOk = function (vist, note, formel) {
            this.hjaelp = 0;
            if (vist) this.svarVis("Formlen er <b>" + NK.html(formel) + "</b>.");
            else this.naesteLinje(note ? NK.html(note) + " <b>" + NK.html(formel) + "</b>." : "", "");
            this.visKort();
            this.fokus();
        };

        P2.regnLoest = function (id, maade) {
            this.sidstMaade = maade;
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) + "." : null);
            this.visKort();
        };

        P2.regnFejl = function (besked, tom, id, v) {
            if (tom) this.besked(NK.html(besked), "gul");
            else this.fejlLinje(NK.html(besked));
            if (!tom && this.efterFejl) this.efterFejl(id, v);
            this.fokus();
        };
    };
}());
