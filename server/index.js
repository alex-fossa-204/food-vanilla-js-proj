"use strict"
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require("pg");
const keys = require('./keys');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('connect', (client) => {
    client
        .query(`CREATE TABLE IF NOT EXISTS clients (
            id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
            client_name character varying(64),
            phone_number character varying(64),
            PRIMARY KEY (id)
        )`)
        .catch((error) => {console.error(error)});   
});

app.get('/user/all', async (request, response) => {
    const clientsQuery = await pgClient.query(`SELECT * FROM clients`);
    response.send(clientsQuery.rows);
});

app.get('/menu/all', async (request, response) => {
    const menusQuery = await pgClient.query(`SELECT * FROM menus`);
    response.send(menusQuery.rows);
});

app.post('/user/contact/populate', upload.none(), async (request, response) => {
    let formData = request.body;
    await pgClient.query(`INSERT INTO clients (client_name, phone_number)
            VALUES
            ('Alex', '+375331001010'),
            ('Anton', '+375331001011')
        `)
        .catch((error) => {console.error(error)});
    response.sendStatus(200);
});

app.post('/menu/populate', upload.none(), async (request, response) => {
    let formData = request.body;
    await pgClient.query(`CREATE TABLE IF NOT EXISTS menus (
        id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
        img character varying(64),
        altimg character varying(64),
        title character varying(64),
        descr character varying(512),
        price decimal,
        PRIMARY KEY (id)
    )`)
    .catch((error) => {console.log(error);});
    await pgClient.query(`INSERT INTO menus (img, altimg, title, descr, price)
            VALUES
            ('img/tabs/vegy.jpg', 'vegy', 'Меню Фитнес', 'Меню Фитнес - это новый подход к приготовлению блюд: больше свежих овощей и фруктов. Продукт активных и здоровых людей. Это абсолютно новый продукт с оптимальной ценой и высоким качеством!', 9),
            ('img/tabs/post.jpg', 'post', 'Меню Постное', 'Меню Постное - это тщательный подбор ингредиентов: полное отсутствие продуктов животного происхождения, молоко из миндаля, овса, кокоса или гречки, правильное количество белков за счет тофу и импортных вегетарианских стейков.', 14),
            ('img/tabs/elite.jpg', 'elite', 'Меню Премиум', 'В меню Премиум мы используем не только красивый дизайн упаковки, но и качественное исполнение блюд. Красная рыба, морепродукты, фрукты - ресторанное меню без похода в ресторан!', 21)
        `)
        .catch((error) => {console.error(error)});
    response.sendStatus(200);
});

app.post('/user/contact/add', upload.none(), async (request, response) => {
    let formData = request.body;
    console.log(formData);
    await pgClient.query(`INSERT INTO clients (client_name, phone_number) VALUES ('${formData.name}', '${formData.phone}')`);
    response.send(formData);
});

app.listen(5000, (error) => {
    console.log('Listening!');
});