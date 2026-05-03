import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

async function getDashboardData(days: number) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const prevSince = new Date()
  prevSince.setDate(prevSince.getDate() - days * 2)

  const [orders, prevOrders, customers, prevCustomers, lowStockVariants] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { total: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: prevSince, lt: since } },
      select: { total: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      select: {
        sku: true,
        stock: true,
        size: true,
        color: true,
        product: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
      take: 6,
    }),
  ])

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0)
  const avgOrder = orders.length ? revenue / orders.length : 0
  const prevAvgOrder = prevOrders.length
    ? prevOrders.reduce((s, o) => s + Number(o.total), 0) / prevOrders.length
    : 0

  // Daily revenue for sparkline
  const dailyMap: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    if (key in dailyMap) dailyMap[key] += Number(o.total)
  }
  const dailyRevenue = Object.entries(dailyMap).map(([date, val]) => ({ date, val }))

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { createdAt: { gte: since } } },
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { totalPrice: 'desc' } },
    take: 5,
  })
  const topProductIds = topProducts.map(p => p.productId)
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  })
  const topProductMap = Object.fromEntries(topProductDetails.map(p => [p.id, p.name]))
  const topProductsData = topProducts.map(p => ({
    name: topProductMap[p.productId] ?? '—',
    units: p._sum.quantity ?? 0,
    revenue: Number(p._sum.totalPrice ?? 0),
  }))

  // Order funnel
  const funnelCounts = {
    placed: orders.length,
    paid: orders.filter(o => ['PAID', 'SHIPPED', 'DELIVERED'].includes(o.status)).length,
    shipped: orders.filter(o => ['SHIPPED', 'DELIVERED'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }

  const lowStock = lowStockVariants.map(v => ({
    name: v.product.name,
    sku: v.sku,
    variant: [v.size, v.color].filter(Boolean).join(' / '),
    stock: v.stock,
  }))

  return {
    revenue, prevRevenue, orderCount: orders.length, prevOrderCount: prevOrders.length,
    avgOrder, prevAvgOrder, customers, prevCustomers,
    dailyRevenue, topProductsData, lowStock, funnelCounts,
  }
}

function pct(a: number, b: number) {
  if (b === 0) return null
  return ((a - b) / b) * 100
}

function Trend({ curr, prev }: { curr: number; prev: number }) {
  const p = pct(curr, prev)
  if (p === null) return null
  const up = p >= 0
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      color: up ? '#2e7d32' : '#c62828',
      letterSpacing: '0.04em',
      marginLeft: 6,
    }}>
      {up ? '▲' : '▼'} {Math.abs(p).toFixed(1)}%
    </span>
  )
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function SparkLine({ data }: { data: { date: string; val: number }[] }) {
  if (!data.length) return null
  const vals = data.map(d => d.val)
  const max = Math.max(...vals, 1)
  const min = Math.min(...vals)
  const range = max - min || 1
  const W = 500
  const H = 80
  const padL = 8, padR = 8, padT = 8, padB = 8
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1 || 1)) * innerW
    const y = padT + (1 - (d.val - min) / range) * innerH
    return { x, y }
  })

  const line = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = [
    `${padL},${H - padB}`,
    ...pts.map(p => `${p.x},${p.y}`),
    `${padL + innerW},${H - padB}`,
  ].join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, display: 'block' }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a96e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c8a96e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#rg)" />
      <polyline points={line} fill="none" stroke="#c8a96e" strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const TH = ({ children }: { children: string }) => (
  <th style={{
    fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', color: '#bbb',
    textAlign: 'left', paddingBottom: 8, borderBottom: '1px solid #f0ede8',
  }}>{children}</th>
)

const TD = ({ children, bold }: { children: React.ReactNode; bold?: boolean }) => (
  <td style={{
    fontSize: 12, color: bold ? '#111' : '#555', fontWeight: bold ? 600 : 400,
    padding: '8px 0', borderBottom: '1px solid #f7f7f6',
  }}>{children}</td>
)

export default async function AdminDashboard({ searchParams }: PageProps) {
  const { period = '30' } = await searchParams
  const days = period === '7' ? 7 : period === '90' ? 90 : 30

  const {
    revenue, prevRevenue, orderCount, prevOrderCount, avgOrder, prevAvgOrder,
    customers, prevCustomers, dailyRevenue, topProductsData, lowStock, funnelCounts,
  } = await getDashboardData(days)

  const statCards = [
    { label: 'REVENUE', value: fmt(revenue), curr: revenue, prev: prevRevenue },
    { label: 'ORDERS', value: orderCount.toString(), curr: orderCount, prev: prevOrderCount },
    { label: 'AVG ORDER VALUE', value: fmt(avgOrder), curr: avgOrder, prev: prevAvgOrder },
    { label: 'NEW CUSTOMERS', value: customers.toString(), curr: customers, prev: prevCustomers },
  ]

  const funnelMax = funnelCounts.placed || 1
  const funnelSteps = [
    { label: 'PLACED', count: funnelCounts.placed },
    { label: 'PAID', count: funnelCounts.paid },
    { label: 'SHIPPED', count: funnelCounts.shipped },
    { label: 'DELIVERED', count: funnelCounts.delivered },
  ]

  const cardStyle = {
    background: '#fff',
    border: '1px solid #e5e3df',
    padding: '22px 24px',
  } as const

  const secHead = (label: string) => (
    <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', color: '#aaa', marginBottom: 14 }}>
      {label}
    </div>
  )

  return (
    <div>
      {/* Page header */}
      <h1 style={{
        fontSize: 13, fontWeight: 700, letterSpacing: '0.16em',
        color: '#111', margin: '0 0 24px', textTransform: 'uppercase' as const,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        DASHBOARD
      </h1>

      {/* Period tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e3df', marginBottom: 24 }}>
        {(['7', '30', '90'] as const).map(p => (
          <Link key={p} href={`/admin?period=${p}`} style={{
            padding: '8px 18px',
            fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
            color: period === p ? '#111' : '#999',
            textDecoration: 'none',
            borderBottom: period === p ? '2px solid #c8a96e' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {p} DAYS
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(card => (
          <div key={card.label} style={cardStyle}>
            <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', color: '#aaa', marginBottom: 10 }}>
              {card.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
                {card.value}
              </span>
              <Trend curr={card.curr} prev={card.prev} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue sparkline */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        {secHead('REVENUE TREND')}
        <SparkLine data={dailyRevenue} />
      </div>

      {/* Funnel + Low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={cardStyle}>
          {secHead('ORDER FUNNEL')}
          {funnelSteps.map(step => (
            <div key={step.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: '#666' }}>
                  {step.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#111' }}>{step.count}</span>
              </div>
              <div style={{ height: 4, background: '#f0ede8' }}>
                <div style={{
                  height: '100%',
                  width: `${(step.count / funnelMax) * 100}%`,
                  background: '#c8a96e',
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          {secHead('LOW STOCK')}
          {lowStock.length === 0 ? (
            <div style={{ fontSize: 12, color: '#999' }}>All variants well stocked</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <TH>PRODUCT</TH>
                  <TH>VARIANT</TH>
                  <TH>QTY</TH>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((v, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11, color: '#222', padding: '7px 0', borderBottom: '1px solid #f7f7f6' }}>
                      {v.name.length > 18 ? v.name.slice(0, 18) + '…' : v.name}
                    </td>
                    <td style={{ fontSize: 10, color: '#888', padding: '7px 8px', borderBottom: '1px solid #f7f7f6' }}>
                      {v.variant || v.sku}
                    </td>
                    <td style={{
                      fontSize: 12, fontWeight: 600, padding: '7px 0', borderBottom: '1px solid #f7f7f6',
                      color: v.stock === 0 ? '#c62828' : '#e65100',
                    }}>
                      {v.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top products */}
      <div style={cardStyle}>
        {secHead('TOP PRODUCTS')}
        {topProductsData.length === 0 ? (
          <div style={{ fontSize: 12, color: '#999' }}>No orders in this period</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><TH>PRODUCT</TH><TH>UNITS SOLD</TH><TH>REVENUE</TH></tr>
            </thead>
            <tbody>
              {topProductsData.map((p, i) => (
                <tr key={i}>
                  <TD>{p.name}</TD>
                  <TD>{p.units}</TD>
                  <TD bold>{fmt(p.revenue)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
