
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

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

            var email = new MimeMessage();

            email.From.Add(MailboxAddress.Parse(senderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));

            email.Subject = subject;

            email.Body = new BodyBuilder
            {
                HtmlBody = body
            }.ToMessageBody();

            // IMPORTANT: protocol logger
            using var smtp = new SmtpClient(
                new ProtocolLogger(Console.OpenStandardOutput())
            );

            try
            {
                smtp.Timeout = 60000;

                // TEMPORARY for TLS diagnostics only
                smtp.ServerCertificateValidationCallback =
                    (s, c, h, e) => true;

                // Helps some environments
                smtp.LocalDomain = "localhost";

                Console.WriteLine("[EMAIL-SERVICE]: Connecting...");

                await smtp.ConnectAsync(
                    "smtp.gmail.com",
                    587,
                    SecureSocketOptions.StartTls
                );

                Console.WriteLine("[EMAIL-SERVICE]: Connected.");

                Console.WriteLine("[EMAIL-SERVICE]: Authenticating...");

                await smtp.AuthenticateAsync(
                    senderEmail,
                    senderPass
                );

                Console.WriteLine("[EMAIL-SERVICE]: Authenticated.");

                Console.WriteLine("[EMAIL-SERVICE]: Sending email...");

                await smtp.SendAsync(email);

                Console.WriteLine("[EMAIL-SERVICE]: Email sent.");
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"[EMAIL-SERVICE-ERROR]: {ex}"
                );

                throw;
            }
            finally
            {
                if (smtp.IsConnected)
                {
                    await smtp.DisconnectAsync(true);
                }
            }
        }
    }
}