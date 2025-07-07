
document.getElementById("date").valueAsDate = new Date();

function reverseRow(btn) {
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const topInput = row.querySelector(".top");
  const bottomInput = row.querySelector(".bottom");
  const todInput = row.querySelector(".tod");
  const number = numberInput.value;
  if (number.length >= 2) {
    const reversed = number.split("").reverse().join("");
    const rows = document.querySelectorAll("table tr");
    for (let i = 1; i < rows.length; i++) {
      const n = rows[i].querySelector(".number");
      const t = rows[i].querySelector(".top");
      const b = rows[i].querySelector(".bottom");
      const td = rows[i].querySelector(".tod");
      if (n.value === "") {
        n.value = reversed;
        t.value = topInput.value;
        b.value = bottomInput.value;
        td.value = todInput.value;
        break;
      }
    }
  }
}

document.getElementById("lottery-form").onsubmit = function(e){
  e.preventDefault();
  const numbers = document.querySelectorAll(".number");
  const tops = document.querySelectorAll(".top");
  const bottoms = document.querySelectorAll(".bottom");
  const tods = document.querySelectorAll(".tod");
  const summary = {};
  for (let i=0; i<numbers.length; i++) {
    const num = numbers[i].value;
    const top = parseFloat(tops[i].value)||0;
    const bottom = parseFloat(bottoms[i].value)||0;
    const tod = parseFloat(tods[i].value)||0;
    if (num !== "") {
      if (!summary[num]) summary[num] = {top:0,bottom:0,tod:0};
      summary[num].top += top;
      summary[num].bottom += bottom;
      summary[num].tod += tod;
    }
  }

  let html = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";
  for (const [num, amt] of Object.entries(summary)) {
    html += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
  }
  html += "</table>";
  document.getElementById("summary").innerHTML = html;

  localStorage.setItem("lottery_summary", JSON.stringify(summary));
}

function exportExcel(){
  const data = JSON.parse(localStorage.getItem("lottery_summary") || "{}");
  const excelData = Object.keys(data).map(k=>({เลข:k,บน:data[k].top,ล่าง:data[k].bottom,โต๊ด:data[k].tod}));
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "lottery_summary.xlsx");
}
