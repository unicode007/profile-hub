# Project Architecture Rules

- Keep the standalone Restaurant POS as a route that reuses the shared `RestaurantPOS` screen, and keep GST math in one shared helper so standalone and embedded billing stay consistent.