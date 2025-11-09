## Now
- [ ] Create paul@joinmily.com email with Cloudflare Email Routing
- Handle login for users who have deactivated their account
- BUG: Clicking on the Get Started/Login link on Landing Page with a valid token creates a white screen that requires refresh
- Create UTM parameters when sharing out different pages
- Find ~50 solid users to test the web app, once it's been thoroughly tested, find a way to add charges then create a mobile app
    - Pursue older generation
    - Look at people who have reviewed previous apps or are active on mental health forums
    - Go through the Claude response in the thread `Timeline app privacy policy review`
- Marketing strategies:
    - Older generation:
        - Why? This generation has both time and money, as well as a desire to share their story with other people, so if you can create a platform that is easy to use, I think this will be a good fit. I originally wanted to target the younger, sexier generation, but I think this generation is more likely to be interested in this kind of platform—and more likely to pay for features, too.
        - How?
            - Dayton newspaper: Advertise it as a reflection tool, have them interview me
            - Entrepreneur's Center: Have them feature me in their newsletter
            - Websites: Search for "timeline" and "timeline creator" and reach out to the website owners to be featured
            - Medium: Create a Medium account and start writing about Mily
    - People in therapy:
        - Why? These people have a stronger desire to reflect on their lives and many want their stories to be seen/heard.
        - How?
            - Cold outreach to therapists in the region
            - Find blogs and websites that discuss mental health and therapy and reach out to them

## Upcoming
- [ ] Look into serving photos through Railway buckets? Vercel Blob is probably a better way to go.
    - AWS S3 + CloudFront would be most cost-effective at scale but is more complicated to set up.
    - Actually, let's make it so that users can add 10 photos before getting paywalled.
    - $24/year ($2/month) or $5/month
- Password reset
- [ ] Enable photos on events
- [ ] Enable voice recording on events (so that users could record their thoughts and experiences). I'm imagining a grandparent who leaves stories for their grandchildren, or a parent who leaves stories for their children. It would be a very personal way to share your story.
- Add search bar to timeline page to help people easily dig up events (when clicking on an event, it should center the timeline on that event)
- Post to Reddit
- Add "Demo" to Landing Page so that users have an easy way to see what Mily is all about
- Enable "Publicly Accessible" for "Share" button on event page
    - First find out HOW and WHY people want to share their timelines with others
- [ ] Create timeline "weave" with friends (I think the name weave because of the visual image, but also because it has the word "we")
    - You could have two different weave versions: one is just showing two timelines on the same year, the other could be showing two timelines relative to the ages. The second one sounds novel and unique: you could look at what a parent and child experienced in the same year, or two friends of different ages experienced in the same year. <3. I thought of this when I was thinking about seeing the difference between my timeline and Jackson's timeline.
- [ ] Verify that users cannot see the years associated with any events (for privacy reasons)
- [ ] Password reset via Django's built-in email system (Allow users ability to change password)
- [ ] Add logo to loading spinners and to footer
- [ ] Add tags to events and allow users to filter by them
- [ ] Go through packages and update any that are not needed
- [ ] Update readmes/windsurfrules/roadmaps/comments/etc
- [ ] Create front-end test to make sure that authenticated users get redirected to dashboard
- [ ] Verify that you have 100% test coverage for backend views

### Pre-production
- Legal review of Terms and Privacy Policy
    - Get a lawyer to review and add formal policy language
    - Add the technical/compliance details I mentioned
    - Consider creating a separate formal "Privacy Policy" page with legal language, keeping this as a "Privacy & Trust" values page
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
- Have navigation bar along the bottom include: Timeline, Friends, Shop, Donate, Settings
- UI: Currently, for the top event, the line extends above the dot. I should probably just hide the top part of the line for the first event.
- UI: Make the date stuck in the top-left corner (so that it doesn't move when the card is expanded). The dot should be stuck in the top-left corner as well. This way the timeline extends downward, without the date moving.
- UI: Change design to be Neumorphism? or Soft Brutalism?
- [ ] Create scrolling feature that "snaps" to the nearest event
- UX: Offer optional world events that can be added to the timeline
- UX: Create dotted line between events where the spacing is variable based on the distance between events
- Modify filter to allow for multiple categories/privacy settings
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
- Set up Google Analytics once I have many more users or I want to track specific features
- Set up cron job to delete users after 30 days of `deactivated_at` and `is_active=False`
- UI: On mobile, fix where the filter event/privacy selections appear, since they're slightly off.
    - Note: this currently only happens on the browser for iPhones like iPhone 14 Pro Max. For some reason, the dropdown shifts farther away. This might not be too big of a concern since this is on mobile browsers, and the future app will have a different layout.
- [ ] Eventually, add AI-generated "tags" to events so that users can auto-filter events
- [ ] Create a feature requests page so that users can suggest and upvote features
- [ ] Add timeline event share logic (sharing individual events)
