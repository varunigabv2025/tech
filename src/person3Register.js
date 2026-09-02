/**
 * Person 3 bootstrap — TReDS packaging, financier desk, AA consent.
 * Isolated from Person 1 route files except this single registration hook.
 */
function registerPerson3(app) {
  require('./db/person3Migrate');
  app.use('/api/financier', require('./routes/financierRoutes'));
  app.use('/api/treds', require('./routes/tredsRoutes'));
  app.use('/api/aa', require('./routes/aaConsentRoutes'));
}

module.exports = registerPerson3;
