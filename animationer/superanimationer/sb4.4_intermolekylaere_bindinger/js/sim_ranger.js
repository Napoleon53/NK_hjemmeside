/* =====================================================================
   sim_ranger.js - fane 3: rangér stofferne efter kogepunkt

   Tre eller fire stoffer staar som kort paa en tavle i en tilfaeldig
   raekkefoelge. Eleven traekker dem paa plads fra det laveste kogepunkt
   til venstre til det hoejeste til hoejre (eller klikker paa to kort for
   at bytte dem) og trykker Tjek. Er det forkert, forklares det foerste
   par, der staar forkert, ud fra OH-grupperne, kaeden eller formen
   (D.forklar). Kogepunkterne vises foerst, naar raekkefoelgen er rigtig,
   og saa kommer de paa en akse under tavlen.

   12 opgaver i Let, Middel og Svaer. En opgave, der er loest uden Vis
   svaret, faar en stjerne, og stjernerne huskes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    function SimRanger() {
        var mig = this;
        this.tavle = NK.el("r-tavle");
        this.pladser = NK.el("r-pladser");
        this.tjekKnap = NK.el("r-tjek");
        this.tjekKnap.addEventListener("click", function () { mig.tjek(); });
        var opg = D.RANGER.map(function (o) {
            var n = o.gruppe === "let" ? "Let" : (o.gruppe === "middel" ? "Middel" : "Svær");
            var nr = D.RANGER.filter(function (x) { return x.gruppe === o.gruppe; }).indexOf(o) + 1;
            return { id: o.id, gruppe: o.gruppe, stoffer: o.stoffer, navn: n + " " + nr, nr: nr };
        });
        this.startFane(opg, D.RANGER_GRUPPER);
        this.koblKort();
        this.nr = this.opgaver.length - 1;
        var start = this.naesteUloeste();
        this.vaelg(start >= 0 ? start : 0);
    }

    var P = SimRanger.prototype;
    NK.Fane.paa(P, { navn: "r" });

    P.chipTekst = function (o) { return String(o.nr); };

    function kp(id) { return D.STOF[id].kp; }

    /* ----- Opgaven ------------------------------------------------------------------ */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        var rigtig = o.stoffer.slice().sort(function (a, b) { return kp(a) - kp(b); });
        var orden;
        do { orden = NK.bland(o.stoffer); } while (orden.join() === rigtig.join() && o.stoffer.length > 1);
        this.opg = { o: o, rigtig: rigtig, orden: orden, fejlPar: null, loest: false, svarNu: false, antalTjek: 0 };
        this.valgtKort = -1;
        this.bygKort();
    };

    P.promptHTML = function () {
        return '<p class="maal-tekst">Sæt stofferne i rækkefølge efter kogepunkt: det laveste til venstre og det højeste til højre.</p>' +
            '<p class="note-tekst">Træk et kort hen på et andet, så bytter de plads. Du kan også klikke på to kort. Tryk Tjek rækkefølgen, når du er klar.</p>';
    };

    P.trinLinje = function () {
        if (this.opg.fejlPar) return "Flyt kortene, og tjek igen.";
        return "Træk kortene i rækkefølge, og tryk Tjek rækkefølgen.";
    };

    /* Det foerste par fra venstre, der staar forkert: [venstre, hoejre] */
    P.foersteFejl = function (orden) {
        orden = orden || this.opg.orden;
        for (var i = 0; i + 1 < orden.length; i++) {
            if (kp(orden[i]) > kp(orden[i + 1])) return [orden[i], orden[i + 1]];
        }
        return null;
    };

    P.hintTrin = function () {
        var o = this.opg.o, f = this.foersteFejl();
        if (!f) return ["Rækkefølgen er rigtig. Tryk Tjek rækkefølgen."];
        var oh = {}, c = {};
        o.stoffer.forEach(function (id) { oh[D.STOF[id].OH] = 1; c[D.STOF[id].C] = 1; });
        var t1;
        if (Object.keys(oh).length > 1) {
            t1 = "Tæl OH-grupperne. Hydrogenbindinger løfter kogepunktet meget, når molekylerne er nogenlunde lige store.";
        } else if (Object.keys(c).length > 1) {
            t1 = "Alle har " + D.ohTekst(D.STOF[o.stoffer[0]].OH) + ". Se på kæderne: jo længere kæde, jo flere London-kræfter.";
        } else {
            t1 = "De har de samme atomer. Se på formen: et kugleformet molekyle rører sine naboer mindst.";
        }
        var a = D.STOF[f[0]], b = D.STOF[f[1]];
        return [t1,
            "Se på " + a.navn + " og " + b.navn + ". " + D.forklar(f[1], f[0]),
            "Flyt " + b.navn + " til venstre for " + a.navn + "."];
    };

    P.visSvar = function () {
        var g = this.opg;
        g.orden = g.rigtig.slice();
        g.svarNu = true;
        this.bygKort();
        this.erLoest("svar");
    };

    /* ----- Tjek ------------------------------------------------------------------------ */
    P.tjek = function () {
        var g = this.opg;
        if (this.faerdig) { this.knap(); return; }
        g.antalTjek++;
        var f = this.foersteFejl();
        if (!f) { this.erLoest("selv"); return; }
        g.fejlPar = f;
        this.visFejl();
        this.fejlLinje("Se på " + D.STOF[f[0]].navn + " og " + D.STOF[f[1]].navn + ". " + D.forklar(f[1], f[0]));
        this.tavle.classList.remove("ryst");
        void this.tavle.offsetWidth;
        this.tavle.classList.add("ryst");
    };

    P.erLoest = function (maade) {
        var g = this.opg;
        g.loest = true;
        g.fejlPar = null;
        this.tavle.classList.add("faerdig");
        this.bygKort();
        var linje = g.rigtig.map(function (id) { return D.STOF[id].navn + " " + D.kpTekst(D.STOF[id]); }).join(", ") + ".";
        this.loest(maade, maade === "svar" ? linje : linje + " " + NK.tilfaeldig(D.ROS));
        this.tjekKnap.disabled = true;
    };

    P.enter = function () { this.tjek(); };

    /* ----- Kortene --------------------------------------------------------------------- */
    P.bygKort = function () {
        var g = this.opg, mig = this;
        this.tavle.classList.toggle("faerdig", g.loest);
        this.tjekKnap.disabled = g.loest;
        this.tjekKnap.style.visibility = g.loest ? "hidden" : "";
        this.pladser.innerHTML = "";
        this.pladser.style.setProperty("--n", g.orden.length);
        this.kortEl = [];
        g.orden.forEach(function (id, i) {
            var st = D.STOF[id];
            var plads = document.createElement("div");
            plads.className = "rt-plads";
            plads.setAttribute("data-i", i);
            var kort = document.createElement("div");
            kort.className = "stofkort" + (g.loest ? " rigtig" : "") + (mig.valgtKort === i ? " valgt" : "");
            kort.setAttribute("data-i", i);
            kort.innerHTML = '<canvas class="sk-tegning"></canvas>' +
                '<div class="sk-navn">' + NK.html(st.navn) + "</div>" +
                (st.ekstra ? '<div class="sk-ekstra">' + NK.html(st.ekstra) + "</div>" : "") +
                '<div class="sk-formel">' + NK.html(D.formel(st)) + "</div>" +
                '<div class="sk-m">' + D.Mtekst(st) + "</div>" +
                (g.loest ? '<div class="sk-kp">' + D.kpTekst(st) + "</div>" : "");
            plads.appendChild(kort);
            mig.pladser.appendChild(plads);
            mig.kortEl.push(kort);
        });
        this.visFejl();
        this.tegnKort();
    };

    /* Molekylerne paa kortene, alle i samme maalestok */
    P.tegnKort = function () {
        var g = this.opg;
        if (!this.kortEl) return;
        var lag = this.kortEl.map(function (k) {
            var L = new NK.Laerred(k.querySelector("canvas"));
            L.tilpas();
            return L;
        });
        var skala = 1e9;
        lag.forEach(function (L, i) {
            if (L.b < 4 || L.h < 4) return;
            skala = Math.min(skala, Tg.kortSkala(NK.Mol.form(D.STOF[g.orden[i]].smiles), L.b - 12, L.h - 8));
        });
        lag.forEach(function (L, i) {
            if (L.b < 4 || L.h < 4) return;
            L.ryd();
            Tg.kortMolekyle(L.ctx, NK.Mol.form(D.STOF[g.orden[i]].smiles), L.b / 2, L.h / 2, L.b - 12, L.h - 8, { donorKant: true }, skala);
        });
    };

    P.visFejl = function () {
        var g = this.opg;
        (this.kortEl || []).forEach(function (k, i) {
            k.classList.toggle("fejl", !!(g.fejlPar && g.fejlPar.indexOf(g.orden[i]) >= 0));
        });
    };

    P.byt = function (i, j) {
        var g = this.opg;
        if (g.loest || i === j || i < 0 || j < 0) return;
        var t = g.orden[i];
        g.orden[i] = g.orden[j];
        g.orden[j] = t;
        g.fejlPar = null;
        this.valgtKort = -1;
        this.nulstilHjaelp();
        this.bygKort();
        if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
    };

    /* Traek et kort hen paa et andet, eller klik paa to kort */
    P.koblKort = function () {
        var mig = this, traek = null;
        this.pladser.addEventListener("pointerdown", function (e) {
            var k = e.target.closest ? e.target.closest(".stofkort") : null;
            if (!k || mig.opg.loest) return;
            traek = { k: k, i: parseInt(k.getAttribute("data-i"), 10), x: e.clientX, y: e.clientY, flyttet: false };
            try { k.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            e.preventDefault();
        });
        this.pladser.addEventListener("pointermove", function (e) {
            if (!traek) return;
            var dx = e.clientX - traek.x, dy = e.clientY - traek.y;
            if (!traek.flyttet && Math.hypot(dx, dy) < 6) return;
            traek.flyttet = true;
            traek.k.classList.add("traekkes");
            traek.k.style.transform = "translate(" + dx + "px," + dy + "px)";
            var under = mig.pladsVed(e.clientX, e.clientY, traek.k);
            mig.kortEl.forEach(function (k, i) { k.classList.toggle("maal", under === i && i !== traek.i); });
        });
        function slip(e) {
            if (!traek) return;
            var t = traek;
            traek = null;
            t.k.classList.remove("traekkes");
            t.k.style.transform = "";
            mig.kortEl.forEach(function (k) { k.classList.remove("maal"); });
            if (t.flyttet) {
                var j = mig.pladsVed(e.clientX, e.clientY, t.k);
                if (j !== null && j !== t.i) mig.byt(t.i, j);
                return;
            }
            /* Et klik: vaelg kortet, eller byt med det valgte */
            if (mig.valgtKort >= 0 && mig.valgtKort !== t.i) { mig.byt(mig.valgtKort, t.i); return; }
            mig.valgtKort = mig.valgtKort === t.i ? -1 : t.i;
            mig.kortEl.forEach(function (k, i) { k.classList.toggle("valgt", i === mig.valgtKort); });
            if (mig.valgtKort >= 0) mig.kortBesked("Klik på det kort, " + D.STOF[mig.opg.orden[t.i]].navn + " skal bytte plads med.", 4);
        }
        this.pladser.addEventListener("pointerup", slip);
        this.pladser.addEventListener("pointercancel", slip);
    };

    P.pladsVed = function (x, y, udenFor) {
        var bedst = null;
        Array.prototype.forEach.call(this.pladser.children, function (p, i) {
            var r = p.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top - 30 && y <= r.bottom + 30) bedst = i;
        });
        void udenFor;
        return bedst;
    };

    /* ----- Scenen ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var lay = { W: W, H: H, baand: baand };
        var kant = NK.klamp(W * 0.025, 12, 28);
        var b = Math.min(W - 2 * kant, 1000);
        var t = this.tavle;
        t.style.left = Math.round((W - b) / 2) + "px";
        t.style.top = NK.klamp(H * 0.04, 12, 30) + "px";
        t.style.width = Math.round(b) + "px";
        var kortH = NK.klamp((baand.y - 200) * 0.52, 180, 290);
        t.style.setProperty("--korth", Math.round(kortH) + "px");
        var th = t.offsetHeight || kortH + 80;
        var k = this.tjekKnap;
        var ky = parseFloat(t.style.top) + th + NK.klamp(H * 0.03, 12, 24);
        k.style.top = Math.round(ky) + "px";
        k.style.left = Math.round(W / 2 - (k.offsetWidth || 220) / 2) + "px";
        lay.tavle = { x: (W - b) / 2, y: parseFloat(t.style.top), b: b, h: th };
        lay.tjekY = ky + (k.offsetHeight || 50) / 2;
        lay.akseY = ky + (k.offsetHeight || 50) + NK.klamp((baand.y - ky - 50) * 0.45, 40, 90);
        this.lay = lay;
        this.saetAnker("akse", lay.tavle.x, lay.akseY - 30, b, 60);
        this.tegnKort();
    };

    P.opdaterScene = function () { /* intet bevaeger sig af sig selv */ };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, g = this.opg;
        if (!lay) return;
        Tg.rum(ctx, lay.W, lay.baand.y, lay.baand.y);
        if (g.loest) this.tegnAkse(ctx);
        if (g.loest && this.sejrT < 0.9) {
            ctx.save();
            ctx.globalAlpha = 0.14 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(0, 0, lay.W, lay.baand.y);
            ctx.restore();
        }
        /* Stemplet staar, hvor Tjek stod */
        if (g.loest) Tg.stempel(ctx, lay.W / 2, lay.tjekY, "RIGTIG RÆKKEFØLGE ✓", NK.pop((this.sejrT || 0) / 0.45));
    };

    /* Kogepunkterne paa en akse under tavlen, naar raekkefoelgen er rigtig */
    P.tegnAkse = function (ctx) {
        var lay = this.lay, g = this.opg;
        var ks = g.rigtig.map(kp);
        var lo = Math.floor((Math.min.apply(null, ks) - 20) / 50) * 50, hi = Math.ceil((Math.max.apply(null, ks) + 20) / 50) * 50;
        var x0 = lay.tavle.x + 30, x1 = lay.tavle.x + lay.tavle.b - 30, y = lay.akseY;
        if (y > lay.baand.y - 30) return;
        function X(t) { return x0 + (t - lo) / (hi - lo) * (x1 - x0); }
        var u = NK.klamp((this.sejrT || 0) / 0.8, 0, 1);
        ctx.save();
        ctx.strokeStyle = "rgba(230, 240, 250, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
        ctx.font = Tg.font("600", 12);
        ctx.fillStyle = "#9aa3ae";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (var t = lo; t <= hi; t += 50) {
            ctx.beginPath();
            ctx.moveTo(X(t), y - 5);
            ctx.lineTo(X(t), y + 5);
            ctx.stroke();
            ctx.fillText(D.grader(t) + " °C", X(t), y + 9);
        }
        /* Navnene over punkterne; to navne, der ville ramme hinanden, kommer i
           hver sin hoejde */
        var hoejder = [];
        ctx.font = Tg.font("700", 13);
        g.rigtig.forEach(function (id) {
            var st = D.STOF[id], x = X(lo + (st.kp - lo) * u);
            ctx.fillStyle = st.OH ? (st.OH > 1 ? "#c62828" : "#f0685a") : "#b0bec5";
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fill();
            var b = ctx.measureText(st.navn).width, niv = 0;
            while (hoejder[niv] !== undefined && x - b / 2 < hoejder[niv] + 8) niv++;
            hoejder[niv] = x + b / 2;
            ctx.fillStyle = "#e6ebf1";
            ctx.textBaseline = "bottom";
            ctx.fillText(st.navn, x, y - 12 - niv * 17);
            if (niv) {
                ctx.strokeStyle = "rgba(230, 240, 250, 0.35)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y - 8);
                ctx.lineTo(x, y - 12 - niv * 17 + 2);
                ctx.stroke();
            }
        });
        ctx.restore();
    };

    NK.SimRanger = SimRanger;
}());
