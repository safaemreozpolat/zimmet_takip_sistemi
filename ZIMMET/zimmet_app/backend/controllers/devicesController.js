const sql = require('mssql');
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

// 📋 Listeleme
async function getDevices(req, res) {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT d.*, p.FullName AS AssignedTo
      FROM Devices d
      OUTER APPLY (
        SELECT TOP 1 a.PersonnelID
        FROM Assignments a
        WHERE a.DeviceID = d.DeviceID
        ORDER BY a.AssignmentDate DESC
      ) latestAssignment
      LEFT JOIN Personnel p ON p.PersonnelID = latestAssignment.PersonnelID
      ORDER BY d.DeviceID DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// ➕ Ekleme
async function addDevice(req, res) {
  const { DeviceType, Brand, Model, Disk, Ram, CPU, SerialNumber, Notes } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Devices (DeviceType, Brand, Model, Disk, Ram, CPU, SerialNumber, Notes, NotesCreatedAt)
      VALUES (${DeviceType}, ${Brand}, ${Model}, ${Disk}, ${Ram}, ${CPU}, ${SerialNumber}, ${Notes}, GETDATE())
    `;
    res.status(201).send('Cihaz eklendi');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// ✏️ Güncelleme
// Güncelleme
async function updateDevice(req, res) {
  const { id } = req.params;
  const { DeviceType, Brand, Model, Disk, Ram, CPU, SerialNumber, Notes } = req.body;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      UPDATE Devices
      SET 
        DeviceType = ${DeviceType},
        Brand = ${Brand},
        Model = ${Model},
        Disk = ${Disk},
        Ram = ${Ram},
        CPU = ${CPU},
        SerialNumber = ${SerialNumber},
        Notes = ${Notes},
        NotesCreatedAt = GETDATE()
      WHERE DeviceID = ${id}
    `;
    if (result.rowsAffected[0] === 0) {
      res.status(404).send("Cihaz bulunamadı");
    } else {
      res.send("Cihaz güncellendi");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// ❌ Silme
async function deleteDevice(req, res) {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    await sql.query`DELETE FROM Devices WHERE DeviceID = ${id}`;
    res.send('Cihaz silindi');
  } catch (err) {
    res.status(500).send(err.message);
  }
}


module.exports = { getDevices, addDevice, updateDevice, deleteDevice };
