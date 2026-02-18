import { Recipe } from '@/types/recipe'

interface RecipeJsonLd {
  '@context': string
  '@type': string
  name: string
  description: string
  image: string[]
  prepTime: string
  cookTime: string
  totalTime: string
  recipeYield: string
  recipeIngredient: string[]
  recipeInstructions: {
    '@type': string
    text: string
    position: number
  }[]
}

export function generateRecipeJsonLd(recipe: Recipe): RecipeJsonLd {
  const totalMinutes = recipe.prepTime + recipe.cookTime
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.images,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${totalMinutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeIngredient: recipe.ingredients.map((ing) => `${ing.amount} ${ing.item}`),
    recipeInstructions: recipe.instructions.map((inst) => ({
      '@type': 'HowToStep',
      text: inst.text,
      position: inst.step,
    })),
  }
}
