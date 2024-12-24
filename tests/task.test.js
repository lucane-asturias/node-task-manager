const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const Task = require('../src/models/task')

const { userOne, userTwo, taskOne, setupDatabase } = require('./utils/db')

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

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should fetch user task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const tasks = response.body
    expect(tasks.every(task => task.completed === true)).toBe(true)
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const tasks = response.body
    expect(tasks.every(task => task.completed === false)).toBe(true)
})

test('Should delete user task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test('Should not delete task if unaunthenticated', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not allow current user to delete tasks created by another user', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not allow current user to update other users task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({ description: 'not allowed' })
        .expect(404)
})

const invalidCases = [
    {
        description: 'invalid description',
        data: { description: '', completed: false },
        field: 'description'
    },
    {
        description: 'invalid completed',
        data: { description: 'Valid description', completed: '' },
        field: 'completed',
    }
]

test.each(invalidCases)(
    'Should not create task with $description',
    async ({ field, data }) => {
        await request(app)
            .post(`/tasks`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({ [field]: data[field] })
            .expect(400)
    }
)

test.each(invalidCases)(
    'Should not update task with $description',
    async ({ field, data }) => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({ [field]: data[field] })
            .expect(400)
    }
)

test.each([
    { sortBy: 'description:asc', expectedOrder: ['First task', 'Second task', 'Third task'] },
    { sortBy: 'description:desc', expectedOrder: ['Third task', 'Second task', 'First task'] },
    { sortBy: 'completed:asc', expectedOrder: ['First task', 'Second task', 'Third task'] },
    { sortBy: 'completed:desc', expectedOrder: ['Second task', 'Third task', 'First task'] },
    { sortBy: 'createdAt:asc', expectedOrder: ['First task', 'Second task', 'Third task'] },
    { sortBy: 'createdAt:desc', expectedOrder: ['Third task', 'Second task', 'First task'] },
    { sortBy: 'updatedAt:asc', expectedOrder: ['First task', 'Second task', 'Third task'] },
    { sortBy: 'updatedAt:desc', expectedOrder: ['Third task', 'Second task', 'First task'] }
])(
    'Should sort tasks by $sortBy',
    async ({ sortBy, expectedOrder }) => {
        const response = await request(app)
            .get(`/tasks?sortBy=${sortBy}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
        const taskDescriptions = response.body.map(task => task.description)
        expect(taskDescriptions).toEqual(expectedOrder)
    }
)

test('Should fetch page of tasks with limit and skip', async () => {
    const limit = 2
    const skip = 1
   
    const response = await request(app)
        .get(`/tasks?limit=${limit}&skip=${skip}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body).toHaveLength(limit)
   
    const taskDescriptions = response.body.map(task => task.description)
    const expectedDescriptions = ['Second task', 'Third task']
    expect(taskDescriptions).toEqual(expectedDescriptions)

    const responseWithExcessSkip = await request(app)
        .get(`/tasks?limit=${limit}&skip=1000`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(responseWithExcessSkip.body).toHaveLength(0)
})