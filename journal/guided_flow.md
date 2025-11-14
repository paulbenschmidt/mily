@TimelineView.tsx#L220-231

Replace the "Begin" button with a guided onboarding flow for first-time users with no events.

## UI Structure:

1. **Header text:**
   "Let's start with a few moments from your life. Pick 2-3 to begin:"

2. **Checkbox list** (vertically stacked, larger touch targets):
   ☐ Born / Childhood
   ☐ Graduated high school
   ☐ Started first job
   ☐ Met someone special
   ☐ Moved to a new city
   ☐ Became a parent
   ☐ Other milestone

3. **Primary CTA button:**
   - Text: "Continue with selected (X)" where X is the count of checked items
   - Disabled state when fewer than 2 items selected
   - Enabled with primary button styling when 2+ selected

4. **Secondary action** (below primary button, styled as text link or muted button):
   - Text: "or start from scratch"
   - Always clickable
   - Takes user directly to empty timeline with standard "Add Event" button

## Behavior:

- When user clicks "Continue with selected (X)":
  - Open a SINGLE modal that shows ALL selected events in a form
  - Modal title: "Add details to your events"
  - For each selected event, display in a stacked list format:
    * Event title (pre-populated with checkbox label, editable text input)
    * Date fields: Month dropdown + Year input (both required)
    * Visual separator between events (subtle line or spacing)
  - NO reflection notes field in this modal (we'll add those later from the timeline)
  - Single submit button at bottom: "Add to my timeline"
  - On submit: Create all events, close modal, show populated timeline
  - After timeline appears, show subtle success message: "Great start! Click any event to add your thoughts and memories."

- When user clicks "or start from scratch":
  - Bypass the guided flow entirely
  - Show empty timeline with standard "Add Event" button

## Styling notes:
- Checkboxes should be large enough for easy selection (min 24px)
- Add subtle hover states on checkbox rows
- Keep the same visual style as the rest of the timeline (your purple/indigo buttons)
- Maintain the centered, clean layout you currently have
- Modal should be clean and spacious, not cramped (adequate padding between event forms)
- Month dropdown should have common format (January, February, etc.);
- Year input should accept 4-digit years
