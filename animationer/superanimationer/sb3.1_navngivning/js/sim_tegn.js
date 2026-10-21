/* =====================================================================
   sim_tegn.js - fane 1: Tegn molekylet

   Navnet staar paa kortet, delt i forled, stamme og endelse. Eleven
   tegner molekylet paa whiteboardet med molekylemotorens tavle, den
   samme som paa tegnebraettet: traek eller klik bygger kaeden, og en
   gruppe saettes paa med ét klik.

   Tegningen tjekkes kun, naar eleven trykker Test (eller Enter) nederst
   paa whiteboardet (brugerens oenske 20. okt. 2026: "svaer at tegne uden
   at man konstant faar skaeld ud"). Hedder tegningen det samme som
   opgaven, er den loest. Ellers staar navnet paa tegningen roedt ved
   Test-knappen og ryster, og kortet siger, hvilken del af navnet der
   ikke passer. Kontakten "Vis navnet hele tiden" (slaaet fra, hver gang
   siden aabnes) viser navnet paa det tegnede samme sted, mens eleven
   tegner, som paa tegnebraettet.

   Det, der er anderledes end paa tegnebraettet (se klik nedenfor):
     * = Binding: et klik paa en binding goer den dobbelt, tripel og
       enkelt igen (Kaede goer det samme)
     * −Cl og −Br saetter et halogenatom paa carbonatomet; de andre
       grupper kan kun saettes paa carbonatomer
     * −COOH goer carbonatomet for enden af kaeden til carbonatomet i
       COOH (=O og −OH paa det), saa startatomet alene bliver methansyre
     * Slet: et venstreklik paa et atom for enden af kaeden sletter det,
       som et hoejreklik (vaerktoejet bliver valgt, til et andet vaelges)
     * Kaede paa et O, Cl eller Br bygger ikke videre, og et klik i den
       tomme tavle saetter ikke et nyt atom
     * Ring paa en tom tavle (kun startatomet) laegger ringen i stedet for
       startatomet
   Efter en gruppe, et halogenatom og en ring gaar vaerktoejet selv
   tilbage til Kaede.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;

    function SimTegn() {
        var mig = this;
        this.stoffer = {};
        this.vaerktoejEl = NK.el("t-vaerktoej");
        this.braet = new NK.Tegnebraet({
            felt: function () { return mig.felt(); },
            skala: function () { return mig.skala(); },
            regler: {
                kunC: false, dobbelt: true, tripel: true, knaek: true, sletAlt: false,
                maks: function () { return mig.stof ? mig.stof.antal + 6 : 99; },
                maksTekst: function () { return "Der er ikke plads til flere atomer. Slet et atom med højreklik, eller tryk Fortryd."; }
            },
            aendret: function (hvad) { mig.aendret(hvad); },
            toast: function (t) { if (t && !mig.faerdig) mig.kortBesked(t, 3.5); }
        });
        var b = this.braet, gammelKlik = NK.Tegnebraet.prototype.klik;
        b.klik = function (u, pt) {
            var v = this.vaerktoej;
            if (!u && v !== "ring6") { this.toast("Klik på et atom, eller træk fra et atom, for at tegne videre."); return; }
            if (v === "binding") {
                if (u.slags === "binding") this.skiftBinding(u.binding);
                else this.toast("Klik på stregen mellem to carbonatomer.");
                return;
            }
            if (v === "ring6") {
                /* Paa en tom tavle (kun startatomet) kommer ringen i stedet for startatomet */
                if (this.mol.atomer.length === 1 && !this.mol.bindinger.length) {
                    /* Fortryd skal give startatomet tilbage, ikke en tom tavle */
                    var foer = this.mol, billede = this.billede();
                    this.mol = new NK.Molekyle();
                    if (this.ring(this.midte(), 6, false)) this.hist[this.hist.length - 1] = billede;
                    else this.mol = foer;
                    return;
                }
                gammelKlik.call(this, u, pt);
                return;
            }
            if (u.slags === "atom" && u.atom.el !== "C") {
                this.toast(v === "tegn" ? "Kæden bygges fra carbonatomer. Klik på et carbonatom." : "Klik på et carbonatom.");
                return;
            }
            if (v.indexOf("halogen:") === 0) {
                if (u.slags === "atom") this.nytFra(u.atom.id, v.slice(8));
                else this.toast("Klik på et carbonatom.");
                return;
            }
            if (v === "gruppe:COOH") {
                if (u.slags === "atom") mig.saetCOOH(u.atom.id);
                else this.toast("Klik på carbonatomet for enden af kæden.");
                return;
            }
            gammelKlik.call(this, u, pt);
        };
        NK.el("t-fortryd").addEventListener("click", function () { mig.fortryd(); });
        NK.el("t-ryd").addEventListener("click", function () { mig.nulstil(); });
        this.bundEl = NK.el("t-bund");
        this.navnEl = NK.el("t-navn");
        this.testEl = NK.el("t-test");
        this.kontaktEl = NK.el("t-visnavn");
        this.visAltid = false;
        this.testEl.addEventListener("click", function () { mig.test(); });
        this.kontaktEl.addEventListener("click", function () { mig.visAltid = !mig.visAltid; mig.visNavn(); });
        this.vaerktoejEl.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-vt]") : null;
            if (k) mig.vaelgVaerktoej(k.getAttribute("data-vt"));
        });
        this.startFane();
    }

    var P = SimTegn.prototype;
    F.paa(P, { navn: "t", naesteFane: "fane-s", naesteNavn: "Skriv navnet" });

    /* ----- Opgaverne ------------------------------------------------------------
       Niveau for niveau, og inden for et niveau skiftes stofklasserne, saa de
       ikke kommer i klumper. Den foerste opgave er en kaede, man traekker. */
    P.lavOpgaver = function (aktive) {
        return K.raekkefoelge(D.STOFFER.filter(function (o) { return o.fane === "t" && aktive.indexOf(o.k) >= 0; }));
    };

    /* Kortet: opgaven og navnets dele (ingen brikker) */
    P.kortZone = function () { return window.innerHeight <= 720 ? 172 : 196; };

    P.nyOpgave = function (opg) {
        if (!this.stoffer[opg.id]) this.stoffer[opg.id] = K.stof(opg.o);
        this.stof = this.stoffer[opg.id];
        var b = this.braet;
        b.atomFarve = b.bindingFarve = b.lokanter = null;
        b.laast = false;
        b.hist = [];
        b.frem = [];
        this.saetter = true;
        b.nulstil(true, true);
        this.saetter = false;
        this.liveNavn = null;
        this.testet = null;
        this.bygVaerktoej();
        this.vaelgVaerktoej("tegn");
        this.visNavn();
    };

    P.aktiveSkiftet = function () { this.bygVaerktoej(); };

    /* ----- Vaerktoejerne ------------------------------------------------------------
       De vaerktoejer, de valgte stofklasser bruger, og dem, opgavens eget stof
       har brug for */
    P.behov = function () {
        var s = this.stof ? this.stof.sig : null, ud = {};
        if (!s) return ud;
        if (s.OH || s.COOH) ud["gruppe:OH"] = true;
        if (s.COOH) { ud["gruppe:O"] = true; ud["gruppe:COOH"] = true; }
        if (s.dbl || s.tri) ud.binding = true;
        if (s.Cl) ud["halogen:Cl"] = true;
        if (s.Br) ud["halogen:Br"] = true;
        if (s.ring) ud.ring6 = true;
        return ud;
    };

    P.bygVaerktoej = function () {
        var med = (this.aktive || []).slice(), behov = this.behov(), html = "";
        this.vaerktoejer = D.VAERKTOEJ.filter(function (v) {
            return !v.klasser || behov[v.id] || v.klasser.some(function (k) { return med.indexOf(k) >= 0; });
        });
        this.vaerktoejer.forEach(function (v) {
            html += '<button type="button" class="vtknap" data-vt="' + v.id + '" title="' + NK.html(v.titel) + '">' + NK.html(v.tekst) + "</button>";
        });
        NK.saetHTML("t-vt", html);
        /* Tripelbindinger kun, naar alkynerne er med (eller stoffet har en) */
        this.braet.r.tripel = med.indexOf("alkyn") >= 0 || !!(this.stof && this.stof.sig.tri);
        this.visVaerktoej();
    };

    P.vaelgVaerktoej = function (id) {
        if (this.faerdig) return;
        /* Slet staar ved Fortryd og Ryd i index.html, ikke i data.js */
        if (id !== "slet" && !this.vaerktoejer.some(function (v) { return v.id === id; })) id = "tegn";
        this.braet.vaerktoej = id;
        this.braet.grundstof = "C";
        this.visVaerktoej();
    };

    P.visVaerktoej = function () {
        var nu = this.braet.vaerktoej;
        Array.prototype.forEach.call(this.vaerktoejEl.querySelectorAll("[data-vt]"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-vt") === nu);
        });
        this.vaerktoejEl.classList.toggle("laast", !!this.faerdig);
    };

    /* −COOH: carbonatomet, der klikkes paa, bliver til carbonatomet i COOH
       (=O og −OH saettes paa det), saa det taeller med i kaeden som i navnet.
       Brugeren 21. okt. 2026: "undgaa at COOH automatisk bliver til ethansyre"
       (startatomet blev til CH3COOH, naar man ville tegne methansyre).
       Ét Fortryd tager hele gruppen tilbage. */
    P.saetCOOH = function (id) {
        var b = this.braet, mol = b.mol, nb = mol.naboer(id);
        var cNb = nb.filter(function (x) { return mol.atom(x).el === "C"; });
        if (cNb.length > 1) { b.toast("COOH sidder for enden af kæden. Klik på et carbonatom for enden."); return false; }
        if (nb.length > cNb.length || !mol.ledig(id, 3)) {
            b.toast("Der er ikke plads til COOH på det carbonatom.");
            return false;
        }
        var foer = b.billede(), hist = b.hist.slice();
        this.saetter = true;
        var ok = b.saetGruppe(id, "O") && b.saetGruppe(id, "OH");
        this.saetter = false;
        b.hist = hist;
        if (!ok) { b.gendan(foer); return false; }
        b.hist.push(foer);
        if (b.hist.length > 80) b.hist.shift();
        b.frem = [];
        this.aendret("atom");
        return true;
    };

    /* Slet: et venstreklik paa et atom for enden af kaeden sletter det, som
       et hoejreklik. Er kun startatomet tilbage, gaar vaerktoejet til Kaede. */
    P.slet = function (u) {
        var b = this.braet;
        if (!u || u.slags !== "atom") { b.toast("Klik på et atom for enden af kæden."); return; }
        if (b.antal() <= 1) { b.toast("Startatomet bliver stående. Vælg Kæde for at tegne."); return; }
        if (b.sletAtom(u.atom) && b.antal() <= 1) this.vaelgVaerktoej("tegn");
    };

    P.fortryd = function () {
        if (this.faerdig) { this.kortBlink(); return; }
        if (!this.braet.fortryd()) this.kortBesked("Der er ikke mere at fortryde.", 3);
    };

    /* Ryd tavlen (ogsaa tasten R): kun startatomet bliver. Fortryd faar tegningen tilbage. */
    P.nulstilScene = function () {
        this.braet.nulstil(true);
        this.vaelgVaerktoej("tegn");
        this.besked("", "");
    };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.dele = function () {
        return this.stof.dele.map(function (d) { return { type: d.type, tekst: d.tekst, fyldt: true }; });
    };

    P.kortData = function () {
        return {
            slags: "opgave", chip: "Opgave " + (this.nr + 1),
            tekst: "Tegn molekylet på tavlen.",
            ekstra: F.navnHTML(this.dele(), { stor: true })
        };
    };

    P.slutEkstra = function () { return F.navnHTML(this.dele(), { stor: true }); };

    P.svarValg = function () { };

    P.hintNu = function () { return this.faerdig || !this.stof ? [] : K.tegneHints(this.stof); };

    /* ----- Efter hver aendring: kun navnet holdes ved lige, der tjekkes ikke ------------ */
    P.aendret = function (hvad) {
        if (this.saetter || this.faerdig || !this.stof) return;
        var b = this.braet;
        /* Efter en gruppe, et halogenatom og en ring gaar vaerktoejet tilbage til Kaede */
        if ((hvad === "atom" || hvad === "ring") && /^(gruppe:|halogen:|ring6)/.test(b.vaerktoej)) { b.vaerktoej = "tegn"; this.visVaerktoej(); }
        if (hvad === "vaerktoej") { this.visVaerktoej(); return; }
        var res = this.navnNu();
        this.liveNavn = res && res.navn ? res.navnUdenStereo : null;
        /* Det roede navn fra sidste Test passer ikke laengere til tegningen */
        if (this.testet && this.testet.navn !== this.liveNavn) this.testet = null;
        this.visNavn();
    };

    /* ----- Test: foerst nu faar tegningen et navn og en dom ---------------------------
       Forklaringen paa kortet bliver staaende, til eleven trykker Test igen. */
    P.test = function () {
        if (this.faerdig) { this.kortBlink(); return; }
        if (!this.stof) return;
        var b = this.braet, mol = b.mol;
        if (mol.atomer.length <= 1 && !mol.bindinger.length) {
            this.kortBesked("Tegn molekylet først. Træk fra carbonatomet, så vokser kæden.", 3.5);
            return;
        }
        var res = this.navnNu();
        if (res && res.navnUdenStereo === this.stof.res.navnUdenStereo) { this.klaret(); return; }
        this.testet = { navn: res && res.navn ? res.navnUdenStereo : null };
        this.besked('<span class="b-maerke">Ikke endnu</span> ' + NK.html(K.tegneFejl(this.stof, mol)), "skidt");
        this.pegKnap = true;
        this.visKnap();
        this.visNavn(true);
    };

    /* Nederst paa whiteboardet: navnet ved Test-knappen. Det staar der efter
       Test (roedt, og det ryster), naar opgaven er loest (groent), og hele
       tiden, naar kontakten er slaaet til. */
    P.visNavn = function (ryst) {
        var t = this.testet, html = "", kl = "tb-navn";
        if (this.faerdig) { html = "Tegningen hedder: <b>" + NK.html(this.stof.navn) + "</b> ✓"; kl += " rigtig"; }
        else if (t) { html = t.navn ? "Tegningen hedder: <b>" + NK.html(t.navn) + "</b>" : "Tegningen har intet navn"; kl += " forkert"; }
        else if (this.visAltid && this.liveNavn) html = "Tegningen hedder: <b>" + NK.html(this.liveNavn) + "</b>";
        var e = this.navnEl;
        e.innerHTML = html;
        e.className = kl;
        if (ryst) { void e.offsetWidth; e.classList.add("ryster"); }
        this.testEl.hidden = !!this.faerdig;
        this.kontaktEl.classList.toggle("til", this.visAltid);
        this.kontaktEl.setAttribute("aria-checked", this.visAltid ? "true" : "false");
    };

    /* Navnet paa tegningen, som det staar under den. Startatomet alene har intet navn. */
    P.navnNu = function () {
        var mol = this.braet.mol;
        if (mol.atomer.length <= 1 && !mol.bindinger.length) return null;
        if (mol.fragmenter().length !== 1) return null;
        return NK.Navn.analyser(mol);
    };

    P.klaret = function () {
        var b = this.braet;
        b.laast = true;
        b.traek = null;
        b.spoegelse = null;
        this.liveNavn = this.stof.navn;
        this.testet = null;
        this.farvTegning();
        this.loest("selv", K.forklaring(this.stof), this.stof.navn + ".");
        this.visVaerktoej();
        this.visNavn();
    };

    /* Den faerdige tegning faar navnedelenes farver: kaeden blaa (stamme),
       gruppen og dobbeltbindingen groen (endelse), sidegrupperne orange (forled) */
    P.farvTegning = function () {
        var b = this.braet, mol = b.mol, s = this.stof, a = {}, bf = {};
        var res = NK.Navn.analyser(mol), sig = K.sig(mol, res);
        function kant(x, y) { return x < y ? x + "-" + y : y + "-" + x; }
        function maal(maengde, farve, medBindinger) {
            mol.bindinger.forEach(function (bd) {
                var begge = maengde[bd.a] && maengde[bd.b], en = maengde[bd.a] || maengde[bd.b];
                if (begge || (medBindinger && en)) bf[kant(bd.a, bd.b)] = farve;
            });
            Object.keys(maengde).forEach(function (id) { if (mol.atom(Number(id)).el !== "C") a[id] = farve; });
        }
        var kaede = {};
        (res.kaede || []).forEach(function (id) { kaede[id] = true; });
        maal(kaede, D.DELE.stamme.blaek, false);
        (res.sub || []).forEach(function (x) {
            var m = {};
            (x.atomer || []).forEach(function (id) { m[id] = true; });
            maal(m, D.DELE.forled.blaek, true);
        });
        if (s.p.endelse) {
            var g = {};
            sig.ohAtomer.concat(sig.coohAtomer).forEach(function (id) { if (mol.atom(id).el === "O") g[id] = true; });
            /* hydroxy er et forled: dens O er allerede orange */
            Object.keys(g).forEach(function (id) { if (a[id]) delete g[id]; });
            maal(g, D.DELE.endelse.blaek, true);
        } else if (s.p.umaettet) {
            mol.bindinger.forEach(function (bd) {
                if (bd.orden > 1 && mol.atom(bd.a).el === "C" && mol.atom(bd.b).el === "C") bf[kant(bd.a, bd.b)] = D.DELE.endelse.blaek;
            });
        }
        b.atomFarve = function (id) { return a[id] || null; };
        b.bindingFarve = function (bd) { return bf[kant(bd.a, bd.b)] || null; };
    };

    P.visSvar = function () {
        var b = this.braet;
        this.saetter = true;
        b.saet(this.stof.mol.kopi(), true);
        this.saetter = false;
        this.klaret();
    };

    /* ----- Layout og tegningen ---------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.vaerktoejEl.style.left = (t.x + 10) + "px";
        this.vaerktoejEl.style.top = (t.y + 8) + "px";
        this.vaerktoejEl.style.width = (t.b - 20) + "px";
        this.bundEl.style.left = (t.x + 10) + "px";
        this.bundEl.style.top = (t.y + t.h - BUND - 8) + "px";
        this.bundEl.style.width = (t.b - 20) + "px";
        this.saetAnker("tavle", t.x, t.y + 54, t.b, t.h - 54 - BUND - 12);
    };

    /* Hoejden paa raekken nederst (kontakten, navnet og Test), som i stil.css */
    var BUND = 40;

    /* Der tegnes mellem vaerktoejslinjen og raekken nederst */
    P.felt = function () {
        var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 700, h: 450 };
        return { x: t.x, y: t.y + 50, b: t.b, h: t.h - 50 - BUND - 14 };
    };

    P.skala = function () {
        var f = this.felt();
        return Math.round(NK.klamp(Math.min(f.b / 12, f.h / 5.6), 34, 76));
    };

    /* ----- Musen: tavlen faar det hele -------------------------------------------------- */

    /* Markoeren paa tavlen. Systemets tynde krydsmarkoer har naesten samme farve
       som det lyse whiteboard (brugeren 21. okt. 2026: "samme farve som
       baggrunden"), saa krydset er vores eget: moerkt med hvid kant og en blaa
       prik, hvor der klikkes. Med Slet er det et roedt kryds. */
    /* 32 px: stoerre billeder viser Windows ikke altid */
    function svgMarkoer(svg, reserve) {
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") 16 16, ' + reserve;
    }
    var KRYDS_STREGER = "M16 3v9M16 20v9M3 16h9M20 16h9";
    var MARKOER_KRYDS = svgMarkoer("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
        "<path d='" + KRYDS_STREGER + "' stroke='#ffffff' stroke-width='7' stroke-linecap='round'/>" +
        "<path d='" + KRYDS_STREGER + "' stroke='#1d2433' stroke-width='3.4' stroke-linecap='round'/>" +
        "<circle cx='16' cy='16' r='3.8' fill='#2a76ac' stroke='#ffffff' stroke-width='1.8'/></svg>", "crosshair");
    var MARKOER_SLET = svgMarkoer("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
        "<path d='M7 7l18 18M25 7L7 25' stroke='#ffffff' stroke-width='8.5' stroke-linecap='round'/>" +
        "<path d='M7 7l18 18M25 7L7 25' stroke='#c8382b' stroke-width='4.4' stroke-linecap='round'/></svg>", "pointer");
    NK.Markoer = { kryds: MARKOER_KRYDS, slet: MARKOER_SLET };

    P.overScene = function (pt) {
        var b = this.braet;
        if (!pt) { b.ud(); return null; }
        b.flyt(pt);
        if (b.vaerktoej === "slet" && !this.faerdig) return MARKOER_SLET;
        var m = b.markoer(pt);
        return m === "crosshair" ? MARKOER_KRYDS : m;
    };

    P.nedScene = function (pt, e) {
        if (this.faerdig) return false;
        var b = this.braet;
        /* Med Slet tegner et traek ikke: klikket sletter med det samme */
        if (b.vaerktoej === "slet" && !(e && e.button === 2)) { this.slet(b.under(pt)); return false; }
        return b.ned(pt, e);
    };

    P.hoejreScene = function (pt, e) {
        if (this.faerdig) return;
        this.braet.ned(pt, e);
    };

    P.flytScene = function (pt) { this.braet.flyt(pt); };
    P.opScene = function (pt) { this.braet.op(pt); };
    P.klikScene = function () { this.spaer(); };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        NK.Tavle.tegn(ctx, lay);
        this.braet.tegn(ctx, this.faerdig ? { udenHaandtag: true, linje: Math.max(2.6, this.skala() * 0.055) } : null);
        this.tegnSejr(ctx, lay.tavle);
    };

    NK.SimTegn = SimTegn;
}());
