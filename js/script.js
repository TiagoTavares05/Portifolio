"use strict";

const btnWhats = document.getElementById("btnWhats");

function Onclick(){
    event.preventDefault()
    const nome = document.getElementById("nome").value;
    const mensagem = document.getElementById("mensagem").value;
    const telefone = '5513991655339'
    
    const texto = `Olá! Me chamo ${nome}, ${mensagem}`
    const msgFormatada = encodeURIComponent(texto)
    
    const url = `https://wa.me/${telefone}/?text=${msgFormatada}`
    
    window.open(url, '_blank')
}

btnWhats.addEventListener("click", Onclick)