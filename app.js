
// Firebase Auth & Firestore & Voice Command (Final V8)

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    loadHistory();
  } else {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("ลงทะเบียนสำเร็จ"))
    .catch(err => alert(err.message));
}

function logout() { auth.signOut(); }

function clearInputs(){
  document.querySelectorAll(".number, .top, .bottom, .tod").forEach(i => i.value = "");
}

function reverseRow(btn){
  const row = btn.parentElement.parentElement;
  const numberInput = row.querySelector(".number");
  const number = numberInput.value;
  if(number.length >= 2){
    const reversed = number.split("").reverse().join("");
    numberInput.value = reversed;
  }
}

function reverseAll(){
  const rows = document.querySelectorAll("table tr");
  rows.forEach((row,i)=>{
    if(i==0) return;
    const numberInput = row.querySelector(".number");
    const topInput = row.querySelector(".top");
    if(numberInput.value.length==3){
      const perms = permute(numberInput.value.split(""));
      perms.forEach(p=>{
        const num = p.join("");
        for(let j=1;j<rows.length;j++){
          const n = rows[j].querySelector(".number");
          if(n.value === ""){
            n.value = num;
            rows[j].querySelector(".top").value = topInput.value;
            break;
          }
        }
      });
    }
  });
}

function permute(arr){
  if(arr.length===1) return [arr];
  const result = [];
  for(let i=0;i<arr.length;i++){
    const current = arr[i];
    const remaining = arr.slice(0,i).concat(arr.slice(i+1));
    const remainingPerm = permute(remaining);
    remainingPerm.forEach(p=>result.push([current].concat(p)));
  }
  return result.filter((v,i,a)=>a.findIndex(t=>(t.join('')===v.join('')))==i);
}

document.getElementById("lottery-form").onsubmit = function(e){
  e.preventDefault();
  saveBill();
};

function saveBill(){
  const user = auth.currentUser;
  if(!user) return alert("กรุณา login ก่อน");
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

  db.collection("lottery").doc(user.uid).set({
    summary: summary,
    updated: firebase.firestore.FieldValue.serverTimestamp()
  });
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
  const user = auth.currentUser;
  if(!user) return alert("กรุณา login ก่อน");
  saveBill();
  db.collection("lottery_history").add({
    uid: user.uid,
    date: new Date().toLocaleString(),
    data: document.getElementById("summary").innerHTML
  }).then(()=>{
    loadHistory();
    document.getElementById("lottery-form").reset();
    document.getElementById("summary").innerHTML = "";
    document.getElementById("total").innerHTML = "";
  });
}

function loadHistory(){
  const user = auth.currentUser;
  if(!user) return;
  db.collection("lottery_history").where("uid","==",user.uid).orderBy("date","desc").get()
  .then(snapshot=>{
    let html = "";
    snapshot.forEach(doc=>{
      const h = doc.data();
      html += `<div><b>${h.date}</b>${h.data}</div><hr>`;
    });
    document.getElementById("history").innerHTML = html;
  });
}

function exportExcel(){
  const user = auth.currentUser;
  if(!user) return alert("กรุณา login ก่อน");
  db.collection("lottery").doc(user.uid).get()
  .then(doc=>{
    if(doc.exists){
      const data = doc.data().summary;
      const ws = XLSX.utils.json_to_sheet(Object.keys(data).map(k=>({เลข:k,บน:data[k].top,ล่าง:data[k].bottom,โต๊ด:data[k].tod})));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
      XLSX.writeFile(wb, "lottery_summary.xlsx");
    }
  });
}

function exportCSV(){
  const user = auth.currentUser;
  if(!user) return alert("กรุณา login ก่อน");
  db.collection("lottery").doc(user.uid).get()
  .then(doc=>{
    if(doc.exists){
      const data = doc.data().summary;
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
  });
}

function startVoice(){
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "th-TH";
  recognition.onresult = function(event){
    const text = event.results[0][0].transcript;
    parseVoiceCommand(text);
  }
  recognition.start();
}

function parseVoiceCommand(text){
  const numMatch = text.match(/([0-9]{3})/);
  const amtMatch = text.match(/บน([0-9]+)/);
  if(numMatch && amtMatch){
    const num = numMatch[1];
    const amt = amtMatch[1];
    const rows = document.querySelectorAll("table tr");
    for(let i=1;i<rows.length;i++){
      const n = rows[i].querySelector(".number");
      const t = rows[i].querySelector(".top");
      if(n.value === ""){
        n.value = num;
        t.value = amt;
        break;
      }
    }
  }else{
    alert("ไม่เข้าใจคำสั่งเสียง");
  }
}
