# フォーム設定手順

## 1. reCAPTCHA v2の設定

### テスト用キー（開発環境用）
開発・テスト時は以下のGoogleテスト用キーが使用できます：
- **サイトキー**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **シークレットキー**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

※これらのキーは常にreCAPTCHAをパスします（本番環境では使用しないでください）

### 1-1. reCAPTCHAキーの取得（本番用）
1. [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)にアクセス
2. サイトを登録：
   - ラベル: HAC Landing Page
   - reCAPTCHAタイプ: **reCAPTCHA v2「私はロボットではありません」チェックボックス**
   - ドメイン: あなたのサイトのドメインを追加
3. 利用規約に同意して送信
4. 以下のキーをメモ：
   - **サイトキー**: 公開用（HTMLに設定）
   - **シークレットキー**: 非公開（GASに設定）

### 1-2. HTMLにサイトキーを設定
`index.html`の以下の箇所を更新：
```html
<!-- 523行目付近 -->
<div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY"></div>
```
`YOUR_RECAPTCHA_SITE_KEY`を実際のサイトキーに置き換えてください。

## 2. Google Apps Scriptの設定

### 2-1. Google Apps Scriptプロジェクトの作成
1. [Google Apps Script](https://script.google.com)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「HAC Contact Form」に変更

### 2-2. コードの設定
1. `gas-form-handler.js`の内容を全てコピー
2. Google Apps Scriptエディタに貼り付け
3. 以下の設定を更新：

```javascript
const CONFIG = {
  // メール送信先（実際のメールアドレスに変更）
  TO_EMAIL: 'your-email@example.com',

  // reCAPTCHAシークレットキー（実際のキーに変更）
  RECAPTCHA_SECRET: 'YOUR_RECAPTCHA_SECRET_KEY',

  // オプション：スプレッドシートに保存する場合はIDを設定
  SPREADSHEET_ID: '', // 空欄のままでもOK
};
```

### 2-3. デプロイ
1. 「デプロイ」→「新しいデプロイ」をクリック
2. 種類の選択で歯車アイコン→「ウェブアプリ」を選択
3. 以下の設定：
   - 説明: 任意（例：v1.0）
   - 実行ユーザー: **自分**
   - アクセスできるユーザー: **全員**
4. 「デプロイ」をクリック
5. 初回は権限の承認が必要です
6. **デプロイURLをコピー**（重要！）

### 2-4. JavaScriptにデプロイURLを設定
`js/main.js`の211行目付近を更新：
```javascript
const GAS_URL = 'YOUR_GAS_DEPLOY_URL'; // ← ここにコピーしたURLを貼り付け
```

例：
```javascript
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw.../exec';
```

## 3. オプション：スプレッドシート保存の設定

問い合わせ内容をスプレッドシートにも保存したい場合：

### 3-1. スプレッドシートの作成
1. [Google スプレッドシート](https://sheets.google.com)で新規作成
2. シート名を「HAC問い合わせ管理」などに変更
3. URLから`/d/`と`/edit`の間のIDをコピー

例：`https://docs.google.com/spreadsheets/d/【ここがID】/edit`

### 3-2. GASにスプレッドシートIDを設定
```javascript
SPREADSHEET_ID: 'コピーしたID',
```

## 4. テスト

### 4-1. ローカルテスト
1. ブラウザでindex.htmlを開く
2. フォームに以下を入力：
   - お名前: テスト太郎
   - 電話番号: 090-1234-5678
   - メールアドレス: test@example.com（任意）
   - 現在の状況: 選択
   - ご相談内容: テスト送信です
3. reCAPTCHAにチェック
4. 送信ボタンをクリック

### 4-2. 確認項目
- [ ] reCAPTCHAが表示される
- [ ] 送信ボタンが「送信中...」に変わる
- [ ] 成功メッセージが表示される
- [ ] 設定したメールアドレスに通知が届く
- [ ] メールアドレスを入力した場合、自動返信が届く
- [ ] スプレッドシートに記録される（設定した場合）

## 5. トラブルシューティング

### よくある問題

#### reCAPTCHAが表示されない
- サイトキーが正しく設定されているか確認
- ドメインがreCAPTCHAに登録されているか確認

#### フォーム送信でエラーが出る
- GASのデプロイURLが正しく設定されているか確認
- GASの実行権限が「全員」になっているか確認

#### メールが届かない
- TO_EMAILのアドレスが正しいか確認
- 迷惑メールフォルダを確認
- Gmailの送信制限（1日100通）に達していないか確認

### デバッグ方法
1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. GASの実行ログを確認：
   - Apps Scriptエディタ→「実行数」→「ログを表示」

## セキュリティに関する注意

- **シークレットキーは絶対に公開しない**（GitHubにコミットしない）
- 定期的にreCAPTCHAの分析データを確認
- 不審なフォーム送信があった場合はreCAPTCHAの設定を見直す

## 設定完了チェックリスト

- [ ] reCAPTCHAサイトキーを取得した
- [ ] reCAPTCHAシークレットキーを取得した
- [ ] HTMLにサイトキーを設定した
- [ ] GASプロジェクトを作成した
- [ ] GASに設定を記入した（メールアドレス、シークレットキー）
- [ ] GASをデプロイした
- [ ] JavaScriptにGASのURLを設定した
- [ ] テスト送信が成功した
- [ ] メール通知が届いた

全てにチェックが付いたら設定完了です！