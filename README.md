# copy-title-url

Chrome のツールバーアイコンを押すと、現在のタブを Markdown リンク形式でクリップボードにコピーするローカル用拡張です。

```md
[ページタイトル](https://example.com/)
```

## 特徴

- 外部ライブラリなし
- npm / ビルドツールなし
- Chrome Web Store への公開なしで利用可能
- 権限は `activeTab`, `clipboardWrite`, `offscreen` のみ
- ページ側へスクリプトを注入せず、拡張の offscreen document でクリップボードへ書き込み

## インストール

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパー モード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」を押す
4. このリポジトリのフォルダを選ぶ
5. 必要ならツールバーにピン留めする

## 使い方

コピーしたいページを開いた状態で、拡張機能のアイコンをクリックします。

成功するとアイコンに短く `OK` が表示されます。失敗した場合は `ERR` が表示され、詳細は拡張機能の service worker コンソールに出ます。

コードを更新した後は、`chrome://extensions/` でこの拡張機能の更新ボタンを押すか、拡張機能を再読み込みしてください。

## ファイル構成

```text
copy-title-url/
  manifest.json
  background.js
  offscreen.html
  offscreen.js
  README.md
```

## 権限

`activeTab` は、ユーザーがアイコンをクリックした現在のタブのタイトルと URL を取得するために使います。

`clipboardWrite` は、クリップボードへの書き込みに使います。

`offscreen` は、Manifest V3 の service worker から直接クリップボード API を扱わず、拡張内の非表示ドキュメントに書き込み処理を任せるために使います。
