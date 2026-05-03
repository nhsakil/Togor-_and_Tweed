import ProductAccordion from './ProductAccordion'

export default function DeliveryAccordion() {
  return (
    <ProductAccordion title="Delivery">
      <div className="text-[13px] text-[#444] leading-relaxed space-y-3">
        <p>
          <strong className="text-[#111]">Dhaka & Chattogram:</strong><br />
          1–2 business days. Orders placed before 3 PM are dispatched the same day.
        </p>
        <p>
          <strong className="text-[#111]">All Other Divisions:</strong><br />
          3–5 business days via courier.
        </p>
        <p>
          <strong className="text-[#111]">Free Delivery</strong> on orders above ৳1,500.
          You will receive an SMS with tracking details once your order ships.
        </p>
        <p>
          <strong className="text-[#111]">Payment:</strong> Cash on Delivery (COD), bKash, and Nagad
          accepted at checkout.
        </p>
      </div>
    </ProductAccordion>
  )
}
