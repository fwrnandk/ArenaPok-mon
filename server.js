const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/pokemon/:name', async (req, res) => {
    try {
        const name = req.params.name.toLowerCase();
        
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        
        // Verificação de segurança: se o Pokémon não existir na API
        if (!pokeRes.ok) {
            return res.status(404).json({ error: "Este Pokémon não existe na Pokédex!" });
        }

        const pokeData = await pokeRes.json();

        const speciesRes = await fetch(pokeData.species.url);
        const speciesData = await speciesRes.json();

        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        const result = {
            name: pokeData.name,
            image: pokeData.sprites.front_default,
            hp: pokeData.stats[0].base_stat,
            attack: pokeData.stats[1].base_stat,
            evolutions: []
        };

        let current = evoData.chain;
        while (current) {
            result.evolutions.push(current.species.name);
            
            current = current.evolves_to[0]; 
        }

        res.json(result);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: "Erro interno no laboratório!" });
    }
});

app.listen(PORT, () => console.log(`Laboratório rodando em http://localhost:${PORT}`));