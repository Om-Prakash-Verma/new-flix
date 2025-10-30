# Flix - Your Ultimate Movie & TV Discovery Platform

Flix is a feature-rich, open-source movie and TV show discovery platform built with a modern tech stack. It's designed to help you find your next favorite thing to watch, providing detailed information, trailers, recommendations, and direct links to watch content online for free.

![Flix Screenshot](./preview.png)

## ✨ Features

- **Comprehensive Discovery**: Browse extensive carousels of **Popular**, **Top Rated**, and **Trending** movies and TV shows.
- **Advanced Filtering**: Filter content by **Genre**, **Year**, **Country**, and **Sort Order** on dedicated browsing pages.
- **Detailed Media Pages**: Dive deep into movies and TV shows with dedicated pages that include:
    - High-quality poster and backdrop images.
    - Ratings, release year, runtime, and genres.
    - Taglines and overviews.
    - Production company logos and links.
    - **Trailers & Videos**: Watch official trailers and other video content in a modal player.
    - **Seasons & Episodes**: Full season and episode browser for TV shows, complete with still images and individual play buttons.
    - **Cast & Crew**: Credits carousel for cast members with links to their individual pages.
    - **Recommendations**: Discover similar content with the "More Like This" section.
    - **Reviews**: Read user reviews from TMDB.
- **"Surprise Me" Button**: Feeling adventurous? Let Flix pick a random movie or TV show for you.
- **Robust Search**: A powerful search engine to find movies, TV shows, and people.
- **Collections & People**: Explore movie collections (like Star Wars or The Avengers) and view detailed filmographies for actors and directors.
- **Integrated Video Player**: Watch content directly in the app with a custom video player modal that sources content from multiple ad-free providers.
- **AI-Powered Fallback**: If a video link is broken, an AI-powered system automatically finds the next best available source to ensure a seamless viewing experience.
- **Fully Responsive**: A sleek, modern UI that works beautifully on desktop, tablet, and mobile devices.
- **Legal & Policy Pages**: Includes boilerplate pages for Terms of Service, Privacy Policy, Cookie Policy, and DMCA.

## 🚀 Tech Stack

Flix is built with a modern, performant, and type-safe technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **AI & Generative Features**: [Genkit](https://firebase.google.com/docs/genkit)
- **Data Source**: [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)
- **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need to have [Node.js](https://nodejs.org/) (version 18 or later) and npm installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/flix.git
    cd flix
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your TMDB API key. You can get a free API key from [themoviedb.org](https://www.themoviedb.org/documentation/api).

    ```
    TMDB_API_KEY=your_tmdb_api_key_here
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

The project follows the standard Next.js App Router structure:

-   `src/app/`: Contains all the routes and pages of the application.
    -   `src/app/api/`: API routes, including a proxy for TMDB requests.
    -   `src/app/[type]/[slug]/page.tsx`: Dynamic routes for movie, TV, person, etc. pages.
    -   `src/app/layout.tsx`: The root layout of the application.
    -   `src/app/globals.css`: Global styles and Tailwind directives.
-   `src/components/`: Reusable React components used throughout the application.
    -   `src/components/ui/`: Components from the Shadcn/UI library.
-   `src/lib/`: Utility functions, API clients, and type definitions.
    -   `src/lib/tmdb.ts`: The primary client for interacting with the TMDB API.
    -   `src/lib/serverList.ts`: A list of servers used by the video player.
-   `src/ai/`: Contains Genkit flows for AI-powered features.
-   `src/config/`: Site-wide configuration, such as navigation links.
-   `public/`: Static assets.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/flix/issues).

## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
