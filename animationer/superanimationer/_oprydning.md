# Oprydning af superanimationer

Plan til Claude Code i VS Code. Brugeren starter den med én sætning, fx
"Udfør planen i animationer/superanimationer/_oprydning.md". Kør den kun, når
ingen anden session arbejder i `animationer/superanimationer/`. Slet filen,
når planen er udført.

## Målet

Mappen deles efter de to slags, så man kan se på stien, hvad en mappe er. De
fælles mapper bliver, hvor de er.

```
animationer/superanimationer/
├── README.md          læses først: begreberne, oversigten og kravene
├── superanimation/    ét begreb, op til fire faner
├── superlab/          ét forsøg på laboratoriets motor
├── laboratoriet/      motoren bag superlab (flyttes ikke)
└── kemichael/         læreren (flyttes ikke)
```

## 1. Flyt mapperne

Brug `git mv`, så historikken følger med.

| Til `superanimation/` | Til `superlab/` |
|-----------------------|-----------------|
| sb2.0_ligevaegt_intro | sb2.4_jernthiocyanat |
| sb3.2_titreringssimulator | sb2.4_ligevaegt |
| sc1.1_atombygger | sc1.3_knaldgas |
| sc2.1_salt_i_vand | sc2.5_faeldning |
| sc2.2_saltbygger | sc2.6_kobber_dibrom |
| sc3.1_elektronprikformler | sc2.7_blyiodid |
| sc3.2_rumlig_opbygning | sc6.8_substitution |
| sc3.4_blandbarhed | sc6.9_fedt_i_chips |
| | sc8.6_jern_i_staaluld |

`Claude outputs/` (tre skærmbilleder) flyttes til
`files/Kildefiler/superanimationer_skaermbilleder/`.

Er der kommet en ny `sb`- eller `sc`-mappe til, siden planen blev skrevet, så
placér den efter definitionerne i `README.md`. Spørg brugeren, hvis slagsen er
uklar.

## 2. Ret stierne i de flyttede mapper

Alle filtyper (html, js, css, md). Alt uden for den nye undermappe er nu ét
niveau længere væk:

* `../laboratoriet/` bliver `../../laboratoriet/`
* `../kemichael/` bliver `../../kemichael/`
* en henvisning til en mappe af den anden slags får den nye sti, fx
  `../../superlab/sc2.5_faeldning/`. Søstre af samme slags er uændrede.
* andre relative stier, der går ud af mappen (`../../kemi-c-filer/` osv.), får
  et `../` mere.

`kemichael.js` og `laboratoriet/js/sprites.js` finder deres egne sprites ud fra
scriptets placering (`document.currentScript`), så de skal ikke rettes.

## 3. Ret links udefra

* Samlingsfilerne: `animationer/samling_NV.html`,
  `animationer/kemi-c-filer/samling_*.html` og
  `animationer/kemi-b-filer/samling_*.html`. `superanimationer/<mappe>/` bliver
  `superanimationer/superanimation/<mappe>/` eller
  `superanimationer/superlab/<mappe>/`.
* Genvejen `animationer/kemi-c-filer/c1.1_atommodel_ioner.html` peger på sc1.1
  tre steder.
* `fuldSkaerm(filsti.indexOf('superanimationer/') >= 0)` i samlingerne virker
  uændret. Rør den ikke.
* Søg i hele repoet efter `superanimationer/` og efter hvert mappenavn, og ret
  resten. Spring `.git/`, `arkiv/` og `autocommit.log` over.

## 4. Ret dokumentationen

* `animationer/superanimationer/README.md`: stierne i oversigten (fx
  `superlab/sc2.7_blyiodid`), fjern `Claude outputs/` og afsnittet om, at
  animationerne på sigt kan lægges et lag længere nede, og skriv under Fælles
  opbygning, at en ny mappe lægges i `superanimation/` eller `superlab/`.
* Hver animations README: sætningen om, hvad mappen skal ligge ved siden af,
  og stierne i kodestumperne til menuen.
* `laboratoriet/README.md` og `kemichael/README.md`: forsøgene ligger nu i
  `../superlab/`, og stier til mønstre som `../sb2.4_ligevaegt/` rettes.
* `CLAUDE.md` i roden: stier og mønstre, fx `sc6.8_substitution/...` og
  `animationer/superanimationer/sc2.2_saltbygger/js/kerne.js`.
* `README.md` i roden: mappetræet viser `superanimationer\` i roden. Ret det
  til `animationer\superanimationer\`.

## 5. Tjek, at intet peger forkert

* Skriv et lille Node-script uden for repoet, der gennemgår alle `.html`-filer
  under `animationer/` og tjekker, at hver relativ sti i `src=`, `href=` og
  `visAnimation(this, '...')` peger på en fil, der findes. Spring `http`, `#`,
  `mailto:`, `data:` og `javascript:` over.
* Søg efter `superanimationer/sb` og `superanimationer/sc` uden
  `superanimation/` eller `superlab/` imellem. Der må ikke være nogen uden for
  `arkiv/` og `.git/`.
* Ret det, der fejler, og kør tjekket igen, til det er rent.
* Åbn til sidst én superanimation og én superlab-animation gennem en lokal
  server og se, at de starter uden fejl i konsollen.

## 6. Afslut

Slet denne fil. Fortæl brugeren kort og uden kodesprog, hvad der er flyttet,
og at links, der går direkte til en animations egen adresse uden om
samlingerne, har skiftet adresse. Links gennem samlingerne virker som før.
