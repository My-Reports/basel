import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('excelFile');
    const statusText = document.getElementById('status');

    if (!fileInput.files.length) {
        statusText.innerText = "الرجاء اختيار ملف Excel أولاً ⚠️";
        statusText.style.color = "red";
        return;
    }

    statusText.innerText = "جاري قراءة الملف وتحليل البيانات... ⏳";
    statusText.style.color = "blue";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            // 1. تحويل Excel إلى JSON
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            statusText.innerText = "جاري تحديث السحابة (Firebase)... ⏳";

            // 2. مسح البيانات القديمة من الكولكشن (مثلاً: mainData)
            const collectionRef = collection(db, "mainData");
            const snapshot = await getDocs(collectionRef);
            const batchDelete = writeBatch(db);
            snapshot.docs.forEach((document) => {
                batchDelete.delete(document.ref);
            });
            await batchDelete.commit();

            // 3. رفع البيانات الجديدة باستخدام Batch
            const batchInsert = writeBatch(db);
            jsonData.forEach((row) => {
                const newDocRef = doc(collectionRef); // إنشاء ID تلقائي
                batchInsert.set(newDocRef, row);
            });
            await batchInsert.commit();

            statusText.innerText = "✅ تم تحديث البيانات بنجاح! الموقع يعمل الآن على البيانات الجديدة.";
            statusText.style.color = "green";
            fileInput.value = ""; // تفريغ الحقل

        } catch (error) {
            console.error(error);
            statusText.innerText = "❌ حدث خطأ أثناء الرفع. تحقق من الكونسول.";
            statusText.style.color = "red";
        }
    };

    reader.readAsArrayBuffer(file);
});