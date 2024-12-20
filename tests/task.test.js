const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const Task = require('../src/models/task')

const { userOneId, userOne, setupDatabase } = require('./utils/db')

beforeEach(setupDatabase)
afterAll(async () => await mongoose.connection.close())

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ description: 'Test', completed: true })
        .expect(201)
    
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.description).toBe('Test')
    expect(task.completed).toBe(true)
})