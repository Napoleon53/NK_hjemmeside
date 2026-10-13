# Kompendier (kopi)

Her ligger siden, hvor en lærer sætter sit eget kompendium til Kemibogen sammen og får en PDF til print.
Mappen er en kopi. Ret ikke i filerne her: de bliver skrevet over, næste gang siden lægges ind.

Siden skrives i `NK_Undervisning/Kemibogen/kompendier/app` og lægges herind med
`python kompendier/laeg_paa_hjemmesiden.py` derfra.

- `index.html` er siden med afkrydsningerne, og `saml.js` sætter PDF'en sammen i browseren.
- `data/kapitel-N.js` er delene til et kapitel (noter, opgaver, øvelser og bilag) som én PDF.
- `pdf-lib.min.js` er biblioteket, der arbejder med PDF'en (MIT-licens, se `pdf-lib-LICENSE.md`).
- Niels 13. okt. 2026: siden skal ligge på hjemmesiden, men "det behøver ikke blive aktivt". Lav derfor
  ingen links til mappen fra resten af hjemmesiden, før Niels beder om det.
