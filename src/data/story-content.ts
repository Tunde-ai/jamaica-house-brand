import { StorySection } from '@/types/story'

export const storyContent = {
  hero: {
    title: 'Our Story',
    subtitle: 'From a family kitchen to three restaurants — and now, your table',
    image: '/images/story/hero.jpg',
  },
  sections: [
    {
      id: 'chef-anthony-origin',
      title: 'Carrying the Legacy Forward',
      content:
        "Born in New York to Jamaican parents, Chef Anthony grew up immersed in the rich flavors and traditions of Jamaican cuisine. His father built the Jamaica House restaurant legacy in South Florida — three thriving locations known for authentic island cooking. Now Chef Anthony is extending that legacy by bringing the family recipe from our kitchen to every table in the World.",
      image: '/images/story/chef-anthony.jpg',
      imageAlt: 'Chef Anthony, carrying on the Jamaica House legacy',
      layout: 'text-left',
    },
    {
      id: 'sauce-story',
      title: 'The Sauce Everyone Asked For',
      content:
        "For years, 92% of Jamaica House restaurant guests asked the same question: 'Can I buy a bottle of that sauce?' After countless requests, Chef Anthony decided to bottle the exact family recipe that made the restaurants famous. Jamaica House Brand brings the authentic restaurant experience to your home kitchen.",
      image: '/images/story/sauce-bottling.jpg',
      imageAlt: 'Jamaica House Brand sauce bottles being filled',
      layout: 'text-right',
    },
  ] as StorySection[],
}
