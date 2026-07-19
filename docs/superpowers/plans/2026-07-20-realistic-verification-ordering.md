# Realistic Verification and Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simplified safety and ordering lessons with realistic, local-only SMS, email, CAPTCHA, and restaurant ordering simulations for older learners.

**Architecture:** Keep `LessonEngine` as the phase and metrics owner. Add pure domain data and validators for verification and the expanded menu, then compose focused lesson subviews around those interfaces. All temporary values remain in React state and no new storage keys are introduced.

**Tech Stack:** React 18, TypeScript 5.6, Vite 8, Vitest 4, React Testing Library, CSS, local SVG illustrations.

## Global Constraints

- Traditional Chinese copy for Hong Kong older learners.
- No backend, external CAPTCHA service, SMS provider, email provider, payment, third-party tracking, brand copying, or personal-data persistence.
- Every primary touch target is at least 56px.
- Independent practice alone contributes to comparable duration metrics.
- Only failed check, next, or confirm actions increment `errorCount`.
- Hint, replay, CAPTCHA refresh, and alternative-mode actions increment `hintCount`.

---

### Task 1: Verification domain model

**Files:**
- Create: `src/domain/verification.ts`
- Create: `src/domain/verification.test.ts`

**Interfaces:**
- Produces: `SMS_CHALLENGE`, `EMAIL_MESSAGES`, `TEXT_CAPTCHA_CHALLENGES`, `IMAGE_CAPTCHA_CHALLENGES`, `validateSmsCode(code)`, `validateTextCaptcha(input, challenge)`, and `getImageSelectionFeedback(challenge, selectedIds)`.

- [ ] **Step 1: Write failing validator tests**

```ts
expect(validateSmsCode('381642')).toBe('correct')
expect(validateSmsCode('381')).toBe('incomplete')
expect(validateTextCaptcha('h7k3m', TEXT_CAPTCHA_CHALLENGES[0])).toBe(true)
expect(getImageSelectionFeedback(challenge, new Set(['bus-1']))).toBe('missing')
```

- [ ] **Step 2: Run `npm run test -- src/domain/verification.test.ts`**

Expected: FAIL because `verification.ts` does not exist.

- [ ] **Step 3: Implement fixed local challenge data and pure validators**

```ts
export function validateSmsCode(code: string): 'correct' | 'incomplete' | 'incorrect' {
  const normalized = code.replace(/\D/g, '')
  if (normalized.length < 6) return 'incomplete'
  return normalized === SMS_CHALLENGE.code ? 'correct' : 'incorrect'
}
```

- [ ] **Step 4: Re-run the focused test and expect PASS**

- [ ] **Step 5: Commit verification domain changes**

### Task 2: Three-method verification lesson

**Files:**
- Modify: `src/levels/captcha/CaptchaLesson.tsx`
- Modify: `src/levels/captcha/CaptchaLesson.css`
- Modify: `src/levels/captcha/CaptchaLesson.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/levels.ts`

**Interfaces:**
- Consumes: verification constants and validators from Task 1, plus existing `LessonController` methods.
- Produces: a complete lesson covering SMS, simulated inbox, text CAPTCHA, image CAPTCHA, and review.

- [ ] **Step 1: Replace the existing interaction test with a full three-method journey**

```tsx
await user.type(screen.getByLabelText('六位數短訊驗證碼'), '381642')
await user.click(screen.getByRole('button', { name: '確認驗證碼' }))
await user.click(screen.getByRole('button', { name: /智學手機：確認練習帳號/ }))
await user.click(screen.getByRole('button', { name: '確認練習帳號' }))
```

- [ ] **Step 2: Add focused tests for incomplete SMS, wrong email, CAPTCHA refresh, missing and extra image choices**

- [ ] **Step 3: Run `npm run test -- src/levels/captcha/CaptchaLesson.test.tsx` and verify the new tests fail**

- [ ] **Step 4: Implement accessible subviews inside `CaptchaLesson.tsx`**

```ts
type VerificationStage = 'sms' | 'email-inbox' | 'email-message' | 'text-captcha' | 'image-captcha'
```

Each subview receives only the state and callbacks it needs. `advanceStage` changes local stage; `lesson.complete()` is called only after the final image challenge.

- [ ] **Step 5: Add realistic phone verification, inbox, CAPTCHA, feedback, and responsive CSS**

- [ ] **Step 6: Update level and speech copy to name all three methods**

- [ ] **Step 7: Run focused tests and expect PASS**

- [ ] **Step 8: Commit the verification lesson**

### Task 3: Expanded restaurant domain model

**Files:**
- Modify: `src/domain/ordering.ts`
- Modify: `src/domain/ordering.test.ts`

**Interfaces:**
- Produces: `MENU_CATEGORIES`, twelve-entry `MENU_ITEMS`, `getMenuItemsByCategory(categoryId)`, bounded `setCartQuantity`, `getCartCount`, and `calculateCartTotal`.

- [ ] **Step 1: Write failing tests for six categories, twelve items, filtering, totals, removal, and the quantity cap**

```ts
expect(MENU_CATEGORIES).toHaveLength(6)
expect(MENU_ITEMS).toHaveLength(12)
expect(getMenuItemsByCategory('rice')).toHaveLength(2)
expect(setCartQuantity({}, 'char-siu-egg-rice', 12)).toEqual({ 'char-siu-egg-rice': 9 })
```

- [ ] **Step 2: Run `npm run test -- src/domain/ordering.test.ts` and expect FAIL**

- [ ] **Step 3: Implement the category and menu data with descriptions and image labels**

```ts
export interface MenuItem {
  id: MenuItemId
  categoryId: MenuCategoryId
  name: string
  description: string
  price: number
  imageLabel: string
}
```

- [ ] **Step 4: Add filtering, cart count, total, and quantity clamping functions**

- [ ] **Step 5: Run focused tests and expect PASS**

- [ ] **Step 6: Commit expanded restaurant data**

### Task 4: Realistic ordering lesson

**Files:**
- Modify: `src/levels/ordering/OrderingLesson.tsx`
- Modify: `src/levels/ordering/OrderingLesson.css`
- Modify: `src/levels/ordering/OrderingLesson.test.tsx`
- Modify: `src/data/levels.ts`

**Interfaces:**
- Consumes: category, menu, cart, and total interfaces from Task 3.
- Produces: category home, category menu, product detail, cart, review, and lesson completion states.

- [ ] **Step 1: Write a failing guided test for one `叉燒滑蛋飯`**

- [ ] **Step 2: Write a failing independent test that selects a category, adds two items, edits quantity, returns to the menu, and confirms the displayed total**

- [ ] **Step 3: Write a failing empty-cart validation test**

- [ ] **Step 4: Run `npm run test -- src/levels/ordering/OrderingLesson.test.tsx` and expect FAIL**

- [ ] **Step 5: Implement ordering view state**

```ts
type OrderingView = 'categories' | 'menu' | 'product' | 'cart' | 'confirm'
```

The guided flow validates a single `char-siu-egg-rice`. The independent flow persists the in-memory cart while the user moves among all five views.

- [ ] **Step 6: Build local SVG food illustrations and accessible category/menu cards**

- [ ] **Step 7: Implement the sticky cart summary, quantity controls, remove action, itemized total, and `確認練習訂單｜不會付款` action**

- [ ] **Step 8: Implement the reference-inspired visual hierarchy without copying branding or source images**

- [ ] **Step 9: Run focused tests and expect PASS**

- [ ] **Step 10: Commit the ordering lesson**

### Task 5: Regression, accessibility, and delivery verification

**Files:**
- Modify if needed: `src/styles/tokens.css`
- Modify if needed: `src/components/LessonLayout.css`
- Modify if needed: `README.md`

**Interfaces:**
- Consumes: completed lessons from Tasks 2 and 4.
- Produces: a verified build with documented local-only behavior.

- [ ] **Step 1: Run `npm run test`**

Expected: all tests pass.

- [ ] **Step 2: Run `npm run build`**

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Start the local site and inspect 390×844, desktop phone frame, keyboard focus, and 200% zoom**

- [ ] **Step 4: Verify no phone, email, CAPTCHA, or order values occur in the storage service or persisted payloads**

- [ ] **Step 5: Fix only defects found by these checks, rerun focused tests, then rerun the complete test and build commands**

- [ ] **Step 6: Commit final accessibility and documentation changes**

