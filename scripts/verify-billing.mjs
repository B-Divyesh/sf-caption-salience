const slug = 'caption-salience';
const expected = {
  name: 'Caption Salience Supporter License',
  currency: 'INR',
  price_minor: 49_900,
  product_url: 'https://caption-salience.sociobot.in/'
};

const listResponse = await fetch('https://api.sociobot.in/api/v1/products');
if (!listResponse.ok) throw new Error(`Product list returned HTTP ${listResponse.status}.`);
const listed = await listResponse.json();
const product = listed.data?.find((item) => item.slug === slug);
if (!product) throw new Error(`${slug} is not enabled in the Sociobot product registry.`);

for (const [key, value] of Object.entries(expected)) {
  if (product[key] !== value) throw new Error(`${slug} has ${key}=${JSON.stringify(product[key])}, expected ${JSON.stringify(value)}.`);
}

const checkout = await fetch(product.checkout_url, { redirect: 'manual' });
const location = checkout.headers.get('location') || '';
if (checkout.status !== 303 || !location.startsWith('https://checkout.dodopayments.com/')) {
  throw new Error(`Checkout did not create a Dodo session (HTTP ${checkout.status}, location ${location || 'missing'}).`);
}

console.log(`${slug}: registered at ₹499 and checkout redirects to Dodo.`);
