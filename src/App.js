import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './sign_in/AuthForm';
import MenuLayout from './menu/MenuLayout';
import AuthMiddleware from './middleware/AuthMiddleware';

function App() {
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    return (
        <Routes>
            <Route 
                path="/" 
                element={<AuthForm />} 
            />
            <Route 
                path="/login" 
                element={<AuthForm />} 
            />
            <Route 
                path="/menu/*" 
                element={
                    <AuthMiddleware>
                        <MenuLayout onLogout={handleLogout} />
                    </AuthMiddleware>
                } 
            />
        </Routes>
    );
}

export default App;
