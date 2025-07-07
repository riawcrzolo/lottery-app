
document.getElementById("date").valueAsDate = new Date();

function reverseRow(btn) {
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const amountInput = row.querySelector(".amount");
  const number = numberInput.value;
  if (number.length >= 2) {
    const reversed = number.split("").reverse().join("");
    // หาช่องว่างแถวถัดไป
    const rows = document.querySelectorAll("table tr");
    for (let i = 1; i < rows.length; i++) {
      const n = rows[i].querySelector(".number");
      const a = rows[i].querySelector(".amount");
      if (n.value === "") {
        n.value = reversed;
        a.value = amountInput.value;
        break;
      }
    }
  }
}

document.getElementById("lottery-form").onsubmit = function(e){
  e.preventDefault();
  const numbers = document.querySelectorAll(".number");
  const amounts = document.querySelectorAll(".amount");
  const summary = {};
  for (let i=0; i<numbers.length; i++) {
    const num = numbers[i].value;
    const amt = parseFloat(amounts[i].value);
    if (num !== "" && !isNaN(amt)) {
      if (!summary[num]) summary[num] = 0;
      summary[num] += amt;
    }
  }

  // แสดง summary
  let html = "<table><tr><th>เลข</th><th>ยอดรวม</th></tr>";
  for (const [num, amt] of Object.entries(summary)) {
    html += `<tr><td>${num}</td><td>${amt}</td></tr>`;
  }
  html += "</table>";
  document.getElementById("summary").innerHTML = html;

  localStorage.setItem("lottery_summary", JSON.stringify(summary));
}

function exportExcel(){
  const data = JSON.parse(localStorage.getItem("lottery_summary") || "{}");
  const ws = XLSX.utils.json_to_sheet(Object.keys(data).map(k=>({เลข:k,ยอดรวม:data[k]})));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "lottery_summary.xlsx");
}
