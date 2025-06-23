let previousSearches = []; // Array to store previous searches
let currentPokemonName = ''; // To store the name of the currently displayed Pokémon
let currentBasePokemonName = ''; // Base species name (without mega form)
let megaFormsList = []; // Available special forms (mega, gmax, regional) for the current Pokémon
let currentFormIndex = 0; // Index to keep track of which form is displayed

const nameMapping = {
  'zygarde-50': 'zygarde',
  'charizard-mega-x': 'charizard-megax',
  'charizard-mega-y': 'charizard-megay',
  'mewtwo-mega-x': 'mewtwo-megax',
  'mewtwo-mega-y': 'mewtwo-megay',
  'chien-pao': 'chienpao',
  'darmanitan-galar-zen': 'darmanitan-galarzen',
};

const formKeywords = ['mega', 'gmax', 'alola', 'galar', 'hisui', 'paldea'];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatDisplayName(name) {
  const parts = name.split('-');
  const base = capitalize(parts[0]);

  if (parts.includes('mega')) {
    const idx = parts.indexOf('mega');
    const extra = parts.slice(idx + 1).map(capitalize).join(' ');
    return `Mega ${base}${extra ? ' ' + extra : ''}`;
  }

  if (parts.includes('gmax')) {
    return `Gigantamax ${base}`;
  }

  const regions = { alola: 'Alolan', galar: 'Galarian', hisui: 'Hisuian', paldea: 'Paldean' };
  for (const [region, label] of Object.entries(regions)) {
    const idx = parts.indexOf(region);
    if (idx !== -1) {
      const extra = parts.slice(idx + 1).map(capitalize).join(' ');
      return `${label} ${base}${extra ? ' ' + extra : ''}`;
    }
  }

  return parts.map(capitalize).join(' ');
}

document.addEventListener('DOMContentLoaded', () => {
  const savedSearches = localStorage.getItem('previousSearches');
  if (savedSearches) {
    previousSearches = JSON.parse(savedSearches); // Parse the JSON string into an array
    updateSearchList(); // Update the search list visually
  }
});

document.getElementById('clearSearches').addEventListener('click', () => {
  previousSearches = [];
  localStorage.removeItem('previousSearches');
  updateSearchList();
});


// Event listener for the "Search Pokémon" button
document.getElementById('newSearchButton').addEventListener('click', () => {
  const pokemonName = document.getElementById('pokemonName').value.toLowerCase();

  if (pokemonName && !previousSearches.includes(pokemonName)) {
    previousSearches.push(pokemonName); // Add to the search list
    saveSearches(); // Save the updated list to localStorage
    updateSearchList(); // Update the search list visually
  }

  performSearch(pokemonName); // Perform the search
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

// Function to save the searches to localStorage
function saveSearches() {
  localStorage.setItem('previousSearches', JSON.stringify(previousSearches)); // Save the array as a JSON string
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

    // Fetch species data to determine mega evolutions
    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();
    currentBasePokemonName = speciesData.name;
    megaFormsList = speciesData.varieties
      .map(v => v.pokemon.name)
      .filter(name => formKeywords.some(k => name.includes(k)));
    const forms = [currentBasePokemonName, ...megaFormsList];
    currentFormIndex = forms.indexOf(data.name);
    setupMegaToggle();


    // Display Pokémon details (excluding the GIF for now)
    pokemonInfoDiv.innerHTML = `
      <h2>${formatDisplayName(data.name)}</h2>
      <img id="pokemonGif" alt="${formatDisplayName(data.name)}" class="pokemon-gif">
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
    updateImage(currentPokemonName);
  } catch (error) {
    pokemonInfoDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}

// Function to dynamically update the Pokémon GIF based on the checkboxes
function updateImage(pokemonName) {
  pokemonName = nameMapping[pokemonName] || pokemonName;
  const is3D = document.getElementById('is3D').checked;
  const isShiny = document.getElementById('isShiny').checked;

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
  const pokemonGif = document.getElementById('pokemonGif');
  const pokemonInfoDiv = document.getElementById('pokemonInfo');

  // Update the image source
  if (pokemonGif) {
    pokemonGif.src = imagePath;

    // Handle GIF loading errors
    pokemonGif.onerror = () => {
      pokemonGif.src = ''; // Clear the image

      // Check if an error message already exists
      if (!document.getElementById('gifError')) {
        const errorMessage = document.createElement('p');
        errorMessage.id = 'gifError'; // Unique ID to avoid duplicates
        errorMessage.style.color = 'red';
        errorMessage.textContent = `Error: GIF not found for "${pokemonName}".`;
        pokemonInfoDiv.appendChild(errorMessage);
      }
    };

    // Remove the error message if the image loads successfully
    pokemonGif.onload = () => {
      const existingError = document.getElementById('gifError');
      if (existingError) {
        existingError.remove();
      }
    };
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

function setupMegaToggle() {
  const toggleBtn = document.getElementById('toggleMega');
  if (!toggleBtn) return;

  if (megaFormsList.length === 0) {
    toggleBtn.style.display = 'none';
    return;
  }

  toggleBtn.style.display = 'inline-block';
  toggleBtn.textContent = 'Next Form';
  toggleBtn.onclick = () => {
    const forms = [currentBasePokemonName, ...megaFormsList];
    currentFormIndex = (currentFormIndex + 1) % forms.length;
    performSearch(forms[currentFormIndex]);
  };
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