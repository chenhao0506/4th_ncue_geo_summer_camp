export function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function makeRecordId(studentName, email) {
  const key = `${normalizeText(studentName)}|${normalizeEmail(email)}`;
  const bytes = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function formatValue(value) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "boolean") return value ? "已繳費" : "未繳費";
  return String(value);
}

export function csvToObjects(csvText) {
  const rows = parseCsv(csvText).filter((row) => row.some((cell) => cell.trim() !== ""));
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] ? row[index].trim() : "";
    });
    return item;
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

export function mapImportedRecord(row) {
  const pick = (...keys) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== "") return row[key];
    }
    return "";
  };

  const paidRaw = pick("是否繳費", "是否繳款", "是否繳款=報名成功");
  const paid = ["true", "yes", "y", "1", "已繳費", "報名成功"].includes(String(paidRaw).trim().toLowerCase());

  return {
    studentName: pick("學員姓名", "學生姓名", "學生名字"),
    school: pick("學校"),
    email: pick("電子郵件", "電子郵件地址", "Email", "email"),
    submittedAt: pick("填寫表單時間", "時間戳記"),
    selectedDays: pick("選擇報名天數", "報名場次"),
    status: pick("報名狀態") || (paid ? "報名成功" : "待主辦方確認"),
    noticeDate: pick("主辦方通知繳費日期", "主辦方通知繳款時間"),
    paymentDeadline: pick("繳費截止期限", "繳費截止日期"),
    paid,
    note: pick("備註"),
  };
}
