const LIB_TYPES = {
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  HTTPAgent: Symbol.for('HTTPAgent'),
  Cache: Symbol.for('Cache'),
  Env: Symbol.for('Env'),
};

export default LIB_TYPES;
