/* =====================================================================
   sim_rf.js - fane 2: Rf-vaerdien

   En toer TLC-plade ligger paa bordet med startlinjen og væskefronten
   tegnet med blyant. Til venstre for den ligger en lineal. Eleven aflæser
   afstandene, vaelger formlen og regner Rf-vaerdien ud i felterne paa
   kortet. En gul streg foelger musen hen over pladen og linealen, og en
   lup ved linealen viser millimeterstregerne. Et klik laaser stregen.

   Notesblokken til hoejre samler de tal, eleven har fundet, som pæne
   beregninger (formlen foerst).

   Opgaven Den lange plade: eleven traekker en plet derhen, hvor stof X
   ender, og sender hoejden ind.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var FARVER = ["#c2412f", "#d99a16", "#2f6fd0"];
    var LILLA = "#7b5cc4";

    /* Et farvestof til pletterne paa fane 2 (kun til tegningen) */
    function stof(farve) { return { id: "x", navn: "", farve: farve, uv: true, rf: { eta: 0.5 } }; }

    function SimRf() {
        var mig = this;
        this.notes = NK.el("r-notes");
        this.startFane(D.RF);
        this.startFoerste();
        window.addEventListener("resize", function () { mig.lay = null; });
    }

    var P = SimRf.prototype;
    NK.Fane.paa(P, { navn: "r", naesteFane: "fane-l", naesteNavn: "Læs pladen" });

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        var pd = o.plade;
        var plade = new NK.Model.Plade({ baner: [{ navn: "", pletter: [] }], loeb: D.LOEB.eta, frontMax: pd.front, bredde: 2.6 });
        plade.faerdiggoer();
        var mig = this;
        this.pletter = pd.pletter.map(function (q, i) {
            var ry = Math.sqrt(0.012 + 0.014 * q.z) * 1.05;
            return { bane: 0, x: plade.bredde / 2, z: q.z, ry: ry, rx: ry * 1.25, mgd: 1, skjult: !!q.skjult,
                stof: stof(pd.pletter.length > 1 ? FARVER[i % 3] : LILLA) };
        });
        plade.pletter = function () { return mig.pletter; };
        this.plade = plade;
        this.pd = pd;
        this.linje = null;
        this.harMaalt = false;
        this.noter = [];
        this.traek = null;
        this.vist = 0;
        this.lay = null;
        this.visNoter();
    };

    P.nyDelScene = function (del) {
        if (del && del.id === "placer") this.traek = { z: 0, roert: false };
        this.visNoter();
    };

    P.sceneLinje = function () {
        var del = this.delData();
        if (this.nr === 0 && this.opg.di === 0 && !this.harMaalt) return "Hold musen over TLC-pladen. Den gule streg og luppen hjælper dig med at aflæse linealen.";
        if (del && del.id === "placer" && !this.traek.roert) return "Træk den stiplede plet op ad banen.";
        return "";
    };

    /* ----- Felterne paa kortet ------------------------------------------------------- */
    function input(id, v, kl) {
        return '<input class="sk-input' + (kl ? " " + kl : "") + '" data-felt="' + id + '" value="' + NK.html(v || "") +
            '" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + id + '">';
    }

    P.feltHTML = function (del) {
        var v = this.feltV, html;
        if (del.regn) {
            return '<div class="sk-regn"><span class="sr-v"><i>R</i><sub>f</sub> =</span>' +
                '<span class="brk"><span>' + input("t", v.t, "kort") + ' cm</span><span>' + input("n", v.n, "kort") + " cm</span></span>" +
                '<span class="sr-v">=</span>' + input("r", v.r, "kort") + "</div>";
        }
        html = '<div class="sk-felter">';
        del.felter.forEach(function (f) {
            html += '<label class="sk-felt"><span class="sf-foer">' + NK.rfHTML(f.foer || "") + "</span>" +
                input(f.id, v[f.id], f.rf ? "kort" : "") + (f.efter ? '<span class="sf-efter">' + NK.html(f.efter) + "</span>" : "") + "</label>";
        });
        return html + "</div>";
    };

    P.fokusFelt = function () {
        var del = this.delData();
        if (!del || del.slags !== "felt" || this.faerdig || this.venter) return;
        var f = this.el.skort.querySelectorAll("input[data-felt]");
        for (var i = 0; i < f.length; i++) {
            if (!f[i].value) { if (document.activeElement !== f[i]) f[i].focus(); return; }
        }
    };

    function markerFelt(skort, id) {
        var e = skort.querySelector('input[data-felt="' + id + '"]');
        if (e) { e.classList.add("forkert"); e.focus(); e.select(); }
    }

    /* Et tal med dansk komma */
    function dk(v, d) { return D.dk(v, d); }

    /* ----- Indsend ------------------------------------------------------------------ */
    P.kanIndsende = function (del) {
        if (del.id === "placer") return !!this.traek && this.traek.roert;
        return true;
    };

    P.indsendTekst = function (del) {
        if (del.id === "placer") return this.traek && this.traek.roert ? "Indsend svar: " + dk(this.traekZ(), 1) + " cm" : "Indsend svar";
        return "Indsend svar";
    };

    P.traekZ = function () { return Math.round(this.traek.z * 10) / 10; };

    /* Tjekker ét afstandsfelt. Giver null eller fejlen. */
    P.afstandFejl = function (f, v) {
        if (Math.abs(v - f.ret) <= 0.1001) return null;
        if (f.kant !== undefined && Math.abs(v - f.kant) <= 0.1001) return D.FELTFEJL.kant;
        if (f.plet !== undefined) {
            var q = this.pletter[f.plet];
            if (Math.abs(v - (f.ret + q.ry)) <= 0.12) return D.FELTFEJL.top;
            if (Math.abs(v - (f.ret - q.ry)) <= 0.12) return D.FELTFEJL.bund;
            return D.FELTFEJL.plet;
        }
        return D.FELTFEJL.front;
    };

    P.indsend = function (del) {
        var mig = this, sk = this.el.skort;
        if (del.id === "placer") {
            var z = this.traekZ();
            if (Math.abs(z - del.ret) <= 0.15) { this.loestDel(del); this.delKlaret("selv", del.godt); return; }
            this.fejlLinje(z > del.ret ? "Pletten er for højt oppe. Den løber 0,40 gange så langt som væskefronten." :
                "Pletten er for langt nede. Den løber 0,40 gange så langt som væskefronten.");
            return;
        }
        /* Tallene, eleven har skrevet */
        var tal = {}, fejl = null, fejlId = null;
        del.felter.forEach(function (f) {
            if (fejl) return;
            var v = D.tal(mig.feltV[f.id]);
            if (v === null) { fejl = D.FELTFEJL.tom; fejlId = f.id; return; }
            if (isNaN(v)) { fejl = D.FELTFEJL.ikkeTal; fejlId = f.id; return; }
            tal[f.id] = v;
        });
        if (fejl) { markerFelt(sk, fejlId); this.fejlLinje(fejl); return; }
        if (del.regn) {
            var ft = del.felter[0], fn = del.felter[1], fr = del.felter[2];
            var tOk = Math.abs(tal.t - ft.ret) <= 0.1001, nOk = Math.abs(tal.n - fn.ret) <= 0.1001;
            if (!tOk && !nOk && Math.abs(tal.t - fn.ret) <= 0.1001 && Math.abs(tal.n - ft.ret) <= 0.1001) { markerFelt(sk, "t"); this.fejlLinje(D.FELTFEJL.byttet); return; }
            if (!tOk) { markerFelt(sk, "t"); this.fejlLinje(D.FELTFEJL.taeller); return; }
            if (!nOk) { markerFelt(sk, "n"); this.fejlLinje(D.FELTFEJL.naevner); return; }
            var ret = tal.t / tal.n;
            if (Math.abs(tal.r - ret) > 0.0101 && Math.abs(tal.r - fr.ret) > 0.0101) {
                markerFelt(sk, "r");
                this.fejlLinje(tal.r > 1 ? D.FELTFEJL.omvendt : D.FELTFEJL.rf);
                return;
            }
            this.loestDel(del, tal);
            this.delKlaret("selv", del.godt);
            return;
        }
        for (var i = 0; i < del.felter.length; i++) {
            var f = del.felter[i], v = tal[f.id];
            if (f.rf) {
                /* Rf regnet af elevens egen aflaesning (1 mm ved siden af) er ogsaa rigtig */
                var egen = tal.a !== undefined ? tal.a / this.pd.front : f.ret;
                if (Math.abs(v - f.ret) > 0.0101 && Math.abs(v - egen) > 0.0101) { markerFelt(sk, f.id); this.fejlLinje(v > 1 ? D.FELTFEJL.omvendt : D.FELTFEJL.rf); return; }
            } else {
                var fe = this.afstandFejl(f, v);
                if (fe) { markerFelt(sk, f.id); this.fejlLinje(fe); return; }
            }
        }
        this.loestDel(del, tal);
        this.delKlaret("selv", del.godt);
    };

    /* Vis svaret: felterne fyldes med de rigtige tal */
    P.opgaveSvar = function (del) {
        var mig = this;
        if (del.id === "placer") {
            this.traek.z = del.ret;
            this.traek.roert = true;
            this.loestDel(del);
            return del.godt;
        }
        var tal = {};
        (del.felter || []).forEach(function (f) {
            tal[f.id] = f.ret;
            mig.feltV[f.id] = dk(f.ret, f.rf ? 2 : 1);
        });
        this.loestDel(del, tal);
        return del.godt || "";
    };

    /* ----- Notesblokken: det, eleven har fundet, som pæne beregninger --------------- */
    function broek(over, under) {
        return '<span class="brk"><span>' + over + "</span><span>" + under + "</span></span>";
    }
    var RF = '<span class="rf"><i>R</i><sub>f</sub></span>';

    P.loestDel = function (del, tal) {
        var o = this.opg.o, n = this.noter;
        this.harMaalt = true;
        switch (del.id) {
            case "front":
                if (o.plade.nul === "kant")
                    n.push('<div class="nb-l">væskefrontens afstand = ' + dk(o.plade.front + this.plade.start, 1) + " cm − " +
                        dk(this.plade.start, 1) + " cm = <b>" + dk(o.plade.front, 1) + " cm</b></div>");
                else n.push('<div class="nb-l">væskefrontens afstand = <b>' + dk(o.plade.front, 1) + " cm</b></div>");
                break;
            case "plet":
                n.push('<div class="nb-l">plettens afstand = <b>' + dk(del.felter[0].ret, 1) + " cm</b></div>");
                break;
            case "formel":
                n.push('<div class="nb-l nb-f">' + RF + " = " + broek("plettens afstand", "væskefrontens afstand") + "</div>");
                break;
            case "regn":
                n.push('<div class="nb-l nb-f">' + RF + " = " + broek(dk(del.felter[0].ret, 1) + " cm", dk(del.felter[1].ret, 1) + " cm") +
                    " = <b>" + dk(del.felter[2].ret, 2) + "</b></div>");
                break;
            case "rf1": case "rf2": case "rf3": case "rf":
                var nr = del.id === "rf" ? "" : " " + del.id.slice(2);
                var a = del.felter[0], r = del.felter[1];
                var foer = o.plade.nul === "kant" ? '<div class="nb-l">plettens afstand = ' + dk(a.kant, 1) + " cm − 1,5 cm = <b>" + dk(a.ret, 1) + " cm</b></div>" : "";
                n.push(foer + '<div class="nb-l nb-f">' + RF + "(plet" + nr + ") = " + broek(dk(a.ret, 1) + " cm", dk(o.plade.front, 1) + " cm") +
                    " = <b>" + dk(r.ret, 2) + "</b></div>");
                break;
            case "placer":
                n.push('<div class="nb-l">plettens afstand = ' + RF + " · væskefrontens afstand</div>" +
                    '<div class="nb-l">plettens afstand = 0,40 · 7,5 cm = <b>3,0 cm</b></div>');
                this.pletter[0].skjult = false;
                this.vist = 0;
                break;
        }
        this.visNoter();
    };

    P.visNoter = function () {
        if (!this.notes) return;
        var html = '<div class="nb-titel">Dine tal</div>';
        html += this.noter.length ? this.noter.join("") : '<div class="nb-tom">Her kommer de tal, du finder.</div>';
        NK.saetHTML("r-notes", html);
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, p = this.plade;
        var lay = { W: W, H: H, top: this.top() };
        lay.bordY = H - 22;
        var hoej = lay.bordY - lay.top - 34;
        var s = Math.min(hoej / p.hoejde, 68);
        var nb = Math.round(NK.klamp(W * 0.27, 210, 330));
        var R = Math.round(NK.klamp(s * 1.05, 46, 70));
        var bredde = function () { return 2 * R + 14 + Tg.LINEAL_B + 8 + p.bredde * s + 104 + nb; };
        if (bredde() > W - 24) {
            nb = Math.max(190, nb - (bredde() - (W - 24)));
            if (bredde() > W - 24) s *= (W - 24 - (bredde() - p.bredde * s)) / (p.bredde * s);
        }
        s = Math.max(s, 8);
        lay.s = s;
        lay.R = R;
        var x0 = Math.max(12, (W - bredde()) / 2);
        lay.lupX = x0 + R;
        lay.linX = x0 + 2 * R + 14;
        lay.px = lay.linX + Tg.LINEAL_B + 8;
        lay.py = lay.top + 22 + (hoej - p.hoejde * s) / 2;
        lay.pb = p.bredde * s;
        lay.ph = p.hoejde * s;
        lay.nbX = lay.px + lay.pb + 104;
        lay.nbB = nb;
        /* Linealens 0: ved startlinjen eller ved pladens kant */
        lay.yNul = this.pd.nul === "kant" ? lay.py + lay.ph : Tg.pladeY(p, lay.py, s, p.start);
        lay.linFra = 0;
        lay.linTil = this.pd.nul === "kant" ? p.hoejde - 0.1 : Math.ceil(p.front + 0.4);
        this.lay = lay;
        if (this.notes) {
            this.notes.style.left = Math.round(lay.nbX) + "px";
            this.notes.style.top = Math.round(lay.py) + "px";
            this.notes.style.width = Math.round(nb) + "px";
        }
        this.saetAnker("plade", lay.px, lay.py, lay.pb, lay.ph);
        this.saetAnker("lineal", lay.linX, lay.yNul - lay.linTil * s - 8, Tg.LINEAL_B, (lay.linTil - lay.linFra) * s + 16);
    };

    P.opdaterScene = function (dt) {
        if (this.vist < 1) this.vist = Math.min(1, this.vist + dt / 0.8);
    };

    /* Pletternes hoejde i px */
    P.pletY = function (q) { return Tg.pladeY(this.plade, this.lay.py, this.lay.s, this.plade.start + q.z); };

    P.tegnPladeOgLineal = function (ctx) {
        var lay = this.lay, p = this.plade, s = lay.s, mig = this;
        Tg.lineal(ctx, lay.linX, lay.yNul, s, lay.linFra, lay.linTil);
        Tg.plade(ctx, p, lay.px, lay.py, s, {
            skjul: function (q) { return q.skjult; }
        });
        /* Den skjulte plet kommer frem, naar opgaven er loest */
        var q0 = this.pletter[0];
        if (this.pd.pletter[0].skjult && !q0.skjult && this.vist < 1) {
            ctx.save();
            ctx.globalAlpha = 1 - this.vist;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(lay.px + q0.x * s, this.pletY(q0), q0.rx * s + 2, q0.ry * s + 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        /* Numrene ved pletterne (Tre pletter) */
        if (this.pd.numre) {
            this.pletter.forEach(function (q, i) {
                Tg.etiket(ctx, "plet " + (i + 1), lay.px + lay.pb + 4, mig.pletY(q), { venstre: true, font: "700 12px 'Segoe UI', sans-serif",
                    bund: "rgba(20,22,28,0.82)" });
            });
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, t = this.tid;
        if (!lay) return;
        var W = lay.W, H = lay.H, p = this.plade, s = lay.s, mig = this;
        Tg.baggrund(ctx, W, H, lay.bordY);
        this.tegnPladeOgLineal(ctx);
        /* Navnene paa stregerne */
        var yS = Tg.pladeY(p, lay.py, s, p.start), yF = Tg.pladeY(p, lay.py, s, p.start + p.front);
        var nx = lay.px + lay.pb + 4;
        if (!this.pd.numre) {
            Tg.etiket(ctx, "væskefront", nx, yF, { venstre: true, font: "600 12px 'Segoe UI', sans-serif" });
            Tg.etiket(ctx, "startlinje", nx, yS, { venstre: true, font: "600 12px 'Segoe UI', sans-serif" });
        }
        /* Pletten, der traekkes (Den lange plade) */
        var del = this.delData();
        if (this.traek && del && del.id === "placer" && !this.faerdig && !this.venter) {
            var q = this.pletter[0];
            var ty = Tg.pladeY(p, lay.py, s, p.start + this.traek.z), tx = lay.px + q.x * s;
            ctx.save();
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "#7b5cc4";
            ctx.lineWidth = 2;
            ctx.fillStyle = "rgba(123, 92, 196, 0.28)";
            ctx.beginPath();
            ctx.ellipse(tx, ty, q.rx * s, q.ry * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = "rgba(123, 92, 196, 0.9)";
            ctx.beginPath();
            ctx.moveTo(lay.linX + Tg.LINEAL_B, ty);
            ctx.lineTo(tx - q.rx * s, ty);
            ctx.stroke();
            ctx.restore();
            if (!this.traek.roert) Tg.skilt(ctx, "Træk pletten op", tx + q.rx * s + 4, ty, t, "venstre");
        }
        /* Den gule aflæsningsstreg og luppen ved linealen */
        if (this.linje) this.tegnLinje(ctx);
        this.tegnRinge(ctx, t);
        this.tegnSejr(ctx, W, H);
    };

    P.tegnLinje = function (ctx) {
        var lay = this.lay, y = this.linje.y, R = lay.R;
        ctx.save();
        ctx.strokeStyle = this.linje.fast ? "rgba(242, 197, 61, 0.95)" : "rgba(242, 197, 61, 0.75)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lay.linX - 4, y);
        ctx.lineTo(lay.px + lay.pb + 2, y);
        ctx.stroke();
        /* Luppen: linealen og pladens kant forstørret 3 gange */
        var cx = lay.lupX, cy = NK.klamp(y, lay.top + R + 4, lay.bordY - R - 4), z = 3;
        var fx = lay.linX + Tg.LINEAL_B - 6, fy = y;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#1b1d24";
        ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        ctx.translate(cx, cy);
        ctx.scale(z, z);
        ctx.translate(-fx, -fy);
        this.tegnPladeOgLineal(ctx);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
        ctx.lineWidth = 1.2 / z;
        ctx.beginPath();
        ctx.moveTo(fx - R, y);
        ctx.lineTo(fx + R, y);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = "#0e1015";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        /* Haandtaget og en linje fra luppen til stregen */
        ctx.strokeStyle = "rgba(242, 197, 61, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx + R, cy);
        ctx.lineTo(lay.linX - 4, y);
        ctx.stroke();
        ctx.restore();
    };

    P.tegnRinge = function (ctx, t) {
        var lay = this.lay, p = this.plade, s = lay.s, mig = this;
        this.omNu().forEach(function (om) {
            if (om === "front") {
                var yF = Tg.pladeY(p, lay.py, s, p.start + p.front);
                Tg.ring(ctx, lay.px, yF - 4, lay.pb, 8, t, 6);
            } else if (om === "kant") {
                Tg.ring(ctx, lay.linX, lay.py + lay.ph - 6, lay.px + lay.pb - lay.linX, 10, t, 6);
            } else if (om.indexOf("plet:") === 0) {
                var q = mig.pletter[parseInt(om.slice(5), 10)];
                var qy = mig.pletY(q), qx = lay.px + q.x * s;
                Tg.ring(ctx, qx - q.rx * s - 4, qy - q.ry * s - 4, 2 * q.rx * s + 8, 2 * q.ry * s + 8, t, 12);
            } else if (om === "pletter") {
                Tg.ring(ctx, lay.px + 4, lay.py + 6, lay.pb - 8, lay.ph - 12, t, 6);
            } else if (om === "bane") {
                Tg.ring(ctx, lay.px + lay.pb * 0.2, lay.py + 4, lay.pb * 0.6, lay.ph - 8, t, 6);
            }
        });
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    P.iMaalefelt = function (pt) {
        var lay = this.lay;
        return pt.x >= lay.linX - 2 && pt.x <= lay.px + lay.pb + 70 && pt.y >= lay.py - 4 && pt.y <= lay.py + lay.ph + 4;
    };

    P.paaTraek = function (pt) {
        var del = this.delData();
        if (!this.traek || !del || del.id !== "placer" || this.faerdig || this.venter) return false;
        var lay = this.lay, q = this.pletter[0], s = lay.s;
        var ty = Tg.pladeY(this.plade, lay.py, s, this.plade.start + this.traek.z);
        return Math.abs(pt.x - (lay.px + q.x * s)) <= q.rx * s + 12 && Math.abs(pt.y - ty) <= q.ry * s + 12;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) { if (this.linje && !this.linje.fast) this.linje = null; return null; }
        if (this.paaTraek(pt)) return "greb";
        if (this.iMaalefelt(pt)) {
            if (!this.linje || !this.linje.fast) this.linje = { y: pt.y, fast: false };
            return "pointer";
        }
        if (this.linje && !this.linje.fast) this.linje = null;
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        if (this.iMaalefelt(pt)) {
            this.linje = { y: pt.y, fast: true };
            this.harMaalt = true;
        } else if (this.linje) this.linje = null;
    };

    P.nedScene = function (pt) {
        if (!this.paaTraek(pt)) return false;
        if (this.spaer()) return false;
        this.flytScene(pt);
        return true;
    };

    P.flytScene = function (pt) {
        if (!this.traek) return;
        var lay = this.lay, p = this.plade;
        var z = p.hoejde - (pt.y - lay.py) / lay.s - p.start;
        this.traek.z = NK.klamp(z, 0, p.front);
        this.traek.roert = true;
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
        this.linje = { y: pt.y, fast: false };
        this.visIndsend();
    };

    P.opScene = function () { };

    /* Pil op og ned flytter pletten 1 mm (Den lange plade) */
    P.tast = function (e) {
        var del = this.delData();
        if (!this.traek || !del || del.id !== "placer" || this.faerdig || this.venter) return false;
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return false;
        this.traek.z = NK.klamp(Math.round(this.traek.z * 10) / 10 + (e.key === "ArrowUp" ? 0.1 : -0.1), 0, this.plade.front);
        this.traek.roert = true;
        this.visIndsend();
        return true;
    };

    NK.SimRf = SimRf;
}());
