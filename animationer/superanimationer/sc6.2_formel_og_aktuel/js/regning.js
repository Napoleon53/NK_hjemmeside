/* =====================================================================
   regning.js - regnetrinene paa fane 2 og 3

   Runde 2 (brugeren 21. nov. 2026: "maaske skal svarene aldrig angives
   heroppe i panelet?"): Eleven kigger kun to steder, paa kortet og paa
   tavlen. Svarene staar paa kortet under spoergsmaalet, aldrig i panelet:
   en formel vaelges blandt tre svar (de forkerte er typiske fejl), og et tal
   skrives i et felt paa kortet ("n(Cl⁻) fra A = [ tallet ] mol"), hvorefter
   eleven trykker Indsend svar eller Enter. Opløsningsskemaet har to smaa
   felter paa kortet. I den trinvise opgave paa fane 3 vaelges ogsaa tallene
   (valgTal). Efter et rigtigt svar bliver kortet paa spoergsmaalet med
   svaret groent, forklaringen under og Naeste; foerst da kommer naeste trin.

   Tavlen i scenen viser opgavens tal og regnestykket. Et trin staar som
   "n = ?", til formlen er fundet, saa som "n = c · V = ?", og til sidst som
   den paene beregning. Det trin, kortet spoerger om, har den gule ramme.
   Med samle (fane 3) staar kun de loeste linjer og den aktive paa tavlen;
   resten er samlet i én linje, fx "5 trin mere".

   NK.Regning.paa(P) giver fanen papirkortet (kortData, spmAaben,
   indsendKlar, indsendSvar, sendSvar, kortValg, trinInfo, naesteSpm) og de
   kald, regningen bruger (regnRigtigt, regnLoest, regnFejl, regnValgFejl).
   Fanen kan give egne tekster til et trin (trinTekst) og egne svar til et
   tal (talValg), som fane 3 goer i den trinvise opgave.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    function Regning(o) {
        this.fane = o.fane;
        this.samle = !!o.samle;
        this.opg = null;
        this.felter = [];
        this.k = 0;
        this.laast = false;
        this.vistTil = 0;
        this.foer = 0;
        this.sidst = null;
        /* Feltet paa kortet: fane.js saetter det ind under spoergsmaalet */
        this.el = document.createElement("div");
        this.el.className = "kt-felt";
    }
    var P = Regning.prototype;

    /* laast: kortet viser noget andet end et regnetrin (haeldningen foer
       regningen). foerTrin i opgaven er antallet af den slags trin. */
    P.saet = function (opg, laast) {
        var kendt = opg.kendt || [], valgTal = opg.valgTal || [];
        this.opg = opg;
        this.k = 0;
        this.sidst = null;
        this.laast = !!laast;
        this.vistTil = laast ? -1 : 0;
        this.foer = opg.foerTrin || 0;
        this.felter = opg.trin.map(function (id, i) {
            var fase = id === "afstem" ? "koef" : (T.harFormel(id) && kendt.indexOf(id) < 0 ? "formel" : "tal");
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: fase, medFormel: fase === "formel",
                     valgTal: valgTal.indexOf(id) >= 0, fejl: [], orden: {} };
        });
        this.byg();
    };

    /* Haeldningen er klaret: foerste regnetrin aabner */
    P.aabn = function () { this.naeste(); };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };
    P.fase = function (id) {
        var f = this.felter.filter(function (x) { return x.id === id; })[0];
        return f ? f.fase : null;
    };
    /* Kan eleven svare paa det aktive trin? Ikke, mens kortet venter paa Naeste */
    P.aaben = function () { return !this.laast && !this.faerdig(); };

    /* Trinene paa kortet: en formel og et tal er to trin */
    function antal(f) { return f.medFormel ? 2 : 1; }
    P.antalTrin = function () {
        return this.foer + this.felter.reduce(function (s, f) { return s + antal(f); }, 0);
    };
    P.trinNr = function (f, fase) {
        var n = this.foer;
        for (var i = 0; i < this.felter.length && this.felter[i] !== f; i++) n += antal(this.felter[i]);
        return n + (f.medFormel && fase !== "formel" ? 2 : 1);
    };
    /* Det trin, kortet staar paa lige nu (ogsaa naar det venter paa Naeste) */
    P.nuNr = function () {
        if (this.laast) return this.sidst ? this.sidst.nr : this.foer;
        var f = this.aktivt();
        return f ? this.trinNr(f, f.fase) : this.antalTrin();
    };

    /* Vaelges svaret blandt tre paa kortet? Formlen altid, tallet med valgTal */
    P.erValg = function (f, fase) {
        f = f || this.aktivt();
        if (!f) return false;
        fase = fase || f.fase;
        return fase === "formel" || (fase === "tal" && f.valgTal);
    };

    /* De tre svar og raekkefoelgen, de staar i (blandet én gang pr. trin) */
    P.valg = function (f, fase) {
        var liste = fase === "formel" ? T.formelValg(f.id, this.opg).svar : this.fane.talValg(f.id);
        if (!f.orden[fase]) f.orden[fase] = NK.bland(liste.map(function (x, j) { return j; }));
        return { liste: liste, orden: f.orden[fase] };
    };

    /* ----- Feltet paa kortet ---------------------------------------------------------
       Et tal: "n(Cl⁻) fra A = [ tallet ] mol". Skemaet: "CaCl₂(s) ⟶ [ ] Ca²⁺(aq) +
       [ ] Cl⁻(aq)". Naar trinnet er loest, staar svaret groent i stedet for feltet. */
    P.byg = function () {
        var mig = this, o = this.opg, el = this.el, f;
        el.innerHTML = "";
        el.className = "kt-felt";
        this.felter.forEach(function (x) { x.input = null; x.input2 = null; });
        if (this.laast) {
            var s = this.sidst;
            if (!s || s.valg) return;
            f = s.f;
            el.className = "kt-felt " + (s.maade === "svar" ? "svar" : "ok");
            var txt = s.fase === "koef" ? NK.Kemi.skema(D.salt(o.salt)) : T.venstre(f.id, o) + " = " + T.facitTekst(f.id, o);
            el.innerHTML = '<span class="kf-svar">' + NK.html(txt) + '</span><span class="kf-maerke">' + (s.maade === "svar" ? "↩" : "✓") + "</span>";
            return;
        }
        f = this.aktivt();
        if (!f || this.erValg(f)) return;
        function tast(inp, j, ind) {
            inp.addEventListener("keydown", function (e) {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (mig.fane.venter || mig.fane.faerdig) { mig.fane.knap(); return; }
                if (ind && j === 0 && !ind[1].value.trim()) { ind[1].focus(); return; }
                mig.fane.indsendKlik();
            });
            inp.addEventListener("input", function () { mig.fane.visKnap(); });
        }
        if (f.fase === "koef") {
            var st = D.salt(o.salt), kat = D.ion(st.kat).t, an = D.ion(st.an).t;
            el.className = "kt-felt skema";
            el.innerHTML = '<span class="kf-tekst">' + NK.html(st.formel) + "(s) ⟶</span>" +
                '<input class="koef" type="text" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Tallet foran ' + NK.html(kat) + '">' +
                '<span class="kf-tekst">' + NK.html(kat) + "(aq) +</span>" +
                '<input class="koef" type="text" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Tallet foran ' + NK.html(an) + '">' +
                '<span class="kf-tekst">' + NK.html(an) + "(aq)</span>";
            var ind = el.querySelectorAll("input");
            f.input = ind[0];
            f.input2 = ind[1];
            tast(ind[0], 0, ind);
            tast(ind[1], 1, ind);
            return;
        }
        el.innerHTML = '<span class="kf-pre">' + NK.html(T.venstre(f.id, o)) + " =</span>" +
            '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="tallet" aria-label="' +
            NK.html(T.navn(f.id, o)) + '"><span class="kf-enhed">' + NK.html(D.TRIN[f.id].enhed) + "</span>";
        f.input = el.querySelector("input");
        tast(f.input, 0, null);
    };

    P.fokus = function () {
        var f = this.aktivt();
        if (!this.aaben() || !f || !f.input || !this.el.isConnected) return;
        try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
    };

    P.ryst = function () {
        var e = this.el;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    /* ----- Svarene ------------------------------------------------------------------
       Foer et trin loeses, gemmes det, kortet viste (sidst), saa kortet kan
       blive paa spoergsmaalet med svaret, til eleven trykker Naeste. */
    P.husk = function (f, maade, j, valg) {
        var tk = this.fane.spmTekster(f, f.fase);
        this.sidst = { f: f, fase: f.fase, maade: maade, j: j, valg: valg, nr: this.trinNr(f, f.fase),
                       fejl: f.fejl.slice(), intro: tk.intro, tekst: tk.tekst, godt: tk.godt };
    };

    P.vaelgSvar = function (j, maade) {
        var f = this.aktivt();
        if (!f || !this.aaben() || !this.erValg(f) || this.fane.auto) return;
        maade = maade === "svar" ? "svar" : "ok";
        var v = this.valg(f, f.fase).liste[j];
        if (!v) return;
        if (!v.ok) {
            if (f.fejl.indexOf(j) < 0) f.fejl.push(j);
            this.fane.regnValgFejl(v.f);
            return;
        }
        this.husk(f, maade, j, true);
        if (f.fase === "formel") this.formelLoest(maade);
        else this.loes(maade);
    };

    P.tjek = function () {
        var f = this.aktivt();
        if (!f || !f.input || this.fane.auto || !this.aaben() || this.erValg(f)) return;
        var raa = f.input.value, svar;
        if (f.fase === "koef") svar = T.afstem(this.opg, f.input.value, f.input2.value);
        else svar = T.trin(f.id, raa, this.opg);
        if (svar.ok) {
            this.husk(f, "ok", null, false);
            this.loes("ok");
            return;
        }
        if (!svar.tom) this.ryst();
        var tal = f.fase === "tal" ? T.tal(raa) : null;
        this.fane.regnFejl(svar.besked, svar.tom, f.id, tal ? tal.v : null);
    };

    /* Formlen er fundet: samme linje paa tavlen spoerger nu om tallet */
    P.formelLoest = function (maade) {
        var f = this.aktivt();
        f.fase = "tal";
        f.fejl = [];
        f.formelMaade = maade;
        this.laast = true;
        this.byg();
        this.fane.regnRigtigt(maade);
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        f.fase = "tal";
        f.fejl = [];
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
        this.laast = true;
        this.byg();
        this.fane.regnLoest(f.id, maade);
    };

    /* Naeste paa kortet: det naeste trin aabner, og dets linje kommer paa tavlen */
    P.naeste = function () {
        this.laast = false;
        this.vistTil = Math.min(this.k, this.felter.length - 1);
        this.byg();
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
        if (!f || !this.aaben()) return;
        if (this.erValg(f)) {
            var v = this.valg(f, f.fase).liste;
            this.vaelgSvar(v.map(function (x) { return !!x.ok; }).indexOf(true), "svar");
            return;
        }
        this.husk(f, "svar", null, false);
        this.loes("svar");
    };

    P.regningHTML = function (id) {
        if (id === "afstem") return NK.html(T.skemaTekst(this.opg, true));
        var r = T.regning(id, this.opg);
        return NK.html(r[0] + " " + r[1]);
    };

    /* Har det aktive felt noget at sende? */
    P.harSvar = function () {
        var f = this.aktivt();
        if (!f || !f.input || !this.aaben() || this.erValg(f)) return false;
        if (f.fase === "koef") return !!(f.input.value.trim() && f.input2 && f.input2.value.trim());
        return !!f.input.value.trim();
    };

    /* Spoergsmaalet paa papirkortet til det aktive trin (ren tekst) */
    P.trinSpm = function () {
        var f = this.aktivt();
        if (!f) return "";
        /* Trinnavnet (navn) staar paa tavlen, ikke som loes saetning paa
           kortet. Spoergsmaalet skal kunne laeses alene. */
        var navn = T.navn(f.id, this.opg), v = T.venstre(f.id, this.opg), hvad = v;
        if (f.id === "Vsum") hvad = "det samlede rumfang V";
        if (f.id === "ionBland" || f.id === "ion2") hvad = v + " i blandingen";
        if (f.id === "total") hvad = v + " i glasset";
        /* Rumfanget aflaeses paa blandingsglasset; det laegges ikke sammen (runde 5, REGELSAET 9) */
        if (f.id === "Vsum") return "Hvor stort er det samlede rumfang i blandingsglasset?";
        if (f.fase === "koef") {
            var st = D.salt(this.opg.salt);
            return "Hvilke tal står foran " + D.ion(st.kat).t + " og " + D.ion(st.an).t + " i opløsningsskemaet for " + st.formel + "?";
        }
        /* Stofmaengden fra et glas spoerges i ord som i foerste opgave:
           "Hvor mange mol Cl⁻ kommer der fra glas A?" */
        var glas = (f.id === "nA" || f.id === "nB") && /^n\((.+)\) fra ([AB])$/.exec(v);
        if (glas && f.fase === "formel") return "Hvilken formel giver stofmængden af " + glas[1] + " fra glas " + glas[2] + "?";
        if (glas) return "Hvor mange mol " + glas[1] + " kommer der fra glas " + glas[2] + "?";
        if (f.fase === "formel") return "Hvilken formel giver " + hvad + "?";
        return "Hvad er " + hvad + "?";
    };

    /* Forklaringen under svaret, naar trinnet er loest */
    P.godtTekst = function (f, fase) {
        if (fase === "formel") return T.formelValg(f.id, this.opg).godt;
        if (fase === "koef") return NK.Kemi.skema(D.salt(this.opg.salt)) + ".";
        var r = T.regning(f.id, this.opg);
        return r[0] + " " + r[1] + ".";
    };

    P.trinChip = function () { return "Trin " + this.nuNr() + " af " + this.antalTrin(); };

    /* Linjen ved Indsend svar, naar eleven trykker uden at have skrevet noget */
    P.trinVej = function () {
        var f = this.aktivt();
        if (!f) return "";
        if (f.fase === "koef") return "Skriv tallene foran ionerne i skemaet på kortet, og tryk på Indsend svar.";
        if (this.erValg(f)) return "Vælg et af svarene på kortet, og tryk på Indsend svar.";
        return "Skriv tallet i feltet på kortet, og tryk på Indsend svar.";
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. data: linjerne med opgavens tal. Med tegn = false maales
       der kun (saa skriften kan skrumpe, til alt er paa tavlen). */
    function linje(ctx, dele, x, y, b, f, farver, tegn) {
        var hel = dele.join(" ");
        ctx.font = Tg.font("600", f);
        if (ctx.measureText(hel).width <= b || dele.length < 2) {
            if (!tegn) return 1;
            var s1 = NK.passendeSkrift(ctx, hel, b, f, 13.5, "600"), xx = x;
            dele.forEach(function (d, i) {
                NK.tekst(ctx, d, xx, y, { font: Tg.font("600", s1), linje: "middle", farve: farver[i] || farver[0] });
                ctx.font = Tg.font("600", s1);
                xx += ctx.measureText(d + " ").width;
            });
            return 1;
        }
        if (!tegn) return 2;
        NK.tekst(ctx, dele[0], x, y, { font: Tg.font("600", NK.passendeSkrift(ctx, dele[0], b, f, 13.5, "600")), linje: "middle", farve: farver[0] });
        var s = NK.passendeSkrift(ctx, dele.slice(1).join(" "), b - f * 1.5, f, 13.5, "600");
        NK.tekst(ctx, dele.slice(1).join(" "), x + f * 1.5, y + f * 1.5, { font: Tg.font("600", s), linje: "middle", farve: farver[1] || farver[0] });
        return 2;
    }

    /* Tavlen (runde 3, brugeren 21. nov. 2026: "den hvide tavle er forvirrende og
       indforstået"): et roligt stykke lyst papir i hoejre side. Ingen "OPGAVENS
       TAL" (tallene staar paa glassene og flasken), ingen overskrift og ingen
       "trin mere". Tavlen er ikke tegnet, til kortet spoerger om foerste linje, og
       vokser saa linje for linje. Hver linje har et navn i ord over regnestykket.
       Den linje, kortet spoerger om, har "?" og den gule ramme. Skriften maales
       med alle linjer loest, saa den ikke skifter, naar en linje dukker op;
       papiret vokser nedad med linjerne (intet staar under det). */
    P.vises = function (i) { return i <= this.vistTil; };
    P.rest = function () { return 0; };

    P.tegnTavle = function (ctx, r, data, tid) {
        var mig = this, o = this.opg, n = this.felter.length;
        this.tavleR = null;
        if (!o || this.vistTil < 0 || !n) return;
        /* Skriften: den stoerste, hvor alle linjer kan vaere der */
        var noegle = r.b + "x" + r.h + ":" + n + ":" + (o.salt || "") + JSON.stringify(o.tal || {}) + (o.c || "") + (o.m || "");
        if (this.tavleNoegle !== noegle) {
            var f = 19;
            while (f > 12.5 && this.tavleGennem(ctx, r, f, false) > r.h) f -= 0.5;
            this.tavleF = f;
            this.tavleH = Math.min(r.h, this.tavleGennem(ctx, r, f, false));
            this.tavleNoegle = noegle;
        }
        var h = Math.min(this.tavleH, this.tavleGennem(ctx, r, this.tavleF, "maal"));
        this.tavleR = { x: r.x, y: r.y, b: r.b, h: h };
        Tg.papir(ctx, r.x, r.y, r.b, h);
        this.tavleGennem(ctx, r, this.tavleF, true, tid);
        void mig;
    };

    /* Én gang gennem tavlen. tegn = false: maal alle linjer, som var de loest,
       og giv hoejden. tegn = true: tegn de linjer, der er fremme. */
    P.tavleGennem = function (ctx, r, f, tegn, tid) {
        var o = this.opg, mig = this;
        /* tegn = "maal": maal kun de linjer, der er fremme (papirets hoejde) */
        var kunFremme = tegn === "maal";
        if (kunFremme) tegn = false;
        var x = r.x + f * 0.9, b = r.b - f * 1.8, y = r.y + f * 0.75;
        var nf = NK.klamp(f * 0.82, 13.5, 16), lh = f * 1.45;
        var moerk = "#1f2530", groen = "#1d7a48", gul = "#9a6a00", navnFarve = "#5b6270";
        var puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);
        this.felter.forEach(function (fe, i) {
            if ((tegn || kunFremme) && !mig.vises(i)) return;
            var loest = fe.status === "ok" || fe.status === "svar";
            var dele, farver;
            if ((!tegn && !kunFremme) || loest) {
                dele = fe.id === "afstem" ? [NK.Kemi.skema(D.salt(o.salt))] : T.tavleRegning(fe.id, o);
                farver = fe.id === "afstem" ? [fe.status === "svar" ? gul : groen] : [moerk, fe.status === "svar" ? gul : groen];
            } else {
                dele = [fe.id === "afstem" ? T.skemaTekst(o, false) : T.tavleSpm(fe.id, o, fe.fase)];
                farver = [moerk];
            }
            var n = linje(ctx, dele, x, 0, b, f, farver, false);
            var hoej = nf * 1.3 + lh * (n === 2 ? 1.9 : 1) + f * 0.2;
            if (tegn) {
                var aktiv = fe.status === "aktiv" && !mig.laast && !mig.faerdig();
                if (aktiv) {
                    ctx.save();
                    ctx.strokeStyle = "rgba(214, 160, 20, " + (0.45 + 0.5 * puls) + ")";
                    ctx.fillStyle = "rgba(242, 197, 61, 0.1)";
                    ctx.lineWidth = 2;
                    NK.rundtRekt(ctx, x - f * 0.45, y - f * 0.25, b + f * 0.9, hoej + f * 0.1, 7);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
                NK.tekst(ctx, T.tavleNavn(fe.id, o), x, y + nf * 0.65, { font: Tg.font("600", nf), linje: "middle", farve: navnFarve });
                linje(ctx, dele, x, y + nf * 1.3 + lh * 0.5, b, f, farver, true);
            }
            y += hoej + f * 0.55;
        });
        return y - r.y + f * 0.2;
    };

    NK.Regning = Regning;

    /* ----- Det, fane 2 og 3 faar paa deres prototype --------------------------------- */
    Regning.paa = function (P2) {
        /* Teksterne til et trin: fanens egne (trinTekst), ellers de almindelige.
           Hint er en liste (hinttrappe). */
        P2.spmTekster = function (f, fase) {
            var r = this.regning, egne = this.trinTekst ? this.trinTekst(f, fase) : null;
            var std = { intro: this.kortTekst(), tekst: r.trinSpm(), hint: [r.hintHTML()], godt: r.godtTekst(f, fase) };
            if (!egne) return std;
            return { intro: egne.intro !== undefined ? egne.intro : std.intro, tekst: egne.tekst || std.tekst,
                     hint: egne.hint || std.hint, godt: egne.godt || std.godt };
        };

        P2.trinInfo = function () {
            var r = this.regning, f = r.aktivt();
            if (!f || this.venter || !r.aaben()) return null;
            var tk = this.spmTekster(f, f.fase);
            return { hints: tk.hint, hint: tk.hint[0], svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return ""; };
        P2.chipFor = function (nr, n) { return (this.kortChip ? this.kortChip() + " · " : "") + "Trin " + nr + " af " + n; };

        /* Papirkortet: spoergsmaalet til det aktive trin med svarene eller feltet
           under, og efter et rigtigt svar det samme spoergsmaal med svaret
           groent, forklaringen og Naeste. Til sidst resultatet og knappen videre. */
        P2.kortData = function () {
            var r = this.regning, mig = this, venter = this.venter || this.faerdig;
            var s = venter ? r.sidst : null, f = venter ? (s && s.f) : r.aktivt();
            if (!f) {
                return { slags: "loest", bliv: true, gul: this.sidstMaade === "svar", chip: this.kortChip(), intro: "", tekst: this.kortTekst(),
                         html: (this.slutLinje ? this.slutLinje() : "") + (this.slutEkstra ? " " + NK.html(this.slutEkstra) : ""),
                         videre: this.videreTekst() };
            }
            var fase = venter ? s.fase : f.fase;
            var tk = venter ? s : this.spmTekster(f, fase);
            var nr = venter ? s.nr : r.trinNr(f, fase);
            var k = { chip: this.chipFor(nr, r.antalTrin()), intro: tk.intro, tekst: tk.tekst, felt: !r.erValg(f, fase) };
            if (r.erValg(f, fase)) {
                var v = r.valg(f, fase), fejl = venter ? s.fejl : f.fejl, vist = venter && s.maade === "svar";
                k.svar = v.orden.map(function (j) {
                    var forkert = fejl.indexOf(j) >= 0;
                    if (venter) return { j: j, t: v.liste[j].t, rigtig: j === s.j && !vist, svarVist: j === s.j && vist, forkert: forkert,
                                         dim: j !== s.j && !forkert, laast: true };
                    return { j: j, t: v.liste[j].t, forkert: forkert, valgt: mig.valgtSvar === j && !forkert, laast: forkert || !!mig.auto };
                });
            }
            if (!venter) { k.slags = "spm"; return k; }
            k.slags = "loest";
            k.bliv = true;
            k.gul = s.maade === "svar";
            k.html = this.faerdig && !this.slutEgen ? (this.slutLinje ? this.slutLinje() : NK.html(s.godt)) : NK.html(s.godt);
            if (this.faerdig && this.slutEkstra) k.html += " " + NK.html(this.slutEkstra);
            k.videre = this.videreTekst();
            return k;
        };
        P2.spmAaben = function () { return !this.faerdig && !this.venter && !this.auto && this.regning.aaben(); };
        P2.indsendKlar = function () {
            var r = this.regning;
            if (r.erValg()) return this.valgtSvar !== null && this.valgtSvar !== undefined;
            return r.harSvar();
        };
        /* Et tal eller skemaet sendes her; et valgt svar sendes af fane.js (sendSvar) */
        P2.indsendSvar = function () {
            var r = this.regning;
            if (!r.aaben() || r.erValg()) return false;
            if (!r.harSvar()) {
                this.blinkKort();
                this.kortBesked(NK.html(r.trinVej()), 3.5, "gul");
                r.fokus();
                return true;
            }
            r.tjek();
            return true;
        };
        P2.sendSvar = function (j) { this.regning.vaelgSvar(j, "klik"); };
        P2.kortValg = function (j) {
            var r = this.regning, f = r.aktivt();
            if (!f || !r.aaben() || !r.erValg(f) || this.venter || this.auto || f.fejl.indexOf(j) >= 0) return;
            this.vaelgKortSvar(j);
        };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        /* Et rigtigt svar: kortet bliver paa spoergsmaalet, til eleven trykker Naeste */
        P2.regnRigtigt = function (maade) {
            this.hjaelp = 0;
            this.valgtSvar = null;
            if (maade === "svar") this.brugtSvar = true;
            this.venter = true;
            this.besked("", "");
            this.visKort();
        };

        P2.regnLoest = function (id, maade) {
            this.sidstMaade = maade;
            if (this.efterTrin) this.efterTrin(id, maade);
            if (this.regning.faerdig()) {
                this.hjaelp = 0;
                this.valgtSvar = null;
                if (maade === "svar") this.brugtSvar = true;
                this.opgaveLoest(maade, null);
                return;
            }
            this.regnRigtigt(maade);
        };

        P2.naesteSpm = function () {
            this.venter = false;
            this.valgtSvar = null;
            this.hjaelp = 0;
            this.regning.naeste();
            this.besked("", "");
            this.visKort();
        };

        P2.regnFejl = function (besked, tom, id, v) {
            if (tom) this.besked(NK.html(besked), "gul");
            else this.fejlLinje(NK.html(besked));
            if (!tom && this.efterFejl) this.efterFejl(id, v);
            this.fokus();
        };

        /* Et forkert svar blandt de tre: forklaringen, og svaret slaas fra */
        P2.regnValgFejl = function (forkl) {
            this.brugtSvar = true;
            this.valgtSvar = null;
            this.fejlLinje(NK.html(forkl));
            this.visKort();
        };
    };
}());
