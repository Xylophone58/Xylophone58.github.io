document.getElementById('searchButton').addEventListener('click', async () => {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase();
    const is3D = document.getElementById('is3D').checked;
    const isShiny = document.getElementById('isShiny').checked;
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
  
    // Determine the folder path for the image
    let folderPath = 'PokemonGifs/Pokemon Sprites';
    if (is3D && isShiny) {
      folderPath = 'PokemonGifs/3D Shiny Sprites';
    } else if (is3D) {
      folderPath = 'PokemonGifs/3D Sprites';
    } else if (isShiny) {
      folderPath = 'PokemonGifs/Shiny Pokemon Sprites';
    }
  
    // Construct the image path
    const imagePath = `${folderPath}/${pokemonName}.gif`;
  
    try {
      // Fetch Pokémon data from PokeAPI
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      if (!response.ok) {
        throw new Error('Pokémon not found!');
      }
      const data = await response.json();
  
      // Display Pokémon details along with the local image
      pokemonInfoDiv.innerHTML = `
        <h2>${data.name.toUpperCase()}</h2>
        <img src="${imagePath}" alt="${data.name}" onerror="this.onerror=null; this.src='error-image.png';">
        <p><strong>Type:</strong> ${data.types.map(type => type.type.name).join(', ')}</p>
        <p><strong>Abilities:</strong> ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
        <p><strong>Base Stats:</strong></p>
        <ul>
          ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
      `;
    } catch (error) {
      pokemonInfoDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
  });
  