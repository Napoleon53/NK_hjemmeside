# Trinvis start på én fane (T1 eller T2)

Du bygger én trinvis start i én superanimation (hvilken står i din besked). Svar og skriv på dansk. Niels skal give feedback på netop dette, før de andre 41 faner bygges, så gør det grundigt og pænt.

## Baggrund

Niels er kemilærer i gymnasiet og har bygget ca. 75 interaktive animationer (HTML/JS) til Kemi C og Kemi B i `~/NK_hjemmeside/animationer/superanimationer/<mappe>/`. Eleverne er 16-18 år, og de svage elever klikker, før de læser. Læs først:
- `~/NK_hjemmeside/CLAUDE.md`, især "Opgaver og hints i animationerne" (kortet øverst i midten, Indsend svar, en skyder løser aldrig en opgave af sig selv, kortet bliver på spørgsmålet efter et rigtigt svar med Næste, ingen tekst nederst i scenen).
- `~/NK_hjemmeside/animationer/superanimationer/README.md`, afsnittet "Fælles krav", og animationens egen README, hvis den har en.

I dag blev alle animationer gennemgået for to ting. Den ene: Hvor sker der for meget på én gang, når eleven træder ind på en fane? Niels har sagt ja til forslagene, men vil først se de to første, T1 og T2, bygget.

### Forbilledet: sb2.6 Rumfang og fortynding (bygget i går)

Se `sb2.6_rumfang_og_fortynding/js/data.js` (målet "pres" med `trin`, linje 80-200) og `js/fane.js` (`lavOpgave`, `tekstHTML`, `chip`, `synlig`) og pladsholderne i `js/tegning.js` (omkring linje 706). Det, Niels sagde, og som blev løsningen:
- En svag elev bliver forvirret, hvis alle dele er fremme med det samme. Første mål er stilladset i trin: Et spørgsmål ad gangen, og når det er løst, dukker den del op i scenen, som spørgsmålet handlede om.
- Hvert trin har en kort indledning i almindelig skrift (`intro`) og et halvfedt spørgsmål på sin egen linje, der kan stå alene (`tekst`). Etiketten på kortet siger "Trin 2 af 4".
- Det, der kommer senere, har sin plads sat af som en stiplet ramme med navnet (fx "reaktionsbrøken"), så intet hopper, når det dukker op. Tal i panelet kan foldes ind bag "Vis tallene".
- Svarene: Det rigtige og 2 forkerte, hvor de forkerte er fejl, elever faktisk laver. Hvert forkert svar har sin egen korte forklaring. Hvert trin har en hinttrappe på tre trin og en kort ros (`godt`).
- Inspirationen er "Byg figuren": Figuren afsløres lag for lag.

## Din opgave

1. **Sprogforslagene for din animation.** Sæt først de godkendte sprogforslag for din animation ind efter `~/NK_hjemmeside/.claude/spoergsmaal-og-start/opgave_sprog.md` (afsnittene "Dine forslag", "Sådan gør du" og "Det, en rettelse trækker med sig"). Dit navn til listen står i din besked. Det skal være gjort, før du bygger trinene, så Niels kan sætte et sprognummer tilbage. Den fælles fil `faelles/papirkort.js` sætter nu spørgsmålet på sin egen linje, når der står en indledning før det.
2. **Trinene.** Forslaget står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/<gruppe>.json` under din animations `start` (fanen står i din besked), med `fremme`, `bruges`, `forslag` (trinene), `andet` og `gevinst`. Skærmbilledet af fanen, som den er nu: `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/skud/<a eller b>/<mappe>__<fanenr>.png` (fanenr begynder ved 0). Byg det, som forslaget siger, i animationens egen kode og med de dele, animationen allerede har. Opfind ikke ny tung grafik. Det, der ikke er fremme endnu, er skjult eller har en stiplet plads med navn, og det, der er i panelet, men ikke bruges endnu, er skjult eller foldet ind.
3. **Når trinene er løst**, fortsætter målet, som det gør i dag. Har eleven løst målet før (gemt i browseren), eller er eleven på et senere mål, er alt fremme som i dag. "Start forfra" giver trinene igen. Mål 2 og frem er uændrede, bortset fra det, forslaget selv nævner.
4. **Selvtesten** (`_selvtest.html`): Den skal stadig gå igennem uden at lempe nogen grænse. Tilføj påstande for trinene: at de dele, der skal være skjult fra start, er skjult, at de dukker op efter det rigtige trin, at trinene kan løses (også med forkerte svar og Vis svaret), at scenen er låst under et spørgsmål, og at alt er fremme, når målet er løst. Kør den med `node ~/NK_hjemmeside/.claude/spoergsmaal-og-start/selvtest.mjs <mappe>`. Fejl, der stod der før i dag, står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/basis.txt`.
5. **Se det selv.** Tag skærmbilleder af fanen ved hvert trin (1400 x 860), og se på dem med Read-værktøjet. `~/NK_hjemmeside/.claude/spoergsmaal-og-start/skud.mjs` viser, hvordan man starter en lokal server og headless Chrome og tager et skærmbillede. Lav din egen kopi i scratchpad-mappen, der klikker dig gennem trinene. Tjek, at kortet ikke dækker noget, at intet hopper, når en del dukker op, at de stiplede pladser ser rolige ud, og at teksten kan læses. Gem billederne i `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/trin/<T1 eller T2>/`.
6. Skriv kort i animationens README (hvis den har en), at første mål på fanen er trinvist, og hvad der dukker op hvornår.

## Sproglige regler (Kemibogens)

- Kort, skarpt, letforståeligt. Ingen tankestreger, ingen indskudte sætninger, ingen påhængt ", og ...". Stort bogstav efter kolon, og undgå hellere kolon.
- C-animationer (sc): let, konkret sprog. Spørgsmålet skal kunne læses alene: Dæk indledningen til, og se, om spørgsmålet stadig giver mening.
- Molekylnavne: dioxygen, dihydrogen osv. Ladning ±1 skrives + og −, aldrig 1+. "fx" og "ca." må blive.
- Overhold animationens tegngrænser (står i toppen af `js/data.js` eller i selvtesten).

## Det må du ikke

- Rette i `faelles/`, `kemichael/`, `animationer/v2/` eller i andre animationer. Andre hjælpere arbejder samtidig i de andre mapper.
- Committe i git.

## Rapport

Svar til sidst kort (højst 250 ord): hvad du har bygget (trinene med spørgsmål og hvad der dukker op), hvad du gjorde anderledes end forslaget og hvorfor, sprognumrene du satte ind, selvtestens resultat, og stierne til skærmbillederne.
