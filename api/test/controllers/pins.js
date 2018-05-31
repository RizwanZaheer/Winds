import { expect, request } from 'chai'
import jwt from 'jsonwebtoken';

import api from '../../src/server';
import pins from '../../src/controllers/pin';
import Pin from '../../src/models/pin';
import User from '../../src/models/user';
import RSS from '../../src/models/rss';
import Article from '../../src/models/article';

import config from '../../src/config';

import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';

describe.only('Pins controller', () => {
    describe('create', () => {
        describe('respond with a valid request', () => {
            let user;

            const token = jwt.sign(
                {
                    email: 'test+test@test.com',
                    sub: '5b0f306d8e147f10f16aceaf',
                },
                config.jwt.secret,
            );

            const objectId = '5b0ad37226dc3db38194e5eb';

            before(async () => {
                expect(await Pin.find({ article: { $exists: true, } })).to.be.empty;
                expect(await Pin.find({ episode: { $exists: true, } })).to.be.empty;

                user = await User.create({
                    email: 'test+test+test@test.com',
                    username: 'test',
                    password: 'test',
                    name: 'Test'
                });

                await loadFixture('initialData');
            });

            it('should create a new article pin', async () => {
                let res = await request(api).post('/pins').set('Authorization', `Bearer ${token}`).send({
                    article: objectId,
                });

                expect(res).to.have.status(200);
            });

            it('should create a new episode pin', async () => {
                let res = await request(api).post('/pins').set('Authorization', `Bearer ${token}`).send({
                    episode: objectId,
                });

                expect(res).to.have.status(200);
            });

        });
    });

});
