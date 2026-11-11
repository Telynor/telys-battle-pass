const ID = "telys-battle-pass";

function canonicalUuid(uuid) {
  return typeof uuid === "string"
    ? uuid.replace(/^(Compendium\.[^.]+\.[^.]+)\.([^.]+)$/, "$1.Item.$2")
    : "";
}

function sourceKeys(item) {
  return new Set([
    item.uuid, item.getFlag?.(ID, "sourceUuid"), item._stats?.compendiumSource,
    item._stats?.duplicateSource, item.flags?.core?.sourceId
  ].map(canonicalUuid).filter(Boolean));
}

function itemDefinition(item) {
  const data = item.toObject();
  delete data._id;
  delete data._stats;
  delete data.sort;
  delete data.folder;
  delete data.ownership;
  if (data.system) delete data.system.quantity;
  if (data.flags?.[ID]) {
    delete data.flags[ID].sourceUuid;
    if (!Object.keys(data.flags[ID]).length) delete data.flags[ID];
  }
  const normalize = value => {
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]));
    }
    return value;
  };
  return JSON.stringify(normalize(data));
}

export async function grantInventoryReward(actor, source, quantity) {
  const canStack = Number.isFinite(source.system?.quantity);
  const keys = sourceKeys(source);
  const definition = canStack ? itemDefinition(source) : null;
  const stack = canStack && actor.items.find(item => {
    if (item.type !== source.type || !Number.isFinite(item.system?.quantity)) return false;
    if ([...sourceKeys(item)].some(key => keys.has(key))) return true;
    // Older Battle Pass awards were copied without recording their source UUID.
    return item.name === source.name && itemDefinition(item) === definition;
  });
  if (stack) {
    const updated = await stack.update({"system.quantity": stack.system.quantity + quantity});
    if (!updated) throw new Error(`Could not add ${source.name} to ${actor.name}'s stack.`);
    return;
  }

  const data = source.toObject();
  delete data._id;
  data.flags ??= {};
  data.flags[ID] = {...data.flags[ID], sourceUuid: source.uuid};
  if (canStack) data.system.quantity = quantity;
  const copies = canStack ? [data] : Array.from({length: quantity}, () => structuredClone(data));
  const created = await actor.createEmbeddedDocuments("Item", copies);
  if (created?.length !== copies.length) throw new Error(`Could not grant every copy of ${source.name} to ${actor.name}.`);
}
