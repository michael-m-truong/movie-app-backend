const db = require('./db')
const request = require('supertest')
const app = require('../app')


beforeAll(async () => await db.connect())
//afterEach(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

describe('auth test', () => {

    it('register test', async () => {
        return request(app)
            .post("/auth/register/")
            .set('Accept', 'application/json')
            .send({username: "Test123", password: "abc123"})
            .expect(201)
            .expect("Content-Type", /json/)
    })

    it('existing username register test', async () => {
        return request(app)
            .post("/auth/register/")
            .set('Accept', 'application/json')
            .send({username: "Test123", password: "abc123"})
            .expect(500)
            .expect("Content-Type", /json/)
    })

    
    it('pass doesnt match login test', async () => {
        return request(app)
            .post("/auth/login/")
            .set('Accept', 'application/json')
            .send({username: "Test123", password: "test"})
            .expect(401)
            .expect("Content-Type", /json/)
    })

    it('user and pass doesnt match login test', async () => {
        return request(app)
            .post("/auth/login/")
            .set('Accept', 'application/json')
            .send({username: "test", password: "test"})
            .expect(404)
            .expect("Content-Type", /json/)
    })

    it('username not found login test', async () => {
        return request(app)
            .post("/auth/login/")
            .set('Accept', 'application/json')
            .send({username: "test", password: "abc123"})
            .expect(404)
            .expect("Content-Type", /json/)
    }) 

    it('login test', async () => {
        return request(app)
            .post("/auth/login/")
            .set('Accept', 'application/json')
            .send({username: "Test123", password: "abc123"})
            .expect(200)  //test
            .expect("Content-Type", /json/)
    }) 
})
