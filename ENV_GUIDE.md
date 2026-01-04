# 前端环境变量配置指南

为了让前端能够连接到您的后端 API，请在 `ai_glasses_fronted` 根目录下手动创建一个 `.env.local` 文件，并添加以下内容：

```env
# 指向 ai_glasses_backend 服务的地址
# 如果本地运行后端使用 npm run dev -p 3001，则填 http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 注意事项：
1. 请确保后端服务已启动且配置了正确的 CORS。
2. 如果前后端部署在同一台机器的不同端口，请确保端口不冲突。
