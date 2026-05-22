# VisionBoard 🚀
The database of future startup ideas. Publish ideas, find collaborators, attract funding, and build your startup.

VisionBoard is a premium, modern, and highly polished community platform designed for founders, indicators, and builders. It is heavily inspired by **TrustMRR** layout, aesthetic cards, spacing, and clean design systems.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript, Vite 6, and Tailwind CSS v4.
- **Animations**: Framer Motion (`motion/react`) for smooth transitions, list entrances, and drawer actions.
- **Database Schema**: Optimized for Postgres / Supabase with Row Level Security.
- **State Engine**: Ultra-robust client-side simulation engine (supporting automated `localStorage` persistence) allowing developers to demonstrate and test profile creations, new ideas, peer comments suggestions, and expression of interest logs instantly out-of-the-box in are sandboxed browser preview.

---

## 🗄️ PostgreSQL / Supabase Database Schema

To scale this platform with a live PostgreSQL or Supabase backend, create the following SQL tables. This schema includes foreign relationships, tracking indexes, and Row Level Security (RLS).

```sql
-- 1. Create Profiles Table (Linked to Auth Users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    skills TEXT[] DEFAULT '{}'::TEXT[],
    github TEXT,
    twitter TEXT,
    linkedin TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow individual write access to own profile" ON public.profiles
    FOR ALL TO authenticated USING (auth.uid() = id);


-- 2. Create Startup Ideas Table
CREATE TABLE public.ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    banner TEXT,
    description TEXT NOT NULL,
    why_this_works TEXT NOT NULL,
    problem_solved TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    category TEXT NOT NULL,
    founder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    founder_name TEXT NOT NULL,
    founder_avatar TEXT NOT NULL,
    progress_stage TEXT CHECK (progress_stage IN ('IDEATION', 'MVP BUILDING', 'PROTOTYPE', 'SCALE')) DEFAULT 'IDEATION' NOT NULL,
    need_collaboration BOOLEAN DEFAULT true NOT NULL,
    max_collaborators INTEGER,
    need_funding BOOLEAN DEFAULT false NOT NULL,
    funding_goal TEXT,
    is_public BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for high-speed filters
CREATE INDEX idx_ideas_category ON public.ideas(category);
CREATE INDEX idx_ideas_founder ON public.ideas(founder_id);

-- Enable RLS on Ideas
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to public ideas" ON public.ideas
    FOR SELECT TO public USING (is_public = true);

CREATE POLICY "Allow write access to own ideas" ON public.ideas
    FOR ALL TO authenticated USING (auth.uid() = founder_id);


-- 3. Create Collaboration Requests Table
CREATE TABLE public.collaboration_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
    idea_name TEXT NOT NULL,
    founder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Collabs
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow listing own messages" ON public.collaboration_requests
    FOR SELECT TO authenticated USING (auth.uid() = founder_id);

CREATE POLICY "Allow public submissions" ON public.collaboration_requests
    FOR INSERT TO public WITH CHECK (true);


-- 4. Create Funding Interest Requests Table
CREATE TABLE public.funding_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
    idea_name TEXT NOT NULL,
    founder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Funding
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow listing own investments pitches" ON public.funding_requests
    FOR SELECT TO authenticated USING (auth.uid() = founder_id);

CREATE POLICY "Allow public investments submit" ON public.funding_requests
    FOR INSERT TO public WITH CHECK (true);


-- 5. Create Suggestions Table
CREATE TABLE public.suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Suggestions
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read suggestions" ON public.suggestions
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated submit suggestion" ON public.suggestions
    FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 🚀 Deployment Guide & Verification

Follow these steps to deploy this application locally or onto any public hosting platform (such as Netlify, Vercel, or AWS Amplify):

### 1. Local Configuration

```bash
# Clone and explore directories
cd VisionBoard

# Enable standard node integrations
npm install

# Initiate the dev environment
npm run dev
```

The server binds immediately on Port `3000` (`http://localhost:3000`) with absolute Hot-Module-Replacement disabled settings, matching pre-configured AI Studio preview environments.

### 2. Live Supabase Deployment Connecting (Optionally)

1. Provision a free backend project inside the [Supabase Dashboard](https://supabase.com).
2. Copy the SQL schema from above and run it in the **SQL Editor** of your Supabase console. This instantly bootstraps tables, foreign relationships, and security credentials.
3. Configure authentication callbacks (Google, GitHub, and email validations).
4. Update client-side imports inside `src/data.ts` utilizing `@supabase/supabase-js` instead of standard local storage arrays.
5. Setup env keys in `vercel` or your chosen deploying platform host:
   ```env
   VITE_SUPABASE_URL="your-supabase-project-endpoints"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
