/**
 * Google Apps Script - Googleフォーム送信時のメール通知
 *
 * 設定手順：
 * 1. Googleフォームの「回答」タブ → スプレッドシートにリンク
 * 2. スプレッドシートを開く → 拡張機能 → Apps Script
 * 3. このコードを貼り付けて保存
 * 4. setupTrigger() を1回だけ実行（トリガーを自動設定）
 * 5. Googleの権限承認ダイアログで「許可」をクリック
 */

// =============== 設定 ===============
var TO_EMAIL = 'support@hac-kg.co.jp';
var EMAIL_SUBJECT = '【HAC】LPお問い合わせフォームから新着メッセージ';

// =============== 初回セットアップ（1回だけ実行） ===============
function setupTrigger() {
  // 既存のトリガーを削除（重複防止）
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  // フォーム送信時トリガーを設定
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onFormSubmit()
    .create();
  Logger.log('トリガーを設定しました。');
}

// =============== フォーム送信時に実行 ===============
function onFormSubmit(e) {
  try {
    var responses = e.namedValues;

    var name = responses['お名前'] ? responses['お名前'][0] : '';
    var phone = responses['電話番号'] ? responses['電話番号'][0] : '';
    var email = responses['メールアドレス'] ? responses['メールアドレス'][0] : '';
    var situation = responses['現在の状況'] ? responses['現在の状況'][0] : '';
    var message = responses['ご相談内容・ご質問'] ? responses['ご相談内容・ご質問'][0] : '';
    var timestamp = new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});

    // --- クライアントへの通知メール ---
    var body = ''
      + '就労支援センターHACのLPお問い合わせフォームから新しいメッセージが届きました。\n'
      + '\n'
      + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
      + '■ お問い合わせ内容\n'
      + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
      + '\n'
      + '【受信日時】\n' + timestamp + '\n'
      + '\n'
      + '【お名前】\n' + name + '\n'
      + '\n'
      + '【電話番号】\n' + phone + '\n'
      + '\n'
      + '【メールアドレス】\n' + (email || '未入力') + '\n'
      + '\n'
      + '【現在の状況】\n' + situation + '\n'
      + '\n'
      + '【ご相談内容・ご質問】\n' + message + '\n'
      + '\n'
      + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
      + '※このメールはLPフォームから自動送信されています。\n'
      + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    MailApp.sendEmail({
      to: TO_EMAIL,
      subject: EMAIL_SUBJECT,
      body: body
    });

    // --- 問い合わせ者への自動返信（メールアドレスがある場合のみ） ---
    if (email) {
      var replyBody = ''
        + name + ' 様\n'
        + '\n'
        + 'この度は就労支援センターHACへお問い合わせいただき、誠にありがとうございます。\n'
        + '以下の内容でお問い合わせを受け付けました。\n'
        + '\n'
        + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
        + '■ お問い合わせ内容\n'
        + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
        + '\n'
        + '【お名前】\n' + name + '\n'
        + '\n'
        + '【電話番号】\n' + phone + '\n'
        + '\n'
        + '【現在の状況】\n' + situation + '\n'
        + '\n'
        + '【ご相談内容・ご質問】\n' + message + '\n'
        + '\n'
        + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
        + '\n'
        + '担当者より2営業日以内にご連絡させていただきます。\n'
        + '今しばらくお待ちください。\n'
        + '\n'
        + 'なお、お急ぎの場合は下記までお電話ください。\n'
        + 'TEL：099-298-9689\n'
        + '\n'
        + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
        + '就労支援センターHAC\n'
        + '〒892-0838\n'
        + '鹿児島市新屋敷町16番 公社ビル420号\n'
        + 'TEL：099-298-9689\n'
        + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
        + '\n'
        + '※このメールは自動送信されています。\n'
        + 'このメールに返信いただいても確認できませんのでご了承ください。\n';

      MailApp.sendEmail({
        to: email,
        subject: '【HAC】お問い合わせありがとうございます（自動返信）',
        body: replyBody,
        noReply: true
      });
    }

    Logger.log('メール送信完了: ' + name);

  } catch (error) {
    Logger.log('エラー: ' + error.toString());
    // エラーが起きても通知
    MailApp.sendEmail({
      to: TO_EMAIL,
      subject: '【HAC】フォーム通知エラー',
      body: 'フォーム送信時にエラーが発生しました。\nスプレッドシートを直接確認してください。\n\nエラー: ' + error.toString()
    });
  }
}
