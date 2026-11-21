# Kortets højde efter G1 (spørgsmålet på egen linje)

Den fælles ændring gør kortet en linje højere, når der står en indledning før spørgsmålet. Selvtestene fejler derfor på kortets højde i ca. 35 animationer. Listen over de nye fejl (målt med G1, før sprogrettelserne) står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/g1_fejl.txt`. Bagefter er afstanden over spørgsmålet sat 2 px ned, så de mindste overskridelser kan være væk. Fejlene i dine animationer skal du løse. Gør det i denne rækkefølge og stop ved det første, der virker:

1. Se, om sprogforslaget allerede gør kortet kortere.
2. Er indledningen to linjer eller mere, så forkort den uden at miste det, eleven skal vide. Spørgsmålet skal stadig kunne stå alene. Forkort ikke hints, forklaringer eller ros bare for at spare plads. Er de klart for lange, må du gerne forkorte dem. Tekstrettelser skrives i din ret-liste med `"nr": "G1"`.
3. Ellers giv kortets plads (kortZone eller det, animationen kalder det) præcis den ekstra højde, der skal til, og højst én linje (ca. 24 px). Ret selvtestens tal tilsvarende, og skriv en kommentar ved tallet: "spørgsmålet på egen linje, 21. nov. 2026". Scenen under kortet må gerne blive lidt mindre, men selvtestens layoutpåstande i små størrelser skal stadig holde. Det er layout, ikke tekst, så lav det direkte med Edit (ikke i ret-listen), og nævn fil og ændring i din rapport.

Fejl, der står i `basis.txt` (fra før i dag), skal du stadig lade være.
