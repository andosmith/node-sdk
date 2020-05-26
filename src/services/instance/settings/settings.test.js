require("dotenv").config();

const test = require("ava");
const authContext = require("../../../../test/helpers/auth-context");

const {
  TEST_SETTING_ZUID
} = process.env;

test.beforeEach(authContext);

// Settings
test.serial("fetchSettings:200", async t => {
  const res = await t.context.sdk.instance.getSettings();

  t.is(res.statusCode, 200)
  t.truthy(Array.isArray(res.data));
  t.truthy(res.data.length);
});
test.serial("fetchSetting:200", async t => {
  const res = await t.context.sdk.instance.getSetting(TEST_SETTING_ZUID);

  t.is(res.statusCode, 200);
  t.truthy(typeof res.data === "object");
  t.is(res.data.ZUID, TEST_SETTING_ZUID);
});

// get setting without a ZUID
test.serial("getSetting without setting ZUID", async t => {
  try {
    const res = await t.context.sdk.instance.getSetting();
  } catch (err) {
    t.is(err.message, "SDK:Instance:getSetting() missing required `ZUID` argument");
  }
});