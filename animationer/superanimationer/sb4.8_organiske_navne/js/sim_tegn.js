/* =====================================================================
   sim_tegn.js - fane 2: Tegn molekylet

   Navnet staar paa kortet, delt i sine dele. Eleven tegner molekylet paa
   whiteboardet med molekylemotorens tavle (den samme som i sc6.2 og paa
   tegnebraettet): traek eller klik bygger kaeden, og en gruppe saettes
   paa med ét klik (−OH, =O, −NH₂).

   Naar tegningen har lige saa mange atomer som stoffet, giver motoren
   den et navn. Passer navnet, er opgaven loest. Ellers faar eleven at
   vide, hvad tegningen hedder, og hvilken del af navnet der ikke passer.

   To ting er anderledes end paa tegnebraettet (se klik nedenfor):
     * et klik paa et O eller N med Kaede valgt saetter et carbonatom paa
       atomet (saadan bliver en syre til en ester og en amin faar flere
       kaeder); paa tegnebraettet ville atomet blive til carbon
     * et klik i den tomme tavle saetter ikke et nyt atom
   Efter en gruppe skifter vaerktoejet selv tilbage til Kaede.
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
                kunC: false, dobbelt: true, knaek: true, sletAlt: false,
                maks: function () { return mig.stof ? mig.stof.antal : 99; },
                maksTekst: function () { return "Alle " + mig.stof.antal + " atomer er brugt. Slet et atom med højreklik, eller tryk Fortryd."; }
            },
            aendret: function (hvad) { mig.aendret(hvad); },
            toast: function (t) { if (t && !mig.faerdig) mig.kortBesked(t, 3.5); }
        });
        var b = this.braet, gammelKlik = NK.Tegnebraet.prototype.klik;
        b.klik = function (u, pt) {
            if (!u) { this.toast("Klik på et atom, eller træk fra et atom, for at tegne videre."); return; }
            if (this.vaerktoej === "tegn" && u.slags === "atom" && u.atom.el !== "C") { this.nytFra(u.atom.id, "C"); return; }
            gammelKlik.call(this, u, pt);
        };
        NK.el("t-fortryd").addEventListener("click", function () { mig.fortryd(); });
        NK.el("t-ryd").addEventListener("click", function () { mig.nulstil(); });
        this.vaerktoejEl.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-vt]") : null;
            if (k) mig.vaelgVaerktoej(k.getAttribute("data-vt"));
        });
        this.startFane();
    }

    var P = SimTegn.prototype;
    F.paa(P, { navn: "t", naesteFane: "fane-g", naesteNavn: "Flere grupper" });

    /* ----- Opgaverne ------------------------------------------------------------ */
    P.lavOpgaver = function (aktive) {
        var raekke = D.KLASSER.map(function (k) { return k.id; });
        return D.STOFFER.filter(function (o) { return o.fane === "t" && aktive.indexOf(o.k) >= 0; })
            .map(function (o, i) { return { id: o.navn, niv: o.niv, o: o, i: i }; })
            .sort(function (a, b) {
                if (a.niv !== b.niv) return a.niv - b.niv;
                /* Stoffer med ét carbonatom (methanol, methanal) kommer sidst i deres
                   niveau: den foerste opgave skal vaere en kaede, man traekker */
                var ea = /^methan/.test(a.id) ? 1 : 0, eb = /^methan/.test(b.id) ? 1 : 0;
                if (ea !== eb) return ea - eb;
                var ia = raekke.indexOf(a.o.k), ib = raekke.indexOf(b.o.k);
                return ia !== ib ? ia - ib : a.i - b.i;
            });
    };

    /* Kortet er lavere her end paa fane 1: der er ingen brikker paa det */
    P.kortZone = function () { return window.innerHeight <= 720 ? 178 : 204; };

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
        this.bygVaerktoej();
        this.vaelgVaerktoej("tegn");
    };

    P.aktiveSkiftet = function () { this.bygVaerktoej(); };

    /* ----- Vaerktoejerne ------------------------------------------------------------
       Kun de grupper, de valgte stofklasser (og opgavens egen) har brug for */
    P.bygVaerktoej = function () {
        var med = (this.aktive || []).slice(), html = "";
        if (this.stof && med.indexOf(this.stof.klasse) < 0) med.push(this.stof.klasse);
        this.vaerktoejer = D.VAERKTOEJ.filter(function (v) {
            return !v.klasser || v.klasser.some(function (k) { return med.indexOf(k) >= 0; });
        });
        this.vaerktoejer.forEach(function (v) {
            html += '<button type="button" class="vtknap" data-vt="' + v.id + '" title="' + NK.html(v.titel) + '">' + NK.html(v.tekst) + "</button>";
        });
        NK.saetHTML("t-vt", html);
        this.visVaerktoej();
    };

    P.vaelgVaerktoej = function (id) {
        if (this.faerdig) return;
        if (!this.vaerktoejer.some(function (v) { return v.id === id; })) id = "tegn";
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

    /* ----- Tegningen tjekkes, naar alle atomer er brugt ---------------------------------- */
    P.aendret = function (hvad) {
        if (this.saetter || this.faerdig || !this.stof) return;
        var b = this.braet;
        /* Efter en gruppe gaar vaerktoejet tilbage til Kaede */
        if (hvad === "atom" && b.vaerktoej.indexOf("gruppe:") === 0) { b.vaerktoej = "tegn"; this.visVaerktoej(); }
        if (hvad === "vaerktoej") { this.visVaerktoej(); return; }
        if (b.antal() !== this.stof.antal) {
            if (this.fast.klasse === "skidt") this.besked("", "");
            return;
        }
        var res = NK.Navn.analyser(b.mol);
        if (res && res.navn === this.stof.navn && b.mol.fragmenter().length === 1) { this.klaret(); return; }
        this.fejlLinje(K.tegneFejl(this.stof, b.mol));
    };

    P.klaret = function () {
        var b = this.braet;
        b.laast = true;
        b.traek = null;
        b.spoegelse = null;
        this.farvTegning();
        this.loest("selv", K.forklaring(this.stof), this.stof.navn + ".");
        this.visVaerktoej();
    };

    /* Den faerdige tegning faar navnedelenes farver, som paa fane 1 */
    P.farvTegning = function () {
        var b = this.braet, mol = b.mol, s = this.stof, a = {}, bf = {};
        var res = NK.Navn.analyser(mol), gr = K.grupper(mol);
        function kant(x, y) { return x < y ? x + "-" + y : y + "-" + x; }
        function maal(maengde, farve, medBindinger) {
            mol.bindinger.forEach(function (bd) {
                var begge = maengde[bd.a] && maengde[bd.b], en = maengde[bd.a] || maengde[bd.b];
                if (begge || (medBindinger && en)) bf[kant(bd.a, bd.b)] = farve;
            });
            Object.keys(maengde).forEach(function (id) { if (mol.atom(Number(id)).el !== "C") a[id] = farve; });
        }
        if (s.klasse !== "ester" && s.klasse !== "amin") {
            var kaede = {};
            res.kaede.forEach(function (id) { kaede[id] = true; });
            maal(kaede, D.DELE.stamme.blaek, false);
            (res.sub || []).forEach(function (x) {
                var m = {};
                x.atomer.forEach(function (id) { m[id] = true; });
                maal(m, D.DELE.forled.blaek, true);
            });
            if (s.medTal) {
                var lok = {};
                res.kaede.forEach(function (id, i) { lok[id] = i + 1; });
                b.lokanter = lok;
            }
        }
        if (s.klasse !== "ester") {
            gr.forEach(function (g) {
                var m = {};
                g.atomer.forEach(function (id) { if (mol.atom(id).el !== "C") m[id] = true; });
                maal(m, D.DELE.endelse.blaek, true);
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
        this.saetAnker("tavle", t.x, t.y + 54, t.b, t.h - 54);
    };

    /* Der tegnes under vaerktoejslinjen */
    P.felt = function () {
        var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 700, h: 450 };
        return { x: t.x, y: t.y + 50, b: t.b, h: t.h - 50 };
    };

    P.skala = function () {
        var f = this.felt();
        return Math.round(NK.klamp(Math.min(f.b / 12, f.h / 5.6), 34, 76));
    };

    /* ----- Musen: tavlen faar det hele -------------------------------------------------- */
    P.overScene = function (pt) {
        var b = this.braet;
        if (!pt) { b.ud(); return null; }
        b.flyt(pt);
        return b.markoer(pt);
    };

    P.nedScene = function (pt, e) {
        if (this.faerdig) return false;
        return this.braet.ned(pt, e);
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
