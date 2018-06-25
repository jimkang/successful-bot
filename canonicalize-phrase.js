var sb = require('standard-bail')();
var request = require('request');
var config = require('./config');
var Wordnok = require('wordnok').createWordnok;
var wordnok = Wordnok({
  apiKey: config.wordnik.apiKey
});
var splitToWords = require('split-to-words');
var callNextTick = require('call-next-tick');

var wordsWeJustKnowAreVerbForms = [
  'serving',
  'making',
  'meeting',
  'going',
  'waiting'
];

// Canonicalizes the verbs at the start of the phrase
// only.
function canonicalizePhrase(phrase, canonicalizeDone) {
  if (!phrase) {
    callNextTick(canonicalizeDone, null, phrase);
    return;
  }
  var words = splitToWords(phrase);
  if (words.length < 1) {
    callNextTick(canonicalizeDone, null, phrase);
    return;
  }

  var word = words[0];
  wordnok.getPartsOfSpeech(
    word.toLowerCase(),
    sb(requestCanonicalizeVerb, canonicalizeDone)
  );

  function requestCanonicalizeVerb(partsOfSpeech) {
    if (
      partsOfSpeech.indexOf('verb') === -1 &&
      // adjective is in here because of things like
      // "eating" and "becoming". In conceptnet, things don't start
      // with adjectives often, so maybe this will
      // be safe?
      partsOfSpeech.indexOf('adjective') === -1 &&
      wordsWeJustKnowAreVerbForms.indexOf(word.toLowerCase()) === -1
    ) {
      // If it doesn't start with a verb, there's
      // nothing to do.
      callNextTick(canonicalizeDone, null, phrase);
      return;
    }

    var reqOpts = {
      method: 'GET',
      url: `https://api.wordnik.com/v4/word.json/${
        word
      }?useCanonical=true&includeSuggestions=false&api_key=${
        config.wordnik.apiKey
      }`,
      json: true
    };
    request(reqOpts, sb(pickOutCanonicalizedVerb, canonicalizeDone));
  }

  function pickOutCanonicalizedVerb(res, body) {
    var verb = body.word;
    // Sometimes, Wordnik won't get it. e.g. 'disempowered' will come back as 'disempowered'.
    // We'll have to deal with it as is by adding words to make the plural subject agree with it.
    if (verb === word.toLowerCase()) {
      if (verb.length > 5 && verb.slice(-2) === 'ed') {
        verb = 'have ' + word;
      } else if (verb.length > 5 && verb.slice(-3) === 'ing') {
        verb = 'are ' + word;
      }
    }
    var rebuiltPhrase = verb;
    if (words.length > 1) {
      rebuiltPhrase += ' ';
      rebuiltPhrase += words.slice(1).join(' ');
    }
    callNextTick(canonicalizeDone, null, rebuiltPhrase);
  }
}

module.exports = canonicalizePhrase;
