const Joi = require('joi');


// Schemas configurations
const signIn = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().pattern(/^[\w!@#$%^&*\+\-=]{8,20}$/).required(),
})

const id = Joi.object({
    id: Joi.number().integer(),
    user_id: Joi.number().integer(),
    artist_id: Joi.number().integer(),
    city_id: Joi.number().integer(),
    event_id: Joi.number().integer(),
    request_id: Joi.number().integer(),
})

const searchParams = Joi.object({
    size: Joi.number().integer(),
    pageNum: Joi.number().integer(),
    startsWith: Joi.string(),
    searchTerm: Joi.string(),
    artist: Joi.string(),
    city: Joi.string(),
    when: Joi.string(),
    tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
})

const user = Joi.object({
    id: Joi.number().integer().optional(),
    name: Joi.string().min(2).max(15).pattern(/^\w+(?:\s\w+)*$/).required(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().pattern(/^[\w!@#$%^&*\+\-=]{8,20}$/).required(),
    repeat_password: Joi.ref('password'),
    is_artist: Joi.number().min(0).max(1)
})

const artist = Joi.object({
    user_id: Joi.number().integer(),
    img_url: Joi.string().max(255), // .uri() ?
    bio: Joi.string().max(1000).allow(null).allow('').optional(),
    link_to_spotify: Joi.string().max(255).allow(null).allow('').optional(),
    link_to_instagram: Joi.string().max(255).allow(null).allow('').optional(),
    link_to_facebook: Joi.string().max(255).allow(null).allow('').optional(),
    link_to_youtube: Joi.string().max(255).allow(null).allow('').optional(),
})

const event = Joi.object({
    id: Joi.number().integer(),
    user_id: Joi.number().integer(),
    tour: Joi.string().max(50).allow(null, ''),
    date: Joi.date().min('now'),
    time: Joi.string().regex(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/),
    duration: Joi.number().integer().max(20160),
    venue_id: Joi.number().integer(),
    venueName: Joi.string().max(50).required(),
    cityName: Joi.string().max(50).allow('').optional(),
    city: Joi.string().max(50).allow('').optional(),
    description: Joi.string().max(1000).allow('').optional(),
    img_url: Joi.string().max(255).allow(null, ''), // .uri() ?
    artist_id: Joi.number().integer(),
    came_from_request_id: Joi.number().integer(),
    ticketseller_url: Joi.string().max(500),
    sold_out: Joi.number().min(0).max(1),
    city_id: Joi.number().integer(),
    tags: Joi.array().items(Joi.string().allow(null).allow('')),
})

const request = Joi.object({
    user_id: Joi.number().integer(),
    request_id: Joi.number().integer(),
    tour: Joi.string().max(50).allow(null, ''),
    city: Joi.string().max(50).allow('').optional(),
    cap: Joi.number().integer(),
})


module.exports = {
    signIn,
    id,
    searchParams,
    user,
    event,
    artist,
    request,
}