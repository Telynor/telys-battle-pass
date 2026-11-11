import {test} from "node:test";
import assert from "node:assert/strict";
import {grantInventoryReward} from "../scripts/reward-inventory.mjs";

function item(uuid, name, quantity, description = "") {
  const data = {type: "loot", name, system: {quantity, description}};
  return {
    ...data, uuid, toObject: () => structuredClone(data),
    async update(changes) { data.system.quantity = changes["system.quantity"]; return this; }
  };
}

test("reward adds quantity to a legacy matching stack without merging unrelated items with the same name", async () => {
  const source = item("Item.1", "Material", 1);
  const stack = item("Actor.a.Item.b", "Material", 2);
  const unrelated = item("Actor.a.Item.c", "Material", 10, "Different description");
  const actor = {items: [unrelated, stack], createEmbeddedDocuments() { assert.fail("unexpected duplicate"); }};
  await grantInventoryReward(actor, source, 3);
  assert.equal(stack.system.quantity, 5);
  assert.equal(unrelated.system.quantity, 10);
});

test("new reward records its source and non-stackable rewards receive individual copies", async () => {
  const source = item("Item.1", "Material", 1);
  const actor = {items: [], async createEmbeddedDocuments(type, docs) { assert.equal(type, "Item"); this.items.push(...docs); return docs; }};
  await grantInventoryReward(actor, source, 3);
  assert.equal(actor.items[0].system.quantity, 3);
  assert.equal(actor.items[0].flags["telys-battle-pass"].sourceUuid, "Item.1");
  const spell = {uuid: "Item.spell", type: "spell", system: {}, toObject: () => ({type: "spell", system: {}})};
  await grantInventoryReward(actor, spell, 2);
  assert.equal(actor.items.length, 3);
  assert.deepEqual(actor.items[1].system, {});
});
