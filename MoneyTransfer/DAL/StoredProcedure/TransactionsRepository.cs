using Microsoft.Data.SqlClient;
using System.Data;

namespace MoneyTransfer.DAL.StoredProcedure
{
    public class TransactionsRepository
    {
        private readonly IDbConnection _connection;
        private readonly ILogger _logger;
        private readonly string _connectionString;

        public TransactionsRepository(IDbConnection connection, ILogger<TransactionsRepository> logger, IConfiguration config)
        {
            _connectionString = config.GetConnectionString("Default");
            _connection = new SqlConnection(_connectionString);
            _logger = logger;
        }

        public bool CreateTransaction(int senderContactId, int receiverContactId, decimal amount)
        {
            try
            {
                // open connection if needed

                if (_connection.State != ConnectionState.Open)
                {
                    _connection.Open();
                }

                using (var cmd = new SqlCommand("SP_Transactions", (SqlConnection)_connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Input Parameters
                    cmd.Parameters.AddWithValue("@SenderContactId", senderContactId);
                    cmd.Parameters.AddWithValue("@ReceiverContactId", receiverContactId);
                    cmd.Parameters.AddWithValue("@Amount", amount);
                    cmd.Parameters.AddWithValue("@Flag", "CreateTransactions");

                    // Output Parameter
                    SqlParameter responseParam = new SqlParameter("@ResponseCode", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(responseParam);

                    cmd.ExecuteNonQuery();

                    int responseCode = (int)cmd.Parameters["@ResponseCode"].Value;

                    _logger.LogInformation("SP ResponseCode: {0}", responseCode);

                    switch (responseCode)
                    {
                        case 100: return true;
                        case 101: _logger.LogWarning("Error Occurred."); return false;
                        case 102: _logger.LogError("Invalid Request Parameters."); return false;
                        case 103: _logger.LogError("Invalid Sender Contact ID."); return false;
                        case 104: _logger.LogError("Invalid Destination Contact ID."); return false;
                        default:
                            _logger.LogWarning("Unknown response code: {0}", responseCode);
                            return false;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateTransaction failed.");
                return false;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                {
                    _connection.Close();
                }
            }
        }


    }
}
