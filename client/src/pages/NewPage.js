import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPage() {
    const [pages, setPages] = useState([]);
    const [bigContent, setBigContent] = useState('');
    const [smallContent, setSmallContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        const savedPages = sessionStorage.getItem('classPages');
        if (savedPages) {
            setPages(JSON.parse(savedPages));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('classPages', JSON.stringify(pages));
    }, [pages]);

    const addPage = () => {
        const newPage = {
            pageNumber: pages.length + 1,
            bigContent,
            smallContent,
            imageUrl,
            videoId
        };
        setPages([...pages, newPage]);
    };

    const handleNextPage = () => {
        if (pages.length < 10) {
            addPage();
            // Reset fields for the next page
            setBigContent('');
            setSmallContent('');
            setImageUrl('');
            setVideoId('');
        } else {
            alert("Você atingiu o limite de 10 páginas.");
        }
    };

    const handleFinish = () => {
        addPage();
        navigate('/new-class');
    };

    const handleCancel = () => {
        sessionStorage.removeItem('classPages');
        navigate('/'); // Or wherever the user should go
    };

    // JSX will be added later
    return null;
}
