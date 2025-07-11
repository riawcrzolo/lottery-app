
const users = [
  {username: "user1", password: "pass1"},
  {username: "user2", password: "pass2"},
  {username: "user3", password: "pass3"},
  {username: "user4", password: "pass4"},
  {username: "user5", password: "pass5"}
];

window.onload = function(){
  if(localStorage.getItem("current_user")){
    document.getElementById("login-page").style.display = "none";
    document.getElementById("app-page").style.display = "block";
    document.getElementById("current-user").innerText = localStorage.getItem("current_user");
    loadHistory();
  }
};

function login(){
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const found = users.find(x => x.username === u && x.password === p);
  if(found){
    localStorage.setItem("current_user", u);
    document.getElementById("login-page").style.display = "none";
    document.getElementById("app-page").style.display = "block";
    document.getElementById("current-user").innerText = u;
    loadHistory();
  }else{
    alert("Username หรือ Password ไม่ถูกต้อง");
  }
}

function logout(){
  localStorage.removeItem("current_user");
  location.reload();
}

function clearInput(){
  document.querySelectorAll(".number,.top,.bottom,.tod").forEach(e=>e.value="");
}

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

function reverse6Way(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const number = numberInput.value;

  if(number.length === 3){
    const perms = Array.from(new Set([
      number,
      number[0]+number[2]+number[1],
      number[1]+number[0]+number[2],
      number[1]+number[2]+number[0],
      number[2]+number[0]+number[1],
      number[2]+number[1]+number[0]
    ]));

    const rows = document.querySelectorAll("table tr");
    let index = 1;
    perms.forEach(p => {
      if(index < rows.length){
        const n = rows[index].querySelector(".number");
        if(n.value === "") n.value = p;
        index++;
      }
    });
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
  let total3 = 0;
  let total2 = 0;
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
      total3 += top + tod;
      total2 += bottom;
    }
  }
  displaySummary(summary);
  document.getElementById("total").innerHTML = "ยอดรวม 3 ตัว: " + total3 + " บาท | ยอดรวม 2 ตัว: " + total2 + " บาท";
  localStorage.setItem("lottery_summary", JSON.stringify(summary));
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
  const currentUser = localStorage.getItem("current_user");
  const history = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  const summary = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  history.push({user: currentUser, date:new Date().toLocaleString(), data:summary});
  localStorage.setItem("lottery_history", JSON.stringify(history));
  loadHistory();
  document.getElementById("lottery-form").reset();
  localStorage.removeItem("lottery_summary");
  document.getElementById("summary").innerHTML = "";
  document.getElementById("total").innerHTML = "";
}

function loadHistory(){
  const history = JSON.parse(localStorage.getItem("lottery_history")||"[]");
  let html = "";
  for(const h of history){
    html += `<div><b>${h.date} | ${h.user}</b><table><tr><th>เลข</th><th>บน</th><th>ล่าง</th><th>โต๊ด</th></tr>`;
    for(const [num,amt] of Object.entries(h.data)){
      html += `<tr><td>${num}</td><td>${amt.top}</td><td>${amt.bottom}</td><td>${amt.tod}</td></tr>`;
    }
    html += "</table></div><hr>";
  }
  document.getElementById("history").innerHTML = html;
}

function exportExcel(){
  const data = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  const ws = XLSX.utils.json_to_sheet(Object.keys(data).map(k=>({เลข:k,บน:data[k].top,ล่าง:data[k].bottom,โต๊ด:data[k].tod})));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "lottery_summary.xlsx");
}

function exportCSV(){
  const data = JSON.parse(localStorage.getItem("lottery_summary")||"{}");
  let csv = "เลข,บน,ล่าง,โต๊ด\n";
  for(const [num,amt] of Object.entries(data)){
    csv += `${num},${amt.top},${amt.bottom},${amt.tod}\n`;
  }
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lottery_summary.csv";
  a.click();
}

function startVoice(){
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "th-TH";
  recognition.onresult = function(event){
    const text = event.results[0][0].transcript;
    alert("คำสั่งเสียง: " + text);
    const regex = /(\d+)\s*บน\s*(\d+)\s*ล่าง\s*(\d+)\s*โต๊ด\s*(\d+)/;
    const match = text.match(regex);
    if(match){
      const number = match[1];
      const top = match[2];
      const bottom = match[3];
      const tod = match[4];
      const rows = document.querySelectorAll("table tr");
      for(let i=1;i<rows.length;i++){
        const n = rows[i].querySelector(".number");
        const t = rows[i].querySelector(".top");
        const b = rows[i].querySelector(".bottom");
        const td = rows[i].querySelector(".tod");
        if(n && n.value === ""){
          n.value = number;
          t.value = top;
          b.value = bottom;
          td.value = tod;
          break;
        }
      }
    }
  };
  recognition.start();
}
