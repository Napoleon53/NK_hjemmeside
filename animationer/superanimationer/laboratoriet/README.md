# Laboratoriet

Den fælles kode for superanimationerne om laboratorieforsøg. Det, der er ens
i forsøgene, ligger her, så en rettelse kun laves ét sted. Hvert forsøg har
stadig sin egen mappe med forløb, model, mikrovisning, quizspørgsmål,
Kemichael-scener og det, der er særligt for netop det forsøg.

Bruges af sc1.3 Knaldgas, sc2.5 Fældning, sc2.6 Kobber og dibrom, sc2.7
Blyiodid, sc6.8 Substitution, sc6.9 Fedt i chips, sc8.6 Jern i ståluld og
sb2.4 Jernthiocyanat. Forsøgene henter filer herfra og skal derfor ligge ved
siden af denne mappe, ligesom med `kemichael/`.

## Filer

```
js/kerne.js          NK: hjælpefunktioner, kemisk notation, farver, positurer,
                     væskeniveau, lærred og tegnehjælpere
js/rundvisning.js    spotlight-rundvisningen bag hjælpeknappen
css/grund.css        farver, toplinje, scene og panel, kort, forløb, quiz,
                     knapper, overlays, tegneserie og rundvisning
```

## Sådan bruger et forsøg mappen

1. Stilark: grundstilen først, forsøgets eget stilark bagefter. Forsøgets
   `css/stil.css` har kun det, der er særligt for forsøget, fx et
   måleskema eller en anden panelbredde.
   ```html
   <link rel="stylesheet" href="../laboratoriet/css/grund.css">
   <link rel="stylesheet" href="css/stil.css">
   ```
2. Kernen indlæses først af alle scripts, rundvisningen lige før `app.js`:
   ```html
   <script src="../laboratoriet/js/kerne.js"></script>
   ...
   <script src="../laboratoriet/js/rundvisning.js"></script>
   <script src="js/tur.js"></script>
   <script src="js/app.js"></script>
   ```
3. Rundvisningens stop står i forsøgets `js/tur.js`:
   ```js
   NK.Rundvisning.tur([
       { sel: "#scene", titel: "Stinkskabet", tekst: "..." },
       ...
   ]);
   ```

## Regler

* En funktion i `kerne.js` må ikke ændre betydning, uden at alle forsøg er
  tjekket. Ny funktionalitet lægges til; gammel fjernes kun, når intet forsøg
  bruger den.
* `grund.css` må kun have regler, der gælder alle forsøg. Et forsøg, der vil
  noget andet, overskriver i sin egen `stil.css`.
* Panelet er 430 px bredt (`--panel-bredde`). sc2.6 og sc6.9 overskriver til
  340 px fra dengang, de blev lavet.
* sc1.3 og sc2.5 er ældre og har et andet sidelayout (graf under scenen,
  trin i scenen). De bruger `kerne.js` og `rundvisning.js`, men har stadig
  hele deres eget stilark.

## Næste skridt

Samme øvelse for det, der er næsten ens, men endnu ligger i hvert forsøg:
`lyd.js`, rammen for `quiz.js`, `tegneserie.js` og `app.js`, og derefter
udstyret i `scene.js` og `bord.js` (stråler, dråber, damp, varmeplade, stativ,
ur, vejebåd og glas), så det tegnes og gribes ens alle steder. Til sidst et
rum, hvor forsøgene er stationer, man kan gå imellem.
