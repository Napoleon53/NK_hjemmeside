# T1, runde 3: sc5.7 uden panel, opgaverne i en række øverst, og zoomfejlen ved gas

Niels har prøvet runde 2 (21. nov. 2026):

> Idealgasligningen er bedre. Jeg kan egentlig godt lide at panelet måske helt falder bort, men jeg synes det ville være rart, hvis man kunne klikke tilbage til tidligere delopgaver (det kan man).. og herunder lige kort se hvad temaet var i hver delopgave (hvad tænker du om det?)
>
> Jeg synes der var et slags bug, da jeg lukkede gas ind.. Det var som om animationen blev zoomet ud hver gang jeg gjorde det

Koordinatoren svarede ham, at panelet fjernes helt på begge faner, og at opgaverne står i en smal række øverst i scenen med nummer og et kort tema. Det bygges nu.

## 1. Zoomfejlen (først)

Når eleven lukker gas ind, zoomer scenen ud hver gang. Find årsagen (sandsynligvis bliver skalaen regnet ud fra cylinderens indhold eller stemplets højde, eller noget i scenen ændrer størrelse). Scenens skala skal ligge fast under hele fanen (eller i det mindste under hele en opgave), uanset gas, lodder, temperatur og lås. Den må kun ændre sig, når vinduet ændrer størrelse. Tilføj en påstand i selvtesten: Skalaen og cylinderens placering er de samme før og efter 4 × gas ind, 3 lodder på, opvarmning og lås.

## 2. Panelet forsvinder, opgaverne står i en række øverst i scenen

- Panelet fjernes på begge faner. Scenen får hele bredden.
- Øverst i scenen, lige under topbjælken med fanerne og over kortet, står en smal række med opgaverne:
  - Fane 1: Hver af de 7 opgaver er en lille knap med nummer og et tema på to-tre ord (fx "1 Varmere gas", "2 Et lod på", "3 Mere gas", "4 Låst stempel" osv.; skriv temaerne ud fra målene, kort og konkret, sproget som Kemibogen). Den aktive opgave er fremhævet, de løste har en stjerne (som i dag), og et klik går til opgaven (som i dag). Til sidst i rækken står "↺ Start forfra" som en stille knap, langt fra kortets Næste-knap (regel i CLAUDE.md: Start forfra står aldrig samme sted som Næste).
  - Fane 2: Let, Middel og Svær som tre små faner i rækken, derefter opgaverne på niveauet med nummer og navn (fx "1 Gas i et stempel"), og til sidst "⟳ Nye tal".
  - Rækken er rolig: lille skrift (mindst 13,5 px), dæmpede farver, ingen versaler. Den må ikke konkurrere med kortet.
  - På smalle skærme (fx under 1200 px) viser rækken kun numrene, og temaet står som værktøjstip og i kortets etiket ("Opgave 3 af 7 · Mere gas").
- Kortet står stadig øverst i midten under rækken. Scenen må ikke hoppe, når man skifter opgave.
- Rundvisningen (?) og Teori skal stadig virke. Ret rundvisningens trin, der pegede på panelet.
- Fuld skærm og samlingssiderne: Animationen vises i menuen (`samling_*.html`) i en ramme. Tjek, at den ser rigtig ud både alene (`index.html?alene`) og i rammen i fx 1100 × 620.

## Det samme som før

Følg `opgave_trin.md` (regler, selvtest uden lempede grænser, ret kun i sc5.7, ingen commit, README). Selvtesten skal dække: intet panel, rækken findes på begge faner med 7 og 4 opgaver, et klik i rækken går til opgaven, stjernerne følger de løste, Start forfra og Nye tal virker fra rækken, rækken overlapper hverken kortet eller scenen fra 1100 × 620 til 1600 × 950, og skalaen ligger fast ved gas ind.

Skærmbilleder af fane 1 (start, efter 2 løste opgaver, opgave 3 med gas ind før og efter 4 klik) og fane 2 (Let og Svær) i `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/trin/T1c/`, 1400 × 860 og 1100 × 620. Se dem selv, før du melder færdig.

Rapport højst 200 ord.
