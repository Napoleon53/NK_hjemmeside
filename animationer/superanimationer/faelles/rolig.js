/* =====================================================================
   faelles/rolig.js - knappen Rolig fart, 28. nov. 2026
   ---------------------------------------------------------------------
   Niels: "andre gange savner jeg en 'begrænset grafik'-toggle ... så
   gamle mennesker kan få lov til at slappe af i øjnene". Knappen hører
   til i den enkelte animation, hvor det er aktuelt (ikke i panelet), og
   når den er slået til, kører animationen med en fjerdedel af farten.

   Brug: én linje i <head>, før animationens egne scripts:
     <script src="../faelles/rolig.js"></script>
   Knappen sættes ind i topbjælken foran Teori (#teoriknap), ellers foran
   rundvisningen (#hjaelpknap), og får animationens egen knapstil.

   Sådan virker det: animationen får et ur, der går langsommere
   (requestAnimationFrame og performance.now). Animationerne regner deres
   fart ud fra det ur, så alt, der bevæger sig, går med en fjerdedel af
   farten, uden at animationens egen kode skal rettes. setTimeout og
   Date.now er urørte. Glød på lærredet (shadowBlur) slukkes også.
   Valget huskes i browseren og gælder alle animationer med knappen.
   <html> får klassen rolig-fart og window.NK_ROLIG, hvis en animation
   selv vil gøre mere.
   ===================================================================== */
(function () {
    'use strict';
    var NOEGLE = 'kemiformler-rolig-fart';
    var FART = 0.25;

    function laes() { try { return localStorage.getItem(NOEGLE) === '1'; } catch (e) { return false; } }
    function gem(til) { try { localStorage.setItem(NOEGLE, til ? '1' : '0'); } catch (e) {} }

    /* ----- Uret ------------------------------------------------------- */
    var perf = window.performance;
    var aegteNu = perf.now.bind(perf);
    var aegteRaf = window.requestAnimationFrame.bind(window);
    var ur = { fart: 1, basisAegte: aegteNu(), basisTid: 0 };
    ur.basisTid = ur.basisAegte;
    function tid(aegte) { return ur.basisTid + (aegte - ur.basisAegte) * ur.fart; }
    function skiftFart(f) {
        var nu = aegteNu();
        ur.basisTid = tid(nu); ur.basisAegte = nu; ur.fart = f;   /* uret springer aldrig */
    }
    perf.now = function () { return tid(aegteNu()); };
    window.requestAnimationFrame = function (fn) {
        return aegteRaf(function (ts) { fn(tid(ts)); });
    };

    /* ----- Glød på lærredet -------------------------------------------- */
    var C = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype;
    var d = C && Object.getOwnPropertyDescriptor(C, 'shadowBlur');
    if (d && d.set) {
        Object.defineProperty(C, 'shadowBlur', {
            configurable: true, enumerable: d.enumerable,
            get: function () { return d.get.call(this); },
            set: function (v) { d.set.call(this, ur.fart < 1 ? 0 : v); }
        });
    }

    /* ----- Knappen ----------------------------------------------------- */
    var knap = null;
    function saet(til) {
        skiftFart(til ? FART : 1);
        window.NK_ROLIG = til;
        document.documentElement.classList.toggle('rolig-fart', til);
        if (knap) {
            knap.setAttribute('aria-pressed', til ? 'true' : 'false');
            knap.title = til
                ? 'Rolig fart er slået til: alt bevæger sig med en fjerdedel af farten. Klik for normal fart.'
                : 'Rolig fart: alt bevæger sig med en fjerdedel af farten, og intet gløder.';
        }
    }

    function stil() {
        var s = document.createElement('style');
        s.textContent =
            '.rolig-knap { display: inline-flex; align-items: center; gap: 7px; }' +
            '.rolig-knap .rolig-kontakt { position: relative; width: 24px; height: 14px; border-radius: 7px;' +
            '  background: rgba(150, 160, 170, .35); flex: none; transition: background .15s; }' +
            '.rolig-knap .rolig-kontakt::after { content: ""; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px;' +
            '  border-radius: 50%; background: currentColor; opacity: .75; transition: transform .15s; }' +
            '.rolig-knap[aria-pressed="true"] .rolig-kontakt { background: #5fb878; }' +
            '.rolig-knap[aria-pressed="true"] .rolig-kontakt::after { transform: translateX(10px); background: #fff; opacity: 1; }';
        document.head.appendChild(s);
    }

    function indsaet() {
        var nabo = document.getElementById('teoriknap') || document.getElementById('hjaelpknap');
        if (!nabo || document.getElementById('roligknap')) return;
        knap = document.createElement('button');
        knap.type = 'button';
        knap.id = 'roligknap';
        knap.className = (nabo.className || '') + ' rolig-knap';
        if (/\bikonknap\b/.test(knap.className) && !/\btekstknap\b/.test(knap.className)) knap.className += ' tekstknap';
        knap.innerHTML = '<span class="rolig-kontakt" aria-hidden="true"></span>Rolig fart';
        knap.addEventListener('click', function () {
            var til = !window.NK_ROLIG;
            gem(til); saet(til);
            knap.blur();
        });
        nabo.parentNode.insertBefore(knap, nabo);
        stil();
        saet(!!window.NK_ROLIG);
    }

    saet(laes());
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', indsaet);
    else indsaet();
})();
