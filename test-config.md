# テスト用設定

## 開発環境でのテスト方法

### 1. テスト用reCAPTCHAキーの使用

index.html（481行目）を一時的に変更：
```html
<!-- 本番用 -->
<!-- <div class="g-recaptcha" data-sitekey="6Lfk78orAAAAAJQoCGfoenaPkV-V_Ps_JwHrytyj"></div> -->

<!-- テスト用 -->
<div class="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></div>
```

Google Apps Script（gas-form-handler.js）も変更：
```javascript
// テスト用シークレットキー
RECAPTCHA_SECRET: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
```

### 2. ローカルサーバーの起動

```bash
# Pythonの場合
cd /Users/daiki12/Desktop/development/hac_lp
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

### 3. 本番環境への切り替え

テストが完了したら、必ず本番用のキーに戻してください：
- サイトキー: `6Lfk78orAAAAAJQoCGfoenaPkV-V_Ps_JwHrytyj`
- シークレットキー: （Google Apps Scriptで設定済み）

## トラブルシューティング

### 「サイト所有者エラー」が表示される場合
1. reCAPTCHA管理画面でドメインを追加
2. ローカルサーバーを使用（file://ではなくhttp://）
3. テスト用キーを使用

### フォームが送信されない場合
1. ブラウザのコンソールでエラーを確認
2. Google Apps ScriptのURLが正しく設定されているか確認
3. CSRFトークンのエラーの場合はページをリロード