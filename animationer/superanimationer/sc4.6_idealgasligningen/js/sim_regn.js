/* =====================================================================
   sim_regn.js - fane 2: beregningen

   Kender man tre af p, V, n og T, kan man regne den fjerde ud. Hver
   opgave har et til tre trin. I hvert trin med en formel skriver eleven
   foerst formlen og saa tallet (formlen foerst, som i sc7.4). Er
   temperaturen i °C, regnes den foerst om til kelvin; er massen kendt,
   regnes stofmaengden foerst.

   Scenen er den samme cylinder som paa fane 1, stillet som i opgaven:
   de kendte tal staar paa instrumenterne, og det ukendte er daekket
   (tape over skalaen, et spoergsmaalstegn paa manometeret, "?" paa
   displayet). Naar tallet er regnet, kommer det frem. Tavlen viser de
   paene beregninger, som de skal skrives.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var G = NK.Gas;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;
    var MAAL = NK.Sprites.MAAL;

    var NOEGLE = "nk-sc4.6-regn";
    var NOEGLE_NIV = "nk-sc4.6-regn-niveau";

    function SimRegn() {
        this.navn = "regn";
        this.L = new NK.Laerred(NK.el("regn-laerred"));
        this.k = new NK.RoligLaerer({ boble: "regn-boble", knap: "regn-kknap" });
        this.part = new G.Partikler();
        this.tid = 0;
        this.lay = null;
        this.fast = { html: "", klasse: "" };
        this.kortT = 0;
        this.glimt = {};
        this.visP = 0;
        this.over = null;
        this.opgaver = D.REGN;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var s = gemt[o.id];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rostAlt = !!gemt._rost;
        var niv = NK.hent(NOEGLE_NIV, null);
        if (!D.NIVEAUER.some(function (n) { return n.id === niv; })) niv = null;
        this.niveau = niv || this.foersteNiveau();
        this.bygPanel();
        this.koblMus();
        var i = this.foersteUloeste(this.niveau);
        this.vaelg(i, false);
    }

    var P = SimRegn.prototype;

    /* ======================================================================
       OPGAVELISTEN OG NIVEAUERNE
       ====================================================================== */
    P.foersteNiveau = function () {
        var mig = this;
        for (var i = 0; i < D.NIVEAUER.length; i++) {
            var id = D.NIVEAUER[i].id;
            if (this.opgaver.some(function (o, j) { return o.niveau === id && !mig.status[j].loest; })) return id;
        }
        return D.NIVEAUER[0].id;
    };

    P.iNiveau = function (niv) {
        var ud = [];
        this.opgaver.forEach(function (o, i) { if (o.niveau === niv) ud.push(i); });
        return ud;
    };

    P.foersteUloeste = function (niv) {
        var mig = this, l = this.iNiveau(niv);
        for (var i = 0; i < l.length; i++) if (!mig.status[l[i]].loest) return l[i];
        return l[0];
    };

    /* Naeste uloeste: foerst i samme niveau, saa i de naeste */
    P.naesteUloeste = function () {
        var n = this.opgaver.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    P.antalLoest = function () {
        return this.status.filter(function (s) { return s.loest; }).length;
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.opgaver.forEach(function (o, i) {
            var s = mig.status[i];
            if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        if (this.rostAlt) ud._rost = 1;
        NK.gem(NOEGLE, ud);
    };

    P.bygPanel = function () {
        var mig = this;
        this.el = {
            kort: NK.el("regn-kort"), knap: NK.el("regn-knap"), besked: NK.el("regn-besked"),
            raekker: NK.el("regn-raekker"), liste: NK.el("regn-liste"), nye: NK.el("regn-nye"),
            niveau: NK.el("regn-niveau"), tavle: NK.el("regn-tavle")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        this.el.nye.addEventListener("click", function () { mig.vaelg(mig.nr, true); });
        this.el.niveau.innerHTML = "";
        D.NIVEAUER.forEach(function (n) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaelger";
            b.textContent = n.navn;
            b.setAttribute("data-niveau", n.id);
            b.addEventListener("click", function () { mig.vaelgNiveau(n.id); });
            mig.el.niveau.appendChild(b);
        });
    };

    P.vaelgNiveau = function (id) {
        this.niveau = id;
        NK.gem(NOEGLE_NIV, id);
        this.vaelg(this.foersteUloeste(id), false);
    };

    P.bygListe = function () {
        var mig = this;
        this.el.liste.innerHTML = "";
        this.iNiveau(this.niveau).forEach(function (i, nr) {
            var o = mig.opgaver[i];
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje" + (i === mig.nr ? " valgt" : "");
            var s = mig.status[i];
            knap.innerHTML = '<span class="hl-nr">' + (nr + 1) + '</span><span class="hl-navn">' + NK.html(o.navn) +
                "<em>Find " + NK.html(D.STR[o.find].ord) + '</em></span><span class="hl-stjerner">' +
                (s.stjerne ? "★" : (s.loest ? "✓" : "")) + "</span>";
            knap.addEventListener("click", function () { mig.vaelg(i, false); });
            mig.el.liste.appendChild(knap);
        });
        var knapper = this.el.niveau.querySelectorAll(".vaelger");
        for (var j = 0; j < knapper.length; j++) knapper[j].classList.toggle("valgt", knapper[j].getAttribute("data-niveau") === this.niveau);
        NK.saetTekst("regn-loest", String(this.antalLoest()));
    };

    /* ======================================================================
       OPGAVEN
       ====================================================================== */
    P.vaelg = function (i, nyeTal) {
        var def = this.opgaver[i];
        var forrige = this.o && this.o.def === def ? this.o.givet : null;
        this.nr = i;
        this.niveau = def.niveau;
        this.o = G.lavOpgave(def, !!nyeTal, forrige);
        this.o.i = 0;
        this.o.trin.forEach(function (t, j) {
            t.fase = t.rel ? "formel" : "tal";
            t.status = j === 0 ? "aktiv" : "laast";
            t.isoleret = true;
        });
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.faerdig = false;
        this.glimt = {};
        this.visP = 0;
        this.k.tie();
        this.bygListe();
        this.bygRaekker();
        this.visKort();
        this.visTavle();
        this.naesteLinje();
        if (this.lay) this.fyldGas();
        this.fokus();
    };

    P.aktivt = function () {
        return this.faerdig ? null : this.o.trin[this.o.i];
    };

    /* De tal, der er kendt foer trin j: opgavens og de regnede */
    P.kendtFoer = function (j) {
        var g = this.o.givet, k = {}, a;
        for (a in g) k[a] = g[a];
        if (g.VmL !== undefined) k.V = g.VmL / 1000;
        for (var s = 0; s < j; s++) k[this.o.trin[s].x] = this.o.trin[s].facit;
        return k;
    };

    /* Er stoerrelsen kendt nu (givet eller regnet)? */
    P.kendt = function (sym) {
        var g = this.o.givet;
        if (sym === "V" && g.VmL !== undefined) return true;
        if (g[sym] !== undefined) return true;
        return this.o.trin.some(function (t) { return t.x === sym && (t.status === "ok" || t.status === "svar"); });
    };

    P.trinNavn = function (t) {
        if (t.id === "T" || (t.rel === "gas" && t.x === "T")) return D.STR.T.navn;
        if (t.id === "t") return D.STR.t.navn;
        return D.STR[t.x].navn;
    };

    /* Formlen isoleret, som HTML med broekstreg */
    function broek(op, ned) {
        return '<span class="broek"><span>' + op + "</span><span>" + ned + "</span></span>";
    }

    P.formelHTML = function (t) {
        var iso = Tj.isoleret(t.rel, t.x);
        var op = iso.taeller.join(" · "), ned = iso.naevner.join(" · ");
        return t.x + " = " + (ned ? broek(op, ned) : op);
    };

    P.vaerdi = function (b, k) {
        if (b === "R") return D.R_TEKST;
        return G.fmt(b, k[b]);
    };

    /* Den paene beregning for trin j: [formellinjen, tallinjen] */
    P.regnLinjer = function (j) {
        var t = this.o.trin[j], k = this.kendtFoer(j), mig = this;
        if (t.id === "T") return ["T = (" + this.o.givet.t + " + 273) K = " + G.fmt("T", t.facit)];
        if (t.id === "t") return ["t = (" + G.talTekst("T", k.T) + " − 273) °C = " + G.fmt("t", t.facit)];
        var iso = Tj.isoleret(t.rel, t.x);
        var op = iso.taeller.map(function (b) { return mig.vaerdi(b, k); }).join(" · ");
        var ned = iso.naevner.map(function (b) { return mig.vaerdi(b, k); }).join(" · ");
        return [this.formelHTML(t), "= " + (ned ? broek(op, ned) : op) + " = <b>" + G.fmt(t.x, t.facit, t.id === "M") + "</b>"];
    };

    P.regnHTML = function (j) {
        var l = this.regnLinjer(j);
        return l.length === 1 ? l[0] : l[0] + " " + l[1];
    };

    /* ----- Raekkerne i opgavekortet --------------------------------------------------- */
    P.bygRaekker = function () {
        var mig = this, o = this.o, vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.trin.forEach(function (t, j) {
            var rk = document.createElement("div");
            rk.className = "raekke";
            var formelKendt = t.rel && (t.fase === "tal" || t.status === "ok" || t.status === "svar");
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (j + 1) + ". " + NK.html(mig.trinNavn(t)) +
                "</span></div>" + (formelKendt ? '<div class="raekke-formel">' + mig.formelHTML(t) + "</div>" : "") +
                '<div class="felter"></div>';
            var fe = document.createElement("div");
            t.feltEl = fe;
            t.input = null;
            var pre = t.x + " =";
            if (t.status === "ok" || t.status === "svar") {
                fe.className = "felt " + t.status;
                fe.innerHTML = '<span class="felt-pre">' + pre + '</span><span class="felt-svar"><b>' +
                    NK.html(G.fmt(t.x, t.facit, t.id === "M")) + '</b></span><span class="felt-maerke">' + (t.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var fra = t.status === "aktiv" ? "" : " disabled";
                var formel = t.fase === "formel";
                fe.className = "felt " + t.status + (formel ? " formelfelt" : "");
                fe.innerHTML = '<span class="felt-pre">' + pre + "</span>" +
                    '<input type="text" inputmode="' + (formel ? "text" : "decimal") + '" autocomplete="off" spellcheck="false" aria-label="' +
                    NK.html((formel ? "Formlen for " : "") + mig.trinNavn(t)) + '" placeholder="' + (formel ? "skriv formlen" : "tallet") + '"' + fra + ">" +
                    (formel ? "" : '<span class="felt-efter">' + G.ENHED[t.x] + "</span>") +
                    '<button type="button" class="felt-ok" aria-label="Tjek" tabindex="-1"' + fra + ">↵</button>";
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                });
                inp.addEventListener("input", function () { mig.k.skriver(); });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                t.input = inp;
            }
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.visKort = function () {
        var o = this.o, def = o.def;
        NK.saetTekst("regn-titel", def.navn);
        var l = this.iNiveau(def.niveau), niv = D.NIVEAUER.filter(function (n) { return n.id === def.niveau; })[0];
        NK.saetTekst("regn-taeller", niv.navn + " " + (l.indexOf(this.nr) + 1) + "/" + l.length);
        NK.saetHTML("regn-prompt", NK.html(this.opgaveTekst()));
        this.el.kort.classList.toggle("sejr", this.faerdig);
        this.visKnap();
    };

    /* Opgaveteksten med tallene sat ind */
    P.opgaveTekst = function () {
        var g = this.o.givet;
        return this.o.def.tekst.replace(/\{(\w+)\}/g, function (hel, s) {
            return g[s] !== undefined ? G.fmt(s, g[s]) : hel;
        });
    };

    P.visKnap = function () {
        var tekst, klasse = "knap";
        if (this.faerdig) {
            klasse = "knap blaa banker";
            tekst = this.naesteUloeste() >= 0 ? "Næste opgave →" : "Forfra med nye tal ↺";
        } else {
            tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
    };

    /* ----- Tavlen --------------------------------------------------------------------- */
    P.visTavle = function () {
        var o = this.o, mig = this, html = "";
        html += '<div class="tv-hoved"><span>' + NK.html(o.def.navn) + '</span><span class="tv-r">R = ' + D.R_TEKST + "</span></div>";
        html += '<div class="tv-linje tv-spg">' + o.def.find + " = ?</div>";
        o.trin.forEach(function (t, j) {
            var svar = t.status === "svar" ? " svar" : "";
            if (t.status === "ok" || t.status === "svar") {
                var l = mig.regnLinjer(j);
                html += '<div class="tv-linje' + svar + '">' + l[0] + "</div>";
                if (l[1]) html += '<div class="tv-linje tv-ind' + svar + '">' + l[1] + "</div>";
            } else if (t.rel && t.fase === "tal") {
                html += '<div class="tv-linje' + (t.formelVist ? " svar" : "") + '">' + mig.formelHTML(t) + "</div>";
            }
        });
        if (this.faerdig) html += '<div class="tv-slut">' + NK.html(this.slutTekst()) + "</div>";
        this.el.tavle.innerHTML = html;
        this.tilpasTavle();
    };

    P.slutTekst = function () {
        var o = this.o, k = o.k;
        var t = o.def.slut.replace(/\{(\w+)\}/g, function (hel, s) { return k[s] !== undefined ? G.fmt(s, k[s], s === "M" && o.def.find === "M") : hel; });
        if (o.def.find === "M" && o.givet.gas) {
            var gas = D.GASSER[o.givet.gas];
            t += " Det passer med " + gas.navn + ", " + gas.formel + " (" + NK.tal2(gas.M) + " g/mol).";
        }
        return t;
    };

    /* ======================================================================
       TJEK OG TRIN
       ====================================================================== */
    P.tjek = function () {
        var t = this.aktivt();
        if (!t || !t.input) return;
        var raa = t.input.value, r;
        if (t.fase === "formel") {
            r = Tj.formel(t, raa);
            if (r.ok) { this.formelOk(false, r.isoleret); return; }
        } else {
            r = Tj.tal(t, raa, this.kendtFoer(this.o.i), this.o.givet);
            if (r.ok) { this.trinLoest(this.o.i, "ok"); return; }
        }
        this.besked(NK.html(r.besked), r.tom ? "gul" : "skidt");
        if (!r.tom && t.feltEl) {
            t.feltEl.classList.remove("ryst");
            void t.feltEl.offsetWidth;
            t.feltEl.classList.add("ryst");
        }
        this.fokus();
    };

    /* Formlen er skrevet (eller vist): nu skal tallet regnes */
    P.formelOk = function (vist, isoleret) {
        var t = this.aktivt();
        t.fase = "tal";
        t.formelVist = !!vist;
        this.hjaelp = 0;
        if (vist) {
            this.svarVis("<b>Formlen:</b> " + this.formelHTML(t) + ".");
        } else {
            this.k.tie();
            this.besked((isoleret ? "Rigtig formel." : "Rigtig sammenhæng. Isoleret: " + this.formelHTML(t) + ".") +
                " " + this.trinLinje(), "god");
        }
        this.bygRaekker();
        this.visKort();
        this.visTavle();
        this.fokus();
    };

    P.trinLoest = function (j, maade) {
        var o = this.o, t = o.trin[j];
        t.status = maade;
        t.fase = "tal";
        this.hjaelp = 0;
        if (maade === "svar") this.brugtSvar = true;
        this.glimt[t.x] = 2.2;
        if (j + 1 < o.trin.length) {
            o.i = j + 1;
            o.trin[j + 1].status = "aktiv";
        } else {
            this.opgaveLoest();
        }
        if (maade === "svar") {
            this.svarVis(this.regnHTML(j) + ".");
        } else {
            this.k.tie();
            if (!this.faerdig) this.naesteLinje(NK.tilfaeldig(D.ROS), "god");
        }
        this.bygRaekker();
        this.visKort();
        this.visTavle();
        this.fokus();
    };

    P.opgaveLoest = function () {
        var s = this.status[this.nr];
        this.faerdig = true;
        s.loest = true;
        s.stjerne = s.stjerne || !this.brugtSvar;
        var ros = NK.tilfaeldig(D.ROS_OPGAVE);
        if (this.antalLoest() === this.opgaver.length && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG.regn; }
        this.gem();
        this.besked(NK.html(this.slutTekst() + " " + ros), "god");
        this.bygListe();
    };

    /* ----- Linjen i kortet -------------------------------------------------------------- */
    P.trinLinje = function () {
        var t = this.aktivt();
        if (!t) return "";
        if (t.id === "T") return "Regn temperaturen om til kelvin.";
        if (t.id === "t") return "Regn temperaturen om til °C.";
        var ord = t.rel === "gas" && t.x === "T" ? "temperaturen" : D.STR[t.x].ord;
        if (t.fase === "formel") return "Skriv formlen for " + ord + ".";
        return "Regn " + ord + " ud.";
    };

    P.naesteLinje = function (foer, slags) {
        this.besked((foer ? foer + " " : "") + this.trinLinje(), slags || "");
    };

    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.kortT = 0;
        this.visBesked(this.fast);
    };

    P.kortBesked = function (html, sek) {
        this.kortT = sek || 4;
        this.visBesked({ html: html, klasse: "" });
    };

    P.visBesked = function (b) {
        this.el.besked.innerHTML = b.html;
        this.el.besked.className = "besked" + (b.klasse ? " " + b.klasse : "");
    };

    P.beskedTekst = function () { return this.el.besked.textContent; };

    /* ----- Hint og svar: Kemichael, eller kortet, naar han er ude ------------------------- */
    P.hint = function (t) {
        if (t.id === "T") return "Idealgasligningen regner med temperaturen i kelvin. 0 °C er 273 K.";
        if (t.id === "t") return "Træk 273 fra temperaturen i kelvin.";
        var k = this.kendtFoer(this.o.i);
        if (t.fase === "formel") {
            var kendte = Object.keys(Tj.REL[t.rel].eksp[t.x]).filter(function (b) { return b !== "R" && k[b] !== undefined; });
            return "Du kender " + liste(kendte) + ". Du skal finde " + t.x + "." + (t.rel === "gas" ? " R står på tavlen." : "");
        }
        if (t.rel === "gas") {
            var ekstra = [];
            if (this.o.givet.VmL !== undefined) ekstra.push("volumen i liter");
            if (this.o.givet.t !== undefined && t.x !== "T") ekstra.push("T i kelvin");
            return "Sæt tallene ind i formlen" + (ekstra.length ? " med " + liste(ekstra) : "") + ". R = " + D.R_TEKST + ".";
        }
        return "Sæt tallene ind i formlen over feltet.";
    };

    function liste(l) {
        if (l.length <= 1) return l.join("");
        return l.slice(0, -1).join(", ") + " og " + l[l.length - 1];
    }

    P.hjaelpVis = function (html, slags) {
        if (!this.k.sig(html, slags)) this.besked(html + " " + this.trinLinje(), "gul");
    };

    P.svarVis = function (html) {
        var inde = this.k.sig(html, "svar", { lukVedSkriv: true });
        if (this.faerdig) {
            this.besked((inde ? "" : html + " ") + NK.html(this.slutTekst()), "gul");
            return;
        }
        var trin = this.trinLinje();
        if (inde) this.besked(trin, "");
        else this.besked(html + " " + trin, "gul");
    };

    P.knap = function () {
        if (this.faerdig) {
            var i = this.naesteUloeste();
            if (i >= 0) this.vaelg(i, false);
            else this.vaelg(this.nr, true);
            return;
        }
        var t = this.aktivt();
        if (!t) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.hjaelpVis("<b>Hint:</b> " + NK.html(this.hint(t)), "hint");
            this.visKnap();
            this.fokus();
            return;
        }
        this.brugtSvar = true;
        if (t.fase === "formel") { this.formelOk(true, true); return; }
        this.trinLoest(this.o.i, "svar");
    };

    P.startIntro = function (tving) {
        if (!tving) return;
        if (!this.k.inde()) { this.k.hentInd(); return; }
        var t = this.faerdig ? "" : this.trinLinje();
        this.k.sig(NK.html(D.INTRO.regn + (t ? " " + t : "")), "", { lukVedSkriv: true });
    };

    P.fokus = function () {
        var t = this.aktivt();
        if (!t || !t.input || !NK.el("fane-regn").classList.contains("aktiv") ||
            document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        try { t.input.focus({ preventScroll: true }); } catch (e) { t.input.focus(); }
    };

    P.enter = function () { if (this.faerdig) this.knap(); else this.tjek(); };
    P.nulstil = function () { this.vaelg(this.nr, true); };

    /* ======================================================================
       LAYOUT
       ====================================================================== */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* Et paent loft over tallet: 1, 2, 2,5 eller 5 gange en tierpotens */
    function paentLoft(v) {
        var e = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
        var trin = [1, 2, 2.5, 5, 10];
        for (var i = 0; i < trin.length; i++) if (trin[i] * e >= v - 1e-12) return trin[i] * e;
        return 10 * e;
    }

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var lay = { W: W, H: H, baandY: baand.y };
        var top = 12;
        lay.bordY = Math.round(baand.y - NK.klamp((baand.y - top) * 0.05, 12, 34));
        var arbH = lay.bordY - top;
        var vb = NK.klamp(W * 0.44, 240, 460);
        var cylB = Math.round(NK.klamp(Math.min(vb * 0.4, arbH * 0.36), 78, 160));
        var cx = Math.round(vb * 0.6);
        var pb = cylB + 44;
        var ph = pb * MAAL.varmeplade.h / MAAL.varmeplade.b;
        lay.plade = { x: cx - pb / 2, y: lay.bordY - ph, b: pb };
        var bund = 10;
        var gulv = lay.plade.y + 2 - bund;
        var loft = top + 26;
        lay.cyl = { x: cx - cylB / 2, y: loft, b: cylB, h: gulv - loft, vaeg: 6, bund: bund };
        lay.stempelH = Math.round(NK.klamp(cylB * 0.08, 9, 16));
        lay.roerY = gulv + bund * 0.5;
        var r = Math.round(NK.klamp(cylB * 0.32, 28, 52));
        var k = r / MAAL.manometer.r;
        var mx = Math.max(r * 1.28 + 6, lay.cyl.x - 10 - r * 1.3);
        lay.mano = { cx: mx, cy: lay.roerY - (MAAL.manometer.bund - MAAL.manometer.cy) * k, r: r };
        var tx = Math.round(vb + 16);
        lay.tavle = { x: tx, y: top + 8, b: W - tx - 18, h: lay.bordY - top - 18 };
        this.lay = lay;
        this.fyldGas();
        var tv = lay.tavle, el = this.el.tavle;
        el.style.left = tv.x + "px";
        el.style.top = tv.y + "px";
        el.style.width = tv.b + "px";
        el.style.height = tv.h + "px";
        this.tilpasTavle();
        var c = lay.cyl;
        this.saetAnker("cylinder", Math.min(c.x, lay.mano.cx - r * 1.3) - 4, c.y - 6, c.x + c.b - Math.min(c.x, lay.mano.cx - r * 1.3) + 8, lay.bordY - c.y + 6);
        this.saetAnker("tavle", tv.x - 8, tv.y - 8, tv.b + 16, tv.h + 16);
        this.saetAnker("laerer", 0, baand.y, Math.min(W, 360), baand.h);
    };

    /* Skriften paa tavlen: saa stor som muligt, uden at teksten loeber over */
    P.tilpasTavle = function () {
        var el = this.el.tavle, tv = this.lay && this.lay.tavle;
        if (!tv) return;
        var px = NK.klamp(Math.min(tv.b / 19, tv.h / 11), 13, 22);
        el.style.fontSize = px + "px";
        while (px > 12 && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
            px -= 0.5;
            el.style.fontSize = px + "px";
        }
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el("regn-anker-" + id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(Math.max(1, b)) + "px";
        e.style.height = Math.round(Math.max(1, h)) + "px";
    };

    /* Cylinderens skala og gassens hoejde i opgaven */
    P.skala = function () {
        var V = this.o.k.V;
        var maks = paentLoft(V / 0.62);
        var stor = maks / 5;
        return { maks: maks, stor: stor, trin: stor / 5, pxPrL: this.lay.cyl.h / maks, V: V };
    };

    P.fyldGas = function () {
        if (!this.lay || !this.o) return;
        var sk = this.skala();
        this.part.fyld(30, Tg.indre(this.lay.cyl).b, sk.V * sk.pxPrL);
    };

    /* ======================================================================
       MUSEN
       ====================================================================== */
    P.under = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        var c = lay.cyl;
        if (Math.hypot(pt.x - lay.mano.cx, pt.y - lay.mano.cy) <= lay.mano.r * 1.2) return "p";
        var st = Tg.pladeStr(lay.plade);
        if (pt.x >= lay.plade.x && pt.x <= lay.plade.x + lay.plade.b && pt.y >= lay.plade.y + st.h * 0.2 && pt.y <= lay.plade.y + st.h) return "T";
        if (this.skiltN && pt.x >= this.skiltN.x && pt.x <= this.skiltN.x + this.skiltN.b && pt.y >= this.skiltN.y && pt.y <= this.skiltN.y + this.skiltN.h) return "n";
        if (pt.x >= c.x && pt.x <= c.x + c.b && pt.y >= c.y && pt.y <= c.y + c.h) return "V";
        return null;
    };

    P.klikScene = function (u) {
        var o = this.o, k = o.k;
        var navn = { p: "Trykket", V: "Volumen", T: "Temperaturen", n: "Stofmængden" }[u];
        if (!navn) return false;
        var sym = u;
        if (u === "T" && !this.kendt("T") && this.kendt("t")) {
            this.kortBesked("Temperaturen er " + G.fmt("t", o.givet.t) + ". I idealgasligningen skal den være i kelvin.");
            return true;
        }
        if (this.kendt(sym)) {
            var v = sym === "V" && o.givet.VmL !== undefined && !this.kendtRegnet("V") ? G.fmt("VmL", o.givet.VmL) : G.fmt(sym, k[sym]);
            this.kortBesked(navn + " er " + v + ".");
        } else {
            this.kortBesked(navn + " er ukendt. Det kommer frem, når du har regnet det ud.");
        }
        return true;
    };

    P.kendtRegnet = function (sym) {
        return this.o.trin.some(function (t) { return t.x === sym && (t.status === "ok" || t.status === "svar"); });
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            var lu = mig.k.hover(pt);
            mig.over = lu ? null : mig.under(pt);
            c.style.cursor = lu || mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.k.hover(null); mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.k.klik(pt)) return;
            var u = mig.under(pt);
            if (u) mig.klikScene(u);
            mig.fokus();
        });
    };

    /* ======================================================================
       TID OG TEGNING
       ====================================================================== */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.kortT > 0) {
            this.kortT -= dt;
            if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
        }
        this.k.opdater(dt);
        for (var s in this.glimt) this.glimt[s] = Math.max(0, this.glimt[s] - dt);
        var pMaal = this.kendt("p") ? this.o.k.p : 0;
        this.visP = NK.mod(this.visP, pMaal, 3.5, dt);
        if (this.lay) {
            var sk = this.skala();
            this.part.opdater(dt, Tg.indre(this.lay.cyl).b, sk.V * sk.pxPrL, Math.sqrt(this.o.k.T / 293), null);
        }
    };

    P.tegn = function () {
        var lay = this.lay;
        if (!lay) return;
        var c = this.L.ctx, o = this.o, k = o.k, g = o.givet;
        this.L.ryd("#16171d");
        Tg.baggrund(c, lay.W, lay.H, lay.bordY, lay.baandY);
        Tg.tavle(c, lay.tavle);
        var cyl = lay.cyl, ind = Tg.indre(cyl), sk = this.skala();
        var ms = Tg.manometerStr(lay.mano);
        Tg.roer(c, [{ x: lay.mano.cx, y: ms.bund - 4 }, { x: lay.mano.cx, y: lay.roerY }, { x: cyl.x - 6, y: lay.roerY }], 5, "#c9a24e", "#5a4418");
        /* Displayet: det, der er kendt om temperaturen */
        var tTekst, kT = this.kendt("T"), kt = this.kendt("t");
        if (kT && kt) tTekst = G.talTekst("T", k.T) + " K   " + G.talTekst("t", g.t !== undefined ? g.t : k.t) + " °C";
        else if (kT) tTekst = G.talTekst("T", k.T) + " K";
        else if (kt) tTekst = g.t + " °C";
        else tTekst = "? K";
        var varme = NK.klamp((k.T - 293) / 207, 0, 1), kulde = NK.klamp((293 - k.T) / 143, 0, 1);
        Tg.plade(c, lay.plade, { varme: varme, kulde: kulde, knapper: false, tekst: tTekst,
            tekstFarve: !kT && !kt ? "#f2c53d" : (this.glimt.T > 0 || this.glimt.t > 0 ? "#ffffff" : "#7ee0a8"), lys: null });
        /* Cylinderen med gassen, skalaen og laasen */
        var hoejde = sk.V * sk.pxPrL;
        Tg.cylinder(c, cyl, {
            hoejde: hoejde, stempelH: lay.stempelH, partikler: this.part,
            laast: o.def.beholder === "lukket", lodder: 0, lodB: 10, vedStop: false,
            varme: varme, kulde: kulde, pxPrL: sk.pxPrL,
            skala: { maks: sk.maks, trin: sk.trin, stor: sk.stor, skjult: !this.kendt("V") },
            lys: { stempel: false, top: false }
        });
        /* Skiltet med volumen over stemplet */
        var pY = ind.bund - hoejde;
        var vTekst, vSlags;
        if (!this.kendt("V")) { vTekst = "V = ?"; vSlags = "ukendt"; }
        else if (g.VmL !== undefined && !this.kendtRegnet("V")) { vTekst = "V = " + G.fmt("VmL", g.VmL); vSlags = ""; }
        else { vTekst = "V = " + G.fmt("V", k.V); vSlags = this.kendtRegnet("V") ? "fundet" : ""; }
        Tg.skilt(c, ind.x + ind.b / 2, Math.max(cyl.y + 14, pY - lay.stempelH - 16), vTekst, vSlags, "midt");
        /* Skiltene med stofmaengden (og massen) nederst i gassen */
        var skilte = [];
        skilte.push(this.kendt("n") ? { t: "n = " + G.fmt("n", k.n), s: this.kendtRegnet("n") ? "fundet" : "" } : { t: "n = ?", s: "ukendt" });
        if (g.m !== undefined || o.def.find === "m") {
            skilte.push(this.kendt("m") ? { t: "m = " + G.fmt("m", k.m), s: this.kendtRegnet("m") ? "fundet" : "" } : { t: "m = ?", s: "ukendt" });
        }
        if (o.def.find === "M") skilte.push(this.kendt("M") && this.kendtRegnet("M") ? { t: "M = " + G.fmt("M", k.M, true), s: "fundet" } : { t: "M = ?", s: "ukendt" });
        var mig = this;
        this.skiltN = null;
        skilte.forEach(function (s, i) {
            var r = Tg.skilt(c, ind.x + ind.b / 2, ind.bund - 18 - i * 28, s.t, s.s, "midt");
            if (i === 0) mig.skiltN = r;
        });
        /* Manometeret */
        Tg.manometer(c, lay.mano, { p: this.visP, maks: paentLoft(k.p / 0.7), stor: paentLoft(k.p / 0.7) / 4, lille: paentLoft(k.p / 0.7) / 20,
            skjult: !this.kendt("p"), lys: this.over === "p" });
        Tg.skilt(c, lay.mano.cx, ms.y - 14, this.kendt("p") ? "p = " + G.fmt("p", k.p) : "p = ?",
            this.kendt("p") ? (this.kendtRegnet("p") ? "fundet" : "moerk") : "ukendt", "midt", lay.W);
        this.k.tegn(c);
    };

    NK.SimRegn = SimRegn;
}());
