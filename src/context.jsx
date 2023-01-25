import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

const AppContext = React.createContext();

const allMealsUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const randomUrl = "https://www.themealdb.com/api/json/v1/1/random.php";

const getFavortiesFromLocalStorage = () => {
  let favorites = localStorage.getItem("favorites");

  if (favorites) {
    favorites = JSON.parse(localStorage.getItem("favorites"));
  } else {
    favorites = [];
  }

  return favorites;
};

function AppProvider({ children }) {
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favorites, setFavorites] = useState(getFavortiesFromLocalStorage());

  const fetchMeals = async (url) => {
    setLoading(true);
    try {
      const { data } = await axios(url);

      if (data.meals.length < 1) {
        setError(true);
      }

      setError(false);
      setMeals(data.meals);
    } catch (err) {
      setError(true);
      console.log(err.response);
    }
    setLoading(false);
  };

  const fetchRandomMeal = () => {
    fetchMeals(randomUrl);
  };

  const selectMeal = (idMeal, favoriteMeal) => {
    let meal;

    if (favoriteMeal) {
      meal = favorites.find((meal) => meal.idMeal === idMeal);
    } else {
      meal = meals.find((meal) => meal.idMeal === idMeal);
    }

    setSelectedMeal(meal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const addToFavorites = (idMeal) => {
    const alreadyFavorite = favorites.find((meal) => meal.idMeal === idMeal);

    if (alreadyFavorite) return;

    const meal = meals.find((meal) => meal.idMeal === idMeal);
    const updateFavorites = [...favorites, meal];
    setFavorites(updateFavorites);
    localStorage.setItem("favorites", JSON.stringify(updateFavorites));
  };

  const removeFromFavorites = (idMeal) => {
    const updateFavorites = favorites.filter((meal) => meal.idMeal !== idMeal);
    setFavorites(updateFavorites);
    localStorage.setItem("favorites", JSON.stringify(updateFavorites));
  };

  useEffect(() => {
    fetchMeals(allMealsUrl);
  }, []);

  useEffect(() => {
    if (!searchTerm) return;

    fetchMeals(`${allMealsUrl}${searchTerm}`);
  }, [searchTerm]);

  return (
    <AppContext.Provider
      value={{
        meals,
        error,
        loading,
        setSearchTerm,
        fetchRandomMeal,
        showModal,
        selectMeal,
        selectedMeal,
        closeModal,
        addToFavorites,
        removeFromFavorites,
        favorites,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useGlobalContext = () => useContext(AppContext);

export { AppContext, AppProvider };
