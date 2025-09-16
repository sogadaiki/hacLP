/**
 * Google Apps Script - フォーム処理
 *
 * 設定手順：
 * 1. Google Apps Script (https://script.google.com) で新規プロジェクトを作成
 * 2. このコードをコピー＆ペースト
 * 3. 下記の定数を設定
 * 4. デプロイ → 新しいデプロイ → ウェブアプリとして公開
 * 5. アクセスできるユーザー: 全員
 * 6. 実行ユーザー: 自分
 * 7. デプロイ後のURLをメモ
 */

// =============== 設定項目 ===============
const CONFIG = {
  // メール送信先
  TO_EMAIL: 'your-email@example.com', // ← ここを変更してください

  // reCAPTCHA シークレットキー
  RECAPTCHA_SECRET: 'YOUR_RECAPTCHA_SECRET_KEY', // ← ここを変更してください

  // メール件名
  EMAIL_SUBJECT: '【HAC】お問い合わせフォームから新着メッセージ',

  // スプレッドシート保存（オプション）
  // スプレッドシートIDを設定すると、問い合わせ内容をスプレッドシートにも保存します
  SPREADSHEET_ID: '', // 空の場合はスプレッドシート保存をスキップ
};

// =============== メイン処理 ===============
function doPost(e) {
  try {
    // POSTデータを取得
    const data = JSON.parse(e.postData.contents);

    // reCAPTCHA検証
    if (!verifyRecaptcha(data.recaptchaToken)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'reCAPTCHA検証に失敗しました。'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 必須項目チェック
    if (!data.name || !data.phone || !data.situation || !data.message) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: '必須項目が不足しています。'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // メール送信
    sendEmail(data);

    // スプレッドシートに保存（設定されている場合）
    if (CONFIG.SPREADSHEET_ID) {
      saveToSpreadsheet(data);
    }

    // 成功レスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'お問い合わせを受け付けました。'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'エラーが発生しました。'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============== reCAPTCHA検証 ===============
function verifyRecaptcha(token) {
  if (!token) return false;

  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const payload = {
    secret: CONFIG.RECAPTCHA_SECRET,
    response: token
  };

  const options = {
    method: 'post',
    payload: payload
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    return result.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// =============== メール送信 ===============
function sendEmail(data) {
  const timestamp = new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});

  // メール本文の作成
  const emailBody = `
就労支援センターHACのお問い合わせフォームから新しいメッセージが届きました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【受信日時】
${timestamp}

【お名前】
${data.name}

【電話番号】
${data.phone}

【メールアドレス】
${data.email || '未入力'}

【現在の状況】
${data.situation}

【ご相談内容・ご質問】
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※このメールは自動送信されています。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // メール送信
  MailApp.sendEmail({
    to: CONFIG.TO_EMAIL,
    subject: CONFIG.EMAIL_SUBJECT,
    body: emailBody
  });

  // 送信者への自動返信（オプション）
  if (data.email) {
    sendAutoReply(data);
  }
}

// =============== 自動返信メール ===============
function sendAutoReply(data) {
  const autoReplyBody = `
${data.name} 様

この度は就労支援センターHACへお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お名前】
${data.name}

【電話番号】
${data.phone}

【現在の状況】
${data.situation}

【ご相談内容・ご質問】
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

担当者より2営業日以内にご連絡させていただきます。
今しばらくお待ちください。

なお、お急ぎの場合は下記までお電話ください。
TEL：099-298-9689

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
就労支援センターHAC
〒892-0838
鹿児島市新屋敷町16番 公社ビル420号
TEL：099-298-9689
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※このメールは自動送信されています。
このメールに返信いただいても確認できませんのでご了承ください。
`;

  MailApp.sendEmail({
    to: data.email,
    subject: '【HAC】お問い合わせありがとうございます（自動返信）',
    body: autoReplyBody,
    noReply: true
  });
}

// =============== スプレッドシート保存 ===============
function saveToSpreadsheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();

    // ヘッダーがない場合は追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '受信日時',
        'お名前',
        '電話番号',
        'メールアドレス',
        '現在の状況',
        'ご相談内容'
      ]);
    }

    // データを追加
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.email || '',
      data.situation,
      data.message
    ]);

  } catch (error) {
    console.error('Spreadsheet save error:', error);
    // スプレッドシート保存に失敗してもメール送信は成功させる
  }
}

// =============== テスト用関数 ===============
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: 'テスト太郎',
        phone: '090-1234-5678',
        email: 'test@example.com',
        situation: '就労継続支援事業所利用中',
        message: 'これはテストメッセージです。',
        recaptchaToken: 'test-token'
      })
    }
  };

  const result = doPost(testData);
  console.log(result.getContent());
}