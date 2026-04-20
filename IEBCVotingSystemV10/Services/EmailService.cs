using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Humanizer;
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

            // Use the injected IConfiguration service
            var senderEmail = _config["EMAIL"]
            ?? throw new InvalidOperationException("The sender Email is invalid or missing");
            var senderPass = _config["EMAIL_PASSWORD"]
            ?? throw new InvalidOperationException("The sender Password is invalid or missing");
            var smtpHost = _config["HOST"]
            ?? throw new InvalidOperationException("The smtp Host is invalid or missing");

            email.From.Add(MailboxAddress.Parse(senderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = body };

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            try
            {
                smtp.Timeout = 10000; // 10 second timeout for SMTP
                await smtp.ConnectAsync(smtpHost, 587, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(senderEmail, senderPass);
                await smtp.SendAsync(email);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL-SERVICE-ERROR]: Failed to send email to {toEmail}. Error: {ex.Message}");
                throw;
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }


        }
    }
}