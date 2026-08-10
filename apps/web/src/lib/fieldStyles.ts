/**
 * The one field surface, shared by every form control.
 *
 * Implements `DESIGN.md` → Components → `input-text` and the Translucent Overlays
 * scale: `.08` fill on the ground, `.15` border, stepping to `.16` fill and `.22`
 * border on hover. Amber focus comes from the global `:focus-visible` outline in
 * `index.css`; controls add only the border shift on top of it.
 *
 * Deliberately plain utility classes rather than a Tailwind `@utility`, so that
 * `cn`'s tailwind-merge can still resolve a caller's `className` overrides
 * against them — a custom utility would be opaque to the merge.
 */
const FIELD_SURFACE_BASE =
  'rounded-lg border border-foreground/15 bg-foreground/[0.08] text-foreground shadow-[inset_0_1px_0_rgba(217,231,238,0.04)] transition-[border-color,background-color,box-shadow] duration-200 outline-none';

/**
 * The surface for a control that is itself the focusable element — `Input`,
 * `Textarea`, and the popover triggers. State variants key off the element's own
 * `:hover` / `:focus-visible` / `:disabled` / `aria-invalid`.
 */
export const FIELD_SURFACE = `${FIELD_SURFACE_BASE} hover:border-foreground/22 hover:bg-foreground/[0.16] focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive`;

/**
 * `FIELD_SURFACE` plus the open-state treatment for controls that own a popover —
 * Select, ComboBox, MultiSelect, DatePicker. Lifts to the raised surface while the
 * panel is open so the trigger reads as part of it.
 */
export const FIELD_TRIGGER_SURFACE = `${FIELD_SURFACE} data-[state=open]:border-foreground/30 data-[state=open]:bg-surface-raised`;

/**
 * The same surface for a wrapper that draws the field box around a nested control
 * (`InputGroup`, and so `NumberField`). Identical values to `FIELD_SURFACE`, but the
 * focus and invalid states key off the inner `[data-slot=input-group-control]`,
 * since the wrapper itself never receives focus.
 */
export const FIELD_GROUP_SURFACE = `${FIELD_SURFACE_BASE} hover:border-foreground/22 hover:bg-foreground/[0.16] has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot][aria-invalid=true]]:border-destructive`;
