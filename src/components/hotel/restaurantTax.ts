export type RestaurantTaxCategory = "food" | "beverage" | "exempt";

export interface RestaurantGstRates {
  food: number;
  beverage: number;
}

export interface RestaurantTaxableItem {
  menuItem: {
    categoryId: string;
    price: number;
  };
  quantity: number;
  taxCategory?: RestaurantTaxCategory;
  gstRate?: number;
}

export interface RestaurantGstBreakdown {
  category: RestaurantTaxCategory;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
}

export interface RestaurantTotals {
  subtotal: number;
  tax: number;
  total: number;
  breakdown: RestaurantGstBreakdown[];
}

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const getRestaurantTaxCategory = (categoryId: string): RestaurantTaxCategory => {
  if (categoryId === "beverages") return "beverage";
  if (categoryId === "alcohol") return "exempt";
  return "food";
};

export const snapshotRestaurantTax = <T extends RestaurantTaxableItem>(
  items: T[],
  rates: RestaurantGstRates,
): Array<T & { taxCategory: RestaurantTaxCategory; gstRate: number }> =>
  items.map((item) => {
    const taxCategory = item.taxCategory ?? getRestaurantTaxCategory(item.menuItem.categoryId);
    const gstRate = item.gstRate ?? (taxCategory === "food" ? rates.food : taxCategory === "beverage" ? rates.beverage : 0);
    return { ...item, taxCategory, gstRate };
  });

export const calculateRestaurantTotals = (items: RestaurantTaxableItem[]): RestaurantTotals => {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0));
  const grouped = new Map<string, RestaurantGstBreakdown>();

  for (const item of items) {
    const category = item.taxCategory ?? getRestaurantTaxCategory(item.menuItem.categoryId);
    const rate = item.gstRate ?? 0;
    if (category === "exempt" || rate <= 0) continue;

    const taxableAmount = roundMoney(item.menuItem.price * item.quantity);
    const taxAmount = roundMoney((taxableAmount * rate) / 100);
    const key = `${category}:${rate}`;
    const current = grouped.get(key) ?? {
      category,
      rate,
      taxableAmount: 0,
      taxAmount: 0,
      cgst: 0,
      sgst: 0,
    };

    current.taxableAmount = roundMoney(current.taxableAmount + taxableAmount);
    current.taxAmount = roundMoney(current.taxAmount + taxAmount);
    current.cgst = roundMoney(current.taxAmount / 2);
    current.sgst = roundMoney(current.taxAmount - current.cgst);
    grouped.set(key, current);
  }

  const breakdown = [...grouped.values()];
  const tax = roundMoney(breakdown.reduce((sum, item) => sum + item.taxAmount, 0));

  return { subtotal, tax, total: roundMoney(subtotal + tax), breakdown };
};