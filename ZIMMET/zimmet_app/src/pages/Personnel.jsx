import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Personnel() {
  const [personnel, setPersonnel] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    FullName: "",
    Branch: "",
    Department: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      setSearchModalVisible(false);
      return;
    }
    const results = personnel.filter(p =>
      [p.FullName, p.Branch, p.Department, String(p.PersonnelID)]
        .some(value => value?.toString().toLowerCase().includes(query))
    );
    setSearchResults(results);
    setSearchModalVisible(true);
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
  };

  const openFormModal = () => {
    setEditId(null);
    setFormData({ FullName: "", Branch: "", Department: "" });
    setFormModalVisible(true);
  };

  const closeFormModal = () => {
    setFormModalVisible(false);
    setEditId(null);
    setFormData({ FullName: "", Branch: "", Department: "" });
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
    fetchPersonnel();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/zimmet_app/personnel/${editId}`, formData);
        alert("Personel bilgileri başarıyla güncellendi!");
      } else {
        await axios.post("http://localhost:3001/zimmet_app/personnel", formData);
        alert("Personel başarıyla eklendi!");
      }
      setEditId(null);
      setFormData({ FullName: "", Branch: "", Department: "" });
      setFormModalVisible(false);
      fetchPersonnel();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const handlePersonnelEdit = (personnelMember) => {
    setEditId(personnelMember.PersonnelID);
    setFormData({
      FullName: personnelMember.FullName,
      Branch: personnelMember.Branch,
      Department: personnelMember.Department
    });
    setFormModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ FullName: "", Branch: "", Department: "" });
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
        <button style={navBtnStyle} onClick={() => navigate("/assignments")}>🔗 Zimmet</button>
      </div>

      <h2 style={{ textAlign: "start", marginBottom: "20px", color: "#b197fc" }}>
        👤 Personel Yönetimi
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
              {editId ? "Personel Bilgilerini Düzenle" : "Yeni Personel Ekle"}
            </h3>
            <form onSubmit={handleSubmit} style={{ textAlign: "start" }}>
              {[
                { name: "FullName", label: "Ad Soyad" },
                { name: "Branch", label: "Şube" },
                { name: "Department", label: "Bölüm" }
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                    {field.label}:
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #444",
                      backgroundColor: "#2b2b2b",
                      color: "#fff",
                      outline: "none",
                      transition: "0.3s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#b197fc"}
                    onBlur={(e) => e.target.style.borderColor = "#444"}
                  />
                </div>
              ))}

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
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
                  {editId ? "Güncelle" : "Personeli Ekle"}
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
      <h2 style={{ marginTop: "40px", textAlign: "center", color: "#b197fc" }}>📋 Personel Listesi</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <thead style={{ backgroundColor: "#4e79a7", color: "white", borderBottom: "1px solid #000" }}>
          <tr>
            <th>ID</th>
            <th>Ad Soyad</th>
            <th>Şube</th>
            <th>Bölüm</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {personnel.map((p) => (
            <tr key={p.PersonnelID} style={{ textAlign: "center", backgroundColor: "#fdfdfd", color: "#000", borderBottom: "1px solid #000" }}>
              <td>{p.PersonnelID}</td>
              <td>{p.FullName}</td>
              <td>{p.Branch}</td>
              <td>{p.Department}</td>
              <td>
                <button onClick={() => handlePersonnelEdit(p)} style={{
                  backgroundColor: "#ff6900",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "16px",
                  cursor: "pointer"
                }}>Düzenle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {searchModalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)", // arka plan karartma
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999
          }}
        >
          <div
            style={{
              width: "min(560px, 95%)",
              backgroundColor: "#1e1e1e",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              color: "#fff",
              maxHeight: "800px",   // 🔑 maksimum yükseklik
              overflowY: "auto"     // 🔑 içerik kaydırılabilir
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#b197fc" }}>
              Arama Sonuçları
            </h3>

            {searchResults.length > 0 ? (
              searchResults.map((p) => (
                <div
                  key={p.PersonnelID}
                  style={{
                    textAlign: "left",
                    backgroundColor: "#272727",
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "12px"
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "8px" }}>
                    {p.FullName}
                  </strong>
                  <div>Şube: {p.Branch}</div>
                  <div>Bölüm: {p.Department}</div>
                </div>
              ))
            ) : (
              <p>Sonuç bulunamadı.</p>
            )}

            <button
              type="button"
              onClick={closeSearchModal}
              style={{
                backgroundColor: "#6c6c6c",
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Personnel;
