import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDoc, getFirestore, doc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { formatValue, makeRecordId } from "./shared.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.querySelector("#lookup-form");
const button = document.querySelector("#lookup-button");
const message = document.querySelector("#lookup-message");
const resultCard = document.querySelector("#result-card");

const fields = {
  name: document.querySelector("#result-name"),
  school: document.querySelector("#result-school"),
  email: document.querySelector("#result-email"),
  submittedAt: document.querySelector("#result-submitted-at"),
  days: document.querySelector("#result-days"),
  noticeDate: document.querySelector("#result-notice-date"),
  deadline: document.querySelector("#result-deadline"),
  paid: document.querySelector("#result-paid"),
  note: document.querySelector("#result-note"),
  badge: document.querySelector("#status-badge"),
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("查詢中，請稍候。");
  resultCard.classList.add("hidden");
  button.disabled = true;

  try {
    const studentName = document.querySelector("#student-name").value;
    const recordId = await makeRecordId(studentName);
    const snapshot = await getDoc(doc(db, "registrations", recordId));

    if (!snapshot.exists()) {
      setMessage("查無符合資料。請確認姓名是否與報名時填寫一致。", "error");
      return;
    }

    renderRecord(snapshot.data());
    setMessage("查詢完成。", "success");
  } catch (error) {
    setMessage(`查詢失敗：${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

function renderRecord(record) {
  fields.name.textContent = formatValue(record.studentName);
  fields.school.textContent = formatValue(record.school);
  fields.email.textContent = formatValue(record.email);
  fields.submittedAt.textContent = formatValue(record.submittedAt);
  fields.days.textContent = formatValue(record.selectedDays);
  fields.noticeDate.textContent = formatValue(record.noticeDate);
  fields.deadline.textContent = formatValue(record.paymentDeadline);
  fields.paid.textContent = formatValue(Boolean(record.paid));
  fields.note.textContent = formatValue(record.note);
  fields.badge.textContent = formatValue(record.status);
  resultCard.classList.remove("hidden");
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}
