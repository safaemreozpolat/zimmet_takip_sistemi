const sql = require('mssql');
const dbConfig = {
  user: '', // SQL Server kullanıcı adı
  password: '', // SQL Server kullanıcı adı ve şifresi
  server: ' ',// SQL Server adresi
  database: 'ZimmetDB',
  options: { encrypt: false, trustServerCertificate: true }
};

// Zimmet ekleme
async function addAssignment(req, res) {
  const { DeviceID, PersonnelID } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Assignments (DeviceID, PersonnelID, AssignmentDate)
      VALUES (${DeviceID}, ${PersonnelID}, GETDATE())
    `;
    res.send("Zimmet eklendi");
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

// Zimmet silme
async function deleteAssignment(req, res) {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    await sql.query`
      DELETE FROM Assignments WHERE AssignmentID = ${id}
    `;
    res.send("Zimmet silindi");
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

const path = require('path');
const fs = require('fs');

// PDF yükleme
async function uploadPDF(req, res) {
  const { id } = req.params;
  const file = req.file; // multer ile gelecek

  try {
    // Dosyayı "uploads" klasörüne kaydet
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, `assignment_${id}.pdf`);
    fs.writeFileSync(filePath, file.buffer);

    // Veritabanına yolunu kaydet
    await sql.connect(dbConfig);
    await sql.query`
      UPDATE Assignments
      SET ZimmetFormPath = ${filePath}
      WHERE AssignmentID = ${id}
    `;

    res.send("PDF yüklendi ve kaydedildi");
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

// PDF görüntüleme
async function getPDF(req, res) {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT ZimmetFormPath FROM Assignments WHERE AssignmentID = ${id}
    `;
    if (result.recordset.length === 0 || !result.recordset[0].ZimmetFormPath) {
      return res.status(404).send("PDF bulunamadı");
    }

    const filePath = result.recordset[0].ZimmetFormPath;

    // Dosya gerçekten var mı kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("PDF dosyası sistemde bulunamadı");
    }

    // Mutlak yol gönderimi
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

// Zimmet Formu oluşturma
async function generateZimmetForm(req, res) {
  const { id } = req.params;
  try {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Zimmet Formu');

    worksheet.properties.defaultRowHeight = 20;
    worksheet.columns = [
      { key: 'A', width: 4 },
      { key: 'B', width: 18 },
      { key: 'C', width: 2 },
      { key: 'D', width: 24 },
      { key: 'E', width: 2 },
      { key: 'F', width: 18 },
      { key: 'G', width: 18 }
    ];

    // Veritabanından atama bilgilerini getir
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT 
        A.AssignmentID, 
        A.AssignmentDate,
        D.Brand, 
        D.Model, 
        D.DeviceType,
        D.SerialNumber, 
        D.Ram,
        D.Disk,
        D.CPU,
        P.FullName, 
        P.Branch,
        P.Department
      FROM Assignments A
      JOIN Devices D ON A.DeviceID = D.DeviceID
      JOIN Personnel P ON A.PersonnelID = P.PersonnelID
      WHERE A.AssignmentID = ${id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).send("Atama bulunamadı");
    }

    const data = result.recordset[0];
    const assignmentDate = data.AssignmentDate ? new Date(data.AssignmentDate).toLocaleDateString('tr-TR') : '';

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    const headerFont = { bold: true };
    const borderStyle = { style: 'thin' };

    worksheet.mergeCells('B1:D1');
    worksheet.mergeCells('B2:D2');
    worksheet.mergeCells('B3:D3');
    worksheet.mergeCells('F1:G1');
    worksheet.mergeCells('F2:G2');
    worksheet.mergeCells('F3:G3');
    worksheet.mergeCells('F4:G4');
    worksheet.mergeCells('F5:G5');

    worksheet.getCell('B1').value = 'FİRMA ADI LOGOSU';
    worksheet.getCell('B1').font = { bold: true, size: 18, color: { argb: 'FFDAA520' } };
    worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getCell('B2').value = 'CİHAZ TESLİM (ZİMMET)';
    worksheet.getCell('B2').font = { bold: true, size: 12 };
    worksheet.getCell('B2').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getCell('B3').value = 'FORMU';
    worksheet.getCell('B3').font = { bold: true, size: 12 };
    worksheet.getCell('B3').alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getCell('F1').value = 'Doküman No';
    worksheet.getCell('G1').value = 'Doküman No :  FRM-001';
    worksheet.getCell('F2').value = 'Yayın Tarihi';
    worksheet.getCell('G2').value = 'Yayın Tarihi:  03.05.2024';
    worksheet.getCell('F3').value = 'Revizyon No';
    worksheet.getCell('G3').value = 'Revizyon No:  01';
    worksheet.getCell('F4').value = 'Revizyon Tarihi';
    worksheet.getCell('G4').value = 'Revizyon Tarihi:  -';
    worksheet.getCell('F5').value = 'Sayfa No';
    worksheet.getCell('G5').value = 'Sayfa No:  1 ';

    

    ['F1', 'F2', 'F3', 'F4', 'F5', 'G1', 'G2', 'G3', 'G4', 'G5'].forEach((address) => {
      const cell = worksheet.getCell(address);
      cell.border = {  };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.getCell('B6').value = 'Malzemenin özellikleri:';
    worksheet.getCell('B6').font = { bold: true };

    const formRows = [
      ['Cinsi', data.DeviceType || ''],
      ['Markası', data.Brand || ''],
      ['Modeli', data.Model || ''],
      ['Harddisk', data.Disk || ''],
      ['İşlemci', data.CPU || ''],
      ['Ram', data.Ram || ''],
      ['Seri No', data.SerialNumber || ''],
      ['Adet', 1],
      ['Ek Donanımlar', '  □   Çanta     □   Mouse     □   Şarj Aleti']
    ];

    let currentRow = 9;
    formRows.forEach(([label, value]) => {
      worksheet.getCell('B' + currentRow).value = label;
      worksheet.getCell('C' + currentRow).value = ':';
      worksheet.getCell('D' + currentRow).value = value;
      worksheet.getCell('B' + currentRow).font = { bold: true };
      worksheet.getCell('D' + currentRow).alignment = { vertical: 'middle', horizontal: 'left' };
      ['B', 'C', 'D'].forEach((col) => {
        worksheet.getCell(col + currentRow).border = { };
      });
      currentRow += 1;
    });
    currentRow += 3;
    worksheet.mergeCells('B' + currentRow + ':G' + currentRow);
    worksheet.getCell('B' + currentRow).value = 'NOT: Ürünlerde kullanıcıdan kaynaklı oluşan/oluşabilecek her türlü arıza kullanıcının sorumluluğundadır. Oluşan tamir masrafı kullanıcıdan tahsil edilecektir.';
    worksheet.getCell('B' + currentRow).alignment = { wrapText: true, vertical: 'top' };
    worksheet.getRow(currentRow).height = 30;
    currentRow += 1;
    currentRow += 2;
    worksheet.mergeCells('B' + currentRow + ':G' + currentRow);
    worksheet.getCell('B' + currentRow).value = 'Yukarıda teknik özellikleri ve aksesuarları belirtilen malzemeyi eksiksiz olarak teslim aldım.';
    worksheet.getCell('B' + currentRow).alignment = { wrapText: true, vertical: 'middle' };
    worksheet.getRow(currentRow).height = 25;
    currentRow += 2;

    worksheet.getCell('B' + currentRow).value = 'Teslim Eden';
    worksheet.getCell('E' + currentRow).value = 'Teslim Alan';
    worksheet.getCell('B' + currentRow).font = { bold: true };
    worksheet.getCell('E' + currentRow).font = { bold: true };
    currentRow += 1;

    worksheet.mergeCells('B' + currentRow + ':D' + currentRow);
    worksheet.mergeCells('E' + currentRow + ':G' + currentRow);
    worksheet.getCell('B' + currentRow).value = 'İsim Soyad:';
    worksheet.getCell('E' + currentRow).value = 'İsim Soyad: ' + (data.FullName || '');
    currentRow += 1;

    worksheet.mergeCells('B' + currentRow + ':D' + currentRow);
    worksheet.mergeCells('E' + currentRow + ':G' + currentRow);
    worksheet.getCell('B' + currentRow).value = 'TC:';
    worksheet.getCell('E' + currentRow).value = 'TC:';
    currentRow += 1;

    worksheet.mergeCells('B' + currentRow + ':D' + currentRow);
    worksheet.mergeCells('E' + currentRow + ':G' + currentRow);
    worksheet.getCell('B' + currentRow).value = 'İmza:';
    worksheet.getCell('E' + currentRow).value = 'İmza:';

    ['B22', 'C22', 'D22', 'E22', 'F22', 'G22', 'B23', 'C23', 'D23', 'E23', 'F23', 'G23', 'B24', 'C24', 'D24', 'E24', 'F24', 'G24', 'B25', 'C25', 'D25', 'E25', 'F25', 'G25'].forEach((address) => {
      worksheet.getCell(address).border = {  };
    });

    // Excel dosyasını response olarak gönder
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Zimmet_Formu_${id}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Zimmet Formu Hatası:", err.message);
    res.status(500).send("Zimmet formu oluşturma hatası: " + err.message);
  }
}



// Zimmet listeleme
async function getAssignments(req, res) {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT A.AssignmentID, A.DeviceID, D.Brand, D.Model, D.SerialNumber, D.Ram, P.FullName, A.AssignmentDate
      FROM Assignments A
      JOIN Devices D ON A.DeviceID = D.DeviceID
      JOIN Personnel P ON A.PersonnelID = P.PersonnelID
      ORDER BY A.AssignmentDate DESC, A.AssignmentID DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).send("Sunucu hatası: " + err.message);
  }
}

module.exports = { addAssignment, deleteAssignment, getAssignments, uploadPDF, getPDF, generateZimmetForm };

