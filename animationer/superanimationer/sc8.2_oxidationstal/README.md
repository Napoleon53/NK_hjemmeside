# sc8.2 Oxidationstal

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv. Den virker også,
når den åbnes direkte fra harddisken.

Den afløser to gamle enkeltfiler,
`animationer/kemi-c-filer/c8.2_oxidationstal_regler.html` og
`animationer/kemi-c-filer/c8.3_oxidationstal_elektronegativitet.html`, og er i
menuen fra 26. sept. 2026; de gamle ligger i `kemi-c-filer/arkiv/`.

## Bestillingen (25. september 2026)

Brugeren: "Kan du lave en superanimation, der dækker c8.2 og c8.3 (måske
tilsammen i 2 faner)". Kemichael sad ved katederet til 9. okt. 2026; da
blev han taget helt ud (brugerens valg: han hører til i laboratoriet).

1. **Pointen:** Oxidationstallet er den ladning, et atom ville have, hvis
   hvert elektronpar i en binding gik helt over til det mest elektronegative
   atom. Reglerne (H er +I, O er −II, summen er ladningen) er en genvej til
   det samme tal, og de passer ikke, når O er bundet til O eller F.
2. **Afløser c8.2 og c8.3.** Fra c8.2: de seks stoffer trin for trin
   (ladningen, O, H, det ukendte), regnestykket, der følger med, mens der
   skrives, romertallet over atomet, når det er rigtigt, de 25 øvestoffer i
   fire familier (mangan, nitrogen, carbon, svovl), noterne til Mn²⁺, Mn₂O₇
   og S₈, og at både +7 og +VII godtages. Fra c8.3: de tolv molekyler og
   ioner i samme rækkefølge, gættet før svaret, elektronparrene, der rykker
   hen til det mest elektronegative atom, prikkerne i farven fra det atom,
   de kom fra, elektronegativiteten ved atomerne og forklaringerne til
   undtagelserne. Taget ud: scoren og streaken, rundturen "Præsentér",
   advarslerne før undtagelserne (fejlen skal lære noget) og
   "ekstra par"/"mgl. e⁻" som særtilfælde; ionerne regnes nu som alle andre
   med valenselektronerne.
3. **Naboerne:** sc3.3 ejer elektronegativiteten (tovtrækningen og
   polariteten), sc3.1 ejer elektronprikformlerne (eleven tæller selv), sc8.4
   ejer afstemningen, sc8.1 spændingsrækken og c8.5 permanganatens farver.
   Her er elektronegativiteten et tal ved atomet, og prikformlerne er givet.
4. **Loftet:** to faner, 31 stoffer på fane 1 (6 trin for trin og 25 til
   øvelse) og 12 molekyler på fane 2. Én formel eller ét molekyle ad gangen.
5. **Layoutet:** scene plus panel. Scenen er en tavle med arbejdsfeltet,
   og under den en smal stribe til Start forfra; panelet har kun listen med
   formlerne (og regnskabet på fane 2).

## Arbejdsfeltet (brugerens test 3. oktober 2026)

Brugeren om fane 1: stilladseringen er god, men den blev "lidt kluntet og
uklar for den svage elev". Der skulle være mindre tekst, det skulle være
"meget tydeligt, at det er ladningen som man skal bestemme", hint-knappen
skulle stå "meget synlig lige ved siden af inputfeltet", og "der skal ikke
være en ordre-tekst oppe i højre hjørne". Om fane 2: opgaveteksten i
hjørnet var for lille, og det, der skal trækkes, skulle blinke eller have
pile "i selve animationsvinduet".

Derfor står alt, eleven skal læse og trykke på, nu samlet i et
**arbejdsfelt** i scenen (`.arb` i stilarket, `js/fane.js`):

* **spørgsmålet** til det trin, eleven er ved, som én kort linje ("Hvilken
  ladning har CO₂?", "Hvilket oxidationstal har hvert O?", "Træk hvert
  elektronpar hen til det atom, der trækker hårdest."),
* **feltet** med Tjek (fane 1) eller gættet med Gæt (fane 2),
* **knappen** lige ved siden af: Giv hint, så Vis svaret, så Næste opgave,
* **linjen** under dem med et mærke forrest: Ikke endnu (rød, feltet
  ryster, og hintknappen lyser op), Hint og Svaret (gul), Løst ✓ (grøn).

Opgavekortet i panelet er væk. Opgaven står som én linje øverst på tavlen
med en gul streg foran ("Find oxidationstallet for C i CO₂"), og den lange
forklaring til hvert trin er skåret væk: det, den sagde, er nu hintet.
Hintet står i arbejdsfeltet ved feltet (se Hjælpen nedenfor).

## Beregningen på egne linjer (brugerens test 5. oktober 2026)

Brugeren: fane 1 og 2 virker fint, men forklaringen ved rigtigt svar på
fane 2 var "lidt svær at læse": regnestykkerne stod inde i teksten ("O har 6
valenselektroner og ender med 8: 6 − 8 = −2, så O er −II"), og det var
"lidt indforstået". Ønsket: beregningerne skal være mindre indforståede og
have deres egne linjer. (Ønsket samme dag om, at et klik på Kemichael
skulle give et hint, faldt væk, da han blev taget ud 9. okt. 2026.)

* **Linjen** siger nu kun i ord, hvordan gættet gik, og hvor parrene endte
  ("Dit gæt passede. O har fået begge elektronpar, og hvert H har mistet sin
  elektron."). Der står ingen regnestykker i den.
* **Beregningen** står under linjen i sin egen ramme (`#ek-forklar`,
  `forklaringHTML` i `js/sim_elektroner.js`): øverst formlen i ord,
  "oxidationstal = valenselektroner − elektroner nu", og under den én linje
  pr. grundstof, der spørges til, med tallene lige under de ord, de hører
  til, lighedstegnene under hinanden og konklusionen til sidst ("så O er
  −II"). For en ion kommer summen som sidste linje ("det er ionens
  ladning"). Tallene kommer fra modellen, ikke fra teksten i `js/data.js`.
  En kort note under beregningen siger, når reglerne fra fane 1 ikke passer
  (H₂, O₂, H₂O₂, OF₂). Teoriens eksempel med vand bruger samme opstilling.
* På en smal eller lav skærm er beregningen sat tættere, og gættets brikker
  er væk, når opgaven er løst (linjen siger, hvordan gættet gik), så knappen
  Næste opgave bliver på linjen og molekylet beholder pladsen. Selvtesten
  måler det ned til 1100 × 700 og 1366 × 650.
## Fane 1: Reglerne

Tavlen, oppefra:

* **Opgaven og trinene:** "Find oxidationstallet for C i CO₂" og, for de
  seks første, mærker for hvert trin (Ladningen › O › H › det ukendte).
* **Formlen.** Det atom, der spørges til, er gult med et gult ? over sig,
  og mens eleven skriver, står elevens eget tal der med romertal. Et rigtigt
  tal bliver stående grønt.
* **Arbejdsfeltet** lige under formlen: spørgsmålet, feltet, Tjek og Giv
  hint. Hintet til ladningen får pladsen efter formlen til at lyse (også
  når den er tom).
* **Regnestykket:** summen af oxidationstallene = ladningen, med en lille
  tekst under hver side. Det kommer frem, når ladningen er fundet
  (brugerens første test, 26. sept. 2026: eleven blev "kastet ud i en halv
  beregning").
* **Den pæne beregning**, når opgaven er løst: 2 · Cr = −2 − 7 · (−2) = +12
  og Cr = +12 / 2 = +6.
* **Brikkerne:** ét atom pr. brik, når det første tal kendes, og til sidst
  summen (= −2 ✓).

Pladsen til regnestykket, beregningen og brikkerne er sat af fra starten
(de er usynlige, ikke væk), så arbejdsfeltet står stille, mens der skrives.
Skriften vælges, så det hele kan være på tavlen med en linje mere i
arbejdsfeltet (`layout` i `js/sim_regler.js`).

Skrivemåden (brugerens valg): oxidationstallet over atomet og i svaret med
romertal (+VI), mellemregninger med almindelige tal ((−2), +12, +6). Felterne
godtager begge.

* **Trin for trin (de seks første):** ladningen, så O, så H og til sidst
  det ukendte. Spørgsmålet i arbejdsfeltet skifter for hvert trin, og
  linjen siger, hvad der var rigtigt ("Rigtigt. Ladningen er 0.").
* **Øvelse (de 25):** kun spørgsmålet om det ukendte. Hintet sætter O og H
  ind med gråt og viser regnestykket. Navne med romertal (mangan(IV)oxid)
  står først i noten bagefter, så de ikke viser facit.

Et forkert tal får en besked, der passer til fejlen (`NK.Ox.fejl` i
`js/ox.js`):

| Felt | Fejlen | Beskeden |
|------|--------|----------|
| ladning | 0 for en ion, fortegnet, tal for et neutralt stof | hver sin |
| O, H | fortegnet, hele antallet i stedet for ét atom | hver sin |
| det ukendte | summen ikke delt (Cr +XII) | Der er 2 Cr. Tilsammen giver de +12. Del det mellem dem |
| det ukendte | ionens ladning glemt (Mn +VIII) | Summen skal være ionens ladning, −1, ikke 0 |
| det ukendte | fortegnet, H glemt, antallet af O glemt, ladningens fortegn | hver sin |
| det ukendte | grundstof og ion af ét atom | reglen for dem |

Vis svaret på det sidste trin skriver den pæne beregning på tavlen, og
linjen henviser til den ("Beregningen står herunder."). For et grundstof og
en ion af ét atom står reglen i linjen.

## Fane 2: Elektronerne

Molekylet står på tavlen som en elektronprikformel. Prikkens farve er
farven fra det atom, elektronen kom fra; ionens ekstra elektron (OH⁻) er
lilla, og den, NH₄⁺ mangler, er en tom ring. Tallet ved hvert atom er
elektronegativiteten. Opgaven står øverst på tavlen, og arbejdsfeltet står
nederst på tavlen. Tre bidder:

1. **Gæt:** "Gæt først: hvilket oxidationstal har Cl?" med et lille felt pr.
   grundstof og knappen Gæt. Knappen ved siden af er Giv hint og så Spring
   gættet over.
2. **Fordel:** "Træk elektronparret hen til det atom, der trækker hårdest."
   Parrene, der skal flyttes, blinker, og en pil peger fra parret mod hvert
   af de to atomer; elektronegativiteten står tydeligt (gul og fed). Eleven
   trækker parret (eller klikker på parret og så på atomet). Et par mellem
   to ens atomer deles, én elektron (eller to) til hver. Et par hos det
   forkerte atom bliver rødt med en pil mod det rigtige, og linjen siger
   hvorfor.
3. **Regnskabet:** hvert atom får en ring om sine elektroner og sit
   oxidationstal. Arbejdsfeltet viser svaret, gættet som en grøn eller rød
   brik, i ord hvor parrene endte, og under det beregningen på egne
   linjer (se afsnittet om testen 5. oktober); panelet viser
   valenselektronerne, dem, atomet har nu, og forskellen med almindelige
   tal og oxidationstallet med romertal (6 − 7 = −1, −I) for alle
   grundstofferne i molekylet. Arbejdsfeltet bliver højere af beregningen,
   og molekylet rykker op, så det ikke står bag feltet.

Reglerne og elektronerne giver forskellige tal for H₂O₂ og OF₂ (og
selvtesten tjekker, at det kun er de to), så et gæt efter reglerne bliver
rødt netop dér. H₂ og O₂ passer med reglen om grundstoffer.

## Hjælpen

Der er ingen Kemichael (taget ud 9. okt. 2026). Hjælpen er den gule knap i
arbejdsfeltet, lige ved siden af feltet: Giv hint (fyldt gul) skriver hintet
i linjen under feltet, og knappen bliver til Vis svaret (kun et omrids).
Efter et forkert svar lyser knappen stille op. Under tavlen er der en smal
stribe til knappen Start forfra.

## Forenklinger

* Elektronegativiteterne er Paulings værdier med én decimal fra Databogen
  (som c8.3 og sc3.3). S og C har begge 2,5, men sidder aldrig sammen her.
* SO₂ tegnes med to dobbeltbindinger og et frit par på S (10 elektroner om
  S), som i c8.3. Oxidationstallet bliver det samme med den anden
  resonansstruktur.
* Molekylerne tegnes i et gitter med vandrette og lodrette bindinger som
  elektronprikformler i bogen, ikke med den rumlige form (den ejer sc3.2).
* NH₄⁺ tegnes, så hver binding har én elektron fra N og én fra H; den femte
  elektron fra N er den, ionen mangler.
* S₂O₃²⁻, N₂O og C₂O₄²⁻ får gennemsnittet efter reglerne (+II, +I, +III).
  S₂O₈²⁻ fra c8.2 er taget ud: reglerne giver +VII, men S er +VI, fordi to
  O er bundet til hinanden. Den er afløst af H₂S (−II), og det ekstra CO₂
  i carbonfamilien er afløst af CH₄ (−IV).

## Filer

```
index.html          toplinje, de to faner med arbejdsfeltet i scenen, teori
                    og rundvisning
css/stil.css        alt udseende (grundlaget er sc5.1; nederst tavlen,
                    brikkerne, arbejdsfeltet, listen, gættet og regnskabet).
                    NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, lærred (som sc5.1)
js/data.js          grundstofferne, de 31 stoffer, de 12 molekyler med
                    tegning, forklaring i ord og note, og linjerne i arbejdsfeltet
js/ox.js            modellen: oxidationstal efter reglerne, læsning af
                    felterne, beskederne til fejlene og elektronregnskabet
js/tegning.js       væggen, tavlen på fane 2, prikkerne, pilene og klammerne
js/fane.js          det fælles: listen, arbejdsfeltet (knappen og linjen)
                    og musen
js/sim_regler.js    fane 1
js/sim_elektroner.js fane 2
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

Et nyt stof på fane 1 er én linje i `D.REGLER`. Et nyt molekyle på fane 2
er atomerne i gitteret, bindingerne med orden og en forklaring i ord (uden
regnestykker) i `D.MOLEKYLER`; de frie par og beregningen under linjen
regnes ud af valenselektronerne.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>R</kbd> start forfra · <kbd>H</kbd>
rundvisning · <kbd>T</kbd> teori · <kbd>Enter</kbd>
tjek · <kbd>Esc</kbd> luk. Direkte links: `#regler` og `#elektroner`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker oxidationstallene mod tabellen for de
31 stoffer og de 12 molekyler, at summen er ladningen, at elektronerne passer
med valenselektronerne, at reglerne kun svigter for H₂O₂ og OF₂, at felterne
læser romertal og tal, beskederne til de typiske fejl, at alle opgaver kan
gennemføres ved at skrive, med musen og med Vis svaret, at der ikke står et
facit, før eleven har gjort noget, at spørgsmålet, feltet og Giv hint står
samlet i scenen og ikke i panelet, at hintknappen står lige ved siden af
feltet, at arbejdsfeltet står stille, mens opgaven løses, at parrene på
fane 2 har pile, at beregningen på fane 2 står på egne linjer under formlen
i ord (og at linjen over ikke har regnestykker), at hint og svar kun kommer
fra den gule knap, og at den lyser op efter en fejl, sproget og
layoutet fra 1100 × 700 til 1600 × 950 (fane 2 også ved 1366 × 650).
Sidst kørt 9. oktober 2026: 133 påstande, 1 fejl. Fejlen er layoutet på fane
2 ved 1100 × 700 ("beregningen er for bred" for OH⁻ og NH₄⁺); den var der
også før Kemichael blev taget ud (dengang med to steder mere).

## I menuen

I menuen fra 26. sept. 2026 som c8.2 i `kemi-c-filer/samling_c8.html`. De gamle
ligger i `kemi-c-filer/arkiv/c8.2_oxidationstal_regler_oldversion.html` og
`kemi-c-filer/arkiv/c8.3_oxidationstal_elektronegativitet_oldversion.html`. Den
har én knap; c8.3 er ikke længere en egen knap, og C8 er omnummereret uden
huller (3 Afstem Redox, 4 Kaliumpermanganat, 5 Jern i ståluld).
