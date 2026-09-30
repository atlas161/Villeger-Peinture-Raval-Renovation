'use strict';
/**
 * Blocs HTML communs aux pages de service, stockés dans includes/partials/ :
 *  - contact-service.html : section #contact (le nom du formulaire, le service envoyé et les options du menu
 *    déroulant viennent de la clé "contact" du page.json de chaque page)
 *  - why-artisan.html : section « Pourquoi nous choisir »
 */
const fs = require('fs');
const path = require('path');

const PARTIALS = path.join(__dirname, '..', '..', 'includes', 'partials');

const readPartial = (name) => fs.readFileSync(path.join(PARTIALS, name), 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');

/** contact = { formName, service, placeholder, prestation, options: [[value, label], …] } */
function renderContact(template, contact) {
  const optionLine = template.split('\n').find((l) => l.includes('{{OPTIONS}}'));
  const indent = optionLine.match(/^[ \t]*/)[0];
  const options = contact.options
    .map(([value, label]) => `<div class="apple-select-option" data-value="${value}">${label}</div>`)
    .join('\n' + indent);
  return template
    .replace(/\{\{FORM_NAME\}\}/g, contact.formName)
    .replace('{{SERVICE}}', contact.service)
    .replace('{{PLACEHOLDER}}', contact.placeholder)
    .replace('{{PRESTATION}}', contact.prestation)
    .replace('{{OPTIONS}}', options);
}

module.exports = { readPartial, renderContact };
