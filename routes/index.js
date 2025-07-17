const fs = require("fs");
const path = require("path");
const express = require("express");

const router = express.Router();

// Read all files inside the current directory (routes/)
const routes = fs.readdirSync(__dirname);

for (let route of routes) {
  // Load only .js files, skip index.js
  if (route.endsWith(".js") && route !== "index.js") {
    const fullPath = path.join(__dirname, route);
    const loaded = require(fullPath);

    /**
     * Ensure the loaded file is an Express Router
     * - It can either be a function (Router is callable)
     * - Or an object with a .handle method (standard Express router signature)
     */
    if (typeof loaded === "function" || (typeof loaded.handle === "function")) {
      const routePath = "/" + route.replace(".js", "");
      router.use(routePath, loaded);
      console.log("✔ Route loaded:", route);
    } else {
      console.warn("Invalid route file (not an Express Router):", route, loaded);
    }
  }
}

module.exports = router;
