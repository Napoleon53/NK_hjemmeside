/* =====================================================================
   sim_skala.js - fane 1: skalaen

   pH-skalaen fra 0 til 14 i universalindikatorens farver. Paa bordet
   staar seks hverdagsstoffer. Eleven traekker et stof op paa skalaen, der
   hvor det tror, stoffet hoerer til. Saa maaler pH-metret det, og stoffet
   flyver hen til sin rigtige plads over skalaen. Gaettet staar som en
   gul trekant under skalaen, saa man kan se, hvor langt der var.

   To hylder (D.HYLDER) med seks stoffer hver. Stofferne fra hylde 1
   bliver staaende lidt blegere, mens hylde 2 maales, saa skalaen til
   sidst har alle tolv. Knappen giver et hint og saa svaret (resten
   maales uden gaet). Hvor langt eleven er naaet, huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc7.2-skala";
    var TIL_MAALER = 0.45;       /* stoffet flyver hen til pH-metret */
    var MAALER = 1.1;            /* elektroden dykker, og tallet ruller */
    var OP = 0.6;                /* stoffet flyver op paa skalaen */
    var BANER = 3;               /* raekker over skalaen til de maalte stoffer */

    function SimSkala() {
        this.L = new NK.Laerred(NK.el("skala-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.valgt = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.hylde = NK.klamp(gemt.hylde || 0, 0, D.HYLDER.length);
        this.rost = gemt.rost || [];

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.startHylde();
    }

    var P = SimSkala.prototype;

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.luft = NK.klamp(H * 0.1, 10, 70);
        lay.bordY = Math.round(H * 0.84);
        lay.px = NK.klamp(W * 0.017, 12, 15);
        var bandH = NK.klamp(H * 0.06, 24, 42);

        /* pH-metret og malepladsen til hoejre paa bordet */
        var mh = NK.klamp(H * 0.19, 70, 140);
        var mb = mh * 80 / 140;
        lay.meter = { x: W - kant - mb / 2 - 6, bund: lay.bordY, h: mh, b: mb };
        lay.kop = { x: kant + 24, y: lay.bordY };

        /* Stofferne staar i seks pladser mellem koppen og pH-metret */
        var x0 = kant + 62, maalB = NK.klamp(W * 0.1, 56, 110);
        lay.maalX = lay.meter.x - mb / 2 - maalB / 2 - 8;
        var x1 = lay.maalX - maalB / 2 - 6;
        var plads = (x1 - x0) / 6;
        /* Stofferne, banerne (3 · (0,6 · hi + 20)) og skalaen skal kunne vaere
           over hinanden uden at roere */
        var hi = Math.min(plads * 1.15, (lay.bordY - lay.luft - bandH - lay.px - 92) / 2.8, 126);
        hi = NK.klamp(hi, 40, 126);
        lay.hi = hi;
        lay.pladser = [];
        for (var i = 0; i < 6; i++) lay.pladser.push(x0 + (i + 0.5) * plads);
        lay.plads = plads;

        /* Skalaen og banerne over den */
        lay.ikonH = NK.klamp(hi * 0.6, 28, 66);
        lay.baneH = lay.ikonH + 20;
        var bandY = Math.round(lay.luft + BANER * lay.baneH + 10);
        lay.skala = { x0: kant + 24, x1: W - kant - 24, y: bandY, h: bandH };
        lay.skalaBund = bandY + bandH + 12 + lay.px;
        this.lay = lay;
        this.placerAlle(true);

        this.saetAnker("skala-anker-skala", lay.skala.x0 - 4, bandY - 6, lay.skala.x1 - lay.skala.x0 + 8, lay.skalaBund - bandY + 10);
        this.saetAnker("skala-anker-stoffer", x0, lay.bordY - hi - 6, x1 - x0, hi + 6 + 12 + lay.px + 18);
        this.saetAnker("skala-anker-meter", lay.maalX - maalB / 2, lay.bordY - mh - 8, lay.meter.x + mb / 2 - (lay.maalX - maalB / 2) + 4, mh + 10);
        this.saetAnker("skala-anker-baner", lay.skala.x0, lay.luft, lay.skala.x1 - lay.skala.x0, bandY - lay.luft);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Stofferne --------------------------------------------------------------------
       Et stof er { st, status, x, y, h, gaet, fra, t, bane, hylde }.
       status: hylde, traekkes, tilMaaler, maales, op, placeret */
    P.startHylde = function () {
        var mig = this;
        this.stoffer = [];
        this.naaet = false;
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.maaling = null;
        this.visning = "--,-";
        this.valgt = null;
        this.besked("", "");
        /* De tidligere hylder staar faerdigmaalt over skalaen, blege, mens
           den naeste maales. Naar alle er maalt, staar de tolv klart. */
        var alle = this.hylde >= D.HYLDER.length;
        D.HYLDER.forEach(function (h, i) {
            if (i >= mig.hylde) return;
            h.stoffer.forEach(function (st) {
                mig.stoffer.push({ st: st, status: "placeret", gammel: !alle, gaet: null, bane: -1, x: 0, y: 0, h: 0, hylde: i });
            });
        });
        if (!alle) {
            D.HYLDER[this.hylde].stoffer.forEach(function (st, i) {
                mig.stoffer.push({ st: st, status: "hylde", plads: i, gaet: null, bane: -1, x: 0, y: 0, h: 0, hylde: mig.hylde });
            });
        }
        this.naaet = alle;
        this.placerAlle(true);
        this.visKort();
        this.visListe();
        this.visStof();
        this.visStatus();
    };

    P.aktivHylde = function () {
        return D.HYLDER[Math.min(this.hylde, D.HYLDER.length - 1)];
    };

    P.denneHylde = function () {
        var h = Math.min(this.hylde, D.HYLDER.length - 1);
        return this.stoffer.filter(function (s) { return s.hylde === h; });
    };

    P.antalMaalt = function () {
        return this.denneHylde().filter(function (s) { return s.status === "placeret"; }).length;
    };

    /* Pladsen paa bordet eller over skalaen */
    P.hjemPos = function (s) {
        var lay = this.lay;
        return { x: lay.pladser[s.plads], y: lay.bordY, h: lay.hi };
    };

    P.skalaPos = function (s) {
        var lay = this.lay;
        var bund = lay.skala.y - 20 - s.bane * lay.baneH;
        return { x: Tg.skalaX(lay.skala, s.st.ph), y: bund, h: lay.ikonH };
    };

    /* Find en bane, hvor stoffet ikke roerer sine naboer */
    P.findBane = function (s) {
        var lay = this.lay, afst = lay.ikonH * 0.95;
        var x = Tg.skalaX(lay.skala, s.st.ph);
        var mig = this;
        for (var b = 0; b < BANER + 2; b++) {
            var optaget = mig.stoffer.some(function (a) {
                return a !== s && a.bane === b && Math.abs(Tg.skalaX(lay.skala, a.st.ph) - x) < afst;
            });
            if (!optaget) return b;
        }
        return 0;
    };

    P.placerAlle = function (straks) {
        if (!this.lay) return;
        var mig = this;
        /* Banerne tildeles i den raekkefoelge, stofferne blev maalt */
        this.stoffer.forEach(function (s) { if (s.status === "placeret" && s.bane < 0) s.bane = mig.findBane(s); });
        this.stoffer.forEach(function (s) {
            var p = null;
            if (s.status === "hylde") p = mig.hjemPos(s);
            else if (s.status === "placeret") p = mig.skalaPos(s);
            if (p && (straks || !s.fra)) { s.x = p.x; s.y = p.y; s.h = p.h; }
        });
    };

    /* ----- Maalingen ---------------------------------------------------------------------- */
    /* Eleven har sluppet stoffet over skalaen ved gaet */
    P.gaet = function (s, gaet, fra) {
        s.gaet = Math.round(NK.klamp(gaet, 0, 14) * 10) / 10;
        s.status = "tilMaaler";
        s.fra = { x: fra.x, y: fra.y, h: fra.h };
        s.t = 0;
        this.maaling = s;
        this.valgt = s;
        if (this.afvisTilbud) this.afvisTilbud();
        this.besked("", "");
        this.visStatus();
    };

    /* Uden gaet (Vis svaret): stofferne maales efter hinanden, hurtigt */
    P.maalUdenGaet = function (s) {
        s.gaet = null;
        s.status = "tilMaaler";
        var p = this.hjemPos(s);
        s.fra = { x: p.x, y: p.y, h: p.h };
        s.t = 0;
        this.maaling = s;
        this.valgt = s;
    };

    P.efterMaaling = function (s) {
        s.status = "placeret";
        s.bane = this.findBane(s);
        var p = this.skalaPos(s);
        s.fra = { x: s.x, y: s.y, h: s.h };
        s.til = p;
        s.t = 0;
        s.flyver = true;
        this.maaling = null;
        this.visStof();
        this.visListe();
        if (s.gaet !== null && Math.abs(s.gaet - s.st.ph) <= 0.1 && this.laererAeg) this.laererAeg();
        if (this.antalMaalt() === this.denneHylde().length) this.hyldeFaerdig();
        else if (this.brugtSvar) this.naesteUdenGaet();
        this.visKort();
        this.visStatus();
    };

    P.naesteUdenGaet = function () {
        var s = this.denneHylde().filter(function (a) { return a.status === "hylde"; })[0];
        if (s) this.maalUdenGaet(s);
    };

    P.hyldeFaerdig = function () {
        if (this.naaet) return;
        this.naaet = true;
        this.hjaelp = 0;
        var liste = this.denneHylde();
        var taet = liste.filter(function (s) { return s.gaet !== null && Math.abs(s.gaet - s.st.ph) <= 1; }).length;
        var gaettet = liste.filter(function (s) { return s.gaet !== null; }).length;
        var h = Math.min(this.hylde, D.HYLDER.length - 1);
        var t = "Alle seks er målt.";
        if (gaettet) t += " " + taet + " af dine " + gaettet + " gæt var højst 1 fra.";
        this.besked(t, "god");
        var gemt = NK.hent(NOEGLE, {}) || {};
        gemt.hylde = Math.max(h + 1, gemt.hylde || 0);
        if (this.rost.indexOf(h) < 0) {
            this.rost.push(h);
            this.ventRos = 1.4;
            this.rosNr = h;
        }
        gemt.rost = this.rost;
        NK.gem(NOEGLE, gemt);
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Naeste hylde --------------------------------- */
    P.knap = function () {
        if (this.naaet) {
            var sidste = this.hylde >= D.HYLDER.length - 1;
            if (sidste) {
                if (this.hylde < D.HYLDER.length) { this.hylde = D.HYLDER.length; this.startHylde(); }
                if (NK.visFane) NK.visFane("fane-lup");
                return;
            }
            this.hylde++;
            this.startHylde();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(this.aktivHylde().hint), "gul");
            this.visKort();
            return;
        }
        this.brugtSvar = true;
        this.hjaelp = 2;
        this.besked("Resten måles uden gæt.", "gul");
        if (!this.maaling) this.naesteUdenGaet();
        this.visKort();
    };

    P.nulstil = function () {
        this.hylde = 0;
        NK.gem(NOEGLE, { hylde: 0, rost: this.rost });
        this.startHylde();
    };

    /* ----- Panelet ----------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("skala-knap"),
            besked: NK.el("skala-besked"),
            kort: NK.el("skala-kort"),
            liste: NK.el("skala-liste")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("skala-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.el("skala-spring").addEventListener("click", function () { mig.springIntro(); });
        this.el.liste.addEventListener("click", function (e) {
            var r = e.target.closest ? e.target.closest("[data-id]") : null;
            if (!r) return;
            var s = mig.stoffer.filter(function (a) { return a.st.id === r.getAttribute("data-id"); })[0];
            if (s) mig.vaelg(s);
        });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visKort = function () {
        var alle = this.hylde >= D.HYLDER.length;
        var h = Math.min(this.hylde, D.HYLDER.length - 1);
        NK.saetTekst("skala-titel", alle ? "Alle tolv stoffer" : "Hylde " + (h + 1) + " · " + D.HYLDER[h].navn);
        NK.saetTekst("skala-maalt", String(alle ? 12 : this.antalMaalt()));
        NK.saetTekst("skala-ialt", String(alle ? 12 : this.denneHylde().length));
        NK.saetTekst("skala-prompt", alle ? "Skalaen er fyldt. Klik på et stof for at se det igen." :
            "Træk hvert stof op på skalaen, der hvor du tror, det hører til.");
        var tekst, klasse = "knap";
        if (this.naaet) {
            tekst = this.hylde >= D.HYLDER.length - 1 ? "Videre til luppen →" : "Næste hylde →";
            klasse = "knap blaa banker";
        } else if (this.hjaelp === 0) tekst = "Giv hint";
        else if (this.hjaelp === 1) tekst = "Vis svaret";
        else { tekst = "Måler …"; }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = this.hjaelp === 2 && !this.naaet;
        this.el.kort.classList.toggle("sejr", this.naaet && this.hylde < D.HYLDER.length);
    };

    /* Listen med gaet og maalt for hylden */
    P.visListe = function () {
        var alle = this.hylde >= D.HYLDER.length;
        var liste = alle ? this.stoffer : this.denneHylde();
        var html = '<div class="tabel-raekke hoved"><span>Stof</span><span>Gæt</span><span>Målt</span></div>';
        var mig = this;
        liste.slice().sort(function (a, b) {
            if ((a.status === "placeret") !== (b.status === "placeret")) return a.status === "placeret" ? -1 : 1;
            return a.st.ph - b.st.ph;
        }).forEach(function (s) {
            var maalt = s.status === "placeret";
            var dom = maalt && s.gaet !== null ? D.gaetDom(Math.abs(s.gaet - s.st.ph)) : null;
            html += '<button type="button" class="tabel-raekke' + (mig.valgt === s ? " valgt" : "") + '" data-id="' + s.st.id + '">' +
                '<span class="tabel-stof"><span class="hyldeprik" style="background:' + (maalt ? K.farveCss(s.st.ph) : "#4a4a58") + '"></span>' +
                NK.html(s.st.navn) + "</span>" +
                '<span class="tal ' + (dom ? dom.klasse : "") + '">' + (s.gaet !== null ? K.phTekst(s.gaet, 1) : (maalt ? "·" : "")) + "</span>" +
                '<span class="tal">' + (maalt ? K.phTekst(s.st.ph, 1) : "?") + "</span></button>";
        });
        NK.saetHTML("skala-liste", html);
    };

    /* Kortet med det valgte stof */
    P.visStof = function () {
        var s = this.valgt;
        var boks = NK.el("skala-stof");
        if (!s || s.status !== "placeret") { boks.hidden = true; return; }
        boks.hidden = false;
        NK.saetTekst("skala-stofnavn", s.st.navn);
        NK.saetTekst("skala-stofph", "pH " + K.phTekst(s.st.ph, 1));
        var surhed = K.surhed(s.st.ph, 1);
        NK.saetTekst("skala-surhed", surhed.charAt(0).toUpperCase() + surhed.slice(1));
        var g = "";
        if (s.gaet !== null) {
            var dom = D.gaetDom(Math.abs(s.gaet - s.st.ph));
            g = "Dit gæt: " + K.phTekst(s.gaet, 1) + ". " + dom.ord + ".";
            NK.el("skala-gaet").className = "note " + dom.klasse;
        }
        NK.saetTekst("skala-gaet", g);
        NK.saetTekst("skala-modvand", K.modVand(s.st.ph));
        NK.saetTekst("skala-note", s.st.note);
    };

    P.vaelg = function (s) {
        this.valgt = s;
        this.visStof();
        this.visListe();
        if (s.status === "hylde") this.besked("Træk " + NK.html(s.st.navn.toLowerCase()) + " op på skalaen, der hvor du tror, det hører til.", "");
    };

    P.visStatus = function () {
        var t;
        var tr = this.traek;
        if (tr && tr.flyttet) {
            t = this.overSkala(tr) ? "Dit gæt: <b>pH " + K.phTekst(this.gaetVed(tr.x), 1) + "</b>. Slip for at måle." : "Træk op på skalaen, og slip der, hvor du tror, stoffet hører til.";
        } else if (this.maaling) t = "pH-metret måler " + NK.html(this.maaling.st.navn.toLowerCase()) + ".";
        else if (this.naaet && this.hylde < D.HYLDER.length) t = "Hylden er målt. Tryk på knappen til højre for at gå videre.";
        else if (this.hylde >= D.HYLDER.length) t = "Klik på et stof på skalaen for at se det igen.";
        else if (!this.antalMaalt()) t = "Træk et stof fra bordet op på skalaen, der hvor du tror, det hører til.";
        else t = "Træk det næste stof op på skalaen.";
        NK.saetHTML("skala-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this, lay = this.lay;
        if (!lay) return;
        this.stoffer.forEach(function (s) {
            if (s.status === "tilMaaler") {
                s.t = Math.min(1, s.t + dt / TIL_MAALER);
                var u = NK.blod(s.t);
                s.x = NK.lerp(s.fra.x, lay.maalX, u);
                s.y = NK.lerp(s.fra.y, lay.bordY, u) - Math.sin(u * Math.PI) * 40;
                s.h = NK.lerp(s.fra.h, lay.hi, u);
                if (s.t >= 1) { s.status = "maales"; s.t = 0; }
            } else if (s.status === "maales") {
                s.t = Math.min(1, s.t + dt / (mig.brugtSvar && s.gaet === null ? MAALER * 0.5 : MAALER));
                s.x = lay.maalX; s.y = lay.bordY; s.h = lay.hi;
                if (s.t < 0.75) {
                    var r = Math.floor(mig.tid * 18) % 140;
                    mig.visning = s.t < 0.3 ? "--,-" : K.phTekst(r / 10, 1);
                } else mig.visning = K.phTekst(s.st.ph, 1);
                if (s.t >= 1) mig.efterMaaling(s);
            } else if (s.status === "placeret" && s.flyver) {
                s.t = Math.min(1, s.t + dt / OP);
                var v = NK.blod(s.t), til = mig.skalaPos(s);
                s.x = NK.lerp(s.fra.x, til.x, v);
                s.y = NK.lerp(s.fra.y, til.y, v) - Math.sin(v * Math.PI) * 30;
                s.h = NK.lerp(s.fra.h, til.h, v);
                if (s.t >= 1) { s.flyver = false; s.fra = null; s.x = til.x; s.y = til.y; s.h = til.h; }
            } else if (s.status === "hylde" && !(mig.traek && mig.traek.s === s)) {
                var p = mig.hjemPos(s);
                s.x = NK.mod(s.x, p.x, 12, dt);
                s.y = NK.mod(s.y, p.y, 12, dt);
                s.h = NK.mod(s.h, p.h, 12, dt);
            }
        });
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig(this.rosNr);
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Elektrodens spids: i hvile over malepladsen, dykket under maalingen */
    P.elektrodeSpids = function () {
        var lay = this.lay, s = this.maaling;
        var hvile = { x: lay.maalX, y: lay.bordY - lay.hi - 18 };
        if (!s || s.status !== "maales") return hvile;
        var t = s.t, ned = lay.bordY - lay.hi * 0.42;
        var u = t < 0.25 ? NK.blod(t / 0.25) : (t > 0.85 ? 1 - NK.blod((t - 0.85) / 0.15) : 1);
        return { x: hvile.x, y: NK.lerp(hvile.y, ned, u) };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        /* Skalaen */
        var tr = this.traek;
        var over = tr && tr.flyttet && this.overSkala(tr);
        Tg.skala(ctx, lay.skala, { px: lay.px, ord: true, lys: over ? puls : (tr && tr.flyttet ? 0.35 : 0) });

        /* Stregerne fra de maalte stoffer ned til skalaen */
        this.stoffer.forEach(function (s) {
            if (s.status !== "placeret" || s.flyver) return;
            var x = Tg.skalaX(lay.skala, s.st.ph);
            ctx.save();
            ctx.globalAlpha = s.gammel ? 0.35 : 0.8;
            ctx.strokeStyle = "rgba(221, 227, 234, 0.55)";
            ctx.lineWidth = 1.3;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, s.y + 16);
            ctx.lineTo(x, lay.skala.y);
            ctx.stroke();
            ctx.restore();
        });

        /* Gaettet, mens stoffet maales */
        if (this.maaling && this.maaling.gaet !== null) Tg.gaetMaerke(ctx, lay.skala, this.maaling.gaet, { farve: "#ffffff" });

        /* Gaettet paa det valgte stof: en trekant under skalaen og en pil */
        var v = this.valgt;
        if (v && v.status === "placeret" && v.gaet !== null) {
            var gx = Tg.skalaX(lay.skala, v.gaet), rx = Tg.skalaX(lay.skala, v.st.ph);
            var dom = D.gaetDom(Math.abs(v.gaet - v.st.ph));
            var fc = dom.klasse === "god" ? "#7ee0a8" : (dom.klasse === "gul" ? "#f2c53d" : "#f0918a");
            Tg.gaetMaerke(ctx, lay.skala, v.gaet, { farve: fc });
            if (Math.abs(gx - rx) > 8) {
                ctx.save();
                ctx.strokeStyle = fc;
                ctx.lineWidth = 2;
                var yy = lay.skala.y + lay.skala.h + 20 + lay.px;
                ctx.beginPath();
                ctx.moveTo(gx, lay.skala.y + lay.skala.h + 14);
                ctx.quadraticCurveTo((gx + rx) / 2, yy + 6, rx, lay.skala.y + lay.skala.h + 3);
                ctx.stroke();
                ctx.restore();
            }
        }

        /* De maalte stoffer over skalaen */
        this.stoffer.forEach(function (s) {
            if (s.status !== "placeret") return;
            var lys = (mig.over && mig.over.slags === "placeret" && mig.over.s === s) || mig.valgt === s ? 0.8 : 0;
            Tg.stof(ctx, s.st.id, s.x, s.y, s.h, { alfa: s.gammel ? 0.5 : 1, lys: lys });
            if (!s.flyver) {
                NK.tekst(ctx, K.phTekst(s.st.ph, 1), s.x, s.y + 2, {
                    font: Tg.font("800", NK.klamp(lay.px - 1, 12, 14)), justering: "center", linje: "top",
                    farve: s.gammel ? "#a9b0ba" : "#ffffff", kant: true, kantBredde: 3
                });
            }
        });

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Malepladsen og pH-metret */
        ctx.save();
        ctx.fillStyle = "rgba(242, 197, 61, 0.14)";
        ctx.strokeStyle = "rgba(242, 197, 61, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(lay.maalX, lay.bordY + 4, lay.hi * 0.46, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        var m = lay.meter;
        var ud = Tg.phmeter(ctx, m.x, m.bund, m.h, this.visning, { lys: this.pegMeter ? puls : 0 });
        var sp = this.elektrodeSpids();

        /* Stofferne paa bordet og det, der maales */
        var navnPx = NK.klamp(lay.px, 12, 15);
        this.stoffer.forEach(function (s) {
            if (s.status !== "hylde" || (tr && tr.s === s && tr.flyttet)) return;
            var lys = (mig.over && mig.over.slags === "hylde" && mig.over.s === s) ? 0.8 : (mig.pegStoffer ? puls * 0.8 : 0);
            Tg.stof(ctx, s.st.id, s.x, s.y, s.h, { lys: lys });
            ctx.save();
            var px = NK.passendeSkrift(ctx, s.st.navn, lay.plads - 4, navnPx, 11, "700");
            ctx.restore();
            Tg.navn(ctx, s.st.navn, s.x, lay.bordY + 16, px);
        });
        this.stoffer.forEach(function (s) {
            if (s.status === "tilMaaler" || s.status === "maales" || (s.status === "placeret" && s.flyver && s.t < 0.02)) {
                Tg.stof(ctx, s.st.id, s.x, s.y, s.h);
            }
        });
        Tg.elektrode(ctx, ud, sp.x, sp.y, NK.klamp(lay.hi * 0.55, 30, 64));
        if (this.maaling && this.maaling.status === "maales") {
            Tg.navn(ctx, this.maaling.st.navn, lay.maalX, lay.bordY + 16, navnPx);
        }

        /* Pilen viser vejen, saa laenge intet er maalt paa hylde 1 */
        if (!tr && !this.maaling && this.hylde === 0 && !this.antalMaalt()) {
            var f = this.denneHylde()[0];
            if (f && f.status === "hylde") {
                var mx = Tg.skalaX(lay.skala, 4);
                Tg.buePil(ctx, f.x, f.y - f.h - 6, mx, lay.skalaBund + 6, this.tid, (f.x + mx) / 2 - 20, lay.skalaBund + 20);
            }
        }

        /* Det, der traekkes, og gaettet under det */
        if (tr && tr.flyttet) {
            var ph = this.gaetVed(tr.x);
            if (over) {
                var gx2 = Tg.skalaX(lay.skala, ph);
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(gx2, lay.skala.y - 4);
                ctx.lineTo(gx2, lay.skala.y + lay.skala.h + 4);
                ctx.stroke();
                ctx.restore();
                Tg.gaetMaerke(ctx, lay.skala, ph, { farve: "#ffffff" });
                Tg.maerkat(ctx, gx2, lay.skala.y - 16, "Gæt: pH " + K.phTekst(ph, 1), { farve: "#f2c53d", px: 14 });
            }
            var th = over ? lay.ikonH * 1.25 : lay.hi;
            Tg.stof(ctx, tr.s.st.id, tr.x, tr.y + th * 0.45, th, { lys: over ? 1 : 0 });
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    P.gaetVed = function (x) {
        var ph = Tg.skalaPh(this.lay.skala, x);
        return Math.round(ph * 10) / 10;
    };

    /* Over skalaen: fra toppen af banerne til lidt under tallene */
    P.overSkala = function (pt) {
        var lay = this.lay;
        return pt.x >= lay.skala.x0 - 20 && pt.x <= lay.skala.x1 + 20 && pt.y >= lay.luft - 10 && pt.y <= lay.skalaBund + 24;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var i, s;
        for (i = this.stoffer.length - 1; i >= 0; i--) {
            s = this.stoffer[i];
            if (s.status !== "hylde") continue;
            var b = Tg.stofBredde(s.h);
            if (Math.abs(pt.x - s.x) <= b / 2 && pt.y <= s.y + 4 && pt.y >= s.y - s.h) return { slags: "hylde", s: s };
        }
        for (i = this.stoffer.length - 1; i >= 0; i--) {
            s = this.stoffer[i];
            if (s.status !== "placeret" || s.flyver) continue;
            var b2 = Tg.stofBredde(s.h);
            if (Math.abs(pt.x - s.x) <= b2 / 2 + 2 && pt.y <= s.y + 18 && pt.y >= s.y - s.h) return { slags: "placeret", s: s };
        }
        var m = lay.meter;
        if (Math.abs(pt.x - m.x) <= m.b / 2 && pt.y <= m.bund && pt.y >= m.bund - m.h) return { slags: "meter" };
        var sk = lay.skala;
        if (pt.x >= sk.x0 && pt.x <= sk.x1 && pt.y >= sk.y - 4 && pt.y <= lay.skalaBund) return { slags: "skala" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.hvadErUnder(pt);
            if (!u || u.slags !== "hylde") return;
            mig.traek = { s: u.s, start: pt, x: pt.x, y: pt.y, flyttet: false };
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                tr.x = pt.x;
                tr.y = pt.y;
                if (!tr.flyttet && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 6) {
                    if (mig.maaling) {
                        mig.traek = null;
                        mig.besked("Vent, til pH-metret er færdigt.", "gul");
                        return;
                    }
                    tr.flyttet = true;
                }
                if (tr.flyttet) mig.visStatus();
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            c.style.cursor = mig.over ? (mig.over.slags === "hylde" ? "grab" : (mig.over.slags === "skala" ? "default" : "pointer")) : "default";
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.traek = null; mig.visStatus(); });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            mig.traek = null;
            if (tr && tr.flyttet) {
                if (mig.overSkala(pt) && !mig.maaling) {
                    mig.gaet(tr.s, mig.gaetVed(pt.x), { x: pt.x, y: pt.y + mig.lay.ikonH * 0.56, h: mig.lay.ikonH * 1.25 });
                } else {
                    tr.s.x = pt.x;
                    tr.s.y = pt.y + mig.lay.hi * 0.45;
                    mig.besked("Slip stoffet over skalaen, der hvor du tror, det hører til.", "gul");
                }
                mig.visStatus();
                return;
            }
            mig.klik(pt);
        });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "hylde" || u.slags === "placeret") { this.vaelg(u.s); return; }
        if (u.slags === "meter") {
            this.besked("pH-metret måler de stoffer, du slipper på skalaen.", "");
            return;
        }
        if (u.slags === "skala") {
            this.besked("Under 7 er surt, 7 er neutralt, og over 7 er basisk. Træk et stof herop.", "");
        }
    };

    P.enter = function () {
        if (this.naaet) this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.2-intro-skala", tilbud: "skala-tilbud", spring: "skala-spring" });

    /* Mens han siger, at man traekker stofferne op, lyser de */
    P.pegPaaFelt = function (til) { this.pegStoffer = til; };

    NK.SimSkala = SimSkala;
}());
