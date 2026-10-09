/* =====================================================================
   regn.js - fane 2 (Uden x) og fane 3 (Med x): opgaverne paa tavlen

   En opgave regnes i dele, der staar under hinanden paa tavlen. Den del,
   eleven er ved, har felter; en loest del klappes sammen til én linje,
   som den skal staa i besvarelsen. Skemaet bliver staaende som tabel,
   og beregningerne af koncentrationerne staar paa hver sin linje.

   Tekstboksen (naeste skridt, fejl, hint og den gule knap) staar oeverst
   i den del, eleven er ved, og alene i en boks nederst, naar opgaven er
   loest. Opgavens tal (raekken Oplyst) kommer foerst frem, naar
   ligevaegtsloven er skrevet rigtigt (brugeren 9. oktober 2026).

     Uden x, Kc:      Ligevægtsloven › Koncentrationerne › Indsæt
     Uden x, ukendt:  Ligevægtsloven › Indsæt › CAS › Svaret
     Med x:           Ligevægtsloven › Hvad er x? › Skemaet › Ligningen ›
                      CAS › Løsningen › Koncentrationerne

   Eleven skriver selv udtrykkene (0,200 − x, 2x) i skemaet og i
   ligningen. CAS loeser ligningen, og eleven proever hver loesning i
   skemaet og forkaster den, der giver en negativ koncentration, ved at
   klikke paa den koncentration.

   Hver del har metoderne aktiv_, linje_, tjek_, hint_, svar_ og trin_
   (fx aktiv_lov). Tjek, hint og tekster bruger js/model.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;

    function el(tag, klasse, html) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    function T(tekst) { return document.createTextNode(tekst); }

    var TALORD = { 2: "begge", 3: "de tre", 4: "de fire" };

    function broekHTML(top, bund) {
        return '<span class="vbroek"><span>' + top + "</span><span>" + bund + "</span></span>";
    }

    /* Et udtryk i en broek med eksponent: (0,200 M − x)², x, (2x)² */
    function faktorTekst(tekst, e, flere) {
        var sammensat = /[+−-]/.test(tekst.replace(/^−/, "")) || /\s·\s/.test(tekst);
        var parentes = (e > 1 && (sammensat || /^\d/.test(tekst) || /^−/.test(tekst))) || (flere && sammensat);
        if (e > 1 && /^[a-z]$/.test(tekst)) parentes = false;
        return (parentes ? "(" + tekst + ")" : tekst) + (e > 1 ? NK.haevet(e) : "");
    }

    function delAf(liste, fn) {
        return liste.map(function (l) { return faktorTekst(fn(l), l.e, liste.length > 1); }).join(" · ");
    }

    /* Beregninger paa hver sin linje med lighedstegnene under hinanden
       (brugeren 9. oktober 2026). raekker: { v: venstresiden, m: udtrykket,
       r: "= resultatet" (kan mangle), s: stoffet }, som HTML eller som
       elementer. maerke: ✓ eller ↩ efter etiketten. */
    var KONC_ETIKET = "Koncentrationerne ved ligevægt";

    function regneBlok(etiket, raekker, klasse, maerke) {
        var w = el("div", "regn" + (klasse ? " " + klasse : ""));
        w.appendChild(el("span", "regn-etiket", NK.html(etiket) + (maerke || "")));
        var g = el("div", "regn-gitter");
        function celle(kl, indhold) {
            var c = el("span", kl);
            if (typeof indhold === "string") c.innerHTML = indhold;
            else if (indhold) c.appendChild(indhold);
            return c;
        }
        raekker.forEach(function (r) {
            var v = celle("rg-v", r.v);
            if (r.s) v.setAttribute("data-s", r.s);
            g.appendChild(v);
            g.appendChild(celle("rg-l", "="));
            g.appendChild(celle("rg-m", r.m));
            g.appendChild(celle("rg-r", r.r));
        });
        w.appendChild(g);
        return w;
    }

    function maerkeHTML(vist) {
        return ' <span class="rs-maerke' + (vist ? " svar" : "") + '">' + (vist ? "↩" : "✓") + "</span>";
    }

    /* ===================================================================
       Tjek af de enkelte felter. Svar: { ok } | { tom, besked } | { besked }
       =================================================================== */
    function navnet(s) { return M.skriv(s); }

    function tjekStart(o, s, raa) {
        var u = M.udtryk(raa);
        if (u.tom) return { tom: true, besked: "Skriv startkoncentrationen af " + navnet(s) + ". Står der ikke noget i opgaven, er den 0." };
        if (u.fejl) return { besked: u.fejl };
        if (!u.konst) return { besked: "Ved start er der ikke omsat noget endnu. Skriv kun tal i rækken Start." };
        var v = u.f(0), c0 = M.c0(o, s);
        if (M.ens(v, c0, 0.005)) return { ok: true };
        if (!c0) return { besked: "Der er intet " + navnet(s) + " fra start. Skriv 0." };
        var andre = M.alle(o).filter(function (a) { return a.s !== s && M.c0(o, a.s) && M.ens(v, M.c0(o, a.s), 0.005); });
        if (andre.length) return { besked: NK.tal(v) + " M er startkoncentrationen af " + navnet(andre[0].s) + ", ikke af " + navnet(s) + "." };
        return { besked: "Find startkoncentrationen af " + navnet(s) + " under Oplyst på tavlen." };
    }

    function brugX(u) {
        if (u.vars.length > 1 || (u.vars.length === 1 && u.vars[0].toLowerCase() !== "x")) {
            return { besked: "Brug kun x som ubekendt." };
        }
        return null;
    }

    function tjekAendr(o, s, raa) {
        var a = M.find(o, s), b = M.aendring(a);
        var u = M.udtryk(raa);
        if (u.tom) return { tom: true, besked: "Skriv ændringen for " + navnet(s) + " med x." };
        if (u.fejl) return { besked: u.fejl };
        var x = brugX(u);
        if (x) return x;
        if (u.konst) return { besked: "Ændringen skrives med x. x er det, der omsættes." };
        var f = function (t) { return u.f(t, u.vars[0]); };
        if (M.samme(f, function (t) { return b * t; })) return { ok: true };
        if (M.samme(f, function (t) { return -b * t; })) {
            return { besked: a.side === "r" ? navnet(s) + " står før pilen og bliver brugt. Ændringen er negativ." :
                navnet(s) + " står efter pilen og dannes. Ændringen er positiv." };
        }
        if (M.c0(o, s) && M.samme(f, function (t) { return M.c0(o, s) + b * t; })) {
            return { besked: "Det er ligevægtskoncentrationen. I rækken Ændring står kun det, der kommer til eller forsvinder." };
        }
        var k = f(0.1) / 0.1;
        if (Math.abs(f(0)) < 1e-12 && isFinite(k)) {
            if (a.k > 1) return { besked: "Der står " + a.k + " foran " + navnet(s) + ". Der " + (a.side === "r" ? "bruges " : "dannes ") + a.k + " " + navnet(s) + ", hver gang x vokser med én." };
            return { besked: "Der står ikke noget tal foran " + navnet(s) + ". Så ændres det med x, ikke med et andet tal gange x." };
        }
        return { besked: "Ændringen for " + navnet(s) + " passer ikke. Reaktanterne får −, produkterne +, og koefficienten står foran x." };
    }

    function tjekLig(o, s, raa) {
        var pl = M.plads(o, s), a = M.find(o, s);
        var u = M.udtryk(raa);
        if (u.tom) return { tom: true, besked: "Skriv ligevægtskoncentrationen af " + navnet(s) + " med x." };
        if (u.fejl) return { besked: u.fejl };
        var x = brugX(u);
        if (x) return x;
        var f = function (t) { return u.f(t, u.vars[0]); };
        if (M.samme(f, function (t) { return pl.a + pl.b * t; })) return { ok: true };
        if (u.konst && M.ens(f(0), pl.a, 0.005)) return { besked: "Der er omsat x. Ligevægt = start + ændring for " + navnet(s) + "." };
        if (pl.a && M.samme(f, function (t) { return pl.b * t; })) {
            return { besked: "Der var " + NK.tal(pl.a) + " M " + navnet(s) + " fra start. Ligevægt = start + ændring." };
        }
        if (M.samme(f, function (t) { return pl.a - pl.b * t; })) {
            return { besked: "Ligevægt = start + ændring: " + NK.tal(pl.a) + " + (" + M.aendrTekst(a) + "). Se på fortegnet." };
        }
        return { besked: "Ligevægt = start + ændring. Læg de to tal i kolonnen for " + navnet(s) + " sammen." };
    }

    /* Et felt i ligningen: udtrykket fra skemaets nederste raekke */
    function tjekLigFelt(o, s, e, raa) {
        var pl = M.plads(o, s);
        var u = M.udtryk(raa);
        if (u.tom) return { tom: true, besked: "Skriv udtrykket for " + M.kon(s) + " i feltet." };
        if (u.fejl) return { besked: u.fejl };
        var x = brugX(u);
        if (x) return x;
        var f = function (t) { return u.f(t, u.vars[0]); };
        var facit = function (t) { return pl.a + pl.b * t; };
        if (M.samme(f, facit)) return { ok: true };
        if (e > 1 && M.samme(f, function (t) { return Math.pow(facit(t), e); })) {
            return { besked: "Eksponenten står allerede uden for parentesen. Skriv kun " + M.ligTekst(o, s) + " i feltet for " + M.kon(s) + "." };
        }
        if (u.konst && pl.a && M.ens(f(0), pl.a, 0.005)) {
            return { besked: NK.tal(pl.a) + " M er startkoncentrationen. Ved ligevægt er " + M.kon(s) + " udtrykket i skemaets nederste række." };
        }
        if (pl.a && M.samme(f, function (t) { return pl.b * t; })) return { besked: "Det er ændringen. Brug skemaets nederste række, Ligevægt." };
        var anden = M.alle(o).filter(function (a) {
            if (a.s === s) return false;
            var q = M.plads(o, a.s);
            return M.samme(f, function (t) { return q.a + q.b * t; });
        })[0];
        if (anden) return { besked: "Det er udtrykket for " + M.kon(anden.s) + ". I dette felt skal " + M.kon(s) + " stå." };
        return { besked: "Feltet for " + M.kon(s) + " passer ikke med skemaets nederste række." };
    }

    function tjekKFelt(o, raa) {
        var u = M.udtryk(raa);
        if (u.tom) return { tom: true, besked: "Skriv Kc's værdi til venstre for lighedstegnet." };
        if (u.fejl) return { besked: u.fejl };
        if (!u.konst) return { besked: "Til venstre for lighedstegnet står Kc's værdi, et tal." };
        var v = u.f(0);
        if (M.ens(v, o.K, 0.005)) return { ok: true };
        if (M.ens(v, 1 / o.K, 0.005)) return { besked: "Det er 1/Kc. Skriv Kc's værdi fra opgaven." };
        return { besked: "Kc's værdi står under Oplyst på tavlen." };
    }

    /* Et tal, der skal ramme en koncentration (fane 2 og svaret) */
    function tjekTal(raa, facit) {
        var u = M.udtryk(raa);
        if (u.tom) return { tom: true, besked: "Skriv tallet i feltet." };
        if (u.fejl) return { besked: u.fejl };
        if (!u.konst) return { besked: "Skriv et tal, ikke et bogstav." };
        var v = u.f(0);
        if (M.ens(v, facit, 0.02)) return { ok: true, v: v };
        return { v: v };
    }

    /* ===================================================================
       Fanen
       =================================================================== */
    var F = {};

    F.init = function (navn, opgaver, grupper) {
        var mig = this;
        this.N = navn;
        this.tavle = NK.el(navn + "-tavle");
        this.deleEl = NK.el(navn + "-dele");
        this.paab = {};
        this.startFane(opgaver, grupper);
        window.addEventListener("resize", function () { if (NK.el("fane-" + navn).classList.contains("aktiv")) mig.tilpas(); });
        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    };

    F.paabegyndt = function (i) { return !!this.paab[i]; };

    F.lavOpgave = function (i) {
        var mig = this, o = this.opgaver[i];
        this.o = o;
        this.type = o.type || "x";
        this.dele = D.DELE[this.type];
        this.k = 0;
        this.v = {};
        this.okF = {};
        this.fejlF = {};
        this.fase = { skema: "start", konc: "formel", indsaet: "tal", svar: "valg" };
        this.vist = {};
        this.brugtSvarNogen = false;
        this.fokusKey = null;
        this.roedder = null;
        this.vg = { proevet: -1, dom: [], venter: -1, arg: [] };
        NK.Tavle.reaktion(NK.el(this.N + "-reaktion"), o, function (a) { mig.klikArt(a); });
        NK.saetTekst(this.N + "-navn", o.navn + ", " + o.T);
        NK.saetHTML(this.N + "-linje", NK.kc(NK.html(this.spm())));
        this.bygOplyst();
        this.render();
    };

    F.spm = function () {
        var o = this.o;
        if (o.spm) return o.spm;
        var n = M.alle(o).length;
        return "Bestem ligevægtskoncentrationerne af " + (n === 2 ? "begge stoffer" : TALORD[n] + " stoffer") + ".";
    };

    /* ----- Oplyst: opgavens tal oeverst paa tavlen. Et klik saetter tallet ind. */
    F.bygOplyst = function () {
        var mig = this, o = this.o, rad = NK.el(this.N + "-oplyst");
        rad.innerHTML = '<span class="ot-etiket">Oplyst</span>';
        var tal = [];
        if (this.type === "kc") {
            tal.push({ vis: "V = " + NK.tal(o.V) + " L", ind: NK.tal(o.V) });
            Object.keys(o.n).forEach(function (s) { tal.push({ vis: "n(" + M.skriv(s) + ") = " + NK.tal(o.n[s]) + " mol", ind: NK.tal(o.n[s]), s: s }); });
        } else if (this.type === "ukendt") {
            tal.push({ vis: "Kc = " + M.kTekst(o), ind: NK.tal(o.K) });
            Object.keys(o.kendt).forEach(function (s) { tal.push({ vis: M.kon(s) + " = " + NK.tal(o.kendt[s]) + " M", ind: NK.tal(o.kendt[s]), s: s }); });
        } else {
            tal.push({ vis: "Kc = " + M.kTekst(o), ind: NK.tal(o.K) });
            Object.keys(o.c0).forEach(function (s) { tal.push({ vis: M.kon(s) + "<sub>start</sub> = " + NK.tal(o.c0[s]) + " M", ind: NK.tal(o.c0[s]), s: s, html: true }); });
        }
        tal.forEach(function (t) {
            var b = el("button", "ot-tal");
            b.type = "button";
            b.innerHTML = NK.kc(t.html ? t.vis.replace(/\[([^\]]*)\]/, function (m) { return NK.html(m); }) : NK.html(t.vis));
            b.title = "Klik for at sætte " + t.ind + " ind i feltet";
            if (t.s) b.setAttribute("data-s", t.s);
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });
            b.addEventListener("click", function () { mig.indsaet(t.ind, true); });
            rad.appendChild(b);
        });
    };

    /* Opgavens tal kommer foerst frem, naar ligevaegtsloven er skrevet
       rigtigt (brugeren 9. oktober 2026): foer det er der ikke noget felt
       til et tal. Pladsen er sat af, saa intet flytter sig. */
    F.visOplyst = function () {
        var rad = NK.el(this.N + "-oplyst");
        var skjul = this.dele[this.k] === "lov";
        rad.classList.toggle("ny", !skjul && rad.classList.contains("skjult"));
        rad.classList.toggle("skjult", skjul);
        if (skjul) rad.setAttribute("aria-hidden", "true");
        else rad.removeAttribute("aria-hidden");
    };

    /* Det, raekken Oplyst viser, sagt i ord, naar den kommer frem */
    F.oplystTekst = function () {
        var hvad = this.type === "kc" ? "Rumfanget og stofmængderne" :
            (this.type === "ukendt" ? "Kc og de kendte koncentrationer" :
                "Kc og " + (Object.keys(this.o.c0).length > 1 ? "startkoncentrationerne" : "startkoncentrationen"));
        return hvad + " står nu under reaktionsskemaet.";
    };

    /* Et klik paa et stof i reaktionsskemaet: i ligevaegtsloven skrives
       koncentrationen; ellers siger tekstboksen, hvad stoffet er */
    F.klikArt = function (a) {
        if (!this.faerdig && this.dele[this.k] === "lov") { this.indsaet(M.kon(a.s)); return; }
        var t = M.skriv(a.s) + " står " + (a.side === "r" ? "før pilen. Det er en reaktant." : "efter pilen. Det er et produkt.");
        if (a.k > 1) t += " Koefficienten er " + a.k + ".";
        this.kortBesked(t, 4);
    };

    /* ----- Felterne ----------------------------------------------------------------- */
    F.input = function (key, klasse, pladsholder, etiket) {
        var mig = this;
        var inp = document.createElement("input");
        inp.type = "text";
        inp.className = klasse + (this.fejlF[key] ? " fejl" : "");
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.value = this.v[key] || "";
        if (pladsholder) inp.placeholder = pladsholder;
        inp.setAttribute("aria-label", etiket || pladsholder || key);
        inp.setAttribute("data-key", key);
        inp.addEventListener("focus", function () { mig.fokusKey = key; });
        inp.addEventListener("input", function () {
            mig.v[key] = inp.value;
            mig.paab[mig.nr] = true;
            if (mig.fejlF[key]) { delete mig.fejlF[key]; inp.classList.remove("fejl"); }
            mig.nulstilHjaelp();
        });
        inp.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            var tomt = mig.felter.filter(function (f) { return f !== inp && f.tagName === "INPUT" && !f.value.trim(); })[0];
            if (tomt && inp.value.trim()) { tomt.focus(); return; }
            mig.tjek();
        });
        this.felter.push(inp);
        return inp;
    };

    F.select = function (key, valg, etiket) {
        var mig = this;
        var s = document.createElement("select");
        s.className = "rs-sel" + (this.fejlF[key] ? " fejl" : "");
        s.setAttribute("aria-label", etiket);
        s.setAttribute("data-key", key);
        var tom = document.createElement("option");
        tom.value = "";
        tom.textContent = "vælg …";
        s.appendChild(tom);
        valg.forEach(function (v) {
            var op = document.createElement("option");
            op.value = v.v;
            op.textContent = v.tekst;
            s.appendChild(op);
        });
        s.value = this.v[key] || "";
        s.addEventListener("focus", function () { mig.fokusKey = key; });
        s.addEventListener("change", function () {
            mig.v[key] = s.value;
            mig.paab[mig.nr] = true;
            if (mig.fejlF[key]) { delete mig.fejlF[key]; s.classList.remove("fejl"); }
            mig.nulstilHjaelp();
        });
        this.felter.push(s);
        return s;
    };

    F.tjekKnap = function (tekst) {
        var mig = this;
        var k = el("button", "tjekknap", tekst || "Tjek");
        k.type = "button";
        k.title = "Tjek (Enter)";
        k.addEventListener("click", function () { mig.tjek(); });
        return k;
    };

    F.chip = function (vis, tekst, s, klasse) {
        var mig = this;
        var b = el("button", "brik indsaetbrik" + (klasse ? " " + klasse : ""), NK.html(vis));
        b.type = "button";
        if (s) b.setAttribute("data-s", s);
        b.addEventListener("mousedown", function (e) { e.preventDefault(); });
        b.addEventListener("click", function () { mig.indsaet(tekst); });
        return b;
    };

    /* Saetter tekst ind ved markoeren i det felt, der har fokus (ellers
       det foerste tomme) */
    F.indsaet = function (tekst, tal) {
        if (this.faerdig) return;
        var inp = document.activeElement;
        if (!inp || inp.tagName !== "INPUT" || this.felter.indexOf(inp) < 0) {
            inp = this.felter.filter(function (f) { return f.tagName === "INPUT" && !f.value.trim(); })[0] ||
                this.felter.filter(function (f) { return f.getAttribute("data-key") === this.fokusKey; }, this)[0];
        }
        if (!inp || inp.tagName !== "INPUT") {
            if (tal) this.kortBesked("Tallene bruges senere. Der er ikke noget felt til et tal lige nu.", 3);
            return;
        }
        var a = inp.selectionStart, b = inp.selectionEnd;
        if (a === null || a === undefined) { a = inp.value.length; b = a; }
        inp.value = inp.value.slice(0, a) + tekst + inp.value.slice(b);
        inp.dispatchEvent(new Event("input"));
        inp.focus();
        try { inp.setSelectionRange(a + tekst.length, a + tekst.length); } catch (e) { /* intet */ }
    };

    F.markFejl = function (key) {
        this.fejlF[key] = true;
        var inp = this.felter.filter(function (f) { return f.getAttribute("data-key") === key; })[0];
        if (!inp) return;
        inp.classList.remove("fejl");
        void inp.offsetWidth;
        inp.classList.add("fejl");
        inp.focus();
    };

    /* ----- Tavlen --------------------------------------------------------------------- */
    F.render = function () {
        var mig = this;
        this.felter = [];
        /* Tekstboksen flyttes med den del, eleven er ved: loeft den ud,
           foer delene ryddes */
        var boks = this.el.status;
        if (boks.parentNode) boks.parentNode.removeChild(boks);
        this.visOplyst();
        var bar = NK.el(this.N + "-delbar");
        var html = "";
        this.dele.forEach(function (d, i) {
            var klasse = "db-trin" + (i < mig.k ? " ok" : (i === mig.k && !mig.faerdig ? " nu" : ""));
            if (i > 0) html += '<li class="db-pil" aria-hidden="true">›</li>';
            html += '<li class="' + klasse + '"><span class="db-nr">' + (i < mig.k ? "✓" : i + 1) + '</span><span class="db-navn">' +
                NK.html(D.DEL_NAVN[d]) + "</span></li>";
        });
        bar.innerHTML = html;

        this.deleEl.innerHTML = "";
        for (var i = 0; i <= this.k && i < this.dele.length; i++) {
            var navn = this.dele[i];
            var faerdigDel = i < this.k;
            var blok = el("div", "rb " + (faerdigDel ? "ok" : "aktiv") + " rb-" + navn);
            if (faerdigDel) {
                var linje = this["linje_" + navn]();
                if (typeof linje === "string") {
                    var l = el("div", "rb-linje", '<span class="rl">' + NK.kc(linje) + '</span><span class="rs-maerke' + (this.vist[navn] ? " svar" : "") + '">' + (this.vist[navn] ? "↩" : "✓") + "</span>");
                    blok.appendChild(l);
                } else blok.appendChild(linje);
            } else {
                blok.appendChild(boks);
                blok.appendChild(this["aktiv_" + navn]());
            }
            this.deleEl.appendChild(blok);
        }
        if (this.faerdig) {
            var slut = el("div", "rb slut");
            slut.appendChild(boks);
            this.deleEl.appendChild(slut);
        }

        var stempel = NK.el(this.N + "-stempel");
        stempel.hidden = !this.faerdig;
        stempel.textContent = this.brugtSvarNogen ? "Vist" : "Løst ✓";
        stempel.className = "tv-stempel" + (this.brugtSvarNogen ? " gul" : "");
        this.tavle.classList.toggle("faerdig", !!this.faerdig && !this.brugtSvarNogen);
        this.tavle.classList.toggle("vist", !!this.faerdig && !!this.brugtSvarNogen);
        this.visLys();
        this.tilpas();
    };

    F.fokusFelt = function () {
        if (!NK.el("fane-" + this.N).classList.contains("aktiv")) return;
        var mig = this;
        var f = (this.felter || []).filter(function (x) { return x.getAttribute("data-key") === mig.fokusKey; })[0];
        if (!f) f = (this.felter || []).filter(function (x) { return !x.value; })[0] || (this.felter || [])[0];
        if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    };

    /* Tavlen skal kunne vaere der: skriften goeres mindre, til den passer,
       men ikke under 16 px. Er der stadig ikke plads, kan der rulles, og
       den del, eleven er ved, rulles frem. */
    F.tilpas = function () {
        var arb = NK.el(this.N + "-arbejde");
        if (!arb || !arb.offsetHeight) return;
        arb.style.removeProperty("--fs");
        var fs = parseFloat(window.getComputedStyle(arb).fontSize) || 30;
        var gange = 0;
        while (gange++ < 40 && fs - 1 >= 15.99 && (arb.scrollHeight > arb.clientHeight + 1 || this.tavle.scrollWidth > this.tavle.clientWidth + 1)) {
            fs -= 1;
            arb.style.setProperty("--fs", fs + "px");
        }
        var akt = this.deleEl.querySelector(".rb.aktiv") || (this.faerdig ? this.deleEl.lastElementChild : null);
        if (akt && arb.scrollHeight > arb.clientHeight + 1) {
            var ra = arb.getBoundingClientRect(), rb = akt.getBoundingClientRect();
            if (rb.bottom > ra.bottom) arb.scrollTop += rb.bottom - ra.bottom + 8;
            else if (rb.top < ra.top) arb.scrollTop -= ra.top - rb.top + 8;
        } else arb.scrollTop = 0;
    };

    F.opdater = function (dt) {
        this.opdaterBesked(dt);
        if (this.kurve) this.tegnKurve(dt);
    };

    /* ----- Tjek, hint og svar gaar til den aktive del ------------------------------------ */
    F.del = function () { return this.faerdig ? null : this.dele[this.k]; };

    F.tjek = function () {
        var d = this.del();
        if (!d) return;
        this["tjek_" + d]();
    };

    F.hintTrin = function () {
        var d = this.del();
        if (!d) return null;
        return this["hint_" + d]();
    };

    F.visSvar = function () {
        var d = this.del();
        if (!d) return;
        this.brugtSvarNogen = true;
        this["svar_" + d]();
    };

    F.trinLinje = function () {
        var d = this.del();
        if (!d) return "";
        return this["trin_" + d]();
    };

    F.enter = function () {
        if (this.faerdig) { this.knap(); return; }
        this.tjek();
    };

    F.nulstil = function () { this.vaelg(this.nr); };

    /* Et svar, der ikke er rigtigt: et tomt felt giver en gul linje, en fejl en roed */
    F.fejlSvar = function (svar, key) {
        if (svar.tom) this.besked(NK.html(svar.besked), "gul");
        else this.fejlLinje(svar.besked);
        if (key) this.markFejl(key);
    };

    /* En del er loest (vist: eleven fik svaret) */
    F.delOk = function (navn, vist, ros) {
        this.vist[navn] = !!vist;
        if (vist) this.brugtSvarNogen = true;
        this.k++;
        this.hjaelp = 0;
        this.hintS = null;
        this.pegKnap = false;
        this.fokusKey = null;
        if (this.k >= this.dele.length) { this.afslut(); return; }
        this.render();
        this.naesteLinje('<span class="b-maerke">' + (vist ? "Svaret" : "✓") + "</span> " + (ros ? NK.html(ros) : ""), vist ? "gul" : "god");
        this.visKnap();
        this.fokusFelt();
    };

    /* En fase i en del er loest: tegn igen og sig det naeste */
    F.faseOk = function (tekst, vist) {
        if (vist) this.brugtSvarNogen = true;
        this.hjaelp = 0;
        this.hintS = null;
        this.pegKnap = false;
        this.fokusKey = null;
        this.render();
        this.naesteLinje('<span class="b-maerke">' + (vist ? "Svaret" : "✓") + "</span> " + NK.html(tekst || ""), vist ? "gul" : "god");
        this.visKnap();
        this.fokusFelt();
    };

    F.afslut = function () {
        this.k = this.dele.length;
        this.faerdig = true;
        this.render();
        var tekst = this.slutTekst();
        this.loest(this.brugtSvarNogen ? "svar" : "ok", NK.html(tekst), this.brugtSvarNogen ? "Svaret" : "Løst ✓");
        this.render();
    };

    F.slutTekst = function () {
        var o = this.o;
        if (this.type === "kc") return "Kc = " + M.kTekst(o, M.kAf(o, M.cAfN(o))) + " ved " + o.T + ".";
        if (this.type === "ukendt") return M.kon(o.ukendt) + " = " + NK.tal(this.svarRod()) + " M.";
        var x = M.xFacit(o), c = M.ceq(o, x);
        return M.alle(o).map(function (a) { return M.kon(a.s) + " = " + NK.tal(c[a.s]) + " M"; }).join(", ") + ".";
    };

    /* ===================================================================
       DEL: Ligevaegtsloven
       =================================================================== */
    F.aktiv_lov = function () {
        var o = this.o, mig = this;
        var blok = el("div", "lov");
        var rad = el("div", "rs-rad");
        rad.appendChild(el("span", "k-tegn", "K<sub>c</sub> ="));
        var b = el("div", "bf-broek");
        var top = el("div", "bf-top");
        top.appendChild(this.input("lov.num", "bf-in lov", "tæller", "Tælleren"));
        b.appendChild(top);
        b.appendChild(el("div", "bf-streg"));
        var bund = el("div", "bf-top");
        bund.appendChild(this.input("lov.den", "bf-in lov", "nævner", "Nævneren"));
        b.appendChild(bund);
        rad.appendChild(b);
        rad.appendChild(this.tjekKnap());
        blok.appendChild(rad);
        var chips = el("div", "indsaet-raekke");
        chips.appendChild(el("span", "ir-etiket", "Klik for at skrive"));
        var maks = 2;
        M.alle(o).forEach(function (a) {
            chips.appendChild(mig.chip(M.kon(a.s), M.kon(a.s), a.s));
            maks = Math.max(maks, a.k);
        });
        chips.appendChild(this.chip("·", "·"));
        for (var e = 2; e <= maks; e++) chips.appendChild(this.chip(NK.haevet(e), NK.haevet(e), null, "eks"));
        blok.appendChild(chips);
        return blok;
    };

    F.linje_lov = function () { return M.lovHTML(this.o); };

    F.tjek_lov = function () {
        var d = M.lovDom(this.o, this.v["lov.num"], this.v["lov.den"]);
        if (d.ok) { this.delOk("lov", false, "Ligevægtsloven er rigtig. " + this.oplystTekst()); return; }
        this.hintS = null;
        this.fejlSvar({ tom: d.tom, besked: d.tekst }, "lov." + d.z);
    };

    F.hint_lov = function () { return M.lovHint(this.o, this.v["lov.num"], this.v["lov.den"]); };

    F.svar_lov = function () {
        var f = M.lovFelter(this.o);
        this.v["lov.num"] = f.num;
        this.v["lov.den"] = f.den;
        this.delOk("lov", true, "Ligevægtsloven. " + this.oplystTekst());
    };

    F.trin_lov = function () {
        return "Skriv ligevægtsloven: produkterne i tælleren og reaktanterne i nævneren. Du kan klikke på koncentrationerne.";
    };

    /* ===================================================================
       DEL: Hvad er x? (fane 3)
       =================================================================== */
    F.aktiv_defx = function () {
        var o = this.o;
        var p = el("div", "defx");
        p.appendChild(el("b", "", "x"));
        p.appendChild(T(" er "));
        p.appendChild(this.select("dx.str", D.X_STR, "Hvad x er"));
        p.appendChild(T(" af "));
        p.appendChild(this.select("dx.stof", M.alle(o).map(function (a) { return { v: a.s, tekst: M.skriv(a.s) }; }), "Stoffet"));
        p.appendChild(T(", der "));
        p.appendChild(this.select("dx.verb", [{ v: "oms", tekst: "omsættes" }, { v: "dan", tekst: "dannes" }], "Omsættes eller dannes"));
        p.appendChild(T(", indtil ligevægten har indstillet sig. "));
        p.appendChild(el("b", "", "x"));
        p.appendChild(T(" måles i "));
        p.appendChild(this.select("dx.enh", D.X_ENH, "Enheden"));
        p.appendChild(T("."));
        p.appendChild(this.tjekKnap());
        return p;
    };

    F.xSaetning = function () {
        var s = this.v["dx.stof"], verb = this.v["dx.verb"] === "dan" ? "dannes" : "omsættes";
        return "x er den koncentration af " + M.skriv(s) + ", der " + verb + ", indtil ligevægten har indstillet sig. x måles i M.";
    };

    F.linje_defx = function () { return NK.html(this.xSaetning()); };

    F.tjek_defx = function () {
        var o = this.o, v = this.v;
        var str = v["dx.str"], s = v["dx.stof"], verb = v["dx.verb"], enh = v["dx.enh"];
        if (!str) return this.fejlSvar({ tom: true, besked: "Vælg, hvad x er, i den første boks." }, "dx.str");
        if (str === "lig") return this.fejlSvar({ besked: "Ligevægtskoncentrationen er det, der er tilbage til sidst. x er det, der ændrer sig undervejs." }, "dx.str");
        if (str === "n") return this.fejlSvar({ besked: "Skemaet regner i koncentrationer, ikke i mol. x er en koncentration." }, "dx.str");
        if (str === "broek") return this.fejlSvar({ besked: "En brøkdel har ingen enhed og kan ikke trækkes fra en koncentration. x er en koncentration." }, "dx.str");
        if (!s) return this.fejlSvar({ tom: true, besked: "Vælg stoffet." }, "dx.stof");
        var a = M.find(o, s);
        if (a.k > 1) return this.fejlSvar({ besked: "Der står " + a.k + " foran " + M.skriv(s) + ". Vælg et stof med koefficienten 1, så bliver ændringerne x, 2x og så videre." }, "dx.stof");
        if (!verb) return this.fejlSvar({ tom: true, besked: "Vælg, om " + M.skriv(s) + " omsættes eller dannes." }, "dx.verb");
        if (a.side === "r" && verb === "dan") return this.fejlSvar({ besked: M.skriv(s) + " står før pilen. Det bliver brugt, så det omsættes." }, "dx.verb");
        if (a.side === "p" && verb === "oms") return this.fejlSvar({ besked: M.skriv(s) + " står efter pilen. Det dannes." }, "dx.verb");
        if (!enh) return this.fejlSvar({ tom: true, besked: "Vælg enheden for x." }, "dx.enh");
        if (enh === "mol") return this.fejlSvar({ besked: "x er en koncentration. En koncentration måles i M, altså mol/L." }, "dx.enh");
        if (enh === "ingen") return this.fejlSvar({ besked: "x er en koncentration og har enheden M." }, "dx.enh");
        this.delOk("defx", false, "Skriv altid den sætning, før du bruger x.");
    };

    F.xStofFacit = function () {
        return M.alle(this.o).filter(function (a) { return a.side === "r" && a.k === 1; })[0];
    };

    F.hint_defx = function () {
        var a = this.xStofFacit();
        return { s: a.s, trin: [
            "x er en ændring: den koncentration, der bliver brugt eller dannet fra start til ligevægt.",
            "Vælg et stof med koefficienten 1, fx " + M.skriv(a.s) + ", og om det omsættes eller dannes. En koncentration måles i M.",
            "x er den koncentration af " + M.skriv(a.s) + ", der omsættes, indtil ligevægten har indstillet sig. x måles i M."
        ] };
    };

    F.svar_defx = function () {
        var a = this.xStofFacit();
        this.v["dx.str"] = "konc";
        this.v["dx.stof"] = a.s;
        this.v["dx.verb"] = "oms";
        this.v["dx.enh"] = "M";
        this.delOk("defx", true, "Sådan defineres x.");
    };

    F.trin_defx = function () {
        return "Gør klart, hvad x er, før du bruger det. Vælg i de fire bokse.";
    };

    /* ===================================================================
       DEL: Skemaet (fane 3) med raekkerne Start, Ændring og Ligevægt
       =================================================================== */
    var RAEKKER = ["start", "aendr", "lig"];
    var RAEKKE_NAVN = { start: "Start", aendr: "Ændring", lig: "Ligevægt" };

    F.facitCelle = function (r, s) {
        var o = this.o;
        if (r === "start") return NK.tal(M.c0(o, s));
        if (r === "aendr") return M.aendrTekst(M.find(o, s));
        return M.ligTekst(o, s, false);
    };

    /* Tabellen. tilstand: "aktiv" (felter i den raekke, eleven er ved),
       "faerdig", "klik" (et klik paa en ligevaegtscelle saetter udtrykket
       ind) eller "proeve" (ligevaegtsraekken med en loesning sat ind) */
    F.skemaTabel = function (tilstand) {
        var mig = this, o = this.o, arter = M.alle(o);
        var fase = this.fase.skema;
        var tab = el("table", "ice");
        var hoved = el("tr");
        hoved.appendChild(el("th", "ice-hj", "c / M"));
        arter.forEach(function (a) {
            var th = el("th", "", NK.html(M.skriv(a.s)));
            th.setAttribute("data-s", a.s);
            hoved.appendChild(th);
        });
        tab.appendChild(hoved);
        var x = this.vg.proevet >= 0 && this.roedder ? this.roedder[this.vg.proevet] : null;
        RAEKKER.forEach(function (r, ri) {
            var tr = el("tr", "ice-" + r);
            tr.appendChild(el("th", "ice-r", RAEKKE_NAVN[r]));
            var fi = RAEKKER.indexOf(fase);
            arter.forEach(function (a) {
                var td = el("td");
                td.setAttribute("data-s", a.s);
                var key = "sk." + r + "." + a.s;
                if (tilstand === "aktiv" && ri === fi && !mig.okF[key]) {
                    var pl = r === "start" ? "tal" : (r === "aendr" ? "med x" : "start + ændring");
                    td.appendChild(mig.input(key, "ice-in", pl, RAEKKE_NAVN[r] + " for " + M.skriv(a.s)));
                } else if (tilstand !== "aktiv" || ri < fi || mig.okF[key]) {
                    var tekst = mig.facitCelle(r, a.s);
                    if (r === "lig" && tilstand === "proeve" && x !== null) {
                        var c = M.vaerdi(M.plads(o, a.s), x);
                        var neg = c < -1e-12;
                        var knap = el("button", "ice-celle" + (neg ? " neg" : " pos") + (mig.vg.venter >= 0 ? " vaelg" : ""));
                        knap.type = "button";
                        knap.setAttribute("data-s", a.s);
                        knap.innerHTML = '<span class="ic-u">' + NK.html(tekst) + '</span><span class="ic-ind">' +
                            NK.html(M.indsatTekst(o, a.s, x, false)) + ' <b class="ic-tegn">' + (neg ? "&lt; 0" : "&gt; 0") + "</b></span>";
                        knap.addEventListener("click", function () { mig.klikCelle(a.s); });
                        td.appendChild(knap);
                    } else if (r === "lig" && tilstand === "klik") {
                        var k2 = el("button", "ice-celle klik", NK.html(tekst));
                        k2.type = "button";
                        k2.title = "Klik for at sætte " + tekst + " ind i ligningen";
                        k2.addEventListener("mousedown", function (e) { e.preventDefault(); });
                        k2.addEventListener("click", function () { mig.indsaet(tekst); });
                        td.appendChild(k2);
                    } else {
                        td.textContent = tekst;
                        if (tilstand === "aktiv" && mig.okF[key]) td.className = "ice-ok";
                    }
                }
                tr.appendChild(td);
            });
            if (tilstand === "aktiv" && ri === fi) {
                var tdK = el("td", "ice-tjek");
                tdK.appendChild(mig.tjekKnap());
                tr.appendChild(tdK);
            } else if (tilstand === "aktiv") tr.appendChild(el("td", "ice-tjek"));
            tab.appendChild(tr);
        });
        return tab;
    };

    F.aktiv_skema = function () {
        var w = el("div", "ice-ramme");
        w.appendChild(this.skemaTabel("aktiv"));
        return w;
    };

    F.linje_skema = function () {
        var d = this.del();
        var tilstand = d === "ligning" ? "klik" : (d === "valg" && this.vg.proevet >= 0 ? "proeve" : "faerdig");
        var w = el("div", "ice-ramme");
        w.appendChild(this.skemaTabel(tilstand));
        if (this.vist.skema) w.appendChild(el("span", "rs-maerke svar ice-maerke", "↩"));
        else w.appendChild(el("span", "rs-maerke ice-maerke", "✓"));
        return w;
    };

    var TJEK_RAEKKE = { start: tjekStart, aendr: tjekAendr, lig: tjekLig };

    F.tjek_skema = function () {
        var mig = this, o = this.o, r = this.fase.skema;
        var forste = null, nogen = false;
        M.alle(o).forEach(function (a) {
            var key = "sk." + r + "." + a.s;
            if (mig.okF[key]) return;
            var svar = TJEK_RAEKKE[r](o, a.s, mig.v[key]);
            if (svar.ok) { mig.okF[key] = true; nogen = true; }
            else if (!forste || (forste.svar.tom && !svar.tom)) forste = { svar: svar, key: key, s: a.s };
        });
        if (!forste) {
            var i = RAEKKER.indexOf(r);
            if (i < 2) {
                this.fase.skema = RAEKKER[i + 1];
                this.faseOk(r === "start" ? "Startkoncentrationerne er rigtige." : "Ændringerne er rigtige.");
                return;
            }
            this.delOk("skema", this.vist.skemaDel, "Skemaet er færdigt. Nederste række er koncentrationerne ved ligevægt, udtrykt ved x.");
            return;
        }
        if (nogen) this.render();
        this.hintS = forste.s;
        this.visLys();
        this.fejlSvar(forste.svar, forste.key);
    };

    F.foersteUloeste = function (r) {
        var mig = this;
        return M.alle(this.o).filter(function (a) { return !mig.okF["sk." + r + "." + a.s]; })[0] || M.alle(this.o)[0];
    };

    F.hint_skema = function () {
        var o = this.o, r = this.fase.skema, a = this.foersteUloeste(r);
        var alle = M.alle(o);
        if (r === "start") {
            var nul = alle.filter(function (b) { return !M.c0(o, b.s); }).map(function (b) { return M.skriv(b.s); });
            return { s: a.s, trin: [
                "Startkoncentrationerne står under Oplyst på tavlen. Klik på et tal for at sætte det ind.",
                nul.length ? "Der er intet " + nul.join(" og intet ") + " fra start. Skriv 0." : "Alle stofferne er der fra start.",
                "Start: " + alle.map(function (b) { return M.skriv(b.s) + " " + NK.tal(M.c0(o, b.s)); }).join(", ") + "."
            ] };
        }
        if (r === "aendr") {
            var xs = this.xStofFacit();
            return { s: a.s, trin: [
                "Reaktanterne bruges, og produkterne dannes. Koefficienterne siger, hvor meget.",
                "Når x " + M.skriv(xs.s) + " omsættes, " + (a.side === "r" ? "bruges " : "dannes ") + (a.k > 1 ? a.k + "x " : "x ") + M.skriv(a.s) + ".",
                "Ændring: " + alle.map(function (b) { return M.skriv(b.s) + " " + M.aendrTekst(b); }).join(", ") + "."
            ] };
        }
        return { s: a.s, trin: [
            "Ligevægt = start + ændring for hvert stof.",
            M.skriv(a.s) + ": " + NK.tal(M.c0(o, a.s)) + " + (" + M.aendrTekst(a) + ") = " + M.ligTekst(o, a.s, false) + ".",
            "Ligevægt: " + alle.map(function (b) { return M.skriv(b.s) + " " + M.ligTekst(o, b.s, false); }).join(", ") + "."
        ] };
    };

    F.svar_skema = function () {
        var mig = this, r = this.fase.skema;
        M.alle(this.o).forEach(function (a) {
            var key = "sk." + r + "." + a.s;
            mig.okF[key] = true;
            mig.v[key] = mig.facitCelle(r, a.s);
        });
        this.vist.skemaDel = true;
        var i = RAEKKER.indexOf(r);
        if (i < 2) {
            this.fase.skema = RAEKKER[i + 1];
            this.faseOk("Rækken " + RAEKKE_NAVN[r] + " er udfyldt.", true);
            return;
        }
        this.vist.skema = true;
        this.delOk("skema", true, "Skemaet er udfyldt.");
    };

    F.trin_skema = function () {
        var r = this.fase.skema;
        if (r === "start") return "Skriv startkoncentrationerne i skemaet. Tallene står under Oplyst. Der står 0, hvis stoffet ikke er der fra start.";
        if (r === "aendr") return "Skriv ændringen for hvert stof med x. Reaktanterne bruges, og produkterne dannes.";
        return "Skriv ligevægtskoncentrationen for hvert stof med x: start + ændring.";
    };

    /* ===================================================================
       DEL: Ligningen (fane 3)
       =================================================================== */
    F.ligningsFelter = function (prefix, felt) {
        var mig = this, o = this.o;
        var lov = M.lovFacit(o);
        function side(liste) {
            var top = el("div", "bf-top");
            liste.forEach(function (l, i) {
                if (i > 0) top.appendChild(el("span", "bf-gange", "·"));
                var grp = el("span", "bf-faktor");
                if (l.e > 1) grp.appendChild(el("span", "bf-par", "("));
                grp.appendChild(felt(l));
                if (l.e > 1) {
                    grp.appendChild(el("span", "bf-par", ")"));
                    grp.appendChild(el("sup", "bf-eks", String(l.e)));
                }
                top.appendChild(grp);
            });
            return top;
        }
        var b = el("div", "bf-broek");
        b.appendChild(side(lov.num));
        b.appendChild(el("div", "bf-streg"));
        b.appendChild(side(lov.den.length ? lov.den : []));
        return b;
    };

    F.aktiv_ligning = function () {
        var mig = this;
        var rad = el("div", "rs-rad");
        rad.appendChild(this.input("lg.K", "bf-in tal", "Kc", "Kc's værdi"));
        rad.appendChild(el("span", "rs-lig", "="));
        rad.appendChild(this.ligningsFelter("lg", function (l) {
            return mig.input("lg.s." + l.s, "bf-in udtr", M.kon(l.s), "Udtrykket for " + M.kon(l.s));
        }));
        rad.appendChild(this.tjekKnap());
        return rad;
    };

    /* Ligningen som HTML: med enheder paa tavlen, uden i CAS */
    F.ligningHTML = function (enh) {
        var o = this.o, lov = M.lovFacit(o);
        var fn = function (l) { return NK.html(M.ligTekst(o, l.s, enh)); };
        var venstre = enh ? NK.html(M.kTekst(o)) : NK.tal(o.K);
        return venstre + " = " + broekHTML(delAf(lov.num, fn), lov.den.length ? delAf(lov.den, fn) : "1");
    };

    F.linje_ligning = function () { return this.ligningHTML(true); };

    F.tjek_ligning = function () {
        var mig = this, o = this.o;
        var k = tjekKFelt(o, this.v["lg.K"]);
        if (!k.ok) { this.fejlSvar(k, "lg.K"); return; }
        var lov = M.lovFacit(o);
        var forste = null;
        lov.num.concat(lov.den).forEach(function (l) {
            if (forste && !forste.svar.tom) return;
            var svar = tjekLigFelt(o, l.s, l.e, mig.v["lg.s." + l.s]);
            if (!svar.ok && (!forste || (forste.svar.tom && !svar.tom))) forste = { svar: svar, key: "lg.s." + l.s, s: l.s };
        });
        if (!forste) { this.delOk("ligning", false, "Ligningen har kun én ubekendt, x."); return; }
        this.hintS = forste.s;
        this.visLys();
        this.fejlSvar(forste.svar, forste.key);
    };

    F.hint_ligning = function () {
        var o = this.o, lov = M.lovFacit(o);
        var l = lov.den[0] || lov.num[0];
        return { s: l.s, trin: [
            "Ved ligevægt er brøken lig med Kc. Skriv Kc's værdi til venstre for lighedstegnet.",
            "I hvert felt skal udtrykket fra skemaets nederste række stå. Fx er " + M.kon(l.s) + " = " + M.ligTekst(o, l.s) + ". Du kan klikke på udtrykkene i skemaet.",
            this.ligningTekst()
        ] };
    };

    F.ligningTekst = function () {
        var o = this.o, lov = M.lovFacit(o);
        var fn = function (l) { return M.ligTekst(o, l.s, false); };
        var t = delAf(lov.num, fn), n = lov.den.length ? delAf(lov.den, fn) : "1";
        if (lov.den.length > 1 || /[+−]/.test(n)) n = "(" + n + ")";
        return NK.tal(o.K) + " = " + t + " / " + n;
    };

    F.svar_ligning = function () {
        var mig = this, o = this.o;
        this.v["lg.K"] = NK.tal(o.K);
        M.lovFacit(o).num.concat(M.lovFacit(o).den).forEach(function (l) { mig.v["lg.s." + l.s] = M.ligTekst(o, l.s, false); });
        this.delOk("ligning", true, "Ligningen.");
    };

    F.trin_ligning = function () {
        return "Opstil ligningen: Kc's værdi = ligevægtsloven med udtrykkene fra skemaets nederste række. Du kan klikke på udtrykkene i skemaet.";
    };

    /* ===================================================================
       DEL: CAS (fane 2 og 3)
       =================================================================== */
    F.variabel = function () { return this.type === "ukendt" ? (this.v.var || "c") : "x"; };

    F.casLigningHTML = function () {
        if (this.type === "ukendt") return this.ukendtHTML(false);
        return this.ligningHTML(false);
    };

    F.aktiv_cas = function () {
        var mig = this, v = this.variabel();
        var w = el("div", "cas");
        w.appendChild(el("div", "cas-hoved", "<span>CAS</span><span class=\"cas-note\">regner uden enheder</span>"));
        var rad = el("div", "cas-rad");
        rad.appendChild(el("div", "cas-ind", NK.kc(this.casLigningHTML())));
        var k = el("button", "cas-knap", "Løs ligningen for " + v);
        k.type = "button";
        k.addEventListener("click", function () { mig.koerCas(); });
        rad.appendChild(k);
        w.appendChild(rad);
        this.felter.push(k);
        return w;
    };

    F.koerCas = function (vist) {
        var o = this.o;
        this.roedder = this.type === "ukendt" ? M.loesUkendt(o) : M.loesX(o);
        this.vg = { proevet: -1, dom: [], venter: -1, arg: [] };
        var n = this.roedder.length;
        this.delOk("cas", !!vist, n === 1 ? "CAS giver én løsning. Den skal stadig tjekkes." : "CAS giver " + n + " løsninger. Kun den ene kan bruges.");
    };

    F.casUd = function () {
        var v = this.variabel();
        return this.roedder.map(function (r) { return v + " = " + NK.casTal(r); }).join("  ∨  ");
    };

    F.linje_cas = function () {
        return '<span class="cas-mini"><span class="cas-mini-ind">' + NK.kc(this.casLigningHTML()) + '</span><span class="cas-pil">CAS:</span><span class="cas-mini-ud">' + NK.html(this.casUd()) + "</span></span>";
    };

    F.tjek_cas = function () { this.koerCas(); };

    F.hint_cas = function () {
        return { s: null, trin: ["Tryk Løs ligningen for " + this.variabel() + ". CAS finder alle løsninger. Bagefter afgør du, hvilken der kan bruges."] };
    };

    F.svar_cas = function () { this.koerCas(true); };

    F.trin_cas = function () { return "Løs ligningen med CAS. Tryk på knappen."; };

    /* ===================================================================
       DEL: Løsningen (fane 3): proev hver loesning i skemaet
       =================================================================== */
    F.aktiv_valg = function () {
        var mig = this;
        var w = el("div", "valg");
        this.roedder.forEach(function (r, i) {
            var kort = el("div", "lsn" + (mig.vg.proevet === i ? " proevet" : "") + (mig.vg.dom[i] === "brug" ? " brug" : "") + (mig.vg.dom[i] === "forkast" ? " forkast" : ""));
            var k = el("button", "lsn-x", "x = " + NK.html(NK.tal(r)) + " M");
            k.type = "button";
            k.title = "Prøv løsningen i skemaet";
            k.addEventListener("click", function () { mig.proev(i); });
            kort.appendChild(k);
            if (mig.vg.dom[i] === "brug") kort.appendChild(el("span", "lsn-dom ok", "kan bruges ✓"));
            else if (mig.vg.dom[i] === "forkast") kort.appendChild(el("span", "lsn-dom nej", "forkastet: " + NK.html(M.kon(mig.vg.arg[i])) + " &lt; 0"));
            else if (mig.vg.venter === i) kort.appendChild(el("span", "lsn-dom vent", "klik på den negative koncentration i skemaet"));
            else if (mig.vg.proevet === i) {
                var ja = el("button", "lsn-knap ja", "Kan bruges");
                ja.type = "button";
                ja.addEventListener("click", function () { mig.brug(i); });
                var nej = el("button", "lsn-knap nej", "Forkast");
                nej.type = "button";
                nej.addEventListener("click", function () { mig.forkast(i); });
                kort.appendChild(ja);
                kort.appendChild(nej);
            } else kort.appendChild(el("span", "lsn-dom", "klik for at prøve"));
            w.appendChild(kort);
        });
        return w;
    };

    F.proev = function (i) {
        if (this.faerdig || this.del() !== "valg" || this.vg.dom[i]) return;
        this.vg.proevet = i;
        this.vg.venter = -1;
        this.paab[this.nr] = true;
        this.nulstilHjaelp();
        this.render();
        this.naesteLinje("", "");
        this.visKnap();
    };

    F.brug = function (i) {
        var o = this.o, x = this.roedder[i], d = M.dom(o, x);
        if (!d.ok) {
            this.hintS = d.neg;
            this.visLys();
            this.fejlLinje("Med x = " + NK.tal(x) + " M bliver " + M.kon(d.neg) + " negativ. Se rækken Ligevægt i skemaet.");
            return;
        }
        this.vg.dom[i] = "brug";
        this.efterDom("x = " + NK.tal(x) + " M giver positive koncentrationer, så den kan bruges.");
    };

    F.forkast = function (i) {
        var o = this.o, x = this.roedder[i], d = M.dom(o, x);
        if (d.ok) {
            this.fejlLinje("Med x = " + NK.tal(x) + " M er alle koncentrationer positive. Den løsning kan bruges.");
            return;
        }
        this.vg.venter = i;
        this.render();
        this.besked('<span class="b-maerke">Hvorfor?</span> Klik på den koncentration i skemaet, der bliver negativ. Det er begrundelsen.', "gul");
    };

    F.klikCelle = function (s) {
        if (this.faerdig || this.del() !== "valg") return;
        var i = this.vg.venter;
        var x = this.vg.proevet >= 0 ? this.roedder[this.vg.proevet] : null;
        if (x === null) return;
        var c = M.vaerdi(M.plads(this.o, s), x);
        if (i < 0) {
            this.kortBesked(M.kon(s) + " = " + M.indsatTekst(this.o, s, x) + (c < 0 ? " er negativ." : " er positiv."), 4);
            return;
        }
        if (c >= -1e-12) {
            this.fejlLinje(M.kon(s) + " = " + M.indsatTekst(this.o, s, x) + " er positiv. Find den koncentration, der bliver negativ.");
            return;
        }
        this.vg.dom[i] = "forkast";
        this.vg.arg[i] = s;
        this.vg.venter = -1;
        this.efterDom("x = " + NK.tal(x) + " M forkastes, fordi " + M.kon(s) + " = " + M.indsatTekst(this.o, s, x) + " bliver negativ.");
    };

    F.efterDom = function (tekst) {
        var mig = this;
        var mangler = this.roedder.map(function (r, j) { return j; }).filter(function (j) { return !mig.vg.dom[j]; });
        if (!mangler.length) { this.delOk("valg", this.vist.valgDel, tekst); return; }
        this.vg.proevet = mangler[0];
        this.hjaelp = 0;
        this.hintS = null;
        this.render();
        this.besked('<span class="b-maerke">✓</span> ' + NK.html(tekst) + " " + NK.html("Nu den anden løsning."), "god");
        this.visKnap();
    };

    F.linje_valg = function () {
        var mig = this, o = this.o, ud = [];
        this.roedder.forEach(function (r, i) {
            if (mig.vg.dom[i] === "forkast") {
                var s = mig.vg.arg[i];
                ud.push(NK.html("x = " + NK.tal(r) + " M forkastes, fordi " + M.kon(s) + " = " + M.indsatTekst(o, s, r) + " < 0."));
            }
        });
        ud.push("x = <b>" + NK.html(NK.tal(M.xFacit(o))) + " M</b>" + (this.roedder.length === 1 ? NK.html(" giver positive koncentrationer.") : "."));
        return ud.join(" ");
    };

    F.tjek_valg = function () {
        this.besked(NK.html(this.trin_valg()), "gul");
    };

    F.hint_valg = function () {
        var o = this.o;
        var daarlig = this.roedder.filter(function (r) { return !M.dom(o, r).ok; });
        var god = M.xFacit(o);
        if (!daarlig.length) {
            return { s: null, trin: [
                "Klik på løsningen, og se i skemaet, om alle koncentrationer bliver positive.",
                "Med x = " + NK.tal(god) + " M er alle tre rækker positive.",
                "Tryk Kan bruges ved x = " + NK.tal(god) + " M."
            ] };
        }
        var d = M.dom(o, daarlig[0]);
        return { s: d.neg, trin: [
            "Klik på en løsning, og se i skemaet, om en koncentration bliver negativ.",
            "En koncentration kan ikke være negativ. Med x = " + NK.tal(d.x) + " M bliver " + M.kon(d.neg) + " = " + M.indsatTekst(o, d.neg, d.x) + ".",
            "Forkast x = " + NK.tal(d.x) + " M, og klik på " + M.kon(d.neg) + " i skemaet. Brug x = " + NK.tal(god) + " M."
        ] };
    };

    F.svar_valg = function () {
        var mig = this, o = this.o;
        this.roedder.forEach(function (r, i) {
            var d = M.dom(o, r);
            mig.vg.dom[i] = d.ok ? "brug" : "forkast";
            mig.vg.arg[i] = d.neg;
        });
        this.vg.venter = -1;
        this.vist.valgDel = true;
        this.delOk("valg", true, "Den løsning, der giver en negativ koncentration, er forkastet.");
    };

    F.trin_valg = function () {
        if (this.vg.venter >= 0) return "Klik på den koncentration i skemaet, der bliver negativ.";
        if (this.vg.proevet >= 0) {
            return "Se på rækken Ligevægt med x = " + NK.tal(this.roedder[this.vg.proevet]) + " M. Kan løsningen bruges, eller skal den forkastes?";
        }
        return "Prøv hver løsning i skemaet. Klik på en løsning.";
    };

    /* ===================================================================
       DEL: Koncentrationerne (fane 3: x sat ind; fane 2: c = n / V)
       =================================================================== */
    F.aktiv_konc = function () {
        return this.type === "kc" ? this.aktivKoncN() : this.aktivKoncX();
    };

    F.aktivKoncX = function () {
        var mig = this, o = this.o, x = M.xFacit(o);
        var w = el("div", "konc");
        w.appendChild(el("div", "konc-x", "x = " + NK.html(NK.tal(x)) + " M"));
        w.appendChild(regneBlok(KONC_ETIKET, M.alle(o).map(function (a) {
            return { v: NK.html(M.kon(a.s)), s: a.s, m: mig.feltMedEnhed("kx." + a.s, "Ligevægtskoncentrationen af " + M.skriv(a.s)) };
        }), "midt"));
        w.appendChild(this.tjekKnap());
        return w;
    };

    /* Et talfelt med enheden M efter (foran staar "= ", naar der er et
       udtryk foer feltet) */
    F.feltMedEnhed = function (key, etiket, lig) {
        var f = document.createDocumentFragment();
        if (lig) f.appendChild(T("= "));
        f.appendChild(this.input(key, "rs-in", "", etiket));
        f.appendChild(el("span", "rs-enhed", "M"));
        return f;
    };

    F.aktivKoncN = function () {
        var mig = this, o = this.o;
        var w = el("div", "konc");
        /* Formlen er foerste linje i beregningen; stofferne faar hver sin
           linje under den, naar formlen er rigtig */
        if (this.fase.konc === "formel") {
            w.appendChild(regneBlok(KONC_ETIKET, [{ v: "c", m: this.input("kn.formel", "rs-in formel", "formlen", "Formlen for koncentrationen") }], "midt"));
            w.appendChild(this.tjekKnap());
            return w;
        }
        var raekker = [{ v: "c", m: broekHTML("n", "V") + maerkeHTML(this.vist.formel) }];
        Object.keys(o.n).forEach(function (s) {
            raekker.push({ v: NK.html(M.kon(s)), s: s, m: broekHTML(NK.tal(o.n[s]) + " mol", NK.tal(o.V) + " L"),
                r: mig.feltMedEnhed("kn." + s, "Koncentrationen af " + M.skriv(s), true) });
        });
        w.appendChild(regneBlok(KONC_ETIKET, raekker, "midt"));
        w.appendChild(this.tjekKnap());
        return w;
    };

    F.linje_konc = function () {
        var o = this.o, raekker;
        if (this.type === "kc") {
            var c = M.cAfN(o);
            raekker = [{ v: "c", m: broekHTML("n", "V") }];
            Object.keys(o.n).forEach(function (s) {
                raekker.push({ v: NK.html(M.kon(s)), s: s, m: broekHTML(NK.tal(o.n[s]) + " mol", NK.tal(o.V) + " L"), r: "= " + NK.tal(c[s]) + " M" });
            });
            return regneBlok(KONC_ETIKET, raekker, "", maerkeHTML(this.vist.konc));
        }
        var x = M.xFacit(o), ceq = M.ceq(o, x);
        raekker = M.alle(o).map(function (a) {
            var ind = M.indsatTekst(o, a.s, x);
            return { v: NK.html(M.kon(a.s)), s: a.s, m: NK.html(ind), r: ind === NK.tal(x) + " M" ? "" : "= " + NK.html(NK.tal(ceq[a.s]) + " M") };
        });
        var w = regneBlok(KONC_ETIKET, raekker, "", maerkeHTML(this.vist.konc));
        w.appendChild(el("div", "kontrol", "Kontrol: " + NK.kc(this.kontrolHTML())));
        return w;
    };

    /* Kc regnet af de afrundede koncentrationer, som eleven ville goere */
    F.kontrolHTML = function () {
        var o = this.o, x = M.xFacit(o), c = M.ceq(o, x), r = {};
        Object.keys(c).forEach(function (s) { r[s] = parseFloat(NK.tal(c[s]).replace(",", ".")); });
        var lov = M.lovFacit(o);
        var fn = function (l) { return NK.tal(r[l.s]) + " M"; };
        var K = M.kAf(o, r);
        var passer = NK.tal(K) === NK.tal(o.K);
        return "Kc = " + broekHTML(NK.html(delAf(lov.num, fn)), lov.den.length ? NK.html(delAf(lov.den, fn)) : "1") + " = " +
            NK.html(M.kTekst(o, K)) + (passer ? ", som passer med Kc." : NK.html(", tæt på Kc = " + M.kTekst(o) + ". Forskellen kommer af afrundingen."));
    };

    F.tjek_konc = function () {
        if (this.type === "kc") return this.tjekKoncN();
        var mig = this, o = this.o, x = M.xFacit(o), c = M.ceq(o, x);
        var andre = this.roedder ? this.roedder.filter(function (r) { return Math.abs(r - x) > 1e-9; }) : [];
        var forste = null;
        M.alle(o).forEach(function (a) {
            if (forste && !forste.svar.tom) return;
            var key = "kx." + a.s;
            var s = tjekTal(mig.v[key], c[a.s]);
            if (s.ok) return;
            if (!s.tom && !s.besked) {
                var pl = M.plads(o, a.s);
                if (s.v < 0) s.besked = "En koncentration kan ikke være negativ.";
                else if (andre.some(function (r) { return M.ens(s.v, M.vaerdi(pl, r), 0.02); })) s.besked = "Det er regnet med den forkastede løsning. Brug x = " + NK.tal(x) + " M.";
                else if (Math.abs(pl.b) > 1 && M.ens(s.v, x, 0.02)) s.besked = "Der står " + Math.abs(pl.b) + " foran " + M.skriv(a.s) + ", så " + M.kon(a.s) + " = " + M.ligTekst(o, a.s) + ".";
                else if (pl.a && M.ens(s.v, x, 0.02)) s.besked = "Det er x, altså det, der er omsat. Der er " + M.ligTekst(o, a.s) + " tilbage.";
                else s.besked = "Sæt x = " + NK.tal(x) + " M ind i udtrykket fra skemaet: " + M.kon(a.s) + " = " + M.ligTekst(o, a.s) + ".";
            }
            if (!forste || (forste.svar.tom && !s.tom)) forste = { svar: s, key: key, s: a.s };
        });
        if (!forste) { this.delOk("konc", false); return; }
        this.hintS = forste.s;
        this.visLys();
        this.fejlSvar(forste.svar, forste.key);
    };

    F.tjekKoncN = function () {
        var mig = this, o = this.o;
        if (this.fase.konc === "formel") {
            var f = String(this.v["kn.formel"] || "").replace(/\s+/g, "").replace(/[:÷]/g, "/").replace(/[·*×]/g, "*");
            if (!f) return this.fejlSvar({ tom: true, besked: "Skriv formlen for koncentrationen med bogstaver, fx c = m / … (men med de rigtige bogstaver)." }, "kn.formel");
            if (/^c=/i.test(f)) f = f.slice(2);
            if (/^n\/v$/i.test(f)) { this.fase.konc = "tal"; this.faseOk("Rigtig formel: c = n / V."); return; }
            if (/^v\/n$/i.test(f)) return this.fejlSvar({ besked: "Brøken er vendt. Stofmængden n står over brøkstregen." }, "kn.formel");
            if (/^(n\*v|v\*n)$/i.test(f)) return this.fejlSvar({ besked: "Der skal divideres. Koncentrationen er stofmængde pr. liter." }, "kn.formel");
            if (/m/i.test(f)) return this.fejlSvar({ besked: "Her kender du stofmængden n og rumfanget V, ikke massen." }, "kn.formel");
            return this.fejlSvar({ besked: "Koncentrationen er stofmængden divideret med rumfanget. Skriv det med bogstaverne n og V." }, "kn.formel");
        }
        var c = M.cAfN(o), forste = null;
        Object.keys(o.n).forEach(function (s) {
            if (forste && !forste.svar.tom) return;
            var key = "kn." + s;
            var t = tjekTal(mig.v[key], c[s]);
            if (t.ok) return;
            if (!t.tom && !t.besked) {
                if (M.ens(t.v, o.n[s] * o.V, 0.02)) t.besked = "Der skal divideres med rumfanget, ikke ganges.";
                else if (M.ens(t.v, o.V / o.n[s], 0.02)) t.besked = "Brøken er vendt. Stofmængden står over brøkstregen.";
                else if (M.ens(t.v, o.n[s], 0.02)) t.besked = "Det er stofmængden i mol. Divider med rumfanget.";
                else t.besked = "Regn " + NK.tal(o.n[s]) + " mol / " + NK.tal(o.V) + " L på lommeregneren.";
            }
            if (!forste || (forste.svar.tom && !t.tom)) forste = { svar: t, key: key, s: s };
        });
        if (!forste) { this.delOk("konc", this.vist.koncTal, "Koncentrationerne er rigtige."); return; }
        this.hintS = forste.s;
        this.visLys();
        this.fejlSvar(forste.svar, forste.key);
    };

    F.hint_konc = function () {
        var o = this.o;
        if (this.type === "kc") {
            if (this.fase.konc === "formel") return { s: null, trin: [
                "Du kender stofmængden n og rumfanget V og skal finde koncentrationen c.",
                "c = n / …",
                "c = n / V. Skriv n/V i feltet."] };
            var s0 = Object.keys(o.n)[0];
            return { s: s0, trin: [
                "Divider stofmængden med rumfanget for hvert stof.",
                M.kon(s0) + " = " + NK.tal(o.n[s0]) + " mol / " + NK.tal(o.V) + " L.",
                Object.keys(o.n).map(function (s) { return M.kon(s) + " = " + NK.tal(o.n[s] / o.V) + " M"; }).join(", ") + "."] };
        }
        var x = M.xFacit(o), c = M.ceq(o, x), a = M.alle(o)[0];
        return { s: a.s, trin: [
            "Sæt x = " + NK.tal(x) + " M ind i udtrykkene i skemaets nederste række.",
            M.kon(a.s) + " = " + M.ligTekst(o, a.s) + " = " + M.indsatTekst(o, a.s, x) + ".",
            M.alle(o).map(function (b) { return M.kon(b.s) + " = " + NK.tal(c[b.s]) + " M"; }).join(", ") + "."] };
    };

    F.svar_konc = function () {
        var mig = this, o = this.o;
        if (this.type === "kc") {
            if (this.fase.konc === "formel") {
                this.v["kn.formel"] = "n/V";
                this.vist.formel = true;
                this.fase.konc = "tal";
                this.faseOk("Formlen er c = n / V.", true);
                return;
            }
            var c = M.cAfN(o);
            Object.keys(o.n).forEach(function (s) { mig.v["kn." + s] = NK.tal(c[s]); });
            this.vist.koncTal = true;
            this.delOk("konc", true, "Koncentrationerne.");
            return;
        }
        this.delOk("konc", true);
    };

    F.trin_konc = function () {
        if (this.type === "kc") {
            if (this.fase.konc === "formel") return "Skriv formlen for koncentrationen med bogstaver.";
            return "Regn koncentrationen af hvert stof ud på lommeregneren.";
        }
        return "Sæt x = " + NK.tal(M.xFacit(this.o)) + " M ind i skemaets nederste række, og regn ligevægtskoncentrationerne ud.";
    };

    /* ===================================================================
       DEL: Indsæt (fane 2): tallene i ligevaegtsloven
       =================================================================== */
    F.aktiv_indsaet = function () { return this.type === "kc" ? this.aktivIndsaetKc() : this.aktivIndsaetUk(); };

    F.aktivIndsaetKc = function () {
        var mig = this, o = this.o;
        var w = el("div", "indsaet");
        if (this.fase.indsaet === "tal") {
            var rad = el("div", "rs-rad");
            rad.appendChild(el("span", "k-tegn", "K<sub>c</sub> ="));
            rad.appendChild(this.ligningsFelter("ik", function (l) {
                return mig.input("ik." + l.s, "bf-in tal", M.kon(l.s), "Koncentrationen af " + M.skriv(l.s));
            }));
            rad.appendChild(this.tjekKnap());
            w.appendChild(rad);
            return w;
        }
        var rad2 = el("div", "rs-rad");
        rad2.appendChild(el("span", "k-tegn", "K<sub>c</sub> ="));
        rad2.appendChild(el("span", "rs-vist", this.kcIndsatHTML() + ' <span class="rs-maerke' + (this.vist.ikTal ? " svar" : "") + '">' + (this.vist.ikTal ? "↩" : "✓") + "</span>"));
        w.appendChild(rad2);
        var rad3 = el("div", "rs-rad");
        rad3.appendChild(el("span", "rs-lig", "="));
        rad3.appendChild(this.input("ik.res", "rs-in", "tallet", "Kc's værdi"));
        rad3.appendChild(this.select("ik.enh", ENHEDER.map(function (e) { return { v: e, tekst: e === "ingen" ? "ingen enhed" : M.enhedTekst(ENH_E[e]) }; }), "Kc's enhed"));
        rad3.appendChild(this.tjekKnap());
        w.appendChild(rad3);
        return w;
    };

    var ENHEDER = ["ingen", "M", "M2", "M3", "Mm1", "Mm2", "Mm3"];
    var ENH_E = { ingen: 0, M: 1, M2: 2, M3: 3, Mm1: -1, Mm2: -2, Mm3: -3 };

    F.kcIndsatHTML = function () {
        var o = this.o, c = M.cAfN(o), lov = M.lovFacit(o);
        var fn = function (l) { return NK.tal(c[l.s]) + " M"; };
        return broekHTML(delAf(lov.num, fn), lov.den.length ? delAf(lov.den, fn) : "1");
    };

    F.aktivIndsaetUk = function () {
        var mig = this, o = this.o;
        var rad = el("div", "rs-rad");
        rad.appendChild(this.input("iu.K", "bf-in tal", "Kc", "Kc's værdi"));
        rad.appendChild(el("span", "rs-lig", "="));
        rad.appendChild(this.ligningsFelter("iu", function (l) {
            var ukendt = l.s === o.ukendt;
            return mig.input("iu." + l.s, "bf-in " + (ukendt ? "udtr" : "tal"), M.kon(l.s), (ukendt ? "Den ukendte " : "Koncentrationen ") + M.kon(l.s));
        }));
        rad.appendChild(this.tjekKnap());
        return rad;
    };

    /* Ligningen med den ukendte: med enheder paa tavlen, uden i CAS */
    F.ukendtHTML = function (enh) {
        var o = this.o, lov = M.lovFacit(o), v = this.v.var || "c";
        var fn = function (l) { return l.s === o.ukendt ? v : NK.tal(o.kendt[l.s]) + (enh ? " M" : ""); };
        var venstre = enh ? NK.html(M.kTekst(o)) : NK.tal(o.K);
        return venstre + " = " + broekHTML(delAf(lov.num, fn), lov.den.length ? delAf(lov.den, fn) : "1");
    };

    F.linje_indsaet = function () {
        var o = this.o;
        if (this.type === "ukendt") return this.ukendtHTML(true);
        return "K<sub>c</sub> = " + this.kcIndsatHTML() + " = <b>" + NK.html(M.kTekst(o, M.kAf(o, M.cAfN(o)))) + "</b>";
    };

    F.tjek_indsaet = function () {
        var mig = this, o = this.o, lov = M.lovFacit(o);
        if (this.type === "ukendt") {
            var k = tjekKFelt(o, this.v["iu.K"]);
            if (!k.ok) return this.fejlSvar(k, "iu.K");
            var forste = null, bogstav = null;
            lov.num.concat(lov.den).forEach(function (l) {
                if (forste && !forste.svar.tom) return;
                var key = "iu." + l.s, raa = mig.v[key];
                var svar;
                if (l.s === o.ukendt) {
                    var u = M.udtryk(raa);
                    if (u.tom) svar = { tom: true, besked: "Skriv et bogstav, fx c, for den ukendte " + M.kon(l.s) + "." };
                    else if (u.klamme) svar = { besked: "CAS kan ikke regne med firkantede parenteser. Skriv et bogstav, fx c, for " + M.kon(l.s) + "." };
                    else if (u.fejl) svar = { besked: u.fejl };
                    else if (u.konst) svar = { besked: M.kon(l.s) + " kender du ikke. Skriv et bogstav, fx c, i stedet for et tal. CAS løser ligningen for bogstavet." };
                    else if (u.vars.length > 1 || !M.samme(function (t) { return u.f(t); }, function (t) { return t; })) svar = { besked: "Skriv kun ét bogstav for " + M.kon(l.s) + ", fx c." };
                    else { svar = { ok: true }; bogstav = u.vars[0]; }
                } else {
                    var t = tjekTal(raa, o.kendt[l.s]);
                    if (t.ok) svar = t;
                    else if (t.tom || t.besked) svar = t.besked === "Skriv et tal, ikke et bogstav." ? { besked: M.kon(l.s) + " kender du fra opgaven. Skriv tallet." } : t;
                    else {
                        var andet = Object.keys(o.kendt).filter(function (s) { return s !== l.s && M.ens(t.v, o.kendt[s], 0.005); })[0];
                        svar = { besked: andet ? NK.tal(t.v) + " M er " + M.kon(andet) + ". I dette felt skal " + M.kon(l.s) + " stå." : "Find " + M.kon(l.s) + " under Oplyst." };
                    }
                }
                if (!svar.ok && (!forste || (forste.svar.tom && !svar.tom))) forste = { svar: svar, key: key, s: l.s };
            });
            if (forste) { this.hintS = forste.s; this.visLys(); return this.fejlSvar(forste.svar, forste.key); }
            this.v["var"] = bogstav;
            this.delOk("indsaet", false, "Ligningen har én ubekendt, " + bogstav + ".");
            return;
        }
        var c = M.cAfN(o);
        if (this.fase.indsaet === "tal") {
            var f2 = null;
            lov.num.concat(lov.den).forEach(function (l) {
                if (f2 && !f2.svar.tom) return;
                var key = "ik." + l.s;
                var t = tjekTal(mig.v[key], c[l.s]);
                if (t.ok) return;
                if (!t.tom && !t.besked) {
                    if (M.ens(t.v, o.n[l.s], 0.02)) t.besked = "Det er stofmængden i mol. Brug koncentrationen fra før.";
                    else {
                        var anden = Object.keys(c).filter(function (s) { return s !== l.s && M.ens(t.v, c[s], 0.02); })[0];
                        t.besked = anden ? "Det er " + M.kon(anden) + ". I dette felt skal " + M.kon(l.s) + " stå." : "Feltet for " + M.kon(l.s) + " skal have koncentrationen fra før.";
                    }
                }
                if (!f2 || (f2.svar.tom && !t.tom)) f2 = { svar: t, key: key, s: l.s };
            });
            if (f2) { this.hintS = f2.s; this.visLys(); return this.fejlSvar(f2.svar, f2.key); }
            this.fase.indsaet = "res";
            this.faseOk("Tallene står på deres plads. Regn brøken ud.");
            return;
        }
        var K = M.kAf(o, c);
        var r = tjekTal(this.v["ik.res"], K);
        if (!r.ok) {
            if (!r.tom && !r.besked) r.besked = this.kcFejl(r.v, c);
            return this.fejlSvar(r, "ik.res");
        }
        var enh = this.v["ik.enh"];
        if (!enh) return this.fejlSvar({ tom: true, besked: "Tallet er rigtigt. Vælg også enheden. Går M'erne ud med hinanden, vælger du ingen enhed." }, "ik.enh");
        if (ENH_E[enh] !== M.deltaN(o)) {
            var p = o.p.map(function (x) { return x[0]; }), rr = o.r.map(function (x) { return x[0]; });
            return this.fejlSvar({ besked: "Tallet er rigtigt, men enheden passer ikke. Enheden er M opløftet i (" + p.join(" + ") + ") − (" + rr.join(" + ") + ") = " +
                NK.fortegn(M.deltaN(o)).replace(/^\+/, "") + (M.deltaN(o) ? ", altså " + M.kEnhed(o) + "." : ", altså ingen enhed.") }, "ik.enh");
        }
        this.delOk("indsaet", this.vist.ikTal);
    };

    /* De fejl, man laver paa lommeregneren, naar Kc regnes ud */
    F.kcFejl = function (v, c) {
        var o = this.o, lov = M.lovFacit(o), K = M.kAf(o, c);
        if (M.ens(v, 1 / K, 0.02)) return "Det er 1/Kc. Produkterne står i tælleren.";
        var T = 1, N = 1, uden = 1;
        lov.num.forEach(function (l) { T *= Math.pow(c[l.s], l.e); uden *= c[l.s]; });
        lov.den.forEach(function (l) { N *= Math.pow(c[l.s], l.e); uden /= c[l.s]; });
        if (M.ens(v, uden, 0.02)) return "Det ligner en udregning uden eksponenterne. Husk ² og ³.";
        /* Én eksponent glemt */
        var glemt = lov.num.concat(lov.den).filter(function (l) {
            if (l.e < 2) return false;
            var f = Math.pow(c[l.s], l.e - 1);
            return M.ens(v, lov.num.indexOf(l) >= 0 ? K / f : K * f, 0.02);
        })[0];
        if (glemt) return "Husk eksponenten på " + M.kon(glemt.s) + ": " + M.led(glemt.s, glemt.e) + ".";
        if (M.ens(v, T, 0.02)) return "Det er kun tælleren. Divider med hele nævneren.";
        if (lov.den.length) {
            /* Kun det foerste led i naevneren er divideret, resten er ganget */
            var d0 = Math.pow(c[lov.den[0].s], lov.den[0].e), rest = N / d0;
            if (Math.abs(rest - 1) > 1e-9 && M.ens(v, T / d0 * rest, 0.02)) return "Husk parentes om hele nævneren på lommeregneren.";
        }
        return "Tallet passer ikke. Regn tælleren og nævneren hver for sig, og divider til sidst.";
    };

    F.hint_indsaet = function () {
        var o = this.o, lov = M.lovFacit(o);
        if (this.type === "ukendt") {
            var kendte = Object.keys(o.kendt).map(function (s) { return M.kon(s) + " = " + NK.tal(o.kendt[s]) + " M"; }).join(" og ");
            return { s: o.ukendt, trin: [
                "Skriv Kc's værdi til venstre og de kendte koncentrationer i deres felter. Den ukendte skriver du som et bogstav, fx c.",
                kendte + ". " + M.kon(o.ukendt) + " er den ukendte.",
                this.ukendtTekst()] };
        }
        var c = M.cAfN(o);
        if (this.fase.indsaet === "tal") {
            var l = lov.num[0];
            return { s: l.s, trin: [
                "Sæt koncentrationerne fra før ind i ligevægtsloven.",
                M.kon(l.s) + " = " + NK.tal(c[l.s]) + " M" + (l.e > 1 ? ", og det står i " + l.e + ". potens." : "."),
                "Kc = " + delAf(lov.num, function (q) { return NK.tal(c[q.s]); }) + " / " +
                    (lov.den.length > 1 ? "(" + delAf(lov.den, function (q) { return NK.tal(c[q.s]); }) + ")" : delAf(lov.den, function (q) { return NK.tal(c[q.s]); })) + "."] };
        }
        var e = M.deltaN(o);
        return { s: null, trin: [
            "Regn tælleren og nævneren ud hver for sig, og divider. Husk eksponenterne.",
            "Enheden er M opløftet i (produkternes koefficienter − reaktanternes) = " + e + (e ? ": " + M.kEnhed(o) + "." : ": ingen enhed."),
            "Kc = " + M.kTekst(o, M.kAf(o, c)) + "."] };
    };

    F.ukendtTekst = function () {
        var o = this.o, lov = M.lovFacit(o);
        var fn = function (l) { return l.s === o.ukendt ? "c" : NK.tal(o.kendt[l.s]); };
        var t = delAf(lov.num, fn), n = lov.den.length ? delAf(lov.den, fn) : "1";
        if (lov.den.length > 1) n = "(" + n + ")";
        return NK.tal(o.K) + " = " + t + " / " + n + ".";
    };

    F.svar_indsaet = function () {
        var mig = this, o = this.o, lov = M.lovFacit(o);
        if (this.type === "ukendt") {
            this.v["iu.K"] = NK.tal(o.K);
            lov.num.concat(lov.den).forEach(function (l) { mig.v["iu." + l.s] = l.s === o.ukendt ? "c" : NK.tal(o.kendt[l.s]); });
            this.v["var"] = "c";
            this.delOk("indsaet", true, "Ligningen med c som den ukendte.");
            return;
        }
        var c = M.cAfN(o);
        if (this.fase.indsaet === "tal") {
            lov.num.concat(lov.den).forEach(function (l) { mig.v["ik." + l.s] = NK.tal(c[l.s]); });
            this.vist.ikTal = true;
            this.fase.indsaet = "res";
            this.faseOk("Tallene er sat ind.", true);
            return;
        }
        this.delOk("indsaet", true);
    };

    F.trin_indsaet = function () {
        if (this.type === "ukendt") return "Sæt Kc og de kendte koncentrationer ind i ligevægtsloven. Skriv et bogstav, fx c, for den ukendte.";
        if (this.fase.indsaet === "tal") return "Sæt koncentrationerne ind i ligevægtsloven.";
        return "Regn Kc ud på lommeregneren, og vælg enheden.";
    };

    /* ===================================================================
       DEL: Svaret (fane 2, ukendt): vaelg loesningen og skriv svaret
       =================================================================== */
    F.svarRod = function () {
        var r = M.loesUkendt(this.o).filter(function (v) { return v > 0; });
        return r[0];
    };

    F.aktiv_svar = function () {
        var mig = this, o = this.o, v = this.variabel();
        var w = el("div", "valg");
        if (this.fase.svar === "valg") {
            this.roedder.forEach(function (r, i) {
                var kort = el("div", "lsn proevet" + (mig.vg.dom[i] === "brug" ? " brug" : "") + (mig.vg.dom[i] === "forkast" ? " forkast" : ""));
                kort.appendChild(el("span", "lsn-x", NK.html(v) + " = " + NK.html(NK.tal(r)) + " M"));
                if (mig.vg.dom[i] === "brug") kort.appendChild(el("span", "lsn-dom ok", "kan bruges ✓"));
                else if (mig.vg.dom[i] === "forkast") kort.appendChild(el("span", "lsn-dom nej", "forkastet: negativ"));
                else {
                    var ja = el("button", "lsn-knap ja", "Kan bruges");
                    ja.type = "button";
                    ja.addEventListener("click", function () { mig.domUk(i, "brug"); });
                    var nej = el("button", "lsn-knap nej", "Forkast");
                    nej.type = "button";
                    nej.addEventListener("click", function () { mig.domUk(i, "forkast"); });
                    kort.appendChild(ja);
                    kort.appendChild(nej);
                    mig.felter.push(ja);
                }
                w.appendChild(kort);
            });
            return w;
        }
        w.appendChild(el("div", "rb-linje", this.svarValgTekst()));
        var rad = el("div", "rs-rad");
        rad.appendChild(el("span", "konc-lab", NK.html(M.kon(o.ukendt)) + " ="));
        rad.appendChild(this.input("us.svar", "rs-in", "", "Svaret"));
        rad.appendChild(el("span", "rs-enhed", "M"));
        rad.appendChild(this.tjekKnap());
        w.appendChild(rad);
        return w;
    };

    F.domUk = function (i, dom) {
        var r = this.roedder[i], v = this.variabel();
        if (dom === "brug" && r < 0) return this.fejlLinje(v + " = " + NK.tal(r) + " M er negativ, og en koncentration kan ikke være negativ.");
        if (dom === "forkast" && r > 0) return this.fejlLinje(v + " = " + NK.tal(r) + " M er positiv. Den kan bruges.");
        this.vg.dom[i] = dom;
        this.paab[this.nr] = true;
        var mig = this;
        var mangler = this.roedder.filter(function (q, j) { return !mig.vg.dom[j]; }).length;
        if (!mangler) {
            this.fase.svar = "tal";
            this.faseOk(dom === "forkast" ? "En koncentration kan ikke være negativ, så den løsning er forkastet." : "Løsningen kan bruges.");
            return;
        }
        this.render();
        this.besked('<span class="b-maerke">✓</span> ' + NK.html(dom === "forkast" ? "En koncentration kan ikke være negativ. Nu den anden løsning." : "Den kan bruges. Nu den anden løsning."), "god");
    };

    F.svarValgTekst = function () {
        var v = this.variabel();
        var dele = [];
        this.roedder.forEach(function (r) {
            if (r < 0) dele.push(NK.html(v + " = " + NK.tal(r) + " M forkastes, fordi en koncentration ikke kan være negativ."));
        });
        return dele.join(" ") + (dele.length ? " " : "") + NK.html(v) + " = <b>" + NK.html(NK.tal(this.svarRod())) + " M</b>.";
    };

    F.linje_svar = function () {
        return this.svarValgTekst() + " &nbsp;Svar: " + NK.html(M.kon(this.o.ukendt)) + " = <b>" + NK.html(NK.tal(this.svarRod())) + " M</b>";
    };

    F.tjek_svar = function () {
        if (this.fase.svar === "valg") {
            this.besked(NK.html("Tryk Kan bruges eller Forkast ved hver løsning."), "gul");
            return;
        }
        var t = tjekTal(this.v["us.svar"], this.svarRod());
        if (t.ok) { this.delOk("svar", this.vist.svarValg); return; }
        if (!t.tom && !t.besked) t.besked = t.v < 0 ? "En koncentration kan ikke være negativ." : "Svaret er den løsning, der kan bruges, med tre betydende cifre.";
        this.fejlSvar(t, "us.svar");
    };

    F.hint_svar = function () {
        var v = this.variabel(), r = this.svarRod();
        if (this.fase.svar === "valg") {
            var neg = this.roedder.filter(function (q) { return q < 0; });
            return { s: null, trin: [
                "Hver løsning er et bud på " + M.kon(this.o.ukendt) + ". Kan en koncentration være det tal?",
                neg.length ? "En koncentration kan ikke være negativ." : "Løsningen er positiv.",
                (neg.length ? "Forkast " + v + " = " + NK.tal(neg[0]) + " M. " : "") + "Brug " + v + " = " + NK.tal(r) + " M."] };
        }
        return { s: null, trin: ["Skriv den løsning, der kan bruges.", "Afrund til tre betydende cifre.", M.kon(this.o.ukendt) + " = " + NK.tal(r) + " M."] };
    };

    F.svar_svar = function () {
        var mig = this;
        if (this.fase.svar === "valg") {
            this.roedder.forEach(function (r, i) { mig.vg.dom[i] = r < 0 ? "forkast" : "brug"; });
            this.vist.svarValg = true;
            this.fase.svar = "tal";
            this.faseOk("Den negative løsning er forkastet.", true);
            return;
        }
        this.v["us.svar"] = NK.tal(this.svarRod());
        this.delOk("svar", true);
    };

    F.trin_svar = function () {
        if (this.fase.svar === "valg") return "Afgør for hver løsning, om den kan bruges.";
        return "Skriv svaret med tre betydende cifre.";
    };

    /* ===================================================================
       Panelet: opgaven, og naar den er loest, hele besvarelsen
       =================================================================== */
    F.promptHTML = function () {
        var mig = this, o = this.o;
        var html = '<p class="note-tekst">' + NK.html(o.tekst) + "</p>";
        html += '<p class="spm"><b>Opgave:</b> ' + NK.html(this.spm()) + "</p>";
        if (this.faerdig) {
            html += '<div class="forklaring"><span class="fk-hoved">Besvarelsen</span>';
            html += '<p class="fk-linje">' + NK.html(M.skemaTekst(o)) + " ved " + NK.html(o.T) + "</p>";
            this.dele.forEach(function (d) {
                if (d === "skema") {
                    html += '<div class="fk-skema">' + mig.skemaTabel("faerdig").outerHTML + "</div>";
                    return;
                }
                var l = mig["linje_" + d]();
                if (typeof l === "string") html += '<p class="fk-linje">' + l + "</p>";
                else html += '<div class="fk-blok">' + l.outerHTML + "</div>";
            });
            if (this.type === "x") {
                html += '<span class="fk-hoved">Fra start til ligevægt</span><canvas class="kurve" id="' + this.N + '-kurve"></canvas>';
            }
            html += "</div>";
        }
        return html;
    };

    /* ----- Kurven: koncentrationerne fra start til ligevaegt (fra den gamle) ----- */
    var FARVER = ["#4cc9f0", "#4ade80", "#fbbf24", "#c4a7ff", "#ff7aa2"];

    F.efterOpgave = function () {
        if (this.type !== "x") { this.kurve = null; return; }
        var c = NK.el(this.N + "-kurve");
        if (!c) return;
        var o = this.o, x = M.xFacit(o), ceq = M.ceq(o, x);
        this.kurve = { canvas: c, t: 0, arter: M.alle(o).map(function (a, i) {
            return { navn: M.skriv(a.s), farve: FARVER[i % FARVER.length], c0: M.c0(o, a.s), ceq: ceq[a.s] };
        }) };
    };

    F.tegnKurve = function (dt) {
        var k = this.kurve;
        if (!k.canvas.isConnected) { this.kurve = null; return; }
        if (k.t >= 1 && k.tegnet) return;
        k.t = Math.min(1, k.t + dt / 2.4);
        k.tegnet = k.t >= 1;
        if (!k.l) k.l = new NK.Laerred(k.canvas);
        k.l.tilpas();
        var g = k.l.ctx, b = k.l.b, h = k.l.h;
        k.l.ryd();
        var mV = 44, mH = 66, mT = 10, mB = 24;
        var bx = b - mV - mH, by = h - mT - mB;
        if (bx < 20 || by < 20) return;
        var cmax = 0;
        k.arter.forEach(function (a) { cmax = Math.max(cmax, a.c0, a.ceq); });
        cmax = cmax * 1.12 || 1;
        g.strokeStyle = "rgba(255,255,255,0.12)";
        g.fillStyle = "#a9b0ba";
        g.font = "12px 'Segoe UI', sans-serif";
        g.lineWidth = 1;
        for (var i = 0; i <= 4; i++) {
            var y = mT + by - by * i / 4;
            g.beginPath(); g.moveTo(mV, y); g.lineTo(mV + bx, y); g.stroke();
            g.textAlign = "right"; g.textBaseline = "middle";
            g.fillText((cmax * i / 4).toFixed(2).replace(".", ","), mV - 6, y);
        }
        g.strokeStyle = "rgba(255,255,255,0.35)";
        g.beginPath(); g.moveTo(mV, mT); g.lineTo(mV, mT + by); g.lineTo(mV + bx, mT + by); g.stroke();
        g.textAlign = "center"; g.textBaseline = "top";
        g.fillText("tid", mV + bx / 2, mT + by + 6);
        g.save(); g.translate(11, mT + by / 2); g.rotate(-Math.PI / 2);
        g.textBaseline = "middle"; g.fillText("c / M", 0, 0); g.restore();
        var TT = 100, tau = 18;
        var etiketter = [];
        k.arter.forEach(function (a) {
            g.strokeStyle = a.farve;
            g.lineWidth = 2.4;
            g.beginPath();
            var n = 120, X = mV, Y = mT + by;
            for (var j = 0; j <= n; j++) {
                var t = TT * k.t * j / n;
                var cv = a.ceq + (a.c0 - a.ceq) * Math.exp(-t / tau);
                X = mV + bx * t / TT;
                Y = mT + by - by * cv / cmax;
                if (j === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
            }
            g.stroke();
            etiketter.push({ y: Y, a: a, x: X });
        });
        if (k.t > 0.5) {
            /* Navnene ved enden af kurverne, skubbet fra hinanden */
            etiketter.sort(function (p, q) { return p.y - q.y; });
            for (var e = 1; e < etiketter.length; e++) if (etiketter[e].y - etiketter[e - 1].y < 14) etiketter[e].y = etiketter[e - 1].y + 14;
            g.globalAlpha = Math.min(1, (k.t - 0.5) / 0.3);
            g.font = "600 12px 'Segoe UI', sans-serif";
            etiketter.forEach(function (p) {
                g.fillStyle = p.a.farve;
                g.textAlign = "left"; g.textBaseline = "middle";
                g.fillText(p.a.navn, Math.min(p.x + 6, mV + bx + 6), p.y);
            });
            g.globalAlpha = 1;
        }
    };

    /* ===================================================================
       Klasserne: én pr. fane, med de faelles metoder
       =================================================================== */
    function lav(navn, data, grupper, valg) {
        function Sim() { this.init(navn, data, grupper); }
        var P = Sim.prototype;
        NK.Fane.paa(P, valg);
        Object.keys(F).forEach(function (k) { P[k] = F[k]; });
        return Sim;
    }

    /* Det, fane 1 ogsaa bruger */
    NK.RegnHjaelp = { delAf: delAf, broek: broekHTML, start: tjekStart, aendr: tjekAendr, lig: tjekLig };

    NK.SimUx = lav("ux", D.UX, D.GRUPPER_UX, { navn: "ux", naesteFane: "fane-mx", naesteNavn: "Med x" });
    NK.SimMx = lav("mx", D.MX, D.GRUPPER_MX, { navn: "mx" });
}());
