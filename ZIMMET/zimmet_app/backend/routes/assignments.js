const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const { addAssignment, deleteAssignment, getAssignments, uploadPDF, getPDF, generateZimmetForm } = require('../controllers/assignmentsController');

router.post('/', addAssignment);
router.get('/', getAssignments);
router.delete('/:id', deleteAssignment);
router.post('/:id/pdf', upload.single('pdf'), uploadPDF);
router.get('/:id/pdf', getPDF);
router.get('/:id/zimmet-form', generateZimmetForm);

module.exports = router;
