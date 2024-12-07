document.getElementById('searchButton').addEventListener('click', async () => {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase();
    const is3D = document.getElementById('is3D').checked;
    const isShiny = document.getElementById('isShiny').checked;
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
  
    // Determine the folder path based on checkbox selections
    let folderPath = 'PokemonGifs/Pokemon Sprites';
    if (is3D && isShiny) {
      folderPath = 'PokemonGifs/3D Shiny Sprites';
    } else if (is3D) {
      folderPath = 'PokemonGifs/3D Sprites';
    } else if (isShiny) {
      folderPath = 'PokemonGifs/Shiny Pokemon Sprites';
    }
  
    try {
      // Check if the local image exists
      const imagePath = `${folderPath}/${pokemonName}.gif`;
  
      // Test if the image exists (can only be verified properly if running on a server)
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error('Pokémon sprite not found!');
      }
  
      // Display Pokémon sprite
      pokemonInfoDiv.innerHTML = `
        <h2>${pokemonName.toUpperCase()}</h2>
        <img src="${imagePath}" alt="${pokemonName}">
      `;
    } catch (error) {
      pokemonInfoDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
  });