using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IEBCVotingSystemV10.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusToRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "AspNetRoles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "AspNetRoles");
        }
    }
}
