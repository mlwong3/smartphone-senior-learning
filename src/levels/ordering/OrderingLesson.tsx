import { useState } from 'react'
import { Icon } from '../../components/Icons'
import { LessonEngine, type LessonController } from '../../components/LessonEngine'
import { LessonLayout } from '../../components/LessonLayout'
import {
  MENU_ITEMS,
  calculateCartTotal,
  setCartQuantity,
  type Cart,
  type MenuItemId,
} from '../../domain/ordering'
import type { LessonMetrics } from '../../types'
import './OrderingLesson.css'

interface OrderingLessonProps {
  onBack: () => void
  onComplete: (metrics: LessonMetrics) => void
  onAbandon?: (metrics: LessonMetrics) => void
  onFinish?: () => void
}

function FoodIllustration({ id }: { id: MenuItemId }) {
  if (id === 'sandwich') return <svg viewBox="0 0 80 60" aria-hidden="true"><path d="m9 43 31-31 31 31Z" /><path d="m16 43 24-22 24 22M25 35h31" /></svg>
  if (id === 'chicken-rice') return <svg viewBox="0 0 80 60" aria-hidden="true"><path d="M12 32h56c-2 16-12 23-28 23S14 48 12 32Z" /><path d="M20 32c3-13 12-20 20-20s17 7 20 20" /><path d="M32 19c7-9 18-8 22 0-4 6-12 9-22 0Z" /></svg>
  return <svg viewBox="0 0 80 60" aria-hidden="true"><path d="M12 29h56c-2 17-12 26-28 26S14 46 12 29Z" /><path d="M20 25c7-8 10 4 17-5s10 5 18-3M24 14c4 6 1 9-2 12M40 10c4 6 1 9-2 12M56 13c4 6 1 9-2 12" /></svg>
}

function MenuGrid({ selectedId, onSelect }: { selectedId: MenuItemId | null; onSelect: (id: MenuItemId) => void }) {
  return <div className="menu-grid">{MENU_ITEMS.map((item) => <button key={item.id} type="button" className={selectedId === item.id ? 'menu-card is-selected' : 'menu-card'} aria-pressed={selectedId === item.id} aria-label={`選擇${item.name}，價格 ${item.price} 元`} onClick={() => onSelect(item.id)}><FoodIllustration id={item.id} /><strong>{item.name}</strong><span>${item.price}</span>{selectedId === item.id && <b>✓ 已選擇</b>}</button>)}</div>
}

function QuantityPicker({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) {
  return <div className="quantity-picker"><button type="button" aria-label="減少選購數量" onClick={() => onChange(Math.max(1, quantity - 1))}>−</button><strong aria-live="polite">{quantity} 份</strong><button type="button" aria-label="增加選購數量" onClick={() => onChange(quantity + 1)}>＋</button></div>
}

function CartView({ cart, onChange }: { cart: Cart; onChange: (id: MenuItemId, quantity: number) => void }) {
  const entries = MENU_ITEMS.filter((item) => (cart[item.id] ?? 0) > 0)
  const total = calculateCartTotal(cart, MENU_ITEMS)
  return <section className="cart-card"><h2>購物車</h2>{!entries.length ? <p className="empty-cart">尚未加入餐品</p> : entries.map((item) => <div className="cart-row" key={item.id}><div><strong>{item.name}</strong><span>${item.price} × {cart[item.id]}</span></div><div className="cart-controls"><button type="button" aria-label={`減少${item.name}數量`} onClick={() => onChange(item.id, (cart[item.id] ?? 0) - 1)}>−</button><b>{cart[item.id]}</b><button type="button" aria-label={`增加${item.name}數量`} onClick={() => onChange(item.id, (cart[item.id] ?? 0) + 1)}>＋</button></div></div>)}<strong className="cart-total">總額：${total}</strong></section>
}

export function OrderingLesson({ onBack, onComplete, onAbandon, onFinish }: OrderingLessonProps) {
  return <LessonEngine onComplete={onComplete}>{(lesson) => {
    function leave() {
      if (lesson.phase === 'review' || window.confirm('這一關尚未完成，確定返回首頁嗎？')) {
        if (lesson.phase !== 'review') onAbandon?.(lesson.abandon())
        onBack()
      }
    }
    return <OrderingContent lesson={lesson} onBack={leave} onFinish={onFinish ?? onBack} />
  }}</LessonEngine>
}

function OrderingContent({ lesson, onBack, onFinish }: { lesson: LessonController; onBack: () => void; onFinish: () => void }) {
  const [guidedSelected, setGuidedSelected] = useState<MenuItemId | null>(null)
  const [guidedQuantity, setGuidedQuantity] = useState(1)
  const [guidedComplete, setGuidedComplete] = useState(false)
  const [selectedId, setSelectedId] = useState<MenuItemId | null>(null)
  const [selectionQuantity, setSelectionQuantity] = useState(1)
  const [cart, setCart] = useState<Cart>({})
  const [feedback, setFeedback] = useState('')

  function addGuided() {
    if (guidedSelected !== 'sandwich' || guidedQuantity !== 1) {
      lesson.recordError(); setFeedback('請跟着指示，選擇 1 份火腿蛋三文治。'); return
    }
    setFeedback(''); setGuidedComplete(true)
  }

  function addToCart() {
    if (!selectedId) { lesson.recordError(); setFeedback('請先選擇一款餐品。'); return }
    setCart((current) => setCartQuantity(current, selectedId, (current[selectedId] ?? 0) + selectionQuantity))
    setFeedback(`${MENU_ITEMS.find((item) => item.id === selectedId)?.name}已加入購物車。`)
    setSelectedId(null); setSelectionQuantity(1)
  }

  function confirmOrder() {
    if (!Object.keys(cart).length) { lesson.recordError(); setFeedback('購物車仍是空的，請先選擇餐品並加入購物車。'); return }
    setFeedback(''); lesson.complete()
  }

  if (lesson.phase === 'demo') return <LessonLayout title="關卡三：外賣點餐" phase="demo" heading="示範一次" onBack={onBack}><p className="lesson-intro">在外賣程式點餐時，先選餐品和數量，再查看購物車，最後才確認。</p><section className="restaurant-card"><Icon name="ordering" size={42} /><div><strong>安心茶餐廳</strong><span>練習餐牌｜不會付款</span></div></section><ol className="demo-list"><li>點選餐品。</li><li>使用＋或−調整數量。</li><li>加入購物車後核對餐品、數量和總額。</li></ol><button type="button" className="primary-button" onClick={lesson.finishDemo}>{lesson.isReplay ? '返回練習' : '開始跟着做'}</button></LessonLayout>

  if (lesson.phase === 'guided') {
    if (guidedComplete) return <LessonLayout title="關卡三：外賣點餐" phase="guided" heading="準備自己完成" onBack={onBack}><div className="success-card"><Icon name="check" size={46} /><p>你已把1份火腿蛋三文治加入練習購物車。</p></div><button type="button" className="primary-button" onClick={lesson.beginIndependent}>開始自己完成</button><button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button></LessonLayout>
    return <LessonLayout title="關卡三：外賣點餐" phase="guided" heading="跟着做" onBack={onBack}><p className="order-instruction">請選擇：1份火腿蛋三文治</p><MenuGrid selectedId={guidedSelected} onSelect={(id) => { setGuidedSelected(id); setFeedback('') }} />{guidedSelected && <QuantityPicker quantity={guidedQuantity} onChange={setGuidedQuantity} />}{feedback && <p className={feedback.includes('請') ? 'feedback-box' : 'hint-panel'} role={feedback.includes('請') ? 'alert' : undefined}>{feedback}</p>}<button type="button" className="primary-button" onClick={addGuided}>加入購物車</button></LessonLayout>
  }

  if (lesson.phase === 'independent') return <LessonLayout title="關卡三：外賣點餐" phase="independent" heading="自己完成" onBack={onBack}><section className="restaurant-card"><Icon name="ordering" size={36} /><div><strong>安心茶餐廳</strong><span>練習模式，不會付款</span></div></section><MenuGrid selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setFeedback('') }} />{selectedId && <><QuantityPicker quantity={selectionQuantity} onChange={setSelectionQuantity} /><button type="button" className="primary-button" onClick={addToCart}>加入購物車</button></>}<CartView cart={cart} onChange={(id, quantity) => setCart((current) => setCartQuantity(current, id, quantity))} />{feedback && <p className={feedback.includes('空') || feedback.includes('請') ? 'feedback-box' : 'hint-panel'} role={feedback.includes('空') || feedback.includes('請') ? 'alert' : 'status'}>{feedback}</p>}<div className="button-stack"><button type="button" className="primary-button" onClick={confirmOrder}>確認練習訂單</button><button type="button" className="hint-button" onClick={() => { lesson.recordHint(); setFeedback('提示：先選餐品，調整數量，再按「加入購物車」。') }}>給我提示</button><button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button></div></LessonLayout>

  return <LessonLayout title="關卡三：外賣點餐" phase="review" heading="外賣點餐練習完成" onBack={onBack}><div className="success-card success-card--large"><Icon name="check" size={58} /><p>訂單練習完成。沒有付款，也沒有傳送任何資料。</p></div><div className="metrics-row"><div><strong>{lesson.metrics.durationSeconds}</strong><span>秒</span></div><div><strong>{lesson.metrics.errorCount}</strong><span>次錯誤</span></div><div><strong>{lesson.metrics.hintCount}</strong><span>次提示</span></div></div><section className="review-card"><h2>確認訂單三步</h2><ul><li>先看總額。</li><li>再看餐品和數量。</li><li>資料正確才確認。</li></ul></section><button type="button" className="primary-button" aria-label="完成回顧並返回首頁" onClick={onFinish}>返回首頁</button></LessonLayout>
}
