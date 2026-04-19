// استدعاء مكتبات فايربيس (الإصدار 12.12.0 المطابق لمشروعك)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// إعدادات مشروعك التي أرسلتها
const firebaseConfig = {
    apiKey: "AIzaSyC5lLhfSpSIfKt-0ZcIGbRVujJdm15d8YU",
    authDomain: "sales-dashboard-95a8d.firebaseapp.com",
    projectId: "sales-dashboard-95a8d",
    storageBucket: "sales-dashboard-95a8d.firebasestorage.app",
    messagingSenderId: "319343957308",
    appId: "1:319343957308:web:e1c74694a432797465ba39",
    measurementId: "G-S1BRMRMBYW"
};

// تهيئة Firebase وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let salesChart = null;

// الاستماع المباشر للتغييرات في Firestore
const colRef = collection(db, "salesData");
onSnapshot(colRef, (snapshot) => {
    const data = [];
    snapshot.docs.forEach(doc => {
        data.push(doc.data());
    });

    renderTable(data);
    renderChart(data);
});

// دالة رسم الجدول 
function renderTable(data) {
    const thead = document.querySelector("#dataTable head");
    const tbody = document.querySelector("#dataTable tbody");
    
    document.querySelector("#dataTable thead").innerHTML = "";
    tbody.innerHTML = "";

    if(data.length === 0) return;

    const headers = Object.keys(data[0]);
    let trHead = document.createElement('tr');
    headers.forEach(header => {
        let th = document.createElement('th');
        th.textContent = header;
        trHead.appendChild(th);
    });
    document.querySelector("#dataTable thead").appendChild(trHead);

    data.forEach(row => {
        let tr = document.createElement('tr');
        headers.forEach(header => {
            let td = document.createElement('td');
            td.textContent = row[header] || '-';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// دالة رسم المخطط البياني
function renderChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const aggregatedData = {};
    
    data.forEach(item => {
        const productName = item["Product Name"];
        const salesValue = parseFloat(item["Sales Value"]) || 0;
        if(productName) {
            if(!aggregatedData[productName]) aggregatedData[productName] = 0;
            aggregatedData[productName] += salesValue;
        }
    });

    const labels = Object.keys(aggregatedData);
    const values = Object.values(aggregatedData);

    if(salesChart) salesChart.destroy();

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'إجمالي قيمة المبيعات',
                data: values,
                backgroundColor: '#3498db',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } }
        }
    });
}