const State = require('../models/State');
const statesData = require('../data/statesData.json');

const findState = (code) => 
{
    return statesData.find(state => state.code === code);
};

const addFunFacts = async (state) => 
{
    const mongoState = await State.findOne({ stateCode: state.code });

    return {
        ...state,
        funfacts: mongoState?.funfacts || []
    };
};

const getAllStates = async (req, res) => 
{
    const mongoStates = await State.find();

    let states = statesData.map(state => {
        const mongoState = mongoStates.find(item => item.stateCode === state.code);

        return {
            ...state,
            funfacts: mongoState?.funfacts || []
        };
    });

    if (req.query.contig === 'true') 
    {
        states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    }

    if (req.query.contig === 'false') 
    {
        states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    res.json(states);
};

const getState = async (req, res) => 
{
    const state = findState(req.code);
    res.json(await addFunFacts(state));
};

const getRandomFunFact = async (req, res) => 
{
    const state = findState(req.code);
    const mongoState = await State.findOne({ stateCode: req.code });

    if (!mongoState || mongoState.funfacts.length === 0) 
    {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const randomIndex = Math.floor(Math.random() * mongoState.funfacts.length);

    res.json({ funfact: mongoState.funfacts[randomIndex] });
};

const createFunFacts = async (req, res) => 
{
    const { funfacts } = req.body;

    if (!funfacts) 
    {
        return res.status(400).json({ message: 'State fun facts value required' });
    }

    if (!Array.isArray(funfacts)) 
    {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    const updatedState = await State.findOneAndUpdate(
        { stateCode: req.code },
        { $push: { funfacts: { $each: funfacts } } },
        { new: true, upsert: true }
    );

    res.json(updatedState);
};

const updateFunFact = async (req, res) => 
{
    const { index, funfact } = req.body;
    const state = findState(req.code);

    if (!index) 
    {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    if (!funfact) 
    {
        return res.status(400).json({ message: 'State fun fact value required' });
    }

    const mongoState = await State.findOne({ stateCode: req.code });

    if (!mongoState || mongoState.funfacts.length === 0) 
    {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const arrayIndex = index - 1;

    if (arrayIndex < 0 || arrayIndex >= mongoState.funfacts.length) 
    {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    mongoState.funfacts[arrayIndex] = funfact;
    res.json(await mongoState.save());
};

const deleteFunFact = async (req, res) => 
{
    const { index } = req.body;
    const state = findState(req.code);

    if (!index) 
    {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    const mongoState = await State.findOne({ stateCode: req.code });

    if (!mongoState || mongoState.funfacts.length === 0) 
    {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const arrayIndex = index - 1;

    if (arrayIndex < 0 || arrayIndex >= mongoState.funfacts.length) 
    {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    mongoState.funfacts.splice(arrayIndex, 1);
    res.json(await mongoState.save());
};

const getCapital = (req, res) => 
{
    const state = findState(req.code);

    res.json({
        state: state.state,
        capital: state.capital_city
    });
};

const getNickname = (req, res) => 
{
    const state = findState(req.code);

    res.json({
        state: state.state,
        nickname: state.nickname
    });
};

const getPopulation = (req, res) => 
{
    const state = findState(req.code);

    res.json({
        state: state.state,
        population: state.population.toLocaleString()
    });
};

const getAdmission = (req, res) => 
{
    const state = findState(req.code);

    res.json({
        state: state.state,
        admitted: state.admission_date
    });
};

module.exports = {
    getAllStates,
    getState,
    getRandomFunFact,
    createFunFacts,
    updateFunFact,
    deleteFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission
};