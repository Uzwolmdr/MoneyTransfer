namespace MoneyTransfer.DAL.ADO
{
    using Microsoft.Data.SqlClient;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;

    public class WalletRepository
    {
        private readonly string _conn;
        private readonly ILogger<WalletRepository> _logger;

        public WalletRepository(IConfiguration config, ILogger<WalletRepository> logger)
        {
            _conn = config.GetConnectionString("Default");
            _logger = logger;
        }

        public decimal GetBalance(int contactId, SqlTransaction transaction)
        {
            try
            {
                using var cmd = new SqlCommand("SELECT ISNULL(Balance, 0) FROM Wallets WHERE ContactId = @id", transaction.Connection, transaction);
                cmd.Parameters.AddWithValue("@id", contactId);

                var result = cmd.ExecuteScalar();
                var balance = Convert.ToDecimal(result ?? 0);
                
                _logger.LogDebug("Retrieved balance {Balance} for contact {ContactId} (transaction)", balance, contactId);
                return balance;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving balance for contact {ContactId} in transaction", contactId);
                throw;
            }
        }

        public void UpdateBalance(int contactId, decimal newBalance, SqlTransaction transaction)
        {
            try
            {
                using var cmd = new SqlCommand(
                    "UPDATE Wallets SET Balance=@b WHERE ContactId=@id",
                    transaction.Connection,
                    transaction
                );
                cmd.Parameters.AddWithValue("@b", newBalance);
                cmd.Parameters.AddWithValue("@id", contactId);

                var rowsAffected = cmd.ExecuteNonQuery();
                if (rowsAffected == 0)
                {
                    _logger.LogWarning("No wallet found for contact {ContactId} in transaction", contactId);
                    throw new InvalidOperationException($"Wallet not found for contact {contactId}");
                }

                _logger.LogDebug("Updated balance to {Balance} for contact {ContactId} (transaction)", newBalance, contactId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating balance for contact {ContactId} in transaction", contactId);
                throw;
            }
        }
    }

}
