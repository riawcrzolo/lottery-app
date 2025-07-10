
const USERS = {user1:"1234", user2:"1234", user3:"1234", user4:"1234", user5:"1234"};
let currentUser = null;

function login(){
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if(USERS[u] === p){
    currentUser = u;
    document.getElementById("login-container").style.display="none";
    document.getElementById("app-container").style.display="block";
    loadHistory();
  }else{
    document.getElementById("login-error").innerText = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
}

function logout(){
  currentUser = null;
  document.getElementById("login-container").style.display="block";
  document.getElementById("app-container").style.display="none";
}

document.getElementById("date").valueAsDate = new Date();

function reverseRow(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const topInput = row.querySelector(".top");
  const bottomInput = row.querySelector(".bottom");
  const todInput = row.querySelector(".tod");
  const number = numberInput.value;
  if(number.length >= 2){
    const reversed = number.split("").reverse().join("");
    const rows = document.querySelectorAll("table tr");
    for(let i=1;i<rows.length;i++){
      const n = rows[i].querySelector(".number");
      const t = rows[i].querySelector(".top");
      const b = rows[i].querySelector(".bottom");
      const td = rows[i].querySelector(".tod");
      if(n.value === ""){
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
  saveBill();
};

function saveBill(){
  const numbers = document.querySelectorAll(".number");
  const tops = document.querySelectorAll(".top");
  const bottoms = document.querySelectorAll(".bottom");
  const tods = document.querySelectorAll(".tod");
  const summary = {};
  for(let i=0;i<numbers.length;i++){
    const num = numbers[i].value;
    const top = parseFloat(tops[i].value)||0;
    const bottom = parseFloat(bottoms[i].value)||0;
    const tod = parseFloat(tods[i].value)||0;
    if(num !== ""){
      if(!summary[num]) summary[num] = {top:0,bottom:0,tod:0};
      summary[num].top += top;
      summary[num].bottom += bottom;
      summary[num].tod += tod;
    }
  }
  localStorage.setItem(currentUser+"_summary", JSON.stringify(summary));
  displaySummary(summary);
}

function displaySummary(summary){
  let html = "<table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>";
  for(const [num,amt] of Object.entries(summary)){
    html += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
  }
  html += "</table>";
  document.getElementById("summary").innerHTML = html;
}

function cutBill(){
  saveBill();
  const history = JSON.parse(localStorage.getItem(currentUser+"_history")||"[]");
  const summary = JSON.parse(localStorage.getItem(currentUser+"_summary")||"{}");
  history.push({date:new Date().toLocaleString(), data:summary});
  localStorage.setItem(currentUser+"_history", JSON.stringify(history));
  loadHistory();
  document.getElementById("lottery-form").reset();
  localStorage.removeItem(currentUser+"_summary");
  document.getElementById("summary").innerHTML = "";
}

function loadHistory(){
  const history = JSON.parse(localStorage.getItem(currentUser+"_history")||"[]");
  let html = "";
  for(const h of history){
    html += `<div><b>${h.date}</b><table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>`;
    for(const [num,amt] of Object.entries(h.data)){
      html += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
    }
    html += "</table></div><hr>";
  }
  document.getElementById("history").innerHTML = html;
}

function exportExcel(){
  const summary = JSON.parse(localStorage.getItem(currentUser+"_summary")||"{}");
  const excelData = Object.keys(summary).map(k=>({เลข:k,บน:summary[k].top,ล่าง:summary[k].bottom,โต๊ด:summary[k].tod}));
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "lottery_summary.xlsx");
}
