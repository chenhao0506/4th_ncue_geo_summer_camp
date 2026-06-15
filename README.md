# 第四屆彰師地理探索營報名即時動態網

這是一個可部署到 GitHub Pages 的靜態網站，搭配 Firebase Authentication + Firestore 儲存報名資料。

## 功能

- 家長查詢頁：輸入學員姓名與報名電子郵件後，只顯示該筆報名資料。
- 主辦方管理頁：登入後可新增、更新單筆資料，也可以貼上 CSV 批次匯入。
- 顯示欄位：電子郵件、填寫表單時間、選擇報名天數 / 場次、主辦方通知繳費日期、繳費截止期限、是否繳費、報名狀態與備註。
- Firestore 規則禁止家長列出完整名單，避免公開目前報名人數。

## 重要隱私說明

純 GitHub Pages 沒有後端，如果直接把 Excel 或 JSON 放上網站，家長仍然可以從原始碼或瀏覽器 Network 看到完整資料。這份專案改用 Firebase 儲存資料，家長只能用「學員姓名 + 報名電子郵件」組成的查詢鍵取得單筆資料。

這不是金融等級的身分驗證；若要更嚴格，可把查詢條件改成「學員姓名 + 專屬查詢碼」，並把查詢碼用 Email 個別寄給家長。

## Firebase 設定

1. 到 Firebase Console 建立專案。
2. 啟用 Authentication，登入方式選擇 Email/Password。
3. 建立主辦方使用者帳號。
4. 建立 Firestore Database。
5. 在 Firestore 的 `admins` collection 新增一筆文件，文件 ID 請填主辦方使用者的 UID，內容可放：

```json
{
  "email": "你的管理者信箱"
}
```

6. 將 `firestore.rules` 貼到 Firebase Firestore Rules 並發布。
7. 複製 `firebase-config.example.js` 的內容到 `firebase-config.js`，填入 Firebase Web App 設定。

## GitHub Pages 部署

1. 把網站檔案推到 GitHub repository。不要上傳舊 Excel、Word、PDF 等含個資或內部資料的檔案。
2. 到 repository 的 Settings -> Pages。
3. Source 選擇 `Deploy from a branch`，branch 選擇 `main`，資料夾選擇 `/root`。
4. 等待 GitHub Pages 部署完成。

## CSV 匯入欄位

CSV 第一列請放欄位名稱。支援下列欄位別名：

- 學員姓名 / 學生姓名 / 學生名字
- 學校
- 電子郵件 / 電子郵件地址 / Email / email
- 填寫表單時間 / 時間戳記
- 選擇報名天數 / 報名場次
- 報名狀態
- 主辦方通知繳費日期 / 主辦方通知繳款時間
- 繳費截止期限 / 繳費截止日期
- 是否繳費 / 是否繳款 / 是否繳款=報名成功
- 備註

## 本機預覽

因為網站使用 ES modules，建議用簡單伺服器預覽：

```powershell
python -m http.server 8000
```

然後開啟 `http://localhost:8000`。
