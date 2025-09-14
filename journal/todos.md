# Now
- [ ] On timeline page, dynamically grab user's events and display them
- [ ] On timeline page, enable creation of new events
- [ ] On timeline page, enable editing of existing events
- [ ] On timeline page, enable deletion of events

## Later
- [ ] JWT tokens using djangorestframework-simplejwt
- [ ] Password reset via Django's built-in email system
- [ ] Email verification using Django's activation tokens (to make sure a bot doesn't sign up)
- [ ] Rate limiting with django-ratelimit

- [ ] Go through packages and update any that are not needed
- [ ] Update readmes/windsurfrules/roadmaps/comments/etc
- [ ] Set up MCP for Context7
- [ ] Create front-end test to make sure that authenticated users get redirected to dashboard
- [ ] Verify that you have 100% test coverage for backend views
- [ ] Verify that users cannot see the years associated with any events (for privacy reasons)

## Fundamentals
### Pre-production
- [ ] Go through repo and clear out all todos
- [ ] Run through some test for any vulnerabilities?
- [ ] Lock down Django API views so that users can't access each other's data
### Optimizations
- [ ] Change static/media to use S3
- [ ] Allow user blocking as first action (currently a post request to friendship is required as the primary action)
