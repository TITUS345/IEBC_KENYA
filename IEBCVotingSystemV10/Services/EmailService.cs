using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;
using System.Net.Sockets;

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

            using var smtp = new SmtpClient();

            try
            {
                smtp.Timeout = 60000;

                Console.WriteLine("[EMAIL-SERVICE]: Resolving IPv4...");

                var ipv4 = Dns.GetHostAddresses("smtp.gmail.com")
                    .First(ip =>
                        ip.AddressFamily ==
                        AddressFamily.InterNetwork);

                Console.WriteLine(
                    $"[EMAIL-SERVICE]: Using IPv4 {ipv4}"
                );

                Console.WriteLine(
                    "[EMAIL-SERVICE]: Connecting..."
                );

                await smtp.ConnectAsync(
                    ipv4.ToString(),
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
                    $"[EMAIL-SERVICE-ERROR]: {ex}"
                );

                throw;
            }
        }
    }
}