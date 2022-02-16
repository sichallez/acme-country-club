const { UUIDV4, UUID } = require('sequelize');
const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || "postgres://localhost/acme_country_club");
const STRING = Sequelize.STRING;

const Member = db.define('member', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: STRING(20),
        UNIQUE: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

const Facility = db.define('facility', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: STRING(20),
        UNIQUE: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

const Booking = db.define('booking', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    }
});

Member.belongsTo(Member, {as: 'sponsor'});
Booking.belongsTo(Member, {as: 'booker'});
Booking.belongsTo(Facility, {as: 'facility'});
//Member.hasMany(Booking);
Facility.hasMany(Booking);

const express = require('express');
const app = express();

app.get('/api/facilities', async(req, res, next) => {
    const facilities = await Facility.findAll({
        include: [
            { model: Booking}
        ]
    });
    // console.log(facilities);
    res.send(facilities);
});

app.get('/api/members', async(req, res, next) => {
    const members = await Member.findAll({
        include: [
            { model: Member, as: 'sponsor'}
        ]
    });
    //console.log(members);
    res.send(members);
});

const init = async() => {
    await db.sync({ force: true });
    const lucy = await Member.create({ name: 'lucy' });
    const moe = await Member.create({ name: 'moe', sponsorId: lucy.id});
    await Member.create({ name: 'ethyl', sponsorId: moe.id });
    await Member.create({ name: 'larry', sponsorId: lucy.id });
    const tennis = await Facility.create({ name: 'tennis' });
    const pingpong = await Facility.create({ name: 'pingpong' });
    const marbles = await Facility.create({ name: 'marbles' });
    await Booking.create({ bookerId: lucy.id, facilityId: marbles.id});
    await Booking.create({ bookerId: lucy.id, facilityId: marbles.id});
    await Booking.create({ bookerId: moe.id, facilityId: tennis.id});

    const port = process.env.PORT || 1338;
    app.listen(port, () => `listen on port ${port} ...`);
};

init();