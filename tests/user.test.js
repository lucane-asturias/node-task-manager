const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./utils/db')

beforeEach(setupDatabase)
afterAll(async () => await mongoose.connection.close())

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Asturias',
        email: 'asturias@example.com',
        password: 'MyOtherPass456!!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(user.password).not.toBe('MyOtherPass456!!')
    expect(response.body).toMatchObject({
        user: {
            name: 'Asturias',
            email: 'asturias@example.com'
        },
        token: user.tokens[0].token
    })
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: 'thisisnotmyemail@hotmail.com',
        password: userOne.password
    }).expect(400)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/utils/profile-pic.jpg')
        .expect(200)
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name: 'Lucane' })
        .expect(200)
})

test('Should not delete if user unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send()
        .expect(401)
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name: 'Lucane' })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Lucane') 
})

test('Should not update if user unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({ name: 'Lucane' })
        .expect(401)
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ location: 'Mars' })
        .expect(400)
})

const invalidCases = [
    {
        description: 'invalid email',
        data: { name: 'Valid Name', email: 'notanemail', password: 'ValidPass123!' },
        field: 'email',
    },
    {
        description: 'invalid password (contains "password")',
        data: { name: 'Valid Name', email: 'valid@example.com', password: 'password123' },
        field: 'password',
    },
    {
        description: 'missing name',
        data: { name: '', email: 'valid@example.com', password: 'ValidPass123!' },
        field: 'name',
    },
    {
        description: 'negative age',
        data: { name: 'Valid Name', email: 'valid@example.com', password: 'ValidPass123!', age: -5 },
        field: 'age',
    },
]

test.each(invalidCases)(
    'Should not signup user with $description',
    async ({ data }) => {
        await request(app)
            .post('/users')
            .send(data)
            .expect(400)
    }
)

test.each(invalidCases)(
    'Should not update user with $description',
    async ({ field, data }) => {
        await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({ [field]: data[field] })
            .expect(400)
    }
)