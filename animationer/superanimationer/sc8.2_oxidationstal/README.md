# sc8.2 Oxidationstal

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv, bortset fra Kemichael, som hentes fra
`../../v2/kemichael/` og `../kemichael/superanimation.js`. Den virker også,
når den åbnes direkte fra harddisken.

Den afløser to gamle enkeltfiler,
`animationer/kemi-c-filer/c8.2_oxidationstal_regler.html` og
`animationer/kemi-c-filer/c8.3_oxidationstal_elektronegativitet.html`, og er i
menuen fra 26. sept. 2026; de gamle ligger i `kemi-c-filer/arkiv/`.

## Bestillingen (25. september 2026)

Brugeren: "Kan du lave en superanimation, der dækker c8.2 og c8.3 (måske
tilsammen i 2 faner)". Kemichael er den rolige udgave ved katederet
(brugerens valg).

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
5. **Layoutet:** scene plus panel. Scenen er en tavle over Kemichaels
   kateder; panelet har opgavekortet med den ene knap og listen med
   formlerne.

## Fane 1: Reglerne

Tavlen, oppefra:

* **Trinene og forklaringen:** mærker for hvert trin (Ladningen › O › H ›
  det ukendte) og en forklaring til det trin, eleven er ved, fx "Start derfor
  med ladningen på hele CO₂ …". Linjen i opgavekortet siger kun kort, hvad
  der skal skrives i det gule felt, og hvad der gik galt.
* **Formlen** med et felt over atomerne. Feltet, der skal skrives i, er gult
  og banker stille.
* **Regnestykket:** summen af oxidationstallene = ladningen, med en lille
  tekst under hver side. Det starter med ord og ladningens felt; atomerne
  kommer ind, når ladningen er fundet (brugerens første test, 26. sept.
  2026: eleven blev "kastet ud i en halv beregning").
* **Den pæne beregning**, når opgaven er løst: 2 · Cr = −2 − 7 · (−2) = +12
  og Cr = +12 / 2 = +6.
* **Brikkerne:** ét atom pr. brik, når det første tal kendes, og til sidst
  summen (= −2 ✓).

Skrivemåden (brugerens valg): oxidationstallet over atomet og i svaret med
romertal (+VI), mellemregninger med almindelige tal ((−2), +12, +6). Felterne
godtager begge.

* **Trin for trin (de seks første):** ladningen efter lighedstegnet i
  regnestykket, så O, så H og til sidst det ukendte. Kun det aktive felt
  står fremme; resten kommer, når opgaven når dem.
* **Øvelse (de 25):** kun feltet over det ukendte. Hintet sætter O og H
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

Vis svaret giver hele beregningen, fx "2 · Cr + 7 · (−2) = −2, så
2 · Cr = −2 − 7 · (−2) = +12 og Cr = +12 / 2 = +6. Cr er +VI."

## Fane 2: Elektronerne

Molekylet står på tavlen som en elektronprikformel. Prikkens farve er
farven fra det atom, elektronen kom fra; ionens ekstra elektron (OH⁻) er
lilla, og den, NH₄⁺ mangler, er en tom ring. Tallet ved hvert atom er
elektronegativiteten. Tre bidder:

1. **Gæt:** eleven skriver sit gæt i opgavekortet. Knappen er Giv hint og så
   Spring gættet over.
2. **Fordel:** eleven trækker hvert elektronpar i en binding hen til det
   atom, der trækker hårdest (eller klikker på parret og så på atomet). Et par
   mellem to ens atomer deles, én elektron (eller to) til hver. Et par hos
   det forkerte atom bliver rødt, og linjen siger hvorfor. Parrene, der
   mangler, banker stille.
3. **Regnskabet:** hvert atom får en ring om sine elektroner og sit
   oxidationstal. Panelet viser valenselektronerne, dem, atomet har nu, og
   forskellen med almindelige tal og oxidationstallet med romertal (6 − 7 = −1,
   −I), og summen står på tavlen. Gættet bliver grønt eller rødt.

Reglerne og elektronerne giver forskellige tal for H₂O₂ og OF₂ (og
selvtesten tjekker, at det kun er de to), så et gæt efter reglerne bliver
rødt netop dér. H₂ og O₂ passer med reglen om grundstoffer.

## Kemichael

Den rolige udgave fra sc4.5 og sc5.1 (`NK.RoligLaerer` i `js/laerer.js`):
han sidder bag katederet, siger kun noget ved Giv hint og Vis svaret, tier,
når trinnet er løst, og kan sendes ud (så står hintene i opgavekortet).
Ingen Start præsentation / Nej tak. K får ham til at sige, hvor man er, og
hvad man gør. Påskeæg: et elektronpar sluppet over hans kop ("Min kaffe er
neutral. Lad den blive det."). Klik på koppen og på ham som i de andre.

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
index.html          toplinje, de to faner, teori og rundvisning
css/stil.css        alt udseende (grundlaget er sc5.1; nederst tavlen,
                    brikkerne, listen, gættet og regnskabet). NB: decimaltal
                    med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, lærred (som sc5.1)
js/data.js          grundstofferne, de 31 stoffer, de 12 molekyler med
                    tegning og forklaring, og Kemichaels replikker
js/ox.js            modellen: oxidationstal efter reglerne, læsning af
                    felterne, beskederne til fejlene og elektronregnskabet
js/sprites.js       katederet (Kemichaels egne sprites kommer fra v2)
js/tegning.js       væggen, tavlen på fane 2, prikkerne og klammerne
js/laerer.js        Kemichael ved katederet (som sc5.1, egen nøgle)
js/fane.js          det fælles: listen, knappen, linjen og musen
js/sim_regler.js    fane 1
js/sim_elektroner.js fane 2
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

Et nyt stof på fane 1 er én linje i `D.REGLER`. Et nyt molekyle på fane 2
er atomerne i gitteret, bindingerne med orden og en forklaring i
`D.MOLEKYLER`; de frie par regnes ud af valenselektronerne.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>R</kbd> start forfra · <kbd>H</kbd>
rundvisning · <kbd>T</kbd> teori · <kbd>K</kbd> Kemichael · <kbd>Enter</kbd>
tjek · <kbd>Esc</kbd> luk. Direkte links: `#regler` og `#elektroner`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod
(Kemichael hentes derfra). Den tjekker oxidationstallene mod tabellen for de
31 stoffer og de 12 molekyler, at summen er ladningen, at elektronerne passer
med valenselektronerne, at reglerne kun svigter for H₂O₂ og OF₂, at felterne
læser romertal og tal, beskederne til de typiske fejl, at alle opgaver kan
gennemføres ved at skrive, med musen og med Vis svaret, at der ikke står et
facit, før eleven har gjort noget, Kemichael inde og ude, sproget og
layoutet fra 1100 × 700 til 1600 × 950.
Sidst kørt: ALT OK (101 påstande), 26. september 2026.

## I menuen

I menuen fra 26. sept. 2026 som c8.2 i `kemi-c-filer/samling_c8.html`. De gamle
ligger i `kemi-c-filer/arkiv/c8.2_oxidationstal_regler_oldversion.html` og
`kemi-c-filer/arkiv/c8.3_oxidationstal_elektronegativitet_oldversion.html`. Den
har én knap; c8.3 er ikke længere en egen knap, og C8 er omnummereret uden
huller (3 Afstem Redox, 4 Kaliumpermanganat, 5 Jern i ståluld).
