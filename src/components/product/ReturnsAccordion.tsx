import ProductAccordion from './ProductAccordion'

export default function ReturnsAccordion() {
  return (
    <ProductAccordion title="Returns" defaultOpen={false}>
      <div className="text-[13px] text-[#444] leading-relaxed space-y-3">
        <p>
          <strong className="text-[#111]">For Inside Dhaka City:</strong><br />
          Check the product while the delivery man is at your place. If the product does not meet your
          expectations, please return it by the delivery man with delivery charges only.
        </p>
        <p>
          <strong className="text-[#111]">For Outside Dhaka City:</strong><br />
          Check the product while the delivery man is at your place. If the product does not meet your
          expectations, please return it by the delivery man.
        </p>
        <p>
          <strong className="text-[#111]">Please note:</strong> Colors may appear slightly different due
          to lighting during photography or variations in your screen settings.
        </p>
        <p>Thank you for adhering to our policy and helping us maintain a seamless shopping experience.</p>
        <p className="font-bold text-[#111]">Discounted Items are not eligible for Exchange or Return</p>
      </div>
    </ProductAccordion>
  )
}
