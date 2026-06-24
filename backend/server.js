require("dotenv").config();
const app = require("./src/app");
const dns = require("dns"); // for developement only
const connectDB = require("./src/config/db");
const { PORT } = require("./src/config/env");

dns.setServers(["8.8.8.8", "8.8.4.4"]); // for developement only

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
