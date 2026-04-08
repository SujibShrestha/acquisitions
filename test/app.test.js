import app from '../src/app.js'

describe('API Endpoints',()=>{
    describe('GET /',()=>{
        it('should return api status',async()=>{
            const res = await request(app).get('/').expect(200)

            expect(response.body).toHaveProperty('status',"OK")
        })
    })
})