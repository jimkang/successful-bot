var sb = require('standard-bail')();
var probable = require('probable');
var pick = probable.pickFromArray;
var conceptCache = require('conceptnet-relationship-cache');
var conceptKits = require('./concept-kits');
var callNextTick = require('call-next-tick');
var splitToWords = require('split-to-words');
var getRandomVerbAndNoun = require('./get-random-verb-and-noun');

const maxConceptTries = 5;
var prepositions = ['to', 'for', 'with', 'against', 'by', 'from', 'when'];

function getSuccessItem(done) {
  var getItem = getBaseFromConcepts;
  if (probable.roll(5) === 0) {
    getItem = getRandomVerbAndNoun;
  }
  getItem(sb(decorate, done));

  function decorate(baseStatement) {
    if (!baseStatement) {
      callNextTick(done);
      return;
    }

    var suffix = probable.pickFromArray([
      'constantly',
      'every day',
      'always',
      'religiously'
    ]);
    var decorated = baseStatement;
    if (probable.roll(3) === 0) {
      decorated = `${decorated} ${suffix}`;
    }
    decorated = decorated.charAt(0).toUpperCase() + decorated.slice(1);
    callNextTick(done, null, decorated);
  }
}

function getBaseFromConcepts(done) {
  var conceptTries = 1;
  tryToGetBaseFromConcepts();

  function tryToGetBaseFromConcepts() {
    var relationship = conceptKits.pickRandomRelationship();
    var kit = conceptKits.kitsByName[relationship];
    conceptCache.getRandomMap({ relationship }, sb(useMap, done));

    function useMap(map) {
      var statement;
      var subject;
      var object;
      var concept = map.concept;

      if (doesNotEndInPreposition(concept)) {
        subject = pick(map.emittingConcepts.filter(doesNotEndInPreposition));
        object = pick(map.receivingConcepts.filter(doesNotEndInPreposition));
        statement = kit.format({ subject, object, concept: map.concept });
      }
      if (!statement) {
        console.log(
          new Error(
            `Could not format message for relationship ${
              relationship
            } and concept ${map.concept}`
          )
        );
        console.log('map', map);

        if (conceptTries < maxConceptTries) {
          conceptTries += 1;
          tryToGetBaseFromConcepts();
          return;
        }
      }
      done(null, statement);
    }
  }
}

function doesNotEndInPreposition(phrase) {
  var words = splitToWords(phrase);
  if (words.length > 0) {
    return prepositions.indexOf(words[0].toLowerCase()) === -1;
  }
}

module.exports = getSuccessItem;
