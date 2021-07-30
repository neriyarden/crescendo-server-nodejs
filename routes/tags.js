var express = require('express');
var router = express.Router();
const api = require('../DAL/tagsApi');
const validations = require('../validations/validations')


// get all tags
router.get('/', async function(req, res) {
  res.send(await api.getAllTags());
});


module.exports = router;

