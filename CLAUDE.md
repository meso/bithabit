# BitHabit - Development Guide

## Communication
- 日本語でやり取りしてください。ユーザーとのコミュニケーションは日本語で行います。
- コードコメントは基本的に英語で書きますが、複雑な説明が必要な場合は日本語も可。

## Commands
- **Development**: `npm run dev` - Start development server
- **Build**: `npm run build` - Create production build
- **Start**: `npm run start` - Run production server
- **Lint**: `npm run lint` - Run ESLint checks

## Code Style
- **Components**: Use functional components with typed props interfaces
- **Naming**: PascalCase for components/types, camelCase for functions/variables
- **Imports**: React first, then types/utils, UI components last
- **TypeScript**: Use explicit type annotations, avoid `any` 
- **State**: Use hooks for state, custom hooks for reusable logic
- **Error Handling**: Try/catch with console logging, defensive coding for browser APIs

## Project Structure
- `/app` - Next.js app router pages and layouts  
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/public` - Static assets and service workers
- `/lib` - Utility functions