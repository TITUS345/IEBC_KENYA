using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Humanizer;
using MailKit.Security;
using MailKit.Net.Smtp;
using MimeKit;

namespace IEBCVotingSystemV10.Services
{

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            this._config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();

            var senderEmail = _config["EMAIL"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("EMAIL missing");

            var senderPass = _config["EMAIL_PASSWORD"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("EMAIL_PASSWORD missing");

            var smtpHost = _config["HOST"]?.Trim('"').Trim()
                ?? throw new InvalidOperationException("HOST missing");

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
                // IMPORTANT
                smtp.Timeout = 60000;

                // Optional but helps diagnose
                smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;

                Console.WriteLine("[EMAIL-SERVICE]: Connecting to SMTP...");

                await smtp.ConnectAsync(
                    smtpHost,
                    587,
                    SecureSocketOptions.StartTls
                );

                Console.WriteLine("[EMAIL-SERVICE]: Connected.");

                Console.WriteLine("[EMAIL-SERVICE]: Authenticating...");

                await smtp.AuthenticateAsync(senderEmail, senderPass);

                Console.WriteLine("[EMAIL-SERVICE]: Authenticated.");

                await smtp.SendAsync(email);

                Console.WriteLine("[EMAIL-SERVICE]: Email sent.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL-SERVICE-ERROR]: {ex}");
                throw;
            }
            finally
            {
                if (smtp.IsConnected)
                    await smtp.DisconnectAsync(true);
            }
        }
    }
}