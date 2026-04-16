import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// === ضع إعدادات Firebase الخاصة بك هنا ===
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let myChart; // متغير لحفظ الرسم البياني لتحديثه لاحقاً

// استماع لحظي للبيانات من Firebase
const collectionRef = collection(db, "mainData");
onSnapshot(collectionRef, (snapshot) => {
    const data = [];
    snapshot.forEach((doc) => {
        data.push(doc.data());
    });

    if(data.length > 0) {
        updateTable(data);
        updateChart(data);
    }
});

// دالة تحديث الجدول ديناميكياً
function updateTable(data) {
    const thead = document.getElementById('tableHeaders');
    const tbody = document.getElementById('tableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // استخراج أسماء الأعمدة من أول صف
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        thead.appendChild(th);
    });

    // تعبئة الصفوف
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.innerText = row[header] || '-';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// دالة تحديث الرسم البياني (مثال: نفترض أن الأكسيل فيه أعمدة باسم "المنتج" و "المبيعات")
function updateChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // ستحتاج لتعديل هذه الأسماء لتطابق أسماء الأعمدة في ملف الإكسيل الخاص بك
    // إذا لم تكن تعرف الأسماء مسبقاً، يمكنك اختيار أول عمودين كنص ورقم
    const labels = data.map(item => Object.values(item)[0]); 
    const values = data.map(item => Object.values(item)[1]); 

    // تدمير الرسم القديم إن وجد لتحديثه
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar', // يمكنك تغييره إلى line, pie, etc.
        data: {
            labels: labels,
            datasets: [{
                label: 'القيم المسجلة',
                data: values,
                backgroundColor: 'rgba(37, 99, 235, 0.5)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}