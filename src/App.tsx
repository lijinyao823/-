import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Loading from './components/Loading';

/**
 * 1. 路由懒加载定义
 */
const Home = lazy(() => import('./pages/Home'));
const Detail = lazy(() => import('./pages/Detail'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login')); // 新增：引入登录页面
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Router>
      {/* MainLayout 包含了 Navbar 和 Footer。
        我们在 Navbar 里可以增加一个“登录/个人中心”的按钮。
      */}
      <MainLayout>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* 首页：摄影作品瀑布流 */}
            <Route path="/" element={<Home />} />

            {/* 详情页：查看照片大图及参数 */}
            <Route path="/photo/:id" element={<Detail />} />

            {/* 登录页：账号注册与登录入口 */}
            <Route path="/login" element={<Login />} />

            {/* 个人中心：管理我的作品。
                后续我们可以增加逻辑：如果未登录访问此页面，自动重定向到 /login 
            */}
            <Route path="/profile" element={<Profile />} />

            {/* 404 页面 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}