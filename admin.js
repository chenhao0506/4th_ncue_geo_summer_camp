import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { makeRecordId } from "./shared.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginPanel = document.querySelector("#login-panel");
const adminPanel = document.querySelector("#admin-panel");
const loginForm = document.querySelector("#login-form");
const recordForm = document.querySelector("#record-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("#login-message", "登入中。");
  try {
    await signInWithEmailAndPassword(
      auth,
      document.querySelector("#admin-email").value,
      document.querySelector("#admin-password").value,
    );
    setMessage("#login-message", "");
  } catch (error) {
    setMessage("#login-message", `登入失敗：${error.message}`, "error");
  }
});

document.querySelector("#logout-button").addEventListener("click", () => signOut(auth));
document.querySelector("#clear-form-button").addEventListener("click", clearRecordForm);
document.querySelector("#load-record-button").addEventListener("click", loadCurrentRecord);

onAuthStateChanged(auth, (user) => {
  const loggedIn = Boolean(user);
  loginPanel.classList.toggle("hidden", loggedIn);
  adminPanel.classList.toggle("hidden", !loggedIn);
});

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("#record-message", "儲存中。");

  try {
    const record = getRecordFromForm();
    await saveRecord(record);
    setMessage("#record-message", "已儲存。家長可用學員姓名與電子郵件查詢。", "success");
  } catch (error) {
    setMessage("#record-message", `儲存失敗：${error.message}`, "error");
  }
});

async function loadCurrentRecord() {
  setMessage("#record-message", "載入中。");
  try {
    const studentName = document.querySelector("#edit-student-name").value;
    const email = document.querySelector("#edit-email").value;
    const id = await makeRecordId(studentName, email);
    const snapshot = await getDoc(doc(db, "registrations", id));

    if (!snapshot.exists()) {
      setMessage("#record-message", "找不到這筆資料。", "error");
      return;
    }

    fillRecordForm(snapshot.data());
    setMessage("#record-message", "已載入資料。", "success");
  } catch (error) {
    setMessage("#record-message", `載入失敗：${error.message}`, "error");
  }
}

async function saveRecord(record) {
  if (!record.studentName || !record.email) {
    throw new Error("學員姓名與電子郵件為必填。");
  }

  const id = await makeRecordId(record.studentName, record.email);
  await setDoc(
    doc(db, "registrations", id),
    {
      ...record,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser ? auth.currentUser.email : "",
    },
    { merge: true },
  );
}

function getRecordFromForm() {
  return {
    studentName: document.querySelector("#edit-student-name").value.trim(),
    school: document.querySelector("#edit-school").value.trim(),
    email: document.querySelector("#edit-email").value.trim(),
    submittedAt: document.querySelector("#edit-submitted-at").value,
    selectedDays: document.querySelector("#edit-days").value.trim(),
    status: document.querySelector("#edit-status").value,
    noticeDate: document.querySelector("#edit-notice-date").value,
    paymentDeadline: document.querySelector("#edit-deadline").value,
    paid: document.querySelector("#edit-paid").value === "true",
    note: document.querySelector("#edit-note").value.trim(),
  };
}

function fillRecordForm(record) {
  document.querySelector("#edit-student-name").value = record.studentName || "";
  document.querySelector("#edit-school").value = record.school || "";
  document.querySelector("#edit-email").value = record.email || "";
  document.querySelector("#edit-submitted-at").value = toDateTimeLocal(record.submittedAt);
  document.querySelector("#edit-days").value = record.selectedDays || "";
  document.querySelector("#edit-status").value = record.status || "待主辦方確認";
  document.querySelector("#edit-notice-date").value = toDateInput(record.noticeDate);
  document.querySelector("#edit-deadline").value = toDateInput(record.paymentDeadline);
  document.querySelector("#edit-paid").value = record.paid ? "true" : "false";
  document.querySelector("#edit-note").value = record.note || "";
}

function clearRecordForm() {
  recordForm.reset();
  document.querySelector("#edit-status").value = "待主辦方確認";
  document.querySelector("#edit-paid").value = "false";
  setMessage("#record-message", "");
}

function setMessage(selector, text, type = "") {
  const element = document.querySelector(selector);
  element.textContent = text;
  element.className = `message ${type}`.trim();
}

function toDateInput(value) {
  if (!value) return "";
  const match = String(value).match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
  if (!match) return "";
  const [year, month, day] = match[0].replaceAll("/", "-").split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const normalized = String(value).replace("/", "-");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
