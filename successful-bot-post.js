/* global process */

var config = require('./config');
// var config = require('./test-config');

var Twit = require('twit');
var waterfall = require('async-waterfall');
var queue = require('d3-queue').queue;
var randomId = require('idmaker').randomId;
var StaticWebArchiveOnGit = require('static-web-archive-on-git');
var probable = require('probable');
var callNextTick = require('call-next-tick');
var getSuccessItem = require('./get-success-item');
var compact = require('lodash.compact');

var dryRun = process.argv.length > 2 ? process.argv[2] === '--dry' : false;

var staticWebStream = StaticWebArchiveOnGit({
  config: config.github,
  title: 'The Most Successful People I Know',
  footerScript: '',
  maxEntriesPerPage: 20
});

var twit = new Twit(config.twitter);
const maxTries = 5;
var tryCount = 0;

function attemptAPost() {
  waterfall([rollListSize, getListItems, assembleList, postToTargets], wrapUp);
}

attemptAPost();

function rollListSize(done) {
  callNextTick(done, null, 5 + probable.roll(6) + probable.roll(6));
}

function getListItems(numberOfItems, done) {
  var q = queue();
  for (var i = 0; i < numberOfItems; ++i) {
    q.defer(getSuccessItem);
  }
  q.awaitAll(done);
}

function assembleList(successItems, done) {
  var listMessage = `The most successful people I've met:

${compact(successItems).map(numberItem).join('\n')}`;
  callNextTick(done, null, listMessage);
}

function postToTargets(text, done) {
  if (dryRun) {
    console.log('Would have posted:', text);
    callNextTick(done);
  } else {
    var q = queue();
    q.defer(postToArchive, text);
    q.defer(postToTwitter, text);
    q.await(done);
  }
}

function numberItem(item, i) {
  return `${i + 1}. ${item}`;
}

function postToTwitter(text, done) {
  var body = {
    status: text 
  };
  twit.post('statuses/update', body, done);
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

