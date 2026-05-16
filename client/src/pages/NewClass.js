import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORT } from '@/server/.env';

export default function NewClass() { 
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [danger, setDanger] = useState('');
    const [dangerLevel, setDangerLevel] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const token = localStorage.getItem('token');

            //manda pro controlador
            const response = await fetch('http://localhost:${PORT}/api/classes', {
                method: "POST",
                headers: {
                    'Content-Type': "aplication/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title,
                    subject: subject,
                    danger: danger,
                    dangerLevel: dangerLevel,
                    content: content,
                }),
            })

            const resData = await response.json()

            if (!response.ok) {
                return setMessage(resData.message || "Erro ao publicar aula")
            }
            setMessage("Aula publicada com sucesso")

            setTitle("")
            setSubject("")
            setDanger("")
            setDangerLevel("")
            setContent("")

            navigate("/")
        } catch (error) {
            console.log(error)
            setMensagem("Erro ao conectar com o servidor")
        }
    }
    // JSX will be added later
    return null;
}
