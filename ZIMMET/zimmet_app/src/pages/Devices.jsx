import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Devices() {
  const [devices, setDevices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    DeviceType: "",
    Brand: "",
    Model: "",
    Disk: "",
    Ram: "",
    CPU: "",
    SerialNumber: "",
    Notes: ""
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
    const results = devices.filter(d =>
      [d.DeviceType, d.Brand, d.Model, d.Disk, d.AssignedTo, d.Ram, d.CPU, d.SerialNumber, d.Notes, String(d.DeviceID)]
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
    setFormData({
      DeviceType: "",
      Brand: "",
      Model: "",
      Disk: "",
      Ram: "",
      CPU: "",
      SerialNumber: "",
      Notes: ""
    });
    setFormModalVisible(true);
  };

  const closeFormModal = () => {
    setFormModalVisible(false);
    setEditId(null);
    setFormData({
      DeviceType: "",
      Brand: "",
      Model: "",
      Disk: "",
      Ram: "",
      CPU: "",
      SerialNumber: "",
      Notes: ""
    });
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:3001/zimmet_app/devices");
      setDevices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("http://localhost:3001/zimmet_app/assignments");
      setAssignments(res.data);
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
    fetchDevices();
    fetchAssignments();
    fetchPersonnel();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/zimmet_app/devices/${editId}`, formData);
        alert("Cihaz başarıyla güncellendi!");
      } else {
        await axios.post("http://localhost:3001/zimmet_app/devices", formData);
        alert("Cihaz başarıyla eklendi!");
      }
      setEditId(null);
      setFormData({
        DeviceType: "",
        Brand: "",
        Model: "",
        Disk: "",
        Ram: "",
        CPU: "",
        SerialNumber: "",
        Notes: ""
      });
      fetchDevices();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const handleEdit = (device) => {
    setEditId(device.DeviceID);
    setFormData({
      DeviceType: device.DeviceType,
      Brand: device.Brand,
      Model: device.Model,
      Disk: device.Disk,
      Ram: device.Ram,
      CPU: device.CPU,
      SerialNumber: device.SerialNumber,
      Notes: device.Notes
    });
    setFormModalVisible(true);
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
  function handleZimmetle(deviceId) {
    navigate(`/assignments?deviceId=${deviceId}`);
  }
  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif", color: "#fff" }}>
      {/* Üst Menü Butonları */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
        <button style={navBtnStyle} onClick={() => navigate("/")}>🏠 Ana Sayfa</button>
        <button style={navBtnStyle} onClick={() => navigate("/personnel")}>👤 Personeller</button>
        <button style={navBtnStyle} onClick={() => navigate("/assignments")}>🔗 Zimmet</button>
      </div>

      <h2 style={{ textAlign: "start", marginBottom: "20px", color: "#b197fc" }}>
        ➕ Cihaz Yönetimi
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

      {/* Liste */}
      <h2 style={{ marginTop: "40px", textAlign: "center", color: "#b197fc" }}>📋 Cihaz Listesi</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <thead style={{ backgroundColor: "#4e79a7", color: "white" }}>
          <tr>
            <th>ID</th>
            <th>Tür</th>
            <th>Marka</th>
            <th>Model</th>
            <th>Seri No</th>
            <th>Kullanıcı</th>
            <th>Not</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.DeviceID} style={{ textAlign: "center", backgroundColor: "#ddd", color: "black", borderBottom: "1px solid #000" }}>
              <td style={{ padding: "8px" }}>{d.DeviceID}</td>
              <td>{d.DeviceType}</td>
              <td>{d.Brand}</td>
              <td>{d.Model}</td>
              <td>{d.SerialNumber}</td>
              <td style={{
                color: d.AssignedTo ? "#000" : "#ff4d4d",
                fontWeight: d.AssignedTo ? "normal" : "bold"
              }}>
                {d.AssignedTo || "Atama yapılmadı"}
              </td>

              <td>{d.Notes}</td>
              <td>
                <button onClick={() => handleEdit(d)} style={{
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
              searchResults.map(d => (
                <div key={d.DeviceID} style={{ textAlign: "left", backgroundColor: "#272727", padding: "16px", borderRadius: "12px", marginBottom: "12px" }}>
                  <strong style={{ display: "block", marginBottom: "8px" }}>{d.Brand} {d.Model}</strong><hr></hr>
                  <div > {d.DeviceType}</div> 
                  <div> {d.SerialNumber}</div>
                  <div>{d.Disk}</div>
                  <div> {d.Ram}</div>
                  <div> {d.CPU}</div>
                  <div>{d.Notes}</div>
                  <div> </div><hr></hr>
                  <strong style={{ display: "block", marginBottom: "8px" }}>{d.AssignedTo || "Atama yapılmadı"}</strong>

                </div>
              ))
            ) : (
              <p>Sonuç bulunamadı.</p>
            )}
           
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
          </div>
        </div>
      )}
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
            width: "min(820px, 95%)",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "#1e1e1e",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            color: "#fff"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#b197fc" }}>{editId ? "Cihaz Düzenle" : "Yeni Cihaz Ekle"}</h3>
            <form onSubmit={handleSubmit} style={{ textAlign: "start" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px",
                marginBottom: "20px"
              }}>
                {[
                  { name: "DeviceType", label: "Cihaz Türü" },
                  { name: "Brand", label: "Marka" },
                  { name: "Model", label: "Model" }
                ].map((field) => (
                  <div key={field.name}>
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
                        color: "#fff"
                      }}
                    />
                  </div>
                ))}
              </div>
              {[
                { name: "Disk", label: "Disk Kapasitesi" },
                { name: "Ram", label: "RAM" },
                { name: "CPU", label: "İşlemci" },
                { name: "SerialNumber", label: "Seri Numarası" },
                { name: "Notes", label: "Notlar" }
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
                      width: "96%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #444",
                      backgroundColor: "#2b2b2b",
                      color: "#fff"
                    }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }}>
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
                  {editId ? "Güncelle" : "Kaydet"}
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
                  Kapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devices;
