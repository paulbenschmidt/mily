## Now
- Enable "Publicly Accessible" for "Share" button on event page
- Fix Django Admin on Railway

## Upcoming
- [ ] Allow users to delete their accounts
- [ ] Verify that users cannot see the years associated with any events (for privacy reasons)
- [ ] Password reset via Django's built-in email system (Allow users ability to change password)
- [ ] Look into serving photos through Railway buckets?
- [ ] Add logo to loading spinners and to footer
- [ ] Add tags to events and allow users to filter by them
- [ ] Go through packages and update any that are not needed
- [ ] Update readmes/windsurfrules/roadmaps/comments/etc
- [ ] Create front-end test to make sure that authenticated users get redirected to dashboard
- [ ] Verify that you have 100% test coverage for backend views

### Pre-production
- [ ] Validate all user inputs (names, dates, event descriptions)
- [ ] Go through repo and clear out all todos
- [ ] Run through some test for any vulnerabilities?
- [ ] Lock down Django API views so that users can't access each other's data
- [ ] Remove all console.log steps (or toggle them to not run in production)
- [ ] Security: Ensure that HTTPS is used for all requests: Force redirect HTTP→HTTPS, set Secure flag on cookies
- [ ] Security: Implement 2FA?
- [ ] Security: Regular Security Updates via Dependabot or something similar
- [ ] Backend: Move on from Nixpacks to current best practices (I'm getting a deprecation warning)

### Optimizations
- UI: Currently, for the top event, the line extends above the dot. I should probably just hide the top part of the line for the first event.
- UI: Make the date stuck in the top-left corner (so that it doesn't move when the card is expanded). The dot should be stuck in the top-left corner as well. This way the timeline extends downward, without the date moving.
- UI: Change design to be Neumorphism? or Soft Brutalism?
- [ ] Create scrolling feature that "snaps" to the nearest event
- UX: Offer optional world events that can be added to the timeline
- UX: Create dotted line between events where the spacing is variable based on the distance between events
- Modify filter to allow for multiple categories
- Ability to select multiple events and update/delete them
- [ ] Auto-generate requirements.txt from pyproject.toml so that you don't have to remember to export poetry when deploying to Railway
- [ ] Implement OpenAPI schema generation so that frontend inherits data models from backend (DRY)
- [ ] Change static/media to use S3
- [ ] Allow user blocking as first action (currently a post request to friendship is required as the primary action)
- [ ] Implement Data Encryption at Rest to protect database in case of breach
- [ ] Set up MCP for Context7
- [ ] Refactor views to be either class-based or function-based
- [ ] Implement cron job to clear out blacklisted tokens

### Features that should be polled
- How can I add age? Should I make it optional for users to add a birthday?
    - If I add it as part of the profile, I can add a little blurb that says "this field will be used to calculate your age for each event". It'll also auto-add an event to the user's timeline for their birthday.

### Other
- UI: On mobile, fix where the filter event/privacy selections appear, since they're slightly off.
    - Note: this currently only happens on the browser for iPhones like iPhone 14 Pro Max. For some reason, the dropdown shifts farther away. This might not be too big of a concern since this is on mobile browsers, and the future app will have a different layout.
- [ ] Eventually, add AI-generated "tags" to events so that users can auto-filter events
- [ ] Create a feature requests page so that users can suggest and upvote features
- [ ] Enable photos on events
- [ ] Add timeline event share logic (sharing individual events)
