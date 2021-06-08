function isGiven (value) {
  const type = typeof value;

  if (type === 'undefined' || value === null) {
    return false;
  }

  return true;
}

function isNotString (value) {
  const type = typeof value;

  if (type === 'string' && value !== '') {
    return false;
  }

  return true;
}

module.exports = { isGiven, isNotString };