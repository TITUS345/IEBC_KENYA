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
            // Retrieve Mailtrap configuration from IConfiguration
            var smtpHost = _config["MAILTRAP_HOST"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("MAILTRAP_HOST missing");
            var smtpPort = int.Parse(_config["MAILTRAP_PORT"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("MAILTRAP_PORT missing"));
            var mailtrapUsername = _config["MAILTRAP_USERNAME"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("MAILTRAP_USERNAME missing");
            var mailtrapPassword = _config["MAILTRAP_PASSWORD"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("MAILTRAP_PASSWORD missing");

            var email = new MimeMessage();

            email.From.Add(new MailboxAddress("IEBC System", "no-reply@iebc-kenya.org"));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new BodyBuilder { HtmlBody = body }.ToMessageBody();

            using (var smtp = new SmtpClient())
            {
                try
                {
                    smtp.Timeout = 60000; // 60-second timeout

                    Console.WriteLine($"[EMAIL-SERVICE]: Connecting to Mailtrap SMTP server: {smtpHost}:{smtpPort}...");
                    await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                    Console.WriteLine("[EMAIL-SERVICE]: Connected to Mailtrap.");

                    Console.WriteLine("[EMAIL-SERVICE]: Authenticating with Mailtrap...");
                    await smtp.AuthenticateAsync(mailtrapUsername, mailtrapPassword);
                    Console.WriteLine("[EMAIL-SERVICE]: Authenticated with Mailtrap.");

                    Console.WriteLine("[EMAIL-SERVICE]: Sending email via Mailtrap...");
                    await smtp.SendAsync(email);
                    Console.WriteLine("[EMAIL-SERVICE]: Email sent via Mailtrap.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EMAIL-SERVICE-ERROR]: Failed to send email to {toEmail} via Mailtrap. Error: {ex.ToString()}");
                    throw; // Re-throw the exception so AuthController can catch it
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
}