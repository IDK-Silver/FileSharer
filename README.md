# FileSharer - 現代化的檔案分享系統

FileSharer 是一個基於 FastAPI 和 Vue.js 3 建構的高效能檔案分享與管理平台。它提供了一個安全、直觀的介面，讓使用者可以輕鬆上傳、下載、分享及管理他們的檔案。

## ✨ 功能特色

* **使用者系統**：完整的註冊、登入、登出及安全的 JWT (JSON Web Token) 驗證流程，並支援 HttpOnly Refresh Token 機制以提升安全性。
* **角色權限管理**：內建三種使用者角色 (`User`, `Manager`, `Admin`)，各角色擁有不同的操作權限。
  * **Admin**：可管理所有使用者帳號（新增、更新角色/狀態、重設密碼、刪除）。
  * **Manager**：可刪除系統中任何使用者的檔案，並可查看所有檔案的列表。
  * **User**：可管理自己的檔案。
* **檔案核心功能**：
  * **檔案上傳**：支援檔案拖曳或點擊上傳。
  * **檔案列表與預覽**：清晰的表格展示，並支援圖片類型的檔案即時預覽。
  * **安全下載**：透過有時效性的預簽章 URL (Presigned URL) 進行檔案下載，保護原始檔案路徑。
  * **檔案分享**：可為檔案產生有時效性的分享連結。
  * **檔案管理**：支援重新命名和刪除檔案。
* **現代化前端介面**：使用 Vuetify 3 打造，提供美觀、響應式且使用者體驗良好的操作介面，並支援淺色/深色主題切換。

## 🛠️ 技術架構

### 後端 (Backend)

* **框架**: FastAPI
* **ORM**: SQLAlchemy
* **資料庫遷移**: Alembic
* **資料庫**: MySQL (透過 Docker 部署)
* **驗證**: JWT (Access Token + Refresh Token)
* **檔案儲存**: 支援 S3 相容的物件儲存服務 (如 AWS S3, MinIO)

### 前端 (Frontend)

* **框架**: Vue.js 3
* **UI 元件庫**: Vuetify 3
* **語言**: TypeScript
* **建置工具**: Vite
* **路由管理**: Vue Router (搭配 `unplugin-vue-router` 自動化路由)
* **狀態管理**: Pinia
* **容器化**: Docker (開發和生產環境)

## 🚀 快速開始

### 環境需求

* Docker & Docker Compose
* Git

### 本地開發設定

1. **克隆專案**

```bash
git clone <your-repository-url>
cd FileSharer
```

2. **設定環境變數**

```bash
# 複製環境變數範本
cp backend/.env.example backend/.env

# 編輯環境變數，填入您的資料庫密碼、JWT 密鑰以及 S3 相關設定
vim backend/.env
```

3. **啟動完整開發環境**

```bash
# 使用 Docker Compose 一次啟動所有服務（後端、前端、資料庫、MinIO）
docker-compose up -d --build
```

4. **存取應用程式**

* **前端介面**: <http://localhost:8080>

* **後端 API 文件 (Swagger UI)**: <http://localhost:8000/docs>
* **後端 API 文件 (ReDoc)**: <http://localhost:8000/redoc>
* **MinIO 控制台**: <http://localhost:9001> (admin:minioadmin)

### 開發模式

如果您需要進行前端開發並使用熱重載功能：

```bash
# 啟動後端服務
docker-compose up -d db minio create-minio-bucket backend

# 在本地開發前端
cd frontend
npm install
npm run dev
# 前端將在 http://localhost:3000 運行
```

### 生產環境部署

#### 使用外部資料庫（如 AWS RDS）

1. **設定生產環境變數**

```bash
# 在 backend/.env 中設定外部資料庫
DATABASE_URL=mysql+pymysql://username:password@your-rds-endpoint:3306/database_name
```

2. **建置並部署服務**

```bash
# 使用生產配置建置
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml build

# 啟動服務
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

#### AWS 部署建議

* **資料庫**: Amazon RDS (MySQL)
* **後端**: Amazon ECS 或 EC2
* **前端**: Amazon ECS 或使用建置後的靜態檔案部署到 S3 + CloudFront
* **負載均衡**: Application Load Balancer
* **檔案儲存**: Amazon S3

## 📦 資料庫管理 (Alembic)

所有資料庫遷移操作都需要進入後端 Docker 容器中執行。

1. **進入容器**

```bash
docker-compose exec backend bash
```

2. **在容器內執行 Alembic 指令**

```bash
# 偵測模型變更並自動產生遷移腳本
poetry run alembic revision --autogenerate -m "描述您的變更"

# 將資料庫更新到最新版本
poetry run alembic upgrade head

# 查看遷移歷史
poetry run alembic history
```

### 重置資料庫

```bash
# 停止並刪除所有資料
docker-compose down -v

# 重新啟動
docker-compose up -d --build
```

## 📁 專案結構

```
FileSharer/
├── backend/                 # FastAPI 後端
│   ├── app/                # 應用程式主要代碼
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── api/           # API 路由
│   │   ├── core/          # 核心配置
│   │   └── main.py        # 應用程式入口
│   ├── alembic/           # 資料庫遷移
│   ├── uploads/           # 檔案上傳目錄
│   ├── pyproject.toml     # Python 依賴
│   ├── Dockerfile         # Docker 配置
│   └── start.sh          # 啟動腳本
├── frontend/              # Vue.js 前端
│   ├── src/              # 源代碼
│   │   ├── components/   # Vue 組件
│   │   ├── views/        # 頁面組件
│   │   ├── stores/       # Pinia 狀態管理
│   │   ├── router/       # 路由配置
│   │   └── utils/        # 工具函數
│   ├── public/           # 靜態資源
│   ├── package.json      # Node.js 依賴
│   ├── vite.config.ts    # Vite 配置
│   └── Dockerfile        # Docker 配置
├── docker-compose.yaml    # Docker Compose 配置
└── README.md             # 專案說明
```

## 🔧 開發指南

### 使用 Docker 開發

**推薦方式 - 完全容器化開發**

```bash
# 啟動所有服務
docker-compose up -d --build

# 查看日誌
docker-compose logs -f frontend
docker-compose logs -f backend

# 重新建置特定服務
docker-compose build frontend
docker-compose up -d frontend
```

### 本地開發（不使用 Docker）

**Backend 開發**

```bash
# 進入 backend 目錄
cd backend

# 安裝依賴
poetry install

# 啟動開發伺服器
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend 開發**

```bash
# 進入 frontend 目錄
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 類型檢查
npm run type-check

# 代碼檢查
npm run lint
```

### 常用 Docker 指令

```bash
# 查看服務狀態
docker-compose ps

# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend

# 重新建置映像檔
docker-compose build --no-cache

# 停止服務
docker-compose down

# 停止並清理資料
docker-compose down -v

# 僅啟動特定服務
docker-compose up -d db minio backend

# 進入容器
docker-compose exec backend bash
docker-compose exec frontend sh
```

## ⚙️ 環境變數說明

### 後端環境變數 (backend/.env)

```bash
# MySQL 設定
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=file_sharer
MYSQL_USER=admin
MYSQL_PASSWORD=admin_password

# 應用程式設定
SECRET_KEY=your_secret_key
DEBUG=True

# JWT 設定
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# S3/MinIO 設定
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=filesharer-bucket
AWS_REGION=us-east-1
S3_ENDPOINT_URL=http://minio:9000  # Docker 內部網路

# MinIO 設定
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

### 前端環境變數

前端的環境變數直接在 docker-compose.yaml 中設定：

```yaml
environment:
  - VITE_API_BASE_URL=http://localhost:8000
  - VITE_APP_TITLE=FileSharer
```

### 生產環境設定

```bash
# 外部資料庫
DATABASE_URL=mysql+pymysql://user:pass@host:3306/db

# 安全設定
SECRET_KEY=your_production_secret_key
DEBUG=False

# 前端生產環境
VITE_API_BASE_URL=https://your-api-domain.com
```

## 🐛 疑難排解

### 常見問題

1. **服務啟動失敗**

   ```bash
   # 查看詳細日誌
   docker-compose logs
   
   # 重新建置
   docker-compose build --no-cache
   
   # 清理並重新啟動
   docker-compose down -v
   docker-compose up -d --build
   ```

2. **前端無法連接後端**
   * 檢查 `VITE_API_BASE_URL` 環境變數
   * 確認後端服務已啟動：`docker-compose ps`
   * 檢查網路設定：`docker network ls`

3. **資料庫連線問題**
   * 檢查 MySQL 容器狀態：`docker-compose logs db`
   * 驗證環境變數設定
   * 等待資料庫完全啟動（健康檢查通過）

4. **MinIO/S3 問題**
   * 檢查 MinIO 服務：`docker-compose logs minio`
   * 驗證 bucket 是否建立：`docker-compose logs create-minio-bucket`
   * 確認 S3 設定正確

5. **容器佔用過多資源**

   ```bash
   # 查看資源使用情況
   docker stats
   
   # 清理未使用的映像檔和容器
   docker system prune -a
   ```

### 開發技巧

```bash
# 只重啟特定服務
docker-compose restart frontend

# 查看容器內部
docker-compose exec frontend sh
docker-compose exec backend bash

# 實時監控日誌
docker-compose logs -f --tail=100 frontend backend

# 強制重新建置並啟動
docker-compose up -d --build --force-recreate frontend
```

## 🤝 貢獻指南

歡迎您為此專案做出貢獻！請遵循以下步驟：

1. Fork 此專案
2. 建立您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 將您的分支推送到遠端 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

### 程式碼規範

* Backend: 遵循 PEP 8 和 Black 格式化
* Frontend: 使用 ESLint 和 Prettier
* 提交訊息: 使用 Conventional Commits 格式
* Docker: 遵循最佳實踐，使用多階段建置

## 📄 授權

此專案採用 MIT 授權條款。

## 📧 聯絡資訊

如有問題或建議，請開啟 Issue 或聯絡專案維護者。
