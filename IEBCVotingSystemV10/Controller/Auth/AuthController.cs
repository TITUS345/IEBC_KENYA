
using IEBCVotingSystemV10.Model;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.Roles;
using IEBCVotingSystemV10.Services;
using Microsoft.AspNetCore.Identity;
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

        private readonly IEmailService _emailService;

        public AuthController(
                            UserManager<ApplicationUser> userManager,
                            SignInManager<ApplicationUser> signInManager,
                            IGenerateJwtBearerToken tokenService,
                            IEmailService emailService)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
            this._tokenService = tokenService;
            this._emailService = emailService;
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
                    SirName = userDTO.SirName,
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
                    var encodedToken = Uri.EscapeDataString(emailToken);
                    // URL create
                    var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_BASE_URL") ?? "http://localhost:3000";
                    var verifyURL = $"{frontendUrl}/auth/verify-email?token={encodedToken}&email={newUser.Email}";
                    string messageBody = $@"
                    <h1>Welcome to IEBC Voting System</h1>
                    <p>Please click the link below to verify your account:</p>
                    <a href='{verifyURL}'>Verify My Email</a>
                    <p>If you didn't register, ignore this email.</p>";

                    await _emailService.SendEmailAsync(newUser.Email, "Confirm Your Email - IEBC", messageBody);

                    var roles = new List<string> { AppRoles.User };
                    var token = _tokenService.GenerateJwtToken(newUser, roles);

                    return Ok(new
                    {
                        Result = "Success",
                        Message = "Please verify your email before logging in.",
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
                Console.WriteLine($"CRITICAL ERROR: {ex.Message}");
                Console.WriteLine($"INNER EXCEPTION: {ex.InnerException?.Message}");
                return StatusCode(500, ex.Message);
            }
        }

        //api/auth/signIn
        [HttpPost("signIn")]


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
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null) return BadRequest("User not found");

                //decode token
                // var decodedToken = System.Text.Encoding.UTF8.GetString(
                //     Microsoft.AspNetCore.WebUtilities.WebEncoders.Base64UrlDecode(token));

                var result = await _userManager.ConfirmEmailAsync(user, token);
                if (result.Succeeded) return Ok("Email confirmed");
                return BadRequest("Invalid token");
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error");
            }
        }


    }
}