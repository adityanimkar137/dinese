const express = require('express');
const router = express.Router();
const { getTables, getTableById, createTable, updateTable, deleteTable } = require('../controllers/tableController');

router.get('/', getTables);
router.post('/', createTable);
router.get('/:id', getTableById);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

module.exports = router;
