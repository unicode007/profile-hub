# Restaurant Floor-Plan Table View

## Goal
Replace the restaurant's basic table grid with an interactive floor-plan view based on the reference image, while preserving the existing POS and table-status workflows.

## Work
- Show tables as distinct round, square, or rectangular floor-plan objects, with clear available, reserved, occupied/billed, and cleaning states.
- Add section filtering and a compact status legend; keep table selection connected to the existing POS behavior.
- Add a create-table flow for table number, seating capacity, shape, section, and floor-plan placement. Prevent duplicate table numbers and let staff reposition tables in the layout.
- Make the floor plan adapt to desktop, tablet, and phone screens without obscuring table labels or actions.
- Use the existing restaurant demo data and component patterns; do not change billing, reservations, menu, or backend behavior.

## Technical notes
- Extend the existing restaurant table model with placement data and keep its current in-session demo-state approach.
- Implement the visual floor layout and table editor within the restaurant module; use the project's existing UI components and semantic theme tokens.
- Verify adding a table, selecting it into POS, status rendering, placement interaction, and narrow-screen layout.