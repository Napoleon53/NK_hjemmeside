/* =====================================================================
   sim_ranger.js - fane 3: rangér stofferne efter kogepunkt

   Tre til fem stoffer staar som kort paa en tavle i en tilfaeldig
   raekkefoelge. Eleven traekker dem paa plads fra det laveste kogepunkt
   til venstre til det hoejeste til hoejre (eller klikker paa to kort for
   at bytte dem) og trykker Indsend svar paa kortet oeverst. Er det
   forkert, forklares det foerste par, der staar forkert, ud fra
   OH-grupperne, etherne, kaeden, formen eller den meget lange kaede
   (D.grund). Kogepunkterne vises foerst, naar raekkefoelgen er rigtig, og
   saa kommer de paa en akse under tavlen.

   30 opgaver i seks niveauer (D.RANGER_GRUPPER). En opgave, der er loest i
   foerste forsoeg uden Vis svaret, faar en stjerne, og stjernerne huskes.
   Naar et niveau er klaret, er der konfetti; naar alle 30 er klaret, en
   sejrsskaerm med en medalje efter antal stjerner (D.MEDALJE).
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
        this.gruppe = {};
        D.RANGER_GRUPPER.forEach(function (g) { mig.gruppe[g.id] = g; });
        var opg = D.RANGER.map(function (o) {
            var nr = D.RANGER.filter(function (x) { return x.gruppe === o.gruppe; }).indexOf(o) + 1;
            return { id: o.id, gruppe: o.gruppe, stoffer: o.stoffer, navn: mig.gruppe[o.gruppe].kort + " " + nr, nr: nr };
        });
        this.sejr = NK.el("r-sejr");
        NK.el("r-sejr-luk").addEventListener("click", function () { mig.lukSejr(); });
        NK.el("r-sejr-igen").addEventListener("click", function () {
            mig.lukSejr();
            var i = mig.foersteUdenStjerne();
            if (i >= 0) mig.vaelg(i);
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

    P.delNu = function () {
        return { slags: "opgave", chip: this.opg.o.navn,
            tekst: "Sæt stofferne i rækkefølge efter kogepunkt, det laveste til venstre.",
            ekstra: '<p class="sk-gaet">' + NK.html(this.gruppe[this.opg.o.gruppe].fokus) + "</p>" };
    };

    /* Saadan flyttes kortene: staar der, til eleven har byttet to kort én gang */
    P.sceneLinje = function () {
        return this.harByttet ? "" : "Træk et kort hen på et andet, så bytter de plads.";
    };

    P.kanIndsende = function () { return !this.opg.loest; };
    P.indsend = function () { this.tjek(); };

    /* Det foerste par fra venstre, der staar forkert: [venstre, hoejre] */
    P.foersteFejl = function (orden) {
        orden = orden || this.opg.orden;
        for (var i = 0; i + 1 < orden.length; i++) {
            if (kp(orden[i]) > kp(orden[i + 1])) return [orden[i], orden[i + 1]];
        }
        return null;
    };

    /* Hint 1 efter, hvad det foerste forkerte par handler om, hint 2 forklarer
       parret, og hint 3 siger, hvad der skal flyttes */
    P.hintTrin = function () {
        var f = this.foersteFejl();
        if (!f) return ["Rækkefølgen er rigtig. Tryk Indsend svar."];
        var g = D.grund(f[1], f[0]);
        var a = D.STOF[f[0]], b = D.STOF[f[1]];
        return [D.HINT1[g.slags], g.tekst, "Flyt " + b.navn + " til venstre for " + a.navn + "."];
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
        this.fejlLinje(D.forklar(f[1], f[0]));
        this.tavle.classList.remove("ryst");
        void this.tavle.offsetWidth;
        this.tavle.classList.add("ryst");
    };

    P.erLoest = function (maade) {
        var g = this.opg, gid = g.o.gruppe;
        var foerNiveau = this.niveauLoest(gid), foerAlle = this.antalLoest() === this.opgaver.length;
        var foerStjerner = this.antalStjerner();
        g.loest = true;
        g.fejlPar = null;
        this.tavle.classList.add("faerdig");
        this.bygKort();
        var linje = g.rigtig.map(function (id) { return D.STOF[id].navn + " " + D.kpTekst(D.STOF[id]); }).join(" < ") + ".";
        this.niveauNu = null;
        this.loest(maade, maade === "svar" ? "" : "Rigtig rækkefølge.", D.Stort(linje));
        var alle = this.antalLoest() === this.opgaver.length;
        /* Et niveau er klaret: det staar paa det groenne kort, og der er konfetti */
        if (!foerNiveau && this.niveauLoest(gid)) {
            this.niveauNu = gid;
            this.slut.tekst = (this.slut.tekst ? this.slut.tekst + " " : "") + "Niveauet " + this.gruppe[gid].kort + " er klaret ✓";
            this.visKort();
            if (!alle) NK.konfetti(this.el.skort, 50);
        }
        /* Alle 30 er klaret (eller alle har faaet en stjerne): sejrsskaermen */
        var N = this.opgaver.length;
        if (alle && (!foerAlle || (foerStjerner < N && this.antalStjerner() === N))) this.visSejr();
    };

    P.niveauLoest = function (gid) {
        var mig = this;
        return this.opgaver.every(function (o, i) { return o.gruppe !== gid || mig.status[i].loest; });
    };

    P.foersteUdenStjerne = function () {
        for (var i = 0; i < this.status.length; i++) if (!this.status[i].stjerne) return i;
        return -1;
    };

    /* Den groenne knap: til naeste niveau, eller medaljen, naar alle er klaret */
    P.videreFane = function () {
        if (this.naesteUloeste() < 0) return "Se din medalje →";
        var naeste = this.opgaver[this.naesteUloeste()];
        if (naeste.gruppe !== this.opg.o.gruppe) return "Næste niveau: " + this.gruppe[naeste.gruppe].kort + " →";
        return "";
    };

    P.videreKlik = function () {
        if (this.naesteUloeste() >= 0) return false;
        this.visSejr();
        return true;
    };

    /* ----- Sejren: alle 30 er sat i rigtig raekkefoelge ------------------------------- */
    P.visSejr = function () {
        var N = this.opgaver.length, stj = this.antalStjerner(), m = D.MEDALJE(stj, N);
        var lav = D.STOF.methan, hoej = D.STOF.glycerol;
        this.sejr.className = "sejr " + m.id;
        NK.saetHTML("r-medalje", medaljeSVG(m.id, stj, N));
        NK.saetTekst("r-sejr-tekst", "Du har sat alle " + N + " rækker stoffer i rigtig rækkefølge, fra " + lav.navn + " ved " +
            D.kpTekst(lav) + " til " + hoej.ekstra + " ved " + D.kpTekst(hoej) + ".");
        NK.saetHTML("r-sejr-medalje", "<b>" + NK.html(m.navn) + ":</b> " + NK.html(m.tekst));
        NK.saetTekst("r-sejr-maal", m.id === "guld" ? "Højere kommer man ikke." :
            "Tag opgaverne uden stjerne igen, og gå efter guld.");
        NK.el("r-sejr-igen").hidden = m.id === "guld";
        this.sejr.hidden = false;
        NK.konfettiRegn(this.sejr, m.id === "guld" ? 160 : 110);
    };

    P.lukSejr = function () {
        this.sejr.hidden = true;
        this.fokus();
    };

    var MEDALJEFARVE = {
        guld: ["#fff3b0", "#f2c53d", "#a67c00"],
        soelv: ["#ffffff", "#c9d1da", "#7d8794"],
        bronze: ["#ffd9b0", "#cd7f32", "#7a4515"]
    };

    function medaljeSVG(id, stj, N) {
        var f = MEDALJEFARVE[id];
        return '<svg viewBox="0 0 120 150" aria-hidden="true">' +
            '<defs><radialGradient id="mg-' + id + '" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="' + f[0] + '"/>' +
            '<stop offset="0.55" stop-color="' + f[1] + '"/><stop offset="1" stop-color="' + f[2] + '"/></radialGradient></defs>' +
            '<path d="M34 0 L58 0 L70 52 L48 58 Z" fill="#3d9ee0"/><path d="M86 0 L62 0 L50 52 L72 58 Z" fill="#e05446"/>' +
            '<circle cx="60" cy="96" r="46" fill="url(#mg-' + id + ')" stroke="' + f[2] + '" stroke-width="3"/>' +
            '<circle cx="60" cy="96" r="36" fill="none" stroke="' + f[0] + '" stroke-opacity="0.7" stroke-width="2"/>' +
            '<text x="60" y="94" text-anchor="middle" font-size="30" font-weight="800" fill="' + f[2] + '">★</text>' +
            '<text x="60" y="122" text-anchor="middle" font-size="17" font-weight="800" fill="' + f[2] + '">' + stj + "/" + N + "</text></svg>";
    }

    /* ----- Kortene --------------------------------------------------------------------- */
    P.bygKort = function () {
        var g = this.opg, mig = this;
        this.tavle.classList.toggle("faerdig", g.loest);
        this.pladser.innerHTML = "";
        this.pladser.style.setProperty("--n", g.orden.length);
        this.tavle.classList.toggle("n5", g.orden.length >= 5);
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
                '<div class="sk-navn">' + D.navnHTML(st) + "</div>" +
                (st.ekstra ? '<div class="sk-ekstra">' + NK.html(st.ekstra) + "</div>" : "") +
                '<div class="sk-formel">' + D.sumformel(st) + "</div>" +
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
        this.harByttet = true;
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
        var lay = { W: W, H: H, baand: baand, top: this.top() };
        var kant = NK.klamp(W * 0.025, 12, 28);
        var b = Math.min(W - 2 * kant, 1000);
        var t = this.tavle;
        t.style.left = Math.round((W - b) / 2) + "px";
        t.style.top = lay.top + "px";
        t.style.width = Math.round(b) + "px";
        var kortH = NK.klamp((baand.y - lay.top - 150) * 0.85, 170, 300);
        t.style.setProperty("--korth", Math.round(kortH) + "px");
        var th = t.offsetHeight || kortH + 80;
        lay.tavle = { x: (W - b) / 2, y: lay.top, b: b, h: th };
        lay.akseY = lay.top + th + NK.klamp((baand.y - lay.top - th) * 0.5, 50, 110);
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
        this.tegnSejr(ctx, lay.W, lay.baand.y);
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
