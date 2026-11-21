import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, createCloud, FILES } from "../helpers/sandbox.mjs";

function boot(cloud, seedStorage) {
  const sandbox = createSandbox({ cloud });
  if (seedStorage) {
    for (const [key, value] of Object.entries(seedStorage)) sandbox.storage.local.setItem(key, value);
  }
  sandbox.load(FILES.sync);
  return { sandbox, CloudSync: sandbox.win.CloudSync };
}

test("активация подтягивает данные из облака", async () => {
  const cloud = createCloud({
    "users/uidA": { nickname: "Alice", sessions: 3, license__DOT__active: true }
  });
  const { CloudSync } = boot(cloud);
  await CloudSync.activate("uidA");

  assert.equal(CloudSync.get("nickname"), "Alice");
  assert.equal(CloudSync.get("license.active"), true);
  await CloudSync.deactivate();
});

test("запись уходит в облако и статус становится saved", async () => {
  const cloud = createCloud({ "users/uidA": { sessions: 3 } });
  const { CloudSync } = boot(cloud);
  await CloudSync.activate("uidA");

  CloudSync.set("sessions", 4);
  await CloudSync.flush();

  assert.equal(cloud.data.get("users/uidA").sessions, 4);
  assert.equal(CloudSync.getStatus().status, "saved");
  await CloudSync.deactivate();
});

test("при ошибке записи данные остаются в очереди и на диске", async () => {
  const cloud = createCloud({ "users/uidB": { nickname: "Bob" } });
  cloud.fail = true;
  const { CloudSync, sandbox } = boot(cloud);
  await CloudSync.activate("uidB");

  CloudSync.set("diarynotes", [{ id: "1", title: "важное" }]);
  await CloudSync.flush();

  assert.equal(CloudSync.getStatus().pending, 1);
  assert.equal(CloudSync.getStatus().status, "error");
  assert.equal(CloudSync.get("diarynotes")[0].title, "важное");

  const dump = sandbox.storage.local._dump();
  assert.ok(Object.keys(dump).some(key => key.includes("pending")), "очередь сохранена в localStorage");
  await CloudSync.deactivate();
});

test("неотправленные изменения восстанавливаются после перезагрузки", async () => {
  const cloud = createCloud({ "users/uidC": {} });
  cloud.fail = true;
  const first = boot(cloud);
  await first.CloudSync.activate("uidC");
  first.CloudSync.set("diarynotes", [{ id: "9", title: "черновик" }]);
  await first.CloudSync.flush();
  const persisted = first.sandbox.storage.local._dump();
  await first.CloudSync.deactivate();

  cloud.fail = false;
  const second = boot(cloud, persisted);
  await second.CloudSync.activate("uidC");

  assert.equal(second.CloudSync.get("diarynotes")[0].title, "черновик");
  await second.CloudSync.flush();
  assert.equal(cloud.data.get("users/uidC").diarynotes[0].title, "черновик");
  await second.CloudSync.deactivate();
});

test("аккаунты изолированы друг от друга", async () => {
  const cloud = createCloud({
    "users/uidA": { nickname: "Alice", minigames_mmr: 1500 },
    "users/uidB": { nickname: "Bob" }
  });
  const { CloudSync } = boot(cloud);

  await CloudSync.activate("uidA");
  CloudSync.set("minigames_mmr", 9999);
  await CloudSync.flush();
  await CloudSync.deactivate();

  await CloudSync.activate("uidB");
  assert.notEqual(CloudSync.get("minigames_mmr", 0), 9999, "B не видит MMR аккаунта A");
  assert.equal(CloudSync.get("nickname"), "Bob");
  await CloudSync.deactivate();

  await CloudSync.activate("uidA");
  assert.equal(CloudSync.get("minigames_mmr"), 9999, "A сохранил свой MMR");
  await CloudSync.deactivate();
});

test("опрос облака не затирает локальные правки", async () => {
  const cloud = createCloud({ "users/uidD": { sessions: 10 } });
  const { CloudSync } = boot(cloud);
  await CloudSync.activate("uidD");

  CloudSync.set("sessions", 11);
  CloudSync.replaceFromRemote({ sessions: 10 }, "poll");

  assert.equal(CloudSync.get("sessions"), 11);
  await CloudSync.flush();
  assert.equal(cloud.data.get("users/uidD").sessions, 11);
  await CloudSync.deactivate();
});

test("null удаляет ключ и локально, и в облаке", async () => {
  const cloud = createCloud({
    "users/uidE": { avatar: "data:image/jpeg;base64,AAA", nickname: "E" }
  });
  const { CloudSync } = boot(cloud);
  await CloudSync.activate("uidE");

  CloudSync.set("avatar", null);
  await CloudSync.flush();

  assert.equal(Object.prototype.hasOwnProperty.call(cloud.data.get("users/uidE"), "avatar"), false);
  assert.equal(CloudSync.get("avatar", null), null);
  await CloudSync.deactivate();
});
