import { prisma } from '@/lib/prisma'

async function getAnalyticsData() {
  const since30 = new Date()
  since30.setDate(since30.getDate() - 30)
  const prev30 = new Date()
  prev30.setDate(prev30.getDate() - 60)

  const [orders, prevOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since30 } },
      select: { total: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: prev30, lt: since30 } },
      select: { total: true },
    }),
  ])

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0)

  // Funnel
  const placed = orders.length
  const paid = orders.filter(o => ['PAID', 'SHIPPED', 'DELIVERED'].includes(o.status)).length
  const shipped = orders.filter(o => ['SHIPPED', 'DELIVERED'].includes(o.status)).length
  const delivered = orders.filter(o => o.status === 'DELIVERED').length

  // Cart abandonment estimate: sessions that added to cart but didn't order
  // We'll show as (1 - paid/placed) * 100
  const abandonment = placed > 0 ? ((placed - paid) / placed) * 100 : 0

  // Reco slot performance (placeholder — requires recommendation click tracking)
  const recoSlots = [
    { slot: 'PDP — COMPLETE THE LOOK', impressions: 0, clicks: 0, orders: 0 },
    { slot: 'CART — COMPLETE THE FIT', impressions: 0, clicks: 0, orders: 0 },
    { slot: 'EMPTY CART — START WITH WHAT\'S SELLING', impressions: 0, clicks: 0, orders: 0 },
  ]

  // Top converting products
  const topConverting = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { createdAt: { gte: since30 } } },
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })
  const productIds = topConverting.map(p => p.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  })
  const productMap = Object.fromEntries(products.map(p => [p.id, p.name]))
  const topConvertingData = topConverting.map(p => ({
    name: productMap[p.productId] ?? '—',
    units: p._sum.quantity ?? 0,
    revenue: Number(p._sum.totalPrice ?? 0),
  }))

  return { revenue, prevRevenue, abandonment, placed, paid, shipped, delivered, recoSlots, topConvertingData }
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pctDiff(a: number, b: number) {
  if (b === 0) return null
  return ((a - b) / b) * 100
}

export default async function AnalyticsPage() {
  const d = await getAnalyticsData()
  const revDiff = pctDiff(d.revenue, d.prevRevenue)
  const funnelMax = d.placed || 1
  const funnelSteps = [
    { label: 'PLACED', count: d.placed },
    { label: 'PAID', count: d.paid },
    { label: 'SHIPPED', count: d.shipped },
    { label: 'DELIVERED', count: d.delivered },
  ]

  const sectionHead = (label: string) => (
    <div style={{
      fontSize: 9,
      fontWeight: 500,
      letterSpacing: '0.18em',
      color: '#aaa',
      marginBottom: 18,
    }}>{label}</div>
  )

  const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e3df',
      padding: '22px 24px',
      ...extra,
    }}>
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.16em',
          color: '#111',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          ANALYTICS
        </h1>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6, letterSpacing: '0.04em' }}>
          Last 30 days vs prior 30 days
        </div>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {card(
          <>
            {sectionHead('REVENUE VS PREV PERIOD')}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
                {fmt(d.revenue)}
              </span>
              {revDiff !== null && (
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: revDiff >= 0 ? '#2e7d32' : '#c62828',
                }}>
                  {revDiff >= 0 ? '▲' : '▼'} {Math.abs(revDiff).toFixed(1)}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
              Prev: {fmt(d.prevRevenue)}
            </div>
          </>
        )}
        {card(
          <>
            {sectionHead('CART ABANDONMENT')}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
                {d.abandonment.toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
              {d.placed - d.paid} of {d.placed} orders not completed
            </div>
          </>
        )}
      </div>

      {/* Order funnel */}
      <div style={{ marginBottom: 20 }}>
        {card(
          <>
            {sectionHead('ORDER FUNNEL')}
            <div style={{ display: 'flex', gap: 0 }}>
              {funnelSteps.map((step, i) => {
                const w = (step.count / funnelMax) * 100
                const dropPct = i > 0 ? (funnelSteps[i - 1].count > 0
                  ? ((funnelSteps[i - 1].count - step.count) / funnelSteps[i - 1].count * 100)
                  : 0) : null
                return (
                  <div key={step.label} style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      color: '#bbb',
                      marginBottom: 8,
                    }}>
                      {step.label}
                    </div>
                    <div style={{ height: 40, background: '#f0ede8', position: 'relative', marginRight: 8 }}>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${w}%`,
                        background: '#c8a96e',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{step.count}</span>
                      {dropPct !== null && (
                        <span style={{ fontSize: 10, color: '#c62828', fontWeight: 500 }}>
                          −{dropPct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Reco slot performance */}
      <div style={{ marginBottom: 20 }}>
        {card(
          <>
            {sectionHead('RECO SLOT PERFORMANCE')}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['SLOT', 'IMPRESSIONS', 'CLICKS', 'CTR', 'ORDERS'].map(h => (
                    <th key={h} style={{
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      color: '#bbb',
                      textAlign: 'left',
                      paddingBottom: 8,
                      borderBottom: '1px solid #f0ede8',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.recoSlots.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11, color: '#444', padding: '9px 0', borderBottom: '1px solid #f7f7f6', fontWeight: 500 }}>
                      {row.slot}
                    </td>
                    <td style={{ fontSize: 12, color: '#555', padding: '9px 0', borderBottom: '1px solid #f7f7f6' }}>
                      {row.impressions || '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#555', padding: '9px 0', borderBottom: '1px solid #f7f7f6' }}>
                      {row.clicks || '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#555', padding: '9px 0', borderBottom: '1px solid #f7f7f6' }}>
                      {row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(1) + '%' : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#555', padding: '9px 0', borderBottom: '1px solid #f7f7f6' }}>
                      {row.orders || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 10, color: '#ccc', marginTop: 12 }}>
              * Click tracking requires analytics events integration
            </div>
          </>
        )}
      </div>

      {/* Top converting products */}
      <div>
        {card(
          <>
            {sectionHead('TOP CONVERTING PRODUCTS')}
            {d.topConvertingData.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999' }}>No orders in this period</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['PRODUCT', 'UNITS', 'REVENUE'].map(h => (
                      <th key={h} style={{
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: '0.12em',
                        color: '#bbb',
                        textAlign: 'left',
                        paddingBottom: 8,
                        borderBottom: '1px solid #f0ede8',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d.topConvertingData.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, color: '#222', padding: '8px 0', borderBottom: '1px solid #f7f7f6' }}>
                        {p.name}
                      </td>
                      <td style={{ fontSize: 12, color: '#555', padding: '8px 0', borderBottom: '1px solid #f7f7f6' }}>
                        {p.units}
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 600, color: '#111', padding: '8px 0', borderBottom: '1px solid #f7f7f6' }}>
                        {fmt(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}
