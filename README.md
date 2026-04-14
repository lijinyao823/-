# 理工光影

**武汉理工大学校园摄影展示平台**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

</div>

## 项目简介

**理工光影** 是一个专为武汉理工大学师生打造的校园摄影社区平台。用户可以在平台上发布、浏览、点赞、评论校园摄影作品，发现优秀摄影师，并通过私信与他人交流。平台以"记录武理，光影随行"为理念，致力于在每一个光影交错的瞬间，发现武汉理工大学的灵魂。

---

## 技术栈

| 技术 | 说明 |
|---|---|
| [Next.js 15](https://nextjs.org/) | React 全栈框架，App Router |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Supabase](https://supabase.com/) | 后端服务（数据库、认证、实时消息） |
| [Tailwind CSS 4](https://tailwindcss.com/) | 原子化 CSS 样式 |
| [Motion](https://motion.dev/) | 动画效果 |
| [Lucide React](https://lucide.dev/) | 图标库 |
| [Google Gemini AI](https://ai.google.dev/) | AI 功能支持 |

---

## 页面与功能

### 🏠 首页 `/`
- **全屏轮播横幅**：展示精选摄影作品，营造沉浸式视觉体验
- **探索画廊**：点击按钮平滑滚动至照片瀑布流区域
- **发布作品**：快速弹出上传弹窗，方便直接在首页发布作品
- **Feed 切换**：支持"全部"和"关注的人"两种信息流
- **分类筛选**：按风景、人文、活动等类别过滤作品
- **地点筛选**：支持按南湖、马房山、余家头等校区筛选
- **排序方式**：支持按最新、最多点赞、最多评论排序
- **关键词搜索**：通过 URL 参数 `?q=` 搜索作品标题、描述、作者
- **无限滚动**：触底自动加载更多作品

### 🔐 登录 / 注册 `/login`
- 邮箱 + 密码方式登录与注册
- 登录成功后自动跳转到个人主页
- 统一的表单验证与错误提示

### 👤 个人主页 `/profile`
- **个人信息**：展示头像、昵称、简介、学院、年级等信息
- **侧边栏**：显示作品数、获赞数、粉丝数、关注数等统计
- **上传区域**：支持拖拽上传或点击选择图片，填写标题、描述、分类、地点及标签
- **作品管理**：瀑布流展示自己的所有作品，可删除作品

### 📸 照片详情 `/photo/[id]`
- 大图展示照片原图
- 显示作者信息、发布时间、地点、分类、标签
- **点赞功能**：登录用户可对作品点赞/取消点赞
- **评论功能**：登录用户可发表评论，展示全部评论列表
- **关注作者**：在详情页直接关注 / 取消关注摄影师
- **私信作者**：一键发起与作者的私信会话

### 🙍 用户主页 `/user/[userId]`
- 查看任意用户的公开主页
- 展示该用户的基本信息（头像、昵称、简介、学院）
- 统计数据：作品数、获赞数、粉丝数、关注数
- 浏览该用户发布的全部作品
- 一键关注 / 取消关注、发起私信

### 📷 摄影师广场 `/photographers`
- 展示平台上所有注册摄影师
- **多维度排序**：按获赞最多、粉丝最多、作品最多、最新加入排序
- 每张卡片展示摄影师头像、昵称、简介、学院、年级及统计数据
- 一键关注 / 取消关注

### 🏆 排行榜 `/leaderboard`
- **作品排行 TOP 10**：按点赞数排列最受欢迎的作品，附缩略图和作者
- **摄影师排行 TOP 10**：按总获赞数排列最受欢迎的摄影师
- **时间维度筛选**：支持本周、本月、所有时间三种范围
- 点击作品或摄影师可跳转至对应详情页

### 💬 私信 `/messages`
- 查看与所有用户的私信会话列表
- 显示对方头像、昵称、最后一条消息及时间
- 实时监听新消息，自动刷新会话列表（基于 Supabase Realtime）

### 💬 私信对话 `/messages/[conversationId]`
- 实时双向聊天界面
- 气泡式消息展示，区分发送方与接收方
- 输入框发送消息，支持回车键快速发送
- 基于 Supabase Realtime 实现实时消息推送

### 🏷️ 标签探索 `/tags`
- **标签词云**：以字体大小和透明度直观呈现标签热度
- **热门标签排行**：列出使用次数最多的标签（最多展示 40 个）
- 点击标签跳转至对应标签的作品列表

### 🏷️ 标签详情 `/tag/[name]`
- 展示某个标签下的所有作品
- 显示标签名称与作品总数

### 🖼️ 相册 `/album/[id]`
- 查看指定相册中的所有照片

---

## 快速开始

**前置条件：** Node.js 18+

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置环境变量，在项目根目录创建 `.env.local` 文件：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_项目_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的_Supabase_匿名密钥
   GEMINI_API_KEY=你的_Gemini_API_密钥
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```
   访问 [http://localhost:3000](http://localhost:3000) 查看应用。

4. 构建生产版本：
   ```bash
   npm run build
   npm run start
   ```

---

## 数据库结构（Supabase）

主要数据表如下：

| 表名 | 说明 |
|---|---|
| `user_profiles` | 用户扩展信息（昵称、简介、头像、学院、年级） |
| `photos` | 摄影作品（标题、描述、图片 URL、分类、地点、点赞数、评论数） |
| `photo_tags` | 作品与标签的关联关系 |
| `tags` | 标签列表 |
| `likes` | 用户点赞记录 |
| `comments` | 评论 |
| `follows` | 用户关注关系 |
| `conversations` | 私信会话 |
| `messages` | 私信消息 |
| `notifications` | 通知（点赞、评论、关注） |
