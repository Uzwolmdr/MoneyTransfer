using System.ComponentModel.DataAnnotations;

namespace MoneyTransfer.Models
{
    public class SendMoneyRequest
    {
        [Required(ErrorMessage = "FromContactId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "FromContactId must be greater than 0")]
        public int FromContactId { get; set; }

        [Required(ErrorMessage = "ToContactId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "ToContactId must be greater than 0")]
        public int ToContactId { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
    }

}
