const sql = require('mssql');
const dbConfig = {
user: '', // SQL Server kullanıcı adı
  password: '', // SQL Server kullanıcı adı ve şifresi
  server: ' ',// SQL Server adresi
  database: 'ZimmetDB',
  options: { encrypt: false, trustServerCertificate: true }
};

// 📋 Personel listeleme
async function getPersonnel(req, res) {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM Personnel ORDER BY PersonnelID DESC`;
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL Hatası:", err);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

// ➕ Personel ekleme
async function addPersonnel(req, res) {
  const { FullName, Branch, Department } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Personnel (FullName, Branch, Department, CreatedAt)
      VALUES (${FullName}, ${Branch}, ${Department}, GETDATE())
    `;
    res.status(201).send('Personel eklendi');
  } catch (err) {
    console.error("SQL Hatası:", err);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

// ✏️ Personel güncelleme
async function updatePersonnel(req, res) {
  const { id } = req.params;
  const { FullName, Branch, Department } = req.body;
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      UPDATE Personnel
      SET FullName=${FullName}, Branch=${Branch}, Department=${Department}, CreatedAt=GETDATE()
      WHERE PersonnelID=${id}
    `;
    if (result.rowsAffected[0] === 0) {
      res.status(404).send("Personel bulunamadı");
    } else {
      res.send("Personel güncellendi");
    }
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

// 📋 Personel + cihaz atamaları
async function getPersonnelWithDevices(req, res) {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(`
      SELECT 
        p.PersonnelID,
        p.FullName,
        p.Branch,
        p.Department,
        d.DeviceID,
        d.Brand,
        d.Model,
        d.SerialNumber,
        a.AssignmentDate
      FROM Personnel p
      LEFT JOIN Assignments a ON p.PersonnelID = a.PersonnelID
      LEFT JOIN Devices d ON a.DeviceID = d.DeviceID
      ORDER BY p.PersonnelID DESC, a.AssignmentDate DESC
    `);
    // 🔧 Personel bazında grupla
    const grouped = {};
    result.recordset.forEach(row => {
      if (!grouped[row.PersonnelID]) {
        grouped[row.PersonnelID] = {
          PersonnelID: row.PersonnelID,
          FullName: row.FullName,
          Branch: row.Branch,
          Department: row.Department,
          devices: []
        };
      }
      if (row.DeviceID) {
        grouped[row.PersonnelID].devices.push({
          DeviceID: row.DeviceID,
          Brand: row.Brand,
          Model: row.Model,
          SerialNumber: row.SerialNumber,
          AssignmentDate: row.AssignmentDate
        });
      }
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("SQL Hatası:", err);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

module.exports = { getPersonnel, addPersonnel, updatePersonnel, getPersonnelWithDevices };
