using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IEBCVotingSystemV10.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreFieldsOnEllectionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Elections",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Elections");
        }
    }
}
