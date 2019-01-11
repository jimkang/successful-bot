/* global process */

var config = require('./config');
// var config = require('./test-config');

var waterfall = require('async-waterfall');
var queue = require('d3-queue').queue;
var randomId = require('idmaker').randomId;
var StaticWebArchiveOnGit = require('static-web-archive-on-git');
var probable = require('probable');
var callNextTick = require('call-next-tick');
var getSuccessItem = require('./get-success-item');
var compact = require('lodash.compact');
var conceptKits = require('./concept-kits');
var Wordnok = require('wordnok').createWordnok;
var wordnok = Wordnok({
  apiKey: config.wordnik.apiKey
});
var sb = require('standard-bail')();
var canonicalizer = require('canonicalizer');
var minimist = require('minimist');

var { dry, rel } = minimist(process.argv.slice(2));

var staticWebStream = StaticWebArchiveOnGit({
  config: config.github,
  title:
    '<a href="http://jimkang.com/mostsuccessfulbot/">The Most Successful Bot I\'ve Met</a>',
  maxEntriesPerPage: 20
});

const maxTries = 5;
var tryCount = 0;

function attemptAPost() {
  waterfall(
    [rollListSize, getActor, getListItems, assembleList, postToTargets],
    wrapUp
  );
}

attemptAPost();

function rollListSize(done) {
  callNextTick(done, null, 3 + probable.roll(2) + probable.roll(3));
}

function getActor(numberOfItems, done) {
  if (probable.roll(100) === 0) {
    wordnok.getTopic(sb(passActor, done));
  } else {
    callNextTick(done, null, { actor: 'people', numberOfItems });
  }

  function passActor(topic) {
    var actor = canonicalizer.getSingularAndPluralForms(topic)[1];
    done(null, { actor, numberOfItems });
  }
}

function getListItems({ actor, numberOfItems }, done) {
  var successItemOpts = {
    method: 'relationship'
  };
  if (probable.roll(100) === 0) {
    successItemOpts.method = 'randomVerbAndNoun';
  } else {
    if (actor !== 'people' || probable.roll(5) === 0) {
      successItemOpts.method = 'actorWithRandomConcept';
    }
    successItemOpts.relationshipTable = probable.createTableFromSizes([
      [7, conceptKits.pickRandomRelationship()],
      [2, conceptKits.pickRandomRelationship()],
      [1, conceptKits.pickRandomRelationship()]
    ]);
    if (rel) {
      successItemOpts.relationshipTable = probable.createTableFromSizes([
        [1, rel]
      ]);
    }
  }
  var q = queue();
  for (var i = 0; i < numberOfItems; ++i) {
    q.defer(getSuccessItem, successItemOpts);
  }
  q.awaitAll(sb(passResults, done));

  function passResults(successItems) {
    done(null, { actor, successItems });
  }
}

function assembleList({ actor, successItems }, done) {
  var listMessage = `The most successful ${actor} I've met:

${compact(successItems)
    .map(numberItem)
    .join('\n')}`;
  callNextTick(done, null, listMessage);
}

function postToTargets(text, done) {
  if (dry) {
    console.log('Would have posted:', text);
    callNextTick(done);
  } else {
    var q = queue();
    q.defer(postToArchive, text);
    //q.defer(postToTwitter, text);
    q.await(done);
  }
}

function numberItem(item, i) {
  return `${i + 1}. ${item}`;
}

function postToArchive(text, done) {
  staticWebStream.write({
    id: `successlist-${randomId(8)}`,
    date: new Date().toISOString(),
    caption: text.replace(/\n/g, '<br>\n')
  });
  staticWebStream.end(done);
}

function wrapUp(error, data) {
  tryCount += 1;

  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }

    if (tryCount < maxTries) {
      console.log(`Have tried ${tryCount} times. Retrying!`);
      callNextTick(attemptAPost);
    }
  } else {
    console.log('Completed successfully.');
  }
}
