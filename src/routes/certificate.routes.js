const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificate.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getCertificates);
router.post('/', protect, createCertificate);
router.put('/:id', protect, updateCertificate);
router.delete('/:id', protect, deleteCertificate);

module.exports = router;
