# O que é o projeto?
O projeto é um sistema para o ensino de autonomia doméstica voltado para pessoas jovens, no sistema, os usuários poderão cadastrar aulas sobre temas variados de autonomia doméstica, que poderão ser vistas por outros usuários.
Este projeto está sendo desenvolvido como Trabalho de Conclusão de Curso do IFC Sombrio

## Como executar:
Faça um git clone;
Instale as dependências do projeto com ´´´npm install´´´
Crie um arquivo .env dentro de server contendo o MONGO_URI, um JWT_SECRET e a PORT
Execute a pasta server (back-end) e a pasta client (front-end) com ´´´npm start´´´
Para a funcionalidade de enviar emails e salvar imagens é necessário utilizar o Cloudinary e o Brevo então é necessário adicionar ao .env da pasta server os campos CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME e BREVO_API_KEY
O sistema está hospedado e é acessável pelo link: https://stack-mern-mauricio.vercel.app/

### Tecnologias utilizadas:
Para o front-end foi utilizado **React** 19.1.0
Para o back-end foram utilizados **Express** 5.1.0 e **NodeJS** 24.15.0
Para o banco de dados foi utilizado **MongoDB** armazenado com o serviço **MongoDB Atlas**
