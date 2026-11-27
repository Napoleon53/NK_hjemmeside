/* =====================================================================
   fagord.js - Kemibogens fagordslister (C og B) til Bundfald

   Lavet af _lav_fagord.py 2026-11-27 ud fra fagord/*.qmd og
   b/fagord/*.qmd i NK_Undervisning/Kemibogen. Ret ikke i haanden: ret i
   bogens fagordsliste, og koer scriptet igen.

   Hvert fagord er [fagord, brik, lang]: brikken er hele forklaringen,
   naar den er hoejst 90 tegn, ellers foerste saetning (samme regel som
   Kort og godt og bogens link). lang er kun med, naar den er laengere.
   ===================================================================== */
window.NK = window.NK || {};
NK.FAGORD = {
 "dato": "2026-11-27",
 "boeger": [
  {"id": "c", "navn": "Kemi C", "kapitler": [
   {"id": "c-kapitel-1", "nr": "1", "navn": "Atomer", "afsnit": [
    {"titel": "1.1 Hvad er kemi?", "ord": [
     ["makroniveau", "Den verden, vi kan se og måle på, for eksempel farver, temperatur og mængder."],
     ["mikroniveau", "Den usynlige verden af atomer og molekyler."],
     ["model", "Et forenklet billede af virkeligheden.", "Et forenklet billede af virkeligheden. Det bruges til at forklare det, man ser i et forsøg."],
     ["rent stof", "Det modsatte af en blanding. Et eksempel er vand uden noget i."],
     ["grundstof", "Består af kun én slags atomer. Guld og helium er eksempler."],
     ["det periodiske system", "Oversigten, hvor alle 118 grundstoffer står samlet."],
     ["atomsymbol", "Et eller to bogstaver, der står for et grundstof, for eksempel H eller Na."],
     ["metal", "Blankt grundstof, der leder strøm og varme godt, for eksempel jern og kobber."],
     ["ikke-metal", "Grundstof til højre for og over trappen i det periodiske system.", "Grundstof til højre for og over trappen i det periodiske system. Oxygen og carbon er eksempler."],
     ["halvmetal", "Grundstof lige ved trappen i det periodiske system, for eksempel silicium.", "Grundstof lige ved trappen i det periodiske system, for eksempel silicium. Grundstoffet ligner metaller på nogle punkter og ikke-metaller på andre."],
     ["kemisk forbindelse", "Stof, hvor atomer fra flere grundstoffer er bundet sammen, for eksempel vand."]
    ]},
    {"titel": "1.2 Atomet", "ord": [
     ["kerne", "Den lille, tunge del i midten af atomet. Den er bygget af protoner og neutroner."],
     ["elektron", "Partikel uden om atomets kerne. Den har ladningen −1 og vejer næsten ingenting."],
     ["proton", "Partikel i atomets kerne med ladningen +1."],
     ["neutron", "Partikel i atomets kerne uden ladning."],
     ["atomnummer", "Antallet af protoner i kernen. Det afgør, hvilket grundstof der er tale om."],
     ["elektrisk neutral", "Har lige mange protoner og elektroner.", "Har lige mange protoner og elektroner. De positive og negative ladninger ophæver derfor hinanden."],
     ["isotoper", "Atomer af samme grundstof med forskelligt antal neutroner."],
     ["nukleontal", "Det samlede antal protoner og neutroner i kernen, for eksempel 14 i carbon-14."],
     ["atommasse", "Gennemsnittet af, hvad et grundstofs isotoper vejer, målt i enheden u."]
    ]},
    {"titel": "1.3 Elektronskaller og det periodiske system", "ord": [
     ["skalmodel", "Niels Bohrs forenklede billede af atomet. Elektronerne er fordelt i lag omkring kernen."],
     ["skal", "Et af de lag omkring kernen, som elektronerne befinder sig i.", "Et af de lag omkring kernen, som elektronerne befinder sig i. Der er plads til 2 i det første og 8 i det næste."],
     ["elektronstruktur", "Tal i en parentes, der viser, hvor mange elektroner der er i hver skal.", "Tal i en parentes, der viser, hvor mange elektroner der er i hver skal. Chlor har (2, 8, 7)."],
     ["periode", "Vandret række i oversigten over grundstofferne. Rækkens nummer er antallet af skaller."],
     ["hovedgruppe", "Lodret kolonne, hvor atomerne har lige mange elektroner i yderste skal.", "Lodret kolonne, hvor atomerne har lige mange elektroner i yderste skal. Der er 8 af dem i det periodiske system."],
     ["undergruppe", "Kolonne midt i det periodiske system.", "Kolonne midt i det periodiske system. Her står kun metaller, og nummeret viser ikke antallet af elektroner i yderste skal."],
     ["valenselektroner", "Partiklerne i atomets yderste skal. Det er dem, der er med i kemiske reaktioner."],
     ["alkalimetaller", "Grundstofferne i hovedgruppe 1 uden hydrogen, for eksempel lithium, natrium og kalium."],
     ["halogener", "Grundstofferne i hovedgruppe 7, for eksempel fluor, chlor og brom."],
     ["ædelgasser", "Grundstofferne i hovedgruppe 8, for eksempel helium, neon og argon.", "Grundstofferne i hovedgruppe 8, for eksempel helium, neon og argon. De indgår ikke i kemiske reaktioner."],
     ["ædelgasreglen", "Atomer er mest stabile, når yderste skal ligner den hos grundstofferne i hovedgruppe 8."],
     ["oktetreglen", "Atomer er mest stabile, når de har 8 elektroner i yderste skal. Navnet kommer af tallet."]
    ]},
    {"titel": "1.4 Reaktionsskemaer og afstemning", "ord": [
     ["kemisk formel", "Viser med symboler og små tal, hvilke atomer et stof består af.", "Viser med symboler og små tal, hvilke atomer et stof består af. De små tal fortæller, hvor mange der er af hver slags."],
     ["kemisk reaktion", "Atomerne bliver sat sammen på en ny måde, så der dannes nye stoffer."],
     ["reaktionsskema", "Kemikerens opskrift: Formler og en pil viser, hvad der reagerer, og hvad der dannes."],
     ["reaktant", "Stof før pilen. Det er et af de stoffer, der reagerer med hinanden."],
     ["produkt", "Stof efter pilen. Det er et af de stoffer, der bliver dannet."],
     ["reaktionspil", "Tegnet mellem de stoffer, der reagerer, og de stoffer, der bliver dannet.", "Tegnet mellem de stoffer, der reagerer, og de stoffer, der bliver dannet. Det læses \"bliver til\"."],
     ["koefficient", "Det store tal foran en formel. Det viser, hvor mange molekyler der er."],
     ["afstemt", "Siges om et reaktionsskema, når der er lige mange atomer af hver slags før og efter pilen."],
     ["tilstandssymbol", "Bogstaver i en parentes efter en formel, for eksempel (s) eller (aq).", "Bogstaver i en parentes efter en formel, for eksempel (s) eller (aq). De viser, om stoffet er fast, flydende, en gas eller opløst i vand."]
    ]}
   ]},
   {"id": "c-kapitel-2", "nr": "2", "navn": "Ionforbindelser", "afsnit": [
    {"titel": "2.1 Ioner", "ord": [
     ["ion", "Atom, der har afgivet eller optaget elektroner og derfor har en ladning."],
     ["positiv ion", "Atom, der har afgivet elektroner, så det har flere protoner end elektroner.", "Atom, der har afgivet elektroner, så det har flere protoner end elektroner. Metaller danner den slags, for eksempel Na⁺."],
     ["negativ ion", "Atom, der har optaget elektroner, så det har flere elektroner end protoner.", "Atom, der har optaget elektroner, så det har flere elektroner end protoner. Ikke-metaller danner den slags, for eksempel Cl⁻."],
     ["ladning", "Viser, hvor mange elektroner en ion har afgivet eller optaget.", "Viser, hvor mange elektroner en ion har afgivet eller optaget. Skrives hævet efter atomsymbolet, for eksempel 2+ i Mg²⁺."]
    ]},
    {"titel": "2.2 Ioners navne", "ord": [
     ["natriumion", "Partiklen Na⁺, som findes i maden.", "Partiklen Na⁺, som findes i maden. Den er ufarlig og livsnødvendig, mens selve metallet reagerer voldsomt med vand."],
     ["jern(II)ion", "Partiklen Fe²⁺. Tallet i parentesen viser, at ladningen er +2."],
     ["jern(III)ion", "Partiklen Fe³⁺. Tallet i parentesen viser, at ladningen er +3."],
     ["-id", "De to bogstaver, som navnet på en negativ ion ender på. Ordet ion udelades da."],
     ["fluorid", "Den negative ion F⁻. Den er harmløs og findes i tandpasta."],
     ["chlorid", "Den negative ion Cl⁻. Sammen med Na⁺ danner den køkkensalt."],
     ["oxid", "Den negative ion af oxygen, O²⁻. Atomet har optaget to elektroner."],
     ["sulfid", "Den negative ion af svovl, S²⁻.", "Den negative ion af svovl, S²⁻. Navnet kommer af sulfur, som er svovls internationale navn."],
     ["nitrid", "Den negative ion af nitrogen, N³⁻. Atomet har optaget tre elektroner."],
     ["sammensat ion", "Gruppe af atomer, der er bundet til hinanden og har en fælles ladning.", "Gruppe af atomer, der er bundet til hinanden og har en fælles ladning. Den opfører sig som én samlet partikel."],
     ["hydroxid", "Den sammensatte ion OH⁻ med ladningen −1."],
     ["nitrat", "Den sammensatte ion NO₃⁻ med ladningen −1."],
     ["carbonat", "Den sammensatte ion CO₃²⁻ med ladningen −2."],
     ["sulfat", "Den sammensatte ion SO₄²⁻ med ladningen −2."],
     ["phosphat", "Den sammensatte ion PO₄³⁻ med ladningen −3."],
     ["ammonium", "Den sammensatte ion NH₄⁺.", "Den sammensatte ion NH₄⁺. Den er den eneste positive blandt de seks, der er værd at lære udenad."]
    ]},
    {"titel": "2.3 Ionforbindelser", "ord": [
     ["ionforbindelse", "Stof, der består af positive og negative partikler, som tiltrækker hinanden.", "Stof, der består af positive og negative partikler, som tiltrækker hinanden. Dannes typisk af et metal og et ikke-metal."],
     ["salt", "Andet navn for en ionforbindelse. Det, der bruges i køkkenet, hedder natriumchlorid."],
     ["ionbinding", "Den elektriske tiltrækning mellem partikler med modsat ladning, for eksempel Na⁺ og Cl⁻."],
     ["iongitter", "Det regelmæssige mønster, som partiklerne i et salt sidder tæt pakket i.", "Det regelmæssige mønster, som partiklerne i et salt sidder tæt pakket i. De er skiftevis positive og negative."],
     ["formelenhed", "Den mindste portion af et salt med ionerne i det rigtige forhold.", "Den mindste portion af et salt med ionerne i det rigtige forhold. I NaCl består den af én natriumion og én chloridion."]
    ]},
    {"titel": "2.4 Fældningsreaktioner", "ord": [
     ["letopløselig", "Siges om et salt, der kan opløses i store mængder i vand, for eksempel køkkensalt.", "Siges om et salt, der kan opløses i store mængder i vand, for eksempel køkkensalt. I fældningstabellen står der L."],
     ["tungtopløselig", "Siges om et salt, der næsten ikke kan opløses i vand, for eksempel kalk.", "Siges om et salt, der næsten ikke kan opløses i vand, for eksempel kalk. Normalt kan der opløses under 2 g i 100 mL vand, og i fældningstabellen står der T."],
     ["fældningstabel", "Oversigt med positive ioner øverst og negative ioner i venstre side.", "Oversigt med positive ioner øverst og negative ioner i venstre side. Et T viser, at de to danner et tungtopløseligt salt."],
     ["bundfald", "Fast stof, der dannes, når to saltopløsninger hældes sammen.", "Fast stof, der dannes, når to saltopløsninger hældes sammen. To af ionerne danner et tungtopløseligt salt."],
     ["fældningsreaktion", "Det, der sker, når to saltopløsninger hældes sammen, og der dannes et bundfald."],
     ["tilskuerion", "Partikel med ladning, der ikke er med i bundfaldet.", "Partikel med ladning, der ikke er med i bundfaldet. Den bliver i opløsningen og deltager ikke i reaktionen."],
     ["ionskema", "Opskrivning af en fældningsreaktion med formler og en pil.", "Opskrivning af en fældningsreaktion med formler og en pil. Kun de partikler, der danner bundfaldet, er med."]
    ]}
   ]},
   {"id": "c-kapitel-3", "nr": "3", "navn": "Molekyler", "afsnit": [
    {"titel": "3.1 Elektronparbindinger", "ord": [
     ["fælles elektronpar", "To elektroner, som to atomer deler.", "To elektroner, som to atomer deler. De hører til begge atomer på én gang og holder dem sammen."],
     ["elektronparbinding", "Det, der holder atomerne sammen i et molekyle.", "Det, der holder atomerne sammen i et molekyle. To ikke-metaller deler elektroner med hinanden."],
     ["molekyle", "Atomer af ikke-metaller, der er bundet sammen, for eksempel H₂O og O₂."],
     ["frit elektronpar", "To elektroner i yderste skal, som sidder sammen uden at være med i en binding.", "To elektroner i yderste skal, som sidder sammen uden at være med i en binding. Oxygenatomet i vand har to sådanne par."],
     ["elektronprikformel", "Tegning, hvor elektronerne i yderste skal er vist som små punkter omkring atomets symbol."],
     ["stregformel", "Tegning af et molekyle, hvor hvert fælles elektronpar er en linje mellem atomerne.", "Tegning af et molekyle, hvor hvert fælles elektronpar er en linje mellem atomerne. Den viser, hvilke atomer der er bundet sammen."],
     ["enkeltbinding", "Her deler to atomer kun ét elektronpar. Tegnes med én streg i en stregformel."],
     ["dobbeltbinding", "Her deler to atomer to elektronpar.", "Her deler to atomer to elektronpar. Tegnes med to streger, som mellem C og O i carbondioxid."],
     ["tripelbinding", "Her deler to atomer tre elektronpar. Tegnes med tre streger, som i dinitrogenmolekylet N₂."]
    ]},
    {"titel": "3.2 Navngivning og molekylers form", "ord": [
     ["talforstavelse", "Del af et molekyles navn, der angiver, hvor mange atomer der er af et grundstof.", "Del af et molekyles navn, der angiver, hvor mange atomer der er af et grundstof. Di betyder 2, og tri betyder 3."],
     ["tetraeder", "Pyramide med fire ens, trekantede sider.", "Pyramide med fire ens, trekantede sider. Fire elektronpar omkring et atom peger ud mod dens hjørner, som i methan."],
     ["trekantet pyramide", "Formen af ammoniak.", "Formen af ammoniak. De tre hydrogenatomer danner bunden, og nitrogenatomet sidder i toppen."],
     ["vinklet molekyle", "Formen af vand, hvor de tre atomer ikke ligger på en ret linje.", "Formen af vand, hvor de tre atomer ikke ligger på en ret linje. De frie elektronpar skubber de to bindinger sammen."]
    ]},
    {"titel": "3.3 Elektronegativitet og polære bindinger", "ord": [
     ["elektronegativitet", "Mål for, hvor kraftigt et atom trækker i de fælles elektroner i en binding.", "Mål for, hvor kraftigt et atom trækker i de fælles elektroner i en binding. Fluor har den højeste af alle grundstoffer."],
     ["upolær binding", "Her deler to atomer elektronparret ligeligt.", "Her deler to atomer elektronparret ligeligt. Forskellen i elektronegativitet er under 0,5, som i C−H."],
     ["polær binding", "Her ligger det fælles elektronpar tættest på det ene atom, som bliver delvist negativt.", "Her ligger det fælles elektronpar tættest på det ene atom, som bliver delvist negativt. Et eksempel er O−H i vand."]
    ]},
    {"titel": "3.4 Polære molekyler og blandbarhed", "ord": [
     ["polært molekyle", "Partikel af flere atomer med en positiv og en negativ ende. Vand og ammoniak er eksempler."],
     ["polær gruppe", "Del af et stort molekyle med et oxygenatom, for eksempel OH.", "Del af et stort molekyle med et oxygenatom, for eksempel OH. Der skal 4 carbonatomer til at ophæve virkningen af én."],
     ["blandbarhed", "Fortæller, om to væsker bliver til én, når de hældes sammen.", "Fortæller, om to væsker bliver til én, når de hældes sammen. Det gør de, når begge er polære, eller begge er upolære."],
     ["polært stof", "Består af molekyler med en positiv og en negativ ende.", "Består af molekyler med en positiv og en negativ ende. Det kan opløses i vand, som ethanol og sukker."],
     ["upolært stof", "Består af molekyler uden ladede ender. Det kan ikke opløses i vand, som olie og heptan."]
    ]}
   ]},
   {"id": "c-kapitel-4", "nr": "4", "navn": "Organisk kemi C", "afsnit": [
    {"titel": "4.1 Carbonhydrider og alkaner", "ord": [
     ["organisk kemi", "Læren om stoffer, der er bygget op omkring carbonatomer.", "Læren om stoffer, der er bygget op omkring carbonatomer. Sukker, fedt, benzin og plastik er eksempler på stofferne."],
     ["uorganisk", "Siges om stoffer uden bindinger mellem carbon og hydrogen.", "Siges om stoffer uden bindinger mellem carbon og hydrogen. Vand, metaller og salte er eksempler, og carbondioxid og kalk regnes også med."],
     ["carbonhydrid", "Stof, der kun består af C-atomer og H-atomer. Methan og butan er eksempler."],
     ["alkan", "Carbonhydrid, hvor alle bindinger er enkeltbindinger.", "Carbonhydrid, hvor alle bindinger er enkeltbindinger. Navnet ender på -an, for eksempel methan og propan."],
     ["molekylformel", "Tæller kun, hvor mange atomer der er af hver slags i et stof, for eksempel C₅H₁₂.", "Tæller kun, hvor mange atomer der er af hver slags i et stof, for eksempel C₅H₁₂. Den viser ikke, hvordan atomerne sidder sammen."],
     ["flygtig", "Siges om et stof, der fordamper let.", "Siges om et stof, der fordamper let. Jo lavere kogepunkt stoffet har, jo lettere fordamper det. Et eksempel er benzin."]
    ]},
    {"titel": "4.2 Zigzagformler og navngivning", "ord": [
     ["zigzagformel", "Hurtig måde at tegne en carbonkæde på.", "Hurtig måde at tegne en carbonkæde på. Hver ende og hvert knæk på stregen er et carbonatom, og hydrogenatomerne tegnes ikke."],
     ["uforgrenet", "Siges om en alkan, hvor alle carbonatomerne sidder i én lang kæde. Et eksempel er butan."],
     ["forgrenet", "Siges om en alkan, hvor korte kæder sidder ude på siden af den lange kæde.", "Siges om en alkan, hvor korte kæder sidder ude på siden af den lange kæde. Et eksempel er 2-methylpropan."],
     ["isomerer", "Stoffer med samme molekylformel, men forskellig strukturformel.", "Stoffer med samme molekylformel, men forskellig strukturformel. Et eksempel er butan og 2-methylpropan."],
     ["hovedkæde", "Den længste række af carbonatomer i et molekyle. Den giver den sidste del af navnet."],
     ["sidegruppe", "Kort kæde, der sidder ude på den længste kæde i en alkan.", "Kort kæde, der sidder ude på den længste kæde i en alkan. Navnet ender på -yl, for eksempel methyl."]
    ]},
    {"titel": "4.3 Alkaners reaktioner", "ord": [
     ["forbrænding", "Reaktion, hvor et stof reagerer med dioxygen fra luften, og der bliver afgivet varme."],
     ["fuldstændig", "Siges om en forbrænding, hvor der er dioxygen nok.", "Siges om en forbrænding, hvor der er dioxygen nok. Alt carbon bliver til carbondioxid, og alt hydrogen bliver til vand."],
     ["afstemt", "Siges om et reaktionsskema med lige mange atomer af hver slags på begge sider af pilen.", "Siges om et reaktionsskema med lige mange atomer af hver slags på begge sider af pilen. Det opnås med koefficienter foran formlerne."],
     ["ufuldstændig", "Siges om en forbrænding, hvor der er for lidt dioxygen.", "Siges om en forbrænding, hvor der er for lidt dioxygen. Der dannes også carbonmonoxid og sod, og soden gør flammen gul."],
     ["carbonmonoxid", "Giftig gas med formlen CO, som hverken kan ses eller lugtes.", "Giftig gas med formlen CO, som hverken kan ses eller lugtes. Den dannes ved forbrænding med for lidt dioxygen, og kaldes også kulilte."],
     ["substitution", "Reaktion, hvor et hydrogenatom i en alkan bliver skiftet ud med et chlor- eller bromatom.", "Reaktion, hvor et hydrogenatom i en alkan bliver skiftet ud med et chlor- eller bromatom. Den kræver lys."]
    ]},
    {"titel": "4.4 Alkener og addition", "ord": [
     ["alken", "Carbonhydrid med en dobbeltbinding mellem to carbonatomer.", "Carbonhydrid med en dobbeltbinding mellem to carbonatomer. Navnet ender på -en, for eksempel ethen."],
     ["alkyn", "Carbonhydrid med en tripelbinding mellem to carbonatomer.", "Carbonhydrid med en tripelbinding mellem to carbonatomer. Navnet ender på -yn, for eksempel ethyn."],
     ["mættet", "Siges om et carbonhydrid med kun enkeltbindinger mellem carbonatomerne.", "Siges om et carbonhydrid med kun enkeltbindinger mellem carbonatomerne. Det har det største antal hydrogenatomer, som carbonatomerne kan binde."],
     ["umættet", "Siges om et carbonhydrid med en dobbeltbinding eller en tripelbinding.", "Siges om et carbonhydrid med en dobbeltbinding eller en tripelbinding. Det har færre hydrogenatomer end alkanen med samme antal carbonatomer."],
     ["addition", "Reaktion, hvor en dobbeltbinding åbner sig, og to nye atomer sætter sig på.", "Reaktion, hvor en dobbeltbinding åbner sig, og to nye atomer sætter sig på. Der dannes kun ét stof."],
     ["bromvand", "Gul væske, der bruges til at undersøge, om et stof har dobbeltbindinger.", "Gul væske, der bruges til at undersøge, om et stof har dobbeltbindinger. Farven forsvinder med det samme, når væsken rystes med en alken."],
     ["polymerisation", "Reaktion, hvor mange tusinde små molekyler sætter sig sammen til én lang kæde.", "Reaktion, hvor mange tusinde små molekyler sætter sig sammen til én lang kæde. Sådan laves plastik af ethen."],
     ["polymer", "Det lange molekyle, der dannes, når mange tusinde ethenmolekyler sætter sig sammen.", "Det lange molekyle, der dannes, når mange tusinde ethenmolekyler sætter sig sammen. Bæreposer og flasker er lavet af det."],
     ["cycloalkan", "Carbonhydrid, hvor carbonatomerne sidder i en ring og kun er bundet med enkeltbindinger.", "Carbonhydrid, hvor carbonatomerne sidder i en ring og kun er bundet med enkeltbindinger. Hvert carbonatom har to hydrogenatomer."],
     ["aromatisk", "Siges om stoffer med en benzenring, som er en særlig stabil ring af seks carbonatomer."]
    ]},
    {"titel": "4.5 Alkoholer og carboxylsyrer", "ord": [
     ["funktionel gruppe", "Nogle få atomer i et organisk molekyle, som giver stoffet særlige egenskaber.", "Nogle få atomer i et organisk molekyle, som giver stoffet særlige egenskaber. Et eksempel er OH i ethanol."],
     ["stofklasse", "Familie af organiske forbindelser med den samme funktionelle gruppe.", "Familie af organiske forbindelser med den samme funktionelle gruppe. Et eksempel er alkoholer."],
     ["alkohol", "Organisk stof med en OH-gruppe, der sidder på et carbonatom.", "Organisk stof med en OH-gruppe, der sidder på et carbonatom. Navnet ender på -ol, for eksempel ethanol."],
     ["hydroxygruppe", "Atomerne OH, som sidder på et carbonatom i en alkohol. De gør den del af molekylet polær."],
     ["carboxylsyre", "Organisk stof med en COOH-gruppe. Det giver den sure smag i eddike, citroner og yoghurt."],
     ["carboxylgruppe", "Atomerne COOH, som sidder for enden af en organisk syre.", "Atomerne COOH, som sidder for enden af en organisk syre. C-atomet er bundet til et oxygenatom med dobbeltbinding og til OH."]
    ]},
    {"titel": "4.6 Fedtstoffer", "ord": [
     ["fedtsyre", "Carboxylsyre med en lang carbonkæde. De fleste i maden har 16 eller 18 carbonatomer."],
     ["monoumættet", "Siges om en fedtsyre med én dobbeltbinding. Et eksempel er oliesyre."],
     ["polyumættet", "Siges om en fedtsyre med mere end én dobbeltbinding. Et eksempel er linolsyre."],
     ["fedtstof", "Stof bygget af ét molekyle glycerol og tre carboxylsyrer med lange kæder.", "Stof bygget af ét molekyle glycerol og tre carboxylsyrer med lange kæder. Smør og olivenolie er eksempler."],
     ["glycerol", "Alkohol med tre OH-grupper. Hver af dem kan binde en fedtsyre, så der dannes et fedtstof."],
     ["triglycerid", "Andet navn for et fedtstof. Navnet fortæller, hvor mange fedtsyrer der sidder i molekylet."],
     ["hydrolyse", "Spaltning af et fedtstof til glycerol og fedtsyrer.", "Spaltning af et fedtstof til glycerol og fedtsyrer. Den bruger vand og sker blandt andet i fordøjelsen."],
     ["olie", "Fedtstof, der er flydende ved stuetemperatur.", "Fedtstof, der er flydende ved stuetemperatur. Det har mange umættede fedtsyrer med knæk på kæden."],
     ["hærdning", "Metode, hvor dobbeltbindingerne i en planteolie reagerer med dihydrogen.", "Metode, hvor dobbeltbindingerne i en planteolie reagerer med dihydrogen. Olien bliver til fast fedt, og sådan har man lavet margarine."]
    ]}
   ]},
   {"id": "c-kapitel-5", "nr": "5", "navn": "Mængdeberegning", "afsnit": [
    {"titel": "5.1 Beregninger i kemi", "ord": [
     ["størrelse", "Noget, man kan måle, for eksempel masse eller volumen. Har et symbol og en enhed."],
     ["symbol", "Bogstav, der står for en størrelse, for eksempel m for masse og V for volumen."],
     ["enhed", "Fortæller, hvad en størrelse er målt i, for eksempel gram eller milliliter."],
     ["volumen", "Hvor meget noget fylder. Symbolet er V, og enheden er milliliter eller liter."],
     ["densitet", "Hvor meget én milliliter af et stof vejer. Findes ved at dividere massen med volumenet."],
     ["betydende cifre", "De tal i et måleresultat, der viser, hvor præcist der er målt.", "De tal i et måleresultat, der viser, hvor præcist der er målt. 10,00 g har fire, og 0,92 g/mL har to."]
    ]},
    {"titel": "5.2 Molarmasse", "ord": [
     ["formelmasse", "Massen af én formelenhed, målt i enheden u.", "Massen af én formelenhed, målt i enheden u. For et stof af molekyler er det massen af ét molekyle, og for et salt som NaCl er det massen af én natriumion og én chloridion."],
     ["molarmasse", "Massen pr. mol formelenheder af et stof. Symbolet er M, og enheden er g/mol."]
    ]},
    {"titel": "5.3 Stofmængde", "ord": [
     ["mol", "Enhed for et bestemt antal, ligesom et par og et dusin.", "Enhed for et bestemt antal, ligesom et par og et dusin. Her er antallet 6,02 · 10²³ stykker."],
     ["stofmængde", "Antallet af mol. Symbolet er n, og den findes ved at dividere massen med molarmassen."]
    ]},
    {"titel": "5.4 Ækvivalente mængder", "ord": [
     ["ækvivalente mængder", "Antal mol af to stoffer, der står i samme forhold som koefficienterne i reaktionsskemaet.", "Antal mol af to stoffer, der står i samme forhold som koefficienterne i reaktionsskemaet. De kan netop reagere, uden at der bliver noget tilovers."],
     ["begrænsende faktor", "Det stof, der slipper op først i en reaktion.", "Det stof, der slipper op først i en reaktion. Det bestemmer, hvor meget produkt der kan dannes."]
    ]},
    {"titel": "5.5 Mængdeberegning", "ord": [
     ["mængdeberegning", "Fremgangsmåde, der fører fra massen af ét stof i en reaktion til massen af et andet.", "Fremgangsmåde, der fører fra massen af ét stof i en reaktion til massen af et andet. Vejen går over stofmængden."],
     ["mængdeberegningsskema", "Tabel under reaktionsskemaet med tre rækker: Massen, molarmassen og stofmængden."],
     ["vejeanalyse", "Metode, hvor man finder mængden af et stof ved at veje.", "Metode, hvor man finder mængden af et stof ved at veje. En ion kan for eksempel fældes ud, og bundfaldet filtreres fra, tørres og vejes."]
    ]},
    {"titel": "5.6 Gasser", "ord": [
     ["tryk", "Fortæller, hvor kraftigt en gas presser på beholderens vægge.", "Fortæller, hvor kraftigt en gas presser på beholderens vægge. Symbolet er p, og enheden er bar."],
     ["kelvin", "Enhed for temperatur i beregninger med gasser.", "Enhed for temperatur i beregninger med gasser. Man lægger 273 til talværdien i grader celsius."],
     ["det absolutte nulpunkt", "Den laveste temperatur, der findes, nemlig −273 °C. Her begynder kelvinskalaen."],
     ["idealgasligningen", "Sammenhængen mellem en gas' tryk, volumen, stofmængde og temperatur.", "Sammenhængen mellem en gas' tryk, volumen, stofmængde og temperatur. Den skrives p · V = n · R · T."],
     ["gaskonstanten", "Størrelsen R i idealgasligningen, som har samme værdi for alle gasser."]
    ]}
   ]},
   {"id": "c-kapitel-6", "nr": "6", "navn": "Koncentration", "afsnit": [
    {"titel": "6.1 Koncentration", "ord": [
     ["opløsning", "Blanding, hvor et stof har fordelt sig jævnt i en væske.", "Blanding, hvor et stof har fordelt sig jævnt i en væske. Et eksempel er salt, der er rørt ud i vand."],
     ["opløst stof", "Det, der er rørt ud og har fordelt sig jævnt i væsken, for eksempel saltet i saltvand."],
     ["opløsningsmiddel", "Væsken, som noget andet bliver rørt ud i og fordeler sig i.", "Væsken, som noget andet bliver rørt ud i og fordeler sig i. Et eksempel er vandet i saltvand."],
     ["masseprocent", "Fortæller, hvor stor en del af en blandings vægt et stof udgør.", "Fortæller, hvor stor en del af en blandings vægt et stof udgør. 1,2 g salt i 100 g brød giver 1,2 %."],
     ["stofmængdekoncentration", "Antallet af mol af et stof i én liter opløsning. Symbolet er c, og enheden er mol/L."],
     ["molær", "Sådan læses bogstavet M, når det står i stedet for enheden mol/L."],
     ["målekolbe", "Glas med et mærke på halsen, som viser præcis, hvor meget det rummer.", "Glas med et mærke på halsen, som viser præcis, hvor meget det rummer. Bruges til at fremstille en opløsning med en bestemt koncentration."],
     ["fortynde", "At hælde mere vand i en opløsning, så koncentrationen bliver lavere.", "At hælde mere vand i en opløsning, så koncentrationen bliver lavere. Stofmængden er den samme før og efter."]
    ]},
    {"titel": "6.2 Formel og aktuel koncentration", "ord": [
     ["formel koncentration", "Stofmængden pr. liter af det stof, der er hældt i, også når det er delt op i ioner.", "Stofmængden pr. liter af det stof, der er hældt i, også når det er delt op i ioner. Skrives for eksempel c(CaCl₂)."],
     ["aktuel koncentration", "Stofmængden pr. liter af de ioner og molekyler, der faktisk findes i opløsningen.", "Stofmængden pr. liter af de ioner og molekyler, der faktisk findes i opløsningen. Skrives med kantede parenteser, for eksempel [Ca²⁺]."]
    ]},
    {"titel": "6.3 Titrering", "ord": [
     ["kvalitativ analyse", "Undersøgelse af, hvad en prøve indeholder. Er der salt i chipsene?"],
     ["kvantitativ analyse", "Undersøgelse af, hvor meget der er af et stof i en prøve.", "Undersøgelse af, hvor meget der er af et stof i en prøve. Hvor mange procent salt er der i chipsene?"],
     ["titrering", "Metode til at måle, hvor meget stof en prøve indeholder.", "Metode til at måle, hvor meget stof en prøve indeholder. En opløsning med kendt koncentration dryppes i, til alt stoffet har reageret."],
     ["burette", "Langt glasrør med inddeling i milliliter og en hane forneden.", "Langt glasrør med inddeling i milliliter og en hane forneden. Herfra dryppes opløsningen med kendt koncentration ned i kolben med prøven."],
     ["ækvivalenspunkt", "Det øjeblik i en titrering, hvor alt stoffet i prøven netop har reageret.", "Det øjeblik i en titrering, hvor alt stoffet i prøven netop har reageret. Der er dryppet præcis nok i."],
     ["indikator", "Stof, der skifter farve, når alt stoffet i prøven har reageret.", "Stof, der skifter farve, når alt stoffet i prøven har reageret. I en Mohrtitrering bruges dichlorfluorescein."],
     ["omslag", "Farveskiftet i kolben, som viser, at ækvivalenspunktet er nået.", "Farveskiftet i kolben, som viser, at ækvivalenspunktet er nået. Så lukkes hanen på buretten."],
     ["Mohrtitrering", "Analyse, der bestemmer saltindholdet i en fødevare.", "Analyse, der bestemmer saltindholdet i en fødevare. Sølv(I)nitrat dryppes i, til farven skifter fra gulgrøn til lyserød."],
     ["afvigelse", "Forskellen mellem det målte tal og det forventede tal, regnet om til procent.", "Forskellen mellem det målte tal og det forventede tal, regnet om til procent. Er den lille, passer målingen godt."]
    ]}
   ]},
   {"id": "c-kapitel-7", "nr": "7", "navn": "Syrer og baser", "afsnit": [
    {"titel": "7.1 Syrer og baser", "ord": [
     ["hydron", "Partiklen H⁺, som overføres fra en syre til en base.", "Partiklen H⁺, som overføres fra en syre til en base. Den er en enkelt proton uden nogen elektron."],
     ["syre", "Stof, der kan afgive en hydron. Et eksempel er hydrogenchlorid, HCl."],
     ["base", "Stof, der kan optage en hydron. Et eksempel er ammoniak, NH₃."],
     ["oxoniumion", "Partiklen H₃O⁺. Den dannes, når et vandmolekyle optager en hydron."],
     ["hydroxidion", "Partiklen OH⁻. Den dannes, når et vandmolekyle afgiver H⁺ til en base."],
     ["syre/base-reaktion", "En hydron overføres fra ét stof til et andet.", "En hydron overføres fra ét stof til et andet. Det ene stof afgiver den, og det andet optager den."],
     ["korresponderende syre/base-par", "To stoffer, hvis formler er ens bortset fra én hydron, for eksempel NH₄⁺ og NH₃.", "To stoffer, hvis formler er ens bortset fra én hydron, for eksempel NH₄⁺ og NH₃. Det ene bliver til det andet ved at afgive hydronen."],
     ["amfolyt", "Stof, der både kan afgive og optage en hydron. Et eksempel er vand."]
    ]},
    {"titel": "7.2 Stærke og svage syrer", "ord": [
     ["stærk syre", "Stof, der afgiver alle sine hydroner i vand, for eksempel HCl.", "Stof, der afgiver alle sine hydroner i vand, for eksempel HCl. Reaktionen skrives med en enkelt pil."],
     ["svag syre", "Stof, der kun afgiver få af sine hydroner i vand, for eksempel CH₃COOH.", "Stof, der kun afgiver få af sine hydroner i vand, for eksempel CH₃COOH. Reaktionen skrives med en dobbeltpil."],
     ["stærk base", "Stof, der straks optager en hydron fra en syre. Et eksempel er hydroxidionen."],
     ["svag base", "Stof, hvor kun få af molekylerne har optaget en hydron i vand. Et eksempel er ammoniak."],
     ["neutralisation", "Reaktion mellem en syre og en base, der gør blandingen mindre sur eller mindre basisk.", "Reaktion mellem en syre og en base, der gør blandingen mindre sur eller mindre basisk. Hældes ammoniakvand i saltsyre, dannes ammoniumioner, som kun er en svag syre."]
    ]},
    {"titel": "7.3 pH-skalaen", "ord": [
     ["sur", "Siges om en opløsning, der har flere oxoniumioner end hydroxidioner.", "Siges om en opløsning, der har flere oxoniumioner end hydroxidioner. Den har pH under 7 ved 25 °C."],
     ["neutral", "Siges om en opløsning med lige mange oxoniumioner og hydroxidioner.", "Siges om en opløsning med lige mange oxoniumioner og hydroxidioner. Den har pH 7 ved 25 °C."],
     ["basisk", "Siges om en opløsning, der har flere hydroxidioner end oxoniumioner.", "Siges om en opløsning, der har flere hydroxidioner end oxoniumioner. Den har pH over 7 ved 25 °C."],
     ["pH", "Tal, der fortæller, hvor høj koncentrationen af oxoniumioner er.", "Tal, der fortæller, hvor høj koncentrationen af oxoniumioner er. Jo flere oxoniumioner, jo lavere er tallet."],
     ["syre/base-indikator", "Farvestof, hvis farve afhænger af opløsningens pH.", "Farvestof, hvis farve afhænger af opløsningens pH. Farvestofferne skifter farve ved hver sin pH."],
     ["pH-meter", "Apparat, der måler, hvor sur eller basisk en opløsning er.", "Apparat, der måler, hvor sur eller basisk en opløsning er. Det har en elektrode, som holdes ned i opløsningen."]
    ]},
    {"titel": "7.4 pH-beregninger", "ord": [
     ["vands ionprodukt", "Koncentrationerne af H₃O⁺ og OH⁻ ganget med hinanden.", "Koncentrationerne af H₃O⁺ og OH⁻ ganget med hinanden. Det giver altid 1,0 · 10⁻¹⁴ M² ved 25 °C."]
    ]},
    {"titel": "7.5 Syre/base-titrering", "ord": [
     ["ækvivalenspunkt", "Det sted i en titrering, hvor tilsat hydroxid og syre har samme stofmængde.", "Det sted i en titrering, hvor tilsat hydroxid og syre har samme stofmængde. Her springer pH flere enheder."],
     ["phenolphthalein", "Indikator, der er farveløs under pH 8 og lyserød over pH 10.", "Indikator, der er farveløs under pH 8 og lyserød over pH 10. Den bruges ofte til titreringer."],
     ["omslag", "Det øjeblik i en titrering, hvor én dråbe mere får indikatoren til at skifte farve.", "Det øjeblik i en titrering, hvor én dråbe mere får indikatoren til at skifte farve. Med phenolphthalein bliver opløsningen svagt lyserød, og så lukkes burettens hane."],
     ["titrerkurve", "Graf, der viser pH som funktion af det volumen, der er tilsat fra buretten."]
    ]}
   ]},
   {"id": "c-kapitel-8", "nr": "8", "navn": "Redoxreaktioner", "afsnit": [
    {"titel": "8.1 Redoxreaktioner", "ord": [
     ["oxidation", "Det, der sker, når et stof afgiver elektroner.", "Det, der sker, når et stof afgiver elektroner. Magnesium gør det, når det brænder og bliver til Mg²⁺."],
     ["reduktion", "Det, der sker, når et stof optager elektroner.", "Det, der sker, når et stof optager elektroner. Dioxygen gør det og bliver til O²⁻, når magnesium brænder."],
     ["redoxreaktion", "Elektroner overføres fra ét stof til et andet.", "Elektroner overføres fra ét stof til et andet. Det ene stof afgiver dem, og det andet optager dem samtidig."],
     ["delreaktion", "Skema, der kun viser, hvordan ét stof afgiver eller optager elektroner.", "Skema, der kun viser, hvordan ét stof afgiver eller optager elektroner. Elektronerne skrives med som e⁻."],
     ["oxidationsmiddel", "Stof, der optager elektroner fra et andet stof.", "Stof, der optager elektroner fra et andet stof. Dioxygen, dichlor og dibrom er kraftige eksempler."],
     ["reduktionsmiddel", "Stof, der afgiver elektroner til et andet stof.", "Stof, der afgiver elektroner til et andet stof. Metaller som magnesium, aluminium og natrium er kraftige eksempler."]
    ]},
    {"titel": "8.2 Spændingsrækken", "ord": [
     ["uædelt", "Siges om et metal, der let afgiver elektroner, for eksempel natrium og zink."],
     ["ædelt", "Siges om et metal, der nødigt afgiver elektroner, for eksempel sølv og guld."],
     ["spændingsrækken", "Liste, hvor metallerne står ordnet efter, hvor let de afgiver elektroner.", "Liste, hvor metallerne står ordnet efter, hvor let de afgiver elektroner. De, der gør det lettest, står til venstre."]
    ]},
    {"titel": "8.3 Oxidationstal", "ord": [
     ["oxidationstal", "Tal, der angiver, hvor mange elektroner et atom har afgivet (plus) eller optaget (minus).", "Tal, der angiver, hvor mange elektroner et atom har afgivet (plus) eller optaget (minus). Det tæller også elektroner, der kun er afgivet eller optaget delvist, og skrives med romertal, for eksempel −II."]
    ]},
    {"titel": "8.4 Afstemning af redoxreaktioner", "ord": [
     ["permanganat", "Violet ion med formlen MnO₄⁻.", "Violet ion med formlen MnO₄⁻. Den er et meget brugt oxidationsmiddel og bliver farveløs, når den reduceres i sur opløsning."]
    ]}
   ]},
   {"id": "c-tema-sundhed", "nr": "", "navn": "Tema: Sundhed", "afsnit": [
    {"titel": "T1.2 Atomer og isotoper", "ord": [
     ["radioaktiv", "Siges om en isotop, hvis kerne ikke er stabil.", "Siges om en isotop, hvis kerne ikke er stabil. Kernen sender stråling ud, som kan måles uden for kroppen."]
    ]},
    {"titel": "T1.10 Fedtstoffer", "ord": [
     ["animalsk fedt", "Smør, spæk og andre triglycerider fra dyr.", "Smør, spæk og andre triglycerider fra dyr. De er mest mættede og er faste ved stuetemperatur."],
     ["vegetabilsk fedt", "Olivenolie, rapsolie og andre triglycerider fra planter.", "Olivenolie, rapsolie og andre triglycerider fra planter. De er mest umættede og er flydende ved stuetemperatur."],
     ["maritimt fedt", "Triglycerider fra fisk og alger i havet.", "Triglycerider fra fisk og alger i havet. De har mange polyumættede kæder og er flydende, også når det er koldt."]
    ]},
    {"titel": "T1.11 Drop, blodsukker og dosis", "ord": [
     ["dosis", "Den mængde, et lægemiddel bliver givet i.", "Den mængde, et lægemiddel bliver givet i. For lidt virker ikke, og for meget kan skade kroppen."]
    ]}
   ]},
   {"id": "c-tema-plastic", "nr": "", "navn": "Tema: Plastic", "afsnit": [
    {"titel": "T2.1 Olie og alkaner", "ord": [
     ["fossile brændstoffer", "Kul, olie og naturgas.", "Kul, olie og naturgas. De er dannet af alger, plankton og planter, som har ligget dybt i jorden i millioner af år."],
     ["raffinaderi", "Anlæg, hvor råolie bliver skilt ad efter kogepunkt i et højt tårn.", "Anlæg, hvor råolie bliver skilt ad efter kogepunkt i et højt tårn. De korteste molekyler kommer ud øverst."]
    ]},
    {"titel": "T2.3 Fra ethen til polyethen", "ord": [
     ["krakning", "Metode, hvor lange alkaner varmes op, så kæderne knækker i mindre stykker.", "Metode, hvor lange alkaner varmes op, så kæderne knækker i mindre stykker. Nogle af stykkerne er alkener."],
     ["polyaddition", "Reaktion, hvor mange molekyler med en dobbeltbinding bliver lagt sammen til én lang kæde."],
     ["monomer", "Et af de små molekyler, der bliver sat sammen til en lang kæde i plast.", "Et af de små molekyler, der bliver sat sammen til en lang kæde i plast. Et eksempel er ethen."],
     ["makromolekyle", "Kæmpestort molekyle af tusindvis af atomer, der er bundet sammen med elektronparbindinger.", "Kæmpestort molekyle af tusindvis af atomer, der er bundet sammen med elektronparbindinger. Al plast er bygget af dem."]
    ]},
    {"titel": "T2.5 Blød, hård eller elastisk?", "ord": [
     ["termoplast", "Plast, hvor kæderne ikke er bundet sammen, så den bliver blød i varme og kan smeltes om."],
     ["hærdeplast", "Plast, hvor kæderne er bundet sammen i et netværk, så den ikke smelter, men forkuller.", "Plast, hvor kæderne er bundet sammen i et netværk, så den ikke smelter, men forkuller. Et eksempel er bakelit."],
     ["vulkanisering", "Gummi opvarmes med svovl, så broer af svovl binder kæderne sammen.", "Gummi opvarmes med svovl, så broer af svovl binder kæderne sammen. Gummiet bliver elastisk og smelter ikke."],
     ["blødgører", "Små molekyler, der lægger sig mellem kæderne i plast, så kæderne lettere kan glide.", "Små molekyler, der lægger sig mellem kæderne i plast, så kæderne lettere kan glide. Et eksempel er phthalater."],
     ["tilsætningsstof", "Stof, der bliver blandet i plast for at give den nye egenskaber.", "Stof, der bliver blandet i plast for at give den nye egenskaber. Det kan for eksempel give farve eller gøre plasten mindre brandbar."],
     ["copolymer", "Polymer, der er bygget af to eller flere slags monomerer.", "Polymer, der er bygget af to eller flere slags monomerer. Et eksempel er ABS i LEGO-klodser."]
    ]},
    {"titel": "T2.6 Plastens koder", "ord": [
     ["plastkode", "Tal fra 1 til 7 i en lille trekant af pile på emballage.", "Tal fra 1 til 7 i en lille trekant af pile på emballage. Tallet fortæller, hvilken slags plast det er."]
    ]},
    {"titel": "T2.7 Plast i dag", "ord": [
     ["mikroplast", "Små stumper af polymerer fra poser og flasker, der langsomt er gået i stykker i havet.", "Små stumper af polymerer fra poser og flasker, der langsomt er gået i stykker i havet. Naturen kan ikke nedbryde dem."],
     ["biobaseret", "Siges om plast, der er lavet af planter i stedet for olie.", "Siges om plast, der er lavet af planter i stedet for olie. Den er ikke altid bionedbrydelig."],
     ["bionedbrydelig", "Siges om plast, som bakterier og svampe kan bryde ned til carbondioxid og vand.", "Siges om plast, som bakterier og svampe kan bryde ned til carbondioxid og vand. Et eksempel er PLA."]
    ]},
    {"titel": "T2.8 Plastens vilde historie", "ord": [
     ["naturlig polymer", "Langt kædemolekyle, som planter og dyr selv laver.", "Langt kædemolekyle, som planter og dyr selv laver. Cellulose i bomuld og gummi fra gummitræet er eksempler."],
     ["halvsyntetisk", "Siges om plast, der er lavet ved at ændre naturens egne kæder med en kemisk reaktion.", "Siges om plast, der er lavet ved at ændre naturens egne kæder med en kemisk reaktion. Et eksempel er celluloid."],
     ["syntetisk", "Siges om plast, der er bygget helt af små molekyler. Bakelit fra 1907 var den første."]
    ]}
   ]},
   {"id": "c-tema-klima", "nr": "", "navn": "Tema: Klima", "afsnit": [
    {"titel": "T3.1 Drivhusgasser og molarmasse", "ord": [
     ["drivhuseffekten", "Gasser i luften fanger noget af varmen fra Jorden og sender den tilbage.", "Gasser i luften fanger noget af varmen fra Jorden og sender den tilbage. Uden det ville temperaturen på Jorden være omkring −18 °C."],
     ["drivhusgas", "Stof i luften, der kan optage varmen fra Jorden.", "Stof i luften, der kan optage varmen fra Jorden. Molekylet har tre eller flere atomer, for eksempel CO₂ og methan."]
    ]},
    {"titel": "T3.3 Carbonets kredsløb", "ord": [
     ["fotosyntese", "Planter bygger glucose af carbondioxid og vand ved hjælp af sollys.", "Planter bygger glucose af carbondioxid og vand ved hjælp af sollys. Der dannes også dioxygen."],
     ["respiration", "Celler forbrænder glucose med dioxygen for at få energi. Der dannes carbondioxid og vand."]
    ]},
    {"titel": "T3.5 Drivhuseffekten og luftens molekyler", "ord": [
     ["albedo", "Den del af sollyset, som en flade sender tilbage. Sne har en høj, og havet har en lav."]
    ]},
    {"titel": "T3.7 Havet og carbondioxid", "ord": [
     ["havforsuring", "Havets pH falder, fordi vandet optager carbondioxid, som bliver til kulsyre.", "Havets pH falder, fordi vandet optager carbondioxid, som bliver til kulsyre. Muslinger og koraller får sværere ved at bygge skaller af kalk."],
     ["syreregn", "Nedbør med svovlsyre og salpetersyre fra røgen fra kraftværker, skibe og biler.", "Nedbør med svovlsyre og salpetersyre fra røgen fra kraftværker, skibe og biler. Den skader bygninger og statuer af marmor."]
    ]},
    {"titel": "T3.8 Klimaets historie i isen", "ord": [
     ["iskerne", "Lang cylinder af is, som er boret op af en iskappe.", "Lang cylinder af is, som er boret op af en iskappe. Luftbobler i isen viser luften fra dengang."],
     ["ppm", "Dele pr. million. Bruges om meget små mængder, for eksempel carbondioxid i luften."]
    ]},
    {"titel": "T3.9 Brændstoffer fra planter og strøm", "ord": [
     ["gæring", "Gær laver sukker om til ethanol og carbondioxid. Sådan laves bioethanol."],
     ["bioethanol", "Sprit, der er lavet af sukker fra planter. Den bliver blandet i benzinen."],
     ["Power-to-X", "Strøm fra sol og vind bliver brugt til at lave brændstof.", "Strøm fra sol og vind bliver brugt til at lave brændstof. For eksempel bliver vand og CO₂ til methanol."]
    ]}
   ]},
   {"id": "c-tema-havet", "nr": "", "navn": "Tema: Havet og regnen", "afsnit": [
    {"titel": "T4.1 Salt i havet", "ord": [
     ["brakvand", "Vand med meget mindre salt end havvand, fordi floder fortynder det.", "Vand med meget mindre salt end havvand, fordi floder fortynder det. Et eksempel er Østersøen."]
    ]},
    {"titel": "T4.6 Syreregn", "ord": [
     ["kalkning", "Kalk spredes ud over en sur sø, så carbonationerne neutraliserer syren.", "Kalk spredes ud over en sur sø, så carbonationerne neutraliserer syren. Det skal gentages, så længe der falder syre."]
    ]}
   ]},
   {"id": "c-tema-metaller", "nr": "", "navn": "Tema: Metaller", "afsnit": [
    {"titel": "T5.2 Oldtidens syv metaller", "ord": [
     ["malm", "Sten med så meget af et metal, at det kan betale sig at hente metallet ud.", "Sten med så meget af et metal, at det kan betale sig at hente metallet ud. Metallet sidder i stenen som ioner."]
    ]},
    {"titel": "T5.3 Kobber og bronze", "ord": [
     ["bronze", "Blanding af omkring 90 % kobber og 10 % tin.", "Blanding af omkring 90 % kobber og 10 % tin. Den er hårdere end rent kobber og let at støbe."],
     ["legering", "Et metal blandet med et eller flere andre grundstoffer.", "Et metal blandet med et eller flere andre grundstoffer. Bronze er kobber med tin, og stål er jern med carbon."]
    ]},
    {"titel": "T5.4 Jern", "ord": [
     ["myremalm", "Rødbrune klumper af jernforbindelser, som dannes i fugtig jord i moser og enge.", "Rødbrune klumper af jernforbindelser, som dannes i fugtig jord i moser og enge. I jernalderen blev de lavet til jern."],
     ["stål", "Jern med under 2 % carbon. Det er både hårdt og sejt."]
    ]},
    {"titel": "T5.5 Kviksølv", "ord": [
     ["amalgam", "Blanding af kviksølv og et andet metal som guld eller sølv.", "Blanding af kviksølv og et andet metal som guld eller sølv. Den bruges til at hente guld ud af sand."]
    ]},
    {"titel": "T5.6 Rust", "ord": [
     ["korrosion", "Et metal bliver nedbrudt, fordi det reagerer med stoffer i omgivelserne.", "Et metal bliver nedbrudt, fordi det reagerer med stoffer i omgivelserne. Metallet bliver oxideret og ender som ioner."],
     ["rust", "Rødbrunt stof, der dannes, når jern reagerer med vand og dioxygen.", "Rødbrunt stof, der dannes, når jern reagerer med vand og dioxygen. Det er porøst og skaller af."],
     ["offeranode", "Klods af zink eller magnesium, der sættes på jern.", "Klods af zink eller magnesium, der sættes på jern. Den afgiver elektronerne og tæres væk, så jernet ikke ruster."]
    ]}
   ]}
  ]},
  {"id": "b", "navn": "Kemi B", "kapitler": [
   {"id": "b-kapitel-b1", "nr": "B1", "navn": "Reaktionshastighed", "afsnit": [
    {"titel": "B1.1 Reaktionshastighed", "ord": [
     ["reaktionshastighed", "Angiver, hvor meget koncentrationen af et stof ændrer sig pr. sekund.", "Angiver, hvor meget koncentrationen af et stof ændrer sig pr. sekund. Symbolet er v, og enheden er M/s."],
     ["gennemsnitlig reaktionshastighed", "Ændringen i koncentrationen i et tidsrum divideret med den tid, der er gået.", "Ændringen i koncentrationen i et tidsrum divideret med den tid, der er gået. På grafen er det hældningen af linjen mellem to punkter på kurven, regnet uden fortegn."],
     ["starthastighed", "Ændringen i koncentration pr. sekund ved tiden 0, lige når reaktionen begynder.", "Ændringen i koncentration pr. sekund ved tiden 0, lige når reaktionen begynder. Den skrives v₀."]
    ]},
    {"titel": "B1.2 Koncentration og sammenstød", "ord": [
     ["hastighedsudtryk", "Formel, der angiver v som funktion af koncentrationerne.", "Formel, der angiver v som funktion af koncentrationerne. Eksponenterne i formlen kan kun findes ved forsøg."],
     ["hastighedskonstant", "Tallet k i formlen for v. Det er fast for den enkelte reaktion ved en bestemt temperatur."],
     ["eksponent", "Tal, som en koncentration er opløftet til i formlen for v.", "Tal, som en koncentration er opløftet til i formlen for v. Tallet findes ved forsøg og er som regel 0, 1 eller 2."]
    ]},
    {"titel": "B1.3 Aktiveringsenergi og temperatur", "ord": [
     ["energiprofil", "Graf over stoffernes energi som funktion af, hvor langt reaktionen er nået.", "Graf over stoffernes energi som funktion af, hvor langt reaktionen er nået. Vejen fra reaktanter til produkter går over en bakke."],
     ["det aktiverede kompleks", "Tilstanden på toppen af bakken i en energiprofil.", "Tilstanden på toppen af bakken i en energiprofil. De gamle bindinger er ved at blive brudt, og de nye er ved at blive dannet."],
     ["aktiveringsenergi", "Den mindste energi, molekylerne skal støde sammen med for at kunne reagere.", "Den mindste energi, molekylerne skal støde sammen med for at kunne reagere. Symbolet er Eₐ, og enheden er kJ/mol."],
     ["exoterm", "Siges om en reaktion, hvor produkterne har mindre energi end reaktanterne.", "Siges om en reaktion, hvor produkterne har mindre energi end reaktanterne. Forskellen bliver afgivet til omgivelserne, som regel som varme."],
     ["endoterm", "Siges om en reaktion, hvor produkterne har mere energi end reaktanterne.", "Siges om en reaktion, hvor produkterne har mere energi end reaktanterne. Reaktionen optager energi fra omgivelserne, for eksempel ved fotosyntesen."],
     ["temperatur", "Mål for, hvor meget bevægelsesenergi molekylerne har i gennemsnit.", "Mål for, hvor meget bevægelsesenergi molekylerne har i gennemsnit. Jo højere den er, jo hurtigere bevæger molekylerne sig i gennemsnit."]
    ]},
    {"titel": "B1.4 Katalysatorer og enzymer", "ord": [
     ["katalysator", "Stof, der øger en reaktions hastighed uden selv at blive forbrugt.", "Stof, der øger en reaktions hastighed uden selv at blive forbrugt. Det giver reaktionen et forløb med lavere aktiveringsenergi."],
     ["inhibitor", "Stof, der nedsætter en reaktions hastighed.", "Stof, der nedsætter en reaktions hastighed. Mange af dem binder sig til katalysatoren, så den mister sin virkning."],
     ["enzym", "Protein, der virker som katalysator i en levende organisme.", "Protein, der virker som katalysator i en levende organisme. Navnet ender som regel på -ase."],
     ["substrat", "Stof, hvis reaktion et enzym katalyserer. For enzymet amylase i spyt er det stivelse."],
     ["aktivt center", "Fordybning i et enzym, hvor substratet passer præcis ind som en nøgle i en lås."],
     ["optimum", "Den temperatur, hvor et enzym arbejder hurtigst.", "Den temperatur, hvor et enzym arbejder hurtigst. Ved højere temperaturer mister enzymet sin foldning."],
     ["denaturere", "At miste sin foldning, som et enzym gør ved for høj temperatur.", "At miste sin foldning, som et enzym gør ved for høj temperatur. Bagefter er enzymet inaktivt."]
    ]}
   ]},
   {"id": "b-kapitel-b2", "nr": "B2", "navn": "Kemisk ligevægt", "afsnit": [
    {"titel": "B2.1 Kemisk ligevægt og ligevægtsloven", "ord": [
     ["reversibel", "Siges om en reaktion, der kan forløbe i begge retninger. Den skrives med en dobbeltpil."],
     ["ligevægt", "Tilstand, hvor koncentrationerne af alle stoffer i en reversibel reaktion er konstante.", "Tilstand, hvor koncentrationerne af alle stoffer i en reversibel reaktion er konstante. Kurverne over koncentrationerne er vandrette."],
     ["dynamisk ligevægt", "Tilstand, hvor reaktionerne mod højre og mod venstre forløber med samme hastighed.", "Tilstand, hvor reaktionerne mod højre og mod venstre forløber med samme hastighed. Begge forløber hele tiden."],
     ["indstille sig", "Udtryk for, at koncentrationerne når deres konstante værdier ved ligevægt.", "Udtryk for, at koncentrationerne når deres konstante værdier ved ligevægt. Derefter er reaktionen i ligevægt."],
     ["reaktionsbrøk", "Produkternes koncentrationer ganget sammen og divideret med reaktanternes.", "Produkternes koncentrationer ganget sammen og divideret med reaktanternes. Hver koncentration er opløftet i en potens lig med stoffets koefficient, og symbolet er Y."],
     ["ligevægtskonstant", "Værdien af reaktionsbrøken, når koncentrationerne ikke længere ændrer sig.", "Værdien af reaktionsbrøken, når koncentrationerne ikke længere ændrer sig. For en given reaktion afhænger den kun af temperaturen. Symbolet er K."],
     ["ligevægtsloven", "Siger, at reaktionsbrøken er lig med K, når koncentrationerne ikke længere ændrer sig.", "Siger, at reaktionsbrøken er lig med K, når koncentrationerne ikke længere ændrer sig. Kort skrives den Y = K."],
     ["forskudt mod højre", "Siges om en ligevægt med høje koncentrationer af produkter og lave af reaktanter.", "Siges om en ligevægt med høje koncentrationer af produkter og lave af reaktanter. Konstanten K er meget stor, og reaktionen forløber næsten fuldstændig."],
     ["forskudt mod venstre", "Siges om en ligevægt med høje koncentrationer af reaktanter og lave af produkter.", "Siges om en ligevægt med høje koncentrationer af reaktanter og lave af produkter. Konstanten K er meget lille, og reaktionen forløber kun i meget ringe grad."]
    ]},
    {"titel": "B2.3 Ikke-ligevægt og indgreb", "ord": [
     ["indgreb", "Ændring udefra, som bringer en blanding ud af ligevægt.", "Ændring udefra, som bringer en blanding ud af ligevægt. Et stof kan for eksempel blive tilsat eller fjernet."],
     ["forskudt", "Siges om en ligevægt, hvis beliggenhed ændres efter et indgreb.", "Siges om en ligevægt, hvis beliggenhed ændres efter et indgreb. Reaktionen forløber mod højre eller mod venstre, indtil Y igen er lig med K."],
     ["Le Chateliers princip", "Huskeregel om, at en ligevægt forskydes i den retning, der modvirker et indgreb.", "Huskeregel om, at en ligevægt forskydes i den retning, der modvirker et indgreb. Tilsættes et stof, forbruges noget af det."]
    ]},
    {"titel": "B2.6 Opløselighedsprodukt", "ord": [
     ["tungtopløselig", "Siges om et salt, der danner bundfald, fordi vand kun kan rumme meget lidt af det.", "Siges om et salt, der danner bundfald, fordi vand kun kan rumme meget lidt af det. Et eksempel er bly(II)iodid."],
     ["bundfald", "Fast stof, der dannes i en væske, når ioner reagerer og danner et tungtopløseligt salt.", "Fast stof, der dannes i en væske, når ioner reagerer og danner et tungtopløseligt salt. Et eksempel er gult bly(II)iodid."],
     ["fældningsreaktion", "Dannelse af et bundfald, når ioner fra to opløsninger danner et tungtopløseligt salt."],
     ["opløselighedsligevægt", "Balance mellem et fast salt og saltets ioner i den omgivende væske.", "Balance mellem et fast salt og saltets ioner i den omgivende væske. Ioner forlader iongitteret lige så hurtigt, som andre ioner bindes til det."],
     ["mættet", "Siges om en opløsning med så meget salt, som vandet kan rumme ved den temperatur.", "Siges om en opløsning med så meget salt, som vandet kan rumme ved den temperatur. Den er i ligevægt med det faste salt."],
     ["opløselighed", "Den mængde af et salt, som vandet højst kan rumme ved en bestemt temperatur.", "Den mængde af et salt, som vandet højst kan rumme ved en bestemt temperatur. Den angives i mol pr. liter eller i gram pr. 100 mL."],
     ["opløselighedsprodukt", "Ligevægtskonstanten for ligevægten mellem et fast salt og saltets ioner i vand.", "Ligevægtskonstanten for ligevægten mellem et fast salt og saltets ioner i vand. Symbolet er Kₒ."],
     ["umættet", "Siges om en opløsning, der kan rumme mere salt.", "Siges om en opløsning, der kan rumme mere salt. Reaktionsbrøken er mindre end Kₒ, og der dannes ikke bundfald."],
     ["overmættet", "Siges om en opløsning med mere salt, end vandet kan rumme.", "Siges om en opløsning med mere salt, end vandet kan rumme. Reaktionsbrøken er større end Kₒ, og der dannes bundfald."]
    ]}
   ]},
   {"id": "b-kapitel-b3", "nr": "B3", "navn": "Intermolekylære bindinger og isomeri", "afsnit": [
    {"titel": "B3.1 Stofklasser", "ord": [
     ["carbonhydrid", "Stof, der kun indeholder de to grundstoffer C og H.", "Stof, der kun indeholder de to grundstoffer C og H. Alkaner, alkener og alkyner er eksempler."],
     ["zigzagformel", "Tegning af et molekyle, hvor hvert knæk og hver ende er et carbonatom.", "Tegning af et molekyle, hvor hvert knæk og hver ende er et carbonatom. Hydrogenatomerne på carbon tegnes ikke."],
     ["funktionel gruppe", "Bestemt kombination af atomer, som giver et organisk stof dets særlige egenskaber.", "Bestemt kombination af atomer, som giver et organisk stof dets særlige egenskaber. Et eksempel er OH i en alkohol."],
     ["stofklasse", "Familie af stoffer med samme funktionelle gruppe.", "Familie af stoffer med samme funktionelle gruppe. To eksempler er alkoholer og carboxylsyrer."],
     ["R", "Symbol for resten af molekylet, når kun den funktionelle gruppe har betydning.", "Symbol for resten af molekylet, når kun den funktionelle gruppe har betydning. Resten er en carbonkæde af vilkårlig længde."],
     ["carbonylgruppe", "Et C-atom og et O-atom bundet med en dobbeltbinding, C=O.", "Et C-atom og et O-atom bundet med en dobbeltbinding, C=O. Findes blandt andet i aldehyder og ketoner."]
    ]},
    {"titel": "B3.2 Intermolekylære bindinger", "ord": [
     ["intermolekylær binding", "Svag tiltrækning mellem molekyler, som holder dem sammen i væsker og faste stoffer.", "Svag tiltrækning mellem molekyler, som holder dem sammen i væsker og faste stoffer. Jo stærkere den er, jo højere er kogepunktet."],
     ["midlertidig dipol", "Kortvarig skæv elektronfordeling, som giver et molekyle en negativ og en positiv ende.", "Kortvarig skæv elektronfordeling, som giver et molekyle en negativ og en positiv ende. Den skyldes, at elektronerne hele tiden er i bevægelse."],
     ["londonbinding", "Tiltrækning mellem midlertidige dipoler i nabomolekyler.", "Tiltrækning mellem midlertidige dipoler i nabomolekyler. Den findes mellem alle molekyler og er den svageste mellem små molekyler."],
     ["permanent dipol", "Delvist negativ og delvist positiv ende, som et polært molekyle har hele tiden.", "Delvist negativ og delvist positiv ende, som et polært molekyle har hele tiden. Den skyldes forskelle i elektronegativitet."],
     ["dipol-dipolbinding", "Tiltrækning mellem polære molekyler.", "Tiltrækning mellem polære molekyler. Molekylerne orienterer sig, så den negative ende af ét molekyle vender mod den positive ende af nabomolekylet."],
     ["hydrogenbinding", "Den stærkeste tiltrækning mellem små molekyler.", "Den stærkeste tiltrækning mellem små molekyler. Et H-atom bundet til O eller N tiltrækkes af et frit elektronpar på O eller N i nabomolekylet."],
     ["hydrofil", "Vandelskende.", "Vandelskende. Siges om en gruppe, der kan danne hydrogenbindinger til vand, for eksempel OH-gruppen i en alkohol."],
     ["hydrofob", "Vandskyende.", "Vandskyende. Siges om en carbonkæde, fordi den kun kan danne londonbindinger. Er kæden lang, er stoffet tungtopløseligt i vand."]
    ]},
    {"titel": "B3.3 Strukturisomeri", "ord": [
     ["isomerer", "Forskellige stoffer med samme molekylformel.", "Forskellige stoffer med samme molekylformel. Butan og 2-methylpropan har for eksempel begge molekylformlen C₄H₁₀."],
     ["strukturisomerer", "Stoffer med samme molekylformel, hvor atomerne er bundet sammen i forskellig rækkefølge.", "Stoffer med samme molekylformel, hvor atomerne er bundet sammen i forskellig rækkefølge. Der er tre slags."],
     ["kædeisomerer", "Stoffer med samme molekylformel, hvis carbonkæder har forskellig forgrening.", "Stoffer med samme molekylformel, hvis carbonkæder har forskellig forgrening. Butan er uforgrenet, og 2-methylpropan er forgrenet."],
     ["stillingsisomerer", "Stoffer med samme carbonkæde, hvor den funktionelle gruppe har forskellig placering.", "Stoffer med samme carbonkæde, hvor den funktionelle gruppe har forskellig placering. Et eksempel er propan-1-ol og propan-2-ol."],
     ["funktionsisomerer", "Stoffer med samme molekylformel, som hører til hver sin stofklasse.", "Stoffer med samme molekylformel, som hører til hver sin stofklasse. Ethanol er en alkohol, og dimethylether er en ether."],
     ["ether", "Stof med et oxygenatom bundet mellem to carbonatomer, R−O−R′.", "Stof med et oxygenatom bundet mellem to carbonatomer, R−O−R′. Stoffet har samme molekylformel som en alkohol, men intet hydrogenatom på oxygen."]
    ]},
    {"titel": "B3.4 Stereoisomeri", "ord": [
     ["stereoisomerer", "Stoffer med atomerne bundet i samme rækkefølge, men med forskellig placering i rummet.", "Stoffer med atomerne bundet i samme rækkefølge, men med forskellig placering i rummet. De har samme molekylformel."],
     ["cis-trans-isomeri", "Kan forekomme ved en dobbeltbinding, fordi molekylet ikke kan drejes om den.", "Kan forekomme ved en dobbeltbinding, fordi molekylet ikke kan drejes om den. To grupper kan sidde på samme side af dobbeltbindingen eller på hver sin side."],
     ["cis-form", "Udgave af en alken, hvor de to grupper sidder på samme side af dobbeltbindingen.", "Udgave af en alken, hvor de to grupper sidder på samme side af dobbeltbindingen. De fleste naturlige umættede fedtsyrer har denne form."],
     ["trans-form", "Udgave af en alken, hvor de to grupper sidder på hver sin side af dobbeltbindingen.", "Udgave af en alken, hvor de to grupper sidder på hver sin side af dobbeltbindingen. En fedtsyre med denne form har en næsten lige kæde, som kan pakkes tæt."],
     ["Z", "Bogstav for den udgave, hvor de to vigtigste grupper sidder på samme side af C=C.", "Bogstav for den udgave, hvor de to vigtigste grupper sidder på samme side af C=C. Kommer af det tyske ord zusammen."],
     ["E", "Bogstav for den udgave, hvor de to vigtigste grupper sidder på hver sin side af C=C.", "Bogstav for den udgave, hvor de to vigtigste grupper sidder på hver sin side af C=C. Kommer af det tyske ord entgegen."],
     ["spejlbilledisomerer", "To stoffer, der forholder sig til hinanden som en højre og en venstre hånd.", "To stoffer, der forholder sig til hinanden som en højre og en venstre hånd. Molekylerne kan ikke bringes til at dække hinanden."],
     ["asymmetrisk carbonatom", "C-atom bundet til fire forskellige grupper.", "C-atom bundet til fire forskellige grupper. Det mærkes med en stjerne, og molekylet findes i to former, der er hinandens spejlbilleder."],
     ["prioritet", "Rækkefølgen af grupperne på et carbonatom.", "Rækkefølgen af grupperne på et carbonatom. Gruppen, hvis første atom har det højeste atomnummer, får nummer 1."],
     ["R-form", "Den spejlbilledform, hvor grupperne 1, 2 og 3 følger hinanden med uret.", "Den spejlbilledform, hvor grupperne 1, 2 og 3 følger hinanden med uret. Gruppe 4 skal pege væk fra dig."],
     ["S-form", "Den spejlbilledform, hvor grupperne 1, 2 og 3 følger hinanden mod uret.", "Den spejlbilledform, hvor grupperne 1, 2 og 3 følger hinanden mod uret. Gruppe 4 skal pege væk fra dig."]
    ]}
   ]},
   {"id": "b-kapitel-b4", "nr": "B4", "navn": "Funktionelle grupper", "afsnit": [
    {"titel": "B4.1 Carbonhydriders reaktioner", "ord": [
     ["substitution", "Reaktion, hvor et atom erstattes af et andet atom.", "Reaktion, hvor et atom erstattes af et andet atom. Alkaner reagerer sådan med dichlor og dibrom, når blandingen belyses."],
     ["halogenalkan", "Stof, hvor hydrogenatomer i en carbonkæde er erstattet af chlor-, brom- eller iodatomer.", "Stof, hvor hydrogenatomer i en carbonkæde er erstattet af chlor-, brom- eller iodatomer. Chlormethan og 2-brompropan er eksempler."],
     ["umættet", "Siges om et carbonhydrid med dobbelt- eller tripelbindinger mellem carbonatomer.", "Siges om et carbonhydrid med dobbelt- eller tripelbindinger mellem carbonatomer. Det gælder alkener og alkyner."],
     ["addition", "Reaktion, hvor en dobbeltbinding åbner sig, og der bindes et atom til hvert carbonatom.", "Reaktion, hvor en dobbeltbinding åbner sig, og der bindes et atom til hvert carbonatom. To stoffer bliver til ét."],
     ["polyaddition", "Reaktion, hvor tusindvis af alkenmolekyler bindes sammen til ét kædeformet molekyle.", "Reaktion, hvor tusindvis af alkenmolekyler bindes sammen til ét kædeformet molekyle. Dobbeltbindingerne åbner sig, og mange slags plast fremstilles sådan."],
     ["monomer", "Lille molekyle, som i tusindvis bindes sammen til et kædeformet molekyle.", "Lille molekyle, som i tusindvis bindes sammen til et kædeformet molekyle. Et eksempel er ethen."],
     ["polymer", "Kædeformet molekyle, der dannes, når tusindvis af små molekyler bindes sammen.", "Kædeformet molekyle, der dannes, når tusindvis af små molekyler bindes sammen. Et eksempel er plasten i poser og flasker."],
     ["makromolekyle", "Meget stor partikel, hvor tusindvis af atomer er bundet sammen.", "Meget stor partikel, hvor tusindvis af atomer er bundet sammen. Polyethen og proteiner er eksempler."],
     ["aromatisk", "Siges om et stof med en benzenring.", "Siges om et stof med en benzenring. Ringen er særlig stabil og reagerer ved substitution, ikke ved addition."],
     ["elimination", "Reaktion, hvor to atomer eller grupper på nabocarbonatomer fraspaltes, så der dannes C=C.", "Reaktion, hvor to atomer eller grupper på nabocarbonatomer fraspaltes, så der dannes C=C. Ét stof bliver til to."]
    ]},
    {"titel": "B4.2 Alkoholer", "ord": [
     ["alkohol", "Organisk stof med OH-grupper bundet til carbonatomer, der kun har enkeltbindinger.", "Organisk stof med OH-grupper bundet til carbonatomer, der kun har enkeltbindinger. Navnet ender på -ol."],
     ["hydroxygruppe", "Atomerne OH bundet til et carbonatom. De findes i alkoholer og phenoler."],
     ["phenol", "Stof, hvor en OH-gruppe sidder direkte på en benzenring.", "Stof, hvor en OH-gruppe sidder direkte på en benzenring. Stoffet er en svag syre, mens alkoholer praktisk talt ikke afgiver hydroner til vand."],
     ["primær alkohol", "OH-gruppen sidder på et carbonatom, der er bundet til ét andet carbonatom.", "OH-gruppen sidder på et carbonatom, der er bundet til ét andet carbonatom. Et eksempel er ethanol."],
     ["sekundær alkohol", "OH-gruppen sidder på et carbonatom, der er bundet til to andre carbonatomer.", "OH-gruppen sidder på et carbonatom, der er bundet til to andre carbonatomer. Et eksempel er propan-2-ol."],
     ["tertiær alkohol", "OH-gruppen sidder på et carbonatom, der er bundet til tre andre carbonatomer.", "OH-gruppen sidder på et carbonatom, der er bundet til tre andre carbonatomer. Carbonatomet sidder derfor ved en forgrening."],
     ["gæring", "Proces, hvor levende celler omdanner glucose til ethanol og carbondioxid.", "Proces, hvor levende celler omdanner glucose til ethanol og carbondioxid. Ethanolen i øl og vin dannes på den måde."]
    ]},
    {"titel": "B4.3 Aldehyder og ketoner", "ord": [
     ["carbonylgruppe", "Et C-atom og et O-atom bundet med en dobbeltbinding, C=O.", "Et C-atom og et O-atom bundet med en dobbeltbinding, C=O. Findes blandt andet i aldehyder og ketoner."],
     ["aldehyd", "Stof, hvor carbonatomet i C=O er bundet til mindst ét hydrogenatom. Navnet ender på -al."],
     ["keton", "Stof, hvor C=O sidder inde i kæden, så carbonatomet er bundet til to andre carbonatomer.", "Stof, hvor C=O sidder inde i kæden, så carbonatomet er bundet til to andre carbonatomer. Navnet ender på -on."],
     ["DNPH", "Stof, der giver gult eller orange bundfald med både aldehyder og ketoner.", "Stof, der giver gult eller orange bundfald med både aldehyder og ketoner. Et bundfald viser, at stoffet er et aldehyd eller en keton."],
     ["Tollens' test", "Påvisning af aldehyder med sølv(I)ioner i basisk opløsning.", "Påvisning af aldehyder med sølv(I)ioner i basisk opløsning. Et aldehyd giver et sølvspejl, mens en keton intet sølvspejl giver."]
    ]},
    {"titel": "B4.4 Carboxylsyrer", "ord": [
     ["carboxylsyre", "Organisk stof med en COOH-gruppe, som kan afgive en hydron.", "Organisk stof med en COOH-gruppe, som kan afgive en hydron. Findes i eddike, citroner og yoghurt."],
     ["carboxylgruppe", "Atomerne COOH.", "Atomerne COOH. C=O og OH sidder på det samme C-atom, og hydrogenatomet kan afgives som en hydron."],
     ["svag syre", "Stof, hvor kun en lille del af molekylerne har afgivet en hydron i vand.", "Stof, hvor kun en lille del af molekylerne har afgivet en hydron i vand. I en 0,1 M opløsning af ethansyre er det omkring 1 %."],
     ["sæbe", "Natriumsalte af fedtsyrer.", "Natriumsalte af fedtsyrer. Fedtsyrens baseform har en ladet, hydrofil ende og en lang, hydrofob hale, så fedt kan fordeles som små dråber i vand."]
    ]},
    {"titel": "B4.5 Estere", "ord": [
     ["ester", "Stof, der dannes af en carboxylsyre og en alkohol, mens der fraspaltes vand.", "Stof, der dannes af en carboxylsyre og en alkohol, mens der fraspaltes vand. Mange dufter af frugt."],
     ["kondensation", "Reaktion, hvor to molekyler bindes sammen, og der fraspaltes et lille molekyle.", "Reaktion, hvor to molekyler bindes sammen, og der fraspaltes et lille molekyle. Det er næsten altid vand."],
     ["estergruppe", "Atomerne −COO−, som binder syredelen og alkoholdelen sammen.", "Atomerne −COO−, som binder syredelen og alkoholdelen sammen. De dannes ved en kondensation."],
     ["hydrolyse", "Spaltning af et molekyle med vand, for eksempel en ester til carboxylsyre og alkohol.", "Spaltning af et molekyle med vand, for eksempel en ester til carboxylsyre og alkohol. Det modsatte af en kondensation."],
     ["sur hydrolyse", "Spaltning af en ester med vand, hvor en syre er katalysator. Reaktionen er en ligevægt."],
     ["forsæbning", "Spaltning af en ester i stærkt basisk miljø.", "Spaltning af en ester i stærkt basisk miljø. Syren bliver straks til sin baseform, så reaktionen forløber fuldstændig."],
     ["teoretisk udbytte", "Den masse af produkt, der kan dannes, hvis hele den begrænsende faktor bliver omdannet."],
     ["udbytteprocent", "Forholdet mellem den fremstillede og den størst mulige masse af produkt, gange 100 %.", "Forholdet mellem den fremstillede og den størst mulige masse af produkt, gange 100 %. Et eksempel er 60 %."]
    ]},
    {"titel": "B4.6 Aminer", "ord": [
     ["amin", "Organisk stof, hvor et eller flere hydrogenatomer i ammoniak er erstattet af carbonkæder."],
     ["aminogruppe", "Nitrogenatomet i en amin og de hydrogenatomer, der sidder på det, for eksempel NH₂.", "Nitrogenatomet i en amin og de hydrogenatomer, der sidder på det, for eksempel NH₂. Nitrogenatomet har et frit elektronpar og kan optage en hydron."],
     ["primær amin", "Nitrogenatomet er bundet til én carbonkæde og to hydrogenatomer. Skrives R−NH₂."],
     ["sekundær amin", "Nitrogenatomet er bundet til to carbonkæder og ét hydrogenatom. Skrives R−NH−R′."],
     ["tertiær amin", "Nitrogenatomet er bundet til tre carbonkæder og har intet hydrogenatom.", "Nitrogenatomet er bundet til tre carbonkæder og har intet hydrogenatom. Molekylerne kan derfor ikke danne hydrogenbindinger med hinanden."],
     ["svag base", "Stof, hvor kun en lille del af molekylerne har optaget en hydron i vand.", "Stof, hvor kun en lille del af molekylerne har optaget en hydron i vand. Et eksempel er ammoniak."],
     ["amidgruppe", "Atomerne −CO−NH−, som opstår, når en carboxylsyre og en amin kondenserer.", "Atomerne −CO−NH−, som opstår, når en carboxylsyre og en amin kondenserer. De binder aminosyrerne sammen i et protein."],
     ["aminosyre", "Molekyle med både NH₂ og COOH. Et protein består af hundredvis af dem bundet sammen."],
     ["protein", "Makromolekyle af typisk hundredvis af aminosyrer. Det dannes ved polykondensation."],
     ["polykondensation", "Reaktion, hvor molekyler med en reaktiv gruppe i hver ende danner en lang kæde.", "Reaktion, hvor molekyler med en reaktiv gruppe i hver ende danner en lang kæde. Der fraspaltes vand, og sådan dannes både proteiner og nylon."]
    ]},
    {"titel": "B4.7 Overblik: Reaktionstyper og test", "ord": [
     ["oxidation", "Reaktion, hvor et carbonatom får flere bindinger til oxygen eller færre til hydrogen.", "Reaktion, hvor et carbonatom får flere bindinger til oxygen eller færre til hydrogen. En primær alkohol omdannes sådan til et aldehyd."],
     ["reduktion", "Det omvendte af en oxidation.", "Det omvendte af en oxidation. C=O i propanon bliver for eksempel omdannet til OH i propan-2-ol."],
     ["syntese", "Fremstilling af et stof ud fra andre stoffer, ofte i flere trin.", "Fremstilling af et stof ud fra andre stoffer, ofte i flere trin. Den planlægges baglæns fra produktet."]
    ]}
   ]},
   {"id": "b-kapitel-b5", "nr": "B5", "navn": "Spektroskopi", "afsnit": [
    {"titel": "B5.1 Lys og farver", "ord": [
     ["bølgelængde", "Afstanden fra én top til den næste i lyset.", "Afstanden fra én top til den næste i lyset. Den har symbolet λ, angives i nanometer og bestemmer lysets farve og energi."],
     ["synligt lys", "Den del af den elektromagnetiske stråling, øjet kan opfatte.", "Den del af den elektromagnetiske stråling, øjet kan opfatte. Bølgelængderne går fra omkring 400 nm, som er violet, til omkring 700 nm, som er rødt."],
     ["hvidt lys", "Blanding af alle farverne fra violet til rød.", "Blanding af alle farverne fra violet til rød. Det udsendes af Solen og af almindelige lamper."],
     ["absorbere", "Optage lys, så lysets energi overføres til stoffet.", "Optage lys, så lysets energi overføres til stoffet. Et farvet stof optager kun nogle af bølgelængderne i det synlige lys."],
     ["farvecirkel", "Ring, der viser, hvad vi ser, når en bestemt del af lyset er absorberet.", "Ring, der viser, hvad vi ser, når en bestemt del af lyset er absorberet. Rød står lige over for blågrøn."],
     ["komplementærfarver", "Par som rød og blågrøn, der står lige over for hinanden i cirklen.", "Par som rød og blågrøn, der står lige over for hinanden i cirklen. Når et stof absorberer den ene, ser vi den anden."],
     ["konjugerede dobbeltbindinger", "To bindinger af typen C=C, C=O eller N=N med præcis én enkeltbinding imellem.", "To bindinger af typen C=C, C=O eller N=N med præcis én enkeltbinding imellem. Molekylerne i farvestoffer har en lang række af dem."],
     ["chromofor gruppe", "Lille del af et molekyle med en dobbeltbinding, som C=C, C=O eller N=N.", "Lille del af et molekyle med en dobbeltbinding, som C=C, C=O eller N=N. Flere af dem i en konjugeret række giver farve."]
    ]},
    {"titel": "B5.2 Absorbans og Lambert-Beers lov", "ord": [
     ["spektrofotometer", "Apparat, der sender lys med én bølgelængde gennem en opløsning.", "Apparat, der sender lys med én bølgelængde gennem en opløsning. Det måler, hvor meget lys der kommer ud på den anden side."],
     ["kuvette", "Lille, firkantet beholder af glas eller plast, som prøven står i. Lyset går igennem den."],
     ["absorbans", "Størrelse uden enhed med symbolet A. Jo mere lys opløsningen optager, jo større er den."],
     ["blindprøve", "Kuvette med opløsningsmidlet uden det farvede stof, ofte demineraliseret vand.", "Kuvette med opløsningsmidlet uden det farvede stof, ofte demineraliseret vand. Med den nulstilles spektrofotometeret, før der måles."],
     ["absorptionsspektrum", "Graf, der viser, hvor meget lys et stof optager ved hver bølgelængde.", "Graf, der viser, hvor meget lys et stof optager ved hver bølgelængde. Hvert farvet stof har sin egen, så den kan bruges til at genkende stoffet."],
     ["absorptionsmaksimum", "Den bølgelængde, hvor et stof optager mest lys.", "Den bølgelængde, hvor et stof optager mest lys. Den skrives λₘₐₓ og ses som toppen på grafen."],
     ["ligefrem proportional", "Sammenhæng, hvor den ene størrelse er en konstant gange den anden.", "Sammenhæng, hvor den ene størrelse er en konstant gange den anden. Absorbansen bliver for eksempel 2 gange så stor, når koncentrationen bliver det."],
     ["lysvej", "Kuvettens bredde med symbolet l, som regel 1,00 cm.", "Kuvettens bredde med symbolet l, som regel 1,00 cm. Jo bredere kuvetten er, jo større bliver absorbansen."],
     ["ekstinktionskoefficient", "Konstant, der viser, hvor kraftigt et stof absorberer lys ved en bestemt bølgelængde.", "Konstant, der viser, hvor kraftigt et stof absorberer lys ved en bestemt bølgelængde. Symbolet er ε."],
     ["Lambert-Beers lov", "Siger, at absorbansen er ekstinktionskoefficienten ganget med lysvejen og koncentrationen.", "Siger, at absorbansen er ekstinktionskoefficienten ganget med lysvejen og koncentrationen. Gælder kun for fortyndede opløsninger."]
    ]},
    {"titel": "B5.3 Standardkurven", "ord": [
     ["standardopløsning", "Væske med en præcist kendt koncentration af det stof, der skal bestemmes.", "Væske med en præcist kendt koncentration af det stof, der skal bestemmes. En række af dem med stigende koncentration måles i spektrofotometeret."],
     ["stamopløsning", "Væske med en høj, præcist kendt koncentration af stoffet.", "Væske med en høj, præcist kendt koncentration af stoffet. Rækken af standarder fremstilles ved at fortynde den med vand."],
     ["standardkurve", "Graf over absorbansen af en række kendte opløsninger som funktion af koncentrationen.", "Graf over absorbansen af en række kendte opløsninger som funktion af koncentrationen. I det lineære område ligger punkterne på en ret linje."],
     ["massekoncentration", "Antal gram af et opløst stof pr. liter opløsning.", "Antal gram af et opløst stof pr. liter opløsning. Symbolet er γ, og enheden er g/L eller mg/L."],
     ["lineært område", "Koncentrationsinterval, hvor absorbansen er proportional med koncentrationen.", "Koncentrationsinterval, hvor absorbansen er proportional med koncentrationen. Kun her kan en standardkurve bruges til at bestemme en koncentration."]
    ]}
   ]},
   {"id": "b-kapitel-b6", "nr": "B6", "navn": "Syrer og baser", "afsnit": [
    {"titel": "B6.1 Syrer, baser og pH", "ord": [
     ["hydron", "Ionen H⁺, som kun består af en proton, fordi H-atomet har afgivet sin elektron.", "Ionen H⁺, som kun består af en proton, fordi H-atomet har afgivet sin elektron. Syrer afgiver den, og baser optager den."],
     ["syre", "Stof, der kan afgive en hydron, for eksempel HCl."],
     ["base", "Stof, der kan optage en hydron, for eksempel NH₃."],
     ["syre-basereaktion", "Overførsel af en hydron fra det stof, der afgiver den, til det stof, der optager den."],
     ["korresponderende syre-basepar", "To partikler, der adskiller sig med præcis én hydron, for eksempel NH₄⁺ og NH₃.", "To partikler, der adskiller sig med præcis én hydron, for eksempel NH₄⁺ og NH₃. Den ene bliver til den anden ved at afgive en hydron."],
     ["amfolyt", "Stof, der både kan afgive og optage en hydron. Vand er det vigtigste eksempel."],
     ["monohydron", "Siges om en syre, der kun kan afgive én H⁺.", "Siges om en syre, der kun kan afgive én H⁺. Det gælder saltsyre, salpetersyre og ethansyre."],
     ["polyhydron", "Siges om en syre, der kan afgive flere H⁺, én ad gangen.", "Siges om en syre, der kan afgive flere H⁺, én ad gangen. Svovlsyre og phosphorsyre er eksempler."],
     ["vands selvionisering", "To H₂O-molekyler reagerer med hinanden, så det ene afgiver en hydron til det andet.", "To H₂O-molekyler reagerer med hinanden, så det ene afgiver en hydron til det andet. Der dannes en oxoniumion og en hydroxidion."],
     ["vands ionprodukt", "Koncentrationen af oxoniumioner ganget med koncentrationen af hydroxidioner.", "Koncentrationen af oxoniumioner ganget med koncentrationen af hydroxidioner. Konstanten har symbolet Kᵥ og er 1,0 · 10⁻¹⁴ M² ved 25 °C."],
     ["pH", "Minus logaritmen til koncentrationen af oxoniumioner.", "Minus logaritmen til koncentrationen af oxoniumioner. Rent vand har værdien 7,00 ved 25 °C."],
     ["pOH", "Minus logaritmen til koncentrationen af hydroxidioner.", "Minus logaritmen til koncentrationen af hydroxidioner. Summen af den og pH er 14,00 ved 25 °C."]
    ]},
    {"titel": "B6.2 Syre- og basestyrke", "ord": [
     ["syrestyrkekonstant", "Størrelsen Kₛ fra ligevægtsloven for et stof, der afgiver en hydron til vand.", "Størrelsen Kₛ fra ligevægtsloven for et stof, der afgiver en hydron til vand. Jo større Kₛ er, jo længere ligger ligevægten mod højre."],
     ["syrestyrkeeksponent", "Tallet pKₛ, som er minus logaritmen til Kₛ.", "Tallet pKₛ, som er minus logaritmen til Kₛ. Jo lavere det er, jo lettere afgiver stoffet sin hydron."],
     ["stærk syre", "Har pKₛ under 0 og reagerer fuldstændigt med vand, så alle molekyler afgiver en hydron.", "Har pKₛ under 0 og reagerer fuldstændigt med vand, så alle molekyler afgiver en hydron. Et eksempel er HCl."],
     ["svag syre", "Har pKₛ mellem 4 og 10.", "Har pKₛ mellem 4 og 10. Typisk har kun en lille del af molekylerne afgivet deres hydron, og reaktionen med vand er en ligevægt."],
     ["middelstærk syre", "Har pKₛ mellem 0 og 4. Et eksempel er hydrogenfluorid, HF."],
     ["formel koncentration", "Stofmængden pr. liter af en syre, hvis ingen molekyler havde reageret.", "Stofmængden pr. liter af en syre, hvis ingen molekyler havde reageret. Det er tallet på flasken, og symbolet er cₛ."],
     ["aktuel koncentration", "Stofmængden pr. liter af de syremolekyler, der faktisk er i opløsningen ved ligevægt.", "Stofmængden pr. liter af de syremolekyler, der faktisk er i opløsningen ved ligevægt. Skrives [S]."],
     ["omdannelsesgrad", "Den brøkdel af en syre, der har afgivet sin hydron.", "Den brøkdel af en syre, der har afgivet sin hydron. Symbolet er α, og brøkdelen stiger, når opløsningen fortyndes."],
     ["basestyrkekonstant", "Størrelsen Kb fra ligevægtsloven for et stof, der optager en hydron fra vand.", "Størrelsen Kb fra ligevægtsloven for et stof, der optager en hydron fra vand. Jo større Kb er, jo flere hydroxidioner dannes der."],
     ["basestyrkeeksponent", "Tallet pKb, som er minus logaritmen til Kb.", "Tallet pKb, som er minus logaritmen til Kb. Summen af pKb og pKₛ for den korresponderende syre er 14,00."],
     ["stærk base", "Har pKb under 0.", "Har pKb under 0. Den vigtigste er hydroxidionen, OH⁻, som findes i natriumhydroxid og kaliumhydroxid."]
    ]},
    {"titel": "B6.5 Puffersystemer", "ord": [
     ["puffersystem", "Opløsning med en svag syre og dens korresponderende base i omtrent lige store stofmængder.", "Opløsning med en svag syre og dens korresponderende base i omtrent lige store stofmængder. pH ændrer sig næsten ikke, når der tilsættes lidt syre eller base."],
     ["pufferligningen", "Formel til at beregne pH, når der både er en svag syre og dens korresponderende base.", "Formel til at beregne pH, når der både er en svag syre og dens korresponderende base. pH er pKₛ plus logaritmen til forholdet mellem stofmængderne af base og syre."]
    ]},
    {"titel": "B6.6 Titrering af en svag syre", "ord": [
     ["titrering", "Metode, hvor en opløsning med kendt koncentration tilsættes fra en burette.", "Metode, hvor en opløsning med kendt koncentration tilsættes fra en burette. Tilsætningen stoppes, når stoffet i kolben netop har reageret fuldstændigt."],
     ["ækvivalenspunkt", "Stedet på titrerkurven, hvor tilsat base og syren i kolben har samme stofmængde.", "Stedet på titrerkurven, hvor tilsat base og syren i kolben har samme stofmængde. Det ligger midt på det lodrette spring."],
     ["titrerkurve", "Graf over pH som funktion af rumfanget af tilsat base.", "Graf over pH som funktion af rumfanget af tilsat base. For en svag syre har den fire dele og et lodret spring."],
     ["halvækvivalenspunkt", "Her er der tilsat halvdelen af den stofmængde base, der kræves for at omdanne al syren.", "Her er der tilsat halvdelen af den stofmængde base, der kræves for at omdanne al syren. pH er lig med syrens pKₛ."],
     ["indikator", "Svag syre, hvor syreformen og baseformen har hver sin farve.", "Svag syre, hvor syreformen og baseformen har hver sin farve. Phenolphthalein og methylrødt er eksempler."],
     ["omslagsområde", "Det pH-interval, hvor en indikator skifter farve.", "Det pH-interval, hvor en indikator skifter farve. Ved en titrering skal det ligge inden for titrerkurvens lodrette spring."]
    ]}
   ]},
   {"id": "b-kapitel-b7", "nr": "B7", "navn": "Fødevarer", "afsnit": [
    {"titel": "B7.1 Monosaccharider", "ord": [
     ["næringsstof", "Stof i maden, der giver kroppen energi. Kulhydrater, fedt og proteiner er de tre slags."],
     ["monosaccharid", "Sukkerstof af én enhed, som ikke kan spaltes til mindre sukkerstoffer.", "Sukkerstof af én enhed, som ikke kan spaltes til mindre sukkerstoffer. Et eksempel er glucose."],
     ["disaccharid", "Sukkerstof af to enheder, der er bundet sammen, for eksempel maltose og lactose."],
     ["fischerprojektion", "Hurtig måde at tegne et sukkerstof som åben kæde.", "Hurtig måde at tegne et sukkerstof som åben kæde. Kæden står lodret med carbonatom 1 øverst, og OH-grupperne peger til højre eller venstre."],
     ["glucose", "Druesukker. Det monosaccharid, blodet fører rundt til kroppens celler."],
     ["fructose", "Frugtsukker. Monosaccharid i frugt og honning, som smager mere sødt end druesukker."],
     ["aldose", "Monosaccharid med en aldehydgruppe, for eksempel glucose og galactose."],
     ["ketose", "Monosaccharid med en ketongruppe, for eksempel fructose."],
     ["D-form", "Stereoisomer, hvor OH på det nederste asymmetriske carbonatom peger til højre.", "Stereoisomer, hvor OH på det nederste asymmetriske carbonatom peger til højre. Retningen aflæses i fischerprojektionen, og næsten alle sukkerstoffer i naturen har denne opbygning."],
     ["L-form", "Stereoisomer, hvor OH på det nederste asymmetriske carbonatom peger til venstre.", "Stereoisomer, hvor OH på det nederste asymmetriske carbonatom peger til venstre. Retningen aflæses i fischerprojektionen. Kroppen kan ikke udnytte glucose med denne opbygning."]
    ]},
    {"titel": "B7.2 Ringslutning", "ord": [
     ["ringslutning", "Reaktion, hvor kæden i et sukkerstof bøjer og lukker sig om sig selv.", "Reaktion, hvor kæden i et sukkerstof bøjer og lukker sig om sig selv. I glucose binder oxygenatomet på carbonatom 5 sig til carbonatom 1."],
     ["haworthformel", "Tegning af et sukkerstof som en ring, set skråt fra siden.", "Tegning af et sukkerstof som en ring, set skråt fra siden. Den tykke kant vender ud mod læseren, og grupperne peger op eller ned."],
     ["α-glucose", "Ringform af druesukker, hvor OH-gruppen på carbonatom 1 peger ned."],
     ["β-glucose", "Ringform af druesukker, hvor OH-gruppen på carbonatom 1 peger op.", "Ringform af druesukker, hvor OH-gruppen på carbonatom 1 peger op. Den peger til samme side som CH₂OH-gruppen."]
    ]},
    {"titel": "B7.3 Disaccharider og polysaccharider", "ord": [
     ["glykosidbinding", "Gruppen C−O−C, der forbinder to sukkerenheder.", "Gruppen C−O−C, der forbinder to sukkerenheder. Den dannes ved en kondensation, hvor to OH-grupper reagerer, og der fraspaltes vand."],
     ["maltose", "Disaccharid af to glucoseenheder.", "Disaccharid af to glucoseenheder. Det dannes, når stivelse spaltes, for eksempel i korn, der spirer."],
     ["lactose", "Sukkeret i mælk.", "Sukkeret i mælk. Disaccharid af glucose og galactose, bundet sammen med en β-1,4-glykosidbinding."],
     ["saccharose", "Det sukker, man køber i en pose.", "Det sukker, man køber i en pose. Består af glucose og fructose, og ingen af de to ringe kan åbne sig."],
     ["polysaccharid", "Kæde af hundreder eller tusinder af sukkerenheder. Stivelse og cellulose er eksempler."],
     ["stivelse", "Planternes lager af energi i korn, kartofler og ris.", "Planternes lager af energi i korn, kartofler og ris. Blanding af to polysaccharider, som farves blåsort af diiod."],
     ["amylose", "Den del af stivelse, der er en lang kæde uden forgreninger. Kæden snor sig som en spiral."],
     ["amylopectin", "Den del af stivelse, hvor kæden forgrener sig med jævne mellemrum.", "Den del af stivelse, hvor kæden forgrener sig med jævne mellemrum. I en forgrening går bindingen fra carbonatom 1 til carbonatom 6."],
     ["glykogen", "Dyrs og menneskers lager af glucose i leveren og musklerne.", "Dyrs og menneskers lager af glucose i leveren og musklerne. Kæden har mange forgreninger, så glucosen hurtigt kan frigives."],
     ["cellulose", "Stoffet i planternes cellevægge og i træ, papir og bomuld.", "Stoffet i planternes cellevægge og i træ, papir og bomuld. Glucoseenhederne har β-bindinger, så kæderne er helt lige og danner stærke fibre."],
     ["hydrolyse", "Reaktion, hvor vand spalter en binding, for eksempel i et disaccharid.", "Reaktion, hvor vand spalter en binding, for eksempel i et disaccharid. Det modsatte af en kondensation."]
    ]},
    {"titel": "B7.4 Fehlings test", "ord": [
     ["Fehlings væske", "Dybblå, basisk blanding med kobber(II)ioner, som tartrat holder opløst.", "Dybblå, basisk blanding med kobber(II)ioner, som tartrat holder opløst. Giver rødt bundfald med stoffer, der har en aldehydgruppe."],
     ["Fehling I", "Blå opløsning af kobber(II)sulfat.", "Blå opløsning af kobber(II)sulfat. Den ene af de to opløsninger, der blandes lige før testen for aldehydgrupper."],
     ["Fehling II", "Opløsning af natriumhydroxid og saltet kaliumnatriumtartrat.", "Opløsning af natriumhydroxid og saltet kaliumnatriumtartrat. Den gør blandingen basisk, og tartrat holder kobber(II)ionerne opløst."],
     ["reducerende sukker", "Kulhydrat, der omdanner kobber(II)ioner til rødt kobber(I)oxid.", "Kulhydrat, der omdanner kobber(II)ioner til rødt kobber(I)oxid. Mindst én ring kan åbne sig, så der opstår en aldehydgruppe, som i glucose og maltose."]
    ]},
    {"titel": "B7.5 Fedtstoffer", "ord": [
     ["glycerol", "Alkohol med tre OH-grupper, propan-1,2,3-triol.", "Alkohol med tre OH-grupper, propan-1,2,3-triol. I et fedtstof er den bundet til tre fedtsyrer."],
     ["fedtsyre", "Carboxylsyre med en lang carbonkæde uden forgreninger.", "Carboxylsyre med en lang carbonkæde uden forgreninger. De fleste har 16 eller 18 carbonatomer."],
     ["triglycerid", "Et andet ord for et fedtstof.", "Et andet ord for et fedtstof. Ester med tre estergrupper, dannet af en alkohol med tre OH-grupper og tre fedtsyrer."],
     ["mættet fedtsyre", "Carboxylsyre med en lang carbonkæde uden dobbeltbindinger mellem carbonatomer.", "Carboxylsyre med en lang carbonkæde uden dobbeltbindinger mellem carbonatomer. Kæden er lige, så molekylerne kan pakkes tæt, og smeltepunktet bliver højt."],
     ["umættet fedtsyre", "Carboxylsyre med en lang carbonkæde og én eller flere C=C-dobbeltbindinger.", "Carboxylsyre med en lang carbonkæde og én eller flere C=C-dobbeltbindinger. Cis-dobbeltbindinger giver et knæk i kæden og et lavt smeltepunkt."],
     ["hærdning", "Addition af dihydrogen til dobbeltbindingerne i en olie, så den bliver et fast fedtstof.", "Addition af dihydrogen til dobbeltbindingerne i en olie, så den bliver et fast fedtstof. Sådan kan margarine fremstilles af planteolie."],
     ["transfedtsyre", "Lang carboxylsyre med en dobbeltbinding, der ikke er cis, så kæden er næsten lige.", "Lang carboxylsyre med en dobbeltbinding, der ikke er cis, så kæden er næsten lige. Kan dannes, når kun en del af dobbeltbindingerne i en olie adderer dihydrogen."]
    ]},
    {"titel": "B7.6 Iodtal og forsæbning", "ord": [
     ["iodtal", "Massen af I₂ i gram, som 100 g fedtstof kan addere.", "Massen af I₂ i gram, som 100 g fedtstof kan addere. Jo højere værdien er, jo flere C=C-dobbeltbindinger har fedtstoffet."],
     ["tilbagetitrering", "Metode, hvor der tilsættes et kendt overskud, og resten bagefter måles og trækkes fra.", "Metode, hvor der tilsættes et kendt overskud, og resten bagefter måles og trækkes fra. Den bruges til langsomme reaktioner."],
     ["forsæbning", "Spaltning af en ester med en stærk base.", "Spaltning af en ester med en stærk base. Koges et fedtstof med kaliumhydroxid, dannes glycerol og saltene af de tre fedtsyrer."],
     ["sæbe", "Saltene af fedtsyrer.", "Saltene af fedtsyrer. Ionen har en upolær hale og et ladet hoved og kan derfor fordele fedt som små dråber i vand."],
     ["forsæbningstal", "Milligram kaliumhydroxid, der forbruges ved spaltning af estergrupperne i 1 g fedtstof.", "Milligram kaliumhydroxid, der forbruges ved spaltning af estergrupperne i 1 g fedtstof. Tallet er højt, når fedtsyrekæderne er korte."],
     ["syretal", "Milligram kaliumhydroxid, der neutraliserer de frie fedtsyrer i 1 g fedtstof.", "Milligram kaliumhydroxid, der neutraliserer de frie fedtsyrer i 1 g fedtstof. Tallet stiger, når olien bliver harsk."]
    ]},
    {"titel": "B7.7 Aminosyrer", "ord": [
     ["aminosyre", "Proteinernes byggesten.", "Proteinernes byggesten. Molekyle med en NH₂-gruppe og en carboxylgruppe på det samme carbonatom."],
     ["sidekæde", "Den fjerde gruppe på det midterste carbonatom i en aminosyre.", "Den fjerde gruppe på det midterste carbonatom i en aminosyre. Den skrives R og gør de 20 aminosyrer forskellige."],
     ["upolær sidekæde", "Gruppen R i en aminosyre, når den kun består af carbon og hydrogen. Den er hydrofob."],
     ["polær sidekæde", "Gruppen R i en aminosyre, når den kan danne hydrogenbindinger.", "Gruppen R i en aminosyre, når den kan danne hydrogenbindinger. Den har for eksempel en OH-gruppe."],
     ["sur sidekæde", "Gruppen R i en aminosyre, når den har en ekstra carboxylgruppe, som kan afgive en hydron."],
     ["basisk sidekæde", "Gruppen R i en aminosyre, når den har en ekstra NH₂-gruppe, som kan optage en hydron."],
     ["essentiel aminosyre", "Byggesten til proteiner, som kroppen ikke selv kan danne, men skal tilføres med maden.", "Byggesten til proteiner, som kroppen ikke selv kan danne, men skal tilføres med maden. Et voksent menneske skal have ni forskellige."],
     ["amfoion", "Partikel med en positiv ladning i den ene ende og en negativ i den anden.", "Partikel med en positiv ladning i den ene ende og en negativ i den anden. Den samlede ladning er 0, og sådan findes en aminosyre i vand."],
     ["fordelingsdiagram", "Graf, der viser andelen af molekylerne på hver form som funktion af pH.", "Graf, der viser andelen af molekylerne på hver form som funktion af pH. Hvor to kurver skærer hinanden, er pH lig med pKₛ."],
     ["isoelektrisk punkt", "Den pH, hvor næsten alle molekyler af en aminosyre er amfoioner med samlet ladning 0.", "Den pH, hvor næsten alle molekyler af en aminosyre er amfoioner med samlet ladning 0. Ligger midt mellem de to pKₛ-værdier."]
    ]},
    {"titel": "B7.8 Proteiner", "ord": [
     ["peptidbinding", "Forbinder to aminosyrer i en kæde.", "Forbinder to aminosyrer i en kæde. Carbon fra den enes carboxylgruppe er bundet til nitrogen fra den andens aminogruppe."],
     ["dipeptid", "To aminosyrer, der er bundet sammen, for eksempel Ala-Gly."],
     ["protein", "Én eller flere lange kæder af typisk 100 til 1000 aminosyrer, foldet til en bestemt form."],
     ["primær struktur", "Rækkefølgen af aminosyrer i kæden.", "Rækkefølgen af aminosyrer i kæden. Den er bestemt af generne og ændres ikke ved denaturering."],
     ["sekundær struktur", "De faste mønstre, en proteinkæde lægger sig i på grund af hydrogenbindinger i kæden.", "De faste mønstre, en proteinkæde lægger sig i på grund af hydrogenbindinger i kæden. Hydrogenbindingerne går mellem C=O og N−H, og spiral og foldeblad er de to vigtigste mønstre."],
     ["α-helix", "Mønster, hvor proteinkæden snor sig som en spiral.", "Mønster, hvor proteinkæden snor sig som en spiral. Hydrogenbindingerne går mellem vindingerne."],
     ["β-foldeblad", "Mønster, hvor flere stykker af proteinkæden ligger side om side.", "Mønster, hvor flere stykker af proteinkæden ligger side om side. De holdes sammen af hydrogenbindinger."],
     ["tertiær struktur", "Den måde, hele kæden til sidst er foldet på, enten kugleformet eller som en fiber.", "Den måde, hele kæden til sidst er foldet på, enten kugleformet eller som en fiber. Holdes sammen af bindinger mellem sidekæderne."],
     ["hydrofob vekselvirkning", "Biokemiens navn for, at upolære sidekæder samler sig inde i proteinet, væk fra vandet.", "Biokemiens navn for, at upolære sidekæder samler sig inde i proteinet, væk fra vandet. De holdes sammen af londonbindinger."],
     ["disulfidbro", "Elektronparbinding mellem to svovlatomer, −S−S−, fra to sidekæder af cystein.", "Elektronparbinding mellem to svovlatomer, −S−S−, fra to sidekæder af cystein. Den stærkeste af bindingerne mellem sidekæder."],
     ["kvaternær struktur", "Måden, flere peptidkæder er samlet på i ét protein. Hæmoglobin består af fire kæder."],
     ["denaturering", "Proteinet folder sig ud og mister sin form, fordi de svage bindinger brydes.", "Proteinet folder sig ud og mister sin form, fordi de svage bindinger brydes. Peptidbindingerne brydes ikke. Et eksempel er et kogt æg."]
    ]}
   ]},
   {"id": "b-kapitel-b8", "nr": "B8", "navn": "Medicin", "afsnit": [
    {"titel": "B8.1 Lægemidler, receptorer og kiralitet", "ord": [
     ["lægemiddel", "Stof, der bruges til at forebygge, lindre eller helbrede sygdom."],
     ["virksomt stof", "Den del af en tablet, der virker mod sygdommen, for eksempel paracetamol i Panodil.", "Den del af en tablet, der virker mod sygdommen, for eksempel paracetamol i Panodil. Resten holder tabletten sammen."],
     ["acetylsalicylsyre", "Det smertestillende stof i Aspirin og Magnyl.", "Det smertestillende stof i Aspirin og Magnyl. Molekylet har en benzenring med en carboxylgruppe og en estergruppe."],
     ["paracetamol", "Det smertestillende stof i Panodil og Pinex.", "Det smertestillende stof i Panodil og Pinex. Molekylet har en hydroxygruppe på benzenringen og en amidgruppe."],
     ["ibuprofen", "Det smertestillende stof i Ipren. Molekylet har en carboxylgruppe og en lang, upolær del."],
     ["signalstof", "Lille molekyle, som en celle udskiller, og en anden celle opfanger.", "Lille molekyle, som en celle udskiller, og en anden celle opfanger. Adrenalin og dopamin er eksempler."],
     ["receptor", "Protein, oftest i cellens membran, med en lomme, hvor netop ét signalstof passer ind."],
     ["bindingslomme", "Det sted i en receptor, hvor signalstoffet eller lægemidlet bindes.", "Det sted i en receptor, hvor signalstoffet eller lægemidlet bindes. Proteinet er foldet, så netop ét stof passer ind."],
     ["agonist", "Stof, der ligner signalstoffet så meget, at det tænder receptoren og giver samme virkning.", "Stof, der ligner signalstoffet så meget, at det tænder receptoren og giver samme virkning. Et eksempel er morfin."],
     ["antagonist", "Stof, der passer i receptorens lomme uden at tænde den.", "Stof, der passer i receptorens lomme uden at tænde den. Det optager pladsen, så signalstoffet ikke kan bindes, og virkningen dæmpes."],
     ["kiral", "Siges om et molekyle, der ikke kan bringes til at dække sit eget spejlbillede.", "Siges om et molekyle, der ikke kan bringes til at dække sit eget spejlbillede. To hænder er på samme måde spejlbilleder uden at være ens."],
     ["kiralt center", "Carbonatom bundet til fire forskellige grupper. Det samme som et asymmetrisk carbonatom."],
     ["spejlbilledformer", "De to udgaver af et molekyle med ét asymmetrisk carbonatom.", "De to udgaver af et molekyle med ét asymmetrisk carbonatom. De forholder sig til hinanden som højre og venstre hånd og kan virke forskelligt i kroppen."],
     ["racemisk blanding", "Lige meget af de to spejlbilledformer af et stof.", "Lige meget af de to spejlbilledformer af et stof. Det dannes normalt, når stoffet fremstilles i laboratoriet."]
    ]},
    {"titel": "B8.2 Lægemidler som syrer og baser", "ord": [
     ["carboxylgruppe", "Atomerne COOH i et molekyle.", "Atomerne COOH i et molekyle. De gør et lægemiddel til en svag syre, for eksempel acetylsalicylsyre og ibuprofen."],
     ["aminogruppe", "Nitrogenatomet i en amin og de hydrogenatomer, der sidder på det, for eksempel NH₂.", "Nitrogenatomet i en amin og de hydrogenatomer, der sidder på det, for eksempel NH₂. Nitrogenatomet gør et lægemiddel til en svag base, for eksempel adrenalin, amfetamin og morfin."],
     ["hydrochlorid", "Salt, der dannes, når en amin reagerer med saltsyre.", "Salt, der dannes, når en amin reagerer med saltsyre. Saltet opløses let i vand, og derfor sælges mange lægemidler sådan."]
    ]},
    {"titel": "B8.3 Log P og log D", "ord": [
     ["fordelingskonstant", "Koncentrationen af et stof i octan-1-ol divideret med koncentrationen i vand.", "Koncentrationen af et stof i octan-1-ol divideret med koncentrationen i vand. Stoffet er rystet med de to væsker, og symbolet er KF."]
    ]},
    {"titel": "B8.3 Log P og log D", "ord": [
     ["log P", "Mål for, hvor hydrofob den uladede form af et stof er.", "Mål for, hvor hydrofob den uladede form af et stof er. Ved værdien 2 er koncentrationen 100 gange så stor i octanol som i vand."]
    ]},
    {"titel": "B8.3 Log P og log D", "ord": [
     ["fordelingsforhold", "Koncentrationen af uladet form i octanol divideret med den samlede koncentration i vand.", "Koncentrationen af uladet form i octanol divideret med den samlede koncentration i vand. Begge former medregnes i vandlaget, og symbolet er D."]
    ]},
    {"titel": "B8.3 Log P og log D", "ord": [
     ["log D", "Viser, hvordan en syre eller base fordeler sig mellem octanol og vand ved en bestemt pH.", "Viser, hvordan en syre eller base fordeler sig mellem octanol og vand ved en bestemt pH. Den ladede form medregnes."]
    ]},
    {"titel": "B8.4 Fremstilling af acetylsalicylsyre", "ord": [
     ["ethansyreanhydrid", "Stoffet, der reagerer med salicylsyre og danner acetylsalicylsyre.", "Stoffet, der reagerer med salicylsyre og danner acetylsalicylsyre. To molekyler af syren i eddike, bundet sammen under fraspaltning af vand."],
     ["filtrering", "Metode, der skiller et fast stof fra en væske.", "Metode, der skiller et fast stof fra en væske. Krystallerne suges fri for væske på en tragt."],
     ["råprodukt", "Krystallerne lige efter filtreringen, før de er renset.", "Krystallerne lige efter filtreringen, før de er renset. De indeholder stadig lidt salicylsyre."],
     ["omkrystallisering", "Rensning af et fast stof, der opløses varmt og udfældes igen ved afkøling.", "Rensning af et fast stof, der opløses varmt og udfældes igen ved afkøling. Urenhederne bliver i opløsningen."],
     ["separation", "Fælles navn for metoder, der skiller stoffer fra hinanden.", "Fælles navn for metoder, der skiller stoffer fra hinanden. Filtrering og chromatografi er eksempler, og hver metode udnytter en forskel i én egenskab."],
     ["destillation", "Metode, der skiller væsker ad efter kogepunkt.", "Metode, der skiller væsker ad efter kogepunkt. Blandingen koges, og dampen køles til væske igen i en svaler."],
     ["destillat", "Væsken, der drypper ud af svaleren.", "Væsken, der drypper ud af svaleren. Den indeholder mest af det stof, der har det laveste kogepunkt."]
    ]},
    {"titel": "B8.5 TLC", "ord": [
     ["chromatografi", "Fælles navn for metoder, der skiller en blanding ad ved at lade den vandre med en væske.", "Fælles navn for metoder, der skiller en blanding ad ved at lade den vandre med en væske. Væsken løber hen over et fast stof."],
     ["tyndtlagschromatografi", "Metode, hvor en væske suges op gennem kiselgel på en plade og skiller stofferne ad.", "Metode, hvor en væske suges op gennem kiselgel på en plade og skiller stofferne ad. Forkortes TLC."],
     ["TLC", "Forkortelse for metoden, hvor pletter af prøver sættes på en plade med kiselgel.", "Forkortelse for metoden, hvor pletter af prøver sættes på en plade med kiselgel. En væske fører dem med op ad pladen."],
     ["stationær fase", "Laget på pladen, som stofferne bindes til. For det meste kiselgel, som er polær."],
     ["mobil fase", "Væsken, der suges op gennem laget på pladen og fører stofferne med sig.", "Væsken, der suges op gennem laget på pladen og fører stofferne med sig. Et organisk opløsningsmiddel eller en blanding af flere."],
     ["løbevæske", "Et andet ord for den mobile fase.", "Et andet ord for den mobile fase. Den står i bunden af karret, og dens overflade skal være under startlinjen."],
     ["væskefront", "Den øverste kant af den mobile fase på pladen.", "Den øverste kant af den mobile fase på pladen. Her tegnes en streg, straks pladen tages op af karret."],
     ["Rf-værdi", "Plettens afstand fra startlinjen divideret med væskefrontens afstand fra startlinjen.", "Plettens afstand fra startlinjen divideret med væskefrontens afstand fra startlinjen. Et tal mellem 0 og 1 uden enhed."]
    ]},
    {"titel": "B8.6 Hvor meget virksomt stof?", "ord": [
     ["salicylat", "Ion med en fri OH-gruppe på benzenringen.", "Ion med en fri OH-gruppe på benzenringen. Den dannes, når det virksomme stof i Aspirin forsæbes, og giver et lilla kompleks med jern(III)ioner."],
     ["kompleks", "Stof, hvor en metalion har bundet andre ioner eller molekyler til sig.", "Stof, hvor en metalion har bundet andre ioner eller molekyler til sig. Et eksempel er det lilla stof af jern(III) og salicylat."]
    ]}
   ]}
  ]}
 ]
};
