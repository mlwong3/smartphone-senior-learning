import { useState } from 'react'
import { Icon } from '../../components/Icons'
import { LessonEngine, type LessonController } from '../../components/LessonEngine'
import { LessonLayout } from '../../components/LessonLayout'
import {
  MAX_CART_QUANTITY,
  MENU_CATEGORIES,
  MENU_ITEMS,
  calculateCartTotal,
  getCartCount,
  getMenuItemsByCategory,
  setCartQuantity,
  type Cart,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
  type MenuItemId,
} from '../../domain/ordering'
import type { LessonMetrics } from '../../types'
import './OrderingLesson.css'

type OrderingView = 'categories' | 'menu' | 'product' | 'cart' | 'confirm'

interface OrderingLessonProps {
  onBack: () => void
  onComplete: (metrics: LessonMetrics) => void
  onAbandon?: (metrics: LessonMetrics) => void
  onFinish?: () => void
}

function CategoryIllustration({ id }: { id: MenuCategoryId }) {
  if (id === 'rice') return <svg viewBox="0 0 120 82" aria-hidden="true"><path d="M14 43h92c-4 23-20 34-46 34S18 66 14 43Z" /><path d="M27 43c8-22 58-22 66 0" /><circle cx="45" cy="34" r="9" /><path d="M58 21c15-9 29 0 29 13-12 7-24 5-29-13Z" /></svg>
  if (id === 'noodles') return <svg viewBox="0 0 120 82" aria-hidden="true"><path d="M13 42h94c-4 24-20 35-47 35S17 66 13 42Z" /><path d="M24 36c9-13 16 7 25-5s17 8 27-5 14 6 21-3" /><path d="M33 10v28M49 6v30M65 9v27M82 5v32" /></svg>
  if (id === 'toast') return <svg viewBox="0 0 120 82" aria-hidden="true"><path d="M18 62 60 17l42 45Z" /><path d="m27 62 33-35 33 35M42 46h38" /></svg>
  if (id === 'drinks') return <svg viewBox="0 0 120 82" aria-hidden="true"><path d="M34 18h48l-6 56H40Z" /><path d="m62 18 12-14M45 36h30M45 48h30" /><path d="M82 30h8c16 0 16 25 0 25H79" /></svg>
  if (id === 'snacks') return <svg viewBox="0 0 120 82" aria-hidden="true"><path d="M19 52c4-24 22-39 41-39s37 15 41 39c-9 17-73 17-82 0Z" /><path d="M31 34h58M27 46h66M40 21l-8 42M57 15l-4 53M75 19l6 45" /></svg>
  return <svg viewBox="0 0 120 82" aria-hidden="true"><path d="M15 45h90c-3 21-18 31-45 31S18 66 15 45Z" /><path d="M24 45c8-20 64-20 72 0" /><path d="M39 19h42M44 12h32" /><circle cx="48" cy="35" r="7" /><circle cx="72" cy="35" r="7" /></svg>
}

function FoodIllustration({ item }: { item: MenuItem }) {
  const category = item.categoryId
  return (
    <svg className={`food-illustration food-illustration--${category}`} viewBox="0 0 120 90" role="img" aria-label={item.imageLabel}>
      {category === 'drinks' ? (
        <><path d="M34 17h49l-7 64H41Z" /><path d="m62 17 13-14M45 37h30M44 52h32" /><path d="M82 31h9c15 0 15 25 0 25H79" /></>
      ) : category === 'toast' ? (
        <><path d="M16 69 60 18l44 51Z" /><path d="m26 69 34-39 34 39M39 51h43" /></>
      ) : category === 'snacks' ? (
        <><path d="M18 59c4-26 23-43 42-43s38 17 42 43c-10 18-74 18-84 0Z" /><path d="M29 39h62M26 51h68M41 23l-9 46M58 17l-4 57M77 22l6 48" /></>
      ) : (
        <><path d="M12 48h96c-4 24-20 36-48 36S16 72 12 48Z" /><path d="M23 48c7-23 67-23 74 0" /><path d="M31 34c10-14 18 8 28-5s18 9 29-4" /><circle cx="45" cy="33" r="8" /><path d="M63 22c16-9 28 1 27 14-12 6-23 3-27-14Z" /></>
      )}
    </svg>
  )
}

function RestaurantHero() {
  return (
    <section className="ordering-hero" aria-label="安心茶餐廳">
      <div className="ordering-hero__top"><span>外賣練習</span><b>不會付款</b></div>
      <div><p>歡迎來到</p><strong>安心茶餐廳</strong></div>
    </section>
  )
}

function CategoryGrid({ onSelect }: { onSelect: (id: MenuCategoryId) => void }) {
  return (
    <section className="ordering-section" aria-labelledby="ordering-categories-title">
      <div className="ordering-section__heading">
        <div><p>安心茶餐廳餐牌</p><h2 id="ordering-categories-title">請選擇餐品分類</h2></div>
        <span>共6類</span>
      </div>
      <div className="category-grid">
        {MENU_CATEGORIES.map((category) => (
          <button key={category.id} type="button" className={`category-card category-card--${category.id}`} aria-label={`查看${category.name}`} onClick={() => onSelect(category.id)}>
            <CategoryIllustration id={category.id} />
            <span><strong>{category.name}</strong><small>{category.description}</small></span>
          </button>
        ))}
      </div>
    </section>
  )
}

function CategoryTabs({ selectedId, onSelect }: { selectedId: MenuCategoryId; onSelect: (id: MenuCategoryId) => void }) {
  return (
    <nav className="category-tabs" aria-label="餐品分類">
      {MENU_CATEGORIES.map((category) => (
        <button key={category.id} type="button" aria-pressed={selectedId === category.id} onClick={() => onSelect(category.id)}>{category.name}</button>
      ))}
    </nav>
  )
}

function MenuList({ category, onBack, onSelect, onSwitchCategory }: { category: MenuCategory; onBack: () => void; onSelect: (item: MenuItem) => void; onSwitchCategory: (id: MenuCategoryId) => void }) {
  const items = getMenuItemsByCategory(category.id)
  return (
    <section className="ordering-section menu-section">
      <button type="button" className="ordering-text-button" aria-label="返回分類" onClick={onBack}>‹ 返回分類</button>
      <CategoryTabs selectedId={category.id} onSelect={onSwitchCategory} />
      <div className="ordering-section__heading">
        <div><p>安心茶餐廳</p><h2>{category.name}</h2></div>
        <span>{items.length}款</span>
      </div>
      <div className="menu-list">
        {items.map((item) => (
          <button key={item.id} type="button" className="menu-list-item" aria-label={`選擇${item.name}，價格 ${item.price} 元`} onClick={() => onSelect(item)}>
            <span className="menu-list-item__copy"><strong>{item.name}</strong><small>{item.description}</small><b>${item.price}</b></span>
            <span className="menu-list-item__image"><FoodIllustration item={item} /></span>
          </button>
        ))}
      </div>
    </section>
  )
}

function QuantityPicker({ itemName, quantity, onChange }: { itemName: string; quantity: number; onChange: (quantity: number) => void }) {
  return (
    <div className="quantity-picker">
      <button type="button" aria-label="減少選購數量" disabled={quantity <= 1} onClick={() => onChange(Math.max(1, quantity - 1))}>−</button>
      <div aria-live="polite"><span>數量</span><strong>{quantity} 份 {itemName}</strong></div>
      <button type="button" aria-label="增加選購數量" disabled={quantity >= MAX_CART_QUANTITY} onClick={() => onChange(Math.min(MAX_CART_QUANTITY, quantity + 1))}>＋</button>
    </div>
  )
}

function ProductDetail({ item, quantity, onQuantityChange, onBack, onAdd }: { item: MenuItem; quantity: number; onQuantityChange: (quantity: number) => void; onBack: () => void; onAdd: () => void }) {
  return (
    <section className="product-detail">
      <button type="button" className="ordering-text-button" onClick={onBack}>‹ 返回{MENU_CATEGORIES.find((category) => category.id === item.categoryId)?.name}</button>
      <div className="product-detail__image"><FoodIllustration item={item} /></div>
      <div className="product-detail__copy"><p>安心茶餐廳</p><h2>{item.name}</h2><span>{item.description}</span><strong>${item.price}</strong></div>
      <QuantityPicker itemName={item.name} quantity={quantity} onChange={onQuantityChange} />
      <button type="button" className="primary-button" onClick={onAdd}>加入購物車</button>
    </section>
  )
}

function CartDock({ cart, onOpen }: { cart: Cart; onOpen: () => void }) {
  const count = getCartCount(cart)
  const total = calculateCartTotal(cart, MENU_ITEMS)
  return <button type="button" className="cart-dock" aria-label={`查看購物車，${count}件，總額${total}元`} onClick={onOpen}><span><Icon name="ordering" size={25} />購物車 <b>{count}件</b></span><strong>${total}　›</strong></button>
}

function CartPanel({ cart, onChange, onBack, onConfirm }: { cart: Cart; onChange: (id: MenuItemId, quantity: number) => void; onBack: () => void; onConfirm: () => void }) {
  const entries = MENU_ITEMS.filter((item) => (cart[item.id] ?? 0) > 0)
  const total = calculateCartTotal(cart, MENU_ITEMS)
  return (
    <section className="ordering-section cart-panel">
      <button type="button" className="ordering-text-button" aria-label="返回餐牌" onClick={onBack}>‹ 返回餐牌</button>
      <div className="ordering-section__heading"><div><p>先看數量，再看總額</p><h2>購物車</h2></div><span>{getCartCount(cart)}件</span></div>
      {!entries.length ? <div className="empty-cart"><Icon name="ordering" size={42} /><strong>購物車暫時是空的</strong><span>返回餐牌選擇餐品後，再回來核對。</span></div> : (
        <div className="cart-list">{entries.map((item) => {
          const quantity = cart[item.id] ?? 0
          return <article className="cart-row" key={item.id}><div><strong>{item.name}</strong><span>${item.price} × {quantity}</span><button type="button" onClick={() => onChange(item.id, 0)}>移除{item.name}</button></div><div className="cart-controls"><button type="button" aria-label={`減少${item.name}數量`} onClick={() => onChange(item.id, quantity - 1)}>−</button><b aria-live="polite">{quantity}</b><button type="button" aria-label={`增加${item.name}數量`} disabled={quantity >= MAX_CART_QUANTITY} onClick={() => onChange(item.id, quantity + 1)}>＋</button></div></article>
        })}</div>
      )}
      <div className="order-total"><span>練習送餐費　$0</span><strong>總額：${total}</strong></div>
      <button type="button" className="primary-button" onClick={onConfirm}>前往確認訂單</button>
    </section>
  )
}

function ConfirmationPanel({ cart, onBack, onConfirm }: { cart: Cart; onBack: () => void; onConfirm: () => void }) {
  const entries = MENU_ITEMS.filter((item) => (cart[item.id] ?? 0) > 0)
  const total = calculateCartTotal(cart, MENU_ITEMS)
  return (
    <section className="ordering-section confirmation-panel">
      <button type="button" className="ordering-text-button" aria-label="返回修改購物車" onClick={onBack}>‹ 返回修改購物車</button>
      <div className="confirmation-panel__badge"><Icon name="captcha" size={24} /><span>練習模式：不會傳送訂單，也不會付款。</span></div>
      <h2>最後核對練習訂單</h2>
      <ol>{entries.map((item) => <li key={item.id}><span><strong>{item.name}</strong><small>${item.price} × {cart[item.id]}</small></span><b>${item.price * (cart[item.id] ?? 0)}</b></li>)}</ol>
      <div className="order-total"><span>共 {getCartCount(cart)} 件餐品</span><strong>總額：${total}</strong></div>
      <button type="button" className="confirm-order-button" onClick={onConfirm}>確認練習訂單｜不會付款</button>
    </section>
  )
}

export function OrderingLesson({ onBack, onComplete, onAbandon, onFinish }: OrderingLessonProps) {
  const finishLesson = onFinish ?? onBack
  return (
    <LessonEngine onComplete={onComplete}>
      {(lesson) => {
        function leave() {
          if (lesson.phase === 'review') {
            finishLesson()
            return
          }
          if (window.confirm('這一關尚未完成，確定返回首頁嗎？')) {
            onAbandon?.(lesson.abandon())
            onBack()
          }
        }
        return <OrderingContent lesson={lesson} onBack={leave} onFinish={finishLesson} />
      }}
    </LessonEngine>
  )
}

function OrderingContent({ lesson, onBack, onFinish }: { lesson: LessonController; onBack: () => void; onFinish: () => void }) {
  const [guidedView, setGuidedView] = useState<OrderingView>('categories')
  const [guidedCategoryId, setGuidedCategoryId] = useState<MenuCategoryId | null>(null)
  const [guidedItem, setGuidedItem] = useState<MenuItem | null>(null)
  const [guidedQuantity, setGuidedQuantity] = useState(1)
  const [guidedComplete, setGuidedComplete] = useState(false)

  const [view, setView] = useState<OrderingView>('categories')
  const [categoryId, setCategoryId] = useState<MenuCategoryId | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<Cart>({})
  const [feedback, setFeedback] = useState('')
  const [feedbackKind, setFeedbackKind] = useState<'error' | 'status'>('status')

  function showFeedback(message: string, kind: 'error' | 'status' = 'status') {
    setFeedback(message)
    setFeedbackKind(kind)
  }

  function selectGuidedCategory(id: MenuCategoryId) {
    setGuidedCategoryId(id)
    setGuidedView('menu')
    setFeedback('')
  }

  function selectGuidedItem(item: MenuItem) {
    setGuidedItem(item)
    setGuidedQuantity(1)
    setGuidedView('product')
    setFeedback('')
  }

  function addGuidedItem() {
    if (guidedItem?.id !== 'char-siu-egg-rice' || guidedQuantity !== 1) {
      lesson.recordError()
      showFeedback('請跟着任務，選擇1份叉燒滑蛋飯。', 'error')
      return
    }
    setFeedback('')
    setGuidedComplete(true)
  }

  function selectCategory(id: MenuCategoryId) {
    setCategoryId(id)
    setSelectedItem(null)
    setView('menu')
    setFeedback('')
  }

  function selectItem(item: MenuItem) {
    setSelectedItem(item)
    setQuantity(1)
    setView('product')
    setFeedback('')
  }

  function addToCart() {
    if (!selectedItem) {
      lesson.recordError()
      showFeedback('請先選擇一款餐品。', 'error')
      return
    }
    setCart((current) => setCartQuantity(current, selectedItem.id, (current[selectedItem.id] ?? 0) + quantity))
    showFeedback(`${selectedItem.name}已加入購物車。`)
    setCategoryId(selectedItem.categoryId)
    setSelectedItem(null)
    setQuantity(1)
    setView('menu')
  }

  function openConfirmation() {
    if (getCartCount(cart) === 0) {
      lesson.recordError()
      showFeedback('購物車仍是空的，請返回餐牌選擇餐品。', 'error')
      return
    }
    setFeedback('')
    setView('confirm')
  }

  function confirmOrder() {
    if (getCartCount(cart) === 0) {
      lesson.recordError()
      showFeedback('購物車仍是空的，請返回餐牌選擇餐品。', 'error')
      setView('cart')
      return
    }
    setFeedback('')
    lesson.complete()
  }

  function showHint() {
    lesson.recordHint()
    const hint = view === 'categories'
      ? '提示：先選擇一個餐品分類，例如「飯類」。'
      : view === 'menu'
        ? '提示：先閱讀餐品名稱、內容和價錢，再按餐品。'
        : view === 'product'
          ? '提示：使用＋或−調整數量，再加入購物車。'
          : '提示：先看餐品和數量，再核對總額。'
    showFeedback(hint)
  }

  if (lesson.phase === 'demo') return (
    <LessonLayout title="關卡三：外賣點餐" phase="demo" heading="示範一次" onBack={onBack}>
      <RestaurantHero />
      <p className="lesson-intro">真實點餐通常由分類開始，最後才到購物車確認。整個練習不會傳送訂單或付款。</p>
      <ol className="ordering-demo-steps"><li><b>1</b><span>選擇分類</span></li><li><b>2</b><span>選擇餐品</span></li><li><b>3</b><span>調整數量</span></li><li><b>4</b><span>查看及修改</span></li><li><b>5</b><span>核對後確認</span></li></ol>
      <button type="button" className="primary-button" onClick={lesson.finishDemo}>{lesson.isReplay ? '返回練習' : '開始跟着做'}</button>
    </LessonLayout>
  )

  if (lesson.phase === 'guided') {
    if (guidedComplete) return (
      <LessonLayout title="關卡三：外賣點餐" phase="guided" heading="準備自己完成" onBack={onBack}>
        <div className="success-card"><Icon name="check" size={46} /><p>你已按分類找到叉燒滑蛋飯，並把1份加入練習購物車。</p></div>
        <button type="button" className="primary-button" onClick={lesson.beginIndependent}>開始自己完成</button>
        <button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button>
      </LessonLayout>
    )

    const guidedCategory = MENU_CATEGORIES.find((category) => category.id === guidedCategoryId)
    return (
      <LessonLayout title="關卡三：外賣點餐" phase="guided" heading="跟着做" contentKey={guidedView} onBack={onBack}>
        <p className="order-instruction"><strong>任務：</strong>選購1份叉燒滑蛋飯</p>
        <RestaurantHero />
        {guidedView === 'categories' && <CategoryGrid onSelect={selectGuidedCategory} />}
        {guidedView === 'menu' && guidedCategory && <MenuList category={guidedCategory} onBack={() => setGuidedView('categories')} onSelect={selectGuidedItem} onSwitchCategory={selectGuidedCategory} />}
        {guidedView === 'product' && guidedItem && <ProductDetail item={guidedItem} quantity={guidedQuantity} onQuantityChange={setGuidedQuantity} onBack={() => setGuidedView('menu')} onAdd={addGuidedItem} />}
        {feedback && <p className={feedbackKind === 'error' ? 'feedback-box' : 'hint-panel'} role={feedbackKind === 'error' ? 'alert' : 'status'}>{feedback}</p>}
        <button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button>
      </LessonLayout>
    )
  }

  if (lesson.phase === 'independent') {
    const category = MENU_CATEGORIES.find((item) => item.id === categoryId)
    return (
      <LessonLayout title="關卡三：安心茶餐廳" phase="independent" heading="自己完成" contentKey={view} onBack={onBack}>
        <RestaurantHero />
        {view === 'categories' && <CategoryGrid onSelect={selectCategory} />}
        {view === 'menu' && category && <MenuList category={category} onBack={() => setView('categories')} onSelect={selectItem} onSwitchCategory={selectCategory} />}
        {view === 'product' && selectedItem && <ProductDetail item={selectedItem} quantity={quantity} onQuantityChange={setQuantity} onBack={() => setView('menu')} onAdd={addToCart} />}
        {view === 'cart' && <CartPanel cart={cart} onChange={(id, nextQuantity) => setCart((current) => setCartQuantity(current, id, nextQuantity))} onBack={() => setView(categoryId ? 'menu' : 'categories')} onConfirm={openConfirmation} />}
        {view === 'confirm' && <ConfirmationPanel cart={cart} onBack={() => setView('cart')} onConfirm={confirmOrder} />}
        {feedback && <p className={feedbackKind === 'error' ? 'feedback-box' : 'hint-panel'} role={feedbackKind === 'error' ? 'alert' : 'status'}>{feedback}</p>}
        {view !== 'confirm' && view !== 'cart' && <CartDock cart={cart} onOpen={() => { setFeedback(''); setView('cart') }} />}
        <div className="button-stack ordering-help-actions"><button type="button" className="hint-button" onClick={showHint}>給我提示</button><button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button></div>
      </LessonLayout>
    )
  }

  return (
    <LessonLayout title="關卡三：外賣點餐" phase="review" heading="外賣點餐練習完成" onBack={onBack}>
      <div className="success-card success-card--large"><Icon name="check" size={58} /><p>訂單練習完成。沒有付款，也沒有傳送任何資料。</p></div>
      <div className="metrics-row"><div><strong>{lesson.metrics.durationSeconds}</strong><span>秒</span></div><div><strong>{lesson.metrics.errorCount}</strong><span>次錯誤</span></div><div><strong>{lesson.metrics.hintCount}</strong><span>次提示</span></div></div>
      <section className="review-card"><h2>確認訂單三步</h2><ul><li>先看餐品和總額。</li><li>再看每款餐品的數量。</li><li>全部正確，最後才確認。</li></ul></section>
      <button type="button" className="primary-button" aria-label="完成回顧並返回首頁" onClick={onFinish}>返回首頁</button>
    </LessonLayout>
  )
}
