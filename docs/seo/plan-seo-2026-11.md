# Plan SEO — novembre 2026 (focus ravalement de façade)

Analyse du 2026-11-17 : code du site (pages, contenu, JSON-LD, maillage, sitemap), production (`vprr.fr`), résultats
Google sur « ravalement façade Angoulême / Cognac », règlements municipaux d'aide au ravalement. Aucune donnée Search
Console n'a été consultée (pas d'accès) : les priorités ci-dessous sont à recaler dès qu'un export sera disponible (§7).

> Ce qui est déjà bon (ne pas refaire) : technique saine (HTTPS, canonicals, sitemap avec `lastmod`, 301 propres, footer
> en HTML, Lighthouse 99/100/100/100), titres ≤ 60 car., JSON-LD généré, vraies photos avant/après sur la page
> ravalement, `llms.txt`, robots IA autorisés. Le site n'a pas de problème technique bloquant : **les gains viendront
> du contenu local, de la fiche Google et des liens/citations**, pas du code.

## 1. Constat sur le ravalement

| Point | Constat | Effet |
|---|---|---|
| Une seule page cible | `ravalement-facade-angouleme.html` vise Angoulême ; les autres communes ne sont qu'une liste (`content/shared/communes.json`) et un `areaServed` JSON-LD | Google ne classe pas une page « Angoulême » sur « ravalement façade Cognac » |
| **Cannibalisation** | L'article `blog/ravalement-facade-angouleme-charente.html` a pour title « Ravalement de façade à Angoulême (Charente) » : même requête que la page de service. Même schéma pour peinture (`blog/peinture-exterieure-facade-angouleme.html`), toiture (`demoussage-nettoyage-toiture-charente`) et hydrogommage (`nettoyage-facade-hydrogommage`) | Deux pages du site se disputent la même requête ; Google en choisit une, souvent pas la bonne |
| SERP locale | Sur « ravalement façade Cognac / Charente », la 1ʳᵉ page est occupée par des **annuaires** (obat.fr, travaux.com, PagesJaunes, 118712, justacote) | Être listé sur ces annuaires = présence immédiate sur ces requêtes, en plus du site |
| Contenu « local » faible | Rien sur la réglementation (déclaration préalable, ABF, SPR), les aides locales, le bâti charentais | C'est exactement ce qui rend une page ville unique et utile |
| Arguments discutables | « Coûts de chauffage élevés », « Peinture façade isolation active » sur la page ravalement | Hors sujet vs la décision « pas d'ITE » (`decisions.md`) et contestable (voix éditoriale prudente) |

## 2. Pages ville « ravalement » — oui, mais pas en série

L'idée est la bonne : c'est le levier n° 1 pour des requêtes « ravalement façade + commune ». Le risque est la
**page satellite (doorway)** : Google pénalise les séries de pages quasi identiques où seul le nom de la ville change
(politique anti-spam, plusieurs vagues de désindexation de pages « ville » d'artisans). Règles :

1. **Peu de pages, vraiment différentes** : 5 à 6 au départ, pas 18. Uniquement pour le ravalement (pas 5 services × N
   villes).
2. **Chaque page doit contenir au moins un élément qu'aucune autre page n'a** :
   - un **chantier réalisé dans la commune** (photos avant/après, rue ou quartier, type de façade, durée) — c'est le
     critère décisif ; sans chantier local, préférer attendre ;
   - la **réglementation locale** (site patrimonial remarquable, avis de l'ABF, nuancier, déclaration préalable) ;
   - les **aides locales** au ravalement (ci-dessous) ;
   - le **bâti typique** (pierre de taille calcaire du centre ancien, moellons + enduit chaux, pavillons crépis des
     années 70…) et ce que ça implique pour le ravalement ;
   - une FAQ locale (2-4 questions propres à la commune) ;
   - distance/délai d'intervention depuis L'Isle-d'Espagnac.
3. **≥ 600 mots propres** par page ; blocs communs (pourquoi nous, tarifs) courts et résumés, avec lien vers la page
   ravalement principale.
4. **Maillage** : page ravalement → bloc « Ravalement par commune » ; `zone-desservie-charente.html` → chaque page ;
   chaque page ville → page ravalement + 2 communes voisines + `contact.html?service=ravalement`.

### Communes proposées (ordre de priorité)

| Commune | Pourquoi | Contenu unique déjà trouvé |
|---|---|---|
| **Cognac** (≈ 18 000 hab.) | 2ᵉ ville du département, SERP dominée par des annuaires | **Aide municipale « Action Cœur de Ville »** : 25 % des travaux HT, plafond 5 000 € (35 % / 7 000 € pour bâti patrimonial majeur), centre-ville, dossiers avant le **28 février** de chaque année, travaux non commencés avant accord, SPR + ABF, « Ville d'art et d'histoire » (règlement du 27/11/2024, ville-cognac.fr) |
| **La Couronne** | Proche, aide active | **Aide façades** : 30 % HT, plafond 3 000 €, cumulable ANAH, ORT, **jusqu'en décembre 2026** (règlement du 13/03/2023, lacouronne.fr) — à mettre à jour si prolongée |
| **Soyaux** | Commune limitrophe, beaucoup de pavillons | bâti pavillonnaire, chantier local à fournir |
| **Ruelle-sur-Touvre / Gond-Pontouvre** | Dans l'ORT + OPAH-RU GrandAngoulême 2022-2026 | dispositifs ORT/OPAH-RU (à vérifier : périmètres et montants actuels) |
| **Champniers / Saint-Yrieix-sur-Charente** | Communes résidentielles proches du siège | chantier local à fournir |
| **Jarnac** | Patrimoine (bords de Charente) | à documenter |

Angoulême reste la page principale existante (à enrichir : SPR / ABF du centre ancien, ORT). L'Isle-d'Espagnac
(siège) est déjà couverte par la fiche Google.

### Mise en œuvre technique (prévue, rien de codé)

Le gabarit des pages de service (`content/pages/<slug>/` + `scripts/build-pages.js`) sait déjà produire une page ; une
page ville = un **gabarit « ville » plus court** (hero local, chantier local, réglementation & aides, bâti, FAQ locale,
résumé tarifs, communes voisines) plutôt qu'une copie complète de la page ravalement. URL :
`ravalement-facade-<commune>.html` (convention `.html` du site). Ajouts : sitemap, Pages CMS (`scripts/cms-config.js`),
JSON-LD `Service` avec `areaServed` = la commune, liens depuis la zone et la page ravalement, test « pas de contenu
dupliqué » (taux de phrases communes entre pages ville).

**Ce qu'il faut demander à Stéphane** : pour chaque commune, 1 chantier (photos avant/après, rue ou quartier, année,
type de façade, ce qui a été fait). Les photos non suivies à la racine du dépôt (`2026*.jpg`, `image0000*.JPEG`) n'ont
pas de géolocalisation : il faut qu'il dise où elles ont été prises.

## 3. Google Business Profile — le levier le plus fort pour le « pack local »

Le pack de 3 résultats avec carte passe avant les sites sur « ravalement façade Angoulême ». Il dépend de la fiche,
pas du site.

- **Avis** : 14 avis, note 4,1 → objectif 40+ avis en 12 mois, **demandés après chaque chantier** (QR code + SMS avec
  le lien `https://g.page/r/CZZJ5Bogt13fEBM/review`), réponse à **tous** les avis, y compris négatifs. Inviter le
  client à citer la prestation et la commune (sans l'imposer). C'est l'action la plus rentable de la liste.
- **Catégories** : principale la plus proche de « ravalement / façadier » proposée par Google, secondaires peintre en
  bâtiment, entreprise de nettoyage de toiture, entreprise d'isolation (à vérifier dans l'interface).
- **Services** : renseigner les 5 services avec description et fourchette de prix (cohérente avec `content/tarifs.json`).
- **Zone desservie** : les communes de `communes.json`.
- **Photos** : 2-4 par mois, chantiers réels, avec la commune dans la légende.
- **Posts** : 2 par mois (chantier terminé, saison démoussage, aides au ravalement) avec lien vers la page concernée
  (et bientôt vers la page ville).
- **Nom de la fiche** : le nom légal exact, sans mots-clés ajoutés (risque de suspension).

## 4. Citations et liens (autorité locale)

- **Annuaires qui occupent la 1ʳᵉ page** : créer/compléter les fiches obat.fr, travaux.com, justacote, 118712 —
  même NAP que le site (nom, 136 Avenue de la République, 05 45 91 22 70).
- **NAP cohérent** : régler le doublon PagesJaunes `61413918` (déjà dans `blockers.md`) ; Bing Places et Apple
  Business Connect (gratuits, reprennent la fiche Google).
- **Liens locaux** : annuaire des entreprises de la mairie de L'Isle-d'Espagnac, CMA Nouvelle-Aquitaine / CAPEB 16
  (si adhérent), fournisseurs de peinture (pages « applicateurs »), Qualibat / RGE si qualifié (confiance + lien),
  sponsoring d'un club local, article dans la presse locale sur un chantier remarquable.
- ✅ *(fait le 2026-11-17)* **JSON-LD** : `hasMap` + `sameAs` (fiche Google par CID, PagesJaunes) ; ajouter les autres
  profils une fois créés (Bing, Apple, annuaires).

## 5. Corrections sur l'existant

1. ✅ *(fait le 2026-11-17)* **Dé-cannibaliser le blog** : orienter les 4 articles « guides » vers l'intention *information*
   (« Ravalement de façade : étapes, durée, réglementation et aides en Charente ») via `seoTitle` /
   `metaDescription`, sans « à Angoulême » dans le title, et un lien visible en haut d'article vers la page de service.
   Le H1 peut rester. Les pages de service gardent seules la requête « service + ville ».
2. ✅ *(fait le 2026-11-17)* **Page ravalement** : retirer « Coûts de chauffage élevés » / « isolation active »,
   ajouter une section **Réglementation & aides** (déclaration préalable, ABF/SPR, aides locales avec lien vers les
   pages ville, MaPrimeRénov' ne finance pas un ravalement seul hors isolation) et une **galerie de chantiers par
   commune** (lien vers les pages ville).
3. **Réalisations** : une carte = un chantier avec commune ; elle alimente les pages ville.

## 6. Contenu (cluster ravalement)

Articles d'information qui répondent aux questions avant devis, chacun liant la page ravalement et une page ville :

- ✅ *(publié le 2026-11-17 : `blog/declaration-prealable-ravalement-facade.html`)* Déclaration préalable pour un ravalement en Charente : quand, comment, délais.
- ✅ *(publié le 2026-11-17 : `blog/aides-ravalement-facade-charente.html`)* Aides au ravalement de façade en Charente (Cognac, La Couronne, ORT GrandAngoulême, ANAH) — à mettre à jour chaque année.
- ✅ *(publié le 2026-11-17 : `blog/couleur-facade-charente.html`)* Couleur de façade en Charente : nuancier, ABF, PLU.
- Enduit à la chaux sur pierre calcaire : pourquoi pas de ciment sur une maison charentaise.
- Fissures de façade : lesquelles sont graves ?
- Ravalement en copropriété : vote en AG, rôle du syndic.
- ✅ *(publié le 2026-11-17 : `blog/ravalement-obligatoire-10-ans.html`)* « Ravalement obligatoire tous les 10 ans ? »

## 7. Mesure

- **Search Console** : exporter Performances (requêtes + pages, 3 mois) → analyse des requêtes en position 5-20, des
  CTR faibles et des cannibalisations réelles ; c'est la prochaine étape d'analyse.
- Suivre chaque page ville : impressions/positions sur « ravalement façade <commune> » à J+30 / J+90.
- GA4 : `generate_lead` en événement clé (A1 de la roadmap) pour savoir quelles pages amènent des devis.

## 8. Ordre conseillé

| # | Action | Qui | Effort |
|---|---|---|---|
| 1 | Process d'avis Google après chantier + réponses aux avis | client | faible, continu |
| 2 | ✅ Dé-cannibaliser les articles de blog (fait le 2026-11-17) | dev | 1 session |
| 3 | ✅ Page ravalement : arguments, section démarches & aides (fait le 2026-11-17) ; reste la galerie par commune | dev | 1 session |
| 4 | ✅ Gabarit « page ville » + pages Cognac et La Couronne (fait le 2026-11-17 ; reste : une photo de chantier par commune) | dev + photos client | 1-2 sessions |
| 5 | GBP : catégories, services, zone, photos, posts | client (ou avec accès) | 1 h puis 30 min/mois |
| 6 | Annuaires (obat, travaux.com, justacote, 118712, Bing, Apple) + doublon PagesJaunes | client | 2-3 h |
| 7 | Pages ville suivantes (Soyaux, Ruelle/Gond-Pontouvre, Champniers, Jarnac) au rythme des chantiers | dev + client | 1 page / chantier |
| 8 | Articles du cluster ravalement (1 par mois) | dev / client | continu |
| 9 | Analyse Search Console → recaler le plan | dev | dès l'export |

## Sources

- Règlement d'aide au ravalement de Cognac (27/11/2024) : https://ville-cognac.fr/app/uploads/2024/12/15-URBA-_-annexe-aide-au-ravalement-reglement.pdf
- Règlement d'intervention façades de La Couronne (2023) : https://www.lacouronne.fr/wp-content/uploads/2023/05/REGLEMENT-FACADES-2023-1.pdf
- Annuaire obat.fr (ravalement Charente) : https://travaux.obat.fr/ravalement-facade/charente
- Pages ville et pages satellites : https://searchengineland.com/location-pages-google-october-spam-update-390016 ,
  https://whitespark.ca/guides/guide-to-the-perfect-service-area-landing-page/
- Travaux en site patrimonial remarquable : https://www.culture.gouv.fr/Sites-thematiques/Monuments-Sites/Interventions-demarches/Realiser-des-travaux-dans-un-site-patrimonial-remarquable
