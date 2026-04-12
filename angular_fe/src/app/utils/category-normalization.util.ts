/**
 * @category Utils
 * 
 * @description Normalization map to convert internal advertisement types to
 * user-friendly frontend display paths.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * Example:
 * Internal: "advertisement_sports_fitness"
 * Frontend: "Marketplace/Sports/Fitness"
 *
 * This ensures that while the system operates on normalized types
 * internally (for filtering, API calls, etc.), users see a friendly
 * path in the UI.
 */
export const normalizationMap: { [key: string]: string } = {
  advertisement_sports_fitness: 'Marketplace/Sports/Fitness',
  advertisement_sports_camping: 'Marketplace/Sports/Camping',
  advertisement_sports_water: 'Marketplace/Sports/Water',
  advertisement_sports_bikes: 'Marketplace/Sports/Bikes',

  advertisement_home_appliances: 'Marketplace/Home/Appliances',
  advertisement_home_decor: 'Marketplace/Home/Decor',
  advertisement_home_garden: 'Marketplace/Home/Garden',
  advertisement_home_furniture: 'Marketplace/Home/Furniture',

  advertisement_clothing_kids_baby: 'Marketplace/Clothing/Kids/Baby',
  advertisement_clothing_kids_teen: 'Marketplace/Clothing/Kids/Teen',
  advertisement_clothing_kids_kidshoes: 'Marketplace/Clothing/Kids/Kidshoes',
  advertisement_clothing_kids_child: 'Marketplace/Clothing/Kids/Child',

  advertisement_clothing_men_jackets: 'Marketplace/Clothing/Men/Jackets',
  advertisement_clothing_men_shoes: 'Marketplace/Clothing/Men/Shoes',
  advertisement_clothing_men_tshirts: 'Marketplace/Clothing/Men/Tshirts',
  advertisement_clothing_men_trousers: 'Marketplace/Clothing/Men/Trousers',
  advertisement_clothing_women_skirts: 'Marketplace/Clothing/Women/Skirts',
  advertisement_clothing_women_bags: 'Marketplace/Clothing/Women/Bags',
  advertisement_clothing_women_dresses: 'Marketplace/Clothing/Women/Dresses',
  advertisement_clothing_women_shoes: 'Marketplace/Clothing/Shoes',

  advertisement_art_books: 'Marketplace/Art/Books',
  advertisement_art_collectibles: 'Marketplace/Art/Collectibles',
  advertisement_art_paintings: 'Marketplace/Art/Paintings',
  advertisement_art_music: 'Marketplace/Art/Music',

  advertisement_vehicles_cars: 'Marketplace/Vehicles/Cars',
  advertisement_vehicles_boats: 'Marketplace/Vehicles/Boats',
  advertisement_vehicles_motorcycles: 'Marketplace/Vehicles/Motorcycles',
  advertisement_vehicles_bikes: 'Marketplace/Vehicles/Bikes',

  advertisement_electronics_drones: 'Marketplace/Electronics/Drones',
  advertisement_electronics_smartphones: 'Marketplace/Electronics/Smartphones',
  advertisement_electronics_cameras: 'Marketplace/Electronics/Cameras',
  advertisement_electronics_consoles: 'Marketplace/Electronics/Consoles',
  advertisement_electronics_computers: 'Marketplace/Electronics/Computers',
  advertisement_electronics_tv: 'Marketplace/Electronics/Tv',
  advertisement_electronics_audio: 'Marketplace/Electronics/Audio',
};

/**
 * @category Utils
 * 
 * @description Retrieves the frontend-friendly category path for a given internal
 * category type.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param category - The internal category string (e.g., "advertisement_sports_fitness").
 * @param normalizationMap - The map from internal types to frontend labels.
 * @returns The normalized frontend category path, or an empty string if not found.
 *
 * @example
 * const frontendPath = getCategoryTypeFromMap('advertisement_sports_fitness', normalizationMap);
 * // → "Marketplace/Sports/Fitness"
 */
export function getCategoryTypeFromMap(
  category: string,
  normalizationMap: Record<string, string>,
): string {
  return normalizationMap[category] || '';
}
