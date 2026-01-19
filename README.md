# EcoScrum

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

EcoScrum is a comprehensive scrum management platform that integrates sustainability metrics into your agile development process. Track your team's velocity while measuring and improving your project's environmental and sustainability impact across every sprint.

## ✨ Features

- **Sprint Management** - Organize your work into sprints with built-in sustainability tracking
- **Product Backlog** - Manage and prioritize backlog items with sustainability classifications
- **Sprint Board** - Kanban-style board with drag-and-drop functionality for managing sprint tasks
- **Sustainability Metrics** - Track and improve your project's sustainability score with detailed analytics
- **Retrospectives** - Conduct sprint retrospectives with sustainability-focused insights
- **Team Collaboration** - Multi-user support with project-based team management
- **SUSAF Integration** - Link backlog items to Sustainability Aspects and Factors (SUSAF) effects
- **Analytics Dashboard** - Visualize sustainability trends and team velocity over time

## 🚀 Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Drag & Drop**: @hello-pangea/dnd
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (comes with Node.js) or [pnpm](https://pnpm.io/)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EricRode/EcoScrum.git
   cd EcoScrum
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   Or if using pnpm:
   ```bash
   pnpm install
   ```

## 🏃 Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Run the linter to check code quality:

```bash
npm run lint
```

## 📖 Getting Started

1. **First Time Users**: Check out the [User Manual](https://drive.google.com/file/d/1k4b40H_BrZqALLGWKYa2CRdIMOUpMP57/view?usp=sharing) for a comprehensive guide

2. **Create a Project**: After logging in, create your first project to organize your team and sprints

3. **Add Team Members**: Invite team members to collaborate on your project

4. **Create a Sprint**: Set up your first sprint with goals and timeframes

5. **Manage Backlog**: Add product backlog items and categorize them by sustainability impact

6. **Track Progress**: Use the dashboard to monitor sprint progress and sustainability metrics

## 📁 Project Structure

```
EcoScrum/
├── app/                    # Next.js app directory
│   ├── backlog/           # Backlog management pages
│   ├── education/         # Educational resources
│   ├── landing-page/      # Public landing page
│   ├── login/             # Authentication pages
│   ├── profile/           # User profile pages
│   ├── retrospective/     # Sprint retrospective pages
│   ├── sprint-board/      # Sprint board pages
│   ├── susaf/             # SUSAF-related pages
│   └── team/              # Team management pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
├── styles/                # Global styles
└── ...configuration files
```

## 🌱 Sustainability Features

EcoScrum uniquely combines agile methodologies with sustainability tracking:

- **Sustainability Score**: Track your project's sustainability impact across sprints
- **SUSAF Framework**: Link backlog items to specific sustainability aspects and factors
- **Trend Analysis**: Visualize how your sustainability efforts improve over time
- **Sustainable PBIs**: Identify and prioritize product backlog items with sustainability benefits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please refer to the [User Manual](https://drive.google.com/file/d/1k4b40H_BrZqALLGWKYa2CRdIMOUpMP57/view?usp=sharing) or open an issue in the repository.

---

**EcoScrum** - *Sustainable Agile Development*
