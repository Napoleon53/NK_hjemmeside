/* =====================================================================
   Highscorelister til spillene på kemiformler.dk (22. nov. 2026,
   Organiske grupper C og Millionær på tid tilføjet 27. nov. 2026)

   Ét regneark med ét faneblad pr. spil. Første spil er samlebåndet i
   sc2.3 Kemikalielageret. Skal et nyt spil have en liste, skrives det i
   SPIL nedenfor med den højeste score, et menneske kan nå, og scriptet
   udrulles igen (Udrul > Administrer udrulninger > blyant > Ny version).

   Spil på tid (tid: true) vinder med den laveste tid. Tiden gemmes med
   én decimal, og listen giver { navn, sekunder } i stedet for point.

   Spillet henter listen med  ...exec?spil=sc2.3
   og sender et resultat som JSON:  { spil, navn, point, niveau, sekunder }
   ===================================================================== */

const SPIL = {
  /* Samlebåndet kan højst give ca. 19 100 point, før det umenneskelige
     niveau er klaret, og et klaret umenneskeligt niveau sendes aldrig. */
  'sc2.3': { navn: 'Samlebåndet (sc2.3)', maks: 20000, pointPrSekund: 120 },
  /* Organiske grupper, Kemi C. Spillet slutter ikke ved Stofgruppemester
     (14 000 point), så loftet er højt; 100 point pr. molekyle og bonus ved
     oprydning giver langt under 400 point pr. sekund. Kemi B har sin egen,
     ældre liste i et andet regneark. */
  'spil4c': { navn: 'Organiske grupper C (spil4)', maks: 100000, pointPrSekund: 400 },
  /* Kemi-Millionær på tid: kun en vundet million (alle 15 spørgsmål).
     Uret går kun, mens svarene står fremme, så et menneske bruger mindst
     omkring et sekund pr. spørgsmål. */
  'spil2': { navn: 'Millionær på tid (spil2)', tid: true, niveau: 15, minSekunder: 8, maksSekunder: 3600 },
  /* Kort og godt, Parring (spil9): ét faneblad pr. indbygget sæt, kun 6 par
     pr. runde (niveau 6), laveste tid inkl. 5 s pr. fejl. point = antal kort
     i sættet. minSekunder = 0,6 s pr. kort (to klik pr. kort), rundet ned. */
  'spil9-grundstoffer':   { navn: 'Kort og godt C1 Grundstoffer (spil9)', tid: true, niveau: 6, minSekunder: 19, maksSekunder: 3600 },
  'spil9-ioner':          { navn: 'Kort og godt C2 Ioner (spil9)', tid: true, niveau: 6, minSekunder: 18, maksSekunder: 3600 },
  'spil9-molekyler':      { navn: 'Kort og godt C3 Molekyler (spil9)', tid: true, niveau: 6, minSekunder: 16, maksSekunder: 3600 },
  'spil9-organisk':       { navn: 'Kort og godt C4 Organisk (spil9)', tid: true, niveau: 6, minSekunder: 18, maksSekunder: 3600 },
  'spil9-beregninger':    { navn: 'Kort og godt C5-C6 Beregninger (spil9)', tid: true, niveau: 6, minSekunder: 15, maksSekunder: 3600 },
  'spil9-syrebase-redox': { navn: 'Kort og godt C7-C8 Syre-base og redox (spil9)', tid: true, niveau: 6, minSekunder: 16, maksSekunder: 3600 },
  /* Betydende cifre, fanen Blandet (sc5.11): ti opgaver på tid, 10 s pr.
     forkert første svar, hint eller vist svar. Kun hele runder (niveau 10).
     point = rigtige i første forsøg. Mindst 1 s pr. opgave. */
  'sc5.11': { navn: 'Betydende cifre, Blandet (sc5.11)', tid: true, niveau: 10, minSekunder: 10, maksSekunder: 3600 }
};

const TIDSZONE = 'Europe/Copenhagen';
const TOP = 10;

function doGet(e) {
  const spil = String((e && e.parameter && e.parameter.spil) || '');
  if (!SPIL[spil]) return svar_({ fejl: 'ukendt spil' });
  return svar_(lister_(spil));
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (fejl) {
    return svar_({ fejl: 'ugyldig' });
  }
  const spil = String(data.spil || '');
  const regler = SPIL[spil];
  if (!regler) return svar_({ fejl: 'ukendt spil' });

  const navn = rensNavn_(data.navn);
  const point = Math.floor(Number(data.point)) || 0;
  const niveau = Math.floor(Number(data.niveau)) || 0;
  const sekunder = regler.tid ? Math.round(Number(data.sekunder) * 10) / 10 || 0 : Math.floor(Number(data.sekunder)) || 0;

  /* Et resultat, et menneske ikke kan nå, kommer ikke på listen */
  const muligt = regler.tid
    ? sekunder >= regler.minSekunder && sekunder <= regler.maksSekunder && (!regler.niveau || niveau === regler.niveau)
    : point > 0 && point <= regler.maks && point <= regler.pointPrSekund * sekunder + 100;
  if (!navn || !muligt) return svar_(Object.assign({ ok: false }, lister_(spil)));

  const laas = LockService.getScriptLock();
  laas.waitLock(10000);
  try {
    ark_(spil).appendRow([new Date(), navn, point, niveau, sekunder]);
  } finally {
    laas.releaseLock();
  }
  return svar_(Object.assign({ ok: true }, lister_(spil)));
}

/* Top 10 denne uge (fra mandag kl. 0) og alle tider. Hvert navn står
   kun én gang, med sit bedste resultat. */
function lister_(spil) {
  const ark = ark_(spil);
  const sidste = ark.getLastRow();
  const raekker = sidste > 1 ? ark.getRange(2, 1, sidste - 1, 5).getValues() : [];
  const alle = raekker.map(function (r) {
    return { tid: new Date(r[0]), navn: String(r[1]), point: Number(r[2]) || 0, sekunder: Number(r[4]) || 0 };
  });
  const mandag = ugensStart_();
  const paaTid = !!SPIL[spil].tid;
  return {
    uge: bedste_(alle.filter(function (r) { return r.tid >= mandag; }), paaTid),
    alle: bedste_(alle, paaTid)
  };
}

/* Point: flest er bedst. Tid: lavest er bedst. Står to lige, vinder den,
   der kom først. */
function bedste_(raekker, paaTid) {
  function bedre(a, b) { return paaTid ? a.sekunder < b.sekunder : a.point > b.point; }
  const pr = {};
  raekker.forEach(function (r) {
    const n = r.navn.toLowerCase();
    if (!pr[n] || bedre(r, pr[n])) pr[n] = r;
  });
  return Object.keys(pr).map(function (n) { return pr[n]; })
    .sort(function (a, b) {
      return (paaTid ? a.sekunder - b.sekunder : b.point - a.point) || a.tid - b.tid;
    })
    .slice(0, TOP)
    .map(function (r) { return paaTid ? { navn: r.navn, sekunder: r.sekunder } : { navn: r.navn, point: r.point }; });
}

function ugensStart_() {
  const nu = new Date();
  const dag = Number(Utilities.formatDate(nu, TIDSZONE, 'u'));          /* 1 = mandag */
  const dato = Utilities.formatDate(nu, TIDSZONE, 'yyyy-MM-dd');
  const midnat = Utilities.parseDate(dato + ' 00:00:00', TIDSZONE, 'yyyy-MM-dd HH:mm:ss');
  return new Date(midnat.getTime() - (dag - 1) * 24 * 60 * 60 * 1000);
}

/* Navnet: højst 20 tegn, ingen styretegn, og et navn, der begynder med
   =, +, - eller @, bliver ikke til en formel i regnearket */
function rensNavn_(navn) {
  let n = String(navn || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().substring(0, 20);
  if (/^[=+\-@]/.test(n)) n = "'" + n;
  return n;
}

function ark_(spil) {
  const regneark = SpreadsheetApp.getActiveSpreadsheet();
  const navn = SPIL[spil].navn;
  let ark = regneark.getSheetByName(navn);
  if (!ark) ark = regneark.insertSheet(navn);
  if (ark.getLastRow() === 0) ark.appendRow(['Tidspunkt', 'Navn', 'Point', 'Niveau', 'Sekunder']);
  return ark;
}

function svar_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
