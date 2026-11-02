// Bespoke project photos: every image in src/assets/bespoke/ (see the README there). Adding or
// removing a file there is all it takes; the next build picks it up. They show in filename order,
// so a number prefix (01-, 02-, ...) sets the order. The caption and alt text come from the
// filename: "03-steel-and-oak-desk.webp" -> "Steel and oak desk".
// Every file except the README, then filtered here, so an extension in any case (.jpg, .JPG,
// .Jpg) is picked up.
const files = import.meta.glob(['../assets/bespoke/*.*', '!../assets/bespoke/*.md'], {
  eager: true,
  query: '?url',
  import: 'default',
})
const isPhoto = (path) => /\.(jpe?g|png|webp|avif)$/i.test(path)

const caption = (path) => {
  const words = path
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[\s._-]*/, '')
    .replace(/[_-]+/g, ' ')
    .trim()
  return words ? words[0].toUpperCase() + words.slice(1) : ''
}

export const bespokePhotos = Object.keys(files)
  .filter(isPhoto)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((path) => ({ src: files[path], alt: caption(path) }))
