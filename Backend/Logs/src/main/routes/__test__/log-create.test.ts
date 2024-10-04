import request from "supertest";
import { app } from "../../../app";

it('Returns 201 on successful create log', async ()=>{
   return request(app).post('/api/v2/logs/create')
                     .send({
                        source: 'logs',
                        description: 'Some useless log'
                     })
                     .expect(201);
})