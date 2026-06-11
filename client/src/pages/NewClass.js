import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORT } from "dotenv";

const API_URL = `http://localhost:${PORT}/api/classes`;

function extrairIdYoutube(valor) {
    if (!valor) {
        return '';
    }

    const texto = valor.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(texto)) {
        return texto;
    }

    const match = texto.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

    return match ? match[1] : '';
}

function normalizarMidia(midia) {
    if (!midia || !midia.type) {
        return null;
    }

    if (midia.type === 'imagem') {
        if (!midia.arquivo) {
            throw new Error('Selecione um arquivo de imagem para a mídia escolhida');
        }

        return {
            type: 'imagem',
            value: midia.arquivo.name,
            arquivo: midia.arquivo,
        };
    }

    if (midia.type === 'youtube') {
        const videoId = extrairIdYoutube(midia.value);

        if (!videoId) {
            throw new Error('Informe uma URL ou ID válido do YouTube');
        }

        return {
            type: 'youtube',
            value: videoId,
        };
    }

    throw new Error('Tipo de mídia inválido');
}

export function useNewClassForm() {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [danger, setDanger] = useState('');
    const [dangerLevel, setDangerLevel] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [medias, setMidias] = useState([
        { type: 'imagem', arquivo: null, value: '' },
        { type: 'imagem', arquivo: null, value: '' },
    ]);

    const navigate = useNavigate();

    const atualizarMidia = (indice, dados) => {
        setMidias((estadoAtual) =>
            estadoAtual.map((midia, posicao) => {
                if (posicao !== indice) {
                    return midia;
                }

                return {
                    ...midia,
                    ...dados,
                };
            })
        );
    };

    const limparFormulario = () => {
        setTitle('');
        setSubject('');
        setDanger('');
        setDangerLevel('');
        setContent('');
        setMidias([
            { type: 'imagem', arquivo: null, value: '' },
            { type: 'imagem', arquivo: null, value: '' },
        ]);
    };

    const handleMediaTypeChange = (indice, type) => {
        atualizarMidia(indice, {
            type,
            arquivo: null,
            value: '',
        });
    };

    const handleMediaFileChange = (indice, arquivo) => {
        atualizarMidia(indice, {
            arquivo,
            value: arquivo ? arquivo.name : '',
            type: 'imagem',
        });
    };

    const handleMediaValueChange = (indice, value) => {
        atualizarMidia(indice, {
            value,
            type: 'youtube',
            arquivo: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const midiasNormalizadas = midias
                .map(normalizarMidia)
                .filter(Boolean);

            const formData = new FormData();

            formData.append('title', title);
            formData.append('subject', subject);
            formData.append('danger', danger);
            formData.append('dangerLevel', dangerLevel);
            formData.append('content', content);
            formData.append('midias', JSON.stringify(
                midiasNormalizadas.map(({ type, value }) => ({ type, value }))
            ));

            midiasNormalizadas.forEach((midia, indice) => {
                if (midia.type === 'imagem' && midia.arquivo) {
                    formData.append(`midia_${indice + 1}`, midia.arquivo);
                }
            });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const resData = await response.json();

            if (!response.ok) {
                return setMessage(resData.message || 'Erro ao publicar aula');
            }

            setMessage('Aula publicada com sucesso');
            limparFormulario();
            navigate('/');
        } catch (error) {
            console.log(error);
            setMessage(error.message || 'Erro ao conectar com o servidor');
        }
    };

    return {
        title,
        setTitle,
        subject,
        setSubject,
        danger,
        setDanger,
        dangerLevel,
        setDangerLevel,
        content,
        setContent,
        message,
        midias,
        handleMediaTypeChange,
        handleMediaFileChange,
        handleMediaValueChange,
        handleSubmit,
        limparFormulario,
    };
}

export default function NewClass() { 
    useNewClassForm();
    return null;
}
