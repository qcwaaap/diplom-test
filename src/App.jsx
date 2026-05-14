import { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

const StarBackground = () => {
  const stars = useRef([])
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const starCount = 180
    stars.current = Array.from({ length: starCount }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 15,
      delay: Math.random() * 10
    }))
    forceUpdate(1)
  }, [])
  if (stars.current.length === 0) return null
  return (
    <div className="stars-bg">
      {stars.current.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const [transactions, setTransactions] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Еда', date: '', comment: '' })
  const chartRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('mm_transactions')
    if (saved) setTransactions(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('mm_transactions', JSON.stringify(transactions))
  }, [transactions])

  const today = new Date().toISOString().slice(0,10)
  const todayIncome = transactions.filter(t => t.type === 'income' && t.date === today).reduce((s,t)=> s+t.amount, 0)
  const todayExpense = transactions.filter(t => t.type === 'expense' && t.date === today).reduce((s,t)=> s+t.amount, 0)

  const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)

  const addTransaction = () => {
    if (!form.amount || form.amount <= 0 || !form.category || !form.date) {
      alert('Заполните сумму, категорию и дату')
      return
    }
    const newTransaction = {
      id: Date.now(),
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
      comment: form.comment
    }
    setTransactions([newTransaction, ...transactions])
    setModalOpen(false)
    setForm({ type: 'expense', amount: '', category: 'Еда', date: '', comment: '' })
  }

  useEffect(() => {
    if (!chartRef.current) return
    const ctx = chartRef.current.getContext('2d')
    const expenses = transactions.filter(t => t.type === 'expense')
    const categories = {}
    expenses.forEach(e => categories[e.category] = (categories[e.category] || 0) + e.amount)
    const labels = Object.keys(categories)
    const data = Object.values(categories)

    if (window.myChart) window.myChart.destroy()
    window.myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#ddd' } } } }
    })
  }, [transactions])

  const getIcon = (cat) => {
    const icons = { 'Еда': '🍔', 'Транспорт': '🚕', 'Развлечения': '🎬', 'Зарплата': '💰', 'Другое': '📌' }
    return icons[cat] || '📌'
  }

  const categoryColors = {
    'Еда': 'bg-orange-500', 'Транспорт': 'bg-sky-500', 'Развлечения': 'bg-pink-500', 'Зарплата': 'bg-green-500', 'Другое': 'bg-gray-500'
  }

  const quotes = [
    "Не экономьте на том, что делает вас счастливым, но следите за мелочами.",
    "Богатство — это не деньги, а умение ими управлять.",
    "Каждый рубль, потраченный с умом, работает на ваше будущее.",
    "Лучшее время начать экономить было вчера. Следующее лучшее — сегодня."
  ]
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <div className="relative z-10 container mx-auto px-4 py-6 fade-in-up">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-purple-400 bg-clip-text text-transparent">
              💰 MoneyMaster Pro
            </h1>
            <p className="text-gray-300 text-sm mt-1">Управляй своими финансами с умом</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:scale-105 transition transform duration-200 flex items-center gap-2"
          >
            ✨ Новая операция
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="glass-card p-5 text-white">
            <div className="text-sm opacity-80">💰 Доходы сегодня</div>
            <div className="text-2xl font-bold text-green-300">{todayIncome.toLocaleString()} ₽</div>
          </div>
          <div className="glass-card p-5 text-white">
            <div className="text-sm opacity-80">💸 Расходы сегодня</div>
            <div className="text-2xl font-bold text-red-300">{todayExpense.toLocaleString()} ₽</div>
          </div>
          <div className="glass-card p-5 text-white">
            <div className="text-sm opacity-80">📈 Общий баланс</div>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {balance.toLocaleString()} ₽
            </div>
          </div>
        </div>

        <div className="glass-card p-5 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="text-sm opacity-80">💡 Совет дня</div>
              <div className="italic text-base">"{randomQuote}"</div>
            </div>
            <div className="w-full md:w-1/3">
              <div className="text-xs opacity-80 mb-1">Цель на месяц: 50 000 ₽</div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, (balance / 50000) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="glass-card p-5 text-white">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"> Лента операций</h2>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">🐣</div>
                  <div className="opacity-70">Добавьте первую операцию →</div>
                </div>
              ) : (
                transactions.slice(0, 10).map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${categoryColors[t.category]} flex items-center justify-center text-sm`}>
                        {getIcon(t.category)}
                      </div>
                      <div>
                        <div className="font-medium">{t.category}</div>
                        <div className="text-xs text-gray-300">{new Date(t.date).toLocaleDateString('ru-RU')}</div>
                        {t.comment && <div className="text-xs text-gray-400">{t.comment}</div>}
                      </div>
                    </div>
                    <div className={`font-bold ${t.type === 'income' ? 'text-green-300' : 'text-red-300'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()} ₽
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-5 text-white">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"> Расходы по категориям</h2>
            <canvas ref={chartRef} height="200" className="w-full mb-4"></canvas>
            <div className="space-y-2 text-sm">
              {(() => {
                const expenses = transactions.filter(t => t.type === 'expense')
                const cats = {}
                expenses.forEach(e => cats[e.category] = (cats[e.category] || 0) + e.amount)
                const total = Object.values(cats).reduce((a,b) => a+b, 0)
                return Object.entries(cats).map(([name, amount]) => (
                  <div key={name} className="flex justify-between items-center p-2 border-b border-white/10">
                    <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${categoryColors[name]}`}></span> {name}</span>
                    <span>{amount.toLocaleString()} ₽ <span className="text-gray-400">({total ? ((amount/total)*100).toFixed(1) : 0}%)</span></span>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">✨ Новая операция</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Тип</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-white"><input type="radio" name="type" value="expense" checked={form.type === 'expense'} onChange={e => setForm({...form, type: e.target.value})} /> Расход</label>
                  <label className="flex items-center gap-2 text-white"><input type="radio" name="type" value="income" checked={form.type === 'income'} onChange={e => setForm({...form, type: e.target.value})} /> Доход</label>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Сумма (₽)</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white" placeholder="1000" step="0.01" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Категория</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white">
                  <option>Еда</option><option>Транспорт</option><option>Развлечения</option><option>Зарплата</option><option>Другое</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Дата</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Комментарий</label>
                <input type="text" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white" placeholder="Обед, такси, ..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={addTransaction} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition">Сохранить</button>
                <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-500 transition">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App