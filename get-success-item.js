var sb = require('standard-bail')();
var probable = require('probable');
var pick = probable.pickFromArray;
var conceptCache = require('conceptnet-relationship-cache');
var conceptKits = require('./concept-kits');
var callNextTick = require('call-next-tick');
var splitToWords = require('split-to-words');
var getRandomVerbAndNoun = require('./get-random-verb-and-noun');
var canonicalizePhrase = require('./canonicalize-phrase');
var curry = require('lodash.curry');

const maxConceptTries = 5;
var prepositions = ['to', 'for', 'with', 'against', 'by', 'from', 'when'];

function getSuccessItem({ relationshipTable, method = 'relationship' }, done) {
  var relationship;
  var getItem;
  if (method === 'randomVerbAndNoun') {
    getItem = getRandomVerbAndNoun;
  } else {
    relationship = relationshipTable.roll();
    if (method === 'actorWithRandomConcept') {
      getItem = curry(getBaseFromConcepts)({
        relationship,
        useSimplePhrase: true
      });
    } else {
      getItem = curry(getBaseFromConcepts)({ relationship });
    }
  }
  getItem(sb(decorate, done));

  function decorate(baseStatement) {
    if (!baseStatement) {
      callNextTick(done);
      return;
    }

    var prefix = probable.pickFromArray(['never', 'always', 'passionately']);

    var suffix = probable.pickFromArray([
      'constantly',
      'every day',
      'religiously'
    ]);
    var decorated = baseStatement;
    if (probable.roll(5) === 0) {
      decorated = `${decorated} ${suffix}`;
    }
    if (probable.roll(8) === 0) {
      decorated = `${prefix} ${decorated}`;
    }
    decorated = decorated.charAt(0).toUpperCase() + decorated.slice(1);
    callNextTick(done, null, decorated);
  }
}

function getBaseFromConcepts({ relationship, useSimplePhrase }, done) {
  var conceptTries = 1;
  tryToGetBaseFromConcepts();

  function tryToGetBaseFromConcepts() {
    var kit = conceptKits.kitsByName[relationship];
    conceptCache.getRandomMap({ relationship }, sb(useMap, done));

    function useMap(map) {
      var subject;
      var object;
      var concept = map.concept;
      var statement;

      if (doesNotEndInPreposition(concept)) {
        subject = pick(map.emittingConcepts.filter(doesNotEndInPreposition));
        object = pick(map.receivingConcepts.filter(doesNotEndInPreposition));
        if (useSimplePhrase) {
          if (object) {
            var relPhrase = pick(kit.relPhrases);
            if (relPhrase) {
              statement = `${relPhrase} ${object}`;
            } else {
              statement = object;
            }
          }
          // Otherwise, leave it empty.
        } else {
          statement = kit.format({ subject, object, concept });
        }
      }
      if (!statement) {
        console.log(
          new Error(
            `Could not format message for relationship ${
              relationship
            } and concept ${concept}`
          )
        );

        if (conceptTries < maxConceptTries) {
          conceptTries += 1;
          tryToGetBaseFromConcepts();
          return;
        }
      }

      canonicalizePhrase(statement, done);
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
