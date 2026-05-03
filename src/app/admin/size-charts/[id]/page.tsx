import SizeChartEditor from '@/components/admin/SizeChartEditor'
export default async function EditSizeChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SizeChartEditor chartId={id} />
}
