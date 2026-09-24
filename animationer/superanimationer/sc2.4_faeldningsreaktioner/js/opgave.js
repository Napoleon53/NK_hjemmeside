/* =====================================================================
   opgave.js - motoren bag de tre niveauer

   Et niveau er en raekke trin. Hvert trin er et lille objekt i
   niveauer.js med sit spoergsmaal, sine svarmuligheder eller felter,
   et hint og svaret. Motoren her holder styr paa, hvor eleven er, og
   tegner scenens tavle, panelets trinliste og den ene hjaelpeknap:

       Giv hint -> Vis svaret -> (naeste trin) ... -> Ny opgave

   De tre niveauer deler scenen og panelet. Hvert niveau har sin egen
   opgave, sine egne baegerglas og sin egen taeller, saa man kan skifte
   frem og tilbage uden at miste noget. Alt tegnes ud fra niveauets
   tilstand, saa et faneskift blot tegner det aktive niveau igen.

   Et trin kan have:
     navn, spm           trinlisten og spoergsmaalet over tavlen
     start(niv)          naar trinnet begynder
     valg(niv)           HTML til svarmuligheder eller vaerktoej
     valgKlik(niv, i)    klik paa en svarmulighed med data-i
     tabelKlik(niv,k,a)  klik i faeldningstabellen
     tjek(niv)           knappen Tjek (og Enter i et felt)
     hint(niv)           teksten til Giv hint
     vis(niv)            Vis svaret
     efter(niv)          naar trinnet er klaret, fx at glassene blandes
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;

    var aktiv = null;
    var tabel = null;

    NK.ionChip = function (ion, ekstra) {
        return '<span class="ion ' + (ion.q > 0 ? "kat" : "an") + (ekstra ? " " + ekstra : "") + '">' + D.ionTekst(ion) + "</span>";
    };

    NK.Niveau = function (def) {
        this.def = def;
        this.id = def.id;
        this.loest = 0;
        this.antal = 0;
        this.seneste = [];
        this.baeger = new NK.Baeger();
        this.nyOpgave();
    };

    var P = NK.Niveau.prototype;

    /* ----- Forloebet ---------------------------------------------------- */
    /* par og byt bruges kun af selvtesten: en bestemt opgave i en
       bestemt raekkefoelge. */
    P.nyOpgave = function (par, byt) {
        if (!par) par = this.def.vaelgPar(this);
        this.seneste.push(par.noegle);
        if (this.seneste.length > 10) this.seneste.shift();
        this.o = D.lavOpgave(par, byt);
        this.trin = -1;
        this.hjaelp = 0;
        this.vist = false;
        this.delVist = false;
        this.faerdig = false;
        this.status = [];
        this.s = { felt: {}, ok: {}, fejl: {} };
        this.hint = null;
        this.besked = { tekst: "", klasse: "" };
        this.fokusFelt = null;
        this.sidsteFelt = null;
        this.baeger.saetOpgave(this.o, !!this.def.ionerSynlige);
        this.frem();
        this.vis();
    };

    P.trinDef = function () { return this.def.trin[Math.max(0, this.trin)]; };

    /* Videre til naeste trin. Et givet trin (paa Let: ionerne, formlen og
       ionskemaet) klares af sig selv, saa alle tre sværhedsgrader har de
       samme fire trin. */
    P.frem = function () {
        for (;;) {
            if (this.trin >= this.def.trin.length - 1) {
                this.faerdig = true;
                this.antal++;
                if (!this.vist) this.loest++;
                return;
            }
            this.trin++;
            var t = this.trinDef();
            if (t.start) t.start(this);
            if (!t.givet) return;
            this.status[this.trin] = "givet";
            if (t.efter) t.efter(this);
        }
    };

    /* Trinnet er klaret, af eleven selv eller fordi svaret blev vist. Er
       en del af trinnet vist (delVist), taeller det som vist. */
    P.loes = function (vist, tekst) {
        var t = this.trinDef(), v = vist || this.delVist;
        this.status[this.trin] = v ? "vist" : "gjort";
        if (v) this.vist = true;
        if (t.efter) t.efter(this);
        this.besked = { tekst: tekst || "", klasse: vist ? "gul" : "god" };
        this.hjaelp = 0;
        this.delVist = false;
        this.hint = null;
        this.s.fejl = {};
        this.frem();
        this.vis();
    };

    /* Den ene knap i panelet. */
    P.knap = function () {
        if (this.faerdig) { this.nyOpgave(); return; }
        var t = this.trinDef();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.saetBesked(t.hint(this), "gul");
            this.visPanel();
            this.visTabel();
            return;
        }
        t.vis(this);
    };

    P.tjek = function () {
        var t = this.trinDef();
        if (!this.faerdig && t.tjek) t.tjek(this);
    };

    P.valgKlik = function (i) {
        var t = this.trinDef();
        if (!this.faerdig && t.valgKlik) t.valgKlik(this, i);
    };

    P.tabelKlik = function (k, a) {
        var t = this.trinDef();
        if (!this.faerdig && t.tabelKlik) t.tabelKlik(this, k, a);
    };

    P.saetBesked = function (tekst, klasse) {
        this.besked = { tekst: tekst || "", klasse: klasse || "" };
        if (aktiv === this) this.visBesked();
    };

    P.blink = function (k, a) {
        if (aktiv === this && tabel) tabel.blink(k, a);
    };

    /* ----- Tavlen ----------------------------------------------------------- */
    /* Ionerne under et salt, med tilskuerionerne streget ud, naar
       bundfaldet er fundet. */
    P.ionKlasse = function (ion) {
        if (!this.s.pKendt) return "";
        if (this.o.tilskuere.indexOf(ion) >= 0) return "tilskuer";
        if (this.o.faeld.some(function (S) { return S.kat === ion || S.an === ion; })) return "faelder";
        return "";
    };

    P.ionChips = function (S) {
        var self = this;
        return [S.kat, S.an].map(function (ion) { return NK.ionChip(ion, self.ionKlasse(ion)); }).join("");
    };

    P.tilskuerNote = function () {
        if (!this.s.pKendt) return "";
        if (this.o.udfald === "ingen") return "Alle fire ioner bliver i opløsning.";
        if (!this.o.tilskuere.length) return "";
        return "Tilskuerioner: " + this.o.tilskuere.map(D.ionTekst).join(" og ") + ". De bliver i opløsning.";
    };

    P.tavleHTML = function () {
        var o = this.o, d = this.def, self = this;
        function stof(S, sid) {
            return '<div class="stof"><div class="sformel">' + S.formel + '<span class="tilst">(aq)</span></div>'
                + '<div class="ionplads">' + d.ionOmraade(self, S, sid) + "</div></div>";
        }
        var h = '<div class="skema">' + stof(o.A, "A") + '<span class="op">+</span>' + stof(o.B, "B")
            + '<span class="op pil">→</span><div class="produkt">' + d.produkt(self) + "</div></div>";
        var r2 = d.skemaRaekke ? d.skemaRaekke(self) : "";
        if (r2) h += '<div class="skema ionskema">' + r2 + "</div>";
        var note = this.tilskuerNote();
        if (note) h += '<p class="tavle-note">' + note + "</p>";
        return h;
    };

    /* Et skrivefelt. key er noeglen i s.felt. */
    P.felt = function (key, klasse, pladsholder) {
        var v = this.s.felt[key] || "", ok = this.s.ok[key], fejl = this.s.fejl[key];
        return '<input type="text" class="skrivefelt ' + (klasse || "") + (ok ? " rigtig" : "") + (fejl ? " fejl" : "")
            + '" data-felt="' + key + '" value="' + NK.html(v) + '" autocomplete="off" autocapitalize="off" spellcheck="false"'
            + (pladsholder ? ' placeholder="' + pladsholder + '"' : "")
            + (ok ? " readonly" : "") + ' aria-label="Skriv her">';
    };

    /* ----- Tegning af det hele ----------------------------------------------- */
    P.vis = function () {
        if (aktiv !== this) return;
        var t = this.trinDef(), n = this.def.trin.length;
        NK.el("ab-trin").textContent = this.faerdig ? "Færdig" : "Trin " + (this.trin + 1) + " af " + n;
        NK.el("ab-spm").textContent = this.faerdig
            ? (this.vist ? "Svaret er vist. Prøv en ny opgave." : "Opgaven er løst.")
            : (typeof t.spm === "function" ? t.spm(this) : t.spm);
        var navn = this.o.A.navn + " og " + this.o.B.navn;
        NK.el("opgavetekst").textContent = navn.charAt(0).toUpperCase() + navn.slice(1)
            + " blandes. Hvad falder ud, og hvad er ionskemaet?";
        NK.el("tavle").innerHTML = this.tavleHTML();
        NK.el("ab-valg").innerHTML = !this.faerdig && t.valg ? t.valg(this) : "";
        NK.el("tjek").hidden = this.faerdig || !t.tjek;
        this.visBesked();
        this.visPanel();
        this.visTabel();
        this.fokus();
    };

    P.visBesked = function () {
        var e = NK.el("besked");
        e.textContent = this.besked.tekst;
        e.className = "besked " + this.besked.klasse;
    };

    P.visPanel = function () {
        var self = this, h = "";
        this.def.trin.forEach(function (t, i) {
            var st = self.status[i] || (i === self.trin && !self.faerdig ? "aktiv" : "");
            var maerke = st === "vist" ? '<span class="tvist">svaret vist</span>'
                : (t.givet ? '<span class="tgivet">' + t.givet(self) + "</span>" : "");
            h += '<li class="trin-punkt ' + st + (t.givet ? " givet" : "") + '"><span class="tnr">'
                + (st === "gjort" || st === "givet" ? "✓" : (i + 1)) + '</span>'
                + '<span class="tnavn">' + t.navn + "</span>" + maerke + "</li>";
        });
        NK.el("trinliste").innerHTML = h;
        NK.el("loest").textContent = this.loest;
        var k = NK.el("opgaveknap");
        k.textContent = this.faerdig ? "Ny opgave" : (this.hjaelp === 0 ? "Giv hint" : "Vis svaret");
        k.classList.toggle("banker", this.faerdig);
        k.classList.toggle("groen", this.faerdig);
        k.classList.toggle("blaa", !this.faerdig);
    };

    P.visTabel = function () {
        if (!tabel) return;
        var t = this.trinDef();
        var m = this.def.tabelMarker ? this.def.tabelMarker(this) : {};
        m.hint = this.hint || [];
        m.aktiv = !this.faerdig && !!t.tabelKlik;
        tabel.marker(m);
    };

    /* Markoeren i det foerste felt, der mangler, saa man kan skrive med
       det samme. */
    P.fokus = function () {
        var felter = NK.el("tavle").querySelectorAll(".skrivefelt:not([readonly])");
        var maal = null;
        for (var i = 0; i < felter.length; i++) {
            if (this.fokusFelt && felter[i].getAttribute("data-felt") === this.fokusFelt) { maal = felter[i]; break; }
            if (!maal && !felter[i].value) maal = felter[i];
        }
        this.fokusFelt = null;
        if (!maal || NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        try {
            maal.focus({ preventScroll: true });
            maal.setSelectionRange(maal.value.length, maal.value.length);
        } catch (e) { /* aeldre browsere */ }
    };

    /* Ladningsknapperne saetter ladningen paa det felt, man sidst stod i. */
    P.ladning = function (q) {
        var tavle = NK.el("tavle");
        var el = this.sidsteFelt ? tavle.querySelector('.skrivefelt[data-felt="' + this.sidsteFelt + '"]') : null;
        if (!el || el.readOnly) el = tavle.querySelector(".skrivefelt:not([readonly])");
        if (!el) return;
        el.value = F.saetLadning(el.value, q);
        this.s.felt[el.getAttribute("data-felt")] = el.value;
        el.classList.remove("fejl");
        el.focus();
        try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) {}
    };

    /* ----- Faelles haendelser ------------------------------------------------- */
    NK.Niveau.aktiver = function (niv) {
        aktiv = niv;
        niv.vis();
    };
    NK.Niveau.aktivt = function () { return aktiv; };

    NK.Niveau.init = function () {
        tabel = new NK.Tabel(NK.el("tabel"), NK.el("tabelinfo"), function (k, a) { if (aktiv) aktiv.tabelKlik(k, a); });
        NK.tabel = tabel;

        var tavle = NK.el("tavle"), valg = NK.el("ab-valg");

        tavle.addEventListener("input", function (e) {
            var el = e.target, key = el.getAttribute("data-felt");
            if (!aktiv || !key) return;
            if (el.classList.contains("skrivefelt")) {
                /* Tegnene skifter normalt kun udseende. Kommer der en
                   parentes til, flyttes markoeren tilsvarende. */
                var pos = el.selectionStart, ny = F.formater(el.value);
                if (ny !== el.value) {
                    pos += ny.length - el.value.length;
                    el.value = ny;
                    try { el.setSelectionRange(pos, pos); } catch (fejl) {}
                }
            } else if (el.classList.contains("koeffelt")) {
                el.value = el.value.replace(/[^0-9]/g, "").slice(0, 2);
            }
            aktiv.s.felt[key] = el.value;
            el.classList.remove("fejl");
        });
        tavle.addEventListener("change", function (e) {
            var key = e.target.getAttribute("data-felt");
            if (aktiv && key) { aktiv.s.felt[key] = e.target.value; e.target.classList.remove("fejl"); }
        });
        tavle.addEventListener("focusin", function (e) {
            if (aktiv && e.target.classList.contains("skrivefelt")) aktiv.sidsteFelt = e.target.getAttribute("data-felt");
        });
        tavle.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && aktiv && /^(INPUT|SELECT)$/.test(e.target.tagName)) {
                e.preventDefault();
                aktiv.tjek();
            }
        });
        tavle.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || !aktiv) return;
            var t = aktiv.trinDef();
            if (t.tavleKlik) t.tavleKlik(aktiv, b);
        });

        valg.addEventListener("mousedown", function (e) {
            /* Ladningsknapperne maa ikke tage markoeren fra feltet. */
            if (e.target.closest && e.target.closest("[data-q]")) e.preventDefault();
        });
        valg.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || !aktiv || b.disabled) return;
            if (b.hasAttribute("data-q")) { aktiv.ladning(parseInt(b.getAttribute("data-q"), 10)); return; }
            if (b.hasAttribute("data-i")) aktiv.valgKlik(parseInt(b.getAttribute("data-i"), 10));
        });

        NK.el("tjek").addEventListener("click", function () { if (aktiv) aktiv.tjek(); });
        NK.el("opgaveknap").addEventListener("click", function () { if (aktiv) aktiv.knap(); });
    };
}());
