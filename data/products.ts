// Products are addressed by name, never by id: the demo database is re-seeded
// regularly and every product gets a new id when that happens.
export const PRODUCTS = {
  clawHammer: 'Claw Hammer',
  boltCutters: 'Bolt Cutters',
} as const;
