// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Identity;

// namespace IEBCVotingSystemV10.DataSeeder
// {
//     public static class DataSeeder
//     {
//         public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
//         {
//             var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

//             string[] roleNames = { "Admin", "Voter", "Candidate", "Agent" };

//             foreach (var roleName in roleNames)
//             {
//                 var roleExist = await roleManager.RoleExistsAsync(roleName);
//                 if (!roleExist)
//                 {
//                     // This creates the actual row in the AspNetRoles table
//                     await roleManager.CreateAsync(new IdentityRole(roleName));
//                 }
//             }
//         }
//     }
// }