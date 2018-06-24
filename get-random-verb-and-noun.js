var config = require('./config');
var Wordnok = require('wordnok').createWordnok;
var wordnok = Wordnok({
  apiKey: config.wordnik.apiKey
});
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');
var callNextTick = require('call-next-tick');
var request = require('request');
var iscool = require('iscool')();
var sb = require('standard-bail')();
var probable = require('probable');
var canonicalizer = require('canonicalizer');

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
      requestCanonicalizeVerb,
      pickOutCanonicalizedVerb,
      getNoun
    ],
    getDone
  );
}

function filterVerbs(words, done) {
  callNextTick(done, null, probable.pickFromArray(words.filter(iscool)));
}

function requestCanonicalizeVerb(word, done) {
  // console.log('pre-canonicalization', word);
  var reqOpts = {
    method: 'GET',
    url: `https://api.wordnik.com/v4/word.json/${
      word
    }?useCanonical=true&includeSuggestions=false&api_key=${
      config.wordnik.apiKey
    }`,
    json: true
  };
  request(reqOpts, done);
}

function pickOutCanonicalizedVerb(res, body, done) {
  var verb = body.word;
  // Sometimes, Wordnik won't get it. e.g. 'disempowered' will come back as 'disempowered'.
  // We'll have to deal with it as is by adding words to make the plural subject agree with it.
  if (verb.length > 5 && verb.slice(-2) === 'ed') {
    verb = 'have ' + verb;
  } else if (verb.length > 6 && verb.slice(-3) === 'ing') {
    verb = 'are ' + verb;
  }

  callNextTick(done, null, verb);
}

function getNoun(verb, done) {
  wordnok.getTopic(sb(addNoun, done));

  function addNoun(topic) {
    var pluralNoun = canonicalizer.getSingularAndPluralForms(topic)[1];
    done(null, verb + ' ' + pluralNoun);
  }
}

module.exports = getRandomVerbAndNoun;
