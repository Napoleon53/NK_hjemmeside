# sc4.10 Afrunding og opskrivning

Superanimation om betydende cifre: hvor præcist et tal er kendt, hvordan det
afrundes, og hvordan kommaet flyttes med tierpotenser og enheder. Åbn
`index.html`. Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`). Ingen
`fetch` og ingen moduler, så den virker fra harddisken.

Den afløser `animationer/kemi-c-filer/c4.10_quiz_betydendecifre_notation.html`
("Afrunding/opskrivning"). I menuen fra 26. sept. 2026.

## Bestillingen

1. **Pointen:** antallet af betydende cifre viser, hvor præcist et tal er
   kendt. Man afrunder til det, man ved, og når kommaet flyttes med en
   tierpotens eller en enhed, er cifrene de samme.
2. **Afløser c4.10.** Brugeren: "Den er i forvejen ret god, og undgå at sætte
   alt for meget grafik ind, men gør den alligevel mere indbydende." Med fra
   den gamle: de fem opgavetyper (optælling, afrunding, notation begge veje,
   regneregler og mL/L/µL) og de blandede opgaver, ti opgaver i en runde med
   resultatet til sidst, de samme tal og grænser (se nedenfor), feltet til
   eksponenten, målerbjælken med antallet af cifre (nu prikker), at eleven
   selv kan rette et forkert svar, hintet til hver regel, tusindtal fra fem
   cifre, facit uden ubetydende nuller ved enheder og facit i videnskabelig
   notation, når et almindeligt tal ville få for mange cifre. Ud:
   neongitteret, partiklerne, skiltet KORREKT midt på skærmen og tastaturet
   på skærmen (se Forenklinger).
3. **Naboerne:** `sc4.1` til `sc4.5`, `c4.3` og `sb1.4` regner med betydende
   cifre i deres svar og henviser hertil. Her regnes der ikke på kemi, kun på
   tallene. Addition og subtraktion (reglen om decimaler) var ikke med i den
   gamle og er det heller ikke her.
4. **Loftet:** 4 faner, én opgave ad gangen med ét tal eller to faktorer,
   højst 7 tegn i et tal, der skal afrundes, 10 opgaver i en runde, de fem
   typer fra den gamle og ét sprite (katederet fra sc4.5).
5. **Layoutet:** scene plus panel. Scenen er ternet papir med spørgsmålet,
   tavlen med cifrene som brikker, svarfeltet og linjen under det, og nederst
   Kemichaels bånd. Panelet har opgavekortet (runden som ti streger, én knap)
   og listen over rundens opgaver med facit.

Brugerens valg (25. sept. 2026): fanerne Tæl cifrene, Afrund, Flyt kommaet og
Blandet, og den rolige Kemichael ved katederet som i `sc4.5`. Efter første
udgave samme dag: Flyt kommaet før Afrund (afrunding kræver somme tider
videnskabelig notation), den uskrevne regel om tal mellem 0,01 og 100 (se
nedenfor) og flere enhedsomregninger. Loftet for enheder er derfor fem slags
mængder med i alt 20 enheder, alle med forstavelser, så kommaet flyttes.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Tæl cifrene | klikker på de cifre i tallet, der er betydende | kun nullerne foran tæller ikke |
| 2 | Flyt kommaet | skriver et tal i videnskabelig notation eller som almindeligt tal, eller omregner enheder (volumen, masse, stofmængde, koncentration og tryk) | eksponenten og forstavelsen er antallet af pladser; cifrene ændres ikke |
| 3 | Afrund | afrunder et måletal til et antal cifre, eller regner et regnestykke ud og afrunder | 5 og derover rundes op; det mindst præcise tal bestemmer |
| 4 | Blandet | ti opgaver af alle fem typer | kun første forsøg tæller; rekorden huskes |

**Tavlen.** Tallet står som brikker, ét ciffer pr. brik, og kommaet står for
sig i gult. På Tæl cifrene er brikkerne svaret: et klik vælger og fravælger,
og under tavlen står, hvor mange der er valgt. På de andre faner kan man
markere cifrene for at tælle dem; det tjekkes ikke. Når en opgave er løst,
viser tavlen hvorfor:

* Tæl: de betydende cifre bliver grønne, resten blegner.
* Afrund: de cifre, der bliver, er grønne, det ciffer, der afgør afrundingen,
  har en gul ring, og resten blegner. Under tavlen står facit (≈ 12,5).
* Regnestykker: under hver faktor står antallet af cifre (som i den gamle),
  og bagefter "Lommeregneren: 2,4 ≈ 2".
* Notation og enheder: kommaet hopper plads for plads, hvor det skal hen, og
  eksponenten tæller med. Mangler der cifre, fyldes nuller på med en stiplet
  kant, og nuller foran, som kommaet er gået forbi, falder væk. Til sidst
  står facit.

**Svarfeltet.** Tallet skrives med komma (punktum er også komma). Eksponenten
skrives i det lille felt ved 10-tallet; `e`, `^`, `*` eller `x` i tallet
springer derover, og ± skifter fortegnet. `4,56e3` og `4,56*10^3` forstås
også. På Afrund står 10-feltet der altid, også når facit ikke skal have en
tierpotens, så feltet ikke afslører svaret. Under feltet viser prikkerne,
hvor mange betydende cifre ens eget tal har, og hvor mange der skal være
(røde, når der er for mange). Ved regnestykker står kun ens eget antal, for
antallet er en del af svaret.

**Runden.** Ti opgaver. Grøn er rigtigt i første forsøg uden hint, gul er
rigtigt efter et hint eller et forkert svar, og rød er Vis svaret. Tallet
"rigtige i første forsøg" er de grønne, som i den gamle, hvor kun første svar
talte. Listen i panelet viser rundens opgaver med facit. Afrund har knapperne
Måletal og Regnestykker, og Flyt kommaet har Videnskabelig notation og
Enheder; et skift starter en ny runde og huskes i browseren.

## Reglen og tallene

Alle cifre er betydende, undtagen nullerne foran det første ciffer, der ikke
er nul. Nuller til sidst tæller også, i et helt tal som efter kommaet: 4500 har
fire. Det er reglen fra den gamle (`countSigFigs`). Skal nullerne i et helt tal
ikke tælle, skrives tallet i videnskabelig notation, og derfor er facit
`4,6 · 10⁴`, når 45 678 afrundes til to cifre.

**Den uskrevne regel** (brugerens ønske): tal mellem 0,01 og 100 skrives som
almindelige tal. Den står i teorien under Videnskabelig notation, men ingen
opgave lægger op til at bryde den: der bliver aldrig bedt om videnskabelig
notation for et tal i det område, og en afrunding, hvis facit kun kunne
skrives med 10-tallet i området (67 med ét ciffer er 7 · 10¹), springes over.
Skriver eleven alligevel 1,25 · 10¹ for 12,5, er det rigtigt, med en note om,
at man normalt skriver 12,5 (`C.iOmraade` og slutningen af `C.tjek`).

Tallene laves som i den gamle (`js/cifre.js`, `lav`):

* Optælling: 0,00-tal med 1 til 3 nuller foran, hele tal med 1 til 3 nuller
  til sidst og kommatal op til 500. Nyt: rundens første opgave har altid
  nuller foran.
* Afrunding: 1 til 4 betydende cifre, 1 højst én gang pr. runde, hele tal op
  til 900 000 eller kommatal op til 500, højst 7 tegn. Nyt: tallet har altid
  flere cifre end der skal afrundes til, og facit bryder ikke den uskrevne
  regel (den gamle sprang kun 1 · 10¹ over).
* Regneregler: parrene fra den gamle (2 · 3, 1,5 · 2, 4 · 0,5 osv.), hver
  faktor med 1 til 3 betydende cifre. Nyt: division (produktet delt med den
  ene faktor, ca. 40 %), og et facit, der kun kan skrives som tierpotens,
  springes over.
* Notation: 40 % små tal, ellers 10² til 10⁶, 1 til 4 betydende cifre,
  halvdelen hver vej. Til almindeligt tal er de små tal 10⁻² til 10⁻⁴ som i
  den gamle; til videnskabelig notation 10⁻³ til 10⁻⁵, og 100 springes over
  (den uskrevne regel).
* Enheder: den gamle havde mL, L og µL (250 mL, 1,5 L, 500 µL). Nu fem
  slags, alle med forstavelser (`C.ENHEDER`, tallene i `ENHED_TAL`):

  | Slags | Enheder | Hvor ofte |
  |-------|---------|-----------|
  | volumen | m³, L, dm³, dL, mL, cm³, µL | 3 af 9 |
  | masse | kg, g, mg, µg | 2 af 9 |
  | stofmængde | mol, mmol, µmol | 2 af 9 |
  | koncentration | mol/L, mmol/L, µmol/L | 1 af 9 |
  | tryk | kPa, hPa, Pa | 1 af 9 |

  Tallene ligner rigtige mængder: 0,025 mol, 250 mg, 101,3 kPa, 1013 hPa.
  Par med samme potens (mL og cm³, L og dm³) og spring på mere end 10⁶ (m³
  til µL) bruges ikke.

Alt regnes på cifferstrenge, ikke med kommatal i maskinen, så 1,005 afrundet
til tre cifre er 1,01 og 100 422 med ét ciffer er 1 · 10⁵.

## Hjælpen

Den ene knap i opgavekortet er Giv hint → Vis svaret → Næste opgave (til
sidst Ny runde). Tjek står ved svarfeltet, og Enter gør det samme; efter et
rigtigt svar hedder den Næste. Et tomt svar tæller ikke som et forsøg. Et
forkert svar giver en besked, der passer til fejlen, uden facit
(`js/cifre.js`, `tjek*`):

| Type | Fejlen | Beskeden (kort) |
|------|--------|-----------------|
| Tæl | et nul foran valgt | nuller foran tæller ikke |
| Tæl | et ciffer mangler: ikke nul, nul i midten, nul til sidst efter kommaet, nuller til sidst i et helt tal | hver sin |
| Afrund | skåret af i stedet for afrundet | det første ciffer, der fjernes, er 6; det er 5 eller mere |
| Afrund | rundet op, når det skulle ned | det er under 5 |
| Afrund | afrundet til decimaler | det er betydende cifre, der tælles |
| Afrund | rigtigt tal, forkert antal cifre (12,50 eller 7,5 for 7,50) | antallet nu og det rigtige |
| Afrund | 46 000 for to cifre | nullerne til sidst tæller; brug 10-feltet |
| Afrund | 46 for 45 678 | tallet er 1000 gange for lille |
| Regn | lommeregnerens tal uden afrunding | afrund til så mange cifre som den mindst præcise |
| Regn | afrundet efter den mest præcise faktor | det er den mindst præcise, der bestemmer |
| Notation | fortegnet, eksponenten for stor eller lille, ikke ét ciffer foran kommaet, for mange cifre, skrevet uden 10-tallet | hver sin |
| Almindeligt tal | kommaet den forkerte vej, for lidt eller for meget | hver sin |
| Enheder | den forkerte vej, 1000 i stedet for 1 000 000, kommaet flyttet for langt eller for kort | hver sin, med forholdet (1 kPa = 1000 Pa) |

Et rigtigt svar får også en forklaring: "Det næste ciffer er 6, så der rundes
op." Et svar som 46 · 10³ godkendes med en note om, at der i videnskabelig
notation står ét ciffer foran kommaet.

## Kemichael

Den rolige udgave fra `sc4.5` (`js/laerer.js`, samme fil med sin egen nøgle i
browseren): han sidder bag sit kateder nederst til venstre og siger kun noget
ved Giv hint (står, til opgaven er løst) og Vis svaret. Fejl, ros og næste
skridt står i linjen under svarfeltet. Knappen "Send Kemichael ud" sender ham
på lærerværelset; så står hintene i linjen, og samme knap eller sedlen på
katederet henter ham. <kbd>K</kbd> får ham til at sige, hvor man er.
Kaffekoppen og et klik på ham virker som i sc4.5 med egne kaffereplikker.

Påskeæg: et klik på kommaet, når cifrene skal tælles ("Kommaet er ikke et
ciffer."), og 10 af 10 i Blandet ("Med to betydende cifre.").

## Forenklinger

* Reglen om nuller til sidst i et helt tal er den enkle fra den gamle (de
  tæller). Nogle bøger kalder dem tvetydige; her er videnskabelig notation
  svaret på tvetydigheden.
* "Skriv som almindeligt tal" godkender 843 000 for 8,43 · 10⁵, selv om det
  almindelige tal efter reglen har seks betydende cifre (som i den gamle).
* 5 og derover rundes op.
* Enheder: værdien skal passe; antallet af cifre er ligegyldigt (som i den
  gamle), så både 0,25 og 0,250 er rigtigt. Kun omregninger, hvor kommaet
  flyttes: temperatur (°C og K) er ikke med, og heller ikke sammensatte
  omregninger som g/L til mg/mL.
* Den uskrevne regel om 0,01 til 100 er en vane, ikke en regel. Derfor giver
  den kun en note, aldrig et forkert svar.
* Tusindtal skrives med et smalt mellemrum (den gamle brugte punktum), så et
  punktum ikke kan forveksles med et komma. I svarfeltet er ét punktum et
  komma, og flere punktummer er tusindtal.
* Tastaturet på skærmen er væk. På en telefon eller tablet kommer det
  indbyggede taltastatur frem (`inputmode`), og ± ved eksponenten giver
  minus.

## Filer

```
index.html          toplinje, scene, panel, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet skrift, lærred (som sc4.5)
js/data.js          fanerne, runden og Kemichaels replikker
js/cifre.js         modellen: tal som cifre, afrunding, skrivemåder,
                    opgaverne, tjekket med beskederne, hint og svar
js/sprites.js       katederet (sprites/kateder.svg, samme som sc4.5)
js/laerer.js        Kemichael ved katederet (NK.RoligLaerer fra sc4.5)
js/fane.js          én fane: runden, tavlen, svarfeltet, kommaet, der
                    hopper, knappen og panelet
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur, svarfeltet og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> til <kbd>4</kbd> fane · <kbd>Enter</kbd> tjek og næste ·
<kbd>R</kbd> ny runde · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>K</kbd> Kemichael · <kbd>Esc</kbd> luk. Direkte links: `#tael`,
`#afrund`, `#komma`, `#blandet`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod
(Kemichael hentes derfra). Den tjekker fanernes rækkefølge, tællingen og afrundingen mod faste
eksempler (også 1,005 og 100 422), at 1500 opgaver af hver type har et gyldigt
facit, der godkendes, at de typiske fejl får den rigtige besked uden facit, at
en hel runde kan gennemføres på alle fire faner (og kommaet hopper færdigt),
hint, Vis svaret og tomme svar, at Kemichael kun taler ved hint og svar og kan
sendes ud, sproget, og at tallene står på én linje fra 900 til 1400 px.
Elevens gemte valg og rekord lægges tilbage bagefter.
Sidst kørt: ALT OK (99 påstande), 25. september 2026.

## I menuen

I menuen fra 26. sept. 2026 som c4.10 i `kemi-c-filer/samling_c4.html`. Den
gamle ligger i
`kemi-c-filer/arkiv/c4.10_quiz_betydendecifre_notation_oldversion.html`.
