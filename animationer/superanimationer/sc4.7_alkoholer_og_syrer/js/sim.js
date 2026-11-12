/* =====================================================================
   sim.js - de tre faner

   Alle tre faner har byggepladen til venstre (js/plade.js) og noget,
   der viser stoffets egenskaber, til hoejre:
     n  Navnet         navnemaskinen
     k  Kogepunktet    termometeret og luppen over det rene stof
     v  I vand         reagensglasset med vand og luppen med ét molekyle i vand

   Laasen (js/fane.js): eleven kan kun bygge, mens kortet viser et
   forsoeg, og kun det, forsoeget tillader (styr: "gruppe" og "laengde").
   Skifteren Alle atomer / Zigzag virker altid, for den viser blot det
   samme molekyle paa en anden maade.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    function SimStof(cfg) {
        this.cfg = cfg;
        this.g = "H";
        this.n = 2;
        this.plade = new NK.Plade();
        if (cfg.navn === "k") { this.termo = new NK.Termometer(); this.lup = new NK.Lup("rent"); }
        if (cfg.navn === "v") { this.glas = new NK.Glas(); this.lup = new NK.Lup("vand"); }
        this.over = null;
        this.traek = null;
        this.sete = {};
        this.olLaengder = {};
        this.skema = NK.hent("nk-sc4.7-skema-" + cfg.navn, {}) || {};
        this.startFane(cfg.maal);
        this.visPanel();
    }

    var P = SimStof.prototype;

    function lav(cfg) {
        function Sim() { SimStof.call(this, cfg); }
        Sim.prototype = Object.create(P);
        Sim.prototype.constructor = Sim;
        NK.Fane.paa(Sim.prototype, { navn: cfg.navn, naesteFane: cfg.naesteFane, naesteNavn: cfg.naesteNavn });
        Sim.prototype.kortZone = P.maaltKortZone;
        return Sim;
    }

    P.stofNu = function () { return D.stof(this.g, this.n); };

    /* Saet molekylet uden at det taeller som elevens skift */
    P.saetMolekyle = function (g, n, straks) {
        this.g = g;
        this.n = g === "glycerol" ? 3 : NK.klamp(n, 0, D.maksN(g));
        var s = this.stofNu();
        this.plade.saet(s, straks);
        if (this.termo) this.termo.saet(s, straks);
        if (this.glas) this.glas.saet(s, straks);
        if (this.lup) this.lup.saet(s, this.lupStof2(), straks);
    };

    /* Det stof, luppen sammenligner med i en del (lupSammen), ellers intet */
    P.lupStof2 = function () {
        var del = this.opg && this.opg.del;
        if (!del || !del.lupSammen || this.erForsoeg()) return null;
        return D.stof(del.lupSammen.g, del.lupSammen.n);
    };

    /* ----- Maalene ------------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.sete = {};
        this.olLaengder = {};
        this.traek = null;
        this.saetMolekyle(o.start.g, o.start.n, true);
        this.noter(this.stofNu());
        if (this.status) this.registrer();
    };

    P.nyFase = function () {
        if (this.lup) this.lup.saet(this.stofNu(), this.lupStof2());
    };

    P.efterDel = function () { this.registrer(); this.visPanel(); };
    P.efterOpgave = function () { this.registrer(); this.visPanel(); };

    P.nulstilScene = function () {
        if (!this.iForsoeg()) { this.kortBlink(); return; }
        this.nyOpgave(this.opg.o);
        this.visIndsend();
    };

    /* Er x skjult lige nu? Kun mens delen, der spoerger om det, staar aaben. */
    P.skjult = function (x) {
        if (!this.opg || this.faerdig || this.venter) return false;
        return (this.opg.del.skjul || []).indexOf(x) >= 0;
    };

    /* Det, eleven har set: til forsoegene og skemaet i panelet */
    P.noter = function (s) {
        this.sete[s.id] = true;
        if (s.g === "OH" && s.n > 0) this.olLaengder[s.n] = true;
    };

    /* Eleven har bygget noget nyt */
    P.skift = function (g, n) {
        var maks = D.maksN(g);
        n = NK.klamp(n, 0, maks);
        if (g === this.g && n === this.n) return false;
        this.saetMolekyle(g, n);
        var s = this.stofNu();
        this.noter(s);
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt") this.naesteLinje("", "");
        if (!s.organisk && D.PAASKE[s.id] && this.cfg.navn !== "n") this.kortBesked(D.PAASKE[s.id], 6, "peger");
        this.tjekForsoeg();
        this.visIndsend();
        this.registrer();
        this.visPanel();
        return true;
    };

    /* Et forsoeg uden Indsend svar er klaret, naar eleven har set det, det
       beder om */
    P.tjekForsoeg = function () {
        if (!this.iForsoeg()) return;
        var del = this.opg.del, s = this.stofNu();
        if (del.indsend) return;
        var ok = false;
        if (del.maal === "ol_laengder") ok = s.g === "OH" && Object.keys(this.olLaengder).length >= 3;
        else if (del.maal === "cooh") ok = s.g === "COOH";
        else if (del.maal === "tre_c2") ok = !!(this.sete.alkan2 && this.sete.alkohol2 && this.sete.carboxylsyre2);
        else if (del.maal === "to_lag") ok = s.g === "OH" && s.opl === "nej" && s.tilstand === "væske";
        if (ok) this.forsoegKlaret();
    };

    /* Vis svaret: molekylet bygges for eleven */
    P.forsoegSvar = function (o, del) {
        if (del.maal === "ol_laengder") { this.olLaengder = { 1: true, 2: true, 3: true }; }
        if (del.maal === "tre_c2") { this.sete.alkan2 = this.sete.alkohol2 = this.sete.carboxylsyre2 = true; }
        if (del.svarStof) this.saetMolekyle(del.svarStof.g, del.svarStof.n);
        else if (del.maal === "ol_laengder") this.saetMolekyle("OH", 3);
        else if (del.maal === "cooh") this.saetMolekyle("COOH", this.n);
        this.noter(this.stofNu());
        this.visPanel();
        return del.setFn ? del.setFn(this.stofNu()) : del.set;
    };

    /* ----- Indsend svar: molekylet ------------------------------------------------------ */
    P.kanIndsendes = function () { return !this.traek; };
    P.indsendTekst = function () { return "Indsend molekylet"; };
    P.ikkeKlar = function () { return "Slip gruppen først."; };

    P.forsoegIndsend = function () {
        var del = this.opg.del, s = this.stofNu();
        var fejl = del.tjek ? del.tjek(s) : null;
        if (fejl) { this.fejlLinje(fejl); return; }
        this.forsoegKlaret(del.setFn ? del.setFn(s) : del.set);
        this.visPanel();
    };

    /* Kortet: listen over de tre stoffer, eleven skal bygge (fane 2, opgave 1) */
    P.kortEkstra = function () {
        if (!this.opg || this.opg.del.maal !== "tre_c2" || this.faerdig || this.venter) return "";
        var mig = this;
        var html = '<span class="sk-tjek">';
        [["alkan2", "ethan"], ["alkohol2", "ethanol"], ["carboxylsyre2", "ethansyre"]].forEach(function (p) {
            var ok = !!mig.sete[p[0]];
            html += '<span class="tj' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + p[1] + "</span>";
        });
        return html + "</span>";
    };

    /* ----- Panelet: skemaet med det, eleven har set ------------------------------------------ */
    P.registrer = function () {
        var s = this.stofNu();
        if (!s.organisk || s.id === "glycerol") return;
        var vist = false;
        if (this.cfg.navn === "k") vist = true;
        if (this.cfg.navn === "v") vist = !this.skjult("glas");
        if (!vist || this.skema[s.id]) return;
        this.skema[s.id] = 1;
        NK.gem("nk-sc4.7-skema-" + this.cfg.navn, this.skema);
        this.visPanel();
    };

    P.visPanel = function () {
        var id = this.cfg.navn + "-skema";
        if (!NK.el(id) || !this.status) return;
        var mig = this, nu = this.stofNu();
        var html = '<table class="gitter"><thead><tr><th></th>';
        for (var c = 1; c <= 8; c++) html += "<th>" + c + "</th>";
        html += "</tr></thead><tbody>";
        [["H", "Alkan"], ["OH", "Alkohol"], ["COOH", "Syre"]].forEach(function (r) {
            html += '<tr><th class="raekke">' + r[1] + "</th>";
            for (var c = 1; c <= 8; c++) {
                var s = D.stof(r[0], r[0] === "COOH" ? c - 1 : c);
                var kendt = !!mig.skema[s.id];
                var erNu = nu.id === s.id && !mig.skjult("glas");
                var kl = [];
                var indhold = "";
                if (kendt) {
                    if (mig.cfg.navn === "k") {
                        indhold = s.kp < 0 ? "−" + Math.abs(s.kp) : String(s.kp);
                        kl.push(s.tilstand === "gas" ? "gas" : "vaeske");
                    } else {
                        var nk = D.oplNoegle(s);
                        indhold = { ja: "ja", delvist: "delvis", nej: "nej", gas: "gas", vand: "" }[nk];
                        kl.push("o-" + nk);
                    }
                }
                if (erNu) kl.push("nu");
                html += '<td class="' + kl.join(" ") + '" title="' + NK.html(s.Navn) + '">' + indhold + "</td>";
            }
            html += "</tr>";
        });
        html += "</tbody></table>";
        NK.saetHTML(id, html);
    };

    /* ----- Kortets plads -------------------------------------------------------------------
       Kortet staar oeverst, og scenen begynder under det. Pladsen er det
       hoejeste, kortet kan blive paa fanen: hver del af hver opgave med det
       laengste hint eller den laengste forklaring, maalt i en usynlig kopi
       af kortet i samme bredde. Saa flytter intet sig, naar kortet skifter. */
    P.maaltKortZone = function () {
        var e = this.el && this.el.skort;
        if (!e || !e.parentNode || !this.opgaver) return 150;
        var noegle = e.parentNode.clientWidth + "x" + window.innerHeight + (document.fonts && document.fonts.status === "loaded" ? "f" : "");
        if (this.zone && this.zoneNoegle === noegle) return this.zone;
        if (!e.parentNode.clientWidth) return 150;
        var mig = this;
        var kopi = e.cloneNode(true);
        kopi.removeAttribute("id");
        Array.prototype.forEach.call(kopi.querySelectorAll("[id]"), function (x) { x.removeAttribute("id"); });
        kopi.style.visibility = "hidden";
        kopi.style.pointerEvents = "none";
        kopi.classList.remove("blink");
        e.parentNode.appendChild(kopi);
        var ind = kopi.querySelector(".sk-ind"), bund = kopi.children[1];
        var besked = bund.querySelector(".st-tekst"), knap = bund.querySelector(".knap.hjaelp"), indsend = bund.querySelector(".knap.indsend");
        var gem = { opg: this.opg, faerdig: this.faerdig, venter: this.venter, slut: this.slut, mellem: this.mellem, nr: this.nr };
        var hoejst = 0;
        var klik = [D.gruppeLaast, D.laengdeLaast, D.PAASKE.vand, D.PAASKE.dihydrogen, D.trakForbi, D.laengst];
        function laengste(liste) { return liste.reduce(function (a, b) { return (b || "").length > a.length ? b : a; }, ""); }
        this.opgaver.forEach(function (o, i) {
            mig.nr = i;
            o.dele.forEach(function (del, fi) {
                mig.opg = { o: o, fi: fi, del: del, forkert: {}, rigtig: undefined, valgt: null, valgte: {} };
                /* Aaben: opgaven med det laengste hint eller den laengste forklaring */
                mig.faerdig = false; mig.venter = false;
                var tekster = (del.hint || []).map(function (h, k) { return "Hint " + (k + 1) + " af 3 " + h; });
                (del.svar || []).forEach(function (sv) { if (sv.f) tekster.push("Ikke endnu " + sv.f); });
                if (del.tjek) [["H", 0], ["H", 8], ["OH", 0], ["OH", 1], ["OH", 4], ["OH", 8], ["COOH", 0], ["COOH", 3], ["COOH", 7]].forEach(function (p) {
                    var f = del.tjek(D.stof(p[0], p[1]));
                    if (f) tekster.push("Ikke endnu " + f);
                });
                tekster = tekster.concat(klik);
                kopi.className = "scenekort " + (del.type === "spm" ? "spm" : "opgave");
                ind.innerHTML = mig.kortHTML();
                bund.hidden = false;
                knap.hidden = false;
                indsend.hidden = !(del.type === "spm" || del.indsend);
                besked.hidden = false;
                besked.textContent = laengste(tekster);
                hoejst = Math.max(hoejst, kopi.offsetHeight);
                /* Klaret: kortet bliver paa opgaven med forklaringen og Naeste */
                var sidst = fi === o.dele.length - 1;
                mig.faerdig = sidst; mig.venter = !sidst;
                var tekst = sidst ? (o.loest || "") + " " + (D.FAERDIG[mig.navn] || "") : (del.godt || del.set || "");
                if (del.setFn) tekst = del.setFn(D.stof("COOH", 7));
                if (del.svar) mig.opg.rigtig = 0;
                mig.slut = mig.mellem = { maade: "selv", tekst: tekst };
                kopi.className = "scenekort loest bliver";
                ind.innerHTML = mig.blivHTML(mig.slut);
                bund.hidden = true;
                hoejst = Math.max(hoejst, kopi.offsetHeight);
            });
        });
        for (var k in gem) if (Object.prototype.hasOwnProperty.call(gem, k)) this[k] = gem[k];
        kopi.parentNode.removeChild(kopi);
        this.zone = Math.max(64, Math.ceil(hoejst) + 2);
        this.zoneNoegle = noegle;
        return this.zone;
    };

    /* ----- Scenen ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var top = 10 + this.kortZone() + 10;
        var bund = H - 12;
        lay.top = top;
        var navn = this.cfg.navn;
        var pladeAndel = navn === "n" ? 0.58 : (W < 900 ? 0.44 : 0.46);
        var pb = Math.round(Math.max(340, Math.min(W * pladeAndel, 620)));
        /* Pladen bliver ikke hoejere end 560 px, saa molekylet, knapperne og
           hylden staar samlet */
        lay.plade = { x: 12, y: top, b: pb, h: Math.min(bund - top, 560) };
        this.plade.layout(lay.plade, { visNavn: navn !== "n" });
        var hx = lay.plade.x + pb + 16, hb = W - 12 - hx;
        if (navn === "n") {
            lay.maskine = { x: hx, y: top, b: hb, h: lay.plade.h };
        } else {
            var ib = navn === "k" ? Math.min(150, Math.max(120, hb * 0.27)) : Math.min(180, Math.max(150, hb * 0.32));
            lay.instr = { x: hx, y: top, b: ib, h: bund - top };
            var lx = hx + ib + 14, lb = W - 12 - lx;
            var lTop = top + 26, lBund = bund - 52;
            var lh = Math.min(lBund - lTop, Math.max(200, lb * 0.95));
            lay.lup = { x: lx, y: lTop + Math.max(0, (lBund - lTop - lh) / 2), b: lb, h: lh };
        }
        this.lay = lay;
        this.saetAnker("plade", lay.plade.x, lay.plade.y, lay.plade.b, lay.plade.h);
        var pr = this.plade.r;
        this.saetAnker("hylde", pr.hylde.x, pr.hylde.y, pr.hylde.b, pr.hylde.h);
        this.saetAnker("kontrol", pr.minus.x, pr.minus.y, pr.plus.x + pr.plus.b - pr.minus.x, pr.minus.h);
        this.saetAnker("stil", pr.stilAlle.x, pr.stilAlle.y, pr.stilZig.x + pr.stilZig.b - pr.stilAlle.x, pr.stilAlle.h);
        if (lay.maskine) this.saetAnker("maskine", lay.maskine.x, lay.maskine.y, lay.maskine.b, lay.maskine.h);
        if (lay.instr) this.saetAnker("instr", lay.instr.x, lay.instr.y, lay.instr.b, lay.instr.h);
        if (lay.lup) this.saetAnker("lup", lay.lup.x, lay.lup.y - 26, lay.lup.b, lay.lup.h + 70);
    };

    P.opdaterScene = function (dt) {
        /* Skriften Lexend kan komme, efter kortet er maalt: maal igen */
        var e = this.el.skort;
        if (this.zoneNoegle && e && e.parentNode.clientWidth &&
            this.zoneNoegle !== e.parentNode.clientWidth + "x" + window.innerHeight + (document.fonts && document.fonts.status === "loaded" ? "f" : "")) this.layout();
        this.plade.opdater(dt);
        if (this.termo) this.termo.opdater(dt);
        if (this.glas) this.glas.opdater(dt);
        if (this.lup) {
            this.lup.saet(this.stofNu(), this.lupStof2());
            this.lup.opdater(dt);
        }
        this.registrer();
    };

    /* Det skilt, der viser, hvad eleven skal goere, i et forsoeg uden Indsend */
    P.skiltNu = function () {
        if (!this.iForsoeg() || this.traek) return null;
        var del = this.opg.del, s = this.stofNu();
        if (del.indsend) return null;
        if (del.maal === "ol_laengder") return s.g !== "OH" ? { tile: "OH" } : { plus: true };
        if (del.maal === "cooh") return { tile: "COOH" };
        if (del.maal === "to_lag") return { plus: true };
        return null;
    };

    P.laasNu = function () {
        var del = this.opg && this.opg.del;
        if (!this.iForsoeg() || !del) return { gruppe: true, laengde: true };
        var styr = del.styr || [];
        return { gruppe: styr.indexOf("gruppe") < 0, laengde: styr.indexOf("laengde") < 0 };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var om = this.omNu(), s = this.stofNu();

        this.plade.tegn(ctx, {
            over: this.over, traek: this.traek, laas: this.laasNu(), tid: this.tid,
            skjulNavn: this.skjult("navn"), om: om
        });

        var sk = this.skiltNu(), pr = this.plade.r;
        if (sk && sk.tile) {
            var t = pr.tiles[sk.tile];
            Tg.ring(ctx, t.x, t.y, t.b, t.h, this.tid, 10);
            Tg.skilt(ctx, "Træk hen på kæden", t.x + t.b / 2, t.y - 4, lay.plade.x + 4, lay.plade.x + lay.plade.b - 4);
        } else if (sk && sk.plus) {
            Tg.ring(ctx, pr.plus.x, pr.plus.y, pr.plus.b, pr.plus.h, this.tid, 10);
            /* Under knappen, saa det ikke daekker navnet over den */
            Tg.skiltUnder(ctx, "Klik: længere kæde", pr.plus.x + pr.plus.b / 2, pr.plus.y + pr.plus.h + 2, lay.plade.x + 4, lay.plade.x + lay.plade.b - 4);
        }

        if (lay.maskine) {
            NK.tegnNavnemaskine(ctx, lay.maskine, s, { skjult: this.skjult("navn") });
            if (om.indexOf("navn") >= 0) Tg.omRing(ctx, lay.maskine.x, lay.maskine.y, lay.maskine.b, lay.maskine.h);
        }
        if (this.termo) {
            var tr = this.termo.tegn(ctx, lay.instr, { skjult: this.skjult("termo") });
            if (om.indexOf("termo") >= 0 && tr) Tg.omRing(ctx, tr.x, tr.y, tr.b, tr.h);
        }
        if (this.glas) {
            var gr = this.glas.tegn(ctx, lay.instr, { skjult: this.skjult("glas") });
            if (om.indexOf("glas") >= 0 && gr) Tg.omRing(ctx, gr.x, gr.y, gr.b, gr.h);
        }
        if (this.lup) this.tegnLup(ctx, lay.lup, om.indexOf("lup") >= 0);
        this.tegnSejr(ctx, lay.W, lay.H);
    };

    P.tegnLup = function (ctx, R, fremhaev) {
        var s = this.stofNu(), s2 = this.lupStof2();
        Tg.zoomRamme(ctx, R, null, fremhaev);
        this.lup.tegn(ctx, R);
        var titel;
        if (this.lup.slags === "vand") titel = s.id === "vand" ? "Luppen: vandmolekyler" : "Luppen: ét molekyle " + s.navn + " i vand";
        else if (s2) titel = "Luppen: " + s.navn + " og " + s2.navn + " som væsker";
        else titel = "Luppen: " + s.navn + " som væske";
        NK.tekst(ctx, titel, R.x + 2, R.y - 10, { font: Tg.font("700", Tg.passer(ctx, titel, R.b - 4, "700", 15, 11)), farve: "#e6eaef" });
        this.tegnSignatur(ctx, R.x, R.y + R.h + 20, R.b);
    };

    /* Signaturen under luppen: hvad de stiplede linjer og de gyldne flader er */
    P.tegnSignatur = function (ctx, x, y, b) {
        var dele = [{ slags: "hb", t: "hydrogenbinding: H tiltrækker O" }];
        if (this.lup.slags === "rent") dele.push({ slags: "kontakt", t: "kontaktflade" });
        ctx.save();
        ctx.textAlign = "left";
        ctx.font = Tg.font("600", 12.5);
        var samlet = dele.reduce(function (s, d) { return s + 34 + ctx.measureText(d.t).width + 18; }, 0);
        var px = 12.5, toLinjer = false;
        if (samlet > b) { px = Math.max(11, 12.5 * b / samlet); ctx.font = Tg.font("600", px); }
        if (dele.reduce(function (s, d) { return s + 34 + ctx.measureText(d.t).width + 18; }, 0) > b) toLinjer = true;
        var xx = x;
        dele.forEach(function (d, i) {
            if (toLinjer && i > 0) { xx = x; y += 17; }
            if (d.slags === "hb") {
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.lineWidth = 2.5;
                ctx.lineCap = "round";
                ctx.strokeStyle = NK.Kugler.HB_FARVE;
                ctx.beginPath(); ctx.moveTo(xx, y - 4); ctx.lineTo(xx + 26, y - 4); ctx.stroke();
                ctx.restore();
            } else {
                NK.rundtRekt(ctx, xx, y - 8, 26, 8, 4);
                ctx.fillStyle = "#f5a623";
                ctx.fill();
            }
            ctx.fillStyle = "#c3c9d2";
            ctx.textBaseline = "middle";
            ctx.fillText(d.t, xx + 32, y - 3);
            xx += 34 + ctx.measureText(d.t).width + 18;
        });
        ctx.restore();
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var h = this.plade.hit(pt);
        if (h) return h;
        if (this.lay && this.lay.lup && Tg.inde(this.lay.lup, pt)) return "lup";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        if (!this.over || this.over === "formel" || this.over === "lup") return null;
        if (this.over.indexOf("tile:") === 0) return "greb";
        return "klik";
    };

    /* Maa eleven roere hvad ("gruppe" eller "laengde") lige nu? */
    P.maa = function (hvad) {
        if (this.spaer()) return false;
        var styr = this.opg.del.styr || [];
        if (styr.indexOf(hvad) < 0) {
            this.kortBesked(hvad === "gruppe" ? D.gruppeLaast : D.laengdeLaast, 5);
            this.kortBlink();
            return false;
        }
        return true;
    };

    P.nedScene = function (pt) {
        var h = this.hvad(pt);
        if (!h || h.indexOf("tile:") !== 0) return false;
        if (!this.maa("gruppe")) return false;
        var g = h.slice(5);
        this.traek = { g: g, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y, flyttet: false };
        return true;
    };

    P.flytScene = function (pt) {
        if (!this.traek) return;
        this.traek.x = pt.x;
        this.traek.y = pt.y;
        if (Math.abs(pt.x - this.traek.x0) + Math.abs(pt.y - this.traek.y0) > 6) this.traek.flyttet = true;
    };

    P.opScene = function (pt) {
        var t = this.traek;
        if (!t) return;
        this.traek = null;
        /* Et klik paa gruppen eller et slip ved kaeden saetter gruppen paa */
        if (!t.flyttet || this.plade.slipOmraade(pt)) {
            if (!this.skift(t.g, this.n) && t.g === this.g) this.kortBesked("Gruppen " + (t.g === "H" ? "−H" : "−" + t.g) + " sidder allerede på kæden.", 3);
        } else this.kortBesked(D.trakForbi, 4);
        this.visIndsend();
    };

    P.klikScene = function (pt) {
        var h = this.hvad(pt);
        if (!h) return;
        if (h === "stil:alle" || h === "stil:zigzag") {
            NK.formelStil = h.slice(5);
            NK.gem("nk-sc4.7-stil", NK.formelStil);
            return;
        }
        if (h === "minus" || h === "plus") this.laengde(h === "plus" ? 1 : -1);
        else if (h === "formel" && !this.iForsoeg()) this.kortBlink();
    };

    P.laengde = function (d) {
        if (!this.maa("laengde")) return;
        var n = this.n + d;
        if (n < 0) { this.kortBesked(D.kortest, 3); return; }
        if (n > D.maksN(this.g)) { this.kortBesked(D.laengst, 4); return; }
        this.skift(this.g, n);
    };

    /* Piletasterne goer kaeden kortere og laengere, Enter indsender */
    P.tast = function (e) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "+" || e.key === "-") {
            this.laengde(e.key === "ArrowRight" || e.key === "+" ? 1 : -1);
            return true;
        }
        if (e.key === "Enter") {
            if (this.faerdig || this.venter) { this.knap(); return true; }
            this.indsendKlik();
            return true;
        }
        return false;
    };

    NK.SimNavn = lav({ navn: "n", maal: D.N_MAAL, naesteFane: "fane-k", naesteNavn: "Kogepunktet" });
    NK.SimKoge = lav({ navn: "k", maal: D.K_MAAL, naesteFane: "fane-v", naesteNavn: "I vand" });
    NK.SimVand = lav({ navn: "v", maal: D.V_MAAL });
}());
