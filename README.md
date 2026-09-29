# 創作文法辞書

漫画・アニメ・映画・ドラマ・小説などで繰り返し使われる、現実とは少し異なる言葉・反応・状況・因果・演出を観察する静的な辞書サイトです。

## 公開サイト

GitHub Pagesで次のURLに公開しています。

```text
https://rustlejp.github.io/fiction-grammar/
```

公開元は `main` ブランチの `/docs` フォルダです。

## ローカルで開く

Windowsでは、リポジトリ直下の `創作文法辞書を開く.cmd` をダブルクリックしてください。ブラウザーにローカルの辞書トップが開きます。トップの「編集画面」と、各語の「編集」リンクからローカルエディターへ進めます。これらの編集リンクはGitHub Pagesの公開版には表示しません。起動した黒いウィンドウを閉じると停止し、次回も同じファイルを開くだけで再開できます。

エディターの作業データはブラウザー内の `http://localhost:8080` に保存されるため、ポート8080を固定しています。別のツールが使用中の場合は自動で別ポートに変更せず、競合を知らせます。必要な作業データはエディターからJSONでバックアップしてください。

手動で起動する場合は、リポジトリ直下で次を実行します。ブラウザの `file://` ではJSONを取得できません。

```powershell
python local_server.py
```

その後、次を開きます。

```text
公開ページ: http://localhost:8080/docs/
ローカルエディター: http://localhost:8080/local-editor/
```

## 項目を更新する

1. ローカルエディターで項目を追加・編集する
2. 「全作業データをバックアップ」で下書きを含む `workspace.json` を保存する
3. 「Pages用JSONを書出」で `published` だけの `entries.json` を保存する
4. `docs/data/entries.json` と差し替える
5. ローカルの公開ページで確認してからGitHubへ反映する

LocalStorageは作業継続用であり、正式なバックアップではありません。節目では必ず全作業データを書き出してください。

## 公開範囲

- `docs/`: GitHub Pagesで公開される閲覧専用サイト
- `local-editor/`: ローカル専用エディター（GitHubへ送信しない）
- `local-data/`: 作業用JSONとバックアップ（GitHubへ送信しない）

公開用の `docs/data/entries.json` には `status: published` の項目だけを入れます。

## ライセンス

サイトのコード（JavaScript、CSS、HTMLの構造・動作部分）は [MIT License](LICENSE) で公開します。

辞書の項目本文、更新記録、説明文と、それらを収録したJSONデータは [Creative Commons 表示 4.0 国際（CC BY 4.0）](CONTENT_LICENSE.md) で公開します。再利用の際は「創作文法辞書 / Rustle」、元ページまたはリポジトリへのリンク、ライセンスへのリンクを示し、改変した場合はその旨を記してください。

文章をHTMLに表示していても、その文章にはCC BY 4.0が適用されます。コードのMIT Licenseが辞書本文に適用されるわけではありません。
