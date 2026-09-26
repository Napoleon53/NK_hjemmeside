# Syregalgen

Galgespil med fagord. Hvert bogstav, der ikke er med, sender en klassekammerat
et skridt ud på en planke over et syrekar, og karret bliver surere. Efter seks
forkerte er det plask. Kategorien Spil.

Afløser `kemi-c-filer/c_spil_hangman.html` og `Historie/2.3.6_syregalgen_ideologier.html`,
som var to kopier af samme spil med hver sin ordliste. Nu er det ét spil med to lister.

## Hvad der er taget med, og hvad der er nyt

Taget med fra den gamle:

* Fagordene og forklaringerne efter hvert ord. Enkelte forklaringer er rettet:
  grænsen for tungtopløselig er 1 g pr. 100 mL som i sc2.3, ikke 2 g, og i
  historielisten åbnede jernbanen i 1830, og Burke skrev i 1790.
* Syrebadet, farven, der skifter med faren, og Syreimmun efter fem ord i træk.
  Escape-rummet i `kemi-c-filer/c_spil_escaperoom.html` spørger til det i segl 2.
* Ingen gentagelse, før alle ord i de valgte områder har været der.

Nyt:

* **Træningsområder.** Kemi C er delt i menuens otte kapitler (C1 Atomer til C8
  Redox), historie i fem emner. Eleven vælger et eller flere; ingen valgt er alle.
  Valget huskes i browseren. Vælges et område midt i et ord, gælder det fra næste ord.
* **Ordlisten er udvidet** fra 95 til 196 kemiord.
* **Ledetråden** er en kort definition uden ordet og koster et skridt. Den kan ikke
  købes med det sidste skridt. Én knap i trin: Ledetråd, Vis ordet, Næste ord.
* **Klassekammeraten** i kittel med sikkerhedsbrillerne på panden i stedet for på
  øjnene. Syv udseender på skift. Kun brillerne kommer op efter et plask.
* **pH-meteret.** Karret starter ved pH 7 og falder én pH-enhed pr. forkert
  bogstav, med universalindikatorens farver fra grøn til rød.
* **Kemichael** kommer kun efter et plask, siger én replik og går igen (brugerens
  valg 24. sept. 2026). Han præsenterer ikke spillet, og der er intet tilbud om en
  præsentation. Plasket skrives i hans uheldsregnskab.
* Hele tal i pointene, dansk i toplinjen, og teksten "Du afstemte reaktionen korrekt"
  fra et andet spil er væk.

## Filer

```
index.html          siden
css/stil.css        stilarket
js/kerne.js         fælles hjælpere (som i sc_spil_lykkehjul)
js/ordlister.js     ordene som tekst, én linje pr. ord
js/spil.js          reglerne, uden tegning
js/kar.js           scenen: laboratoriet, planken, karret og klassekammeraten
js/sprites.js       lager til Kemichaels sprites
js/laerer.js        Kemichael efter et plask og hans replikker
js/app.js           siden: ordet, tastaturet, områderne og knappen
_selvtest.html      udviklerværktøj, kræver en lokal server
```

## Hvad man kan rette i

* **Ord:** `js/ordlister.js`. Formatet står øverst i filen:
  `ORD ; ledetråd ; forklaring`, og `Område id: Navn` begynder et nyt område.
  Ledetråden må ikke nævne ordet; selvtesten fanger det.
* **Kemichaels replikker:** `REPLIKKER` i `js/laerer.js`, højst ca. 60 tegn.
* **Rosen ved Syreimmun:** `ROS` i `js/app.js`.
* **Skridt og point:** `SKRIDT` og `vind()` i `js/spil.js`.

## Links

`index.html#c3` vælger C3, `#c3+c4` to områder, `#historie` historielisten og
`#historie+socialisme` et af dens emner.

## Forenklinger

* pH falder én enhed pr. skridt for at gøre faren tydelig, ikke fordi et kar ville
  opføre sig sådan. Farverne er universalindikatorens.
* Kemichael taler også i historielisten. Karret er det samme.

## I menuen

I menuen fra 26. sept. 2026: spil.hangman (nr. 5) i
`kemi-c-filer/samling_c_spil.html` og 2.3.6 i `Historie/samling_2.3_ideologier.html`
med `index.html#historie`. De gamle ligger i
`kemi-c-filer/arkiv/c_spil_hangman_oldversion.html` og
`kemi-c-filer/arkiv/2.3.6_syregalgen_ideologier_oldversion.html`.
