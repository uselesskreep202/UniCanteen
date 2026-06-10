import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../store/cartStore";
import type { Dish } from "../types";

const dish: Dish = {
  id: 1, name: "Борщ", description: "Вкусный", price: 120,
  category_id: 1, available: true, image_url: "",
  category: { id: 1, name: "Супы" }
};
const dish2: Dish = { ...dish, id: 2, name: "Щи", price: 100 };

beforeEach(() => useCartStore.setState({ items: [] }));

describe("cartStore", () => {
  it("добавляет блюдо в корзину", () => {
    useCartStore.getState().addItem(dish);
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("увеличивает количество при повторном добавлении", () => {
    useCartStore.getState().addItem(dish);
    useCartStore.getState().addItem(dish);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("удаляет блюдо из корзины", () => {
    useCartStore.getState().addItem(dish);
    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("правильно считает сумму", () => {
    useCartStore.getState().addItem(dish);
    useCartStore.getState().addItem(dish2);
    useCartStore.getState().updateQuantity(1, 2);
    expect(useCartStore.getState().total()).toBe(340);
  });

  it("очищает корзину", () => {
    useCartStore.getState().addItem(dish);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
