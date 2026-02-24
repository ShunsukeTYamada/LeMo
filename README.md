# KidsTube (YouTube Curation App)

小中高生向けの安心・安全なYouTubeキュレーションアプリです。ホワイトリスト形式で承認されたチャンネルの動画のみを表示し、学習やエンタメを安全に楽しめる環境を提供します。

## 主な機能

1. **セーフな動画の自動収集・バッチ処理**
   YouTube APIを利用し、安全な（キッズ向け・教育向け）チャンネルの動画のみを取得。登録者数やNGワードによるフィルタリングを実行します。
   
2. **管理者ダッシュボード**
   チャンネルの探索、承認・拒否、またUI上でTV局や公的機関などの高安全性アカウントを視覚的にハイライト表示します。（`/admin` パス）

3. **パーソナライズ機能 (認証)**
   ユーザーアカウントを作成・ログインすることで、「お気に入り追加」や「最近見た動画の履歴」をマイページ（`/library`）で確認できます。

## 技術スタック
- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens), passlib, bcrypt

## ローカルでの実行手順

### 1. データベースの起動 (PostgreSQL)
ローカルに PostgreSQL をインストールするか、Docker を使用して起動します。
```bash
docker run --name kids-db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

### 2. バックエンド環境変数の設定
`backend/.env` を作成し、以下を設定します。
```
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
YOUTUBE_API_KEY=あなたのYouTubeAPIキー
SECRET_KEY=ランダムな文字列 (JWT署名用)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. バックエンドのセットアップと起動
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# マイグレーションの実行
alembic upgrade head

# 初期管理者ユーザーの作成 (ID: admin / PW: password123)
export PYTHONPATH=$PYTHONPATH:$(pwd)
python create_admin.py

# FastAPIサーバーの起動 (ポート8000)
uvicorn app.main:app --reload
```

### 4. フロントエンドのセットアップと起動
`frontend/.env.local` を作成し、以下を設定します。
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

```bash
cd frontend
npm install
npm run dev
```
これで `http://localhost:3000` でアプリにアクセスできます。

## デプロイについて
プロダクション環境にデプロイする場合は、以下の点に注意してください。
- データベースは AWS RDS や Supabase などのマネージドサービスを利用。
- フロントエンドは Vercel にデプロイすると最適化されます。
- バックエンドの FastAPI は Render や Heroku、AWS App Runner などにデプロイし、CORSの `allow_origins` をフロントエンドのプロダクションURLに変更してください。
- 定期的な動画取得バッチ（`/api/v1/videos/fetch-updates`）は、cronやGitHub Actions等を使って定期的に叩くように設定してください。
