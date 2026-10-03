/* =====================================================================
   sim_konj.js - fane 2: konjugeringen

   Kaeden: polyenet H(CH=CH)nH paa tavlen. Eleven goer kaeden laengere
   eller kortere, toppen glider hen ad grafen (UV til venstre for 400 nm),
   og glasset viser farven. Først et gaet, saa farve, orange og rød.

   Tomaten: lycopen, C40H56. Eleven finder de 11 konjugerede blandt de 13
   dobbeltbindinger, adderer brom til én dobbeltbinding, saa chromoforen
   bliver delt (gul, farveløs), og ser til sidst tomatregnbuen, hvor
   bromvand trænger ned i saften.

   Spektret regnes af de konjugerede systemer (js/molekyle.js): hvert
   system med n dobbeltbindinger giver polyenets toppe (js/farve.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Farve;
    var M = NK.Mol;
    var Tg = NK.Tg;

    var LYCOPEN = M.byg("lycopen");
    var LY_KONJ = M.konjugering(LYCOPEN);
    var LY_LANGS = M.langs(LYCOPEN, LY_KONJ.systemer[0]);   /* de 11 i raekkefoelge */
    var LY_ISOLEREDE = LY_KONJ.systemer.slice(1).map(function (s) { return s.dob[0]; });

    /* Spektret af et molekyle: summen af systemernes toppe */
    function toppeAf(konj) {
        var t = [];
        konj.systemer.forEach(function (s) { t = t.concat(F.polyenToppe(s.dob.length)); });
        return t;
    }

    /* ----- Tomatregnbuen: farven ved en brøkdel p af dobbeltbindingerne
       med brom. Hver dobbeltbinding faar brom med sandsynligheden p.
       E[L] er det forventede antal hele stykker med L konjugerede. */
    function regnbueToppe(p) {
        var q = 1 - p, n = 11, t = [];
        for (var L = 1; L <= n; L++) {
            var E = 0;
            for (var i = 0; i + L <= n; i++) {
                var venstre = i === 0 ? 1 : p, hoejre = i + L === n ? 1 : p;
                E += Math.pow(q, L) * venstre * hoejre;
            }
            if (E > 1e-4) F.polyenToppe(L).forEach(function (top) { t.push({ c: top.c, w: top.w, h: top.h * E }); });
        }
        /* de to isolerede i enderne */
        if (q > 1e-4) F.polyenToppe(1).forEach(function (top) { t.push({ c: top.c, w: top.w, h: top.h * 2 * q }); });
        return t;
    }

    var RB_TABEL = [];
    function rbFarve(p) {
        if (!RB_TABEL.length) {
            for (var k = 0; k <= 40; k++) {
                var c = F.farve(regnbueToppe(k / 40), D.TOMAT_FAKTOR);
                RB_TABEL.push({ c: c, css: F.css(c), navn: F.navn(c) });
            }
        }
        return RB_TABEL[Math.round(NK.klamp(p, 0, 1) * 40)];
    }

    var RB_TID = 9;        /* sekunder, bromvandet trænger ned */
    var RB_LAG = 36;

    /* brom pr. dobbeltbinding i dybden z (0 oeverst, 1 nederst) til tiden t */
    function rbP(z, t) {
        if (t <= 0) return 0;
        var s = Math.min(1, t / RB_TID);
        var front = 0.06 + 0.26 * Math.sqrt(s);
        var x = (z - front) / (0.08 + 0.2 * s);
        return NK.klamp(0.5 - 0.5 * Math.tanh(x), 0, 1) * Math.min(1, 0.4 + s * 1.2);
    }

    /* ======================================================================== */
    function SimKonj() {
        var mig = this;
        this.valg = NK.el("ko-valg");
        this.linjeEl = NK.el("ko-opgave");
        this.startFane(D.KO, D.KO_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimKonj.prototype;
    NK.Fane.paa(P, { navn: "ko", naesteFane: "fane-ch", naesteNavn: "Chromoforen" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.o = o;
        this.marker = {};
        this.roed = {};
        this.lysB = {};
        this.brom = null;
        this.flyv = null;
        this.gaet = null;
        this.haeldt = false;
        this.rbT = 0;
        this.rbLag = null;
        this.over = null;
        if (o.gruppe === "kaede") {
            this.n = o.n;
            this.nVis = o.n;
            this.trin = o.type === "gaet" ? "gaet" : "byg";
            this.saetPolyen();
        } else {
            this.trin = o.type;
            this.n = 0;
            this.nVis = 0;
            this.mol = LYCOPEN.kopi();
            this.opdaterKonj();
        }
        this.bygValg();
        this.visOpgavelinje();
    };

    P.saetPolyen = function () {
        this.mol = M.byg("polyen", this.n);
        this.opdaterKonj();
    };

    P.opdaterKonj = function () {
        this.konj = M.konjugering(this.mol);
        this._fNoegle = null;
    };

    /* ----- Spektret og farven ------------------------------------------------------ */
    P.toppe = function () {
        if (this.o.type === "regnbue") return this.haeldt ? regnbueToppe(this.lagP(this.rbLag === null ? RB_LAG - 1 : this.rbLag)) : toppeAf(LY_KONJ);
        if (this.o.gruppe === "kaede") return F.polyenToppe(this.nVis);
        return toppeAf(this.konj);
    };

    P.A = function (l) { return F.absorbans(this.toppe(), l); };

    P.farve = function () {
        var noegle = this.o.id + ":" + this.nVis.toFixed(2) + ":" + this.brom + ":" + (this.o.type === "regnbue" ? this.rbLag + ":" + Math.round(this.rbT * 10) : "");
        if (this._fNoegle !== noegle) {
            this._fNoegle = noegle;
            var c = F.farve(this.toppe(), this.o.type === "regnbue" ? D.TOMAT_FAKTOR : 1);
            this._f = { c: c, css: F.css(c), navn: F.navn(c) };
        }
        return this._f;
    };

    /* Den laengste chromofor og dens lambda-max */
    P.laengst = function () {
        if (this.o.gruppe === "kaede") return this.n;
        return this.konj.stoerst;
    };

    P.lagP = function (i) { return rbP((i + 0.5) / RB_LAG, this.rbT); };

    /* ----- Knapperne i scenen -------------------------------------------------------- */
    P.bygValg = function () {
        var mig = this, o = this.o;
        this.valg.innerHTML = "";
        this.knapper = {};
        function knap(tekst, noegle, klasse, fn) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap" + (klasse ? " " + klasse : "");
            k.textContent = tekst;
            k.addEventListener("click", function () { fn(); mig.fokus(); });
            mig.valg.appendChild(k);
            mig.knapper[noegle] = k;
            return k;
        }
        if ((this.trin === "gaet" || (this.trin === "regnbue" && this.gaet === null)) && !this.faerdig) {
            this.valg.classList.add("lodret");
            o.svar.forEach(function (s, i) { knap(s, "g" + i, "gaetknap", function () { mig.svarGaet(i); }); });
        } else {
            this.valg.classList.remove("lodret");
            if (o.gruppe === "kaede") {
                knap("− Kortere kæde", "minus", "", function () { mig.skiftN(-1); });
                knap("+ Længere kæde", "plus", "vend", function () { mig.skiftN(1); });
                this.visPlusMinus();
            } else if (this.trin === "regnbue" && !this.haeldt) {
                knap("Hæld bromvand i", "haeld", "tjek", function () { mig.haeld(); });
            }
        }
        this.layout();
    };

    P.visPlusMinus = function () {
        if (this.knapper.minus) this.knapper.minus.disabled = this.n <= 1;
        if (this.knapper.plus) this.knapper.plus.disabled = this.n >= D.KO_MAKS;
    };

    P.visOpgavelinje = function () {
        var o = this.o, t = o.tekst;
        if (this.faerdig) {
            if (o.gruppe === "kaede") t = "Prøv selv med andre længder. Toppen og farven følger med.";
            else if (o.type === "find") t = "Lycopen har 11 konjugerede dobbeltbindinger. Det er chromoforen.";
            else if (o.type === "regnbue") t = "Hold musen over glasset for at se et molekyle og spektret fra hvert lag (fortyndet 20 gange).";
            else t = "Klik på en anden dobbeltbinding, og se farven skifte.";
        } else if (o.type === "gaet" && this.gaet !== null) t = "Tryk på + Længere kæde, og se, hvor toppen flytter hen.";
        else if (o.type === "regnbue" && this.gaet !== null) t = this.haeldt ? "Bromvandet trænger ned i saften …" : "Tryk på Hæld bromvand i.";
        NK.saetTekst("ko-opgave", t);
    };

    P.promptHTML = function () {
        var o = this.o;
        var h = '<p class="maal-tekst">' + NK.html(o.tekst) + "</p>";
        if (o.gruppe === "kaede") {
            h += '<p class="note-tekst">Kæden er H(CH=CH)<sub>n</sub>H. Alle dobbeltbindingerne er konjugerede: der er præcis én enkeltbinding mellem to dobbeltbindinger.</p>';
        } else if (o.type === "find") {
            h += '<p class="note-tekst">Lycopen giver tomater deres farve. Her er det opløst i hexan. Konjugerede dobbeltbindinger har præcis én enkeltbinding imellem sig. Klik igen for at fjerne en markering.</p>';
        } else if (o.type === "brom") {
            h += '<p class="note-tekst">Br₂ adderes til en dobbeltbinding, så den bliver til en enkeltbinding med et Br på hvert C-atom. Klik på en anden dobbeltbinding for at flytte bromen.</p>';
        } else {
            h += '<p class="note-tekst">Bromvand er brom opløst i vand. Det lægger sig øverst og trænger langsomt ned i saften. Tomatsaft er ca. 20 gange så koncentreret som opløsningen af lycopen i hexan. Grafen viser saften fortyndet 20 gange.</p>';
        }
        if (this.faerdig && this.slutTekst) h += '<div class="forklaring"><p>' + NK.html(this.slutTekst) + "</p></div>";
        return h;
    };

    P.trinLinje = function () {
        var o = this.o;
        if (this.trin === "gaet") return this.gaet === null ? "Vælg et af de tre svar under grafen." : "Tryk på + Længere kæde.";
        if (o.gruppe === "kaede") return "Brug knapperne under grafen, eller tasterne + og −.";
        if (o.type === "find") return "Klik på en dobbeltbinding i lycopen. Markeret: " + this.antalMarker() + ".";
        if (o.type === "brom") return "Klik på en dobbeltbinding i lycopen for at addere brom til den.";
        return this.gaet === null ? "Vælg et af de tre svar under grafen." : "Tryk på Hæld bromvand i.";
    };

    P.antalMarker = function () { return Object.keys(this.marker).length; };

    /* ----- Hinttrappen og svaret ----------------------------------------------------- */
    P.hintTrin = function () {
        var o = this.o;
        switch (o.id) {
            case "k-gaet":
                if (this.gaet === null) return [
                    "I et længere konjugeret system kan elektronerne bevæge sig over et større stykke af molekylet.",
                    "Jo længere systemet er, jo mindre energi skal der til at excitere en elektron. Mindre energi er længere bølgelængde.",
                    "Toppen flytter mod en længere bølgelængde."
                ];
                return ["Tryk på + Længere kæde under grafen.", "Knappen + Længere kæde giver kæden én dobbeltbinding mere.", "Tryk på + Længere kæde."];
            case "k-farve": return [
                "Toppen skal ind i det synlige lys, til højre for 400 nm. Gør kæden længere.",
                "Hver ny dobbeltbinding flytter toppen ca. 20 til 40 nm mod højre.",
                "Der skal 8 konjugerede dobbeltbindinger til."
            ];
            case "k-orange": return [
                "Orange kommer, når stoffet absorberer blåt lys, omkring 470 nm.",
                "Gør kæden længere, til toppen står ved ca. 470 nm.",
                "Der skal 11 konjugerede dobbeltbindinger til."
            ];
            case "k-roed": return [
                "Rød kommer, når stoffet absorberer blågrønt lys, omkring 500 nm.",
                "Gør kæden længere, til toppen står ved ca. 500 nm.",
                "Der skal 13 konjugerede dobbeltbindinger til."
            ];
            case "t-find": return [
                "Konjugerede dobbeltbindinger har præcis én enkeltbinding imellem sig.",
                "Begynd ved den dobbeltbinding, der lyser, og følg kæden til begge sider, så længe dobbelt- og enkeltbindinger skifter.",
                "To af de 13 dobbeltbindinger sidder for sig selv, én i hver ende, med to enkeltbindinger før den næste. Alle de andre er konjugerede."
            ];
            case "t-gul": return [
                "Bromen gør dobbeltbindingen til en enkeltbinding. Chromoforen bliver delt i to stykker, og farven afhænger af det længste.",
                "Gul kommer, når det længste stykke har 8 til 10 konjugerede dobbeltbindinger.",
                "Læg bromen på den anden dobbeltbinding fra en af enderne af chromoforen. Den lyser."
            ];
            case "t-farveloes": return [
                "Det længste stykke skal have højst 7 konjugerede dobbeltbindinger. Så ligger toppen i UV.",
                "Chromoforen har 11. Del den nær midten.",
                "Læg bromen på den midterste dobbeltbinding. Den lyser."
            ];
            default:
                if (this.gaet === null) return [
                    "Bromvandet kommer ovenfra. Hvor er der mest brom?",
                    "Jo mere brom, jo flere dobbeltbindinger bliver brudt, og jo kortere bliver chromoforerne.",
                    "Øverst er der mest brom: farveløs. Nederst er lycopen hel: orange."
                ];
                return ["Tryk på Hæld bromvand i.", "Tryk på Hæld bromvand i.", "Tryk på Hæld bromvand i."];
        }
    };

    P.efterHint = function (n) {
        var o = this.o, mig = this;
        this.lysB = {};
        if (o.id === "t-find" && n >= 2) {
            this.lysB[LY_LANGS[5]] = true;
            if (n >= 3) LY_ISOLEREDE.forEach(function (bi) { mig.lysB[bi] = true; });
        }
        if (o.id === "t-gul" && n >= 3) this.lysB[LY_LANGS[1]] = true;
        if (o.id === "t-farveloes" && n >= 3) this.lysB[LY_LANGS[5]] = true;
    };

    P.visSvar = function () {
        var o = this.o, mig = this;
        this.lysB = {};
        switch (o.id) {
            case "k-gaet":
                if (this.gaet === null) { this.svarGaet(o.rigtig); return; }
                this.skiftN(1);
                return;
            case "k-farve": this.saetN(8); return;
            case "k-orange": this.saetN(11); return;
            case "k-roed": this.saetN(13); return;
            case "t-find":
                LY_LANGS.forEach(function (bi) { mig.marker[bi] = true; });
                this.tjekFind();
                return;
            case "t-gul": this.addér(LY_LANGS[1]); return;
            case "t-farveloes": this.addér(LY_LANGS[5]); return;
            default:
                if (this.gaet === null) { this.svarGaet(o.rigtig); return; }
                this.haeld();
        }
    };

    /* ----- Kaeden ------------------------------------------------------------------ */
    P.saetN = function (n) {
        n = NK.klamp(n, 1, D.KO_MAKS);
        if (n === this.n) return;
        var foer = this.n;
        this.n = n;
        this.saetPolyen();
        this.visPlusMinus();
        this.efterN(foer);
    };

    P.skiftN = function (r) {
        if (this.trin === "gaet" && this.gaet === null) return;
        if (r > 0 && this.n >= D.KO_MAKS) { this.kortBesked("Længere bliver kæden ikke her. Den har " + D.KO_MAKS + " konjugerede dobbeltbindinger.", 4); return; }
        this.saetN(this.n + r);
    };

    P.tast = function (k) {
        if (this.o.gruppe !== "kaede") return false;
        if (k === "+") { this.skiftN(1); return true; }
        if (k === "-" || k === "−") { this.skiftN(-1); return true; }
        return false;
    };

    P.efterN = function (foer) {
        var o = this.o;
        if (this.faerdig) { this.nulstilHjaelp(); return; }
        var lm = Math.round(F.polyenMax(this.n));
        var navn = F.navn(F.farve(F.polyenToppe(this.n)));
        if (o.id === "k-gaet") {
            if (this.n === 3 && foer === 2) {
                var t = "Toppen flyttede fra 217 til 258 nm: mod en længere bølgelængde. En længere chromofor absorberer lys med mindre energi.";
                if (this.gaet !== o.rigtig) this.brugtSvar = true;
                this.slutTekst = t;
                this.loest(t, "Ikke helt");
                this.visOpgavelinje();
            }
            return;
        }
        var ok = o.maal === "farvet" ? navn !== "Farveløs" : navn === o.maal;
        if (ok) {
            var lys = F.lysOrd(lm);
            var tekst = "Med " + this.n + " konjugerede dobbeltbindinger ligger toppen ved " + lm + " nm. Stoffet absorberer " + lys +
                " lys og er " + navn.toLowerCase() + ".";
            if (o.id === "k-farve") tekst += " Det passer med tommelfingerreglen: et organisk stof er farvet fra ca. 8 konjugerede dobbeltbindinger.";
            if (o.id === "k-orange") tekst += " Lycopen i tomater har også 11.";
            this.slutTekst = tekst;
            this.loest(tekst);
            this.visOpgavelinje();
        } else {
            this.nulstilHjaelp();
        }
    };

    P.svarGaet = function (i) {
        if (this.gaet !== null) return;
        this.gaet = i;
        if (this.o.type === "gaet") this.trin = "byg";
        this.hjaelp = 0;
        this.bygValg();
        this.visOpgavelinje();
        this.visKnap();
        this.besked('<span class="b-maerke">Dit gæt</span> ' + NK.html(this.o.svar[i] + ". " + this.trinLinje()), "");
    };

    /* ----- Lycopen: find chromoforen ------------------------------------------------ */
    P.klikFind = function (bi) {
        var si = this.konj.afBinding[bi];
        if (si === undefined) return;
        if (si !== 0) {
            this.roed[bi] = 1;
            this.fejlLinje("Den dobbeltbinding er ikke konjugeret med de andre. Mellem den og den næste dobbeltbinding er der to enkeltbindinger i træk.");
            return;
        }
        if (this.marker[bi]) delete this.marker[bi];
        else this.marker[bi] = true;
        this.lysB = {};
        this.nulstilHjaelp();
        this.tjekFind();
    };

    P.tjekFind = function () {
        if (this.antalMarker() === LY_LANGS.length) {
            var t = "Lycopen har 13 dobbeltbindinger. De 11 i midten er konjugerede og danner chromoforen. Toppen ligger ved 470 nm.";
            this.slutTekst = t;
            this.loest(t);
            this.visOpgavelinje();
        } else {
            this.naesteLinje("", "");
        }
    };

    /* ----- Lycopen: brom ---------------------------------------------------------- */
    P.addér = function (bi) {
        if (this.flyv) return;
        if (bi === this.brom) {
            this.brom = null;
            this.mol = LYCOPEN.kopi();
            this.opdaterKonj();
            this.naesteLinje("", "");
            return;
        }
        var maal = M.midt(LYCOPEN, this.vis, bi);
        this.flyv = { bi: bi, t: 0, x0: maal.x + 40, y0: this.lay ? this.lay.tavle.y - 10 : 0, x1: maal.x, y1: maal.y };
        this.lysB = {};
    };

    P.landBrom = function (bi) {
        this.brom = bi;
        this.mol = LYCOPEN.kopi();
        this.mol.addérBrom(bi);
        this.opdaterKonj();
        if (this.faerdig) return;
        var o = this.o;
        var f = this.farve();
        var L = this.konj.stoerst;
        var isoleret = LY_ISOLEREDE.indexOf(bi) >= 0;
        if (f.navn === o.maal) {
            var t = o.maal === "Gul" ?
                "Chromoforen er delt, og det længste stykke har " + L + " konjugerede dobbeltbindinger. Toppen er flyttet til " + Math.round(F.polyenMax(L)) + " nm, og opløsningen er gul." :
                "Chromoforen er delt i to stykker med højst " + L + " konjugerede dobbeltbindinger. Toppene ligger i UV, og opløsningen er farveløs.";
            this.slutTekst = t;
            this.loest(t);
            this.visOpgavelinje();
            return;
        }
        if (isoleret) {
            this.fejlLinje("Den dobbeltbinding er ikke konjugeret, så chromoforen er hel, og farven er den samme.");
        } else if (f.navn === "Farveløs") {
            this.fejlLinje("Nu er opløsningen farveløs. Det længste stykke har kun " + L + " konjugerede dobbeltbindinger. Læg bromen tættere på en af enderne.");
        } else {
            this.fejlLinje("Opløsningen er " + f.navn.toLowerCase() + ". Det længste stykke har stadig " + L + " konjugerede dobbeltbindinger. Læg bromen tættere på midten.");
        }
    };

    /* ----- Tomatregnbuen ------------------------------------------------------------ */
    P.haeld = function () {
        if (this.haeldt) return;
        this.haeldt = true;
        this.rbT = 0;
        this.bygValg();
        this.visOpgavelinje();
        this.naesteLinje("", "");
    };

    P.regnbueFaerdig = function () {
        var t = "Øverst er der mest brom, og næsten alle dobbeltbindinger er brudt: saften er farveløs. Længere nede er chromoforerne delt i kortere stykker: gul. Nederst er lycopen hel: orange.";
        if (this.gaet !== this.o.rigtig) this.brugtSvar = true;
        this.slutTekst = t;
        this.loest(t, "Ikke helt");
        this.visOpgavelinje();
    };

    /* Et molekyle fra et lag: lycopen med brom paa en brøkdel p af
       dobbeltbindingerne, spredt jaevnt (det samme hver gang) */
    P.lagMolekyle = function (p) {
        var m = LYCOPEN.kopi();
        var alle = LY_LANGS.concat(LY_ISOLEREDE);
        var antal = Math.round(p * alle.length);
        var orden = [12, 5, 1, 9, 3, 7, 11, 0, 4, 8, 2, 10, 6];
        for (var k = 0; k < antal; k++) m.addérBrom(alle[orden[k]]);
        return m;
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        if (!this.L) return;
        this.L.tilpas();
        var W = this.L.b;
        var band = this.baand();
        var linjeBund = this.linjeEl ? this.linjeEl.offsetTop + this.linjeEl.offsetHeight : 40;
        var valgH = this.valg && this.valg.children.length ? this.valg.offsetHeight + 14 : 0;
        if (this.valg) this.valg.style.bottom = (band.h + 12) + "px";
        var top0 = linjeBund + 12;
        var bund = band.y - (valgH ? valgH + 8 : 14);
        var avail = Math.max(220, bund - top0);
        var r1h = NK.klamp(avail * 0.4, 120, 220);
        var gw = NK.klamp(W * 0.17, 120, 170);
        var lay = {
            tavle: { x: 14, y: top0, b: W - 28, h: r1h },
            graf: { x: 14, y: top0 + r1h + 10, b: W - 28 - gw - 10, h: Math.max(150, bund - top0 - r1h - 10) },
            glas: { x: W - 14 - gw, y: top0 + r1h + 10, b: gw, h: Math.max(150, bund - top0 - r1h - 10) }
        };
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
        this.saetAnker("glas", lay.glas.x, lay.glas.y, lay.glas.b, lay.glas.h);
    };

    /* Glassets form inde i dets rektangel */
    P.glasForm = function () {
        var g = this.lay.glas;
        var b = Math.min(g.b * 0.42, 62), h = g.h - 70;
        return { cx: g.x + g.b / 2, top: g.y + 14, b: b, h: h };
    };

    /* ----- Tegneloekken ------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (this.o.gruppe === "kaede") {
            var d = this.n - this.nVis;
            if (Math.abs(d) > 0.001) this.nVis += d * Math.min(1, dt * 7);
            else this.nVis = this.n;
        }
        var k;
        for (k in this.roed) { this.roed[k] -= dt * 1.2; if (this.roed[k] <= 0) delete this.roed[k]; }
        if (this.flyv) {
            this.flyv.t += dt / 0.45;
            if (this.flyv.t >= 1) {
                var bi = this.flyv.bi;
                this.flyv = null;
                this.landBrom(bi);
            }
        }
        if (this.o.type === "regnbue" && this.haeldt && this.rbT < RB_TID) {
            this.rbT = Math.min(RB_TID, this.rbT + dt);
            if (this.rbT >= RB_TID && !this.faerdig) this.regnbueFaerdig();
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.o, mig = this;
        if (!lay) return;
        this.L.ryd();

        /* tavlen med molekylet */
        var inde = Tg.tavle(ctx, lay.tavle);
        var mol = this.mol;
        if (o.type === "regnbue" && this.haeldt) mol = this.lagMolekyle(this.lagP(this.rbLag === null ? RB_LAG - 1 : this.rbLag));
        var molR = { x: inde.x + 14, y: inde.y + 10, b: inde.b - 28, h: inde.h - 40 };
        /* lycopen staar samme sted, ogsaa naar der kommer brom paa */
        this.vis = M.pasning(o.gruppe === "kaede" ? mol : LYCOPEN, molR, 46);
        var opt = { baand: {}, marker: {}, roed: this.roed };
        var konj = M.konjugering(mol);
        var vis = (o.gruppe === "kaede") || this.faerdig || o.type !== "find";
        if (vis && konj.systemer.length) {
            konj.systemer.forEach(function (s) {
                if (s.dob.length < 2 && o.gruppe !== "kaede") return;
                s.dob.concat(s.enkelt).forEach(function (bi) { opt.baand[bi] = "rgba(242, 197, 61, 0.22)"; });
            });
        }
        if (o.type === "find" && !this.faerdig) {
            for (var bi in this.marker) opt.marker[bi] = "rgba(242, 197, 61, 0.85)";
        }
        for (var lb in this.lysB) opt.marker[lb] = "rgba(255, 225, 120, " + (0.45 + 0.35 * Math.sin(this.tid * 6)) + ")";
        if (this.over !== null && (o.type === "find" || o.type === "brom") && !this.flyv) opt.over = this.over;
        M.tegn(ctx, mol, this.vis, opt);

        /* navnet under molekylet */
        var navn;
        if (o.gruppe === "kaede") {
            var n = this.n;
            var formel = "C" + NK.saenket(2 * n) + "H" + NK.saenket(2 * n + 2);
            navn = (D.POLYEN_NAVN[n] ? D.POLYEN_NAVN[n] + ", " : "") + formel + "  ·  " + n + " konjugerede dobbeltbinding" + (n === 1 ? "" : "er");
        } else if (o.type === "find" && !this.faerdig) navn = "Lycopen, C₄₀H₅₆  ·  markeret: " + this.antalMarker();
        else if (o.type === "regnbue" && this.haeldt) navn = "Et molekyle fra det lag, der er valgt i glasset";
        else navn = "Lycopen, C₄₀H₅₆  ·  den længste chromofor: " + konj.stoerst + " konjugerede";
        NK.tekst(ctx, navn, inde.x + inde.b / 2, inde.y + inde.h - 10, { font: "700 14px 'Segoe UI', sans-serif", farve: "#cfe0d6", justering: "center" });

        /* brommet paa vej ned */
        if (this.flyv) {
            var t = NK.blod(this.flyv.t);
            var x = NK.lerp(this.flyv.x0, this.flyv.x1, t), y = NK.lerp(this.flyv.y0, this.flyv.y1, t);
            ctx.save();
            ctx.fillStyle = "rgba(20, 20, 26, 0.85)";
            NK.rundtRekt(ctx, x - 30, y - 13, 60, 26, 8);
            ctx.fill();
            NK.tekst(ctx, "Br-Br", x, y + 6, { font: "800 16px 'Segoe UI', sans-serif", farve: "#f0a35c", justering: "center" });
            ctx.restore();
        }

        /* grafen */
        var L = this.laengst();
        var lm = o.gruppe === "kaede" ? F.polyenMax(this.nVis) : (o.type === "regnbue" ? null : F.polyenMax(L));
        var mark = [];
        if (lm !== null && L > 0 && !(o.type === "find" && !this.faerdig)) mark.push({ l: lm, tekst: "λmax = " + Math.round(lm) + " nm" });
        this.g = Tg.graf(ctx, lay.graf, {
            xmin: 150, xmax: 700, ymax: 2.5, uv: true,
            kurver: [{ A: function (l) { return mig.A(l); } }],
            mark: mark,
            hover: this.hover !== null && this.hover !== undefined ? { l: this.hover } : null
        });

        /* glasset */
        var gf = this.glasForm();
        var f = this.farve();
        Tg.etiket(ctx, o.type === "regnbue" ? "Tomatsaft" : (o.gruppe === "kaede" ? "Opløsning i hexan" : "Lycopen i hexan"), gf.cx, lay.glas.y + 2, { just: "center" });
        if (o.type === "regnbue" && this.haeldt) {
            var lag = [];
            for (var i = 0; i < RB_LAG; i++) lag.push(rbFarve(this.lagP(i)).css);
            Tg.glas(ctx, gf.cx, gf.top + 8, gf.b, gf.h - 8, { lag: lag, niveau: 0.86 });
            if (this.rbLag !== null) {
                var vTop = gf.top + 8 + (gf.h - 8) * (1 - 0.86);
                var lh = (gf.top + gf.h - vTop) / RB_LAG;
                var yy = vTop + (this.rbLag + 0.5) * lh;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(gf.cx + gf.b / 2 + 4, yy); ctx.lineTo(gf.cx + gf.b / 2 + 16, yy - 6); ctx.lineTo(gf.cx + gf.b / 2 + 16, yy + 6); ctx.closePath();
                ctx.fillStyle = "#ffffff";
                ctx.fill();
            }
        } else {
            Tg.glas(ctx, gf.cx, gf.top + 8, gf.b, gf.h - 8, { farve: f.css, niveau: o.type === "regnbue" ? 0.7 : 0.78 });
        }
        var navnF = o.type === "regnbue" && this.haeldt ? rbFarve(this.lagP(this.rbLag === null ? RB_LAG - 1 : this.rbLag)).navn : f.navn;
        NK.tekst(ctx, navnF, gf.cx, gf.top + gf.h + 30, { font: "800 17px 'Segoe UI', sans-serif", farve: "#f2f3f5", justering: "center" });
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.overScene = function (pt) {
        this.over = null;
        this.hover = null;
        if (!pt || !this.lay) return null;
        var o = this.o;
        if (this.g && this.g.inde(pt)) this.hover = NK.klamp(this.g.x2l(pt.x), 150, 700);
        if (o.type === "regnbue" && this.haeldt) {
            var gf = this.glasForm();
            if (Math.abs(pt.x - gf.cx) < gf.b && pt.y > gf.top && pt.y < gf.top + gf.h) {
                var vTop = gf.top + 8 + (gf.h - 8) * (1 - 0.86);
                var i = Math.floor((pt.y - vTop) / ((gf.top + gf.h - vTop) / RB_LAG));
                this.rbLag = NK.klamp(i, 0, RB_LAG - 1);
                return "klik";
            }
        }
        if ((o.type === "find" || o.type === "brom") && this.vis && !this.flyv) {
            var bi = M.bindingVed(this.mol, this.vis, pt, true, o.type === "brom");
            if (bi !== null) { this.over = bi; return "klik"; }
        }
        return null;
    };

    P.klikScene = function (pt) {
        var o = this.o;
        if (!this.vis || this.flyv) return;
        if (o.type === "find" && !this.faerdig) {
            var bi = M.bindingVed(this.mol, this.vis, pt, true);
            if (bi !== null) this.klikFind(bi);
            return;
        }
        if (o.type === "brom") {
            var b2 = M.bindingVed(this.mol, this.vis, pt, true, true);
            if (b2 !== null && b2 < LYCOPEN.bindinger.length) this.addér(b2);
        }
    };

    P.enter = function () { if (this.faerdig) this.knap(); };

    NK.SimKonj = SimKonj;
    NK.SimKonj.regnbueToppe = regnbueToppe;
    NK.SimKonj.rbFarve = rbFarve;
    NK.SimKonj.rbP = rbP;
    NK.SimKonj.LY_LANGS = LY_LANGS;
}());
