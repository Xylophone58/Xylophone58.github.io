let previousSearches = []; // Array to store previous searches
let currentPokemonName = ''; // To store the name of the currently displayed Pokémon

const nameMapping = {
  'zygarde-50': 'zygarde',
  'charizard-mega-x': 'charizard-megax',
  'charizard-mega-y': 'charizard-megay',
  'mewtwo-mega-x': 'mewtwo-megax',
  'mewtwo-mega-y': 'mewtwo-megay',
  'chien-pao': 'chienpao',
};

// Event listener for the "Search Pokémon" button
document.getElementById('newSearchButton').addEventListener('click', () => {
  const pokemonName = document.getElementById('pokemonName').value.toLowerCase();

  if (pokemonName && !previousSearches.includes(pokemonName)) {
    previousSearches.push(pokemonName);
    updateSearchList();
  }

  performSearch(pokemonName);
});

// Function to update the list of previous searches
function updateSearchList() {
  const searchList = document.getElementById('searchList');
  searchList.innerHTML = ''; // Clear the list

  previousSearches.forEach((search) => {
    const listItem = document.createElement('li');
    listItem.textContent = search.toUpperCase();
    listItem.classList.add('search-item');
    listItem.addEventListener('click', () => performSearch(search)); // Re-perform search on click
    searchList.appendChild(listItem);
  });
}

// Function to perform a Pokémon search
async function performSearch(pokemonName) {
  if (!pokemonName) return;

  currentPokemonName = pokemonName; // Store the name of the current Pokémon
  const pokemonInfoDiv = document.getElementById('pokemonInfo');

  try {
    // Fetch Pokémon data from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!response.ok) {
      throw new Error('Pokémon not found!');
    }
    const data = await response.json();

    // Display Pokémon details (excluding the GIF for now)
    pokemonInfoDiv.innerHTML = `
      <h2>${data.name.toUpperCase()}</h2>
      <img id="pokemonGif" alt="${data.name}" class="pokemon-gif">
      <div id="pokemonTypes" class="pokemon-types"></div> <!-- Placeholder for types -->
      <p><strong>Abilities:</strong> ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
      <p><strong>Base Stats:</strong></p>
      <ul>
        ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
      </ul>
    `;

    // Update the Pokémon types to display images
    updateTypeImages(data.types);

    // Update the GIF based on the checkboxes
    updateImage(pokemonName);
  } catch (error) {
    pokemonInfoDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}

// Function to display type images
function updateTypeImages(types) {
  const typeContainer = document.getElementById('pokemonTypes');
  typeContainer.innerHTML = ''; // Clear any existing type images

  types.forEach((typeInfo) => {
    const typeName = typeInfo.type.name; // Get the type name from PokeAPI
    const img = document.createElement('img'); // Create an image element
    img.src = `PokemonGifs/Types/${typeName.charAt(0).toUpperCase() + typeName.slice(1)}.png`; // Construct the image path
    img.alt = typeName; // Set alt text for accessibility
    img.classList.add('type-icon'); // Add a CSS class for styling
    typeContainer.appendChild(img); // Append the image to the container
  });
}

// Function to dynamically update the Pokémon GIF based on the checkboxes
function updateImage(pokemonName) {
  const is3D = document.getElementById('is3D').checked;
  const isShiny = document.getElementById('isShiny').checked;

  // Check if the Pokémon name needs to be mapped
  const gifName = nameMapping[pokemonName] || pokemonName;

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
  const imagePath = `${folderPath}/${gifName}.gif`;
  const pokemonGif = document.getElementById('pokemonGif');

  // Update the image source
  if (pokemonGif) {
    pokemonGif.src = imagePath;
    pokemonGif.onerror = () => {
      pokemonGif.src = 'error-image.png'; // Fallback in case the GIF is not found
    };
  }
}

// Ensure the GIF updates when checkboxes are clicked
document.getElementById('is3D').addEventListener('change', () => {
  if (currentPokemonName) {
    updateImage(currentPokemonName); // Update the image with the current checkbox state
  }
});

document.getElementById('isShiny').addEventListener('change', () => {
  if (currentPokemonName) {
    updateImage(currentPokemonName); // Update the image with the current checkbox state
  }
});
