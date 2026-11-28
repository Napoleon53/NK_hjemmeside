/* =====================================================================
   panel/panel.js - animationspanelet (samling_alt.html), 28. nov. 2026
   ---------------------------------------------------------------------
   Afløser det gamle panel med to lag sidemenuer (udkast 3 af tre, valgt af
   Niels 28. nov. 2026). Startsiden er et bibliotek med alle animationer og
   en søgning. En åben animation fylder hele skærmen; knappen i hjørnet
   åbner en skuffe med kapitlets animationer, link og feedback.

   Indholdet står i panel/menu.js. Adresser, der skal blive ved med at virke:
     samling_alt.html?emne=c7.1#c7     en animation (fanen følger med)
     samling_alt.html?side=kemi-c-filer/samling_c7.html   et kapitel
     samling_alt.html?kapitel=c7       et kapitel (kort form)
     samling_alt.html?niveau=b         kemi B (samling_alt_b.html sender hertil)
   ===================================================================== */
(function () {
    'use strict';
    var FEEDBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgfp2af0Zf9QL15s8E6FtsYOCrKh8rRZcjRY_cMh6MCgaEZVfRr2a3CDts29EB6CRQug/exec';
    var D = window.PANEL_MENU;
    var NIVEAUNAVN = { C: 'Kemi C', B: 'Kemi B' };
    var NIVEAUMAERKE = { C: '', B: '(beta)' };
    var TITEL = document.title;
    var $ = function (id) { return document.getElementById(id); };

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    }
    function kode(kap) { return /^[cb]\d/i.test(kap.kode) ? kap.kode.toUpperCase() : kap.kode.charAt(0).toUpperCase() + kap.kode.slice(1); }
    function erKapitel(kap) { return /^[cb]\d/i.test(kap.kode); }
    function nr(a, i) { return a.nr || String(i + 1); }

    // ---------- Adressen ----------
    function find(emne) {
        if (!emne) return null;
        emne = emne.toLowerCase();
        var res = null;
        ['C', 'B'].forEach(function (n) {
            D[n].forEach(function (kap, k) {
                kap.animationer.forEach(function (a, i) { if (!res && a.emne.toLowerCase() === emne) res = { niveau: n, k: k, a: i }; });
            });
        });
        if (res) return res;
        // Ukendt emne: vis kapitlet, som det gamle panel gjorde (c7.9 -> C7)
        if (/\.byg$/.test(emne)) return kapitelMedKode(emne.charAt(0) === 'b' ? 'B' : 'C', 'byg');
        var m = emne.match(/^([cb])(\d+)/);
        if (m) return kapitelMedKode(m[1].toUpperCase(), m[1] + m[2]);
        if (/^spil/.test(emne)) return kapitelMedKode('C', 'spil');
        return null;
    }
    function kapitelMedKode(n, k) {
        var res = null;
        D[n].forEach(function (kap, i) { if (!res && kap.kode.toLowerCase() === k.toLowerCase()) res = { niveau: n, k: i, a: -1 }; });
        return res;
    }
    function kapitelFraSide(side) {
        var fil = side.split('/').pop().split('?')[0], res = null;
        ['C', 'B'].forEach(function (n) {
            D[n].forEach(function (kap, k) { if (!res && kap.side.split('/').pop() === fil) res = { niveau: n, k: k, a: -1 }; });
        });
        return res;
    }
    function laesAdresse() {
        var p = new URLSearchParams(location.search);
        var emne = p.get('emne');
        // Gamle adresser, der skal blive ved med at virke. B-koderne fik 28. nov. 2026
        // kapitel og plads i menuen (b5.1 = B5 nr. 1). De gamle b2.2-b2.7, b3.1, b3.2,
        // b3.5 og b7.3 bruges nu af andre animationer og kan ikke sendes videre.
        var GAMMEL = {
            'c2.7': 'b2.8',
            'b9.1': 'b5.1',
            'b9.2': 'b5.3',
            'b2.indgreb': 'b2.2',
            'navngivning': 'b3.1',
            'b4': 'b3.2',
            'isomerjagten': 'b3.3',
            'b6geo': 'b3.4',
            'b6spejl': 'b3.5',
            'b5navne': 'b4.1',
            'b5ester': 'b4.2',
            'b5dnph': 'b4.3',
            'b5oxid': 'b4.4',
            'eb5': 'b4.5',
            'tegnebraet': 'b4.6',
            'b.spil.organiske': 'b4.7',
            'b9.3': 'b5.2',
            'b9.4': 'b5.3',
            'b9.5': 'b5.4',
            'b7.10': 'b7.1',
            'b7.7': 'b7.3',
            'b7.8': 'b7.4',
            'b8.4': 'b8.1',
            'b8.6': 'b8.2'
        };
        if (emne && GAMMEL[emne.toLowerCase()]) emne = GAMMEL[emne.toLowerCase()];
        var kap = p.get('kapitel');
        var fund = emne ? find(emne)
            : p.get('side') ? kapitelFraSide(p.get('side'))
            : kap ? (kapitelMedKode('C', kap) || kapitelMedKode('B', kap)) : null;
        var niveau = (p.get('niveau') || '').toUpperCase() === 'B' ? 'B' : 'C';
        if (fund) return { niveau: fund.niveau, k: fund.k, a: fund.a, fane: location.hash };
        return { niveau: niveau, k: -1, a: -1, fane: '' };
    }
    function link(niveau, k, a) {
        var url = new URL('samling_alt.html', location.href);
        if (a >= 0) url.search = '?emne=' + encodeURIComponent(D[niveau][k].animationer[a].emne);
        else if (k >= 0) url.search = '?kapitel=' + encodeURIComponent(D[niveau][k].kode.toLowerCase());
        else if (niveau === 'B') url.search = '?niveau=b';
        return url.href;
    }

    var tilstand = laesAdresse();
    var skK = 0;             // kapitlet, skuffen viser
    var sidst = null;        // den sidst åbnede animation, markeres i biblioteket
    function kapitler() { return D[tilstand.niveau]; }

    // ---------- Biblioteket ----------
    function tegnNiveau() {
        // Skiftet står kun i biblioteket, ikke over en animation, så et almindeligt klik er nok (28. nov. 2026)
        $('niveau').innerHTML = ['C', 'B'].map(function (n) {
            var valgt = n === tilstand.niveau;
            return '<button type="button" class="' + (valgt ? 'valgt' : '') + '" data-n="' + n + '"' + (valgt ? ' aria-current="true"' : '') + '>' +
                NIVEAUNAVN[n] + (NIVEAUMAERKE[n] ? ' <small>' + NIVEAUMAERKE[n] + '</small>' : '') + '</button>';
        }).join('');
        $('titel').textContent = 'Animationer til kemi ' + tilstand.niveau;
    }
    $('niveau').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (b && b.dataset.n !== tilstand.niveau) skiftNiveau(b.dataset.n);
    });
    function tegnBibliotek() {
        $('kapnav').innerHTML = kapitler().map(function (kap, k) {
            return '<li><a href="#kap' + k + '" data-k="' + k + '"><span class="kode">' + esc(kode(kap)) + '</span><span class="navn">' + esc(kap.navn) + '</span></a></li>';
        }).join('') + '<li>' + novo('paa-lyst') + '</li>';
        $('sektioner').innerHTML = kapitler().map(function (kap, k) {
            return '<section class="sektion" id="kap' + k + '" data-k="' + k + '"><h2><span class="kode">' + esc(kode(kap)) + '</span>' + esc(kap.navn) + '</h2>' +
                '<p class="om">' + esc(kap.beskrivelse) + '</p><div class="fliser">' +
                kap.animationer.map(function (a, i) {
                    return '<button type="button" class="flise" data-k="' + k + '" data-a="' + i + '"><span class="flise-hoved"><span class="nr">' + esc(nr(a, i)) + '</span>' +
                        '<span>' + esc(a.navn) + '</span></span><p>' + esc(a.beskrivelse) + '</p></button>';
                }).join('') + '</div></section>';
        }).join('');
        $('soeg').value = '';
        $('intet').style.display = 'none';
        foelgKapitel();
    }
    $('sektioner').addEventListener('click', function (e) {
        var f = e.target.closest('.flise');
        if (f) aabenAnimation(+f.dataset.k, +f.dataset.a, '', true);
    });
    $('kapnav').addEventListener('click', function (e) {
        var a = e.target.closest('a[data-k]'); if (!a) return;
        e.preventDefault();
        var s = $('kap' + a.dataset.k); if (s) s.scrollIntoView({ behavior: 'smooth' });
    });

    // Kapitlet, man er nået til, lyser op i listen til venstre
    var obs;
    function foelgKapitel() {
        if (!('IntersectionObserver' in window)) return;
        if (obs) obs.disconnect();
        obs = new IntersectionObserver(function (poster) {
            poster.forEach(function (p) {
                if (!p.isIntersecting) return;
                document.querySelectorAll('.kapnav a').forEach(function (a) { a.classList.toggle('her', a.dataset.k === p.target.dataset.k); });
            });
        }, { rootMargin: '-10% 0px -80% 0px' });
        document.querySelectorAll('.sektion').forEach(function (s) { obs.observe(s); });
    }

    // Søgning i navn og beskrivelse (store/små bogstaver og accenter er ligegyldige)
    function normal(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    $('soeg').addEventListener('input', function () {
        var q = normal(this.value.trim()), antal = 0;
        document.querySelectorAll('.sektion').forEach(function (sek) {
            var kap = kapitler()[sek.dataset.k], synlige = 0;
            var iKapitel = q && normal(kode(kap) + ' ' + kap.navn).indexOf(q) !== -1;
            sek.querySelectorAll('.flise').forEach(function (f) {
                var a = kap.animationer[f.dataset.a];
                var match = !q || iKapitel || normal(a.navn + ' ' + a.beskrivelse).indexOf(q) !== -1;
                f.style.display = match ? '' : 'none';
                if (match) synlige++;
            });
            sek.style.display = synlige ? '' : 'none';
            antal += synlige;
        });
        $('intet').style.display = antal ? 'none' : 'block';
        $('intet').textContent = 'Ingen animationer i kemi ' + tilstand.niveau + ' passer til "' + this.value.trim() + '".';
    });

    // ---------- Skuffen over animationen ----------
    function tegnSkuffe() {
        $('skChips').innerHTML = kapitler().map(function (kap, k) {
            return '<button type="button" class="' + (k === skK ? 'valgt' : '') + (k === tilstand.k ? ' her' : '') + '" data-k="' + k + '" title="' + esc(kap.navn) + '">' + esc(kode(kap)) + '</button>';
        }).join('');
        var kap = kapitler()[skK];
        $('skKapTitel').textContent = kode(kap) + ' ' + kap.navn;
        $('skListe').innerHTML = kap.animationer.map(function (a, i) {
            var aktiv = skK === tilstand.k && i === tilstand.a;
            return '<li><button type="button" class="' + (aktiv ? 'aktiv' : '') + '" data-a="' + i + '"' + (aktiv ? ' aria-current="true"' : '') + '>' +
                '<span class="linje"><span class="nr">' + esc(nr(a, i)) + '</span>' + esc(a.navn) + '</span><span class="besk">' + esc(a.beskrivelse) + '</span></button></li>';
        }).join('');
    }
    $('skChips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { skK = +b.dataset.k; tegnSkuffe(); } });
    $('skListe').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) aabenAnimation(skK, +b.dataset.a, '', true); });
    function skuffe(til) {
        if (til) { skK = tilstand.k; tegnSkuffe(); }
        document.body.classList.toggle('skuffe-aaben', til);
        $('hjoerne').setAttribute('aria-expanded', til);
        if (til) setTimeout(function () { var b = $('skListe').querySelector('.aktiv') || $('skListe').querySelector('button'); if (b) b.focus(); }, 60);
    }
    $('hjoerne').onclick = function () { skuffe(true); };
    $('slor').onclick = $('skLuk').onclick = function () { skuffe(false); $('hjoerne').focus(); };
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if ($('fbOverlay').classList.contains('vis')) lukFeedback();
        else if (document.body.classList.contains('skuffe-aaben')) { skuffe(false); $('hjoerne').focus(); }
    });

    // ---------- Åbn og luk ----------
    // Animationen får altid klassen samling-fuld, så den giver plads til hjørneknappen.
    // En ny iframe hver gang, så browserens tilbageknap ikke bladrer i gamle animationer.
    function nytVindue(src) {
        var gl = $('vindue');
        var ny = document.createElement('iframe');
        ny.id = 'vindue';
        ny.title = 'Animation';
        ny.setAttribute('allow', 'clipboard-write; fullscreen');
        ny.addEventListener('load', function () {
            try { ny.contentDocument.documentElement.classList.add('samling-fuld'); } catch (e) { /* åbnet fra harddisken */ }
        });
        if (src) ny.src = src;
        gl.parentNode.replaceChild(ny, gl);
        return ny;
    }
    function aabenAnimation(k, a, fane, gem) {
        var anim = kapitler()[k].animationer[a];
        tilstand.k = k; tilstand.a = a;
        sidst = { niveau: tilstand.niveau, k: k, a: a };
        var sti = anim.sti;
        if (fane && sti.indexOf('#') === -1) sti += fane;
        nytVindue(sti);
        document.body.classList.add('viser-animation');
        document.title = anim.navn + ' · ' + TITEL;
        skuffe(false);
        if (gem) history.pushState({ panel: 1 }, '', link(tilstand.niveau, k, a));
        setTimeout(function () { try { $('vindue').focus(); } catch (e) {} }, 0);
    }
    function visBibliotek(gem, kapitel) {
        // Biblioteket står ved kapitlet fra adressen, ellers ved den animation, man kom fra
        var k = kapitel !== undefined && kapitel >= 0 ? kapitel : tilstand.k;
        tilstand.k = -1; tilstand.a = -1;
        nytVindue(null);
        document.body.classList.remove('viser-animation');
        document.title = TITEL;
        skuffe(false);
        markerSidst();
        if (gem) history.pushState({ panel: 1 }, '', link(tilstand.niveau, -1, -1));
        if (k >= 0) { var s = $('kap' + k); if (s) s.scrollIntoView(); } else window.scrollTo(0, 0);
    }
    function markerSidst() {
        document.querySelectorAll('.flise.sidst').forEach(function (f) { f.classList.remove('sidst'); });
        if (sidst && sidst.niveau === tilstand.niveau) {
            var f = document.querySelector('.flise[data-k="' + sidst.k + '"][data-a="' + sidst.a + '"]');
            if (f) f.classList.add('sidst');
        }
    }
    $('tilBibliotek').onclick = function () { visBibliotek(true); };

    function skiftNiveau(n) {
        tilstand.niveau = n;
        history.replaceState({ panel: 1 }, '', link(n, -1, -1));
        tegnNiveau(); tegnBibliotek();
        window.scrollTo(0, 0);
    }

    // Browserens tilbage- og fremknap
    window.addEventListener('popstate', function () {
        var ny = laesAdresse();
        if (ny.niveau !== tilstand.niveau) { tilstand.niveau = ny.niveau; tegnNiveau(); tegnBibliotek(); }
        if (ny.a >= 0) aabenAnimation(ny.k, ny.a, ny.fane, false);
        else visBibliotek(false, ny.k);
    });

    // ---------- Kopiér link ----------
    $('linkKnap').onclick = function () {
        var knap = this, tekst = link(tilstand.niveau, tilstand.k, tilstand.a);
        function manuelt() { window.prompt('Kopiér linket manuelt (Ctrl+C):', tekst); }
        try {
            navigator.clipboard.writeText(tekst).then(function () {
                var gl = knap.innerHTML;
                knap.classList.add('kopieret');
                knap.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><span>Kopieret</span>';
                setTimeout(function () { knap.classList.remove('kopieret'); knap.innerHTML = gl; }, 1400);
            }).catch(manuelt);
        } catch (e) { manuelt(); }
    };

    // ---------- Feedback ----------
    // Formularen vælger selv den åbne animation. Vælger eleven noget andet,
    // bliver det stående, til en anden animation åbnes (som i det gamle panel).
    var fb = { niveau: null, liste: null, sidst: null };
    function feedbackKapitler(niveau) {
        var liste = D[niveau].map(function (kap) {
            return { navn: erKapitel(kap) ? kode(kap) + ': ' + kap.navn : kap.navn,
                     animationer: kap.animationer.map(function (a, i) { return nr(a, i) + '. ' + a.navn; }) };
        });
        liste.push({ navn: 'Generelt (ikke et bestemt kapitel)', animationer: [] });
        return liste;
    }
    function fyldAnimationer() {
        var kap = fb.liste[$('fbKap').value];
        $('fbAnim').innerHTML = '<option value="">' + (kap.animationer.length ? 'Generelt om kapitlet' : 'Hele siden generelt') + '</option>' +
            kap.animationer.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + '</option>'; }).join('');
    }
    function tegnTal() {
        var n = $('fbTekst').value.trim().length;
        $('fbTal').textContent = '(' + n + ' tegn, mindst 20)';
        $('fbTal').classList.toggle('for-kort', n > 0 && n < 20);
    }
    function aabenFeedback() {
        if (fb.niveau !== tilstand.niveau) {
            fb.niveau = tilstand.niveau;
            fb.liste = feedbackKapitler(tilstand.niveau);
            $('fbKap').innerHTML = fb.liste.map(function (kap, i) { return '<option value="' + i + '">' + esc(kap.navn) + '</option>'; }).join('');
            fb.sidst = null;
        }
        var noegle = tilstand.niveau + '/' + tilstand.k + '/' + tilstand.a;
        if (noegle !== fb.sidst) {
            $('fbKap').value = tilstand.k >= 0 ? tilstand.k : fb.liste.length - 1;
            fyldAnimationer();
            if (tilstand.a >= 0) $('fbAnim').selectedIndex = tilstand.a + 1;
            fb.sidst = noegle;
        }
        $('fbStatus').textContent = ''; $('fbStatus').className = 'fb-status';
        $('fbOverlay').classList.add('vis');
        setTimeout(function () { $('fbTekst').focus(); }, 50);
    }
    function lukFeedback() { $('fbOverlay').classList.remove('vis'); }
    function sendFeedback() {
        var st = $('fbStatus'), tekst = $('fbTekst').value.trim();
        st.className = 'fb-status';
        if (tekst.length < 20) {
            st.textContent = 'Feedbacken skal være mindst 20 tegn (den er lige nu ' + tekst.length + ' tegn).';
            st.classList.add('fejl'); return;
        }
        var data = new URLSearchParams();
        data.append('kapitel', fb.liste[$('fbKap').value].navn);
        data.append('animation', $('fbAnim').value || '(generelt)');
        data.append('navn', $('fbNavn').value.trim() || '(anonym)');
        data.append('feedback', tekst);
        var knap = $('fbSend');
        knap.disabled = true; st.textContent = 'Sender...';
        fetch(FEEDBACK_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: data }).then(function () {
            st.textContent = 'Tak for din feedback!'; st.classList.add('ok');
            setTimeout(function () {
                $('fbTekst').value = ''; $('fbNavn').value = '';
                tegnTal(); knap.disabled = false; lukFeedback(); st.textContent = ''; st.className = 'fb-status';
            }, 1500);
        }).catch(function () {
            st.textContent = 'Der skete en fejl. Tjek internetforbindelsen, og prøv igen.';
            st.classList.add('fejl'); knap.disabled = false;
        });
    }
    $('fbOverlay').addEventListener('mousedown', function (e) { if (e.target === this) lukFeedback(); });
    $('fbLuk').onclick = $('fbAnnuller').onclick = lukFeedback;
    $('fbKap').onchange = fyldAnimationer;
    $('fbTekst').oninput = tegnTal;
    $('fbSend').onclick = sendFeedback;
    $('fbKnap').onclick = $('fbFod').onclick = aabenFeedback;

    // ---------- Novo Nordisk Fonden ----------
    // Logoet er hentet fra fondens presseside ("Logoer - til ekstern brug", 28. nov. 2026).
    // Blåt på lys baggrund, hvidt på mørk. Fonden har det kun på engelsk.
    function novo(klasse) {
        var fil = klasse === 'paa-lyst' ? 'panel/novo_nordisk_fonden_blaa.png' : 'panel/novo_nordisk_fonden_hvid.png';
        return '<div class="novo ' + (klasse || '') + '"><span>Udviklet med støtte fra</span>' +
            '<img class="novo-logo" src="' + fil + '" alt="Novo Nordisk Fonden" width="150" height="29"></div>';
    }
    $('novoFod').innerHTML = novo('paa-lyst');
    $('novoSkuffe').innerHTML = novo();

    // ---------- Start ----------
    // Panelet styrer selv, hvor biblioteket står, når man går tilbage
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    history.replaceState({ panel: 1 }, '', location.href);
    tegnNiveau(); tegnBibliotek();
    if (tilstand.a >= 0) aabenAnimation(tilstand.k, tilstand.a, tilstand.fane, false);
    else if (tilstand.k >= 0) { var k0 = tilstand.k; tilstand.k = -1; setTimeout(function () { var s = $('kap' + k0); if (s) s.scrollIntoView(); }, 0); }
})();
