const fs = require('fs');
const express = require("express");
const { verifyToken } = require('../middlewares/token');

const router = express.Router()

let routes = fs.readdirSync(__dirname)
for (let route of routes) {
  if (route.includes(".js") && route !== "index.js") {
    const routeName = route.slice(0, -3)
    console.log(routeName);
    if (routeName === "auth")
      router.use(`/${routeName}`, require(`./${routeName}`))
    else
      router.use(`/${routeName}`, verifyToken, require(`./${routeName}`))

  }
}





module.exports = router;