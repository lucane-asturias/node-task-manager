const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/USER')

const userOne = {
    name: 'Lucas',
    email: 'lucas@example.com',
    password: 'MyPass123!!'
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Asturias',
        email: 'asturias@example.com',
        password: 'MyOtherPass456!!'
    }).expect(201)
})

test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: 'thisisnotmyemail@hotmail.com',
        password: userOne.password
    }).expect(400)
})