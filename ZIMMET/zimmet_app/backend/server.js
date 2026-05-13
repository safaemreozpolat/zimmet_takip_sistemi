const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// SQL Server bağlantı ayarları
const dbConfig = {
  user: '', // SQL Server kullanıcı adı
  password: '', // SQL Server kullanıcı adı ve şifresi
  server: ' ',// SQL Server adresi
  database: 'ZimmetDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

// Basit test endpoint
app.get('/zimmet_app/test', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT TOP 5 * FROM Devices`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Sunucuyu başlat
app.listen(3001, () => console.log('✅ Backend 3001 portunda çalışıyor'));


const devicesRoutes = require('./routes/devices');
app.use('/zimmet_app/devices', devicesRoutes);

const personnelRoutes = require('./routes/personnel');
app.use('/zimmet_app/personnel', personnelRoutes);

const assignmentRoutes = require('./routes/Assignments');
app.use('/zimmet_app/assignments', assignmentRoutes);

const reportRoutes = require('./routes/report');
app.use('/zimmet_app/report', reportRoutes);
