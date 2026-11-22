/* =====================================================================
   Highscorelister til spillene på kemiformler.dk (22. nov. 2026)

   Ét regneark med ét faneblad pr. spil. Første spil er samlebåndet i
   sc2.3 Kemikalielageret. Skal et nyt spil have en liste, skrives det i
   SPIL nedenfor med den højeste score, et menneske kan nå, og scriptet
   udrulles igen (Udrul > Administrer udrulninger > blyant > Ny version).

   Spillet henter listen med  ...exec?spil=sc2.3
   og sender et resultat som JSON:  { spil, navn, point, niveau, sekunder }
   ===================================================================== */

const SPIL = {
  /* Samlebåndet kan højst give ca. 19 100 point, før det umenneskelige
     niveau er klaret, og et klaret umenneskeligt niveau sendes aldrig. */
  'sc2.3': { navn: 'Samlebåndet (sc2.3)', maks: 20000, pointPrSekund: 120 }
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
  const sekunder = Math.floor(Number(data.sekunder)) || 0;

  /* Et resultat, et menneske ikke kan nå, kommer ikke på listen */
  const muligt = point > 0 && point <= regler.maks && point <= regler.pointPrSekund * sekunder + 100;
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
  const raekker = sidste > 1 ? ark.getRange(2, 1, sidste - 1, 3).getValues() : [];
  const alle = raekker.map(function (r) { return { tid: new Date(r[0]), navn: String(r[1]), point: Number(r[2]) || 0 }; });
  const mandag = ugensStart_();
  return {
    uge: bedste_(alle.filter(function (r) { return r.tid >= mandag; })),
    alle: bedste_(alle)
  };
}

function bedste_(raekker) {
  const pr = {};
  raekker.forEach(function (r) {
    const n = r.navn.toLowerCase();
    if (!pr[n] || r.point > pr[n].point) pr[n] = r;
  });
  return Object.keys(pr).map(function (n) { return pr[n]; })
    .sort(function (a, b) { return b.point - a.point || a.tid - b.tid; })
    .slice(0, TOP)
    .map(function (r) { return { navn: r.navn, point: r.point }; });
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
