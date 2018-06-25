var canonicalizePhrase = require('./canonicalize-phrase');
var queue = require('d3-queue').queue;

function canonicalizePhrases(phrases, done) {
  var q = queue();
  phrases.forEach(queueCanonicalization);
  q.awaitAll(done);

  function queueCanonicalization(phrase) {
    q.defer(canonicalizePhrase, phrase);
  }
}

module.exports = canonicalizePhrases;
