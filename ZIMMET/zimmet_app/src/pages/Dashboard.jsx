import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3001/zimmet_app/report")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p style={{ textAlign: "center", marginTop: "50px" }}>Yükleniyor...</p>;

  const chartData = {
    labels: data.deviceTypes.map(d => d.DeviceType),
    datasets: [
      {
        data: data.deviceTypes.map(d => d.Count),
        backgroundColor: ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"],
      },
    ],
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>📊 Zimmet Sistemi Raporları</h2>

      {/* Özet Kartlar */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "40px"
      }}>
        {[
          { title: "Toplam Cihaz", value: data.totalDevices, color: "#4e79a7" },
          { title: "Toplam Personel", value: data.totalPersonnel, color: "#f28e2b" },
          { title: "Atanan Cihaz", value: data.assignedDevices, color: "#59a14f" },
          { title: "Atanmayan Cihaz", value: data.unassignedDevices, color: "#e15759" },
        ].map((item, i) => (
          <div key={i} style={{
            backgroundColor: item.color,
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "200px",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}>
            <h3>{item.title}</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Pasta Grafik */}
      <div style={{ width: "400px", margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Cihaz Türlerine Göre Dağılım</h3>
        <Pie data={chartData} />
      </div>

      {/* Butonlar */}
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <button onClick={() => navigate("/devices")} style={btnStyle}>➕ Cihazlar</button>
        <button onClick={() => navigate("/personnel")} style={btnStyle}>👤 Personeller</button>
        <button onClick={() => navigate("/assignments")} style={btnStyle}>🔗 Zimmet</button>
      </div>
    </div>
  );
}

const btnStyle = {
  backgroundColor: "#ff6b01",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  margin: "0 10px",
  cursor: "pointer",
  fontSize: "16px",
};

export default Dashboard;
