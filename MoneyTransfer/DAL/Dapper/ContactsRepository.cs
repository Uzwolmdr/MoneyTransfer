namespace MoneyTransfer.DAL.Dapper
{
    using Dapper;
    using System.Data;
    using global::Dapper;
    using MoneyTransfer.Models;
    using Microsoft.Extensions.Logging;

    public class ContactsRepository
    {
        private readonly IDbConnection _db;
        private readonly ILogger<ContactsRepository> _logger;

        public ContactsRepository(IDbConnection db, ILogger<ContactsRepository> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<IEnumerable<Contact>> GetAllAsync()
        {
            try
            {
                _logger.LogDebug("Retrieving all contacts from database");
                //Using QueryAsnyc pauses the method asynchronously i.e the thread is released to the main pool. It doesn't block the main thread.
                //When the database finishes the query, the method resumes from the await point  using a different thread.
                /*
                    Thread starts DB query
                    ↓
                    Thread is freed (available for other requests!)
                    ↓
                    DB finishes
                    ↓
                    Method continues from await 
                 */
                var result = await _db.QueryAsync<Contact>("SELECT Id, Name, Phone FROM Contacts");
                _logger.LogDebug("Retrieved {Count} contacts", result.Count());
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contacts from database");
                throw;
            }
        }

        public async Task<IEnumerable<Balance>> GetAllBalance()
        {
            try
            {
                _logger.LogDebug("Retrieving all balances from database");

                string sql = @"
                    SELECT 
                        c.Name,
                        w.Balance AS Amount
                    FROM Contacts c
                    INNER JOIN Wallets w ON c.Id = w.Id
                    ORDER BY c.Name ASC;
        ";

                //Using QueryAsnyc pauses the method asynchronously i.e the thread is released to the main pool. It doesn't block the main thread.
                //When the database finishes the query, the method resumes from the await point  using a different thread.
                /*
                    Thread starts DB query
                    ↓
                    Thread is freed (available for other requests!)
                    ↓
                    DB finishes
                    ↓
                    Method continues from await 
                 */
                var result = await _db.QueryAsync<Balance>(sql);

                _logger.LogDebug("Retrieved {Count} balances", result.Count());
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving balances from database");
                throw;
            }
        }

        public async Task<IEnumerable<TransactionDetails>> GetAllTransactionDetails()
        {
            try
            {
                _logger.LogDebug("Retrieving all transaction details from database");

                string sql = @"
            SELECT 
                c1.Name AS SenderName,
                c2.Name AS ReceiverName,
                t.Amount
            FROM Transactions t
            INNER JOIN Contacts c1 ON c1.Id = t.SenderContactId
            INNER JOIN Contacts c2 ON c2.Id = t.ReceiverContactId
            ORDER BY t.Id DESC;
        ";

                //Using QueryAsnyc pauses the method asynchronously i.e the thread is released to the main pool. It doesn't block the main thread.
                //When the database finishes the query, the method resumes from the await point  using a different thread.
                /*
                    Thread starts DB query
                    ↓
                    Thread is freed (available for other requests!)
                    ↓
                    DB finishes
                    ↓
                    Method continues from await 
                 */
                var result = await _db.QueryAsync<TransactionDetails>(sql);

                _logger.LogDebug("Retrieved {Count} transaction records", result.Count());
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction details from database");
                throw;
            }
        }


    }
}
