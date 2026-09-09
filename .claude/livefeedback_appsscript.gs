// === Apps Script til feedback-formularen i samling_alt.html ===
//
// OPSÆTNING (gøres én gang):
// 1. Opret et nyt Google Sheet, kald det "livefeedback".
// 2. Åbn det, gå til Extensions/Udvidelser > Apps Script.
// 3. Slet den tomme Code.gs, og indsæt hele denne fils indhold i stedet.
// 4. Tryk "Deploy" > "New deployment".
//    - Vælg type "Web app".
//    - "Execute as": Me (dig).
//    - "Who has access": Anyone.
//    - Tryk Deploy, og godkend de adgangsspørgsmål der dukker op.
// 5. Kopiér den URL du får ("Web app URL") og indsæt den som værdien af
//    FEEDBACK_SCRIPT_URL i samling_alt.html (søg efter "INDSÆT_DIN_GOOGLE...").
// 6. Test formularen på siden - en ny række skal dukke op i arket "Feedback".
//
// Hvis du senere ændrer koden her, skal du lave en ny deployment ("Manage deployments" > blyant > New version)
// for at ændringerne slår igennem på den samme URL.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Feedback');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Feedback');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Tidspunkt', 'Kapitel', 'Animation', 'Navn', 'Feedback']);
  }

  var p = e.parameter;
  sheet.appendRow([
    new Date(),
    p.kapitel || '',
    p.animation || '',
    p.navn || '(anonym)',
    p.feedback || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
