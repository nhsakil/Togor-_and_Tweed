import { getUnshippedOrders } from '@/actions/admin/bulkPathaoShipment'
import BulkShipmentClient from './BulkShipmentClient'

export const metadata = { title: 'Bulk Shipment — Admin' }

export default async function BulkShipmentPage() {
  const orders = await getUnshippedOrders()
  return <BulkShipmentClient initialOrders={orders} />
}
