import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../store/cartStore";
import type { Dish } from "../types";

const mockDish: Dish = {
  id: 1, name: "Борщ", description: "Суп", price: 120,
  category_id: 1, available: true, image_url: "",
  category: { id: 1, name: "Супы" },
};

const mockDish2: Dish = { ...mockDish, id: 2, name: "Щи", price: 100 };

beforeEach(() => useCartStore.setState({ items: [] }));

describe("cartStore", () => {
  it("добавляет блюдо в корзину", () => {
    useCartStore.getState().addItem(mockDish);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("увеличивает количество при повторном добавлении", () => {
    useCartStore.getState().addItem(mockDish);
    useCartStore.getState().addItem(mockDish);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("удаляет блюдо из корзины", () => {
    useCartStore.getState().addItem(mockDish);
    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("обновляет количество", () => {
    useCartStore.getState().addItem(mockDish);
    useCartStore.getState().updateQuantity(1, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("удаляет при количестве 0", () => {
    useCartStore.getState().addItem(mockDish);
    useCartStore.getState().updateQuantity(1, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("очищает корзину", () => {
    useCartStore.getState().addItem(mockDish);
    useCartStore.getState().addItem(mockDish2);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("считает итоговую сумму", () => {
    useCartStore.getState().addItem(mockDish);
    useCartStore.getState().addItem(mockDish2);
    useCartStore.getState().updateQuantity(1, 2);
    // 120*2 + 100*1 = 340
    expect(useCartStore.getState().total()).toBe(340);
  });
});
