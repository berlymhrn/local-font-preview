# Font Preview

A Next.js application for previewing all fonts from local storage. It includes font search, text and font size previews, a responsive grid, and font grouping by type.

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file from the example configuration:

   ```bash
   copy from env.local.example
   ```

3. Start the application:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000.

   * `/` displays all fonts with search functionality.
   * `/font-types` displays fonts grouped by category.

5. To check the project before deployment:

   ```bash
   npm run lint
   npm run build
   ```

## Features

* Automatically reads fonts from the configured server folder.
* Supports `.ttf`, `.otf`, `.woff`, and `.woff2` formats.
* Search by font name or file name.
* Custom text preview and font size controls.
* Font categories including Serif, Sans Serif, Slab Serif, Script, Handwritten, Display, Monospace, Blackletter, and Other.
* Responsive grid powered by Tailwind CSS.

## Deploying to Vercel

Vercel cannot access font folders stored on your local computer. For deployment, place the fonts you want to use in `public/fonts`, then leave `FONTS_DIR` empty or remove the environment variable so the application uses the default folder.

### Folder and File Structure

* `app/page.tsx`: Main page for previewing all fonts, searching, entering custom text, and adjusting font size.
* `app/font-types/page.tsx`: Font preview page organized by category.
* `app/layout.tsx`: Root layout, metadata, and global stylesheet import.
* `app/globals.css`: Global Tailwind CSS styles.
* `app/api/fonts/route.ts`: Finds font files from the configured folder and the user's Windows font directory.
* `app/api/font-file/[filename]/route.ts`: Serves font files to the browser with the appropriate MIME type and path validation.
* `env.local.example`: Example `FONTS_DIR` configuration without storing a personal local path.

## NPM Scripts

* `npm run dev`: Starts the development server.
* `npm run lint`: Checks code quality.
* `npm run build`: Creates a production build.
* `npm run start`: Runs the production build.
