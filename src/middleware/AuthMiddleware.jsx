import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AuthMiddleware = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:3000/api/auth/verify', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data.isAuthenticated) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // hoặc component loading của bạn
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AuthMiddleware; 