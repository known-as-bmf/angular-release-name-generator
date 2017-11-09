const { sample, random, startCase } = require('lodash');
const datamuse = require('datamuse');
const giphy = require('giphy-api')('dc6zaTOxFJmzC');

function fetchWordsStartingWith(letter) {
  return datamuse.words({ sp: letter + '*', max: 1000, md: 'p' });
}

function fetchRandomWordsOfType(type) {
  return fetchWordsStartingWith(sample('abcdefghijklmnopqrstuvwxyz'))
    .then(data => data.filter(({ tags = [] }) => tags.includes(type)))
    .then(data => data.map(item => item.word));
}

function fetchRandomWordOfType(type, fallback) {
  return fetchRandomWordsOfType(type).then(words => sample(words) || fallback);
}

function fetchRelatedGif(releaseName, fallback = 'No gif found...') {
  return giphy.search({ q: releaseName, limit: 1 })
    .then(results => results.data[0])
    .then(gif => (gif && gif.url) || fallback)
    .catch(() => fallback);
}

function fetchReleaseName() {
  return Promise.all([
    fetchRandomWordOfType('adj', 'angular'),
    fetchRandomWordOfType('n', 'next')
  ]).then(values => values.map(startCase).join(' '));
}

module.exports = function angularReleaseNameGenerator(fromVersion = 1) {
  return fetchReleaseName()
    .then(name => Promise.all([name, fetchRelatedGif(name)]))
    .then(([name, gif]) => ({ version: random(fromVersion, 99), name, gif }))
    .catch(() => { throw new Error('Something went wrong, try again...'); });
};