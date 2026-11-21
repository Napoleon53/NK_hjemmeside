/* =====================================================================
   sim_regn.js - fane 3: Beregningen

   Otte regnestykker i Let, Middel og Svaer. Regelsaettet (21. nov. 2026)
   og moenstret fra Beregningen i sc5.7:

     * Til venstre maaleopstillingen: lampen, kuvetten og detektoren med
       opgavens tal paa etiketterne (stoffet og c paa kuvetten, l under
       den, A i displayet, ε, hældningen, rumfanget og molarmassen paa smaa
       kort). Det, der spoerges om, staar som "?" med gul ramme.
     * Kortet stiller spoergsmaalet. Hver del har to trin: formlen vaelges
       med tre knapper (den rigtige og to typiske fejl med hver sin
       forklaring), og tallet skrives i et felt paa kortet med enheden
       efter feltet.
     * Til hoejre tavlen som et lyst papir. Den er tom, til formlen er
       fundet, og vokser saa linje for linje: et navn i ord og regnestykket
       med tallene sat ind. Linjen, kortet spoerger om, har "?" og gul
       ramme.

   Facit, tjek og hint er i js/regning.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var R = NK.Regn;
    var Tg = NK.Tegn;

    function SimRegn() {
        var mig = this;
        this.laerred = new NK.Laerred(NK.el("regn-laerred"));
        this.tavle = NK.el("regn-tavle");
        this.resTekst = "";
        this.startFane(D.REGN, D.GRUPPER_REGN);
        /* Feltet til tallet ligger paa kortet, som tegnes om: lyt paa kortet */
        this.el.ind.addEventListener("input", function (e) {
            if (e.target.id !== "regn-felt") return;
            mig.resTekst = e.target.value;
            e.target.classList.remove("fejl");
            if (mig.fast.klasse === "skidt" || mig.fast.klasse === "hint") mig.besked("", "");
            mig.nulstilHjaelp();
            mig.visIndsend();
        });
        this.el.ind.addEventListener("keydown", function (e) {
            if (e.target.id !== "regn-felt" || e.key !== "Enter") return;
            e.preventDefault();
            mig.enter();
        });
        this.laerred.canvas.addEventListener("click", function () { mig.klikScene(); });
        window.addEventListener("resize", function () { if (NK.el("fane-regn").classList.contains("aktiv")) mig.tilpas(); });
        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimRegn.prototype;
    NK.Fane.paa(P, { navn: "regn" });

    P.opg = function () { return this.opgaver[this.nr]; };
    P.aktivt = function () { return this.ts[this.k] || null; };

    /* ----- Opgaven ---------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        R.vaerdier(o);
        this.k = 0;
        this.resTekst = "";
        this.ts = o.trin.map(function (id, j) {
            return { id: id, status: j === 0 ? "aktiv" : "laast", fase: "formel", formelOk: false, vistFormel: false };
        });
        this.visTavle();
    };

    /* Ved en ny opgave er intet svar vist endnu */
    P.faneVaelg = P.vaelg;
    P.vaelg = function (i) {
        this.brugtSvarNogen = false;
        this.faneVaelg(i);
    };

    /* ----- Tekster ----------------------------------------------------------------------- */
    P.stof = function () { return D.STOFFER[this.opg().stof]; };

    /* Indledningen paa kortet (runde 3, regel 5a): kun naar spoergsmaalet
       ellers bliver for langt (ind i D.REGN). Tallene staar paa etiketterne
       i scenen. */
    P.indledning = function () {
        return this.opg().ind || "";
    };

    /* Navnet paa linjen paa tavlen og paa kortet over et ukendt tal */
    P.navnPaa = function (b) {
        var f = this.stof().formel;
        if (b === "A") return "Absorbansen";
        if (b === "c") return "Koncentrationen af " + f;
        if (b === "eps") return "ε for " + f + " ved " + this.stof().lambda + " nm";
        if (b === "a") return "Hældningen af standardkurven";
        if (b === "V") return "Prøvens rumfang";
        if (b === "M") return "Molarmassen af " + f;
        if (b === "n") return "Stofmængden af " + f;
        if (b === "m") return "Massen af " + f;
        if (b === "l") return "Kuvettens bredde";
        return b;
    };

    /* Chippen: niveauet og nummeret paa niveauet */
    P.chipTekst = function () {
        var o = this.opg(), g = D.GRUPPER_REGN.filter(function (x) { return x.id === o.gruppe; })[0];
        var paa = this.opgaver.filter(function (x) { return x.gruppe === o.gruppe; });
        var nr = paa.indexOf(o) + 1;
        return g.titel + " " + nr + " af " + paa.length;
    };

    P.trinTekst = function () {
        var n = this.ts.length * 2, st = this.aktivt();
        if (!st) return "";
        return "Trin " + (this.k * 2 + (st.fase === "tal" ? 2 : 1)) + " af " + n;
    };

    P.feltHTML = function (laast) {
        var st = this.aktivt(), b = D.TRIN[st.id].maal, e = R.enhed(b);
        return '<div class="sk-felt"><label for="regn-felt">' + NK.html(R.vis(b)) + ' =</label><input id="regn-felt" type="text" autocomplete="off" spellcheck="false" inputmode="decimal" placeholder="tallet"' +
            ' value="' + NK.html(this.resTekst).replace(/"/g, "&quot;") + '"' + (laast ? " disabled" : "") + ">" +
            (e ? '<span class="sk-enhed">' + NK.html(e) + "</span>" : "") + "</div>";
    };

    /* ----- Papirkortet -------------------------------------------------------------------- */
    P.kortData = function () {
        var o = this.opg(), st = this.aktivt();
        if (!st) return { tekst: o.spm[0] };
        var t = D.TRIN[st.id], navn = D.BOGSTAV[t.maal].navn;
        var tekst = (this.indledning() ? this.indledning() + " " : "") + o.spm[this.k];
        var d = { chip: this.chipTekst(), trinTekst: this.trinTekst() };
        if (st.fase === "formel") {
            d.tekst = tekst + " Vælg formlen for " + navn + ".";
            d.svar = t.valg.map(function (v) { return { t: v.f }; });
            d.formler = true;
            return d;
        }
        d.tekst = tekst + " Regn " + navn + " ud på lommeregneren, og skriv tallet.";
        d.ekstra = this.feltHTML(this.faerdig || !!this.venter);
        return d;
    };

    /* Kortet er tegnet om: feltet faar sit tal og fokus igen */
    P.efterKort = function () {
        var f = NK.el("regn-felt");
        if (f && !f.disabled) this.fokusFelt();
    };

    P.kanIndsende = function () {
        var st = this.aktivt();
        if (!st || this.faerdig) return false;
        if (st.fase === "tal") return !!String(this.resTekst || "").trim();
        return false;
    };

    function rigtigIndeks(liste) {
        for (var k = 0; k < liste.length; k++) if (liste[k].ok) return k;
        return 0;
    }

    /* Formlen: et svar paa kortet */
    P.svarValgt = function (j) {
        var st = this.aktivt();
        if (!st || st.fase !== "formel") return;
        var t = D.TRIN[st.id];
        if (j === rigtigIndeks(t.valg)) { this.formelRigtig(); return; }
        this.forkertValg(j, NK.html(t.valg[j].hvorfor));
    };

    P.formelRigtig = function () {
        var st = this.aktivt(), t = D.TRIN[st.id], k = rigtigIndeks(t.valg), mig = this;
        st.formelOk = true;
        this.valgt = k;
        this.visTavle();
        this.mellem("Formlen er " + NK.html(t.valg[k].f) + ". Tavlen viser den med tallene sat ind.", function () {
            st.fase = "tal";
            mig.resTekst = "";
            mig.visTavle();
        }, k);
    };

    /* Tallet: Indsend svar. Enheden staar efter feltet og laegges til, hvis
       eleven kun har skrevet tallet. */
    P.indsend = function () {
        var st = this.aktivt();
        if (!st || st.fase !== "tal" || this.faerdig) return;
        var o = this.opg(), b = D.TRIN[st.id].maal, raa = String(this.resTekst || "").trim();
        var e = R.enhed(b);
        if (raa && e && b !== "eps" && !/[a-zA-Zµμ]/.test(raa)) raa += " " + e;
        var r = R.tjekRes(o, this.k, raa);
        if (r.ok) { this.delLoest("ok"); return; }
        if (r.tom) this.besked(r.besked, "hint");
        else this.fejlLinje(r.besked);
        var f = NK.el("regn-felt");
        if (f && !r.tom) { f.classList.remove("fejl"); void f.offsetWidth; f.classList.add("fejl"); }
        this.fokusFelt();
    };

    P.delLoest = function (maade) {
        var st = this.aktivt(), o = this.opg(), mig = this;
        st.status = maade;
        if (maade === "svar") this.brugtSvarNogen = true;
        var b = D.TRIN[st.id].maal;
        var tekst = NK.html(R.vis(b) + " = " + R.facitTekst(o, this.k) + ".");
        this.visTavle();
        if (this.k < this.ts.length - 1) {
            this.mellem(tekst, function () {
                mig.k++;
                mig.ts[mig.k].status = "aktiv";
                mig.resTekst = "";
                mig.visTavle();
            }, null);
            return;
        }
        this.loest(this.brugtSvarNogen ? "svar" : "ok", tekst, this.brugtSvarNogen ? "Svaret" : "Rigtigt");
        this.visTavle();
    };

    /* ----- Hint og svar ------------------------------------------------------------------- */
    P.hintTrin = function () {
        var st = this.aktivt();
        if (!st || this.faerdig) return null;
        if (st.fase === "formel") return { trin: R.formelHint(st.id), lys: null };
        return { trin: R.resHint(this.opg(), this.k), lys: null };
    };

    P.visSvar = function () {
        var st = this.aktivt();
        if (!st) return;
        this.brugtSvarNogen = true;
        if (st.fase === "formel") {
            st.vistFormel = true;
            this.formelRigtig();
            return;
        }
        var V = R.vaerdier(this.opg());
        this.resTekst = V.facit[this.k].tekst;
        this.delLoest("svar");
    };

    P.fokusFelt = function () {
        if (!NK.el("fane-regn").classList.contains("aktiv")) return;
        var f = NK.el("regn-felt");
        if (!f || f.disabled) return;
        if (document.activeElement === f) return;
        try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
        var n = f.value.length;
        try { f.setSelectionRange(n, n); } catch (e2) { /* ingen markoer */ }
    };

    /* Scenen har intet at klikke paa: kortet blinker, saa eleven ser, hvor
       opgaven staar */
    P.klikScene = function () {
        if (this.faerdig) return;
        this.kortBlink();
    };

    /* ----- Tavlen: vokser linje for linje ------------------------------------------------- */
    P.visTavle = function () {
        var o = this.opg(), mig = this, html = "";
        this.ts.forEach(function (st, i) {
            if (i > mig.k && st.status === "laast") return;
            var faerdig = st.status === "ok" || st.status === "svar";
            if (!st.formelOk && !faerdig) return;
            var t = D.TRIN[st.id], b = t.maal;
            var spoerges = !faerdig && i === mig.k && !mig.faerdig;
            var slut = faerdig ? '<span class="pt-svar' + (st.status === "svar" ? " vist" : "") + '">' + NK.html(R.facitTekst(o, i)) + "</span>" :
                '<span class="pt-spm">?</span>';
            html += '<div class="pt-del"><p class="pt-navn">' + NK.html(mig.navnPaa(b)) + "</p>" +
                '<div class="pt-linje' + (spoerges ? " spoerges" : "") + '">' +
                "<span>" + NK.html(R.vis(b)) + " = " + R.formelHTML(st.id) + "</span><span>= " + R.talHTML(o, i) + "</span><span>= " + slut + "</span></div></div>";
        });
        /* Fra start en stiplet plads med navnet (regel 13), saa intet hopper */
        var tom = !html;
        if (tom) html = '<div class="pt-plads">Udregningen</div>';
        if (this.tavle.innerHTML !== html) this.tavle.innerHTML = html;
        this.tavle.classList.toggle("tom", tom);
    };

    /* ----- Maaleopstillingen -------------------------------------------------------------- */
    /* Hvordan staar et tal i opgaven: givet, spoerges om nu, kommer senere
       eller er regnet */
    P.tilstand = function (b) {
        var o = this.opg(), V = R.vaerdier(o);
        if (V.tal[b] && V.tal[b].givet) return { slags: "givet", tekst: V.tal[b].tekst };
        for (var i = 0; i < o.trin.length; i++) {
            if (D.TRIN[o.trin[i]].maal !== b) continue;
            var st = this.ts[i];
            if (st && (st.status === "ok" || st.status === "svar")) return { slags: "regnet", tekst: V.facit[i].tekst };
            return { slags: i === this.k && !this.faerdig ? "nu" : "senere", tekst: "?" };
        }
        return null;
    };

    P.tilpas = function () {
        this.laerred.tilpas();
        this.tegn();
    };

    P.opdater = function (dt) {
        this.opdaterBesked(dt);
        this.tegn();
    };

    P.tegn = function () {
        var L = this.laerred, ctx = L.ctx;
        if (L.b < 60 || L.h < 60) return;
        L.ryd();
        /* Runde 3 (regel 32): opstillingen har en stoerste bredde og staar i
           midten af sin spalte; den vokser med pladsen */
        var pad = 10, BW = Math.min(L.b - 2 * pad, 620), X0 = Math.round((L.b - BW) / 2) - pad;
        var W = BW + 2 * pad, H = L.h, mig = this;
        ctx.save();
        ctx.translate(X0, 0);
        this.opX0 = X0;
        var s = this.stof(), px = NK.klamp(Math.min(W / 34, H / 26), 13, 17);
        var o = this.opg(), V = R.vaerdier(o);
        var GUL = "#e0b22e", GROEN = "#1f6b43";

        /* Smaa kort oeverst med de tal, der ikke sidder paa apparatet */
        var kort = ["eps", "a", "V", "M", "n", "m"].map(function (b) { var t = mig.tilstand(b); return t ? { b: b, t: t } : null; }).filter(Boolean);
        var kolonner = W > 420 ? 2 : 1, kb = (W - 2 * pad - (kolonner - 1) * 10) / kolonner, kh = px * 3.3;
        kort.forEach(function (k, i) {
            var x = pad + (i % kolonner) * (kb + 10), y = pad + Math.floor(i / kolonner) * (kh + 10);
            var nu = k.t.slags === "nu";
            Tg.papir(ctx, x, y, kb, kh);
            if (nu) {
                ctx.save(); ctx.strokeStyle = GUL; ctx.lineWidth = 3;
                NK.rundtRekt(ctx, x - 1, y - 1, kb + 2, kh + 2, 11); ctx.stroke(); ctx.restore();
            }
            NK.tekst(ctx, mig.navnPaa(k.b), x + 12, y + px * 1.3, { font: Tg.font("500", px * 0.88), farve: "#6b6558" });
            var vaerdi = R.vis(k.b) + " = " + (k.t.slags === "givet" || k.t.slags === "regnet" ? R.talMedEnhed(k.b, k.t.tekst) : "?");
            if (k.b === "V" && k.t.slags === "givet") vaerdi = "V = " + NK.dk(V.tal.V.v * 1000, 0) + " mL = " + R.talMedEnhed("V", k.t.tekst);
            NK.tekst(ctx, vaerdi, x + 12, y + px * 2.75, { font: Tg.font(k.t.slags === "givet" ? "500" : "600", px * 1.08),
                farve: k.t.slags === "regnet" ? GROEN : (k.t.slags === "givet" ? "#1d2433" : "#7a5a00") });
        });
        var raekker = Math.ceil(kort.length / kolonner);
        /* Det nederste og det hoejreste, der er tegnet (selvtesten maaler det) */
        this.tegnBund = pad + raekker * (kh + 10);
        this.tegnHoejre = kort.length ? pad + Math.min(kort.length, kolonner) * (kb + 10) - 10 : 0;
        var top = pad + raekker * (kh + 10) + (kort.length ? 8 : 0);

        /* Apparatet: lampe, straale, kuvette og detektor */
        var harA = !!this.tilstand("A"), harC = !!this.tilstand("c");
        var apH = H - top - pad;
        var kh2 = NK.klamp(Math.min(apH * 0.5, W * 0.34), 60, 230);
        var ctTop = top + NK.klamp((apH - kh2 - px * 6) / 3, 6, 60);
        var yc = ctTop + kh2 * 0.58;
        var lh = NK.klamp(kh2 * 0.62, 44, 130), lb = NK.klamp(lh * 0.8, 40, 100), lx = pad;
        var detH = NK.klamp(kh2 * 0.66, 48, 140), detB = NK.klamp(detH * 0.8, 46, 110);
        var dispB = NK.klamp(W * 0.3, 112, 150);
        var dx = W - pad - Math.max(detB, dispB) / 2 - detB / 2;
        var x0 = lx + lb, x1 = dx;
        var cx = (x0 + x1) / 2;
        var l = V.tal.l ? V.tal.l.v : 1;
        var pxCm = NK.klamp((x1 - x0 - 70) / 2.3, 28, 110);
        var cb = l * pxCm, cl = cx - cb / 2, ct = yc - kh2 * 0.58;
        var rgb = s.lys;
        var cVis = V.tal.c ? V.tal.c.v : 0.5 * s.cMax;
        Tg.straale(ctx, x0, cl, yc, 22, rgb, 1);
        Tg.straale(ctx, cl + cb, x1, yc, 22, rgb, 0.45);
        Tg.kuvette(ctx, cl, ct, cb, kh2, { rgb: Tg.vaeskeFarve(s, cVis) });
        Tg.lampe(ctx, lx, yc - lh / 2, lb, lh, rgb);
        Tg.detektor(ctx, dx, yc - detH / 2, detB, detH, 30);
        NK.tekst(ctx, "λ = " + s.lambda + " nm", lx, yc + lh / 2 + px * 1.2, { font: Tg.font("500", px * 0.9), farve: Tg.rgba(rgb, 1) });

        /* l under kuvetten og etiketten med stoffet og c */
        var pilY = ct + kh2 + px * 0.85;
        Tg.maalPil(ctx, cl, cl + cb, pilY, "#cfd6de");
        NK.tekst(ctx, "l = " + R.talMedEnhed("l", V.tal.l ? V.tal.l.tekst : "1,00"), cx, pilY + px * 1.5, { font: Tg.font("500", px), justering: "center", farve: "#e9eef4" });
        var tagLinjer = [{ t: s.Navn, px: px * 0.95, vaegt: "500" }];
        var cT = harC ? this.tilstand("c") : null;
        if (cT) tagLinjer.push({ t: "c = " + (cT.slags === "givet" || cT.slags === "regnet" ? R.talMedEnhed("c", cT.tekst) : "?"), px: px * 1.08, vaegt: cT.slags === "givet" ? "500" : "600",
            farve: cT.slags === "regnet" ? GROEN : (cT.slags === "givet" ? "#1d2433" : "#7a5a00") });
        var tag = Tg.etiket(ctx, cx, pilY + px * 2.3, tagLinjer, { pad: 8, kant: cT && cT.slags === "nu" ? GUL : "#c9c3b3", kantB: cT && cT.slags === "nu" ? 3 : 1 });
        this.tegnBund = Math.max(this.tegnBund, tag.y + tag.h);
        this.tegnHoejre = Math.max(this.tegnHoejre, tag.x + tag.b);

        /* Displayet med A */
        if (harA) {
            var aT = this.tilstand("A");
            var dpx = NK.klamp(px * 1.05, 14, 17);
            var dX = dx + detB / 2 - dispB / 2, dY = yc + detH / 2 + 10;
            var tal = aT.slags === "givet" || aT.slags === "regnet" ? aT.tekst : "?";
            var dh = Tg.display(ctx, dX, dY, dispB, [{ etiket: "A", tal: tal, farve: aT.slags === "regnet" ? "#9ff0c0" : "#ffe28a" }], dpx);
            this.tegnBund = Math.max(this.tegnBund, dY + dh);
            if (aT.slags === "nu") {
                ctx.save(); ctx.strokeStyle = GUL; ctx.lineWidth = 3;
                NK.rundtRekt(ctx, dX - 3, dY - 3, dispB + 6, dh + 6, 8); ctx.stroke(); ctx.restore();
            }
        }
        NK.tekst(ctx, "Detektor", dx + detB / 2, yc - detH / 2 - 7, { font: Tg.font("500", px * 0.85), justering: "center", farve: "#b9c0ca" });
        ctx.restore();
        /* Tavlen er mindst lige saa hoej som opstillingen, saa de to staar i
           balance, og intet hopper, naar linjerne kommer */
        var mh = Math.round(Math.min(this.tegnBund + 4, H)) + "px";
        if (this.tavle.style.minHeight !== mh) this.tavle.style.minHeight = mh;
    };

    NK.SimRegn = SimRegn;
}());
