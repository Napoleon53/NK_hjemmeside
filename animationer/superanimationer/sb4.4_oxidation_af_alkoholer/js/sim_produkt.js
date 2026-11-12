/* =====================================================================
   sim_produkt.js - fane 2: Hvad dannes?

   Ti alkoholer som zigzagformler. Hver opgave har to spoergsmaal:
     type     primaer, sekundaer eller tertiaer? (svar paa kortet)
     produkt  hvad dannes ved oxidationen? Fire svar staar som formler
              nederst paa tavlen: aldehydet, ketonen og carboxylsyren med
              samme carbonskelet og "Ingen reaktion". Eleven klikker paa
              et af dem og trykker Indsend svar
   Begge bedoemmes foerst ved Indsend svar. Det rigtige produkt regnes af
   modellen (K.produkt i kemi.js), og selvtesten tjekker, at det er det
   samme som svaret i data.js.

   Glasset over pilen er oxidationsmidlet i sur opløsning: dichromat
   (orange til groent) eller permanganat (violet til farveloest), som i
   bogens afsnit B4.3. Mild oxidation er med dichromat, kraftig med
   permanganat. Ved en tertiaer alkohol skifter glasset ikke farve.
   Svarene nederst paa tavlen kommer foerst frem, naar typen er fundet.

   Panelet viser opgaverne og en tabel, der fyldes ud, efterhaanden som
   eleven loeser en opgave af hver slags.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.3-opgaver";

    var GUL = "#d69e0c", GUL_FYLD = "rgba(242, 197, 61, 0.22)";
    var TEAL = "#0f8a8a";
    var GROEN = "#2b9a5e", ROED = "#c8402f";

    /* Glassene tegnes som billeder (sprites/) */
    var GLAS = {};
    ["orange", "groen", "violet", "farveloes"].forEach(function (f) {
        GLAS[f] = new Image();
        GLAS[f].src = "sprites/reagensglas_" + f + ".svg";
    });

    /* Raekkerne i tabellen "Det har du fundet" */
    var RAEKKER = [
        { id: "primaer-mild", type: "primaer", maade: "mild", tekst: "Primær, mild", klasse: "aldehyd" },
        { id: "primaer-kraftig", type: "primaer", maade: "kraftig", tekst: "Primær, kraftig", klasse: "carboxylsyre" },
        { id: "sekundaer", type: "sekundaer", tekst: "Sekundær", klasse: "keton" },
        { id: "tertiaer", type: "tertiaer", tekst: "Tertiær", klasse: null }
    ];

    function raekkeFor(o) {
        var type = o.alk.type;
        if (type === "primaer") return type + "-" + (o.o.maade || "kraftig");
        return type;
    }

    function SimProdukt() {
        var mig = this;
        this.opgaver = D.OPGAVER.map(function (o, i) {
            var alk = K.alkohol(o.alkohol);
            return { nr: i, o: o, id: o.alkohol + (o.maade ? "-" + o.maade : ""), niv: o.niv, alk: alk, produkt: K.produkt(alk, o.maade) };
        });
        this.hentStatus();
        this.glasT = 0;
        this.startFane();
        this.bygListe();
        NK.el("p-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("p-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimProdukt.prototype;
    F.paa(P, "p");

    /* ----- Hukommelsen ----------------------------------------------------------- */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var g = gemt[o.id] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.opgaver[i].id] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet --------------------------------------------------------------- */
    P.bygListe = function () {
        var mig = this, html = "";
        [1, 2, 3].forEach(function (niv) {
            html += '<div class="opg-gruppe"><div class="opg-hoved"><span>' + D.NIVEAUER[niv - 1] +
                '</span><span class="opg-tal" id="p-gt-' + niv + '"></span></div><div class="opg-chips">';
            mig.opgaver.forEach(function (o, i) {
                if (o.niv !== niv) return;
                html += '<button type="button" class="opg-chip" data-opg="' + i + '" title="' + NK.html(o.o.alkohol) + '">' +
                    '<span class="oc-f">' + (i + 1) + '</span><i class="oc-m"></i></button>';
            });
            html += "</div></div>";
        });
        NK.el("p-liste").innerHTML = html;
        NK.saetTekst("p-ialt", String(this.opgaver.length));
    };

    P.visListe = function () {
        var mig = this, pr = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
        var chips = NK.el("p-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        this.opgaver.forEach(function (o, i) {
            pr[o.niv][1]++;
            if (mig.status[i].loest) pr[o.niv][0]++;
        });
        [1, 2, 3].forEach(function (niv) { NK.saetTekst("p-gt-" + niv, pr[niv][0] + "/" + pr[niv][1]); });
        NK.saetTekst("p-loest", String(this.antalLoest()));
        this.visTabel();
    };

    /* Tabellen fyldes ud, naar eleven har loest en opgave af hver slags */
    P.visTabel = function () {
        var mig = this, kendt = {}, html = "";
        this.opgaver.forEach(function (o, i) { if (mig.status[i].loest) kendt[raekkeFor(o)] = true; });
        RAEKKER.forEach(function (r) {
            var kl = r.klasse ? D.KLASSER[r.klasse] : null;
            html += '<div class="fund-raekke' + (kendt[r.id] ? " kendt" : "") + '"><span class="fr-type">' + NK.html(r.tekst) + '</span><span class="fr-pil">→</span>';
            if (!kendt[r.id]) html += '<span class="fr-svar ukendt">?</span>';
            else if (kl) html += '<span class="fr-svar" style="--klassefarve:' + kl.farve + '">' + NK.html(kl.navn) + "</span>";
            else html += '<span class="fr-svar ingen">ingen reaktion</span>';
            html += "</div>";
        });
        NK.saetHTML("p-fundet", html);
    };

    /* ----- En opgave ------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.alk = this.opg.alk;
        this.fase = "type";
        this.valgt = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.visNaboer = false;
        this.overValg = -1;
        this.glasT = 0;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.alkNavn = function () { return D.stor(this.alk.navn); };

    P.kortData = function () {
        var mig = this, navn = this.alk.navn;
        if (this.fase === "type") {
            return {
                slags: "spm", chip: "Opgave " + (this.nr + 1),
                tekst: "Hvilken type alkohol er " + navn + "? Vælg, og tryk Indsend svar.",
                svar: D.TYPE_ORDEN.map(function (t, j) { return { t: D.TYPER[t].Navn, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
            };
        }
        var m = this.opg.o.maade, tekst;
        if (m) tekst = D.MAADE[m].tekst + " Hvad bliver " + navn + " til?";
        else tekst = navn.charAt(0).toUpperCase() + navn.slice(1) + " oxideres med " + D.MIDLER[this.opg.o.middel].navn + ". Hvad dannes?";
        return {
            slags: "opgave", chip: "Opgave " + (this.nr + 1),
            tekst: tekst + " Klik på svaret på tavlen, og tryk Indsend svar."
        };
    };

    P.svarValg = function (j) {
        if (this.fase !== "type") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.valgt !== null; };

    P.indsendTekst = function () {
        if (this.valgt === null) return "Indsend svar";
        if (this.fase === "type") return "Indsend svar: " + D.TYPER[D.TYPE_ORDEN[this.valgt]].navn;
        var v = this.opg.o.valg[this.valgt];
        return "Indsend svar: " + (v || "ingen reaktion");
    };

    P.ingentingTekst = function () {
        return this.fase === "type" ? "Vælg en type på kortet først." : "Klik på et af de fire svar nederst på tavlen først.";
    };

    P.indsend = function () {
        if (this.fase === "type") this.indsendType(false);
        else this.indsendProdukt(false);
    };

    P.indsendType = function (vist) {
        var nr = this.valgt, rigtig = D.TYPE_ORDEN.indexOf(this.alk.type), n = K.cNaboer(this.alk.mol, this.alk.c).length;
        if (this.valgt !== rigtig) {
            var forkertType = D.TYPE_ORDEN[this.valgt];
            this.forkert[this.valgt] = true;
            this.fejl = true;
            this.valgt = null;
            this.visNaboer = true;
            this.visKort();
            var tekst = D.TYPE_ORDEN.indexOf(forkertType) === Math.max(n, 1)
                ? "Tæl kun carbonatomerne. OH-gruppens oxygenatom tæller ikke med."
                : "Tæl de andre carbonatomer, som carbonatomet med OH-gruppen er bundet til. Ét giver primær, to sekundær og tre tertiær.";
            this.fejlLinje(tekst);
            return;
        }
        this.visNaboer = true;
        this.valgt = null;
        this.sejrT = 0;
        var t = D.TYPER[this.alk.type];
        /* Papirkortet: kortet bliver paa spoergsmaalet om typen, til eleven
           trykker Naeste spoergsmaal. Svarene om produktet kommer foerst da. */
        this.groen = {
            spm: true, svarNr: nr, maade: vist ? "svar" : "selv", knap: "Næste spørgsmål →",
            tekst: "Carbonatomet med OH-gruppen er bundet til " + (n === 0 ? "ingen andre carbonatomer (methanol regnes som primær)" : t.antal) + ". " + this.alkNavn() + " er en " + t.navn + " alkohol.",
            naeste: function () { this.fase = "produkt"; this.valgt = null; this.forkert = {}; this.nulstilHjaelp(); this.visKort(); }
        };
        this.besked("", "");
        this.visKort();
    };

    P.indsendProdukt = function (vist) {
        var o = this.opg, valgt = o.o.valg[this.valgt];
        if (valgt !== o.produkt) {
            this.forkert[this.valgt] = true;
            this.fejl = true;
            this.fejlLinje(this.produktFejl(D.VALG_KLASSE[this.valgt]));
            this.valgt = null;
            this.visKort();
            return;
        }
        var s = this.status[this.nr], foerste = !s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        this.glasT = 0.0001;
        var t = D.TYPER[this.alk.type], tekst, mid = D.MIDLER[o.o.middel];
        if (o.produkt) {
            var kl = D.KLASSER[K.stof(o.produkt).klasse];
            tekst = this.alkNavn() + " er en " + t.navn + " alkohol. " +
                (o.o.maade === "mild" ? "Ved en mild oxidation" : (o.o.maade === "kraftig" ? "Ved en kraftig oxidation" : "Ved oxidationen")) +
                " bliver den til " + o.produkt + ", " + (kl ? kl.ental : "") + ". " + D.stor(mid.navn) + "et skifter fra " + mid.fra + " til " + mid.til + ".";
        } else {
            tekst = this.alkNavn() + " er en tertiær alkohol. Carbonatomet med OH-gruppen har intet hydrogenatom, så der sker ingen oxidation. " + D.stor(mid.navn) + "et forbliver " + mid.fra + ".";
        }
        var alle = this.antalLoest() === this.opgaver.length;
        if (alle && foerste) tekst += " " + D.FAERDIG.p;
        var naeste = this.naesteUloeste();
        this.groen = { spm: true, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: naeste >= 0 ? "Næste opgave →" : "Videre til Ukendte alkoholer →", chip: vist ? "Svaret" : "Rigtigt ✓" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-p").querySelector(".scene"), 140);
        else NK.konfetti(this.el.skort, 36);
    };

    /* Forklaringen til et forkert produkt. klasse: det, eleven valgte (null: ingen reaktion) */
    P.produktFejl = function (klasse) {
        var type = this.alk.type, m = this.opg.o.maade, h = this.alk.h;
        if (type === "tertiaer")
            return "Carbonatomet med OH-gruppen har intet hydrogenatom. Oxidationsmidlet kan derfor ikke fjerne et hydrogenatom, og alkoholen oxideres ikke.";
        if (klasse === null)
            return "Carbonatomet med OH-gruppen har " + (h === 1 ? "ét hydrogenatom" : D.TAL[h] + " hydrogenatomer") + ", som oxidationsmidlet kan tage. Der sker en oxidation.";
        if (type === "primaer") {
            if (klasse === "keton") return "En keton har C=O inde i kæden. Her sidder OH-gruppen for enden af kæden, og derfor kommer C=O også til at sidde for enden.";
            if (klasse === "carboxylsyre") return "Ved en mild oxidation destilleres aldehydet fra, så snart det er dannet. Det når ikke at blive oxideret videre.";
            return "Med permanganat i overskud bliver aldehydet oxideret videre, fordi carbonatomet i C=O stadig har et hydrogenatom.";
        }
        if (klasse === "aldehyd") return "Et aldehyd har C=O for enden af kæden. Her sidder OH-gruppen inde i kæden, og derfor kommer C=O også til at sidde inde i kæden.";
        return "Carbonatomet med OH-gruppen har kun ét hydrogenatom. Alkoholen kan derfor kun oxideres én gang, og der dannes ingen carboxylsyre.";
    };

    /* Kortets knap gaar altid fremad. Start forfra staar et andet sted (knappen
       under opgaverne i panelet), saa ingen kommer til at nulstille ved at
       trykke videre (brugerens regel 3. nov. 2026) */
    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-u");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    /* ----- Hjaelpen ------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen) return [];
        var n = K.cNaboer(this.alk.mol, this.alk.c).length;
        if (this.fase === "type") {
            return ["Find carbonatomet med OH-gruppen. Hvor mange andre carbonatomer er det bundet til?",
                "Carbonatomet med OH-gruppen er bundet til " + (n === 1 ? "ét andet carbonatom" : D.TAL[n] + " andre carbonatomer") + ". Ét giver primær, to sekundær og tre tertiær."];
        }
        var type = this.alk.type, m = this.opg.o.maade;
        var h2 = { primaer: m === "mild" ? "En primær alkohol bliver først til et aldehyd. Ved en mild oxidation stopper oxidationen ved aldehydet."
                : "En primær alkohol bliver først til et aldehyd og derefter til en carboxylsyre.",
            sekundaer: "En sekundær alkohol bliver til en keton, som ikke kan oxideres videre.",
            tertiaer: "En tertiær alkohol har intet hydrogenatom på carbonatomet med OH-gruppen." }[type];
        return ["Hvor mange hydrogenatomer har carbonatomet med OH-gruppen? Hver oxidation tager ét.", h2];
    };

    P.efterHint = function () { this.visNaboer = true; };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "type") {
            this.valgt = D.TYPE_ORDEN.indexOf(this.alk.type);
            this.indsendType(true);
            return;
        }
        this.valgt = this.opg.o.valg.indexOf(this.opg.produkt);
        this.indsendProdukt(true);
    };

    /* ----- Klik paa tavlen ------------------------------------------------------- */
    P.valgVed = function (pt) {
        if (!this.kasser) return -1;
        for (var i = 0; i < this.kasser.valg.length; i++) {
            var k = this.kasser.valg[i];
            if (pt.x >= k.x && pt.x <= k.x + k.b && pt.y >= k.y && pt.y <= k.y + k.h) return i;
        }
        return -1;
    };

    P.overScene = function (pt) {
        this.overValg = -1;
        if (!pt || this.groen || this.fase !== "produkt") return null;
        var i = this.valgVed(pt);
        if (i >= 0 && !this.forkert[i]) this.overValg = i;
        return this.overValg >= 0 ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        var i = this.valgVed(pt);
        if (i < 0) return;
        if (this.fase === "type") return;
        if (this.forkert[i]) { this.kortBesked("Det svar har du prøvet. Vælg et andet.", 3); return; }
        this.valgt = this.valgt === i ? null : i;
        this.visKort();
    };

    P.nulstil = function () {
        if (this.groen) return;
        this.vaelg(this.nr);
    };

    /* ----- Layout og tegning ------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        var top = Math.round(t.h * 0.52), pad = 16;
        var alkB = Math.round(t.b * 0.34), midtB = Math.round(t.b * 0.24);
        this.kasser = {
            alk: { x: t.x + pad, y: t.y + 14, b: alkB, h: top - 74 },
            pil: { x: t.x + pad + alkB + 10, y: t.y + 14, b: midtB - 20, h: top - 74 },
            prod: { x: t.x + pad + alkB + midtB, y: t.y + 14, b: t.b - 2 * pad - alkB - midtB, h: top - 74 },
            valg: []
        };
        var vy = t.y + top + 6, vh = t.h - top - 16, gab = 12, vb = (t.b - 2 * pad - 3 * gab) / 4;
        for (var i = 0; i < 4; i++) this.kasser.valg.push({ x: t.x + pad + i * (vb + gab), y: vy, b: vb, h: vh });
        this.skilY = t.y + top - 8;
        this.anker("p-anker-valg", t.x + pad, vy, t.b - 2 * pad, vh);
    };

    P.anker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.opdaterScene = function (dt) {
        if (this.glasT > 0 && this.glasT < 1) this.glasT = Math.min(1, this.glasT + dt / 1.4);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle, k = this.kasser, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.alk || !k) return;
        var puls = 0.5 + 0.5 * Math.sin(this.tid * 4);

        /* Alkoholen med carbonatomet med OH-gruppen */
        var ra = F.iKasse(this.alk.mol, { x: k.alk.x, y: k.alk.y, b: k.alk.b, h: k.alk.h }, { maks: 64 });
        var pc = ra.geo.P[this.alk.c];
        F.ring(ctx, pc, ra.s * 0.26, this.fase === "type" && !this.groen ? GUL : TEAL,
            this.fase === "type" && !this.groen ? "rgba(242, 197, 61, " + (0.25 + 0.12 * puls).toFixed(2) + ")" : "rgba(15, 138, 138, 0.12)", 3);
        if (this.visNaboer) {
            K.cNaboer(this.alk.mol, this.alk.c).forEach(function (n) {
                var p = ra.geo.P[n];
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(5, ra.s * 0.1), 0, Math.PI * 2);
                ctx.fillStyle = TEAL;
                ctx.fill();
            });
        }
        NK.Struktur.tegnGeo(ctx, ra.geo);
        var under = this.fase === "type" && !this.groen ? "" : D.TYPER[this.alk.type].navn + " alkohol";
        this.navnUnder(ctx, this.alk.navn, under, k.alk, "#1d2433");

        /* Pilen, glasset og maaden */
        var py = k.pil.y + k.pil.h * 0.62, x0 = k.pil.x + 6, x1 = k.pil.x + k.pil.b - 6;
        ctx.save();
        ctx.strokeStyle = "#1d2433";
        ctx.fillStyle = "#1d2433";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x0, py);
        ctx.lineTo(x1 - 10, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, py);
        ctx.lineTo(x1 - 14, py - 7);
        ctx.lineTo(x1 - 14, py + 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        var gh = Math.min(k.pil.h * 0.56, 120), gb = gh * 0.3, gx = (x0 + x1) / 2 - gb / 2, gy = py - 10 - gh;
        var skift = this.opg.produkt ? this.glasT : 0, mid = D.MIDLER[this.opg.o.middel];
        var gFra = GLAS[mid.glasFra], gTil = GLAS[mid.glasTil];
        if (gFra.complete && gFra.naturalWidth) {
            ctx.drawImage(gFra, gx, gy, gb, gh);
            if (skift > 0 && gTil.complete) {
                ctx.save();
                ctx.globalAlpha = skift;
                ctx.drawImage(gTil, gx, gy, gb, gh);
                ctx.restore();
            }
        }
        var m = this.opg.o.maade;
        NK.tekst(ctx, mid.formel, (x0 + x1) / 2, py + 18, { font: "700 15px 'Segoe UI', sans-serif", farve: "#5d6878", justering: "center", linje: "middle" });
        if (m) NK.tekst(ctx, m === "mild" ? "mild" : "kraftig", (x0 + x1) / 2, py + 36, { font: "700 14px 'Segoe UI', sans-serif", farve: "#b4321f", justering: "center", linje: "middle" });

        /* Produktet: et spoergsmaalstegn, til opgaven er loest */
        if (this.groen) {
            var p = this.opg.produkt;
            if (p) {
                var st = K.stof(p), kl = D.KLASSER[st.klasse];
                var rp = F.iKasse(st.mol, { x: k.prod.x, y: k.prod.y, b: k.prod.b, h: k.prod.h }, { maks: 64 });
                NK.Struktur.tegnGeo(ctx, rp.geo);
                this.navnUnder(ctx, p, kl ? kl.navn : "", k.prod, kl ? kl.blaek : "#1d2433");
            } else {
                NK.tekst(ctx, "ingen reaktion", k.prod.x + k.prod.b / 2, k.prod.y + k.prod.h / 2, { font: "700 20px 'Segoe UI', sans-serif", farve: "#5d6878", justering: "center", linje: "middle" });
            }
        } else {
            ctx.save();
            ctx.setLineDash([7, 6]);
            ctx.strokeStyle = "#b9c0ca";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, k.prod.x + k.prod.b * 0.18, k.prod.y + 8, k.prod.b * 0.64, k.prod.h - 16, 12);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "?", k.prod.x + k.prod.b / 2, k.prod.y + k.prod.h / 2, { font: "800 44px 'Segoe UI', sans-serif", farve: "#b9c0ca", justering: "center", linje: "middle" });
        }

        /* Skillelinjen og de fire svar */
        ctx.save();
        ctx.strokeStyle = "#dfe3e8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tv.x + 16, this.skilY);
        ctx.lineTo(tv.x + tv.b - 16, this.skilY);
        ctx.stroke();
        ctx.restore();
        /* Svarene kommer foerst frem, naar typen er fundet */
        if (this.fase !== "type" || this.groen) this.opg.o.valg.forEach(function (navn, i) { mig.tegnValg(ctx, navn, i, k.valg[i], false, puls); });

        this.tegnSejr(ctx, tv);
    };

    /* Navnet (og typen eller stofklassen) under en formel */
    P.navnUnder = function (ctx, navn, under, kasse, farve) {
        var x = kasse.x + kasse.b / 2, y = kasse.y + kasse.h + 14;
        NK.tekst(ctx, navn, x, y, { font: "700 17px 'Segoe UI', sans-serif", farve: "#1d2433", justering: "center", linje: "middle" });
        if (under) NK.tekst(ctx, under, x, y + 21, { font: "600 14px 'Segoe UI', sans-serif", farve: farve, justering: "center", linje: "middle" });
    };

    /* Et af de fire svar: en ramme med formlen (eller "Ingen reaktion") */
    P.tegnValg = function (ctx, navn, i, k, laast, puls) {
        var loest = !!this.groen, rigtig = navn === this.opg.produkt;
        var ramme = "#cfd5dd", fyld = "rgba(255, 255, 255, 0.0)", bredde = 1.5;
        if (loest && rigtig) { ramme = GROEN; fyld = "rgba(43, 154, 94, 0.1)"; bredde = 3.5; }
        else if (this.forkert[i]) { ramme = ROED; fyld = "rgba(200, 64, 47, 0.06)"; bredde = 2.5; }
        else if (this.valgt === i) { ramme = GUL; fyld = GUL_FYLD; bredde = 3.5 + puls; }
        else if (this.overValg === i) { ramme = "rgba(214, 158, 12, 0.85)"; bredde = 2.5; }
        ctx.save();
        if (laast) ctx.globalAlpha = 0.35;
        else if (loest && !rigtig) ctx.globalAlpha = 0.55;
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 10);
        ctx.fillStyle = fyld;
        ctx.fill();
        ctx.strokeStyle = ramme;
        ctx.lineWidth = bredde;
        ctx.stroke();
        var navnPlads = loest ? 26 : 0;
        if (navn) {
            var st = K.stof(navn);
            var r = F.iKasse(st.mol, { x: k.x + 8, y: k.y + 8, b: k.b - 16, h: k.h - 16 - navnPlads }, { maks: 46 });
            NK.Struktur.tegnGeo(ctx, r.geo);
            if (loest) NK.tekst(ctx, navn, k.x + k.b / 2, k.y + k.h - 16, { font: "700 13px 'Segoe UI', sans-serif", farve: "#3d4654", justering: "center", linje: "middle" });
        } else {
            NK.tekst(ctx, "Ingen reaktion", k.x + k.b / 2, k.y + k.h / 2, { font: "700 17px 'Segoe UI', sans-serif", farve: "#3d4654", justering: "center", linje: "middle" });
        }
        ctx.restore();
    };

    NK.SimProdukt = SimProdukt;
}());
