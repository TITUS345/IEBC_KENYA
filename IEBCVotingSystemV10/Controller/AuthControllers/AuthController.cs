using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using IEBCVotingSystemV10.Model;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.Roles;
using IEBCVotingSystemV10.Services;
using IEBCVotingSystemV10.Model.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace IEBCVotingSystemV10.Controller.Auth
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IGenerateJwtBearerToken _tokenService;
        private readonly IConfiguration _config;

        private readonly IEmailService _emailService;

        public AuthController(
                            UserManager<ApplicationUser> userManager,
                            SignInManager<ApplicationUser> signInManager,
                            IGenerateJwtBearerToken tokenService,
                            IEmailService emailService,
                            IConfiguration config)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
            this._tokenService = tokenService;
            this._emailService = emailService;
            this._config = config;
        }

        //api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(ApplicationUserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                Console.WriteLine($"Attempting to register user: {userDTO.Email}");
                //check if the user already exist to avoi redundancy
                var existingUser = await _userManager.FindByEmailAsync(userDTO.Email);
                if (existingUser != null)
                    return BadRequest("User that email already exists");


                var idNoExists = await _userManager.Users.AnyAsync(u => u.NationalIdNo == userDTO.NationalIdNo);
                if (idNoExists) return BadRequest("National ID is already registered.");

                var newUser = new ApplicationUser
                {
                    FirstName = userDTO.FirstName,
                    LastName = userDTO.LastName,
                    SurName = userDTO.SurName,
                    UserName = userDTO.Email,
                    Email = userDTO.Email,
                    NationalIdNo = userDTO.NationalIdNo,
                    PhoneNumber = userDTO.PhoneNumber,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(newUser, userDTO.Password);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(newUser, AppRoles.User);

                    //Generate email confirmation token
                    var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
                    //Encode the token for a URL(creates encodedToken variable)
                    var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(emailToken));
                    // URL create
                    var frontendUrl = _config["FRONTEND_BASE_URL"] ?? "http://localhost:3000";
                    var verifyURL = $"{frontendUrl}/auth/verify-email?token={encodedToken}&email={newUser.Email}";
                    string messageBody = $@"
                    <h1>Welcome to IEBC Voting System</h1>
                    <p>Please click the link below to verify your account:</p>
                    <a href='{verifyURL}'>Verify My Email</a>
                    <p>If you didn't register, ignore this email.</p>";

                    bool emailSent = true;
                    try
                    {
                        await _emailService.SendEmailAsync(newUser.Email, "Confirm Your Email - IEBC", messageBody);
                    }
                    catch (Exception ex)
                    {
                        emailSent = false;
                        Console.WriteLine($"[AUTH-REGISTER-EMAIL-WARNING]: Account created for {newUser.Email}, but verification email failed: {ex.Message}");
                    }

                    var roles = new List<string> { AppRoles.User };
                    var token = _tokenService.GenerateJwtToken(newUser, roles);

                    return Ok(new
                    {
                        Result = "Success",
                        Message = emailSent ? "Please verify your email before logging in." : "Account created successfully, but we encountered an error sending the verification email. Please contact support to verify your account.",
                        Token = token,
                        User = newUser.Email
                    });
                }
                return BadRequest(new
                {
                    Result = "Errors",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }
            catch (Exception ex)
            {
                var detailedError = $"Message: {ex.Message} | Inner: {ex.InnerException?.Message} | StackTrace: {ex.StackTrace}";
                Console.WriteLine($"[AUTH-REGISTER-ERROR]: {detailedError}");

                return StatusCode(500, new { error = "Registration failed", message = "An internal server error occurred. Please try again later." });
            }
        }

        //api/auth/signin
        [HttpPost("signin")]



        public async Task<IActionResult> SignIn(SignInDTO signInDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {

                var user = await _userManager.FindByEmailAsync(signInDTO.Email);
                if (user == null) return Unauthorized("Invalid logIn attempt.");
                //Email confirmation logic



                var result = await _signInManager.CheckPasswordSignInAsync(user, signInDTO.Password, lockoutOnFailure: false);

                //  Check for Email Verification
                if (result.IsNotAllowed)
                {
                    return BadRequest("Please verify your email before logging in.");
                }

                // Check for general failure (Wrong password)
                if (!result.Succeeded)
                {
                    return Unauthorized("Invalid login attempt.");
                }

                // If successful, generate the token
                var roles = await _userManager.GetRolesAsync(user);
                var token = _tokenService.GenerateJwtToken(user, roles);

                return Ok(new
                {
                    Result = "Success",
                    Token = token,
                    User = new
                    {
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        Roles = roles
                    }
                });




            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        //api/auth/confirm-email
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token, [FromQuery] string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null) return BadRequest("User not found");

                string decodedToken;
                try
                {
                    var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
                    decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
                }
                catch (Exception)
                {
                    return BadRequest("Invalid token format.");
                }

                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                if (result.Succeeded)
                {
                    Console.WriteLine($"[AUTH-VERIFY-SUCCESS]: {email} verified successfully.");
                    return Ok(new { message = "Email confirmed successfully" });
                }

                Console.WriteLine($"[AUTH-VERIFY-FAILED]: Invalid token for {email}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest("Invalid token");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH-VERIFY-CRITICAL]: Error verifying {email}. Message: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"Inner: {ex.InnerException.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // For security, don't reveal that the user doesn't exist
                return Ok(new { message = "If your email is registered, you will receive a reset link shortly." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var frontendUrl = _config["FRONTEND_BASE_URL"] ?? "http://localhost:3000";
            var resetURL = $"{frontendUrl}/auth/resetPassword?token={encodedToken}&email={user.Email}";

            string messageBody = $@"
                <h2>Reset Your IEBC Password</h2>
                <p>We received a request to reset your password. Click the link below to proceed:</p>
                <div style='margin: 20px 0;'>
                    <a href='{resetURL}' style='padding: 10px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>
                </div>
                <p>If you did not request this, you can safely ignore this email.</p>";

            await _emailService.SendEmailAsync(user.Email, "Reset Your Password - IEBC", messageBody);

            return Ok(new { message = "Reset link sent to your email." });
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest("Invalid request.");

            string decodedToken;
            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            }
            catch { return BadRequest("Invalid token format."); }

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
            if (result.Succeeded) return Ok(new { message = "Password has been reset successfully." });

            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        // POST: api/auth/change-password
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (result.Succeeded) return Ok(new { message = "Password changed successfully." });

            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

    }
}