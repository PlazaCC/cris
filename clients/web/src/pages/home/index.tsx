import { ParagraphsBlock } from '@/components/blocks/paragraphs-block'
import { ProjectProgressionBlock } from '@/components/blocks/projetct-progression'
import { QuoteTitle } from '@/components/blocks/quote-title'
import { ScopeBlock } from '@/components/blocks/scope'
import { MarqueeBlock } from '@/pages/home/components/marquee'
import { rootRoute } from '@/pages/root'
import { createRoute } from '@tanstack/react-router'

HomePage.route = createRoute({
  path: '/',
  component: HomePage,
  getParentRoute: () => rootRoute,
})

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1>Bem vindo ao Workspace do Plaza</h1>
      <ScopeBlock
        title="Scope and structure"
        description="<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse velit ante, accumsan ac lacus at, pulvinar aliquam velit. Sed dictum neque at justo dictum mattis a a nibh. Nunc scelerisque leo vitae erat sagittis, nec egestas dui pulvinar. Vestibulum nulla augue, vehicula id tortor ut, sagittis consequat nisl. Pellentesque eleifend semper nunc ac tincidunt. Nam vehicula, elit vel consequat pellentesque, odio purus molestie odio, ut ultricies massa mauris id nunc. Nullam nisl lectus, hendrerit vitae dignissim a, tristique nec nunc. Nulla vel nisl eu nisl tempor vehicula. Phasellus placerat efficitur nulla.<br/><br/> Quail chicks need a feed that is: A. non-medicated, B. finely ground, and C. very high in protein. The best I could do for them was a turkey starter, pulverised and topped up with boiled egg to raise the protein content.
</p>"
      />
      <QuoteTitle title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse velit ante" />
      <ParagraphsBlock
        blocks={[
          null,
          {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse velit ante, accumsan ac lacus at, pulvinar aliquam velit. Sed dictum neque at justo dictum mattis a a nibh. Nunc scelerisque leo vitae erat sagittis, nec egestas dui pulvinar. Vestibulum nulla augue, vehicula id tortor ut, sagittis consequat nisl. Pellentesque eleifend semper nunc ac tincidunt. Nam vehicula, elit vel consequat pellentesque, odio purus molestie odio, ut ultricies massa mauris id nunc. Nullam nisl lectus, hendrerit vitae dignissim a, tristique nec nunc. Nulla vel nisl eu nisl tempor vehicula. Phasellus placerat efficitur nulla.',
          },
          {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse velit ante, accumsan ac lacus at, pulvinar aliquam velit. Sed dictum neque at justo dictum mattis a a nibh. Nunc scelerisque leo vitae erat sagittis, nec egestas dui pulvinar. Vestibulum nulla augue, vehicula id tortor ut, sagittis consequat nisl. Pellentesque eleifend semper nunc ac tincidunt. Nam vehicula, elit vel consequat pellentesque, odio purus molestie odio, ut ultricies massa mauris id nunc. Nullam nisl lectus, hendrerit vitae dignissim a, tristique nec nunc. Nulla vel nisl eu nisl tempor vehicula. Phasellus placerat efficitur nulla.',
          },
        ]}
      />
      <ProjectProgressionBlock />
      <MarqueeBlock />
    </div>
  )
}
