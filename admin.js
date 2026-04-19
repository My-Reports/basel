// استدعاء مكتبات فايربيس للإدارة والحذف والرفع (الإصدار 12.12.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, writeBatch, doc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// إعدادات مشروعك
const firebaseConfig = {
    apiKey: "AIzaSyC5lLhfSpSIfKt-0ZcIGbRVujJdm15d8YU",
    authDomain: "sales-dashboard-95a8d.firebaseapp.com",
    projectId: "sales-dashboard-95a8d",
    storageBucket: "sales-dashboard-95a8d.firebasestorage.app",
    messagingSenderId: "319343957308",
    appId: "1:319343957308:web:e1c74694a432797465ba39",
    measurementId: "G-S1BRMRMBYW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fileInput = document.getElementById('excelFile');
const uploadBtn = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');

let parsedData = [];

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        statusDiv.innerText = "جاري قراءة الملف...";
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            parsedData = XLSX.utils.sheet_to_json(worksheet);
            
            statusDiv.innerText = `تمت القراءة بنجاح. عدد السجلات: ${parsedData.length} سجل.`;
            statusDiv.style.color = "#333";
            uploadBtn.style.display = "inline-block";
        };
        reader.readAsArrayBuffer(file);
    }
});

uploadBtn.addEventListener('click', async () => {
    if (parsedData.length === 0) return;
    uploadBtn.disabled = true;
    
    try {
        statusDiv.innerText = "جاري حذف البيانات القديمة... يرجى الانتظار.";
        const colRef = collection(db, "salesData");
        const snapshot = await getDocs(colRef);
        
        let batch = writeBatch(db);
        let count = 0;

        for (const document of snapshot.docs) {
            batch.delete(document.ref);
            count++;
            if (count === 500) {
                await batch.commit();
                batch = writeBatch(db); 
                count = 0;
            }
        }
        if (count > 0) {
            await batch.commit(); 
        }

        statusDiv.innerText = "تم الحذف. جاري رفع البيانات الجديدة...";
        
        batch = writeBatch(db);
        count = 0;
        let uploadTotal = 0;

        for (const item of parsedData) {
            const newDocRef = doc(collection(db, "salesData")); 
            batch.set(newDocRef, item);
            count++;
            uploadTotal++;

            if (count === 500) {
                await batch.commit();
                batch = writeBatch(db);
                count = 0;
                statusDiv.innerText = `جاري الرفع... (${uploadTotal}/${parsedData.length})`;
            }
        }
        if (count > 0) {
            await batch.commit();
        }

        statusDiv.innerText = "✅ تمت العملية بنجاح! تم تحديث قاعدة البيانات والموقع.";
        statusDiv.style.color = "#27ae60";

    } catch (error) {
        console.error(error);
        statusDiv.innerText = "❌ حدث خطأ: تأكد من تفعيل Firestore وقواعد الحماية (Rules). الخطأ: " + error.message;
        statusDiv.style.color = "red";
    } finally {
        uploadBtn.disabled = false;
        fileInput.value = ""; 
    }
});