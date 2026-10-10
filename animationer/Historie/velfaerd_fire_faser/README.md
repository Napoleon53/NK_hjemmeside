# Velfærdsstatens fire faser

Historie, forløbet om velfærdsstaten. Animationen er lærerens skema over
velfærdsstatens udvikling (kapitlet Overblik i forløbets bog) lavet om, så eleven
udfylder det ét felt ad gangen. Indholdet følger den udfyldte udgave, guldarket
(`tekster/_guldark-udfyldt.qmd` i klassemappen 3a HI, 7 Velfærdsstaten).

Adresse: `kemiformler.dk/animationer/Historie/velfaerd_fire_faser/`.
`index.html#1` til `#4` går lige til en fase. `index.html#facit` viser hele det
udfyldte skema og er til tavlen; det rører ikke elevens eget skema.

**I menuen:** nej. Lavet 6. okt. 2026. Den næste ledige plads i undersamlingen
2.3b Velfærdsstaten er nr. 4 (`data-emne` 2.3b.4).

## Bestillingen

1. **Pointen i én sætning.** Velfærdsstaten bygges i fire faser, og i hver fase
   hænger tiltagene sammen med samfundet og den politiske situation, hvilket de
   tre grundforklaringer kan forklare.
2. **Hvad den afløser.** Ingenting på hjemmesiden. Den er papirskemaet som
   animation. Brugerens krav: eleven må ikke få hele skemaet på én gang, hvert
   felt skal arbejdes igennem kolonne for kolonne, eleven skal på banen og gerne
   skrive centrale nøgleord, og det må ikke kunne klares på få minutter. Det
   samlede skema må gerne ses til sidst.
3. **Naboerne.** `velfaerd_fra_land_til_by/` ejer erhvervsfordelingen 1940-1989,
   `velfaerd_finansminister/` den økonomiske politik 1956-1963 og
   `velfaerd_valgplakat_1960/` kildeanalysen. Her står kun skemaets nøgleord.
4. **Loftet.** 4 faser, 16 felter, 55 opgaver (15, 13, 13 og 14). Tre slags
   opgaver. Ingen faner.
5. **Layoutet.** Intet panel. Opgaven til venstre og feltet i skemaet til højre.

## Forløbet

0. **Start.** De fire faser på en tidslinje. Den første fase, der ikke er
   udfyldt, er markeret, men eleven kan vælge frit. Så kan læreren tage én fase
   pr. modul.
1. **Feltet.** Fasens fire felter kommer i skemaets rækkefølge: Velfærdstiltag,
   Samfundet, Den politiske situation, Kobling til grundforklaringer. Hvert felt
   har tre eller fire opgaver, og hver løst opgave lægger en linje i feltet.
   Eleven trykker selv Næste.
2. **Fasen samlet.** Når de fire felter er udfyldt, ses fasens kolonne samlet.
3. **Hele skemaet.** Når alle fire faser er udfyldt, ses hele skemaet. Det kan
   kopieres som tabel til Word og OneNote. Knappen Se dit skema på startbilledet
   viser de faser, der er færdige.

De tre slags opgaver:

- **Skriv ordet** (23 opgaver). En sætning med et hul. Små stavefejl tåles, og
  så står der, hvordan ordet staves. Knappen ved feltet er en trappe: Giv hint,
  Et hint mere (bogstav og længde), Vis svaret. Et svar, der er tæt på
  (retsprincip i stedet for skønsprincip), får sin egen forklaring.
- **Vælg et svar** (20 opgaver). De forkerte svar er fejl, elever laver, tit en
  ordning eller et parti fra en anden fase. Et forkert svar bliver streget og
  får en grund og et skub videre.
- **Grundforklaringen** (12 opgaver, det fjerde felt i hver fase). Et udsagn
  skal kobles til Funktionalistisk, Konfliktteoretisk eller Politisk-ideologisk,
  altid i den rækkefølge. I fase 1, 3 og 4 spørger sidste opgave, hvilken
  forklaring der står svagest (stregen i guldarket).

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | Siden og fagordene |
| `css/stil.css` | Udseendet. Samme farver, knapper og statuslinje som de andre i 2.3b |
| `js/data.js` | Faserne, felterne, opgaverne og alle tekster |
| `js/svar.js` | Bedømmer det ord, eleven skriver (stavefejl, varianter) |
| `js/forloeb.js` | Forløbet, skemaet, det gemte skema, tastaturet og opstarten |
| `js/kerne.js` | Små hjælpefunktioner |
| `_selvtest.html` | Udviklerværktøj, kræver en lokal server |

## Det, man kan rette

Alt, eleven læser, står i `js/data.js`. Hver opgave har teksten til feltet
(`fed` og `linje`); det er den, der ender i skemaet. Ved et ord, der skal
skrives, står de godtagne varianter i `godtag` og de næsten rigtige svar med
hver sin forklaring i `naesten`.

Længderne tjekkes af selvtesten: en sætning med hul højst 125 tegn, et svar på
en knap 85, en grund til et forkert svar 125, en begrundelse 90 og en linje til
feltet 130. En linje i et felt må ikke røbe et ord, eleven skal skrive senere i
samme felt.

Fagordene bag knappen forklarer kun det, opgaverne forudsætter (de tre
grundforklaringer og de tre slags erhverv), ikke de ord, eleven skal skrive.

## Valg

- **Skemaets rækkefølge.** Felterne kommer i skemaets rækkefølge, så animationen
  og papirskemaet passer sammen, og grundforklaringerne kommer sidst.
- **Ét trin ad gangen.** Startbilledet har kun faserne. I feltet er kun én
  opgave fremme. Det hele skema ses først til sidst.
- **Roligt ark.** Feltets linjer har deres plads fra start (teksten er usynlig,
  til opgaven er løst), og hullet i sætningen har ordets bredde fra start. Intet
  flytter sig, mens eleven svarer.
- **Hjælpen står ved feltet.** Tjek og Giv hint står på linje med skrivefeltet,
  og statuslinjen står lige under. Der er ingen lærer og ingen rundvisning.
- **Første forsøg.** En opgave tæller som rigtig i første forsøg, når der ikke
  er svaret forkert og svaret ikke er vist. Hint koster ikke noget. Et forkert
  svar huskes, også hvis eleven går ud af fasen og ind igen.
- **Skemaet gemmes** i browseren (localStorage), så det kan laves over flere
  moduler på samme computer. Lav fasen igen og Forfra skal trykkes to gange.
- **Tolerancen.** Ingen stavefejl i ord på op til 4 bogstaver, én i ord på 5-7
  og to i længere ord. Jordskælvsvalget godtages for jordskredsvalget og
  servicesamfund for informationssamfund (lærebogen bruger det ene, skemaet det
  andet).

## Forholdet til guldarket

Lagt til, fordi en opgave har brug for det:

- Årstal på de første love (1891, 1892, 1898, 1907) og på folkepensionen (1957).
- Systemskiftet 1901 som ord (guldarket: Højre-regeringer til 1901).
- Krakket i Wall Street 1929 og tallet 43,5 % ledige i januar 1933.
- Højkonjunktur 1958-1973 i feltet Samfundet i tredje fase.
- Lavkonjunktur og arbejdsløshed over 10 % efter oliekrisen.
- Folketinget fra 5 til 10 partier i 1973 (guldarket: 3 helt nye partier).
- Schlüters navn ved de borgerlige regeringer 1982-1993.

Udeladt for at holde linjerne korte: underpunkterne under offentlig forsorg
(særhjælp, kommunehjælp, fattighjælp), „på vej mod den universelle model“ ved
retsprincippet og „offentlige og private“ ved de tertiære erhverv i tredje fase.
Kanslergadeforliget står kun i feltet Den politiske situation, fordi eleven
skal skrive ordet dér.

## Kilder

Guldarket og skemaet i klassemappen. Tal og årstal er fra Peter Schroeder: Det
20. århundredes Danmarkshistorie (2007), s. 72-76 (krisen, Kanslergadeforliget,
socialreformen), s. 109-129 (højkonjunktur, folkepension, kvinderne) og
s. 155-163 (oliekrisen, jordskredsvalget, Schlüter). De tre grundforklaringer
følger teksten „Tre grundforklaringer og to velfærdsmodeller“ i klassemappen.
Hvilke ord der skal skrives, er valgt efter lærerens prøve til guldarket.

Det, der går ud over de læste tekster, er slået op 6. okt. 2026 i Lex
(lex.dk) og Danmarkshistorien (danmarkshistorien.lex.dk):

- Lovene 1891, 1892, 1898 og 1907, socialreformens fire love, at tabet af
  borgerlige rettigheder først forsvandt helt i 1961, og folkepensionsloven
  1956: artiklen „Danmark - social sikring“.
- Estrup 1875-1894, Stauning 1924-1926 og 1929-1942, de socialdemokratiske
  regeringer 1953-1968 og fra 1971, VKR-regeringen 1968-1971, Schlüter
  1982-1993: artiklerne om personerne og partierne.
- SF stiftet 1959 og i Folketinget fra 1960, Fremskridtspartiet stiftet 1972,
  28 mandater i 1973 og aldrig i regering, Dansk Folkeparti 1995, efterlønnen
  1979, Radikale Venstre som husmændenes parti: artiklerne om partierne og
  efterlønnen.
- Det Konservative Folkeparti står som stiftet i 1916 i Lex og i 1915 andre
  steder. Derfor siger animationen kun „under Første Verdenskrig“.

## Test

Selvtesten: ALT OK, 6964 påstande (6. okt. 2026). Den tjekker teksterne,
ordbedømmelsen, hele forløbet med klik og tastatur, det gemte skema og ankrene,
og at intet flytter sig eller skal rulles ved 883 x 620 (samlingens vindue på
en bærbar), 1280 x 620, 1366 x 768 og 1600 x 900. Én fase kan ses samlet uden
at rulle i alle fire størrelser; hele skemaet ruller i papiret. Ingen læsbar
tekst er under 12,4 px.

Desuden prøvet med rigtig mus og rigtigt tastatur (Enter tjekker ordet og går ét
skridt videre ad gangen, tal vælger svar, bogstaver i skrivefeltet åbner ikke
fagordene) og åbnet direkte fra harddisken, hvor skemaet også gemmes.

## Linjen til menuen

Velfærdsstatens fire faser: Udfyld skemaet over velfærdsstatens udvikling, ét
felt ad gangen. Skriv nøgleordene, vælg svar, og kobl hver fase til de tre
grundforklaringer.
