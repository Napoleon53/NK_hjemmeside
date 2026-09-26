/* =====================================================================
   fane.js - én fane: runden, opgaven, tavlen, svarfeltet og hjaelpen

   Alle fire faner bruger den samme scene og det samme panel. Hver fane
   er et objekt, der husker sin egen runde og opgave, og kun den aktive
   tegner sig selv (vis). Opgaverne laves og tjekkes i js/cifre.js.

   En runde er ti opgaver, som i den gamle c4.10. En opgave er:
     rigtig   rigtigt svar i foerste forsoeg uden hint (groen)
     hjulpet  rigtigt efter et hint eller et forkert svar (gul)
     vist     svaret blev vist (roed)
   Tallet "rigtige i foerste forsoeg" er de groenne, som i den gamle,
   hvor kun foerste svar talte.

   Knappen i opgavekortet er Giv hint, Vis svaret og Naeste opgave (til
   sidst Ny runde). Tjek staar ved svarfeltet, og Enter goer det samme.
   Kemichael siger kun noget ved Giv hint og Vis svaret (js/laerer.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var C = NK.Cifre;

    var NOEGLE_VALG = "nk-sc4.10-valg";
    var NOEGLE_REKORD = "nk-sc4.10-rekord";

    /* Kommaet, der flytter sig: pause foer foerste hop og tid pr. hop */
    var HOP_PAUSE = 0.45, HOP_TID = 0.3;

    function nuller(n) { return n > 0 ? new Array(n + 1).join("0") : ""; }
    function el(id) { return NK.el(id); }

    function Fane(id, laerer) {
        this.id = id;
        this.def = D.FANER[id];
        this.k = laerer;
        var gemt = NK.hent(NOEGLE_VALG, {}) || {};
        this.valg = this.def.valg ? (gemt[id] || this.def.valg[0].id) : null;
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
        this.lavOpgave();
    };

    P.lavOpgave = function () {
        var type = this.def.typer(this.valg);
        this.opg = C.lav(type, this.runde, { foran: this.id === "tael" && this.runde.nr === 0 });
        this.hjaelp = 0;
        this.fejl = 0;
        this.loest = false;
        this.vist = false;
        this.valgt = {};
        this.mant = "";
        this.eksp = "";
        this.hop = null;
    };

    P.naeste = function () {
        if (this.runde.slut) {
            this.nyRunde();
            this.saetBesked("Ny runde. " + NK.html(D.INTRO[this.id]), "");
        } else {
            this.runde.nr++;
            this.lavOpgave();
            this.saetBesked(this.opg.type === "tael" && this.id !== "tael" ? NK.html(D.INTRO.tael) : "", "");
        }
        if (this.k) this.k.tie();
        this.vis();
        this.animerNy();
        this.fokus();
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
        if (this.k) this.k.tie();
        this.vis();
        this.animerNy();
        this.fokus();
    };

    /* ----- Tjek, hint og svar --------------------------------------------------------- */
    P.valgteListe = function () {
        var mig = this;
        return Object.keys(this.valgt).filter(function (i) { return mig.valgt[i]; }).map(Number).sort(function (a, b) { return a - b; });
    };

    P.tjek = function () {
        if (this.loest) { this.naeste(); return; }
        var svar = this.opg.type === "tael" ? { valgt: this.valgteListe() } : { mantisse: this.mant, eksp: this.eksp };
        var r = C.tjek(this.opg, svar);
        if (r.tom) { this.saetBesked(r.besked, ""); this.fokus(); return; }
        if (r.ok) { this.loes("ok", r); return; }
        this.fejl++;
        this.saetBesked(r.besked, "skidt");
        this.ryst();
        this.fokus();
    };

    /* Knappen i opgavekortet */
    P.knap = function () {
        if (this.loest) { this.naeste(); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var h = "<b>Hint:</b> " + C.hint(this.opg);
            if (!(this.k && this.k.sig(h, "hint"))) this.saetBesked(h, "gul");
            this.visPanel();
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
                this.mant = C.mantisse(o.facit);
                this.eksp = String(o.facit.p).replace("-", "−");
            } else {
                this.mant = C.skillerum(C.almindelig(o.facit));
                this.eksp = "";
            }
            var s = C.svar(o);
            if (this.k && this.k.sig(s, "svar")) this.saetBesked("Svaret står hos Kemichael. Tryk Næste opgave, når du har set det.", "gul");
            else this.saetBesked(s, "gul");
        } else {
            if (this.k) this.k.tie();
            this.saetBesked(NK.tilfaeldig(D.ROS) + " " + r.besked + (r.note ? " " + r.note : ""), "god");
        }
        this.startHop();
        if (this.runde.status.length >= D.RUNDE) this.rundeSlut();
        this.vis();
        var tjek = el("tjek");
        if (tjek && this.aktiv() && !this.erIndtastning()) tjek.focus();
    };

    P.rigtige = function () {
        return this.runde.status.filter(function (s) { return s === "rigtig"; }).length;
    };

    P.rundeSlut = function () {
        this.runde.slut = true;
        if (this.id === "blandet") {
            var r = this.rigtige(), rek = NK.hent(NOEGLE_REKORD, 0) || 0;
            if (r > rek) NK.gem(NOEGLE_REKORD, r);
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
        NK.saetTekst("opg-type", C.TYPENAVN[this.opg.type]);
        NK.saetHTML("spm", this.opg.spm);
        this.visTavle();
        this.visSvarrad();
        this.visMaaler();
        this.visBesked();
        this.visPanel();
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
        var o = this.opg, tael = o.type === "tael";
        el("valgt-info").hidden = !tael;
        el("felter").hidden = tael;
        if (tael) {
            var n = this.valgteListe().length;
            NK.saetHTML("valgt-info", n ? "Valgt: <b>" + n + "</b> " + (n === 1 ? "ciffer" : "cifre") : "Ingen valgt endnu");
        } else {
            var potens = o.type === "afrund" || o.type === "regn" || o.type === "potens";
            el("potens").hidden = !potens;
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
        var tjek = el("tjek");
        tjek.textContent = this.loest ? (this.runde.slut ? "Ny runde ↺" : "Næste →") : "Tjek";
        tjek.classList.toggle("videre", this.loest);
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

    /* ----- Linjen under svarfeltet -----------------------------------------------------
       saetBesked: den faste linje (naeste skridt, fejl, ros). kortBesked:
       et svar paa et klik, der forsvinder igen efter sek sekunder. */
    P.saetBesked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.kortT = 0;
        this.visBesked();
    };

    P.kortBesked = function (html, sek) {
        this.kortT = sek || 4;
        this.kortHTML = html;
        this.visBesked();
    };

    P.visBesked = function () {
        if (!this.aktiv()) return;
        var b = this.kortT > 0 ? { html: this.kortHTML, klasse: "" } : this.fast;
        var e = el("besked");
        e.innerHTML = b.html;
        e.className = "besked" + (b.klasse ? " " + b.klasse : "");
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

        var ph = "";
        for (var i = 0; i < D.RUNDE; i++) {
            var s = r.status[i];
            ph += '<i class="' + (s || (i === r.nr && !r.slut ? "nu" : "")) + '"></i>';
        }
        NK.saetHTML("prikker", ph);

        var slut = el("kort-slut");
        if (r.slut) {
            var rig = this.rigtige();
            var t = "Runden er slut: <b>" + rig + " af " + D.RUNDE + "</b> rigtige i første forsøg. " + D.SLUT(rig, D.RUNDE);
            if (this.id === "blandet" && rig === D.RUNDE) t += " " + D.TI_AF_TI;
            slut.innerHTML = t;
        }
        slut.hidden = !r.slut;

        var knap = el("opgaveknap");
        if (this.loest) knap.textContent = r.slut ? "Ny runde ↺" : "Næste opgave →";
        else knap.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        knap.className = "knap stor" + (this.loest ? " blaa banker" : "");

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
        if (this.opg.type === "tael" && this.loest) return;
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
        if (this.k) this.k.skriver();
        this.visMaaler();
    };

    P.ryst = function () {
        var e = el(this.opg.type === "tael" ? "talrk" : "felter");
        e.classList.remove("ryst", "ny-opg");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.fokus = function () {
        if (!this.aktiv() || document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        if (this.loest) { el("tjek").focus(); return; }
        if (this.erIndtastning()) el("svar-m").focus();
    };

    /* K: han siger, hvor man er (henter ham, hvis han er ude) */
    P.kemichael = function () {
        if (!this.k) return;
        if (!this.k.inde()) { this.k.hentInd(); return; }
        this.k.sig(NK.html(D.KEMICHAEL[this.id]), "", { lukVedSkriv: true });
    };

    NK.Fane = Fane;
}());
