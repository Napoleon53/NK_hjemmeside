# sc4.10 Afrunding og opskrivning

Superanimation om betydende cifre: hvor præcist et tal er kendt, hvordan det
afrundes, og hvordan kommaet flyttes med tierpotenser og enheder. Åbn
`index.html`. Mappen henter kun filer inde fra sig selv. Ingen
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
   typer fra den gamle og ingen sprites.
5. **Layoutet:** scene plus panel. Scenen er ternet papir med spørgsmålet,
   tavlen med cifrene som brikker, svarfeltet og linjen under det. Panelet har opgavekortet (runden som ti streger, én knap)
   og listen over rundens opgaver med facit.

Brugerens valg (25. sept. 2026): fanerne Tæl cifrene, Afrund, Flyt kommaet og
Blandet. 9. okt. 2026: Kemichael ved katederet er taget helt ud (han hører
til i laboratoriet), og hintknappen er gul. Efter første
udgave samme dag: Flyt kommaet før Afrund (afrunding kræver somme tider
videnskabelig notation), den uskrevne regel om tal mellem 0,01 og 100 (se
nedenfor) og flere enhedsomregninger. Loftet for enheder er derfor fem slags
mængder med i alt 20 enheder, alle med forstavelser, så kommaet flyttes.

27. sept. 2026 (brugerens ønske): 10-feltet lagde op til videnskabelig
notation, også når facit lå mellem 0,01 og 100, og det forvirrede. Nu vælger
eleven over svarfeltet mellem Almindeligt tal (altid valgt, når en opgave
starter) og Videnskabelig notation, og eksponentfeltet står hævet ved
10-tallet. Enhederne har fire niveauer med stigende sværhedsgrad og kun g, L
og mol (tryk er ude; Pa bruges normalt ikke i kemi): Let med kilo og milli,
Middel med mikro og mol, Svær med mol/L og tal med mange nuller, og Meget
svær med de sjældne forstavelser, som først låses op, når de tre andre er
trænet.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Tæl cifrene | klikker på de cifre i tallet, der er betydende | kun nullerne foran tæller ikke |
| 2 | Flyt kommaet | skriver et tal i videnskabelig notation eller som almindeligt tal, eller omregner enheder med g, L og mol i fire niveauer | eksponenten og forstavelsen er antallet af pladser; cifrene ændres ikke |
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

**Svarfeltet.** Tallet skrives med komma (punktum er også komma). Over
feltet står to knapper, Almindeligt tal og Videnskabelig notation. Hver ny
opgave starter på Almindeligt tal, så intet lægger op til en tierpotens, og
valget afslører ikke svaret. Først med Videnskabelig notation kommer "· 10"
frem med eksponentfeltet hævet som en potens. `e`, `^`, `*` eller `x` i
tallet skifter derover og springer til eksponenten, og ± skifter fortegnet.
`4,56e3` og `4,56*10^3` forstås også. En eksponent, der står i feltet, når
man skifter tilbage til Almindeligt tal, tæller ikke. Siger opgaven selv,
hvordan tallet skal skrives (Skriv i videnskabelig notation, Skriv som
almindeligt tal), er knappen låst på det. Under feltet viser prikkerne,
hvor mange betydende cifre ens eget tal har, og hvor mange der skal være
(røde, når der er for mange). Ved regnestykker står kun ens eget antal, for
antallet er en del af svaret.

**Runden.** Ti opgaver. Grøn er rigtigt i første forsøg uden hint, gul er
rigtigt efter et hint eller et forkert svar, og rød er Vis svaret. Tallet
"rigtige i første forsøg" er de grønne, som i den gamle, hvor kun første svar
talte. Listen i panelet viser rundens opgaver med facit. Afrund har knapperne
Måletal og Regnestykker, og Flyt kommaet har Videnskabelig notation og
Enheder; et skift starter en ny runde og huskes i browseren. Under Enheder
står niveauerne Let, Middel, Svær og Meget svær med en linje om, hvad
niveauet har. Et niveau får et flueben, når en runde er klaret med mindst 7
rigtige i første forsøg (`D.OPLAAS`). Meget svær har en lås, til Let, Middel
og Svær har flueben; et klik på låsen siger hvorfor. Fluebenene huskes i
browseren (`nk-sc4.10-enheder`), og slutteksten siger, når Meget svær er
låst op.

## Reglen og tallene

Alle cifre er betydende, undtagen nullerne foran det første ciffer, der ikke
er nul. Nuller til sidst tæller også, i et helt tal som efter kommaet: 4500 har
fire. Det er reglen fra den gamle (`countSigFigs`). Skal nullerne i et helt tal
ikke tælle, skrives tallet i videnskabelig notation, og derfor er facit
`4,6 · 10⁴`, når 45 678 afrundes til to cifre.

**Den uskrevne regel** (brugerens ønske): tal mellem 0,01 og 100 skrives som
almindelige tal. Den står i teorien under Videnskabelig notation, men ingen
opgave lægger op til at bryde den: der bliver aldrig bedt om videnskabelig
notation for et tal i det område, svaret starter altid som almindeligt tal,
og en afrunding, hvis facit kun kunne skrives med 10-tallet i området (67
med ét ciffer er 7 · 10¹), springes over.
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
* Enheder: den gamle havde mL, L og µL (250 mL, 1,5 L, 500 µL). Nu g, L og
  mol med forstavelser i fire niveauer (`C.NIVEAUER`, tallene i
  `ENHED_TAL`). Tryk, m³, dm³ og cm³ er ude (brugerens ønske 27. sept. 2026).

  | Niveau | Enheder | Det nye |
  |--------|---------|---------|
  | Let | kg, g, mg, L, mL | kilo og milli, ét trin på 1000; de første tre opgaver går fra stor til lille enhed |
  | Middel | + µg, µL, mol, mmol, µmol | mikro og mol og spring på 10⁶ (3 af 4 opgaver) |
  | Svær | + mol/L, mmol/L, µmol/L | koncentration (4 af 10) og tal med mange nuller som 0,0045 og 45 000 (6 af 10) |
  | Meget svær | g: M, k, h, da, d, c, m, µ, n; L: h, d, c, m, µ, n; mol: k, m, µ, n; mol/L: m, µ, n | en sjælden forstavelse (85 %); hintet siger, hvad den betyder (h er hekto (100)) |

  Blandet tager Let, Middel og Svær (2 : 2 : 1), aldrig Meget svær. På Let og
  Middel ligner tallene rigtige mængder (0,025 mol, 250 mg); på Meget svær er
  de korte tal fra 0,01 til 999. Spring på mere end 10⁶ bruges ikke, tallet
  har højst 8 tegn og facit højst 9, så det kan stå på tavlen.

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
| Afrund | 46 000 for to cifre | nullerne til sidst tæller; skriv det i videnskabelig notation |
| Afrund | 46 for 45 678 | tallet er 1000 gange for lille |
| Regn | lommeregnerens tal uden afrunding | afrund til så mange cifre som den mindst præcise |
| Regn | afrundet efter den mest præcise faktor | det er den mindst præcise, der bestemmer |
| Notation | fortegnet, eksponenten for stor eller lille, ikke ét ciffer foran kommaet, for mange cifre, skrevet uden 10-tallet | hver sin |
| Almindeligt tal | kommaet den forkerte vej, for lidt eller for meget | hver sin |
| Enheder | den forkerte vej, 1000 i stedet for 1 000 000, kommaet flyttet for langt eller for kort | hver sin, med forholdet (1 kg = 1000 g) |

Et rigtigt svar får også en forklaring: "Det næste ciffer er 6, så der rundes
op." Et svar som 46 · 10³ godkendes med en note om, at der i videnskabelig
notation står ét ciffer foran kommaet.

## Hjælpen

Den gule knap i opgavekortet: Giv hint skriver hintet i linjen under
svarfeltet (den står, til opgaven er løst), og knappen bliver til Vis svaret
(kun et omrids), der skriver svaret i felterne og forklaringen i linjen.
Fejl, ros og næste skridt står i samme linje. Efter et forkert svar lyser den
gule knap stille op. Der er ingen Kemichael: scenen er ren DOM uden lærred
og sprites.

## Forenklinger

* Reglen om nuller til sidst i et helt tal er den enkle fra den gamle (de
  tæller). Nogle bøger kalder dem tvetydige; her er videnskabelig notation
  svaret på tvetydigheden.
* "Skriv som almindeligt tal" godkender 843 000 for 8,43 · 10⁵, selv om det
  almindelige tal efter reglen har seks betydende cifre (som i den gamle).
* 5 og derover rundes op.
* Enheder: værdien skal passe; antallet af cifre er ligegyldigt (som i den
  gamle), så både 0,25 og 0,250 er rigtigt, og 2,5 · 10⁻¹ også (med noten om
  0,01 til 100). Kun omregninger, hvor kommaet
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
js/data.js          fanerne, runden og linjerne under svarfeltet
js/cifre.js         modellen: tal som cifre, afrunding, skrivemåder,
                    opgaverne, tjekket med beskederne, hint og svar
js/fane.js          én fane: runden, tavlen, svarfeltet, kommaet, der
                    hopper, knappen og panelet
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur, svarfeltet og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> til <kbd>4</kbd> fane · <kbd>Enter</kbd> tjek og næste ·
<kbd>R</kbd> ny runde · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>Esc</kbd> luk. Direkte links: `#tael`,
`#afrund`, `#komma`, `#blandet`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker fanernes rækkefølge, tællingen og afrundingen mod faste
eksempler (også 1,005 og 100 422), at 1500 opgaver af hver type har et gyldigt
facit, der godkendes (enhederne på alle fire niveauer), hvad hvert niveau
indeholder, at de typiske fejl får den rigtige besked uden facit, at
en hel runde kan gennemføres på alle fire faner (og kommaet hopper færdigt),
at Meget svær først låses op af tre klarede niveauer, svarknapperne
(almindeligt tal som start, låst, når opgaven siger det, eksponentfeltet
hævet, `e` skifter), hint, Vis svaret og tomme svar, at hint og svar kun
kommer fra den gule knap, og at den lyser op efter en fejl, sproget, og at tallene står på én linje
fra 900 til 1400 px, også løste enhedsopgaver på Svær og Meget svær.
Elevens gemte valg, rekord og klarede niveauer lægges tilbage bagefter.
Sidst kørt: ALT OK (125 påstande), 9. oktober 2026.

## I menuen

I menuen fra 26. sept. 2026 som c4.10 i `kemi-c-filer/samling_c4.html`. Den
gamle ligger i
`kemi-c-filer/arkiv/c4.10_quiz_betydendecifre_notation_oldversion.html`.
