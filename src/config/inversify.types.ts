const TYPES = {
  NotificationService: Symbol.for('NotificationService'),
  UserClient: Symbol.for('UserClient'),
  AmqpWorker: Symbol.for('AmqpWorker'),
  EncryptionService: Symbol.for('EncryptionService'),
  BankAccountService: Symbol.for('BankAccountService'),
  TransactionRepo: Symbol.for('TransactionRepository'),
  CardService: Symbol.for('CardService'),
  ExternalWalletRepo: Symbol.for('ExternalWalletRepo'),
  WalletRepo: Symbol.for('WalletRepo'),
  WalletService: Symbol.for('WalletService'),
  TransactionRequestsRepo: Symbol.for('TransactionRequestsRepo'),
};

export default TYPES;
