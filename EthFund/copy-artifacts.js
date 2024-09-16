const fs = require("fs-extra");
const path = require("path");

const source = path.join(__dirname, "src", "artifacts", "contracts");
const destination = path.join(__dirname, "client", "src", "artifacts");

try {
  // Ensure the destination directory exists
  fs.ensureDirSync(destination);

  // Check if source directory exists
  if (fs.existsSync(source)) {
    fs.copySync(source, destination, { overwrite: true });
    console.log("Artifacts copied to client/src/artifacts");
  } else {
    console.error(
      "Source artifacts directory does not exist. Have you compiled your contracts?"
    );
  }
} catch (err) {
  console.error("Error copying artifacts:", err);
}
