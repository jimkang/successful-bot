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
var badPhraseEndings = [' who', ' has'];

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

    var prefix = probable.pickFromArray(['always', 'passionately']);

    var suffix = probable.pickFromArray([
      'constantly',
      'every day',
      'religiously'
    ]);
    var decorated = baseStatement;
    if (probable.roll(100) === 0) {
      decorated = `${decorated} ${suffix}`;
    }
    if (probable.roll(20) === 0) {
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

      if (phraseIsUsable(concept)) {
        subject = pick(map.emittingConcepts.filter(phraseIsUsable));
        object = pick(map.receivingConcepts.filter(phraseIsUsable));
        // subject = subject ? subject.toUpperCase() : subject;
        // object = object ? object.toUpperCase() : object;
        // concept = concept ? concept.toUpperCase() : concept;
        // subject = subject ? `[${subject}]` : subject;
        // object = object ? `[${object}]` : object;
        // concept = concept ? `[${concept}]` : concept;
        // Some relationships don't work with useSimplePhrase.
        // Some relationships don't work with useSimplePhrase.
        if (
          useSimplePhrase &&
          [
            'UsedFor',
            'HasPrerequisite',
            'InstanceOf',
            'MotivatedByGoal'
          ].indexOf(relationship) === -1
        ) {
          let relPhrase = pick(kit.relPhrases);
          if (object) {
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

function phraseIsUsable(phrase) {
  return doesNotEndInPreposition(phrase) && doesNotEndBadly(phrase);
}

function doesNotEndInPreposition(phrase) {
  var words = splitToWords(phrase);
  if (words.length > 0) {
    return prepositions.indexOf(words[0].toLowerCase()) === -1;
  }
}

function doesNotEndBadly(phrase) {
  return !badPhraseEndings.some(phraseEndsInEnding);

  function phraseEndsInEnding(ending) {
    return phrase.endsWith(ending);
  }
}

module.exports = getSuccessItem;
