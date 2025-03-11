import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminDashboard.module.css";  
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5001/api/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (err) {
                setError("Ошибка при загрузке пользователей");
            }
        };
        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload(); // Принудительное обновление страницы
    };
    return (
        <div className={styles.adminDashboard}>
            <h1>Панель администратора</h1>
            <div className={styles.adminTableContainer}>
                {error && <p className={styles.error}>{error}</p>}
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Админ</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.phone_number}</td>
                                <td>{user.is_admin ? "Да" : "Нет"}</td>
                                <td>
                                <button className={styles.logOutButton} onClick={handleLogout}>Выйти</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;