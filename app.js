
// เพิ่มเติมจากเวอร์ชันก่อนหน้า
// เพิ่มปุ่ม reset และ renderChart()

function resetAll(){
  if(confirm("คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?")){
    localStorage.removeItem("lottery_cumulative");
    location.reload();
  }
}

function displaySummary(data){
  const now = new Date();
  const timestamp = now.toLocaleString("th-TH");
  let html = `<p>📅 วันที่: ${timestamp}</p>`;
  html += "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";

  const sortedKeys = Object.keys(data).sort((a, b) => {
    const isA2 = a.length === 2, isB2 = b.length === 2;
    if (isA2 && !isB2) return -1;
    if (!isA2 && isB2) return 1;
    return a.localeCompare(b);
  });

  let sum2top = 0, sum2bottom = 0, sum3top = 0, sum3tod = 0;

  for(const num of sortedKeys){
    const amt = data[num];
    html += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
    if(num.length === 2){
      sum2top += amt.top;
      sum2bottom += amt.bottom;
    } else {
      sum3top += amt.top;
      sum3tod += amt.tod;
    }
  }

  html += "</table>";
  html += `<p>✅ ยอดรวมแยก: <br>
  🔹 2 ตัวบน: ${sum2top} บาท |
  🔹 2 ตัวล่าง: ${sum2bottom} บาท<br>
  🔹 3 ตัวตรง: ${sum3top} บาท |
  🔹 3 ตัวโต๊ด: ${sum3tod} บาท</p>`;

  document.getElementById("summary").innerHTML = html;
  renderChart(data);
}

function renderChart(data){
  const container = document.getElementById("chart");
  container.innerHTML = "";

  const sorted = Object.entries(data).sort((a,b)=>a[0].localeCompare(b[0]));
  const labels = sorted.map(x => x[0]);
  const values = sorted.map(x => x[1].top + x[1].bottom + x[1].tod);

  const canvas = document.createElement("canvas");
  canvas.id = "lottoChart";
  container.appendChild(canvas);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'ยอดรวม',
        data: values,
        backgroundColor: '#26a69a'
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { autoSkip: true, maxRotation: 90, minRotation: 45 } },
        y: { beginAtZero: true }
      }
    }
  });
}
