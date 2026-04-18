// IMPORT?

import { Link } from "react-router-dom"

export default function Sidebar () {
    const blue = "#161E6B"
    const white = "#F0F0F0"
    const iconLogoStyle = {width: "80px", height: "auto", cursor: "pointer"}
    const iconConfigStyle = {width: "50px", height: "auto", cursor: "pointer"}
    const iconStyle = {width: "40px", height: "auto", cursor: "pointer"}
    return (
        <div
            style={{
                backgroundColor: blue,
                height: "100vh",
                width: "100px",
                position: "fixed",
                left: "0",
                top: "0"
            }}
            className="d-flex flex-column align-items-center"
        >
            <div className="mb-4 mt-4">
                <Link to="/">
                    <img src="/icons/logo.svg" alt="logo" style={iconLogoStyle} className=""/>
                </Link>
            </div>

            <div className="d-flex flex-column gap-4 align-items-center">
                <Link to="/perfil">
                    <img src="/icons/perfil.svg" alt="perfil" style={iconStyle} className=""/>
                </Link>
                <Link to="/">
                    <img src="/icons/caderno.svg" style={iconStyle} alt="criar aula" className=""/>
                </Link>
                <Link to="/">
                    <img src="/icons/lupa.svg" style={iconStyle} alt="pesquisar aula" className=""/>
                </Link>
            </div>

            <div className="d-flex flex-column gap-5 align-items-center mt-auto mb-4">
                <button className="bg-transparent p-0 border-0">
                    <img src="/icons/lua.svg" style={iconStyle} alt="modo escuro" className=""/>
                </button>
                <Link to="/">
                    <img src="/icons/config.svg" style={iconConfigStyle} alt="configurações" className=""/>
                </Link>
            </div>
        </div>
    )
}

