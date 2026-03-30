const express = require('express');
const router  = express.Router();
const { triggerSOS, resolveAlert } = require('../controllers/sosController');

router.post('/trigger', triggerSOS);
router.post('/resolve/:alertId', resolveAlert);
router.patch('/:alertId/resolve', resolveAlert);

module.exports = router;
