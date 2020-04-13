require("dotenv").config();

const fs = require("fs");
const path = require("path");
const test = require("ava");
const moment = require("moment");

const authContext = require("../../../test/helpers/auth-context");
test.beforeEach(authContext);

test("getBins:200", async t => {
  const res = await t.context.sdk.media.getBins();
  t.is(res.statusCode, 200);
  t.truthy(Array.isArray(res.data));
  t.truthy(res.data.length > 0);
});

test("getBin:200", async t => {
  const res = await t.context.sdk.media.getBin(process.env.TEST_BIN_ZUID);
  t.is(res.statusCode, 200);
  t.truthy(Array.isArray(res.data));
  t.truthy(res.data.length > 0);
  t.is(res.data[0].id, process.env.TEST_BIN_ZUID);
});

test("updateBin:200", async t => {
  const binName = `Test ${moment().valueOf()}`;

  const res = await t.context.sdk.media.updateBin(process.env.TEST_BIN_ZUID, {
    name: binName
  });

  t.is(res.statusCode, 200);
  t.truthy(Array.isArray(res.data));
  t.truthy(res.data.length > 0);
  t.is(res.data[0].id, process.env.TEST_BIN_ZUID);
  t.is(res.data[0].name, binName);
});

test("createFile:200", async t => {
  const stream = fs.createReadStream(
    path.resolve(__dirname, "../../../test/fixtures/midgar-transit-map.jpg")
  );

  const opts = {
    title: "Midgar Mass Transit Map",
    fileName: "midgar-transit-map.jpg"
  };

  const res = await t.context.sdk.media.createFile(
    process.env.TEST_BIN_ZUID,
    stream,
    opts
  );

  t.is(res.statusCode, 201);
  t.truthy(Array.isArray(res.data));
  t.truthy(res.data.length > 0);
  t.truthy(res.data[0].filename);
  t.is(res.data[0].bin_id, process.env.TEST_BIN_ZUID);
  t.is(res.data[0].type, "file");
  t.is(
    res.data[0].url,
    `https://dg1wqtbj.media.zestyio.com/${res.data[0].filename}`
  );
});

test("updateFile:200", async t => {
  const fileName = `test-${moment().valueOf()}.jpg`;

  const res = await t.context.sdk.media.updateFile("3-9f06678-k83ia", {
    filename: fileName,
    title: fileName
  });

  t.is(res.statusCode, 200);
  t.truthy(Array.isArray(res.data));
  t.truthy(res.data.length > 0);
  t.is(res.data[0].filename, fileName);
  t.is(res.data[0].url, `https://dg1wqtbj.media.zestyio.com/${fileName}`);
});

test("deleteFile:200", async t => {
  const stream = fs.createReadStream(
    path.resolve(__dirname, "../../../test/fixtures/midgar-transit-map.jpg")
  );

  const opts = {
    title: "Midgar Mass Transit Map",
    fileName: "midgar-transit-map.jpg"
  };

  const file = await t.context.sdk.media.createFile(
    process.env.TEST_BIN_ZUID,
    stream,
    opts
  );

  t.is(file.statusCode, 201);
  t.truthy(Array.isArray(file.data));
  t.truthy(file.data.length > 0);
  t.truthy(file.data[0].id);

  const res = await t.context.sdk.media.deleteFile(file.data[0].id);

  t.is(res.statusCode, 200);
});
