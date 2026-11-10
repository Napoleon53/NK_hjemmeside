/* =====================================================================
   fane.js - én fane: runden, opgaven, tavlen, svarfeltet og hjaelpen

   Alle fire faner bruger den samme scene og det samme panel. Hver fane
   er et objekt, der husker sin egen runde og opgave, og kun den aktive
   tegner sig selv (vis). Opgaverne laves og tjekkes i js/cifre.js.

   En runde er ti opgaver, som i den gamle c5.10. En opgave er:
     rigtig   rigtigt svar i foerste forsoeg uden hint (groen)
     hjulpet  rigtigt efter et hint eller et forkert svar (gul)
     vist     svaret blev vist (roed)
   Tallet "rigtige i foerste forsoeg" er de groenne, som i den gamle,
   hvor kun foerste svar talte.

   Papirkortet (brugerens beslutning 4. nov. 2026): opgaven, hintet,
   beskeden ved et forkert svar, forklaringen og knapperne staar paa ét
   lyst kort oeverst i midten af scenen (#skort, udseendet fra
   ../faelles/papirkort.css). Tavlen og svarfeltet staar under kortet,
   og kortZone() er pladsen, kortet har. Et klik paa en brik eller en
   indtastning vaelger kun; Indsend svar (eller Enter) sender svaret og
   er graa, til der er noget at sende. Den gule knap er Giv hint og Vis
   svaret. Efter et rigtigt svar bliver kortet paa opgaven: tavlen og
   feltet er groenne, forklaringen staar under opgaven, og Naeste opgave
   staar, hvor Indsend svar stod (NK.Papir.bliv). Efter den tiende opgave
   hedder knappen Se resultatet, og kortet viser runden med Videre til
   den naeste fane. Ny runde staar kun i panelet (og tasten R), aldrig
   paa kortet. Efter et forkert svar lyser den gule knap stille op.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var C = NK.Cifre;

    var NOEGLE_VALG = "nk-sc5.10-valg";
    var NOEGLE_REKORD = "nk-sc5.10-rekord";
    var NOEGLE_KLARET = "nk-sc5.10-enheder";   /* de enhedsniveauer, der er klaret */

    function klaret() { return NK.hent(NOEGLE_KLARET, {}) || {}; }
    function oplaast(k) { k = k || klaret(); return !!(k.let && k.middel && k.svaer); }
    NK.enhederOplaast = oplaast;

    var LAAS_SVG = '<svg class="laas" viewBox="0 0 12 14" aria-hidden="true"><rect x="1.5" y="6" width="9" height="7" rx="1.5" fill="currentColor"/>' +
        '<path d="M3.5 6V4.3a2.5 2.5 0 0 1 5 0V6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

    /* Kommaet, der flytter sig: pause foer foerste hop og tid pr. hop */
    var HOP_PAUSE = 0.45, HOP_TID = 0.3;

    function nuller(n) { return n > 0 ? new Array(n + 1).join("0") : ""; }
    function el(id) { return NK.el(id); }

    function Fane(id) {
        this.id = id;
        this.def = D.FANER[id];
        var gemt = NK.hent(NOEGLE_VALG, {}) || {};
        this.valg = this.def.valg ? (gemt[id] || this.def.valg[0].id) : null;
        this.niveau = this.def.niveauer ? (gemt[id + "-niveau"] || "let") : null;
        if (this.niveau === "meget" && !oplaast()) this.niveau = "let";
        this.fast = { html: NK.html(D.INTRO[id]), klasse: "" };
        this.kortT = 0;
        this.kommaNr = 0;
        this.nyRunde();
    }

    var P = Fane.prototype;

    P.aktiv = function () { return NK.aktivFane === this; };

    /* ----- Runden og opgaven -------------------------------------------------------- */
    P.nyRunde = function () {
        this.runde = { nr: 0, status: [], log: [], enCiffer: false, slut: false };
        this.resultat = false;
        this.lavOpgave();
    };

    /* Ny runde fra panelet eller tasten R (aldrig fra kortet) */
    P.forfra = function () {
        this.nyRunde();
        this.saetBesked("Ny runde. " + NK.html(D.INTRO[this.id]), "");
        this.vis();
        this.animerNy();
        this.fokus();
    };

    P.lavOpgave = function () {
        var type = this.def.typer(this.valg);
        this.opg = C.lav(type, this.runde, { foran: this.id === "tael" && this.runde.nr === 0, niveau: this.niveau });
        /* Svaret starter altid som almindeligt tal, saa 10-feltet ikke
           laegger op til videnskabelig notation (brugerens oenske 27. sept.
           2026). Kun "Skriv i videnskabelig notation" starter med det. */
        this.maade = this.opg.type === "potens" ? "pot" : "alm";
        this.hjaelp = 0;
        this.fejl = 0;
        this.loest = false;
        this.vist = false;
        this.valgt = {};
        this.mant = "";
        this.eksp = "";
        this.hop = null;
        this.blivTekst = "";
        this.rosOrd = "Rigtigt";
    };

    /* Knappen, der foerer videre paa kortet: naeste opgave, efter den tiende
       resultatet og derfra den naeste fane. Den begynder aldrig forfra. */
    P.naeste = function () {
        if (this.resultat) { this.videre(); return; }
        if (this.runde.slut) {
            this.resultat = true;
            this.saetBesked("", "");
            this.vis();
            this.fokus();
            return;
        } else {
            this.runde.nr++;
            this.lavOpgave();
            this.saetBesked(this.opg.type === "tael" && this.id !== "tael" ? NK.html(D.INTRO.tael) : "", "");
        }
        this.vis();
        this.animerNy();
        this.fokus();
    };

    /* Den naeste fane efter resultatet (ingen efter Blandet) */
    P.naesteFane = function () {
        var i = D.FANE_RAEKKE.indexOf(this.id);
        return i >= 0 && i < D.FANE_RAEKKE.length - 1 ? D.FANE_RAEKKE[i + 1] : null;
    };

    P.videre = function () {
        var n = this.naesteFane();
        if (n && NK.visFane) NK.visFane(n);
        else this.kortBlink();
    };

    /* En ny opgave glider let ind, saa man kan se, at tallet er skiftet */
    P.animerNy = function () {
        if (!this.aktiv()) return;
        var e = el("talrk");
        e.classList.remove("ny-opg", "ryst");
        void e.offsetWidth;
        e.classList.add("ny-opg");
    };

    /* Knapperne Maaletal / Regnestykker og Notation / Enheder: en ny runde */
    P.skiftValg = function (v) {
        if (!this.def.valg || v === this.valg) return;
        this.valg = v;
        var gemt = NK.hent(NOEGLE_VALG, {}) || {};
        gemt[this.id] = v;
        NK.gem(NOEGLE_VALG, gemt);
        this.nyRunde();
        var navn = this.def.valg.filter(function (x) { return x.id === v; })[0].navn;
        this.saetBesked("Ny runde: " + NK.html(navn.toLowerCase()) + ".", "");
        this.vis();
        this.animerNy();
        this.fokus();
    };

    /* Enhedernes niveauer: en ny runde. Meget svær er laast, til Let,
       Middel og Svær er klaret. */
    P.skiftNiveau = function (n) {
        var def = (this.def.niveauer || []).filter(function (x) { return x.id === n; })[0];
        if (!def || n === this.niveau) return;
        if (def.laast && !oplaast()) {
            this.kortBesked(NK.html(D.LAAST), 6);
            return;
        }
        this.niveau = n;
        var gemt = NK.hent(NOEGLE_VALG, {}) || {};
        gemt[this.id + "-niveau"] = n;
        NK.gem(NOEGLE_VALG, gemt);
        this.nyRunde();
        this.saetBesked("Ny runde: enheder, " + NK.html(def.navn.toLowerCase()) + ".", "");
        this.vis();
        this.animerNy();
        this.fokus();
    };

    /* Almindeligt tal eller videnskabelig notation. Kan kun skiftes,
       naar opgaven ikke selv siger, hvordan tallet skal skrives. */
    P.maadeFri = function () {
        var t = this.opg.type;
        return t === "afrund" || t === "regn" || t === "enhed";
    };

    P.skiftMaade = function (m) {
        if (this.loest || !this.maadeFri() || m === this.maade) return;
        this.maade = m;
        this.visSvarrad();
        this.visMaaler();
    };

    /* ----- Tjek, hint og svar --------------------------------------------------------- */
    P.valgteListe = function () {
        var mig = this;
        return Object.keys(this.valgt).filter(function (i) { return mig.valgt[i]; }).map(Number).sort(function (a, b) { return a - b; });
    };

    /* Er der noget at sende: mindst én brik valgt, eller noget i feltet */
    P.kanSendes = function () {
        if (this.loest || this.resultat) return false;
        if (this.opg.type === "tael") return this.valgteListe().length > 0;
        return String(this.mant || "").replace(/\s+/g, "") !== "";
    };

    /* Indsend svar (og Enter). Paa et loest kort er det knappen videre. */
    P.tjek = function () {
        if (this.loest || this.resultat) { this.naeste(); return; }
        var svar = this.opg.type === "tael" ? { valgt: this.valgteListe() } :
            { mantisse: this.mant, eksp: this.maade === "pot" ? this.eksp : "" };
        var r = C.tjek(this.opg, svar);
        if (!this.kanSendes()) { this.saetBesked(r.besked || "", ""); this.kortBlink(); this.fokus(); return; }
        if (r.tom) { this.saetBesked(r.besked, ""); this.fokus(); return; }
        if (r.ok) { this.loes("ok", r); return; }
        this.fejl++;
        this.saetBesked(r.besked, "skidt");
        this.ryst();
        this.fokus();
    };

    /* Den gule knap paa kortet: Giv hint, saa Vis svaret */
    P.knap = function () {
        if (this.loest || this.resultat) { this.naeste(); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.saetBesked('<span class="b-maerke">Hint</span>' + C.hint(this.opg), "gul");
            this.visKnapper();
            this.fokus();
            return;
        }
        this.loes("svar");
    };

    P.loes = function (maade, r) {
        var o = this.opg;
        this.loest = true;
        this.vist = maade === "svar";
        var status = this.vist ? "vist" : (this.fejl || this.hjaelp ? "hjulpet" : "rigtig");
        this.runde.status.push(status);
        this.runde.log.push({ opg: o, status: status });
        if (this.vist) {
            /* Svaret kommer i felterne, saa man kan se det skrevet */
            if (o.type === "tael") {
                this.valgt = {};
                var mig = this;
                o.betydende.forEach(function (i) { mig.valgt[i] = true; });
            } else if (o.type === "potens" || (o.type === "afrund" || o.type === "regn") && !C.kanAlmindelig(o.facit)) {
                this.maade = "pot";
                this.mant = C.mantisse(o.facit);
                this.eksp = String(o.facit.p).replace("-", "−");
            } else {
                this.maade = "alm";
                this.mant = C.skillerum(C.almindelig(o.facit));
                this.eksp = "";
            }
            this.blivTekst = C.svar(o);
        } else {
            /* Rosen er maerket foran forklaringen; den staar kun paa dette kort */
            this.rosOrd = NK.tilfaeldig(D.ROS).replace(/\.$/, "");
            this.blivTekst = r.besked + (r.note ? " " + r.note : "");
        }
        this.saetBesked("", "");
        this.startHop();
        if (this.runde.status.length >= D.RUNDE) this.rundeSlut();
        this.vis();
        this.fokus();
    };

    P.rigtige = function () {
        return this.runde.status.filter(function (s) { return s === "rigtig"; }).length;
    };

    P.rundeSlut = function () {
        this.runde.slut = true;
        var r = this.rigtige();
        if (this.id === "blandet") {
            var rek = NK.hent(NOEGLE_REKORD, 0) || 0;
            if (r > rek) NK.gem(NOEGLE_REKORD, r);
        }
        /* Et enhedsniveau er klaret med mindst D.OPLAAS rigtige i foerste
           forsoeg. Er Let, Middel og Svær klaret, er Meget svær aaben. */
        if (this.def.niveauer && this.valg === "enhed" && this.niveau !== "meget" && r >= D.OPLAAS) {
            var k = klaret(), foer = oplaast(k);
            k[this.niveau] = true;
            NK.gem(NOEGLE_KLARET, k);
            this.runde.laastOp = !foer && oplaast(k);
        }
    };

    /* ----- Kommaet, der flytter sig ------------------------------------------------------
       Efter en loest opgave med notation eller enheder hopper kommaet
       plads for plads fra, hvor det stod, til hvor det skal staa, og
       eksponenten taeller med. Bagefter staar facit paa tavlen. */
    P.startHop = function () {
        var o = this.opg, cif, c0, c1;
        if (o.type === "potens") {
            cif = o.vis.replace(/[^\d]/g, "");
            c0 = o.vis.indexOf(",") >= 0 ? o.vis.indexOf(",") : cif.length;
            c1 = cif.search(/[1-9]/) + 1;
        } else if (o.type === "almindelig") {
            cif = o.tal.s;
            c0 = 1;
            c1 = 1 + o.eksp;
        } else if (o.type === "enhed") {
            cif = o.vis.replace(/[^\d]/g, "");
            c0 = o.vis.indexOf(",") >= 0 ? o.vis.indexOf(",") : cif.length;
            c1 = c0 + o.k;
        } else {
            this.hop = null;
            return;
        }
        this.hop = { cif: cif, c: c0, c0: c0, c1: c1, t: -HOP_PAUSE, faerdig: false };
    };

    P.hopTrin = function () { return this.hop ? Math.abs(this.hop.c - this.hop.c0) : 0; };

    P.opdater = function (dt) {
        if (this.kortT > 0) {
            this.kortT -= dt;
            if (this.kortT <= 0) { this.kortT = 0; this.visBesked(); }
        }
        var h = this.hop;
        if (!h || h.faerdig) return;
        h.t += dt;
        var skift = false;
        while (h.t >= HOP_TID && h.c !== h.c1) {
            h.t -= HOP_TID;
            h.c += h.c1 > h.c ? 1 : -1;
            skift = true;
        }
        if (h.c === h.c1 && h.t >= HOP_TID) { h.faerdig = true; skift = true; }
        if (skift && this.aktiv()) this.visTavle();
    };

    /* Springer animationen over (selvtesten og faneskift) */
    P.hopFaerdig = function () {
        if (this.hop && !this.hop.faerdig) {
            this.hop.c = this.hop.c1;
            this.hop.faerdig = true;
            if (this.aktiv()) this.visTavle();
        }
    };

    /* =================================================================================
       VISNINGEN
       ================================================================================= */
    P.erIndtastning = function () { return this.opg.type !== "tael"; };

    P.vis = function () {
        if (!this.aktiv()) return;
        this.visKort();
        this.visTavle();
        this.visSvarrad();
        this.visMaaler();
        this.visBesked();
        this.visPanel();
    };

    /* ----- Papirkortet -------------------------------------------------------------------
       Pladsen til kortet oeverst i scenen (--kortzone i css/stil.css, mindre
       paa lave skaerme). Tavlen begynder under den, saa kortet aldrig daekker
       cifrene. Selvtesten maaler kortet med det laengste hint og svar. */
    P.kortZone = function () {
        var v = parseFloat(window.getComputedStyle(el("scene")).getPropertyValue("--kortzone"));
        return isFinite(v) && v > 0 ? v : 170;
    };

    /* Etiketten: Opgave 3 af 10 (i Blandet med opgavens slags foran) */
    P.chip = function () {
        var t = "Opgave " + Math.min(this.runde.nr + 1, D.RUNDE) + " af " + D.RUNDE;
        return this.id === "blandet" ? C.TYPENAVN[this.opg.type] + ", " + t.toLowerCase() : t;
    };

    P.kortHTML = function () {
        if (this.resultat) {
            var rig = this.rigtige(), n = this.naesteFane();
            var t = "<b>" + rig + " af " + D.RUNDE + "</b> rigtige i første forsøg. " + D.SLUT(rig, D.RUNDE);
            if (this.id === "blandet" && rig === D.RUNDE) t += " " + D.TI_AF_TI;
            if (this.runde.laastOp) t += " <b>" + D.LAAST_OP + "</b>";
            return '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">Runden er slut</span>' + t + "</p>" +
                (n ? '<button type="button" class="sk-videre" data-videre="1">Videre til ' + NK.html(D.FANER[n].navn) + " →</button>" : "") + "</div>";
        }
        var spm = NK.Papir ? NK.Papir.tekst(this.opg.spm) : this.opg.spm;
        var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(this.chip()) + "</span>" + spm + "</p>";
        if (this.loest) {
            var knap = this.runde.slut ? "Se resultatet →" : "Næste opgave →";
            html += NK.Papir ? NK.Papir.bliv(this.blivTekst, this.vist ? "Svaret" : this.rosOrd, knap, this.vist) :
                '<p class="st-tekst">' + this.blivTekst + '</p><button type="button" class="sk-videre" data-videre="1">' + knap + "</button>";
        }
        return html;
    };

    P.visKort = function () {
        if (!this.aktiv()) return;
        var e = el("skort");
        var kl = "scenekort " + (this.resultat ? "loest" : (this.loest ? "loest bliv" + (this.vist ? " svar" : "") : "opgave"));
        if (e.className.replace(" blink", "") !== kl) e.className = kl;
        NK.saetHTML("sk-ind", this.kortHTML());
        this.visKnapper();
    };

    /* Kortets nederste raekke: beskeden, den gule knap og Indsend svar. Naar
       opgaven er loest, er raekken vaek (forklaringen og knappen videre staar
       i kortets oeverste del), medmindre et klik lige har faaet et svar. */
    P.visKnapper = function () {
        if (!this.aktiv()) return;
        var knap = el("opgaveknap"), ind = el("tjek"), slut = this.loest || this.resultat;
        knap.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        knap.className = "knap hjaelp" + (this.hjaelp ? " svar" : "") + (this.peg && !slut && this.hjaelp === 0 ? " peg" : "");
        var kan = this.kanSendes();
        ind.classList.toggle("klar", kan);
        ind.classList.toggle("ikke-klar", !kan);
        ind.setAttribute("aria-disabled", kan ? "false" : "true");
        knap.hidden = ind.hidden = slut;
        el("sk-bund").hidden = slut && !(this.kortT > 0);
    };

    /* Kortet blinker blødt: eleven klikkede paa tavlen, mens kortet venter
       paa Naeste, eller trykkede Indsend svar uden noget at sende */
    P.kortBlink = function () {
        var e = el("skort");
        if (!e || !this.aktiv()) return;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* ----- Brikkerne ------------------------------------------------------------------ */
    function brikHTML(b, klasse, klikbar) {
        if (b.komma) return '<span class="komma' + (klasse || "") + '"' + (klikbar ? ' data-komma="1"' : "") + ">,</span>";
        if (b.fortegn) return '<span class="minus">−</span>';
        return '<button type="button" class="brik' + (b.mellemrum ? " mr" : "") + (klasse || "") + '" data-i="' + b.i + '"' +
            (klikbar ? "" : ' tabindex="-1"') + ">" + b.tegn + "</button>";
    }

    /* Et tal skrevet som tekst: alle brikker med samme klasse */
    function talHTML(str, klasse) {
        return C.brikker(C.skillerum(str)).map(function (b) { return brikHTML(b, klasse ? " " + klasse : "", false); }).join("");
    }

    function potensDel(p, klasse) {
        return '<span class="potensdel' + (klasse ? " " + klasse : "") + '">· 10<sup>' + (p < 0 ? "−" + (-p) : p) + "</sup></span>";
    }

    P.visTavle = function () {
        if (!this.aktiv()) return;
        var o = this.opg, mig = this, rk = "", efter = "";
        if (o.type === "tael") {
            var bet = {};
            o.betydende.forEach(function (i) { bet[i] = true; });
            rk = C.brikker(C.skillerum(o.vis)).map(function (b) {
                if (!b.ciffer) return brikHTML(b, "", !mig.loest);
                var k = "";
                if (mig.loest) k = bet[b.i] ? " bet" : " ikke";
                else if (mig.valgt[b.i]) k = " valgt";
                return brikHTML(b, k, !mig.loest);
            }).join("");
            if (this.loest) efter = '<span class="efter-tekst">' + C.cifreTekst(o.facit) + "</span>";
        } else if (o.type === "afrund") {
            var f = o.vis.replace(/[^\d]/g, "").search(/[1-9]/);
            rk = C.brikker(C.skillerum(o.vis)).map(function (b) {
                if (!b.ciffer) return brikHTML(b, "", false);
                var k = "";
                if (mig.loest) {
                    var j = b.i - f;
                    k = b.i < f ? " foran" : (j < o.n ? " behold" : (j === o.n ? " afgoer" : " vaek"));
                } else if (mig.valgt[b.i]) k = " mark";
                return brikHTML(b, k, false);
            }).join("");
            if (this.loest) efter = '<span class="tegn-lig">≈</span>' + this.facitHTML(o.facit, "facit");
        } else if (o.type === "regn") {
            rk = this.faktorHTML(o.a, o.A, 0) + '<span class="op">' + o.op + "</span>" + this.faktorHTML(o.b, o.B, 100) +
                '<span class="op">=</span>' + (this.loest ? "" : '<span class="spoerg">?</span>');
            if (this.loest) {
                efter = '<span class="efter-tekst mat">Lommeregneren: ' + C.html(o.praecis) + "</span>" +
                    '<span class="tegn-lig">≈</span>' + this.facitHTML(o.facit, "facit");
            }
        } else {
            rk = this.hopHTML();
            efter = this.hopTekst();
        }
        NK.saetHTML("talrk", rk);
        NK.saetHTML("efter", efter);
        el("tavle").classList.toggle("loest", this.loest);
        el("tavle").classList.toggle("vist", this.vist);
    };

    /* En faktor i et regnestykke med antallet af betydende cifre under, som i
       den gamle. Brikkerne nummereres fra start, saa de kan markeres hver for sig. */
    P.faktorHTML = function (str, t, start) {
        var mig = this;
        var br = C.brikker(str).map(function (b) {
            if (!b.ciffer) return brikHTML(b, "", false);
            var i = start + b.i;
            return brikHTML({ tegn: b.tegn, ciffer: true, i: i }, mig.valgt[i] ? " mark" : "", false);
        }).join("");
        return '<span class="faktor">' + br + '<span class="tag">' + t.s.length + " " + (t.s.length === 1 ? "ciffer" : "cifre") + "</span></span>";
    };

    /* Facit som groenne brikker: almindeligt, eller med tierpotens */
    P.facitHTML = function (t, klasse) {
        if (C.kanAlmindelig(t)) return talHTML(C.almindelig(t), klasse);
        return talHTML(C.mantisse(t), klasse) + potensDel(t.p, klasse);
    };

    /* Tallet paa tavlen i notation og enheder: foer, under og efter hoppet */
    P.hopHTML = function () {
        var o = this.opg, h = this.hop;
        if (!h) {
            if (o.type === "almindelig") return talHTML(C.mantisse(o.tal)) + potensDel(o.eksp);
            if (o.type === "enhed") return talHTML(o.vis) + '<span class="enhedsdel">' + o.fra + "</span>";
            return talHTML(o.vis);
        }
        if (h.faerdig) {
            if (o.type === "potens") return talHTML(C.mantisse(o.facit), "facit") + potensDel(o.facit.p, "facit");
            if (o.type === "almindelig") return talHTML(C.almindelig(o.facit), "facit");
            return talHTML(C.almindelig(o.facit), "facit") + '<span class="enhedsdel facit">' + o.til + "</span>";
        }
        /* Undervejs: nuller fyldes paa foran eller bagved, naar kommaet
           kommer uden for cifrene. De nye nuller har en stiplet kant. */
        var cif = h.cif, c = h.c, foran = c <= 0 ? 1 - c : 0, bag = c > cif.length ? c - cif.length : 0;
        var d = nuller(foran) + cif + nuller(bag), komma = c + foran, ud = "";
        /* Nuller foran, som kommaet er gaaet forbi, falder vaek: 0,032 og ikke 00,032 */
        while (komma > 1 && d.charAt(0) === "0") { d = d.slice(1); komma--; }
        for (var i = 0; i < d.length; i++) {
            if (i === komma) ud += '<span class="komma hop">,</span>';
            var ny = i < foran || i >= d.length - bag;
            ud += '<span class="brik lille-ind' + (ny ? " ny" : "") + '">' + d.charAt(i) + "</span>";
        }
        if (komma >= d.length) ud += '<span class="komma hop slut">,</span>';
        if (o.type === "potens") ud += potensDel(h.c0 - h.c, "taeller");
        else if (o.type === "almindelig") ud += potensDel(o.eksp - (h.c - h.c0), "taeller");
        else ud += '<span class="enhedsdel">' + o.fra + "</span>";
        return ud;
    };

    P.hopTekst = function () {
        var o = this.opg, h = this.hop;
        if (!h) return "";
        var n = this.hopTrin(), vej = h.c1 > h.c0 ? "højre" : "venstre";
        var t = n + " " + (n === 1 ? "plads" : "pladser") + " til " + vej;
        if (o.type === "enhed") t = o.fra + " til " + o.til + ": " + t;
        return '<span class="efter-tekst' + (h.faerdig ? "" : " mat") + '">Kommaet: ' + t + "</span>";
    };

    /* ----- Svarfeltet ---------------------------------------------------------------- */
    P.visSvarrad = function () {
        if (!this.aktiv()) return;
        var o = this.opg, tael = o.type === "tael", mig = this;
        el("valgt-info").hidden = !tael;
        el("felter").hidden = tael;
        el("svarmaade").hidden = tael;
        if (tael) {
            var n = this.valgteListe().length;
            NK.saetHTML("valgt-info", n ? "Valgt: <b>" + n + "</b> " + (n === 1 ? "ciffer" : "cifre") : "Ingen valgt endnu");
        } else {
            /* Svarmaaden: det valgte er blaat. Siger opgaven selv, hvordan
               tallet skal skrives, kan der ikke skiftes. */
            var fri = this.maadeFri(), pot = this.maade === "pot";
            Array.prototype.forEach.call(el("svarmaade").querySelectorAll("[data-maade]"), function (b) {
                var valgt = b.getAttribute("data-maade") === mig.maade;
                b.classList.toggle("valgt", valgt);
                b.setAttribute("aria-pressed", valgt ? "true" : "false");
                b.disabled = mig.loest || !fri;
            });
            el("potens").hidden = !pot;
            el("felter").classList.toggle("pot", pot);
            el("svar-enhed").textContent = o.type === "enhed" ? o.til : "";
            el("svar-enhed").hidden = o.type !== "enhed";
            var m = el("svar-m"), e = el("svar-e");
            if (m.value !== this.mant) m.value = this.mant;
            if (e.value !== this.eksp) e.value = this.eksp;
            m.readOnly = e.readOnly = this.loest;
            el("fortegn").disabled = this.loest;
            el("felter").classList.toggle("ok", this.loest && !this.vist);
            el("felter").classList.toggle("vist", this.vist);
        }
        this.visKnapper();
    };

    /* Maaleren under feltet: hvor mange betydende cifre dit eget tal har.
       Naar opgaven siger antallet, staar der lige saa mange prikker. */
    P.visMaaler = function () {
        if (!this.aktiv()) return;
        var o = this.opg, maal = o.type === "afrund" || o.type === "potens" ? o.n : 0;
        var vis = !this.loest && (maal || o.type === "regn");
        var mel = el("maaler");
        mel.hidden = !vis;
        if (!vis) return;
        var sv = C.laesSvar(this.mant, "");
        var k = sv.tal ? C.antal(sv.mantisse) : 0;
        var html = "";
        if (maal) {
            for (var i = 0; i < Math.max(maal, k); i++) {
                html += '<i class="' + (i < k ? (k > maal ? "over" : "fyldt") : "") + '"></i>';
            }
        }
        var tekst = k ? "Dit tal har " + C.cifreTekst(k) : (maal ? "0 af " + maal : "");
        if (maal && k > maal) tekst += ", " + (k - maal) + " for mange";
        NK.saetHTML("maaler", '<span class="prikker-m">' + html + "</span><span>" + tekst + "</span>");
    };

    /* ----- Linjen paa kortet -------------------------------------------------------------
       saetBesked: den faste linje (naeste skridt, fejl og hint). Efter et
       forkert svar lyser hintknappen stille op. kortBesked: et svar paa et
       klik, der forsvinder igen efter sek sekunder. */
    P.saetBesked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.kortT = 0;
        this.peg = klasse === "skidt" && !this.loest && this.hjaelp === 0;
        this.visBesked();
    };

    P.kortBesked = function (html, sek) {
        this.kortT = sek || 4;
        this.kortTekst = html;
        this.visBesked();
    };

    P.visBesked = function () {
        if (!this.aktiv()) return;
        var b = this.kortT > 0 ? { html: this.kortTekst, klasse: "" } : this.fast;
        el("besked").innerHTML = b.html;
        el("sk-bund").className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom");
        this.visKnapper();
    };

    P.beskedTekst = function () { return el("besked").textContent; };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.visPanel = function () {
        if (!this.aktiv()) return;
        var r = this.runde, mig = this;
        NK.saetTekst("kort-titel", this.def.navn);
        NK.saetTekst("kort-nr", String(Math.min(r.nr + 1, D.RUNDE)));

        var vh = "";
        if (this.def.valg) {
            vh = this.def.valg.map(function (v) {
                return '<button type="button" class="vaelger' + (v.id === mig.valg ? " valgt" : "") + '" data-valg="' + v.id + '">' + v.navn + "</button>";
            }).join("");
        }
        NK.saetHTML("vaelgere", vh);
        el("vaelgere").hidden = !vh;

        /* Enhedernes niveauer med flueben ved dem, der er klaret, og en laas
           paa Meget svær, til de tre andre er klaret */
        var nh = "", note = "";
        if (this.def.niveauer && this.valg === "enhed") {
            var kl = klaret(), aaben = oplaast(kl);
            nh = this.def.niveauer.map(function (n) {
                var laast = n.laast && !aaben;
                if (n.id === mig.niveau) note = n.note;
                return '<button type="button" class="vaelger niveau' + (n.id === mig.niveau ? " valgt" : "") + (laast ? " laast" : "") +
                    '" data-niveau="' + n.id + '" title="' + NK.html(laast ? D.LAAST : n.note) + '"' + (laast ? ' aria-disabled="true"' : "") + ">" +
                    (laast ? LAAS_SVG : "") + n.navn + (kl[n.id] ? '<span class="flueben" title="Klaret">✓</span>' : "") + "</button>";
            }).join("");
        }
        NK.saetHTML("niveauer", nh);
        el("niveauer").hidden = !nh;
        NK.saetTekst("niveaunote", note);
        el("niveaunote").hidden = !nh;

        var ph = "";
        for (var i = 0; i < D.RUNDE; i++) {
            var s = r.status[i];
            ph += '<i class="' + (s || (i === r.nr && !r.slut ? "nu" : "")) + '"></i>';
        }
        NK.saetHTML("prikker", ph);

        NK.saetTekst("rigtige", String(this.rigtige()));
        var lh = r.log.map(function (l, n) {
            return '<li class="' + l.status + '"><span class="rl-nr">' + (n + 1) + '</span><span class="rl-opg">' + mig.kortOpgave(l.opg) +
                '</span><span class="rl-svar">' + C.facitHTML(l.opg) + "</span></li>";
        }).join("");
        NK.saetHTML("rundeliste", lh);
        el("rundenote").hidden = !!lh;

        var rek = el("rekord");
        var rekord = NK.hent(NOEGLE_REKORD, 0) || 0;
        rek.hidden = !(this.id === "blandet" && rekord > 0);
        if (!rek.hidden) rek.innerHTML = "Rekord: <b>" + rekord + " af " + D.RUNDE + "</b>";
    };

    /* Opgaven kort, til listen over runden */
    P.kortOpgave = function (o) {
        if (o.type === "afrund") return C.skillerum(o.vis) + " <em>til " + o.n + "</em>";
        if (o.type === "enhed") return C.skillerum(o.vis) + " " + o.fra + " <em>i " + o.til + "</em>";
        return C.opgaveHTML(o);
    };

    /* ----- Klik og taster ------------------------------------------------------------- */
    P.klikBrik = function (i) {
        if (this.loest || this.resultat) { this.kortBlink(); return; }
        this.valgt[i] = !this.valgt[i];
        if (this.opg.type !== "tael" && !this.markeretSagt) {
            this.markeretSagt = true;
            this.kortBesked("Du kan markere cifrene for at tælle dem. Svaret skriver du i feltet.", 4);
        }
        this.visTavle();
        this.visSvarrad();
    };

    /* Paaskeaeg: kommaet er ikke et ciffer */
    P.klikKomma = function () {
        this.kortBesked(NK.html(D.KOMMA[this.kommaNr % D.KOMMA.length]), 4);
        this.kommaNr++;
    };

    P.skriv = function (mant, eksp) {
        if (this.loest) return;
        this.mant = mant;
        this.eksp = eksp;
        this.visMaaler();
        this.visKnapper();
    };

    P.ryst = function () {
        var e = el(this.opg.type === "tael" ? "talrk" : "felter");
        e.classList.remove("ryst", "ny-opg");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.fokus = function () {
        if (!this.aktiv() || document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        if (this.loest || this.resultat) {
            var v = document.querySelector("#sk-ind [data-videre]");
            if (v) v.focus();
            return;
        }
        if (this.erIndtastning()) el("svar-m").focus();
    };

    NK.Fane = Fane;
}());
