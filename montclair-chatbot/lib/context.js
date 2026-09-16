const { getInStockProducts } = require('./brandData');

function buildContext({ brand, products, knowledgeBase }) {
  const inStock = getInStockProducts(products);

  const brandBlock = brand
    ? `Brand: ${brand.name || 'Montclair'}\nDescription: ${brand.description || ''}\nWebsite: ${brand.website || 'monclair.in'}`
    : 'Brand: Montclair (monclair.in)';

  const productsBlock = inStock.length
    ? inStock
        .map((p) => {
          const price = p.price ? `₹${p.price}` : '';
          const notes = p.scent_notes ? ` | Notes: ${p.scent_notes}` : '';
          return `- ${p.name} ${price}${notes}`.trim();
        })
        .join('\n')
    : 'No product data loaded yet.';

  const kbBlock = (knowledgeBase || [])
    .map((k) => `Q: ${k.question}\nA: ${k.answer}`)
    .join('\n\n');

  return [
    brandBlock,
    '\nAvailable products (in stock only):',
    productsBlock,
    kbBlock ? `\nFrequently asked questions:\n${kbBlock}` : '',
  ].join('\n');
}

module.exports = { buildContext };
