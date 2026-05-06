

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewClass() { 
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [danger, setDanger] = useState('');
    const [dangerLevel, setDangerLevel] = useState('Baixo Risco');
    const [pages, setPages] = useState([]);
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const savedPages = sessionStorage.getItem('classPages');
        if (savedPages) {
            setPages(JSON.parse(savedPages));
        } else {
            // If there are no pages, maybe redirect back to the start
            navigate('/new-page');
        }
    }, [navigate]);

    const handleSubmitClass = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            setMensagem("Autenticação necessária.");
            return;
        }

        try {
            const response = await fetch('http://localhost:7777/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    subject,
                    danger,
                    dangerLevel,
                    pages
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensagem("Aula criada com sucesso!");
                sessionStorage.removeItem('classPages');
                setTimeout(() => navigate('/'), 2000); // Redirect after 2s
            } else {
                setMensagem(data.message || "Erro ao criar a aula.");
            }
        } catch (error) {
            console.error("Erro ao criar aula:", error);
            setMensagem("Ocorreu um erro na comunicação com o servidor.");
        }
    };

    // JSX will be added later
    return null;
}
