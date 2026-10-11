# sb4.6 Geometrisk isomeri

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b6.1_geometrisk_isomeri.html`, som står
i menuen B3 som knap 2 "Geometrisk isomeri". Den er **ikke i menuen endnu**;
den gamle ligger urørt, til brugeren siger til.

## Ombygningen 10. oktober 2026

Brugeren efter at have prøvet den med elever: "Kan du så lave en udgave hvor
spillet handler om cis eller trans (og så lad det være en ekstra valgfri
feature om man vil træne E/Z)? Jeg synes desuden opgaven er lidt forvirrende
med at vende molekylet ind i sig selv (fane 1 opgave 4) ... der er lidt for
mange knapper man kan trykke på, og der kommer for mange tekstbeskeder nede i
bunden (mens selve opgaven står beskrevet i højre øvre hjørne). Forsøg at gøre
animationen lidt mindre forvirrende ved at samle teksten 1 sted, og ikke lade
den køre rundt for meget."

Det blev til (udformningen er Claudes; brugeren har ikke set den endnu):

* **Spillet handler om cis og trans.** E og Z vælges i panelet ("Spillet
  handler om") og har sin egen rekord. Fanerne står nu i rækkefølgen
  Dobbeltbindingen, Cis eller trans?, E og Z (ekstra).
* **Al tekst på ét kort øverst i scenen** på alle tre faner: opgavens navn,
  det skridt, eleven er ved, og under det én linje til hint, fejl og
  forklaring, med den gule knap til højre. Statuslinjen nederst og
  opgavekortet i panelet er væk. Pladsen til kortet er sat af fra start, så
  figuren står stille.
* **Bytteopgaverne (fane 1, opgave 4 til 6)** har to molekyler side om side:
  A står fast, B er en kopi. Tre skridt, ét ad gangen: klik på CH₃ i B, tryk
  Vend B om, svar Samme stof eller Nyt stof. Kun skridtets knapper er fremme.
  Det grå omrids, molekylet blev vendt ind i, er væk. Ringene (grøn: sidder
  som i A, rød: gør ikke) kommer først, når eleven har svaret.
* Færre beskeder ved klik i scenen.

Afsnittene nedenfor er rettet til, så de beskriver animationen, som den er nu.

## Bestillingen (2. oktober 2026)

Brugeren: "Lav sb4.6 om til en superanimation". sb4.6 er knap 6 i B4.

1. **Pointen:** En dobbeltbinding kan ikke drejes, så grupperne kan sidde på
   to måder. Hvilken af dem, der er E og Z, afgøres af gruppen med højest
   prioritet på hvert C-atom, og har et C-atom to ens grupper, er der kun én
   form.
2. **Afløser b6.1, og det skal med:** de fire pladser omkring C=C, hvor et
   klik skifter gruppe; atomnummeret som prioritet; markeringen af de to
   vindere; E, Z og Ingen isomeri; spillet med 15 runder, 50 point og bonus
   for fart (2, 3, 4 og 10 sekunder), stimen og rangerne fra Kemi-novice til
   Nobelpris-kandidat med de samme grænser. Taget ud: konfettien og den
   opfundne regel, hvor ethyl havde atomnummer 7. Nyt: fane 1 (hvorfor der
   er to former) og den rigtige regel for næste atom, så CH₂CH₃ slår CH₃
   fordi C slår H.
3. **Naboerne:** `sc6.2_zigzagformler` ejer den klassiske cis/trans i navne
   på C-niveau, og molekylemotoren tegner kun den. `sb4.7` ejer
   spejlbilledisomeri og R/S. Her er der ingen navngivning af molekylerne.
4. **Loftet:** tre faner, ti grupper (H, CH₃, CH₂CH₃, CH₂OH, COOH, OCH₃, F,
   Cl, Br, I), fire pladser. Dobbeltbindingen har seks opgaver, E og Z tolv,
   spillet femten molekyler pr. spil.
5. **Layoutet:** scene plus panel. Kortet med al teksten står øverst i
   scenen, svarknapperne nederst under figuren.

## Fane 1: Dobbeltbindingen

Kuglemodellen af to C-atomer set lidt fra siden. Seks opgaver:

* **Butan:** eleven tager fat i den højre halvdel og drejer, til de to CH₃
  står på samme side. En enkeltbinding drejer frit.
* **But-2-en:** samme forsøg. Dobbeltbindingen drejer højst 20°, stregerne
  bliver røde, og den fjedrer tilbage. Et hårdt forsøg løser opgaven.
* **1,2-dichlorethen:** A (cis) og B (trans) side om side. Er de det samme
  stof? Svaret viser kogepunkterne, 60 °C og 48 °C.
* **Propen, but-2-en og 2-methylbut-2-en:** A og B side om side. Eleven
  bytter CH₃ og H til venstre i B (klik, eller træk den ene ned på den anden),
  vender B om og svarer, om B er det samme stof som A. For but-2-en får A og B
  navnene cis-but-2-en og trans-but-2-en, når opgaven er løst.

En pulserende pil viser, hvad der kan trækkes, til eleven har rørt molekylet.

## Fane 2: Cis eller trans? (spillet)

Spillet fra den gamle med de samme tal. 15 molekyler: seks cis, seks trans og
tre uden cis/trans-isomeri. Reglen (`NK.CT` i `js/ez.js`): de to C-atomer har
en gruppe, der er ens; sidder de to ens grupper på samme side, er det cis.
Grupperne er H, CH₃, CH₂CH₃, Cl, Br, F og COOH, med H som den hyppigste. En
streg på tavlen viser tiden. Efter hvert svar ringes de to ens grupper ind; et
rigtigt svar går selv videre, et forkert venter på Næste molekyle. Tasterne C,
T og I.

Med **E og Z** valgt i panelet er det den gamles spil: seks E, seks Z og tre
uden isomeri, og tre af E og Z er fælder (den samme gruppe på begge C-atomer,
men den vinder kun det ene sted). Tasterne E, Z og I. Hvert emne har sin
rekord i browseren.

## Fane 3: E og Z (ekstra)

Strukturformlen på en tavle, som i bogen: C=C med grupperne i 120°, og det
atom, der binder, lige for enden af stregen (H₃C til venstre, CH₃ til højre).

* **Otte molekyler** (Let, Middel, Svær). Eleven klikker på vinderen på hvert
  C-atom i vilkårlig rækkefølge og vælger så E, Z eller Ingen E/Z-isomeri
  under tavlen. Kortet viser det trin, eleven er ved (Trin 1 af 3). Et rigtigt svar godtages
  også, før vinderne er fundet. Et forkert klik viser atomnumrene på den side.
* **Byg selv** (fire opgaver): grupperne trækkes fra rækken under tavlen hen
  på pladserne, et klik på en plads skifter gruppe som i den gamle, og en
  gruppe trukket af tavlen fjerner den. Kravene: Z med Br og Cl, E med de to
  CH₃ på samme side, ingen isomeri uden H, Z med fire forskellige grupper.

Panelet har atomnumrene for de otte grundstoffer.

## Beskederne

Alt er regnet af grupperne (`js/ez.js`):

| Fejlen | Beskeden |
|--------|----------|
| Z, når den samme gruppe sidder på samme side, men ikke vinder begge steder | De to CH₃ sidder på samme side, men det er ikke dem, der tæller … |
| Den lange gruppe valgt over et enkelt atom | Det er ikke gruppens størrelse, der tæller, men atomnummeret … |
| E eller Z, når et C-atom har to ens grupper | Det venstre C-atom har to ens grupper … |
| Ingen, når der er isomeri | Begge C-atomer har to forskellige grupper, så der findes to former |

Hjælpen er hinttrappen fra sc1.4 på kortet øverst i scenen: to eller tre trin
pr. skridt og så Vis svaret, som kun løser det skridt, man er ved. Der er
ingen lærer.

Påskeæg: fire H i Byg selv er ethen, der får bananer til at modne.

## Forenklinger

* Prioriteten er den korte udgave af Cahn-Ingold-Prelog: første atom, så de
  atomer, der sidder på det. Grupperne er valgt, så det altid er afgjort
  efter andet trin. En C=O tæller som to O.
* Kuglemodellen har faste bindingslængder og vinkler (120° og 109,5°), og
  CH₃ og de andre grupper er én kugle.
* På fane 1 er byttet et tankeeksperiment: grupperne flyver ud og bytter
  plads, så det ikke ligner en drejning.
* Spillet med cis og trans har kun molekyler, hvor de to C-atomer har en
  gruppe, der er ens, eller hvor et C-atom har to ens grupper.

## Filer

```
index.html          toplinje, de tre faner, teori og rundvisning
css/stil.css        udseende (grundlaget er sc1.4; nederst knapperne i
                    scenen, trinlisten, atomnumrene og pointene)
js/kerne.js         NK-navnerum, lærred og tekst (som sc1.4)
js/data.js          grupperne, atomnumrene og opgaverne
js/ez.js            modellen: prioriteten, E og Z, cis og trans (NK.CT),
                    beskederne og hintene
js/tegning.js       tavlen, strukturformlen, brikkerne, stemplet og kuglerne
js/fane.js          kortet øverst i scenen, knappen, listen og musen
                    (Dobbeltbindingen og E og Z)
js/sim_drej.js      Dobbeltbindingen
js/sim_prioritet.js E og Z (ekstra)
js/sim_spil.js      spillet, cis og trans eller E og Z
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>C</kbd> <kbd>T</kbd>
<kbd>I</kbd> svar (<kbd>E</kbd> <kbd>Z</kbd> <kbd>I</kbd> med E og Z) · <kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning ·
<kbd>T</kbd> teori · <kbd>Enter</kbd> tjek eller næste · <kbd>Esc</kbd> luk.
Direkte links: `#drej`, `#spil` og `#ez`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker prioriteten
for alle par, E og Z for alle 10 000 molekyler mod en uafhængig udregning,
opgavernes facit og byg-kravene, beskederne til fælderne, at alle opgaver
kan løses selv (med stjerne) og med Vis svaret (uden), hinttrapperne,
drejningen, fjederen og bytteopgavernes tre skridt på fane 1, cis og trans
for alle molekyler, spillets point og fælder i begge emner, sproget, at
kortet øverst holder sig inden for den plads, der er sat af, og layoutet fra
1100 × 700 til 1600 × 950.
Sidst kørt: ALT OK (154 påstande), 10. oktober 2026.

## I menuen

Ikke endnu. Når brugeren siger til: `kemi-b-filer/samling_b_bindinger_isomeri.html`, knap
2 (`data-emne="b6geo"`), skal pege på
`../superanimationer/sb4.6_geometrisk_isomeri/index.html`, den gamle flyttes
med `git mv` til `kemi-c-filer/arkiv/b6.1_geometrisk_isomeri_oldversion.html`,
og kolonnen "I menuen" i superanimationernes README rettes.
