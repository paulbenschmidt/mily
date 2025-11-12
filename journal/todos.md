I have the next four days off of work, and I'd like to figure out how to spend this time.

Currently, I have a working MVP that allows users to add events with text, but photos/voice recordings are not yet available.

I only have a couple of users, who are all friends or family, so I think it makes sense to start talking to users before building this out.

While I haven't done very much user validation, there isn't really a single other personal timeline app, so I'm interested in building this for the sole purpose of being the dominant player in this space—prioritizing for high-quality building instead of popularity. If this project isn't successful, I can at least include it on my LinkedIn for reputability.

## In Progress
- Create paul@joinmily.com email with Cloudflare Email Routing
    - Set up paul@joinmily.com as alias
- Handle login for users who have deactivated their account
- BUG: Clicking on the Get Started/Login link on Landing Page with a valid token creates a white screen that requires refresh
- Create UTM parameters when sharing out different pages
    - Log UTM parameters on signup so that we can track where users are coming from
- Find test users
- Create Discord channel
- Post to Reddit
- Gather testimonials from users
- ESSENTIAL: Have system email me when a user signs up
- ENHANCE: Update demo pop-up to mention that filtering is available
- Create test account using `test@mily.bio`

## To Organize

## Sprint Backlog
### Essential
- ESSENTIAL: Create testimonials on landing page
- ESSENTIAL: Password reset
    - Password reset via Django's built-in email system (Allow users ability to change password)
- ESSENTIAL (needs polling): Implement premium payment system

### Feature
- FEATURE: Enable photos on events
    - Look into serving photos through Railway buckets? Vercel Blob is probably a better way to go.
    - AWS S3 + CloudFront would be most cost-effective at scale but is more complicated to set up.
    - Actually, let's make it so that users can add 10 photos before getting paywalled.
    - $24/year ($2/month) or $5/month
    - Maybe you could start the cost slightly higher than lower it over time as more users sign up, that way you could make it a marketing strategy to get more users to sign up and also give people updates on user growth (in a way that doesn't feel like spam). Maybe you could make it a challenge to get to 1000 users and then lower the cost.
- FEATURE (needs polling): Enable "Publicly Accessible" for "Share" button on event page
    - First find out HOW and WHY people want to share their timelines with others
    - Share individual events? Or at least link to a specific event?
    - Verify that users cannot see the years associated with any events (for privacy reasons)
- FEATURE (needs polling): Add tags to events and allow users to filter by them
    - Add AI-generated "tags" to events so that users can auto-filter events?
- FEATURE (needs polling): Add age to profile (which auto-creates an event for the user's birthday)
    - This would allow users to see how old they were when experienced an event (which would allow users to weave timelines and see how their lives tracked when accounting for age)
    - If I add it as part of the profile, I can add a little blurb that says "this field will be used to calculate your age for each event". It'll also auto-add an event to the user's timeline for their birthday.

### Enhancement
- ENHANCE: Update landing page timeline example to have larger font size (maybe shorten descriptions, too)
- ENHANCE (needs polling): What should the design look like? (neumorphism, soft brutalism, etc)
- ENHANCE: For friend requests, allow user blocking as first action
    - Currently a post request to friendship is required as the primary action

### Security
- SECURITY: Legal review of Terms and Privacy Policy
    - Get a lawyer to review and add formal policy language
    - Add the technical/compliance details I mentioned
    - Consider creating a separate formal "Privacy Policy" page with legal language, keeping this as a "Privacy & Trust" values page
- SECURITY: Implement cron job to clear out blacklisted tokens

### Tech Debt
- TECHDEBT: Set up cron job to delete users after 30 days of `deactivated_at` and `is_active=False`

## Backlog
- FEATURE (needs polling): Onboarding flow for initial events
    - Bob recommended something that makes the initial "Begin" screen not look so intimidating. Here's his message: "I entered some events in Mily. Easy enough to use interface. I added a few events. I know it’s very much a work in process so no in depth notes at this time. It was a bit intimidating to start building a timeline so my top of mind idea is to include some sort of ‘line manager’ (🤓) assistant tool to help kickstart. Maybe some drop downs with suggested events, example profiles a bit more fleshed out, pro tips. That sort of thing."
- ENHANCE: Set up virtual receptionist with Voice Standard (using Google Workspace)?
- ENHANCE: Control how AI crawlers access site on Cloudflare (do I want the extra visibility?)
- ENHANCE: Change TTL to 3600-86400 seconds (to speed up requests for repeat visitors)
- ENHANCE: Create a feature requests page so that users can suggest and upvote features
- ENHANCE (needs polling): Add dots within year separators (one per year) for visual indicator of duration between events
- FEATURE: Enable voice recording on events
    - So that users could record their thoughts and experiences. I'm imagining a grandparent who leaves stories for their grandchildren, or a parent who leaves stories for their children. It would be a very personal way to share your story.
- FEATURE: Add search bar to timeline page to help people easily dig up events
    - When clicking on an event, it should center the timeline on that event
- FEATURE: Create timeline "weave" with friends
    - I think the name "weave" because of the visual image, but also because it has the word "we"
    - You could have two different weave versions: one is just showing two timelines on the same year, the other could be showing two timelines relative to the ages. The second one sounds novel and unique: you could look at what a parent and child experienced in the same year, or two friends of different ages experienced in the same year. <3. I thought of this when I was thinking about seeing the difference between my timeline and Jackson's timeline.
- ENHANCE: Add logo to loading spinners and to footer
- ENHANCE: Go through packages and update any that are not needed
- TECHDEBT: Update readmes/windsurfrules/roadmaps/comments/etc
- STABILITY: Create front-end test to make sure that authenticated users get redirected to dashboard
- STABILITY: Verify that you have 100% test coverage for backend views
- STABILITY: Validate all user inputs (names, dates, event descriptions)
- TECHDEBT: Go through repo and clear out all todos
- SECURITY: Run site through some automated security test for any vulnerabilities?
- SECURITY: Lock down Django API views so that users can't access each other's data
- SECURITY: Remove all console.log steps (or toggle them to not run in production)
- SECURITY: Ensure that HTTPS is used for all requests: Force redirect HTTP→HTTPS, set Secure flag on cookies
- SECURITY: Implement 2FA?
- SECURITY: Regular Security Updates via Dependabot or something similar
- TECHDEBT: Backend: Move on from Nixpacks to current best practices (I'm getting a deprecation warning)
- ENHANCE: Have navigation bar along the bottom include: Timeline, Friends, Shop, Donate, Settings
- ENHANCE: Make it so that the top event on a timeline does not continue extending above the dot.
- ENHANCE: Make the date stuck in the top-left corner (so that it doesn't move when the card is expanded)
    - The dot should be stuck in the top-left corner as well. This way the timeline extends downward, without the date moving.
- ENHANCE: Create scrolling feature that "snaps" to the nearest event
- ENHANCE: Offer optional world events that can be added to the timeline
- ENAHNCE (needs polling): Ability to select multiple events and update/delete them
- ENHANCE: Auto-generate `requirements.txt` from `pyproject.toml`
    - So that you don't have to remember to export poetry when deploying to Railway
- ENHANCE: Implement OpenAPI schema generation so that frontend inherits data models from backend (DRY)
- ENHANCE: Change static/media to use S3
- ENHANCE: Implement Data Encryption at Rest to protect database in case of breach
- WORKFLOW: Set up MCP for Context7
- TECHDEBT: Refactor views to be either class-based or function-based
- ENHANCE: Set up Google Analytics once I have many more users or I want to track specific features
- ENHANCE: On mobile UI, fix where the filter event/privacy selections appear, since they're slightly off.
    - Note: this currently only happens on the browser for iPhones like iPhone 14 Pro Max. For some reason, the dropdown shifts farther away. This might not be too big of a concern since this is on mobile browsers, and the future app will have a different layout.
