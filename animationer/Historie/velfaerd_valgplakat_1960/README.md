# Kildeanalyse af en valgplakat

Historie, forløbet om velfærdsstaten. Hører til kapitel 8-alternativ, del 1, hvor
Socialdemokratiets fire valgplakater fra 1960 er vist, og til modul 1 i
modulplanen for 1950-1970 (plakaterne på skærmen). Quizzen bruger den ene af de
fire: „Tryghed i beskæftigelsen“.

Adresse: `kemiformler.dk/animationer/Historie/velfaerd_valgplakat_1960/`.

**I menuen:** nr. 3 i undersamlingen 2.3b Velfærdsstaten (`data-emne` 2.3b.3,
`samling_2.3b_velfaerdsstaten.html`), sat ind 6. okt. 2026 efter brugerens besked.

## Forlægget

Quizzen er lavet efter VUC Digitals øvelse
`vucdigital.dk/histB_kildeanalyse/kildeanalyse_2.html`: plakaten i den ene side,
ni hv-spørgsmål ét ad gangen, og hvert rigtigt svar lægger et stykke til elevens
kildeanalyse. Brugeren bad om en helt tilsvarende quiz, lidt mere pædagogisk og
pænere sat op. Plakaten er hentet derfra (492 x 676) og er fra
Arbejderbevægelsens Bibliotek og Arkiv. Spørgsmål, svar og analysens sætninger
er skrevet på ny.

Det, der er anderledes end forlægget:

- Svarene står som knapper, så alle kan læses på én gang, i stedet for i en rulleliste.
- Et forkert svar får en kort grund og et sted at kigge, i stedet for kun „Forkert“.
- En gul ramme på plakaten viser, hvor svaret kan ses. Den kommer først, når
  eleven har svaret. Ved spørgsmålet om tid lyser kildehenvisningen i stedet.
- Hvert spørgsmål har sit fagord (Afsender, Modtager, Tid, Emne, Budskab,
  Virkemidler, Formål, Situation, Brug). De ni står samlet på slutbilledet.
- Hvert svar bliver til en hel sætning. Eleven går selv videre med knappen.
- Tre eller fire svar pr. spørgsmål i stedet for fem, i blandet rækkefølge.
- Det sidste spørgsmål siger også, hvad plakaten ikke kan bruges til.
- Til slut kan analysen kopieres til elevens noter.

## Filerne

- `js/data.js`: plakaten, stederne til den gule ramme (procent af billedet), de ni
  spørgsmål og alle tekster. Ret tekster her.
- `js/quiz.js`: forløbet, tastaturet og opstarten.
- `css/stil.css`: samme farver, knapper og statuslinje som de to andre i 2.3b.
  Plakatens højde regnes ud fra vinduet (`--plakat-h`), så den altid kan ses hel.
- `_selvtest.html`: teksterne, forløbet, roen og skriften. Kræver en lokal server.

## Valg

- Der er intet panel og ingen lærer. Statuslinjen står lige under svarene og har
  plads til tre linjer, så arket nedenunder står stille, mens eleven svarer.
  Begrundelsen ved det rigtige svar skal derfor være kort (selvtesten måler det
  ved 883 x 620, hvor knappen står ved siden af teksten).
- Arket tager den plads, der er tilbage, og ruller selv til den nyeste sætning.
- Resultatet tæller kun, hvor mange spørgsmål der var rigtige i første forsøg.
- Ingen genvej til forfra under quizzen. Knappen Forfra kommer først til slut.

## Test

Selvtesten: ALT OK, 1312 påstande (6. okt. 2026), ved 883 x 620, 1280 x 620,
1366 x 768 og 1600 x 900. Skærmbilleder er set i de samme størrelser, i et smalt
vindue (600 px) og gennem `samling_alt_historie.html?emne=2.3b.3`.
