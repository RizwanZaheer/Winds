import async from 'async';
import stream from 'getstream';

import Pin from '../models/pin';

import config from '../config';
import logger from '../utils/logger';
import events from '../utils/events';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

exports.list = (req, res) => {
	const query = req.query || {};

	if (query.type == 'episode' || query.type == 'article') {
		let obj = {};
		obj[query.type] = { $exists: true };

		if (query.user) {
			obj['user'] = query.user;
		}

		Pin.find(obj)
			.then(pins => {
				res.json(pins);
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	} else {
		Pin.apiQuery(req.query)
			.then(pins => {
				res.json(pins);
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	}
};

exports.get = (req, res) => {
	if (req.params.pinId == 'undefined') {
		return res.sendStatus(404);
	}

	Pin.findById(req.params.pinId)
		.then(pin => {
			if (!pin) {
				return res.sendStatus(404);
			}

			res.json(pin);
		})
		.catch(err => {
			logger.error(err);
			res.status(422).send(err.errors);
		});
};

exports.post = async (req, res) => {
	const data = Object.assign({}, req.body, { user: req.user.sub }) || {};

	let type;
	let pin;

	if (data.hasOwnProperty('article')) {
		type = 'article';
	} else if (data.hasOwnProperty('episode')) {
		type = 'episode';
	} else {
		return res.status(422).send(err);
	}

	let obj = {
		user: data.user,
	};

	obj[type] = { $exists: true };
	obj[type] = data[type];

  	pin = await Pin.findOne(obj);

	if (pin) {
		return res.sendStatus(409);
	} else {
		try {
			pin = await Pin.create(data);
			pin = await Pin.findById(pin._id);

			console.log(pin);

			await client
				.feed('user', pin.user)
				.addActivity({
					actor: pin.user,
					verb: 'pin',
					object: pin._id,
					foreign_id: `pins:${pin._id}`,
					time: pin.createdAt,
				});

			await events({
				user: pin.user._id,
				email: pin.user.email.toLowerCase(),
				engagement: {
					label: 'pin',
					content: {
						foreign_id: `${type}:${pin[type]._id}`,
					},
				},
			});

			res.json(pin);
		} catch (e) {
			console.log(e);
		}
	}
};

exports.delete = (req, res) => {
	let pinId = req.params.pinId;
	Pin.findById(pinId)
		.then(pin => {
			if (!pin) {
				res.status(404).send(`Couldn't find pin with id ${pinId}`);
				return;
			} else if (pin.user._id != req.user.sub) {
				res.status(401).send(`User ${req.user.sub} is not the owner of pin ${pinId}`);
				return;
			} else {
				return Pin.remove({ _id: req.params.pinId }).then(() => {
					res.status(204).send(`Removed pin with id ${pinId}`);
				});
			}
		})
		.catch(err => {
			logger.error(err);
			res.status(422).send(err.errors);
		});
};
