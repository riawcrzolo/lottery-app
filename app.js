
const USERS = {
  user1: "1234",
  user2: "1234",
  user3: "1234",
  user4: "1234",
  user5: "1234"
};

let currentUser = null;
let lastAmount = null;

function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if (USERS[u] === p) {
    currentUser = u;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    loadEntries();
  } else {
    document.getElementById("login-error").innerText = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
}

function logout() {
  currentUser = null;
  document.getElementById("login-container").style.display = "block";
  document.getElementById("app-container").style.display = "none";
}

function loadEntries() {
  const data = JSON.parse(localStorage.getItem(currentUser) || "[]");
  const entries = document.getElementById("entries");
  entries.innerHTML = data.map(e =>
    `<div>${e.date} | ${e.type} | ${e.number} | ${e.amount} บาท ${e.cut ? "(ตัด)" : ""}</div>`
  ).join("");
}

document.getElementById("lottery-form").onsubmit = function(e) {
  e.preventDefault();
  const entry = {
    date: document.getElementById("date").value,
    type: document.getElementById("type").value,
    number: document.getElementById("number").value,
    amount: parseFloat(document.getElementById("amount").value),
    cut: document.getElementById("cut").checked
  };
  lastAmount = entry.amount;
  const data = JSON.parse(localStorage.getItem(currentUser) || "[]");
  data.push(entry);
  localStorage.setItem(currentUser, JSON.stringify(data));
  loadEntries();
  e.target.reset();
};

function reverseNumber() {
  const numberField = document.getElementById("number");
  const amountField = document.getElementById("amount");
  const number = numberField.value;
  if (number.length >= 2) {
    const reversed = number.split("").reverse().join("");
    numberField.value = reversed;
    if (lastAmount !== null) {
      amountField.value = lastAmount;
    }
  }
}

function exportData() {
  const data = localStorage.getItem(currentUser);
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentUser}_lottery_data.json`;
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    localStorage.setItem(currentUser, e.target.result);
    loadEntries();
  };
  reader.readAsText(file);
}
