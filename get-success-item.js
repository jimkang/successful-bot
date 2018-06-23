var request = require('request');
var sb = require('standard-bail')();
var probable = require('probable');
var pick = probable.pickFromArray;
var conceptCache = require('conceptnet-relationship-cache');
var conceptKits = require('./concept-kits');
var callNextTick = require('call-next-tick');

const maxConceptTries = 5;

function getSuccessItem(done) {
  var getItem = getBaseFromConcepts;
  if (probable.roll(3) === 0) {
    //    getItem = getRandomWordVerbAndNoun;
  }
  getItem(sb(decorate, done));

  function decorate(baseStatement) {
    if (!baseStatement) {
      callNextTick(done);
      return;
    }

    var suffix = probable.pickFromArray(['constantly', 'daily', 'always']);
    var decorated = `${baseStatement} ${suffix}`;
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
      var subject = pick(map.emittingConcepts);
      var object = pick(map.receivingConcepts);
      var statement = kit.format({ subject, object, concept: map.concept });
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

module.exports = getSuccessItem;
