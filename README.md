# 創作文法辞書

漫画・アニメ・映画・ドラマ・小説などで繰り返し使われる、現実とは少し異なる言葉・反応・状況・因果・演出を観察する静的な辞書サイトです。

## 公開サイト

GitHub Pagesで次のURLへ公開する予定です。

```text
https://rustlejp.github.io/fiction-grammar/
```

公開元は `main` ブランチの `/docs` フォルダです。

## ローカルで開く

ブラウザの `file://` ではJSONを取得できないため、リポジトリ直下で静的HTTPサーバーを起動します。

```powershell
python -m http.server 8080
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

コードはMIT License、辞書本文とJSONデータはCC BY 4.0を候補としています。正式なライセンスファイルは、著作者表記を確認してから追加します。
