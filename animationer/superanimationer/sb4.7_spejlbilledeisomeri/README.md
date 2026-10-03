# sb4.7 Spejlbilledeisomeri

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` (fane 2) og virker også, når den
åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b6.2_spejlbilledeisomeri.html`, som står
i menuen B4 (Organisk B) som knap 7 "Spejlbilledeisomeri". Den er **ikke i
menuen endnu**; den gamle ligger urørt, til brugeren siger til.

## Bestillingen (2. oktober 2026)

Brugeren: "lav sb.4.7 om til en superanimation". sb4.7 er knap 7 i B4.

1. **Pointen:** Et C-atom med fire forskellige grupper giver to molekyler, der
   er hinandens spejlbilleder og ikke kan drejes over i hinanden. R og S siger
   hvilket, ud fra prioriteterne set med gruppe 4 vendt væk.
2. **Afløser b6.2, og det skal med:** kuglemodellen, der drejes med musen,
   bromchlorfluormethan, prioriteternes numre (①-④, "Vis tal (CIP)"), Skift
   enantiomer (nu: byt to grupper på fane 1), Auto-orienter (nu: Vis svaret i
   trinnet Drej på fane 3) og buen 1 → 2 → 3 med det store R eller S. Nyt:
   spejlet (fane 1), at finde det asymmetriske C-atom i rigtige molekyler
   (fane 2), og at eleven selv nummererer, drejer og svarer.
3. **Naboerne:** `sb4.6` ejer E og Z og prioriteten ved en dobbeltbinding.
   `sc6.2` og molekylemotoren ejer navngivningen. Her bruges motoren kun til
   at tegne molekylerne på fane 2. Optisk aktivitet og polarimetri er ikke med.
4. **Loftet:** tre faner. Fane 1 har seks molekyler, fane 2 tretten, fane 3
   syv (hvert som R eller S). Tolv grupper: H, F, Cl, Br, I, OH, NH₂, CH₃,
   CH₂CH₃, CH₂OH, CHO og COOH.
5. **Layoutet:** scene plus panel som sc1.4, svarknapperne i scenen over
   statuslinjen.

## Fane 1: Spejlbilledet

Til venstre molekylet, til højre spejlbilledet og et spejl imellem. Eleven
drejer molekylet med musen (som en kugle). Slipper eleven inden for 40° af en
stilling, hvor kuglerne ligger oven i spejlbilledets, klikker det på plads, og
grønne og røde ringe viser, hvilke grupper der passer ("2 af 4 grupper
passer"). Fire passer kun, når to grupper er ens.

* Bromchlormethan og propan-2-ol kan drejes på plads.
* Bromchlorfluormethan, butan-2-ol og alanin kan ikke: eleven trykker Det kan
  ikke lade sig gøre (et forkert tryk ved de andre giver en forklaring).
* Opgave 3: eleven klikker på to grupper, de bytter plads, og så kan
  molekylet drejes på plads. At bytte to grupper giver spejlbilledet.

Startstillingen ligger 60° fra den nærmeste stilling, der passer, så det
kræver en rigtig drejning. Påskeæg: et klik på spejlet fortæller om carvon,
der dufter af mynte eller kommen.

## Fane 2: Find C-atomet

Molekylet på en tavle som zigzagformel, tegnet af molekylemotoren. Eleven
klikker på de asymmetriske C-atomer (de får en stjerne som i bogen) og trykker
Tjek, eller trykker Intet asymmetrisk C-atom. Vis alle H tegner
strukturformlen med alle atomer. 13 molekyler: butan-2-ol, propan-2-ol,
2-chlorbutan, 2-methylbutan, mælkesyre, alanin, butanon, 3-methylhexan,
3-methylpentan, glyceraldehyd, vinsyre (to), citronsyre (ingen) og ibuprofen.

De asymmetriske C-atomer regnes af `js/kiral.js` ud fra grafen: et C med fire
grupper, der alle er forskellige som træer (ringe lukkes, så de to veje rundt i
en ring kan skelnes). Et forkert C-atom får grunden: tre H, to H, en
dobbeltbinding eller to ens grupper med formlen (to ens grupper: CH₂COOH og
CH₂COOH). Hint 2 slår Vis alle H til; hint 3 lyser det C-atom op, det handler om.

## Fane 3: R eller S

Kuglemodellen i tre bidder, vist som trin i opgavekortet:

1. **Nummer:** eleven klikker på grupperne i prioritetens rækkefølge. Den
   sidste får nummer 4 af sig selv. Et forkert klik siger, hvilke grupper der
   er tilbage, med deres første atom.
2. **Drej:** eleven drejer, til gruppe 4 peger væk. Tæt på (inden for ca. 25°)
   klikker det på plads.
3. **R eller S:** knapperne R (med uret) og S (mod uret). Bagefter tegnes buen
   1 → 2 → 3 og bogstavet.

Rækkefølgen er ikke låst: et rigtigt svar godtages når som helst. Et forkert
svar får en besked efter, hvor eleven er (ikke nummereret, ikke drejet, eller
gruppe 4 peger mod en). Molekylet er tilfældigt R eller S og tilfældigt drejet,
hver gang opgaven begynder.

## Forenklinger

* Prioriteten er den korte udgave af Cahn-Ingold-Prelog som i sb4.6. En C=O
  tæller som to O, så COOH slår CHO, der slår CH₂OH.
* Kuglemodellen har et regulært tetraeder og faste længder; grupperne er én
  kugle hver.
* R og S regnes som fortegnet på v1 · (v2 × v3) (negativt er R i et system med
  y nedad og z ind i skærmen). Selvtesten tjekker det mod det, man ser på
  skærmen.

## Filer

```
index.html         toplinje, de tre faner, teori og rundvisning
css/stil.css       udseende (samme som sb4.6)
js/kerne.js        NK-navnerum, lærred og tekst (som sc1.4)
js/data.js         grupperne, molekylerne og opgaverne
js/tegning.js      tavlen, stemplet og kuglerne (som sb4.6)
js/rum.js          kvaternioner, tetraederet, justeringerne og tegningen
js/kiral.js        prioriteten, R og S og de asymmetriske C-atomer
js/fane.js         statuslinjen, knappen, listen og musen (som sb4.6)
js/sim_spejl.js    fane 1
js/sim_find.js     fane 2
js/sim_rs.js       fane 3
js/rundvisning.js  rundvisningen bag ?
js/app.js          faneskift, tastatur og tegneløkken
_selvtest.html     udviklerværktøj, se nedenfor
```

Fra molekylemotoren: `molekyle.js`, `navngivning.js`, `smiles.js`,
`layout.js` og `struktur.js`.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>R</kbd> forfra ·
<kbd>H</kbd> rundvisning · <kbd>T</kbd> teori · <kbd>Enter</kbd> tjek ·
<kbd>Esc</kbd> luk. Direkte links: `#spejl`, `#find` og `#rs`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod.
Den tjekker prioriteten, at R er med uret på skærmen i 300 tilfældige
stillinger, at R og S ikke ændrer sig ved en drejning men skifter i et spejl og
ved et bytte, de 12 justeringer, at fire forskellige grupper højst giver 2 af 4,
startstillingen, de asymmetriske C-atomer og grundene på fane 2, at alle
opgaver kan løses selv og med Vis svaret, sproget og layoutet fra 1100 × 700
til 1600 × 950.
Sidst kørt: ALT OK (89 påstande), 2. oktober 2026.

## I menuen

Ikke endnu. Når brugeren siger til: `kemi-b-filer/samling_b4,5,6.html`, knap
7 (`data-emne="b6spejl"`), skal pege på
`../superanimationer/sb4.7_spejlbilledeisomeri/index.html`, den gamle flyttes
med `git mv` til `kemi-c-filer/arkiv/b6.2_spejlbilledeisomeri_oldversion.html`,
og kolonnen "I menuen" i superanimationernes README rettes.
