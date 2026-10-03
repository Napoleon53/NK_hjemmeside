# sb4.6 Geometrisk isomeri

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b6.1_geometrisk_isomeri.html`, som står
i menuen B4 (Organisk B) som knap 6 "Geometrisk isomeri". Den er **ikke i
menuen endnu**; den gamle ligger urørt, til brugeren siger til.

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
   Cl, Br, I), fire pladser. Fane 1 har seks opgaver, fane 2 tolv, fane 3
   femten molekyler pr. spil.
5. **Layoutet:** scene plus panel som sc1.4. Svarknapperne står i scenen lige
   over statuslinjen, fordi øjnene er der.

## Fane 1: Dobbeltbindingen

Kuglemodellen af to C-atomer set lidt fra siden. Seks opgaver:

* **Butan:** eleven tager fat i den højre halvdel og drejer, til de to CH₃
  står på samme side. En enkeltbinding drejer frit.
* **But-2-en:** samme forsøg. Dobbeltbindingen drejer højst 20°, stregerne
  bliver røde, og den fjedrer tilbage. Et hårdt forsøg løser opgaven.
* **1,2-dichlorethen:** A (cis) og B (trans) side om side. Er de det samme
  stof? Svaret viser kogepunkterne, 60 °C og 48 °C.
* **Propen, but-2-en og 2-methylbut-2-en:** eleven bytter CH₃ og H til
  venstre (træk den ene ned på den anden, eller klik), vender hele molekylet
  og sammenligner med et gråt omrids af molekylet, som det var. Grønne og
  røde ringe viser, hvad der passer. Samme stof eller nyt stof?

En pulserende pil viser, hvad der kan trækkes, til eleven har rørt molekylet.

## Fane 2: Prioriteten

Strukturformlen på en tavle, som i bogen: C=C med grupperne i 120°, og det
atom, der binder, lige for enden af stregen (H₃C til venstre, CH₃ til højre).

* **Otte molekyler** (Let, Middel, Svær). Eleven klikker på vinderen på hvert
  C-atom i vilkårlig rækkefølge og vælger så E, Z eller Ingen E/Z-isomeri
  under tavlen. Opgavekortet har de tre trin med ✓. Et rigtigt svar godtages
  også, før vinderne er fundet. Et forkert klik viser atomnumrene på den side.
* **Byg selv** (fire opgaver): grupperne trækkes fra rækken under tavlen hen
  på pladserne, et klik på en plads skifter gruppe som i den gamle, og en
  gruppe trukket af tavlen fjerner den. Kravene: Z med Br og Cl, E med de to
  CH₃ på samme side, ingen isomeri uden H, Z med fire forskellige grupper.

Panelet har atomnumrene for de otte grundstoffer.

## Fane 3: E eller Z?

Spillet fra den gamle med de samme tal. 15 molekyler: seks E, seks Z og tre
uden isomeri, og tre af E og Z er fælder (den samme gruppe på begge C-atomer,
men den vinder kun det ene sted). En streg på tavlen viser tiden. Efter hvert
svar vises prioriteterne; et rigtigt svar går selv videre, et forkert venter
på Næste, så forklaringen kan læses. Rekorden huskes i browseren. Tasterne E,
Z og I.

## Beskederne

Alt er regnet af grupperne (`js/ez.js`):

| Fejlen | Beskeden |
|--------|----------|
| Z, når den samme gruppe sidder på samme side, men ikke vinder begge steder | De to CH₃ sidder på samme side, men det er ikke dem, der tæller … |
| Den lange gruppe valgt over et enkelt atom | Det er ikke gruppens størrelse, der tæller, men atomnummeret … |
| E eller Z, når et C-atom har to ens grupper | Det venstre C-atom har to ens grupper … |
| Ingen, når der er isomeri | Begge C-atomer har to forskellige grupper, så der findes to former |

Hjælpen er statuslinjen og hinttrappen fra sc1.4: tre trin pr. skridt og så
Vis svaret, som kun løser det skridt, man er ved. Der er ingen lærer.

Påskeæg: fire H på fane 2 er ethen, der får bananer til at modne.

## Forenklinger

* Prioriteten er den korte udgave af Cahn-Ingold-Prelog: første atom, så de
  atomer, der sidder på det. Grupperne er valgt, så det altid er afgjort
  efter andet trin. En C=O tæller som to O.
* Kuglemodellen har faste bindingslængder og vinkler (120° og 109,5°), og
  CH₃ og de andre grupper er én kugle.
* På fane 1 er byttet et tankeeksperiment: grupperne flyver ud og bytter
  plads, så det ikke ligner en drejning.

## Filer

```
index.html          toplinje, de tre faner, teori og rundvisning
css/stil.css        udseende (grundlaget er sc1.4; nederst knapperne i
                    scenen, trinlisten, atomnumrene og pointene)
js/kerne.js         NK-navnerum, lærred og tekst (som sc1.4)
js/data.js          grupperne, atomnumrene og opgaverne
js/ez.js            modellen: prioriteten, E og Z, beskederne og hintene
js/tegning.js       tavlen, strukturformlen, brikkerne, stemplet og kuglerne
js/fane.js          statuslinjen, knappen, listen og musen (fane 1 og 2)
js/sim_drej.js      fane 1
js/sim_prioritet.js fane 2
js/sim_spil.js      fane 3
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>E</kbd> <kbd>Z</kbd>
<kbd>I</kbd> svar · <kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning ·
<kbd>T</kbd> teori · <kbd>Enter</kbd> tjek eller næste · <kbd>Esc</kbd> luk.
Direkte links: `#drej`, `#prioritet` og `#spil`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker prioriteten
for alle par, E og Z for alle 10 000 molekyler mod en uafhængig udregning,
opgavernes facit og byg-kravene, beskederne til fælderne, at alle opgaver
kan løses selv (med stjerne) og med Vis svaret (uden), hinttrapperne,
drejningen, fjederen, byttet og omridset på fane 1, spillets point og
fælder, sproget og layoutet fra 1100 × 700 til 1600 × 950.
Sidst kørt: ALT OK (102 påstande), 2. oktober 2026.

## I menuen

Ikke endnu. Når brugeren siger til: `kemi-b-filer/samling_b4,5,6.html`, knap
6 (`data-emne="b6geo"`), skal pege på
`../superanimationer/sb4.6_geometrisk_isomeri/index.html`, den gamle flyttes
med `git mv` til `kemi-c-filer/arkiv/b6.1_geometrisk_isomeri_oldversion.html`,
og kolonnen "I menuen" i superanimationernes README rettes.
