import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [formData, setFormData] = useState({
    DeviceID: "",
    PersonnelID: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [editPersonnelID, setEditPersonnelID] = useState("");
  const [deviceSearchInput, setDeviceSearchInput] = useState("");
  const [personnelSearchInput, setPersonnelSearchInput] = useState("");
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [personnelDropdownOpen, setPersonnelDropdownOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState({
    visible: false,
    assignment: null,
    hasPdf: false,
    pdfUrl: null,
    message: ""
  });
  const navigate = useNavigate();

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      setSearchModalVisible(false);
      return;
    }
    const results = assignments.filter(a =>
      [a.Brand, a.Model, a.SerialNumber,a.Ram, a.FullName, String(a.AssignmentID), new Date(a.AssignmentDate).toLocaleDateString("en-GB")]
        .some(value => value?.toString().toLowerCase().includes(query))
    );
    setSearchResults(results);
    setSearchModalVisible(true);
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
  };

  const openFormModal = () => {
    setFormData({ DeviceID: "", PersonnelID: "" });
    setDeviceSearchInput("");
    setPersonnelSearchInput("");
    setDeviceDropdownOpen(false);
    setPersonnelDropdownOpen(false);
    setFormModalVisible(true);
  };

  const closeFormModal = () => {
    setFormModalVisible(false);
    setFormData({ DeviceID: "", PersonnelID: "" });
    setDeviceSearchInput("");
    setPersonnelSearchInput("");
    setDeviceDropdownOpen(false);
    setPersonnelDropdownOpen(false);
  };

  const getFilteredDevices = () => {
    if (!deviceSearchInput.trim()) return [];
    const query = deviceSearchInput.toLowerCase();
    return devices.filter(d =>
      d.SerialNumber.toLowerCase().includes(query) ||
      d.Brand.toLowerCase().includes(query) ||
      d.Model.toLowerCase().includes(query)
    );
  };

  const getFilteredPersonnel = () => {
    if (!personnelSearchInput.trim()) return [];
    const query = personnelSearchInput.toLowerCase();
    return personnel.filter(p =>
      p.FullName.toLowerCase().includes(query)
    );
  };

  const handleSelectDevice = (device) => {
    setFormData({ ...formData, DeviceID: device.DeviceID });
    setDeviceSearchInput(`${device.SerialNumber} - ${device.Brand} ${device.Model}`);
    setDeviceDropdownOpen(false);
  };

  const handleSelectPersonnel = (person) => {
    setFormData({ ...formData, PersonnelID: person.PersonnelID });
    setPersonnelSearchInput(person.FullName);
    setPersonnelDropdownOpen(false);
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("http://localhost:3001/zimmet_app/assignments");
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:3001/zimmet_app/devices");
      setDevices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const res = await axios.get("http://localhost:3001/zimmet_app/personnel");
      setPersonnel(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchDevices();
    fetchPersonnel();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.DeviceID || !formData.PersonnelID) {
      alert("Lütfen cihaz ve personel seçiniz.");
      return;
    }
    try {
      await axios.post("http://localhost:3001/zimmet_app/assignments", formData);
      alert("Cihaz başarıyla personele atandı!");
      setFormData({ DeviceID: "", PersonnelID: "" });
      setFormModalVisible(false);
      fetchAssignments();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const openEditModal = (assignment) => {
    setEditAssignment(assignment);
    setEditPersonnelID("");
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditAssignment(null);
    setEditPersonnelID("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editPersonnelID) {
      alert("Yeni personel seçin.");
      return;
    }
    if (!editAssignment) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/zimmet_app/assignments/${editAssignment.AssignmentID}`);
      await axios.post("http://localhost:3001/zimmet_app/assignments", {
        DeviceID: editAssignment.DeviceID,
        PersonnelID: editPersonnelID
      });
      alert("Atama başarıyla değiştirildi!");
      closeEditModal();
      setSearchModalVisible(false);
      fetchAssignments();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const openPdfModal = async (assignment) => {
    try {
      const res = await axios.get(`http://localhost:3001/zimmet_app/assignments/${assignment.AssignmentID}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPdfModal({
        visible: true,
        assignment,
        hasPdf: true,
        pdfUrl: url,
        message: "Bu atama için PDF mevcut."
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPdfModal({
          visible: true,
          assignment,
          hasPdf: false,
          pdfUrl: null,
          message: "PDF bulunamadı."
        });
      } else {
        alert("Hata: " + err.message);
      }
    }
  };

  const closePdfModal = () => {
    if (pdfModal.pdfUrl) {
      URL.revokeObjectURL(pdfModal.pdfUrl);
    }
    setPdfModal({ visible: false, assignment: null, hasPdf: false, pdfUrl: null, message: "" });
  };

  const uploadPdfFile = (assignmentId, isUpdate = false) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const data = new FormData();
      data.append("pdf", file);
      try {
        await axios.post(`http://localhost:3001/zimmet_app/assignments/${assignmentId}/pdf`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(isUpdate ? "PDF güncellendi!" : "PDF yüklendi!");
        closePdfModal();
      } catch (uploadErr) {
        alert("PDF yükleme hatası: " + uploadErr.message);
      }
    };
    input.click();
  };

  const downloadZimmetForm = async (assignment) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/zimmet_app/assignments/${assignment.AssignmentID}/zimmet-form`,
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Zimmet_Formu_${assignment.AssignmentID}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Zimmet formu indirme hatası: " + err.message);
    }
  };

  const navBtnStyle = {
    backgroundColor: "#b197fc",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginLeft: "10px",
    transition: "0.3s"
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif", color: "#fff" }}>

      {/* Üst Menü Butonları */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
        <button style={navBtnStyle} onClick={() => navigate("/")}>🏠 Ana Sayfa</button>
        <button style={navBtnStyle} onClick={() => navigate("/devices")}>➕ Cihazlar</button>
        <button style={navBtnStyle} onClick={() => navigate("/personnel")}>👤 Personeller</button>
      </div>

      <h2 style={{ textAlign: "start", marginBottom: "20px", color: "#b197fc" }}>
        🔗 Zimmet
      </h2>

      <div style={{ maxWidth: "600px", margin: "20px auto", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Aramak için bir değer girin..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: "#2b2b2b",
            color: "#fff"
          }}
        />
        <button type="button" onClick={handleSearch} style={{
          backgroundColor: "#21a179",
          color: "#fff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer"
        }}>
          Ara
        </button>
        <button type="button" onClick={openFormModal} style={{
          backgroundColor: "#b197fc",
          color: "#fff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer"
        }}>
          Ekle
        </button>
      </div>

      {formModalVisible && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div style={{
            width: "min(560px, 95%)",
            backgroundColor: "#1e1e1e",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            color: "#fff"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#b197fc" }}>
              Yeni Atama Yap
            </h3>
            <form onSubmit={handleSubmit} style={{ textAlign: "start" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Cihaz Seçimi:</label>
                <input
                  type="text"
                  value={deviceSearchInput}
                  onChange={(e) => {
                    setDeviceSearchInput(e.target.value);
                    setDeviceDropdownOpen(true);
                    setFormData({ ...formData, DeviceID: "" });
                  }}
                  onFocus={() => setDeviceDropdownOpen(true)}
                  placeholder="Cihaz ara (Seri No, Marka, Model)..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#2b2b2b",
                    color: "#fff"
                  }}
                />
                {deviceDropdownOpen && (
                  <div style={{
                    marginTop: "5px",
                    backgroundColor: "#2b2b2b",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000
                  }}>
                    {getFilteredDevices().length > 0 ? (
                      getFilteredDevices().map(d => (
                        <div
                          key={d.DeviceID}
                          onClick={() => handleSelectDevice(d)}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: "#333",
                            color: "#fff",
                            borderBottom: "1px solid #444",
                            transition: "0.2s"
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = "#444"}
                          onMouseLeave={(e) => e.target.style.backgroundColor = "#333"}
                        >
                          {d.SerialNumber} - {d.Brand} {d.Model}
                        </div>
                      ))
                    ) : deviceSearchInput.trim() ? (
                      <div style={{ padding: "10px", color: "#aaa" }}>Sonuç bulunamadı</div>
                    ) : (
                      <div style={{ padding: "10px", color: "#aaa" }}>Yazmaya başlayın...</div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Personel Seçimi:</label>
                <input
                  type="text"
                  value={personnelSearchInput}
                  onChange={(e) => {
                    setPersonnelSearchInput(e.target.value);
                    setPersonnelDropdownOpen(true);
                    setFormData({ ...formData, PersonnelID: "" });
                  }}
                  onFocus={() => setPersonnelDropdownOpen(true)}
                  placeholder="Personel ara (Ad)..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#2b2b2b",
                    color: "#fff"
                  }}
                />
                {personnelDropdownOpen && (
                  <div style={{
                    marginTop: "5px",
                    backgroundColor: "#2b2b2b",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000
                  }}>
                    {getFilteredPersonnel().length > 0 ? (
                      getFilteredPersonnel().map(p => (
                        <div
                          key={p.PersonnelID}
                          onClick={() => handleSelectPersonnel(p)}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: "#333",
                            color: "#fff",
                            borderBottom: "1px solid #444",
                            transition: "0.2s"
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = "#444"}
                          onMouseLeave={(e) => e.target.style.backgroundColor = "#333"}
                        >
                          {p.FullName}
                        </div>
                      ))
                    ) : personnelSearchInput.trim() ? (
                      <div style={{ padding: "10px", color: "#aaa" }}>Sonuç bulunamadı</div>
                    ) : (
                      <div style={{ padding: "10px", color: "#aaa" }}>Yazmaya başlayın...</div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="submit" style={{
                  backgroundColor: "#b197fc",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "0.3s"
                }}>
                  Ata
                </button>
                <button type="button" onClick={closeFormModal} style={{
                  backgroundColor: "#6c6c6c",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "0.3s"
                }}>
                  Vazgeç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste */}
      <h2 style={{ marginTop: "40px", textAlign: "center", color: "#b197fc" }}>📋 Atama Listesi</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <thead style={{ backgroundColor: "#4e79a7", color: "white", borderBottom: "1px solid #000" }}>
          <tr>
            <th>ID</th>
            <th>Cihaz</th>
            <th>Seri No</th>
            <th>Personel</th>
            <th>Tarih</th>
            <th>Zimmet</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(a => (
            <tr key={a.AssignmentID} style={{ textAlign: "center", backgroundColor: "#fdfdfd", color: "#000", borderBottom: "1px solid #000" }}>
              <td>{a.AssignmentID}</td>
              <td>{a.Brand} {a.Model}</td>
              <td>{a.SerialNumber}</td>
              <td>{a.FullName}</td>
              <td>{new Date(a.AssignmentDate).toLocaleDateString("en-GB")}</td>
              <td>
                <button style={{
                  backgroundColor: "#ff6900",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  marginRight: "5px"
                }}
                  onClick={() => openPdfModal(a)}>
                  PDF
                </button>
                <button style={{
                  backgroundColor: "#21a179",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "16px",
                  cursor: "pointer"
                }}
                  onClick={() => downloadZimmetForm(a)}>
                  Zimmet Formu
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {searchModalVisible && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div style={{
            width: "min(560px, 95%)",
            backgroundColor: "#1e1e1e",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            color: "#fff",
            maxHeight: "800px",   // 🔑 maksimum yükseklik
            overflowY: "auto"     // 🔑 içerik kaydırılabilir
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#b197fc" }}>Arama Sonuçları</h3>
            {searchResults.length > 0 ? (
              searchResults.map(a => (
                <div key={a.AssignmentID} style={{ backgroundColor: "#272727", textAlign: "left", padding: "16px", borderRadius: "12px", marginBottom: "12px" }}>
                
                 <strong style={{ display: "block", marginBottom: "8px" }}>{a.Brand} {a.Model}</strong>
                  <hr></hr>
                  <div>Personel: <strong style={{ marginBottom: "8px" }}>{a.FullName}</strong></div>
                  <div>Seri No: {a.SerialNumber}</div>
                  <div>Ram: {a.Ram || "-"}</div>
                  <div>Tarih: {new Date(a.AssignmentDate).toLocaleDateString("en-GB")}</div>
                  <div>ID: {a.AssignmentID}</div>
                </div>
              ))
            ) : (
              <p>Sonuç bulunamadı.</p>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
              <button type="button" onClick={closeSearchModal} style={{
                backgroundColor: "#6c6c6c",
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer"
              }}>
                Kapat
              </button>
              <button
                type="button"
                onClick={() => searchResults[0] && openPdfModal(searchResults[0])}
                disabled={searchResults.length === 0}
                style={{
                  backgroundColor: searchResults.length === 0 ? "#4d4d4d" : "#4e79a7",
                  color: "#fff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: searchResults.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {pdfModal.visible && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div style={{
            width: "min(520px, 95%)",
            backgroundColor: "#1e1e1e",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            color: "#fff"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#b197fc" }}>PDF İşlemleri</h3>
            <p style={{ marginBottom: "24px", lineHeight: 1.6 }}>{pdfModal.message}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginBottom: "20px", marginTop: "40px", justifyContent: "center" }}>
              {pdfModal.hasPdf && (
                <button type="button" onClick={() => window.open(pdfModal.pdfUrl)} style={{
                  backgroundColor: "#4e79a7",
                  color: "#fff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}>
                  Görüntüle
                </button>
              )}
              <button type="button" onClick={() => uploadPdfFile(pdfModal.assignment.AssignmentID, false)} style={{
                backgroundColor: "#21a179",
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer"
              }}>
                Yükle
              </button>
              <button type="button" onClick={() => uploadPdfFile(pdfModal.assignment.AssignmentID, true)} style={{
                backgroundColor: "#f0a500",
                color: "#000",
                border: "none",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer"
              }}>
                Güncelle
              </button>
              <button type="button" onClick={closePdfModal} style={{
                backgroundColor: "#6c6c6c",
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer"
              }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assignments;
