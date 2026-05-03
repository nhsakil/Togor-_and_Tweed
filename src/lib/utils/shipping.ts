/** ৳60 inside Dhaka city, ৳120 everywhere else */
export function calcShipping(city: string): number {
  return city.trim().toLowerCase().includes('dhaka') ? 60 : 120
}
