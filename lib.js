const getMajor = require('semver').major;
const fetchWords = require('datamuse').words;
const giphy = require('giphy-api')('dc6zaTOxFJmzC');
const { get, random, sample, startCase } = require('lodash');
const got = require('got');

const ANGULAR_REPO = 'https://raw.githubusercontent.com/angular/angular';
const ANGULAR_PACKAGE_JSON = '/master/package.json';

function fetchAngularVersion() {
  return got(ANGULAR_REPO + ANGULAR_PACKAGE_JSON, {
    json: true
  }).then(response => get(response, 'body.version'));
}

function fetchNextAngularVersion(fallback = random(1, 999)) {
  return fetchAngularVersion()
    .then(getMajor)
    .then(major => (major ? major + 1 : fallback))
    .catch(() => fallback);
}

function fetchWordsStartingWith(letter) {
  return fetchWords({ sp: letter + '*', max: 1000, md: 'p' });
}

function fetchRandomWordsOfType(type) {
  return fetchWordsStartingWith(sample('abcdefghijklmnopqrstuvwxyz'))
    .then(data => data.filter(({ tags = [] }) => tags.includes(type)))
    .then(data => data.map(item => item.word));
}

function fetchRandomWordOfType(type, fallback) {
  return fetchRandomWordsOfType(type).then(words => sample(words) || fallback);
}

function fetchTopicRelatedGifUrl(topic, fallback = 'No gif found...') {
  return giphy
    .search({ q: topic, limit: 1 })
    .then(results => get(results, 'data[0].url', fallback))
    .catch(() => fallback);
}

function fetchReleaseName() {
  return Promise.all([
    fetchRandomWordOfType('adj', 'angular'),
    fetchRandomWordOfType('n', 'next')
  ]).then(values => values.map(startCase).join(' '));
}

function fetchRelatedData(name, version) {
  return Promise.all([name, version, fetchTopicRelatedGifUrl(name)]);
}

module.exports = function releaseNameGenerator(
  version = fetchNextAngularVersion()
) {
  return fetchReleaseName()
    .then(name => fetchRelatedData(name, version))
    .then(([name, version, gif]) => ({ name, version, gif }))
    .catch(() => {
      throw new Error('Something went wrong, try again...');
    });
};
