// Adds "X-Robots-Tag: noindex" when the site is reached on a *.netlify.app address (the temporary
// address, and branch / deploy-preview addresses), so only the custom domain can be indexed.
// The custom domain never gets the header. netlify.toml cannot do this: its header rules do not
// know which hostname a request came in on.
export default async (request, context) => {
  const response = await context.next()
  if (new URL(request.url).hostname.endsWith('.netlify.app')) {
    response.headers.set('X-Robots-Tag', 'noindex')
  }
  return response
}

// Pages and text files only; hashed assets, fonts, images and video skip the function.
export const config = {
  path: '/*',
  excludedPath: ['/assets/*', '/fonts/*', '/images/*', '/video/*'],
}
