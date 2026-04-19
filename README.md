# CodeFolio — Developer Portfolio Portal

CodeFolio is a multi-user web platform that allows developers to create a professional portfolio at a personal URL (`code-folio.app/username`) without the overhead of setting up or maintaining their own infrastructure.

Upon signing in with GitHub, the platform automatically imports the user's public repository data to populate their profile. From there, users manage their content — bio, skills, projects, and education — through a private dashboard, and can choose from a selection of layout templates and themes to personalize how their portfolio looks.

## Features

- **GitHub OAuth** — Sign in with GitHub, no registration form required
- **Automated Repository Import** — Public repos are imported automatically on first sign-in
- **Private Dashboard** — Manage profile, projects, education, skills, and appearance
- **GitHub Re-Sync** — Manually pull in new repositories as your work grows
- **Layout Templates** — Choose between different portfolio layouts
- **Theming** — Select a visual theme powered by shadcn/ui CSS variables
- **Public Portfolio Page** — Accessible at `code-folio.app/username`, no login required

## Tech Stack

**Client**

- React 18
- React Router
- Vite
- shadcn/ui
- Tailwind CSS

**Server**

- Node.js
- Express.js
- Passport.js (passport-github2)
- Mongoose

**Database**

- MongoDB Atlas

**Infrastructure**

- DigitalOcean (Ubuntu Droplet)
- PM2
- Nginx

## Project Structure

```
codefolio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Shared and shadcn/ui components
│   │   ├── pages/          # Dashboard and portfolio page views
│   │   ├── templates/      # Portfolio layout templates
│   │   └── main.jsx
│   └── index.html
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas (User, Project, Education)
│   ├── routes/             # API and auth routes
│   ├── middleware/         # Auth and error handling middleware
│   └── index.js
└── README.md
```

## Data Models

- **User** — GitHub profile data, bio, skills, socials, layout and theme preferences
- **Project** — Imported from GitHub, editable via dashboard
- **Education** — Manually managed through dashboard

## License

This project is not open source. All rights reserved.
