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
    }

}
