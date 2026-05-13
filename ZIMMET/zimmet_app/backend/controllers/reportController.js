const sql = require('mssql');
const dbConfig = {
  user: '', // SQL Server kullanıcı adı
  password: '', // SQL Server kullanıcı adı ve şifresi
  server: ' ',// SQL Server adresi
  database: 'ZimmetDB',
  options: { encrypt: false, trustServerCertificate: true }
};

async function getDashboardData(req, res) {
  try {
    await sql.connect(dbConfig);
    const totalDevices = await sql.query`SELECT COUNT(*) AS TotalDevices FROM Devices`;
    const totalPersonnel = await sql.query`SELECT COUNT(*) AS TotalPersonnel FROM Personnel`;
    const assignedDevices = await sql.query`SELECT COUNT(DISTINCT DeviceID) AS AssignedDevices FROM Assignments`;
    const unassignedDevices = await sql.query`
      SELECT COUNT(*) AS UnassignedDevices
      FROM Devices
      WHERE DeviceID NOT IN (SELECT DeviceID FROM Assignments)
    `;
    const deviceTypes = await sql.query`
      SELECT DeviceType, COUNT(*) AS Count FROM Devices GROUP BY DeviceType
    `;

    res.json({
      totalDevices: totalDevices.recordset[0].TotalDevices,
      totalPersonnel: totalPersonnel.recordset[0].TotalPersonnel,
      assignedDevices: assignedDevices.recordset[0].AssignedDevices,
      unassignedDevices: unassignedDevices.recordset[0].UnassignedDevices,
      deviceTypes: deviceTypes.recordset
    });
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

module.exports = { getDashboardData };
