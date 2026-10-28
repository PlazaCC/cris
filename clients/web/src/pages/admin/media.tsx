import { PageHeader, Section } from './components/field'
import { MediaLibrary, UploadButton } from './components/media-library'

export function AdminMediaPage() {
  return (
    <>
      <PageHeader
        title="Mídia"
        description="Imagens no Vercel Blob. Uma imagem em uso no site não pode ser apagada."
        actions={<UploadButton />}
      />
      <Section title="Biblioteca">
        <MediaLibrary />
      </Section>
    </>
  )
}
