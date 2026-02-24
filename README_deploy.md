# プロダクションへのデプロイ手順

## 1. データベース (Supabase)
設定済みです。✅

## 2. バックエンド API (Render)
1. [Render](https://render.com/) にアクセスし、GitHubでログインします。
2. ダッシュボードから **New > Web Service** を選びます。
3. `youtube_curation_app` のGitHubリポジトリを選択します。
4. 以下の設定を入力します:
   - **Name**: `kidstube-api`
   - **Root Directory**: （空欄）
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && export PYTHONPATH=$PYTHONPATH:$(pwd) && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (環境変数) を追加します:
   - `DATABASE_URL` = `postgresql://postgres.ndxkrodbtwiehweacroy:*********@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`
   - `YOUTUBE_API_KEY` = あなたのYouTube APIキー
   - `SECRET_KEY` = `my-super-secret-jwt-token-key-2026`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
6. デプロイを開始し、完了したら発行されたURL（例: `https://kidstube-api.onrender.com`）をコピーします。

## 3. フロントエンド (Vercel)
1. [Vercel](https://vercel.com/) にアクセスし、GitHubでログインします。
2. **Add New > Project** から対象リポジトリを選びます。
3. **Framework Preset** は `Next.js`、**Root Directory** は `frontend` を選択します。
4. **Environment Variables** (環境変数) を追加します:
   - `NEXT_PUBLIC_API_URL` = `https://kidstube-api.onrender.com/api/v1` （※RenderのURLに置き換えてください）
5. Deployボタンを押して完了です！
