'use strict';

const bump = require('./ops/bump');
const range = require('./ops/range');
const log = require('./ops/log');
const changelog = require('./ops/changelog');
const tag = require('./ops/tag');

module.exports = {
  bump,
  range,
  log,
  changelog,
  tag
};