using MoneyTransfer.DAL.ADO;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MoneyTransfer.DAL.StoredProcedure;

namespace MoneyTransfer.Services
{
    public class SendMoneyService
    {
        private readonly WalletRepository _walletRepo;
        private readonly TransactionsRepository _transactionRepo;
        private readonly string _connectionString;

        private readonly ILogger<SendMoneyService> _logger;

        public SendMoneyService(WalletRepository walletRepo, TransactionsRepository transactionsRepository, IConfiguration config, ILogger<SendMoneyService> logger)
        {
            _walletRepo = walletRepo;
            _transactionRepo = transactionsRepository;
            _connectionString = config.GetConnectionString("Default") 
                ?? throw new InvalidOperationException("Connection string 'Default' not found.");
            _logger = logger;
        }

        public bool SendMoney(int fromId, int toId, decimal amount)
        {
            // Validate input
            if (fromId <= 0 || toId <= 0)
            {
                _logger.LogWarning("Invalid contact IDs: FromId={FromId}, ToId={ToId}", fromId, toId);
                return false;
            }

            if (fromId == toId)
            {
                _logger.LogWarning("Sender and receiver cannot be the same: ContactId={ContactId}", fromId);
                return false;
            }

            if (amount <= 0)
            {
                _logger.LogWarning("Invalid amount: {Amount}", amount);
                return false;
            }

            // Use transaction to ensure atomicity
            using var connection = new SqlConnection(_connectionString);
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                _logger.LogInformation("Starting money transfer: {Amount} from {FromId} to {ToId}", amount, fromId, toId);

                // Check sender balance within transaction
                decimal senderBalance = _walletRepo.GetBalance(fromId, transaction);
                if (senderBalance < amount)
                {
                    _logger.LogWarning("Insufficient funds: Balance={Balance}, Requested={Amount} for contact {FromId}", 
                        senderBalance, amount, fromId);
                    transaction.Rollback();
                    return false;
                }

                // Update sender balance
                _walletRepo.UpdateBalance(fromId, senderBalance - amount, transaction);

                // Get and update receiver balance
                decimal receiverBalance = _walletRepo.GetBalance(toId, transaction);
                _walletRepo.UpdateBalance(toId, receiverBalance + amount, transaction);

                // Commit transaction
                transaction.Commit();

                // Create transaction record
                _transactionRepo.CreateTransaction(fromId, toId, amount);  //using stored procedure for database operations

                
                _logger.LogInformation("Successfully transferred {Amount} from {FromId} to {ToId}", amount, fromId, toId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during money transfer from {FromId} to {ToId}", fromId, toId);
                transaction.Rollback();
                throw;
            }
        }
    }

}
