/* =====================================================================
   fane.js - én fane: runden, opgaven, tavlen, svaret og hjaelpen

   Alle fire faner bruger den samme scene og det samme panel. Hver fane er
   et objekt, der husker sin egen runde og opgave, og kun den aktive tegner
   sig selv (vis). Opgaverne laves og tjekkes i js/tal.js.

   En runde er ti opgaver. En opgave er:
     rigtig   rigtigt svar i foerste forsoeg uden hint (groen)
     hjulpet  rigtigt efter et hint eller et forkert svar (gul)
     vist     svaret blev vist (roed)

   Al hjaelp staar i statuslinjen nederst i scenen, hvor ogsaa den ene
   store knap staar: Giv et hint › Naeste hint › Vis svaret › Naeste
   opgave. Hintet er en trappe paa tre trin (js/tal.js, hintTrin), saa
   eleven kun faar saa meget, som der bliver bedt om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tal;

    var NOEGLE_VALG = "nk-fys-potens-valg";
    var NOEGLE_REKORD = "nk-fys-potens-rekord";

    /* Kommaet, der flytter sig: pause foer foerste hop og tid pr. hop */
    var HOP_PAUSE = 0.45, HOP_TID = 0.3;

    function nuller(n) { return n > 0 ? new Array(n + 1).join("0") : ""; }
    function el(id) { return NK.el(id); }

    function Fane(id) {
        this.id = id;
        this.def = D.FANER[id];
        var gemt = NK.hent(NOEGLE_VALG, {}) || {};
        this.valg = this.def.valg ? (gemt[id] || this.def.valg[0].id) : null;
        this.niveau = this.def.niveauer ? (gemt[id + "-niveau"] || "laengde") : null;
        this.fast = { html: NK.html(D.INTRO[id]), klasse: "", maerke: "" };
        this.kortT = 0;
        this.kommaNr = 0;
        this.stige = new NK.Stige();
        this.nyRunde();
    }

    var P = Fane.prototype;

    P.aktiv = function () { return NK.aktivFane === this; };

    /* ----- Runden og opgaven ------------------------------------------ */
    P.nyRunde = function () {
        this.runde = { nr: 0, status: [], log: [], slut: false };
        this.lavOpgave();
    };

    P.lavOpgave = function () {
        var type = this.def.typer(this.valg);
        this.opg = T.lav(type, this.runde, { niveau: this.niveau });
        this.trin = T.hintTrin(this.opg);
        this.maade = this.kraevePotens() ? "pot" : "alm";
        this.hjaelp = 0;
        this.fejl = 0;
        this.loest = false;
        this.vist = false;
        this.valgtF = null;
        this.mant = "";
        this.eksp = "";
        this.hop = null;
        this.opdaterStige();
    };

    P.kraevePotens = function () {
        return this.opg.type === "potensform" || this.opg.type === "enhedspotens";
    };

    P.maadeFri = function () { return this.opg.type === "omregn"; };

    P.naeste = function () {
        if (this.runde.slut) {
            this.nyRunde();
            this.saetBesked("Ny runde. " + NK.html(D.INTRO[this.id]), "", "");
        } else {
            this.runde.nr++;
            this.lavOpgave();
            this.saetBesked("", "", "");
        }
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

    /* Knapperne i opgavekortet: et skift starter en ny runde */
    P.skiftValg = function (v) {
        if (!this.def.valg || v === this.valg) return;
        this.valg = v;
        this.gemValg(this.id, v);
        this.nyRunde();
        var navn = this.def.valg.filter(function (x) { return x.id === v; })[0].navn;
        this.saetBesked("Ny runde: " + NK.html(navn.toLowerCase()) + ".", "", "");
        this.vis();
        this.animerNy();
        this.fokus();
    };

    P.skiftNiveau = function (n) {
        var def = (this.def.niveauer || []).filter(function (x) { return x.id === n; })[0];
        if (!def || n === this.niveau) return;
        this.niveau = n;
        this.gemValg(this.id + "-niveau", n);
        this.nyRunde();
        this.saetBesked("Ny runde: " + NK.html(def.navn.toLowerCase()) + ".", "", "");
        this.vis();
        this.animerNy();
        this.fokus();
    };

    P.gemValg = function (noegle, v) {
        var gemt = NK.hent(NOEGLE_VALG, {}) || {};
        gemt[noegle] = v;
        NK.gem(NOEGLE_VALG, gemt);
    };

    /* Almindeligt tal eller 10-talspotens. Kan kun skiftes, naar opgaven
       ikke selv siger, hvordan svaret skal skrives. */
    P.skiftMaade = function (m) {
        if (this.loest || !this.maadeFri() || m === this.maade) return;
        this.maade = m;
        this.visSvarrad();
    };

    /* ----- Tjek, hint og svar ----------------------------------------- */
    P.tjek = function () {
        if (this.loest) { this.naeste(); return; }
        var svar = this.opg.type === "vaelg" ? { valgt: this.valgtF } :
            { mantisse: this.mant, eksp: this.maade === "pot" ? this.eksp : "" };
        var r = T.tjek(this.opg, svar);
        if (r.tom) { this.saetBesked(r.besked, "", ""); this.fokus(); return; }
        if (r.ok) { this.loes("ok", r); return; }
        this.fejl++;
        this.saetBesked(r.besked, "skidt", D.MAERKE.skidt);
        this.ryst();
        this.visPanel();
        this.fokus();
    };

    /* Den ene store knap i statuslinjen */
    P.knap = function () {
        if (this.loest) { this.naeste(); return; }
        if (this.hjaelp < this.trin.length) {
            this.hjaelp++;
            this.saetBesked(this.trin[this.hjaelp - 1], "hint", D.MAERKE.hint(this.hjaelp, this.trin.length));
            this.opdaterStige();
            this.visPanel();
            this.visTavle();
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
            this.skrivFacit();
            this.saetBesked(T.svar(o), "gul", D.MAERKE.svar);
        } else {
            this.saetBesked(NK.tilfaeldig(D.ROS) + " " + r.besked, "god", D.MAERKE.god);
            this.glimt();
        }
        this.startHop();
        this.opdaterStige();
        if (this.runde.status.length >= D.RUNDE) this.rundeSlut();
        this.vis();
        if (this.aktiv()) el("opgaveknap").focus();
    };

    /* Svaret kommer i felterne, saa man kan se det skrevet */
    P.skrivFacit = function () {
        var o = this.opg;
        if (o.type === "vaelg") { this.valgtF = o.facit; return; }
        if (this.kraevePotens()) {
            this.maade = "pot";
            this.mant = T.mantisse(o.facit);
            this.eksp = T.eksTekst(o.facit.p);
        } else {
            this.maade = "alm";
            this.mant = T.skillerum(T.almindelig(o.facit));
            this.eksp = "";
        }
    };

    P.rigtige = function () {
        return this.runde.status.filter(function (s) { return s === "rigtig"; }).length;
    };

    P.rundeSlut = function () {
        this.runde.slut = true;
        if (this.id === "blandet") {
            var rek = NK.hent(NOEGLE_REKORD, 0) || 0;
            if (this.rigtige() > rek) NK.gem(NOEGLE_REKORD, this.rigtige());
        }
    };

    /* ----- Stigen forneden -------------------------------------------- */
    P.opdaterStige = function () {
        this.stige.saet(this.opg, { afsloer: this.hjaelp >= 2, loest: this.loest });
    };

    /* ----- Kommaet, der flytter sig -----------------------------------
       Efter en loest opgave hopper kommaet plads for plads fra, hvor det
       stod, til hvor det skal staa. Bagefter staar facit paa tavlen. */
    P.startHop = function () {
        var o = this.opg, cif, c0, c1;
        if (o.type === "udskriv") {
            cif = o.tal.s;
            c0 = 1;
            c1 = 1 + o.eksp;
        } else if (o.type === "potensform") {
            cif = o.vis.replace(/[^\d]/g, "");
            c0 = o.vis.indexOf(",") >= 0 ? o.vis.indexOf(",") : cif.length;
            c1 = cif.search(/[1-9]/) + 1;
        } else if (o.type === "omregn") {
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
        this.stige.opdater(dt);
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

    /* Springer animationerne over (selvtesten og faneskift) */
    P.hopFaerdig = function () {
        this.stige.faerdig();
        if (this.hop && !this.hop.faerdig) {
            this.hop.c = this.hop.c1;
            this.hop.faerdig = true;
            if (this.aktiv()) this.visTavle();
        }
    };

    /* =================================================================
       VISNINGEN
       ================================================================= */
    P.erIndtastning = function () { return this.opg.type !== "vaelg"; };

    P.vis = function () {
        if (!this.aktiv()) return;
        NK.saetTekst("opg-type", T.TYPENAVN[this.opg.type]);
        NK.saetHTML("spm", this.opg.spm);
        this.visTavle();
        this.visSvarrad();
        this.visBesked();
        this.visPanel();
    };

    /* ----- Brikkerne -------------------------------------------------- */
    function brikHTML(b, klasse, klikbar) {
        if (b.komma) return '<span class="komma' + (klasse || "") + '"' + (klikbar ? ' data-komma="1"' : "") + ">,</span>";
        if (b.fortegn) return '<span class="minus">−</span>';
        if (b.andet) return '<span class="tegn">' + NK.html(b.tegn) + "</span>";
        return '<span class="brik' + (b.mellemrum ? " mr" : "") + (klasse || "") + '">' + b.tegn + "</span>";
    }

    function talHTML(str, klasse) {
        return T.brikker(T.skillerum(str)).map(function (b) {
            return brikHTML(b, klasse ? " " + klasse : "", false);
        }).join("");
    }

    function potensDel(p, klasse) {
        return '<span class="potensdel' + (klasse ? " " + klasse : "") + '">· 10<sup>' + T.eksTekst(p) + "</sup></span>";
    }

    function enhedDel(sym, klasse) {
        return '<span class="enhedsdel' + (klasse ? " " + klasse : "") + '">' + sym + "</span>";
    }

    P.visTavle = function () {
        if (!this.aktiv()) return;
        var o = this.opg, rk = "", efter = "";

        if (o.type === "vaelg") {
            /* Venstre side: tallet som det staar i opgaven, med eller uden
               tierpotens. Hoejre side: det samme tal med forstavelse. */
            var venstre = o.somPotens ? talHTML(T.mantisse(o.tal)) + potensDel(o.tal.p) : talHTML(o.vis);
            rk = venstre + enhedDel(o.enhed) + '<span class="op">=</span>' +
                talHTML(o.koefTekst, this.loest ? "facit" : "") + this.slotHTML() +
                enhedDel(o.enhed, this.loest ? "facit" : "");
            if (this.loest) efter = '<span class="efter-tekst">' + T.forstavelseTekst(o.facit) + "</span>";
        } else if (o.type === "enhedspotens") {
            rk = '<span class="etal">' + o.vis + "</span><span class=\"op\">=</span>" +
                (this.loest ? '<span class="etal facit">' + T.potensHTML(o.facit) + " " + o.enhed + "</span>"
                    : '<span class="spoerg">?</span>');
            if (this.loest) {
                efter = '<span class="tegn-lig">=</span>' + talHTML(T.almindelig(o.facit), "facit") + enhedDel(o.enhed, "facit");
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

    /* Det tomme felt, forstavelsen skal ind i */
    P.slotHTML = function () {
        var valgt = this.valgtF;
        var k = "slot";
        if (this.loest) k += this.vist ? " vist" : " ok";
        else if (valgt) k += " valgt";
        return '<span class="' + k + '">' + (valgt || "⬚") + "</span>";
    };

    /* Tallet paa tavlen: foer, under og efter hoppet */
    P.hopHTML = function () {
        var o = this.opg, h = this.hop;
        if (!h) {
            if (o.type === "udskriv") return talHTML(T.mantisse(o.tal)) + potensDel(o.eksp) + enhedDel(o.enhed);
            if (o.type === "omregn") return talHTML(o.vis) + enhedDel(o.fra);
            return talHTML(o.vis) + enhedDel(o.enhed);
        }
        if (h.faerdig) {
            if (o.type === "potensform") {
                return talHTML(T.mantisse(o.facit), "facit") + potensDel(o.facit.p, "facit") + enhedDel(o.enhed, "facit");
            }
            if (o.type === "omregn") return talHTML(T.almindelig(o.facit), "facit") + enhedDel(o.til, "facit");
            return talHTML(T.almindelig(o.facit), "facit") + enhedDel(o.enhed, "facit");
        }
        /* Undervejs: nuller fyldes paa foran eller bagved, naar kommaet
           kommer uden for cifrene. De nye nuller har en stiplet kant. */
        var cif = h.cif, c = h.c, foran = c <= 0 ? 1 - c : 0, bag = c > cif.length ? c - cif.length : 0;
        var d = nuller(foran) + cif + nuller(bag), komma = c + foran, ud = "";
        while (komma > 1 && d.charAt(0) === "0") { d = d.slice(1); komma--; }
        for (var i = 0; i < d.length; i++) {
            if (i === komma) ud += '<span class="komma hop">,</span>';
            var ny = i < foran || i >= d.length - bag;
            ud += '<span class="brik lille-ind' + (ny ? " ny" : "") + '">' + d.charAt(i) + "</span>";
        }
        if (komma >= d.length) ud += '<span class="komma hop slut">,</span>';
        if (o.type === "potensform") ud += potensDel(h.c0 - h.c, "taeller");
        else if (o.type === "udskriv") ud += potensDel(o.eksp - (h.c - h.c0), "taeller");
        ud += enhedDel(o.type === "omregn" ? o.fra : o.enhed);
        return ud;
    };

    P.hopTekst = function () {
        var o = this.opg, h = this.hop;
        if (!h) return "";
        var n = this.hopTrin(), vej = h.c1 > h.c0 ? "højre" : "venstre";
        var t = n === 0 ? "Kommaet står stille" : "Kommaet: " + T.pladser(n) + " til " + vej;
        if (o.type === "omregn") t = o.fra + " til " + o.til + ". " + t;
        return '<span class="efter-tekst' + (h.faerdig ? "" : " mat") + '">' + t + "</span>";
    };

    /* ----- Svaret ----------------------------------------------------- */
    P.visSvarrad = function () {
        if (!this.aktiv()) return;
        var o = this.opg, mig = this, chips = o.type === "vaelg";
        el("chips").hidden = !chips;
        el("felter").hidden = chips;
        el("svarmaade").hidden = chips;

        if (chips) {
            NK.saetHTML("chips", T.VALGBARE.map(function (f) {
                var k = "chip";
                if (mig.loest && f === o.facit) k += mig.vist ? " vist" : " ok";
                else if (f === mig.valgtF) k += mig.loest ? " gal" : " valgt";
                return '<button type="button" class="' + k + '" data-f="' + f + '"' + (mig.loest ? " disabled" : "") +
                    '><b>' + f + "</b><span>" + T.NAVNE[f] + "</span></button>";
            }).join(""));
        } else {
            var fri = this.maadeFri(), pot = this.maade === "pot";
            Array.prototype.forEach.call(el("svarmaade").querySelectorAll("[data-maade]"), function (b) {
                var valgt = b.getAttribute("data-maade") === mig.maade;
                b.classList.toggle("valgt", valgt);
                b.setAttribute("aria-pressed", valgt ? "true" : "false");
                b.disabled = mig.loest || !fri;
            });
            el("potens").hidden = !pot;
            el("felter").classList.toggle("pot", pot);
            var enh = o.type === "omregn" ? o.til : o.enhed;
            el("svar-enhed").textContent = enh;
            el("svar-enhed").hidden = !enh;
            var m = el("svar-m"), e = el("svar-e");
            if (m.value !== this.mant) m.value = this.mant;
            if (e.value !== this.eksp) e.value = this.eksp;
            m.readOnly = e.readOnly = this.loest;
            el("fortegn").disabled = this.loest;
            el("felter").classList.toggle("ok", this.loest && !this.vist);
            el("felter").classList.toggle("vist", this.vist);
        }

        var tjek = el("tjek");
        tjek.hidden = this.loest;
    };

    /* ----- Statuslinjen ----------------------------------------------- */
    P.saetBesked = function (html, klasse, maerke) {
        this.fast = { html: html || "", klasse: klasse || "", maerke: maerke || "" };
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
        var b = this.kortT > 0 ? { html: this.kortHTML, klasse: "", maerke: "" } : this.fast;
        var e = el("besked");
        e.innerHTML = (b.maerke ? '<span class="b-maerke">' + NK.html(b.maerke) + "</span>" : "") + b.html;
        var linje = el("statuslinje");
        linje.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
        /* Knappen lyser stille op efter et forkert svar, til hintet er givet */
        el("opgaveknap").classList.toggle("lyser", !this.loest && this.fejl > 0 && this.hjaelp === 0);
    };

    P.beskedTekst = function () { return el("besked").textContent; };

    P.ryst = function () {
        var linje = el("statuslinje");
        linje.classList.remove("ryster");
        void linje.offsetWidth;
        linje.classList.add("ryster");
        var e = el(this.opg.type === "vaelg" ? "chips" : "felter");
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.glimt = function () {
        var e = el("tavle");
        e.classList.remove("glimt");
        void e.offsetWidth;
        e.classList.add("glimt");
    };

    /* ----- Panelet ---------------------------------------------------- */
    P.visPanel = function () {
        if (!this.aktiv()) return;
        var r = this.runde, mig = this;
        NK.saetTekst("kort-titel", this.def.navn);
        NK.saetTekst("kort-nr", String(Math.min(r.nr + 1, D.RUNDE)));

        var vh = "";
        if (this.def.valg) {
            vh = this.def.valg.map(function (v) {
                return '<button type="button" class="vaelger' + (v.id === mig.valg ? " valgt" : "") +
                    '" data-valg="' + v.id + '">' + v.navn + "</button>";
            }).join("");
        }
        NK.saetHTML("vaelgere", vh);
        el("vaelgere").hidden = !vh;

        var nh = "", note = "";
        if (this.def.niveauer) {
            nh = this.def.niveauer.map(function (n) {
                if (n.id === mig.niveau) note = n.note;
                return '<button type="button" class="vaelger niveau' + (n.id === mig.niveau ? " valgt" : "") +
                    '" data-niveau="' + n.id + '" title="' + NK.html(n.note) + '">' + n.navn + "</button>";
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
        else if (this.hjaelp === 0) knap.textContent = "Giv et hint";
        else if (this.hjaelp < this.trin.length) knap.textContent = "Næste hint (" + (this.hjaelp + 1) + " af " + this.trin.length + ")";
        else knap.textContent = "Vis svaret";
        knap.className = "knap hjaelp" + (this.loest ? " videre" : "") +
            (!this.loest && this.fejl > 0 && this.hjaelp === 0 ? " lyser" : "");

        NK.saetTekst("rigtige", String(this.rigtige()));
        var lh = r.log.map(function (l, n) {
            return '<li class="' + l.status + '"><span class="rl-nr">' + (n + 1) + '</span><span class="rl-opg">' +
                T.kortOpgave(l.opg) + '</span><span class="rl-svar">' + T.facitHTML(l.opg) + "</span></li>";
        }).join("");
        NK.saetHTML("rundeliste", lh);
        el("rundenote").hidden = !!lh;

        var rek = el("rekord");
        var rekord = NK.hent(NOEGLE_REKORD, 0) || 0;
        rek.hidden = !(this.id === "blandet" && rekord > 0);
        if (!rek.hidden) rek.innerHTML = "Rekord: <b>" + rekord + " af " + D.RUNDE + "</b>";
    };

    /* ----- Klik og taster --------------------------------------------- */
    P.vaelgForstavelse = function (f) {
        if (this.loest || this.opg.type !== "vaelg") return;
        this.valgtF = this.valgtF === f ? null : f;
        this.visTavle();
        this.visSvarrad();
    };

    /* Paaskeaeg: et klik paa kommaet */
    P.klikKomma = function () {
        this.kortBesked(NK.html(D.KOMMA[this.kommaNr % D.KOMMA.length]), 4);
        this.kommaNr++;
    };

    P.skriv = function (mant, eksp) {
        if (this.loest) return;
        this.mant = mant;
        this.eksp = eksp;
    };

    P.fokus = function () {
        if (!this.aktiv() || document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        if (this.loest) { el("opgaveknap").focus(); return; }
        if (this.erIndtastning()) el("svar-m").focus();
    };

    NK.Fane = Fane;
}());
