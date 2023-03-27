// Disable console.log in contentscript to prevent SES/lockdown logging to external page
// eslint-disable-next-line import/unambiguous
if (
  !(typeof process !== 'undefined' && process.env.METAMASK_DEBUG) &&
  typeof console !== 'undefined'
) {
  console.log = function() {};
  console.info = function() {};
}

function noop() {
  return undefined;
}
