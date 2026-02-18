import { Recipe } from '@/types/recipe'

/**
 * Generate schema.org Recipe JSON-LD for SEO
 * @param recipe - Recipe object
 * @returns schema.org Recipe structured data object
 */
export function generateRecipeJsonLd(recipe: Recipe) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.images,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeIngredient: recipe.ingredients.map((ingredient) => {
      const notes = ingredient.notes ? ` (${ingredient.notes})` : ''
      return `${ingredient.amount} ${ingredient.item}${notes}`
    }),
    recipeInstructions: recipe.instructions.map((instruction) => ({
      '@type': 'HowToStep',
      position: instruction.step,
      text: instruction.text,
    })),
  }
}
