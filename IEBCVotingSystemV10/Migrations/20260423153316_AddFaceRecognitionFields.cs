using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IEBCVotingSystemV10.Migrations
{
    /// <inheritdoc />
    public partial class AddFaceRecognitionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ProfilePicture",
                table: "Voters",
                newName: "FaceBiometricImage");

            migrationBuilder.RenameColumn(
                name: "ProfilePicture",
                table: "Candidates",
                newName: "FaceBiometricImage");

            migrationBuilder.AddColumn<string>(
                name: "FaceEmbeddings",
                table: "Voters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaceEmbeddings",
                table: "Candidates",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FaceEmbeddings",
                table: "Voters");

            migrationBuilder.DropColumn(
                name: "FaceEmbeddings",
                table: "Candidates");

            migrationBuilder.RenameColumn(
                name: "FaceBiometricImage",
                table: "Voters",
                newName: "ProfilePicture");

            migrationBuilder.RenameColumn(
                name: "FaceBiometricImage",
                table: "Candidates",
                newName: "ProfilePicture");
        }
    }
}
