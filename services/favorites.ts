import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favorite_heroes";

export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);

    if (!favorites) {
      return [];
    }

    return JSON.parse(favorites);
  } catch (error) {
    console.log("Error obteniendo favoritos:", error);
    return [];
  }
};

export const isFavorite = async (heroId: number) => {
  const favorites = await getFavorites();

  return favorites.some((hero: any) => hero.id === heroId);
};

export const addFavorite = async (hero: any) => {
  try {
    const favorites = await getFavorites();

    const exists = favorites.some(
      (item: any) => item.id === hero.id
    );

    if (!exists) {
      favorites.push(hero);

      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
      );
    }
  } catch (error) {
    console.log("Error agregando favorito:", error);
  }
};

export const removeFavorite = async (heroId: number) => {
  try {
    const favorites = await getFavorites();

    const updatedFavorites = favorites.filter(
      (hero: any) => hero.id !== heroId
    );

    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  } catch (error) {
    console.log("Error eliminando favorito:", error);
  }
};