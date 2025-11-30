namespace MoneyTransfer.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using MoneyTransfer.DAL.Dapper;
    using MoneyTransfer.Models;
    using MoneyTransfer.Services;
    using Microsoft.Extensions.Logging;

    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly ContactsRepository _contacts;
        private readonly SendMoneyService _service;
        private readonly ILogger<WalletController> _logger;

        public WalletController(ContactsRepository contacts, SendMoneyService service, ILogger<WalletController> logger)
        {
            _contacts = contacts;
            _service = service;
            _logger = logger;
        }

        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts()
        {
            try
            {
                _logger.LogInformation("Retrieving all contacts");
                var result = await _contacts.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contacts");
                return StatusCode(500, new { error = "An error occurred while retrieving contacts" });
            }
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            try
            {
                _logger.LogInformation("Retrieving all balance");
                var result = await _contacts.GetAllBalance();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving balance");
                return StatusCode(500, new { error = "An error occurred while retrieving balance" });
            }
        }

        [HttpGet("transactions_history")]
        public async Task<IActionResult> GetTransactionHistory()
        {
            try
            {
                _logger.LogInformation("Retrieving transaction details");
                var result = await _contacts.GetAllTransactionDetails();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction details");
                return StatusCode(500, new { error = "An error occurred while retrieving transaction details" });
            }
        }

        [HttpPost("send")]
        public IActionResult Send([FromBody] SendMoneyRequest req)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid request model: {Errors}", 
                        string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                    return BadRequest(new { error = "Invalid request", details = ModelState });
                }

                // Additional validation: sender and receiver cannot be the same
                if (req.FromContactId == req.ToContactId)
                {
                    _logger.LogWarning("Attempt to send money to same contact: {ContactId}", req.FromContactId);
                    return BadRequest(new { error = "Sender and receiver cannot be the same" });
                }

                var success = _service.SendMoney(req.FromContactId, req.ToContactId, req.Amount);
                
                if (!success)
                {
                    _logger.LogWarning("Money transfer failed: Insufficient funds for contact {FromId}", req.FromContactId);
                    return BadRequest(new { error = "Insufficient funds" });
                }

                return Ok(new { message = "Money transferred successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing money transfer request");
                return StatusCode(500, new { error = "An error occurred while processing the transfer" });
            }
        }
    }

}
