# RescueBytes Admin Dashboard — Screen Specification Document

**Purpose:** Complete screen-by-screen description of the current web admin dashboard for redesign reference.  
**Stack:** React 19 + TypeScript, Tailwind CSS v4, React Router v7, Leaflet maps, Radix UI, Lucide icons.  
**Current color scheme:** Primary blue (`bg-blue-800` / `#1e40af`), white backgrounds, gray-100 page background.

---

## Shared Component: Navbar

**File:** `src/components/Navbar.tsx`  
**Present on:** Every page except Login

### Layout
Horizontal top bar, dark blue background (`bg-blue-800`), white text, fixed height (`h-16`).

### Left side
- Logo image (`RESCUE (4).png`) — 40×40px circular
- "RescueBytez" brand text — bold, xl
- Navigation links (desktop only, hidden on mobile):
  - **Dashboard** → `/home`
  - **SOS Map** → `/sos-map`
  - **Alerts** → `/warnings`
  - **Danger Zones** → `/danger-zones`
  - Active link has `border-b-2 border-white` underline; inactive has transparent border that turns gray on hover

### Right side
- **Bell icon button** — shows red badge with count of active SOS alerts (fetches latest 10 on load)
  - Clicking opens a dropdown panel (width 320px, white, rounded, shadow)
  - Dropdown header: "Emergency SOS Alerts" + red pill badge with count
  - Each SOS alert row: red-tinted background, red circle icon with warning symbol, user email, lat/lng coordinates, time-ago (e.g. "5m ago")
  - Scrollable up to max-height 384px
  - Footer link: "View all emergency alerts" → navigates to `/sos-map`
- **Avatar** — small blue circle with "AD" text
- **Logout button** — red (`bg-red-600`), rounded, calls `POST /auth/logout` then redirects to `/login`

### Mobile
- Hamburger icon replaces nav links
- Opens vertical menu below navbar with same links

---

## Screen 1: Login

**File:** `src/pages/Logi.tsx`  
**Route:** `/login`  
**Auth:** Public (no navbar)

### Layout
Full-page centered column on gray-50 background.

### Elements (top to bottom)
1. **Logo area**
   - Small white circle with `RESCUE (3).png` image (32×32px)
   - "RescueBytez" — 3xl, bold, centered
   - Subtitle: "Sign in to access the disaster management platform" — small, gray-600

2. **Login card**
   - White background, rounded-lg, shadow, padded (`px-10 py-8`)
   - Max width: 448px, centered
   - **Error message** — red text, centered (conditionally visible)
   - **Email field** — label "Email address", text input, placeholder `kottayam@email.com`, pre-filled with `kottayam@email.com`
   - **Password field** — label "Password", password input with show/hide toggle eye icon (Lucide `Eye`/`EyeOff`), placeholder `12345678`, pre-filled with `12345678`
   - **Remember me** checkbox + label (left) | **Forgot your password?** link (right, blue)
   - **Sign in button** — full width, blue-800, white text
   - Divider: "Don't have an account?"
   - **Register your community** — outlined button, full width, gray border

3. Footer: "© 2025 RescueBytez. All rights reserved." — small, centered, gray-500

### Behavior
- On submit: `POST /auth/login` with email + password
- On success: saves session token in cookie, redirects to `/home`
- Auto-redirects to `/home` if session cookie already exists

---

## Screen 2: Dashboard (Home)

**File:** `src/pages/Home.tsx`  
**Route:** `/home`

### Layout
Gray-100 background, full height. Navbar → white header bar → main content → footer.

### Header bar
White background, shadow. "Admin Dashboard" — 3xl bold. (Dropdown icon present but unused.)

### Section 1: Emergency Status Panel
White card, rounded, shadow. Title "Emergency Status" — lg, medium.

**3 stat cards** in a responsive grid (1 col → 2 col → 3 col):

| Card | Color | Icon | Data |
|---|---|---|---|
| Active SOS | red-100 bg, red-500 icon bg | Warning triangle | `stats.sosCount` |
| Service Requests | yellow-100 bg, yellow-500 icon bg | Info circle | `stats.userReq` |
| Available Volunteers | green-100 bg, green-500 icon bg | People group | `stats.volunteerCount` |

Each card: icon in colored square (48×48px) + label (small, gray-500) + value (3xl, bold, gray-900).  
Loading state: centered blue spinner + "Loading statistics..." text.  
Error state: red-100 box with error message.

### Section 2: Feature Grid
6 feature cards in a responsive 3-column grid. Each card: white, rounded, shadow, hover lifts shadow.

| # | Title | Description | Link text | Route |
|---|---|---|---|---|
| 1 | Inventory Management | Track and manage emergency supplies, request resources from other districts | "Manage inventory →" | `/Manageinventory` |
| 2 | User Requests | View and respond to service requests from community members | "View requests →" | `/user-request` |
| 3 | News Manager | Publish important updates, emergency instructions, community news | "Manage news →" | `/newspage` |
| 4 | SOS Map | View and respond to emergency SOS signals on an interactive map | "Open map →" | `/sos-map` |
| 5 | Community Reports | Approve and broadcast community reported news | "Approve Reports →" | `/communityReports` |
| 6 | Allocating Volunteers | Manage volunteer resources, assign tasks based on skills | "Manage volunteers →" | `/volunteer` |

Each card: blue-800 icon square (48×48, white icon) + title (lg bold) + description (sm gray-500) + blue link text.

### Footer
White, border-top. "© 2025 RescueBytez. All rights reserved." left-aligned.

---

## Screen 3: SOS Map

**File:** `src/pages/SosMap.tsx`  
**Route:** `/sos-map`

### Layout
Full-height flex column. Navbar → main content → footer.

### Main card
White, rounded, shadow, padded. Contains:

**Header row:**
- Blue-800 square icon (map pin) + "SOS Location Map" title
- (Filter dropdown area — currently empty)

**Subheader row (when data loaded):**
- Text: "X active emergency alerts. Coordinate emergency response teams and resources efficiently." OR "No active emergency alerts at this time."
- **Refresh button** — blue, with circular arrow icon

**Map container:**
- Leaflet map, OpenStreetMap tiles
- Centered on Kottayam (9.7552°N, 76.6501°E) by default
- Auto-fits bounds to show all SOS markers
- Zoom controls bottom-right
- Height: 384px (`h-96`), full width, rounded border

**Marker popups** (shown on click):
- "EMERGENCY SOS" red badge
- "SOS Alert (Xm ago)" title
- User email (with person icon)
- Rescue center name (with building icon)
- Coordinates formatted to 5 decimal places (with pin icon)
- Timestamp (with clock icon)
- Priority badge: "Priority: High" (red) + ID last 6 chars
- Two buttons: **Dispatch Team** (blue) + **Contact User** (gray) — currently non-functional

**Active Emergencies table** (shown when alerts exist):
Columns: ID | User | Rescue Center | Time | Actions  
Each row: sequential number, user email, rescue center name, full timestamp, **Resolve** button (red text).  
Resolve calls `POST /deleteSOS` and refreshes list.

**Toast notifications:**
- Green toast on successful resolve: "SOS Alert successfully resolved!"
- Red toast on error: "Error resolving SOS Alert!"
- Auto-dismiss after 5 seconds, manual close button

**States:** Loading spinner | Error message + "Try Again" button | Empty state (no alerts message) | Populated map + table

### Auto-refresh
Polls every 5 minutes (300,000ms interval).

---

## Screen 4: Alerts / Warnings Management

**File:** `src/pages/Warning.tsx`  
**Route:** `/warnings`

### Layout
Gray-100 background. Navbar → white header → main content → footer.

### Header bar
White, shadow. "Warnings Management" — 3xl bold.

### Main panel
White card, rounded, shadow.

**Panel header row:**
- "Active Warnings" title (lg)
- **Add Warning** button — blue-800, top-right

**Warning cards** (vertical list, gap-6):
Each card: white, rounded, shadow, hover lifts, **left border stripe** (4px) colored by severity:
- `high` → red-500 border
- `medium` → yellow-500 border
- `normal` → blue-500 border

Card contents:
- Title (lg bold) + severity badge + "Active" status badge (inline, row)
  - Severity badges: `high` = red-100/red-800, `medium` = yellow-100/yellow-800, `normal` = blue-100/blue-800
- Date (sm, gray-500)
- Description text (sm, gray-600)
- **Delete icon button** — trash icon, gray-400, turns red-500 on hover (top-right of card)

**Empty state:** "No warnings found. Click 'Add Warning' to create one." centered gray text.

**Loading state:** Centered blue spinner.

### Add Warning Modal
Triggered by "Add Warning" button. Standard modal overlay (gray-500 at 75% opacity).

Modal contents:
- Red circle icon with warning triangle
- "Add New Warning" title
- **Warning Title** text input (required)
- **Description** textarea (4 rows, required)
- **Severity Level** select: Normal | Medium | High
- **Issue Warning** button — red-600, submit
- **Cancel** button — white/gray outlined

### Footer
Same as Dashboard footer with Help Center, Privacy Policy, Terms of Service links.

---

## Screen 5: News Management

**File:** `src/pages/NewsManagement.tsx`  
**Route:** `/newspage`

### Layout
Gray-100 background. Navbar → white header → two content sections → footer.

### Header bar
White, shadow. "News Management" — 3xl bold.

### Section 1: News Cards Grid
White card, rounded, shadow.

**Panel header:**
- "Community News" title
- **Add News** button — blue-800

**Cards grid:** 1 col → 2 col → 3 col responsive.

Each news card: white, rounded, border (gray-200), shadow, hover lifts.
- Title (lg bold, gray-900) + **Delete icon** (trash, top-right, red on hover)
- Date (sm, gray-500)
- Description — truncated to 3 lines (`line-clamp-3`, sm, gray-600)
- Bottom row: **Edit** text button (blue-600) | Priority badge (bottom-right, absolute positioned)
  - Priority badges: `high` = red, `medium` = yellow, `normal` = blue

**Empty state:** "No news items available. Click 'Add News' to create one."  
**Loading state:** Blue spinning ring + "Loading news..." text.  
**Error state:** Red-100 box with error text.

### Section 2: Recent Posts History Table
White card, rounded, shadow. "Recent Posts History" title.

Table columns: Title | Date | Priority | Actions  
Actions: **Edit** (blue text) + **Delete** (red text)  
Table header: gray-50 background.

### Add News Modal
- Blue circle icon with pencil
- "Add New Announcement" title
- **Title** text input (required)
- **Description** textarea (4 rows, required)
- **Priority** select: Normal | Medium | High
- **Publish** button — blue-800
- **Cancel** button — outlined

### Edit News Modal
Same layout as Add, pre-populated with existing values. Submit button labeled "Update".

---

## Screen 6: User Requests

**File:** `src/pages/UserRequest.tsx`  
**Route:** `/user-request`

### Layout
Gray-100 background. Navbar → main content (no separate header bar, title inline).

### Content area
Max width 7xl, padded. "Service Requests" — 2xl semibold.

**Search bar:**
Full width text input, "Search requests..." placeholder, search icon (magnifier) on right.  
Searches across: request ID, item name, category/type.

### Requests Table
Blue-700 header row (white text). White body with gray dividers.

Columns:
| Column | Content |
|---|---|
| Request ID | Sequential number (1, 2, 3...) |
| User Email | Resolved from user dictionary via user ID |
| Category | Request type string |
| Item | Item name |
| Status | Colored pill badge |
| Actions | Approve + Reject buttons |

**Status badges** (pill, white text):
- `pending` → yellow-500
- `Approved` → green-500
- `Rejected` → red-500

**Action buttons** (per row):
- **Approve** — green-500, active only when status is `pending`
- **Reject** — red-500, active only when status is `pending`
- Both disabled (gray-300, cursor-not-allowed) when not pending

**Empty state:** Sad face SVG + "No requests found matching your criteria" gray text.

---

## Screen 7: Manage Inventory

**File:** `src/pages/ManageInventory.tsx`  
**Route:** `/Manageinventory`

### Layout
Gray-100 background. Navbar → content container.

### Page header row
"Manage Inventory" — 3xl bold. Two buttons right-aligned:
- **Add Items** — blue-600
- **Make a Request** — blue-600

### Section 1: Current Inventory Table
White card, rounded, shadow. Blue-800 header bar ("Current Inventory" white text).

Table columns: **Item** | **Count**  
Rows: item name + quantity for each inventory item.

### Section 2: Incoming Requests Table
White card, rounded, shadow. Blue-800 header bar ("Incoming Requests" white text).

Table columns: **Item** | **Count** | **From Center** | **Action**  
Action: **Transfer** button (green-600) per row.  
Transfer pre-fills the Transfer modal with item + requesting center.

### Modals (3 total, same visual style — backdrop blur)

**Make a Request Modal:**
- "Request Item" title
- Item text input
- Count number input
- Cancel (gray) + Submit (blue) buttons

**Add Items Modal:**
- "Add Item" title
- Item text input
- Count number input
- Cancel + Submit buttons

**Transfer Modal:**
- "Transfer Item" title
- Item field (read-only, gray bg)
- To Center field (read-only, gray bg, pre-filled from requesting center)
- Count number input (editable)
- Cancel + Submit buttons

---

## Screen 8: Community Reports

**File:** `src/pages/CommunityReq.tsx`  
**Route:** `/communityReports`

### Layout
Gray-100 background. Navbar → centered container (`lg:px-32`).

### Main card
White, rounded, shadow, full-width within container.

**Blue-700 header band** (full width):
- Clock icon (Lucide) + "Community Reports" — 3xl extrabold white
- Subtitle: "Review and manage incoming community requests" — blue-100

**Reports list** (padded content area, `space-y-4`):

Each report card: white bg, **yellow-500 left border** (4px), rounded, shadow, hover lifts shadow, transition animation.

Card layout (flex row on desktop, column on mobile):
- **Left side (report details):**
  - Report type — xl bold, gray-800
  - Description — sm/base, gray-600
  - Timestamp row: calendar icon + formatted date/time (e.g. "May 15, 2026, 10:30 AM")
- **Right side (action buttons, stacked vertical):**
  - **Approve** — green-50 bg, green-600 text, animated check icon (Lucide `Check`) on hover
  - **Reject** — red-50 bg, red-600 text, animated X icon (Lucide `X`) on hover

**Empty state:** Blue-50 box, "No pending community reports" + "All reports have been processed" — centered, gray.

### Behavior
- Approve: `POST /approveComReq` → refreshes list
- Reject: `POST /comReportsRejected` → refreshes list
- Only shows unapproved reports (`getComRepAdm` endpoint)

---

## Screen 9: Volunteer Allocation

**File:** `src/pages/AllotingVolunteer.tsx`  
**Route:** `/volunteer`

### Layout
Gray-100 background. Navbar → main content.

### Content area
Max width 7xl. "Volunteer Allocation" — 2xl semibold.

**Search bar:**
Full-width input, "Search volunteers / Expertise ..." placeholder, magnifier icon right.  
Filters by: name, field of expertise, address.

### Volunteer List
White card, rounded, shadow. Divides rows with gray-200 borders.

Each volunteer row (flex row, responsive):

**Left side (volunteer info):**
- Name — sm, blue-600, truncated
- Phone row: phone icon + phone number
- Address row: map pin icon + address
- Expertise row: shield icon + "Expertise: [field]"

**Right side (actions):**
- **Message** button — blue-600, with chat bubble icon

**Empty state:** "No volunteers match your search criteria" — centered gray text.

### Message Modal
Triggered by "Message" button on a volunteer row. Standard modal overlay.

Contents:
- "Message to [Volunteer Name]" title
- **Subject** text input
- **Message** textarea (4 rows)
- Info footer: "Volunteer Contact: [phone]" + "Area of Expertise: [field]"
- **Cancel** (outlined gray) + **Send Message** (blue-600) buttons

Behavior: `POST /addVolunteerMessage` with userId, subject, message. Shows browser alert on success.

---

## Screen 10: Danger Zones

**File:** `src/pages/DangerZones.tsx`  
**Route:** `/danger-zones`

Referenced in the Navbar. Admin can define and manage geographic danger zone polygons/circles. Types: flood, fire, chemical, landslide, other. Severity levels: low, medium, high, critical.

*(Full UI details not shown here — uses the `DangerZone` model with GeoJSON geometry.)*

---

## Summary: Route Map

| Route | Screen | File |
|---|---|---|
| `/login` | Login | `Logi.tsx` |
| `/home` | Dashboard | `Home.tsx` |
| `/sos-map` | SOS Map | `SosMap.tsx` |
| `/warnings` | Alerts/Warnings | `Warning.tsx` |
| `/newspage` | News Management | `NewsManagement.tsx` |
| `/user-request` | User Requests | `UserRequest.tsx` |
| `/Manageinventory` | Inventory | `ManageInventory.tsx` |
| `/communityReports` | Community Reports | `CommunityReq.tsx` |
| `/volunteer` | Volunteer Allocation | `AllotingVolunteer.tsx` |
| `/danger-zones` | Danger Zones | `DangerZones.tsx` |

---

## Current Design Patterns (for reference/replacement)

**Colors:**
- Primary: `blue-800` (#1e40af) — navbar, buttons, table headers
- Danger/SOS: `red-500`/`red-600`
- Success: `green-500`/`green-600`
- Warning: `yellow-500`
- Page background: `gray-100`
- Cards: white

**Typography:** Tailwind defaults (Inter-ish). Headings: `font-bold`/`font-semibold`. Body: `text-sm`/`text-base`.

**Cards:** `bg-white rounded-lg shadow` with `hover:shadow-md` on interactive items.

**Modals:** Dark overlay (`bg-gray-500 opacity-75`), centered white card, max-w-lg, rounded-lg, shadow-xl.

**Tables:** `min-w-full`, `divide-y divide-gray-200`, `hover:bg-gray-50` on rows, `bg-blue-700` or `bg-gray-50` headers.

**Buttons:**
- Primary: `bg-blue-800 text-white hover:bg-blue-700`
- Danger: `bg-red-600 text-white hover:bg-red-500`
- Success: `bg-green-500 text-white hover:bg-green-600`
- Ghost/Outlined: `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`

**Forms:** `border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`

**Badges/Pills:** `px-2 py-1 text-xs font-medium rounded-full` or `rounded-md`

**Severity color coding (consistent across pages):**
- high → red
- medium → yellow
- normal/low → blue
