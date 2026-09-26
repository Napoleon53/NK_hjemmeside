/* =====================================================================
   data.js - tekster: Kemichaels praesentation og linjen under scenen

   Replikkerne er hoejst ca. 60 tegn og uden teori. Sarkasmen rammer
   handlingen, aldrig eleven.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Kemichaels praesentation ------------------------------------------- */
    D.INTRO_TEGN = [
        "Tegnebrættet. Her tegner du, hvad du vil.",
        "Kopiér tegningen ind i rapporten til højre.",
        "Rapporten retter jeg senere. Med rød pen."
    ];

    /* ----- Linjen under scenen: naeste skridt ----------------------------------- */
    D.STATUS = {
        tegnebraet: "Træk fra et atom for at tegne. Klik på en binding: dobbelt eller tripel. Træk i tom tavle for at flytte udsnittet."
    };

    NK.Data = D;
}());
