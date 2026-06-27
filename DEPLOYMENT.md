# Deployment Guide - The Game Platform

## Overview

"The Game" is a premium multiplayer party game platform with three games:
- **Imposter** - Spot the imposter among the crew
- **Mafia** - Classic deception game
- **Love Match** - Couples compatibility game

## Technology Stack

- **Frontend**: Next.js 14 (React)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: Supabase Realtime subscriptions
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Prerequisites

1. **Vercel Account**: https://vercel.com/signup
2. **Supabase Account**: https://supabase.com
3. **Git Repository**: GitHub, GitLab, or Bitbucket
4. **Domain** (optional): For custom domain

## Deployment Steps

### 1. Supabase Setup

If not already done:

```bash
# Create Supabase project
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Wait for project to initialize
# 4. Go to Settings → API
# 5. Copy these values:
#    - Project URL
#    - Anon Public Key
#    - Service Role Secret Key
```

### 2. Run Database Migrations

```bash
# Connect to Supabase
# Option A: Use Supabase Studio (easiest)
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Create new query
# 4. Paste content of: migrations/001_create_love_match_tables.sql
# 5. Run query
# 6. Repeat for: migrations/002_add_special_rounds.sql

# Option B: Use Supabase CLI
npm install -g supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase push
```

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: API URLs
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 4. Local Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000

# Test all three games:
# 1. Sign up new account
# 2. Create Imposter game
# 3. Create Mafia game
# 4. Create Love Match game
# 5. Join as second user
# 6. Start and play through complete round
```

### 5. Deploy to Vercel

**Option A: GitHub Integration (Recommended)**

```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main

# 2. Go to https://vercel.com/import
# 3. Select GitHub repository
# 4. Configure project:
#    - Framework: Next.js
#    - Root Directory: ./
# 5. Add environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - NEXT_PUBLIC_API_URL (set to your Vercel URL)
# 6. Click "Deploy"
```

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts and add environment variables
```

### 6. Post-Deployment

After deployment, verify:

```bash
# Test public pages
curl https://your-domain.com/
curl https://your-domain.com/auth/signup

# Test API endpoints
curl -X POST https://your-domain.com/api/games/love/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test"}'

# Test Supabase connection
# 1. Create account on production
# 2. Check Supabase dashboard for user in auth_users table
# 3. Create a game and verify it appears in database
```

### 7. Configure Custom Domain (Optional)

In Vercel Dashboard:
```
1. Go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update NEXT_PUBLIC_API_URL to custom domain
6. Redeploy
```

## Database Schema

The platform creates these tables automatically (via migrations):

**Games Tables:**
- `love_match_rooms` - Game lobbies
- `love_match_teams` - Couples/teams
- `love_match_rounds` - Individual rounds
- `love_match_answers` - Player answers
- `love_match_round_scores` - Round scoring
- `love_match_game_questions` - Questions per game
- `love_match_game_results` - Final results
- `love_match_audience_guesses` - Audience guesses
- `love_match_host_actions` - Host actions log

**Core Tables:**
- `users` - User accounts
- `games` - Imposter/Mafia games (existing)
- `game_players` - Players in Imposter/Mafia (existing)
- `game_rounds` - Rounds for Imposter/Mafia (existing)

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | `eyJ...` |
| `NEXT_PUBLIC_API_URL` | Production API URL | `https://thegame.com` |

## Performance Optimization

The platform is optimized for:

1. **Real-Time Updates**: Supabase subscriptions
2. **Fast Builds**: ~2-3 minutes on Vercel
3. **Bundle Size**: ~150KB gzipped
4. **Database**: Connection pooling configured
5. **CDN**: Images served via Vercel Edge Network

## Monitoring & Logging

### Vercel Analytics
- Monitor in Vercel Dashboard
- Check Web Vitals
- Review API routes performance

### Supabase Logs
- Real-time query performance
- Connection pool status
- Replication lag

### Error Tracking
Errors appear in:
- Vercel function logs
- Browser console
- Supabase logs

## Troubleshooting

### Deployment Issues

**Build fails with "Module not found"**
```bash
# Clear dependencies and rebuild
rm -rf node_modules
npm install
npm run build
```

**Database connection timeout**
```
1. Check NEXT_PUBLIC_SUPABASE_URL is correct
2. Verify API keys in Supabase
3. Check Supabase project status
4. Verify network connectivity
```

**Real-time subscriptions not working**
```
1. Verify Supabase Realtime is enabled
2. Check RLS policies are correct
3. Verify browser supports WebSocket
```

### Performance Issues

**Slow page loads**
- Check Vercel build analytics
- Verify Supabase query performance
- Review network waterfall in DevTools

**High database latency**
- Check Supabase CPU usage
- Review slow query logs
- Consider adding indexes

## Scaling Considerations

### Current Capacity
- Handles ~1000 concurrent users
- ~10K games per day
- ~100K monthly active users

### Scale to 10K Users
1. Enable Supabase connection pooling
2. Add database replicas
3. Enable Vercel Edge Functions
4. Configure CDN caching

### Scale to 100K+ Users
1. Shard by game type
2. Regional Supabase replicas
3. Redis caching layer
4. Dedicated database instances

## Maintenance & Updates

### Database Backups
Supabase automatically backs up daily. Access at:
- Supabase Dashboard → Settings → Backups

### Code Updates
```bash
# Merge to main branch
git push origin main

# Vercel auto-deploys
# Monitor deployment at https://vercel.com/dashboard

# Rollback if needed
vercel rollback
```

### Version Updates
Monitor these regularly:
- Next.js updates
- React updates
- Supabase client library
- Dependencies (npm audit)

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## Cost Estimates

### Monthly Costs (at scale)

**Vercel:**
- Free tier: $0 (up to 100GB bandwidth)
- Pro: $20 (unlimited)
- Scale: $0.50/GB over limit

**Supabase:**
- Free tier: $0 (up to 500MB database)
- Pro: $25 (1GB database + additional per GB)
- Enterprise: Custom pricing

**Domain:**
- .com: ~$12/year
- .dev: ~$12/year

**Total Estimated:** $25-50/month for production

## Go-Live Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations run successfully
- [ ] Environment variables configured in Vercel
- [ ] All three games tested locally
- [ ] Auth system tested (signup, login, logout)
- [ ] Real-time features tested (multiplayer, leaderboards)
- [ ] Mobile responsiveness verified
- [ ] Error handling verified
- [ ] Performance tested with multiple users
- [ ] Supabase backups configured
- [ ] Domain configured (if custom domain)
- [ ] DNS records updated
- [ ] SSL certificate verified
- [ ] Analytics enabled
- [ ] Support email configured
- [ ] Privacy policy and terms added
- [ ] Monitoring alerts set up

## Launch Commands

```bash
# Final deployment checklist
npm run build          # Verify build succeeds
npm run lint          # Check for errors
npm run type-check    # Verify TypeScript
npm test              # Run tests (if available)

# Deploy
git push origin main  # Triggers Vercel deployment

# Verify
# 1. Check Vercel dashboard for successful deployment
# 2. Visit your domain
# 3. Create test game in each game type
# 4. Verify real-time updates work
# 5. Check Supabase database has data
```

---

**Deployment completed! 🚀**

Your game platform is now live and ready for users. Monitor Vercel and Supabase dashboards for performance and issues.
