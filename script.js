window.onload = function(){
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
  showData();
};

let data = JSON.parse(localStorage.getItem("data")) || [];
let goal = Number(localStorage.getItem("goal")) || 3000;

let chart;

// ➕ เพิ่มข้อมูล
function addData(){
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  let category = document.getElementById("category").value;

  if(type === "income"){
    category = "income";
  }

  const studentId = localStorage.getItem("studentId");
  const date = document.getElementById("date").value;

  if(!amount || !date){
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  data.push({
    studentId,
    amount,
    type,
    category,
    date
  });

  localStorage.setItem("data", JSON.stringify(data));
  showData();
}

// 📊 แสดงข้อมูล
function showData(){
  const studentId = localStorage.getItem("studentId");
  const selectedDate = document.getElementById("date").value;

  const list = document.getElementById("list");
  list.innerHTML = "";

  let income = 0;
  let expense = 0;
  let categorySum = {};

  const filtered = data.filter(d =>
    d.studentId === studentId &&
    d.date === selectedDate
  );

  let incomeList = [];
  let expenseList = [];

  filtered.forEach(d => {

    if(d.type === "income"){
      income += d.amount;
      incomeList.push(`+ ${d.amount} บาท`);
    } else {
      expense += d.amount;
      expenseList.push(`- ${d.category} ${d.amount} บาท`);
    }

    if(!categorySum[d.category]) categorySum[d.category] = 0;
    categorySum[d.category] += d.amount;
  });

  // 🧾 แสดงรายการ
  if(incomeList.length > 0){
    const li = document.createElement("li");
    li.innerHTML = `<b>💰 รายรับ</b><br>${incomeList.join("<br>")}`;
    list.appendChild(li);
  }

  if(expenseList.length > 0){
    const li = document.createElement("li");
    li.innerHTML = `<b>💸 รายจ่าย</b><br>${expenseList.join("<br>")}`;
    list.appendChild(li);
  }

  const balance = income - expense;

  // 💡 เงินต่อวัน
  const today = new Date();
  const daysLeft = 30 - today.getDate();
  const perDay = balance / (daysLeft || 1);

  document.getElementById("daily").innerText =
    `💸 ใช้ได้ต่อวัน: ${Math.abs(perDay).toFixed(0)} บาท/วัน`;

  // 🚨 แจ้งเตือน
  let alertText = "";

  if(expense > goal * 0.8){
    alertText = "⚠️ ใช้เงินใกล้เกินงบแล้ว!";
  }

  if(balance < 0){
    alertText = "🔴 เงินติดลบ!";
  }

  document.getElementById("alert").innerText = alertText;

  // 💚 สถานะ
  let score = "";

  if(balance > 1000) score = "💚 ดีมาก";
  else if(balance > 0) score = "🟡 ปานกลาง";
  else score = "🔴 เสี่ยง";

  document.getElementById("total").innerText =
    `💰 คงเหลือ: ${balance} บาท\n📊 สถานะ: ${score}`;

  drawChart(categorySum);
  renderMonthlyTable();
  renderDailyTable(); // ✅ เพิ่มแล้ว
}

// 📊 กราฟ
function drawChart(categorySum){
  const ctx = document.getElementById("chart").getContext("2d");

  if(chart){
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categorySum),
      datasets: [{
        data: Object.values(categorySum),
        backgroundColor: [
          "#ffb3c6",
          "#a0c4ff",
          "#caffbf",
          "#ffd6a5",
          "#bdb2ff"
        ]
      }]
    }
  });
}

// 📋 ตารางรายเดือน
function renderMonthlyTable(){
  const studentId = localStorage.getItem("studentId");

  const table = document.querySelector("#monthlyTable tbody");
  table.innerHTML = "";

  let monthly = {};

  data
    .filter(d => d.studentId === studentId)
    .forEach(d => {
      const month = d.date.slice(0,7);

      if(!monthly[month]){
        monthly[month] = { income: 0, expense: 0 };
      }

      if(d.type === "income"){
        monthly[month].income += d.amount;
      } else {
        monthly[month].expense += d.amount;
      }
    });

  for(let m in monthly){
    const row = document.createElement("tr");

    const balance =
      monthly[m].income - monthly[m].expense;

    row.innerHTML = `
      <td>${m}</td>
      <td>${monthly[m].income}</td>
      <td>${monthly[m].expense}</td>
      <td>${balance}</td>
    `;

    table.appendChild(row);
  }
}

// 📅 ตารางรายวัน (ใหม่🔥)
function renderDailyTable(){
  const studentId = localStorage.getItem("studentId");

  const table = document.querySelector("#dailyTable tbody");
  if(!table) return;

  table.innerHTML = "";

  let daily = {};

  data
    .filter(d => d.studentId === studentId)
    .forEach(d => {

      if(!daily[d.date]){
        daily[d.date] = { income: 0, expense: 0 };
      }

      if(d.type === "income"){
        daily[d.date].income += d.amount;
      } else {
        daily[d.date].expense += d.amount;
      }
    });

  const today = new Date().toISOString().split("T")[0];

  const sortedDates = Object.keys(daily).sort().reverse();

  sortedDates.forEach(date => {
    const row = document.createElement("tr");

    const balance =
      daily[date].income - daily[date].expense;

    const label = date === today ? `${date} (วันนี้)` : date;

    row.innerHTML = `
      <td>${label}</td>
      <td>${daily[date].income}</td>
      <td>${daily[date].expense}</td>
      <td>${balance}</td>
    `;

    table.appendChild(row);
  });
}

// 🔘 เปลี่ยน section
function showSection(name){
  document.getElementById("chartSection").style.display = "none";
  document.getElementById("tableSection").style.display = "none";
  document.getElementById("dailySection").style.display = "none";

  document.getElementById(name + "Section").style.display = "block";
}