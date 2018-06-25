var config = require('./config');
var Wordnok = require('wordnok').createWordnok;
var wordnok = Wordnok({
  apiKey: config.wordnik.apiKey
});
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');
var callNextTick = require('call-next-tick');
var iscool = require('iscool')();
var sb = require('standard-bail')();
var probable = require('probable');
var canonicalizer = require('canonicalizer');
var canonicalizePhrase = require('./canonicalize-phrase');
var toTitleCase = require('titlecase');

function getRandomVerbAndNoun(getDone) {
  waterfall(
    [
      curry(wordnok.getRandomWords)({
        customParams: {
          includePartOfSpeech: 'verb',
          useCanonical: true,
          limit: 10
        }
      }),
      filterVerbs,
      canonicalizePhrase,
      getNoun
    ],
    getDone
  );
}

function filterVerbs(words, done) {
  callNextTick(done, null, probable.pickFromArray(words.filter(iscool)));
}

function getNoun(verb, done) {
  wordnok.getTopic(sb(addNoun, done));

  function addNoun(topic) {
    var pluralNoun = canonicalizer.getSingularAndPluralForms(topic)[1];
    done(null, toTitleCase(verb + ' ' + pluralNoun));
  }
}

module.exports = getRandomVerbAndNoun;
