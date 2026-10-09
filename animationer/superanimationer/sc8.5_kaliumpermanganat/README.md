# sc8.5 Kaliumpermanganat

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv. Den virker også,
når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c8.5_kaliumpermanganat_oxidationstal.html`
og er i menuen fra 26. sept. 2026 som c8.4; den gamle ligger i `kemi-c-filer/arkiv/`.

## Bestillingen (26. september 2026)

Brugeren: "Animation c8.5 er jo nok i virkeligheden blot en slags
ekstraopgaver til redox-afstemning, men jeg kunne godt tænke mig, at den
blev shinet lidt op. Og den må gerne adskille sig en lille smule i forhold
til 8.4 [...] Jeg kunne godt tænke mig, at opskrivningen bliver stilladseret
lidt ala vedlagte tegning (blot at stigning med pil op og pil ned gerne må
være placeret under reaktionspilen)." Tegningen viste
5 Fe²⁺ + MnO₄⁻ + 8 H⁺ ⟶ 5 Fe³⁺ + Mn²⁺ + 4 H₂O med oxidationstallene over
atomerne, en klamme fra Fe til Fe og en fra Mn til Mn under skemaet med
"5 ↑1" og "1 ↓5", og LV = +9, LH = +17 og O-tallene under siderne.

1. **Pointen:** Den samlede stigning i oxidationstal er lige så stor som det
   samlede fald, og permanganatens farve viser, hvor langt mangan er faldet.
2. **Afløser c8.5.** Med fra den gamle: ét urglas med basisk permanganat,
   flaskerne med natriumsulfit og svovlsyre, dråben, farveskiftene violet,
   grøn, brun og farveløs i samme glas, partikelvisningen (nu luppen) og
   afstemningen trin for trin med hint. Nyt: opskrivningen som i hånden efter
   tegningen, farvekortet, luppen med elektronerne og fane 2 med 14
   reaktioner mere.
3. **Naboerne:** sc8.4 ejer afstemningen med elektronvægten og de 37
   reaktioner i tre sværhedsgrader, sc8.2 ejer reglerne for oxidationstal,
   sc8.1 spændingsrækken, og c8.6 (Jern i ståluld) ejer titreringen. Her er
   metoden den, man skriver i hæftet: klammer under skemaet.
4. **Loftet:** to faner. Fane 1 har ét urglas og 3 reaktioner efter
   hinanden, fane 2 ét urglas og 14 reaktioner. Mangan reduceres i alle, og
   hver reaktion har to reaktanter og to produkter før afstemningen.
5. **Layoutet:** scene plus panel. Øverst i scenen laboratoriebordet med
   flaskerne, urglasset og luppen, under det hæftet på ternet papir og en
   smal stribe til Start forfra (Kemichael ved katederet sad nederst til
   9. okt. 2026). Panelet har opgavekortet, farvekortet og listen.
   Den ene knap stod først i opgavekortet; fra 3. oktober står den på papiret.

### Rettet efter brugerens første test (26. september 2026)

* "Den gamle udgave er lidt overvældende, fordi der kommer 3 glas (som i
  øvrigt bliver lilla igen, når man skifter). Kan vi ikke bare starte med
  den basiske og gøre det i et glas? Så får man dog først lov til at gå
  videre, når man har lavet første reaktionsskema." Fane 1 har nu ét glas,
  der starter basisk: lidt sulfit (grønt), mere sulfit (brunt) og svovlsyre
  (næsten farveløst). Reaktion 2 og 3 er låst (🔒 i listen), til skemaet før
  dem er afstemt. Det sure og det neutrale glas med sulfit er flyttet til
  fane 2 (Sulfit i syre og Sulfit i vand).
* "Michaels forklaringer er lidt overvældende for en svag elev [...] Måske
  kan han give en kort forklaring og linke sin tekniske forklaring i et
  læs-mere-teori-afsnit, hvor man fik det på en full screen med mere tekst
  og pænere stillet op." Hint og svar er nu én kort sætning, og knappen
  Læs mere åbner forklaringen i fuld skærm (se Hjælpen).

### Rettet efter brugerens anden test (3. oktober 2026)

* "Lad brugeren selv tilsætte KMnO₄ og 2 M NaOH, så det er tydeligt hvad der
  er i opløsningen fra start. Under glasset ville det være bedre, hvis der
  står MnO₄⁻, basisk, når disse ingredienser er tilsat." Fane 1 begynder nu
  med et tomt urglas og fire flasker (KMnO₄, NaOH 2 M, Na₂SO₃, H₂SO₄). Eleven
  fylder selv glasset, i den rækkefølge eleven vil, og skiltet under glasset
  følger med: Tomt urglas, MnO₄⁻ eller Basisk, og MnO₄⁻, basisk. Siden står
  manganstoffet og miljøet der hele vejen (MnO₄²⁻, basisk; MnO₂, basisk;
  Mn²⁺, surt), men manganstoffet først, når eleven har valgt det i hæftet.
* "I farvekortet må gerne fremgå navne på farvestofferne." Kortet har nu
  permanganat, manganat, brunsten og mangan(II)ion. Brugeren skrev
  mangan(III)ion; Mn²⁺ er mangan(II)ion.
* "Kan det ikke være sådan, at han giver et hint, når man trykker på ham."
  Sådan var det, til Kemichael blev taget helt ud 9. okt. 2026 (brugerens
  valg: han hører til i laboratoriet). Hintet kommer nu kun fra den gule knap
  på papiret og står i opgavekortet.
* "En ultrakort midlertidig beskrivelse til hvert trin (gerne med samme
  skrifttype og placering, som der hvor der står Lidt sulfit). Fx: Skriv
  oxidationstallene for S og Mn i skemaet." Linjen øverst i hæftet viser nu
  det næste skridt og skifter med hver bid (`kortLinje` i `js/sim.js`).
* "Placer hint nede i højre hjørne af papirområdet" og "placer næste opgave
  lidt mere centralt i animationen". Den ene knap står nu på papiret: Giv
  hint og Vis svaret i papirets nederste højre hjørne, Næste opgave midt i
  hæftet under reaktionspilen (eller midt for nederst, når der ikke er plads).

## Hæftet

Skemaet står på ternet papir med en rød margenlinje. Det, eleven skriver,
står med blåt blæk i håndskrift, det givne med blyant, og
et svar fra Vis svaret med brunt blæk. Reaktionspilen er lang, som i hånden,
så der er plads til "5 ↑1" under den.

Øverst i hæftet står det næste skridt helt kort, fx "Skriv oxidationstallene
for S og Mn i skemaet". Når skemaet er afstemt, står der "Lidt sulfit:
afstemt ✓".

Bidderne (linjen i opgavekortet siger altid næste skridt i hele sætninger,
og trinlisten over den viser de færdige med ✓):

0. **Fyld urglasset** (kun den første reaktion på fane 1). Glasset er tomt.
   Eleven trækker flaskerne med kaliumpermanganat og natriumhydroxid hen
   over glasset, i den rækkefølge eleven vil. Dråberne bliver til en pyt,
   der vokser, til glasset er fyldt. Mens glasset fyldes, står kun det i
   hæftet, der er i glasset (MnO₄⁻, når permanganaten er kommet i). En
   forkert flaske flyver hjem med en besked om, hvad der mangler.
1. **Dryp i glasset.** Træk flasken hen over urglasset (eller klik på
   glasset eller flasken). Den vender tuden nedad og drypper tre dråber, og
   farven breder sig fra dråben. På fane 1 er der fire flasker; den forkerte
   flyver hjem med en besked om, hvilken der skal bruges. Det stof, der
   dryppes i, skrives først i hæftet, når det er dryppet (brugerens ønske
   4. oktober 2026: "der skal først skrives SO₃²⁻ og SO₄²⁻ så snart man har
   tilsat sulfit"): på fane 1 står kun manganstoffet før dryppet, og sulfit
   og sulfat kommer med dryppet; på fane 2 står stoffet i glasset (fx Fe²⁺),
   og MnO₄⁻ kommer med dryppet. Svovlsyren i tredje reaktion sætter intet i
   skemaet (`giver` i `D.FLASKE`); H⁺ kommer, når ladningen afstemmes.
2. **Hvad blev mangan til?** Et spørgsmålstegn står, hvor manganstoffet skal
   stå, og under det tre formler. Farvekortet i panelet viser farverne. Et
   forkert valg streges ud og får en besked om farven.
3. **Oxidationstal** over de atomer, der skifter (fire felter). O og H
   spørges ikke om.
4. **Lige mange atomer** (kun med indekstal: C₂O₄²⁻ ⟶ CO₂, I⁻ ⟶ I₂ og
   Br⁻ ⟶ Br₂). Eleven skriver 2 foran den formel, der har færrest. Tallet
   står med blyant.
5. **Stigning og fald.** Klammerne tegnes frem. Klammen har kun en pilespids
   ved atomet efter reaktionspilen; før pilen går stregen op til atomet uden
   spids (brugerens ønske 5. oktober 2026, som i `sc8.bonus_pyrit_inaktiv`). Under pilen står ved hver
   klamme en pil, der vendes med et klik, med ↑ og ↓ på tastaturet eller
   med + og − i feltet, og feltet til tallet. Tallet er det samlede for
   atomerne på klammen (H₂O₂ ⟶ O₂: 2 · 1 = ↑2). Når den er rigtig, bliver
   klammen blå (oxidation) eller orange (reduktion), og ordet står under.
6. **Gangetal** foran pilene. "= 10" ved siden af følger med, mens der
   skrives, og bliver grønt, når de to er lige store. Er de rigtige, flyver
   tallene op foran formlerne (gange tallet fra bid 4), og luppen viser
   elektronerne flytte.
7. **Ladning** under hver side (rækken Ladning).
8. **H⁺ eller OH⁻.** Et felt bagerst på hver side; eleven skriver antallet
   på den rigtige side. Rækken Ladning viser det nye tal efter en pil
   (+9 → +17), mens der skrives.
9. **H-atomer** under hver side, også H i H⁺ eller OH⁻.
10. **Vand.** Et felt bagerst på hver side; hvert H₂O har 2 H, så vandet
    skal på den side, der har færrest H. Rækken H-atomer viser det nye tal
    efter en pil (0 → 8), mens der skrives. Til sidst kommer rækken O-atomer
    af sig selv som kontrol, og hæftet får en grøn ramme.

Vandet afstemmer H, og O er kontrollen, som man gør i Danmark (brugerens
ønske 26. september 2026, efter at første udgave afstemte O og tjekkede H).

Tomme felter tæller aldrig som et svar, der står ingen tal foran formlerne
før bid 6, luppen er tom, til gangetallene skrives, og produktet er skjult,
til der er dryppet (se `feedback-ingen-facit-foer-tid` i noterne).

## Hjælpen

Den ene knap står på papiret i scenen: Giv hint → Vis svaret (Dryp for mig
ved dryppet, det koster ikke stjernen) i papirets nederste højre hjørne, og
Næste opgave midt i hæftet (`placerKnap` i `js/haefte.js`). Efter et forkert
svar lyser knappen stille op. Hintet og svaret står i linjen i opgavekortet
som én kort sætning i almindelige ord, fx "Se på SO₃²⁻. Alle tallene skal give ionens ladning, −2.
Hvad skal S så være?" eller "Her er tallene. S går fra +IV til +VI, og Mn
går fra +VII til +VI." Bagefter står knappen **Læs mere**, der åbner
forklaringen i fuld skærm (`js/forklaring.js`): et kort pr. stof eller klamme
med regnestykket linje for linje (almindelige tal i mellemregningerne,
romertal i svaret, som sc8.2), tallinjen fra før til efter, to
gangetabeller, tabeller med ladning og H pr. formel. Efter et hint viser
forklaringen opstillingen og et spørgsmål (gult) i stedet for resultatet;
efter Vis svaret er det hele regnet ud (grønt).

Et forkert svar får en besked, der passer til fejlen
(`X.oxFejl` og `X.klammeFejl` i `js/redox.js`, `ladFejl`, `iltFejl` og
`tjek*` i `js/sim.js`):

| Bid | Fejlen | Beskeden |
|-----|--------|----------|
| farven | forkert manganstof | MnO₂ er et brunt fast stof. Glasset er næsten farveløst. |
| oxidationstal | ionens ladning glemt, summen ikke delt, fortegnet | hver sin (som sc8.4) |
| klammer | pilen den forkerte vej | S går fra +IV til +VI. Tallet bliver større, så pilen skal pege op. |
| klammer | ét atom i stedet for alle på klammen | Det er for ét I. Der er 2 I på klammen, så gang med 2. |
| klammer | tallene lagt sammen, oxidationstallet i stedet for forskellen | hver sin |
| gangetal | ikke lige store | Stigning: 4 · 2 = 8. Fald: 2 · 5 = 10. De to tal skal være lige store. |
| gangetal | ikke de mindste, et tomt felt | kan deles med 2 / Skriv 1, hvis tallet er 1. |
| ladning | tallene foran glemt, fortegnet | Før pilen: husk tallene foran. 5 SO₃²⁻ har ladningen 5 · (−2) = −10. |
| H⁺ / OH⁻ | forkert side, begge sider, for få eller mange | med ladningen, som den er |
| H-atomer | tallene foran glemt, H i H⁺ eller OH⁻ glemt | Før pilen: husk H i 6 H⁺. |
| vand | forkert side, lige så mange H₂O som de H, der mangler, for lidt eller meget | Hvert H₂O har 2 H. Så skal der kun halvt så mange H₂O, som der mangler H. |

## Luppen

Luppen på bordet viser elektronerne med de gangetal, eleven selv skriver:
hver partikel af det, der oxideres, har sine elektroner (gule prikker), og
hver partikel af det, der reduceres, har pladser (stiplede ringe). Under
luppen står "afgiver 20 e⁻ · plads til 10 e⁻". Er gangetallene rigtige,
flytter elektronerne over, og partiklerne bliver til produkterne. Luppen
viser højst 10 af hver.

## Reaktionerne

Alle står i `D.REAKTIONER` i `js/data.js` som reaktanter og produkter før
afstemningen. `js/redox.js` regner resten ud: oxidationstallene (O er −II,
H er +I, H₂O₂ er undtagelsen i `D.UKENDT`), forafstemningen, klammerne,
gangetallene, koefficienterne, ladningen, H⁺ eller OH⁻ og vandet.

| Fane | Reaktionerne |
|------|--------------|
| Urglassene (3, i samme glas) | eleven fylder glasset med permanganat og natriumhydroxid; så lidt sulfit (MnO₄²⁻, grønt, ↓1), mere sulfit (MnO₂, brunt, ↓2) og svovlsyre, der opløser brunstenen med den sulfit, der er tilbage (Mn²⁺, næsten farveløst, ↓2); i alt fra +VII til +II |
| Surt miljø (6) | Fe²⁺ (tegningen og c8.6), SO₃²⁻ (↓5), Sn²⁺, NO₂⁻, H₂S (gult svovl), SO₂ (H⁺ efter pilen) |
| Neutralt og basisk (4) | SO₃²⁻ i vand (OH⁻ efter pilen), NO₂⁻, I⁻ ⟶ IO₃⁻ (↑6 og ↓3 giver 1 og 2), S²⁻ |
| Indekstal (4) | C₂O₄²⁻ ⟶ CO₂ (bobler), H₂O₂ ⟶ O₂ (bobler), I⁻ ⟶ I₂ (brunt, men klart), Br⁻ ⟶ Br₂ |

En ny reaktion er én linje i `D.REAKTIONER`. Selvtesten tjekker, at den er
afstemt med de mindste tal.

## Forenklinger

* K⁺ og Na⁺ skrives ikke med (det står i teorien).
* Sulfit i vand (neutralt) afstemmes med OH⁻ efter pilen, som i
  lærebøgerne: der er ingen H⁺ at tage af, og opløsningen bliver svagt basisk.
* Det basiske glas bliver grønt med lidt sulfit og brunt med mere. Hvor
  meget sulfit der skal til, er ikke med.
* Tre dråber fra flasken fylder urglasset. Mængderne er ikke med.
* Sulfit eller syre i et glas, der ikke er fyldt endnu, afvises med en
  besked. Reaktionen uden base (neutralt, brunsten) står på fane 2.
* Den gamle c8.5 afstemte permanganat og sulfit i syre i sidste trin, men da
  er permanganaten brugt op. Her er det brunstenen, der reagerer med den
  sulfit, der er tilbage: SO₃²⁻ + MnO₂ + 2 H⁺ ⟶ SO₄²⁻ + Mn²⁺ + H₂O.
  Permanganat og sulfit i syre er med på fane 2.
* Kun reaktioner, hvor mangan reduceres, og hvor de to led på hver side er
  forskellige stoffer (ingen disproportionering).
* Farverne er valgt, så de kan skelnes: Mn²⁺ er svagt lyserød, Fe³⁺ svagt
  gul. Væsken tegnes mod en lys bund, som om klinken skinner igennem.
* Luppen viser elektronregnskabet, ikke H⁺, OH⁻ og vand.

## Filer

```
index.html          toplinje, de to faner, teori og rundvisning
css/stil.css        alt udseende (grundlaget er sc8.2; nederst hæftet,
                    trinlisten og farvekortet). NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, lærred (som sc8.2)
js/data.js          reaktionerne, farverne, farvekortet og replikkerne
js/redox.js         modellen: oxidationstal, klammer, gangetal, afstemning
                    og beskederne til klammerne
js/sprites.js       urglasset og dråbeflasken
js/tegning.js       bordet, klinken, væsken, flasken, dråberne og luppen
js/fane.js          det fælles: listen, knappen, linjen (også hint og svar)
                    og musen (som sc8.2)
js/haefte.js        hæftet: skemaet, felterne, klammerne (SVG), rækkerne, den
                    korte linje øverst og knappen på papiret
js/bord.js          bordet: glassene, flasken, dryppet og luppen
js/forklaring.js    forklaringen bag Læs mere (kort, tallinje,
                    gangetabeller og tabeller)
js/sim.js           de to faner: bidderne, tjekkene, det tomme urglas og
                    låsen på fane 1, skiltet under glasset, hint og Vis svaret
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
_sprites.html       udviklerværktøj: tegningerne alene
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>R</kbd> start forfra · <kbd>H</kbd>
rundvisning · <kbd>T</kbd> teori · <kbd>Enter</kbd>
tjek · <kbd>↑</kbd> <kbd>↓</kbd> vend pilen · <kbd>Esc</kbd> luk. Direkte
links: `#urglas` og `#flere`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker de 17 skemaer mod de kendte (også
tegningens), klammerne og gangetallene, at felterne læser romertal og tal,
beskederne til de typiske fejl, at der ikke står et facit før tid, at
eleven selv fylder det tomme urglas (i begge rækkefølger), at skiltet under
glasset følger med, at reaktionerne i glasset på fane 1 åbner én ad gangen
og kræver den rigtige flaske, at knappen står på papiret uden at dække
noget, at den korte linje følger bidderne, at hintknappen lyser op efter
en fejl, at pilen kan vendes med klik, taster og fortegn, at alle reaktioner
kan gennemføres ved at skrive, med musen og med Vis svaret, at hint og svar
er én kort sætning i opgavekortet, og at Læs mere åbner forklaringen (uden
facit efter et hint), sproget (også i alle forklaringerne) og
layoutet fra 1100 × 700 til 1600 × 950.
Sidst kørt: ALT OK (266 påstande), 9. oktober 2026.

## I menuen

I menuen fra 26. sept. 2026 som c8.4 i `kemi-c-filer/samling_c8.html` (nr. 4,
fordi c8.2 og c8.3 blev til én knap; mappen hedder stadig sc8.5). Den gamle
ligger i
`kemi-c-filer/arkiv/c8.5_kaliumpermanganat_oxidationstal_oldversion.html`.
