'use strict';
/**
 * Blocs HTML communs aux pages de service, stockés dans includes/partials/ :
 *  - contact-cta.html : bande #contact qui renvoie vers contact.html?service=… (clé "contact" du page.json)
 *  - why-artisan.html : section « Pourquoi nous choisir »
 */
const fs = require('fs');
const path = require('path');

const PARTIALS = path.join(__dirname, '..', '..', 'includes', 'partials');

const readPartial = (name) => fs.readFileSync(path.join(PARTIALS, name), 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');

/** contact = { prestation, serviceLabel } : bande d'appel vers contact.html (le formulaire vit sur cette page). */
function renderContact(template, contact) {
  return template
    .replace('{{SERVICE_LABEL}}', contact.serviceLabel)
    .replace(/\{\{PRESTATION\}\}/g, contact.prestation);
}

module.exports = { readPartial, renderContact };
