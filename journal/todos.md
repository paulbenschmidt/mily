## Now
- [ ] Something funky is going on when trying to delete an event

## Upcoming
- [ ] Look into serving photos through Railway buckets?
- [ ] Rate limiting with django-ratelimit
- [ ] Add logo to loading spinners and to footer
- [ ] Change it so that year is dynamic, to the left of the line (and remove year from the event date)
- [ ] Add tags to events and allow users to filter by them
- [ ] Password reset via Django's built-in email system
- [ ] Go through packages and update any that are not needed
- [ ] Update readmes/windsurfrules/roadmaps/comments/etc
- [ ] Create front-end test to make sure that authenticated users get redirected to dashboard
- [ ] Verify that you have 100% test coverage for backend views
- [ ] Verify that users cannot see the years associated with any events (for privacy reasons)
- [ ] Create side "scrollbar" that shows years as well as events in their chronological order with appropriate spacing
- [ ] Create scrolling feature that "snaps" to the nearest event

### Pre-production
- [ ] Validate all user inputs (names, dates, event descriptions)
- [ ] Go through repo and clear out all todos
- [ ] Run through some test for any vulnerabilities?
- [ ] Lock down Django API views so that users can't access each other's data
- [ ] Remove all console.log steps (or toggle them to not run in production)
- [ ] Security: Ensure that CSRF tokens are enforced for all state-changing requests (maybe GET requests too for sensitive data?)
- [ ] Security: Ensure that HTTPS is used for all requests: Force redirect HTTP→HTTPS, set Secure flag on cookies
- [ ] Security: Implement rate limiting to avoid DoS attacks
- [ ] Security: Implement 2FA?
- [ ] Security: Implement API Security Headers
- [ ] Security: Regular Security Updates via Dependabot or something similar
- [ ] Backend: Move on from Nixpacks to current best practices (I'm getting a deprecation warning)

### Features
- [ ] Eventually, add AI-generated "tags" to events so that users can auto-filter events
- [ ] Create a feature requests page so that users can suggest and upvote features
- [ ] Enable photos on events
- [ ] Add timeline event share logic

### Optimizations
- [ ] Auto-generate requirements.txt from pyproject.toml so that you don't have to remember to export poetry when deploying to Railway
- [ ] Implement OpenAPI schema generation so that frontend inherits data models from backend (DRY)
- [ ] Change static/media to use S3
- [ ] Allow user blocking as first action (currently a post request to friendship is required as the primary action)
- [ ] Implement Data Encryption at Rest to protect database in case of breach
- [ ] Set up MCP for Context7
- [ ] Refactor views to be class-based so that every POST request doesn't need the csrf_exempt decorator
- [ ] Implement token blacklisting for JWTs (so that getting a new refresh token invalidates the old one)
- [ ] Implement cron job to clear out blacklisted tokens
