import { Recipe } from '@/types/recipe'

export const recipes: Recipe[] = [
  {
    id: 'authentic-jerk-chicken',
    slug: 'authentic-jerk-chicken',
    title: 'Authentic Jerk Chicken',
    description:
      'Classic Jamaican jerk chicken marinated in Jamaica House Brand Original Jerk Sauce. Grilled to perfection with the perfect balance of heat and flavor.',
    image: '/images/recipes/authentic-jerk-chicken.jpg',
    images: [
      '/images/recipes/authentic-jerk-chicken.jpg',
      '/images/recipes/authentic-jerk-chicken-2.jpg',
      '/images/recipes/authentic-jerk-chicken-3.jpg',
    ],
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    difficulty: 'medium',
    ingredients: [
      { item: 'chicken thighs', amount: '2 lbs', notes: 'bone-in, skin-on' },
      {
        item: 'Jamaica House Brand Original Jerk Sauce',
        amount: '1 bottle (5oz)',
      },
      { item: 'lime juice', amount: '2 tbsp', notes: 'freshly squeezed' },
      { item: 'olive oil', amount: '1 tbsp' },
      { item: 'salt and pepper', amount: 'to taste' },
    ],
    instructions: [
      {
        step: 1,
        text: 'Combine Jamaica House Brand Jerk Sauce, lime juice, and olive oil in a large bowl. Add chicken thighs and coat thoroughly. Marinate for at least 2 hours or overnight in the refrigerator.',
      },
      {
        step: 2,
        text: 'Preheat grill to medium-high heat (375-400°F). Oil the grill grates to prevent sticking.',
      },
      {
        step: 3,
        text: 'Remove chicken from marinade and season with salt and pepper. Grill for 6-8 minutes per side until internal temperature reaches 165°F and skin is charred.',
      },
      {
        step: 4,
        text: 'Remove from grill and let rest for 5 minutes before serving. Serve with rice and peas or traditional Jamaican sides.',
      },
    ],
    featuredProducts: ['jerk-sauce-5oz'],
    tags: ['chicken', 'jamaican', 'grilled', 'jerk', 'main-dish'],
  },
  {
    id: 'jerk-shrimp-tacos',
    slug: 'jerk-shrimp-tacos',
    title: 'Jerk Shrimp Tacos',
    description:
      'Spicy jerk-seasoned shrimp in warm tortillas topped with fresh mango salsa. A perfect fusion of Caribbean and Mexican flavors.',
    image: '/images/recipes/jerk-shrimp-tacos.jpg',
    images: [
      '/images/recipes/jerk-shrimp-tacos.jpg',
      '/images/recipes/jerk-shrimp-tacos-2.jpg',
      '/images/recipes/jerk-shrimp-tacos-3.jpg',
    ],
    prepTime: 20,
    cookTime: 10,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      { item: 'large shrimp', amount: '1 lb', notes: 'peeled and deveined' },
      {
        item: 'Jamaica House Brand Original Jerk Sauce',
        amount: '1 bottle (2oz)',
      },
      { item: 'corn tortillas', amount: '8', notes: 'warmed' },
      { item: 'mango', amount: '1', notes: 'diced' },
      { item: 'red onion', amount: '1/4 cup', notes: 'diced' },
      { item: 'cilantro', amount: '2 tbsp', notes: 'chopped' },
      { item: 'lime', amount: '2', notes: '1 for marinade, 1 for serving' },
      { item: 'olive oil', amount: '1 tbsp' },
    ],
    instructions: [
      {
        step: 1,
        text: 'Toss shrimp with Jamaica House Brand Jerk Sauce and juice of 1 lime. Marinate for 15 minutes.',
      },
      {
        step: 2,
        text: 'Make mango salsa by combining diced mango, red onion, cilantro, and juice of remaining lime. Set aside.',
      },
      {
        step: 3,
        text: 'Heat olive oil in a large skillet over medium-high heat. Cook shrimp for 2-3 minutes per side until pink and cooked through.',
      },
      {
        step: 4,
        text: 'Serve shrimp in warm tortillas topped with mango salsa. Garnish with extra cilantro and lime wedges.',
      },
    ],
    featuredProducts: ['jerk-sauce-2oz'],
    tags: ['shrimp', 'tacos', 'seafood', 'quick', 'easy'],
  },
  {
    id: 'jerk-salmon-rice-peas',
    slug: 'jerk-salmon-rice-peas',
    title: 'Jerk Salmon with Rice & Peas',
    description:
      'Glazed salmon with Jamaica House Brand sauce served over traditional coconut rice and peas. A healthier take on Jamaican classics.',
    image: '/images/recipes/jerk-salmon-rice-peas.jpg',
    images: [
      '/images/recipes/jerk-salmon-rice-peas.jpg',
      '/images/recipes/jerk-salmon-rice-peas-2.jpg',
      '/images/recipes/jerk-salmon-rice-peas-3.jpg',
    ],
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    difficulty: 'medium',
    ingredients: [
      { item: 'salmon fillets', amount: '2', notes: '6oz each' },
      {
        item: 'Jamaica House Brand Original Jerk Sauce',
        amount: '3 tbsp',
      },
      { item: 'jasmine rice', amount: '1 cup' },
      { item: 'coconut milk', amount: '1 cup' },
      { item: 'water', amount: '1/2 cup' },
      { item: 'kidney beans', amount: '1 can (15oz)', notes: 'drained' },
      { item: 'thyme', amount: '2 sprigs' },
      { item: 'garlic', amount: '2 cloves', notes: 'minced' },
      { item: 'scallions', amount: '2', notes: 'chopped' },
    ],
    instructions: [
      {
        step: 1,
        text: 'Preheat oven to 400°F. Brush salmon fillets with Jamaica House Brand Jerk Sauce and let marinate while you prepare the rice.',
      },
      {
        step: 2,
        text: 'In a medium pot, combine rice, coconut milk, water, kidney beans, thyme, and garlic. Bring to a boil, then reduce heat to low, cover, and simmer for 18-20 minutes.',
      },
      {
        step: 3,
        text: 'While rice cooks, place salmon on a lined baking sheet and bake for 12-15 minutes until cooked through and flaky.',
      },
      {
        step: 4,
        text: 'Remove thyme sprigs from rice and fluff with a fork. Stir in scallions.',
      },
      {
        step: 5,
        text: 'Serve salmon over rice and peas, drizzling any remaining jerk sauce over the top.',
      },
    ],
    featuredProducts: ['jerk-sauce-5oz'],
    tags: ['salmon', 'seafood', 'rice', 'healthy', 'jamaican'],
  },
  {
    id: 'escovitch-fish',
    slug: 'escovitch-fish',
    title: 'Escovitch Fish',
    description:
      'Traditional Jamaican escovitch fish topped with Jamaica House Brand Escovitch Pikliz. Crispy fried fish with spicy pickled vegetables.',
    image: '/images/recipes/escovitch-fish.jpg',
    images: [
      '/images/recipes/escovitch-fish.jpg',
      '/images/recipes/escovitch-fish-2.jpg',
      '/images/recipes/escovitch-fish-3.jpg',
    ],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'medium',
    ingredients: [
      {
        item: 'whole red snapper',
        amount: '4',
        notes: 'scaled and cleaned, about 1 lb each',
      },
      {
        item: 'Jamaica House Brand Escovitch Pikliz',
        amount: '1 jar (12oz)',
      },
      { item: 'all-purpose flour', amount: '1 cup' },
      { item: 'vegetable oil', amount: '2 cups', notes: 'for frying' },
      { item: 'allspice', amount: '1 tsp' },
      { item: 'black pepper', amount: '1 tsp' },
      { item: 'salt', amount: '1 tsp' },
    ],
    instructions: [
      {
        step: 1,
        text: 'Pat fish dry with paper towels. Make 3-4 diagonal cuts on each side of the fish. Season with salt, pepper, and allspice.',
      },
      {
        step: 2,
        text: 'Dredge fish in flour, shaking off excess. Heat oil in a large skillet over medium-high heat to 350°F.',
      },
      {
        step: 3,
        text: 'Fry fish for 4-5 minutes per side until golden brown and crispy. Drain on paper towels.',
      },
      {
        step: 4,
        text: 'Top each fish generously with Jamaica House Brand Escovitch Pikliz. Serve immediately with bammy or festival.',
      },
    ],
    featuredProducts: ['escovitch-pikliz-12oz'],
    tags: ['fish', 'jamaican', 'fried', 'traditional', 'seafood'],
  },
  {
    id: 'jerk-chicken-wings',
    slug: 'jerk-chicken-wings',
    title: 'Jerk Chicken Wings',
    description:
      'Crispy baked wings tossed in Jamaica House Brand Jerk Sauce. Perfect for game day or any gathering.',
    image: '/images/recipes/jerk-chicken-wings.jpg',
    images: [
      '/images/recipes/jerk-chicken-wings.jpg',
      '/images/recipes/jerk-chicken-wings-2.jpg',
      '/images/recipes/jerk-chicken-wings-3.jpg',
    ],
    prepTime: 10,
    cookTime: 40,
    servings: 6,
    difficulty: 'easy',
    ingredients: [
      {
        item: 'chicken wings',
        amount: '3 lbs',
        notes: 'split at the joint, tips removed',
      },
      {
        item: 'Jamaica House Brand Original Jerk Sauce',
        amount: '1 bottle (10oz)',
      },
      { item: 'baking powder', amount: '2 tbsp' },
      { item: 'garlic powder', amount: '1 tsp' },
      { item: 'salt', amount: '1 tsp' },
      { item: 'black pepper', amount: '1/2 tsp' },
    ],
    instructions: [
      {
        step: 1,
        text: 'Preheat oven to 425°F. Line a baking sheet with parchment paper and place a wire rack on top.',
      },
      {
        step: 2,
        text: 'Pat wings dry and toss with baking powder, garlic powder, salt, and pepper. Arrange in a single layer on the rack.',
      },
      {
        step: 3,
        text: 'Bake for 40-45 minutes, flipping halfway through, until wings are golden and crispy.',
      },
      {
        step: 4,
        text: 'Transfer wings to a large bowl and toss with Jamaica House Brand Jerk Sauce. Serve immediately with celery and ranch or blue cheese dressing.',
      },
    ],
    featuredProducts: ['jerk-sauce-10oz'],
    tags: ['chicken', 'wings', 'appetizer', 'party', 'baked'],
  },
  {
    id: 'pikliz-burger',
    slug: 'pikliz-burger',
    title: 'Pikliz Burger',
    description:
      'Gourmet burger topped with Jamaica House Brand Escovitch Pikliz and jerk aioli. Caribbean flavors meet American classic.',
    image: '/images/recipes/pikliz-burger.jpg',
    images: [
      '/images/recipes/pikliz-burger.jpg',
      '/images/recipes/pikliz-burger-2.jpg',
      '/images/recipes/pikliz-burger-3.jpg',
    ],
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      { item: 'ground beef', amount: '1.5 lbs', notes: '80/20 blend' },
      {
        item: 'Jamaica House Brand Escovitch Pikliz',
        amount: '1 cup',
      },
      {
        item: 'Jamaica House Brand Original Jerk Sauce',
        amount: '2 tbsp',
        notes: 'for aioli',
      },
      { item: 'mayonnaise', amount: '1/2 cup' },
      { item: 'brioche buns', amount: '4', notes: 'toasted' },
      { item: 'lettuce', amount: '4 leaves' },
      { item: 'tomato', amount: '1', notes: 'sliced' },
      { item: 'salt and pepper', amount: 'to taste' },
    ],
    instructions: [
      {
        step: 1,
        text: 'Make jerk aioli by mixing mayonnaise with Jamaica House Brand Jerk Sauce. Refrigerate until ready to use.',
      },
      {
        step: 2,
        text: 'Form ground beef into 4 patties, about 6oz each. Season both sides with salt and pepper. Make a small indentation in the center of each patty.',
      },
      {
        step: 3,
        text: 'Grill or pan-fry burgers over medium-high heat for 4-5 minutes per side for medium doneness.',
      },
      {
        step: 4,
        text: 'Assemble burgers on toasted brioche buns with lettuce, tomato, burger patty, jerk aioli, and a generous topping of Jamaica House Brand Escovitch Pikliz.',
      },
    ],
    featuredProducts: ['escovitch-pikliz-12oz', 'jerk-sauce-2oz'],
    tags: ['burger', 'beef', 'fusion', 'grilled', 'easy'],
  },
]

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug)
}

export function getAllRecipes(): Recipe[] {
  return recipes
}
