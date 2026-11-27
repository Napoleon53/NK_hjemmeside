# Kort og godt (sc_spil9_kemikort)

Flashcards til Kemi C i tre faner: træn kortene, og test dem i et vendespil og
en parring. Læreren og eleven kan skrive, hente og dele deres egne sæt.

**Pointen i én sætning:** det, man skal kunne udenad i kemi C, trænes kort for
kort, til man kan det, og testes så i to spil.

Spillet er nyt, ikke en afløser. Ingen gammel fil er flyttet til `arkiv/`.
Det hed Kemikortene til 3. oktober 2026. Mappen, `data-emne` og nøglerne i
browseren hedder stadig `kemikort`, så delte links og gemte sæt holder.

## De tre faner

| Fane | Hvad eleven gør |
|------|-----------------|
| **Træn** | Ser den ene side, gætter selv, vender kortet og svarer, om han kunne det. Et misset kort lægges tre pladser længere nede i bunken og kommer igen i den samme runde. Runden er slut, når alle kort er ude af bunken. |
| **Vendespil** | Hvert kort ligger som to brikker med bagsiden op. To brikker fra det samme kort er et par. 6, 8 eller 10 par. Tid og fejl tælles, og den hurtigste tid er rekorden. To brikker, der ikke passer, bliver liggende, til de kan være læst (se nedenfor). |
| **Parring** | Forsiderne står i venstre spalte med en tom plads ved siden af. Svarene ligger blandet til højre og trækkes over på den forside, de hører til. Sættet deles i runder på 4, 6 eller 8 par. Uret går, mens en runde er i gang, og hver fejl koster 5 sekunder (se Uret og Top 10 nedenfor). |

Retningen kan vendes i Træn (Symbol → Navn, Navn → Symbol eller blandet), så
eleven også øver den svære vej. Kort, eleven misser, står i panelet under
"Dem, der driller" med antallet af gange.

Ingen Kemichael. Al hjælp står i statuslinjen under scenen, som i
`sc1.4_afstemning`.

## De seks indbyggede sæt

| Nøgle | Sæt | Kort |
|-------|-----|------|
| `grundstoffer` | C1 Grundstoffer: symbol og navn | 33 |
| `ioner` | C2 Ioner: formel og navn | 31 |
| `molekyler` | C3 Molekyler og bindinger: fagord | 27 |
| `organisk` | C4 Organisk kemi: navne og grupper | 31 |
| `beregninger` | C5 og C6 Formler, størrelser og enheder | 25 |
| `syrebase-redox` | C7 og C8 Syre/base og redox: fagord | 27 |

174 kort i alt. Et sæt vælges også direkte i linket: `index.html#ioner`, og
fanen kan komme med: `index.html#ioner&parring`.

Tallene følger superanimationerne: R = 0,0831 L·bar/(mol·K) og Vₘ = ca. 24 L/mol
ved stuetemperatur som i `sc5.7_idealgasligningen`, og oxidationstal skrives med romertal som i
`sc8.3_oxidationstal`.

## Skarpe bagsider

Bagsiderne er skrevet om 3. oktober 2026, så hvert par er entydigt i vendespillet
(brugerens ønske: "flere af definitionerne er lidt uskarpe"). Reglerne:

* Forklaringen begynder med, hvad slags ting ordet er: `formel, hvor ...`,
  `binding, hvor ...`, `molekylform med ...`, `endelsen på ...`, `stoffet, der ...`.
  Så ved eleven, hvilken slags brik der skal findes.
* Hver bagside har ét kendetegn, ingen anden bagside i sættet har: et tal (180°,
  120°, 109,5°), et antal (ét, to, tre fælles elektronpar) eller et eksempel
  (som i CO₂, fx HCl).
* Et overordnet ord står som fællesnavn (`intermolekylær binding`: fællesnavn
  for de svage bindinger mellem molekyler), så det ikke kan forveksles med de
  ord, der hører under det.
* Bagsiden nævner ikke sin egen forside, og to bagsider må ikke sige det samme
  med andre ord. Derfor er `1 mol` (samme tal som Avogadros konstant),
  `pH i en stærk syre` og `halvreaktion` taget ud, og `C₄H₁₀` (to isomerer) er
  blevet til `C₃H₈`.
* Ordvalget følger de andre animationer: frit elektronpar, pyramide og
  tetraeder (`sc3.2`), London-kræfter (`sb4.4`), carboxylgruppe (`sc_spil4`),
  isomerer, Avogadros konstant.

## Brikker, der ikke passer

To brikker, der ikke passer, bliver liggende åbne, til eleven klikker på en ny
brik. Der er ingen nedtælling (brugerens ønske 20. oktober 2026: "helt undlade
den stressende følelse"). Før lå de 0,9 s og fra 3. oktober en læsetid efter
antallet af tegn med en rød streg, der løb ud.

## Uret og Top 10 i Parring (27. nov. 2026)

Niels ville have et retfærdigt ur i de spil, der ikke havde et, så flere spil
kan få en fælles liste i én opdatering af scriptet.

* **Uret** (`urKoerer`, `urTrin` i `js/parring.js`) går kun, mens en runde er
  i gang: fra det første træk (eller fra Start, se nedenfor), til runden er
  klaret. Mens Næste runde venter, står det stille, så eleven kan læse parrene;
  den næste runde bygges først, når eleven trykker. Uret går videre, hvis
  eleven skifter fane midt i en runde, ellers kunne svarene slås op i Træn.
* **Straf:** hver forkert parring lægger 5 s til tiden (`STRAF`), og
  statuslinjen siger "Det koster 5 sekunder." En runde med 6 par tager en
  øvet elev 10-15 s, så at gætte sig igennem (i snit 7-8 fejl pr. runde) koster
  mere end at tænke, mens et enkelt fejlgreb med musen ikke ødelægger tiden.
  Ingen tikkelyd.
* **Tiden** står i hele sekunder under spillet (1:23), så den ikke flimrer, og
  med tiendedele bagefter (1:23,4). Resultatet siger, hvor meget der var straf.
* **Rekorden** gemmes stadig i `nk-kemikort-rekord` pr. sæt og antal par, men
  under nye navne, `par4straf`, `par6straf` og `par8straf`. De gamle `par4`,
  `par6` og `par8` er sat uden straf (og med uret kørende mellem runderne) og
  kan ikke sammenlignes; en rekord, der er gættet igennem, ville ellers aldrig
  kunne slås. De gamle bliver liggende i browseren, men bruges ikke.
* **Top 10** er det fælles script (`.claude/highscore/highscore.gs`) med én
  liste pr. indbygget sæt, `spil9-grundstoffer`, `spil9-ioner`,
  `spil9-molekyler`, `spil9-organisk`, `spil9-beregninger` og
  `spil9-syrebase-redox`. Laveste tid vinder. Kun 6 par pr. runde (det er
  standarden, som næsten alle spiller) kommer på listen, så hvert sæt har én
  liste; én liste for alle sæt ville være uretfærdig, for sættene har 25-33
  kort og meget forskellig tekstlængde. Egne sæt kommer aldrig på en liste. Med
  4 eller 8 par i et indbygget sæt står der kun "Top 10 gælder 6 par pr. runde."
  på resultatet.
* **Startkortet:** når scriptet svarer med en liste, begynder et spil med 6 par
  i et indbygget sæt med et kort med Top 10 denne uge og Top 10 alle tider side
  om side og knappen **Start** (Enter). Brættet er usynligt, til eleven trykker,
  så den første runde ikke kan læses, før uret går. Resultatet har navnefeltet,
  **Sæt på listen** (Enter i feltet sender; bogstaver i feltet er ikke genveje)
  og de to lister. Navnet huskes i `nk-spil-navn` som i de andre spil.
* Spillet sender `{ spil, navn, point, niveau, sekunder }` med antallet af kort
  som `point` (så en senere rettelse af et sæt kan ses i regnearket) og 6 par
  som `niveau`.
* Svarer scriptet "ukendt spil", fordi den nye version ikke er lagt op, eller er
  der intet net, ser fanen ud som før (uden startkort og liste), og uret starter
  ved det første træk. Kommer svaret først, efter eleven er gået i gang, bliver
  brættet, og det spil kan ikke komme på listen.
* Listen hentes én gang, når siden åbnes med et indbygget sæt, ellers når et
  indbygget sæt eller 6 par vælges (højst én gang i minuttet), og ved
  resultatet.

## Egne sæt

Knappen **Mine sæt** åbner sættet som tekst. Formatet er Quizlets (brugerens
ønske 30. sept. 2026): ét kort pr. linje, **tabulator** mellem forside og bagside
og **linjeskift** mellem kortene. To linjer øverst kan undværes:

```
Sæt: C2 Ioner: formel og navn
Sider: Ion<TAB>Navn

Na⁺<TAB>natriumion
SO₄²⁻<TAB>sulfation
```

* **Fra Quizlet:** eksportér med Tab og Ny linje, kopiér og sæt ind i feltet. Uden
  `Sæt:` hedder sættet "Importeret sæt", og statuslinjen foreslår et navn.
* **Til Quizlet:** **Kopiér til Quizlet** og **Gem som fil** giver kun kortene i
  Quizlets format. Navn og overskrifter er ikke med, for Quizlet ville læse dem
  som kort. Filnavnet er sættets navn (uden tegn som `:`), og når filen hentes ind
  igen uden `Sæt:`, bliver filnavnet navnet. Overskrifterne fra `Sider:` følger
  ikke med gennem en fil; linket gør.
* Tab-tasten skriver et tabulatortegn i feltet (Skift+Tab flytter videre). En
  **lodret streg** eller et **semikolon** deler også, så en AI kan skrive
  `Na⁺ | natriumion` (chatvinduer laver tabulatorer om til mellemrum). Den første
  af de tre, linjen indeholder, er den, der deler.
* De indbyggede sæt er skrevet med ` | ` i `js/data.js`, så de er lette at læse,
  og laves om til tabulator, når filen indlæses.
* `Sæt:` giver navnet, `Sider:` giver de to overskrifter, `//` begynder en
  kommentar, og `[ ]` omkring en tekst fjernes, så skabelonen også virker. En
  navnelinje med tabulator i er et kort, ikke navnet.
* Store og små bogstaver er ikke det samme: `m` (masse) og `M` (molarmasse) må
  stå i samme sæt.
* Fejl vises med linjenummer, mens man skriver, og et klik på fejlen springer
  hen til linjen. Kortene vises til højre, som de kommer til at se ud.
* Knapperne: **Hent fil** (en .txt kan også trækkes ind i tekstfeltet),
  **Kopiér til Quizlet**, **Gem som fil**, **Kopiér link** (linket har hele sættet i sig, `#kort=...`;
  fra harddisken peger det på kemiformler.dk), **Kopiér vejledning til AI** og
  **Nyt sæt**.
* Et link med sættet i kan også vælge fanen: `index.html#kort=...&parring`.
  Fanen står efter sættet, delt af `&`, som i `#ioner&parring`.
* **Kemibogen åbner spillet sådan.** Knappen "Kort og godt" på bogens
  fagordlister (kilden er `NK_Undervisning/Kemibogen/stil/fagord.html`)
  laver et sæt af kapitlets fagord og åbner `#kort=...&parring` (brugerens
  valg 20. okt. 2026: parring er "den pædagogisk stærkeste"; fra 12. okt.
  åbnede den i vendespil). Bogen regner
  med 90 tegn pr. side, mindst 4 kort og linkets form. Ændres `MAKS_TEGN`,
  `MINDST`, `tilLink` eller `fraLink` i `js/tekstformat.js`, eller flyttes
  mappen, skal bogens `stil/fagord.html` og `vaerktoej/tjek_fagord.py` rettes
  med, og bogen lægges på hjemmesiden igen.
* Retter man i et indbygget sæt, bliver det gemt som et nyt, eget sæt. De
  indbyggede kan ikke slettes.
* Egne sæt og rekorder ligger i den browser, de er lavet i (`localStorage`),
  ikke på nettet. Rekorden hører til sættet og til antallet af par, og den
  nulstilles, hvis sættets tekst rettes.

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | ramme, de tre faner, reglerne, vinduet Kort som tekst og rundvisningen |
| `css/stil.css` | stilarket, samme grundregler som `sc_spil6_iontetris` |
| `js/kerne.js` | hjælpefunktioner: blanding, hukommelse i browseren, tid, kopiering, filer |
| `js/data.js` | de seks indbyggede sæt, skrevet i tekstformatet |
| `js/tekstformat.js` | læser og skriver formatet, fejl med linjenummer, AI-vejledning, link |
| `js/bibliotek.js` | sættene, det valgte sæt, egne sæt og rekorderne |
| `js/traen.js` | fane 1 |
| `js/vendespil.js` | fane 2 |
| `js/parring.js` | fane 3, træk med mus og finger, uret og straffen |
| `js/topliste.js` | Top 10 i Parring: henter og sender til det fælles script |
| `js/editor.js` | vinduet Kort som tekst |
| `js/rundvisning.js` | rundvisningen bag `?`, én tur pr. fane |
| `js/app.js` | fanerne, sætvælgeren, tastaturet og linket |
| `_selvtest.html` | udviklerværktøj, se nedenfor |

Mappen henter ingen filer uden for sig selv og bruger ingen moduler, så den
virker, når `index.html` åbnes direkte fra harddisken. Kun Top 10 i Parring
bruger `fetch` (`js/topliste.js`); uden net er listen bare væk.

## Forenklinger, valgt med vilje

* **Eleven bedømmer sig selv i Træn.** Der er ikke et skrivefelt, hvor svaret
  tjekkes. Et fagord kan skrives på flere måder, og en stavefejl må ikke tælle
  som en fejl i kemi. Vendespillet og parringen er den objektive test.
* **Bunken er én kasse, ikke fem.** Et misset kort kommer igen i den samme runde
  i stedet for at blive fordelt på intervaller over flere dage. Spillet skal
  kunne bruges i en enkelt lektion.
* **Ingen ens bagsider i et sæt.** Ellers ville et par i vendespillet have to
  rigtige svar. Selvtesten kontrollerer det.
* **Skriftstørrelsen følger tekstens længde** (`NK.tekstklasse`), så en lang
  forklaring også kan stå på en brik. Ingen tekst kommer under 13 px.

## Rettelser

* Nye kort i et indbygget sæt skrives i `js/data.js` i tekstformatet. Kør
  `_selvtest.html` bagefter: den kontrollerer længder, dubletter, tankestreger
  og ladninger, og at ingen bagside nævner sin egen forside. Følg reglerne under
  Skarpe bagsider.
* Nye adskillere eller felter i formatet rettes ét sted, `js/tekstformat.js`.
  Både spillet, vinduet og selvtesten bruger den samme læser.
* Skal et spil have en ny sværhedsgrad, rettes knapperne i `index.html` og
  `saetStoerrelse` i spillets fil. Rekorden får automatisk sin egen nøgle.

## Selvtest

`_selvtest.html` åbner `index.html` i en iframe og kontrollerer de seks sæt
(længder, dubletter, sprog, faglige stikprøver), tekstformatet, biblioteket,
en hel runde i hver af de tre faner, rekorderne og skriftstørrelserne. Afsnit
10 prøver uret, straffen, startkortet og Top 10 med en falsk `fetch`; testen
sætter `NK.ingenNet` og sender aldrig noget ud. Den lægger elevens egne sæt,
rekorder og navn tilbage bagefter. Slutlinjen er
"ALT OK" eller "N FEJL".

## I menuen

`animationer/kemi-c-filer/samling_c_spil.html` som spil nr. 9 (30. september
2026) og i `FEEDBACK_EMNER` i `animationer/samling_alt.html` under Spil.
