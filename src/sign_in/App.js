import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './sign_in/AuthForm'; // Đường dẫn tương ứng với vị trí của tệp AuthForm.jsx
import MenuLayout from './MenuLayout'; // Đường dẫn tương ứng với vị trí của tệp MenuLayout.jsx
import './sign_in/style.css'; // Đảm bảo tệp CSS đã được tạo

function App() {
    const [isLogin, setIsLogin] = useState(false); // Mặc định là false để hiển thị trang đăng ký đầu tiên

    useEffect(() => {
        // Kiểm tra localStorage để duy trì trạng thái đăng nhập
        const loginStatus = localStorage.getItem('isLogin');
        if (loginStatus === 'true') {
            setIsLogin(true); // Nếu đã đăng nhập, thiết lập isLogin là true
        }
    }, []);

    // Cập nhật trạng thái đăng nhập và lưu vào localStorage
    const handleLoginSuccess = () => {
        setIsLogin(true);
        localStorage.setItem('isLogin', 'true'); // Lưu trạng thái đăng nhập
    };

    return (
        <Router>
            <Routes>
                {/* Route cho AuthForm */}
                <Route path="/" element={<AuthForm isLogin={isLogin} setIsLogin={handleLoginSuccess} />} />
                
                {/* Route cho MenuLayout, chuyển hướng nếu chưa đăng nhập */}
                <Route path="/menu" element={isLogin ? <MenuLayout /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
