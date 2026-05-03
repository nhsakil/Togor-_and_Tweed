/**
 * Per-category SEO configuration for T&T collection pages.
 * Drives: sub-category filter pills, popular searches, SEO text sections.
 */

export interface SubCategory {
  label: string
  /** value sent as ?subcat= param; null means "All" */
  value: string | null
  /** optional: keyword used in Prisma WHERE name/tags search */
  keyword?: string
}

export interface BlogLink {
  label: string
  href: string
  /** One-line description shown under the label */
  description: string
}

export interface CategoryFaq {
  question: string
  answer: string
}

export interface CategorySeoConfig {
  heading: string
  subCategories: SubCategory[]
  popularSearches: string[]
  mostPopularLinks: { label: string; href: string }[]
  seoSections: { heading: string; body: string }[]
  /** Related blog articles to cross-link from this category page */
  blogLinks: BlogLink[]
  /** Category-specific FAQs for FAQPage schema and visible accordion */
  faqs: CategoryFaq[]
}

// ─── Per-slug config ───────────────────────────────────────────────────────────

const CONFIGS: Record<string, CategorySeoConfig> = {

  shirts: {
    heading: 'SHIRTS',
    subCategories: [
      { label: 'All',       value: null },
      { label: 'New',       value: 'new',       keyword: 'new' },
      { label: 'Casual',    value: 'casual',    keyword: 'casual' },
      { label: 'Formal',    value: 'formal',    keyword: 'formal' },
      { label: 'Linen',     value: 'linen',     keyword: 'linen' },
      { label: 'Printed',   value: 'printed',   keyword: 'printed' },
      { label: 'Solid',     value: 'solid',     keyword: 'solid' },
      { label: 'Oversized', value: 'oversized', keyword: 'oversized' },
      { label: 'Slim Fit',  value: 'slim',      keyword: 'slim' },
      { label: 'Check',     value: 'check',     keyword: 'check' },
      { label: 'Oxford',    value: 'oxford',    keyword: 'oxford' },
    ],
    popularSearches: [
      'shirts for men', 'formal shirts', 'linen shirts', 'casual shirts',
      'white shirt for men', 'black shirt for men', 'printed shirt', 'slim fit shirt',
      'check shirt', 'oversized shirt', 'oxford shirt', 'half sleeve shirt',
      'full sleeve shirt', 'party shirt', 'office shirt', 'eid shirt',
      'cotton shirt', 'flannel shirt', 'denim shirt', 'striped shirt',
    ],
    mostPopularLinks: [
      { label: 'White Linen Shirt',        href: '/collections/shirts?subcat=linen' },
      { label: 'Black Formal Shirt',       href: '/collections/shirts?subcat=formal' },
      { label: 'Blue Slim Fit Shirt',      href: '/collections/shirts?subcat=slim' },
      { label: 'Printed Casual Shirt',     href: '/collections/shirts?subcat=printed' },
      { label: 'Oversized Cotton Shirt',   href: '/collections/shirts?subcat=oversized' },
      { label: 'Check Flannel Shirt',      href: '/collections/shirts?subcat=check' },
      { label: 'Oxford Formal Shirt',      href: '/collections/shirts?subcat=oxford' },
      { label: 'Solid Colour Shirt',       href: '/collections/shirts?subcat=solid' },
    ],
    seoSections: [
      {
        heading: 'Explore the Latest Togor & Tweed Shirts Collection',
        body: "Togor & Tweed's shirts collection for men brings together the finest fabrics, precise tailoring, and contemporary designs to redefine how men dress in Bangladesh. Whether you're searching for a crisp formal shirt for the office, a breezy linen shirt for the weekend, or a bold printed shirt for a night out — we have the perfect piece for every occasion and every personality. All our shirts are available for cash on delivery across Bangladesh, with free shipping on orders over ৳1,500.",
      },
      {
        heading: 'Casual Shirts for Men: Relaxed Style for Every Day',
        body: 'Whether you are meeting friends, running errands, or enjoying a weekend outing, our casual shirts for men bring effortless style to your everyday look. Crafted from breathable cotton and linen blends, these shirts pair equally well with jeans, trousers, or shorts.',
      },
      {
        heading: 'Formal Shirts: Sharp Dressing for the Office and Beyond',
        body: 'Make a lasting impression with our range of formal shirts for men. Available in classic solids, subtle textures, and fine checks, each shirt is cut for a clean silhouette that sits neatly under blazers and suits — perfect for the office, business meetings, and formal events.',
      },
      {
        heading: "Linen Shirts: Cool Comfort for Bangladesh's Climate",
        body: 'Designed specifically for warm and humid conditions, our linen shirts for men offer superior breathability and moisture-wicking properties. The natural texture of linen only improves with each wash, making these shirts a long-lasting wardrobe staple.',
      },
      {
        heading: 'Oversized & Printed Shirts: For the Bold and Fashion-Forward',
        body: 'Express your individuality with our curated selection of oversized and printed shirts. From bold florals and geometric patterns to vintage-inspired graphics, these shirts are designed for those who make a statement wherever they go.',
      },
      {
        heading: 'Why Choose Togor & Tweed Shirts?',
        body: 'Every shirt in our collection is crafted from premium fabrics with precise stitching and quality-checked buttons. We offer sizes XS through 3XL, free delivery on orders above ৳1,500, and easy 7-day returns — so you can shop with complete confidence.',
      },
    ],
    blogLinks: [
      {
        label: 'The Complete Office Wear Guide for Men in Bangladesh',
        href: '/blog/office-wear-guide-men-bangladesh',
        description: 'How to dress for every type of Bangladeshi workplace — formal, smart casual, and everything in between.',
      },
      {
        label: 'Cotton vs Linen vs Synthetic: Which Fabric Is Best?',
        href: '/blog/fabric-guide-cotton-linen-bangladesh',
        description: "Choosing the right shirt fabric for Bangladesh's heat and humidity — a practical guide.",
      },
      {
        label: 'Monsoon Fashion for Men: How to Dress Smart in the Rain',
        href: '/blog/monsoon-fashion-men-bangladesh',
        description: 'The best shirt fabrics and colours to stay stylish during Bangladesh\'s monsoon season.',
      },
    ],
    faqs: [
      {
        question: 'Where can I buy shirts for men online in Bangladesh?',
        answer: 'Togor & Tweed (togorandtweed.com/collections/shirts) is one of Bangladesh\'s top online destinations for men\'s shirts. We offer formal shirts, casual shirts, linen shirts, and more in sizes XS to 3XL, with cash on delivery across all divisions.',
      },
      {
        question: 'What is the best fabric for shirts in Bangladesh\'s climate?',
        answer: 'Cotton and linen are the best shirt fabrics for Bangladesh\'s warm, humid climate. Cotton breathes well and is easy to care for, while linen offers superior airflow for the hottest days. We cover both in our shirts collection.',
      },
      {
        question: 'Do Togor & Tweed shirts come in large sizes?',
        answer: 'Yes. Our shirts are available in sizes XS, S, M, L, XL, XXL, and 3XL. Use the size filter on the collection page to find your fit, and refer to the size guide on any product page for exact chest and shoulder measurements.',
      },
      {
        question: 'Can I get shirts delivered to any district in Bangladesh?',
        answer: 'Yes. We deliver shirts to all 64 districts across all 8 divisions of Bangladesh. Delivery takes 1–2 business days to Dhaka and Chattogram, and 3–5 business days to other divisions. Cash on delivery is available everywhere.',
      },
      {
        question: 'What is the difference between a formal and casual shirt?',
        answer: 'Formal shirts have a structured collar, placket, and are usually solid or finely striped — suited for offices and events. Casual shirts use softer fabrics, relaxed fits, and bolder prints — great for weekends and informal gatherings. We carry both styles.',
      },
    ],
  },

  panjabi: {
    heading: 'PANJABI',
    subCategories: [
      { label: 'All',         value: null },
      { label: 'New',         value: 'new',         keyword: 'new' },
      { label: 'Casual',      value: 'casual',      keyword: 'casual' },
      { label: 'Formal',      value: 'formal',      keyword: 'formal' },
      { label: 'Embroidered', value: 'embroidered', keyword: 'embroidered' },
      { label: 'Cotton',      value: 'cotton',      keyword: 'cotton' },
      { label: 'Silk',        value: 'silk',        keyword: 'silk' },
      { label: 'Eid Special', value: 'eid',         keyword: 'eid' },
      { label: 'Half Sleeve', value: 'half-sleeve', keyword: 'half sleeve' },
      { label: 'Slim Fit',    value: 'slim',        keyword: 'slim' },
    ],
    popularSearches: [
      'panjabi for men', 'eid panjabi', 'embroidered panjabi', 'cotton panjabi',
      'silk panjabi', 'formal panjabi', 'casual panjabi', 'white panjabi',
      'kurta for men', 'panjabi pajama set', 'half sleeve panjabi', 'slim fit panjabi',
      'traditional panjabi', 'wedding panjabi', 'latest panjabi design', 'panjabi price',
      'panjabi bd', 'panjabi online', 'festive panjabi', 'daily wear panjabi',
    ],
    mostPopularLinks: [
      { label: 'White Eid Panjabi',         href: '/collections/panjabi?subcat=eid' },
      { label: 'Embroidered Cotton Panjabi', href: '/collections/panjabi?subcat=embroidered' },
      { label: 'Casual Daily Panjabi',       href: '/collections/panjabi?subcat=casual' },
      { label: 'Slim Fit Formal Panjabi',    href: '/collections/panjabi?subcat=slim' },
      { label: 'Silk Festive Panjabi',       href: '/collections/panjabi?subcat=silk' },
      { label: 'Half Sleeve Panjabi',        href: '/collections/panjabi?subcat=half-sleeve' },
      { label: 'Traditional Cotton Panjabi', href: '/collections/panjabi?subcat=cotton' },
      { label: 'Premium Formal Panjabi',     href: '/collections/panjabi?subcat=formal' },
    ],
    seoSections: [
      {
        heading: 'Explore the Togor & Tweed Panjabi Collection',
        body: "Discover Bangladesh's finest panjabi collection at Togor & Tweed — where centuries of tradition meet modern craftsmanship. Our panjabi range spans everything from everyday cotton panjabis for casual wear to exquisitely embroidered festive pieces for Eid, weddings, and special celebrations. Each panjabi is tailored with attention to fit, fabric quality, and cultural authenticity. Shop with confidence: cash on delivery available, free returns within 7 days, and shipping across all divisions of Bangladesh.",
      },
      {
        heading: 'Eid Panjabi: Dress Your Best for the Festive Season',
        body: 'Celebrate Eid ul-Fitr and Eid ul-Adha in style with our exclusive range of Eid Panjabi for men. From intricate embroidery to premium silk and cotton fabrics, our festive panjabis are crafted to make you look and feel exceptional on the most special days of the year.',
      },
      {
        heading: 'Embroidered Panjabi: Tradition Meets Artistry',
        body: 'Our embroidered panjabi collection celebrates the rich textile heritage of Bangladesh. Skilled artisans create intricate patterns using traditional techniques — each piece is a wearable work of art that carries cultural significance while remaining effortlessly stylish for modern occasions.',
      },
      {
        heading: 'Cotton Panjabi: Everyday Comfort and Style',
        body: 'For daily wear that does not compromise on comfort, our cotton panjabi range delivers. Breathable, lightweight, and easy to care for, these panjabis are perfect for casual gatherings, Friday prayers, and relaxed family occasions across all seasons.',
      },
      {
        heading: 'Formal Panjabi: Elegance for Weddings and Special Events',
        body: 'Make a distinguished entrance at weddings, corporate events, and formal ceremonies with our premium formal panjabis. Tailored for a refined silhouette and crafted from superior fabrics, these panjabis represent the perfect fusion of tradition and contemporary elegance.',
      },
    ],
    blogLinks: [
      {
        label: 'Best Eid Outfits for Men in Bangladesh 2025',
        href: '/blog/best-eid-outfits-men-bangladesh-2025',
        description: 'Complete guide to Eid panjabi styles, colours, and outfit combinations for Eid ul-Fitr and Eid ul-Adha.',
      },
      {
        label: 'Panjabi vs Kurta: What\'s the Difference?',
        href: '/blog/panjabi-vs-kurta-difference',
        description: 'A clear breakdown of how Bangladeshi panjabi differs from Indian kurta in cut, length, and occasion.',
      },
      {
        label: 'Cotton vs Linen: Which Fabric for Your Panjabi?',
        href: '/blog/fabric-guide-cotton-linen-bangladesh',
        description: "Which panjabi fabric works best for Eid, daily wear, and Bangladesh's climate.",
      },
    ],
    faqs: [
      {
        question: 'Where can I buy panjabi online in Bangladesh?',
        answer: 'Togor & Tweed (togorandtweed.com/collections/panjabi) offers a wide range of panjabi for men in Bangladesh — from everyday cotton panjabis to embroidered Eid specials. We deliver nationwide with cash on delivery available in all districts.',
      },
      {
        question: 'Which panjabi is best for Eid in Bangladesh?',
        answer: 'For Eid ul-Fitr, white or pastel cotton panjabis with subtle embroidery are the most popular choice. For Eid ul-Adha, earthy tones and silk blends are preferred. Browse our Eid Special filter to see the full festive collection.',
      },
      {
        question: 'What is the difference between a panjabi and a kurta?',
        answer: 'A Bangladeshi panjabi is typically longer (reaching the knee or below), straighter in cut, and worn without a side slit. An Indian kurta is shorter, often has side slits, and may be more fitted. Our collection features authentic Bangladeshi panjabi styles.',
      },
      {
        question: 'What fabric is best for a panjabi in Bangladesh?',
        answer: 'Cotton is the most popular panjabi fabric in Bangladesh due to its breathability in the heat. For Eid and special occasions, cotton-silk blends and georgette offer a more premium, lustrous finish. We carry panjabis in all major fabric types.',
      },
      {
        question: 'Can I order panjabi online with cash on delivery in Bangladesh?',
        answer: 'Yes. All panjabi orders at Togor & Tweed can be placed with Cash on Delivery (COD) — you pay when the order arrives at your door. We also accept bKash and Nagad for instant digital payment.',
      },
    ],
  },

  't-shirt': {
    heading: 'T-SHIRTS',
    subCategories: [
      { label: 'All',       value: null },
      { label: 'New',       value: 'new',       keyword: 'new' },
      { label: 'Graphic',   value: 'graphic',   keyword: 'graphic' },
      { label: 'Plain',     value: 'plain',     keyword: 'plain' },
      { label: 'Oversized', value: 'oversized', keyword: 'oversized' },
      { label: 'V-Neck',    value: 'v-neck',    keyword: 'v-neck' },
      { label: 'Striped',   value: 'striped',   keyword: 'striped' },
      { label: 'Polo',      value: 'polo',      keyword: 'polo' },
      { label: 'Henley',    value: 'henley',    keyword: 'henley' },
    ],
    popularSearches: [
      't-shirts for men', 'graphic tees', 'plain white t-shirt', 'oversized t-shirt',
      'polo t-shirt', 'v-neck t-shirt', 'black t-shirt', 'striped t-shirt',
      'half sleeve t-shirt', 'round neck t-shirt', 'printed t-shirt', 'henley t-shirt',
      'cotton t-shirt', 'slim fit t-shirt', 'casual t-shirt', 'sports t-shirt',
    ],
    mostPopularLinks: [
      { label: 'White Plain T-Shirt',      href: '/collections/t-shirt?subcat=plain' },
      { label: 'Oversized Graphic Tee',    href: '/collections/t-shirt?subcat=graphic' },
      { label: 'Black Plain T-Shirt',      href: '/collections/t-shirt?subcat=plain' },
      { label: 'Striped T-Shirt',          href: '/collections/t-shirt?subcat=striped' },
      { label: 'V-Neck Cotton T-Shirt',    href: '/collections/t-shirt?subcat=v-neck' },
      { label: 'Henley T-Shirt',           href: '/collections/t-shirt?subcat=henley' },
      { label: 'Polo T-Shirt for Men',     href: '/collections/polo' },
      { label: 'Oversized T-Shirt',        href: '/collections/t-shirt?subcat=oversized' },
    ],
    seoSections: [
      {
        heading: 'Explore the Togor & Tweed T-Shirt Collection',
        body: "Shop premium t-shirts for men at Togor & Tweed Bangladesh — your go-to destination for quality tees that combine comfort with style. From minimalist plain t-shirts and bold graphic tees to trendy oversized silhouettes and classic v-necks, our collection covers every style preference and occasion. Made from soft, breathable cotton fabrics suited to Bangladesh's climate, every t-shirt is designed to feel great all day. Free delivery across Bangladesh on orders over ৳1,500.",
      },
      {
        heading: 'Graphic T-Shirts: Wear Your Personality',
        body: 'Our graphic t-shirt collection features bold prints, artistic designs, and statement slogans that let your personality shine. Whether you prefer abstract art, vintage typography, or modern geometric patterns, we have a graphic tee that speaks your language.',
      },
      {
        heading: 'Plain & Solid T-Shirts: The Essential Wardrobe Basic',
        body: "Sometimes simplicity is everything. Our plain t-shirts for men are crafted from 100% combed cotton for a soft, premium feel that gets better with every wash. Available in a wide spectrum of colours, these tees are the foundation of any well-dressed man's wardrobe.",
      },
      {
        heading: 'Oversized T-Shirts: Streetwear Comfort',
        body: 'The oversized t-shirt trend is more than just fashion — it is a lifestyle statement. Our oversized tees are cut generously for maximum comfort while maintaining a stylish drop-shoulder silhouette. Pair them with slim jeans or joggers for the perfect streetwear look.',
      },
    ],
    blogLinks: [
      {
        label: 'Monsoon Fashion for Men: Stay Stylish in the Rain',
        href: '/blog/monsoon-fashion-men-bangladesh',
        description: 'The best t-shirt fabrics and outfit ideas to stay comfortable during Bangladesh\'s monsoon season.',
      },
      {
        label: 'Cotton vs Linen vs Synthetic: Which Fabric Is Best?',
        href: '/blog/fabric-guide-cotton-linen-bangladesh',
        description: 'Why cotton t-shirts outperform synthetics in Bangladesh\'s heat — a practical fabric guide.',
      },
      {
        label: "Men's Clothing Size Guide Bangladesh",
        href: '/blog/mens-size-guide-bangladesh',
        description: 'How to find your perfect t-shirt size using our measurement chart for Bangladeshi body types.',
      },
    ],
    faqs: [
      {
        question: 'Where can I buy t-shirts for men online in Bangladesh?',
        answer: 'Togor & Tweed (togorandtweed.com/collections/t-shirt) stocks a wide range of men\'s t-shirts including plain, graphic, oversized, and v-neck styles. All orders come with cash on delivery across Bangladesh.',
      },
      {
        question: 'Are oversized t-shirts available in Bangladesh?',
        answer: 'Yes. Togor & Tweed carries a dedicated oversized t-shirt range in a variety of colours and prints. These feature a drop-shoulder cut for the relaxed streetwear look, available in sizes S to 3XL.',
      },
      {
        question: 'What is the best t-shirt fabric for Bangladesh\'s weather?',
        answer: '100% combed cotton is ideal for Bangladesh — it is soft, breathable, and handles sweat well in the humidity. Our plain and graphic tees are made from premium cotton for all-day comfort.',
      },
      {
        question: 'How do I find my t-shirt size at Togor & Tweed?',
        answer: 'Each product page has a size guide with chest and body length measurements in centimetres. Our sizes run XS to 3XL. For oversized styles, we recommend sizing down one size from your usual fit if you prefer a more structured look.',
      },
    ],
  },

  polo: {
    heading: 'POLO',
    subCategories: [
      { label: 'All',       value: null },
      { label: 'New',       value: 'new',     keyword: 'new' },
      { label: 'Classic',   value: 'classic', keyword: 'classic' },
      { label: 'Slim Fit',  value: 'slim',    keyword: 'slim' },
      { label: 'Striped',   value: 'striped', keyword: 'striped' },
      { label: 'Pique',     value: 'pique',   keyword: 'pique' },
      { label: 'Sport',     value: 'sport',   keyword: 'sport' },
    ],
    popularSearches: [
      'polo shirt for men', 'polo t-shirt', 'classic polo', 'slim fit polo',
      'striped polo', 'pique polo', 'white polo shirt', 'navy polo',
      'sports polo', 'office polo', 'casual polo', 'brand polo shirt',
      'cotton polo shirt', 'half sleeve polo', 'collared t-shirt', 'golf polo',
    ],
    mostPopularLinks: [
      { label: 'White Classic Polo',    href: '/collections/polo?subcat=classic' },
      { label: 'Navy Slim Fit Polo',    href: '/collections/polo?subcat=slim' },
      { label: 'Striped Cotton Polo',   href: '/collections/polo?subcat=striped' },
      { label: 'Pique Sport Polo',      href: '/collections/polo?subcat=sport' },
      { label: 'Black Polo Shirt',      href: '/collections/polo?subcat=classic' },
      { label: 'Slim Fit Polo Shirt',   href: '/collections/polo?subcat=slim' },
    ],
    seoSections: [
      {
        heading: 'Explore the Togor & Tweed Polo Collection',
        body: 'Elevate your everyday look with Togor & Tweed polo shirts for men — the perfect balance of smart and casual. Our polo collection features classic pique cotton polos, slim fit designs, sporty striped variations, and more — all built to last and crafted to impress. Whether you need a sharp office polo, a weekend casual, or an athletic piece for outdoor activities, we have the right fit. Available in sizes S to 3XL with nationwide delivery across Bangladesh.',
      },
      {
        heading: 'Classic Polo Shirts: Timeless Style for Every Occasion',
        body: 'The polo shirt has been a menswear staple for decades — and for good reason. Our classic polo shirts combine the smart look of a collar with the comfort of a t-shirt, making them perfect for office casual, weekend outings, and everything in between.',
      },
      {
        heading: 'Slim Fit Polo Shirts: A Modern, Tailored Look',
        body: 'Our slim fit polo shirts are cut closer to the body for a modern, streamlined silhouette. Made from premium pique cotton for breathability and durability, these polos are designed for the man who wants to look sharp without sacrificing comfort.',
      },
      {
        heading: 'Striped & Sport Polo Shirts: Active Style',
        body: 'Take your athletic and outdoor style to the next level with our striped and sport polo range. Moisture-wicking fabrics and ergonomic cuts ensure you stay cool and comfortable whether on the golf course, at the club, or simply enjoying an active weekend.',
      },
    ],
    blogLinks: [
      {
        label: 'How to Style a Polo Shirt for Men: 7 Outfit Ideas',
        href: '/blog/how-to-style-polo-shirt-men',
        description: 'Seven ways to wear your polo — from smart office casual to weekend streetwear looks.',
      },
      {
        label: 'The Complete Office Wear Guide for Men in Bangladesh',
        href: '/blog/office-wear-guide-men-bangladesh',
        description: 'How polo shirts fit into smart casual and office casual dress codes in Bangladeshi workplaces.',
      },
    ],
    faqs: [
      {
        question: 'Where can I buy polo shirts online in Bangladesh?',
        answer: 'Togor & Tweed (togorandtweed.com/collections/polo) offers classic and slim fit polo shirts for men in Bangladesh. We carry pique cotton, striped, and sport polo styles in sizes S to 3XL, with nationwide delivery and cash on delivery.',
      },
      {
        question: 'Can I wear a polo shirt to the office in Bangladesh?',
        answer: 'Yes — polo shirts work well in smart casual and office casual dress codes, which are common in many Bangladeshi workplaces. Pair a solid-colour slim fit polo with formal trousers or chinos for a polished look.',
      },
      {
        question: 'What is the difference between a polo shirt and a t-shirt?',
        answer: 'A polo shirt has a collar, a short placket with 2–3 buttons, and is typically made from pique cotton — making it slightly more formal than a t-shirt. It is versatile enough for both office casual and weekend outings.',
      },
      {
        question: 'Are polo shirts suitable for Bangladesh\'s hot weather?',
        answer: 'Yes. Our polo shirts are made from breathable pique cotton that handles heat and humidity well. For outdoor or sport activities, we also carry moisture-wicking sport polo variants in our Sport subcategory.',
      },
    ],
  },

  trousers: {
    heading: 'TROUSERS',
    subCategories: [
      { label: 'All',       value: null },
      { label: 'New',       value: 'new',     keyword: 'new' },
      { label: 'Formal',    value: 'formal',  keyword: 'formal' },
      { label: 'Casual',    value: 'casual',  keyword: 'casual' },
      { label: 'Chinos',    value: 'chinos',  keyword: 'chinos' },
      { label: 'Slim Fit',  value: 'slim',    keyword: 'slim' },
      { label: 'Linen',     value: 'linen',   keyword: 'linen' },
      { label: 'Cargo',     value: 'cargo',   keyword: 'cargo' },
      { label: 'Wide Leg',  value: 'wide',    keyword: 'wide' },
    ],
    popularSearches: [
      'trousers for men', 'formal trousers', 'casual trousers', 'chinos for men',
      'slim fit trousers', 'linen trousers', 'cargo trousers', 'wide leg pants',
      'black formal trousers', 'navy trousers', 'grey trousers', 'khaki chinos',
      'office trousers', 'summer trousers', 'cotton trousers', 'pleated trousers',
    ],
    mostPopularLinks: [
      { label: 'Black Slim Formal Trousers',  href: '/collections/trousers?subcat=formal' },
      { label: 'Khaki Slim Chinos',           href: '/collections/trousers?subcat=chinos' },
      { label: 'Linen Wide Leg Trousers',     href: '/collections/trousers?subcat=linen' },
      { label: 'Navy Formal Trousers',        href: '/collections/trousers?subcat=formal' },
      { label: 'Casual Cargo Pants',          href: '/collections/trousers?subcat=cargo' },
      { label: 'Slim Cotton Chinos',          href: '/collections/trousers?subcat=chinos' },
      { label: 'Grey Formal Trousers',        href: '/collections/trousers?subcat=formal' },
      { label: 'Relaxed Casual Trousers',     href: '/collections/trousers?subcat=casual' },
    ],
    seoSections: [
      {
        heading: 'Explore the Togor & Tweed Trousers Collection',
        body: "Complete your wardrobe with Togor & Tweed's premium trousers for men — crafted for the modern Bangladeshi man who values both style and practicality. Our collection spans formal trousers for the boardroom, chinos for versatile everyday wear, breathable linen trousers for the summer heat, and on-trend cargo and wide-leg styles for the fashion-forward. Each pair is cut from quality fabrics and finished with durable hardware. Cash on delivery available, easy 7-day returns, and free shipping across Bangladesh on orders over ৳1,500.",
      },
      {
        heading: 'Formal Trousers: Dress Sharp for the Workplace',
        body: 'Our formal trousers for men are designed for the man who means business. Available in classic black, navy, and charcoal, with slim and regular fit options, these trousers are crafted from wrinkle-resistant fabrics that keep you looking sharp from morning meetings to evening events.',
      },
      {
        heading: 'Chinos: The Versatile Everyday Trouser',
        body: 'Chinos occupy the sweet spot between formal and casual — smart enough for the office, relaxed enough for the weekend. Our chino trousers come in a wide range of colours from classic khaki and navy to earthy olive and rust, pairing effortlessly with both shirts and t-shirts.',
      },
      {
        heading: 'Linen Trousers: Beat the Heat in Style',
        body: "Specially crafted for Bangladesh's warm climate, our linen trousers offer unbeatable breathability and a naturally elegant drape. Light, airy, and quick-drying, they are the ideal choice for summer days, beach outings, and casual weekend wear.",
      },
      {
        heading: 'Cargo & Wide Leg Trousers: Fashion-Forward Comfort',
        body: 'Embrace the relaxed silhouette trend with our cargo and wide leg trouser collection. Featuring generous pocket space, comfortable waistbands, and relaxed cuts, these trousers deliver on both style and practicality for the modern man.',
      },
    ],
    blogLinks: [
      {
        label: 'The Complete Office Wear Guide for Men in Bangladesh',
        href: '/blog/office-wear-guide-men-bangladesh',
        description: 'Formal trousers, chinos, and smart casual combinations for every type of Bangladeshi workplace.',
      },
      {
        label: 'Monsoon Fashion for Men: Stay Stylish in the Rain',
        href: '/blog/monsoon-fashion-men-bangladesh',
        description: 'The best trouser fabrics and styles for Bangladesh\'s rainy season — linen, cotton, and what to avoid.',
      },
      {
        label: "Men's Clothing Size Guide Bangladesh",
        href: '/blog/mens-size-guide-bangladesh',
        description: 'How to measure your waist and inseam to find the right trouser size from our size chart.',
      },
    ],
    faqs: [
      {
        question: 'Where can I buy formal trousers for men online in Bangladesh?',
        answer: 'Togor & Tweed (togorandtweed.com/collections/trousers) carries a wide range of formal trousers, chinos, linen trousers, and casual pants for men in Bangladesh. Available in waist sizes 28–42 with nationwide delivery and cash on delivery.',
      },
      {
        question: 'What is the difference between formal trousers and chinos?',
        answer: 'Formal trousers are typically made from fine wool blends or polyester, feature a crease, and are worn for offices and events. Chinos are made from cotton twill, have a more relaxed feel, and suit smart casual or everyday wear. Both are available at Togor & Tweed.',
      },
      {
        question: 'What waist sizes are available for trousers at Togor & Tweed?',
        answer: 'Our trousers are available in waist sizes 28, 30, 32, 34, 36, 38, 40, and 42 inches. Use the size filter to browse available stock in your waist size, and check the product page size guide for exact measurements.',
      },
      {
        question: 'Which trousers are best for hot weather in Bangladesh?',
        answer: 'Linen trousers are the best choice for Bangladesh\'s hot and humid summers — they are light, breathable, and dry quickly. Our linen trouser range includes wide-leg and straight-cut styles perfect for casual and semi-formal occasions.',
      },
      {
        question: 'Can I order trousers with cash on delivery in Bangladesh?',
        answer: 'Yes. All trouser orders at Togor & Tweed can be paid using Cash on Delivery anywhere in Bangladesh. You can also pay via bKash or Nagad at checkout. Free delivery is available on orders over ৳1,500.',
      },
    ],
  },
}

/** Returns config for a category slug, with sensible defaults for unknown slugs */
export function getCategoryConfig(slug: string): CategorySeoConfig {
  return (
    CONFIGS[slug] ?? {
      heading: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      subCategories: [{ label: 'All', value: null }],
      popularSearches: [],
      mostPopularLinks: [],
      seoSections: [],
      blogLinks: [],
      faqs: [],
    }
  )
}
