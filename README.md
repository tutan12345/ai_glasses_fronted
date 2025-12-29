# Smart Agent Frontend

这是一个独立的前端工程，用于与 Smart Agent Backend 配合使用。

## 快速开始

1.  **安装依赖**：
    ```bash
    npm install
    ```

2.  **运行开发服务器**：
    ```bash
    npm run dev
    ```
    前端将默认运行在 `http://localhost:3000`。

3.  **API 代理配置**：
    默认情况下，所有 `/api/*` 请求都会通过 `next.config.ts` 中的 `rewrites` 代理到 `http://localhost:8080`（后端默认地址）。
    如果您更改了后端地址，请修改 `next.config.ts`。

## 项目结构

- `app/`: Next.js 页面和布局。
- `components/`: React 组件。
- `hooks/`: 自定义 Hook，核心是 `useAgent.ts`。
- `lib/`: 简化的基础类型和工具函数。为了保护知识产权，后端的智能体核心逻辑（如 Gemini 客户端实现、子代理路由、数据库操作等）已从本工程中剥离。

## 注意事项

- 本工程不包含任何敏感的后端逻辑。
- 所有的 AI 推理、工具执行和数据库存储均由独立的后端工程处理。

