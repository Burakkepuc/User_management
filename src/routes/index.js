const fs = require('fs');
const express = require("express")

const router = express.Router()

let routes = fs.readdirSync(__dirname)
for (let route of routes) {
  if (route.includes(".js") && route !== "index.js") {
    const routeName = route.slice(0, -3)
    router.use(`/${routeName}`, require(`./${routeName}`))
  }
}





module.exports = router;