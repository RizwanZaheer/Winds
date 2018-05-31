import { expect, request } from 'chai';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import Pin from '../../src/models/pin';

let withLogin = async (r) => {
	let res = await request(api).post('/auth/login').send({
		email: 'valid@email.com',
		password: 'valid_password',
	});
	const authToken = res.body.jwt
	return r.set('Authorization', `Bearer ${authToken}`)
};

describe('Pins controller', () => {
    let pin;

	before(async () => {
		//await loadFixture('example');
		await loadFixture('pins');

        pin = await Pin.findOne({});

        console.log(pin);
		//expect(pin).to.not.be.null;
		//expect(pin.article).to.not.be.null;
	});

	describe('get', () => {
		it('should return the correct pin via /pins/:pinId', async () => {
			let res = await withLogin(
				request(api).get(`/pins/${pin._id}`)
			);
			expect(res).to.have.status(200);
		});
	});

	// describe('get parsed article', () => {
	// 	it('should return the parsed version of the article', async () => {
	// 		let res = await withLogin(
	// 			request(api).get(`/articles/${article.id}?type=parsed`)
	// 		);
	// 		expect(res).to.have.status(200);
	// 	});
	// });
    //
	// describe('list', () => {
	// 	it('should return the list of pins', async () => {
	// 		let res = await withLogin(
	// 			request(api).get('/pins')
	// 		);
	// 		expect(res).to.have.status(200);
	// 	});
	// });

});

// describe.only('Pins', () => {
//     describe('controller', () => {
//         let user;
//
//         const token = jwt.sign(
//             {
//                 email: 'test+test@test.com',
//                 sub: '5b0f306d8e147f10f16aceaf',
//             },
//             config.jwt.secret,
//         );
//
//         const objectId = '5b0ad37226dc3db38194e5eb';
//
//         before(async () => {
//             expect(await Pin.find({ article: { $exists: true, } })).to.be.empty;
//             expect(await Pin.find({ episode: { $exists: true, } })).to.be.empty;
//
//             user = await User.create({
//                 email: 'test+test+test@test.com',
//                 username: 'test',
//                 password: 'test',
//                 name: 'Test'
//             });
//
//             await loadFixture('initialData');
//         });
//
//         it('should create a new article pin', async () => {
//             let res = await request(api).post('/pins').set('Authorization', `Bearer ${token}`).send({
//                 article: objectId,
//             });
//
//             expect(res).to.have.status(200);
//         });
//
//         it('should create a new episode pin', async () => {
//             let res = await request(api).post('/pins').set('Authorization', `Bearer ${token}`).send({
//                 episode: objectId,
//             });
//
//             expect(res).to.have.status(200);
//         });
//
//         it('should get all article pins', async () => {
//             let res = await request(api).get('/pins').set('Authorization', `Bearer ${token}`).query({
//                 type: 'article',
//             });
//
//             expect(res).to.have.status(200);
//         });
//
//         it('should get all episode pins', async () => {
//             let res = await request(api).get('/pins').set('Authorization', `Bearer ${token}`).query({
//                 type: 'episode',
//             });
//
//             expect(res).to.have.status(200);
//         });
//
//         it('should get all pins with a limit of 2', async () => {
//             let res = await request(api).get('/pins').set('Authorization', `Bearer ${token}`).query({
//                 limit: 2
//             });
//
//             expect(res).to.have.status(200);
//         });
//
//     });
//
// });
