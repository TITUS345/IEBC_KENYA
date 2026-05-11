using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;

namespace IEBCVotingSystemV10.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string body)
        {
            var senderEmail = _config["EMAIL"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("EMAIL missing");

            var senderPass = _config["EMAIL_PASSWORD"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("EMAIL_PASSWORD missing");

            var smtpHost = _config["HOST"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("SMTP HOST missing");

            var email = new MimeMessage();

            email.From.Add(MailboxAddress.Parse(senderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new BodyBuilder
            {
                HtmlBody = body
            }.ToMessageBody();

            using var smtp = new SmtpClient();

            try
            {
                smtp.Timeout = 60000; // Keep existing timeout

                Console.WriteLine($"[EMAIL-SERVICE]: Connecting to SMTP server: {smtpHost} on port 465...");

                await smtp.ConnectAsync(
                    smtpHost, // Use the configured host directly
                    465,
                    SecureSocketOptions.SslOnConnect
                );

                Console.WriteLine(
                    "[EMAIL-SERVICE]: Connected."
                );

                Console.WriteLine(
                    "[EMAIL-SERVICE]: Authenticating..."
                );

                await smtp.AuthenticateAsync(
                    senderEmail,
                    senderPass
                );

                Console.WriteLine(
                    "[EMAIL-SERVICE]: Authenticated."
                );

                Console.WriteLine(
                    "[EMAIL-SERVICE]: Sending email..."
                );

                await smtp.SendAsync(email);

                Console.WriteLine(
                    "[EMAIL-SERVICE]: Email sent."
                );

                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"[EMAIL-SERVICE-ERROR]: Failed to send email to {toEmail}. Error: {ex.ToString()}"
                );

                throw;
            }
        }
    }
}