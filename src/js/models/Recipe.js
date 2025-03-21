import axios from "axios";
// import { key } from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }
  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert("Etwas ist schief gelaufen!");
    }
  }
  calcTime() {
    //assuming that we need 15min for each 3 ingredients
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }
  calcServings() {
    this.servings = 4;
  }
  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "cup",
      "pounds"
    ];
    const unitsShort = [
      "Esslöffel",
      "Esslöffel",
      "oz",
      "oz",
      "Teelöffel",
      "Teelöffel",
      "Tassen",
      "Tasse",
      "Pfund"
    ]; //1oz = 28.34g; 1pound = 0.45kg
    const units = [...unitsShort, "kg", "g"];
    const newIngredients = this.ingredients.map(ing => {
      //1.uniform units
      let ingredient = ing.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      //2.remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");
      //3.parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ");
      const unitIndex = arrIng.findIndex(ingred => units.includes(ingred));

      let objIng;
      if (unitIndex > -1) {
        //there is a unit
        const arrCount = arrIng.slice(0, unitIndex);
        //Ex. 4 1/2 cups, arrCount = [4,1/2]
        //Ex. 4 cups, arrCount = [4]
        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join("+")); //Ex. 4 1/2 cups, arrCount = [4,1/2] --> eval('4+1/2') --> 4.5
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrIng[0], 10)) {
        //thers no unit but first element is a number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        //theres no unit and no number in 1st position
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }
      return objIng;
    });
    this.ingredients = newIngredients;
  }
  updateServings(type) {
    //servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    //ingredients
    this.ingredients.forEach(ing => {
      ing.count = ing.count * (newServings / this.servings);
    });

    this.servings = newServings;
  }
}
