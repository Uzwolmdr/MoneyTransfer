namespace MoneyTransfer.Models
{
    public class TransactionDetails
    {
        public string? SenderName { get; set; }
        public string? ReceiverName { get; set; }
        public decimal Amount { get; set; }
    }
}
