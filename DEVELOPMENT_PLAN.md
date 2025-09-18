# Failure Feed - Development Plan & Progress

## ✅ Completed Tasks
- [x] Project structure setup (NestJS + Next.js)
- [x] Database schema design
- [x] Supabase database connection
- [x] Prisma schema deployment
- [x] Environment configuration

## 🚧 Current Phase: Backend API Development

### Next Steps (Priority Order)

#### 1. Authentication System (2-3 hours)
- [ ] User registration endpoint (`POST /auth/register`)
- [ ] User login endpoint (`POST /auth/login`) 
- [ ] JWT middleware setup
- [ ] Password hashing with Argon2

#### 2. Posts API (2 hours)
- [ ] Create post endpoint (`POST /posts`)
- [ ] Get all posts endpoint (`GET /posts`)
- [ ] Get posts by category (`GET /posts?category=COLLEGE`)
- [ ] Enforce post template validation

#### 3. Comments & Voting (1 hour)
- [ ] Add comment endpoint (`POST /posts/:id/comments`)
- [ ] Vote on posts/comments (`POST /posts/:id/vote`)
- [ ] Get comments for post (`GET /posts/:id/comments`)

#### 4. Frontend Development (3-4 hours)
- [ ] Homepage with public feed
- [ ] Authentication forms (login/register)
- [ ] Post creation form with category templates
- [ ] Basic styling with Tailwind

#### 5. Integration & Testing (1 hour)
- [ ] Connect frontend to backend APIs
- [ ] Test user flows
- [ ] Basic error handling

## 🎯 Today's Goal
Build a working MVP where users can:
1. Browse failures without signing up
2. Register/login with username/password
3. Create failure posts using the template
4. Comment and vote on posts

## 📝 Development Notes

### Architecture Decisions
- **Backend**: NestJS with Prisma ORM
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL via Supabase
- **Auth**: JWT tokens in HTTP-only cookies
- **Styling**: Tailwind CSS

### Key Features to Implement
- Public browsing (no auth required)
- Simple username/password auth (no email)
- Structured post templates by category
- Categories: General, College, Entrepreneurs, Professionals, Life
- Comment system with voting
- Basic moderation (reporting)

### Template Enforcement
- **General**: Title + Contents only
- **Other categories**: Title + What failed + Lesson learned

## 🤔 Questions for Claude

### When asking Claude for help, include:
1. **What you want to build**: "I want to create [specific feature]"
2. **Current context**: "I'm working on the backend API" or "I'm on the frontend"
3. **Your skill level**: "I'm new to [technology] but understand [concept]"
4. **Specific ask**: "Give me the code for..." or "Explain how to..."
5. **Constraints**: "Keep it simple for MVP" or "Focus on functionality over design"

### Example Prompts:
- "I want to create the user registration API endpoint in NestJS. I understand REST APIs but I'm new to NestJS. Give me the complete code with validation and error handling."
- "I need a Next.js page that shows all failure posts. I understand React but I'm new to Next.js App Router. Show me how to fetch data and display it."
- "I want to create a post creation form that enforces different templates based on category. I understand forms but need help with conditional validation."

## 🔄 How to Update This Document
Copy this markdown file, add your progress, questions, and notes. Share it with Claude when asking for help so I have full context of where you are in the development process.

---

**Ready for the next step?** Let's build the authentication system first!