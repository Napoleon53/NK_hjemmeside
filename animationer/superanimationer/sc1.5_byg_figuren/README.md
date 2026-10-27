# sc1.5 Byg figuren: fagord til kapitel 1

Ny 28. okt. 2026, bygget fra bunden. Ikke i menuen endnu (den får nr. 5 i
`samling_c1.html`, når brugeren siger til).

Brugeren bad om en sjette måde at træne fagord på ved siden af de fem på
Kemibogens fagordlister (Quiz: fem hurtige, Speedtalk, Krydsord, Kort og godt,
Quizlet). Af tre forslag valgte han "Byg figuren": "wauuv byg figuren er en vild
ide. Det kunne jeg godt tænke mig at se for kapitel c1. Begynd gerne at bygge den
som en superanimation".

## Bestillingen

1. **Pointen i én sætning.** Et fagord får mening, når det sidder på det, det
   betegner: eleven sætter ordet på figuren, den del af figuren bliver bygget, og
   forklaringen fra bogen står frem.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens figurer (atommodel,
   grundstofkort, isotoper, stofinddeling, periodesystem-metaller, chlor-skaller,
   reaktionsskema-vand, vand-formel), så eleven genkender dem.
3. **Naboerne.** `sc1.1_atombygger` ejer at bygge atomer og ioner, `sc1.2` navne og
   symboler, `sc1.4_afstemning` afstemningen. Her bygger eleven ikke selv, men
   sætter ord på. Fagordlisterne i bogen ejer de andre fem aktiviteter.
4. **Loftet.** Fire faner, én pr. afsnit (1.1 til 1.4), med én figur hver. Tre lag
   pr. figur med 2 til 5 fagord, og til sidst Mesterprøven med alle fagordene på
   én gang (9 til 12). Alle 41 fagord fra bogens fagordliste til kapitel 1 er med.
5. **Layoutet.** Scene plus panel. Kortet øverst midt i scenen har opgaven, bakken
   med fagord, beskeden, Giv et hint og Indsend svar. Figuren står på et lyst ark
   under kortet. Panelet har lagene, fagordene, der sidder på plads, og Byg forfra.

## Sådan virker den

- Et lag: pladserne til lagets fagord står gule i figuren, og det, de peger på, er
  tegnet stiplet. Eleven trækker ordene fra bakken op på pladserne (eller klikker
  på ordet og så på pladsen) og trykker **Indsend svar**. Et ord kan trækkes fra
  en plads til en anden; så bytter de.
- Rigtige ord bliver låst, og den del af figuren bliver bygget med en kort
  animation (protonerne tælles, skallerne fyldes, metallerne farves, pilen tegnes).
  Forkerte ord ryger tilbage i bakken, og beskeden forklarer den første fejl. Er
  fejlen typisk, står der en særlig tekst (`fejl` ved pladsen i `js/fig_*.js`);
  ellers står ordets forklaring fra bogen.
- Er laget løst, bliver kortet grønt med forklaringerne til lagets fagord (første
  sætning, som brikken i Kort og godt) og knappen Næste lag.
- Nogle lag har ét fagord i overskud (`ekstra`), fx nukleontal i laget med
  atomnummeret. Kortet siger det.
- Giv et hint viser forklaringen til ordet på én plads (den bliver orange); Vis
  svaret sætter ordet på. En stjerne pr. lag kræver rigtigt i første forsøg uden
  hint.
- Mesterprøven: hele figuren står der, men alle ordene er taget af. Bagefter
  konfetti, en stjerne på fanen, og næste fane kalder.
- Peger man på et ord, der sidder på plads (i figuren eller panelet), kommer hele
  forklaringen fra bogen frem.
- Ét og samme ord kan passe på to pladser: ædelgasreglen og oktetreglen er to navne
  for samme regel og peger begge på argons yderste skal.
- Lagene i panelet kan klikkes: de lag, der ligger før, bygges færdige.
- `index.html#atomet` (eller `#hvad`, `#skaller`, `#skema`, `#1.3`) åbner en fane.
  Tasterne 1 til 4 skifter fane, Enter er Indsend svar eller Næste.

## Filerne

| Fil | Indhold |
|:--|:--|
| `js/data.js` | forklaringerne (ordret fra `NK_Undervisning/Kemibogen/fagord/kapitel-1.qmd` 27. okt. 2026) og de fire faner |
| `js/motor.js` | en fane: pladser, bakke, træk og klik, Indsend svar, hjælp, kortet, panelet |
| `js/svg.js` | tegnehjælp: kugler med lys, tekst med sænkede tal, animationer |
| `js/ps.js` | det periodiske system med bogens inddeling og trappen |
| `js/fig_hvad.js`, `fig_atom.js`, `fig_skal.js`, `fig_skema.js` | figurerne, lagene, pladserne og fejlteksterne |
| `js/app.js` | fanerne, links og tastatur |
| `_selvtest.html` | åbnes direkte fra disken; ALT OK (841) 28. okt. 2026 |

**Rettes en forklaring i bogens fagordliste, skal den rettes i `js/data.js`.**
Selvtesten tjekker, at alle 41 fagord sidder på netop én plads, at pladserne ikke
overlapper og er inden for arket, at hvert lag og Mesterprøven kan løses, at et
forkert ord kommer tilbage i bakken, at hjælpen virker, og at teksterne er korte.

## Valg og forenklinger

- Figurerne er SVG og ikke canvas som i de andre superanimationer: ordene skal
  kunne trækkes hen på pladser, og figuren skal være skarp i alle størrelser. Der
  er ingen tegneløkke; når et lag er bygget, står alt stille.
- Alle pladser i en figur er lige brede, så længden ikke afslører ordet.
- Carbonatomet i 1.2 har 6 protoner, 6 neutroner og 6 elektroner; atommassen
  12,01 u. Elektronerne står på to ringe som i bogens atommodel.
- Rækkefølgen af lagene og hvilke ord der er i overskud, er Claudes valg.
- Ingen Kemichael, ingen rundvisning bag ? endnu, ingen teoriknap (forklaringerne
  kommer med hint, fejl og det grønne kort).

## Ikke lavet

- Udskrift af figuren som noteark (tom og med facit).
- De andre kapitler. Motoren kan bruges igen: en ny figur er en ny `fig_*.js`.
- Link fra fagordlisten i bogen.
