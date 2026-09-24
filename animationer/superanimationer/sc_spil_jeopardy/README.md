# sc_spil_jeopardy: Kemi-Jeopardy

Et Jeopardy-spil til tavlen. Klassen spiller i hold, læreren styrer, og spillet
holder styr på brættet, pointene og tiden. Hører til kategorien Spil
(`kemi-c-filer/samling_c_spil.html`).

## Bestillingen

1. **Pointen i én sætning.** Klassen repeterer et forløb som hold i et
   Jeopardy-spil på tavlen, og læreren skal kun læse op og give point.
2. **Hvad den afløser.** PowerPoint-skabelonen (Rusnak Creative) i
   `Afsluttende jeopardy til Kemi B 2x.pptm` og `Jeopardy til 2g B -niveau afslut.pptm`
   i NK_Undervisning_tungt. Med er: brættet med 6 kategorier og 5 beløb,
   kategorierne vist én ad gangen, felterne der zoomer op, ledetråd og svar,
   + og − under hvert hold, Daily Double med indsats, Final med indsatser og
   tænketid, uret og de seks lyde. Makroerne, indstillingssiderne og
   Excel-importen er ikke med: quizzen er data i `js/data.js`.
3. **Naboerne.** Kemi-Millionær (`c_spil_million.html`) ejer quizzen med
   svarmuligheder og jokere. Her er der ingen svarmuligheder: holdene svarer
   selv, og læreren dømmer.
4. **Loftet.** Én quiz pr. niveau (C og B), én runde med 6 × 5 felter, én Daily
   Double, én Final, op til 6 hold og 6 lyde. Ingen faner: én skærm, der skifter mellem titel,
   bræt, felt og Final.
5. **Layoutet.** Toplinje, scenen med brættet mellem to lyssøjler, og podierne
   med holdene nederst som panel.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, scene, podier, reglerne og rundvisningen |
| `css/stil.css` | alt udseende |
| `js/kerne.js` | fælles hjælpere (som i sc2.4) |
| `js/data.js` | **de to quizzer** og Kemichaels replikker |
| `js/spil.js` | reglerne og pointene, uden tegning |
| `js/tekstformat.js` | quizzen som tekst: eksport, upload, kontrol og AI-vejledningen |
| `js/lyd.js` | de originale lyde, hvis de findes, ellers spillets egne |
| `js/visning.js` | brættet, kortet, plakaten og podierne |
| `js/sprites.js` | lager til Kemichaels sprites |
| `js/laerer.js` | Kemichael præsenterer spillet |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | forløbet, knapperne og tastaturet |
| `sprites/` | lyssøjlen, titlen, Final-titlen og stjernehimlen |

## Niveauerne

Linket vælger quizzen. `index.html` giver **Kemi C, 1.g** (emnerne C1 til C6 på
hjemmesiden: atomer, ionforbindelser, molekyler, mængdeberegning, koncentration
og organisk kemi). `index.html#b` giver **Kemi B, afslutning**. Hvert niveau har
sit eget gemte spil.

## Egne spørgsmål

Knappen Egne spørgsmål på titelskærmen åbner et vindue med quizzen som tekst.
Man kan skrive i det, uploade en tekstfil, eksportere teksten og kopiere en
vejledning, som en AI kan få sammen med lærerens egne emner. En egen quiz gemmes
kun i browseren og kun til det niveau, linket viser. Standardquiz og Brug quizzen
fjerner den igen. Formatet (`js/tekstformat.js`):

```
Titel: Kemi C, 1.g
Beløb: 100, 200, 300, 400, 500

Atomer:
Den positivt ladede partikel i atomkernen ; Hvad er en proton?

Final: Det periodiske system
Russeren, der i 1869 ordnede grundstofferne ; Hvem er Mendelejev?
```

Et emne er en linje, der slutter med kolon, og hver ledetråd står med sit svar på
én linje, delt af semikolon. `[ ]` omkring teksten og `##`-overskrifter virker
også. Højst 6 emner og 6 beløb; hvert emne skal have lige så mange ledetråde,
som der er beløb. HTML vises som tekst, bortset fra `<sub>` og `<sup>`.

## Quizzen til B

Spørgsmålene er fra de to PowerPoint-filer. De er samme quiz; 2g-filen er den
nyeste og har rettelser, som er taget med:

* Organisk kemi 300 spurgte om det samme som 500. Den handler nu om Tollens' prøve.
* Ligevægte 100 spurgte om det samme som Syre-base 400. Den handler nu om enheden M⁻².
* Ligevægte 200: reaktionsbrøken, ikke ligevægtsbrøken.
* Mængdeberegning 200 handler om ε i Lambert-Beers lov (2g), ikke idealgasligningen (2x).

Stavefejl og dobbelte ord er rettet (Reaktionstyper, fortyndingsformlen,
"Hvad er Hvad er"). Svarene er skrevet ens: *Hvad er …?* og *Hvem er …?*

**Final er tilføjet** (Le Chatelier), fordi begge filer kun havde skabelonens
pladsholder. Ret den i `js/data.js`, hvis den ikke passer. Hele C-quizzen er
skrevet af Claude i september 2026 og bør læses igennem af en lærer.

Daily Double lægges tilfældigt i række 3 til 5 ved hvert nyt spil. Skal den stå
fast, sættes `dobbelt: [[kategori, række]]` på runden (tælles fra 0).

En ny quiz: kopiér `D.QUIZ`, giv den et nyt `id`, og skift teksterne ud. Der kan
være flere runder; runde 2 får så sine egne `vaerdier`.

## Lydene

Lydene er tv-programmets og ligger derfor ikke her. De ligger i
`C:\NK_Undervisning\Jeopardy-lyde\` (det private repo) og hentes kun, når spillet
åbnes fra harddisken. På kemiformler.dk spiller spillet sine egne lyde, som er
lavet i koden (`js/lyd.js`, `SYNTESE`). Opsætningen på titelskærmen viser, hvilke
lyde der bruges.

## Forenklinger

* Ingen summer. Holdene rækker hånden op, og læreren trykker + eller −.
* Et felt er brugt, så snart det er åbnet, som i skabelonen. Et dobbeltklik
  åbner det igen, fx for at rette point.
* Daily Double: holdet må satse sine egne point eller op til rundens største
  beløb, hvis det har færre. Final: kun hold med over 0 kr. deltager.
* Kemichael har intet baggrundsliv her, så han aldrig går hen over en ledetråd.

## Menuen

Ikke i menuen endnu. Når brugeren siger til: en knap i
`kemi-c-filer/samling_c_spil.html` med `data-emne="spil.jeopardy"`, der peger på
`../superanimationer/sc_spil_jeopardy/index.html` (C), og en knap et sted i
B-menuen, der peger på `index.html#b`. Der er ingen spil-samling på B endnu. Tilføj
en linje i `FEEDBACK_EMNER`, og ret kolonnen "I menuen" i `../README.md`.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".
