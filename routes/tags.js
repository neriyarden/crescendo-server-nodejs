var express = require('express');
var router = express.Router();
const api = require('../DAL/tagsApi');


// get all tags
router.get('/', async function(req, res) {
  res.status(200).send(await api.getAllTags());
});


module.exports = router;

